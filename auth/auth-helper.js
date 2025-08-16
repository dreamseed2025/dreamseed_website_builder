/**
 * DreamSeed Authentication Helper
 * Include this script to add authentication to any page
 */

class DreamSeedAuth {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.initialized = false;
        this.onAuthChangeCallbacks = [];
    }

    // Initialize Supabase connection
    async init() {
        try {
            const response = await fetch('/api/auth-config');
            if (response.ok) {
                const config = await response.json();
                this.supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
                
                // Listen for auth state changes
                this.supabase.auth.onAuthStateChange((event, session) => {
                    this.handleAuthChange(event, session);
                });
                
                // Check current auth state
                await this.checkAuthState();
                
                this.initialized = true;
                return true;
            } else {
                throw new Error('Could not load auth configuration');
            }
        } catch (error) {
            console.error('DreamSeedAuth initialization error:', error);
            return false;
        }
    }

    // Handle auth state changes
    async handleAuthChange(event, session) {
        console.log('Auth state changed:', event);
        
        if (session && session.user) {
            await this.loadUserData(session.user);
        } else {
            this.currentUser = null;
        }
        
        // Notify callbacks
        this.onAuthChangeCallbacks.forEach(callback => {
            callback(this.currentUser, event);
        });
    }

    // Load user data from API
    async loadUserData(user) {
        try {
            const response = await fetch('/api/auth/user', {
                headers: {
                    'Authorization': `Bearer ${(await this.supabase.auth.getSession()).data.session?.access_token}`
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                this.currentUser = userData.user;
            } else {
                this.currentUser = {
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.full_name || user.email.split('@')[0],
                    role: user.user_metadata?.account_type || 'customer'
                };
            }
        } catch (error) {
            console.error('Load user data error:', error);
            this.currentUser = null;
        }
    }

    // Check current auth state
    async checkAuthState() {
        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();
            
            if (user && !error) {
                await this.loadUserData(user);
            } else {
                this.currentUser = null;
            }
            
            return this.currentUser;
        } catch (error) {
            console.error('Check auth state error:', error);
            this.currentUser = null;
            return null;
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Check if user is customer
    isCustomer() {
        return this.currentUser && this.currentUser.role === 'customer';
    }

    // Get auth token
    async getToken() {
        try {
            const session = await this.supabase.auth.getSession();
            return session.data.session?.access_token || null;
        } catch (error) {
            console.error('Get token error:', error);
            return null;
        }
    }

    // Logout
    async logout() {
        try {
            await this.supabase.auth.signOut();
            this.currentUser = null;
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            return false;
        }
    }

    // Redirect to login if not authenticated
    requireAuth(redirectTo = null) {
        if (!this.isAuthenticated()) {
            const redirect = redirectTo || window.location.pathname;
            window.location.href = `/auth/login.html?redirect=${encodeURIComponent(redirect)}`;
            return false;
        }
        return true;
    }

    // Require admin access
    requireAdmin() {
        if (!this.requireAuth()) return false;
        
        if (!this.isAdmin()) {
            alert('Admin access required');
            return false;
        }
        return true;
    }

    // Add auth change listener
    onAuthChange(callback) {
        this.onAuthChangeCallbacks.push(callback);
    }

    // Remove auth change listener
    offAuthChange(callback) {
        const index = this.onAuthChangeCallbacks.indexOf(callback);
        if (index > -1) {
            this.onAuthChangeCallbacks.splice(index, 1);
        }
    }

    // Make authenticated API request
    async apiRequest(url, options = {}) {
        const token = await this.getToken();
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            // Token expired or invalid
            this.currentUser = null;
            this.requireAuth();
            return null;
        }
        
        return response;
    }

    // Create auth UI elements
    createAuthUI(container) {
        if (!container) return;
        
        if (this.isAuthenticated()) {
            container.innerHTML = `
                <div class="auth-ui" style="display: flex; align-items: center; gap: 15px;">
                    <div class="user-info" style="display: flex; align-items: center; gap: 10px;">
                        <div class="user-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(45deg, #ff6b6b, #ee5a24); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                            ${this.currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight: bold;">${this.currentUser.name}</div>
                            <div style="font-size: 0.8em; opacity: 0.7;">${this.currentUser.role}</div>
                        </div>
                    </div>
                    <button onclick="dreamSeedAuth.logout().then(() => window.location.reload())" 
                            style="padding: 8px 16px; border: none; border-radius: 6px; background: rgba(255,255,255,0.2); color: white; cursor: pointer;">
                        Logout
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="auth-ui">
                    <a href="/auth/login.html" style="padding: 8px 16px; border: none; border-radius: 6px; background: linear-gradient(45deg, #ff6b6b, #ee5a24); color: white; text-decoration: none; font-weight: bold;">
                        Login
                    </a>
                </div>
            `;
        }
    }

    // Show/hide elements based on auth state
    updateAuthElements() {
        // Show elements for authenticated users
        document.querySelectorAll('[data-auth="required"]').forEach(el => {
            el.style.display = this.isAuthenticated() ? '' : 'none';
        });
        
        // Hide elements for authenticated users
        document.querySelectorAll('[data-auth="guest"]').forEach(el => {
            el.style.display = this.isAuthenticated() ? 'none' : '';
        });
        
        // Show elements for admin users only
        document.querySelectorAll('[data-auth="admin"]').forEach(el => {
            el.style.display = this.isAdmin() ? '' : 'none';
        });
        
        // Show elements for customer users only
        document.querySelectorAll('[data-auth="customer"]').forEach(el => {
            el.style.display = this.isCustomer() ? '' : 'none';
        });
        
        // Update auth UI containers
        document.querySelectorAll('[data-auth="ui"]').forEach(container => {
            this.createAuthUI(container);
        });
    }
}

// Create global instance
const dreamSeedAuth = new DreamSeedAuth();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await dreamSeedAuth.init();
        dreamSeedAuth.updateAuthElements();
    });
} else {
    // DOM already loaded
    dreamSeedAuth.init().then(() => {
        dreamSeedAuth.updateAuthElements();
    });
}

// Listen for auth changes and update UI
dreamSeedAuth.onAuthChange(() => {
    dreamSeedAuth.updateAuthElements();
});

// Make it available globally
window.dreamSeedAuth = dreamSeedAuth;