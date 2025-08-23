# 🎤 AI Voice Widget System

A comprehensive web widget that connects to AI voice agents with dynamic system messages, user interrupt handling, and OpenAI Whisper integration.

## ✨ Features

### 🎯 Dynamic System Messages
- Personalized AI responses based on user ID and dream ID
- Context-aware conversations that adapt to user profiles
- Business formation and domain expertise built-in

### 🎤 Voice Interrupt Handling
- Users can interrupt AI while it's speaking
- Seamless conversation flow with immediate response
- Natural conversation experience

### 🤖 Dual AI Support
- **VAPI Integration**: Professional voice AI platform
- **OpenAI Fallback**: GPT-4 powered conversations
- Automatic switching for optimal performance

### 🎵 OpenAI Whisper Integration
- High-quality speech-to-text transcription
- Real-time audio visualization
- Confidence scoring for transcriptions

### 📊 Conversation Management
- Full conversation history with timestamps
- Confidence scores for each message
- Conversation context preservation

### 📱 Responsive Design
- Works on desktop and mobile devices
- Modern, intuitive interface
- Minimizable widget interface

## 🚀 Quick Start

### 1. Environment Setup

Add these environment variables to your `.env.local`:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# VAPI Configuration (Optional)
VAPI_API_KEY=your_vapi_api_key_here
VAPI_PUBLIC_KEY=your_vapi_public_key_here
VAPI_ASSISTANT_ID=your_vapi_assistant_id_here

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key_here
```

### 2. Install Dependencies

```bash
npm install openai @supabase/supabase-js
```

### 3. Basic Usage

```tsx
import VoiceWidget from '@/components/VoiceWidget'

export default function MyPage() {
  return (
    <div>
      <h1>My App</h1>
      <VoiceWidget 
        userId="user-123"
        dreamId="dream-456"
        onConversationStart={() => console.log('Started')}
        onConversationEnd={() => console.log('Ended')}
      />
    </div>
  )
}
```

### 4. Enhanced Usage with Whisper

```tsx
import EnhancedVoiceWidget from '@/components/EnhancedVoiceWidget'

export default function MyPage() {
  return (
    <div>
      <h1>My App</h1>
      <EnhancedVoiceWidget 
        userId="user-123"
        dreamId="dream-456"
        useWhisper={true}
        onConversationStart={() => console.log('Started')}
        onConversationEnd={() => console.log('Ended')}
        onError={(error) => console.error('Error:', error)}
      />
    </div>
  )
}
```

## 📁 File Structure

```
app/
├── components/
│   ├── VoiceWidget.tsx              # Basic voice widget
│   └── EnhancedVoiceWidget.tsx      # Enhanced widget with Whisper
├── api/
│   ├── vapi-config/route.ts         # VAPI configuration endpoint
│   ├── vapi-chat/route.ts           # VAPI chat endpoint
│   ├── openai-chat/route.ts         # OpenAI chat endpoint
│   └── whisper-transcribe/route.ts  # Whisper transcription endpoint
└── voice-widget-demo/
    └── page.tsx                     # Demo page
