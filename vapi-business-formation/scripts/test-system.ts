// Test script to verify the complete system works
// This simulates the 4-call flow with test data

const SUPABASE_URL = 'https://plmmudazcsiksgmgphte.supabase.co'

// Test data for each call
const testCalls = [
  {
    callNumber: 1,
    assistantId: '5ef9abf6-66b4-4457-9848-ee5436d6191f',
    webhook: `${SUPABASE_URL}/functions/v1/call-1-webhook`,
    payload: {
      type: 'end-of-call-report',
      call: {
        id: 'test-call-1-' + Date.now(),
        assistantId: '5ef9abf6-66b4-4457-9848-ee5436d6191f',
        customer: {
          number: '+1234567890'
        },
        transcript: `Hello, this is Sarah from DreamSeed. I'm calling to discuss your business concept. 

Customer: Hi Sarah, my name is John Smith and my email is john@example.com. I want to start a food delivery service in California. I think there's a huge market for healthy meal delivery, especially for busy professionals. 

Sarah: That sounds exciting! Can you tell me more about your target market?

Customer: I'm targeting working professionals aged 25-45 who don't have time to cook but want healthy options. I think I could charge around $15-20 per meal and scale to maybe $50,000 per month in revenue. I'm looking for about $100,000 in initial funding to get started.

Sarah: What state are you planning to operate in?

Customer: California, specifically the Bay Area to start.`,
        summary: 'Customer John Smith wants to start a healthy meal delivery service in California targeting busy professionals. Seeking $100k funding with projected $50k monthly revenue.',
        duration: 1800,
        status: 'ended',
        endedReason: 'assistant-ended-call'
      }
    }
  },
  {
    callNumber: 2,
    assistantId: 'eb760659-21ba-4f94-a291-04f0897f0328',
    webhook: `${SUPABASE_URL}/functions/v1/call-2-webhook`,
    payload: {
      type: 'end-of-call-report',
      call: {
        id: 'test-call-2-' + Date.now(),
        assistantId: 'eb760659-21ba-4f94-a291-04f0897f0328',
        customer: {
          number: '+1234567890'
        },
        transcript: `Hi John, this is Sarah calling back for our legal formation discussion.

Customer: Hi Sarah, thanks for calling back.

Sarah: Let's talk about the legal structure for your meal delivery business. Have you thought about whether you want an LLC or Corporation?

Customer: I think I want to form an LLC. It seems simpler and more flexible for a food business. I'd like to incorporate in Delaware for the business benefits, but operate in California.

Sarah: Great choice. What about the business name?

Customer: I want to call it "FreshBite Delivery LLC". I'm in the food and beverage industry, specifically meal delivery and catering.

Sarah: Do you need trademark protection?

Customer: Yes, I definitely want to protect the FreshBite name and logo. I also need to make sure I comply with all the food safety regulations and get the proper permits for food handling and delivery.`,
        summary: 'Customer wants to form FreshBite Delivery LLC in Delaware, operating in California. Needs trademark protection and food safety compliance.',
        duration: 1200,
        status: 'ended',
        endedReason: 'assistant-ended-call'
      }
    }
  },
  {
    callNumber: 3,
    assistantId: '65ddc60b-b813-49b6-9986-38ee2974cfc9',
    webhook: `${SUPABASE_URL}/functions/v1/call-3-webhook`,
    payload: {
      type: 'end-of-call-report',
      call: {
        id: 'test-call-3-' + Date.now(),
        assistantId: '65ddc60b-b813-49b6-9986-38ee2974cfc9',
        customer: {
          number: '+1234567890'
        },
        transcript: `Hi John, let's discuss your banking and operations setup.

Customer: Perfect, I need to get the financial side set up properly.

Sarah: For banking, do you have a preference for which bank to use?

Customer: I'd like to use Silicon Valley Bank or Chase for business banking. I need a business checking account and eventually a business credit card for expenses.

Sarah: What about payment processing for your delivery service?

Customer: I need Stripe integration for online payments and maybe Square for any in-person transactions. I want customers to be able to pay online when they order.

Sarah: And for accounting software?

Customer: I've heard good things about QuickBooks. I need something that can track food costs, delivery expenses, and revenue by location.

Sarah: Any other operational requirements?

Customer: I need a point-of-sale system that integrates with my delivery app, inventory management for ingredients, and driver payment processing. I'm expecting to hit around $75,000 in monthly revenue once we're fully operational.`,
        summary: 'Customer wants SVB/Chase banking, Stripe/Square payment processing, QuickBooks accounting, and POS system integration. Projects $75k monthly revenue.',
        duration: 1500,
        status: 'ended',
        endedReason: 'assistant-ended-call'
      }
    }
  },
  {
    callNumber: 4,
    assistantId: 'af397e88-c286-416f-9f74-e7665401bdb7',
    webhook: `${SUPABASE_URL}/functions/v1/call-4-webhook`,
    payload: {
      type: 'end-of-call-report',
      call: {
        id: 'test-call-4-' + Date.now(),
        assistantId: 'af397e88-c286-416f-9f74-e7665401bdb7',
        customer: {
          number: '+1234567890'
        },
        transcript: `Hi John, let's finalize everything with your website and marketing setup.

Customer: Great, I'm excited to get the online presence set up.

Sarah: What are your website requirements?

Customer: I need a professional website with online ordering, menu display, delivery zone maps, and customer account creation. Mobile-friendly is essential since most orders will come from phones.

Sarah: Tell me about your branding preferences.

Customer: I want a clean, modern look with green and white colors to emphasize the healthy aspect. The logo should include a leaf or fresh food element. Very professional but approachable.

Sarah: What are your marketing goals?

Customer: I want to focus on local SEO, social media marketing, and partnerships with gyms and offices. I need email marketing capabilities and maybe a referral program built in.

Sarah: Any thoughts on domain preferences?

Customer: I want freshbitedelivery.com if it's available, or maybe freshbite.delivery. Something memorable and brandable.

Sarah: Based on everything we've discussed, which package would work best for you?

Customer: I think the Launch Pro package at $1,799 is perfect. It includes everything I need - the LLC formation, full brand kit, 5-page website, and premium integrations. That's exactly what I need to get started properly.`,
        summary: 'Customer wants mobile-friendly website with online ordering, green/white branding, local marketing focus, freshbitedelivery.com domain, and selects Launch Pro package for $1,799.',
        duration: 1800,
        status: 'ended',
        endedReason: 'assistant-ended-call'
      }
    }
  }
]

