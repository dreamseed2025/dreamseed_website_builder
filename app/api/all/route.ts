import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET() {
  try {
    // Check if Supabase credentials are available
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase credentials not configured, returning demo data')
      return NextResponse.json(getDemoData())
    }

    // Fetch dreams/customer data from Supabase
    const { data, error } = await supabase
      .from('dream_dna')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      // Return demo data if there's an error
      return NextResponse.json(getDemoData())
    }

    // Transform the data to match the expected format
    const dreams = data?.map(item => ({
      id: item.id || item.customer_id,
      dream_name: item.dream_name || item.business_name || 'Untitled Dream',
      customer_name: item.customer_name || item.name || 'Unknown Customer',
      customer_email: item.customer_email || item.email || 'No email',
      entity_type: item.entity_type || item.business_type || 'LLC',
      state_of_operation: item.state_of_operation || item.state || 'Unknown',
      completion_percentage: item.completion_percentage || calculateProgress(item),
      created_at: item.created_at || new Date().toISOString(),
      stage: item.stage || 1
    })) || []

    // If no data from Supabase, return demo data
    if (dreams.length === 0) {
      return NextResponse.json(getDemoData())
    }

    return NextResponse.json(dreams)
  } catch (error) {
    console.error('API error:', error)
    // Return demo data on any error
    return NextResponse.json(getDemoData())
  }
}

function getDemoData() {
  return [
    {
      id: 'demo-1',
      dream_name: 'Tech Startup Inc.',
      customer_name: 'Sarah Johnson',
      customer_email: 'sarah@techstartup.com',
      entity_type: 'LLC',
      state_of_operation: 'Delaware',
      completion_percentage: 75,
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      stage: 3
    },
    {
      id: 'demo-2',
      dream_name: 'Green Energy Solutions',
      customer_name: 'Mike Chen',
      customer_email: 'mike@greenenergy.com',
      entity_type: 'Corporation',
      state_of_operation: 'California',
      completion_percentage: 100,
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      stage: 4
    },
    {
      id: 'demo-3',
      dream_name: 'Local Coffee Co.',
      customer_name: 'Emma Rodriguez',
      customer_email: 'emma@localcoffee.com',
      entity_type: 'LLC',
      state_of_operation: 'Texas',
      completion_percentage: 25,
      created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      stage: 1
    }
  ]
}

function calculateProgress(item: any): number {
  // Calculate progress based on available data
  let progress = 0
  
  if (item.customer_name || item.name) progress += 25
  if (item.dream_name || item.business_name) progress += 25
  if (item.entity_type || item.business_type) progress += 25
  if (item.state_of_operation || item.state) progress += 25
  
  return Math.min(progress, 100)
}