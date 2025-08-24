'use client'
import React, { useEffect } from 'react'

export default function VAPIElliotReal() {
  useEffect(() => {
    // Load VAPI widget script
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js'
    script.async = true
    script.type = 'text/javascript'
    script.onload = () => {
      console.log('✅ VAPI widget script loaded')
      
      // Create the VAPI widget element
      const widgetContainer = document.getElementById('vapi-widget-container')
      if (widgetContainer) {
        // Clear existing content
        widgetContainer.innerHTML = ''
        
        // Create the VAPI widget element
        const vapiWidget = document.createElement('vapi-widget')
        vapiWidget.setAttribute('assistant-id', 'af397e88-c286-416f-9f74-e7665401bdb7')
        vapiWidget.setAttribute('public-key', '360c27df-9f83-4b80-bd33-e17dbcbf4971')
        
        // Add the widget to the container
        widgetContainer.appendChild(vapiWidget)
        
        console.log('✅ VAPI widget created with assistant ID:', 'af397e88-c286-416f-9f74-e7665401bdb7')
      }
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
        maxWidth: '1000px',
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
            🎤 Real VAPI Elliot Voice
          </h1>
          <p style={{ fontSize: '18px', color: '#6c757d', margin: '0 0 24px 0' }}>
            Official VAPI widget with real Elliot voice from your dashboard
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
          height: '500px',
          border: '2px solid #e9ecef',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '30px',
          background: '#f8f9fa'
        }}>
          <div id="vapi-widget-container" style={{ width: '100%', height: '100%' }}>
            {/* VAPI widget will be loaded here */}
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
                <p><strong>Loading VAPI Widget...</strong></p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  Real VAPI Elliot voice widget is being loaded
                </p>
                <p style={{ fontSize: '12px', marginTop: '8px', color: '#adb5bd' }}>
                  Assistant ID: af397e88-c286-416f-9f74-e7665401bdb7
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

        {/* Status */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: '#e8f5e8',
          borderRadius: '12px',
          border: '1px solid #c3e6cb'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#155724' }}>✅ Real VAPI Elliot Voice Ready</h3>
          <p style={{ margin: 0, color: '#155724' }}>
            This page uses the official VAPI widget from your dashboard. You should hear the real VAPI Elliot voice!
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
          <p style={{ margin: 0 }}>Real VAPI Elliot voice using official widget from dashboard</p>
        </div>
      </div>
    </div>
  )
}
