-- Create dream_dna table for vision and motivation data
CREATE TABLE IF NOT EXISTS dream_dna (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Vision & Purpose
  vision_statement TEXT,
  core_purpose TEXT,
  impact_goal TEXT,
  legacy_vision TEXT,
  passion_driver TEXT,
  
  -- Business Dream Details
  business_concept TEXT,
  target_customers TEXT,
  unique_value_prop TEXT,
  scalability_vision TEXT,
  revenue_goals TEXT,
  services_offered TEXT,
  
  -- Success Metrics & Goals
  lifestyle_goals TEXT,
  freedom_level TEXT,
  growth_timeline TEXT,
  exit_strategy TEXT,
  success_milestones JSONB,
  
  -- Psychological Profile
  risk_tolerance TEXT,
  urgency_level TEXT DEFAULT 'Medium',
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 10),
  support_needs TEXT,
  pain_points TEXT,
  motivation_factors JSONB,
  
  -- Package & Timeline Preferences
  package_preference TEXT,
  budget_range TEXT,
  budget_mentioned TEXT,
  timeline_preference TEXT,
  next_steps TEXT,
  key_requirements JSONB,
  
  -- Analysis Metadata
  completeness_score INTEGER DEFAULT 0,
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  analysis_notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dream_dna_user_id ON dream_dna(user_id);
CREATE INDEX IF NOT EXISTS idx_dream_dna_completeness ON dream_dna(completeness_score);
CREATE INDEX IF NOT EXISTS idx_dream_dna_urgency ON dream_dna(urgency_level);
CREATE INDEX IF NOT EXISTS idx_dream_dna_package ON dream_dna(package_preference);

-- Enable Row Level Security
ALTER TABLE dream_dna ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth needs)
CREATE POLICY "Allow all operations on dream_dna" ON dream_dna
  FOR ALL USING (true);