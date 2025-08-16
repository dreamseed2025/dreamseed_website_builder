# 📚 DreamSeed VAPI System - Complete Table of Contents

## 🌐 All HTML Pages & Dashboards

### 🎯 Customer-Facing Pages

| Page | URL | Purpose | Key Features |
|------|-----|---------|--------------|
| **Customer Dashboard** | http://localhost:3002/customer-dashboard.html | Personalized customer portal | • Shows business formation progress<br>• Integrated web call button<br>• Displays next steps<br>• Requires URL params: `?email=...&phone=...&name=...&business=...` |
| **Web Call Button** | http://localhost:3002/web-call-button.html | Simple call interface | • One-button web calling<br>• Shows customer info<br>• VAPI integration<br>• Can use URL params for personalization |
| **Customer Onboarding Form** | http://localhost:3002/customer-onboarding-form.html | Initial customer signup | • Collects business information<br>• Triggers Call 1 automatically<br>• Saves to database |

### 🔧 Admin & Monitoring Pages

| Page | URL | Purpose | Key Features |
|------|-----|---------|--------------|
| **Admin Dashboard** | http://localhost:3002/admin-dashboard.html | Generate customer links | • Create personalized dashboard URLs<br>• View all customers<br>• Copy links to clipboard<br>• Quick access to all tools |
| **Stage Monitor** | http://localhost:3002/stage-monitor.html | Real-time call monitoring | • Live call tracking<br>• Stage progression monitoring<br>• Customer journey visualization<br>• Auto-refreshes every 5 seconds |
| **Call Dashboard** | http://localhost:3002/call-dashboard.html | Call history & analytics | • All call records<br>• Completion rates<br>• Customer progress tracking<br>• Export capabilities |
| **Web Call Dashboard** | http://localhost:3002/web-call-dashboard.html | Web call specific monitoring | • Track web-initiated calls<br>• Session analytics<br>• Browser-based call metrics |
| **Info Tracker** | http://localhost:3002/info-tracker.html | Information extraction viewer | • View extracted business data<br>• Track missing information<br>• Completion percentages<br>• Requirements validation |

### 🧪 Testing & Development Pages

| Page | URL | Purpose | Key Features |
|------|-----|---------|--------------|
| **Test Interface** | http://localhost:3002/test-interface.html | API testing tool | • Test all API endpoints<br>• Simulate webhooks<br>• Debug responses |
| **Inbound Call Tester** | http://localhost:3002/inbound-call-tester.html | Test inbound call handling | • Simulate inbound calls<br>• Test customer recognition<br>• Debug call routing |
| **Dashboard Test** | http://localhost:3002/dashboard-test.html | Dashboard functionality testing | • Test dashboard components<br>• Debug data loading |

### 📄 Legacy/Original Pages

| Page | URL | Purpose | Status |
|------|-----|---------|--------|
| **Dashboard (Original)** | http://localhost:3002/dashboard.html | Original simple dashboard | ⚠️ Superseded by customer-dashboard.html |
| **Index** | http://localhost:3002/index.html | Original landing page | ⚠️ May be outdated |

---

## 🔌 API Endpoints

### 📞 Call Management
- `POST /api/start-call` - Initiate outbound call
- `POST /api/vapi-webhook` - VAPI webhook receiver
- `GET /api/next-call-stage/:email` - Get customer's next call stage

### 👤 Customer Data
- `GET /api/customer-journey/:email` - Full customer journey data
- `GET /api/customer-completeness/:email` - Completion percentage
- `GET /api/missing-info/:email` - Missing information report
- `GET /api/progress-dashboard/:email` - Progress dashboard data

### 🌐 Web Call System
- `GET /api/vapi-config` - VAPI configuration (from .env)
- `GET /api/customer-call-url/:email` - Generate web call button URL
- `GET /api/customer-dashboard-url/:email` - Generate dashboard URL

### 📊 Monitoring
- `GET /api/monitor/status` - System status
- `GET /api/monitor/call/:callId` - Specific call details
- `GET /api/monitor/customer/:email` - Customer history
- `GET /api/monitor/stage/:stage` - Stage analytics
- `GET /api/monitor/report` - Full system report

### 🧪 Testing
- `POST /api/test-extraction` - Test data extraction
- `POST /api/test-prompt` - Test prompt generation
- `POST /api/monitor/simulate` - Simulate call events

---

## 🚀 Quick Start URLs

### For Testing Alberto (Completed Customer):
```
# Alberto's personalized dashboard
http://localhost:3002/customer-dashboard.html?email=alberto@ching.com&phone=%2B17279006911&name=Alberto+Chang&business=Alberto%27s+Apples

# Alberto's web call button
http://localhost:3002/web-call-button.html?email=alberto@ching.com&phone=%2B17279006911&name=Alberto+Chang&business=Alberto%27s+Apples
```

### For Testing New Customer:
```
# Onboarding form for new customers
http://localhost:3002/customer-onboarding-form.html

# Basic web call button (no personalization)
http://localhost:3002/web-call-button.html
```

### For Admin Management:
```
# Admin dashboard to generate all customer links
http://localhost:3002/admin-dashboard.html

# Monitor all active calls
http://localhost:3002/stage-monitor.html
```

---

## 📁 File Locations

All HTML files are located in:
```
/Users/morganwalker/DreamSeed/simple-vapi-webhook/
```

Server and backend files:
- `server.js` - Main Express server
- `dynamic-vapi-integration.js` - VAPI API integration
- `inbound-call-handler.js` - Inbound call routing
- `truth-table-extractor.js` - Data extraction system
- `requirements/` - Requirements validation framework
- `.env` - Environment variables (VAPI keys, Supabase credentials)

---

## 🔑 Environment Variables Required

In `.env` file:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
VAPI_API_KEY=your_vapi_key
VAPI_AGENT_ID=your_agent_id
PORT=3002
```

---

## 📝 Notes

1. **Customer Identification**: System recognizes customers by phone number or email
2. **Progress Tracking**: All calls automatically update customer progress in database
3. **Smart Routing**: Inbound calls automatically route to correct call stage
4. **Data Persistence**: All conversation data extracted and saved via Truth Table
5. **Web Integration**: Customers can call from web browser instead of phone

---

## 🎯 Most Important Pages

1. **Admin Dashboard** (`/admin-dashboard.html`) - Generate all customer links
2. **Customer Dashboard** (`/customer-dashboard.html`) - Customer's personalized portal
3. **Stage Monitor** (`/stage-monitor.html`) - Real-time call monitoring
4. **Customer Onboarding Form** (`/customer-onboarding-form.html`) - New customer signup

---

Last Updated: August 16, 2025