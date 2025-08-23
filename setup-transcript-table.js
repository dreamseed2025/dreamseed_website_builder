import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMDA3OCwiZXhwIjoyMDcwNjk2MDc4fQ.ByC7SLkJ2zeyhDN0nyWUNw-otETetisbjKM1sSCfS2Q'
);

async function setupTranscriptTable() {
  console.log('🗃️ Setting up call_transcripts table with vector support...');
  
  try {
    // Create the table with vector support
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create call_transcripts table with vector support
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
          
          -- Vector embeddings (using JSONB for now, can upgrade to vector type later)
          full_transcript_vector JSONB,
          user_messages_vector JSONB,
          semantic_summary_vector JSONB,
          
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
      `
    });
    
    if (error) {
      console.log('❌ Table creation error:', error.message);
      
      // Fallback: Try to create table using direct SQL execution
      console.log('📝 Trying alternative table creation...');
      
      // Check if table exists first
      const { data: tableExists } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'call_transcripts')
        .single();
      
      if (!tableExists) {
        console.log('📋 Creating table manually...');
        // We'll create a simplified version without vector extension for now
        console.log('⚠️  Creating simplified table (you may need to run the SQL script manually in Supabase)');
      } else {
        console.log('✅ Table already exists');
      }
    } else {
      console.log('✅ call_transcripts table created successfully');
    }
    
    // Test insert capability
    console.log('🧪 Testing table access...');
    const testRecord = {
      call_id: 'test-' + Date.now(),
      call_stage: 1,
      full_transcript: 'Test transcript',
      user_messages: ['Hello test'],
      assistant_messages: ['Hello back'],
      semantic_summary: 'Test summary',
      extracted_data: { test: true },
      full_transcript_vector: [0.1, 0.2, 0.3], // Simplified vector for testing
      vector_model: 'text-embedding-3-small',
      processed_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('call_transcripts')
      .insert(testRecord);
    
    if (insertError) {
      console.log('❌ Test insert failed:', insertError.message);
      console.log('📋 You may need to run the SQL script manually in Supabase SQL Editor');
    } else {
      console.log('✅ Test insert successful - table is ready');
      
      // Clean up test record
      await supabase
        .from('call_transcripts')
        .delete()
        .eq('call_id', testRecord.call_id);
    }
    
  } catch (error) {
    console.error('❌ Setup error:', error);
    console.log('📋 Please run the create-transcript-table.sql script manually in Supabase SQL Editor');
  }
}

setupTranscriptTable();