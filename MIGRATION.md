# Migration Guide

This guide helps you migrate to the Google Drive MCP integration for Claude Desktop from various existing setups.

## Migrating from Direct Google Drive API Usage

If you were previously interacting with the Google Drive API directly (e.g., using Google's client libraries or raw HTTP requests), migrating to this MCP integration involves the following conceptual changes:

- **Abstraction Layer:** The MCP server acts as an abstraction layer. Instead of making direct API calls, you will use the tools (methods) exposed by this MCP server.
- **Tool-Based Interaction:** Familiarize yourself with the available tools listed in the `README.md`. Each tool corresponds to one or more Google Drive API calls.
- **Configuration:** You'll need to configure Claude Desktop to connect to this MCP server, rather than managing API credentials and calls directly in your Claude setup.
- **Authentication:** Authentication is handled by the MCP server using OAuth2. You will configure this once for the server.

**Key Steps:**
1.  Identify the Google Drive API functionalities you currently use.
2.  Map these functionalities to the available tools in this MCP integration (see `README.md`).
3.  Update your Claude skills or workflows to call these MCP tools instead of direct API calls.
4.  Set up and configure the Google Drive MCP server as per the `README.md` installation instructions.
5.  Configure Claude Desktop to use the newly set up MCP server.

## Migrating from Other Drive Integrations

If you were using a different third-party Google Drive integration or a different MCP server for Drive:

- **Feature Parity:** Review the list of tools in `README.md` to ensure this integration covers your required functionalities. There might be differences in available methods or their granularity.
- **Tool Naming and Parameters:** Tool names and their request/response schemas might differ. You'll need to adapt your Claude skill configurations to match the new tool definitions.
- **Configuration:** The setup and configuration process for this MCP server (OAuth2, Claude Desktop connection) will likely be different. Follow the `README.md` carefully.

**Key Steps:**
1.  Document the features and specific tools you used in your previous integration.
2.  Compare them with the tools offered by this MCP server.
3.  Update your Claude skill configurations to use the new tool names and parameter structures.
4.  Install and configure this Google Drive MCP server.
5.  Update Claude Desktop's MCP configuration to point to this new server.

## Migrating from Previous Versions of this MCP

If you are upgrading from an older version of `@danielmstoffel/google-drive-mcp`:

- **Changelog:** Review the changelog (if available) or release notes for breaking changes, new features, or deprecated tools.
- **Tool Definitions:** Even if tool names remain the same, their request or response schemas might have changed. Verify your Claude skill configurations.
- **Configuration Files:** Check if there are any changes to the OAuth2 setup or Claude Desktop configuration requirements.
- **Dependencies:** Ensure your Node.js version and other dependencies are still compatible.

**Key Steps:**
1.  Backup your existing configuration.
2.  Consult the release notes or documentation for the new version for any specific migration instructions.
3.  Update the package to the new version (`npm install @danielmstoffel/google-drive-mcp@latest`).
4.  Re-run `npm run build` if necessary.
5.  Test your existing Claude skills thoroughly with the new version.
6.  Adjust configurations or skill definitions as needed.

---

If you encounter issues not covered here, please refer to the main `README.md` for troubleshooting tips or consider opening an issue on the project's GitHub repository.
