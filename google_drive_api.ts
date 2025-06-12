import * as fs from 'fs/promises';
import * as path from 'path';
import * as process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google, Auth, drive_v3 } from 'googleapis';

// --- MCP Response and Error Structure ---
interface MCPResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: any; // For richer error information from API
}

// --- Google Drive Permission Structure ---
type DrivePermissionRole = 'owner' | 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader';
type DrivePermissionType = 'user' | 'group' | 'domain' | 'anyone';

interface DrivePermission {
  id: string;
  type: DrivePermissionType;
  role: DrivePermissionRole;
  emailAddress?: string;
  domain?: string; // For domain type permissions
  displayName?: string;
  photoLink?: string;
  deleted?: boolean;
  pendingOwner?: boolean;
}

// --- Argument Interfaces for API Methods ---
interface DrivePermissionsListArgs {
  fileId: string;
  pageSize?: number;
  pageToken?: string;
  supportsAllDrives?: boolean;
  includePermissionsForView?: string;
}

interface DrivePermissionsGetArgs {
  fileId: string;
  permissionId: string;
  supportsAllDrives?: boolean;
}

interface DrivePermissionsCreateArgs {
  fileId: string;
  type: DrivePermissionType;
  role: DrivePermissionRole;
  emailAddress?: string;
  domain?: string; // Required if type is 'domain'
  sendNotificationEmail?: boolean;
  emailMessage?: string;
  transferOwnership?: boolean; // Usually false for create, true for specific updates
  moveToNewOwnersRoot?: boolean;
  supportsAllDrives?: boolean;
}

// Interface for the requestBody of create method, derived from DrivePermission
type DrivePermissionsCreateRequestBody = Pick<DrivePermission, 'type' | 'role' | 'emailAddress' | 'domain'>;


interface DrivePermissionsUpdateArgs {
  fileId: string;
  permissionId: string;
  role: DrivePermissionRole;
  supportsAllDrives?: boolean;
  transferOwnership?: boolean;
  moveToNewOwnersRoot?: boolean;
}

// Interface for the requestBody of update method
type DrivePermissionsUpdateRequestBody = Pick<DrivePermission, 'role'>;


interface DrivePermissionsDeleteArgs {
  fileId: string;
  permissionId: string;
  supportsAllDrives?: boolean;
  enforceExpansiveAccess?: boolean;
}

// --- Response Data Types ---
type DrivePermissionListResponseData = {
    nextPageToken?: string | null; // from Google API
    permissions: DrivePermission[];
};
type DrivePermissionDeleteResponseData = {
  status: 'deleted';
  fileId: string;
  permissionId: string;
};


// --- SCOPES ---
const SCOPES = [
  'https://www.googleapis.com/auth/drive', // Full access
];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

class GoogleDriveAPI {
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

  public static async authorize(): Promise<GoogleDriveAPI> {
    let client = await this.loadSavedCredentialsIfExist();
    if (client) {
      return new GoogleDriveAPI(client);
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await this.saveCredentials(client);
    }
    return new GoogleDriveAPI(client as Auth.OAuth2Client);
  }

  // Updated formatMCPResponse
  private formatMCPResponse<T_Data, T_Raw = any>(
    rawResponseData: T_Raw | null,
    transform?: (raw: T_Raw) => T_Data
  ): MCPResponse<T_Data> {
    // Check for explicit error structure from Google API (this can vary)
    // This is a generic check; specific error handling might be needed per API call
    if (rawResponseData && typeof rawResponseData === 'object') {
        const rawAsAny = rawResponseData as any;
        if (rawAsAny.error) {
            return {
                success: false,
                error: rawAsAny.error.message || 'Unknown Google Drive API error',
                errorDetails: rawAsAny.error.errors || rawAsAny.error,
            };
        }
        // GaxiosError structure
        if (rawAsAny.isGaxiosError && rawAsAny.response?.data?.error) {
             const errorData = rawAsAny.response.data.error;
             return {
                success: false,
                error: errorData.message || 'Unknown Google Drive API error via Gaxios',
                errorDetails: errorData.errors || errorData,
             };
        }
    }

    if (transform) {
        try {
            const data = transform(rawResponseData as T_Raw);
            return { success: true, data };
        } catch (e: any) {
            return { success: false, error: "Failed to transform response data.", errorDetails: e.message };
        }
    }

    // If no transformation, assume rawResponseData is T_Data or compatible
    // This branch handles cases like delete where the raw data is simple { status: 'deleted' ... }
    // or cases where the raw data from Drive API is already in the desired T_Data format.
    return { success: true, data: rawResponseData as unknown as T_Data };
  }


