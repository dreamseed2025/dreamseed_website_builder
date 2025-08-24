-- Create dream_dna_truth table for core business DNA facts
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dream_dna_truth_user_id ON dream_dna_truth(user_id);
CREATE INDEX IF NOT EXISTS idx_dream_dna_truth_extraction_source ON dream_dna_truth(extraction_source);
CREATE INDEX IF NOT EXISTS idx_dream_dna_truth_confidence ON dream_dna_truth(confidence_score);

-- Enable Row Level Security
ALTER TABLE dream_dna_truth ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth needs)
CREATE POLICY "Allow all operations on dream_dna_truth" ON dream_dna_truth
  FOR ALL USING (true);

-- Add constraint to ensure required fields are not null
ALTER TABLE dream_dna_truth ADD CONSTRAINT check_required_fields 
  CHECK (what_problem IS NOT NULL AND who_serves IS NOT NULL AND how_different IS NOT NULL);

