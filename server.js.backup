// Load environment variables first
require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cookieParser = require('cookie-parser');

// Import auth middleware
const AuthMiddleware = require('./auth/auth-middleware');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Serve static files (including dashboard.html)
app.use(express.static(__dirname));

console.log('Environment check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
console.log('AUTH_TEST_MODE:', process.env.AUTH_TEST_MODE ? 'Enabled' : 'Disabled');

// Initialize Supabase client
let supabase = null;
if (process.env.AUTH_TEST_MODE === 'true') {
  console.log('Running in auth test mode - Supabase features limited');
  // Create a mock Supabase client for testing
  supabase = {
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => ({ data: [], error: null })
        }),
        eq: () => ({ data: [], error: null })
      }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      upsert: () => ({ data: [], error: null })
    })
  };
} else {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Initialize auth middleware
const auth = new AuthMiddleware();

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

// === Authentication Endpoints ===

// Get VAPI configuration for frontend
app.get('/api/vapi-config', (req, res) => {
  res.json({
    publicKey: process.env.VAPI_PUBLIC_KEY,
    privateKey: process.env.VAPI_API_KEY || process.env.VAPI_PRIVATE_KEY, // Use VAPI_API_KEY from Vercel
    assistantId: process.env.VAPI_AGENT_ID || process.env.VAPI_ASSISTANT_ID || null,
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || null,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || null,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || null
  });
});

// Get auth configuration for frontend
app.get('/api/auth-config', (req, res) => {
  if (process.env.AUTH_TEST_MODE === 'true') {
    res.json({
      supabaseUrl: 'https://test-project.supabase.co',
      supabaseAnonKey: 'test-anon-key',
      testMode: true,
      message: 'Authentication test mode enabled'
    });
  } else {
    res.json({
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
      testMode: false
    });
  }
});

// Get current user
app.get('/api/auth/user', auth.optionalAuth(), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Get user profile if customer
    let profile = null;
    if (req.userRole === 'customer') {
      profile = await auth.getUserProfile(req.user.email);
    }
    
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.user_metadata?.full_name || req.user.email.split('@')[0],
        role: req.userRole,
        email_confirmed: !!req.user.email_confirmed_at,
        profile: profile
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Update user profile
app.put('/api/auth/profile', auth.requireAuth(), async (req, res) => {
  try {
    const { business_name, business_type, state_of_operation, phone } = req.body;
    
    const updatedProfile = await auth.upsertUserProfile(req.user, {
      business_name,
      business_type,
      state_of_operation,
      customer_phone: phone
    });
    
    res.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Admin-only endpoint example
app.get('/api/admin/users', auth.requireAdmin(), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Customer data with access control
app.get('/api/customer/:email', auth.requireCustomerAccess(), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('customer_email', req.customerEmail)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    res.json(data || null);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to get customer data' });
  }
});

// === Payment Management Endpoints ===

// Get user payment status
app.get('/api/payment/status', auth.requireAuth(), async (req, res) => {
  try {
    const { data, error } = await supabase
      .rpc('check_payment_status', { user_auth_id: req.user.id });
    
    if (error) throw error;
    
    res.json(data[0] || { payment_status: 'unpaid' });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

// Update payment status (admin or payment webhook)
app.post('/api/payment/update', auth.requireAuth(), async (req, res) => {
  try {
    const { 
      payment_status, 
      amount, 
      payment_method, 
      stripe_customer_id, 
      subscription_type,
      notes 
    } = req.body;
    
    // Only admins or the user themselves can update payment status
    let targetUserId = req.user.id;
    if (req.body.user_id && req.userRole === 'admin') {
      targetUserId = req.body.user_id;
    }
    
    const { data, error } = await supabase
      .rpc('update_payment_status', {
        user_auth_id: targetUserId,
        new_payment_status: payment_status,
        paid_amount: amount,
        payment_method_used: payment_method,
        stripe_customer: stripe_customer_id,
        subscription_type_used: subscription_type || 'basic',
        notes: notes
      });
    
    if (error) throw error;
    
    res.json({ success: true, updated: data });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Get payment dashboard (admin only)
app.get('/api/admin/payments', auth.requireAdmin(), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payment_dashboard')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    console.error('Get payment dashboard error:', error);
    res.status(500).json({ error: 'Failed to get payment dashboard' });
  }
});

// Stripe webhook endpoint (for payment processing)
app.post('/api/payment/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    // TODO: Verify Stripe signature in production
    
    const event = JSON.parse(req.body);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email;
      
      if (customerEmail) {
        // Find user by email and update payment status
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('auth_user_id')
          .eq('customer_email', customerEmail)
          .single();
        
        if (userData && !userError) {
          await supabase.rpc('update_payment_status', {
            user_auth_id: userData.auth_user_id,
            new_payment_status: 'paid',
            paid_amount: session.amount_total / 100,
            payment_method_used: 'stripe',
            stripe_customer: session.customer,
            subscription_type_used: session.metadata?.subscription_type || 'basic',
            notes: `Stripe payment: ${session.payment_intent}`
          });
        }
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook failed' });
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
