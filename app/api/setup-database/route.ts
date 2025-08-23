import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('🔧 Setting up database tables...')
    
    // Create dream_dna table
    const dreamDnaSQL = `
      CREATE TABLE IF NOT EXISTS dream_dna (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Vision & Purpose
        vision_statement TEXT,
        core_purpose TEXT,
        passion_driver TEXT,
        
        -- Business Dream Details
        business_concept TEXT,
        target_customers TEXT,
        unique_value_prop TEXT,
        revenue_goals TEXT,
        
        -- Success Metrics & Goals
        lifestyle_goals TEXT,
        
        -- Psychological Profile
        risk_tolerance TEXT,
        confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 10),
        
        -- Analysis Metadata
        completeness_score INTEGER DEFAULT 0
      );
    `
    
    // Try to create table by inserting a test record and handling the error
    try {
      await supabase.from('dream_dna').select('id').limit(1)
      console.log('✅ dream_dna table already exists')
    } catch (error) {
      console.log('📊 Creating dream_dna table...')
      
      // Use raw SQL to create table
      const { error: createError } = await supabase
        .from('dream_dna')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // Dummy insert to trigger table creation
          vision_statement: 'test',
          business_concept: 'test'
        })
      
      // The insert will fail, but if it's a table doesn't exist error, we know we need to create it
      if (createError?.message.includes('relation') || createError?.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          message: 'Tables need to be created manually in Supabase dashboard',
          instructions: 'Please run the SQL from sql/02_create_dream_dna_table.sql in your Supabase SQL editor'
        })
      }
    }
    
    // Test both tables
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    const { data: dreamData, error: dreamError } = await supabase
      .from('dream_dna')
      .select('id')
      .limit(1)
    
    const results = {
      users_table: usersError ? `❌ ${usersError.message}` : '✅ Connected',
      dream_dna_table: dreamError ? `❌ ${dreamError.message}` : '✅ Connected',
      supabase_url: supabaseUrl
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database setup check complete',
      results
    })
    
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database setup endpoint',
    usage: 'POST to check/setup database tables'
  })
}