import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

export interface Customer {
  id?: string
  name?: string
  email?: string
  phone?: string
  status?: string
  created_at?: string
  updated_at?: string
}

export interface BusinessFormation {
  id?: string
  customer_id?: string
  business_name?: string
  business_description?: string
  business_type?: string
  state_of_operation?: string
  industry?: string
  call_1_completed?: boolean
  call_2_completed?: boolean
  call_3_completed?: boolean
  call_4_completed?: boolean
  call_1_completed_at?: string
  call_2_completed_at?: string
  call_3_completed_at?: string
  call_4_completed_at?: string
  overall_status?: string
  completion_percentage?: number
  estimated_revenue?: number
  package_selected?: string
  created_at?: string
  updated_at?: string
}

export interface CallTranscript {
  id?: string
  business_formation_id?: string
  customer_id?: string
  call_number: number
  vapi_assistant_id: string
  vapi_call_id?: string
  full_transcript?: string
  summary?: string
  extracted_data?: any
  sentiment_score?: number
  confidence_score?: number
  call_duration?: number
  call_status?: string
  created_at?: string
}

export interface ExtractedBusinessData {
  id?: string
  business_formation_id?: string
  call_number: number
  business_idea?: string
  target_market?: string
  revenue_model?: string
  funding_needs?: number
  preferred_business_structure?: string
  state_preferences?: string
  trademark_needs?: boolean
  compliance_requirements?: string
  banking_preferences?: string
  payment_processing_needs?: string
  accounting_software_preference?: string
  operational_requirements?: string
  website_requirements?: string
  branding_preferences?: string
  marketing_goals?: string
  domain_preferences?: string
  created_at?: string
  updated_at?: string
}

export class DatabaseService {
  public supabase: any

  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }

  async findOrCreateCustomer(email: string, name?: string, phone?: string): Promise<Customer> {
    // First try to find existing customer
    const { data: existingCustomer, error: findError } = await this.supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single()

    if (existingCustomer && !findError) {
      // Update with any new information
      if (name || phone) {
        const updateData: any = {}
        if (name) updateData.name = name
        if (phone) updateData.phone = phone

        const { data: updatedCustomer, error: updateError } = await this.supabase
          .from('customers')
          .update(updateData)
          .eq('id', existingCustomer.id)
          .select()
          .single()

        if (updateError) throw updateError
        return updatedCustomer
      }
      return existingCustomer
    }

    // Create new customer
    const { data: newCustomer, error: createError } = await this.supabase
      .from('customers')
      .insert([{
        email,
        name: name || null,
        phone: phone || null,
        status: 'active'
      }])
      .select()
      .single()

    if (createError) throw createError
    return newCustomer
  }

  async findOrCreateBusinessFormation(customerId: string): Promise<BusinessFormation> {
    // Try to find existing business formation
    const { data: existingFormation, error: findError } = await this.supabase
      .from('business_formations')
      .select('*')
      .eq('customer_id', customerId)
      .eq('overall_status', 'in_progress')
      .single()

    if (existingFormation && !findError) {
      return existingFormation
    }

    // Create new business formation
    const { data: newFormation, error: createError } = await this.supabase
      .from('business_formations')
      .insert([{
        customer_id: customerId,
        overall_status: 'in_progress',
        completion_percentage: 0
      }])
      .select()
      .single()

    if (createError) throw createError
    return newFormation
  }

  async updateBusinessFormation(id: string, updates: Partial<BusinessFormation>): Promise<BusinessFormation> {
    const { data, error } = await this.supabase
      .from('business_formations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async insertCallTranscript(transcript: CallTranscript): Promise<CallTranscript> {
    const { data, error } = await this.supabase
      .from('call_transcripts')
      .insert([transcript])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async upsertExtractedBusinessData(data: ExtractedBusinessData): Promise<ExtractedBusinessData> {
    const { data: result, error } = await this.supabase
      .from('extracted_business_data')
      .upsert([data], {
        onConflict: 'business_formation_id,call_number'
      })
      .select()
      .single()

    if (error) throw error
    return result
  }

  async updateAnalyticsMetrics(date: string, callNumber: number, completed: boolean, state?: string) {
    const today = new Date(date).toISOString().split('T')[0]
    
    // Get or create daily metrics
    const { data: metrics, error: fetchError } = await this.supabase
      .from('analytics_metrics')
      .select('*')
      .eq('date', today)
      .eq('metric_type', 'daily')
      .eq('state', state || 'unknown')
      .single()

    const updates: any = {}
    
    if (callNumber === 1) {
      updates.call_1_starts = (metrics?.call_1_starts || 0) + 1
      if (completed) {
        updates.call_1_completions = (metrics?.call_1_completions || 0) + 1
      }
    } else if (callNumber === 2) {
      updates.call_2_starts = (metrics?.call_2_starts || 0) + 1
      if (completed) {
        updates.call_2_completions = (metrics?.call_2_completions || 0) + 1
      }
    } else if (callNumber === 3) {
      updates.call_3_starts = (metrics?.call_3_starts || 0) + 1
      if (completed) {
        updates.call_3_completions = (metrics?.call_3_completions || 0) + 1
      }
    } else if (callNumber === 4) {
      updates.call_4_starts = (metrics?.call_4_starts || 0) + 1
      if (completed) {
        updates.call_4_completions = (metrics?.call_4_completions || 0) + 1
      }
    }

    if (metrics) {
      const { error: updateError } = await this.supabase
        .from('analytics_metrics')
        .update(updates)
        .eq('id', metrics.id)
    } else {
      const { error: insertError } = await this.supabase
        .from('analytics_metrics')
        .insert([{
          date: today,
          metric_type: 'daily',
          state: state || 'unknown',
          total_calls: 1,
          ...updates
        }])
    }
  }
}