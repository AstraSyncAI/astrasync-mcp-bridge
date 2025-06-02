// index.js
// AstraSync MCP Bridge - HTTP server for Model Context Protocol

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleMCPRequest } from './mcp-handler.js';
import * as apiClient from './api-client.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AstraSync MCP Bridge',
    version: '1.0.0',
    status: 'operational',
    message: 'HTTP bridge for Model Context Protocol (MCP) to AstraSync Agent Registry',
    endpoints: {
      mcp: 'POST /mcp/v1',
      test: 'GET /mcp/test',
      health: 'GET /health'
    },
    documentation: 'https://github.com/AstraSyncAI/astrasync-mcp-bridge'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// MCP endpoint
app.post('/mcp/v1', async (req, res) => {
  await handleMCPRequest(req, res, apiClient);
});

// Test interface
app.get('/mcp/test', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AstraSync MCP Test Interface</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f7fa;
      color: #333;
      line-height: 1.6;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    
    h1 {
      color: #1a1a1a;
      margin-bottom: 10px;
      font-size: 28px;
    }
    
    .subtitle {
      color: #666;
      font-size: 16px;
    }
    
    .section {
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    
    h2 {
      color: #333;
      margin-bottom: 15px;
      font-size: 20px;
    }
    
    h3 {
      color: #444;
      margin-bottom: 10px;
      font-size: 18px;
    }
    
    .code-block {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      overflow-x: auto;
      border: 1px solid #e1e4e8;
      margin: 15px 0;
    }
    
    .endpoint {
      color: #0366d6;
      font-weight: bold;
    }
    
    .method {
      color: #28a745;
      font-weight: bold;
    }
    
    button {
      background: #0366d6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
      transition: background 0.2s;
    }
    
    button:hover {
      background: #0256c7;
    }
    
    button:active {
      background: #024a9e;
    }
    
    #result {
      margin-top: 20px;
      padding: 20px;
      background: #f6f8fa;
      border-radius: 8px;
      white-space: pre-wrap;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e1e4e8;
    }
    
    #result.success {
      background: #f0fdf4;
      border-color: #86efac;
    }
    
    #result.error {
      background: #fef2f2;
      border-color: #fca5a5;
    }
    
    .test-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    
    .info-box {
      background: #e3f2fd;
      border: 1px solid #90caf9;
      padding: 15px;
      border-radius: 6px;
      margin-top: 15px;
    }
    
    .info-box p {
      margin: 5px 0;
    }
    
    pre {
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>AstraSync MCP Test Interface</h1>
      <p class="subtitle">Test the Model Context Protocol (MCP) integration over HTTP</p>
    </header>
    
    <div class="section">
      <h2>Quick Test</h2>
      <p>Test the MCP endpoint to ensure it's working correctly:</p>
      <div class="test-actions">
        <button onclick="testListTools()">Test List Tools</button>
        <button onclick="testRegisterAgent()">Test Register Agent</button>
        <button onclick="testVerifyAgent()">Test Verify Agent</button>
      </div>
      <div id="result"></div>
    </div>
    
    <div class="section">
      <h2>Integration Instructions</h2>
      <p>To integrate with your AI assistant, use the following endpoint:</p>
      <div class="code-block">
        <span class="method">POST</span> <span class="endpoint">https://astrasync-mcp-bridge.up.railway.app/mcp/v1</span>
      </div>
      
      <h3>Configuration for AI Assistants</h3>
      <div class="code-block">
<pre>{
  "mcpServers": {
    "astrasync": {
      "url": "https://astrasync-mcp-bridge.up.railway.app/mcp/v1",
      "transport": "http"
    }
  }
}</pre>
      </div>
    </div>
    
    <div class="section">
      <h3>Example: List Available Tools</h3>
      <div class="code-block">
<pre>{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}</pre>
      </div>
      
      <h3>Example: Register an Agent</h3>
      <div class="code-block">
<pre>{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "register_agent",
    "arguments": {
      "agentName": "Customer Support Bot",
      "agentDescription": "Handles customer inquiries via chat",
      "developerEmail": "developer@example.com",
      "agentOwner": "ACME Corp"
    }
  }
}</pre>
      </div>
      
      <h3>Example: Verify an Agent</h3>
      <div class="code-block">
<pre>{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "verify_agent",
    "arguments": {
      "agentId": "TEMP-1234567-ABCDE"
    }
  }
}</pre>
      </div>
    </div>
    
    <div class="section">
      <h2>Need Help?</h2>
      <p>Check out our documentation on GitHub: <a href="https://github.com/AstraSyncAI/astrasync-mcp-bridge" target="_blank">AstraSync MCP Bridge</a></p>
      <div class="info-box">
        <p><strong>Note:</strong> This is a developer preview. No authentication is required.</p>
        <p>Registered agents receive temporary IDs (TEMP-XXXXX) that will be migrated to permanent IDs when you create an account.</p>
      </div>
    </div>
  </div>
  
  <script>
    const resultDiv = document.getElementById('result');
    
    async function makeRequest(body) {
      resultDiv.textContent = 'Loading...';
      resultDiv.className = '';
      
      try {
        const response = await fetch('/mcp/v1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
        
        const data = await response.json();
        resultDiv.textContent = JSON.stringify(data, null, 2);
        
        if (data.error) {
          resultDiv.className = 'error';
        } else {
          resultDiv.className = 'success';
        }
      } catch (error) {
        resultDiv.textContent = 'Error: ' + error.message;
        resultDiv.className = 'error';
      }
    }
    
    function testListTools() {
      makeRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      });
    }
    
    function testRegisterAgent() {
      const name = prompt('Agent name:', 'Test Bot ' + Date.now());
      const email = prompt('Developer email:', 'test@example.com');
      
      if (name && email) {
        makeRequest({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: 'register_agent',
            arguments: {
              agentName: name,
              agentDescription: 'Test agent created via MCP test interface',
              developerEmail: email,
              agentOwner: 'Test Company'
            }
          }
        });
      }
    }
    
    function testVerifyAgent() {
      const agentId = prompt('Enter Agent ID to verify:', 'TEMP-');
      
      if (agentId) {
        makeRequest({
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'verify_agent',
            arguments: {
              agentId: agentId
            }
          }
        });
      }
    }
  </script>
</body>
</html>
  `;
  
  res.header('Content-Type', 'text/html').send(html);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Cannot ${req.method} ${req.path}`,
    suggestion: 'Check the documentation at https://github.com/AstraSyncAI/astrasync-mcp-bridge'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`AstraSync MCP Bridge running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API URL: ${process.env.ASTRASYNC_API_URL || 'https://astrasync-api-production.up.railway.app'}`);
  console.log(`\nEndpoints:`);
  console.log(`  - MCP Protocol: POST http://localhost:${port}/mcp/v1`);
  console.log(`  - Test Interface: http://localhost:${port}/mcp/test`);
  console.log(`  - Health Check: http://localhost:${port}/health`);
});