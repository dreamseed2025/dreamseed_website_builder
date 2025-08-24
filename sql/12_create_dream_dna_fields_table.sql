-- Create enhanced dream_dna_fields table for field-level tracking
-- This supports the new UI system with locked/suggested/empty states

CREATE TABLE IF NOT EXISTS dream_dna_fields (
  -- Primary Keys
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  
  -- Field Values
  locked_value TEXT,                    -- User-confirmed value (protected)
  suggested_value TEXT,                 -- AI suggestion awaiting validation
  display_value TEXT,                   -- What user sees (computed: locked or suggested)
  
  -- Status & Confidence
  field_status VARCHAR(20) DEFAULT 'empty' CHECK (field_status IN ('empty', 'suggested', 'locked')),
  confidence_score DECIMAL(4,3) CHECK (confidence_score >= 0.000 AND confidence_score <= 1.000),
  confidence_threshold DECIMAL(4,3) DEFAULT 0.750 CHECK (confidence_threshold >= 0.000 AND confidence_threshold <= 1.000),
  
  -- Audit Trail - When & Where
  locked_at TIMESTAMP WITH TIME ZONE,              -- When user locked the value
  suggested_at TIMESTAMP WITH TIME ZONE,           -- When AI made suggestion
  locked_source VARCHAR(50),                       -- call_1, call_2, manual, domain, form
  suggested_source VARCHAR(50),                    -- call_1, call_2, call_3, call_4, transcript, domain
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User Interaction Tracking
  user_rejected_suggestion BOOLEAN DEFAULT FALSE,  -- User explicitly rejected AI suggestion
  user_edit_count INTEGER DEFAULT 0,               -- How many times user edited this field
  user_validation_count INTEGER DEFAULT 0,         -- How many times user validated suggestions
  
  -- Field Metadata
  field_category VARCHAR(50) NOT NULL,             -- business_foundation, legal_structure, etc.
  priority_level INTEGER DEFAULT 5 CHECK (priority_level >= 1 AND priority_level <= 10),
  required_for_formation BOOLEAN DEFAULT FALSE,    -- Critical path field
  
  -- Business Rules
  depends_on_fields TEXT[],                        -- Fields this field depends on
  triggers_fields TEXT[],                          -- Fields this field should trigger updates for
  validation_rules JSONB,                          -- Custom validation rules
  
  -- AI Learning Data
  extraction_attempts INTEGER DEFAULT 0,           -- How many times AI tried to extract this
  extraction_success_rate DECIMAL(4,3) DEFAULT 0.000, -- Success rate for this field type
  user_correction_history JSONB,                   -- History of user corrections for AI learning
  
  -- Constraints
  UNIQUE(user_id, field_name),
  
  -- Ensure either locked_value or suggested_value exists when not empty
  CONSTRAINT check_value_exists CHECK (
    (field_status = 'empty') OR 
    (field_status = 'locked' AND locked_value IS NOT NULL) OR 
    (field_status = 'suggested' AND suggested_value IS NOT NULL)
  ),
  
  -- Ensure confidence_score exists when suggested
  CONSTRAINT check_confidence_on_suggested CHECK (
    (field_status != 'suggested') OR (confidence_score IS NOT NULL)
  ),
  
  -- Ensure locked_at exists when locked
  CONSTRAINT check_locked_at_on_locked CHECK (
    (field_status != 'locked') OR (locked_at IS NOT NULL)
  )
);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_dream_dna_fields_user_id ON dream_dna_fields(user_id);
CREATE INDEX IF NOT EXISTS idx_dream_dna_fields_user_status ON dream_dna_fields(user_id, field_status);
CREATE INDEX IF NOT EXISTS idx_dream_dna_fields_category ON dream_dna_fields(field_category);
CREATE INDEX IF NOT EXISTS idx_dream_dna_fields_confidence ON dream_dna_fields(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_dream_dna_fields_priority ON dream_dna_fields(priority_level DESC);
CREATE INDEX IF NOT EXISTS idx_dream_dna_fields_required ON dream_dna_fields(required_for_formation, field_status);
CREATE INDEX IF NOT EXISTS idx_dream_dna_fields_updated ON dream_dna_fields(last_updated DESC);

-- Create composite index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_dream_dna_fields_dashboard ON dream_dna_fields(
  user_id, field_category, field_status, priority_level DESC
);

-- Enable Row Level Security
ALTER TABLE dream_dna_fields ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user access
CREATE POLICY "Users can manage their own Dream DNA fields" ON dream_dna_fields
  FOR ALL USING (
    auth.uid()::text = user_id::text
  );

-- Create function to automatically update display_value
CREATE OR REPLACE FUNCTION update_dream_field_display_value()
RETURNS TRIGGER AS $$
BEGIN
  -- Set display_value based on field_status
  NEW.display_value = CASE 
    WHEN NEW.field_status = 'locked' THEN NEW.locked_value
    WHEN NEW.field_status = 'suggested' THEN NEW.suggested_value
    ELSE NULL
  END;
  
  -- Update timestamp
  NEW.last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update display_value
CREATE TRIGGER trigger_update_dream_field_display_value
  BEFORE INSERT OR UPDATE ON dream_dna_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_dream_field_display_value();

-- Create function to handle AI suggestion updates
CREATE OR REPLACE FUNCTION upsert_dream_field_suggestion(
  p_user_id UUID,
  p_field_name VARCHAR(100),
  p_suggested_value TEXT,
  p_confidence_score DECIMAL(4,3),
  p_suggested_source VARCHAR(50) DEFAULT 'ai_extraction',
  p_field_category VARCHAR(50) DEFAULT 'general',
  p_priority_level INTEGER DEFAULT 5,
  p_required_for_formation BOOLEAN DEFAULT FALSE
)
RETURNS dream_dna_fields AS $$
DECLARE
  result_field dream_dna_fields;
BEGIN
  INSERT INTO dream_dna_fields (
    user_id,
    field_name,
    suggested_value,
    confidence_score,
    field_status,
    suggested_at,
    suggested_source,
    field_category,
    priority_level,
    required_for_formation,
    extraction_attempts
  ) VALUES (
    p_user_id,
    p_field_name,
    p_suggested_value,
    p_confidence_score,
    CASE 
      WHEN p_confidence_score >= 0.750 THEN 'suggested'
      ELSE 'empty'
    END,
    NOW(),
    p_suggested_source,
    p_field_category,
    p_priority_level,
    p_required_for_formation,
    1
  )
  ON CONFLICT (user_id, field_name) 
  DO UPDATE SET
    -- Only update if not locked by user
    suggested_value = CASE 
      WHEN dream_dna_fields.field_status = 'locked' THEN dream_dna_fields.suggested_value
      ELSE EXCLUDED.suggested_value
    END,
    confidence_score = CASE 
      WHEN dream_dna_fields.field_status = 'locked' THEN dream_dna_fields.confidence_score
      ELSE EXCLUDED.confidence_score
    END,
    field_status = CASE 
      WHEN dream_dna_fields.field_status = 'locked' THEN 'locked'
      WHEN EXCLUDED.confidence_score >= dream_dna_fields.confidence_threshold THEN 'suggested'
      ELSE 'empty'
    END,
    suggested_at = CASE 
      WHEN dream_dna_fields.field_status = 'locked' THEN dream_dna_fields.suggested_at
      ELSE EXCLUDED.suggested_at
    END,
    suggested_source = CASE 
      WHEN dream_dna_fields.field_status = 'locked' THEN dream_dna_fields.suggested_source
      ELSE EXCLUDED.suggested_source
    END,
    extraction_attempts = dream_dna_fields.extraction_attempts + 1,
    last_updated = NOW()
  RETURNING * INTO result_field;
  
  RETURN result_field;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user field completion stats
CREATE OR REPLACE FUNCTION get_dream_dna_completion_stats(p_user_id UUID)
RETURNS TABLE (
  total_fields INTEGER,
  locked_fields INTEGER,
  suggested_fields INTEGER,
  empty_fields INTEGER,
  completion_percentage INTEGER,
  critical_fields INTEGER,
  critical_completed INTEGER,
  formation_ready_percentage INTEGER,
  categories_summary JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH field_stats AS (
    SELECT 
      COUNT(*)::INTEGER as total,
      COUNT(*) FILTER (WHERE field_status = 'locked')::INTEGER as locked,
      COUNT(*) FILTER (WHERE field_status = 'suggested')::INTEGER as suggested,
      COUNT(*) FILTER (WHERE field_status = 'empty')::INTEGER as empty,
      COUNT(*) FILTER (WHERE required_for_formation = TRUE)::INTEGER as critical,
      COUNT(*) FILTER (WHERE required_for_formation = TRUE AND field_status = 'locked')::INTEGER as critical_done
    FROM dream_dna_fields 
    WHERE user_id = p_user_id
  ),
  category_stats AS (
    SELECT jsonb_object_agg(
      field_category,
      jsonb_build_object(
        'total', COUNT(*),
        'locked', COUNT(*) FILTER (WHERE field_status = 'locked'),
        'suggested', COUNT(*) FILTER (WHERE field_status = 'suggested'),
        'empty', COUNT(*) FILTER (WHERE field_status = 'empty'),
        'completion_pct', CASE 
          WHEN COUNT(*) > 0 
          THEN ROUND((COUNT(*) FILTER (WHERE field_status = 'locked')::DECIMAL / COUNT(*)) * 100)
          ELSE 0 
        END
      )
    ) as categories
    FROM dream_dna_fields 
    WHERE user_id = p_user_id
    GROUP BY field_category
  )
  SELECT 
    fs.total,
    fs.locked,
    fs.suggested, 
    fs.empty,
    CASE WHEN fs.total > 0 THEN ROUND((fs.locked::DECIMAL / fs.total) * 100)::INTEGER ELSE 0 END,
    fs.critical,
    fs.critical_done,
    CASE WHEN fs.critical > 0 THEN ROUND((fs.critical_done::DECIMAL / fs.critical) * 100)::INTEGER ELSE 0 END,
    COALESCE(cs.categories, '{}'::jsonb)
  FROM field_stats fs
  CROSS JOIN category_stats cs;
END;
$$ LANGUAGE plpgsql;

-- Insert initial field structure for existing users (optional migration)
-- This would populate the fields table with the standard Dream DNA schema

INSERT INTO dream_dna_fields (user_id, field_name, field_status, field_category, priority_level, required_for_formation)
SELECT 
  u.id as user_id,
  field_config.field_name,
  'empty' as field_status,
  field_config.category,
  field_config.priority,
  field_config.required
FROM users u
CROSS JOIN (
  VALUES 
    -- Business Foundation (Priority 8-10, Required)
    ('business_name', 'business_foundation', 10, TRUE),
    ('what_problem', 'business_foundation', 9, TRUE),
    ('who_serves', 'business_foundation', 9, TRUE),
    ('how_different', 'business_foundation', 8, FALSE),
    ('primary_service', 'business_foundation', 8, FALSE),
    
    -- Financial Planning (Priority 6-8)
    ('target_revenue', 'financial_planning', 8, FALSE),
    ('business_model', 'financial_planning', 7, FALSE),
    ('startup_capital_needed', 'financial_planning', 7, FALSE),
    ('revenue_projections_year1', 'financial_planning', 6, FALSE),
    ('funding_sources', 'financial_planning', 6, FALSE),
    
    -- Legal Structure (Priority 8-10, Most Required)
    ('business_state', 'legal_structure', 10, TRUE),
    ('entity_type', 'legal_structure', 10, TRUE),
    ('registered_agent_name', 'legal_structure', 9, TRUE),
    ('registered_agent_address', 'legal_structure', 9, TRUE),
    ('business_purpose', 'legal_structure', 8, TRUE),
    
    -- Operations & Team (Priority 5-7)
    ('number_of_employees_planned', 'operations', 7, FALSE),
    ('will_have_physical_location', 'operations', 6, FALSE),
    ('home_based_business', 'operations', 6, FALSE),
    ('equipment_needed', 'operations', 5, FALSE),
    ('technology_requirements', 'operations', 5, FALSE),
    
    -- Market Strategy (Priority 6-8)  
    ('industry_category', 'market_strategy', 8, FALSE),
    ('geographic_focus', 'market_strategy', 7, FALSE),
    ('unique_value_proposition', 'market_strategy', 7, FALSE),
    ('competitive_advantage', 'market_strategy', 6, FALSE),
    ('target_customer_demographics', 'market_strategy', 6, FALSE),
    
    -- Brand & Digital (Priority 4-6)
    ('brand_personality', 'brand_identity', 6, FALSE),
    ('preferred_domain_name', 'brand_identity', 5, FALSE),
    ('website_needed', 'brand_identity', 5, FALSE),
    ('social_media_strategy', 'brand_identity', 4, FALSE),
    ('logo_needed', 'brand_identity', 4, FALSE),
    
    -- Timeline & Goals (Priority 5-7)
    ('timeline_to_launch', 'timeline_goals', 7, FALSE),
    ('growth_timeline', 'timeline_goals', 6, FALSE),
    ('success_milestones', 'timeline_goals', 5, FALSE),
    ('exit_strategy', 'timeline_goals', 5, FALSE),
    ('lifestyle_goals', 'timeline_goals', 5, FALSE),
    
    -- Psychology Profile (Priority 5-8)
    ('risk_tolerance', 'psychology_profile', 8, FALSE),
    ('urgency_level', 'psychology_profile', 8, FALSE),
    ('confidence_level', 'psychology_profile', 7, FALSE),
    ('support_needs', 'psychology_profile', 6, FALSE),
    ('motivation_factors', 'psychology_profile', 5, FALSE)
) AS field_config(field_name, category, priority, required)
ON CONFLICT (user_id, field_name) DO NOTHING;

-- Create view for easy dashboard queries
CREATE OR REPLACE VIEW dream_dna_dashboard_view AS
SELECT 
  f.*,
  u.customer_name,
  u.customer_email,
  u.business_name as user_business_name,
  CASE 
    WHEN f.field_status = 'locked' THEN f.locked_value
    WHEN f.field_status = 'suggested' THEN f.suggested_value
    ELSE NULL
  END as current_value,
  CASE
    WHEN f.confidence_score >= 0.90 THEN 'high'
    WHEN f.confidence_score >= 0.75 THEN 'medium'
    WHEN f.confidence_score >= 0.50 THEN 'low'
    ELSE 'very_low'
  END as confidence_level
FROM dream_dna_fields f
JOIN users u ON f.user_id = u.id
ORDER BY f.field_category, f.priority_level DESC, f.field_name;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON dream_dna_fields TO authenticated;
GRANT SELECT ON dream_dna_dashboard_view TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_dream_field_suggestion TO service_role;
GRANT EXECUTE ON FUNCTION get_dream_dna_completion_stats TO authenticated;