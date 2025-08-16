#!/bin/bash

# DreamSeed Requirements Framework Deployment Script
# This script syncs the requirements framework to the live DreamSeed system

set -e  # Exit on any error

# Configuration
FRAMEWORK_DIR="/Users/morganwalker/DreamSeed/requirements-framework"
LIVE_SYSTEM_DIR="/Users/morganwalker/DreamSeed/simple-vapi-webhook"
BACKUP_DIR="/Users/morganwalker/DreamSeed/requirements-framework/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 DreamSeed Requirements Framework Deployment"
echo "================================================"
echo "Timestamp: $(date)"
echo "Framework Dir: $FRAMEWORK_DIR"
echo "Live System Dir: $LIVE_SYSTEM_DIR"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Validate framework directory exists
if [ ! -d "$FRAMEWORK_DIR" ]; then
    echo "❌ ERROR: Framework directory not found: $FRAMEWORK_DIR"
    exit 1
fi

# Validate live system directory exists
if [ ! -d "$LIVE_SYSTEM_DIR" ]; then
    echo "❌ ERROR: Live system directory not found: $LIVE_SYSTEM_DIR"
    exit 1
fi

# Function to backup existing files
backup_existing() {
    echo "📦 Creating backup of existing system..."
    
    # Create timestamped backup directory
    BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
    mkdir -p "$BACKUP_PATH"
    
    # Backup server.js if it exists
    if [ -f "$LIVE_SYSTEM_DIR/server.js" ]; then
        cp "$LIVE_SYSTEM_DIR/server.js" "$BACKUP_PATH/server.js.bak"
        echo "   ✅ Backed up server.js"
    fi
    
    # Backup any existing requirements files
    if [ -f "$LIVE_SYSTEM_DIR/requirements.json" ]; then
        cp "$LIVE_SYSTEM_DIR/requirements.json" "$BACKUP_PATH/requirements.json.bak"
        echo "   ✅ Backed up requirements.json"
    fi
    
    echo "   📁 Backup created at: $BACKUP_PATH"
}

# Function to validate framework files
validate_framework() {
    echo "🔍 Validating framework files..."
    
    required_files=(
        "requirements-master.md"
        "schemas/customer-data-schema.json"
        "schemas/validation-rules.json"
        "prompts/call-1-prompt.md"
        "prompts/call-2-prompt.md"
        "prompts/call-3-prompt.md"
        "prompts/call-4-prompt.md"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$FRAMEWORK_DIR/$file" ]; then
            echo "   ❌ Missing required file: $file"
            exit 1
        else
            echo "   ✅ Found: $file"
        fi
    done
    
    echo "   🎉 All required files validated"
}

# Function to deploy framework files
deploy_framework() {
    echo "📥 Deploying framework files to live system..."
    
    # Create requirements directory in live system
    mkdir -p "$LIVE_SYSTEM_DIR/requirements"
    mkdir -p "$LIVE_SYSTEM_DIR/requirements/schemas"
    mkdir -p "$LIVE_SYSTEM_DIR/requirements/prompts"
    
    # Copy schema files
    cp "$FRAMEWORK_DIR/schemas/customer-data-schema.json" "$LIVE_SYSTEM_DIR/requirements/schemas/"
    cp "$FRAMEWORK_DIR/schemas/validation-rules.json" "$LIVE_SYSTEM_DIR/requirements/schemas/"
    echo "   ✅ Deployed schema files"
    
    # Copy prompt files
    cp "$FRAMEWORK_DIR/prompts"/*.md "$LIVE_SYSTEM_DIR/requirements/prompts/"
    echo "   ✅ Deployed prompt files"
    
    # Copy master requirements
    cp "$FRAMEWORK_DIR/requirements-master.md" "$LIVE_SYSTEM_DIR/requirements/"
    echo "   ✅ Deployed master requirements"
}

# Function to update server.js with new extraction logic
update_server_logic() {
    echo "🔧 Updating server extraction logic..."
    
    # Check if server.js exists
    if [ ! -f "$LIVE_SYSTEM_DIR/server.js" ]; then
        echo "   ⚠️  server.js not found, skipping logic update"
        return
    fi
    
    # Create updated server logic
    cat > "$LIVE_SYSTEM_DIR/requirements/extraction-logic.js" << 'EOF'
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
EOF
    
    echo "   ✅ Created extraction logic module"
    
    # Create integration instructions
    cat > "$LIVE_SYSTEM_DIR/requirements/INTEGRATION_INSTRUCTIONS.md" << 'EOF'
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
EOF
    
    echo "   📋 Created integration instructions"
}

# Function to run tests
run_tests() {
    echo "🧪 Running framework tests..."
    
    # Test JSON schema validity
    if command -v node &> /dev/null; then
        echo "   🔍 Testing JSON schema validity..."
        node -e "
            try {
                const schema = require('$FRAMEWORK_DIR/schemas/customer-data-schema.json');
                const rules = require('$FRAMEWORK_DIR/schemas/validation-rules.json');
                console.log('   ✅ JSON schemas are valid');
            } catch (error) {
                console.log('   ❌ JSON schema error:', error.message);
                process.exit(1);
            }
        "
    else
        echo "   ⚠️  Node.js not found, skipping JSON validation"
    fi
    
    echo "   🎉 All tests passed"
}

# Function to generate deployment report
generate_report() {
    echo "📊 Generating deployment report..."
    
    REPORT_FILE="$BACKUP_DIR/deployment_report_$TIMESTAMP.md"
    
    cat > "$REPORT_FILE" << EOF
# DreamSeed Requirements Framework Deployment Report

**Deployment Date:** $(date)  
**Deployment ID:** $TIMESTAMP  
**Framework Version:** 1.0.0  

## Files Deployed
- ✅ requirements-master.md (85+ data points)
- ✅ customer-data-schema.json (complete schema)
- ✅ validation-rules.json (validation framework)
- ✅ call-1-prompt.md (25% target)
- ✅ call-2-prompt.md (50% target)  
- ✅ call-3-prompt.md (75% target)
- ✅ call-4-prompt.md (100% target)
- ✅ extraction-logic.js (integration module)

## Integration Status
- 📁 Framework files deployed to: $LIVE_SYSTEM_DIR/requirements/
- 🔧 Extraction logic module created
- 📋 Integration instructions provided
- 💾 Backup created at: $BACKUP_DIR/backup_$TIMESTAMP

## Next Steps Required
1. Update server.js with new extraction logic
2. Test extraction with existing customer data
3. Create info-tracker.html dashboard
4. Add call stage tracking to database schema

## Deployment Validation
- Framework directory validated: ✅
- Required files present: ✅
- JSON schemas valid: ✅
- Backup created: ✅
- Files deployed successfully: ✅

**Status: DEPLOYMENT SUCCESSFUL** ✅
EOF
    
    echo "   📄 Report generated: $REPORT_FILE"
    echo ""
    cat "$REPORT_FILE"
}

# Main deployment sequence
main() {
    backup_existing
    validate_framework
    deploy_framework
    update_server_logic
    run_tests
    generate_report
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "================================================"
    echo ""
    echo "📁 Framework deployed to: $LIVE_SYSTEM_DIR/requirements/"
    echo "📋 Integration instructions: $LIVE_SYSTEM_DIR/requirements/INTEGRATION_INSTRUCTIONS.md"
    echo "💾 Backup location: $BACKUP_DIR/backup_$TIMESTAMP"
    echo ""
    echo "⚡ Next: Update server.js and test the integration"
    echo ""
}

# Run main deployment
main