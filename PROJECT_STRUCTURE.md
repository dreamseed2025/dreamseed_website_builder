# DreamSeed Project Structure

## 🎙️ Core Voice AI System

**Main webhook processor and orchestrator**
- `transcript-vectorizer.js` - Processes VAPI webhooks, handles call routing, transcript analysis with vector embeddings
- `smart-prompt-generator.js` - Generates personalized VAPI assistant prompts based on customer data and completion gaps
- `business-launch-checklist.js` - 108-item business formation checklist with completion tracking and readiness assessment
- `pre-call-prompt-updater.js` - Background service that updates VAPI assistants with fresh customer context every 2 minutes

**Data processing and intelligence**
- `enhanced-transcript-extractor.js` - Extracts structured business data from call transcripts using AI
- `enhanced-transcript-processor.cjs` - Legacy transcript processor (replaced by enhanced-transcript-extractor.js)
- `dream-classifier.js` - Multi-tenant dream classification system for customer segmentation

**Call management**
- `pre-call-router.js` - Routes incoming calls to appropriate assistant based on customer progress
- `smart-call-router.js` - Dynamic call routing with stage detection
- `call-monitor.cjs` - Monitors call status and health

## 🌐 Next.js Web Application

**Main application structure**
- `app/` - Next.js 13+ app directory with pages and API routes
- `lib/supabase.ts` - Supabase database client configuration
- `components/unified-header.js` - Shared navigation component
- `middleware.ts` - Authentication and routing middleware

**Key pages**
- `app/dashboard/page.tsx` - Customer dashboard showing business formation progress
- `app/vapi-dashboard/page.tsx` - Voice call interface and controls
- `app/domain-checker/page.tsx` - Domain availability checking tool
- `app/business-setup/page.tsx` - Guided business formation workflow

## 🗄️ Database & Infrastructure

**Database schema and setup**
- `supabase/` - Supabase Edge Functions for webhook handling
- `sql/` - Database migration scripts (01_create_users_table.sql through 10_add_individual_assistants.sql)
- `setup-supabase-schema.sql` - Complete database schema setup
- `expand-database-schema.sql` - Schema expansion for 108-item checklist

**Data management**
- `create-transcript-table.sql` - Call transcripts table with vector support
- `migrate-data.js` - Data migration utilities
- `list-users.js` - User listing and management

## 🧪 Testing & Development

**Core system tests**
- `tests/test-personalization-system.js` - E2E testing of customer personalization
- `tests/test-vectorization-system.js` - Vector embedding and search testing
- `tests/test-vapi-automated.js` - VAPI integration testing

**Development tools**
- `function-call-handler.js` - VAPI function calling implementation (alternative to system message approach)
- `debug-regex.js` - Utility for testing data extraction patterns
- `perfect-regex.js` - Optimized regex patterns for business data

## 🛠️ Utility Scripts

**Database operations**
- `scripts/check-recent-data.js` - Verify recent customer data
- `scripts/setup-complete-database.js` - Full database initialization
- `scripts/verify-database-setup.js` - Database health checks

**VAPI management**
- `scripts/update-vapi-assistants.js` - Bulk update VAPI assistant configurations
- `scripts/check-vapi-assistant.js` - VAPI assistant status checks
- `scripts/vapiapi.sh` - VAPI API interaction scripts

**Domain checking**
- `scripts/check-domain.sh` - Domain availability checking
- `scripts/godaddy-api-debug.sh` - GoDaddy API testing and debugging

## 🏗️ Specialized Components

**MCP (Model Context Protocol) Integration**
- `business-formation-mcp/` - Claude MCP server for business formation
- `vapi-mcp-server/` - VAPI-specific MCP implementation

**Authentication system**
- `auth/` - Authentication middleware and login interfaces

**Legacy HTML interfaces**
- `customer-dashboard.html` - Standalone customer interface
- `voice-consultation.html` - Direct voice call interface
- Various `web-voice-*.html` - Voice interface prototypes

## 📚 Documentation & Configuration

**Project documentation**
- `docs/README.md` - Main project documentation
- `docs/VAPI_SETUP.md` - VAPI integration guide
- `docs/DATABASE_SETUP_GUIDE.md` - Database setup instructions
- `docs/REORGANIZATION_PLAN.md` - Future project structure improvements

**Configuration files**
- `package.json` - Node.js dependencies and scripts
- `next-env.d.ts` - TypeScript Next.js declarations
- `templates/` - Reusable component templates

## 📦 Archived & Legacy

**Historical versions**
- `legacy/` - Old project versions and deprecated code
- `legacy/vapi-business-formation/` - Previous VAPI implementation
- `legacy/requirements-framework/` - Original requirements system

## 🎯 Key Integration Points

**Data Flow**: Customer calls → VAPI → `transcript-vectorizer.js` → Database → `smart-prompt-generator.js` → Updated VAPI assistant

**Web Interface**: Next.js app → Supabase → Customer dashboard with real-time progress

**Intelligence Layer**: Vector embeddings + 108-item checklist → Personalized conversation prompts

## 🚀 Active Services

1. **transcript-vectorizer.js** (Port 3007) - Main webhook processor
2. **pre-call-prompt-updater.js** - Background prompt updates
3. **Next.js app** - Web interface and customer portal
4. **ngrok** - Webhook tunneling for VAPI integration