```

## 🔧 API Endpoints

### `/api/vapi-config`
Returns VAPI configuration for the widget.

**Response:**
```json
{
  "publicKey": "vapi_public_key",
  "assistantId": "vapi_assistant_id",
  "configured": true
}
```

### `/api/vapi-chat`
Handles VAPI chat requests with dynamic system messages.

**Request:**
```json
{
  "message": "User input text",
  "systemMessage": "Dynamic system message",
  "userId": "user-123",
  "dreamId": "dream-456"
}
```

**Response:**
```json
{
  "response": "AI response text",
  "callId": "vapi_call_id",
  "success": true
}
```

### `/api/openai-chat`
Handles OpenAI chat requests with conversation context.

**Request:**
```json
{
  "message": "User input text",
  "systemMessage": "Dynamic system message",
  "userId": "user-123",
  "dreamId": "dream-456",
  "conversation": [
    {
      "role": "user",
      "content": "Previous message"
    }
  ]
}
```

**Response:**
```json
{
  "response": "AI response text",
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 50,
    "total_tokens": 150
  },
  "success": true
}
```

### `/api/whisper-transcribe`
Transcribes audio using OpenAI Whisper.

**Request:** FormData with audio file

**Response:**
```json
{
  "transcript": "Transcribed text",
  "success": true
}
```

## 🎨 Widget Components

### VoiceWidget Props

```typescript
interface VoiceWidgetProps {
  userId?: string                    // Unique user identifier
  dreamId?: string                   // Unique dream identifier
  className?: string                 // CSS class name
  onConversationStart?: () => void   // Callback when conversation starts
  onConversationEnd?: () => void     // Callback when conversation ends
  onError?: (error: string) => void  // Error callback
}
```

### EnhancedVoiceWidget Props

```typescript
interface EnhancedVoiceWidgetProps {
  userId?: string                    // Unique user identifier
  dreamId?: string                   // Unique dream identifier
  className?: string                 // CSS class name
  onConversationStart?: () => void   // Callback when conversation starts
  onConversationEnd?: () => void     // Callback when conversation ends
  onError?: (error: string) => void  // Error callback
  useWhisper?: boolean               // Enable OpenAI Whisper (default: true)
}
```

## 🔄 Dynamic System Messages

The widget automatically generates personalized system messages based on user context:

```typescript
const generateDynamicSystemMessage = () => {
  let systemMessage = `You are an AI voice assistant for DreamSeed, a business formation platform.`

  if (userProfile) {
    systemMessage += `\n\nUser Context:
- Name: ${userProfile.customer_name}
- Business: ${userProfile.business_name}
- Business Type: ${userProfile.business_type}
- Email: ${userProfile.customer_email}`
  }

  if (dreamId) {
    systemMessage += `\n- Dream ID: ${dreamId}`
  }

  systemMessage += `\n\nGuidelines:
- Be conversational and friendly
- Keep responses concise (1-2 sentences)
- Ask follow-up questions to understand their needs
- Provide actionable advice for business formation`

  return systemMessage
}
```

## 🎤 Voice Interrupt Handling

The widget supports interrupting the AI while it's speaking:

```typescript
const handleInterrupt = () => {
  // Stop current speech
  if (synthesisRef.current) {
    synthesisRef.current.cancel()
    setIsSpeaking(false)
  }

  // Stop listening if active
  if (isListening || isRecording) {
    stopListening()
  }

  // Start listening for new input
  setTimeout(() => {
    startListening()
  }, 100)
}
```

## 🎵 Audio Visualization

The enhanced widget includes real-time audio level visualization:

```typescript
const startAudioVisualization = async (stream: MediaStream) => {
  audioContextRef.current = new AudioContext()
  analyserRef.current = audioContextRef.current.createAnalyser()
  analyserRef.current.fftSize = 256

  microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)
  microphoneRef.current.connect(analyserRef.current)

  const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

  const updateAudioLevel = () => {
    if (analyserRef.current && isRecording) {
      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      setAudioLevel(average)
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
    }
  }

  updateAudioLevel()
}
```

## 🧪 Testing

### Demo Page
Visit `/voice-widget-demo` to test the widget with different configurations.

### Manual Testing
1. Open the demo page
2. Configure user ID and dream ID
3. Choose widget type (basic or enhanced)
4. Enable/disable Whisper
5. Click the voice widget and start speaking

### Example Conversations
- "I want to start an LLC for my consulting business"
- "Help me find a domain name for my tech startup"
- "What are the steps to register my business in California?"
- "What's the difference between an LLC and a corporation?"

## 🔧 Customization

### Styling
The widget uses styled-jsx for styling. You can customize the appearance by modifying the CSS in the component files.

### System Messages
Modify the `generateDynamicSystemMessage` function to customize AI behavior based on your needs.

### API Integration
Add your own API endpoints or modify existing ones to integrate with your backend services.

## 🚨 Error Handling

The widget includes comprehensive error handling:

- Speech recognition errors
- API call failures
- Audio recording issues
- Network connectivity problems

Errors are displayed to users and logged to the console for debugging.

## 📱 Browser Compatibility

### Supported Browsers
- Chrome 66+
- Firefox 60+
- Safari 14+
- Edge 79+

### Required Permissions
- Microphone access
- HTTPS (required for microphone access)

### Feature Detection
The widget automatically detects browser capabilities and falls back gracefully when features aren't available.

## 🔒 Security Considerations

- API keys are stored server-side only
- Audio data is processed securely
- User data is handled according to privacy policies
- HTTPS is required for microphone access

## 📈 Performance Optimization

- Audio chunks are processed efficiently
- Conversation history is limited to prevent memory issues
- API calls are debounced to prevent rate limiting
- Audio context is properly cleaned up

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Check the demo page at `/voice-widget-demo`
- Review the API documentation
- Check browser console for error messages
- Ensure all environment variables are set correctly

## 🔄 Updates

### Version 2.0.0
- Added OpenAI Whisper integration
- Enhanced audio visualization
- Improved error handling
- Added conversation confidence scoring
- Better mobile responsiveness

### Version 1.0.0
- Basic voice widget functionality
- VAPI integration
- Dynamic system messages
- User interrupt handling
