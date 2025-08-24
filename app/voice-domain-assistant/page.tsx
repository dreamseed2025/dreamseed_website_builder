'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'

interface VoiceSessionResult {
  domains?: Array<{
    domain: string
    available: boolean
    price?: string
  }>
  spokenResponse: string
  message: string
}

export default function VoiceDomainAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [lastResult, setLastResult] = useState<VoiceSessionResult | null>(null)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const router = useRouter()
  const recognitionRef = useRef<any>(null)
  const supabase = createSupabaseClient()

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile()
    
    // Check if user came from onboarding
    const urlParams = new URLSearchParams(window.location.search)
    const onboardingParam = urlParams.get('onboarding')
    
    if (onboardingParam === 'true') {
      setTranscript('Welcome! I\'m ready to help you find the perfect domain for your business.')
    } else if (onboardingParam === 'complete') {
      setTranscript('Perfect! Now that I know about your vision and business concept, let\'s find the ideal domain name that captures your dream.')
    }
  }, [])

  const loadUserProfile = async () => {
    try {
      const businessSetup = sessionStorage.getItem('businessSetup')
      
      // Try to load dream DNA from database if user is authenticated
      let dreamDNAData = null
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: dreamDNA } = await supabase
          .from('dream_dna')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('customer_email', session.user.email)
          .single()
        
        dreamDNAData = dreamDNA
        
        // Combine all data sources for comprehensive profile
        const profile = {
          customer_name: userData?.customer_name,
          business_name: businessSetup ? JSON.parse(businessSetup).businessName : userData?.business_name,
          business_type: businessSetup ? JSON.parse(businessSetup).businessType : userData?.business_type,
          dream_dna: {
            business_concept: dreamDNAData?.business_concept || (businessSetup ? JSON.parse(businessSetup).description : null),
            vision_statement: dreamDNAData?.vision_statement,
            target_customers: dreamDNAData?.target_customers || (businessSetup ? JSON.parse(businessSetup).targetCustomers : null),
            unique_value_prop: dreamDNAData?.unique_value_prop,
            passion_driver: dreamDNAData?.passion_driver
          }
        }
        
        setUserProfile(profile)
      } else if (businessSetup) {
        // Use business setup data if no authentication
        const businessData = JSON.parse(businessSetup)
        const profile = {
          business_name: businessData.businessName,
          business_type: businessData.businessType,
          dream_dna: {
            business_concept: businessData.description,
            industry: businessData.industry,
            target_customers: businessData.targetCustomers
          }
        }
        setUserProfile(profile)
      } else {
        // Fallback to mock profile for demo
        const mockProfile = {
          business_name: "TechStart Solutions",
          business_type: "Software Consulting",
          dream_dna: {
            business_concept: "AI-powered software consulting for SMBs"
          }
        }
        setUserProfile(mockProfile)
      }
    } catch (err) {
      console.log('Could not load user profile:', err)
    } finally {
      setProfileLoading(false)
    }
  }

  // Initialize speech recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser')
      return
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setError('')
        setTranscript('')
      }

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript
        setTranscript(transcript)
        setIsListening(false)
        
        // Process the voice input
        await processVoiceInput(transcript)
      }

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false)
        setError(`Speech recognition error: ${event.error}`)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.start()
    } catch (err) {
      setError('Failed to start speech recognition')
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const processVoiceInput = async (transcript: string) => {
    setIsProcessing(true)
    setError('')

    try {
      // Determine if this is a specific domain check or generation request
      const lowerTranscript = transcript.toLowerCase()
      let action = 'generate'
      let keywords = transcript

      // Check if user is asking to check a specific domain
      if (lowerTranscript.includes('.com') || lowerTranscript.includes('.net') || 
          lowerTranscript.includes('.org') || lowerTranscript.includes('.io') ||
          lowerTranscript.includes('check') && (lowerTranscript.includes('.') || lowerTranscript.includes('domain'))) {
        action = 'check'
        // Extract domain name from transcript
        const domainMatch = transcript.match(/([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i)
        if (domainMatch) {
          keywords = domainMatch[1]
        }
      }

      // Clean up keywords for generation
      if (action === 'generate') {
        keywords = transcript
          .replace(/find|domains?|for|available|website|check|generate|suggest|recommend/gi, '')
          .replace(/\b(a|an|the|my|our|some|new)\b/gi, '')
          .trim()
      }

      const response = await fetch('/api/voice-domain-checker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords,
          action,
          maxResults: 5,
          useProfile: true
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setLastResult(data)
        
        // Use speech synthesis to speak the response
        if ('speechSynthesis' in window && data.spokenResponse) {
          const utterance = new SpeechSynthesisUtterance(data.spokenResponse)
          utterance.rate = 0.9
          utterance.pitch = 1
          window.speechSynthesis.speak(utterance)
        }
      } else {
        setError(data.spokenResponse || 'Failed to process voice request')
      }
    } catch (err) {
      setError('Failed to process voice input')
      console.error('Voice processing error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextInput = async (keywords: string) => {
    if (!keywords.trim()) return
    
    setTranscript(keywords)
    await processVoiceInput(keywords)
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div className="header-top">
          <div>
            <h1>🎤 Voice Domain Assistant</h1>
            <p>Find domains using your voice - just say what you're looking for</p>
          </div>
          <button onClick={() => router.push('/customer-portal')} className="back-btn">
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Profile Information */}
      {userProfile && (
        <div className="profile-section">
          <h3>🎯 Personalized for You</h3>
          <div className="profile-info">
            {userProfile.business_name && (
              <span className="profile-tag">
                🏢 {userProfile.business_name}
              </span>
            )}
            {userProfile.business_type && (
              <span className="profile-tag">
                📊 {userProfile.business_type}
              </span>
            )}
            {userProfile.dream_dna?.business_concept && (
              <span className="profile-tag">
                💡 {userProfile.dream_dna.business_concept.length > 40 
                    ? userProfile.dream_dna.business_concept.substring(0, 40) + '...'
                    : userProfile.dream_dna.business_concept}
              </span>
            )}
          </div>
          <p className="profile-explanation">
            I'll use your business profile to suggest more relevant domains
          </p>
        </div>
      )}

      {/* Voice Interface */}
      <div className="voice-section">
        <div className="voice-controls">
          <div className="microphone-container">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`mic-button ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Processing...
                </>
              ) : isListening ? (
                <>
                  <div className="pulse-ring"></div>
                  🎤 Listening...
                </>
              ) : (
                <>
                  🎤 Start Speaking
                </>
              )}
            </button>
          </div>
          
          <div className="voice-tips">
            <h3>💡 Try saying:</h3>
            <ul>
              {userProfile ? (
                <>
                  {userProfile.business_name && (
                    <li>"Find domains for {userProfile.business_name}"</li>
                  )}
                  <li>"I need a website for my business"</li>
                  <li>"Generate domain options for me"</li>
                  <li>"Find available domains"</li>
                </>
              ) : (
                <>
                  <li>"Find domains for my fitness app"</li>
                  <li>"Check if mycompany.com is available"</li>
                  <li>"I need a domain for tech consulting"</li>
                  <li>"Generate domains for online bakery"</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Text Input Alternative */}
        <div className="text-alternative">
          <p>Or type your request:</p>
          <div className="text-input-box">
            <input
              type="text"
              placeholder="e.g., 'Find domains for my startup' or 'Check example.com'"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTextInput(e.currentTarget.value)
                  e.currentTarget.value = ''
                }
              }}
              className="text-input"
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement
                if (input.value) {
                  handleTextInput(input.value)
                  input.value = ''
                }
              }}
              className="text-submit-btn"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="transcript-section">
          <h3>🗣️ You said:</h3>
          <div className="transcript">"{transcript}"</div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-section">
          <div className="error-message">
            ❌ {error}
          </div>
        </div>
      )}

      {/* Results */}
      {lastResult && (
        <div className="results-section">
          <div className="assistant-response">
            <h3>🤖 Assistant Response:</h3>
            <div className="spoken-response">
              {lastResult.spokenResponse}
            </div>
          </div>

          {lastResult.domains && lastResult.domains.length > 0 && (
            <div className="domains-grid">
              <h3>📋 Domain Results:</h3>
              <div className="domains-list">
                {lastResult.domains.map((domain, index) => (
                  <div key={index} className={`domain-card ${domain.available ? 'available' : 'taken'}`}>
                    <div className="domain-name">{domain.domain}</div>
                    <div className="domain-status">
                      {domain.available ? (
                        <>
                          <span className="status-icon">✅</span>
                          <span className="status-text">Available</span>
                          {domain.price && <span className="price">{domain.price}</span>}
                        </>
                      ) : (
                        <>
                          <span className="status-icon">❌</span>
                          <span className="status-text">Taken</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Next Steps */}
          {lastResult && lastResult.domains && lastResult.domains.some(d => d.available) && (
            <div className="next-steps-section">
              <h3>🎯 Next Steps</h3>
              <div className="steps-grid">
                <div className="step-card">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Register Your Domain</h4>
                    <p>Choose your favorite domain and register it through a domain registrar like GoDaddy, Namecheap, or Google Domains.</p>
                  </div>
                </div>
                <div className="step-card">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Set Up Your Website</h4>
                    <p>Create your business website using platforms like WordPress, Squarespace, or hire our web development team.</p>
                  </div>
                </div>
                <div className="step-card">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Complete Business Formation</h4>
                    <p>File your business entity, get your EIN, and complete all legal requirements. We can help with this process.</p>
                    <button onClick={() => router.push('/customer-portal')} className="action-btn">
                      Continue Setup →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8f9fa;
          min-height: 100vh;
        }
        
        .header {
          background: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .header h1 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 32px;
          font-weight: 600;
        }
        
        .header p {
          margin: 0;
          color: #666;
          font-size: 18px;
        }
        
        .back-btn {
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #e9ecef;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          text-decoration: none;
        }
        
        .back-btn:hover {
          background: #e9ecef;
          border-color: #2563eb;
        }
        
        .profile-section {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 1px solid #0ea5e9;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .profile-section h3 {
          margin: 0 0 12px 0;
          color: #0c4a6e;
          font-size: 18px;
          font-weight: 600;
        }
        
        .profile-info {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .profile-tag {
          background: rgba(14, 165, 233, 0.1);
          color: #0369a1;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid rgba(14, 165, 233, 0.2);
        }
        
        .profile-explanation {
          margin: 0;
          color: #0369a1;
          font-size: 14px;
          font-style: italic;
        }
        
        .voice-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          text-align: center;
          color: white;
        }
        
        .voice-controls {
          margin-bottom: 30px;
        }
        
        .microphone-container {
          margin-bottom: 30px;
        }
        
        .mic-button {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 20px 30px;
          border-radius: 50px;
          font-size: 18px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 auto;
          position: relative;
          min-width: 200px;
          justify-content: center;
        }
        
        .mic-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }
        
        .mic-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .mic-button.listening {
          background: rgba(255, 255, 255, 0.3);
          border-color: #ff4757;
          animation: pulse-border 1.5s ease-in-out infinite;
        }
        
        .mic-button.processing {
          background: rgba(255, 255, 255, 0.2);
          border-color: #ffa726;
        }
        
        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid #ff4757;
          border-radius: 50px;
          animation: pulse-ring 1.5s ease-out infinite;
        }
        
        @keyframes pulse-border {
          0% { border-color: #ff4757; }
          50% { border-color: #ff6b7a; }
          100% { border-color: #ff4757; }
        }
        
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .voice-tips {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          backdrop-filter: blur(10px);
        }
        
        .voice-tips h3 {
          margin: 0 0 15px 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .voice-tips ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .voice-tips li {
          padding: 8px 0;
          font-size: 16px;
          opacity: 0.9;
        }
        
        .text-alternative {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          backdrop-filter: blur(10px);
        }
        
        .text-alternative p {
          margin: 0 0 15px 0;
          font-size: 16px;
          font-weight: 500;
        }
        
        .text-input-box {
          display: flex;
          gap: 12px;
        }
        
        .text-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 16px;
          backdrop-filter: blur(10px);
        }
        
        .text-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .text-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.6);
        }
        
        .text-submit-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s;
        }
        
        .text-submit-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
        }
        
        .transcript-section {
          background: #e3f2fd;
          border: 1px solid #2196f3;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .transcript-section h3 {
          margin: 0 0 12px 0;
          color: #1565c0;
          font-size: 18px;
        }
        
        .transcript {
          background: white;
          border-radius: 8px;
          padding: 16px;
          font-style: italic;
          color: #333;
          font-size: 16px;
        }
        
        .error-section {
          background: #ffebee;
          border: 1px solid #f44336;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .error-message {
          color: #c62828;
          font-size: 16px;
          font-weight: 500;
        }
        
        .results-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .assistant-response {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .assistant-response h3 {
          margin: 0 0 15px 0;
          color: #2563eb;
          font-size: 20px;
        }
        
        .spoken-response {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          font-size: 16px;
          line-height: 1.5;
          color: #333;
        }
        
        .domains-grid h3 {
          margin: 0 0 20px 0;
          color: #1a1a1a;
          font-size: 20px;
        }
        
        .domains-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }
        
        .domain-card {
          border-radius: 8px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.2s;
        }
        
        .domain-card:hover {
          transform: translateY(-2px);
        }
        
        .domain-card.available {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1px solid #16a34a;
        }
        
        .domain-card.taken {
          background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
          border: 1px solid #dc2626;
        }
        
        .domain-name {
          font-weight: 600;
          font-size: 16px;
          color: #1a1a1a;
        }
        
        .domain-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-icon {
          font-size: 18px;
        }
        
        .status-text {
          font-weight: 500;
          font-size: 14px;
        }
        
        .domain-card.available .status-text {
          color: #16a34a;
        }
        
        .domain-card.taken .status-text {
          color: #dc2626;
        }
        
        .price {
          font-size: 12px;
          background: rgba(22, 163, 74, 0.1);
          color: #16a34a;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 500;
        }
        
        .next-steps-section {
          margin-top: 30px;
          padding-top: 30px;
          border-top: 1px solid #e9ecef;
        }
        
        .next-steps-section h3 {
          margin: 0 0 20px 0;
          color: #1a1a1a;
          font-size: 20px;
        }
        
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        
        .step-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #dee2e6;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        
        .step-number {
          background: #2563eb;
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
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
        }
        
        .step-content p {
          margin: 0 0 12px 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .action-btn {
          background: #2563eb;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .action-btn:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }
        
        @media (max-width: 768px) {
          .header-top {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
          
          .voice-section {
            padding: 20px;
          }
          
          .text-input-box {
            flex-direction: column;
          }
          
          .domains-list {
            grid-template-columns: 1fr;
          }
          
          .domain-card {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
          
          .steps-grid {
            grid-template-columns: 1fr;
          }
          
          .step-card {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  )
}