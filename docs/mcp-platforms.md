# AstraSync Platform Integration Guide

*Last Updated: June 2025*

This guide provides detailed integration instructions for connecting AstraSync to various AI platforms and development tools.

## Quick Reference

| Platform | MCP Support | Integration Method | Jump to Instructions |
|----------|-------------|-------------------|---------------------|
| **ChatGPT Desktop** | ✅ Native | HTTP MCP | [↓ Instructions](#chatgpt-desktop) |
| **ChatGPT Web** | ❌ Not supported | Custom GPT Actions | [↓ Instructions](#chatgpt-web) |
| **Claude Desktop** | ✅ Native | HTTP MCP | [↓ Instructions](#claude-desktop) |
| **Claude Web** | ❌ Not supported | Copy/paste workflow | [↓ Instructions](#claude-web) |
| **Cursor** | ✅ Native | HTTP MCP | [↓ Instructions](#cursor) |
| **Windsurf** | ✅ Native | HTTP MCP | [↓ Instructions](#windsurf) |
| **Cline** | ✅ Native | HTTP MCP | [↓ Instructions](#cline) |
| **Letta** | 🔄 Varies | HTTP MCP or API | [↓ Instructions](#letta) |
| **Perplexity** | ❌ Not yet | Direct API | [↓ Instructions](#perplexity) |
| **Google Gemini** | 🔜 Coming | Will support MCP | [↓ Instructions](#google-gemini) |

## Integration Patterns

### Pattern A: Native MCP Support
For platforms with built-in MCP support over HTTP.

**Common configuration structure:**
```json
{
  "mcpServers": {
    "astrasync": {
      "url": "https://astrasync-mcp-bridge.up.railway.app/mcp/v1",
      "transport": "http"
    }
  }
}
```

### Pattern B: Web API Integration
For web platforms without MCP support.

**Common approach:**
1. Use platform-specific function calling or actions
2. Make direct HTTP requests to our MCP endpoint
3. Parse and display results

### Pattern C: Direct API Integration
For platforms with no MCP or limited function calling.

**REST endpoint:**
```
POST https://astrasync-mcp-bridge.up.railway.app/mcp/v1
Content-Type: application/json
```

---

## Platform-Specific Instructions

### ChatGPT Desktop

**Status**: ✅ Full MCP support via HTTP

**Configuration**:
Add to your ChatGPT Desktop settings:
```json
{
  "mcpServers": {
    "astrasync": {
      "url": "https://astrasync-mcp-bridge.up.railway.app/mcp/v1",
      "transport": "http",
      "description": "AI Agent Registration & Compliance"
    }
  }
}
```

**Usage Example**:
> "Use AstraSync to register my new customer service agent called SupportBot that helps users with technical questions"

---

### ChatGPT Web

**Status**: ❌ No MCP support - use Custom GPT Actions

**Integration via Custom GPT**:

1. Create a new Custom GPT
2. Add this Action:

```yaml
openapi: 3.0.0
info:
  title: AstraSync Agent Registry
  version: 1.0.0
servers:
  - url: https://astrasync-mcp-bridge.up.railway.app
paths:
  /mcp/v1:
    post:
      summary: Execute MCP commands for AI agent registration
      operationId: executeMCP
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: ["jsonrpc", "method", "params"]
              properties:
                jsonrpc:
                  type: string
                  enum: ["2.0"]
                id:
                  type: integer
                  default: 1
                method:
                  type: string
                  enum: ["tools/list", "tools/call"]
                params:
                  type: object
                  properties:
                    name:
                      type: string
                      enum: ["register_agent", "verify_agent"]
                    arguments:
                      type: object
      responses:
        200:
          description: Successful response
          content:
            application/json:
              schema:
                type: object
```

3. Add to GPT instructions:
```
When users ask to register an AI agent:
1. Collect: agent name, description, developer email, and owner
2. Use executeMCP action with method "tools/call" and params.name "register_agent"
3. Display the returned agent ID and registration details
```

---

### Claude Desktop

**Status**: ✅ Full MCP support

**Configuration Files**:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Configuration**:
```json
{
  "mcpServers": {
    "astrasync": {
      "url": "https://astrasync-mcp-bridge.up.railway.app/mcp/v1",
      "transport": "http"
    }
  }
}
```

**Important**: Restart Claude Desktop after configuration changes.

**Usage Example**:
> "Register an AI agent named DataProcessor that analyzes customer feedback"

---

### Claude Web

**Status**: ❌ No MCP support

**Workaround Options**:

**Option 1: Web Interface**
1. Direct users to: https://astrasync-mcp-bridge.up.railway.app/mcp/test
2. Fill in the registration form
3. Copy the returned Agent ID

**Option 2: Generate cURL Command**
Ask Claude to generate a command:
> "Generate a curl command to register my agent 'AnalyticsBot' with AstraSync"

Claude will provide:
```bash
curl -X POST https://astrasync-mcp-bridge.up.railway.app/mcp/v1 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "register_agent",
      "arguments": {
        "agentName": "AnalyticsBot",
        "agentDescription": "Analyzes user behavior patterns",
        "developerEmail": "developer@company.com",
        "agentOwner": "Company Inc"
      }
    }
  }'
```

---

### Cursor

**Status**: ✅ Full MCP support

**Configuration**:
Add to `.cursor/config.json` in your project root:
```json
{
  "mcp": {
    "servers": {
      "astrasync": {
        "url": "https://astrasync-mcp-bridge.up.railway.app/mcp/v1",
        "transport": "http"
      }
    }
  }
}
```

**Usage in Cursor Chat**:
> "Register this project's AI agent with AstraSync"

---

### Windsurf

**Status**: ✅ Full MCP support

**Configuration**:
Add to `.windsurf/config.json`:
```json
{
  "extensions": {
    "mcp": {
      "astrasync": {
        "endpoint": "https://astrasync-mcp-bridge.up.railway.app/mcp/v1",
        "protocol": "mcp-http"
      }
    }
  }
}
```

---

### Cline

**Status**: ✅ Full MCP support

**Configuration**:
Create `.cline/mcp.json` in your project:
```json
{
  "servers": [
    {
      "name": "astrasync",
      "url": "https://astrasync-mcp-bridge.up.railway.app/mcp/v1",
      "transport": "http"
    }
  ]
}
```

---

### Letta

**Status**: 🔄 Varies by version

**For MCP-enabled versions**:
```python
# In your Letta agent configuration
tools = [
    {
        "type": "mcp",
        "name": "astrasync",
        "endpoint": "https://astrasync-mcp-bridge.up.railway.app/mcp/v1",
        "transport": "http",
        "tools": ["register_agent", "verify_agent"]
    }
]
```

**For older versions (direct API)**:
```python
import requests

def register_with_astrasync(agent_name, description, email, owner):
    response = requests.post(
        "https://astrasync-mcp-bridge.up.railway.app/mcp/v1",
        json={
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": "register_agent",
                "arguments": {
                    "agentName": agent_name,
                    "agentDescription": description,
                    "developerEmail": email,
                    "agentOwner": owner
                }
            }
        }
    )
    return response.json()
```

---

### Perplexity

**Status**: ❌ No MCP support yet

**Direct API Integration**:

Create a prompt that Perplexity can use to generate the correct API call:

```
To register an AI agent with AstraSync:

API Endpoint: POST https://astrasync-mcp-bridge.up.railway.app/mcp/v1
Content-Type: application/json

Request body:
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "register_agent",
    "arguments": {
      "agentName": "[Agent Name]",
      "agentDescription": "[What the agent does]",
      "developerEmail": "[Your email]",
      "agentOwner": "[Company/Owner name]"
    }
  }
}
```

---

### Google Gemini

**Status**: 🔜 MCP support coming H1 2025

**Current Workaround (Google AI Studio)**:

Use function calling:
```javascript
const astraSyncFunction = {
  name: "registerAIAgent",
  description: "Register an AI agent with AstraSync",
  parameters: {
    type: "object",
    properties: {
      agentName: { 
        type: "string",
        description: "Name of the AI agent"
      },
      agentDescription: { 
        type: "string",
        description: "What the agent does"
      },
      developerEmail: { 
        type: "string",
        description: "Developer's email address"
      },
      agentOwner: { 
        type: "string",
        description: "Company or person who owns the agent"
      }
    },
    required: ["agentName", "agentDescription", "developerEmail", "agentOwner"]
  }
};

// Implementation
async function registerAIAgent(params) {
  const response = await fetch('https://astrasync-mcp-bridge.up.railway.app/mcp/v1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { 
        name: 'register_agent', 
        arguments: params 
      }
    })
  });
  return response.json();
}
```

---

## Programming Language Examples

### Python
```python
import requests
import json

def register_agent(name, description, email, owner):
    url = "https://astrasync-mcp-bridge.up.railway.app/mcp/v1"
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "register_agent",
            "arguments": {
                "agentName": name,
                "agentDescription": description,
                "developerEmail": email,
                "agentOwner": owner
            }
        }
    }
    
    response = requests.post(url, json=payload)
    return response.json()

# Usage
result = register_agent(
    "DataBot",
    "Processes customer data",
    "dev@company.com",
    "TechCorp"
)
print(f"Registered with ID: {result['result']['content'][0]['text']}")
```

### JavaScript/TypeScript
```javascript
async function registerAgent(agentData) {
  const response = await fetch('https://astrasync-mcp-bridge.up.railway.app/mcp/v1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: 'register_agent',
        arguments: agentData
      }
    })
  });
  
  const result = await response.json();
  
  if (result.error) {
    throw new Error(result.error.message);
  }
  
  return result.result.content[0].text;
}

// Usage
try {
  const registration = await registerAgent({
    agentName: 'HelperBot',
    agentDescription: 'Assists with daily tasks',
    developerEmail: 'team@startup.com',
    agentOwner: 'StartupCo'
  });
  console.log(registration);
} catch (error) {
  console.error('Registration failed:', error);
}
```

### Go
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

type MCPRequest struct {
    JSONRPC string      `json:"jsonrpc"`
    ID      int         `json:"id"`
    Method  string      `json:"method"`
    Params  interface{} `json:"params"`
}

type RegisterParams struct {
    Name      string            `json:"name"`
    Arguments map[string]string `json:"arguments"`
}

func registerAgent(name, description, email, owner string) error {
    request := MCPRequest{
        JSONRPC: "2.0",
        ID:      1,
        Method:  "tools/call",
        Params: RegisterParams{
            Name: "register_agent",
            Arguments: map[string]string{
                "agentName":        name,
                "agentDescription": description,
                "developerEmail":   email,
                "agentOwner":       owner,
            },
        },
    }
    
    jsonData, _ := json.Marshal(request)
    resp, err := http.Post(
        "https://astrasync-mcp-bridge.up.railway.app/mcp/v1",
        "application/json",
        bytes.NewBuffer(jsonData),
    )
    
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    // Handle response...
    return nil
}
```

---

## Troubleshooting

### Common Issues

**"Method not found" error**
- Ensure you're using `"jsonrpc": "2.0"`
- Check method name is exactly `"tools/call"` or `"tools/list"`
- Verify JSON structure matches examples

**Connection refused**
- Verify URL ends with `/mcp/v1`
- Check for proxy/firewall restrictions
- Test with curl first to isolate platform issues

**"Tool not found" in AI assistant**
- Restart the AI application after configuration
- Check configuration file syntax (valid JSON)
- Verify file location is correct for your OS

**Authentication errors**
- Current preview doesn't require authentication
- If you see auth errors, you may be hitting the wrong endpoint

---

## Support

**Platform Status Updates**: Is something out of date? Let us know:
- GitHub Issue: [Create Issue](https://github.com/AstraSyncAI/astrasync-mcp-bridge/issues)
- Discord: #platform-support
- Email: platforms@astrasync.ai

**Adding New Platforms**: Know a platform that supports MCP? Submit a PR with:
1. Platform name and version
2. Configuration example
3. Any special considerations

---

*This guide is maintained in the [astrasync-mcp-bridge](https://github.com/AstraSyncAI/astrasync-mcp-bridge) repository.*