// Add TypeScript interfaces for Comments, Replies, Revisions, etc.
import { drive_v3 } from 'googleapis'; // Import Google Drive types

// Generic MCP Response Wrapper
export interface McpResponse<T> {
  success: boolean;
  error?: string;
  [key: string]: any; // To allow for additional data like 'comment', 'comments', 'nextPageToken'
}

// --- Comments API Argument Interfaces ---

export interface DriveCommentsCreateArgs {
  fileId: string;
  content: string;
  // Using 'any' for quotedFileContent and quotedAppContext to avoid strict dependency on specific sub-fields
  // if the user wants to pass what the Google API expects directly.
  // Alternatively, define specific structures if a stricter contract is desired for these complex types.
  quotedFileContent?: any; // drive_v3.Schema$Comment['quotedFileContent']
  quotedAppContext?: any;  // drive_v3.Schema$Comment['quotedAppContext']
  fields?: string;
}

export interface DriveCommentsDeleteArgs {
  fileId: string;
  commentId: string;
}

export interface DriveCommentsGetArgs {
  fileId: string;
  commentId: string;
  includeDeleted?: boolean;
  fields?: string;
}

export interface DriveCommentsListArgs {
  fileId: string;
  pageSize?: number;
  pageToken?: string;
  startModifiedTime?: string; // Date RFC 3339
  includeDeleted?: boolean;
  fields?: string;
}

export interface DriveCommentsUpdateArgs {
  fileId: string;
  commentId: string;
  content: string;
  quotedFileContent?: any; // drive_v3.Schema$Comment['quotedFileContent']
  quotedAppContext?: any;  // drive_v3.Schema$Comment['quotedAppContext']
  fields?: string;
}

// --- Comments API Response Data Interfaces (examples, can be expanded) ---
// These represent the 'data' part of the McpResponse

export interface DriveComment extends drive_v3.Schema$Comment {}

export interface DriveCommentList {
  comments?: DriveComment[];
  nextPageToken?: string | null;
}

// --- Replies API Argument Interfaces ---

export interface DriveRepliesCreateArgs {
  fileId: string;
  commentId: string;
  content: string;
  fields?: string;
}

export interface DriveRepliesDeleteArgs {
  fileId: string;
  commentId: string;
  replyId: string;
}

export interface DriveRepliesGetArgs {
  fileId: string;
  commentId: string;
  replyId: string;
  includeDeleted?: boolean;
  fields?: string;
}

export interface DriveRepliesListArgs {
  fileId: string;
  commentId: string;
  pageSize?: number;
  pageToken?: string;
  includeDeleted?: boolean;
  fields?: string;
}

export interface DriveRepliesUpdateArgs {
  fileId: string;
  commentId: string;
  replyId: string;
  content: string;
  fields?: string;
}

// --- Replies API Response Data Interfaces (examples) ---

export interface DriveReply extends drive_v3.Schema$Reply {}

export interface DriveReplyList {
  replies?: DriveReply[];
  nextPageToken?: string | null;
}

// --- Revisions API Argument Interfaces ---

export interface DriveRevisionsDeleteArgs {
  fileId: string;
  revisionId: string;
}

export interface DriveRevisionsGetArgs {
  fileId: string;
  revisionId: string;
  fields?: string;
}

export interface DriveRevisionsListArgs {
  fileId: string;
  pageSize?: number;
  pageToken?: string;
  fields?: string;
}

export interface DriveRevisionsUpdateArgs {
  fileId: string;
  revisionId: string;
  keepForever?: boolean;
  publishAuto?: boolean;
  published?: boolean;
  publishedOutsideDomain?: boolean;
  fields?: string;
}

// --- Revisions API Response Data Interfaces (examples) ---

export interface DriveRevision extends drive_v3.Schema$Revision {}

export interface DriveRevisionList {
  revisions?: DriveRevision[];
  nextPageToken?: string | null;
}
