-- Supabase Database Schema for Voice AI Business Formation System
-- Project ID: plmmudazcsiksgmgphte

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: customers
-- Stores customer information collected across calls
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active' -- active, completed, dropped
);

-- Table: business_formations
-- Main table tracking the entire business formation process
CREATE TABLE IF NOT EXISTS business_formations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Business Details
    business_name VARCHAR(255),
    business_description TEXT,
    business_type VARCHAR(100), -- LLC, Corporation, etc.
    state_of_operation VARCHAR(50),
    industry VARCHAR(100),
    
    -- Progress Tracking
    call_1_completed BOOLEAN DEFAULT FALSE,
    call_2_completed BOOLEAN DEFAULT FALSE,
    call_3_completed BOOLEAN DEFAULT FALSE,
    call_4_completed BOOLEAN DEFAULT FALSE,
    call_1_completed_at TIMESTAMP WITH TIME ZONE,
    call_2_completed_at TIMESTAMP WITH TIME ZONE,
    call_3_completed_at TIMESTAMP WITH TIME ZONE,
    call_4_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status and Completion
    overall_status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed, abandoned
    completion_percentage INTEGER DEFAULT 0,
    estimated_revenue DECIMAL(10,2),
    package_selected VARCHAR(100), -- Launch Basic, Launch Pro, Launch Complete
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: call_transcripts
-- Stores conversation transcripts and extracted data from each call
CREATE TABLE IF NOT EXISTS call_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_formation_id UUID REFERENCES business_formations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Call Information
    call_number INTEGER NOT NULL CHECK (call_number BETWEEN 1 AND 4),
    vapi_assistant_id VARCHAR(255) NOT NULL,
    vapi_call_id VARCHAR(255),
    
    -- Transcript Data
    full_transcript TEXT,
    summary TEXT,
    extracted_data JSONB, -- Structured data extracted from conversation
    sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
    confidence_score DECIMAL(3,2), -- 0.0 to 1.0
    
    -- Call Metrics
    call_duration INTEGER, -- seconds
    call_status VARCHAR(50), -- completed, failed, abandoned
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: extracted_business_data
-- Structured data extracted from conversations
CREATE TABLE IF NOT EXISTS extracted_business_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_formation_id UUID REFERENCES business_formations(id) ON DELETE CASCADE,
    call_number INTEGER NOT NULL CHECK (call_number BETWEEN 1 AND 4),
    
    -- Call 1: Business Concept
    business_idea TEXT,
    target_market TEXT,
    revenue_model TEXT,
    funding_needs DECIMAL(10,2),
    
    -- Call 2: Legal Formation
    preferred_business_structure VARCHAR(100),
    state_preferences TEXT,
    trademark_needs BOOLEAN DEFAULT FALSE,
    compliance_requirements TEXT,
    
    -- Call 3: Banking & Operations
    banking_preferences TEXT,
    payment_processing_needs TEXT,
    accounting_software_preference VARCHAR(100),
    operational_requirements TEXT,
    
    -- Call 4: Website & Marketing
    website_requirements TEXT,
    branding_preferences TEXT,
    marketing_goals TEXT,
    domain_preferences TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: analytics_metrics
-- Tracks performance metrics and analytics
CREATE TABLE IF NOT EXISTS analytics_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Time Period
    date DATE NOT NULL,
    metric_type VARCHAR(100) NOT NULL, -- daily, weekly, monthly
    
    -- Funnel Metrics
    total_calls INTEGER DEFAULT 0,
    call_1_starts INTEGER DEFAULT 0,
    call_1_completions INTEGER DEFAULT 0,
    call_2_starts INTEGER DEFAULT 0,
    call_2_completions INTEGER DEFAULT 0,
    call_3_starts INTEGER DEFAULT 0,
    call_3_completions INTEGER DEFAULT 0,
    call_4_starts INTEGER DEFAULT 0,
    call_4_completions INTEGER DEFAULT 0,
    
    -- Conversion Rates (calculated)
    call_1_completion_rate DECIMAL(5,2),
    call_2_completion_rate DECIMAL(5,2),
    call_3_completion_rate DECIMAL(5,2),
    call_4_completion_rate DECIMAL(5,2),
    overall_completion_rate DECIMAL(5,2),
    
    -- Revenue Metrics
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_deal_size DECIMAL(10,2) DEFAULT 0,
    
    -- Geography
    state VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(date, metric_type, state)
);

