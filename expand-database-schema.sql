-- Comprehensive Business Launch Database Schema Expansion
-- Adds 108+ fields to track complete business formation requirements

-- Add comprehensive checklist tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_checklist JSONB DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS launch_readiness JSONB DEFAULT '{}'::jsonb;

-- Contact Information Fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS zip TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT;

-- LLC Filing Comprehensive Fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS registered_agent TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS registered_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS principal_business_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_purpose TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT 'perpetual';
ALTER TABLE users ADD COLUMN IF NOT EXISTS member_names TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS member_addresses TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS ownership_percentages NUMERIC[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS management_structure TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ein_info TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS naics_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_licenses TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS special_permits TEXT[];

-- Brand Identity Fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS industry_sector TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS brand_personality TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS brand_values TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS color_preferences TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS style_direction TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS logo_type_preference TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS inspiration_references TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS usage_requirements TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS file_format_needs TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS color_variations TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS size_considerations TEXT;

-- Domain Requirements
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_business_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS alternative_names TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS domain_extension_preference TEXT DEFAULT '.com';
ALTER TABLE users ADD COLUMN IF NOT EXISTS geographic_considerations TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS brand_protection BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dns_management TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_hosting TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subdomain_strategy TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS domain_privacy BOOLEAN DEFAULT true;

-- Website Content Fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name_tagline TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_description TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS problem_solved TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS target_customers TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS unique_value_proposition TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_services_products TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS founder_story TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_mission TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS core_values TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_information TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_history TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hours_of_operation TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS service_areas TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS service_descriptions TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS pricing_information TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS process_methodology TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS benefits_outcomes TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS testimonials_reviews JSONB[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_photos TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS product_images TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS hero_images TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS brand_colors JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS typography_preferences TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_form_requirements TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_media_links JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS analytics_tracking TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_optimization BOOLEAN DEFAULT true;

-- Financial & Operational Fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_banking TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS accounting_software TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS financial_projections JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS funding_requirements TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_processing TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_location_type TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipment_needs TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS software_requirements TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS vendor_supplier_relationships TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS inventory_management TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_insurance TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS industry_regulations TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS employment_law TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tax_obligations TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS contract_templates TEXT[];

-- Launch & Marketing Fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS target_market_definition TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_channels TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS content_strategy TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS launch_timeline TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_budget NUMERIC;
ALTER TABLE users ADD COLUMN IF NOT EXISTS attorney TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS accountant TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS insurance_agent TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_consultant TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS technology_support TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_service TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS quality_control TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS growth_planning TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS exit_strategy TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS succession_planning TEXT;

-- Data Quality & Readiness Tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS completeness_score NUMERIC DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS accuracy_score NUMERIC DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consistency_score NUMERIC DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS depth_score NUMERIC DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS overall_quality_score NUMERIC DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ready_for_llc_filing BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ready_for_logo_design BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ready_for_domain_purchase BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ready_for_website_build BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ready_for_launch BOOLEAN DEFAULT false;

-- Missing Information Tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS missing_information JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS next_action_items JSONB DEFAULT '[]'::jsonb;

-- Performance Indexes for Quick Queries
CREATE INDEX IF NOT EXISTS idx_users_completion ON users(completion_percentage);
CREATE INDEX IF NOT EXISTS idx_users_launch_readiness ON users USING GIN(launch_readiness);
CREATE INDEX IF NOT EXISTS idx_users_business_checklist ON users USING GIN(business_checklist);
CREATE INDEX IF NOT EXISTS idx_users_entity_state ON users(entity_type, state_of_operation);

-- Function to calculate completion percentage
CREATE OR REPLACE FUNCTION calculate_completion_percentage()
RETURNS TRIGGER AS $$
DECLARE
    total_fields INTEGER := 108;
    completed_fields INTEGER := 0;
    field_value TEXT;
    field_names TEXT[] := ARRAY[
        'first_name', 'last_name', 'customer_email', 'customer_phone', 'address', 'city', 'state_of_operation', 'zip', 'preferred_contact_method',
        'business_name', 'entity_type', 'state_of_operation', 'business_purpose', 'registered_agent', 'registered_address', 'principal_business_address',
        'duration', 'management_structure', 'naics_code', 'industry_sector', 'brand_personality', 'target_audience', 'color_preferences',
        'style_direction', 'logo_type_preference', 'primary_business_name', 'domain_extension_preference', 'business_name_tagline',
        'business_description', 'problem_solved', 'target_customers', 'unique_value_proposition', 'founder_story', 'business_mission',
        'team_information', 'company_history', 'business_address', 'business_phone', 'business_email', 'hours_of_operation',
        'service_areas', 'pricing_information', 'process_methodology', 'business_banking', 'accounting_software', 'funding_requirements',
        'business_location_type', 'inventory_management', 'employment_law', 'target_market_definition', 'content_strategy', 'launch_timeline',
        'marketing_budget', 'attorney', 'accountant', 'insurance_agent', 'marketing_consultant', 'technology_support', 'customer_service',
        'quality_control', 'growth_planning', 'exit_strategy', 'succession_planning'
    ];
BEGIN
    -- Count non-null, non-empty fields
    FOREACH field_value IN ARRAY field_names
    LOOP
        EXECUTE format('SELECT CASE WHEN $1.%I IS NOT NULL AND $1.%I != '''' AND $1.%I != ''Not extracted'' THEN 1 ELSE 0 END', field_value, field_value, field_value) 
        USING NEW INTO completed_fields;
        
        IF completed_fields > 0 THEN
            NEW.completion_percentage := NEW.completion_percentage + 1;
        END IF;
    END LOOP;
    
    -- Calculate final percentage
    NEW.completion_percentage := ROUND((NEW.completion_percentage::NUMERIC / total_fields) * 100);
    
    -- Update readiness flags
    NEW.ready_for_llc_filing := (NEW.completion_percentage >= 20 AND NEW.business_name IS NOT NULL AND NEW.entity_type IS NOT NULL);
    NEW.ready_for_logo_design := (NEW.brand_personality IS NOT NULL AND NEW.color_preferences IS NOT NULL);
    NEW.ready_for_domain_purchase := (NEW.business_name IS NOT NULL AND NEW.primary_business_name IS NOT NULL);
    NEW.ready_for_website_build := (NEW.completion_percentage >= 40 AND NEW.business_description IS NOT NULL);
    NEW.ready_for_launch := (NEW.completion_percentage >= 70);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate completion on updates
DROP TRIGGER IF EXISTS trigger_calculate_completion ON users;
CREATE TRIGGER trigger_calculate_completion
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION calculate_completion_percentage();

-- Add helpful comments
COMMENT ON TABLE users IS 'Comprehensive customer data tracking all 108+ business launch requirements';
COMMENT ON COLUMN users.business_checklist IS 'JSONB tracking completion status of all checklist items';
COMMENT ON COLUMN users.completion_percentage IS 'Auto-calculated percentage of completed business formation items';
COMMENT ON COLUMN users.launch_readiness IS 'JSONB tracking readiness for each launch milestone';

-- Create view for easy reporting
CREATE OR REPLACE VIEW customer_launch_status AS
SELECT 
    customer_phone,
    customer_name,
    business_name,
    entity_type,
    completion_percentage,
    ready_for_llc_filing,
    ready_for_logo_design,
    ready_for_domain_purchase,
    ready_for_website_build,
    ready_for_launch,
    call_1_completed,
    call_2_completed,
    call_3_completed,
    call_4_completed,
    updated_at
FROM users
ORDER BY completion_percentage DESC, updated_at DESC;

COMMENT ON VIEW customer_launch_status IS 'Summary view of customer business launch progress and readiness';