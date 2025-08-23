import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { join } from 'path'

interface VoiceDomainRequest {
  keywords: string
  action: 'check' | 'generate'
  maxResults?: number
  useProfile?: boolean
}

interface VoiceDomainResponse {
  success: boolean
  message: string
  domains?: Array<{
    domain: string
    available: boolean
    price?: string
    suggestions?: string[]
  }>
  spokenResponse: string
}

export async function POST(request: NextRequest) {
  try {
    const { keywords, action = 'generate', maxResults = 5, useProfile = true }: VoiceDomainRequest = await request.json()

    if (!keywords || typeof keywords !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'Keywords are required',
        spokenResponse: 'I need some keywords to help you find domains. Could you tell me what kind of business or project this is for?'
      }, { status: 400 })
    }

    // Get user profile for personalized suggestions
    let userProfile = null
    let personalizedKeywords = keywords
    
    if (useProfile) {
      try {
        // Mock user profile for demo purposes
        const mockProfile = {
          user: {
            business_name: "TechStart Solutions",
            business_type: "Software Consulting",
            customer_name: "Demo User"
          },
          dreamDna: {
            business_concept: "AI-powered software consulting",
            services_offered: "Custom software development and AI integration",
            target_customers: "Small to medium businesses"
          }
        }
        
        userProfile = mockProfile
        personalizedKeywords = enhanceKeywordsWithProfile(keywords, mockProfile.user, mockProfile.dreamDna)
        
      } catch (profileError) {
        console.log('Profile fetch failed, continuing without personalization:', profileError)
      }
    }

    const cleanKeywords = personalizedKeywords.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
    
    if (action === 'check') {
      // Check a specific domain
      const result = await checkSpecificDomain(cleanKeywords, userProfile)
      return NextResponse.json(result)
    } else {
      // Generate available domains
      const result = await generateAvailableDomains(cleanKeywords, maxResults, userProfile)
      return NextResponse.json(result)
    }

  } catch (error) {
    console.error('Voice domain checker error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      spokenResponse: 'I\'m having trouble checking domains right now. Please try again in a moment.'
    }, { status: 500 })
  }
}

// Helper function to enhance keywords with user profile data
function enhanceKeywordsWithProfile(originalKeywords: string, userData: any, dreamData: any): string {
  let enhancedKeywords = originalKeywords
  
  // If the user just says something generic, use their profile to make it specific
  const genericTerms = ['website', 'domain', 'business', 'company', 'site', 'online']
  const isGeneric = genericTerms.some(term => originalKeywords.toLowerCase().includes(term))
  
  if (isGeneric || originalKeywords.trim().split(' ').length < 2) {
    // Use business name and type if available
    if (userData.business_name) {
      enhancedKeywords = userData.business_name
    } else if (userData.business_type) {
      enhancedKeywords = userData.business_type
    }
    
    // Add context from dream DNA
    if (dreamData) {
      if (dreamData.business_concept) {
        const conceptWords = dreamData.business_concept.match(/\b[a-zA-Z]{3,}\b/g)
        if (conceptWords && conceptWords.length > 0) {
          enhancedKeywords += ` ${conceptWords.slice(0, 2).join(' ')}`
        }
      }
      
      if (dreamData.services_offered) {
        const serviceWords = dreamData.services_offered.match(/\b[a-zA-Z]{3,}\b/g)
        if (serviceWords && serviceWords.length > 0) {
          enhancedKeywords += ` ${serviceWords.slice(0, 2).join(' ')}`
        }
      }
    }
  }
  
  return enhancedKeywords || originalKeywords
}

