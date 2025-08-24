'use client'

import { useState, useEffect } from 'react'

interface CallTranscript {
  id: string
  call_id: string
  call_stage: number
  full_transcript: string
  user_messages: string[]
  assistant_messages: string[]
  semantic_summary: string
  extracted_data: any
  full_transcript_vector: boolean
  user_messages_vector: boolean
  semantic_summary_vector: boolean
  processed_at: string
  created_at: string
  user_id: string
}

interface User {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  business_name: string
  current_call_stage: number
  status: string
}

interface SystemStatus {
  transcriptCount: number
  userCount: number
  vectorsEnabled: boolean
  recentTranscripts: CallTranscript[]
  sampleUsers: User[]
  webhookStatus: string
}

export default function TranscriptDashboard() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setLoading(true)
      
      // Get transcript data
      const transcriptResponse = await fetch('/api/transcript-dashboard')
      if (!transcriptResponse.ok) {
        throw new Error(`HTTP ${transcriptResponse.status}`)
      }
      
      const data = await transcriptResponse.json()
      setStatus(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testWebhook = async () => {
    try {
      const testData = {
        type: 'call-end',
        callId: 'dashboard-test-' + Date.now(),
        call: {
          id: 'dashboard-test-' + Date.now(),
          customer: {
            number: '+15551234567',
            email: 'test@dashboard.com'
          }
        },
        artifact: {
          messages: [
            {
              role: 'user',
              content: 'Hi, I want to test the transcript processing system for my business formation.'
            },
            {
              role: 'assistant', 
              content: 'Great! I can help you test the system. Let me process this conversation and create vectors for semantic search.'
            },
            {
              role: 'user',
              content: 'Perfect, I want to form an LLC in Delaware for my consulting business.'
            },
            {
              role: 'assistant',
              content: 'Excellent choice! Delaware is great for LLCs. Let me help you with the formation process and gather the necessary information.'
            }
          ]
        }
      }

      const response = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })

      const result = await response.json()
      setTestResult(result)
      
      // Refresh status after test
      setTimeout(fetchStatus, 2000)
    } catch (err) {
      setTestResult({ error: err.message })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transcript dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchStatus}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 Transcript Processing Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor call transcript processing and database storage</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📝</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transcripts</p>
                <p className="text-2xl font-bold text-gray-900">{status?.transcriptCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👥</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{status?.userCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🧠</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Vector Search</p>
                <p className="text-lg font-bold text-green-600">
                  {status?.vectorsEnabled ? '✅ Enabled' : '❌ Disabled'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🎯</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Webhook Status</p>
                <p className="text-lg font-bold text-green-600">
                  {status?.webhookStatus || '✅ Active'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🧪 Test & Monitor</h2>
          <div className="flex space-x-4">
            <button
              onClick={testWebhook}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              🔄 Test Webhook Processing
            </button>
            <button
              onClick={fetchStatus}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              🔍 Refresh Data
            </button>
          </div>

          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Test Result:</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Recent Transcripts */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Recent Transcripts</h2>
          
          {status?.recentTranscripts && status.recentTranscripts.length > 0 ? (
            <div className="space-y-4">
              {status.recentTranscripts.map((transcript) => (
                <div key={transcript.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">Call {transcript.call_id}</h3>
                      <p className="text-sm text-gray-600">Stage {transcript.call_stage} • {new Date(transcript.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      {transcript.full_transcript_vector && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Vectorized</span>
                      )}
                      {transcript.semantic_summary && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Summary</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Transcript Length:</p>
                      <p className="font-medium">{transcript.full_transcript?.length || 0} chars</p>
                    </div>
                    <div>
                      <p className="text-gray-600">User Messages:</p>
                      <p className="font-medium">{transcript.user_messages?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Assistant Messages:</p>
                      <p className="font-medium">{transcript.assistant_messages?.length || 0}</p>
                    </div>
                  </div>

                  {transcript.semantic_summary && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600 mb-1">Semantic Summary:</p>
                      <p className="text-sm text-gray-800">{transcript.semantic_summary}</p>
                    </div>
                  )}

                  {transcript.extracted_data && Object.keys(transcript.extracted_data).length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-1">Extracted Data:</p>
                      <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                        {Object.keys(transcript.extracted_data).slice(0, 5).map(key => (
                          <span key={key} className="inline-block bg-gray-200 px-2 py-1 rounded mr-2 mb-1">
                            {key}
                          </span>
                        ))}
                        {Object.keys(transcript.extracted_data).length > 5 && (
                          <span className="text-gray-500">+{Object.keys(transcript.extracted_data).length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>No transcripts found</p>
              <p className="text-sm">Try running the webhook test above</p>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">👥 Sample Users</h2>
          
          {status?.sampleUsers && status.sampleUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {status.sampleUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{user.customer_name || 'No Name'}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📞 {user.customer_phone || 'No phone'}</p>
                    <p>📧 {user.customer_email || 'No email'}</p>
                    <p>🏢 {user.business_name || 'No business name'}</p>
                    <p>📊 Call Stage: {user.current_call_stage}</p>
                    <p>Status: <span className="font-medium">{user.status}</span></p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">👤</div>
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

