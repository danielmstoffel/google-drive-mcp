import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleDriveHandler {
  private auth: OAuth2Client;
  private drive: any;

  constructor() {
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

  private formatMCPResponse(data: any, error?: any) {
    if (error) {
      return {
        success: false,
        error: error.message || error
      };
    }
    return {
      success: true,
      ...data
    };
  }

  async drive_changes_getStartPageToken(args?: { supportsAllDrives?: boolean; includeItemsFromAllDrives?: boolean }) {
    try {
      const response = await this.drive.changes.getStartPageToken({
        supportsAllDrives: args?.supportsAllDrives,
        includeItemsFromAllDrives: args?.includeItemsFromAllDrives,
      });
      return this.formatMCPResponse({ startPageToken: response.data.startPageToken });
    } catch (error: any) {
      return this.formatMCPResponse(null, error);
    }
  }

  async drive_about_get(args?: { fields?: string }) {
    try {
      const response = await this.drive.about.get({
        fields: args?.fields || 'user,storageQuota,maxImportSizes,maxUploadSize,appInstalled,folderColorPalette'
      });
      return this.formatMCPResponse({ about: response.data });
    } catch (error: any) {
      return this.formatMCPResponse(null, error);
    }
  }

  async drive_changes_list(args: {
    pageToken: string;
    pageSize?: number;
    restrictToMyDrive?: boolean;
    spaces?: string;
    supportsAllDrives?: boolean;
    includeItemsFromAllDrives?: boolean;
    includeCorpusRemovals?: boolean; // As per Google API docs, though not in original issue
    includeRemoved?: boolean; // As per Google API docs, default true
    fields?: string; // To fetch specific fields
  }) {
    try {
      const response = await this.drive.changes.list({
        pageToken: args.pageToken,
        pageSize: args.pageSize,
        restrictToMyDrive: args.restrictToMyDrive,
        spaces: args.spaces,
        supportsAllDrives: args.supportsAllDrives,
        includeItemsFromAllDrives: args.includeItemsFromAllDrives,
        includeCorpusRemovals: args.includeCorpusRemovals,
        includeRemoved: args.includeRemoved === undefined ? true : args.includeRemoved,
        fields: args.fields || '*', // Default to all fields if not specified
      });
      return this.formatMCPResponse({
        changes: response.data.changes,
        nextPageToken: response.data.nextPageToken,
        newStartPageToken: response.data.newStartPageToken,
      });
    } catch (error: any) {
      return this.formatMCPResponse(null, error);
    }
  }

  async drive_changes_watch(args: {
    pageToken: string;
    requestBody: { // Based on googleapis Drive v3 types
      id: string; // A UUID or similar unique string that identifies this channel.
      type: string; // The type of delivery mechanism used for this channel. (e.g., "web_hook")
      address: string; // The address where notifications are to be delivered.
      token?: string; // An arbitrary string delivered to the target address with each notification delivered over this channel. Optional.
      expiration?: string; // Date and time of notification channel expiration, expressed as a Unix timestamp, in milliseconds. Optional.
      params?: { [key: string]: string }; // Additional parameters controlling delivery channel behavior. Optional.
      payload?: boolean; // A Boolean value to indicate whether payload is wanted. Optional.
      resourceId?: string; // An opaque ID that identifies the resource being watched on this channel. Stable across different API versions.
      resourceUri?: string; // A version-specific identifier for the watched resource.
    };
    supportsAllDrives?: boolean;
    includeItemsFromAllDrives?: boolean;
  }) {
    try {
      // Ensure requestBody is not undefined
      if (!args.requestBody) {
        throw new Error("requestBody is required for drive_changes_watch");
      }
      const response = await this.drive.changes.watch({
        pageToken: args.pageToken,
        requestBody: args.requestBody,
        supportsAllDrives: args.supportsAllDrives,
        includeItemsFromAllDrives: args.includeItemsFromAllDrives,
      });
      return this.formatMCPResponse({ channel: response.data });
    } catch (error: any) {
      return this.formatMCPResponse(null, error);
    }
  }

  // Add your Additional API methods here following this pattern:
  // async drive_comments_list(args: any) { ... }
  // async drive_comments_get(args: any) { ... }
  // etc.
}
