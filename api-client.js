// api-client.js
// Handles communication with the AstraSync API

// IMPORTANT: This is the DEVELOPER PREVIEW API
// All registrations create TEMP credentials that convert to permanent
// when you create an account at https://www.astrasync.ai/alphaSignup
const API_BASE_URL = process.env.ASTRASYNC_API_URL || 'https://astrasync-api-production.up.railway.app';

export async function registerAgent({ email, agent }) {
  const response = await fetch(`${API_BASE_URL}/v1/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Source': 'mcp-bridge'
    },
    body: JSON.stringify({ email, agent })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Registration failed: ${error}`);
  }

  return response.json();
}

export async function verifyAgent(agentId) {
  const response = await fetch(`${API_BASE_URL}/v1/verify/${agentId}`);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Verification failed: ${error}`);
  }

  return response.json();
}

export async function getAgentDetails(agentId, email) {
  const response = await fetch(`${API_BASE_URL}/v1/agent/${agentId}?email=${encodeURIComponent(email)}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const error = await response.text();
    throw new Error(`Failed to get agent details: ${error}`);
  }

  return response.json();
}

export async function logAttempt(attemptData) {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/log-attempt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'mcp-bridge'
      },
      body: JSON.stringify(attemptData)
    });
    
    // Don't throw on logging errors - we don't want to break the main flow
    if (!response.ok) {
      console.error('Failed to log attempt:', await response.text());
    }
  } catch (error) {
    console.error('Error logging attempt:', error);
  }
}