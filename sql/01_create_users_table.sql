-- Create users table for core business information
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contact Information
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  
  -- Business Information
  business_name TEXT,
  business_type TEXT,
  state_of_operation TEXT,
  entity_type TEXT DEFAULT 'LLC',
  
  -- Call Progress Tracking
  call_1_completed BOOLEAN DEFAULT FALSE,
  call_2_completed BOOLEAN DEFAULT FALSE,
  call_3_completed BOOLEAN DEFAULT FALSE,
  call_4_completed BOOLEAN DEFAULT FALSE,
  call_1_completed_at TIMESTAMP WITH TIME ZONE,
  call_2_completed_at TIMESTAMP WITH TIME ZONE,
  call_3_completed_at TIMESTAMP WITH TIME ZONE,
  call_4_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Status and Progress
  status TEXT DEFAULT 'in_progress',
  current_call_stage INTEGER DEFAULT 1,
  next_call_scheduled TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  assistant_id TEXT,
  package_preference TEXT,
  urgency_level TEXT,
  timeline TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(customer_phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(customer_email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_call_stage ON users(current_call_stage);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth needs)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true);