'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DomainResult {
  domain: string
  available: boolean
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

export default function DomainChecker() {
  const [domains, setDomains] = useState('')
  const [results, setResults] = useState<DomainResult[]>([])
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState('auto')
  const [includeSuggestions, setIncludeSuggestions] = useState(true)
  const [maxSuggestions, setMaxSuggestions] = useState(5)
  const router = useRouter()

  const checkDomains = async () => {
    if (!domains.trim()) {
      alert('Please enter at least one domain')
      return
    }

    setLoading(true)
    setResults([])

    try {
      const response = await fetch('/api/check-domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domains: domains.trim(),
          method: method,
          includeSuggestions: includeSuggestions,
          maxSuggestions: maxSuggestions
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setResults(data.results || [])
      } else {
        alert(data.error || 'Failed to check domains')
      }
    } catch (error) {
      alert('Error checking domains. Please try again.')
      console.error('Domain check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (result: DomainResult) => {
    if (result.error) return '❌'
    if (result.available === true) return '✅'
    if (result.available === false) return '❌'
    return '⚠️'
  }

  const getStatusText = (result: DomainResult) => {
    if (result.error) return 'ERROR'
    if (result.available === true) return 'AVAILABLE'
    if (result.available === false) return 'TAKEN'
    return 'UNKNOWN'
  }

  const getStatusColor = (result: DomainResult) => {
    if (result.error) return 'text-red-600'
    if (result.available === true) return 'text-green-600'
    if (result.available === false) return 'text-red-600'
    return 'text-yellow-600'
  }

  const formatPrice = (result: DomainResult) => {
    if (result.price && result.currency) {
      const price = result.price / 1000000 // Convert from micros
      return ` — $${price.toFixed(2)} ${result.currency}`
    }
    return ''
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌐 Domain Availability Checker
          </h1>
          <p className="text-xl text-gray-600">
            Check if your dream domain is available using multiple reliable methods
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 inline-flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="domains" className="block text-sm font-medium text-gray-700 mb-2">
                Domain Names
              </label>
              <input
                id="domains"
                type="text"
                placeholder="example.com or multiple: domain1.com,domain2.net,domain3.org"
                value={domains}
                onChange={(e) => setDomains(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && checkDomains()}
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter one domain or multiple domains separated by commas
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-2">
                  Check Method
                </label>
                <select
                  id="method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="auto">Auto (tries all methods)</option>
                  <option value="godaddy">GoDaddy API (most accurate)</option>
                  <option value="whois">WHOIS Lookup (reliable)</option>
                  <option value="dns">DNS Check (fast)</option>
                  <option value="http">HTTP Check (basic)</option>
                </select>
              </div>

              <div>
                <label htmlFor="maxSuggestions" className="block text-sm font-medium text-gray-700 mb-2">
                  Smart Suggestions
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="includeSuggestions"
                      type="checkbox"
                      checked={includeSuggestions}
                      onChange={(e) => setIncludeSuggestions(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="includeSuggestions" className="ml-2 text-sm text-gray-600">
                      Show alternative TLDs when domain is taken
                    </label>
                  </div>
                  {includeSuggestions && (
                    <select
                      id="maxSuggestions"
                      value={maxSuggestions}
                      onChange={(e) => setMaxSuggestions(parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={3}>Show 3 suggestions</option>
                      <option value={5}>Show 5 suggestions</option>
                      <option value={8}>Show 8 suggestions</option>
                      <option value={10}>Show 10 suggestions</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={checkDomains}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking Domains...
                </span>
              ) : (
                'Check Domain Availability'
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Results</h2>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getStatusIcon(result)}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {result.domain}
                        </div>
                        <div className={`text-sm font-medium ${getStatusColor(result)}`}>
                          {getStatusText(result)}
                          {formatPrice(result)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Method: {result.method}
                      </div>
                      {result.confidence && (
                        <div className="text-xs text-gray-400">
                          Confidence: {result.confidence}
                        </div>
                      )}
                      {result.error && (
                        <div className="text-xs text-red-500">
                          {result.error}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Suggestions */}
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className="ml-12 pl-4 border-l-2 border-blue-200 bg-blue-50 rounded-r-lg p-3">
                      <div className="text-sm font-medium text-blue-900 mb-2">
                        💡 Alternative suggestions:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {result.suggestions.map((suggestion, suggestionIndex) => (
                          <div
                            key={suggestionIndex}
                            className="flex items-center justify-between text-sm bg-white rounded px-3 py-2 border border-blue-200"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-green-500">✅</span>
                              <span className="font-medium text-gray-700">
                                {suggestion.domain}
                              </span>
                            </div>
                            <div className="text-green-600 font-medium">
                              {suggestion.price && suggestion.currency 
                                ? `$${(suggestion.price / 1000000).toFixed(2)} ${suggestion.currency}`
                                : 'Available'
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Check Methods:</h4>
              <ul className="space-y-1">
                <li>• <strong>GoDaddy API:</strong> Most accurate, includes pricing</li>
                <li>• <strong>WHOIS:</strong> Official registry lookup</li>
                <li>• <strong>DNS:</strong> Fast domain resolution check</li>
                <li>• <strong>HTTP:</strong> Website response test</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Result Meanings:</h4>
              <ul className="space-y-1">
                <li>• <strong>✅ AVAILABLE:</strong> Domain can be registered</li>
                <li>• <strong>❌ TAKEN:</strong> Domain is already registered</li>
                <li>• <strong>⚠️ UNKNOWN:</strong> Unable to determine status</li>
                <li>• <strong>❌ ERROR:</strong> Check failed or invalid domain</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Smart Suggestions:</h4>
              <ul className="space-y-1">
                <li>• <strong>💡 Alternatives:</strong> Shows available TLD options</li>
                <li>• <strong>Popular TLDs:</strong> .com, .net, .org, .io, .co, .app</li>
                <li>• <strong>Real-time:</strong> Checks availability instantly</li>
                <li>• <strong>Pricing:</strong> Shows registration costs</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Smart Suggestions:</strong> When a domain is taken, we automatically check popular 
              alternative TLDs (.com, .net, .org, .io, .co, .app, etc.) and show you available options 
              with real-time pricing. This helps you find the perfect domain even if your first choice isn't available.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}