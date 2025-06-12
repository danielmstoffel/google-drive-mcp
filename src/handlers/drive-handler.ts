import * as fs from 'fs/promises';
import * as path from 'path';
import * as process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google, Auth, drive_v3 } from 'googleapis';

// Import types from the new types file
import {
  MCPResponse,
  DrivePermissionRole,
  DrivePermissionType,
  DrivePermission,
  DrivePermissionsListArgs,
  DrivePermissionsGetArgs,
  DrivePermissionsCreateArgs,
  DrivePermissionsCreateRequestBody,
  DrivePermissionsUpdateArgs,
  DrivePermissionsUpdateRequestBody,
  DrivePermissionsDeleteArgs,
  DrivePermissionListResponseData,
  DrivePermissionDeleteSuccessData
} from '../types/drive-types';


// --- SCOPES ---
const SCOPES = [
  'https://www.googleapis.com/auth/drive', // Full access
];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

class GoogleDriveHandler { // Renamed class
  public drive: drive_v3.Drive;
  private authClient: Auth.OAuth2Client;

  constructor(authClient: Auth.OAuth2Client) {
    this.authClient = authClient;
    this.drive = google.drive({ version: 'v3', auth: this.authClient });
  }

  private static async loadSavedCredentialsIfExist(): Promise<Auth.OAuth2Client | null> {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content.toString());
      return google.auth.fromJSON(credentials) as Auth.OAuth2Client;
    } catch (err) {
      return null;
    }
  }

  private static async saveCredentials(client: Auth.OAuth2Client): Promise<void> {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content.toString());
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
  }

  public static async authorize(): Promise<GoogleDriveHandler> { // Updated return type
    let client = await this.loadSavedCredentialsIfExist();
    if (client) {
      return new GoogleDriveHandler(client); // Use new class name
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await this.saveCredentials(client);
    }
    return new GoogleDriveHandler(client as Auth.OAuth2Client); // Use new class name
  }

  // New formatMCPResponse method
  private formatMCPResponse<T>(responseData: any): MCPResponse<T> {
    // Check for Google API specific error format within a successful HTTP response
    // This structure can appear if the API call itself was successful (e.g. 200 OK)
    // but the operation within Google Drive failed (e.g. invalid fileId).
    if (responseData && responseData.isGaxiosError && responseData.response?.data?.error) {
        const errorData = responseData.response.data.error;
        return {
            success: false,
            error: errorData.message || 'Google Drive API operation error',
            errorDetails: errorData.errors || errorData,
        };
    }
    // For errors caught by try/catch (e.g. network issues, or non-Gaxios errors)
    if (responseData instanceof Error) {
      return {
        success: false,
        error: responseData.message,
        errorDetails: responseData.stack // Or other properties of Error
      };
    }
    // If responseData itself indicates failure (e.g. from a previous formatMCPResponse call or custom error object)
    if (responseData && responseData.success === false) {
      return responseData;
    }
    // Assuming success, pass data directly
    return {
      success: true,
      data: responseData as T // Spread original data under 'data' field
    };
  }


  async listFiles(): Promise<void> {
    const res = await this.drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
    });
    const files = res.data.files;
    if (!files || files.length === 0) {
      console.log('No files found.');
      return;
    }
    console.log('Files:');
    files.map((file: drive_v3.Schema$File) => {
      console.log(`${file.name} (${file.id})`);
    });
  }

  async permissions_list(args: DrivePermissionsListArgs): Promise<MCPResponse<DrivePermissionListResponseData>> {
    try {
      const response = await this.drive.permissions.list({
        fileId: args.fileId,
        pageSize: args.pageSize,
        pageToken: args.pageToken,
        supportsAllDrives: args.supportsAllDrives,
        includePermissionsForView: args.includePermissionsForView,
        fields: 'nextPageToken, permissions(id,type,role,emailAddress,domain,displayName,photoLink,deleted,pendingOwner)',
      });
      return this.formatMCPResponse<DrivePermissionListResponseData>(response.data);
    } catch (error: any) {
      return this.formatMCPResponse<DrivePermissionListResponseData>(error);
    }
  }

  async permissions_get(args: DrivePermissionsGetArgs): Promise<MCPResponse<DrivePermission>> {
    try {
      const response = await this.drive.permissions.get({
        fileId: args.fileId,
        permissionId: args.permissionId,
        supportsAllDrives: args.supportsAllDrives,
        fields: 'id,type,role,emailAddress,domain,displayName,photoLink,deleted,pendingOwner',
      });
      return this.formatMCPResponse<DrivePermission>(response.data);
    } catch (error: any) {
      return this.formatMCPResponse<DrivePermission>(error);
    }
  }

  async permissions_update(args: DrivePermissionsUpdateArgs): Promise<MCPResponse<DrivePermission>> {
    try {
      const requestBody: DrivePermissionsUpdateRequestBody = { role: args.role };
      const response = await this.drive.permissions.update({
        fileId: args.fileId,
        permissionId: args.permissionId,
        requestBody,
        supportsAllDrives: args.supportsAllDrives,
        transferOwnership: args.transferOwnership,
        moveToNewOwnersRoot: args.moveToNewOwnersRoot,
        fields: 'id,type,role,emailAddress,domain,displayName,photoLink,deleted,pendingOwner',
      });
      return this.formatMCPResponse<DrivePermission>(response.data);
    } catch (error: any) {
      return this.formatMCPResponse<DrivePermission>(error);
    }
  }

  async permissions_create(args: DrivePermissionsCreateArgs): Promise<MCPResponse<DrivePermission>> {
    try {
      const requestBody: DrivePermissionsCreateRequestBody = {
        type: args.type,
        role: args.role,
      };
      if (args.emailAddress) requestBody.emailAddress = args.emailAddress;
      if (args.domain) requestBody.domain = args.domain;

      const response = await this.drive.permissions.create({
        fileId: args.fileId,
        requestBody,
        sendNotificationEmail: args.sendNotificationEmail,
        emailMessage: args.emailMessage,
        transferOwnership: args.transferOwnership,
        moveToNewOwnersRoot: args.moveToNewOwnersRoot,
        supportsAllDrives: args.supportsAllDrives,
        fields: 'id,type,role,emailAddress,domain,displayName,photoLink,deleted,pendingOwner',
      });
      return this.formatMCPResponse<DrivePermission>(response.data);
    } catch (error: any) {
      return this.formatMCPResponse<DrivePermission>(error);
    }
  }

  async permissions_delete(args: DrivePermissionsDeleteArgs): Promise<MCPResponse<DrivePermissionDeleteSuccessData>> {
    try {
      const deleteParams: Partial<drive_v3.Params$Resource$Permissions$Delete> = {
        fileId: args.fileId,
        permissionId: args.permissionId,
        supportsAllDrives: args.supportsAllDrives,
      };
      if (args.enforceExpansiveAccess) {
        (deleteParams as any).enforceExpansiveAccess = args.enforceExpansiveAccess;
      }
      await this.drive.permissions.delete(deleteParams as drive_v3.Params$Resource$Permissions$Delete);
      // For delete, pass the custom success object directly to be wrapped under 'data'
      return this.formatMCPResponse<DrivePermissionDeleteSuccessData>(
        { status: 'deleted', fileId: args.fileId, permissionId: args.permissionId }
      );
    } catch (error: any) {
      return this.formatMCPResponse<DrivePermissionDeleteSuccessData>(error);
    }
  }
}

