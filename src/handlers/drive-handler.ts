import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import {
  DriveChangesGetStartPageTokenArgs, DriveChangesListArgs, DriveChangesWatchArgs,
  DriveAboutGetArgs,
  DriveCommentsCreateArgs, DriveCommentsDeleteArgs, DriveCommentsGetArgs, DriveCommentsListArgs, DriveCommentsUpdateArgs,
  DriveRepliesCreateArgs, DriveRepliesDeleteArgs, DriveRepliesGetArgs, DriveRepliesListArgs, DriveRepliesUpdateArgs,
  DriveRevisionsDeleteArgs, DriveRevisionsGetArgs, DriveRevisionsListArgs, DriveRevisionsUpdateArgs,
  DriveAppsListArgs, DriveAppsGetArgs
} from '../types/drive-types';

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

  private formatMCPResponse(data: any) {
    return {
      success: true,
      ...data
    };
  }

  private handleError(error: any): never { // 'never' indicates this function always throws
    console.error('GoogleDriveHandler Error:', error); // Log the original error for server-side debugging

    let errorMessage = 'An unknown Google Drive API error occurred.';
    let statusCode = 500;

    if (error.response && error.response.data && error.response.data.error) {
      // Error from Google API response
      errorMessage = error.response.data.error.message || errorMessage;
      if (error.response.data.error.code) {
        statusCode = error.response.data.error.code;
      }
    } else if (error.message) {
      // Generic JavaScript error
      errorMessage = error.message;
    }

    // Construct a new error object to throw
    const customError: any = new Error(errorMessage);
    customError.statusCode = statusCode; // Attach statusCode if available
    customError.originalError = error; // Attach original error for more context if needed
    throw customError;
  }

  async drive_changes_getStartPageToken(args: DriveChangesGetStartPageTokenArgs) {
    try {
      const response = await this.drive.changes.getStartPageToken({
        supportsAllDrives: args.supportsAllDrives,
        includeItemsFromAllDrives: args.includeItemsFromAllDrives,
      });
      // Assuming DriveStartPageToken is a defined type for the response data
      return this.formatMCPResponse(response.data as any);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_apps_list(args: DriveAppsListArgs) { // Optional args based on Google API
    try {
      const response = await this.drive.apps.list({
        languageCode: args?.languageCode,
        appFilterExtensions: args?.appFilterExtensions,
        appFilterMimeTypes: args?.appFilterMimeTypes,
        fields: args?.fields || 'items(*),defaultAppIds', // Example default fields
      });
      return this.formatMCPResponse({
        items: response.data.items || [],
        defaultAppIds: response.data.defaultAppIds || [],
      });
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_apps_get(args: DriveAppsGetArgs) {
    try {
      const response = await this.drive.apps.get({
        appId: args.appId,
        fields: args.fields || '*',
      });
      return this.formatMCPResponse({ app: response.data });
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_changes_list(args: DriveChangesListArgs) {
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
        fields: args.fields || 'changes(*),nextPageToken,newStartPageToken',
      });
      return this.formatMCPResponse({
        changes: response.data.changes || [],
        newStartPageToken: response.data.newStartPageToken,
        nextPageToken: response.data.nextPageToken,
        kind: response.data.kind,
      } as any); // Cast to any to match DriveChangeList if it includes 'kind'
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_changes_watch(args: DriveChangesWatchArgs) {
    try {
      if (!args.requestBody) {
        throw new Error("requestBody is required for drive_changes_watch");
      }
      const response = await this.drive.changes.watch({
        pageToken: args.pageToken,
        requestBody: args.requestBody,
        supportsAllDrives: args.supportsAllDrives,
        includeItemsFromAllDrives: args.includeItemsFromAllDrives,
      });
      return this.formatMCPResponse(response.data as any); // Assuming DriveChannel for response.data
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_about_get(args: DriveAboutGetArgs) {
    try {
      const response = await this.drive.about.get({
        fields: args.fields || 'user,storageQuota,maxImportSizes,maxUploadSize,appInstalled,folderColorPalette'
      });
      return this.formatMCPResponse(response.data as any); // Assuming DriveAbout for response.data
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_comments_create(args: DriveCommentsCreateArgs) {
    try {
      const response = await this.drive.comments.create({
        fileId: args.fileId,
        requestBody: {
          content: args.content,
          quotedFileContent: args.quotedFileContent,
          quotedAppContext: args.quotedAppContext,
        },
        fields: args.fields || '*', // Default to all fields
      });
      return this.formatMCPResponse({ comment: response.data });
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_comments_delete(args: DriveCommentsDeleteArgs) {
    try {
      await this.drive.comments.delete({
        fileId: args.fileId,
        commentId: args.commentId,
      });
      // Delete operation does not return content, so we return a success message or an empty object.
      return this.formatMCPResponse({ message: 'Comment deleted successfully' });
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_comments_get(args: DriveCommentsGetArgs) {
    try {
      const response = await this.drive.comments.get({
        fileId: args.fileId,
        commentId: args.commentId,
        includeDeleted: args.includeDeleted,
        fields: args.fields || '*',
      });
      return this.formatMCPResponse({ comment: response.data });
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_comments_list(args: DriveCommentsListArgs) {
    try {
      const response = await this.drive.comments.list({
        fileId: args.fileId,
        pageSize: args.pageSize,
        pageToken: args.pageToken,
        startModifiedTime: args.startModifiedTime,
        includeDeleted: args.includeDeleted,
        fields: args.fields || 'comments(*),nextPageToken', // Updated fields
      });
      return this.formatMCPResponse({
        comments: response.data.comments || [], // Handle cases where comments might be undefined
        nextPageToken: response.data.nextPageToken,
        kind: response.data.kind,
      } as any);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_comments_update(args: DriveCommentsUpdateArgs) {
    try {
      const response = await this.drive.comments.update({
        fileId: args.fileId,
        commentId: args.commentId,
        requestBody: {
          content: args.content,
          quotedFileContent: args.quotedFileContent, // Docs say only content, but API might allow updating quote context
          quotedAppContext: args.quotedAppContext,
        },
        fields: args.fields || '*',
      });
      return this.formatMCPResponse({ comment: response.data });
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_replies_create(args: DriveRepliesCreateArgs) {
    try {
      const response = await this.drive.replies.create({
        fileId: args.fileId,
        commentId: args.commentId,
        requestBody: {
          content: args.content,
        },
        fields: args.fields || '*',
      });
      return this.formatMCPResponse({ reply: response.data });
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_replies_delete(args: DriveRepliesDeleteArgs) {
    try {
      await this.drive.replies.delete({
        fileId: args.fileId,
        commentId: args.commentId,
        replyId: args.replyId,
      });
      return this.formatMCPResponse({ message: 'Reply deleted successfully' });
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_replies_get(args: DriveRepliesGetArgs) {
    try {
      const response = await this.drive.replies.get({
        fileId: args.fileId,
        commentId: args.commentId,
        replyId: args.replyId,
        includeDeleted: args.includeDeleted,
        fields: args.fields || '*',
      });
      return this.formatMCPResponse({ reply: response.data });
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_replies_list(args: DriveRepliesListArgs) {
    try {
      const response = await this.drive.replies.list({
        fileId: args.fileId,
        commentId: args.commentId,
        pageSize: args.pageSize,
        pageToken: args.pageToken,
        includeDeleted: args.includeDeleted,
        fields: args.fields || 'replies(*),nextPageToken',
      });
      return this.formatMCPResponse({
        replies: response.data.replies || [],
        nextPageToken: response.data.nextPageToken,
        kind: response.data.kind,
      } as any);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_replies_update(args: DriveRepliesUpdateArgs) {
    try {
      const response = await this.drive.replies.update({
        fileId: args.fileId,
        commentId: args.commentId,
        replyId: args.replyId,
        requestBody: {
          content: args.content,
        },
        fields: args.fields || '*',
      });
      return this.formatMCPResponse({ reply: response.data });
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_revisions_delete(args: DriveRevisionsDeleteArgs) {
    try {
      await this.drive.revisions.delete({
        fileId: args.fileId,
        revisionId: args.revisionId,
      });
      return this.formatMCPResponse({ message: 'Revision deleted successfully' });
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_revisions_get(args: DriveRevisionsGetArgs) {
    try {
      const response = await this.drive.revisions.get({
        fileId: args.fileId,
        revisionId: args.revisionId,
        fields: args.fields || '*',
      });
      return this.formatMCPResponse({ revision: response.data });
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_revisions_list(args: DriveRevisionsListArgs) {
    try {
      const response = await this.drive.revisions.list({
        fileId: args.fileId,
        pageSize: args.pageSize,
        pageToken: args.pageToken,
        fields: args.fields || 'revisions(*),nextPageToken',
      });
      return this.formatMCPResponse({
        revisions: response.data.revisions || [],
        nextPageToken: response.data.nextPageToken,
        kind: response.data.kind,
      } as any);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async drive_revisions_update(args: DriveRevisionsUpdateArgs) {
    try {
      const { fileId, revisionId, fields, ...requestBody } = args;
      const response = await this.drive.revisions.update({
        fileId,
        revisionId,
        requestBody,
        fields: fields || '*',
      });
      return this.formatMCPResponse({ revision: response.data });
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // Add your Additional API methods here following this pattern:
  // async drive_comments_list(args: any) { ... }
  // async drive_comments_get(args: any) { ... }
  // etc.
}
