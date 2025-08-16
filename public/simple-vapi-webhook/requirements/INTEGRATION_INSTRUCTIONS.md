# DreamSeed Requirements Framework Integration

## Quick Integration Steps

1. **Update server.js imports:**
```javascript
const RequirementsExtractor = require('./requirements/extraction-logic');
const extractor = new RequirementsExtractor();
```

2. **Replace analyzeTranscriptWithAI function:**
```javascript
async function analyzeTranscriptWithAI(transcript, existingData = {}, callStage = 1) {
    try {
        // Get call-specific prompt
        const prompt = extractor.getCallSpecificPrompt(callStage, transcript, existingData);
        
        // Call OpenAI with structured prompt
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3
        });
        
        // Parse and validate response
        const extractedData = JSON.parse(response.choices[0].message.content);
        const validation = extractor.validateExtractedData(extractedData, callStage);
        
        return {
            ...extractedData,
            validation: validation,
            missingInfo: extractor.generateMissingInfoReport(extractedData, callStage)
        };
    } catch (error) {
        console.error('Extraction error:', error);
        throw error;
    }
}
```

3. **Add new API endpoints:**
```javascript
// Get customer completeness info
app.get('/api/customer-completeness/:email', async (req, res) => {
    // Implementation using extractor.validateExtractedData()
});

// Get missing information report
app.get('/api/missing-info/:email', async (req, res) => {
    // Implementation using extractor.generateMissingInfoReport()
});

// Get next call questions
app.get('/api/next-questions/:email', async (req, res) => {
    // Implementation using missing info suggestions
});
```

4. **Test the integration:**
- Restart the server
- Test with existing customer data
- Verify extraction works with call-stage prompts
- Check API endpoints return expected data

## Files Deployed:
- requirements/schemas/customer-data-schema.json
- requirements/schemas/validation-rules.json  
- requirements/prompts/call-1-prompt.md
- requirements/prompts/call-2-prompt.md
- requirements/prompts/call-3-prompt.md
- requirements/prompts/call-4-prompt.md
- requirements/extraction-logic.js
- requirements/requirements-master.md

## Next Steps:
1. Update server.js with new extraction logic
2. Create info-tracker.html dashboard
3. Test with existing customer data
4. Add call stage tracking to database
