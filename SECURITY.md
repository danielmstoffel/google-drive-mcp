# Security Policy

## OAuth2 Best Practices
- Follow Google's OAuth 2.0 for Mobile & Desktop Apps guide.
- Use appropriate OAuth2 scopes, requesting only necessary permissions.
- Securely store and manage client secrets and refresh tokens.
- Implement mechanisms to handle token revocation and expiration.

## Credential Storage Guidelines
- Do not hardcode credentials in the source code.
- Store user-specific tokens securely on the user's local machine, encrypted if possible.
- For server-side components (if any), use secure credential management solutions (e.g., environment variables, secret management services).

## Permission Scopes Required
This application may require the following Google Drive API scopes:
- `https://www.googleapis.com/auth/drive.metadata.readonly` - View metadata of files.
- `https://www.googleapis.com/auth/drive.file` - View and manage Google Drive files and folders that you have opened or created with this app.
- `https://www.googleapis.com/auth/drive` - See, edit, create, and delete all of your Google Drive files.
- `https://www.googleapis.com/auth/drive.appdata` - View and manage its own configuration data in your Google Drive.
- `https://www.googleapis.com/auth/drive.scripts` - Modify your Google Apps Script projects' files.
- `https://www.googleapis.com/auth/drive.activity` - View and manage activity reports for your Google Drive files.
- `https://www.googleapis.com/auth/drive.metadata` - View and manage metadata of files in your Google Drive.
- `https://www.googleapis.com/auth/drive.photos.readonly` - View the photos, videos and albums in your Google Photos.
(Adjust the list based on the actual features implemented)

## Data Handling Policies
- User data (files, metadata) is accessed only for the purpose of providing the intended functionality of the MCP integration.
- Data is not stored persistently by this application unless explicitly configured by the user (e.g., caching for performance).
- All data transmitted to and from the Google Drive API is over HTTPS.
- We do not share user data with third parties.
