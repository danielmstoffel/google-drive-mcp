# Google Drive MCP

A Model Context Protocol (MCP) server that enables Claude Desktop to interact with Google Drive files and folders through both personal and work Google accounts.

## Current Implementation Status

This MCP server currently implements 14 core Google Drive API methods, with the full 50+ method implementation in progress.

## Features

### Currently Implemented (14 methods)

- **File Operations**: 
  - `drive_files_list` - List files in your Google Drive
  - `drive_files_get` - Get details about a specific file
  - `drive_files_create` - Create new files or folders
  - `drive_files_update` - Update file content or metadata
  - `drive_files_delete` - Delete files
  - `drive_files_copy` - Copy files

- **File Management**:
  - `drive_files_emptyTrash` - Empty the trash
  - `drive_files_export` - Export Google Docs/Sheets/Slides to other formats
  - `drive_files_download` - Download file content
  - `drive_files_generateIds` - Generate unique file IDs

- **File Monitoring**:
  - `drive_files_watch` - Watch for changes to files

- **Labels**:
  - `drive_files_listLabels` - List labels on a file
  - `drive_files_modifyLabels` - Add or remove labels

- **Account Information**:
  - `drive_get_about` - Get Drive usage and account info

### Coming Soon (36+ methods)
- Shared Drives management
- Permissions and sharing controls
- Comments and replies
- Revision history
- Change tracking
- Apps integration
- And more...

## Installation

### For Claude Desktop

1. **Clone and build the project**:
```bash
git clone https://github.com/danielmstoffel/google-drive-mcp.git
cd google-drive-mcp
npm install
npm run build
```

2. **Configure Claude Desktop**:

Add to your Claude Desktop configuration at `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "google-drive-work": {
      "displayName": "Google Drive (Work)",
      "command": "node",
      "args": [
        "/path/to/google-drive-mcp/dist/index.js"
      ],
      "env": {
        "GOOGLE_CLIENT_ID": "your-work-client-id",
        "GOOGLE_CLIENT_SECRET": "your-work-secret",
        "GOOGLE_REDIRECT_URI": "http://localhost:3000/oauth2callback",
        "GOOGLE_REFRESH_TOKEN": "your-work-refresh-token"
      }
    },
    "google-drive-personal": {
      "displayName": "Google Drive (Personal)",
      "command": "node",
      "args": [
        "/path/to/google-drive-mcp/dist/index.js"
      ],
      "env": {
        "GOOGLE_CLIENT_ID": "your-personal-client-id",
        "GOOGLE_CLIENT_SECRET": "your-personal-secret",
        "GOOGLE_REDIRECT_URI": "http://localhost:3000/oauth2callback",
        "GOOGLE_REFRESH_TOKEN": "your-personal-refresh-token"
      }
    }
  }
}
```

3. **Restart Claude Desktop** to load the new configuration.

## Getting OAuth2 Credentials

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API

### Step 2: Create OAuth2 Credentials
1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Desktop app" as the application type
4. Download the credentials JSON

### Step 3: Get Refresh Token
You can use the existing refresh tokens from other Google MCP tools if you have them, or generate new ones using the OAuth2 flow.

## Usage Examples

Once configured, you can ask Claude to:

- "List all files in my Google Drive"
- "Search for documents containing 'project proposal'"
- "Create a new folder called 'Q1 2025 Reports'"
- "Get details about file ID abc123"
- "Download the latest budget spreadsheet"
- "Show me my Drive storage usage"
- "Empty my Google Drive trash"

## Development

### Project Structure
```
google-drive-mcp/
├── src/
│   ├── index.ts              # MCP server setup and tool registration
│   ├── handlers/
│   │   └── drive-handler.ts  # Google Drive API implementations
│   └── types/
│       └── drive-types.ts    # TypeScript type definitions
├── dist/                     # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Methods

To add more Google Drive API methods:

1. Implement the method in `src/handlers/drive-handler.ts`:
```typescript
async drive_resource_method(args: any) {
    // Implementation
    return this.formatMCPResponse({ 
        // response data 
    });
}
```

2. Add the tool definition in `src/index.ts`:
```typescript
{
    name: 'drive_resource_method',
    description: 'Description of what this method does',
    inputSchema: {
        type: 'object',
        properties: {
            // parameters
        }
    }
}
```

### Building
```bash
npm run build
```

### Testing
```bash
# Start the server directly
node dist/index.js
```

## Architecture

This MCP follows the established patterns from other Google Workspace MCPs:

- **TypeScript** for type safety
- **Handler pattern** for organizing API methods
- **formatMCPResponse** helper for consistent response formatting
- **Automatic delegation** using the `startsWith('drive_')` pattern
- **OAuth2 with refresh tokens** for authentication

## Troubleshooting

### Server won't start
- Ensure all dependencies are installed: `npm install`
- Build the project: `npm run build`
- Check that `dist/index.js` exists

### Authentication errors
- Verify your OAuth2 credentials are correct
- Ensure the refresh token is valid and not expired
- Check that the Google Drive API is enabled in your Google Cloud project

### Tools not appearing in Claude
- Restart Claude Desktop after configuration changes
- Check the Claude Desktop logs for any error messages
- Verify the path to the MCP server is correct

### File operations failing
- Ensure your Google account has the necessary permissions
- Check file IDs are correct when accessing specific files
- Verify quota limits haven't been exceeded

## Contributing

Contributions are welcome! Priority areas:

1. Implementing the remaining 36+ Google Drive API methods
2. Adding comprehensive error handling
3. Improving TypeScript types
4. Adding unit tests
5. Creating more detailed documentation

Please submit pull requests to the `main` branch.

## Related Projects

- [Google Sheets MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/sheets)
- [Google Docs MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/gdocs)
- [Google Gmail MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/gmail)

## License

MIT

## Acknowledgments

Built following patterns from the MCP Troubleshooting Guide v5.0 and other Google Workspace MCP implementations.