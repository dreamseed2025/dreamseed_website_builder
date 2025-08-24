-- ============================================================================
-- DreamSeed Database Schema v2.0
-- AI-Driven Business Formation & Website Generation Platform
-- ============================================================================

-- ============================================================================
-- 1. USER MANAGEMENT
-- ============================================================================

-- Core users table (keep existing structure, add new fields)
ALTER TABLE users ADD COLUMN IF NOT EXISTS 
  profile_completion_score INTEGER DEFAULT 0,
  dream_dna_extraction_status VARCHAR(20) DEFAULT 'pending',
  website_generation_status VARCHAR(20) DEFAULT 'not_started',
  subscription_tier VARCHAR(20) DEFAULT 'free';

-- ============================================================================
-- 2. DREAM DNA SYSTEM (Multi-layered AI Analysis)
-- ============================================================================

-- Core business DNA facts extracted from conversations
CREATE TABLE IF NOT EXISTS dream_dna_truth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255),
  what_problem TEXT NOT NULL,
  who_serves TEXT NOT NULL, 
  how_different TEXT NOT NULL,
  primary_service TEXT NOT NULL,
  target_revenue BIGINT,
  business_model VARCHAR(100),
  unique_value_proposition TEXT,
  competitive_advantage TEXT,
  brand_personality VARCHAR(50),
  business_stage VARCHAR(50), -- startup, growth, established, pivot
  industry_category VARCHAR(100),
  geographic_focus VARCHAR(255),
  timeline_to_launch INTEGER, -- months
  confidence_score DECIMAL(3,2) DEFAULT 0.85,
  extraction_source VARCHAR(50), -- 'voice_call', 'form', 'domain_selection'
  extracted_at TIMESTAMP DEFAULT NOW(),
  validated_by_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI confidence scores and alternative interpretations  
