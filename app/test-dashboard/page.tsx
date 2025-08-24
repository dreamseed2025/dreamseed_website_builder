'use client'

import React, { useState } from 'react'

export default function TestDashboard() {
  const [testResults, setTestResults] = useState<Record<string, string>>({})

  const testCases = [
    {
      id: 'step1-new',
      name: 'Step 1: New Business Ideation',
      url: '/optimized-voice-demo?step=1&type=new&name=Dream%20Restaurant',
      description: 'Test business concept development phase'
    },
    {
      id: 'step2-existing', 
      name: 'Step 2: Existing Business Planning',
      url: '/optimized-voice-demo?step=2&type=existing&name=Smith%20Consulting',
      description: 'Test market planning for existing business'
    },
    {
      id: 'step3-new',
      name: 'Step 3: New Business Structuring', 
      url: '/optimized-voice-demo?step=3&type=new&name=Tech%20Startup',
      description: 'Test legal structure and formation'
    },
    {
      id: 'step4-launch',
      name: 'Step 4: Final Launch Phase',
      url: '/optimized-voice-demo?step=4&type=new&name=Launch%20Ready%20Biz',
      description: 'Test final launch preparation'
    }
  ]

  const otherTests = [
    {
      id: 'onboarding',
      name: 'Automated Onboarding Flow',
      url: '/automated-onboarding',
      description: 'Complete user registration and business selection'
    },
    {
      id: 'domain-checker',
      name: 'Domain Checker Integration',
      url: '/domain-checker', 
      description: 'Test domain availability and suggestions'
    },
    {
      id: 'simple-portal',
      name: 'User Portal Navigation',
      url: '/simple-portal',
      description: 'Test main dashboard and navigation'
    },
    {
      id: 'login',
      name: 'Authentication System',
      url: '/login',
      description: 'Test user login and authentication'
    }
  ]

  const runApiTest = async (endpoint: string, testId: string) => {
    try {
      const response = await fetch(endpoint)
      const result = response.ok ? '✅ Pass' : '❌ Fail'
      setTestResults(prev => ({ ...prev, [testId]: result }))
    } catch (error) {
      setTestResults(prev => ({ ...prev, [testId]: '❌ Error' }))
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
      padding: '2rem',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%)',
        borderRadius: '24px',
        padding: '2rem',
        color: '#141416'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '8px',
            fontFamily: 'Poppins, sans-serif',
            background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🧪 DreamSeed Test Dashboard
          </h1>
          <p style={{ fontSize: '18px', color: '#666' }}>
            Complete end-to-end system testing interface
          </p>
        </div>

        {/* Context-Aware Voice Assistant Tests */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#8B0000',
            fontFamily: 'Poppins, sans-serif'
          }}>
            🎤 Context-Aware Voice Assistant Tests
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {testCases.map((test) => (
              <div key={test.id} style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#141416'
                }}>
                  {test.name}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '1rem'
                }}>
                  {test.description}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => window.open(test.url, '_blank')}
                    style={{
                      background: 'linear-gradient(135deg, #56b978 0%, #45a367 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    🧪 Test Now
                  </button>
                  <button
                    onClick={() => runApiTest(`/api/test-context?step=${test.id.includes('step') ? test.id.charAt(4) : '1'}&type=${test.url.includes('existing') ? 'existing' : 'new'}`, test.id)}
                    style={{
                      background: 'linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    📊 API Test
                  </button>
                </div>
                {testResults[test.id] && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px',
                    background: testResults[test.id].includes('✅') ? '#d4edda' : '#f8d7da',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {testResults[test.id]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Other System Tests */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#8B0000',
            fontFamily: 'Poppins, sans-serif'
          }}>
            🚀 System Integration Tests
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {otherTests.map((test) => (
              <div key={test.id} style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#141416'
                }}>
                  {test.name}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '1rem'
                }}>
                  {test.description}
                </p>
                <button
                  onClick={() => window.open(test.url, '_blank')}
                  style={{
                    background: 'linear-gradient(135deg, #fd7e14 0%, #e55a00 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  🔍 Test System
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Quick API Tests */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#8B0000',
            fontFamily: 'Poppins, sans-serif'
          }}>
            ⚡ Quick API Tests
          </h2>
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => runApiTest('/api/user-context', 'user-context')}
              style={{
                background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Test User Context API
            </button>
            <button
              onClick={() => runApiTest('/api/check-domains', 'domain-api')}
              style={{
                background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Test Domain API
            </button>
            {Object.entries(testResults).map(([key, result]) => (
              <div key={key} style={{
                padding: '8px 12px',
                background: result.includes('✅') ? '#d4edda' : '#f8d7da',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {key}: {result}
              </div>
            ))}
          </div>
        </section>

        {/* Testing Instructions */}
        <section>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#8B0000',
            fontFamily: 'Poppins, sans-serif'
          }}>
            📋 Testing Instructions
          </h2>
          <div style={{
            background: '#fff3cd',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #ffc107'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#856404' }}>
              🎯 Complete Journey Test:
            </h4>
            <ol style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
              <li><strong>Start with Step 1</strong> - Test business ideation phase</li>
              <li><strong>Progress to Step 2</strong> - Test market planning guidance</li>
              <li><strong>Continue to Step 3</strong> - Test business structuring advice</li>
              <li><strong>Finish with Step 4</strong> - Test launch preparation</li>
              <li><strong>Try both</strong> new and existing business types</li>
              <li><strong>Listen for</strong> context-aware responses from Elliot</li>
              <li><strong>Verify</strong> step indicators show correctly</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  )
}