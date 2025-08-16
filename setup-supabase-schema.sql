-- DreamSeed Business Formation Table Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS business_formations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Customer Information
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    
    -- Business Information  
    business_name VARCHAR(255),
    business_description TEXT,
    state_of_operation VARCHAR(100),
    entity_type VARCHAR(50) DEFAULT 'LLC',
    industry VARCHAR(100),
    package_type VARCHAR(50),
    
    -- Call Tracking
    call_stage INTEGER,
    call_1_completed_at TIMESTAMPTZ,
    call_1_transcript TEXT,
    call_2_completed_at TIMESTAMPTZ,
    call_2_transcript TEXT,
    call_3_completed_at TIMESTAMPTZ,
    call_3_transcript TEXT,
    call_4_completed_at TIMESTAMPTZ,
    call_4_transcript TEXT,
    
    -- Assistant Information
    assistant_id VARCHAR(255),
    
    -- Status and Analytics
    status VARCHAR(50) DEFAULT 'in_progress',
    extraction_confidence INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Row Level Security (optional but recommended)
ALTER TABLE business_formations ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON business_formations
    FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_formations_customer_phone ON business_formations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_business_formations_customer_email ON business_formations(customer_email);
CREATE INDEX IF NOT EXISTS idx_business_formations_created_at ON business_formations(created_at);
CREATE INDEX IF NOT EXISTS idx_business_formations_status ON business_formations(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_formations_updated_at
    BEFORE UPDATE ON business_formations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();