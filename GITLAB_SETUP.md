# 🚀 GitLab Setup & Auto-Deployment

## Quick Setup Steps

### 1. Create GitLab Repository

1. Go to [gitlab.com](https://gitlab.com) and create a new project
2. Name it: `simple-vapi-webhook`
3. Keep it private or public as you prefer

### 2. Add GitLab Remote to Your Local Repository

```bash
# Add GitLab as a remote (replace with your GitLab repo URL)
git remote add gitlab git@gitlab.com:YOUR_USERNAME/simple-vapi-webhook.git

# Or if using HTTPS:
git remote add gitlab https://gitlab.com/YOUR_USERNAME/simple-vapi-webhook.git

# Verify remotes
git remote -v
```

### 3. Push to GitLab

```bash
# Push to GitLab
git push -u gitlab main

# Or if your branch is called master:
git push -u gitlab master
```

### 4. Configure GitLab CI/CD Variables

Go to your GitLab project → Settings → CI/CD → Variables and add:

```
SSH_PRIVATE_KEY     = Your server's SSH private key
SERVER_HOST         = Your server's domain/IP
SERVER_USER         = Your server username
SERVER_PATH         = /var/www/dreamseed-vapi (or your path)
VERCEL_TOKEN        = Your Vercel token (optional)

# Your app environment variables
VAPI_PUBLIC_KEY     = 360c27df-9f83-4b80-bd33-e17dbcbf4971
VAPI_API_KEY        = Your VAPI API key
VAPI_AGENT_ID       = Your VAPI agent ID
SUPABASE_URL        = Your Supabase URL
SUPABASE_SERVICE_ROLE_KEY = Your Supabase key
```

### 5. Server Setup (One-time)

SSH into your server and run:

```bash
# Create directory
sudo mkdir -p /var/www/dreamseed-vapi
sudo chown $USER:$USER /var/www/dreamseed-vapi
cd /var/www/dreamseed-vapi

# Clone from GitLab
git clone git@gitlab.com:YOUR_USERNAME/simple-vapi-webhook.git .

# Install dependencies
npm install --production

# Install PM2 for process management
npm install -g pm2

# Create .env file with your variables
nano .env
# Add your environment variables here

# Start the application
pm2 start server.js --name dreamseed-vapi
pm2 save
pm2 startup  # Follow the instructions to enable auto-start
```

### 6. Configure Nginx (for HTTPS)

Create nginx config: `/etc/nginx/sites-available/dreamseed-vapi`

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/dreamseed-vapi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🎯 Auto-Deployment Workflow

### Option 1: GitLab CI/CD (Automatic)

Every push to `main` branch will automatically:
1. Run the GitLab CI/CD pipeline
2. Connect to your server via SSH
3. Pull latest code
4. Install dependencies
5. Restart the application

### Option 2: Manual Deployment Script

```bash
# Edit deploy-to-server.sh with your server details
nano deploy-to-server.sh

# Run deployment
./deploy-to-server.sh
```

### Option 3: GitHub to GitLab Mirror

Set up repository mirroring:
1. GitLab → Settings → Repository → Mirroring repositories
2. Add GitHub URL: `https://github.com/dreamseed2025/dreamseed_website_builder.git`
3. Set direction: Pull
4. Mirror will sync automatically

## 🔄 Continuous Deployment Flow

```
Local Changes → Git Push → GitLab → CI/CD Pipeline → Server Deployment
                              ↓
                        Vercel (optional)
```

## 🛠️ Useful Commands

```bash
# Push to both GitHub and GitLab
git push origin main && git push gitlab main

# Check deployment status on server
ssh user@server "pm2 status"

# View server logs
ssh user@server "pm2 logs dreamseed-vapi"

# Restart manually
ssh user@server "pm2 restart dreamseed-vapi"
```

## ✅ Benefits

- **Auto-deployment** on every push
- **HTTPS enabled** for voice calls
- **Process management** with PM2
- **CI/CD pipeline** for testing
- **Multiple deployment targets** (Server + Vercel)

---

Ready? Start with step 1: Create your GitLab repository!