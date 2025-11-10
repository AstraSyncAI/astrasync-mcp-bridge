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
          description: 'The agent ID to verify'
        }
      },
      required: ['agentId']
    }
  },
  {
    name: 'create_account',
    description: 'Create a new AstraSync developer account',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address for the account'
        },
        password: {
          type: 'string',
          description: 'Password for the account (min 8 characters)'
        },
        fullName: {
          type: 'string',
          description: 'Full name of the developer'
        },
        accountType: {
          type: 'string',
          description: 'Account type: individual or business',
          enum: ['individual', 'business']
        }
      },
      required: ['email', 'password', 'fullName']
    }
  },
  {
    name: 'generate_api_key',
    description: 'Generate a new API key for your AstraSync account (requires authentication)',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Account email address'
        },
        password: {
          type: 'string',
          description: 'Account password'
        },
        keyName: {
          type: 'string',
          description: 'Name/label for this API key'
        }
      },
      required: ['email', 'password', 'keyName']
    }
  },
  {
    name: 'create_crypto_keypair',
    description: 'Generate a crypto keypair for signing agent registrations (requires authentication, Developer tier)',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Account email address'
        },
        password: {
          type: 'string',
          description: 'Account password'
        },
        keyName: {
          type: 'string',
          description: 'Name/label for this keypair'
        }
      },
      required: ['email', 'password']
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
            
            // Format success response with enhanced messaging
            const successMessage = [
              `Successfully registered agent: ${args.agentName}`,
              `Agent ID: ${result.agentId} (TEMPORARY - converts on account creation)`,
              `Trust Score: ${result.trustScore} (PREVIEW - becomes dynamic on account creation)`,
              `Blockchain Status: ${result.blockchain.status}`,
              '',
              'This is a PRODUCTION registration.',
              'To convert to permanent credentials, create an account at:',
              'https://www.astrasync.ai/alphaSignup',
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
            // Check for 'verified' field, not 'exists'
            if (verification && verification.verified === true) {
              // Build detailed message with all available information
              const lines = [
                `✓ Agent ${args.agentId} is registered and verified.`,
                `Name: ${verification.agent?.name || 'Unknown'}`,
                `Owner: ${verification.agent?.owner || 'Unknown'}`,
                `Trust Score: ${verification.trustScore || 'Unknown'}`,
                `Status: ${verification.status || 'active'}`,
                `Blockchain Status: ${verification.blockchain?.status || 'pending'}`
              ];
              
              if (verification.registeredAt) {
                lines.push(`Registered: ${new Date(verification.registeredAt).toLocaleString()}`);
              }
              
              // Add production message if it's a TEMP agent
              if (verification.trustScore && verification.trustScore.startsWith('TEMP')) {
                lines.push('');
                lines.push('This is a PRODUCTION agent.');
                lines.push('Create an account at https://www.astrasync.ai/alphaSignup');
                lines.push('to convert to permanent credentials.');
              }
              
              message = lines.join('\n');
            } else if (verification && verification.error) {
              // Handle error response from API
              message = `✗ Error verifying agent: ${verification.error}`;
            } else {
              // Agent not found or unexpected response
              message = `✗ Agent ${args.agentId} not found in the registry.`;
              console.error('[MCP] Unexpected verification response:', verification);
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
            
            // Check if it's a 404 (agent not found)
            if (error.message && error.message.includes('404')) {
              return res.json({
                jsonrpc: '2.0',
                id,
                result: {
                  content: [
                    {
                      type: 'text',
                      text: `✗ Agent ${args.agentId} not found in the registry.`
                    }
                  ]
                }
              });
            }
            
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

        if (name === 'create_account') {
          try {
            const result = await apiClient.createAccount({
              email: args.email,
              password: args.password,
              fullName: args.fullName,
              accountType: args.accountType || 'individual'
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
              `Login to your dashboard: https://astrasync.ai/dashboard`
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
            console.error('[MCP] Account creation error:', error);

            return res.json({
              jsonrpc: '2.0',
              id,
              error: {
                code: -32603,
                message: 'Account creation failed',
                data: error.message
              }
            });
          }
        }

        if (name === 'generate_api_key') {
          try {
            const result = await apiClient.generateApiKey({
              email: args.email,
              password: args.password,
              keyName: args.keyName
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
              `Manage your API keys: https://astrasync.ai/settings/developer-tools`
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
            console.error('[MCP] API key generation error:', error);

            return res.json({
              jsonrpc: '2.0',
              id,
              error: {
                code: -32603,
                message: 'API key generation failed',
                data: error.message
              }
            });
          }
        }

        if (name === 'create_crypto_keypair') {
          try {
            const result = await apiClient.createCryptoKeypair({
              email: args.email,
              password: args.password,
              keyName: args.keyName
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
              `Manage keypairs: https://astrasync.ai/settings/developer-tools`
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
            console.error('[MCP] Crypto keypair creation error:', error);

            // Check if it's a tier limitation error
            if (error.message && error.message.includes('tier')) {
              return res.json({
                jsonrpc: '2.0',
                id,
                error: {
                  code: -32603,
                  message: 'Tier limitation',
                  data: `Free tier allows 1 crypto keypair. Upgrade to Developer tier for unlimited keypairs: https://astrasync.ai/pricing`
                }
              });
            }

            return res.json({
              jsonrpc: '2.0',
              id,
              error: {
                code: -32603,
                message: 'Crypto keypair creation failed',
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