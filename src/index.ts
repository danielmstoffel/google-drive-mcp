import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { DriveHandler } from './handlers/drive-handler.js';

const logger = {
  info: (msg: string) => console.error(`[INFO] ${msg}`),
  error: (msg: string, error?: any) => console.error(`[ERROR] ${msg}`, error)
};

const server = new Server({
  name: 'google-drive-mcp',
  version: '1.0.0'
}, {
  capabilities: {
    tools: [
      // Files
      {
        name: 'drive_files_list',
        description: 'List files in Google Drive with optional query filters',
        inputSchema: {
          type: 'object',
          properties: {
            q: { type: 'string', description: 'Query string for filtering files' },
            pageSize: { type: 'number', description: 'Maximum number of files to return' },
            pageToken: { type: 'string', description: 'Token for pagination' },
            orderBy: { type: 'string', description: 'Sort order for results' },
            fields: { type: 'string', description: 'Specific fields to include' },
            spaces: { type: 'string', description: 'Comma-separated list of spaces to query' },
            includeItemsFromAllDrives: { type: 'boolean' },
            supportsAllDrives: { type: 'boolean' }
          }
        }
      },
      {
        name: 'drive_files_get',
        description: 'Gets a file\'s metadata or content by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file.' },
            acknowledgeAbuse: { type: 'boolean', description: 'Whether the user is acknowledging the risk of downloading known malware or other abusive content.' },
            fields: { type: 'string', description: 'Specific fields to include' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the retrieving application supports both My Drives and shared drives.' }
          },
          required: ['fileId']
        }
      },
      // ... (Add placeholders for other 13 Files tool definitions)
      { name: 'drive_files_create', description: 'Creates a new file.', inputSchema: { type: 'object', properties: { /* ... */ } } },
      { name: 'drive_files_update', description: 'Updates a file\'s metadata and/or content.', inputSchema: { type: 'object', properties: { /* ... */ } } },
      { name: 'drive_files_delete', description: 'Permanently deletes a file owned by the user without moving it to the trash.', inputSchema: { type: 'object', properties: { /* ... */ } } },
      { name: 'drive_files_copy', description: 'Creates a copy of a file and applies any requested updates with patch semantics.', inputSchema: { type: 'object', properties: { /* ... */ } } },
      { name: 'drive_files_watch', description: 'Subscribes to changes to a file.', inputSchema: { type: 'object', properties: { /* ... */ } } },
      // ... Add other Files methods as per the list (generate, listLabels, modifyLabels, emptyTrash, export, import)

      // Drives (7) - Example
      {
        name: 'drive_drives_list',
        description: 'Lists the user\'s shared drives.',
        inputSchema: {
          type: 'object',
          properties: {
            pageSize: { type: 'number', description: 'Maximum number of shared drives to return per page.' },
            pageToken: { type: 'string', description: 'Page token for shared drives.' },
            q: { type: 'string', description: 'Query string for filtering shared drives.' },
            useDomainAdminAccess: { type: 'boolean', description: 'Issue the request as a domain administrator; if set to true, then all shared drives of the domain administrator\'s domain will be returned.'}
          }
        }
      },
      // ... (Add placeholders for other 6 Drives tool definitions: get, create, delete, hide, unhide, update)

      // Permissions (5) - Example
      {
        name: 'drive_permissions_create',
        description: 'Creates a permission for a file or shared drive.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file or shared drive.' },
            // ... (Add other permission properties: role, type, emailAddress, domain, etc.)
          },
          required: ['fileId']
        }
      },
      // ... (Add placeholders for other 4 Permissions tool definitions: list, get, update, delete)

      // Changes (3) - Example
      {
        name: 'drive_changes_list',
        description: 'Lists changes for a user.',
        inputSchema: {
          type: 'object',
          properties: {
            pageToken: { type: 'string', description: 'The token for continuing a previous list request on the next page.' },
            // ... (Add other Changes properties)
          },
          required: ['pageToken']
        }
      },
      // ... (Add placeholders for other 2 Changes tool definitions: getStartPageToken, watch)

      // About (1)
      {
        name: 'drive_about_get',
        description: 'Gets information about the user, the user\'s Drive, and system capabilities.',
        inputSchema: {
          type: 'object',
          properties: {
            fields: { type: 'string', description: 'Specific fields to include' }
          }
        }
      },

      // Revisions (4)
      // ... (Add placeholders for Revisions tool definitions: list, get, delete, update)

      // Comments (5)
      // ... (Add placeholders for Comments tool definitions: list, get, create, update, delete)

      // Replies (5)
      // ... (Add placeholders for Replies tool definitions: list, get, create, update, delete)

      // Apps (2)
      // ... (Add placeholders for Apps tool definitions: list, get)

      // Channels (2)
      // ... (Add placeholders for Channels tool definitions: stop)
      // Note: Drive API has one method for channels: stop. Assuming the second one is a typo or refers to a related concept.

      // Operations (1)
      // This is likely referring to `drive.operations.cancel` if using Drive Activity API,
      // or could be a general concept. Assuming no direct "operations_cancel" tool for Drive API v3 for now.
      // If it refers to batch operations, that's a higher-level concept not a single API endpoint.

      // AccessProposals (3) - These are part of the Google Drive Activity API, not the core Drive API (drive_v3)
      // Assuming these are not needed for the core Drive MCP. If they are, they'd be defined here.
      // { name: 'drive_accessProposals_approve', ... }
      // { name: 'drive_accessProposals_list', ... }
      // { name: 'drive_accessProposals_revoke', ... }
    ]
  }
});

server.setRequestHandler('tools/call', async (request) => {
  const { name: toolName, arguments: args } = request.params;

  try {
    // Initialize handler
    const handler = new DriveHandler();

    // Use delegation pattern
    if (toolName.startsWith('drive_')) {
      if (typeof handler[toolName] === 'function') {
        return await handler[toolName](args);
      } else {
        throw new Error(`Unknown tool: ${toolName}`);
      }
    }

    throw new Error(`Unknown tool: ${toolName}`);
  } catch (error) {
    logger.error(`Error calling tool ${toolName}:`, error);
    return {
      error: {
        code: -32000,
        message: error.message
      }
    };
  }
});

const transport = new StdioServerTransport();
transport.pipe(server);

logger.info('Google Drive MCP server started.');
