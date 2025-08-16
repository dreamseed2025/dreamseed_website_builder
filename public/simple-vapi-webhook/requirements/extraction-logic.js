// DreamSeed Requirements Framework - AI Extraction Logic
const fs = require('fs');
const path = require('path');

class RequirementsExtractor {
    constructor() {
        this.loadPrompts();
        this.loadValidationRules();
    }
    
    loadPrompts() {
        const promptsDir = path.join(__dirname, 'prompts');
        this.prompts = {
            call1: fs.readFileSync(path.join(promptsDir, 'call-1-prompt.md'), 'utf8'),
            call2: fs.readFileSync(path.join(promptsDir, 'call-2-prompt.md'), 'utf8'),
            call3: fs.readFileSync(path.join(promptsDir, 'call-3-prompt.md'), 'utf8'),
            call4: fs.readFileSync(path.join(promptsDir, 'call-4-prompt.md'), 'utf8')
        };
    }
    
    loadValidationRules() {
        const rulesPath = path.join(__dirname, 'schemas', 'validation-rules.json');
        this.validationRules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
    }
    
    getCallSpecificPrompt(callStage, transcript, existingData = {}) {
        const promptKey = `call${callStage}`;
        if (!this.prompts[promptKey]) {
            throw new Error(`No prompt found for call stage ${callStage}`);
        }
        
        let prompt = this.prompts[promptKey];
        
        // Add existing data context if available
        if (Object.keys(existingData).length > 0) {
            prompt += `\n\nEXISTING CUSTOMER DATA:\n${JSON.stringify(existingData, null, 2)}\n\n`;
        }
        
        prompt += `\n\nTRANSCRIPT TO ANALYZE:\n${transcript}`;
        
        return prompt;
    }
    
    validateExtractedData(data, callStage) {
        const rules = this.validationRules.validation_rules;
        const requiredFields = rules.critical_fields[`call_${callStage}_required`] || [];
        
        const missing = [];
        const invalid = [];
        
        // Check required fields
        requiredFields.forEach(fieldPath => {
            if (!this.getNestedValue(data, fieldPath)) {
                missing.push(fieldPath);
            }
        });
        
        // Calculate completion score
        const totalPossibleFields = this.getTotalFieldsForCall(callStage);
        const completedFields = this.getCompletedFieldCount(data);
        const completionScore = Math.round((completedFields / totalPossibleFields) * 100);
        
        return {
            isValid: missing.length === 0,
            missing,
            invalid,
            completionScore,
            completedFields,
            totalPossibleFields
        };
    }
    
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    
    getTotalFieldsForCall(callStage) {
        const thresholds = this.validationRules.validation_rules.completion_thresholds;
        return thresholds[`call_${callStage}_minimum`] || 20;
    }
    
    getCompletedFieldCount(data) {
        return this.countNonEmptyFields(data);
    }
    
    countNonEmptyFields(obj, count = 0) {
        for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                count = this.countNonEmptyFields(obj[key], count);
            } else if (obj[key] && obj[key] !== '' && obj[key] !== null && obj[key] !== undefined) {
                count++;
            }
        }
        return count;
    }
    
    generateMissingInfoReport(data, callStage) {
        const validation = this.validateExtractedData(data, callStage);
        const suggestions = [];
        
        validation.missing.forEach(fieldPath => {
            const suggestion = this.getQuestionSuggestion(fieldPath, callStage);
            if (suggestion) {
                suggestions.push({
                    field: fieldPath,
                    question: suggestion,
                    priority: this.getFieldPriority(fieldPath)
                });
            }
        });
        
        return {
            completionScore: validation.completionScore,
            missingFields: validation.missing,
            nextQuestions: suggestions,
            readyForNextCall: validation.completionScore >= this.getCallThreshold(callStage)
        };
    }
    
    getQuestionSuggestion(fieldPath, callStage) {
        const questionMap = {
            'llc_filing.business_name': "What's the exact name you want for your business?",
            'llc_filing.state_of_formation': "What state do you want to file your LLC in?",
            'brand_identity.brand_personality': "How would you describe your brand personality?",
            'brand_identity.color_preferences': "What colors best represent your business?",
            'website_content.business_description': "Can you describe what your business does?",
            'launch_strategy.official_launch_date': "When do you want to officially launch?"
        };
        
        return questionMap[fieldPath] || `Please provide information about ${fieldPath}`;
    }
    
    getFieldPriority(fieldPath) {
        const criticalFields = [
            'llc_filing.business_name',
            'llc_filing.state_of_formation',
            'contact_info.email',
            'contact_info.phone'
        ];
        
        return criticalFields.includes(fieldPath) ? 'critical' : 'high';
    }
    
    getCallThreshold(callStage) {
        const thresholds = {
            1: 25,
            2: 50, 
            3: 75,
            4: 100
        };
        return thresholds[callStage] || 25;
    }
}

module.exports = RequirementsExtractor;
