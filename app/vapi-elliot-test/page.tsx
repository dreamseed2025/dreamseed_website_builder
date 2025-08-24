import React from 'react'
import VAPIWebWidget from '../components/VAPIWebWidget'

export default function VAPIElliotTest() {
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
            🎤 VAPI Elliot Voice Test
          </h1>
          <p style={{ fontSize: '16px', color: '#6c757d', margin: '0 0 24px 0' }}>
            Test the real VAPI Elliot voice using VAPI's official web widget
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

        {/* VAPI Web Widget */}
        <div style={{
          height: '500px',
          border: '2px solid #e9ecef',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '30px'
        }}>
          <VAPIWebWidget 
            userId="test-user"
            dreamId="test-dream"
            businessName="Test Business"
            businessType="Consulting"
            callStage={1}
          />
        </div>

        {/* Instructions */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>
            🎯 How to Test Elliot's Voice
          </h3>
          <ol style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
            <li>Click the "🎤 Start Business Consultation with Elliot" button</li>
            <li>Allow microphone access when prompted</li>
            <li>Speak to Elliot - ask about starting a business</li>
            <li>Listen for Elliot's voice response</li>
            <li>Verify it sounds like the real VAPI Elliot voice</li>
          </ol>
        </div>

        {/* Status */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: '#e8f5e8',
          borderRadius: '12px',
          border: '1px solid #c3e6cb',
          marginTop: '30px'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#155724' }}>✅ Ready to Test Elliot</h3>
          <p style={{ margin: 0, color: '#155724' }}>
            This page uses VAPI's official web widget with Elliot voice. You should hear the authentic VAPI Elliot voice.
          </p>
        </div>
      </div>
    </div>
  )
}
