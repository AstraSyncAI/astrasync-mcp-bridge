// AstraSync MCP Bridge - Using official @modelcontextprotocol/sdk
// Migrated from custom implementation to official SDK for automatic protocol compliance

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import * as apiClient from './api-client.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Create MCP Server instance
const mcpServer = new Server(
  {
    name: 'astrasync-mcp',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Create StreamableHTTP transport (stateless mode)
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined, // Stateless mode - no session management
});

// Handle tools/list requests
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'register_agent',
        description: 'Register a new AI agent with AstraSync for compliance tracking (requires authentication)',
        inputSchema: {
          type: 'object',
          properties: {
            agentName: { type: 'string', description: 'Name of the AI agent' },
            agentDescription: { type: 'string', description: 'What the agent does' },
            agentOwner: { type: 'string', description: 'Name of the agent owner or company' },
            email: { type: 'string', description: 'Your AstraSync account email (for authentication)' },
            password: { type: 'string', description: 'Your AstraSync account password (for authentication). Not required if using apiKey.' },
            apiKey: { type: 'string', description: 'Your AstraSync API key (alternative to email/password authentication)' },
          },
          required: ['agentName', 'agentDescription', 'agentOwner', 'email'],
        },
      },
      {
        name: 'verify_agent',
        description: 'Verify if an agent is registered with AstraSync',
        inputSchema: {
          type: 'object',
          properties: {
            agentId: { type: 'string', description: 'The agent ID to verify' },
          },
          required: ['agentId'],
        },
      },
      {
        name: 'create_account',
        description: 'Create a new AstraSync developer account',
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'Email address for the account' },
            password: { type: 'string', description: 'Password for the account (min 8 characters)' },
            fullName: { type: 'string', description: 'Full name of the developer' },
            accountType: { type: 'string', description: 'Account type: individual or business', enum: ['individual', 'business'] },
          },
          required: ['email', 'password', 'fullName'],
        },
      },
      {
        name: 'generate_api_key',
        description: 'Generate a new API key for your AstraSync account (requires authentication)',
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'Account email address' },
            password: { type: 'string', description: 'Account password' },
            keyName: { type: 'string', description: 'Name/label for this API key' },
          },
          required: ['email', 'password', 'keyName'],
        },
      },
      {
        name: 'create_crypto_keypair',
        description: 'Generate a crypto keypair for signing agent registrations (requires authentication, Developer tier)',
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'Account email address' },
            password: { type: 'string', description: 'Account password' },
            keyName: { type: 'string', description: 'Name/label for this keypair' },
          },
          required: ['email', 'password'],
        },
      },
    ],
  };
});

