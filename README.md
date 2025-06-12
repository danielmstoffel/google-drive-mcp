# Google Drive MCP Connector

This project provides a Model Context Protocol (MCP) connector for Google Drive, allowing interaction with Google Drive services through the MCP SDK.

## Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/danielmstoffel/google-drive-mcp.git
    cd google-drive-mcp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Copy the `.env.example` file to a new file named `.env`:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and replace the placeholder values with your actual Google Cloud project credentials and desired port.

    -   `GOOGLE_CLIENT_ID`: Your Google Cloud project's OAuth 2.0 Client ID.
    -   `GOOGLE_CLIENT_SECRET`: Your Google Cloud project's OAuth 2.0 Client Secret.
    -   `GOOGLE_REDIRECT_URI`: The redirect URI configured in your Google Cloud project (e.g., `http://localhost:3000/oauth2callback`).
    -   `PORT`: The port on which the MCP server will run (defaults to 3000 if not specified in `.env`).

4.  **Enable Google Drive API:**
    Ensure the Google Drive API is enabled for your Google Cloud project. You can do this through the [Google Cloud Console](https://console.cloud.google.com/apis/library/drive.googleapis.com).

## Build

To compile the TypeScript code, run:
```bash
npm run build
# or
yarn build
```
This will output the JavaScript files to the `dist` directory.

## Running the Server

To start the MCP server:
```bash
npm start
# or
yarn start
```

For development, you can use `npm run dev` (or `yarn dev`) to automatically recompile and restart the server on file changes:
```bash
npm run dev
# or
yarn dev
```

## Project Structure

-   `src/`: Contains the TypeScript source code.
    -   `index.ts`: Main entry point, handles MCP tool routing.
    -   `handlers/drive-handler.ts`: Implements the logic for Google Drive related tools.
    -   `types/drive-types.ts`: Defines TypeScript types for Google Drive data.
-   `package.json`: Lists project dependencies and scripts.
-   `tsconfig.json`: TypeScript compiler configuration.
-   `.gitignore`: Specifies files and directories to be ignored by Git.
-   `.env.example`: Template for environment variables.
