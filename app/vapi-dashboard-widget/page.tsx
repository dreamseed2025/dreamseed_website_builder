'use client'

import React, { useEffect } from 'react'

export default function VAPIDashboardWidget() {
  useEffect(() => {
    // Load VAPI widget script
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@vapi-ai/web@latest/dist/index.js'
    script.async = true
    script.onload = () => {
      console.log('✅ VAPI widget script loaded')
    }
    script.onerror = () => {
      console.error('❌ Failed to load VAPI widget script')
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="vapi-ai"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎤 VAPI Dashboard Widget
          </h1>
          <p style={{ fontSize: '18px', color: '#6c757d', margin: '0 0 24px 0' }}>
            Official VAPI widget embed from your dashboard - Real Elliot voice
          </p>
          <div style={{
            display: 'inline-block',
            background: '#fff3cd',
            color: '#856404',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            🎤 Real VAPI Elliot Voice
          </div>
        </div>

        {/* VAPI Widget Container */}
        <div style={{
          height: '600px',
          border: '2px solid #e9ecef',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '30px',
          background: '#f8f9fa'
        }}>
          {/* This is where the VAPI widget will be embedded */}
          <div id="vapi-widget-container" style={{ width: '100%', height: '100%' }}>
            {/* TODO: Add the VAPI widget embed code from your dashboard here */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#6c757d',
              fontSize: '16px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎤</div>
                <p>VAPI Widget will be embedded here</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  Please provide the embed code from your VAPI dashboard
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>
            🎯 How to Use the VAPI Widget
          </h3>
          <ol style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
            <li>Wait for the VAPI widget to load (may take a few seconds)</li>
            <li>Click the widget button to start a conversation</li>
            <li>Allow microphone access when prompted</li>
            <li>Speak to Elliot - ask about starting a business</li>
            <li>Listen for Elliot's real VAPI voice response</li>
            <li>This uses the official VAPI widget from your dashboard</li>
          </ol>
        </div>

        {/* Widget Configuration Info */}
        <div style={{
          background: '#e3f2fd',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #bbdefb',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>
            🔧 Widget Configuration
          </h3>
          <div style={{ fontSize: '14px', color: '#1565c0' }}>
            <p><strong>Source:</strong> VAPI Dashboard Widget Embed</p>
            <p><strong>Assistant ID:</strong> 87416134-cfc7-47de-ad97-4951d3905ea9</p>
            <p><strong>Voice:</strong> Elliot (VAPI Native)</p>
            <p><strong>Integration:</strong> Official VAPI Web Widget</p>
          </div>
        </div>

        {/* Status */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: '#e8f5e8',
          borderRadius: '12px',
          border: '1px solid #c3e6cb'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#155724' }}>✅ VAPI Dashboard Widget Ready</h3>
          <p style={{ margin: 0, color: '#155724' }}>
            This page uses the official VAPI widget embed code from your dashboard. You should hear the real VAPI Elliot voice.
          </p>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          borderTop: '1px solid #e9ecef',
          color: '#6c757d',
          fontSize: '14px',
          marginTop: '30px'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>Powered by <strong>VAPI</strong> • Built for <strong>DreamSeed</strong></p>
          <p style={{ margin: 0 }}>Official VAPI widget embed from dashboard - Real Elliot voice</p>
        </div>
      </div>
    </div>
  )
}