async function checkSpecificDomain(domain: string, userProfile: any = null): Promise<VoiceDomainResponse> {
  return new Promise((resolve) => {
    const scriptPath = join(process.cwd(), 'check-domain-api.sh')
    const child = spawn('bash', [scriptPath, '--json', domain], {
      env: {
        ...process.env,
        GODADDY_KEY: process.env.GODADDY_KEY || '',
        GODADDY_SECRET: process.env.GODADDY_SECRET || ''
      }
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', () => {
      try {
        const lines = stdout.trim().split('\n')
        const jsonLine = lines.find(line => line.startsWith('{'))
        
        if (jsonLine) {
          const result = JSON.parse(jsonLine)
          
          if (result.available === true) {
            const price = result.price ? `for $${(result.price / 1000000).toFixed(2)}` : ''
            const personalizedResponse = userProfile ? 
              `Perfect! ${domain} is available ${price}. This would be great for ${getBusinessContext(userProfile)}. Would you like me to find more options or help you with the next steps?` :
              `Great news! ${domain} is available ${price}. Would you like me to help you find more options or check another domain?`
            
            resolve({
              success: true,
              message: `${domain} is available`,
              domains: [{
                domain: result.domain,
                available: true,
                price: price
              }],
              spokenResponse: personalizedResponse
            })
          } else if (result.available === false) {
            const suggestions = result.suggestions?.map((s: any) => s.domain).slice(0, 3) || []
            const suggestionText = suggestions.length > 0 
              ? ` However, I found these alternatives: ${suggestions.join(', ')}`
              : ''
            
            resolve({
              success: true,
              message: `${domain} is taken`,
              domains: [{
                domain: result.domain,
                available: false,
                suggestions: suggestions
              }],
              spokenResponse: `Unfortunately, ${domain} is already taken.${suggestionText}. Would you like me to generate more creative options for you?`
            })
          } else {
            resolve({
              success: false,
              message: 'Unable to check domain',
              spokenResponse: `I'm having trouble checking ${domain}. Let me try to generate some alternative options for you instead.`
            })
          }
        } else {
          resolve({
            success: false,
            message: 'No valid response',
            spokenResponse: 'I\'m having trouble checking that domain. Could you try a different one or let me generate some options for you?'
          })
        }
      } catch (error) {
        resolve({
          success: false,
          message: 'Parse error',
          spokenResponse: 'I encountered an error checking that domain. Let me try to help you find some alternatives instead.'
        })
      }
    })

    // Timeout after 15 seconds
    setTimeout(() => {
      child.kill()
      resolve({
        success: false,
        message: 'Timeout',
        spokenResponse: 'That\'s taking longer than expected. Let me try to generate some quick options for you instead.'
      })
    }, 15000)
  })
}

// Helper function to get business context for personalized responses
function getBusinessContext(userProfile: any): string {
  if (!userProfile) return "your business"
  
  const { user, dreamDna } = userProfile
  
  if (user.business_name) {
    return user.business_name
  }
  
  if (user.business_type) {
    return `your ${user.business_type.toLowerCase()}`
  }
  
  if (dreamDna?.business_concept) {
    const concept = dreamDna.business_concept.toLowerCase()
    if (concept.length < 50) {
      return `your ${concept}`
    }
  }
  
  return "your business"
}

