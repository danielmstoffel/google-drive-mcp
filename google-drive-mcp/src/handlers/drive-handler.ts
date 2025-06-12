import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleDriveHandler {
  private drive: any;
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  private formatMCPResponse(data: any) {
    return {
      success: true,
      ...data
    };
  }

  // Shared Drives methods will go here
  // Example structure for drives_create:
  async drives_list(args: {
    pageSize?: number;
    pageToken?: string;
    q?: string;
    useDomainAdminAccess?: boolean;
  }) {
    try {
      const response = await this.drive.drives.list({
        pageSize: args.pageSize || 10,
        pageToken: args.pageToken,
        q: args.q,
        useDomainAdminAccess: args.useDomainAdminAccess,
        fields: `nextPageToken, drives(id,name,themeId,colorRgb,backgroundImageFile,backgroundImageLink,capabilities,createdTime,hidden,restrictions)`
      });
      return this.formatMCPResponse({
        drives: response.data.drives,
        nextPageToken: response.data.nextPageToken
      });
    } catch (error) {
      return this.formatMCPResponse({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async drives_get(args: {
    driveId: string;
    useDomainAdminAccess?: boolean;
  }) {
    try {
      const response = await this.drive.drives.get({
        driveId: args.driveId,
        useDomainAdminAccess: args.useDomainAdminAccess,
        fields: 'id,name,themeId,colorRgb,backgroundImageFile,backgroundImageLink,capabilities,createdTime,hidden,restrictions'
      });
      return this.formatMCPResponse({ drive: response.data });
    } catch (error) {
      return this.formatMCPResponse({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async drives_create(args: {
    requestId: string;
    name: string;
    themeId?: string;
  }) {
    try {
      const response = await this.drive.drives.create({
        requestId: args.requestId,
        requestBody: {
          name: args.name,
          themeId: args.themeId
        },
        fields: 'id,name,themeId,colorRgb,backgroundImageFile,backgroundImageLink,capabilities,createdTime,hidden,restrictions'
      });
      return this.formatMCPResponse({ drive: response.data });
    } catch (error) {
      return this.formatMCPResponse({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async drives_update(args: {
    driveId: string;
    useDomainAdminAccess?: boolean;
    requestBody: {
      name?: string;
      themeId?: string;
      colorRgb?: string;
      backgroundImageFile?: any;
      restrictions?: {
        adminManagedRestrictions?: boolean;
        copyRequiresWriterPermission?: boolean;
        domainUsersOnly?: boolean;
        driveMembersOnly?: boolean;
      };
    };
  }) {
    try {
      const { driveId, useDomainAdminAccess, requestBody } = args;
      const response = await this.drive.drives.update({
        driveId,
        useDomainAdminAccess,
        requestBody,
        fields: 'id,name,themeId,colorRgb,backgroundImageFile,backgroundImageLink,capabilities,createdTime,hidden,restrictions'
      });
      return this.formatMCPResponse({ drive: response.data });
    } catch (error) {
      return this.formatMCPResponse({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async drives_delete(args: {
    driveId: string;
    useDomainAdminAccess?: boolean;
    allowItemDeletion?: boolean;
  }) {
    try {
      // Note: The drives.delete method in the Google Drive API v3
      // returns an empty response (204 No Content) upon success.
      await this.drive.drives.delete({
        driveId: args.driveId,
        useDomainAdminAccess: args.useDomainAdminAccess,
        allowItemDeletion: args.allowItemDeletion
      });
      // Return a success message as there's no data in the response
      return this.formatMCPResponse({ message: `Shared drive ${args.driveId} deleted successfully.` });
    } catch (error) {
      return this.formatMCPResponse({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async drives_hide(args: {
    driveId: string;
  }) {
    try {
      const response = await this.drive.drives.hide({
        driveId: args.driveId,
        fields: 'id,name,themeId,colorRgb,backgroundImageFile,backgroundImageLink,capabilities,createdTime,hidden,restrictions'
      });
      // The drives.hide method returns a Drive resource with hidden=true
      return this.formatMCPResponse({ drive: response.data });
    } catch (error) {
      return this.formatMCPResponse({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async drives_unhide(args: {
    driveId: string;
  }) {
    try {
      const response = await this.drive.drives.unhide({
        driveId: args.driveId,
        fields: 'id,name,themeId,colorRgb,backgroundImageFile,backgroundImageLink,capabilities,createdTime,hidden,restrictions'
      });
      // The drives.unhide method returns a Drive resource with hidden=false
      return this.formatMCPResponse({ drive: response.data });
    } catch (error) {
      return this.formatMCPResponse({
        success: false,
        error: (error as Error).message
      });
    }
  }
}
