// Script to configure Vapi.ai assistants with webhook URLs
// Run this after deploying Supabase Edge Functions

interface VapiAssistant {
  id: string
  name: string
  serverUrl?: string
}

const SUPABASE_URL = 'https://plmmudazcsiksgmgphte.supabase.co'
const VAPI_API_KEY = Deno.env.get('VAPI_API_KEY')

const assistants: VapiAssistant[] = [
  {
    id: '5ef9abf6-66b4-4457-9848-ee5436d6191f',
    name: 'Business Concept Discovery',
    serverUrl: `${SUPABASE_URL}/functions/v1/call-1-webhook`
  },
  {
    id: 'eb760659-21ba-4f94-a291-04f0897f0328',
    name: 'Legal Formation Planning',
    serverUrl: `${SUPABASE_URL}/functions/v1/call-2-webhook`
  },
  {
    id: '65ddc60b-b813-49b6-9986-38ee2974cfc9',
    name: 'Banking & Operations Setup',
    serverUrl: `${SUPABASE_URL}/functions/v1/call-3-webhook`
  },
  {
    id: 'af397e88-c286-416f-9f74-e7665401bdb7',
    name: 'Website & Marketing Planning',
    serverUrl: `${SUPABASE_URL}/functions/v1/call-4-webhook`
  }
]

async function updateVapiAssistant(assistant: VapiAssistant) {
  if (!VAPI_API_KEY) {
    console.error('VAPI_API_KEY environment variable is required')
    return false
  }

  try {
    const response = await fetch(`https://api.vapi.ai/assistant/${assistant.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serverUrl: assistant.serverUrl,
        serverUrlSecret: Deno.env.get('WEBHOOK_SECRET') || 'your-webhook-secret'
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`Failed to update assistant ${assistant.name}:`, error)
      return false
    }

    const result = await response.json()
    console.log(`✅ Updated assistant ${assistant.name} with webhook URL: ${assistant.serverUrl}`)
    return true

  } catch (error) {
    console.error(`Error updating assistant ${assistant.name}:`, error)
    return false
  }
}

async function main() {
  console.log('🚀 Setting up Vapi.ai webhook URLs...')
  
  if (!VAPI_API_KEY) {
    console.error('❌ VAPI_API_KEY environment variable is required')
    console.log('Please set your Vapi.ai API key in the environment variables')
    Deno.exit(1)
  }

  let successCount = 0
  
  for (const assistant of assistants) {
    const success = await updateVapiAssistant(assistant)
    if (success) successCount++
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log(`\n✅ Successfully updated ${successCount}/${assistants.length} assistants`)
  
  if (successCount === assistants.length) {
    console.log('🎉 All Vapi.ai assistants are now configured with webhook URLs!')
    console.log('\nWebhook URLs configured:')
    assistants.forEach(a => console.log(`  • ${a.name}: ${a.serverUrl}`))
  } else {
    console.log('⚠️  Some assistants failed to update. Please check the logs above.')
  }
}

// Run the script
if (import.meta.main) {
  main()
}