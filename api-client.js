// api-client.js
// Handles communication with the AstraSync API

// Production API - requires authentication for all operations
const API_BASE_URL = process.env.ASTRASYNC_API_URL || 'https://astrasync.ai/api';

export async function registerAgent({ email, password, apiKey, agent }) {
  // Get authentication token
  let token;

  if (apiKey) {
    // Use API key directly
    token = apiKey;
  } else if (email && password) {
    // Login to get JWT token
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'mcp-bridge'
      },
      body: JSON.stringify({ email, password })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      throw new Error(`Authentication failed: ${error}`);
    }

    const { data } = await loginResponse.json();
    token = data.token;
  } else {
    throw new Error('Authentication required: provide either apiKey or email+password');
  }

  // Register agent with authentication
  const response = await fetch(`${API_BASE_URL}/agents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Source': 'mcp-bridge'
    },
    body: JSON.stringify(agent)
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

export async function createAccount({ email, password, fullName, accountType }) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Source': 'mcp-bridge'
    },
    body: JSON.stringify({
      email,
      password,
      fullName,
      accountType
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Account creation failed: ${error}`);
  }

  return response.json();
}

export async function generateApiKey({ email, password, keyName }) {
  // First, login to get auth token
  const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Source': 'mcp-bridge'
    },
    body: JSON.stringify({ email, password })
  });

  if (!loginResponse.ok) {
    const error = await loginResponse.text();
    throw new Error(`Authentication failed: ${error}`);
  }

  const { data } = await loginResponse.json();
  const token = data.token;

  // Now generate API key
  const apiKeyResponse = await fetch(`${API_BASE_URL}/api-keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Source': 'mcp-bridge'
    },
    body: JSON.stringify({ name: keyName })
  });

  if (!apiKeyResponse.ok) {
    const error = await apiKeyResponse.text();
    throw new Error(`API key generation failed: ${error}`);
  }

  return apiKeyResponse.json();
}

export async function createCryptoKeypair({ email, password, keyName }) {
  // First, login to get auth token
  const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Source': 'mcp-bridge'
    },
    body: JSON.stringify({ email, password })
  });

  if (!loginResponse.ok) {
    const error = await loginResponse.text();
    throw new Error(`Authentication failed: ${error}`);
  }

  const { data } = await loginResponse.json();
  const token = data.token;

  // Now create crypto keypair
  const keypairResponse = await fetch(`${API_BASE_URL}/crypto-keys/generate-mnemonic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Source': 'mcp-bridge'
    },
    body: JSON.stringify({ keyName: keyName || 'Default' })
  });

  if (!keypairResponse.ok) {
    const error = await keypairResponse.text();
    throw new Error(`Crypto keypair creation failed: ${error}`);
  }

  return keypairResponse.json();
}
