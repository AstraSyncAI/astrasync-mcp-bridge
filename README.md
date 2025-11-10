# AstraSync MCP Bridge

Enable AstraSync's Identity, Trust and Verification capabilities through Model Context Protocol (MCP) - from account creation to agent registration, verification, and cryptographic signing.

## What is this?

The AstraSync MCP Bridge connects AI assistants and development tools to the AstraSync AI Agent Registry. Through a single MCP integration, you can:

- **Create developer accounts** - Sign up without leaving your AI assistant
- **Manage API credentials** - Generate and manage API keys programmatically
- **Register AI agents** - Add agents to the blockchain-based registry
- **Verify agent identity** - Check registration status and trust scores
- **Generate crypto keypairs** - Enable cryptographic signing for ownership proof

Think of it as complete identity infrastructure for AI agents, accessible through natural conversation.

## Key Features

- **Universal Protocol**: Works with any MCP-compatible platform via HTTP
- **Simple Setup**: Quick self-hosted deployment with minimal configuration
- **Instant Integration**: AI assistants can register agents during natural conversation
- **Real-time Compliance**: Every agent gets a verifiable identity and trust score

## Quick Start

### Self-Hosted Setup

```bash
# Clone and install
git clone https://github.com/AstraSyncAI/astrasync-mcp-bridge.git
cd astrasync-mcp-bridge
npm install

# Configure environment
cp .env.example .env
# Edit .env if needed (defaults to production API at https://astrasync.ai/api)

# Start the bridge
npm start
# Or for development with auto-reload:
npm run dev
```

The bridge will run on `http://localhost:3000` by default.

### MCP Configuration

Once running, configure your AI assistant to use the bridge:

```json
{
  "mcpServers": {
    "astrasync": {
      "url": "http://localhost:3000/mcp/v1",
      "transport": "http"
    }
  }
}
```

**Test your setup**: Visit `http://localhost:3000/mcp/test` for an interactive test interface.

## Available Tools

### Agent Management

#### `register_agent`
Register a new AI agent with AstraSync's compliance registry.

**Required parameters:**
- `agentName`: Name of the AI agent
- `agentDescription`: What the agent does
- `developerEmail`: Email of the developer
- `agentOwner`: Name of the agent owner or company

#### `verify_agent`
Verify if an agent is registered and compliant.

**Required parameters:**
- `agentId`: The agent ID to verify

### Account Management

#### `create_account`
Create a new AstraSync developer account.

**Required parameters:**
- `email`: Email address for the account
- `password`: Password (min 8 characters)
- `fullName`: Full name of the developer
- `accountType`: `individual` or `business` (optional, defaults to `individual`)

**Returns:** Account creation confirmation with dashboard link

#### `generate_api_key`
Generate a new API key for your AstraSync account.

**Required parameters:**
- `email`: Account email address
- `password`: Account password
- `keyName`: Name/label for this API key

**Returns:** API key (save it securely - you won't see it again!)

**Note:** Requires existing AstraSync account (use `create_account` first)

#### `create_crypto_keypair`
Generate a crypto keypair for signing agent registrations.

**Required parameters:**
- `email`: Account email address
- `password`: Account password
- `keyName`: Name/label for this keypair (optional)

**Returns:** Public key and confirmation that mnemonic was emailed

**Tier limits:**
- **Free tier**: 1 crypto keypair
- **Developer tier**: Unlimited keypairs

**Note:** Your mnemonic phrase will be sent to your email. Save it securely offline!

## AstraSync MCP Bridge Compatibility (Updated November 2025)

Tested platforms where the AstraSync MCP Bridge works:

| Platform | Compatibility | Integration Method | Status | How to Use |
|----------|--------------|-------------------|--------|------------|
| **Claude Desktop** | ✅ Fully Compatible | HTTP MCP Server | Tested | Add to `claude_desktop_config.json` |
| **ChatGPT Desktop** | ✅ Fully Compatible | HTTP MCP Server | Tested | Add to MCP settings |
| **OpenAI Agents SDK** | ✅ Fully Compatible | HTTP MCP Server | Tested | Configure in agent code |
| **Google Gemini CLI** | ✅ Fully Compatible | Official Extension | Tested | [Install extension](https://github.com/AstraSyncAI/astrasync-gemini-extension) |
| **Cursor** | ✅ Fully Compatible | HTTP MCP Server | Tested | Add to MCP configuration |
| **Windsurf** | ✅ Fully Compatible | HTTP MCP Server | Tested | Add to MCP configuration |
| **Cline** | ✅ Fully Compatible | HTTP MCP Server | Tested | VS Code extension settings |
| **Replit** | ✅ Compatible | HTTP MCP Server | Community tested | Configure MCP server |
| **Sourcegraph** | ✅ Compatible | HTTP MCP Server | Community tested | Configure in settings |
| **Letta** | ✅ Compatible | HTTP MCP Server | Community tested | Memory-enabled agents |
| **Salesforce Agentforce** | 🔄 In Progress | MCP Client | Testing | MCP support in pilot |
| **ChatGPT Web** | ⚠️ Workaround | Direct API via GPT Actions | Limited | Use JSON-RPC directly |
| **Claude Web** | ⚠️ Workaround | Copy/Paste | Manual | No direct integration |

**Legend:**
- ✅ Fully Compatible: Officially tested and supported
- ✅ Compatible: Community tested, expected to work
- 🔄 In Progress: Under testing
- ⚠️ Workaround: Alternative integration methods available

### Quick Start by Platform

**Gemini CLI** - Use our official extension:
```bash
gemini extensions install https://github.com/AstraSyncAI/astrasync-gemini-extension
```

**Claude Desktop** - Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "astrasync": {
      "url": "http://localhost:3000/mcp/v1",
      "transport": "http"
    }
  }
}
```

**ChatGPT Desktop** - Add to MCP settings:
```json
{
  "mcpServers": {
    "astrasync": {
      "url": "http://localhost:3000/mcp/v1",
      "transport": "http"
    }
  }
}
```

**Salesforce Agentforce** - Available in Pilot (July 2025 release)

## Direct API Usage

For platforms without MCP support, you can call the bridge directly:

```bash
curl -X POST http://localhost:3000/mcp/v1 \
  -H "Content-Type": "application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "register_agent",
      "arguments": {
        "agentName": "Your Agent",
        "agentDescription": "What it does",
        "developerEmail": "you@example.com",
        "agentOwner": "Your Company"
      }
    }
  }'
