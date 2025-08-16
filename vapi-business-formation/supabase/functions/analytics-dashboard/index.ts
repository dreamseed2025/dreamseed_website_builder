import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { DatabaseService } from '../_shared/database.ts'

interface AnalyticsQuery {
  startDate?: string
  endDate?: string
  state?: string
  timeframe?: 'daily' | 'weekly' | 'monthly'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const query: AnalyticsQuery = {
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
      state: url.searchParams.get('state') || undefined,
      timeframe: (url.searchParams.get('timeframe') as any) || 'daily'
    }

    const db = new DatabaseService()

    // Calculate date range
    const endDate = query.endDate ? new Date(query.endDate) : new Date()
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

    // Get overall metrics
    const overallMetrics = await getOverallMetrics(db, startDate, endDate, query.state)
    
    // Get funnel analysis
    const funnelAnalysis = await getFunnelAnalysis(db, startDate, endDate, query.state)
    
    // Get state breakdown
    const stateBreakdown = await getStateBreakdown(db, startDate, endDate)
    
    // Get revenue metrics
    const revenueMetrics = await getRevenueMetrics(db, startDate, endDate, query.state)
    
    // Get trend data
    const trendData = await getTrendData(db, startDate, endDate, query.timeframe, query.state)
    
    // Get customer satisfaction
    const satisfactionMetrics = await getSatisfactionMetrics(db, startDate, endDate, query.state)

