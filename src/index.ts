// MCP Tool Definitions and Handler Logic
import { GoogleDriveHandler } from './handlers/drive-handler';
import { MCPResponse } from './types/drive-types'; // Assuming MCPResponse might be a return type

// Placeholder for other imports or setup if needed

const tools = [
  // Tool definitions start here
  {
    name: 'drive_permissions_list',
    description: 'Lists permissions for a file or shared drive',
    parameters: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'The ID of the file or shared drive'
        },
        pageSize: {
          type: 'number',
          description: 'Maximum number of permissions to return (1-100)'
        },
        pageToken: {
          type: 'string',
          description: 'Page token for pagination'
        },
        useDomainAdminAccess: {
          type: 'boolean',
          description: 'Issue request as domain administrator'
        }
      },
      required: ['fileId']
    }
  },
  {
    name: 'drive_permissions_get',
    description: 'Gets a permission by ID',
    parameters: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'The ID of the file'
        },
        permissionId: {
          type: 'string',
          description: 'The ID of the permission'
        },
        useDomainAdminAccess: {
          type: 'boolean',
          description: 'Issue request as domain administrator'
        }
      },
      required: ['fileId', 'permissionId']
    }
  },
  {
    name: 'drive_permissions_create',
    description: 'Creates a permission for a file or shared drive',
    parameters: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'The ID of the file or shared drive'
        },
        role: {
          type: 'string',
          description: 'The role (owner, organizer, fileOrganizer, writer, commenter, reader)',
          enum: ['owner', 'organizer', 'fileOrganizer', 'writer', 'commenter', 'reader']
        },
        type: {
          type: 'string',
          description: 'The type (user, group, domain, anyone)',
          enum: ['user', 'group', 'domain', 'anyone']
        },
        emailAddress: {
          type: 'string',
          description: 'Email address (when type is user or group)'
        },
        domain: {
          type: 'string',
          description: 'Domain (when type is domain)'
        },
        allowFileDiscovery: {
          type: 'boolean',
          description: 'Whether file can be discovered through search'
        },
        emailMessage: {
          type: 'string',
          description: 'Custom message to include in notification email'
        },
        sendNotificationEmail: {
          type: 'boolean',
          description: 'Whether to send notification email'
        },
        transferOwnership: {
          type: 'boolean',
          description: 'Whether to transfer ownership'
        }
      },
      required: ['fileId', 'role', 'type']
    }
  },
  {
    name: 'drive_permissions_update',
    description: 'Updates a permission',
    parameters: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'The ID of the file'
        },
        permissionId: {
          type: 'string',
          description: 'The ID of the permission'
        },
        role: {
          type: 'string',
          description: 'The updated role',
          enum: ['owner', 'organizer', 'fileOrganizer', 'writer', 'commenter', 'reader']
        },
        expirationTime: {
          type: 'string',
          description: 'Expiration time (RFC 3339 date-time)'
        },
        removeExpiration: {
          type: 'boolean',
          description: 'Whether to remove expiration'
        },
        transferOwnership: {
          type: 'boolean',
          description: 'Whether to transfer ownership'
        },
        useDomainAdminAccess: {
          type: 'boolean',
          description: 'Issue request as domain administrator'
        },
        enforceExpansiveAccess: {
          type: 'boolean',
          description: 'Enforce expansive access for limited access folders'
        }
      },
      required: ['fileId', 'permissionId']
    }
  },
  {
    name: 'drive_permissions_delete',
    description: 'Deletes a permission',
    parameters: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'The ID of the file'
        },
        permissionId: {
          type: 'string',
          description: 'The ID of the permission'
        },
        useDomainAdminAccess: {
          type: 'boolean',
          description: 'Issue request as domain administrator'
        },
        enforceExpansiveAccess: {
          type: 'boolean',
          description: 'Enforce expansive access for limited access folders'
        }
      },
      required: ['fileId', 'permissionId']
    }
  }
  // Tool definitions end here
];

// Main handler function for dispatching tool calls
async function handleToolCall(toolName: string, args: any): Promise<MCPResponse<any>> {
  // Check if the tool is a Google Drive tool
  if (toolName.startsWith('drive_')) {
    try {
      const handler = await GoogleDriveHandler.authorize(); // Authorize and get an instance

      // Check if the method exists on the handler
      // We need to cast handler to `any` here to allow string indexing for method check,
      // or implement a more type-safe way to map toolName to methods.
      if (typeof (handler as any)[toolName] === 'function') {
        return await (handler as any)[toolName](args);
      } else {
        console.error(`Tool ${toolName} not found in GoogleDriveHandler`);
        return { success: false, error: `Tool ${toolName} not found in GoogleDriveHandler` };
      }
    } catch (error: any) {
      console.error(`Error during GoogleDriveHandler authorization or tool call for ${toolName}:`, error);
      return {
        success: false,
        error: `Error processing tool ${toolName}: ${error.message || 'Unknown error'}`,
        errorDetails: error.errorDetails || error.stack
      };
    }
  }

  // Placeholder for other tool suites or a default error
  console.error(`Tool ${toolName} not supported by this handler setup.`);
  return { success: false, error: `Tool ${toolName} not supported` };
}

export { tools, handleToolCall }; // Export tools and the handler function
