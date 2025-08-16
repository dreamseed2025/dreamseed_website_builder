// Load environment variables first
require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
app.use(express.json());

// Serve static files (including dashboard.html)
app.use(express.static(__dirname));

console.log('Environment check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('DreamSeed Unified Server Starting...');

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'DreamSeed Unified Server Running',
    timestamp: new Date().toISOString(),
    dashboard: 'http://localhost:3000/dashboard.html'
  });
});

// Get all dreams
app.get('/api/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dream_dashboard')
      .select('*')
      .order('completion_percentage', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search dreams by email
app.get('/api/search/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const { data, error } = await supabase
      .from('dream_dashboard')
      .select('*')
      .eq('customer_email', email);
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`DreamSeed Unified Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('   GET /dashboard.html - Dream Dashboard');
  console.log('   GET /api/search/:email - Search dreams by email');
  console.log('   GET /api/all - Get all dreams');
  console.log('');
  console.log('🔗 Open dashboard: http://localhost:3000/dashboard.html');
});

module.exports = app;
