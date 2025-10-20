# Changelog

All notable changes to the AstraSync MCP Bridge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-20

### 🎉 Production Release

This marks the official production release of the AstraSync MCP Bridge!

### Changed
- **BREAKING**: Updated default API endpoint from Railway development environment to production (`https://astrasync.ai/api`)
- Updated package version from 0.1.0 to 1.0.0
- Updated all documentation from "Developer Preview" to "Production"
- Updated package description to reflect production status

### Improved
- Production-grade API endpoints with improved reliability
- Enhanced documentation for production use
- Cleaner messaging around agent registration

### Migration Guide

If you're upgrading from v0.1.x (Developer Preview):

1. **Update your installation:**
   ```bash
   npm install --upgrade astrasync-mcp-bridge
   ```

2. **Environment variables (optional):**
   - The default API URL now points to production: `https://astrasync.ai/api`
   - If you have `ASTRASYNC_API_URL` set in your `.env`, you can remove it to use the default
   - Or update it to point to the production URL

3. **No code changes required** - The MCP bridge is backward compatible. All API calls will automatically use the new production endpoints.

4. **Agent IDs:** New registrations will work with production infrastructure

### Note
- All existing functionality continues to work as expected
- MCP protocol support remains unchanged
- Compatible with Claude Desktop, ChatGPT Desktop, Cursor, Windsurf, and Cline

---

## [0.1.0] - 2025-09-XX

### Developer Preview Release
- Initial public release
- HTTP MCP bridge for AI assistants
- Support for agent registration and verification
- Railway development API endpoint
- Compatible with major AI assistant platforms
