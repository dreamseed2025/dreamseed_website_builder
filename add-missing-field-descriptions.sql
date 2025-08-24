-- Add Missing Field Descriptions to Dream DNA Tables
-- This script adds comprehensive descriptions for all fields that are missing them

-- Core Business Foundation Fields (Missing Descriptions)
COMMENT ON COLUMN dream_dna_truth.business_name IS 'Legal business name for registration and branding - primary business identifier with high extraction confidence';
COMMENT ON COLUMN dream_dna_truth.business_type IS 'Legal entity type (LLC, C-Corp, S-Corp, etc.) - determines formation requirements and tax structure';
COMMENT ON COLUMN dream_dna_truth.registering_state IS 'State where business will be formed - affects legal requirements, taxes, and compliance';
COMMENT ON COLUMN dream_dna_truth.domain IS 'Preferred domain name for website - brand identity and online presence';
COMMENT ON COLUMN dream_dna_truth.what_problem IS 'Core customer problem or market pain point - drives value proposition and marketing messaging';
COMMENT ON COLUMN dream_dna_truth.who_serves IS 'Target customer demographic and market segment - defines customer base and messaging strategy';
COMMENT ON COLUMN dream_dna_truth.how_different IS 'Unique value proposition and competitive differentiation - strategic positioning and brand identity';
COMMENT ON COLUMN dream_dna_truth.primary_service IS 'Core product or service offering - business model foundation and revenue generation';
COMMENT ON COLUMN dream_dna_truth.target_revenue IS 'Revenue goals and financial targets - financial planning and package recommendations';
COMMENT ON COLUMN dream_dna_truth.business_model IS 'Revenue strategy and business structure - SaaS, E-commerce, Service-based classification';
COMMENT ON COLUMN dream_dna_truth.unique_value_proposition IS 'Unique value proposition and market positioning - marketing copy and elevator pitch';
COMMENT ON COLUMN dream_dna_truth.competitive_advantage IS 'Competitive differentiation and market advantage - strategic positioning and investor materials';
COMMENT ON COLUMN dream_dna_truth.brand_personality IS 'Brand personality and tone - website templates, voice/tone, marketing style';
COMMENT ON COLUMN dream_dna_truth.business_stage IS 'Business lifecycle stage - startup, growth, established, pivot - affects workflow routing';
COMMENT ON COLUMN dream_dna_truth.industry_category IS 'Primary industry classification - regulatory requirements, market analysis, template matching';
COMMENT ON COLUMN dream_dna_truth.geographic_focus IS 'Geographic market focus and expansion strategy - legal formation, tax implications, market strategy';
COMMENT ON COLUMN dream_dna_truth.timeline_to_launch IS 'Timeline to business launch in months - project management, urgency routing, resource allocation';
COMMENT ON COLUMN dream_dna_truth.confidence_score IS 'AI confidence in data extraction accuracy (0.00-1.00) - data quality assessment and validation needs';
COMMENT ON COLUMN dream_dna_truth.extraction_source IS 'Source of data extraction - voice_call, form, domain_selection - data provenance tracking';
COMMENT ON COLUMN dream_dna_truth.validated_by_user IS 'User confirmation of extracted data - data confidence and accuracy tracking';
COMMENT ON COLUMN dream_dna_truth.dream_type IS 'Type of dream/business formation - business_formation, etc. - workflow categorization';

-- Add descriptions for probability fields in dream_dna_probability_truth
COMMENT ON COLUMN dream_dna_probability_truth.business_name_probability IS 'AI confidence score for business name extraction (0.00-1.00)';
COMMENT ON COLUMN dream_dna_probability_truth.business_type_probability IS 'AI confidence score for business type classification (0.00-1.00)';
COMMENT ON COLUMN dream_dna_probability_truth.registering_state_probability IS 'AI confidence score for state selection (0.00-1.00)';
COMMENT ON COLUMN dream_dna_probability_truth.domain_probability IS 'AI confidence score for domain name extraction (0.00-1.00)';
COMMENT ON COLUMN dream_dna_probability_truth.what_problem_probability IS 'AI confidence score for problem statement extraction (0.00-1.00)';
COMMENT ON COLUMN dream_dna_probability_truth.who_serves_probability IS 'AI confidence score for target customer extraction (0.00-1.00)';
COMMENT ON COLUMN dream_dna_probability_truth.how_different_probability IS 'AI confidence score for differentiation extraction (0.00-1.00)';
COMMENT ON COLUMN dream_dna_probability_truth.primary_service_probability IS 'AI confidence score for service offering extraction (0.00-1.00)';
COMMENT ON COLUMN dream_dna_probability_truth.target_revenue_probability IS 'AI confidence score for revenue goal extraction (0.00-1.00)';
COMMENT ON COLUMN dream_dna_probability_truth.business_model_probability IS 'AI confidence score for business model classification (0.00-1.00)';
COMMENT ON COLUMN dream_dna_probability_truth.unique_value_proposition_probability IS 'AI confidence score for value proposition extraction (0.00-1.00)';
COMMENT ON COLUMN dream_dna_probability_truth.competitive_advantage_probability IS 'AI confidence score for competitive advantage extraction (0.00-1.00)';
COMMENT ON COLUMN dream_dna_probability_truth.brand_personality_probability IS 'AI confidence score for brand personality extraction (0.00-1.00)';
COMMENT ON COLUMN dream_dna_probability_truth.business_stage_probability IS 'AI confidence score for business stage classification (0.00-1.00)';
COMMENT ON COLUMN dream_dna_probability_truth.industry_category_probability IS 'AI confidence score for industry classification (0.00-1.00)';
COMMENT ON COLUMN dream_dna_probability_truth.geographic_focus_probability IS 'AI confidence score for geographic focus extraction (0.00-1.00)';
COMMENT ON COLUMN dream_dna_probability_truth.timeline_to_launch_probability IS 'AI confidence score for timeline extraction (0.00-1.00)';

-- Add descriptions for dream_dna_type table fields
COMMENT ON COLUMN dream_dna_type.formation_type IS 'Type of business formation (LLC, C-Corp, S-Corp, etc.) - determines legal requirements';
COMMENT ON COLUMN dream_dna_type.state IS 'State where business will be formed - affects legal requirements and compliance';
COMMENT ON COLUMN dream_dna_type.articles_of_incorporation_required IS 'Whether articles of incorporation are required for this formation type';
COMMENT ON COLUMN dream_dna_type.formation_requirements IS 'JSON object containing specific formation requirements for this type and state';
COMMENT ON COLUMN dream_dna_type.estimated_cost IS 'Estimated cost for formation including filing fees and services';
COMMENT ON COLUMN dream_dna_type.processing_time_days IS 'Estimated processing time in days for formation completion';
COMMENT ON COLUMN dream_dna_type.annual_requirements IS 'JSON object containing annual compliance requirements and costs';

-- Success message
SELECT 'Missing field descriptions added successfully to Dream DNA tables!' as status;
