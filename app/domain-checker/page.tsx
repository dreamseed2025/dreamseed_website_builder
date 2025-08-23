'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DomainResult {
  domain: string
  available: boolean
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

export default function DomainChecker() {
  const [domain, setDomain] = useState('')
  const [result, setResult] = useState<DomainResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [generateKeywords, setGenerateKeywords] = useState('')
  const [availableDomains, setAvailableDomains] = useState<DomainResult[]>([])
  const [generating, setGenerating] = useState(false)
  const router = useRouter()

  const checkDomain = async () => {
    if (!domain.trim()) {
      alert('Please enter a domain name')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/check-domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domains: domain.trim(),
          method: 'godaddy',
          includeSuggestions: true,
          maxSuggestions: 5
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.results && data.results.length > 0) {
        setResult(data.results[0])
      } else {
        alert(data.error || 'Failed to check domain')
      }
    } catch (error) {
      alert('Error checking domain. Please try again.')
      console.error('Domain check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price?: number, currency?: string) => {
    if (price && currency) {
      const formattedPrice = (price / 1000000).toFixed(2) // Convert from micros
      return `$${formattedPrice}`
    }
    return 'Available'
  }

  const generateDomainVariations = (keywords: string) => {
    const words = keywords.toLowerCase().split(/\s+/).filter(word => word.length > 0)
    const variations = new Set<string>()
    
    // Common business suffixes
    const suffixes = ['app', 'hub', 'labs', 'pro', 'tech', 'online', 'digital', 'solutions', 'ventures', 'group', 'studio', 'agency', 'services', 'company', 'inc', 'llc']
    
    // Common business prefixes
    const prefixes = ['get', 'my', 'the', 'go', 'try', 'use', 'new', 'smart', 'quick', 'easy', 'best', 'top', 'super', 'mega', 'ultra']
    
    // Popular TLDs to try
    const tlds = ['com', 'net', 'org', 'io', 'co', 'app', 'dev', 'tech', 'ai']
    
    if (words.length === 0) return []

    // Single word variations
    if (words.length === 1) {
      const word = words[0]
      
      // Add prefixes
      prefixes.forEach(prefix => {
        tlds.forEach(tld => variations.add(`${prefix}${word}.${tld}`))
      })
      
      // Add suffixes
      suffixes.forEach(suffix => {
        tlds.forEach(tld => variations.add(`${word}${suffix}.${tld}`))
      })
      
      // Original word with different TLDs
      tlds.forEach(tld => variations.add(`${word}.${tld}`))
    }
    
    // Multiple words
    if (words.length >= 2) {
      // Concatenated versions
      const concatenated = words.join('')
      tlds.forEach(tld => variations.add(`${concatenated}.${tld}`))
      
      // Hyphenated versions
      const hyphenated = words.join('-')
      tlds.forEach(tld => variations.add(`${hyphenated}.${tld}`))
      
      // With common suffixes
      suffixes.slice(0, 8).forEach(suffix => {
        tlds.forEach(tld => variations.add(`${concatenated}${suffix}.${tld}`))
      })
      
      // With prefixes
      prefixes.slice(0, 8).forEach(prefix => {
        tlds.forEach(tld => variations.add(`${prefix}${concatenated}.${tld}`))
      })
    }
    
    return Array.from(variations).slice(0, 50) // Limit to 50 variations
  }

  const generateAvailableDomains = async () => {
    if (!generateKeywords.trim()) {
      alert('Please enter keywords for domain generation')
      return
    }

    setGenerating(true)
    setAvailableDomains([])

    try {
      const variations = generateDomainVariations(generateKeywords)
      const available: DomainResult[] = []
      
      // Check domains in batches to avoid overwhelming the API
      const batchSize = 5
      for (let i = 0; i < variations.length; i += batchSize) {
        const batch = variations.slice(i, i + batchSize)
        
        // Check each domain in the batch
        const batchPromises = batch.map(async (domainName) => {
          try {
            const response = await fetch('/api/check-domains', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                domains: domainName,
                method: 'godaddy',
                includeSuggestions: false,
                maxSuggestions: 0
              }),
            })

            const data = await response.json()
            
            if (response.ok && data.results && data.results.length > 0) {
              const domainResult = data.results[0]
              if (domainResult.available === true && !domainResult.error) {
                return domainResult
              }
            }
          } catch (error) {
            console.error(`Error checking ${domainName}:`, error)
          }
          return null
        })
        
        const batchResults = await Promise.all(batchPromises)
        const availableInBatch = batchResults.filter(result => result !== null) as DomainResult[]
        
        if (availableInBatch.length > 0) {
          setAvailableDomains(prev => [...prev, ...availableInBatch])
        }
        
        // Add delay between batches to avoid rate limiting
        if (i + batchSize < variations.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
    } catch (error) {
      alert('Error generating domain suggestions. Please try again.')
      console.error('Domain generation error:', error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div className="header-top">
          <div>
            <h1>🌐 Domain Checker</h1>
            <p>Check if your domain is available for purchase</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Search Form */}
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Enter domain name (e.g. mycompany.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkDomain()}
            className="domain-input"
          />
          <button
            onClick={checkDomain}
            disabled={loading}
            className={`search-btn ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Checking...
              </>
            ) : (
              'Check Domain'
            )}
          </button>
        </div>
      </div>

      {/* Domain Generator */}
      <div className="generator-section">
        <h2>🚀 Generate Available Domains</h2>
        <p>Enter keywords and we'll find creative domain names that are actually available</p>
        
        <div className="generator-box">
          <input
            type="text"
            placeholder="Enter keywords (e.g. fitness, tech, consulting)"
            value={generateKeywords}
            onChange={(e) => setGenerateKeywords(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && generateAvailableDomains()}
            className="generator-input"
          />
          <button
            onClick={generateAvailableDomains}
            disabled={generating}
            className={`generate-btn ${generating ? 'loading' : ''}`}
          >
            {generating ? (
              <>
                <div className="spinner"></div>
                Searching...
              </>
            ) : (
              'Find Available Domains'
            )}
          </button>
        </div>
        
        {generating && (
          <div className="progress-info">
            <p>🔍 Checking domain variations... This may take a minute</p>
          </div>
        )}
      </div>

      {/* Available Domains Results */}
      {availableDomains.length > 0 && (
        <div className="available-domains-section">
          <h3>🎉 Available Domains Found ({availableDomains.length})</h3>
          <div className="available-domains-grid">
            {availableDomains.map((domain, index) => (
              <div key={index} className="available-domain-card">
                <div className="available-domain-name">{domain.domain}</div>
                <div className="available-domain-price">
                  {formatPrice(domain.price, domain.currency)}
                  {domain.currency && ` ${domain.currency}`}
                </div>
                <div className="available-domain-method">via {domain.method}</div>
              </div>
            ))}
          </div>
          <div className="available-domains-note">
            <p>💡 These domains were available when checked. Register quickly as availability can change!</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="results-section">
          {result.error ? (
            <div className="error-result">
              <div className="error-icon">❌</div>
              <div className="error-content">
                <h3>Error Checking Domain</h3>
                <p>{result.error}</p>
              </div>
            </div>
          ) : result.available ? (
            <div className="available-result">
              <div className="available-icon">✅</div>
              <div className="available-content">
                <h3>{result.domain} is Available!</h3>
                <p className="price">
                  {formatPrice(result.price, result.currency)} 
                  {result.currency && ` ${result.currency}`}
                </p>
                <p className="subtext">This domain is ready for purchase</p>
              </div>
            </div>
          ) : (
            <div className="taken-result">
              <div className="taken-icon">❌</div>
              <div className="taken-content">
                <h3>{result.domain} is Taken</h3>
                <p className="subtext">This domain is already registered</p>
              </div>
            </div>
          )}

          {/* Alternatives */}
          {!result.available && result.suggestions && result.suggestions.length > 0 && (
            <div className="alternatives-section">
              <h4>💡 Available Alternatives</h4>
              <div className="alternatives-grid">
                {result.suggestions.map((suggestion, index) => (
                  <div key={index} className="alternative-card">
                    <div className="alternative-domain">{suggestion.domain}</div>
                    <div className="alternative-price">
                      {formatPrice(suggestion.price, suggestion.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8f9fa;
          min-height: 100vh;
        }
        
        .header {
          background: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .header h1 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 32px;
          font-weight: 600;
        }
        
        .header p {
          margin: 0;
          color: #666;
          font-size: 18px;
        }
        
        .back-btn {
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #e9ecef;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          text-decoration: none;
        }
        
        .back-btn:hover {
          background: #e9ecef;
          border-color: #2563eb;
        }
        
        .search-section {
          background: white;
          padding: 40px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          text-align: center;
        }
        
        .generator-section {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 40px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          text-align: center;
          border: 1px solid #0ea5e9;
        }
        
        .generator-section h2 {
          margin: 0 0 8px 0;
          color: #0c4a6e;
          font-size: 24px;
          font-weight: 600;
        }
        
        .generator-section p {
          margin: 0 0 24px 0;
          color: #0369a1;
          font-size: 16px;
        }
        
        .generator-box {
          display: flex;
          gap: 12px;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .generator-input {
          flex: 1;
          padding: 16px 20px;
          border: 2px solid #0ea5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
          background: white;
        }
        
        .generator-input:focus {
          outline: none;
          border-color: #0284c7;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }
        
        .generate-btn {
          background: #0ea5e9;
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }
        
        .generate-btn:hover:not(.loading) {
          background: #0284c7;
        }
        
        .generate-btn.loading {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .progress-info {
          margin-top: 20px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 8px;
          border: 1px solid #0ea5e9;
        }
        
        .progress-info p {
          margin: 0;
          color: #0369a1;
          font-size: 14px;
          font-weight: 500;
        }
        
        .available-domains-section {
          background: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .available-domains-section h3 {
          margin: 0 0 20px 0;
          color: #16a34a;
          font-size: 20px;
          font-weight: 600;
        }
        
        .available-domains-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .available-domain-card {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1px solid #16a34a;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          transition: all 0.2s;
        }
        
        .available-domain-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.15);
        }
        
        .available-domain-name {
          font-weight: 600;
          color: #15803d;
          font-size: 16px;
          margin-bottom: 8px;
        }
        
        .available-domain-price {
          font-weight: 500;
          color: #16a34a;
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .available-domain-method {
          font-size: 12px;
          color: #16a34a;
          opacity: 0.8;
        }
        
        .available-domains-note {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }
        
        .available-domains-note p {
          margin: 0;
          color: #92400e;
          font-size: 14px;
        }
        
        .search-box {
          display: flex;
          gap: 12px;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .domain-input {
          flex: 1;
          padding: 16px 20px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }
        
        .domain-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .search-btn {
          background: #2563eb;
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }
        
        .search-btn:hover:not(.loading) {
          background: #1d4ed8;
        }
        
        .search-btn.loading {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff33;
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .results-section {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .available-result,
        .taken-result,
        .error-result {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 40px;
          text-align: left;
        }
        
        .available-result {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-left: 4px solid #16a34a;
        }
        
        .taken-result {
          background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
          border-left: 4px solid #dc2626;
        }
        
        .error-result {
          background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
          border-left: 4px solid #dc2626;
        }
        
        .available-icon,
        .taken-icon,
        .error-icon {
          font-size: 48px;
          flex-shrink: 0;
        }
        
        .available-content h3,
        .taken-content h3,
        .error-content h3 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
        }
        
        .available-content h3 {
          color: #16a34a;
        }
        
        .taken-content h3,
        .error-content h3 {
          color: #dc2626;
        }
        
        .price {
          font-size: 20px;
          font-weight: 600;
          color: #16a34a;
          margin: 4px 0;
        }
        
        .subtext {
          margin: 4px 0 0 0;
          color: #666;
          font-size: 16px;
        }
        
        .alternatives-section {
          padding: 30px 40px;
          border-top: 1px solid #e9ecef;
          background: #f8f9fa;
        }
        
        .alternatives-section h4 {
          margin: 0 0 20px 0;
          color: #2563eb;
          font-size: 18px;
          font-weight: 600;
        }
        
        .alternatives-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        
        .alternative-card {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          transition: all 0.2s;
        }
        
        .alternative-card:hover {
          border-color: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
        }
        
        .alternative-domain {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .alternative-price {
          color: #16a34a;
          font-weight: 500;
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .header-top {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
          
          .search-box {
            flex-direction: column;
          }
          
          .generator-box {
            flex-direction: column;
          }
          
          .available-domains-grid {
            grid-template-columns: 1fr;
          }
          
          .available-result,
          .taken-result,
          .error-result {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }
          
          .alternatives-section {
            padding: 20px;
          }
          
          .alternatives-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}