async function testWebhook(callData: any) {
  console.log(`\n🧪 Testing Call ${callData.callNumber} webhook...`)
  
  try {
    const response = await fetch(callData.webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-key'
      },
      body: JSON.stringify(callData.payload)
    })

    const result = await response.text()
    
    if (response.ok) {
      console.log(`✅ Call ${callData.callNumber} webhook succeeded`)
      const data = JSON.parse(result)
      console.log(`   Response:`, data)
      return true
    } else {
      console.log(`❌ Call ${callData.callNumber} webhook failed (${response.status})`)
      console.log(`   Error:`, result)
      return false
    }
    
  } catch (error) {
    console.log(`❌ Call ${callData.callNumber} webhook error:`, error.message)
    return false
  }
}

async function testAnalyticsDashboard() {
  console.log(`\n📊 Testing Analytics Dashboard...`)
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/analytics-dashboard?timeframe=daily`, {
      headers: {
        'Authorization': 'Bearer test-key'
      }
    })

    const result = await response.text()
    
    if (response.ok) {
      console.log(`✅ Analytics Dashboard succeeded`)
      const data = JSON.parse(result)
      console.log(`   Metrics:`, {
        dateRange: data.dateRange,
        overallMetrics: data.overallMetrics,
        funnelConversion: data.funnelAnalysis?.overallConversion
      })
      return true
    } else {
      console.log(`❌ Analytics Dashboard failed (${response.status})`)
      console.log(`   Error:`, result)
      return false
    }
    
  } catch (error) {
    console.log(`❌ Analytics Dashboard error:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Testing Vapi Business Formation System...')
  console.log('This will simulate the complete 4-call flow with test data')
  
  let successCount = 0
  const totalTests = testCalls.length + 1 // +1 for analytics
  
  // Test each webhook in sequence
  for (const callData of testCalls) {
    const success = await testWebhook(callData)
    if (success) successCount++
    
    // Add delay between calls to simulate real flow
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // Test analytics dashboard
  await new Promise(resolve => setTimeout(resolve, 3000)) // Wait for data to settle
  const analyticsSuccess = await testAnalyticsDashboard()
  if (analyticsSuccess) successCount++
  
  console.log(`\n📋 Test Results: ${successCount}/${totalTests} tests passed`)
  
  if (successCount === totalTests) {
    console.log('🎉 All tests passed! Your system is working correctly.')
    console.log('\n📞 Ready for live calls! Your Vapi assistants should now:')
    console.log('   1. Capture conversation data automatically')
    console.log('   2. Extract business information using AI')
    console.log('   3. Track progress through the 4-call funnel')
    console.log('   4. Generate analytics and insights')
    console.log('   5. Calculate revenue and conversion metrics')
  } else {
    console.log('⚠️  Some tests failed. Please check your configuration:')
    console.log('   • Supabase Edge Functions deployed correctly')
    console.log('   • Environment variables set properly')
    console.log('   • Database schema applied')
    console.log('   • Network connectivity to Supabase')
  }
}

// Run the tests
if (import.meta.main) {
  main()
}