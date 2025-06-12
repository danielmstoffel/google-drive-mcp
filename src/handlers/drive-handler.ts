import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import {
  DriveCommentsCreateArgs, DriveCommentsDeleteArgs, DriveCommentsGetArgs, DriveCommentsListArgs, DriveCommentsUpdateArgs,
  DriveRepliesCreateArgs, DriveRepliesDeleteArgs, DriveRepliesGetArgs, DriveRepliesListArgs, DriveRepliesUpdateArgs,
  DriveRevisionsDeleteArgs, DriveRevisionsGetArgs, DriveRevisionsListArgs, DriveRevisionsUpdateArgs
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
    // If data contains an error property, success should be false.
    if (data && data.error) {
      return {
        success: false,
        ...data
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
      return this.formatMCPResponse({ error: error.message || 'An unknown error occurred' });
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
      return this.formatMCPResponse({ error: error.message || 'Failed to delete revision' });
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
      return this.formatMCPResponse({ error: error.message || 'Failed to get revision' });
    }
  }

  async drive_revisions_list(args: DriveRevisionsListArgs) {
    try {
      const response = await this.drive.revisions.list({
        fileId: args.fileId,
        pageSize: args.pageSize,
        pageToken: args.pageToken,
        fields: args.fields || 'revisions,nextPageToken',
      });
      return this.formatMCPResponse({
        revisions: response.data.revisions,
        nextPageToken: response.data.nextPageToken,
      });
    } catch (error: any) {
      return this.formatMCPResponse({ error: error.message || 'Failed to list revisions' });
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
      return this.formatMCPResponse({ error: error.message || 'Failed to update revision' });
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
      return this.formatMCPResponse({ error: error.message || 'Failed to create reply' });
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
      return this.formatMCPResponse({ error: error.message || 'Failed to delete reply' });
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
      return this.formatMCPResponse({ error: error.message || 'Failed to get reply' });
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
        fields: args.fields || 'replies,nextPageToken',
      });
      return this.formatMCPResponse({
        replies: response.data.replies,
        nextPageToken: response.data.nextPageToken,
      });
    } catch (error: any) {
      return this.formatMCPResponse({ error: error.message || 'Failed to list replies' });
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
      return this.formatMCPResponse({ error: error.message || 'Failed to update reply' });
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
      return this.formatMCPResponse({ error: error.message || 'Failed to create comment' });
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
      return this.formatMCPResponse({ error: error.message || 'Failed to delete comment' });
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
      return this.formatMCPResponse({ error: error.message || 'Failed to get comment' });
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
        fields: args.fields || 'comments,nextPageToken', // Standard fields for a list
      });
      return this.formatMCPResponse({
        comments: response.data.comments,
        nextPageToken: response.data.nextPageToken,
      });
    } catch (error: any) {
      return this.formatMCPResponse({ error: error.message || 'Failed to list comments' });
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
      return this.formatMCPResponse({ error: error.message || 'Failed to update comment' });
    }
  }

  async drive_about_get(args?: { fields?: string }) {
    try {
      const response = await this.drive.about.get({
        fields: args?.fields || 'user,storageQuota,maxImportSizes,maxUploadSize,appInstalled,folderColorPalette'
      });
      return this.formatMCPResponse({ about: response.data });
    } catch (error: any) {
      return this.formatMCPResponse({ error: error.message || 'An unknown error occurred' });
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
      return this.formatMCPResponse({ error: error.message || 'An unknown error occurred' });
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
      return this.formatMCPResponse({ error: error.message || 'An unknown error occurred' });
    }
  }

  // Add your Additional API methods here following this pattern:
  // async drive_comments_list(args: any) { ... }
  // async drive_comments_get(args: any) { ... }
  // etc.
}
