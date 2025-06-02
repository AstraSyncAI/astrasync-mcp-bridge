# AstraSync Troubleshooting Guide

<div align="center">
  <img src="https://www.astrasync.ai/assets/AS_black_IconFCN.png" alt="AstraSync Logo" width="200"/>
  
  # Common Issues and Solutions
  
  [![Support](https://img.shields.io/badge/Support-alphapartners@astrasync.ai-blue)](mailto:alphapartners@astrasync.ai)
  [![Discord](https://img.shields.io/discord/X78ctNp7?label=Discord&logo=discord)](https://discord.com/invite/X78ctNp7)
</div>

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Registration Issues](#registration-issues)
- [Verification Issues](#verification-issues)
- [Platform-Specific Issues](#platform-specific-issues)
- [API Errors](#api-errors)
- [MCP Bridge Issues](#mcp-bridge-issues)
- [Account & Credential Issues](#account--credential-issues)
- [Getting Help](#getting-help)

## Quick Diagnostics

Before troubleshooting, verify:

1. **API Status**: Check if our services are operational
   ```bash
   curl https://astrasync-api-production.up.railway.app/health
   ```

2. **MCP Bridge Status**: Test the bridge directly
   - Visit: [https://astrasync-mcp-bridge-production.up.railway.app/mcp/test](https://astrasync-mcp-bridge-production.up.railway.app/mcp/test)

3. **Network Connectivity**: Ensure you can reach our servers
   ```bash
   ping astrasync-api-production.up.railway.app
   ```

## Registration Issues

### "Missing required field" Error

**Problem**: Registration fails with field validation error.

**Solutions**:
1. Ensure all required fields are provided:
   - `agentName`: Non-empty string
   - `agentDescription`: Non-empty string
   - `developerEmail`: Valid email format
   - `agentOwner`: Non-empty string

2. Check for typos in field names (case-sensitive)

**Example of correct request:**
```json
{
  "email": "dev@example.com",
  "agent": {
    "name": "My Bot",
    "description": "A helpful assistant",
    "owner": "ACME Corp",
    "capabilities": ["chat"]
  }
}
```

### "Invalid email format" Error

**Problem**: Email validation fails.

**Solutions**:
- Use a valid email format: `user@domain.com`
- Remove any extra spaces or special characters
- Ensure the email is lowercase

### Registration Succeeds but No Email Received

**Problem**: Agent registered but confirmation email not received.

**Solutions**:
1. Check spam/junk folder
2. Verify the email address used during registration
3. Wait 5-10 minutes (emails may be delayed)
4. Contact support if email doesn't arrive after 30 minutes

## Verification Issues

### "Agent not found" Error

**Problem**: Verification fails with 404 error.

**Possible Causes**:
1. Incorrect agent ID format
2. Agent ID doesn't exist
3. Typo in the agent ID

**Solutions**:
- Verify the exact agent ID from registration response
- Ensure format matches: `TEMP-XXXXXXX-XXXXXX`
- Agent IDs are case-sensitive

### Verification Returns Different URL

**Problem**: Verify URL points to production instead of preview.

**Solution**: This is a known issue in some older registrations. The correct verify URL should be:
```
https://astrasync-api-production.up.railway.app/v1/verify/[YOUR-AGENT-ID]
```

## Platform-Specific Issues

### Claude Desktop

**Problem**: MCP server not appearing in Claude.

**Solutions**:
1. Verify configuration file location:
   - Windows: `%APPDATA%\Claude\config.json`
   - macOS: `~/Library/Application Support/Claude/config.json`

2. Ensure proper JSON syntax:
   ```json
   {
     "mcpServers": {
       "astrasync": {
         "url": "https://astrasync-mcp-bridge-production.up.railway.app/mcp/v1",
         "transport": "http"
       }
     }
   }
   ```

3. Restart Claude Desktop after configuration changes

### Cursor/Windsurf

**Problem**: Tools not showing in assistant.

**Solutions**:
1. Check MCP settings in preferences
2. Ensure "Enable MCP" is toggled on
3. Reload the window (Cmd/Ctrl + R)
4. Verify no firewall blocking HTTPS requests

### ChatGPT Desktop

**Problem**: Cannot find MCP configuration option.

**Solution**: Ensure you're using ChatGPT Desktop app (not web version). MCP is not supported in the web interface.

## API Errors

### 429 - Rate Limit Exceeded

**Problem**: Too many requests error.

**Current Limits** (Developer Preview):
- Registration: 10 agents/hour
- Verification: 100 requests/hour

**Solutions**:
1. Wait for rate limit reset (check `X-RateLimit-Reset` header)
2. Implement exponential backoff
3. Cache verification results locally

### 500 - Internal Server Error

**Problem**: Server error during request.

**Solutions**:
1. Retry after 30 seconds
2. Check our Discord for service announcements
3. Contact support if error persists

### Connection Timeout

**Problem**: Requests timing out.

**Solutions**:
1. Check your internet connection
2. Try using a different network
3. Verify no corporate firewall blocking requests
4. Use longer timeout values (30+ seconds)

## MCP Bridge Issues

### "Method not found" Error

**Problem**: MCP bridge returns method error.

**Solution**: Ensure using correct method name:
```json
{
  "method": "tools/call",  // Correct
  "method": "call"         // Incorrect
}
```

### Empty Response from Bridge

**Problem**: Bridge returns empty or null response.

**Solutions**:
1. Verify JSON-RPC format is correct
2. Include all required fields:
   - `jsonrpc`: "2.0"
   - `id`: number or string
   - `method`: "tools/call"
   - `params`: object with `name` and `arguments`

### CORS Errors (Browser)

**Problem**: Cross-origin errors when calling from browser.

**Solution**: CORS is intentionally restricted. Use:
- The provided test interface
- Server-side proxy
- Official MCP client applications

## Account & Credential Issues

### TEMP vs ASTRAS Credentials

**Understanding the Difference**:
- **TEMP-XXX**: Temporary developer preview credentials
- **ASTRAS-XXX**: Production credentials (coming June 2025)

**Converting TEMP to Production**:
1. Register agents (receive TEMP credentials)
2. Sign up at [https://www.astrasync.ai/alphaSignup](https://www.astrasync.ai/alphaSignup)
3. Use the same email address
4. TEMP agents auto-convert when production launches

### Lost Agent ID

**Problem**: Forgot or lost the agent ID.

**Current Limitations**: 
- No public search functionality (privacy by design)
- Agent IDs are not recoverable without the original email

**Prevention**:
- Save agent IDs immediately after registration
- Store in secure password manager
- Include in your application's configuration

### Email Mismatch Error

**Problem**: Cannot retrieve agent details due to email mismatch.

**Solution**: 
- Use the exact email used during registration
- Emails are case-sensitive
- Remove any trailing spaces

## Getting Help

### Before Contacting Support

1. **Check API Status**: Ensure services are operational
2. **Review Documentation**: Double-check the API reference
3. **Test with cURL**: Isolate whether issue is platform-specific
4. **Gather Information**:
   - Exact error message
   - Request/response details
   - Platform and version
   - Time of occurrence

### Contact Support

**For Technical Issues**:
- 📧 Email: [alphapartners@astrasync.ai](mailto:alphapartners@astrasync.ai)
- 💬 Discord: [Join our community](https://discord.com/invite/X78ctNp7)

**Include in Support Request**:
1. Agent ID (if applicable)
2. Error messages and codes
3. Steps to reproduce
4. Platform/integration method
5. Expected vs actual behavior

### Response Times

- **Email**: 1-2 business days
- **Discord**: Community support (varies)
- **Critical Issues**: Tag @support in Discord

## Common Solutions Summary

| Issue | Quick Fix |
|-------|-----------|
| Registration fails | Check required fields and email format |
| No email received | Check spam, wait 30 min, contact support |
| Agent not found | Verify exact agent ID format |
| Rate limited | Wait for reset, implement backoff |
| MCP not working | Check configuration syntax, restart app |
| TEMP credentials | Sign up for alpha to convert later |

---

<div align="center">
  <b>Still having issues?</b>
  <br><br>
  📧 Reach out to our team: <a href="mailto:alphapartners@astrasync.ai">alphapartners@astrasync.ai</a>
  <br>
  💬 Get community help: <a href="https://discord.com/invite/X78ctNp7">Join Discord</a>
</div>
