const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL || 'https://kxldodhrhqbwyvgyuqfd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMDA3OCwiZXhwIjoyMDcwNjk2MDc4fQ.ByC7SLkJ2zeyhDN0nyWUNw-otETetisbjKM1sSCfS2Q'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testNewDatabaseIntegration() {
  console.log('🧪 Testing New Database Integration...\n')

  try {
    // Test 1: Check if new tables exist
    console.log('1️⃣ Checking new database tables...')
    
    const tables = [
      'transcripts_raw',
      'transcripts_vectorized', 
      'conversation_sessions',
      'dream_dna_truth',
      'dream_dna_probability',
      'dream_dna_type'
    ]

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: Table accessible`)
        }
      } catch (err) {
        console.log(`❌ ${table}: Table not found or inaccessible`)
      }
    }

    // Test 2: Check legacy tables still work
    console.log('\n2️⃣ Checking legacy tables...')
    
    const legacyTables = ['call_transcripts', 'dream_dna', 'users']
    
    for (const table of legacyTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: Table accessible`)
        }
      } catch (err) {
        console.log(`❌ ${table}: Table not found or inaccessible`)
      }
    }

    // Test 3: Test new API endpoints
    console.log('\n3️⃣ Testing new API endpoints...')
    
    const endpoints = [
      'http://localhost:3000/api/transcript-processor',
      'http://localhost:3000/api/vapi-personalize',
      'http://localhost:3000/api/vapi-rag'
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: 'test-user',
            transcriptText: 'Test transcript',
            callStage: 1,
            callId: 'test-call-123'
          })
        })
        
        if (response.ok) {
          console.log(`✅ ${endpoint}: Working`)
        } else {
          console.log(`⚠️ ${endpoint}: Status ${response.status}`)
        }
      } catch (err) {
        console.log(`❌ ${endpoint}: ${err.message}`)
      }
    }

    console.log('\n🎉 Database Integration Test Complete!')
    console.log('\n📊 Summary:')
    console.log('- New tables: transcripts_raw, transcripts_vectorized, conversation_sessions')
    console.log('- New Dream DNA: dream_dna_truth, dream_dna_probability, dream_dna_type')
    console.log('- Legacy compatibility: call_transcripts, dream_dna maintained')
    console.log('- New API: /api/transcript-processor for enhanced processing')
    console.log('- Enhanced RAG: Uses new vectorized transcripts with fallback')
    console.log('- Enhanced Personalization: Uses new Dream DNA system')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testNewDatabaseIntegration()