    const analytics = {
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      },
      overallMetrics,
      funnelAnalysis,
      stateBreakdown,
      revenueMetrics,
      trendData,
      satisfactionMetrics
    }

    return new Response(
      JSON.stringify(analytics),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error generating analytics:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function getOverallMetrics(db: DatabaseService, startDate: Date, endDate: Date, state?: string) {
  const whereClause = state ? `AND state_of_operation = '${state}'` : ''
  
  const { data, error } = await db.supabase.rpc('get_overall_metrics', {
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    filter_state: state || null
  })

  if (error) {
    console.error('Error getting overall metrics:', error)
    return {
      totalCustomers: 0,
      totalBusinessFormations: 0,
      completedFormations: 0,
      activeFormations: 0,
      totalRevenue: 0,
      averageDealSize: 0
    }
  }

  return data || {}
}

async function getFunnelAnalysis(db: DatabaseService, startDate: Date, endDate: Date, state?: string) {
  const { data: formations, error } = await db.supabase
    .from('business_formations')
    .select('call_1_completed, call_2_completed, call_3_completed, call_4_completed, state_of_operation')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (error) {
    console.error('Error getting funnel data:', error)
    return {}
  }

  const filtered = state ? formations?.filter(f => f.state_of_operation === state) : formations
  
  const total = filtered?.length || 0
  const call1Completed = filtered?.filter(f => f.call_1_completed).length || 0
  const call2Completed = filtered?.filter(f => f.call_2_completed).length || 0
  const call3Completed = filtered?.filter(f => f.call_3_completed).length || 0
  const call4Completed = filtered?.filter(f => f.call_4_completed).length || 0

  return {
    totalStarted: total,
    call1: {
      completed: call1Completed,
      rate: total > 0 ? (call1Completed / total * 100).toFixed(2) : '0.00'
    },
    call2: {
      completed: call2Completed,
      rate: call1Completed > 0 ? (call2Completed / call1Completed * 100).toFixed(2) : '0.00'
    },
    call3: {
      completed: call3Completed,
      rate: call2Completed > 0 ? (call3Completed / call2Completed * 100).toFixed(2) : '0.00'
    },
    call4: {
      completed: call4Completed,
      rate: call3Completed > 0 ? (call4Completed / call3Completed * 100).toFixed(2) : '0.00'
    },
    overallConversion: total > 0 ? (call4Completed / total * 100).toFixed(2) : '0.00'
  }
}

async function getStateBreakdown(db: DatabaseService, startDate: Date, endDate: Date) {
  const { data, error } = await db.supabase
    .from('business_formations')
    .select('state_of_operation, call_4_completed, estimated_revenue')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (error) {
    console.error('Error getting state breakdown:', error)
    return []
  }

  const stateMap = new Map()
  
  data?.forEach(formation => {
    const state = formation.state_of_operation || 'Unknown'
    if (!stateMap.has(state)) {
      stateMap.set(state, {
        state,
        totalFormations: 0,
        completedFormations: 0,
        totalRevenue: 0
      })
    }
    
    const stateData = stateMap.get(state)
    stateData.totalFormations++
    
    if (formation.call_4_completed) {
      stateData.completedFormations++
      stateData.totalRevenue += formation.estimated_revenue || 0
    }
  })

  return Array.from(stateMap.values()).sort((a, b) => b.totalFormations - a.totalFormations)
}

async function getRevenueMetrics(db: DatabaseService, startDate: Date, endDate: Date, state?: string) {
  let query = db.supabase
    .from('business_formations')
    .select('estimated_revenue, package_selected, call_4_completed')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .eq('call_4_completed', true)

  if (state) {
    query = query.eq('state_of_operation', state)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error getting revenue metrics:', error)
    return {}
  }

  const totalRevenue = data?.reduce((sum, f) => sum + (f.estimated_revenue || 0), 0) || 0
  const totalDeals = data?.length || 0
  const averageDealSize = totalDeals > 0 ? totalRevenue / totalDeals : 0

  const packageBreakdown = {
    'Launch Basic': { count: 0, revenue: 0 },
    'Launch Pro': { count: 0, revenue: 0 },
    'Launch Complete': { count: 0, revenue: 0 }
  }

  data?.forEach(formation => {
    const pkg = formation.package_selected || 'Unknown'
    if (packageBreakdown[pkg]) {
      packageBreakdown[pkg].count++
      packageBreakdown[pkg].revenue += formation.estimated_revenue || 0
    }
  })

  return {
    totalRevenue,
    totalDeals,
    averageDealSize,
    packageBreakdown
  }
}

async function getTrendData(db: DatabaseService, startDate: Date, endDate: Date, timeframe: string, state?: string) {
  // This would ideally use the analytics_metrics table
  // For now, return basic trend data
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const trends = []

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)
    
    let query = db.supabase
      .from('business_formations')
      .select('call_1_completed, call_2_completed, call_3_completed, call_4_completed')
      .gte('created_at', date.toISOString())
      .lt('created_at', nextDate.toISOString())

    if (state) {
      query = query.eq('state_of_operation', state)
    }

    const { data } = await query

    trends.push({
      date: date.toISOString().split('T')[0],
      newFormations: data?.length || 0,
      completions: data?.filter(f => f.call_4_completed).length || 0
    })
  }

  return trends
}

async function getSatisfactionMetrics(db: DatabaseService, startDate: Date, endDate: Date, state?: string) {
  let query = db.supabase
    .from('call_transcripts')
    .select('sentiment_score, confidence_score, call_number')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const { data, error } = await query

  if (error) {
    console.error('Error getting satisfaction metrics:', error)
    return {}
  }

  const sentiments = data?.filter(t => t.sentiment_score !== null).map(t => t.sentiment_score) || []
  const confidences = data?.filter(t => t.confidence_score !== null).map(t => t.confidence_score) || []

  const avgSentiment = sentiments.length > 0 ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length : 0
  const avgConfidence = confidences.length > 0 ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0

  const callBreakdown = {
    call1: data?.filter(t => t.call_number === 1).length || 0,
    call2: data?.filter(t => t.call_number === 2).length || 0,
    call3: data?.filter(t => t.call_number === 3).length || 0,
    call4: data?.filter(t => t.call_number === 4).length || 0
  }

  return {
    averageSentiment: Number(avgSentiment.toFixed(3)),
    averageConfidence: Number(avgConfidence.toFixed(3)),
    totalTranscripts: data?.length || 0,
    callBreakdown
  }
}