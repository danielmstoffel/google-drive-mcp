// MCP server setup
// TODO: Initialize and start the MCP server, registering these tools.

export const toolDefinitions = [
  // --- Comments API Tool Definitions ---
  {
    name: 'drive_comments_create',
    description: 'Creates a new comment on a file.',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The ID of the file.' },
        content: { type: 'string', description: 'The plain text content of the comment.' },
        quotedFileContent: {
          type: 'object',
          properties: {
            mimeType: { type: 'string', description: 'The MIME type of the quoted content.' },
            value: { type: 'string', description: 'The quoted content itself.' }
          },
          description: 'The file content to quote, if any. (Optional)'
        },
        quotedAppContext: {
          type: 'object',
          properties: {
            mimeType: { type: 'string', description: 'The MIME type of the quoted app context.' },
            value: { type: 'string', description: 'The quoted app context.' }
          },
          description: 'The app-specific content to quote, if any. (Optional)'
        },
        fields: { type: 'string', description: 'Selector specifying which fields to include in the response. (Optional)' }
      },
      required: ['fileId', 'content']
    }
  },
  {
    name: 'drive_comments_delete',
    description: 'Deletes a comment by ID.',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The ID of the file.' },
        commentId: { type: 'string', description: 'The ID of the comment to delete.' }
      },
      required: ['fileId', 'commentId']
    }
  },
  {
    name: 'drive_comments_get',
    description: 'Gets a comment by ID.',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The ID of the file.' },
        commentId: { type: 'string', description: 'The ID of the comment to retrieve.' },
        includeDeleted: { type: 'boolean', description: 'Whether to include deleted comments. (Optional, default: false)' },
        fields: { type: 'string', description: 'Selector specifying which fields to include in the response. (Optional)' }
      },
      required: ['fileId', 'commentId']
    }
  },
  {
    name: 'drive_comments_list',
    description: 'Lists a file\'s comments.',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The ID of the file.' },
        pageSize: { type: 'number', description: 'The maximum number of comments to return per page. (Optional)' },
        pageToken: { type: 'string', description: 'The token for continuing a previous list request on the next page. (Optional)' },
        startModifiedTime: { type: 'string', format: 'date-time', description: 'The earliest modification time of comments to include, in RFC 3339 format. (Optional)' },
        includeDeleted: { type: 'boolean', description: 'Whether to include deleted comments. (Optional, default: false)' },
        fields: { type: 'string', description: 'Selector specifying which fields to include in the response. (Optional)' }
      },
      required: ['fileId']
    }
  },
  {
    name: 'drive_comments_update',
    description: 'Updates a comment.',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The ID of the file.' },
        commentId: { type: 'string', description: 'The ID of the comment to update.' },
        content: { type: 'string', description: 'The new plain text content for the comment.' },
        quotedFileContent: {
          type: 'object',
          properties: {
            mimeType: { type: 'string', description: 'The MIME type of the quoted content.' },
            value: { type: 'string', description: 'The quoted content itself.' }
          },
          description: 'The file content to quote, if any. (Optional)'
        },
        quotedAppContext: {
          type: 'object',
          properties: {
            mimeType: { type: 'string', description: 'The MIME type of the quoted app context.' },
            value: { type: 'string', description: 'The quoted app context.' }
          },
          description: 'The app-specific content to quote, if any. (Optional)'
        },
        fields: { type: 'string', description: 'Selector specifying which fields to include in the response. (Optional)' }
      },
      required: ['fileId', 'commentId', 'content']
    }
  },
  // --- Replies API Tool Definitions ---
  {
    name: 'drive_replies_create',
    description: 'Creates a new reply to a comment.',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The ID of the file.' },
        commentId: { type: 'string', description: 'The ID of the comment.' },
        content: { type: 'string', description: 'The plain text content of the reply.' },
        fields: { type: 'string', description: 'Selector specifying which fields to include in the response. (Optional)' }
      },
      required: ['fileId', 'commentId', 'content']
    }
  },
  {
    name: 'drive_replies_delete',
    description: 'Deletes a reply by ID.',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The ID of the file.' },
        commentId: { type: 'string', description: 'The ID of the comment.' },
        replyId: { type: 'string', description: 'The ID of the reply to delete.' }
      },
      required: ['fileId', 'commentId', 'replyId']
    }
  },
  {
    name: 'drive_replies_get',
    description: 'Gets a reply by ID.',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The ID of the file.' },
        commentId: { type: 'string', description: 'The ID of the comment.' },
        replyId: { type: 'string', description: 'The ID of the reply to retrieve.' },
        includeDeleted: { type: 'boolean', description: 'Whether to include deleted replies. (Optional, default: false)' },
        fields: { type: 'string', description: 'Selector specifying which fields to include in the response. (Optional)' }
      },
      required: ['fileId', 'commentId', 'replyId']
    }
  },
  {
    name: 'drive_replies_list',
    description: 'Lists a comment\'s replies.',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The ID of the file.' },
        commentId: { type: 'string', description: 'The ID of the comment.' },
        pageSize: { type: 'number', description: 'The maximum number of replies to return per page. (Optional)' },
        pageToken: { type: 'string', description: 'The token for continuing a previous list request on the next page. (Optional)' },
        includeDeleted: { type: 'boolean', description: 'Whether to include deleted replies. (Optional, default: false)' },
        fields: { type: 'string', description: 'Selector specifying which fields to include in the response. (Optional)' }
      },
      required: ['fileId', 'commentId']
    }
  },
  {
    name: 'drive_replies_update',
    description: 'Updates a reply.',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The ID of the file.' },
        commentId: { type: 'string', description: 'The ID of the comment.' },
        replyId: { type: 'string', description: 'The ID of the reply to update.' },
        content: { type: 'string', description: 'The new plain text content for the reply.' },
        fields: { type: 'string', description: 'Selector specifying which fields to include in the response. (Optional)' }
      },
      required: ['fileId', 'commentId', 'replyId', 'content']
    }
  }
  // ... other tool definitions will be added here later
];

// Example of how you might use these definitions with an MCP SDK
// import { McpServer } from '@modelcontextprotocol/sdk';
// import { GoogleDriveHandler } from './handlers/drive-handler';
//
// const driveHandler = new GoogleDriveHandler();
// const server = new McpServer({
//   tools: toolDefinitions.map(toolDef => ({
//     definition: toolDef,
//     handler: async (args: any) => {
//       const methodName = toolDef.name as keyof GoogleDriveHandler;
//       if (typeof driveHandler[methodName] === 'function') {
//         return (driveHandler[methodName] as any)(args);
//       }
//       throw new Error(`Method ${methodName} not found on handler.`);
//     }
//   }))
// });
//
// server.listen(3000); // Example port
// console.log('MCP Server for Google Drive listening on port 3000');
