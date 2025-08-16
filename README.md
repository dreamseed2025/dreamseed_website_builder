# 🌱 DreamSeed Platform - Complete Business Formation & Website Builder

A comprehensive platform combining AI voice calls for business formation with automated website building.

## 🚀 What's Included

### 1. 🎤 VAPI Business Formation System v2.0
Complete business formation platform with AI voice calls and web calling capabilities.

**Location**: `/public/simple-vapi-webhook/`

#### Features:
- **Web browser calls** - Talk directly from your browser
- **Phone callbacks** - Server-initiated calls to your phone  
- **Smart customer journey** - 4-call progression system
- **Real-time monitoring** - Track calls and customer progress
- **Data extraction** - Automated business information capture

#### Quick Start:
```bash
cd public/simple-vapi-webhook
npm install
npm start
```

**Access Points**:
- **Web Call**: `http://localhost:3002/web-call-fixed.html`
- **Phone Callback**: `http://localhost:3002/web-call-proxy.html`
- **Admin Dashboard**: `http://localhost:3002/admin-dashboard.html`

### 2. 🌐 Website Builder System v1.3.0
Next.js application for building websites based on user profiles.

**Location**: Root directory

#### Features:
- Profile-based website generation
- Multiple modern templates
- Vercel deployment ready
- Tailwind CSS styling
- TypeScript support

#### Quick Start:
```bash
npm install
npm run dev
```

**Access**: `http://localhost:3000`

## 🔧 Environment Setup

### VAPI System Configuration
```env
# In public/simple-vapi-webhook/.env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
VAPI_API_KEY=your_vapi_private_key
VAPI_PUBLIC_KEY=your_vapi_public_key
VAPI_AGENT_ID=your_agent_id
PORT=3002
```

### Website Builder Configuration
```env
# In .env
GITHUB_TOKEN=your_github_token_here
```

## 📋 System Components

### VAPI Business Formation Journey:
1. **Call 1**: Foundation & LLC requirements
2. **Call 2**: Brand development & design
3. **Call 3**: Operations & compliance  
4. **Call 4**: Launch strategy & marketing
5. **Follow-up**: Post-completion support

### Website Builder Templates:
- Modern SaaS template
- Business profile integration
- Responsive design components
- Automated deployment

## 🛠️ Development

### Running Both Systems:

**Terminal 1 - Website Builder**:
```bash
npm run dev  # Runs on http://localhost:3000
```

**Terminal 2 - VAPI System**:
```bash
cd public/simple-vapi-webhook
npm start    # Runs on http://localhost:3002
```

### Available Scripts:
- `npm run dev` - Start website builder development server
- `npm run build` - Build website builder for production
- `npm run start` - Start website builder production server
- `npm run lint` - Run linting

## 📊 Monitoring & Admin

### VAPI System Dashboards:
- **System Overview**: `http://localhost:3002/system-home.html`
- **Call Monitoring**: `http://localhost:3002/stage-monitor.html`
- **Customer Management**: `http://localhost:3002/admin-dashboard.html`
- **Debug Tools**: `http://localhost:3002/vapi-fix-guide.html`

### API Endpoints:
- `GET /api/vapi-config` - VAPI configuration
- `POST /api/start-call` - Initiate phone callbacks
- `GET /api/customer-journey/:email` - Customer progress
- `GET /api/monitor/status` - System status

## 🚀 Deployment

### Vercel (Website Builder):
1. Connect GitHub repository to Vercel
2. Root directory automatically set to project root
3. Deploys on every push to main branch

### VAPI System:
- Can be deployed to any Node.js hosting platform
- Requires environment variables configuration
- Webhook URL must be accessible from VAPI

## 📝 Documentation

### VAPI System:
- [Complete Setup Guide](public/simple-vapi-webhook/VAPI_SETUP_GUIDE.md)
- [Troubleshooting](public/simple-vapi-webhook/VAPI_TROUBLESHOOTING.md)
- [Table of Contents](public/simple-vapi-webhook/TABLE_OF_CONTENTS.md)

### Website Builder:
- Profile-based site generation
- Template customization
- Deployment instructions

## 🔄 Version History

### v2.0.0 - VAPI Web Call Revolution
- Added web browser calling capabilities
- Phone callback fallback system
- Enhanced debugging tools
- Multiple calling interfaces

### v1.3.0 - Website Builder Enhancement
- Improved template system
- Better deployment configuration
- Enhanced user profile integration

## 🎯 Quick Links

### For Business Formation Customers:
- **Start a Call**: `http://localhost:3002/web-call-proxy.html`
- **Web Call**: `http://localhost:3002/web-call-fixed.html`

### For Website Building:
- **Build Site**: `http://localhost:3000`
- **Templates**: Available in `/templates/` directory

### For Administrators:
- **VAPI Admin**: `http://localhost:3002/admin-dashboard.html`
- **System Monitor**: `http://localhost:3002/system-home.html`

## 📜 License

MIT License - Feel free to use and modify for your business needs.

---

**DreamSeed Platform** - Revolutionizing business formation with AI voice calls and automated website building 🚀

*Generated with Claude Code*