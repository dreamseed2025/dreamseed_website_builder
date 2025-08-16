// Supabase Authentication Middleware for DreamSeed Platform
const { createClient } = require('@supabase/supabase-js');

class AuthMiddleware {
    constructor() {
        this.isTestMode = process.env.AUTH_TEST_MODE === 'true';
        
        if (this.isTestMode) {
            console.log('AuthMiddleware: Running in test mode');
            this.supabase = null; // Mock mode
        } else {
            this.supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );
        }
    }

    // Verify JWT token from Supabase
    async verifyToken(token) {
        if (this.isTestMode) {
            // Mock authentication for testing
            if (token === 'test-admin-token') {
                return {
                    id: 'test-admin-123',
                    email: 'admin@test.com',
                    user_metadata: {
                        full_name: 'Test Admin',
                        account_type: 'admin'
                    }
                };
            }
            if (token === 'test-customer-token') {
                return {
                    id: 'test-customer-123',
                    email: 'customer@test.com',
                    user_metadata: {
                        full_name: 'Test Customer',
                        account_type: 'customer'
                    }
                };
            }
            return null; // Invalid test token
        }
        
        try {
            const { data: { user }, error } = await this.supabase.auth.getUser(token);
            
            if (error) {
                throw error;
            }
            
            return user;
        } catch (error) {
            console.error('Token verification error:', error);
            return null;
        }
    }

    // Extract token from request
    extractToken(req) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        
        // Also check for token in cookies
        if (req.cookies && req.cookies.supabase_token) {
            return req.cookies.supabase_token;
        }
        
        return null;
    }

    // Middleware function to require authentication
    requireAuth(options = {}) {
        return async (req, res, next) => {
            try {
                const token = this.extractToken(req);
                
                if (!token) {
                    return this.handleUnauthorized(req, res, 'No authentication token provided');
                }
                
                const user = await this.verifyToken(token);
                
                if (!user) {
                    return this.handleUnauthorized(req, res, 'Invalid or expired token');
                }
                
                // Check if email is confirmed (if required)
                if (options.requireEmailConfirmed && !user.email_confirmed_at) {
                    return this.handleUnauthorized(req, res, 'Email not confirmed');
                }
                
                // Check user role if specified
                if (options.requireRole) {
                    const userRole = user.user_metadata?.account_type || 'customer';
                    if (userRole !== options.requireRole) {
                        return this.handleForbidden(req, res, 'Insufficient permissions');
                    }
                }
                
                // Add user to request object
                req.user = user;
                req.userRole = user.user_metadata?.account_type || 'customer';
                
                next();
                
            } catch (error) {
                console.error('Auth middleware error:', error);
                return this.handleUnauthorized(req, res, 'Authentication failed');
            }
        };
    }

    // Middleware to check if user is admin
    requireAdmin() {
        return this.requireAuth({ requireRole: 'admin' });
    }

    // Middleware to check if user is customer
    requireCustomer() {
        return this.requireAuth({ requireRole: 'customer' });
    }

    // Middleware to require email confirmation
    requireEmailConfirmed() {
        return this.requireAuth({ requireEmailConfirmed: true });
    }

    // Optional auth - adds user to request if authenticated, but doesn't require it
    optionalAuth() {
        return async (req, res, next) => {
            try {
                const token = this.extractToken(req);
                
                if (token) {
                    const user = await this.verifyToken(token);
                    if (user) {
                        req.user = user;
                        req.userRole = user.user_metadata?.account_type || 'customer';
                    }
                }
                
                next();
                
            } catch (error) {
                console.error('Optional auth error:', error);
                next(); // Continue even if auth fails
            }
        };
    }

    // Handle unauthorized access
    handleUnauthorized(req, res, message = 'Unauthorized') {
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(401).json({ 
                error: 'Unauthorized', 
                message: message,
                redirect: '/auth/login.html'
            });
        }
        
        // Redirect to login for HTML requests
        const redirectUrl = `/auth/login.html?redirect=${encodeURIComponent(req.originalUrl)}`;
        return res.redirect(redirectUrl);
    }

    // Handle forbidden access
    handleForbidden(req, res, message = 'Forbidden') {
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(403).json({ 
                error: 'Forbidden', 
                message: message 
            });
        }
        
        return res.status(403).send(`
            <html>
                <head><title>Access Forbidden</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1>Access Forbidden</h1>
                    <p>${message}</p>
                    <a href="/auth/login.html">Login with different account</a>
                </body>
            </html>
        `);
    }

    // Get user profile data
    async getUserProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('customer_email', userId)
                .single();
            
            if (error && error.code !== 'PGRST116') { // PGRST116 = not found
                throw error;
            }
            
            return data;
        } catch (error) {
            console.error('Get user profile error:', error);
            return null;
        }
    }

    // Create or update user profile
    async upsertUserProfile(user, additionalData = {}) {
        try {
            const profileData = {
                customer_name: user.user_metadata?.full_name || 
                             `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() ||
                             user.email.split('@')[0],
                customer_email: user.email,
                customer_phone: user.user_metadata?.phone || user.phone || null,
                business_name: user.user_metadata?.business_name || additionalData.business_name || null,
                business_type: user.user_metadata?.business_type || additionalData.business_type || null,
                state_of_operation: user.user_metadata?.state_of_operation || additionalData.state_of_operation || null,
                status: 'active',
                updated_at: new Date().toISOString(),
                ...additionalData
            };

            const { data, error } = await this.supabase
                .from('users')
                .upsert([profileData], { 
                    onConflict: 'customer_email',
                    returning: 'minimal' 
                });

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Upsert user profile error:', error);
            throw error;
        }
    }

    // Check if user has access to specific customer data
    async canAccessCustomerData(authUser, customerEmail) {
        // Admin can access all data
        if (authUser.user_metadata?.account_type === 'admin') {
            return true;
        }
        
        // Customer can only access their own data
        return authUser.email === customerEmail;
    }

    // Middleware to protect customer-specific routes
    requireCustomerAccess(emailParam = 'email') {
        return async (req, res, next) => {
            try {
                const token = this.extractToken(req);
                
                if (!token) {
                    return this.handleUnauthorized(req, res, 'Authentication required');
                }
                
                const user = await this.verifyToken(token);
                
                if (!user) {
                    return this.handleUnauthorized(req, res, 'Invalid token');
                }
                
                const customerEmail = req.params[emailParam] || req.query[emailParam];
                
                if (!customerEmail) {
                    return res.status(400).json({ error: 'Customer email required' });
                }
                
                const hasAccess = await this.canAccessCustomerData(user, customerEmail);
                
                if (!hasAccess) {
                    return this.handleForbidden(req, res, 'Access denied to this customer data');
                }
                
                req.user = user;
                req.customerEmail = customerEmail;
                next();
                
            } catch (error) {
                console.error('Customer access middleware error:', error);
                return this.handleUnauthorized(req, res, 'Authentication failed');
            }
        };
    }
}

module.exports = AuthMiddleware;