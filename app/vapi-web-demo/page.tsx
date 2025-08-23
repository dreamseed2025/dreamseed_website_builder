import React from 'react'
import NaturalVoiceWidget from '../components/NaturalVoiceWidget'

export default function VAPIWebDemo() {
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
            🎤 Voice-Interruptible AI Assistant
          </h1>
          <p style={{ fontSize: '18px', color: '#6c757d', margin: '0 0 24px 0' }}>
            Experience truly natural conversations - speak over the AI anytime to interrupt and steer the conversation
          </p>
          <div style={{
            display: 'inline-block',
            background: '#e8f5e8',
            color: '#28a745',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            ✅ Voice Interruption Enabled
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#495057' }}>🎯 Voice Interruption</h3>
            <p style={{ margin: 0, color: '#6c757d' }}>Speak over the AI anytime to interrupt and take control of the conversation</p>
          </div>
          <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#495057' }}>🏢 Business Formation</h3>
            <p style={{ margin: 0, color: '#6c757d' }}>4-stage business formation process with specialized VAPI assistants for each stage</p>
          </div>
          <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#495057' }}>🔧 Professional Voices</h3>
            <p style={{ margin: 0, color: '#6c757d' }}>Uses 11labs for high-quality, natural-sounding voice responses</p>
          </div>
        </div>

        <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '12px', marginBottom: '40px', border: '1px solid #bbdefb' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>📚 How Voice Interruption Works</h3>
          <p style={{ margin: '0 0 16px 0', color: '#1565c0' }}>
            This demo provides the most natural conversation experience possible. When the AI is speaking, simply start talking 
            and it will immediately stop and listen to you. No buttons needed - just like talking to a real person!
          </p>
          <div style={{ fontSize: '14px', color: '#1565c0' }}>
            <strong>Key Features:</strong>
            <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
              <li>Voice interruption - speak over AI anytime</li>
              <li>Real-time volume detection</li>
              <li>Automatic AI silencing when you speak</li>
              <li>Visual feedback when interrupting</li>
              <li>Professional 11labs voice synthesis</li>
              <li>Seamless conversation flow</li>
            </ul>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 24px 0', color: '#495057' }}>🏢 4-Stage Business Formation Process</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Stage 1: Foundation</h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Business concept, entity type, basic structure</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Stage 2: Brand Identity</h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Business naming, branding, market positioning</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Stage 3: Operations</h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Banking, accounting, compliance, operational details</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Stage 4: Launch Strategy</h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Marketing, revenue goals, growth planning</p>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff3cd', padding: '24px', borderRadius: '12px', marginBottom: '40px', border: '1px solid #ffeaa7' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#856404' }}>🚀 How to Use Voice Interruption</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>1️⃣</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>Start Conversation</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>Click "Start Conversation" to begin</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>2️⃣</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>Speak Naturally</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>Talk naturally - no need to press buttons</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>3️⃣</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>Interrupt by Voice</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>Just start speaking over the AI to interrupt</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>4️⃣</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>Steer Conversation</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>Take control and ask questions anytime</p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ textAlign: 'center', margin: '0 0 24px 0', color: '#495057' }}>💡 Example Voice Interruption Scenarios</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>Quick Questions</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
                <li>AI: "Let me explain the LLC formation process..."</li>
                <li>You: *[interrupt]* "Wait, what about taxes?"</li>
                <li>AI: *[stops immediately]* "Great question! Let me explain..."</li>
              </ul>
            </div>
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>Clarification</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
                <li>AI: "You'll need to file articles of organization..."</li>
                <li>You: *[interrupt]* "What does that mean exactly?"</li>
                <li>AI: *[stops immediately]* "Articles of organization are..."</li>
              </ul>
            </div>
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>Change Topic</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
                <li>AI: "Now let's discuss your business structure..."</li>
                <li>You: *[interrupt]* "Actually, let's talk about branding first"</li>
                <li>AI: *[stops immediately]* "Absolutely! Let's focus on branding..."</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '12px', border: '1px solid #e9ecef', marginBottom: '40px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>🔧 Technical Implementation</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>Voice Detection</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>Real-time volume analysis to detect when user starts speaking</p>
            </div>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>Automatic Interruption</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>AI speech stops immediately when user voice is detected</p>
            </div>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>Visual Feedback</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>Volume bar turns red and shows "Interrupting AI..." when speaking</p>
            </div>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>Seamless Flow</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>Conversation continues naturally after interruption</p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '20px', background: '#e8f5e8', borderRadius: '12px', border: '1px solid #c3e6cb', marginBottom: '40px' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#155724' }}>✅ Ready for Voice Interruption</h3>
          <p style={{ margin: 0, color: '#155724' }}>The voice-interruptible AI assistant is ready! Start a conversation and try speaking over the AI to experience true natural conversation.</p>
        </div>

        {/* Natural Voice Widget */}
        <NaturalVoiceWidget
          userId="demo-user-123"
          dreamId="demo-dream-456"
          businessName="Demo Business LLC"
          businessType="Consulting"
          callStage={1}
        />

        <div style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #e9ecef', color: '#6c757d', fontSize: '14px' }}>
          <p style={{ margin: '0 0 8px 0' }}>Powered by <strong>VAPI</strong> • Built for <strong>DreamSeed</strong></p>
          <p style={{ margin: 0 }}>Voice-interruptible conversation with 11labs voice synthesis</p>
        </div>
      </div>
    </div>
  )
}

