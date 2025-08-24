# 🗄️ DreamSeed Database Specification

**Version:** 1.0  
**Last Updated:** August 24, 2025  
**Database:** Supabase PostgreSQL  

---

## 📊 Overview

DreamSeed uses a Supabase PostgreSQL database to manage business formation workflows, user data, AI-powered voice consultations, and domain selection processes. The system is designed around a progressive 4-call consultation model with AI analysis and dream DNA profiling.

---

## 🔥 **ACTIVE TABLES** (Currently In Use)

### 1. `users` 
**Status:** ✅ ACTIVE (82 records)  
**Purpose:** Core user management and business formation progress tracking

#### Schema (36 columns):
- **Primary Keys:** `id` (UUID), `auth_user_id` (links to Supabase Auth)
- **Customer Info:** `customer_name`, `customer_email`, `customer_phone`  
- **Business Info:** `business_name`, `business_type`, `state_of_operation`, `entity_type`
- **Call Progress:** `call_1_completed` → `call_4_completed`, completion timestamps
- **Workflow:** `status`, `current_call_stage`, `next_call_scheduled`
- **AI Integration:** `assistant_id`, `individual_assistant_id`, `assistant_type` 
- **Business Formation:** `package_preference`, `urgency_level`, `timeline`
- **Account Management:** `account_type`, `email_confirmed`, `payment_status`, `subscription_type`
- **Financials:** `amount_paid`, `payment_date`, `subscription_expires_at`

#### Key Features:
- **Progressive Call Tracking:** Manages 4-stage voice consultation workflow
- **Business Formation States:** LLC, Corporation, Partnership entity types
- **Payment Integration:** Subscription and payment tracking
- **AI Assistant Assignment:** Individual or shared AI assistants
- **Urgency Levels:** High, Medium, Low priority handling

---

### 2. `dream_dna`
**Status:** ✅ ACTIVE (1+ records, growing)  
**Purpose:** AI-powered business DNA truth table for personalized recommendations

#### Schema (12 columns):
- **Primary Key:** `id` (UUID)
- **Business Context:** `business_id` (links to users table)
- **Core DNA Fields:**
  - `what_problem` - Business problem being solved
  - `who_serves` - Target customer segments  
  - `how_different` - Unique value proposition
  - `primary_service` - Main business offering
- **Brand Positioning:**
  - `brand_vibe` - professional | bold | friendly | elegant
  - `color_preference` - cool | vibrant | minimal
  - `price_level` - budget | mid-market | premium
- **Metadata:** `version`, `created_at`, `updated_at`

#### Key Features:
- **AI Analysis Integration:** Populated by voice call transcript analysis
- **Domain Selection:** Connected to domain checker for business formation
- **Personalization Engine:** Used for customized business recommendations
- **Growth Potential:** Expected to scale significantly with user adoption

---

### 3. `auth.users` (Supabase System Table)
**Status:** ✅ ACTIVE (11 registered users)  
**Purpose:** Supabase authentication system

#### Features:
- **Email/Password Authentication:** Standard Supabase auth
- **User Session Management:** JWT tokens and refresh tokens
- **Security:** Built-in rate limiting and security features
- **Integration:** Links to `users.auth_user_id` for profile data

---

## ⚪ **DEFINED BUT EMPTY TABLES** (Future Use)

### Voice & Communication System

#### `conversations`
**Purpose:** Track multi-turn conversations across voice calls  
**Status:** Defined structure, awaiting voice system expansion

#### `transcripts` 
**Purpose:** Store voice call transcripts for AI analysis  
**Status:** Infrastructure ready, will populate as voice calls increase

#### `webhook_logs`
**Purpose:** Log all VAPI webhook calls for debugging and analytics  
**Status:** Monitoring system prepared for production voice workflows

#### `call_sessions`
**Purpose:** Manage active and historical voice call sessions  
**Status:** Session management framework ready for voice system scaling

#### `vapi_calls` & `voice_calls`
**Purpose:** Voice call management and VAPI integration tracking  
**Status:** Voice system infrastructure prepared for production

### Business Intelligence & Analytics

#### `business_assessment`
**Purpose:** Store structured business assessment form responses  
**Status:** Assessment system designed, awaiting form implementation

#### `assessment_responses` 
**Purpose:** Individual question responses from business assessments  
**Status:** Granular response tracking system prepared

#### `business_formation_data`
**Purpose:** Additional business formation details beyond core user data  
**Status:** Extended business data system ready for complex formation needs

#### `ai_analysis`
**Purpose:** Store AI analysis results from voice calls and assessments  
**Status:** AI analytics framework prepared for machine learning integration

### User Experience & Tracking

#### `user_sessions`
**Purpose:** Track user session data for analytics and user experience  
**Status:** Session analytics system designed

#### `domain_searches` 
**Purpose:** Track domain search history and preferences  
**Status:** Domain analytics system ready (complements active dream_dna integration)

---

## 🔗 **TABLE RELATIONSHIPS**

```
auth.users (Supabase Auth)
    ↓ auth_user_id
users (Core Profile)
    ↓ business_id  
dream_dna (Business DNA)

Additional Planned Relationships:
users → conversations → transcripts
users → call_sessions → vapi_calls
users → business_assessment → assessment_responses
users → domain_searches
dream_dna → ai_analysis
```

---

## 🎯 **CURRENT SYSTEM ARCHITECTURE**

### Active Data Flow:
1. **User Registration:** `auth.users` → `users` (profile creation)
2. **Voice Consultations:** 4-call progression tracked in `users` table
3. **AI Analysis:** Voice data analyzed and stored in `dream_dna` 
4. **Domain Selection:** Domain choices saved to `dream_dna` with business context
5. **Business Formation:** Progress tracked through `users.call_X_completed` fields

### Integration Points:
- **Supabase Auth:** Handles authentication, sessions, security
- **VAPI Integration:** Voice AI system (infrastructure ready)
- **Domain Checker:** Active integration with GoDaddy API → `dream_dna`
- **Payment System:** Subscription tracking in `users` table

---

## 🚀 **SCALING CONSIDERATIONS**

### High-Growth Tables:
- **`dream_dna`** - Expected to grow rapidly with each domain selection and business assessment
- **`users`** - Core growth metric, currently 82 active business formation cases

### Infrastructure Ready:
- **Voice System Tables** - Ready for voice consultation volume scaling
- **Analytics Tables** - Prepared for business intelligence and user behavior analysis
- **Assessment System** - Ready for detailed business formation questionnaires

### Performance Optimization:
- Indexed on primary keys and foreign key relationships
- Supabase PostgreSQL auto-scaling and connection pooling
- Row Level Security (RLS) policies for data isolation

---

## 🔧 **MAINTENANCE RECOMMENDATIONS**

1. **Monitor `dream_dna` Growth** - This table will become the primary source of business intelligence
2. **Activate Voice Tables** - Begin populating conversation and transcript tables as voice system scales
3. **Implement Business Assessments** - Activate assessment tables for detailed user profiling
4. **Analytics Integration** - Begin using session and search tracking tables for user experience optimization
5. **Data Retention Policies** - Consider archival strategies for transcript and log data

---

**Database Health:** ✅ Excellent  
**Scalability:** ✅ Ready for Growth  
**Integration:** ✅ Well-Connected Systems  
**Future-Proofing:** ✅ Infrastructure Prepared