-- Drop existing table if it exists to recreate with correct structure
DROP TABLE IF EXISTS dream_dna_truth CASCADE;

-- Create dream_dna_truth table with the exact structure specified
CREATE TABLE dream_dna_truth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  dream_type VARCHAR(50) DEFAULT 'business_formation', -- business_formation, etc.
  business_name VARCHAR(255),
  business_type VARCHAR(100), -- LLC, C-Corp, etc.
  registering_state VARCHAR(2), -- State abbreviation
  domain VARCHAR(255),
  -- Additional parameters that will be captured
  what_problem TEXT,
  who_serves TEXT,
  how_different TEXT,
  primary_service TEXT,
  target_revenue BIGINT,
  business_model VARCHAR(100),
  unique_value_proposition TEXT,
  competitive_advantage TEXT,
  brand_personality VARCHAR(50),
  business_stage VARCHAR(50),
  industry_category VARCHAR(100),
  geographic_focus VARCHAR(255),
  timeline_to_launch INTEGER,
  confidence_score DECIMAL(3,2) DEFAULT 0.85,
  extraction_source VARCHAR(50),
  validated_by_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create dream_dna_probability_truth table (same structure as truth table)
CREATE TABLE dream_dna_probability_truth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID REFERENCES dream_dna_truth(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  dream_type VARCHAR(50) DEFAULT 'business_formation',
  business_name VARCHAR(255),
  business_type VARCHAR(100),
  registering_state VARCHAR(2),
  domain VARCHAR(255),
  -- Additional parameters with probability scores
  what_problem TEXT,
  who_serves TEXT,
  how_different TEXT,
  primary_service TEXT,
  target_revenue BIGINT,
  business_model VARCHAR(100),
  unique_value_proposition TEXT,
  competitive_advantage TEXT,
  brand_personality VARCHAR(50),
  business_stage VARCHAR(50),
  industry_category VARCHAR(100),
  geographic_focus VARCHAR(255),
  timeline_to_launch INTEGER,
  -- Probability scores for each field
  business_name_probability DECIMAL(3,2),
  business_type_probability DECIMAL(3,2),
  registering_state_probability DECIMAL(3,2),
  domain_probability DECIMAL(3,2),
  what_problem_probability DECIMAL(3,2),
  who_serves_probability DECIMAL(3,2),
  how_different_probability DECIMAL(3,2),
  primary_service_probability DECIMAL(3,2),
  target_revenue_probability DECIMAL(3,2),
  business_model_probability DECIMAL(3,2),
  unique_value_proposition_probability DECIMAL(3,2),
  competitive_advantage_probability DECIMAL(3,2),
  brand_personality_probability DECIMAL(3,2),
  business_stage_probability DECIMAL(3,2),
  industry_category_probability DECIMAL(3,2),
  geographic_focus_probability DECIMAL(3,2),
  timeline_to_launch_probability DECIMAL(3,2),
  extraction_source VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create dream_dna_type table for business formation types
CREATE TABLE dream_dna_type (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID REFERENCES dream_dna_truth(id) ON DELETE CASCADE,
  formation_type VARCHAR(50) NOT NULL, -- 'LLC', 'C-Corp', etc.
  state VARCHAR(2) NOT NULL,
  articles_of_incorporation_required BOOLEAN DEFAULT TRUE,
  formation_requirements JSONB, -- State-specific requirements
  estimated_cost DECIMAL(10,2),
  processing_time_days INTEGER,
  annual_requirements JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dream_dna_truth_user_id ON dream_dna_truth(user_id);
CREATE INDEX IF NOT EXISTS idx_dream_dna_truth_dream_type ON dream_dna_truth(dream_type);
CREATE INDEX IF NOT EXISTS idx_dream_dna_truth_business_type ON dream_dna_truth(business_type);
CREATE INDEX IF NOT EXISTS idx_dream_dna_truth_registering_state ON dream_dna_truth(registering_state);

CREATE INDEX IF NOT EXISTS idx_dream_dna_probability_truth_dream_id ON dream_dna_probability_truth(dream_id);
CREATE INDEX IF NOT EXISTS idx_dream_dna_probability_truth_user_id ON dream_dna_probability_truth(user_id);

CREATE INDEX IF NOT EXISTS idx_dream_dna_type_dream_id ON dream_dna_type(dream_id);
CREATE INDEX IF NOT EXISTS idx_dream_dna_type_formation_type ON dream_dna_type(formation_type);
CREATE INDEX IF NOT EXISTS idx_dream_dna_type_state ON dream_dna_type(state);

-- Enable Row Level Security
ALTER TABLE dream_dna_truth ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_dna_probability_truth ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_dna_type ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust based on your auth needs)
CREATE POLICY "Allow all operations on dream_dna_truth" ON dream_dna_truth
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on dream_dna_probability_truth" ON dream_dna_probability_truth
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on dream_dna_type" ON dream_dna_type
  FOR ALL USING (true);

-- Add comments for documentation
COMMENT ON TABLE dream_dna_truth IS 'Core dream DNA facts - the source of truth for all dream data';
COMMENT ON TABLE dream_dna_probability_truth IS 'AI probability analysis - guesses and confidence scores for dream data';
COMMENT ON TABLE dream_dna_type IS 'Business formation types and requirements (LLC, C-Corp, etc.)';
