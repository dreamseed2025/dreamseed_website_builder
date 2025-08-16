# Vapi.ai Business Formation System

A complete voice AI business formation system that captures customer data through 4 sequential phone calls and tracks the entire funnel with analytics.

## 🎯 What This System Does

**Automated 4-Call Business Formation Funnel:**
1. **Call 1**: Business Concept Discovery - Captures business ideas, target market, revenue model
2. **Call 2**: Legal Formation Planning - Captures entity type, state, business name, compliance needs  
3. **Call 3**: Banking & Operations Setup - Captures banking, payment processing, accounting preferences
4. **Call 4**: Website & Marketing Planning - Captures website requirements, branding, package selection

**Features:**
- ✅ Automatic conversation transcript analysis
- ✅ AI-powered data extraction from voice conversations
- ✅ Complete customer and business formation tracking
- ✅ Real-time analytics dashboard with conversion funnel
- ✅ State-by-state performance metrics
- ✅ Revenue tracking and package selection
- ✅ Sentiment analysis and confidence scoring

## 🛠 System Architecture

```
Phone Call → Vapi Assistant → Webhook → Supabase Edge Function → Database
                    ↓
              OpenAI Data Extraction → Structured Data Storage → Analytics
```

**Components:**
- **Vapi.ai**: Voice AI assistants for each call
- **Supabase**: Database, Edge Functions, hosting
- **OpenAI**: Conversation data extraction
- **Custom Webhooks**: Process call data in real-time

## 📋 Prerequisites

1. **Vapi.ai Account** with 4 configured assistants
2. **Supabase Project** (plmmudazcsiksgmgphte.supabase.co)
3. **OpenAI API Key** for data extraction
4. **Supabase CLI** installed globally
5. **Deno** runtime for scripts

## 🚀 Setup Instructions

### Step 1: Environment Configuration

Create `.env` file with your API keys:

```bash
cp .env.example .env
# Edit .env with your actual API keys
```

Required variables:
```env
SUPABASE_URL=https://plmmudazcsiksgmgphte.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
VAPI_API_KEY=your_vapi_api_key
WEBHOOK_SECRET=your_secure_webhook_secret
```

### Step 2: Deploy to Supabase

```bash
# Make deploy script executable
chmod +x scripts/deploy-supabase.sh

# Deploy database and functions
./scripts/deploy-supabase.sh
```

This will:
- Deploy database schema with all tables
- Deploy 4 webhook Edge Functions  
- Deploy analytics dashboard function
- Link to your Supabase project

### Step 3: Set Environment Variables

In your Supabase dashboard, go to Project Settings → Edge Functions and set:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_key_here
supabase secrets set VAPI_API_KEY=your_vapi_key_here
supabase secrets set VAPI_ASSISTANT_CALL_1=5ef9abf6-66b4-4457-9848-ee5436d6191f
supabase secrets set VAPI_ASSISTANT_CALL_2=eb760659-21ba-4f94-a291-04f0897f0328
supabase secrets set VAPI_ASSISTANT_CALL_3=65ddc60b-b813-49b6-9986-38ee2974cfc9
supabase secrets set VAPI_ASSISTANT_CALL_4=af397e88-c286-416f-9f74-e7665401bdb7
supabase secrets set WEBHOOK_SECRET=your_webhook_secret
```

### Step 4: Configure Vapi Assistants

```bash
# Set your Vapi API key
export VAPI_API_KEY=your_vapi_key_here

# Configure webhook URLs
deno run --allow-net --allow-env scripts/setup-vapi-webhooks.ts
```

### Step 5: Test the System

```bash
# Run end-to-end system test
deno run --allow-net scripts/test-system.ts
```

## 📊 Your Webhook URLs

After deployment, your assistants will call these webhooks:

- **Call 1**: `https://plmmudazcsiksgmgphte.supabase.co/functions/v1/call-1-webhook`
- **Call 2**: `https://plmmudazcsiksgmgphte.supabase.co/functions/v1/call-2-webhook`
- **Call 3**: `https://plmmudazcsiksgmgphte.supabase.co/functions/v1/call-3-webhook`
- **Call 4**: `https://plmmudazcsiksgmgphte.supabase.co/functions/v1/call-4-webhook`
- **Analytics**: `https://plmmudazcsiksgmgphte.supabase.co/functions/v1/analytics-dashboard`

