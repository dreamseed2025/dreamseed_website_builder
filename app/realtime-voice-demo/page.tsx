'use client'

import { useState } from 'react'
import RealtimeVoiceWidget from '../components/RealtimeVoiceWidget'

export default function RealtimeVoiceDemo() {
  const [demoUserId, setDemoUserId] = useState('demo-user-123')
  const [demoDreamId, setDemoDreamId] = useState('dream-456')
  const [demoBusinessName, setDemoBusinessName] = useState('TechStart Solutions')
  const [demoBusinessType, setDemoBusinessType] = useState('Software Consulting')

  return (
    <div className="realtime-demo-container">
      <div className="demo-header">
        <h1>🚀 OpenAI Realtime Agents Voice Widget</h1>
        <p>Experience true real-time voice conversations with built-in interrupt handling</p>
      </div>

      <div className="demo-info">
        <div className="info-card">
          <h3>🎯 What Makes This Special</h3>
          <ul>
            <li><strong>Real-time Interrupts:</strong> Talk over the AI naturally - it will stop and listen</li>
            <li><strong>Voice Activity Detection:</strong> Automatically detects when you start/stop speaking</li>
            <li><strong>Low Latency:</strong> Uses WebRTC for streaming audio with minimal delay</li>
            <li><strong>Dynamic Context:</strong> System messages update based on your business context</li>
            <li><strong>Professional Quality:</strong> Uses OpenAI's latest TTS and speech recognition</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>🔧 Technical Features</h3>
          <ul>
            <li><strong>OpenAI Realtime API:</strong> Latest real-time voice technology</li>
            <li><strong>WebRTC Streaming:</strong> Low-latency audio streaming</li>
            <li><strong>Voice Activity Detection:</strong> Smart speech detection</li>
            <li><strong>Interrupt Handling:</strong> Natural conversation flow</li>
            <li><strong>Context Awareness:</strong> Personalized responses</li>
          </ul>
        </div>
      </div>

      <div className="demo-config">
        <h2>⚙️ Configuration</h2>
        <div className="config-grid">
          <div className="config-item">
            <label>User ID:</label>
            <input
              type="text"
              value={demoUserId}
              onChange={(e) => setDemoUserId(e.target.value)}
              placeholder="Enter user ID"
            />
          </div>
          <div className="config-item">
            <label>Dream ID:</label>
            <input
              type="text"
              value={demoDreamId}
              onChange={(e) => setDemoDreamId(e.target.value)}
              placeholder="Enter dream ID"
            />
          </div>
          <div className="config-item">
            <label>Business Name:</label>
            <input
              type="text"
              value={demoBusinessName}
              onChange={(e) => setDemoBusinessName(e.target.value)}
              placeholder="Enter business name"
            />
          </div>
          <div className="config-item">
            <label>Business Type:</label>
            <select
              value={demoBusinessType}
              onChange={(e) => setDemoBusinessType(e.target.value)}
            >
              <option value="Software Consulting">Software Consulting</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>
      </div>

      <div className="demo-instructions">
        <h2>🎤 How to Use</h2>
        <div className="instructions-grid">
          <div className="instruction-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Click the Voice Widget</h4>
              <p>Look for the microphone button in the bottom-right corner. It will initialize the OpenAI Realtime Agent.</p>
            </div>
          </div>
          <div className="instruction-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Start Speaking</h4>
              <p>Once connected, click the button again to start the conversation. The AI will begin listening.</p>
            </div>
          </div>
          <div className="instruction-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Interrupt Naturally</h4>
              <p>While the AI is speaking, you can start talking to interrupt it. The system will detect your voice and stop the AI.</p>
            </div>
          </div>
          <div className="instruction-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Have a Natural Conversation</h4>
              <p>Ask about business formation, domains, or any business-related topics. The AI will respond with context-aware answers.</p>
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
            <small>Try interrupting while the AI explains the process</small>
          </div>
          <div className="example-card">
            <h4>Domain Selection</h4>
            <p>"I need a domain name for my tech startup. Can you help me find one?"</p>
            <small>Interrupt to ask specific questions about domain availability</small>
          </div>
          <div className="example-card">
            <h4>State Registration</h4>
            <p>"What are the steps to register my business in California?"</p>
            <small>Interrupt to ask about specific requirements or timelines</small>
          </div>
          <div className="example-card">
            <h4>Entity Types</h4>
            <p>"What's the difference between an LLC and a corporation?"</p>
            <small>Interrupt to ask about tax implications or liability protection</small>
          </div>
        </div>
      </div>

      <div className="demo-status">
        <h2>📊 Current Configuration</h2>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">User ID:</span>
            <span className="status-value">{demoUserId}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Dream ID:</span>
            <span className="status-value">{demoDreamId}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Business Name:</span>
            <span className="status-value">{demoBusinessName}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Business Type:</span>
            <span className="status-value">{demoBusinessType}</span>
          </div>
        </div>
      </div>

      {/* Realtime Voice Widget */}
      <RealtimeVoiceWidget
        userId={demoUserId}
        dreamId={demoDreamId}
        onConversationStart={() => console.log('Realtime conversation started')}
        onConversationEnd={() => console.log('Realtime conversation ended')}
        onError={(error) => console.error('Realtime voice widget error:', error)}
      />

      <style jsx>{`
        .realtime-demo-container {
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

        .demo-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .info-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-left: 4px solid #667eea;
        }

        .info-card h3 {
          margin: 0 0 16px 0;
          color: #1a1a1a;
          font-size: 20px;
        }

        .info-card ul {
          margin: 0;
          padding-left: 20px;
        }

        .info-card li {
          margin-bottom: 8px;
          color: #495057;
          line-height: 1.5;
        }

        .demo-config {
          background: white;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .demo-config h2 {
          margin: 0 0 20px 0;
          color: #1a1a1a;
          font-size: 24px;
        }

        .config-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .config-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .config-item label {
          font-weight: 600;
          color: #495057;
          font-size: 14px;
        }

        .config-item input,
        .config-item select {
          padding: 8px 12px;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
        }

        .demo-instructions {
          margin-bottom: 30px;
        }

        .demo-instructions h2 {
          margin: 0 0 20px 0;
          color: #1a1a1a;
          font-size: 24px;
        }

        .instructions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
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
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .example-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border: 1px solid #e9ecef;
        }

        .example-card h4 {
          margin: 0 0 12px 0;
          color: #667eea;
          font-size: 16px;
          font-weight: 600;
        }

        .example-card p {
          margin: 0 0 8px 0;
          color: #495057;
          font-size: 14px;
          font-style: italic;
        }

        .example-card small {
          color: #6c757d;
          font-size: 12px;
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
          .demo-info {
            grid-template-columns: 1fr;
          }

          .config-grid {
            grid-template-columns: 1fr;
          }

          .instructions-grid {
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
