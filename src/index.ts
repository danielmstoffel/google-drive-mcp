// MCP server setup
// TODO: Initialize and start the MCP server, registering these tools.

export const toolDefinitions = [
  // --- Changes API Tool Definitions ---
  {
    name: 'drive_changes_getStartPageToken',
    description: 'Gets the starting page token for listing future changes.',
    parameters: {
      type: 'object',
      properties: {
        supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives. (Optional)' },
        includeItemsFromAllDrives: { type: 'boolean', description: 'Whether to include changes from all drives. (Optional, requires supportsAllDrives=true)' }
      },
      required: []
    }
  },
  {
    name: 'drive_changes_list',
    description: 'Lists changes to files and folders.',
    parameters: {
      type: 'object',
      properties: {
        pageToken: { type: 'string', description: 'The token for continuing a previous list request on the next page.' },
        pageSize: { type: 'number', description: 'The maximum number of changes to return per page. (Optional)' },
        restrictToMyDrive: { type: 'boolean', description: 'Whether to restrict the results to changes inside the My Drive hierarchy. (Optional)' },
        spaces: { type: 'string', description: 'A comma-separated list of spaces to query. Supported values are \'drive\', \'appDataFolder\' and \'photos\'. (Optional)' },
        supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives. (Optional)' },
        includeItemsFromAllDrives: { type: 'boolean', description: 'Whether to include changes from all drives. (Optional, requires supportsAllDrives=true)' },
        includeCorpusRemovals: { type: 'boolean', description: 'Whether changes should include the file resource if the file is removed from the target corpus. (Optional)' },
        includeRemoved: { type: 'boolean', description: 'Whether to include removed items in results. (Optional, default: true)' },
        fields: { type: 'string', description: 'Selector specifying which fields to include in the response. (Optional)' }
      },
      required: ['pageToken']
    }
  },
  {
    name: 'drive_changes_watch',
    description: 'Subscribes to changes to a file or folder. Returns a channel.',
    parameters: {
      type: 'object',
      properties: {
        pageToken: { type: 'string', description: 'The token for continuing a previous list request on the next page.' },
        requestBody: {
          type: 'object',
          description: 'The channel configuration.',
          properties: {
            id: { type: 'string', description: 'A UUID or similar unique string that identifies this channel.' },
            type: { type: 'string', description: 'The type of delivery mechanism used for this channel (e.g., "web_hook").' },
            address: { type: 'string', description: 'The address where notifications are to be delivered.' },
            token: { type: 'string', description: 'An arbitrary string delivered to the target address with each notification. (Optional)' },
            expiration: { type: 'string', format: 'int64', description: 'Date and time of channel expiration, expressed as a Unix timestamp, in milliseconds. (Optional)' },
            params: { type: 'object', additionalProperties: { type: 'string' }, description: 'Additional parameters controlling delivery channel behavior. (Optional)' },
            payload: { type: 'boolean', description: 'A Boolean value to indicate whether payload is wanted. (Optional)' },
            resourceId: { type: 'string', description: 'An opaque ID that identifies the resource being watched on this channel. (Optional)' },
            resourceUri: { type: 'string', description: 'A version-specific identifier for the watched resource. (Optional)' }
          },
          required: ['id', 'type', 'address']
        },
        supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives. (Optional)' },
        includeItemsFromAllDrives: { type: 'boolean', description: 'Whether to include changes from all drives. (Optional, requires supportsAllDrives=true)' }
      },
      required: ['pageToken', 'requestBody']
    }
  },
  // --- About API Tool Definitions ---
  {
    name: 'drive_about_get',
    description: 'Gets information about the user, the user\'s Drive, and system capabilities.',
    parameters: {
      type: 'object',
      properties: {
        fields: { type: 'string', description: 'Selector specifying which fields to include in the response. (Optional)' }
      },
      required: []
    }
  },
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
  },
  // --- Revisions API Tool Definitions ---
  {
    name: 'drive_revisions_delete',
    description: 'Deletes a revision.',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The ID of the file.' },
        revisionId: { type: 'string', description: 'The ID of the revision to delete.' }
      },
      required: ['fileId', 'revisionId']
    }
  },
  {
    name: 'drive_revisions_get',
    description: 'Gets a revision by ID.',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The ID of the file.' },
        revisionId: { type: 'string', description: 'The ID of the revision to retrieve.' },
        fields: { type: 'string', description: 'Selector specifying which fields to include in the response. (Optional)' }
      },
      required: ['fileId', 'revisionId']
    }
  },
  {
    name: 'drive_revisions_list',
    description: 'Lists a file\'s revisions.',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The ID of the file.' },
        pageSize: { type: 'number', description: 'The maximum number of revisions to return per page. (Optional)' },
        pageToken: { type: 'string', description: 'The token for continuing a previous list request on the next page. (Optional)' },
        fields: { type: 'string', description: 'Selector specifying which fields to include in the response. (Optional)' }
      },
      required: ['fileId']
    }
  },
  {
    name: 'drive_revisions_update',
    description: 'Updates a revision.',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The ID of the file.' },
        revisionId: { type: 'string', description: 'The ID of the revision to update.' },
        keepForever: { type: 'boolean', description: 'Whether to keep this revision indefinitely. (Optional)' },
        publishAuto: { type: 'boolean', description: 'Whether to automatically publish this revision. This is only applicable to Docs editors files. (Optional)' },
        published: { type: 'boolean', description: 'Whether this revision is published. This is only applicable to Docs editors files. (Optional)' },
        publishedOutsideDomain: { type: 'boolean', description: 'Whether this revision is published outside the domain. This is only applicable to Docs editors files. (Optional)' },
        fields: { type: 'string', description: 'Selector specifying which fields to include in the response. (Optional)' }
      },
      required: ['fileId', 'revisionId']
    }
  },
  // --- Apps API Tool Definitions ---
  {
    name: 'drive_apps_list',
    description: 'Lists the user\'s installed apps.',
    parameters: {
      type: 'object',
      properties: {
        languageCode: { type: 'string', description: 'BCP 47 language code, such as \'en-US\'. (Optional)' },
        appFilterExtensions: { type: 'string', description: 'Comma-separated list of file extensions to filter apps by (e.g., \'jpg,gif\'). (Optional)' },
        appFilterMimeTypes: { type: 'string', description: 'Comma-separated list of MIME types to filter apps by (e.g., \'image/jpeg,image/png\'). (Optional)' },
        fields: { type: 'string', description: 'Selector specifying which fields to include in the response. (Optional)' }
      }
      // No required parameters for list
    }
  },
  {
    name: 'drive_apps_get',
    description: 'Gets a specific app by ID.',
    parameters: {
      type: 'object',
      properties: {
        appId: { type: 'string', description: 'The ID of the app.' },
        fields: { type: 'string', description: 'Selector specifying which fields to include in the response. (Optional)' }
      },
      required: ['appId']
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
