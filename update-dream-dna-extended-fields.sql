-- Update Dream DNA Tables with Extended Fields
-- This script adds the extended psychological profiling and business intelligence fields

-- Add extended fields to dream_dna_truth table
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS vision_statement TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS core_purpose TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS impact_goal TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS legacy_vision TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS passion_driver TEXT;

ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS business_concept TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS target_customers TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS unique_value_prop TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS scalability_vision TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS revenue_goals TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS services_offered TEXT;

ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS lifestyle_goals TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS freedom_level TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS growth_timeline TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS exit_strategy TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS success_milestones JSONB;

ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS risk_tolerance TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS urgency_level TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS confidence_level INTEGER;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS support_needs TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS pain_points TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS motivation_factors JSONB;

ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS package_preference TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS budget_mentioned TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS timeline_preference TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS next_steps TEXT;
ALTER TABLE dream_dna_truth ADD COLUMN IF NOT EXISTS key_requirements JSONB;

-- Add extended fields to dream_dna_probability_truth table
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS vision_statement TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS core_purpose TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS impact_goal TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS legacy_vision TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS passion_driver TEXT;

ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS business_concept TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS target_customers TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS unique_value_prop TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS scalability_vision TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS revenue_goals TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS services_offered TEXT;

ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS lifestyle_goals TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS freedom_level TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS growth_timeline TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS exit_strategy TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS success_milestones JSONB;

ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS risk_tolerance TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS urgency_level TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS confidence_level INTEGER;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS support_needs TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS pain_points TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS motivation_factors JSONB;

ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS package_preference TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS budget_mentioned TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS timeline_preference TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS next_steps TEXT;
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS key_requirements JSONB;

-- Add probability fields for extended fields
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS vision_statement_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS core_purpose_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS impact_goal_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS legacy_vision_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS passion_driver_probability DECIMAL(3,2);

ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS business_concept_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS target_customers_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS unique_value_prop_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS scalability_vision_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS revenue_goals_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS services_offered_probability DECIMAL(3,2);

ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS lifestyle_goals_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS freedom_level_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS growth_timeline_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS exit_strategy_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS success_milestones_probability DECIMAL(3,2);

ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS risk_tolerance_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS urgency_level_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS confidence_level_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS support_needs_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS pain_points_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS motivation_factors_probability DECIMAL(3,2);

ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS package_preference_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS budget_range_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS budget_mentioned_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS timeline_preference_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS next_steps_probability DECIMAL(3,2);
ALTER TABLE dream_dna_probability_truth ADD COLUMN IF NOT EXISTS key_requirements_probability DECIMAL(3,2);

-- Add comments for documentation
COMMENT ON COLUMN dream_dna_truth.vision_statement IS 'Vision statement extracted from "I want to..." patterns';
COMMENT ON COLUMN dream_dna_truth.core_purpose IS 'Core purpose extracted from "Because..." patterns';
COMMENT ON COLUMN dream_dna_truth.impact_goal IS 'Impact goal extracted from "To help..." patterns';
COMMENT ON COLUMN dream_dna_truth.legacy_vision IS 'Legacy vision extracted from "So that..." patterns';
COMMENT ON COLUMN dream_dna_truth.passion_driver IS 'Passion driver extracted from "I''m excited about..." patterns';

COMMENT ON COLUMN dream_dna_truth.business_concept IS 'Business concept extracted from "Start a..." patterns';
COMMENT ON COLUMN dream_dna_truth.target_customers IS 'Target customers extracted from "For...who" patterns';
COMMENT ON COLUMN dream_dna_truth.unique_value_prop IS 'Unique value proposition extracted from "Different because..." patterns';
COMMENT ON COLUMN dream_dna_truth.scalability_vision IS 'Scalability vision extracted from "Scale to..." patterns';
COMMENT ON COLUMN dream_dna_truth.revenue_goals IS 'Revenue goals extracted from "$X per month" patterns';
COMMENT ON COLUMN dream_dna_truth.services_offered IS 'Services offered description';

COMMENT ON COLUMN dream_dna_truth.lifestyle_goals IS 'Lifestyle goals extracted from "Give me freedom to..." patterns';
COMMENT ON COLUMN dream_dna_truth.freedom_level IS 'Desired level of autonomy';
COMMENT ON COLUMN dream_dna_truth.growth_timeline IS 'Growth timeline expectations';
COMMENT ON COLUMN dream_dna_truth.exit_strategy IS 'Long-term exit strategy plans';
COMMENT ON COLUMN dream_dna_truth.success_milestones IS 'Structured success milestones (JSONB)';

COMMENT ON COLUMN dream_dna_truth.risk_tolerance IS 'Risk appetite indicators';
COMMENT ON COLUMN dream_dna_truth.urgency_level IS 'Urgency level extracted from "Need to start ASAP" patterns';
COMMENT ON COLUMN dream_dna_truth.confidence_level IS 'Confidence level indicators (1-10)';
COMMENT ON COLUMN dream_dna_truth.support_needs IS 'Help and support requirements';
COMMENT ON COLUMN dream_dna_truth.pain_points IS 'Current pain points and frustrations';
COMMENT ON COLUMN dream_dna_truth.motivation_factors IS 'What drives the entrepreneur (JSONB)';

COMMENT ON COLUMN dream_dna_truth.package_preference IS 'Package preference mentions';
COMMENT ON COLUMN dream_dna_truth.budget_range IS 'Budget range indicators';
COMMENT ON COLUMN dream_dna_truth.budget_mentioned IS 'Specific budget amounts mentioned';
COMMENT ON COLUMN dream_dna_truth.timeline_preference IS 'Desired timeline preferences';
COMMENT ON COLUMN dream_dna_truth.next_steps IS 'Immediate next steps';
COMMENT ON COLUMN dream_dna_truth.key_requirements IS 'Must-have features and requirements (JSONB)';

-- Create indexes for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_dream_dna_truth_vision_statement ON dream_dna_truth(vision_statement);
CREATE INDEX IF NOT EXISTS idx_dream_dna_truth_business_concept ON dream_dna_truth(business_concept);
CREATE INDEX IF NOT EXISTS idx_dream_dna_truth_risk_tolerance ON dream_dna_truth(risk_tolerance);
CREATE INDEX IF NOT EXISTS idx_dream_dna_truth_confidence_level ON dream_dna_truth(confidence_level);
CREATE INDEX IF NOT EXISTS idx_dream_dna_truth_package_preference ON dream_dna_truth(package_preference);

-- Update table comments
COMMENT ON TABLE dream_dna_truth IS 'Core dream DNA facts - the source of truth for all dream data including extended psychological profiling';
COMMENT ON TABLE dream_dna_probability_truth IS 'AI probability analysis - guesses and confidence scores for dream data including extended fields';

-- Success message
SELECT 'Dream DNA tables updated successfully with extended fields!' as status;
