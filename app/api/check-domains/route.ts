import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { join } from 'path'

interface DomainResult {
  domain: string
  available: boolean | null
  method: string
  confidence?: string
  price?: number
  currency?: string
  error?: string
  suggestions?: DomainSuggestion[]
}

interface DomainSuggestion {
  domain: string
  available: boolean
  price?: number
  currency?: string
}

export async function POST(request: NextRequest) {
  try {
    const { domains, method = 'auto', includeSuggestions = true, maxSuggestions = 5 } = await request.json()

    if (!domains || typeof domains !== 'string') {
      return NextResponse.json(
        { error: 'Domains parameter is required and must be a string' },
        { status: 400 }
      )
    }

    // Validate method
    const validMethods = ['auto', 'godaddy', 'whois', 'dns', 'http']
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: `Invalid method. Must be one of: ${validMethods.join(', ')}` },
        { status: 400 }
      )
    }

    // Path to our domain checker script - use API version with suggestions support
    const scriptPath = join(process.cwd(), 'check-domain-api.sh')
    
    // Prepare command arguments
    const args = ['--json']
    if (method !== 'auto') {
      args.push('--method', method)
    }
    if (!includeSuggestions) {
      args.push('--no-suggestions')
    } else {
      args.push('--max-suggestions', maxSuggestions.toString())
    }
    args.push(domains)

    // Execute the domain checker script
    const results = await executeScript(scriptPath, args)
    
    return NextResponse.json({
      success: true,
      results: results,
      method: method,
      includeSuggestions: includeSuggestions,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Domain check API error:', error)
    return NextResponse.json(
      { error: 'Internal server error while checking domains' },
      { status: 500 }
    )
  }
}

function executeScript(scriptPath: string, args: string[]): Promise<DomainResult[]> {
  return new Promise((resolve, reject) => {
    const child = spawn('bash', [scriptPath, ...args], {
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

    child.on('close', (code) => {
      try {
        if (code !== 0) {
          console.error('Script error:', stderr)
          // Even if script fails, try to parse any output
          if (stdout.trim()) {
            const results = parseScriptOutput(stdout)
            resolve(results)
          } else {
            resolve([{
              domain: 'unknown',
              available: null,
              method: 'error',
              error: `Script exited with code ${code}: ${stderr}`
            }])
          }
          return
        }

        const results = parseScriptOutput(stdout)
        resolve(results)
      } catch (error) {
        reject(error)
      }
    })

    child.on('error', (error) => {
      reject(error)
    })

    // Set timeout to prevent hanging
    setTimeout(() => {
      child.kill()
      reject(new Error('Domain check timeout'))
    }, 30000) // 30 second timeout
  })
}

function parseScriptOutput(output: string): DomainResult[] {
  const results: DomainResult[] = []
  const lines = output.trim().split('\n')

  for (const line of lines) {
    if (!line.trim()) continue

    try {
      // Try to parse as JSON first
      const jsonResult = JSON.parse(line)
      results.push({
        domain: jsonResult.domain,
        available: jsonResult.available,
        method: jsonResult.method || 'unknown',
        confidence: jsonResult.confidence,
        price: jsonResult.price,
        currency: jsonResult.currency,
        error: jsonResult.error
      })
    } catch (e) {
      // If not JSON, try to parse as plain text output
      const textResult = parseTextLine(line)
      if (textResult) {
        results.push(textResult)
      }
    }
  }

  return results
}

function parseTextLine(line: string): DomainResult | null {
  // Parse lines like "✅ example.com AVAILABLE" or "❌ example.com TAKEN"
  const match = line.match(/^[✅❌⚠️]\s+([^\s]+)\s+(AVAILABLE|TAKEN|ERROR)/)
  if (match) {
    const [, domain, status] = match
    return {
      domain: domain,
      available: status === 'AVAILABLE' ? true : status === 'TAKEN' ? false : null,
      method: 'text_parser',
      error: status === 'ERROR' ? 'Parse error' : undefined
    }
  }

  // Handle domains with no clear status
  const domainMatch = line.match(/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
  if (domainMatch) {
    return {
      domain: domainMatch[1],
      available: null,
      method: 'text_parser',
      error: 'Unable to determine status'
    }
  }

  return null
}

// Handle GET requests with a simple info response
export async function GET() {
  return NextResponse.json({
    message: 'Domain Checker API',
    endpoints: {
      POST: '/api/check-domains',
      parameters: {
        domains: 'string (comma-separated domains)',
        method: 'string (auto, godaddy, whois, dns, http)'
      }
    },
    methods: {
      auto: 'Tries all methods in order of reliability',
      godaddy: 'GoDaddy API (requires credentials)',
      whois: 'WHOIS lookup (most reliable)',
      dns: 'DNS resolution check (fast)',
      http: 'HTTP connection test (basic)'
    }
  })
}