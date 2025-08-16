# 🔐 DreamSeed Supabase Authentication System

Complete authentication system for the DreamSeed Platform using Supabase Auth.

## 🚀 Features

### ✅ Authentication Methods
- **Email/Password** registration and login
- **Social login** with Google and GitHub
- **Email verification** for new accounts
- **Password reset** functionality
- **Role-based access** (Admin/Customer)

### 🛡️ Security Features
- **JWT tokens** for secure API access
- **Protected routes** with middleware
- **Role-based authorization** 
- **Session management** with automatic refresh
- **CSRF protection** with cookies

### 🎯 User Management
- **User profiles** with business information
- **Account types** (Customer/Admin)
- **Profile updates** and data management
- **Customer journey** integration

## 📁 File Structure

```
auth/
├── login.html              # Login page with social auth
├── signup.html             # Registration with business info
├── auth-middleware.js      # Server-side auth middleware
├── auth-helper.js          # Client-side auth library
└── README.md              # This documentation
```

## 🔧 Setup Instructions

### 1. Environment Variables

Add to your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_public_key

# Optional: Social Auth (configure in Supabase dashboard)
# Google OAuth, GitHub OAuth, etc.
```

### 2. Supabase Setup

#### Enable Authentication:
1. Go to your Supabase dashboard
2. Navigate to Authentication > Settings
3. Configure your site URL: `http://localhost:3002`
4. Add redirect URLs for auth flows

#### Enable Social Providers (Optional):
1. Go to Authentication > Providers
2. Enable Google, GitHub, etc.
3. Add your OAuth app credentials

#### Row Level Security:
The system includes RLS policies for the `users` table.

### 3. Database Schema

The auth system extends your existing `users` table:

```sql
-- Your existing users table works with auth
-- Additional columns are handled automatically
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);
```

## 🎯 Usage Guide

### Basic Authentication

#### Include Auth Library:
```html
<!-- Add Supabase client -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<!-- Add DreamSeed auth helper -->
<script src="/auth/auth-helper.js"></script>
```

#### Check Authentication:
```javascript
// Wait for auth to initialize
await dreamSeedAuth.init();

// Check if user is logged in
if (dreamSeedAuth.isAuthenticated()) {
    const user = dreamSeedAuth.getCurrentUser();
    console.log('User:', user);
}

// Require authentication
if (!dreamSeedAuth.requireAuth()) {
    // User will be redirected to login
    return;
}
```

#### Admin-Only Areas:
```javascript
// Require admin access
if (!dreamSeedAuth.requireAdmin()) {
    // Access denied
    return;
}
```

### HTML Auth Elements

Use `data-auth` attributes for automatic show/hide:

```html
<!-- Show only when authenticated -->
<div data-auth="required">
    Welcome back! <button onclick="dreamSeedAuth.logout()">Logout</button>
</div>

<!-- Show only for guests -->
<div data-auth="guest">
    <a href="/auth/login.html">Login</a>
    <a href="/auth/signup.html">Sign Up</a>
</div>

<!-- Admin only -->
<div data-auth="admin">
    <a href="/admin-dashboard.html">Admin Panel</a>
</div>

<!-- Customer only -->
<div data-auth="customer">
    <a href="/customer-dashboard.html">My Dashboard</a>
</div>

<!-- Auto-generated auth UI -->
<div data-auth="ui"></div>
```

### Server-Side Protection

#### Protect Routes:
```javascript
const auth = new AuthMiddleware();

// Require any authentication
app.get('/protected', auth.requireAuth(), (req, res) => {
    res.json({ user: req.user });
});

// Admin only
app.get('/admin', auth.requireAdmin(), (req, res) => {
    res.json({ message: 'Admin area' });
});

// Customer access to their own data
app.get('/customer/:email', auth.requireCustomerAccess(), (req, res) => {
    // req.customerEmail is validated
    res.json({ customerEmail: req.customerEmail });
});
```

#### Optional Authentication:
```javascript
// Add user data if available, but don't require auth
app.get('/public', auth.optionalAuth(), (req, res) => {
    if (req.user) {
        res.json({ message: `Hello ${req.user.email}` });
    } else {
        res.json({ message: 'Hello guest' });
    }
});
```

## 🔗 Auth Flow URLs

