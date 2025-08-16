const express = require('express');
const app = express();

// Simple health check
app.get('/api', (req, res) => {
  res.json({ 
    status: 'DreamSeed API Running',
    timestamp: new Date().toISOString()
  });
});

// VAPI configuration endpoint
app.get('/api/vapi-config', (req, res) => {
  res.json({
    publicKey: process.env.VAPI_PUBLIC_KEY,
    privateKey: process.env.VAPI_API_KEY,
    assistantId: process.env.VAPI_AGENT_ID
  });
});

module.exports = app;