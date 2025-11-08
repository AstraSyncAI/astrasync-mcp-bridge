# AstraSync MCP Bridge

Enable any AI assistant to register and verify agents with AstraSync through the Model Context Protocol (MCP).

## What is this?

The AstraSync MCP Bridge connects AI assistants and development tools to the AstraSync AI Agent Registry. It provides a standardized way to give AI agents verifiable identities and compliance tracking - think of it as SSL certificates for AI agents.

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

### `register_agent`
Register a new AI agent with AstraSync's compliance registry.

### `verify_agent`  
Verify if an agent is registered and compliant.

## Platform Support Status

| Platform | MCP Support | Integration Method | Notes |
|----------|-------------|-------------------|-------|
| **ChatGPT Desktop** | ✅ Native | HTTP MCP | Full MCP support |
| **ChatGPT Web** | ❌ Not supported | Custom GPT Actions | Use OpenAPI spec |
| **Claude Desktop** | ✅ Native | HTTP MCP | Full MCP support |
| **Claude Web** | ❌ Not supported | Copy/paste workflow | No direct integration |
| **Cursor** | ✅ Native | HTTP MCP | IDE integration |
| **Windsurf** | ✅ Native | HTTP MCP | IDE integration |
| **Cline** | ✅ Native | HTTP MCP | IDE integration |
| **Letta** | 🔄 Varies | HTTP MCP or API | Check version |
| **Perplexity** | ❌ Not yet | Direct API | Use REST endpoint |
| **Google Gemini** | 🔜 Coming | Will support MCP | H1 2025 expected |
| **Web Browsers** | ➕ Possible | Direct API | Build custom integration |

For detailed platform-specific instructions, see [PLATFORMS.md](docs/PLATFORMS.md).

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

## Response Example

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "Successfully registered agent: Your Agent\nAgent ID: TEMP-1234567-ABCDE\nTrust Score: TEMP-95%\nBlockchain Status: pending"
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

## About AstraSync

AstraSync is building the trust infrastructure for AI agents. Learn more at [astrasync.ai](https://astrasync.ai).

- **Main API**: [github.com/AstraSyncAI/astrasync-api](https://github.com/AstraSyncAI/astrasync-api)
- **Documentation**: [docs.astrasync.ai](https://docs.astrasync.ai)
- **Discord**: [Join our community](https://discord.gg/astrasync)

## License

MIT License - see [LICENSE](LICENSE) for details.

---

*Making AI agents accountable, one registration at a time.*