-- Table: vapi_assistant_config
-- Configuration for Vapi assistants
CREATE TABLE IF NOT EXISTS vapi_assistant_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_number INTEGER NOT NULL UNIQUE CHECK (call_number BETWEEN 1 AND 4),
    assistant_id VARCHAR(255) NOT NULL,
    assistant_name VARCHAR(255) NOT NULL,
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Configuration
    max_duration INTEGER DEFAULT 1800, -- 30 minutes
    prompt_template TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Vapi Assistant Configuration
INSERT INTO vapi_assistant_config (call_number, assistant_id, assistant_name) VALUES
(1, '5ef9abf6-66b4-4457-9848-ee5436d6191f', 'Business Concept Discovery'),
(2, 'eb760659-21ba-4f94-a291-04f0897f0328', 'Legal Formation Planning'),
(3, '65ddc60b-b813-49b6-9986-38ee2974cfc9', 'Banking & Operations Setup'),
(4, 'af397e88-c286-416f-9f74-e7665401bdb7', 'Website & Marketing Planning')
ON CONFLICT (call_number) DO UPDATE SET
    assistant_id = EXCLUDED.assistant_id,
    assistant_name = EXCLUDED.assistant_name,
    updated_at = NOW();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_business_formations_customer_id ON business_formations(customer_id);
CREATE INDEX IF NOT EXISTS idx_business_formations_status ON business_formations(overall_status);
CREATE INDEX IF NOT EXISTS idx_business_formations_state ON business_formations(state_of_operation);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_business_formation_id ON call_transcripts(business_formation_id);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_call_number ON call_transcripts(call_number);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_vapi_call_id ON call_transcripts(vapi_call_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_date ON analytics_metrics(date);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_state ON analytics_metrics(state);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_formations_updated_at BEFORE UPDATE ON business_formations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_extracted_business_data_updated_at BEFORE UPDATE ON extracted_business_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vapi_assistant_config_updated_at BEFORE UPDATE ON vapi_assistant_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate completion percentage
CREATE OR REPLACE FUNCTION calculate_completion_percentage(
    call_1 BOOLEAN,
    call_2 BOOLEAN,
    call_3 BOOLEAN,
    call_4 BOOLEAN
) RETURNS INTEGER AS $$
BEGIN
    RETURN (
        (CASE WHEN call_1 THEN 25 ELSE 0 END) +
        (CASE WHEN call_2 THEN 25 ELSE 0 END) +
        (CASE WHEN call_3 THEN 25 ELSE 0 END) +
        (CASE WHEN call_4 THEN 25 ELSE 0 END)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update business formation progress
CREATE OR REPLACE FUNCTION update_business_formation_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update completion percentage
    NEW.completion_percentage = calculate_completion_percentage(
        NEW.call_1_completed,
        NEW.call_2_completed,
        NEW.call_3_completed,
        NEW.call_4_completed
    );
    
    -- Update overall status
    IF NEW.call_4_completed THEN
        NEW.overall_status = 'completed';
    ELSIF NEW.call_1_completed OR NEW.call_2_completed OR NEW.call_3_completed THEN
        NEW.overall_status = 'in_progress';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for business formation progress updates
CREATE TRIGGER update_business_formation_progress_trigger 
    BEFORE UPDATE ON business_formations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_business_formation_progress();

-- Row Level Security (RLS) policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_business_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (allow all operations)
CREATE POLICY "Service role can do everything" ON customers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do everything" ON business_formations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do everything" ON call_transcripts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do everything" ON extracted_business_data FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do everything" ON analytics_metrics FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;