## 🗄 Database Schema

**Main Tables:**
- `customers` - Customer contact information
- `business_formations` - Business formation progress tracking
- `call_transcripts` - Full conversation transcripts and analysis
- `extracted_business_data` - Structured data from conversations
- `analytics_metrics` - Performance metrics and conversion rates
- `vapi_assistant_config` - Assistant configuration

**Key Features:**
- Automatic progress tracking (25% per completed call)
- Revenue estimation based on package selection
- State-by-state analytics
- Sentiment analysis scoring
- Conversion funnel metrics

## 📈 Analytics Dashboard

Access real-time analytics:

```bash
curl "https://plmmudazcsiksgmgphte.supabase.co/functions/v1/analytics-dashboard?timeframe=daily"
```

**Available Metrics:**
- Overall conversion rates (Call 1 → Call 2 → Call 3 → Call 4)
- Revenue by package (Launch Basic $999, Launch Pro $1799, Launch Complete $3499)
- State-by-state performance
- Daily/weekly/monthly trends
- Customer satisfaction scores
- Average deal size and total revenue

**Query Parameters:**
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)  
- `state` - Filter by state
- `timeframe` - daily/weekly/monthly

## 🔧 Data Flow

1. **Customer calls** → Vapi Assistant handles conversation
2. **Call ends** → Vapi sends webhook to Supabase Edge Function
3. **Webhook processes** → Extracts data using OpenAI, saves to database
4. **Progress tracked** → Updates completion status, calculates conversion rates
5. **Analytics updated** → Real-time metrics available via dashboard

## 🧪 Testing

The system includes comprehensive testing:

```bash
# Test individual webhook
curl -X POST https://plmmudazcsiksgmgphte.supabase.co/functions/v1/call-1-webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"end-of-call-report","call":{"id":"test","assistantId":"5ef9abf6-66b4-4457-9848-ee5436d6191f","transcript":"Test transcript"}}'

# Run full system test
deno run --allow-net scripts/test-system.ts
```

## 🔒 Security Features

- Row Level Security (RLS) on all tables
- Webhook secret verification
- Environment variable protection
- API key rotation support
- CORS headers configured

## 📞 Production Usage

1. **Phone calls** are handled automatically by Vapi assistants
2. **Data extraction** happens in real-time using OpenAI
3. **Progress tracking** updates automatically after each call
4. **Analytics** are available immediately via API
5. **Customer data** is structured and queryable

## 🎯 Revenue Tracking

The system automatically tracks revenue based on package selection:

- **Launch Basic**: $999 (LLC formation, basic brand kit, 1-page site)
- **Launch Pro**: $1,799 (Full brand kit, 5-page website, premium integrations) 
- **Launch Complete**: $3,499 (Turnkey launch, priority filing, 1-year compliance)

## 🔍 Troubleshooting

**Common Issues:**

1. **Webhook not receiving data**
   - Check Vapi assistant configuration
   - Verify webhook URLs are correct
   - Check Supabase function logs

2. **Data extraction failing**
   - Verify OpenAI API key is set
   - Check function environment variables
   - Review transcript quality

3. **Analytics not updating**
   - Check database triggers are working
   - Verify RLS policies
   - Check function permissions

**Logs:**
```bash
# View function logs
supabase functions logs call-1-webhook

# View database logs  
supabase logs
```

## 📚 API Reference

### Webhook Payload Format
```typescript
{
  type: "end-of-call-report",
  call: {
    id: string,
    assistantId: string,
    customer: { number?: string },
    transcript?: string,
    summary?: string,
    duration?: number,
    status?: string
  }
}
```

### Analytics Response Format
```typescript
{
  dateRange: { startDate: string, endDate: string },
  overallMetrics: { totalCustomers: number, completedFormations: number },
  funnelAnalysis: { overallConversion: string },
  revenueMetrics: { totalRevenue: number, averageDealSize: number },
  stateBreakdown: Array<{ state: string, totalFormations: number }>
}
```

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase function logs
3. Test with the provided test script
4. Verify all environment variables are set

---

**🎉 Your voice AI business formation system is ready!** 

Customers can now call your Vapi assistants and have their business formation data automatically captured, analyzed, and tracked through the complete 4-call funnel with real-time analytics.