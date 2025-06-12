// src/index.ts

// Imports for @modelcontextprotocol/sdk
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport, StreamableHTTPServerTransportOptions } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

// google-auth-library for OAuth2 client
import { OAuth2Client } from 'google-auth-library';
import { google, Auth } from 'googleapis'; // Auth namespace for type, google for service client

import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import dotenv from 'dotenv';
import * as http from 'http';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

// DriveHandler is now a placeholder, so these imports will not find actual implementations.
// import { DriveHandler, initializeDriveHandler, getDriveHandler } from './handlers/drive-handler';

// Load .env file first
dotenv.config();

// Attempt to load .env.personal or .env.work if they exist, overriding .env
if (fs.existsSync('.env.personal')) {
  dotenv.config({ path: '.env.personal', override: true });
  console.log("Loaded .env.personal");
} else if (fs.existsSync('.env.work')) {
  dotenv.config({ path: '.env.work', override: true });
  console.log("Loaded .env.work");
}


const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const CREDENTIALS_DIR = path.join(os.homedir(), '.credentials');
const TOKEN_PATH = path.join(CREDENTIALS_DIR, 'google-drive-mcp-tokencache.json');

if (!fs.existsSync(CREDENTIALS_DIR)) {
  fs.mkdirSync(CREDENTIALS_DIR, { recursive: true });
}

// Module-level oauth2Client, to be initialized by authorize()
let oauth2Client: OAuth2Client;
// driveHandlerInstance will be null as DriveHandler is a placeholder
let driveHandlerInstance: any = null;


async function authorize(): Promise<OAuth2Client> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI must be set in .env');
  }

  const client = new OAuth2Client(clientId, clientSecret, redirectUri);

  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const tokenFileContent = fs.readFileSync(TOKEN_PATH, 'utf-8');
      const tokens = JSON.parse(tokenFileContent);
      client.setCredentials(tokens);
      console.log('Tokens loaded from file.');
    } catch (e) {
      console.warn('Could not load stored tokens:', e);
    }
  }

  if (process.env.GOOGLE_REFRESH_TOKEN && !client.credentials.refresh_token) {
    client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
    console.log("Using GOOGLE_REFRESH_TOKEN from environment.");
  }

  const approximatelyOneMinuteInMs = 60 * 1000;
  if (client.credentials.refresh_token &&
      (!client.credentials.access_token ||
       (client.credentials.expiry_date && client.credentials.expiry_date <= (Date.now() + approximatelyOneMinuteInMs)))) {
    console.log('Access token is expired or nearing expiry, attempting refresh...');
    try {
      const { credentials } = await client.refreshAccessToken();
      client.setCredentials(credentials);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(client.credentials));
      console.log('Token refreshed and saved.');
    } catch (refreshError) {
      console.error('Error refreshing access token. Manual re-authentication or a valid GOOGLE_REFRESH_TOKEN may be required.', refreshError);
      if (!client.credentials.access_token) {
          throw new Error('Failed to refresh access token and no existing access token is valid.');
      }
      console.warn('Proceeding with potentially expired or unrefreshed token.');
    }
  } else if (!client.credentials.access_token && !client.credentials.refresh_token) {
    console.error('No refresh token available and no access token. Cannot proceed without authentication.');
    throw new Error('No refresh token available. Please provide GOOGLE_REFRESH_TOKEN in your .env file or ensure ' + TOKEN_PATH + ' contains a valid refresh_token.');
  }

  oauth2Client = client;
  return client;
}

async function main() {
  try {
    console.log('Attempting to authorize Google Drive API (using new placeholder logic)...');
    const authClientInstance = await authorize();

    // initializeDriveHandler(authClientInstance); // Commented out as DriveHandler is a placeholder
    // driveHandlerInstance = getDriveHandler();  // Commented out
    // driveHandlerInstance is already null

    console.log('DriveHandler initialization skipped as it is a placeholder.');

    const serverName = process.env.npm_package_name || 'google-drive-mcp';
    const serverVersion = process.env.npm_package_version || '0.0.1';
    const mcpServer = new McpServer({
      name: serverName,
      version: serverVersion,
    });

    // Since DriveHandler is a placeholder and driveHandlerInstance is null,
    // toolNames will be empty.
    const toolNames: string[] = [];

    if (toolNames.length > 0) {
      for (const toolName of toolNames) {
        const genericToolSchemaShape = {};
        mcpServer.tool(
          toolName,
          `Handles ${toolName} operations.`,
          genericToolSchemaShape,
          async (args: Record<string, any>) => {
            try {
              const result = await (driveHandlerInstance as any)[toolName](args);
              if (result.success) {
                const { success, ...data } = result;
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
    } else {
      console.log("No DriveHandler tools to register due to placeholder.");
    }

    const httpServer = http.createServer();
    const mcpPath = '/mcp';

    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: randomUUID,
    });

    httpServer.on('request', async (req, res) => {
      if (req.url && req.url.startsWith(mcpPath)) {
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
        if (transport.handleRequest) {
             await transport.handleRequest(req, res, body);
        } else {
            console.warn("transport.handleRequest is not available; request might not be handled if not using a framework integration.")
        }
      } else {
        if (!res.headersSent) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      }
    });

    await mcpServer.connect(transport);

    httpServer.listen(PORT, () => {
      console.log(`MCP Server for Google Drive started on port ${PORT}, endpoint ${mcpPath}`);
      console.log(`MCP Server name: ${serverName}, version: ${serverVersion}`);
    });

  } catch (error) {
    console.error('Failed to start the Google Drive MCP server:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error in main:', error);
  process.exit(1);
});

export { oauth2Client };
