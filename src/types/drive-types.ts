// src/types/drive-types.ts

/**
 * Placeholder for Google Drive API specific types.
 * As the connector develops, more specific types for files, folders, permissions, etc.,
 * will be added here.
 */

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string | null;
  [key: string]: any; // Allow other properties from the API
}

export interface DriveFolder {
  id: string;
  name: string;
  [key: string]: any; // Allow other properties from the API
}

// Example of a more specific type that might be used by a tool
export interface ListFilesParams {
  pageSize?: number;
  pageToken?: string;
  query?: string; // q parameter for search
  fields?: string; // fields to include in the response
}
