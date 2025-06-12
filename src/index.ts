// src/index.ts

// Adjusting imports based on SDK documentation
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'; // Corrected based on docs
import { StreamableHTTPServerTransport, StreamableHTTPServerTransportOptions } from '@modelcontextprotocol/sdk/server/streamableHttp.js'; // For HTTP server
// Removed Request, Response from types.js as tool handlers have specific return types
// import { Request, Response } from '@modelcontextprotocol/sdk/types.js';

import { authenticate } from '@google-cloud/local-auth';
import { google, Auth } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import dotenv from 'dotenv';
import * as http from 'http'; // Import Node.js http module
import { z } from 'zod'; // Import Zod for schema definitions. ZodSchema is not directly used for raw shapes.
import { randomUUID } from 'node:crypto'; // For sessionIdGenerator

import { DriveHandler, initializeDriveHandler, getDriveHandler } from './handlers/drive-handler';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Path to store credentials
const CREDENTIALS_PATH = path.join(os.homedir(), '.credentials', 'google-drive-mcp.json');

let driveHandlerInstance: DriveHandler;

/**
 * Load or request authorization to call APIs.
 */
async function authorize(): Promise<Auth.OAuth2Client> {
  let client: Auth.OAuth2Client;
  try {
    const credentialsFileContent = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
    const credentials = JSON.parse(credentialsFileContent);
    client = google.auth.fromJSON(credentials) as Auth.OAuth2Client;
  } catch (err) {
    // If credentials don't exist or are invalid, authenticate
    console.log('Credentials not found or invalid, authenticating...');
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: (process.env.GOOGLE_APPLICATION_CREDENTIALS as any), // Using 'as any' to bypass persistent type error
    }) as Auth.OAuth2Client;

    // Save credentials
    const credentialsDir = path.dirname(CREDENTIALS_PATH);
    if (!fs.existsSync(credentialsDir)) {
      fs.mkdirSync(credentialsDir, { recursive: true });
    }
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: process.env.GOOGLE_CLIENT_ID, // Use env var directly
      client_secret: process.env.GOOGLE_CLIENT_SECRET, // Use env var directly
      refresh_token: client.credentials.refresh_token,
    });
    fs.writeFileSync(CREDENTIALS_PATH, payload);
    console.log('Authentication successful, credentials saved to:', CREDENTIALS_PATH);
  }

  // Check if the access token is expired and refresh it if necessary
  const approximatelyOneMinuteInMs = 60 * 1000;
  if (client.credentials.expiry_date && client.credentials.expiry_date <= (Date.now() + approximatelyOneMinuteInMs)) {
    try {
      console.log('Access token is expired or nearing expiry, attempting refresh...');
      const { credentials } = await client.refreshAccessToken();
      client.setCredentials(credentials);
      console.log('Access token refreshed.');
       // Update saved credentials with new token info
       const updatedPayload = JSON.stringify({
        type: 'authorized_user',
        client_id: process.env.GOOGLE_CLIENT_ID, // Use env var directly
        client_secret: process.env.GOOGLE_CLIENT_SECRET, // Use env var directly
        refresh_token: client.credentials.refresh_token, // This should persist
        access_token: client.credentials.access_token,
        expiry_date: client.credentials.expiry_date,
      });
      fs.writeFileSync(CREDENTIALS_PATH, updatedPayload);

    } catch (refreshError) {
      console.error('Error refreshing access token:', refreshError);
      // If refresh fails, might need to re-authenticate
      // For this example, we'll throw, but a real app might try re-auth flow
      throw new Error('Failed to refresh access token. Please try re-authenticating.');
    }
  }


  return client;
}

// Removed old toolDispatcher, tools will be registered directly with McpServer

async function main() {
  try {
    console.log('Attempting to authorize Google Drive API...');
    const authClient = await authorize();
    console.log('Authorization successful.');

    initializeDriveHandler(authClient); // Initialize the shared handler instance
    driveHandlerInstance = getDriveHandler(); // Get the initialized instance

    console.log('DriveHandler initialized.');

    const mcpServer = new McpServer({
      name: 'google-drive-mcp',
      version: '1.0.0',
      // No initial capabilities needed here, will be defined by tools
    });

    // Register tools from DriveHandler
    const toolNames = Object.getOwnPropertyNames(DriveHandler.prototype).filter(
      (methodName) => methodName.startsWith('drive_') && typeof (driveHandlerInstance as any)[methodName] === 'function'
    );

    for (const toolName of toolNames) {
      // Using an empty object {} as the ZodRawShape for tools that accept any object.
      // The handler will receive the args, and internal validation within DriveHandler methods is assumed.
      const genericToolSchemaShape = {};

      mcpServer.tool(
        toolName,
        `Handles ${toolName} operations.`,
        genericToolSchemaShape, // Use the empty object as ZodRawShape
        async (args: Record<string, any>) => {
          try {
            const result = await (driveHandlerInstance as any)[toolName](args);
            // Assuming handlers return { success: boolean, ...data } or { success: false, error: string }
            // Adapt this to MCP's expected { content: ContentPart[], isError?: boolean }
            if (result.success) {
              const { success, ...data } = result; // remove success field
              // Return JSON data as a string within a "text" content part, as per SDK examples
              return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
            } else {
              return { content: [{ type: 'text', text: `Error: ${result.error}` }], isError: true };
            }
          } catch (error: any) {
            console.error(`Error executing tool ${toolName} via McpServer:`, error);
            return { content: [{ type: 'text', text: `Internal server error: ${error.message}` }], isError: true };
          }
        }
      );
      console.log(`Registered tool: ${toolName}`);
    }

    const httpServer = http.createServer();

    const mcpPath = '/mcp';
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: randomUUID, // Added required sessionIdGenerator
      // requestBodyParser and responseBodyParser can be added if custom parsing is needed
    });

    // HTTP server request handling
    httpServer.on('request', async (req, res) => {
      if (req.url && req.url.startsWith(mcpPath)) {
        // For MCP requests, delegate to the transport's handler.
        // We need to parse the body for POST/PUT requests as MCP expects structured data.
        let body: any;
        if (req.method === 'POST' || req.method === 'PUT') {
          try {
            const rawBody = await new Promise<string>((resolve, reject) => {
              let data = '';
              req.on('data', chunk => data += chunk);
              req.on('end', () => resolve(data));
              req.on('error', err => reject(err));
            });
            body = JSON.parse(rawBody);
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null }));
            return;
          }
        }
        // The transport's `handleRequest` method is what processes MCP communication.
        // This was missing in previous attempts.
        await transport.handleRequest(req, res, body);
      } else {
        // Handle other routes or return 404 for non-MCP paths
        if (!res.headersSent) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      }
    });

    await mcpServer.connect(transport); // Connect McpServer to the transport

    httpServer.listen(PORT, () => {
      console.log(`MCP Server for Google Drive started on port ${PORT}, endpoint /mcp`);
    });

  } catch (error) {
    console.error('Failed to start the Google Drive MCP server:', error);
    process.exit(1);
  }
}

main();
