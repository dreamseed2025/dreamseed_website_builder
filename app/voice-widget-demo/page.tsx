'use client'

import { useState } from 'react'
import VoiceWidget from '../components/VoiceWidget'
import EnhancedVoiceWidget from '../components/EnhancedVoiceWidget'

export default function VoiceWidgetDemo() {
  const [selectedWidget, setSelectedWidget] = useState<'basic' | 'enhanced'>('enhanced')
  const [demoUserId, setDemoUserId] = useState('demo-user-123')
  const [demoDreamId, setDemoDreamId] = useState('dream-456')
  const [useWhisper, setUseWhisper] = useState(true)

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1>🎤 AI Voice Widget Demo</h1>
        <p>Experience the power of AI voice conversations with dynamic system messages</p>
      </div>

      <div className="demo-controls">
        <div className="control-group">
          <label>Widget Type:</label>
          <select 
            value={selectedWidget} 
            onChange={(e) => setSelectedWidget(e.target.value as 'basic' | 'enhanced')}
          >
            <option value="enhanced">Enhanced (with Whisper)</option>
            <option value="basic">Basic (Browser Speech)</option>
          </select>
        </div>

        <div className="control-group">
          <label>User ID:</label>
          <input
            type="text"
            value={demoUserId}
            onChange={(e) => setDemoUserId(e.target.value)}
            placeholder="Enter user ID"
          />
        </div>

        <div className="control-group">
          <label>Dream ID:</label>
          <input
            type="text"
            value={demoDreamId}
            onChange={(e) => setDemoDreamId(e.target.value)}
            placeholder="Enter dream ID"
          />
        </div>

        {selectedWidget === 'enhanced' && (
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={useWhisper}
                onChange={(e) => setUseWhisper(e.target.checked)}
              />
              Use OpenAI Whisper
            </label>
          </div>
        )}
      </div>

      <div className="demo-features">
        <h2>✨ Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🎯 Dynamic System Messages</h3>
            <p>AI responses are personalized based on user ID and dream ID, providing context-aware conversations.</p>
          </div>
          <div className="feature-card">
            <h3>🎤 Voice Interrupts</h3>
            <p>Users can interrupt the AI while it's speaking to start a new conversation immediately.</p>
          </div>
          <div className="feature-card">
            <h3>🤖 Dual AI Support</h3>
            <p>Seamlessly switches between VAPI and OpenAI APIs for optimal performance and reliability.</p>
          </div>
          <div className="feature-card">
            <h3>📊 Conversation History</h3>
            <p>Maintains conversation context and displays chat history with timestamps and confidence scores.</p>
          </div>
          <div className="feature-card">
            <h3>🎵 Audio Visualization</h3>
            <p>Real-time audio level visualization when recording with Whisper integration.</p>
          </div>
          <div className="feature-card">
            <h3>📱 Responsive Design</h3>
            <p>Works perfectly on desktop and mobile devices with a modern, intuitive interface.</p>
          </div>
        </div>
      </div>

      <div className="demo-instructions">
        <h2>🚀 How to Use</h2>
        <div className="instructions-list">
          <div className="instruction-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Click the Voice Widget</h4>
              <p>Look for the microphone button in the bottom-right corner of the screen.</p>
            </div>
          </div>
          <div className="instruction-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Allow Microphone Access</h4>
              <p>When prompted, allow the browser to access your microphone for voice input.</p>
            </div>
          </div>
          <div className="instruction-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Start Speaking</h4>
              <p>Click the "Start Speaking" button and begin your conversation with the AI.</p>
            </div>
          </div>
          <div className="instruction-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Interact Naturally</h4>
              <p>Ask questions about business formation, domains, or any business-related topics.</p>
            </div>
          </div>
          <div className="instruction-step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h4>Interrupt When Needed</h4>
              <p>Click the "Interrupt" button if you want to stop the AI and start speaking immediately.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-examples">
        <h2>💡 Example Conversations</h2>
        <div className="examples-grid">
          <div className="example-card">
            <h4>Business Formation</h4>
            <p>"I want to start an LLC for my consulting business. What do I need to know?"</p>
          </div>
          <div className="example-card">
            <h4>Domain Selection</h4>
            <p>"I need a domain name for my tech startup. Can you help me find one?"</p>
          </div>
          <div className="example-card">
            <h4>Business Planning</h4>
            <p>"What are the steps to register my business in California?"</p>
          </div>
          <div className="example-card">
            <h4>General Questions</h4>
            <p>"What's the difference between an LLC and a corporation?"</p>
          </div>
        </div>
      </div>

      <div className="demo-status">
        <h2>📊 Current Configuration</h2>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Widget Type:</span>
            <span className="status-value">{selectedWidget === 'enhanced' ? 'Enhanced with Whisper' : 'Basic Browser Speech'}</span>
          </div>
          <div className="status-item">
            <span className="status-label">User ID:</span>
            <span className="status-value">{demoUserId}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Dream ID:</span>
            <span className="status-value">{demoDreamId}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Whisper Enabled:</span>
            <span className="status-value">{useWhisper ? '✅ Yes' : '❌ No'}</span>
          </div>
        </div>
      </div>

      {/* Voice Widget */}
      {selectedWidget === 'enhanced' ? (
        <EnhancedVoiceWidget
          userId={demoUserId}
          dreamId={demoDreamId}
          useWhisper={useWhisper}
          onConversationStart={() => console.log('Conversation started')}
          onConversationEnd={() => console.log('Conversation ended')}
          onError={(error) => console.error('Voice widget error:', error)}
        />
      ) : (
        <VoiceWidget
          userId={demoUserId}
          dreamId={demoDreamId}
          onConversationStart={() => console.log('Conversation started')}
          onConversationEnd={() => console.log('Conversation ended')}
          onError={(error) => console.error('Voice widget error:', error)}
        />
      )}

      <style jsx>{`
        .demo-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .demo-header {
          text-align: center;
          margin-bottom: 40px;
          padding: 40px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 16px;
        }

        .demo-header h1 {
          margin: 0 0 16px 0;
          font-size: 36px;
          font-weight: 700;
        }

        .demo-header p {
          margin: 0;
          font-size: 18px;
          opacity: 0.9;
        }

        .demo-controls {
          background: white;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .control-group label {
          font-weight: 600;
          color: #495057;
          font-size: 14px;
        }

        .control-group input,
        .control-group select {
          padding: 8px 12px;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
        }

        .control-group input[type="checkbox"] {
          width: auto;
          margin-right: 8px;
        }

        .demo-features {
          margin-bottom: 30px;
        }

        .demo-features h2 {
          margin: 0 0 20px 0;
          color: #1a1a1a;
          font-size: 24px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .feature-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-left: 4px solid #667eea;
        }

        .feature-card h3 {
          margin: 0 0 12px 0;
          color: #1a1a1a;
          font-size: 18px;
        }

        .feature-card p {
          margin: 0;
          color: #6c757d;
          line-height: 1.5;
        }

        .demo-instructions {
          margin-bottom: 30px;
        }

        .demo-instructions h2 {
          margin: 0 0 20px 0;
          color: #1a1a1a;
          font-size: 24px;
        }

        .instructions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .instruction-step {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .step-number {
          background: #667eea;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
          flex-shrink: 0;
        }

        .step-content h4 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 16px;
        }

        .step-content p {
          margin: 0;
          color: #6c757d;
          line-height: 1.5;
        }

        .demo-examples {
          margin-bottom: 30px;
        }

        .demo-examples h2 {
          margin: 0 0 20px 0;
          color: #1a1a1a;
          font-size: 24px;
        }

        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .example-card {
          background: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border: 1px solid #e9ecef;
        }

        .example-card h4 {
          margin: 0 0 8px 0;
          color: #667eea;
          font-size: 14px;
          font-weight: 600;
        }

        .example-card p {
          margin: 0;
          color: #495057;
          font-size: 14px;
          font-style: italic;
        }

        .demo-status {
          margin-bottom: 30px;
        }

        .demo-status h2 {
          margin: 0 0 20px 0;
          color: #1a1a1a;
          font-size: 24px;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .status-item {
          background: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-label {
          font-weight: 600;
          color: #495057;
          font-size: 14px;
        }

        .status-value {
          color: #667eea;
          font-weight: 500;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .demo-controls {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .instruction-step {
            flex-direction: column;
            gap: 12px;
          }

          .examples-grid {
            grid-template-columns: 1fr;
          }

          .status-grid {
            grid-template-columns: 1fr;
          }

          .status-item {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  )
}
