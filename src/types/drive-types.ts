// Add TypeScript interfaces for Comments, Replies, Revisions, etc.
import { drive_v3 } from 'googleapis'; // Import Google Drive types

// Generic MCP Response Wrapper
export interface McpResponse<T> {
  success: boolean;
  error?: string;
  [key: string]: any; // To allow for additional data like 'comment', 'comments', 'nextPageToken'
}

// --- Changes API Argument Interfaces ---
export interface DriveChangesGetStartPageTokenArgs {
  supportsAllDrives?: boolean;
  includeItemsFromAllDrives?: boolean;
}

export interface DriveChangesListArgs {
  pageToken: string;
  pageSize?: number;
  restrictToMyDrive?: boolean;
  spaces?: string;
  supportsAllDrives?: boolean;
  includeItemsFromAllDrives?: boolean;
  includeCorpusRemovals?: boolean;
  includeRemoved?: boolean;
  fields?: string;
}

export interface DriveChangesWatchArgs {
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
}

// --- Changes API Response Data Interfaces ---
export interface DriveChangeList {
  changes?: drive_v3.Schema$Change[];
  newStartPageToken?: string | null;
  nextPageToken?: string | null;
  kind?: string; // Typically "drive#changeList"
}

export interface DriveStartPageToken {
  startPageToken?: string | null;
  kind?: string; // Typically "drive#startPageToken"
}

// DriveChannel can directly use drive_v3.Schema$Channel if no transformation is needed for MCP
export interface DriveChannel extends drive_v3.Schema$Channel {}


// --- About API Argument Interface ---
export interface DriveAboutGetArgs {
  fields?: string;
}

// --- About API Response Data Interface ---
// DriveAbout can directly use drive_v3.Schema$About if no transformation is needed for MCP
export interface DriveAbout extends drive_v3.Schema$About {}


// --- Comments API Argument Interfaces ---

export interface DriveCommentsCreateArgs {
  fileId: string;
  content: string;
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
export interface DriveComment extends drive_v3.Schema$Comment {}

export interface DriveCommentList {
  comments?: DriveComment[];
  nextPageToken?: string | null;
  kind?: string; // Typically "drive#commentList"
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
  kind?: string; // Typically "drive#replyList"
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
  kind?: string; // Typically "drive#revisionList"
}

// --- Apps API Argument Interfaces ---

export interface DriveAppsListArgs {
  languageCode?: string;
  appFilterExtensions?: string;
  appFilterMimeTypes?: string;
  fields?: string;
}

export interface DriveAppsGetArgs {
  appId: string;
  fields?: string;
}

// --- Apps API Response Data Interfaces ---

export interface DriveApp extends drive_v3.Schema$App {}

export interface DriveAppList {
  items?: DriveApp[];
  defaultAppIds?: string[];
  // kind?: string; // Consider for consistency if Google API includes it for apps.list
}
