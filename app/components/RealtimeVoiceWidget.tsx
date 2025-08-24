'use client'

import { useState } from 'react'

interface RealtimeVoiceWidgetProps {
  userId: string
  dreamId: string
  useWhisper?: boolean
  onConversationStart?: () => void
  onConversationEnd?: () => void
}

export default function RealtimeVoiceWidget({
  userId,
  dreamId,
  useWhisper = true,
  onConversationStart,
  onConversationEnd
}: RealtimeVoiceWidgetProps) {
  const [status, setStatus] = useState('Feature Coming Soon')

  return (
    <div className="realtime-voice-widget">
      <style jsx>{`
        .realtime-voice-widget {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: #fafafa;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .status {
          margin: 15px 0;
          padding: 10px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          background: #fff3e0;
          color: #f57c00;
        }
        
        .info {
          font-size: 12px;
          color: #666;
          margin-top: 15px;
          line-height: 1.4;
        }
      `}</style>
      
      <h3>🎙️ OpenAI Realtime Voice Assistant</h3>
      <p>Business Formation & Domain Expert</p>
      
      <div className="status">
        {status}
      </div>
      
      <div className="info">
        💡 OpenAI Realtime API integration coming soon. Install `openai-realtime-agents` package to enable this feature.
      </div>
    </div>
  )
}
