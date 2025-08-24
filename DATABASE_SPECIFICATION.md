# 🗄️ DreamSeed Database Specification

**Version:** 2.0  
**Last Updated:** August 24, 2025  
**Database:** Supabase PostgreSQL  

---

## 📊 Overview

DreamSeed uses a Supabase PostgreSQL database to manage business formation workflows, AI-powered voice consultations, transcript processing, file management, and automated website generation. The system is designed around a progressive 4-call consultation model with multi-layered Dream DNA analysis, vectorized transcript processing, and AI-driven website creation.

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

### 2. **Dream DNA System v2.0** (Multi-layered AI Analysis)
**Status:** ✅ ACTIVE (Growing rapidly with new schema)  
**Purpose:** Advanced AI-powered business DNA system with probability analysis and business type classification

#### `dream_dna_truth` - Core Business Facts
- **Enhanced Schema (20+ columns):**
  - `user_id`, `business_name`, `what_problem`, `who_serves`, `how_different`, `primary_service`
  - `target_revenue`, `business_model`, `business_stage`, `industry_category`
  - `confidence_score`, `extraction_source`, `validated_by_user`
- **AI Confidence:** Multi-level confidence scoring for extracted data
- **Source Tracking:** Links to voice calls, domain selection, or manual input

#### `dream_dna_probability` - AI Confidence & Alternatives  
- **Purpose:** Multiple interpretations with confidence scores
- **Schema:** Primary + 3 alternative interpretations per field
- **Validation:** User confirmation/rejection tracking
- **AI Reasoning:** Detailed explanations for interpretations

#### `dream_dna_type` - Business Classification
- **Purpose:** Business archetype and personality classification
- **Schema:** `business_archetype`, `industry_vertical`, `business_model_type`
- **Template Matching:** Links to website template categories
- **Personality Scoring:** Risk tolerance, innovation level, scale ambition

### 3. **Conversation & Analysis Pipeline**
**Status:** ✅ ACTIVE (New transcript processing system)

#### `transcripts_raw` - Original Voice Data
- **Purpose:** Store complete voice conversation transcripts  
- **Schema:** `transcript_text`, `call_session_id`, `call_number`, `audio_file_url`
- **Metadata:** Speaker segments, call quality, duration, VAPI integration

#### `transcripts_vectorized` - AI-Processed Analysis
- **Purpose:** Searchable vector embeddings with business insights
- **Schema:** `content_summary`, `key_topics`, `business_insights`, `sentiment_score`
- **Vector Search:** OpenAI embeddings for semantic search across conversations
- **AI Model Tracking:** Version control and processing metadata

#### `conversation_sessions` - Journey Management  
- **Purpose:** Track multi-call business formation sessions
- **Schema:** Session progress, completion status, scheduling
- **Integration:** Links to users and transcripts for complete journey tracking

### 4. **File Management System**
**Status:** ✅ ACTIVE (Media & document management)

#### `file_buckets` - Universal File Storage
- **Purpose:** Store all user-uploaded files with metadata
- **Schema:** File details, storage paths, processing status, AI descriptions
- **Integration:** Supabase storage buckets by file type
- **AI Processing:** Automated content analysis and tagging

#### `media_assets` - Organized Media Library  
- **Purpose:** Curated media for website generation
- **Schema:** Asset categories, optimization status, color palettes
- **Website Integration:** Direct connection to website template system

---

### 5. **Website Generation System**
**Status:** ✅ ACTIVE (AI-powered website creation)

#### `website_templates` - Template Library
- **Purpose:** Structured templates with extractable sections
- **Schema:** Template code, required sections, customization options
- **Business Matching:** Links to dream_dna_type for automatic template selection
- **Performance Tracking:** SEO scores, mobile optimization, loading speed

#### `website_sections` - Dynamic Content Generation
- **Purpose:** AI-generated content sections from Dream DNA data
- **Schema:** Section type, generated content, AI confidence scores
- **Personalization:** Custom content based on business archetype and industry
- **User Approval:** Revision tracking and user validation workflow

#### `generated_websites` - Live Website Management
- **Purpose:** Complete website records with deployment tracking
- **Schema:** Site structure, custom branding, SEO metadata, deployment URLs
- **Integration:** Connects Dream DNA + media assets + templates = live website
- **Performance:** Analytics, deployment status, public/private controls

### 6. `auth.users` (Supabase System Table)
**Status:** ✅ ACTIVE (Growing user base)  
**Purpose:** Supabase authentication system

#### Features:
- **Email/Password Authentication:** Standard Supabase auth
- **User Session Management:** JWT tokens and refresh tokens
- **Security:** Built-in rate limiting and security features
- **Integration:** Links to `users.auth_user_id` for profile data

---

## 🚀 **NEW API ENDPOINTS** (Schema v2.0)

### Transcript Processing
- **`/api/transcript-processor`** - Process voice call transcripts into structured Dream DNA data
- **Features:** AI extraction, sentiment analysis, business insights, vectorization
- **Integration:** Saves to `transcripts_raw` + `transcripts_vectorized` + updates `dream_dna_truth`

### File Management  
- **`/api/file-upload`** - Handle user file uploads with AI processing
- **Features:** Multi-format support, automatic categorization, media asset creation
- **Integration:** Saves to `file_buckets` + `media_assets` with Supabase storage

### Website Generation
- **`/api/website-generator`** - Generate complete websites from Dream DNA data
- **Features:** Template selection, content generation, media integration, SEO optimization
- **Integration:** Uses `dream_dna_truth` + `media_assets` → creates `generated_websites`

### Enhanced Domain Selection  
- **`/api/save-domain`** (Updated) - Now uses new schema with fallbacks
- **Features:** Tries `dream_dna_truth` first, falls back to legacy `dream_dna`
- **Integration:** Creates business type classifications and probability records

---

## ⚪ **LEGACY TABLES** (Maintained for Compatibility)

### Legacy Dream DNA
#### `dream_dna` 
**Purpose:** Original Dream DNA table (now legacy)  
**Status:** Maintained for backward compatibility, new data goes to `dream_dna_truth`
**Migration:** Existing data preserved, new schema provides enhanced capabilities

### Future Expansion Tables
#### `business_assessment`, `assessment_responses`
**Purpose:** Structured business assessment forms (not yet implemented)
**Status:** Schema ready for detailed questionnaire system expansion

#### `user_sessions`, `domain_searches` 
**Purpose:** User behavior analytics and search tracking
**Status:** Infrastructure prepared for advanced analytics implementation

#### Legacy voice tables: `conversations`, `webhooks_logs`, etc.
**Purpose:** Original voice system design  
**Status:** Superseded by new `transcripts_raw` + `transcripts_vectorized` system

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