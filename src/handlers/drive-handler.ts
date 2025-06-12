// src/handlers/drive-handler.ts

import { google, drive_v3 } from 'googleapis'; // Ensure 'google' is explicitly available
import { OAuth2Client } from 'google-auth-library';
// import { ListFilesParams, DriveFile } from '../types/drive-types'; // Example import

export class DriveHandler {
    private auth: OAuth2Client;
    private drive: drive_v3.Drive;

    constructor() {
        // process.env variables might not be immediately available at construction time
        // if dotenv.config() hasn't run yet globally.
        // However, the issue implies direct use here.
        this.initialize();
    }

    private initialize() { // Changed to synchronous
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI || !process.env.GOOGLE_REFRESH_TOKEN) {
            // Log an error or throw, depending on how critical this is at startup.
            // Throwing an error is safer to prevent the app from running with invalid config.
            throw new Error("Missing Google OAuth2 environment variables for DriveHandler initialization. Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, and GOOGLE_REFRESH_TOKEN are set.");
        }

        this.auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        this.auth.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        // The drive instance is created, token refresh will be attempted by the library on first API call.
        this.drive = google.drive({ version: 'v3', auth: this.auth });
        console.log("DriveHandler initialized with OAuth2 client. Token will be refreshed on first API call if needed.");
    }

    private formatMCPResponse(data: any) {
        return {
            success: true,
            ...data
        };
    }

    // Example tool method - to be expanded
    public async drive_listFiles(args: { pageSize?: number, query?: string, fields?: string }) {
        try {
            const { pageSize = 10, query, fields = 'files(id, name, mimeType, webViewLink)' } = args;

            const params: drive_v3.Params$Resource$Files$List = {
                pageSize,
                q: query,
                fields,
            };

            const response = await this.drive.files.list(params);

            return this.formatMCPResponse({ files: response.data.files });

        } catch (error: any) {
            console.error('Error in drive_listFiles:', error);
            return {
                success: false,
                error: error.message || 'Failed to list files from Google Drive.'
            };
        }
    }

    // Add other drive_ methods here following the pattern
    // e.g., drive_getFile, drive_createFolder, drive_uploadFile etc.

    // Placeholder for a tool that requires authentication
    public async drive_getAbout() {
        try {
            const response = await this.drive.about.get({ fields: 'user, storageQuota' });
            return this.formatMCPResponse(response.data);
        } catch (error: any) {
            console.error('Error in drive_getAbout:', error);
            return {
                success: false,
                error: error.message || 'Failed to get Drive about information.'
            };
        }
    }
}

// Export an instance or a way to get an instance
// Depending on how auth is managed, this might change.
// For now, assuming authClient is set by initializeDriveHandler
// export const getDriveHandler = () => { // This function is no longer needed
//     if (!authClient) {
//         // This is a fallback, ideally authClient is always initialized before getDriveHandler is called.
//         // Or, the constructor of DriveHandler itself should handle auth initialization if appropriate.
//         console.warn("Auth client not initialized for DriveHandler. Operations may fail.");
//         // Depending on strictness, you might throw an error here or attempt a default/guest client.
//         // For this example, we'll proceed, but real usage would need robust auth handling.
//     }
//     return new DriveHandler(authClient); // Old constructor usage
// };
// Note: The old getDriveHandler and initializeDriveHandler functions,
// and the module-level authClient variable have been removed.
// DriveHandler is now self-contained for auth initialization.
