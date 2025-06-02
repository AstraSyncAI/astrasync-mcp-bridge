# AstraSync MCP Bridge

<div align="center">
  <img src="https://astrasync.ai/logo.png" alt="AstraSync Logo" width="200"/>
  
  [![MCP Version](https://img.shields.io/badge/MCP-v1.0-blue)](https://modelcontextprotocol.org)
  [![API Status](https://img.shields.io/badge/API-Operational-green)](https://astrasync-mcp-bridge-production.up.railway.app)
  [![Discord](https://img.shields.io/discord/X78ctNp7?label=Discord&logo=discord)](https://discord.com/invite/X78ctNp7)
  [![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
</div>

## 🌟 Overview

AstraSync MCP Bridge enables any AI assistant to register and verify agents with the AstraSync AI Agent Registry through the Model Context Protocol (MCP). This bridge provides a standardized way to give AI agents verifiable identities and compliance tracking - think of it as SSL certificates for AI agents.

### Key Features

- 🔐 **Universal Protocol**: Works with any MCP-compatible platform via HTTP
- ⚡ **Zero Installation**: No local servers or configuration required
- 🚀 **Instant Integration**: AI assistants can register agents during natural conversation
- ✅ **Real-time Compliance**: Every agent gets a verifiable identity and trust score
- 🌐 **Cross-Platform**: Support for Claude, ChatGPT Desktop, Cursor, Windsurf, and more

## 🎯 Quick Start

### Test the Bridge

Try it now in your browser: [https://astrasync-mcp-bridge-production.up.railway.app/mcp/test](https://astrasync-mcp-bridge-production.up.railway.app/mcp/test)

### Basic Configuration

Add to your MCP-compatible platform's configuration:

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

## 🛠️ Available Tools

### 1. `register_agent`
Register a new AI agent with AstraSync's compliance registry.

**Parameters:**
- `agentName` (required): Name of your AI agent
- `agentDescription` (required): What your agent does
- `developerEmail` (required): Your email for future account linking
- `agentOwner` (required): Your name or organization

**Example:**
```json
{
  "name": "register_agent",
  "arguments": {
    "agentName": "Customer Support Bot",
    "agentDescription": "Handles customer inquiries and support tickets",
    "developerEmail": "dev@company.com",
    "agentOwner": "ACME Corp"
  }
}
```

### 2. `verify_agent`
Verify if an agent is registered and compliant.

**Parameters:**
- `agentId` (required): The TEMP-XXX ID to verify

**Example:**
```json
{
  "name": "verify_agent",
  "arguments": {
    "agentId": "TEMP-1234567-ABC123"
  }
}
```

## 📱 Platform Support

| Platform | MCP Support | Integration Method | Setup Guide |
|----------|-------------|-------------------|-------------|
| Claude Desktop | ✅ Native | HTTP MCP | [Instructions](https://github.com/AstraSyncAI/astrasync-mcp-bridge/tree/main/docs/PLATFORMS.md#claude-desktop) |
| ChatGPT Desktop | ✅ Native | HTTP MCP | [Instructions](https://github.com/AstraSyncAI/astrasync-mcp-bridge/tree/main/docs/PLATFORMS.md#chatgpt-desktop) |
| Cursor | ✅ Native | HTTP MCP | [Instructions](https://github.com/AstraSyncAI/astrasync-mcp-bridge/tree/main/docs/PLATFORMS.md#cursor) |
| Windsurf | ✅ Native | HTTP MCP | [Instructions](https://github.com/AstraSyncAI/astrasync-mcp-bridge/tree/main/docs/PLATFORMS.md#windsurf) |
| Cline | ✅ Native | HTTP MCP | [Instructions](https://github.com/AstraSyncAI/astrasync-mcp-bridge/tree/main/docs/PLATFORMS.md#cline) |
| Claude Web | ❌ Not supported | Copy/paste workflow | [Workaround](https://github.com/AstraSyncAI/astrasync-mcp-bridge/tree/main/docs/PLATFORMS.md#claude-web) |
| ChatGPT Web | ❌ Not supported | Custom GPT Actions | [Alternative](https://github.com/AstraSyncAI/astrasync-mcp-bridge/tree/main/docs/PLATFORMS.md#chatgpt-web) |
| Perplexity | ❌ Not yet | Direct API | [API Guide](https://github.com/AstraSyncAI/astrasync-mcp-bridge/tree/main/docs/API_REFERENCE.md) |

## 🔧 Direct API Usage

For platforms without MCP support, use our REST endpoint directly:

```bash
curl -X POST https://astrasync-mcp-bridge-production.up.railway.app/mcp/v1 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "register_agent",
      "arguments": {
        "agentName": "My AI Assistant",
        "agentDescription": "A helpful AI agent",
        "developerEmail": "you@example.com",
        "agentOwner": "Your Company"
      }
    }
  }'
```

## 📊 Developer Preview Status

This is a **DEVELOPER PREVIEW** with the following limitations:

- ✅ **Temporary IDs**: All registrations create TEMP credentials
- ✅ **Email Notifications**: Receive updates about your registered agents
- 🔄 **Blockchain Pending**: Full blockchain integration coming June 2025
- 🔄 **Trust Scores**: Currently static at TEMP-95%, dynamic scoring coming soon

### Converting TEMP Credentials

1. Register agents using this bridge (receive TEMP-XXX IDs)
2. Sign up at [https://www.astrasync.ai/alphaSignup](https://www.astrasync.ai/alphaSignup)
3. Use the same email address
4. Your TEMP agents will automatically convert to permanent ASTRAS-XXX IDs

## 📚 Documentation

- [Platform Integration Guide](https://github.com/AstraSyncAI/astrasync-mcp-bridge/tree/main/docs/PLATFORMS.md) - Detailed setup for each platform
- [API Reference](https://github.com/AstraSyncAI/astrasync-mcp-bridge/tree/main/docs/API_REFERENCE.md) - Technical protocol details
- [Troubleshooting](https://github.com/AstraSyncAI/astrasync-mcp-bridge/tree/main/docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🤝 Becoming an Alpha Partner

We're building the future of AI agent trust infrastructure and looking for early partners to shape the product.

### Benefits of Joining
- Direct input on product features
- Priority access to new capabilities
- Lifetime discounted pricing
- Technical support from founders

To become an alpha partner or contribute to the project, contact us at [alphapartners@astrasync.ai](mailto:alphapartners@astrasync.ai).

## 📞 Support & Community

- 💬 **Discord**: [Join our community](https://discord.com/invite/X78ctNp7)
- 📧 **Email**: [alphapartners@astrasync.ai](mailto:alphapartners@astrasync.ai)
- 🌐 **Website**: [astrasync.ai](https://astrasync.ai)
- 📖 **Documentation**: [GitHub Docs](https://github.com/AstraSyncAI/astrasync-mcp-bridge/tree/main/docs)
- 🐛 **Support**: Contact [alphapartners@astrasync.ai](mailto:alphapartners@astrasync.ai)

## 🔒 Security

- All communications use HTTPS encryption
- No sensitive data is stored locally
- Agent credentials are managed by the AstraSync API
- Report security issues to: [alphapartners@astrasync.ai](mailto:alphapartners@astrasync.ai)

## 📄 License

Proprietary - All rights reserved. Contact [alphapartners@astrasync.ai](mailto:alphapartners@astrasync.ai) for licensing inquiries.

---

<div align="center">
  <b>Making AI agents accountable, one registration at a time.</b>
  <br><br>
  🌟 Join the Alpha Program: <a href="https://www.astrasync.ai/alphaSignup">Sign up now</a>
  <br>
  📧 For partnership opportunities: <a href="mailto:alphapartners@astrasync.ai">alphapartners@astrasync.ai</a>
</div>
