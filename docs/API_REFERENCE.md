# AstraSync API Reference

<div align="center">
  <img src="https://www.astrasync.ai/assets/AS_black_IconFCN.png" alt="AstraSync Logo" width="200"/>
  
  # Technical Protocol Documentation
  
  [![API Version](https://img.shields.io/badge/API-v1_preview-blue)](https://astrasync-api-production.up.railway.app)
  [![MCP Version](https://img.shields.io/badge/MCP-1.0-green)](https://modelcontextprotocol.org)
</div>

## Table of Contents

- [Overview](#overview)
- [MCP Protocol](#mcp-protocol)
- [REST API](#rest-api)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## Overview

AstraSync provides two integration methods:

1. **MCP Bridge**: For AI assistants with Model Context Protocol support
2. **REST API**: Direct HTTP integration for all platforms

Both methods provide identical functionality for registering and verifying AI agents.

## MCP Protocol

### Base URL
```
https://astrasync-mcp-bridge-production.up.railway.app/mcp/v1
```

### Protocol Version
The MCP Bridge implements Model Context Protocol v1.0 with HTTP transport.

### Request Format

All MCP requests follow the JSON-RPC 2.0 specification:

```json
{
  "jsonrpc": "2.0",
  "id": <number or string>,
  "method": "tools/call",
  "params": {
    "name": <tool_name>,
    "arguments": <tool_arguments>
  }
}
```

### Available Tools

#### 1. register_agent

Registers a new AI agent with AstraSync.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "register_agent",
    "arguments": {
      "agentName": "string (required)",
      "agentDescription": "string (required)",
      "developerEmail": "string (required, valid email)",
      "agentOwner": "string (required)"
    }
  }
}
```

**Success Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "✅ Successfully registered agent: [Agent Name]\n\n🆔 Agent ID: TEMP-1234567-ABC123\n📊 Trust Score: TEMP-95%\n🔗 Blockchain Status: pending\n\n[Additional instructions...]"
    }]
  }
}
```

#### 2. verify_agent

Verifies if an agent is registered in the AstraSync registry.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "verify_agent",
    "arguments": {
      "agentId": "string (required, format: TEMP-XXXXXXX-XXXXXX)"
    }
  }
}
```

**Success Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [{
      "type": "text",
      "text": "✅ Agent verified!\n\n🆔 Agent ID: TEMP-1234567-ABC123\n👤 Owner: ACME Corp\n📅 Registered: 2025-01-28T12:34:56Z\n[Additional details...]"
    }]
  }
}
```

### Error Response Format

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": "Missing required field: agentName"
  }
}
```

## REST API

### Base URL
```
https://astrasync-api-production.up.railway.app
```

### Endpoints

#### POST /v1/register

Register a new AI agent.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "developer@example.com",
  "agent": {
    "name": "My AI Assistant",
    "description": "A helpful AI agent",
    "owner": "ACME Corp",
    "capabilities": ["chat", "analysis"],
    "version": "1.0.0",
    "metadata": {
      "custom_field": "custom_value"
    }
  }
}
```

**Success Response (200 OK):**
```json
{
  "agentId": "TEMP-1706439245-X7K9M2",
  "status": "registered",
  "blockchain": {
    "status": "pending",
    "message": "Blockchain registration queued"
  },
  "trustScore": "TEMP-95%",
  "message": "Agent registered successfully",
  "verifyUrl": "https://astrasync-api-production.up.railway.app/v1/verify/TEMP-1706439245-X7K9M2",
  "createAccount": "https://www.astrasync.ai/alphaSignup"
}
```

#### GET /v1/verify/{agentId}

Verify an agent's registration status.

**Path Parameters:**
- `agentId`: The agent ID to verify (format: TEMP-XXXXXXX-XXXXXX)

**Success Response (200 OK):**
```json
{
  "verified": true,
  "agentId": "TEMP-1706439245-X7K9M2",
  "owner": "ACME Corp",
  "registeredAt": "2025-01-28T12:34:56Z",
  "trustScore": "TEMP-95%",
  "message": "This is a temporary developer preview credential. Create an account at https://www.astrasync.ai/alphaSignup to convert to permanent credentials."
}
```

#### GET /v1/agent/{agentId}

Get detailed agent information (requires email verification).

**Path Parameters:**
- `agentId`: The agent ID

**Query Parameters:**
- `email`: The email used during registration

**Success Response (200 OK):**
```json
{
  "id": "uuid-here",
  "agentId": "TEMP-1706439245-X7K9M2",
  "name": "My AI Assistant",
  "description": "A helpful AI agent",
  "owner": "ACME Corp",
  "email": "developer@example.com",
  "capabilities": ["chat", "analysis"],
  "version": "1.0.0",
  "metadata": {},
  "trustScore": "TEMP-95%",
  "blockchainStatus": "pending",
  "createdAt": "2025-01-28T12:34:56Z",
  "updatedAt": "2025-01-28T12:34:56Z"
}
```

## Authentication

### Developer Preview
During the developer preview, no API keys are required. Authentication is handled through:
- Email verification for sensitive operations
- Rate limiting by IP address

### Production (Coming June 2025)
- API key authentication in headers
- OAuth 2.0 support
- Enhanced rate limits for authenticated requests

## Error Handling

### HTTP Status Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Agent ID doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Human-readable error message",
    "details": {
      "field": "agentName",
      "issue": "Required field missing"
    }
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| INVALID_INPUT | Request validation failed |
| AGENT_NOT_FOUND | Agent ID doesn't exist |
| EMAIL_MISMATCH | Email doesn't match registration |
| RATE_LIMIT_EXCEEDED | Too many requests |
| INTERNAL_ERROR | Server error |

## Rate Limiting

### Developer Preview Limits
- **Registration**: 10 agents per hour per IP
- **Verification**: 100 requests per hour per IP
- **Agent Details**: 50 requests per hour per IP

### Response Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706442000
```

## Examples

### Using cURL with REST API

**Register an agent:**
```bash
curl -X POST https://astrasync-api-production.up.railway.app/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "agent": {
      "name": "Support Bot",
      "description": "Customer support assistant",
      "owner": "ACME Corp",
      "capabilities": ["chat", "ticket_management"]
    }
  }'
```

**Verify an agent:**
```bash
curl https://astrasync-api-production.up.railway.app/v1/verify/TEMP-1234567-ABC123
```

### Using JavaScript with MCP Bridge

```javascript
const response = await fetch('https://astrasync-mcp-bridge-production.up.railway.app/mcp/v1', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'register_agent',
      arguments: {
        agentName: 'My Assistant',
        agentDescription: 'Helpful AI assistant',
        developerEmail: 'dev@example.com',
        agentOwner: 'My Company'
      }
    }
  })
});

const result = await response.json();
console.log(result);
```

### Platform Configuration Examples

**Claude Desktop (config.json):**
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

**Cursor Settings:**
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

## Best Practices

1. **Store Agent IDs**: Always save the returned agent ID for future reference
2. **Email Consistency**: Use the same email for registration and account creation
3. **Error Handling**: Implement proper error handling for all API calls
4. **Rate Limiting**: Implement exponential backoff when rate limited
5. **Secure Storage**: Never expose agent IDs in public repositories

## Support

For technical questions or issues:
- 📧 Email: [alphapartners@astrasync.ai](mailto:alphapartners@astrasync.ai)
- 💬 Discord: [Join our community](https://discord.com/invite/X78ctNp7)

---

<div align="center">
  <b>Building trust infrastructure for AI agents</b>
  <br><br>
  Last updated: January 2025
</div>
