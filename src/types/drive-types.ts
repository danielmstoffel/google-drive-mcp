// --- MCP Response and Error Structure ---
export interface MCPResponse<T> {
  success: boolean;
  data?: T; // For successful responses, data is directly under data field
  error?: string; // For error responses
  errorDetails?: any; // For richer error information from API
}

// --- Google Drive Permission Structure ---
export type DrivePermissionRole = 'owner' | 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader';
export type DrivePermissionType = 'user' | 'group' | 'domain' | 'anyone';

export interface DrivePermission {
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
export interface DrivePermissionsListArgs {
  fileId: string;
  pageSize?: number;
  pageToken?: string;
  supportsAllDrives?: boolean;
  includePermissionsForView?: string;
}

export interface DrivePermissionsGetArgs {
  fileId: string;
  permissionId: string;
  supportsAllDrives?: boolean;
}

export interface DrivePermissionsCreateArgs {
  fileId: string;
  type: DrivePermissionType;
  role: DrivePermissionRole;
  emailAddress?: string;
  domain?: string; // Required if type is 'domain'
  sendNotificationEmail?: boolean;
  emailMessage?: string;
  transferOwnership?: boolean;
  moveToNewOwnersRoot?: boolean;
  supportsAllDrives?: boolean;
}

export type DrivePermissionsCreateRequestBody = Pick<DrivePermission, 'type' | 'role' | 'emailAddress' | 'domain'>;

export interface DrivePermissionsUpdateArgs {
  fileId: string;
  permissionId: string;
  role: DrivePermissionRole;
  supportsAllDrives?: boolean;
  transferOwnership?: boolean;
  moveToNewOwnersRoot?: boolean;
}

export type DrivePermissionsUpdateRequestBody = Pick<DrivePermission, 'role'>;

export interface DrivePermissionsDeleteArgs {
  fileId: string;
  permissionId: string;
  supportsAllDrives?: boolean;
  enforceExpansiveAccess?: boolean;
}

// --- Response Data Types ---
// Note: With the new formatMCPResponse, the 'data' field in MCPResponse<T> will directly contain these.
export type DrivePermissionListResponseData = {
    nextPageToken?: string | null;
    permissions: DrivePermission[];
};

export type DrivePermissionDeleteSuccessData = {
  status: 'deleted';
  fileId: string;
  permissionId: string;
};