CREATE TABLE IF NOT EXISTS dream_dna_probability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_dna_truth_id UUID REFERENCES dream_dna_truth(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL, -- which field this probability applies to
  primary_interpretation TEXT NOT NULL,
  alternative_interpretation_1 TEXT,
  alternative_interpretation_2 TEXT,
  alternative_interpretation_3 TEXT,
  confidence_primary DECIMAL(3,2) NOT NULL,
  confidence_alt_1 DECIMAL(3,2),
  confidence_alt_2 DECIMAL(3,2),
  confidence_alt_3 DECIMAL(3,2),
  ai_reasoning TEXT,
  validation_status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, rejected, revised
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Business type classification and personas
CREATE TABLE IF NOT EXISTS dream_dna_type (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_dna_truth_id UUID REFERENCES dream_dna_truth(id) ON DELETE CASCADE,
  business_archetype VARCHAR(100) NOT NULL, -- 'innovator', 'optimizer', 'connector', 'creator'
  industry_vertical VARCHAR(100) NOT NULL, -- 'saas', 'ecommerce', 'consulting', 'local_service'
  business_model_type VARCHAR(100) NOT NULL, -- 'b2b', 'b2c', 'marketplace', 'subscription'
  scale_ambition VARCHAR(50) NOT NULL, -- 'local', 'regional', 'national', 'global'
  risk_tolerance VARCHAR(50) NOT NULL, -- 'conservative', 'moderate', 'aggressive'
  innovation_level VARCHAR(50) NOT NULL, -- 'traditional', 'incremental', 'disruptive'
  customer_interaction VARCHAR(50) NOT NULL, -- 'high_touch', 'self_service', 'hybrid'
  revenue_model VARCHAR(100), -- 'one_time', 'subscription', 'commission', 'advertising'
  funding_approach VARCHAR(100), -- 'bootstrapped', 'angel', 'vc', 'crowdfunding'
  template_category VARCHAR(100) NOT NULL, -- maps to website template categories
  personality_match_score DECIMAL(3,2) DEFAULT 0.00,
  archetype_confidence DECIMAL(3,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 3. CONVERSATION & ANALYSIS PIPELINE
-- ============================================================================

-- Original voice conversation transcripts
CREATE TABLE IF NOT EXISTS transcripts_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  call_session_id VARCHAR(255), -- VAPI call ID
  call_number INTEGER, -- 1, 2, 3, 4 for progressive calls
  transcript_text TEXT NOT NULL,
  audio_duration_seconds INTEGER,
  audio_file_url TEXT,
  call_quality_score DECIMAL(3,2),
  speaker_segments JSONB, -- detailed speaker tracking
  call_metadata JSONB, -- VAPI metadata, timestamps, etc.
  processing_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- AI-processed, searchable vector embeddings
CREATE TABLE IF NOT EXISTS transcripts_vectorized (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_raw_id UUID REFERENCES transcripts_raw(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_summary TEXT NOT NULL,
  key_topics TEXT[], -- extracted topics array
  business_insights TEXT[], -- specific business insights
  sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  clarity_score DECIMAL(3,2), -- 0.0 to 1.0
  completeness_score DECIMAL(3,2), -- 0.0 to 1.0
  vector_embedding VECTOR(1536), -- OpenAI embedding vector
  extraction_confidence DECIMAL(3,2),
  ai_model_version VARCHAR(50),
  processing_metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Links multiple transcripts to user journey
CREATE TABLE IF NOT EXISTS conversation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_name VARCHAR(255) DEFAULT 'Business Formation Session',
  total_calls INTEGER DEFAULT 0,
  completed_calls INTEGER DEFAULT 0,
  session_status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, paused
  dream_dna_extraction_complete BOOLEAN DEFAULT FALSE,
  website_ready_for_generation BOOLEAN DEFAULT FALSE,
  session_start_date TIMESTAMP DEFAULT NOW(),
  session_completion_date TIMESTAMP,
  next_call_scheduled TIMESTAMP,
  session_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 4. FILE MANAGEMENT
-- ============================================================================

-- Images, audio, documents, logos uploaded by users
CREATE TABLE IF NOT EXISTS file_buckets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL, -- 'image', 'audio', 'document', 'video'
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL, -- Supabase storage path
  storage_bucket VARCHAR(100) NOT NULL,
  public_url TEXT,
  file_purpose VARCHAR(100), -- 'logo', 'hero_image', 'product_photo', 'audio_recording'
  processing_status VARCHAR(20) DEFAULT 'uploaded',
  metadata JSONB, -- image dimensions, audio length, etc.
  tags TEXT[], -- user or AI generated tags
  ai_description TEXT, -- AI-generated description of file content
  upload_session_id UUID, -- link to conversation session if applicable
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Organized media library for website generation
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_bucket_id UUID REFERENCES file_buckets(id) ON DELETE CASCADE,
  asset_category VARCHAR(100) NOT NULL, -- 'branding', 'hero', 'gallery', 'testimonial'
  asset_subcategory VARCHAR(100), -- 'primary_logo', 'secondary_logo', 'favicon'
  display_name VARCHAR(255) NOT NULL,
  alt_text TEXT,
  optimization_status VARCHAR(20) DEFAULT 'pending',
  optimized_versions JSONB, -- different sizes/formats
  usage_rights VARCHAR(100) DEFAULT 'user_owned',
  ai_tags TEXT[],
  color_palette JSONB, -- extracted colors for design matching
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 5. WEBSITE GENERATION SYSTEM
-- ============================================================================

-- Template library with strict, extractable sections
CREATE TABLE IF NOT EXISTS website_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(255) NOT NULL,
  template_category VARCHAR(100) NOT NULL, -- matches dream_dna_type.template_category
  business_archetype VARCHAR(100)[], -- which archetypes this template serves
  industry_verticals VARCHAR(100)[], -- which industries this works for
  template_description TEXT,
  preview_image_url TEXT,
  template_code JSONB NOT NULL, -- React/Next.js component structure
  required_sections TEXT[] NOT NULL, -- ['hero', 'about', 'services', 'contact']
  optional_sections TEXT[], -- ['testimonials', 'portfolio', 'blog', 'team']
  customization_options JSONB, -- color schemes, fonts, layouts
  complexity_level VARCHAR(20) DEFAULT 'intermediate', -- simple, intermediate, advanced
  mobile_optimized BOOLEAN DEFAULT TRUE,
  seo_optimized BOOLEAN DEFAULT TRUE,
  performance_score INTEGER DEFAULT 85,
  is_active BOOLEAN DEFAULT TRUE,
  creation_date TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Modular content sections extracted from Dream DNA
CREATE TABLE IF NOT EXISTS website_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  dream_dna_truth_id UUID REFERENCES dream_dna_truth(id),
  section_type VARCHAR(100) NOT NULL, -- 'hero', 'about', 'services', 'contact'
  section_name VARCHAR(255) NOT NULL,
  generated_content JSONB NOT NULL, -- structured content for this section
  content_source VARCHAR(50) NOT NULL, -- 'ai_generated', 'user_provided', 'template_default'
  ai_confidence_score DECIMAL(3,2),
  user_approved BOOLEAN DEFAULT FALSE,
  revision_count INTEGER DEFAULT 0,
  personalization_data JSONB, -- data used to customize this section
  extraction_metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User's live websites and their content
CREATE TABLE IF NOT EXISTS generated_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  website_template_id UUID REFERENCES website_templates(id),
  site_name VARCHAR(255) NOT NULL,
  domain_name VARCHAR(255),
  subdomain VARCHAR(100), -- dreamseed subdomain if no custom domain
  generation_status VARCHAR(20) DEFAULT 'draft', -- draft, generating, live, archived
  site_structure JSONB NOT NULL, -- complete site structure and content
  custom_branding JSONB, -- colors, fonts, logos applied
  seo_metadata JSONB, -- title, description, keywords
  analytics_code TEXT,
  deployment_url TEXT,
  last_deployment_date TIMESTAMP,
  performance_metrics JSONB,
  generation_metadata JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES AND PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Dream DNA indexes
CREATE INDEX IF NOT EXISTS idx_dream_dna_truth_user_id ON dream_dna_truth(user_id);
CREATE INDEX IF NOT EXISTS idx_dream_dna_truth_business_stage ON dream_dna_truth(business_stage);
CREATE INDEX IF NOT EXISTS idx_dream_dna_truth_industry ON dream_dna_truth(industry_category);

-- Transcript indexes
CREATE INDEX IF NOT EXISTS idx_transcripts_raw_user_id ON transcripts_raw(user_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_raw_call_session ON transcripts_raw(call_session_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_vectorized_user_id ON transcripts_vectorized(user_id);

-- File management indexes
CREATE INDEX IF NOT EXISTS idx_file_buckets_user_id ON file_buckets(user_id);
CREATE INDEX IF NOT EXISTS idx_file_buckets_file_type ON file_buckets(file_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_user_id ON media_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_category ON media_assets(asset_category);

-- Website generation indexes
CREATE INDEX IF NOT EXISTS idx_website_templates_category ON website_templates(template_category);
CREATE INDEX IF NOT EXISTS idx_website_sections_user_id ON website_sections(user_id);
CREATE INDEX IF NOT EXISTS idx_website_sections_type ON website_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_generated_websites_user_id ON generated_websites(user_id);

-- Vector similarity index (requires pgvector extension)
-- CREATE INDEX IF NOT EXISTS transcripts_vectorized_embedding_idx ON transcripts_vectorized 
-- USING ivfflat (vector_embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================================
-- RELATIONSHIPS AND CONSTRAINTS
-- ============================================================================

-- Link conversation sessions to transcripts
ALTER TABLE transcripts_raw ADD COLUMN IF NOT EXISTS conversation_session_id UUID REFERENCES conversation_sessions(id);

-- Ensure dream_dna_truth has required business fields
ALTER TABLE dream_dna_truth ADD CONSTRAINT check_required_fields 
  CHECK (what_problem IS NOT NULL AND who_serves IS NOT NULL AND how_different IS NOT NULL);

-- Ensure probability scores are valid percentages
ALTER TABLE dream_dna_probability ADD CONSTRAINT check_probability_range 
  CHECK (confidence_primary >= 0.0 AND confidence_primary <= 1.0);

-- Ensure file sizes are positive
ALTER TABLE file_buckets ADD CONSTRAINT check_positive_file_size 
  CHECK (file_size_bytes > 0);

-- Ensure template has required sections
ALTER TABLE website_templates ADD CONSTRAINT check_required_sections 
  CHECK (array_length(required_sections, 1) > 0);

COMMENT ON TABLE dream_dna_truth IS 'Core business DNA facts extracted from voice conversations and user inputs';
COMMENT ON TABLE dream_dna_probability IS 'AI confidence scores and alternative interpretations for uncertain extractions';
COMMENT ON TABLE dream_dna_type IS 'Business archetype and personality classification for template matching';
COMMENT ON TABLE transcripts_raw IS 'Original voice conversation transcripts with metadata';
COMMENT ON TABLE transcripts_vectorized IS 'AI-processed transcripts with vector embeddings for semantic search';
COMMENT ON TABLE website_templates IS 'Template library with structured sections for automatic website generation';
COMMENT ON TABLE generated_websites IS 'User websites generated from Dream DNA data and selected templates';