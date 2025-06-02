// mcp-handler.js
// Handles MCP protocol over HTTP for AstraSync

const TOOLS = [
  {
    name: 'register_agent',
    description: 'Register a new AI agent with AstraSync for compliance tracking',
    inputSchema: {
      type: 'object',
      properties: {
        agentName: {
          type: 'string',
          description: 'Name of the AI agent'
        },
        agentDescription: {
          type: 'string',
          description: 'What the agent does'
        },
        developerEmail: {
          type: 'string',
          description: 'Email of the developer (required for future account linking)'
        },
        agentOwner: {
          type: 'string',
          description: 'Name of the agent owner or company'
        }
      },
      required: ['agentName', 'agentDescription', 'developerEmail', 'agentOwner']
    }
  },
  {
    name: 'verify_agent',
    description: 'Verify if an agent is registered with AstraSync',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: {
          type: 'string',
          description: 'The TEMP-XXXXX ID to verify'
        }
      },
      required: ['agentId']
    }
  }
];

export async function handleMCPRequest(req, res, apiClient) {
  console.log('[MCP] Incoming request:', JSON.stringify(req.body, null, 2));
  
  const { jsonrpc, method, params, id } = req.body;
  
  // Validate JSON-RPC 2.0 format
  if (jsonrpc !== '2.0') {
    return res.status(400).json({
      jsonrpc: '2.0',
      id: id || null,
      error: {
        code: -32600,
        message: 'Invalid Request - must be JSON-RPC 2.0'
      }
    });
  }
  
  try {
    // Handle different MCP methods
    switch (method) {
      case 'initialize':
        // MCP initialization handshake
        return res.json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
              resources: {}
            },
            serverInfo: {
              name: 'astrasync-mcp',
              version: '1.0.0'
            }
          }
        });
        
      case 'tools/list':
        // Return available tools
        return res.json({
          jsonrpc: '2.0',
          id,
          result: {
            tools: TOOLS
          }
        });
        
      case 'tools/call':
        // Execute tool calls
        const { name, arguments: args } = params;
        
        if (name === 'register_agent') {
          try {
            // Log the attempt first
            await apiClient.logAttempt({
              event: 'mcp_registration_attempt',
              data: {
                email: args.developerEmail,
                agentName: args.agentName,
                source: 'mcp-http'
              }
            });
            
            // Call the registration API
            const result = await apiClient.registerAgent({
              email: args.developerEmail,
              agent: {
                name: args.agentName,
                description: args.agentDescription,
                owner: args.agentOwner,
                capabilities: [],
                version: '1.0.0'
              }
            });
            
            // Format success response
            const successMessage = [
              `Successfully registered agent: ${args.agentName}`,
              `Agent ID: ${result.agentId}`,
              `Trust Score: ${result.trustScore.score}`,
              `Blockchain Status: ${result.blockchain.status}`,
              '',
              'Save this Agent ID for future reference.'
            ].join('\n');
            
            return res.json({
              jsonrpc: '2.0',
              id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: successMessage
                  }
                ]
              }
            });
          } catch (error) {
            console.error('[MCP] Registration error:', error);
            
            await apiClient.logAttempt({
              event: 'mcp_registration_failed',
              data: {
                email: args.developerEmail,
                agentName: args.agentName,
                error: error.message,
                source: 'mcp-http'
              }
            });
            
            return res.json({
              jsonrpc: '2.0',
              id,
              error: {
                code: -32603,
                message: 'Registration failed',
                data: error.message
              }
            });
          }
        }
        
        if (name === 'verify_agent') {
          try {
            const verification = await apiClient.verifyAgent(args.agentId);
            
            let message;
            if (verification.exists) {
              // Try to get more details if we can
              try {
                const details = await apiClient.getAgentDetails(args.agentId, 'unknown@mcp.com');
                if (details) {
                  message = [
                    `✓ Agent ${args.agentId} is registered and active.`,
                    `Name: ${details.name}`,
                    `Owner: ${details.owner}`,
                    `Registered: ${new Date(details.registeredAt).toLocaleString()}`,
                    `Status: ${verification.status || 'active'}`
                  ].join('\n');
                } else {
                  message = `✓ Agent ${args.agentId} is registered and active.`;
                }
              } catch {
                // If details fail, just use basic verification
                message = `✓ Agent ${args.agentId} is registered and active.`;
              }
            } else {
              message = `✗ Agent ${args.agentId} not found in the registry.`;
            }
            
            return res.json({
              jsonrpc: '2.0',
              id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: message
                  }
                ]
              }
            });
          } catch (error) {
            console.error('[MCP] Verification error:', error);
            
            return res.json({
              jsonrpc: '2.0',
              id,
              error: {
                code: -32603,
                message: 'Verification failed',
                data: error.message
              }
            });
          }
        }
        
        // Unknown tool
        return res.json({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Unknown tool: ${name}`
          }
        });
        
      default:
        // Unknown method
        return res.json({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`
          }
        });
    }
  } catch (error) {
    console.error('[MCP] Unexpected error:', error);
    return res.json({
      jsonrpc: '2.0',
      id: id || null,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error.message
      }
    });
  }
}