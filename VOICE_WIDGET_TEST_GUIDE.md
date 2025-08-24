# 🎤 Voice Widget Test Guide

This guide covers all the testing options for the Voice Widget system, from automated tests to manual testing procedures.

## 📋 Test Overview

The Voice Widget system includes comprehensive testing for:
- ✅ **Server Health & Connectivity**
- ✅ **API Endpoints** (OpenAI, Whisper, VAPI)
- ✅ **Environment Variables**
- ✅ **Browser Capabilities**
- ✅ **Voice Functionality** (Speech Recognition, Synthesis, Recording)
- ✅ **Error Handling**
- ✅ **Performance & Concurrency**

## 🚀 Quick Start Testing

### Option 1: Automated Node.js Tests (Recommended)
```bash
# Run comprehensive automated tests
npm test

# Or directly
node test-voice-widget.js
```

### Option 2: Browser-Based Tests
```bash
# Open the browser test suite
open voice-widget-browser-test.html
# Or manually open: voice-widget-browser-test.html in your browser
```

### Option 3: Manual Testing
```bash
# Start the development server
npm run dev

# Visit the voice widget demo
open http://localhost:3000/voice-widget-demo
```

## 📊 Test Categories

### 1. 🔍 Environment & Browser Tests
**Tests:** Browser capabilities, security context, microphone permissions
- ✅ Web Audio API support
- ✅ MediaRecorder support
- ✅ Speech Recognition support
- ✅ Speech Synthesis support
- ✅ getUserMedia support
- ✅ Secure context (HTTPS/localhost)
- ✅ Microphone access permissions

### 2. 🌐 API Connectivity Tests
**Tests:** Server connectivity and API endpoints
- ✅ Server reachability
- ✅ OpenAI Chat API functionality
- ✅ Whisper Transcription API
- ✅ VAPI Configuration API
- ✅ API response validation
- ✅ Error handling

### 3. 🎵 Voice Functionality Tests
**Tests:** Core voice interaction features
- ✅ Speech synthesis (text-to-speech)
- ✅ Speech recognition (speech-to-text)
- ✅ Audio recording capabilities
- ✅ Real-time audio processing
- ✅ Voice activity detection

### 4. 🔗 Integration Tests
**Tests:** End-to-end voice widget functionality
- ✅ Complete conversation flow
- ✅ Audio recording → Transcription → AI Response → Speech
- ✅ Dynamic system message generation
- ✅ User context handling
- ✅ Conversation history management

### 5. ⚡ Performance Tests
**Tests:** System performance and reliability
- ✅ Concurrent API requests
- ✅ Response time validation
- ✅ Memory usage optimization
- ✅ Error recovery

## 🛠️ Test Files

### `test-voice-widget.js`
**Type:** Node.js automated test suite
**Purpose:** Comprehensive server-side and API testing
**Features:**
- Automated HTTP requests to all endpoints
- Environment variable validation
- Error handling verification
- Performance benchmarking
- Detailed test reporting

**Usage:**
```bash
npm test
# or
node test-voice-widget.js
```

### `voice-widget-browser-test.html`
**Type:** Browser-based interactive test suite
**Purpose:** Client-side functionality testing
**Features:**
- Real browser environment testing
- Interactive voice testing
- Visual test results
- Live conversation testing
- Browser capability detection

**Usage:**
```bash
# Open in browser
open voice-widget-browser-test.html
```

## 🎯 Test Scenarios

### Basic Functionality Test
1. **Start Server:** `npm run dev`
2. **Run Tests:** `npm test`
3. **Expected Results:** All tests pass with 90%+ success rate

### Voice Interaction Test
1. **Open Browser Test:** `voice-widget-browser-test.html`
2. **Click "Start Listening"**
3. **Speak:** "Hello, can you help me with business formation?"
4. **Expected:** AI responds with voice and text

### API Endpoint Test
1. **Test OpenAI:** `curl -X POST http://localhost:3000/api/openai-chat -H "Content-Type: application/json" -d '{"message": "test", "systemMessage": "test"}'`
2. **Expected:** JSON response with AI-generated text