### Authentication Pages:
- **Login**: `/auth/login.html`
- **Sign Up**: `/auth/signup.html`
- **Dashboard**: `/dashboard.html` (protected)

### API Endpoints:
- **Auth Config**: `GET /api/auth-config`
- **Current User**: `GET /api/auth/user`
- **Update Profile**: `PUT /api/auth/profile`
- **Admin Users**: `GET /api/admin/users` (admin only)

## 🎨 Customization

### Styling
All auth pages use the DreamSeed design system:
- Gradient backgrounds
- Glass-morphism effects
- Consistent color scheme
- Responsive design

### User Roles
- **Customer**: Business formation users
- **Admin**: Platform administrators

### Profile Fields
Customer profiles include:
- Personal information (name, email, phone)
- Business information (name, type, state)
- Call progress tracking
- Journey status

## 🔒 Security Features

### Token Management
- **JWT tokens** with automatic refresh
- **Secure cookies** for session storage
- **Token validation** on every request

### Access Control
- **Role-based permissions**
- **Customer data isolation**
- **Admin privilege escalation**

### Data Protection
- **Row Level Security** in Supabase
- **Input validation** on all forms
- **CSRF protection** with proper headers

## 🧪 Testing

### Test User Accounts
Create test accounts for each role:

```javascript
// Test customer signup
const customerData = {
    email: 'customer@test.com',
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'Customer',
    phone: '+1234567890',
    businessName: 'Test Business',
    accountType: 'customer'
};

// Test admin signup
const adminData = {
    email: 'admin@test.com',
    password: 'AdminPass123!',
    firstName: 'Test',
    lastName: 'Admin',
    phone: '+1234567890',
    accountType: 'admin'
};
```

### Test Scenarios
1. **User Registration**: Test email/password and social registration
2. **Login Flow**: Test various login methods and redirects
3. **Protected Pages**: Verify auth requirements work
4. **Role Access**: Test admin vs customer access
5. **Profile Updates**: Test profile modification
6. **Password Reset**: Test reset email flow

## 🚨 Troubleshooting

### Common Issues

#### "Authentication system unavailable"
- Check SUPABASE_URL and SUPABASE_ANON_KEY in .env
- Verify Supabase project is active
- Check /api/auth-config endpoint

#### "Invalid token" errors
- Check token expiration
- Verify SUPABASE_SERVICE_ROLE_KEY
- Clear browser storage and re-login

#### Social login not working
- Verify OAuth provider setup in Supabase
- Check redirect URLs configuration
- Ensure provider credentials are correct

#### Profile data not saving
- Check users table permissions
- Verify RLS policies
- Check server logs for errors

### Debug Mode
Add to HTML for debug info:
```html
<script>
dreamSeedAuth.onAuthChange((user, event) => {
    console.log('Auth changed:', event, user);
});
</script>
```

## 🔄 Migration from Non-Auth System

### Existing Users
```javascript
// Convert existing users to auth users
app.post('/migrate-user', async (req, res) => {
    const { email, userData } = req.body;
    
    // Create auth user
    const { data: authUser, error } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: userData
    });
    
    // Link to existing profile
    await supabase
        .from('users')
        .update({ auth_user_id: authUser.user.id })
        .eq('customer_email', email);
});
```

### URL Updates
- Update bookmarks to use new auth-protected URLs
- Add authentication to existing customer dashboard links
- Protect admin areas with proper auth

## 📚 Integration Examples

### VAPI System Integration
```javascript
// Protect VAPI admin pages
app.use('/admin-dashboard.html', auth.requireAdmin());
app.use('/customer-dashboard.html', auth.requireAuth());

// Customer-specific call URLs
app.get('/api/customer-call-url/:email', auth.requireCustomerAccess(), (req, res) => {
    // Generate authenticated call URL
    const callUrl = `/web-call-button.html?email=${req.customerEmail}&auth=true`;
    res.json({ callUrl });
});
```

### Website Builder Integration
```javascript
// Protect website builder based on user type
app.get('/build-website', auth.requireAuth(), (req, res) => {
    if (req.userRole === 'customer') {
        // Customer can build their own website
        res.redirect('/website-builder');
    } else {
        // Admin can build any website
        res.redirect('/admin-website-builder');
    }
});
```

---

**DreamSeed Authentication v2.0** - Secure, scalable, and user-friendly! 🔐

*Generated with Claude Code*