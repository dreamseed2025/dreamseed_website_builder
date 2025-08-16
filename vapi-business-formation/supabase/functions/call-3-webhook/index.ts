import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { DatabaseService } from '../_shared/database.ts'
import { DataExtractor } from '../_shared/data-extractor.ts'

interface VapiWebhookPayload {
  type: string
  call: {
    id: string
    assistantId: string
    customer: {
      number?: string
    }
    transcript?: string
    summary?: string
    duration?: number
    status?: string
    endedReason?: string
  }
  message?: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify this is a POST request
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse the webhook payload
    const payload: VapiWebhookPayload = await req.json()
    console.log('Call 3 Webhook received:', JSON.stringify(payload, null, 2))

    // Verify this is for the correct assistant
    const expectedAssistantId = Deno.env.get('VAPI_ASSISTANT_CALL_3') || '65ddc60b-b813-49b6-9986-38ee2974cfc9'
    if (payload.call.assistantId !== expectedAssistantId) {
      console.log(`Assistant ID mismatch. Expected: ${expectedAssistantId}, Got: ${payload.call.assistantId}`)
      return new Response(
        JSON.stringify({ error: 'Invalid assistant ID' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize services
    const db = new DatabaseService()
    const extractor = new DataExtractor()

    // Only process call-end events with transcript
    if (payload.type === 'end-of-call-report' && payload.call.transcript) {
      
      // Extract data from transcript
      const extractedData = await extractor.extractDataFromTranscript(
        payload.call.transcript, 
        3
      )
      
      console.log('Extracted data from Call 3:', extractedData)

      // Calculate metrics
      const sentimentScore = extractor.calculateSentimentScore(payload.call.transcript)
      const confidenceScore = extractor.calculateConfidenceScore(extractedData)

      // Find customer by phone number
      let customer
      const phone = payload.call.customer?.number
      if (phone) {
        // Try to find customer by phone first
        const { data: customers } = await db.supabase
          .from('customers')
          .select('*')
          .eq('phone', phone)
          .limit(1)
        
        if (customers && customers.length > 0) {
          customer = customers[0]
        } else {
          customer = await db.findOrCreateCustomer(`${phone}@temp.dreamseed.ai`, null, phone)
        }
      } else {
        throw new Error('No phone number found to identify customer')
      }

      // Find business formation (should exist from previous calls)
      const { data: businessFormations } = await db.supabase
        .from('business_formations')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('overall_status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)

      if (!businessFormations || businessFormations.length === 0) {
        throw new Error('No active business formation found for customer')
      }

      const businessFormation = businessFormations[0]

      // Update business formation with extracted data
      const businessUpdates: any = {
        call_3_completed: payload.call.status === 'ended',
        call_3_completed_at: new Date().toISOString()
      }

      if (extractedData.estimated_revenue && !businessFormation.estimated_revenue) {
        businessUpdates.estimated_revenue = extractedData.estimated_revenue
      }

      await db.updateBusinessFormation(businessFormation.id, businessUpdates)

      // Insert call transcript
      await db.insertCallTranscript({
        business_formation_id: businessFormation.id,
        customer_id: customer.id,
        call_number: 3,
        vapi_assistant_id: payload.call.assistantId,
        vapi_call_id: payload.call.id,
        full_transcript: payload.call.transcript,
        summary: payload.call.summary,
        extracted_data: extractedData,
        sentiment_score: sentimentScore,
        confidence_score: confidenceScore,
        call_duration: payload.call.duration,
        call_status: payload.call.status
      })

      // Insert/update extracted business data
      await db.upsertExtractedBusinessData({
        business_formation_id: businessFormation.id,
        call_number: 3,
        banking_preferences: extractedData.banking_preferences,
        payment_processing_needs: extractedData.payment_processing_needs,
        accounting_software_preference: extractedData.accounting_software_preference,
        operational_requirements: extractedData.operational_requirements
      })

      // Update analytics
      await db.updateAnalyticsMetrics(
        new Date().toISOString(),
        3,
        payload.call.status === 'ended',
        businessFormation.state_of_operation
      )

      console.log('Call 3 processing completed successfully')

      return new Response(
        JSON.stringify({ 
          success: true, 
          customer_id: customer.id,
          business_formation_id: businessFormation.id,
          next_step: 'Schedule Call 4 for website and marketing planning'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } else {
      // For other event types, just acknowledge
      console.log(`Received ${payload.type} event, no processing needed`)
      return new Response(
        JSON.stringify({ success: true, message: 'Event acknowledged' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Error processing Call 3 webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})