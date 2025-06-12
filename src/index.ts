import { Server } from '@anthropic-ai/mcp'; // Assuming this is the correct MCP server import
import { DriveHandler } from './handlers/drive-handler';
import { drive_v3 } from 'googleapis'; // For Schema$ModifyLabelsRequest

// Create MCP server instance
const server = new Server({
  name: 'google-drive-mcp',
  description: 'Google Drive integration for Claude Desktop',
  version: '0.0.1'
});

// Initialize handler
const driveHandler = new DriveHandler();

// Define tools
const tools = [
  // Tools from user feedback
  {
    name: 'drive_files_list',
    description: 'List files in Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        pageSize: { type: 'number', description: 'Number of files to return (1-1000)' },
        pageToken: { type: 'string', description: 'Page token for pagination' },
        q: { type: 'string', description: 'Query string for filtering files' },
        orderBy: { type: 'string', description: 'Sort order for results' },
        fields: { type: 'string', description: 'Fields to include in response' },
        spaces: { type: 'string', description: 'Comma-separated list of spaces to query within the corpus.' },
        includeItemsFromAllDrives: { type: 'boolean', description: 'Whether to include items from all drives.' },
        supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
      }
    }
  },
  {
    name: 'drive_files_get',
    description: 'Get metadata for a specific file',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'ID of the file' },
        fields: { type: 'string', description: 'Fields to include in response' },
        supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
      },
      required: ['fileId']
    }
  },
  {
    name: 'drive_files_create',
    description: 'Create a new file in Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the file' },
        mimeType: { type: 'string', description: 'MIME type of the file' },
        parents: { type: 'array', items: { type: 'string' }, description: 'Parent folder IDs' },
        content: { type: 'string', description: 'File content (for text files)' },
        media: {
          type: 'object',
          properties: {
            mimeType: { type: 'string', description: 'MIME type of the media body' },
            body: { type: 'string', description: 'Media content (e.g., for base64 encoded binary data, or path to file if handler supports it)' } // Body might be stream/buffer in backend, but schema reflects serializable input
          },
          description: 'Media resource (for binary content, etc.)'
        },
        fields: { type: 'string', description: 'Fields to include in the response about the created file.' },
        supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
        keepRevisionForever: { type: 'boolean', description: 'Whether to keep this revision of the file indefinitely.' },
        ocrLanguage: { type: 'string', description: 'A BCP 47 language code to use for OCR.' },
        useContentAsIndexableText: { type: 'boolean', description: 'Whether to use the content as indexable text.' }
      },
      required: ['name']
    }
  },
  {
    name: 'drive_files_update',
    description: 'Update a file in Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'ID of the file' },
        name: { type: 'string', description: 'New name for the file' },
        content: { type: 'string', description: 'New content for the file (text)' },
        mimeType: { type: 'string', description: 'MIME type for content field if provided' },
        addParents: { type: 'array', items: { type: 'string' }, description: 'Parent folder IDs to add' },
        removeParents: { type: 'array', items: { type: 'string' }, description: 'Parent folder IDs to remove' },
        media: {
          type: 'object',
          properties: {
            mimeType: { type: 'string', description: 'MIME type of the media body' },
            body: { type: 'string', description: 'New media content (e.g., base64 encoded binary data)' }
          },
          description: 'New media resource'
        },
        fields: { type: 'string', description: 'Fields to include in the response about the updated file.' },
        supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
        keepRevisionForever: { type: 'boolean', description: 'Whether to keep this revision of the file indefinitely.' },
        ocrLanguage: { type: 'string', description: 'A BCP 47 language code to use for OCR.' },
        useContentAsIndexableText: { type: 'boolean', description: 'Whether to use the content as indexable text.' }
      },
      required: ['fileId']
    }
  },
  {
    name: 'drive_files_delete',
    description: 'Delete a file from Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'ID of the file to delete' },
        supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' }
      },
      required: ['fileId']
    }
  },
  {
    name: 'drive_files_copy',
    description: 'Create a copy of a file',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'ID of the file to copy' },
        name: { type: 'string', description: 'Name for the copy' },
        parents: { type: 'array', items: { type: 'string' }, description: 'Parent folder IDs for the copy' },
        fields: { type: 'string', description: 'Fields to include in the response about the copied file.' },
        supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
        ignoreDefaultVisibility: { type: 'boolean', description: 'Whether to ignore the default visibility settings for the copied file.' },
        keepRevisionForever: { type: 'boolean', description: 'Whether to keep this revision of the copied file indefinitely.' },
        ocrLanguage: { type: 'string', description: 'A BCP 47 language code to use for OCR on the copied file (if applicable).' }
      },
      required: ['fileId']
    }
  },
  {
    name: 'drive_files_emptyTrash',
    description: 'Permanently delete all files in the trash',
    inputSchema: {
      type: 'object',
      properties: {
        driveId: { type: 'string', description: '(Optional) If set, empties the trash of the specified shared drive.'}
      }
    }
  },
  {
    name: 'drive_files_export',
    description: 'Export a Google Workspace file to a different format',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'ID of the file to export' },
        mimeType: { type: 'string', description: 'Target MIME type for export' }
      },
      required: ['fileId', 'mimeType']
    }
  },
  // Newly added method schemas
  {
    name: 'drive_files_download',
    description: 'Download file content',
    inputSchema: {
        type: 'object',
        properties: {
            fileId: { type: 'string', description: 'ID of the file to download' },
            mimeType: { type: 'string', description: 'Optional: Specify if a particular conversion is needed (usually not for direct download)' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' }
        },
        required: ['fileId']
    }
  },
  {
    name: 'drive_files_generateIds',
    description: 'Generate file IDs for future use',
    inputSchema: {
        type: 'object',
        properties: {
            count: { type: 'number', description: 'Number of IDs to generate (default 1)' },
            // space: { type: 'string', description: 'The space to generate IDs for (e.g., "drive") - Note: not a standard param for v3 files.generateIds' }
        }
    }
  },
  {
    name: 'drive_files_watch',
    description: 'Watch for changes on a file',
    inputSchema: {
        type: 'object',
        properties: {
            fileId: { type: 'string', description: 'ID of the file to watch' },
            channelId: { type: 'string', description: 'A unique ID for the notification channel (UUID recommended)' },
            address: { type: 'string', description: 'The HTTPS URL where notifications should be sent' },
            token: { type: 'string', description: 'Optional client token sent with notifications' },
            expiration: { type: 'number', description: 'Optional: Requested time to live for channel in milliseconds' },
            fields: { type: 'string', description: 'Fields to include in the watch response.' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' }
        },
        required: ['fileId', 'channelId', 'address']
    }
  },
  {
    name: 'drive_files_listLabels',
    description: 'List labels on a file',
    inputSchema: {
        type: 'object',
        properties: {
            fileId: { type: 'string', description: 'ID of the file to list labels from' }
        },
        required: ['fileId']
    }
  },
  {
    name: 'drive_files_modifyLabels',
    description: 'Modify labels on a file',
    inputSchema: {
        type: 'object',
        properties: {
            fileId: { type: 'string', description: 'ID of the file whose labels are to be modified' },
            // The actual schema for ModifyLabelsRequest is complex.
            // For MCP, we might simplify or expect the full object.
            // Example of a simplified structure; actual API needs specific format.
            labelModifications: {
                type: 'object',
                description: 'Object defining label modifications (see Google Drive API docs for Schema$ModifyLabelsRequest)',
                properties: {
                    kind: { type: 'string', description: "This is always drive#modifyLabelsRequest." },
                    labelModifications: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                kind: { type: 'string', description: "This is always drive#labelModification." },
                                labelId: { type: 'string', description: "The ID of the label to modify." },
                                fieldModifications: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            kind: { type: 'string', description: "This is always drive#labelFieldModification." },
                                            fieldId: { type: 'string', description: "The ID of the field to modify." },
                                            // Add properties for each value type e.g., setDateValues, setIntegerValues, etc.
                                            // For simplicity, not detailing all here. User must provide correct structure.
                                            // Example:
                                            // setTextValues: { type: 'array', items: { type: 'string' } }
                                        }
                                    }
                                },
                                removeLabel: { type: 'boolean', description: "Whether to remove the label." }
                            }
                        }
                    }
                },
                required: ["labelModifications"]
            }
        },
        required: ['fileId', 'labelModifications']
    }
  },
  {
    name: 'drive_get_about',
    description: 'Get information about the user Drive account and capabilities',
    inputSchema: {
      type: 'object',
      properties: {
        fields: { type: 'string', description: 'Comma-separated list of fields to include in the response. (e.g., user,storageQuota)'}
      }
    }
  }
];

// Register tools and request handler
server.setRequestHandler(async (request) => {
  const { method, params } = request;

  if (method === 'tools/list') {
    return { tools };
  }

  if (method === 'tools/call') {
    const { name: toolName, arguments: args } = params as { name: string, arguments: any };

    // Automatic delegation pattern for drive_ tools
    // Type assertion for toolName to keyof DriveHandler
    if (toolName.startsWith('drive_') && toolName in driveHandler) {
      type DriveHandlerMethods = keyof DriveHandler;
      return await (driveHandler[toolName as DriveHandlerMethods] as (args: any) => Promise<any>)(args);
    }

    throw new Error(`Unknown tool: ${toolName}`);
  }

  throw new Error(`Unknown method: ${method}`);
});

// Error handling
server.onerror = (error) => {
  console.error('[MCP Server Error]', error);
};

// Start the server
async function main() {
  // const transport = server.transport; // transport might not be used directly like this
  console.error('[Google Drive MCP] Server starting...');
  await server.start();
  console.error('[Google Drive MCP] Server started successfully');
}

main().catch(console.error);
