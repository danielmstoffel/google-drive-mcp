# Google Drive Permissions API Client

**Note:** This README provides specific instructions for the Google Drive Handler. Its content should ideally be integrated into the main project README at the repository root.

This project provides a TypeScript-based command-line client for interacting with the Google Drive API, specifically focusing on managing file and folder permissions. It demonstrates how to authenticate using OAuth 2.0 and perform CRUD (Create, Read, Update, Delete) operations on permissions.

## Prerequisites

*   **Node.js and npm (or yarn):** Required for running the script and managing dependencies. You can download them from [nodejs.org](https://nodejs.org/).
*   **Access to Google Cloud Console:** You will need a Google account and access to the [Google Cloud Console](https://console.cloud.google.com/) to:
    *   Enable the Google Drive API for your project.
    *   Create OAuth 2.0 credentials for the application.

## Setup Instructions

1.  **Clone the Repository (or Download Files):**
    ```bash
    # If git is available
    # git clone <repository_url>
    # cd <repository_name>
    ```
    Alternatively, download the `src/handlers/drive-handler.ts`, `tsconfig.json`, and `package.json` (if available, otherwise you'll create it via npm init) files into a directory.

2.  **Install Dependencies:**
    Open your terminal in the project directory and run:
    ```bash
    npm install googleapis@105 @google-cloud/local-auth@2.1.0 typescript ts-node @types/node @types/gapi --save
    ```
    If you are managing your project with a `package.json`, ensure these dependencies are listed and then run `npm install`.
    *(Note: The versions specified were used during development; newer compatible versions may also work.)*

3.  **Credentials Setup:**

    *   **Enable the Google Drive API:**
        1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
        2.  Create a new project or select an existing one.
        3.  Navigate to "APIs & Services" > "Library".
        4.  Search for "Google Drive API" and enable it for your project.

    *   **Create OAuth 2.0 Credentials:**
        1.  Navigate to "APIs & Services" > "Credentials".
        2.  Click on "+ CREATE CREDENTIALS" and select "OAuth client ID".
        3.  If prompted, configure your OAuth consent screen first. For "User Type", you can select "Internal" if you are using a Google Workspace account and the app is for internal use, or "External" for general use (may require app verification by Google for sensitive scopes if used broadly).
        4.  For "Application type", choose "Desktop app".
        5.  Give your OAuth client ID a name (e.g., "Drive Permissions Client").
        6.  Click "Create".

    *   **Download `credentials.json`:**
        1.  After creating the OAuth client ID, a dialog will appear showing your Client ID and Client Secret. Click the "DOWNLOAD JSON" button (it might be an icon).
        2.  Rename the downloaded file to `credentials.json`.
        3.  Place this `credentials.json` file in the root directory of this project.
        4.  **Important:** This file contains sensitive information. Keep it private and **do not commit it to version control.** The provided `.gitignore` file in this repository already includes `credentials.json` to help prevent accidental commits.

4.  **TypeScript Configuration:**
    *   A `tsconfig.json` file is included in this project. It provides the necessary TypeScript compiler options.
    *   All custom type definitions (interfaces, type aliases) are located in `src/types/drive-types.ts`.
    *   The main handler logic is in `src/handlers/drive-handler.ts`.

## Running the Code

1.  **Execute the Script:**
    Open your terminal in the project's root directory and run:
    ```bash
    npx ts-node src/handlers/drive-handler.ts
    ```

2.  **OAuth 2.0 Authorization Flow:**
    *   On the first run, the script will attempt to open a new window or tab in your web browser.
    *   You will be prompted to log in with your Google account and authorize the application to access your Google Drive files (based on the scopes requested, which include full drive access).
    *   After successful authorization, a `token.json` file will be created in the root directory. This file stores your OAuth tokens, so you won't need to authorize again unless the token is revoked or expires, or if you change the `SCOPES`.

3.  **Testing API Methods:**
    *   The `main` function at the bottom of `src/handlers/drive-handler.ts` contains example usage of the implemented API methods.
    *   Initially, most examples are commented out. You can uncomment and modify them to test different functionalities. For example, to list permissions, you'll first need a `fileId`. You can get a `fileId` by running the `listFiles()` method (which is enabled by default in `main`) and then using one of the IDs from its output.

## Implemented API Methods

The `GoogleDriveHandler` class in `src/handlers/drive-handler.ts` provides the following methods for managing permissions:

*   **`permissions_list(args: DrivePermissionsListArgs)`**
    *   Lists all permissions for a specified file or folder.
*   **`permissions_get(args: DrivePermissionsGetArgs)`**
    *   Retrieves the details of a specific permission by its ID for a file or folder.
*   **`permissions_create(args: DrivePermissionsCreateArgs)`**
    *   Creates a new permission for a user, group, domain, or anyone on a file or folder.
*   **`permissions_update(args: DrivePermissionsUpdateArgs)`**
    *   Updates an existing permission's role (e.g., from 'reader' to 'writer').
*   **`permissions_delete(args: DrivePermissionsDeleteArgs)`**
    *   Deletes a permission from a file or folder.

Please refer to the JSDoc comments and TypeScript interfaces (primarily in `src/types/drive-types.ts`) for detailed argument and response structures.

## Error Handling

All the permission methods (e.g., `permissions_list`) return a Promise that resolves to an `MCPResponse<T>` object. This object has the following structure:

```typescript
interface MCPResponse<T> {
  success: boolean; // True if the operation was successful, false otherwise
  data?: T;        // The data returned by the API (if successful)
  error?: string;  // A summary error message (if unsuccessful)
  errorDetails?: any; // More detailed error information from the API (if unsuccessful)
}
```
Always check the `success` flag before attempting to use the `data`. If `success` is `false`, the `error` and potentially `errorDetails` fields will contain information about what went wrong.
The `main` function includes examples of how to check the `success` flag.
