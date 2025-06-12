import { drive_v3, google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const MAX_BASE64_DOWNLOAD_SIZE = 50 * 1024 * 1024; // 50MB

export class DriveHandler {
  private drive: drive_v3.Drive;
  private auth: OAuth2Client;

  constructor() {
    // OAuth2 setup
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  // Helper function for consistent MCP responses
  private formatMCPResponse(data: any) {
    // Check if success is explicitly set to false, otherwise default to true
    const success = data.success === false ? false : true;
    const responseData = { ...data };
    // Remove explicit success field from responseData if it was used for error signaling
    if (responseData.success === false) {
        delete responseData.success;
    }

    return {
      success: success,
      ...responseData
    };
  }

  // Files: List
  async drive_files_list(args: {
    pageSize?: number;
    pageToken?: string;
    q?: string;
    orderBy?: string;
    fields?: string;
    // Adding parameters from the original issue description
    spaces?: string;
    includeItemsFromAllDrives?: boolean;
    supportsAllDrives?: boolean;
  }) {
    try {
      const response = await this.drive.files.list({
        pageSize: args.pageSize || 10,
        pageToken: args.pageToken,
        q: args.q,
        orderBy: args.orderBy,
        fields: args.fields || 'files(id, name, mimeType, size, createdTime, modifiedTime), nextPageToken',
        spaces: args.spaces,
        includeItemsFromAllDrives: args.includeItemsFromAllDrives,
        supportsAllDrives: args.supportsAllDrives
      });

      return this.formatMCPResponse({
        files: response.data.files || [],
        nextPageToken: response.data.nextPageToken
      });
    } catch (error) {
      const err = error as Error;
      return this.formatMCPResponse({
        success: false,
        error: err.message
      });
    }
  }

  // Files: Get
  async drive_files_get(args: {
    fileId: string;
    fields?: string;
    // Adding parameters from the original issue description
    supportsAllDrives?: boolean;
  }) {
    try {
      const response = await this.drive.files.get({
        fileId: args.fileId,
        fields: args.fields || 'id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink, webContentLink',
        supportsAllDrives: args.supportsAllDrives
      });

      return this.formatMCPResponse({
        file: response.data
      });
    } catch (error) {
      const err = error as Error;
      return this.formatMCPResponse({
        success: false,
        error: err.message
      });
    }
  }

  // Files: Create
  async drive_files_create(args: {
    name: string;
    mimeType?: string;
    parents?: string[];
    content?: string; // For simple text content
    // Adding parameters from the original issue description
    media?: { // For binary content
        mimeType?: string;
        body: any; // string | NodeJS.ReadableStream | Buffer;
    };
    fields?: string;
    supportsAllDrives?: boolean;
    keepRevisionForever?: boolean;
    ocrLanguage?: string;
    useContentAsIndexableText?: boolean;
  }) {
    try {
      const fileMetadata: any = {
        name: args.name,
        mimeType: args.mimeType,
        parents: args.parents
      };

      let mediaPayload;
      if (args.content) { // Simple text content
        mediaPayload = {
          mimeType: args.mimeType || 'text/plain',
          body: args.content
        };
      } else if (args.media && args.media.body) { // Binary/stream content
          mediaPayload = {
            mimeType: args.media.mimeType,
            body: args.media.body
          };
      }


      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: mediaPayload,
        fields: args.fields || 'id, name, mimeType, webViewLink',
        supportsAllDrives: args.supportsAllDrives,
        keepRevisionForever: args.keepRevisionForever,
        ocrLanguage: args.ocrLanguage,
        useContentAsIndexableText: args.useContentAsIndexableText
      });

      return this.formatMCPResponse({
        file: response.data
      });
    } catch (error) {
      const err = error as Error;
      return this.formatMCPResponse({
        success: false,
        error: err.message
      });
    }
  }

  // Files: Update
  async drive_files_update(args: {
    fileId: string;
    name?: string;
    content?: string; // For simple text content
    mimeType?: string; // MIME type for content field
    addParents?: string[];
    removeParents?: string[];
    // Adding parameters from the original issue description
    media?: { // For binary content
        mimeType?: string;
        body: any; // string | NodeJS.ReadableStream | Buffer;
    };
    fields?: string;
    supportsAllDrives?: boolean;
    keepRevisionForever?: boolean;
    ocrLanguage?: string;
    useContentAsIndexableText?: boolean;
  }) {
    try {
      const requestBody: any = {};
      if (args.name) requestBody.name = args.name;
      // Note: The Google Drive API v3 files.update method does not directly support changing mimeType via requestBody.
      // It's usually set during creation or inferred from content.
      // If mimeType is provided here, it's for the media payload.

      let mediaPayload;
      if (args.content) { // Simple text content
        mediaPayload = {
          mimeType: args.mimeType || 'text/plain', // Use provided mimeType or default
          body: args.content
        };
      } else if (args.media && args.media.body) { // Binary/stream content
          mediaPayload = {
            mimeType: args.media.mimeType, // Use specific mimeType from media object
            body: args.media.body
          };
      }

      const response = await this.drive.files.update({
        fileId: args.fileId,
        requestBody: requestBody,
        media: mediaPayload,
        addParents: args.addParents?.join(','),
        removeParents: args.removeParents?.join(','),
        fields: args.fields || 'id, name, mimeType, modifiedTime',
        supportsAllDrives: args.supportsAllDrives,
        keepRevisionForever: args.keepRevisionForever,
        ocrLanguage: args.ocrLanguage,
        useContentAsIndexableText: args.useContentAsIndexableText
      });

      return this.formatMCPResponse({
        file: response.data
      });
    } catch (error) {
      const err = error as Error;
      return this.formatMCPResponse({
        success: false,
        error: err.message
      });
    }
  }

  // Files: Delete
  async drive_files_delete(args: {
    fileId: string;
    // Adding parameters from the original issue description
    supportsAllDrives?: boolean;
  }) {
    try {
      await this.drive.files.delete({
        fileId: args.fileId,
        supportsAllDrives: args.supportsAllDrives
      });

      return this.formatMCPResponse({
        deleted: true,
        fileId: args.fileId
      });
    } catch (error) {
      const err = error as Error;
      return this.formatMCPResponse({
        success: false,
        error: err.message
      });
    }
  }

  // Files: Copy
  async drive_files_copy(args: {
    fileId: string;
    name?: string;
    parents?: string[];
    // Adding parameters from the original issue description
    fields?: string;
    supportsAllDrives?: boolean;
    ignoreDefaultVisibility?: boolean;
    keepRevisionForever?: boolean;
    ocrLanguage?: string;
  }) {
    try {
      const requestBody: any = {
        name: args.name,
        parents: args.parents
      };
      if (args.ocrLanguage) requestBody.ocrLanguage = args.ocrLanguage; // Only include if provided


      const response = await this.drive.files.copy({
        fileId: args.fileId,
        requestBody: requestBody,
        fields: args.fields || 'id, name, mimeType, webViewLink',
        supportsAllDrives: args.supportsAllDrives,
        ignoreDefaultVisibility: args.ignoreDefaultVisibility,
        keepRevisionForever: args.keepRevisionForever
        // ocrLanguage is part of requestBody for copy, not a direct parameter
      });

      return this.formatMCPResponse({
        file: response.data
      });
    } catch (error) {
      const err = error as Error;
      return this.formatMCPResponse({
        success: false,
        error: err.message
      });
    }
  }

  // Files: Empty Trash
  async drive_files_emptyTrash(args?: { driveId?: string }) { // driveId is for shared drives
    try {
      // The emptyTrash method in googleapis v3 drive doesn't take driveId directly.
      // It operates on the user's main drive or implicitly on the drive if 'supportsAllDrives' is used elsewhere.
      // For shared drives, trashing individual items is preferred, or managing via Drive UI.
      // If emptying a specific shared drive's trash is needed, it might require a different approach or confirming API capabilities.
      // For now, this implements standard user trash emptying.
      await this.drive.files.emptyTrash({}); // Pass empty object if no params

      return this.formatMCPResponse({
        success: true,
        message: 'Trash emptied successfully'
      });
    } catch (error) {
      const err = error as Error;
      return this.formatMCPResponse({
        success: false,
        error: err.message
      });
    }
  }

  // Files: Export (for Google Docs/Sheets/Slides)
  async drive_files_export(args: {
    fileId: string;
    mimeType: string;
  }) {
    try {
      const response = await this.drive.files.export({
        fileId: args.fileId,
        mimeType: args.mimeType
      }, {
        // Specify responseType based on expected content.
        // 'stream' for binary, 'json' for metadata, 'text' for plain text.
        // For file content, 'arraybuffer' or 'blob' might be used in browser, 'stream' in Node.js
        // The user's example used 'text', which is fine for some exports but might not be universal.
        // For robust binary export, responseType: 'stream' would be better, then pipe to a file or buffer.
        // However, returning raw stream directly in JSON MCP response is tricky.
        // Let's assume for now text-based content or content that can be represented as string.
        responseType: 'text' // Or 'arraybuffer' and then convert to base64 string if binary
      });
      // If response.data is ArrayBuffer, it needs conversion e.g. to base64
      // For now, assuming it's string-compatible as per user example.

      return this.formatMCPResponse({
        content: response.data, // This might be a string or ArrayBuffer
        mimeType: args.mimeType
      });
    } catch (error) {
      const err = error as Error;
      return this.formatMCPResponse({
        success: false,
        error: err.message
      });
    }
  }

  // Files: Download
  async drive_files_download(args: {
    fileId: string;
    // mimeType is not typically used for alt=media for direct download,
    // actual mimeType will be fetched from metadata.
    supportsAllDrives?: boolean;
  }) {
    try {
      // 1. Get file metadata first
      const metadataResponse = await this.drive.files.get({
        fileId: args.fileId,
        fields: 'id, name, mimeType, size, webContentLink, webViewLink',
        supportsAllDrives: args.supportsAllDrives,
      });

      const file = metadataResponse.data;
      // Ensure file.size is treated as a number. The Google API v3 returns size as string.
      const fileSize = Number(file.size);

      // 2. Check if file size exceeds the limit
      if (fileSize > MAX_BASE64_DOWNLOAD_SIZE) {
        return this.formatMCPResponse({
          fileId: file.id!,
          name: file.name!,
          mimeType: file.mimeType!,
          size: fileSize,
          webContentLink: file.webContentLink!,
          webViewLink: file.webViewLink!,
          downloadNote: `File size (${fileSize} bytes) exceeds maximum for direct download via MCP (${MAX_BASE64_DOWNLOAD_SIZE} bytes). Use webContentLink or webViewLink.`,
          content: null, // Explicitly set content to null
        });
      }

      // 3. File is small enough, proceed with base64 download
      const downloadParams: drive_v3.Params$Resource$Files$Get = {
        fileId: args.fileId,
        alt: 'media',
        supportsAllDrives: args.supportsAllDrives,
      };

      const response = await this.drive.files.get(downloadParams, {
        responseType: 'arraybuffer', // Fetch as ArrayBuffer to handle binary data
      });

      const arrayBuffer = response.data as ArrayBuffer;
      const base64content = Buffer.from(arrayBuffer).toString('base64');

      return this.formatMCPResponse({
        fileId: file.id!, // Use ID from metadata
        name: file.name!, // Add name from metadata
        mimeType: file.mimeType!, // Use actual mimeType from metadata
        size: fileSize, // Add size from metadata
        content: base64content,
      });

    } catch (error) {
      const err = error as any; // Using 'any' to access potential Gaxios properties
      let errorMessage = "An unknown error occurred during download.";
      if (err.message) { // Standard error message
        errorMessage = err.message;
      }
      // Check if it's a GaxiosError (from googleapis client) for more specific details
      if (err.name === 'GaxiosError' && err.response?.data?.error?.message) {
          errorMessage = err.response.data.error.message;
      } else if (err.name === 'GaxiosError' && err.message) {
          // Fallback for GaxiosError if nested message isn't present
          errorMessage = err.message;
      }

      return this.formatMCPResponse({
        success: false,
        error: `Failed to download file ${args.fileId}: ${errorMessage}`,
      });
    }
  }

  // Files: Generate IDs
  async drive_files_generateIds(args: {
    count?: number;
    space?: string; // Not a standard parameter for generateIds, but good to be aware of spaces if relevant
    // supportsAllDrives is not directly applicable here as IDs are not drive specific until used.
  }) {
    try {
      const response = await this.drive.files.generateIds({
        count: args.count || 1,
        // space: args.space // 'space' is not a param for generateIds in v3
      });
      return this.formatMCPResponse({
        ids: response.data.ids,
      });
    } catch (error) {
      const err = error as Error;
      return this.formatMCPResponse({
        success: false,
        error: err.message,
      });
    }
  }

  // Files: Watch
  // Note: Watching files involves setting up a notification channel which is an advanced feature.
  // The initial response contains channel details. Actual notifications are sent to a webhook.
  // This MCP method can only initiate the watch and return channel details.
  // Managing the webhook and lifecycle of the channel is outside this simple call.
  async drive_files_watch(args: {
    fileId: string;
    channelId: string; // A unique ID for the channel (UUID recommended)
    address: string; // The HTTPS URL where notifications should be sent
    token?: string; // Optional client token sent with notifications
    expiration?: number; // Optional: Requested time to live for channel in ms
    fields?: string;
    supportsAllDrives?: boolean;
  }) {
    try {
      const requestBody: drive_v3.Schema$Channel = {
        id: args.channelId,
        type: 'web_hook',
        address: args.address,
        token: args.token,
        expiration: args.expiration,
        // params: { ttl: args.expiration ? (args.expiration / 1000).toString() : undefined } // ttl is often set via params
      };

      const response = await this.drive.files.watch({
        fileId: args.fileId,
        requestBody: requestBody,
        fields: args.fields || 'id,resourceId,resourceUri,token,expiration',
        supportsAllDrives: args.supportsAllDrives,
      });

      return this.formatMCPResponse({
        channel: response.data,
      });
    } catch (error) {
      const err = error as Error;
      return this.formatMCPResponse({
        success: false,
        error: `Failed to watch file: ${err.message}`,
      });
    }
  }

  // Files: List Labels
  async drive_files_listLabels(args: {
    fileId: string;
    // supportsAllDrives may or may not be applicable depending on how labels interact with shared drives
  }) {
    try {
      // The response data for listLabels is Schema$LabelList
      // However, the prompt is drive_files_listLabels, suggesting labels *for a specific file*.
      // This is typically part of the file resource metadata itself, not a separate list.
      // If the client library has `this.drive.files.listLabels({ fileId: args.fileId })`, that would be it.
      // It seems `this.drive.files.listLabels` exists in the latest googleapis
      const labelsResponse = await this.drive.files.listLabels({
          fileId: args.fileId,
      });

      return this.formatMCPResponse({
        fileId: args.fileId,
        labels: labelsResponse.data.labels || [], // Schema$LabelList -> labels property
        kind: labelsResponse.data.kind,
      });
    } catch (error) {
      const err = error as Error;
      return this.formatMCPResponse({
        success: false,
        error: `Failed to list labels for file: ${err.message}`,
      });
    }
  }

  // Files: Modify Labels
  async drive_files_modifyLabels(args: {
    fileId: string;
    labelModifications: drive_v3.Schema$ModifyLabelsRequest; // This is the expected request body
    // supportsAllDrives may or may not be applicable
  }) {
    try {
      // The `googleapis` library has `this.drive.files.modifyLabels`
      const response = await this.drive.files.modifyLabels({
        fileId: args.fileId,
        requestBody: args.labelModifications,
      });

      // The response is Schema$ModifyLabelsResponse which contains the modified labels
      return this.formatMCPResponse({
        fileId: args.fileId,
        modifiedLabels: response.data.modifiedLabels || [],
        kind: response.data.kind,
      });
    } catch (error) {
      const err = error as Error;
      return this.formatMCPResponse({
        success: false,
        error: `Failed to modify labels for file: ${err.message}`,
      });
    }
  }

  // About: Get Drive/User Information
  async drive_get_about(args?: {
    fields?: string;
  }) {
    try {
      const response = await this.drive.about.get({
        fields: args?.fields || 'user,storageQuota,maxImportSizes,maxUploadSize,appInstalled,teamDriveThemes,driveThemes', // Common useful fields
      });
      return this.formatMCPResponse({
        about: response.data,
      });
    } catch (error) {
      const err = error as Error;
      return this.formatMCPResponse({
        success: false,
        error: `Failed to get Drive about information: ${err.message}`,
      });
    }
  }
}