  async listFiles(): Promise<void> { // Keeping listFiles simple for now, not using MCPResponse
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

  async drive_permissions_list(args: DrivePermissionsListArgs): Promise<MCPResponse<DrivePermissionListResponseData>> {
    try {
      const response = await this.drive.permissions.list({
        fileId: args.fileId,
        pageSize: args.pageSize,
        pageToken: args.pageToken,
        supportsAllDrives: args.supportsAllDrives,
        includePermissionsForView: args.includePermissionsForView,
        fields: 'nextPageToken, permissions(id,type,role,emailAddress,domain,displayName,photoLink,deleted,pendingOwner)',
      });
      // response.data directly matches DrivePermissionListResponseData if fields are correct
      return this.formatMCPResponse(response.data as any, (data) => data as DrivePermissionListResponseData);
    } catch (error: any) {
      return this.formatMCPResponse(error, () => undefined as any); // Let formatMCPResponse handle error object
    }
  }

  async drive_permissions_get(args: DrivePermissionsGetArgs): Promise<MCPResponse<DrivePermission>> {
    try {
      const response = await this.drive.permissions.get({
        fileId: args.fileId,
        permissionId: args.permissionId,
        supportsAllDrives: args.supportsAllDrives,
        fields: 'id,type,role,emailAddress,domain,displayName,photoLink,deleted,pendingOwner',
      });
      return this.formatMCPResponse(response.data as DrivePermission);
    } catch (error: any) {
      return this.formatMCPResponse(error, () => undefined as any);
    }
  }

  async drive_permissions_update(args: DrivePermissionsUpdateArgs): Promise<MCPResponse<DrivePermission>> {
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
      return this.formatMCPResponse(response.data as DrivePermission);
    } catch (error: any) {
      return this.formatMCPResponse(error, () => undefined as any);
    }
  }

  async drive_permissions_create(args: DrivePermissionsCreateArgs): Promise<MCPResponse<DrivePermission>> {
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
      return this.formatMCPResponse(response.data as DrivePermission);
    } catch (error: any) {
      return this.formatMCPResponse(error, () => undefined as any);
    }
  }

  async drive_permissions_delete(args: DrivePermissionsDeleteArgs): Promise<MCPResponse<DrivePermissionDeleteResponseData>> {
    try {
      const deleteParams: Partial<drive_v3.Params$Resource$Permissions$Delete> = { // Use Partial for conditional params
        fileId: args.fileId,
        permissionId: args.permissionId,
        supportsAllDrives: args.supportsAllDrives,
      };
      if (args.enforceExpansiveAccess) {
        (deleteParams as any).enforceExpansiveAccess = args.enforceExpansiveAccess;
      }
      await this.drive.permissions.delete(deleteParams as drive_v3.Params$Resource$Permissions$Delete);
      return this.formatMCPResponse<DrivePermissionDeleteResponseData>(
        { status: 'deleted', fileId: args.fileId, permissionId: args.permissionId }
      );
    } catch (error: any) {
      return this.formatMCPResponse(error, () => undefined as any);
    }
  }
}

// Main execution
async function main() {
  try {
    const googleDriveAPI = await GoogleDriveAPI.authorize();
    await googleDriveAPI.listFiles(); // Keep this simple for now

    // Example usage of drive_permissions_list
    const listArgs: DrivePermissionsListArgs = { fileId: "some-file-id-from-listFiles" };
    const permissionsResponse = await googleDriveAPI.drive_permissions_list(listArgs);
    if (permissionsResponse.success && permissionsResponse.data) {
      console.log('Permissions List:', JSON.stringify(permissionsResponse.data.permissions, null, 2));
      if(permissionsResponse.data.permissions.length > 0) {
        const firstPermissionId = permissionsResponse.data.permissions[0].id;

        // Example for get
        const getArgs: DrivePermissionsGetArgs = { fileId: listArgs.fileId, permissionId: firstPermissionId};
        const permissionDetails = await googleDriveAPI.drive_permissions_get(getArgs);
        console.log('Permission Get:', JSON.stringify(permissionDetails, null, 2));

        // Example for update
        const updateArgs: DrivePermissionsUpdateArgs = { fileId: listArgs.fileId, permissionId: firstPermissionId, role: 'commenter'};
        const updatedPermission = await googleDriveAPI.drive_permissions_update(updateArgs);
        console.log('Permission Update:', JSON.stringify(updatedPermission, null, 2));

        // Example for delete (use with caution)
        /*
        const deleteArgs: DrivePermissionsDeleteArgs = { fileId: listArgs.fileId, permissionId: firstPermissionId};
        const deleteStatus = await googleDriveAPI.drive_permissions_delete(deleteArgs);
        console.log('Permission Delete Status:', JSON.stringify(deleteStatus, null, 2));
        */
      }
    } else {
      console.error('Error listing permissions:', permissionsResponse.error, permissionsResponse.errorDetails);
    }

    // Example for create
    const createArgs: DrivePermissionsCreateArgs = {
        fileId: listArgs.fileId, // use a fileId from previous operations
        type: 'user',
        role: 'reader',
        emailAddress: 'testuser@example.com', // Replace with a valid email if testing live
        sendNotificationEmail: false
    };
    const createdPermission = await googleDriveAPI.drive_permissions_create(createArgs);
    console.log('Permission Create:', JSON.stringify(createdPermission, null, 2));
    if (createdPermission.success && createdPermission.data) {
        // you could then delete this created permission for cleanup if testing live
        const newPermissionId = createdPermission.data.id;
        console.log(`Created permission ID: ${newPermissionId}. Consider deleting it if this is a live test.`);
        // const deleteArgs: DrivePermissionsDeleteArgs = { fileId: listArgs.fileId, permissionId: newPermissionId};
        // await googleDriveAPI.drive_permissions_delete(deleteArgs);
        // console.log(`Attempted to delete newly created permission ${newPermissionId}`);
    }


  } catch (error: any) { // Catching error in main
    console.error('Error during execution:', error.message || error);
    if(error.response?.data?.error) { // Log detailed Google API error if available
        console.error('Google API Error Details:', JSON.stringify(error.response.data.error, null, 2));
    }
  }
}

main();