async function generateAvailableDomains(keywords: string, maxResults: number, userProfile: any = null): Promise<VoiceDomainResponse> {
  const variations = generateDomainVariations(keywords, maxResults * 3) // Generate more to find available ones
  const availableDomains: any[] = []
  
  // Check domains in batches
  const batchSize = 3
  for (let i = 0; i < variations.length && availableDomains.length < maxResults; i += batchSize) {
    const batch = variations.slice(i, i + batchSize)
    
    const batchPromises = batch.map(async (domain) => {
      return new Promise((resolve) => {
        const scriptPath = join(process.cwd(), 'check-domain-api.sh')
        const child = spawn('bash', [scriptPath, '--json', '--no-suggestions', domain], {
          env: {
            ...process.env,
            GODADDY_KEY: process.env.GODADDY_KEY || '',
            GODADDY_SECRET: process.env.GODADDY_SECRET || ''
          }
        })

        let stdout = ''
        child.stdout.on('data', (data) => { stdout += data.toString() })
        
        child.on('close', () => {
          try {
            const lines = stdout.trim().split('\n')
            const jsonLine = lines.find(line => line.startsWith('{'))
            
            if (jsonLine) {
              const result = JSON.parse(jsonLine)
              if (result.available === true) {
                const price = result.price ? `$${(result.price / 1000000).toFixed(2)}` : 'Available'
                resolve({
                  domain: result.domain,
                  available: true,
                  price: price
                })
                return
              }
            }
          } catch (error) {
            // Ignore parse errors
          }
          resolve(null)
        })

        // Quick timeout for generation
        setTimeout(() => {
          child.kill()
          resolve(null)
        }, 5000)
      })
    })
    
    const batchResults = await Promise.all(batchPromises)
    const availableInBatch = batchResults.filter(result => result !== null)
    availableDomains.push(...availableInBatch)
    
    // Small delay between batches
    if (i + batchSize < variations.length && availableDomains.length < maxResults) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  if (availableDomains.length === 0) {
    const personalizedNoResults = userProfile ? 
      `I checked several variations for ${getBusinessContext(userProfile)} but they're all taken. Would you like me to try different keywords based on your business type or add creative suffixes like "app", "tech", or "hub"?` :
      `I checked several variations of "${keywords}" but they're all taken. Would you like me to try different keywords or add some creative suffixes like "app", "tech", or "hub"?`
    
    return {
      success: false,
      message: 'No available domains found',
      spokenResponse: personalizedNoResults
    }
  }

  const domainList = availableDomains.slice(0, maxResults)
  const spokenList = domainList.map(d => `${d.domain} for ${d.price}`).join(', ')
  
  const personalizedSuccess = userProfile ?
    `Perfect! I found ${domainList.length} great domains for ${getBusinessContext(userProfile)}: ${spokenList}. These would work well for your business. Would you like me to check any of these in more detail or generate more options?` :
    `Great! I found ${domainList.length} available domains for "${keywords}": ${spokenList}. Would you like me to check any of these in more detail or generate more options?`
  
  return {
    success: true,
    message: `Found ${domainList.length} available domains`,
    domains: domainList,
    spokenResponse: personalizedSuccess
  }
}

function generateDomainVariations(keywords: string, maxVariations: number = 20): string[] {
  const words = keywords.split(/\s+/).filter(word => word.length > 0)
  const variations = new Set<string>()
  
  const suffixes = ['app', 'hub', 'lab', 'pro', 'tech', 'online', 'digital', 'studio', 'agency', 'group']
  const prefixes = ['get', 'my', 'go', 'try', 'smart', 'quick', 'best', 'top']
  const tlds = ['com', 'net', 'org', 'io', 'co', 'app', 'tech']
  
  if (words.length === 1) {
    const word = words[0]
    
    // Original with different TLDs
    tlds.forEach(tld => variations.add(`${word}.${tld}`))
    
    // With prefixes
    prefixes.slice(0, 4).forEach(prefix => {
      tlds.slice(0, 3).forEach(tld => variations.add(`${prefix}${word}.${tld}`))
    })
    
    // With suffixes  
    suffixes.slice(0, 6).forEach(suffix => {
      tlds.slice(0, 3).forEach(tld => variations.add(`${word}${suffix}.${tld}`))
    })
  } else {
    const concatenated = words.join('')
    const hyphenated = words.join('-')
    
    // Basic variations
    tlds.forEach(tld => {
      variations.add(`${concatenated}.${tld}`)
      variations.add(`${hyphenated}.${tld}`)
    })
    
    // With suffixes
    suffixes.slice(0, 4).forEach(suffix => {
      tlds.slice(0, 3).forEach(tld => variations.add(`${concatenated}${suffix}.${tld}`))
    })
  }
  
  return Array.from(variations).slice(0, maxVariations)
}

export async function GET() {
  return NextResponse.json({
    message: 'Voice Domain Checker API',
    usage: {
      POST: '/api/voice-domain-checker',
      parameters: {
        keywords: 'string (business keywords)',
        action: 'check | generate (default: generate)',
        maxResults: 'number (default: 5)'
      }
    },
    examples: {
      generate: {
        keywords: 'fitness tech',
        action: 'generate',
        maxResults: 3
      },
      check: {
        keywords: 'mycompany.com',
        action: 'check'
      }
    }
  })
}