import React from 'react'

export default function VAPIWidgetSimple() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            color: '#495057'
          }}>
            🎤 VAPI Widget Test
          </h1>
          <p style={{ fontSize: '16px', color: '#6c757d', margin: '0 0 24px 0' }}>
            Simple VAPI widget test page
          </p>
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
            🎯 Next Steps
          </h3>
          <ol style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
            <li>Copy the VAPI widget embed code from your dashboard</li>
            <li>Replace the placeholder below with the actual embed code</li>
            <li>Test the widget to hear Elliot's real voice</li>
            <li>The embed code should look like: <code>&lt;vapi-widget public-key="..." assistant-id="..."&gt;&lt;/vapi-widget&gt;</code></li>
          </ol>
        </div>

        {/* Widget Container */}
        <div style={{
          height: '400px',
          border: '2px dashed #e9ecef',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9fa',
          marginBottom: '30px'
        }}>
          <div style={{ textAlign: 'center', color: '#6c757d' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎤</div>
            <p><strong>VAPI Widget Embed Code Goes Here</strong></p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Copy the embed code from your VAPI dashboard and paste it here
            </p>
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
          <h3 style={{ margin: '0 0 8px 0', color: '#155724' }}>✅ Ready for VAPI Widget</h3>
          <p style={{ margin: 0, color: '#155724' }}>
            This page is ready to receive the VAPI widget embed code from your dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}