```

## Response Examples

### Register Agent
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "Successfully registered agent: Customer Support Bot\nAgent ID: ASTRAS-789456\nTrust Score: 45/100 (Free tier baseline)\nBlockchain Status: Queued for verification\n\nView agent card: https://astrasync.ai/agents/ASTRAS-789456"
    }]
  }
}
```

### Create Account
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [{
      "type": "text",
      "text": "✓ Account created successfully!\nEmail: developer@example.com\nType: individual\n\nYou can now:\n• Generate API keys with generate_api_key\n• Create crypto keypairs with create_crypto_keypair (Developer tier)\n• Register agents with your account\n\nLogin to your dashboard: https://astrasync.ai/dashboard"
    }]
  }
}
```

## Architecture

```
AI Assistant → MCP Protocol (HTTP) → AstraSync MCP Bridge → AstraSync API
```

## Production Deployment

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `ASTRASYNC_API_URL`: AstraSync API endpoint (default: https://astrasync.ai/api)

### Deployment Options

**Docker:**
```bash
docker build -t astrasync-mcp-bridge .
docker run -p 3000:3000 -e ASTRASYNC_API_URL=https://astrasync.ai/api astrasync-mcp-bridge
```

**Cloud Platforms:**
- Works on any Node.js hosting (Railway, Render, Fly.io, AWS, GCP, Azure)
- Set `ASTRASYNC_API_URL` environment variable if needed
- Ensure port 3000 (or custom PORT) is accessible

### Development

```bash
npm run dev  # Auto-reload on file changes
npm start    # Production mode
```

## Documentation

- [Platform Integration Guide](docs/PLATFORMS.md) - Detailed setup for each platform
- [API Reference](docs/API_REFERENCE.md) - Technical protocol details
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

## Related Projects

### Official Extensions

- **[Gemini CLI Extension](https://github.com/AstraSyncAI/astrasync-gemini-extension)** - Native extension for Google's Gemini CLI (Production)
- **Salesforce App** - Agentforce integration for Salesforce (Coming Soon)
- **AWS Marketplace** - Enterprise deployment on AWS (Coming Soon)

### SDKs & Tools

- **[Node.js SDK](https://github.com/AstraSyncAI/astrasync-node-sdk)** - Universal SDK with auto-detection for 5+ agent formats
- **[Python SDK](https://github.com/AstraSyncAI/astrasync-python-sdk)** - Python integration for agent registration
- **[Main API](https://github.com/AstraSyncAI/astrasync-api)** - RESTful API for direct integration

## About AstraSync

AstraSync is building the trust infrastructure for AI agents. Learn more at [astrasync.ai](https://astrasync.ai).

- **Platform**: [astrasync.ai](https://astrasync.ai)
- **Documentation**: [astrasync.ai/docs](https://astrasync.ai/docs)
- **GitHub**: [github.com/AstraSyncAI](https://github.com/AstraSyncAI)

## License

MIT License - see [LICENSE](LICENSE) for details.

---

*Making AI agents accountable, one registration at a time.*
