const fs = require('fs');
const path = require('path');

// Sample Elliot responses for business formation
const sampleResponses = [
  "Hello! I'm Elliot, your business formation assistant. I'm here to help you build your dream business. What type of business are you thinking about starting?",
  
  "That's a great business idea! Let me help you get started. First, let's talk about your business structure. Are you thinking of an LLC, corporation, or something else?",
  
  "Perfect! I can see you're ready to take the next step. Let's create a solid foundation for your business. What's your target market and who are your ideal customers?"
];

async function generateAudioFiles() {
  console.log('🎤 Generating test audio files for Elliot voice...');
  
  const elevenLabsApiKey = 'sk_8aa436f225da48e207896bf81a6ab472f4224454c0babe2f';
  const voiceId = 'VR6AewLTigWG4xSOukaG'; // Josh voice (sounds like Elliot)
  
  // Ensure directory exists
  const audioDir = path.join(__dirname, 'public', 'audio-samples');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }
  
  for (let i = 0; i < sampleResponses.length; i++) {
    const response = sampleResponses[i];
    const filename = `elliot-response-${i + 1}.mp3`;
    const filepath = path.join(audioDir, filename);
    
    try {
      console.log(`📝 Generating: ${filename}`);
      
      // Call 11labs API
      const apiResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey
        },
        body: JSON.stringify({
          text: response,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });
      
      if (!apiResponse.ok) {
        throw new Error(`11labs API error: ${apiResponse.status}`);
      }
      
      // Save the audio file
      const audioBuffer = await apiResponse.arrayBuffer();
      fs.writeFileSync(filepath, Buffer.from(audioBuffer));
      
      console.log(`✅ Generated: ${filename}`);
      
    } catch (error) {
      console.error(`❌ Failed to generate ${filename}:`, error.message);
    }
  }
  
  console.log('🎉 Audio generation complete!');
  console.log('📁 Files saved in: public/audio-samples/');
}

// Run the generation
generateAudioFiles().catch(console.error);