### Whisper Integration Test
1. **Record audio** using browser test
2. **Upload to Whisper API**
3. **Expected:** Audio transcribed to text

## 🔧 Troubleshooting Common Test Failures

### Server Not Running
```
❌ Server is running
   Details: connect ECONNREFUSED 127.0.0.1:3000
```
**Solution:** Start the server with `npm run dev`

### OpenAI API Key Issues
```
❌ OpenAI API key is configured
   Details: 401 Incorrect API key provided
```
**Solution:** Check `.env.local` file and verify API key

### Microphone Permission Denied
```
❌ Microphone access granted
   Details: Permission denied
```
**Solution:** Allow microphone access in browser settings

### Browser Compatibility Issues
```
❌ Browser supports Speech Recognition
   Details: Speech recognition not supported
```
**Solution:** Use Chrome, Edge, or Safari (Firefox has limited support)

### VAPI Configuration Missing
```
❌ VAPI configuration is available
   Details: VAPI not configured (optional)
```
**Solution:** This is optional - VAPI is not required for basic functionality

## 📈 Test Results Interpretation

### Success Rate Guidelines
- **90-100%:** Excellent - System ready for production
- **80-89%:** Good - Minor issues to address
- **70-79%:** Fair - Several issues need attention
- **Below 70%:** Poor - Major issues require immediate attention

### Critical Tests (Must Pass)
- ✅ Server is running
- ✅ OpenAI API key is configured
- ✅ OpenAI Chat API responds
- ✅ Browser supports Speech Recognition
- ✅ Microphone access granted

### Optional Tests (Nice to Have)
- ✅ VAPI configuration is available
- ✅ Speech synthesis works
- ✅ Audio recording supported
- ✅ Performance tests pass

## 🚀 Production Readiness Checklist

Before deploying to production, ensure:

### Infrastructure
- [ ] Server is stable and responsive
- [ ] All API endpoints return 200 status
- [ ] Environment variables are properly configured
- [ ] SSL/HTTPS is enabled (required for voice APIs)

### Functionality
- [ ] Voice recording works consistently
- [ ] Speech recognition accuracy is acceptable
- [ ] AI responses are relevant and helpful
- [ ] Error handling is graceful

### Performance
- [ ] Response times are under 3 seconds
- [ ] Concurrent users are supported
- [ ] Memory usage is stable
- [ ] No memory leaks detected

### Security
- [ ] API keys are secure and not exposed
- [ ] User data is properly handled
- [ ] HTTPS is enforced
- [ ] Input validation is in place

## 📝 Test Customization

### Adding Custom Tests
To add custom tests to `test-voice-widget.js`:

```javascript
async function testCustomFeature() {
  log('\n🔧 Testing Custom Feature...', 'blue');
  
  try {
    // Your test logic here
    const result = await yourTestFunction();
    logTest('Custom feature works', result.success, result.details);
  } catch (error) {
    logTest('Custom feature works', false, error.message);
  }
}

// Add to tests array
const tests = [
  // ... existing tests
  testCustomFeature
];
```

### Modifying Test Configuration
Edit `TEST_CONFIG` in test files:

```javascript
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000', // Change for different environments
  testUserId: 'your-test-user',
  testDreamId: 'your-test-dream',
  // Add custom configuration
};
```

## 🎯 Continuous Testing

### Automated Testing Setup
For continuous integration, add to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run Voice Widget Tests
  run: |
    npm install
    npm run dev &
    sleep 10
    npm test
```

### Scheduled Testing
Set up regular test runs to monitor system health:

```bash
# Daily health check
0 9 * * * cd /path/to/project && npm test > test-results.log 2>&1
```

## 📞 Support

If tests are failing or you need help:

1. **Check the logs** for detailed error messages
2. **Verify environment** variables are set correctly
3. **Test manually** using the browser test suite
4. **Review this guide** for troubleshooting steps

---

**Happy Testing! 🎤✨**

Your voice widget is ready to provide amazing AI-powered voice interactions!

