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
      // === Files (15 methods) ===
      {
        name: "drive_files_list",
        description: "Lists files in Google Drive",
        inputSchema: {
          type: "object",
          properties: {
            pageSize: { type: "number", description: "Maximum number of files to return (1-1000)" },
            pageToken: { type: "string", description: "Token for next page of results" },
            q: { type: "string", description: "Query string for searching files" },
            orderBy: { type: "string", description: "Sort order for results" },
            fields: { type: "string", description: "Specific fields to include in response" },
            spaces: { type: "string", description: "Comma-separated list of spaces to query" },
            corpora: { type: "string", description: "Bodies of items to search" },
            includeItemsFromAllDrives: { type: "boolean", description: "Whether to include items from all drives." },
            supportsAllDrives: { type: "boolean", description: "Whether the requesting application supports both My Drives and shared drives." },
            driveId: { type: "string", description: "ID of shared drive to search" }
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
            fields: { type: 'string', description: 'Specific fields to include in response.' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
            acknowledgeAbuse: { type: 'boolean', description: 'Whether the user is acknowledging the risk of downloading known malware or other abusive content.' }
          },
          required: ['fileId']
        }
      },
      {
        name: 'drive_files_create',
        description: 'Creates a new file.',
        inputSchema: {
          type: 'object',
          properties: {
            resource: { type: 'object', description: 'File metadata and properties.' },
            media: { type: 'object', description: 'Media content of the file.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
            enforceSingleParent: { type: 'boolean', description: 'Whether to enforce the single parent constraint.' },
            ignoreDefaultVisibility: { type: 'boolean', description: 'Whether to ignore the default visibility settings for the created file.' },
            keepRevisionForever: { type: 'boolean', description: 'Whether to keep the revision of the uploaded content forever.' },
            ocrLanguage: { type: 'string', description: 'A language hint for OCR processing during image import (ISO 639-1 code).' },
            useContentAsIndexableText: { type: 'boolean', description: 'Whether to use the uploaded content as indexable text.' }
          }
        }
      },
      {
        name: 'drive_files_update',
        description: 'Updates a file\'s metadata and/or content.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file to update.' },
            resource: { type: 'object', description: 'File metadata and properties to update.' },
            addParents: { type: 'string', description: 'Comma-separated list of parent IDs to add.' },
            removeParents: { type: 'string', description: 'Comma-separated list of parent IDs to remove.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
            enforceSingleParent: { type: 'boolean', description: 'Whether to enforce the single parent constraint.' },
            ignoreDefaultVisibility: { type: 'boolean', description: 'Whether to ignore the default visibility settings for the updated file.' },
            keepRevisionForever: { type: 'boolean', description: 'Whether to keep the revision of the uploaded content forever.' },
            ocrLanguage: { type: 'string', description: 'A language hint for OCR processing during image import (ISO 639-1 code).' },
            useContentAsIndexableText: { type: 'boolean', description: 'Whether to use the uploaded content as indexable text.' }
          },
          required: ['fileId']
        }
      },
      {
        name: 'drive_files_delete',
        description: 'Permanently deletes a file owned by the user.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file to delete.' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' }
          },
          required: ['fileId']
        }
      },
      {
        name: 'drive_files_copy',
        description: 'Creates a copy of a file.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file to copy.' },
            resource: { type: 'object', description: 'File metadata and properties for the copied file.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
            ignoreDefaultVisibility: { type: 'boolean', description: 'Whether to ignore the default visibility settings for the copied file.' },
            keepRevisionForever: { type: 'boolean', description: 'Whether to keep the revision of the copied content forever.' },
            ocrLanguage: { type: 'string', description: 'A language hint for OCR processing during image import (ISO 639-1 code).' }
          },
          required: ['fileId']
        }
      },
      {
        name: 'drive_files_watch',
        description: 'Subscribes to changes to a file.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file to watch.' },
            resource: { type: 'object', description: 'Channel configuration details.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
            acknowledgeAbuse: { type: 'boolean', description: 'Whether the user is acknowledging the risk of downloading known malware or other abusive content (required when downloading content of abusive files).' }
          },
          required: ['fileId', 'resource']
        }
      },
      {
        name: 'drive_files_emptyTrash',
        description: 'Permanently deletes all of the user\'s trashed files.',
        inputSchema: {
          type: 'object',
          properties: {
            driveId: { type: 'string', description: 'If specified, permanently deletes all trashed files of the given shared drive; if not specified, permanently deletes all trashed files of My Drive.' },
            enforceSingleParent: { type: 'boolean', description: 'Deprecated: If an item is not a shared drive item, always use enforceSingleParent=true.' }
          }
        }
      },
      {
        name: 'drive_files_export',
        description: 'Exports a Google Workspace document to the requested MIME type.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file to export.' },
            mimeType: { type: 'string', description: 'The MIME type of the format requested for export.' },
            fields: { type: 'string', description: 'Specific fields to include in response (e.g., "id, name"). Exports only content, not metadata.' }
          },
          required: ['fileId', 'mimeType']
        }
      },
      {
        name: 'drive_files_generateIds',
        description: 'Generates a set of file IDs which can be used to create files.',
        inputSchema: {
          type: 'object',
          properties: {
            count: { type: 'number', description: 'The number of IDs to generate.' },
            space: { type: 'string', description: 'The space to generate the IDs for. Supported values are \'drive\' and \'appDataFolder\'.' }
          }
        }
      },
      {
        name: 'drive_files_listLabels',
        description: 'Lists the labels on a file.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file.' },
            maxResults: { type: 'number', description: 'The maximum number of labels to return per page.' },
            pageToken: { type: 'string', description: 'Token for the next page of results.' }
          },
          required: ['fileId']
        }
      },
      {
        name: 'drive_files_modifyLabels',
        description: 'Modifies the set of labels on a file.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file to modify labels on.' },
            resource: { type: 'object', description: 'The ModifyLabelsRequest details.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['fileId', 'resource']
        }
      },
      {
        name: 'drive_files_download',
        description: 'Downloads a file\'s content.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file to download.' },
            acknowledgeAbuse: { type: 'boolean', description: 'Whether the user is acknowledging the risk of downloading known malware or other abusive content.' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' }
          },
          required: ['fileId']
        }
      },
      {
        name: 'drive_files_upload',
        description: 'Uploads a file.',
        inputSchema: {
          type: 'object',
          properties: {
            resource: { type: 'object', description: 'File metadata and properties.' },
            media: { type: 'object', description: 'Media content of the file.' }
            // Additional parameters like uploadType (multipart, resumable) are typically handled by the SDK/client.
          },
          required: ['resource', 'media']
        }
      },
      {
        name: 'drive_files_trash',
        description: 'Moves a file to the trash.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file to trash.' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' }
          },
          required: ['fileId']
        }
      },

      // === Drives (7 methods) ===
      {
        name: 'drive_drives_list',
        description: 'Lists the user\'s shared drives.',
        inputSchema: {
          type: 'object',
          properties: {
            pageSize: { type: 'number', description: 'Maximum number of shared drives to return per page.' },
            pageToken: { type: 'string', description: 'Page token for shared drives.' },
            q: { type: 'string', description: 'Query string for filtering shared drives.' },
            useDomainAdminAccess: { type: 'boolean', description: 'Issue the request as a domain administrator; if set to true, then all shared drives of the domain administrator\'s domain will be returned.'},
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          }
        }
      },
      {
        name: 'drive_drives_create',
        description: 'Creates a new shared drive.',
        inputSchema: {
          type: 'object',
          properties: {
            requestId: { type: 'string', description: 'A unique request ID (UUID) to identify this request.' },
            resource: { type: 'object', description: 'Shared drive metadata (e.g., name).' }
          },
          required: ['requestId', 'resource']
        }
      },
      {
        name: 'drive_drives_get',
        description: 'Gets a shared drive\'s metadata by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            driveId: { type: 'string', description: 'The ID of the shared drive.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' },
            useDomainAdminAccess: { type: 'boolean', description: 'Issue the request as a domain administrator.' }
          },
          required: ['driveId']
        }
      },
      {
        name: 'drive_drives_update',
        description: 'Updates the metadata for a shared drive.',
        inputSchema: {
          type: 'object',
          properties: {
            driveId: { type: 'string', description: 'The ID of the shared drive.' },
            resource: { type: 'object', description: 'Shared drive metadata to update.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' },
            useDomainAdminAccess: { type: 'boolean', description: 'Issue the request as a domain administrator.' }
          },
          required: ['driveId', 'resource']
        }
      },
      {
        name: 'drive_drives_delete',
        description: 'Permanently deletes a shared drive for which the user is an organizer.',
        inputSchema: {
          type: 'object',
          properties: {
            driveId: { type: 'string', description: 'The ID of the shared drive.' },
            allowItemDeletion: { type: 'boolean', description: 'Whether to allow deleting the shared drive even if it contains items. This is a risky operation.' },
            useDomainAdminAccess: { type: 'boolean', description: 'Issue the request as a domain administrator.' }
          },
          required: ['driveId']
        }
      },
      {
        name: 'drive_drives_hide',
        description: 'Hides a shared drive from the default view.',
        inputSchema: {
          type: 'object',
          properties: {
            driveId: { type: 'string', description: 'The ID of the shared drive.' }
          },
          required: ['driveId']
        }
      },
      {
        name: 'drive_drives_unhide',
        description: 'Restores a hidden shared drive to the default view.',
        inputSchema: {
          type: 'object',
          properties: {
            driveId: { type: 'string', description: 'The ID of the shared drive.' }
          },
          required: ['driveId']
        }
      },

      // === Permissions (5 methods) ===
      {
        name: 'drive_permissions_create',
        description: 'Creates a permission for a file or shared drive.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file or shared drive.' },
            resource: { type: 'object', description: 'Permission resource to create.' },
            emailMessage: { type: 'string', description: 'A plain text custom message to include in the notification email.' },
            sendNotificationEmail: { type: 'boolean', description: 'Whether to send a notification email when sharing the file (defaults to true).' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
            useDomainAdminAccess: { type: 'boolean', description: 'Issue the request as a domain administrator; if set to true, then the requester will be granted access if they are an administrator of the domain to which the item belongs.' },
            transferOwnership: { type: 'boolean', description: 'Whether to transfer ownership to the specified user and downgrade the current owner to a writer. This field is deprecated and shares the same behavior as transferOwnership in the request body.' }
          },
          required: ['fileId', 'resource']
        }
      },
      {
        name: 'drive_permissions_list',
        description: 'Lists a file\'s or shared drive\'s permissions.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file or shared drive.' },
            pageSize: { type: 'number', description: 'The maximum number of permissions to return per page.' },
            pageToken: { type: 'string', description: 'The token for continuing a previous list request on the next page.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
            useDomainAdminAccess: { type: 'boolean', description: 'Issue the request as a domain administrator; if set to true, then the requester will be granted access if they are an administrator of the domain to which the item belongs.' },
            includePermissionsForView: { type: 'string', description: 'Specifies which additional view-specific permissions to include in the response. Only \'published\' is supported.' }
          },
          required: ['fileId']
        }
      },
      {
        name: 'drive_permissions_get',
        description: 'Gets a permission by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file or shared drive.' },
            permissionId: { type: 'string', description: 'The ID of the permission.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
            useDomainAdminAccess: { type: 'boolean', description: 'Issue the request as a domain administrator; if set to true, then the requester will be granted access if they are an administrator of the domain to which the item belongs.' }
          },
          required: ['fileId', 'permissionId']
        }
      },
      {
        name: 'drive_permissions_update',
        description: 'Updates a permission with patch semantics.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file or shared drive.' },
            permissionId: { type: 'string', description: 'The ID of the permission to update.' },
            resource: { type: 'object', description: 'Permission resource with updated fields.' },
            removeExpiration: { type: 'boolean', description: 'Whether to remove the expiration date from the permission.' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
            transferOwnership: { type: 'boolean', description: 'Whether to transfer ownership to the specified user and downgrade the current owner to a writer.' },
            useDomainAdminAccess: { type: 'boolean', description: 'Issue the request as a domain administrator; if set to true, then the requester will be granted access if they are an administrator of the domain to which the item belongs.' }
          },
          required: ['fileId', 'permissionId', 'resource']
        }
      },
      {
        name: 'drive_permissions_delete',
        description: 'Deletes a permission.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file or shared drive.' },
            permissionId: { type: 'string', description: 'The ID of the permission to delete.' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
            useDomainAdminAccess: { type: 'boolean', description: 'Issue the request as a domain administrator; if set to true, then the requester will be granted access if they are an administrator of the domain to which the item belongs.' }
          },
          required: ['fileId', 'permissionId']
        }
      },

      // === Comments (5 methods) ===
      {
        name: 'drive_comments_list',
        description: 'Lists a file\'s comments.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file.' },
            pageToken: { type: 'string', description: 'The token for continuing a previous list request on the next page.' },
            pageSize: { type: 'number', description: 'The maximum number of comments to return per page.' },
            startModifiedTime: { type: 'string', description: 'The RFC 3339 formatted time string indicating the start of the time period to filter comments by.' },
            includeDeleted: { type: 'boolean', description: 'Whether to include deleted comments. Deleted comments will not include their original content.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['fileId']
        }
      },
      {
        name: 'drive_comments_get',
        description: 'Gets a comment by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file.' },
            commentId: { type: 'string', description: 'The ID of the comment.' },
            includeDeleted: { type: 'boolean', description: 'Whether to return deleted comments. Deleted comments will not include their original content.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['fileId', 'commentId']
        }
      },
      {
        name: 'drive_comments_create',
        description: 'Creates a new comment on a file.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file.' },
            resource: { type: 'object', description: 'The comment resource to create (content, anchor, etc.).' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['fileId', 'resource']
        }
      },
      {
        name: 'drive_comments_update',
        description: 'Updates a comment with patch semantics.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file.' },
            commentId: { type: 'string', description: 'The ID of the comment to update.' },
            resource: { type: 'object', description: 'The comment resource with updated fields (content, etc.).' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['fileId', 'commentId', 'resource']
        }
      },
      {
        name: 'drive_comments_delete',
        description: 'Deletes a comment.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file.' },
            commentId: { type: 'string', description: 'The ID of the comment to delete.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['fileId', 'commentId']
        }
      },

      // === Replies (5 methods) ===
      {
        name: 'drive_replies_list',
        description: 'Lists a comment\'s replies.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file.' },
            commentId: { type: 'string', description: 'The ID of the comment.' },
            pageToken: { type: 'string', description: 'The token for continuing a previous list request on the next page.' },
            pageSize: { type: 'number', description: 'The maximum number of replies to return per page.' },
            includeDeleted: { type: 'boolean', description: 'Whether to include deleted replies. Deleted replies will not include their original content.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['fileId', 'commentId']
        }
      },
      {
        name: 'drive_replies_get',
        description: 'Gets a reply by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file.' },
            commentId: { type: 'string', description: 'The ID of the comment.' },
            replyId: { type: 'string', description: 'The ID of the reply.' },
            includeDeleted: { type: 'boolean', description: 'Whether to return deleted replies. Deleted replies will not include their original content.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['fileId', 'commentId', 'replyId']
        }
      },
      {
        name: 'drive_replies_create',
        description: 'Creates a new reply to a comment.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file.' },
            commentId: { type: 'string', description: 'The ID of the comment.' },
            resource: { type: 'object', description: 'The reply resource to create (content, etc.).' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['fileId', 'commentId', 'resource']
        }
      },
      {
        name: 'drive_replies_update',
        description: 'Updates a reply with patch semantics.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file.' },
            commentId: { type: 'string', description: 'The ID of the comment.' },
            replyId: { type: 'string', description: 'The ID of the reply to update.' },
            resource: { type: 'object', description: 'The reply resource with updated fields (content, etc.).' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['fileId', 'commentId', 'replyId', 'resource']
        }
      },
      {
        name: 'drive_replies_delete',
        description: 'Deletes a reply.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file.' },
            commentId: { type: 'string', description: 'The ID of the comment.' },
            replyId: { type: 'string', description: 'The ID of the reply to delete.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['fileId', 'commentId', 'replyId']
        }
      },

      // === Revisions (4 methods) ===
      {
        name: 'drive_revisions_list',
        description: 'Lists a file\'s revisions.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file.' },
            pageSize: { type: 'number', description: 'The maximum number of revisions to return per page.' },
            pageToken: { type: 'string', description: 'The token for continuing a previous list request on the next page.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['fileId']
        }
      },
      {
        name: 'drive_revisions_get',
        description: 'Gets a revision by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file.' },
            revisionId: { type: 'string', description: 'The ID of the revision.' },
            acknowledgeAbuse: { type: 'boolean', description: 'Whether the user is acknowledging the risk of downloading known malware or other abusive content. This is relevant when a revision of an abusive file is identified.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['fileId', 'revisionId']
        }
      },
      {
        name: 'drive_revisions_update',
        description: 'Updates a revision with patch semantics.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file.' },
            revisionId: { type: 'string', description: 'The ID of the revision to update.' },
            resource: { type: 'object', description: 'The revision resource with updated fields (e.g., keepForever, published).' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['fileId', 'revisionId', 'resource']
        }
      },
      {
        name: 'drive_revisions_delete',
        description: 'Permanently deletes a file version. This can only be done if the revision is not the head revision and was not pinned.',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: { type: 'string', description: 'The ID of the file.' },
            revisionId: { type: 'string', description: 'The ID of the revision to delete.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' } // Though API returns no body on success
          },
          required: ['fileId', 'revisionId']
        }
      },

      // === Changes (3 methods) ===
      {
        name: 'drive_changes_list',
        description: 'Lists changes for a user or shared drive.',
        inputSchema: {
          type: 'object',
          properties: {
            pageToken: { type: 'string', description: 'The token for continuing a previous list request on the next page. This is required for all requests except for the first.' },
            driveId: { type: 'string', description: 'The shared drive from which changes are returned. If specified the pageToken must be from a startPageToken request for the same shared drive.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' },
            includeCorpusRemovals: { type: 'boolean', description: 'Whether changes should include the file resource if the file is still accessible by the user at the time of the request, even if it has been removed from the list of changes.' },
            includeDeleted: { type: 'boolean', description: 'Whether to include changes indicating that items have been removed from the list of changes, for example by deletion or loss of access.' },
            includeItemsFromAllDrives: { type: 'boolean', description: 'Whether to include changes from all drives, including shared drives and My Drive, must be set to true for My Drive changes.' },
            includeLabels: { type: 'string', description: 'A comma-separated list of IDs of labels to include in the labelInfo part of the response.' },
            includePermissionsForView: { type: 'string', description: 'Specifies which additional view-specific permissions to include in the response. Only \'published\' is supported.' },
            includeSubscribed: { type: 'boolean', description: 'Whether to include changes subscribed by users (e.g. subscribed to comments on a file).' },
            includeTeamDriveItems: { type: 'boolean', description: 'Deprecated: Use includeItemsFromAllDrives instead.' },
            pageSize: { type: 'number', description: 'The maximum number of changes to return per page.' },
            spaces: { type: 'string', description: 'The list of spaces which the changes belong to. Supported values are \'drive\', \'appDataFolder\' and \'photos\'.' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
            teamDriveId: { type: 'string', description: 'Deprecated: Use driveId instead.' }
          },
          required: ['pageToken']
        }
      },
      {
        name: 'drive_changes_getStartPageToken',
        description: 'Gets the starting pageToken for listing future changes.',
        inputSchema: {
          type: 'object',
          properties: {
            driveId: { type: 'string', description: 'The ID of the shared drive for which the starting pageToken for listing future changes is returned.' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
            teamDriveId: { type: 'string', description: 'Deprecated: Use driveId instead.' },
            fields: { type: 'string', description: 'Specific fields to include in response (e.g., "startPageToken").' }
          }
        }
      },
      {
        name: 'drive_changes_watch',
        description: 'Subscribes to changes for a user or shared drive.',
        inputSchema: {
          type: 'object',
          properties: {
            pageToken: { type: 'string', description: 'The token for continuing a previous list request on the next page. This is required for all requests except for the first.' },
            resource: { type: 'object', description: 'The channel resource to create (id, type, address, etc.).' },
            driveId: { type: 'string', description: 'The shared drive from which changes are returned.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' },
            includeCorpusRemovals: { type: 'boolean', description: 'Whether changes should include the file resource if the file is still accessible by the user at the time of the request, even if it has been removed from the list of changes.' },
            includeDeleted: { type: 'boolean', description: 'Whether to include changes indicating that items have been removed from the list of changes.' },
            includeItemsFromAllDrives: { type: 'boolean', description: 'Whether to include changes from all drives.' },
            includeLabels: { type: 'string', description: 'A comma-separated list of IDs of labels to include in the labelInfo part of the response.' },
            includePermissionsForView: { type: 'string', description: 'Specifies which additional view-specific permissions to include in the response.' },
            includeSubscribed: { type: 'boolean', description: 'Whether to include changes subscribed by users.' },
            includeTeamDriveItems: { type: 'boolean', description: 'Deprecated: Use includeItemsFromAllDrives instead.' },
            pageSize: { type: 'number', description: 'The maximum number of changes to return per page.' },
            spaces: { type: 'string', description: 'The list of spaces which the changes belong to.' },
            supportsAllDrives: { type: 'boolean', description: 'Whether the requesting application supports both My Drives and shared drives.' },
            teamDriveId: { type: 'string', description: 'Deprecated: Use driveId instead.' }
          },
          required: ['pageToken', 'resource']
        }
      },

      // === Access Proposals (3 methods) ===
      {
        name: 'drive_accessproposals_list',
        description: 'Lists access proposals for a file or shared drive. (Likely Drive Activity API)',
        inputSchema: {
          type: 'object',
          properties: {
            // Common parameters for listing, actual params depend on specific API if not core Drive v3
            parentId: { type: 'string', description: 'The ID of the parent resource (e.g., file or shared drive) to list proposals for.' },
            pageSize: { type: 'number', description: 'Maximum number of proposals to return.' },
            pageToken: { type: 'string', description: 'Token for pagination.' },
            filter: { type: 'string', description: 'Query string for filtering proposals.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['parentId'] // Assuming parentId is generally required for such listing.
        }
      },
      {
        name: 'drive_accessproposals_get',
        description: 'Gets an access proposal by ID. (Likely Drive Activity API)',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'The name of the access proposal resource (e.g., "accessProposals/some-id").' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['name']
        }
      },
      {
        name: 'drive_accessproposals_resolve',
        description: 'Resolves an access proposal by approving or denying it. (Likely Drive Activity API)',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'The name of the access proposal resource to resolve.' },
            resolutionStatus: { type: 'string', description: 'The resolution status (e.g., "approve", "deny").' },
            // Potentially a resource body with more details for the resolution might be needed.
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['name', 'resolutionStatus']
        }
      },

      // === Apps (2 methods) ===
      {
        name: 'drive_apps_list',
        description: 'Lists the apps authorized to access a user\'s Drive. This is often for UI purposes to show connected apps.',
        inputSchema: {
          type: 'object',
          properties: {
            appFilterExtensions: { type: 'string', description: 'A comma-separated list of file extensions to filter apps by (e.g., "txt,pdf").' },
            appFilterMimeTypes: { type: 'string', description: 'A comma-separated list of MIME types to filter apps by (e.g., "text/plain,application/pdf").' },
            languageCode: { type: 'string', description: 'An BCP 47 language code, such as "en-US" or "sr-Latn".' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          }
        }
      },
      {
        name: 'drive_apps_get',
        description: 'Gets a specific app by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            appId: { type: 'string', description: 'The ID of the app.' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['appId']
        }
      },

      // === About (1 method) ===
      {
        name: 'drive_about_get',
        description: 'Gets information about the user, the user\'s Drive, and system capabilities.',
        inputSchema: {
          type: 'object',
          properties: {
            fields: { type: 'string', description: 'Specific fields to include in response (e.g., "user,storageQuota").' }
          }
        }
      },

      // === Operations (1 method) ===
      {
        name: 'drive_operations_get',
        description: 'Gets the status of a long-running operation. (Likely Drive Activity API or similar for batch operations, not core Drive v3 file operations)',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'The name of the operation resource (e.g., "operations/ চৈতন্য").' },
            fields: { type: 'string', description: 'Specific fields to include in response.' }
          },
          required: ['name']
        }
      },

      // === Channels (1 method) ===
      {
        name: 'drive_channels_stop',
        description: 'Stops watching resources through a channel.',
        inputSchema: {
          type: 'object',
          properties: {
            resource: {
              type: 'object',
              description: 'The channel resource to stop.',
              properties: {
                id: { type: 'string', description: 'The opaque ID of the channel to stop.' },
                resourceId: { type: 'string', description: 'An opaque ID that identifies the resource being watched on this channel.' }
              },
              required: ['id', 'resourceId']
            }
            // fields parameter is not typically used for stop channel, as it usually returns an empty response.
          },
          required: ['resource']
        }
      },
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
