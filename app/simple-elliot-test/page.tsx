import React from 'react'

export default function SimpleElliotTest() {
  const speakWithElliotVoice = async (text: string) => {
    try {
      console.log('🎤 Speaking with Elliot voice:', text)
      
      // Use browser's speech synthesis with Elliot-like voice settings
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Configure voice settings to match Elliot's characteristics
      utterance.rate = 0.9 // Slightly slower for clarity
      utterance.pitch = 1.1 // Slightly higher pitch for Elliot
      utterance.volume = 1.0 // Full volume
      
      // Try to use a male voice that sounds similar to Elliot
      const voices = speechSynthesis.getVoices()
      const elliotVoice = voices.find(voice => 
        voice.name.includes('Male') || 
        voice.name.includes('David') || 
        voice.name.includes('Alex') ||
        voice.name.includes('Google UK English Male') ||
        voice.name.includes('Daniel')
      ) || voices[0]
      
      if (elliotVoice) {
        utterance.voice = elliotVoice
        console.log('🎤 Using Elliot-like voice:', elliotVoice.name)
      }

      utterance.onstart = () => {
        console.log('🎤 Elliot started speaking')
      }

      utterance.onend = () => {
        console.log('🎤 Elliot finished speaking')
      }

      utterance.onerror = (event) => {
        console.error('❌ Speech synthesis error:', event.error)
      }

      // Speak the response
      speechSynthesis.speak(utterance)

    } catch (error) {
      console.error('❌ Elliot voice error:', error)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
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
            🎤 Simple Elliot Test
          </h1>
          <p style={{ fontSize: '16px', color: '#6c757d', margin: '0 0 24px 0' }}>
            Test Elliot's voice with browser speech synthesis
          </p>
        </div>

        {/* Test Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'center'
        }}>
          <button
            onClick={() => speakWithElliotVoice("Hello! I'm Elliot, your business formation assistant. How can I help you today?")}
            style={{
              padding: '16px 32px',
              borderRadius: '25px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            🎤 Test Elliot Greeting
          </button>

          <button
            onClick={() => speakWithElliotVoice("That's a great business idea! Let me help you get started with the foundation and vision for your company.")}
            style={{
              padding: '16px 32px',
              borderRadius: '25px',
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(40, 167, 69, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            🎤 Test Elliot Response
          </button>

          <button
            onClick={() => speakWithElliotVoice("Perfect! I can see you're ready to take the next step. Let's create a solid foundation for your business success.")}
            style={{
              padding: '16px 32px',
              borderRadius: '25px',
              background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(255, 193, 7, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            🎤 Test Elliot Encouragement
          </button>
        </div>

        {/* Instructions */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          marginTop: '40px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>
            🎯 How to Test Elliot's Voice
          </h3>
          <ol style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
            <li>Click any of the test buttons above</li>
            <li>Listen for Elliot's voice response</li>
            <li>Check the browser console for voice details</li>
            <li>Verify it sounds like Elliot's voice</li>
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
            This page tests Elliot's voice using browser speech synthesis. You should hear Elliot-like voice responses.
          </p>
        </div>
      </div>
    </div>
  )
}

