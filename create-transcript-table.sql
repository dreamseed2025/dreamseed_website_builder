-- Create call_transcripts table with vector support
-- This should be run in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS call_transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  call_id TEXT NOT NULL,
  call_stage INTEGER NOT NULL,
  
  -- Transcript content
  full_transcript TEXT,
  user_messages TEXT[],
  assistant_messages TEXT[],
  semantic_summary TEXT,
  
  -- Extracted structured data
  extracted_data JSONB,
  
  -- Vector embeddings (1536 dimensions for text-embedding-3-small)
  full_transcript_vector vector(1536),
  user_messages_vector vector(1536),
  semantic_summary_vector vector(1536),
  
  -- Metadata
  vector_model TEXT DEFAULT 'text-embedding-3-small',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT unique_call_transcript UNIQUE(call_id, call_stage)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_call_transcripts_user_id ON call_transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_call_stage ON call_transcripts(call_stage);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_created_at ON call_transcripts(created_at);

-- Vector similarity indexes (requires pgvector extension)
CREATE INDEX IF NOT EXISTS idx_call_transcripts_full_vector 
  ON call_transcripts USING ivfflat (full_transcript_vector vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_call_transcripts_user_vector 
  ON call_transcripts USING ivfflat (user_messages_vector vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_call_transcripts_summary_vector 
  ON call_transcripts USING ivfflat (semantic_summary_vector vector_cosine_ops)
  WITH (lists = 100);

-- Create a function for similarity search
CREATE OR REPLACE FUNCTION match_transcripts(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_id_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  call_id text,
  call_stage int,
  full_transcript text,
  semantic_summary text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN query
  SELECT
    call_transcripts.id,
    call_transcripts.user_id,
    call_transcripts.call_id,
    call_transcripts.call_stage,
    call_transcripts.full_transcript,
    call_transcripts.semantic_summary,
    1 - (call_transcripts.full_transcript_vector <=> query_embedding) as similarity
  FROM call_transcripts
  WHERE call_transcripts.full_transcript_vector IS NOT NULL
    AND (user_id_filter IS NULL OR call_transcripts.user_id = user_id_filter)
    AND 1 - (call_transcripts.full_transcript_vector <=> query_embedding) > match_threshold
  ORDER BY call_transcripts.full_transcript_vector <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_call_transcripts_updated_at 
  BEFORE UPDATE ON call_transcripts 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Grant permissions
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role can manage all transcripts" ON call_transcripts
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy for authenticated users to see their own transcripts
CREATE POLICY "Users can view own transcripts" ON call_transcripts
  FOR SELECT USING (
    auth.uid() IN (
      SELECT auth_user_id FROM users WHERE id = call_transcripts.user_id
    )
  );

-- Create a view for easy transcript analysis
CREATE OR REPLACE VIEW transcript_analytics AS
SELECT 
  ct.id,
  ct.call_id,
  ct.call_stage,
  ct.semantic_summary,
  ct.processed_at,
  u.customer_name,
  u.customer_email,
  u.customer_phone,
  u.business_name,
  u.entity_type,
  LENGTH(ct.full_transcript) as transcript_length,
  ARRAY_LENGTH(ct.user_messages, 1) as user_message_count,
  ARRAY_LENGTH(ct.assistant_messages, 1) as assistant_message_count
FROM call_transcripts ct
JOIN users u ON ct.user_id = u.id
ORDER BY ct.created_at DESC;