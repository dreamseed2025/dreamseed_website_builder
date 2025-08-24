'use client'
import React, { useEffect } from 'react'

export default function OptimizedVoiceDemo() {
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
            🎤 VAPI Elliot Voice Assistant
          </h1>
          <p style={{ fontSize: '18px', color: '#6c757d', margin: '0 0 24px 0' }}>
            Real VAPI Elliot voice with your custom widget configuration
          </p>
          <div style={{
            display: 'inline-block',
            background: '#d4edda',
            color: '#155724',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            🎤 Real VAPI Elliot Voice
          </div>
        </div>

        {/* VAPI Widget Container */}
        <div id="vapi-widget-container" style={{ 
          minHeight: '400px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f8f9fa',
          borderRadius: '12px',
          border: '2px dashed #dee2e6'
        }}>
          <div style={{ textAlign: 'center', color: '#6c757d' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎤</div>
            <p><strong>Loading VAPI Widget...</strong></p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Elliot voice with your custom configuration
            </p>
          </div>
        </div>

        {/* VAPI Widget Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js';
                script.async = true;
                script.type = 'text/javascript';
                script.onload = function() {
                  const widgetContainer = document.getElementById('vapi-widget-container');
                  if (widgetContainer) {
                    widgetContainer.innerHTML = '';
                    const vapiWidget = document.createElement('vapi-widget');
                    vapiWidget.setAttribute('assistant-id', 'af397e88-c286-416f-9f74-e7665401bdb7');
                    vapiWidget.setAttribute('public-key', '360c27df-9f83-4b80-bd33-e17dbcbf4971');
                    vapiWidget.setAttribute('voice', 'elliot');
                    vapiWidget.setAttribute('mode', 'voice');
                    vapiWidget.setAttribute('theme', 'dark');
                    vapiWidget.setAttribute('base-bg-color', '#000000');
                    vapiWidget.setAttribute('accent-color', '#76001b');
                    vapiWidget.setAttribute('cta-button-color', '#000000');
                    vapiWidget.setAttribute('cta-button-text-color', '#ffffff');
                    vapiWidget.setAttribute('border-radius', 'large');
                    vapiWidget.setAttribute('size', 'full');
                    vapiWidget.setAttribute('position', 'bottom-right');
                    vapiWidget.setAttribute('title', 'Business Coach');
                    vapiWidget.setAttribute('start-button-text', 'Start');
                    vapiWidget.setAttribute('end-button-text', 'End Call');
                    vapiWidget.setAttribute('chat-first-message', 'Hey, How can I help you today?');
                    vapiWidget.setAttribute('chat-placeholder', 'Type your message...');
                    vapiWidget.setAttribute('voice-show-transcript', 'true');
                    vapiWidget.setAttribute('consent-required', 'true');
                    vapiWidget.setAttribute('consent-title', 'Terms and conditions');
                    vapiWidget.setAttribute('consent-content', 'By clicking "Agree," and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as otherwise described in our Terms of Service.');
                    vapiWidget.setAttribute('consent-storage-key', 'vapi_widget_consent');
                    widgetContainer.appendChild(vapiWidget);
                  }
                };
                document.head.appendChild(script);
              })();
            `
          }}
        />

        {/* Information Section */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>
            🎤 Real VAPI Elliot Voice Features
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>🎤 Voice Quality</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>Real VAPI Elliot voice</p>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>🎨 Custom Styling</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>Dark theme with red accents</p>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>🏢 Business Formation</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>4-stage system integration</p>
            </div>
          </div>
        </div>

        {/* Ready Message */}
        <div style={{ textAlign: 'center', padding: '20px', background: '#e8f5e8', borderRadius: '12px', border: '1px solid #c3e6cb', marginTop: '40px' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#155724' }}>✅ Real VAPI Elliot Voice Ready</h3>
          <p style={{ margin: 0, color: '#155724' }}>The real VAPI Elliot voice assistant is ready! Uses your custom configuration with dark theme and red accents.</p>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #e9ecef', color: '#6c757d', fontSize: '14px', marginTop: '40px' }}>
          <p style={{ margin: '0 0 8px 0' }}>Powered by <strong>VAPI</strong> • Built for <strong>DreamSeed</strong></p>
          <p style={{ margin: 0 }}>Real VAPI Elliot voice with custom widget configuration</p>
        </div>
      </div>
    </div>
  )
}