// Handle tools/call requests
mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = request.params.arguments;

  try {
    switch (toolName) {
      case 'register_agent': {
        // Log the attempt
        await apiClient.logAttempt({
          event: 'mcp_registration_attempt',
          data: {
            email: args.email,
            agentName: args.agentName,
            source: 'mcp-http-sdk',
          },
        });

        // Call the registration API
        const result = await apiClient.registerAgent({
          email: args.email,
          password: args.password,
          apiKey: args.apiKey,
          agent: {
            name: args.agentName,
            description: args.agentDescription,
            owner: args.agentOwner,
          },
        });

        // Format success response
        const successMessage = [
          `✓ Successfully registered agent: ${args.agentName}`,
          `Agent ID: ${result.id || result.agentId}`,
          `Trust Score: ${result.trustScore || 'Pending calculation'}`,
          `Status: ${result.status || 'Active'}`,
          '',
          'Manage your agent: https://astrasync.ai/dashboard',
        ].join('\n');

        return {
          content: [
            {
              type: 'text',
              text: successMessage,
            },
          ],
        };
      }

      case 'verify_agent': {
        const verification = await apiClient.verifyAgent(args.agentId);

        let message;
        if (verification && verification.verified === true) {
          const lines = [
            `✓ Agent ${args.agentId} is registered and verified.`,
            `Name: ${verification.agent?.name || 'Unknown'}`,
            `Owner: ${verification.agent?.owner || 'Unknown'}`,
            `Trust Score: ${verification.trustScore || 'Unknown'}`,
            `Status: ${verification.status || 'active'}`,
            `Blockchain Status: ${verification.blockchain?.status || 'pending'}`,
          ];

          if (verification.registeredAt) {
            lines.push(`Registered: ${new Date(verification.registeredAt).toLocaleString()}`);
          }

          message = lines.join('\n');
        } else if (verification && verification.error) {
          message = `✗ Error verifying agent: ${verification.error}`;
        } else {
          message = `✗ Agent ${args.agentId} not found in the registry.`;
        }

        return {
          content: [
            {
              type: 'text',
              text: message,
            },
          ],
        };
      }

      case 'create_account': {
        const result = await apiClient.createAccount({
          email: args.email,
          password: args.password,
          fullName: args.fullName,
          accountType: args.accountType || 'individual',
        });

        const successMessage = [
          `✓ Account created successfully!`,
          `Email: ${args.email}`,
          `Type: ${args.accountType || 'individual'}`,
          '',
          'You can now:',
          '• Generate API keys with generate_api_key',
          '• Create crypto keypairs with create_crypto_keypair (Developer tier)',
          '• Register agents with your account',
          '',
          `Login to your dashboard: https://astrasync.ai/dashboard`,
        ].join('\n');

        return {
          content: [
            {
              type: 'text',
              text: successMessage,
            },
          ],
        };
      }

      case 'generate_api_key': {
        const result = await apiClient.generateApiKey({
          email: args.email,
          password: args.password,
          keyName: args.keyName,
        });

        const successMessage = [
          `✓ API key generated successfully!`,
          ``,
          `Key Name: ${args.keyName}`,
          `API Key: ${result.apiKey}`,
          ``,
          `⚠️  IMPORTANT: Save this API key securely!`,
          `You won't be able to see it again.`,
          ``,
          `Use this key to authenticate API requests:`,
          `Authorization: Bearer ${result.apiKey}`,
          ``,
          `Manage your API keys: https://astrasync.ai/settings/developer-tools`,
        ].join('\n');

        return {
          content: [
            {
              type: 'text',
              text: successMessage,
            },
          ],
        };
      }

      case 'create_crypto_keypair': {
        try {
          const result = await apiClient.createCryptoKeypair({
            email: args.email,
            password: args.password,
            keyName: args.keyName,
          });

          const successMessage = [
            `✓ Crypto keypair generated successfully!`,
            ``,
            `Key Name: ${args.keyName || 'Default'}`,
            `Public Key: ${result.publicKey}`,
            ``,
            `⚠️  IMPORTANT SECURITY NOTICE:`,
            `• Your mnemonic phrase has been sent to ${args.email}`,
            `• Save it securely offline - it cannot be recovered!`,
            `• Never share your mnemonic or private key`,
            `• This keypair is stored securely in your account`,
            ``,
            `You can now:`,
            `• Sign agent registrations cryptographically`,
            `• Prove ownership for secure transfers`,
            `• Boost trust scores with verified authenticity`,
            ``,
            `Tier note: Free tier allows 1 keypair, Developer tier allows unlimited.`,
            ``,
            `Manage keypairs: https://astrasync.ai/settings/developer-tools`,
          ].join('\n');

          return {
            content: [
              {
                type: 'text',
                text: successMessage,
              },
            ],
          };
        } catch (error) {
          // Check if it's a tier limitation error
          if (error.message && error.message.includes('tier')) {
            const tierMessage = `Free tier allows 1 crypto keypair. Upgrade to Developer tier for unlimited keypairs: https://astrasync.ai/pricing`;
            throw new McpError(
              ErrorCode.InvalidRequest,
              tierMessage
            );
          }
          throw error;
        }
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${toolName}`
        );
    }
  } catch (error) {
    console.error(`[MCP] Error executing tool ${toolName}:`, error);

    // If it's already an McpError, rethrow it
    if (error instanceof McpError) {
      throw error;
    }

    // Log registration failures
    if (toolName === 'register_agent') {
      await apiClient.logAttempt({
        event: 'mcp_registration_failed',
        data: {
          email: args.email,
          agentName: args.agentName,
          error: error.message,
          source: 'mcp-http-sdk',
        },
      });
    }

    // Handle 404 errors for verification
    if (toolName === 'verify_agent' && error.message && error.message.includes('404')) {
      return {
        content: [
          {
            type: 'text',
            text: `✗ Agent ${args.agentId} not found in the registry.`,
          },
        ],
      };
    }

    // Convert other errors to MCP errors
    throw new McpError(
      ErrorCode.InternalError,
      error.message || 'An error occurred'
    );
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AstraSync MCP Bridge',
    version: '2.0.0',
    sdk: '@modelcontextprotocol/sdk',
    status: 'operational',
    message: 'Official MCP SDK implementation for AstraSync Agent Registry',
    endpoints: {
      mcp: 'POST /mcp/v1 (StreamableHTTP)',
      test: 'GET /mcp/test',
      health: 'GET /health',
    },
    documentation: 'https://github.com/AstraSyncAI/astrasync-mcp-bridge',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// MCP endpoint using StreamableHTTP transport
app.post('/mcp/v1', async (req, res) => {
  // Connect server to transport on first request if not already connected
  if (!transport._started) {
    await mcpServer.connect(transport);
  }
  await transport.handleRequest(req, res, req.body);
});

// Test interface (keeping for backward compatibility)
app.get('/mcp/test', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>AstraSync MCP Bridge - Test Interface</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #1a1a1a; }
    .info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>AstraSync MCP Bridge - SDK Implementation</h1>
  <div class="info">
    <strong>✓ Now using official @modelcontextprotocol/sdk</strong>
    <p>This bridge now uses the official MCP SDK for automatic protocol compliance and version support.</p>
  </div>
  <h2>Quick Test</h2>
  <p>Test tools/list endpoint:</p>
  <pre>curl -X POST http://localhost:${port}/mcp/v1 \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'</pre>
  <h2>Available Tools</h2>
  <ul>
    <li><strong>register_agent</strong> - Register AI agents with blockchain identity</li>
    <li><strong>verify_agent</strong> - Verify agent registration status</li>
    <li><strong>create_account</strong> - Create developer account</li>
    <li><strong>generate_api_key</strong> - Generate API credentials</li>
    <li><strong>create_crypto_keypair</strong> - Generate signing keypairs</li>
  </ul>
  <p><a href="https://github.com/AstraSyncAI/astrasync-mcp-bridge">View Documentation</a></p>
</body>
</html>
  `);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Cannot ${req.method} ${req.path}`,
    suggestion: 'Check the documentation at https://github.com/AstraSyncAI/astrasync-mcp-bridge',
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
  });
});

// Start server
app.listen(port, () => {
  console.log(`AstraSync MCP Bridge (SDK) running on port ${port}`);
  console.log(`Using @modelcontextprotocol/sdk v1.21.1`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API URL: ${process.env.ASTRASYNC_API_URL || 'https://astrasync.ai/api'}`);
  console.log(`\nEndpoints:`);
  console.log(`  - MCP Protocol: POST http://localhost:${port}/mcp/v1`);
  console.log(`  - Test Interface: http://localhost:${port}/mcp/test`);
  console.log(`  - Health Check: http://localhost:${port}/health`);
});
