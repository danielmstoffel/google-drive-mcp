// src/index.ts

// Adjusting imports based on SDK documentation
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'; // Corrected based on docs
import { StreamableHTTPServerTransport, StreamableHTTPServerTransportOptions } from '@modelcontextprotocol/sdk/server/streamableHttp.js'; // For HTTP server
// Removed Request, Response from types.js as tool handlers have specific return types
// import { Request, Response } from '@modelcontextprotocol/sdk/types.js';

// Removed authenticate from @google-cloud/local-auth as DriveHandler now handles auth
// Removed google, Auth from googleapis as DriveHandler now handles auth
// import { google, Auth } from 'googleapis';
// import * as path from 'path'; // No longer needed for CREDENTIALS_PATH
// import * as fs from 'fs'; // No longer needed for CREDENTIALS_PATH
// import * as os from 'os'; // No longer needed for CREDENTIALS_PATH
import dotenv from 'dotenv';
import * as http from 'http'; // Import Node.js http module
import { z } from 'zod'; // Import Zod for schema definitions. ZodSchema is not directly used for raw shapes.
import { randomUUID } from 'node:crypto'; // For sessionIdGenerator

// Import only DriveHandler as it now manages its own auth
import { DriveHandler } from './handlers/drive-handler';

dotenv.config(); // Ensure this is at the top to load .env variables

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
// SCOPES and CREDENTIALS_PATH are no longer needed here as auth is handled by DriveHandler

let driveHandlerInstance: DriveHandler;

// The authorize() function is no longer needed as DriveHandler initializes its own auth client.
/*
async function authorize(): Promise<Auth.OAuth2Client> {
  // ... old authorization logic removed ...
}
*/

// Removed old toolDispatcher, tools will be registered directly with McpServer

async function main() {
  try {
    // dotenv.config() should have already run, ensuring env vars are available for DriveHandler
    console.log('Initializing DriveHandler...');
    driveHandlerInstance = new DriveHandler(); // Instantiate DriveHandler directly
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