// Main execution
async function main() {
  try {
    const googleDriveHandler = await GoogleDriveHandler.authorize(); // Updated class name
    await googleDriveHandler.listFiles();

    const listArgs: DrivePermissionsListArgs = { fileId: "some-file-id-from-listFiles" }; // Replace with actual ID
    const permissionsResponse = await googleDriveHandler.permissions_list(listArgs);

    if (permissionsResponse.success && permissionsResponse.data) {
      console.log('Permissions List:', JSON.stringify(permissionsResponse.data.permissions, null, 2));
      if(permissionsResponse.data.permissions.length > 0) {
        const firstPermissionId = permissionsResponse.data.permissions[0].id;

        const getArgs: DrivePermissionsGetArgs = { fileId: listArgs.fileId, permissionId: firstPermissionId};
        const permissionDetails = await googleDriveHandler.permissions_get(getArgs);
        console.log('Permission Get:', JSON.stringify(permissionDetails, null, 2));

        const updateArgs: DrivePermissionsUpdateArgs = { fileId: listArgs.fileId, permissionId: firstPermissionId, role: 'commenter'};
        const updatedPermission = await googleDriveHandler.permissions_update(updateArgs);
        console.log('Permission Update:', JSON.stringify(updatedPermission, null, 2));

        /*
        const deleteArgs: DrivePermissionsDeleteArgs = { fileId: listArgs.fileId, permissionId: firstPermissionId};
        const deleteStatus = await googleDriveHandler.permissions_delete(deleteArgs);
        console.log('Permission Delete Status:', JSON.stringify(deleteStatus, null, 2));
        */
      }
    } else {
      console.error('Error listing permissions:', permissionsResponse.error, permissionsResponse.errorDetails);
    }

    const createArgs: DrivePermissionsCreateArgs = {
        fileId: listArgs.fileId,
        type: 'user',
        role: 'reader',
        emailAddress: 'testuser@example.com',
        sendNotificationEmail: false
    };
    const createdPermission = await googleDriveHandler.permissions_create(createArgs);
    console.log('Permission Create:', JSON.stringify(createdPermission, null, 2));
    if (createdPermission.success && createdPermission.data) {
        const newPermissionId = createdPermission.data.id;
        console.log(`Created permission ID: ${newPermissionId}. Consider deleting it if this is a live test.`);
    }

  } catch (error: any) {
    console.error('Error during execution in main:', error.message || error);
    if(error.errorDetails) { // If it's an MCPResponse error
        console.error('Detailed Error:', JSON.stringify(error.errorDetails, null, 2));
    } else if (error.response?.data?.error) {
        console.error('Google API Error Details:', JSON.stringify(error.response.data.error, null, 2));
    }
  }
}

main();
