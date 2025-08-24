'use client'

import React, { useState, useEffect } from 'react'

interface TestResult {
  phase: string
  status: 'PASS' | 'FAIL' | 'WARN' | 'RUNNING'
  duration: number
  details: string
  description: string
  testCount: number
  passedCount: number
}

interface QAMetrics {
  totalTests: number
  passed: number
  failed: number
  warnings: number
  successRate: number
  totalDuration: number
  lastRun: string
}

export default function QADashboard() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [metrics, setMetrics] = useState<QAMetrics | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentPhase, setCurrentPhase] = useState('')

  // Fetch real-time dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/qa-dashboard')
      const result = await response.json()
      
      if (result.success) {
        setTestResults(result.data.testResults || [])
        setMetrics(result.data.metrics || null)
        setIsRunning(result.data.isRunning || false)
        setCurrentPhase(result.data.currentPhase || '')
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  useEffect(() => {
    // Initial load
    fetchDashboardData()
    
    // Poll for updates every 3 seconds when tests are running
    const interval = setInterval(() => {
      if (isRunning) {
        fetchDashboardData()
      }
    }, 3000)
    
    return () => clearInterval(interval)
  }, [isRunning])

  // Refresh dashboard data every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const runQATests = async (suite: string) => {
    try {
      setIsRunning(true)
      setCurrentPhase('Starting tests...')
      
      // Trigger QA tests via API
      const response = await fetch('/api/qa-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'run-tests', 
          testSuite: suite 
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log(`✅ Started ${suite} test suite`)
        
        // Start polling for updates more frequently during test execution
        const pollInterval = setInterval(() => {
          fetchDashboardData()
        }, 2000)
        
        // Stop polling after reasonable time or when tests complete
        setTimeout(() => {
          clearInterval(pollInterval)
          if (isRunning) {
            setIsRunning(false)
            setCurrentPhase('Tests completed')
          }
        }, 300000) // 5 minutes max
        
      } else {
        throw new Error(result.error || 'Failed to start tests')
      }
      
    } catch (error) {
      console.error('Failed to run QA tests:', error)
      setIsRunning(false)
      setCurrentPhase('Error starting tests')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return '#28a745'
      case 'FAIL': return '#dc3545'  
      case 'WARN': return '#ffc107'
      case 'RUNNING': return '#17a2b8'
      default: return '#6c757d'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return '✅'
      case 'FAIL': return '❌'
      case 'WARN': return '⚠️'
      case 'RUNNING': return '🔄'
      default: return '⏳'
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '42px',
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🤖 DreamSeed QA Dashboard
          </h1>
          <p style={{ fontSize: '18px', color: '#6c757d', margin: '0 0 24px 0' }}>
            Comprehensive automated testing results and system health monitoring
          </p>
          
          {/* Test Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => runQATests('smoke')}
              disabled={isRunning}
              style={{
                padding: '12px 24px',
                borderRadius: '25px',
                background: isRunning ? '#6c757d' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🚀 Run Smoke Tests
            </button>
            
            <button
              onClick={() => runQATests('regression')}
              disabled={isRunning}
              style={{
                padding: '12px 24px',
                borderRadius: '25px',
                background: isRunning ? '#6c757d' : 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🔄 Run Regression
            </button>
            
            <button
              onClick={() => runQATests('full')}
              disabled={isRunning}
              style={{
                padding: '12px 24px',
                borderRadius: '25px',
                background: isRunning ? '#6c757d' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🎯 Run Full Suite
            </button>
          </div>

          {isRunning && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: '#e3f2fd',
              borderRadius: '8px',
              border: '1px solid #bbdefb'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>
                🔄 Running Tests... {currentPhase}
              </h3>
              <div style={{
                width: '100%',
                height: '6px',
                background: '#e9ecef',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '60%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                  animation: 'progress 2s infinite linear'
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Metrics Overview */}
        {metrics && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              padding: '30px',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
                {metrics.passed}
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>Tests Passed</div>
              <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '4px' }}>
                {metrics.successRate}% Success Rate
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              color: 'white',
              padding: '30px',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
                {metrics.failed}
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>Failed</div>
              <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '4px' }}>
                Critical Issues
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
              color: 'white',
              padding: '30px',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
                {metrics.warnings}
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>Warnings</div>
              <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '4px' }}>
                Minor Issues
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '30px',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
                {Math.round(metrics.totalDuration / 60)}m
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>Duration</div>
              <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '4px' }}>
                Total Test Time
              </div>
            </div>
          </div>
        )}

        {/* Test Phases */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '0 0 24px 0',
            color: '#495057',
            textAlign: 'center'
          }}>
            📋 Test Phase Results
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px'
          }}>
            {testResults.map((result, index) => (
              <div
                key={result.phase}
                style={{
                  background: 'white',
                  border: `3px solid ${getStatusColor(result.status)}`,
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Phase Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#495057'
                  }}>
                    {getStatusIcon(result.status)} {result.phase}
                  </h3>
                  <div style={{
                    background: getStatusColor(result.status),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {result.status}
                  </div>
                </div>

                {/* Phase Description */}
                <p style={{
                  margin: '0 0 16px 0',
                  fontSize: '14px',
                  color: '#6c757d',
                  lineHeight: '1.5'
                }}>
                  {result.description}
                </p>

                {/* Test Metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    background: '#f8f9fa',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: getStatusColor(result.status)
                    }}>
                      {result.passedCount}/{result.testCount}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      Tests Passed
                    </div>
                  </div>

                  <div style={{
                    background: '#f8f9fa',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#495057'
                    }}>
                      {result.duration}s
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      Duration
                    </div>
                  </div>
                </div>

                {/* Test Details */}
                <div style={{
                  background: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <h4 style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#495057'
                  }}>
                    📊 Results
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: '13px',
                    color: '#6c757d'
                  }}>
                    {result.details}
                  </p>
                </div>

                {/* Running Animation */}
                {result.status === 'RUNNING' && (
                  <div style={{
                    marginTop: '16px',
                    height: '4px',
                    background: '#e9ecef',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '30%',
                      height: '100%',
                      background: getStatusColor(result.status),
                      animation: 'slide 2s infinite linear'
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Test Phase Descriptions */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e9ecef'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0 0 24px 0',
            color: '#495057',
            textAlign: 'center'
          }}>
            📚 Test Phase Descriptions
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {[
              {
                title: '📄 Static Pages',
                description: 'Tests all static pages (home, assessment, login) for proper loading, HTTP response codes, console errors, and presence of critical UI elements.'
              },
              {
                title: '👤 User Registration',
                description: 'Validates the complete user registration and login flow including email/password validation, Supabase authentication, and role-based routing.'
              },
              {
                title: '📝 Business Assessment',
                description: 'Tests the 4-step business assessment form including data validation, step progression, data persistence, and redirect to login page.'
              },
              {
                title: '🏠 Customer Portal',
                description: 'Verifies customer portal access, assessment data display, voice widget presence, and integration with user authentication system.'
              },
              {
                title: '🤖 AI Dream Coach',
                description: 'Comprehensive testing of AI Dream Coach across all 4 business formation stages with realistic conversation scenarios and response validation.'
              },
              {
                title: '🎤 Voice Assistant',
                description: 'Tests VAPI voice widget functionality including start/stop controls, voice interruption, conversation history, and performance optimization features.'
              },
              {
                title: '🔌 API Endpoints',
                description: 'Tests all backend API endpoints with success and error scenarios including VAPI integration, speech synthesis, and domain checking.'
              },
              {
                title: '⚡ Performance',
                description: 'Measures page load times, API response times, voice assistant performance, memory usage, and overall system responsiveness.'
              }
            ].map((phase, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
                }}
              >
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  {phase.title}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#6c757d',
                  lineHeight: '1.5'
                }}>
                  {phase.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          padding: '24px',
          borderTop: '1px solid #e9ecef',
          color: '#6c757d',
          fontSize: '14px'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>DreamSeed QA Dashboard</strong> • Powered by Puppeteer & Playwright
          </p>
          <p style={{ margin: 0 }}>
            Last run: {metrics ? new Date(metrics.lastRun).toLocaleString() : 'Never'}
          </p>
        </div>

      </div>

      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  )
}