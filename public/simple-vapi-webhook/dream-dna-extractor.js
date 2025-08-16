// Dream DNA Extractor - Captures the essence of what people truly want

class DreamDNAExtractor {
    constructor() {
        this.dreamSchema = {
            // Core Identity
            identity: {
                name: null,
                email: null, 
                phone: null,
                location: null
            },
            
            // Dream Essence (The WHY)
            dreamEssence: {
                vision: null,           // "I want to..."
                purpose: null,          // "Because..."
                impact: null,           // "To help..."
                legacy: null,           // "So that..."
                passion: null,          // "I'm excited about..."
                problem: null,          // "I'm solving..."
                mission: null           // "My mission is..."
            },
            
            // Business DNA
            businessDNA: {
                concept: null,          // Core business idea
                industry: null,         // What industry
                model: null,            // How they make money
                customers: null,        // Who they serve
                uniqueness: null,       // What makes it special
                scalability: null,      // Growth potential
                timeline: null          // When they want to launch
            },
            
            // Practical Details
            execution: {
                structure: null,        // LLC, Corp, etc.
                state: null,            // Formation state
                funding: null,          // How much they need
                team: null,             // Solo or team
                experience: null,       // Previous business experience
                resources: null,        // What they already have
                challenges: null        // What they're worried about
            },
            
            // Success Vision
            successVision: {
                revenue: null,          // Financial goals
                lifestyle: null,        // How it changes their life
                freedom: null,          // What freedom looks like
                growth: null,           // How big they want to get
                exit: null,             // Long-term plans
                timeframe: null         // When they want this
            },
            
            // Package Fit
            packageDNA: {
                urgency: null,          // How fast they need to start
                support: null,          // How much help they want
                budget: null,           // What they can invest
                complexity: null,       // How complex their needs are
                confidence: null,       // How confident they are
                package: null           // Which package fits
            }
        };
    }

    // Extract Dream DNA from conversation transcript
    extractDreamDNA(transcript, callNumber) {
        const dreamDNA = JSON.parse(JSON.stringify(this.dreamSchema)); // Deep clone
        
        if (!transcript) return dreamDNA;
        
        const text = transcript.toLowerCase();
        
        // Extract based on call number
        switch(callNumber) {
            case 1:
                this.extractCall1DNA(text, dreamDNA);
                break;
            case 2:
                this.extractCall2DNA(text, dreamDNA);
                break;
            case 3:
                this.extractCall3DNA(text, dreamDNA);
                break;
            case 4:
                this.extractCall4DNA(text, dreamDNA);
                break;
        }
        
        return dreamDNA;
    }
    
    // Call 1: Dream Essence & Business Concept
    extractCall1DNA(text, dreamDNA) {
        // Identity
        dreamDNA.identity.name = this.extractPattern(text, [
            /my name is ([^.!?]+)/,
            /i'?m ([a-z]+ [a-z]+)/,
            /call me ([^.!?]+)/
        ]);
        
        dreamDNA.identity.email = this.extractPattern(text, [
            /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/
        ]);
        
        dreamDNA.identity.location = this.extractPattern(text, [
            /in ([a-z]+ ?[a-z]*)/,
            /from ([a-z]+ ?[a-z]*)/,
            /live in ([a-z]+ ?[a-z]*)/
        ]);
        
        // Dream Essence
        dreamDNA.dreamEssence.vision = this.extractPattern(text, [
            /i want to (.+?)(?:\.|because|and|so)/,
            /my dream is to (.+?)(?:\.|because|and|so)/,
            /i'm looking to (.+?)(?:\.|because|and|so)/
        ]);
        
        dreamDNA.dreamEssence.purpose = this.extractPattern(text, [
            /because (.+?)(?:\.|and|so)/,
            /the reason is (.+?)(?:\.|and|so)/,
            /i'm doing this because (.+?)(?:\.|and|so)/
        ]);
        
        dreamDNA.dreamEssence.problem = this.extractPattern(text, [
            /solving (.+?)(?:\.|and|so)/,
            /the problem is (.+?)(?:\.|and|so)/,
            /people need (.+?)(?:\.|and|so)/
        ]);
        
        dreamDNA.dreamEssence.passion = this.extractPattern(text, [
            /i'm passionate about (.+?)(?:\.|and|so)/,
            /i love (.+?)(?:\.|and|so)/,
            /excited about (.+?)(?:\.|and|so)/
        ]);
        
        // Business DNA
        dreamDNA.businessDNA.concept = this.extractPattern(text, [
            /start a (.+?)(?:\.|for|in|with)/,
            /business idea is (.+?)(?:\.|for|in|with)/,
            /want to create (.+?)(?:\.|for|in|with)/
        ]);
        
        dreamDNA.businessDNA.customers = this.extractPattern(text, [
            /for (.+?) who/,
            /target (.+?) market/,
            /serving (.+?)(?:\.|and|so)/,
            /customers are (.+?)(?:\.|and|so)/
        ]);
        
        dreamDNA.businessDNA.uniqueness = this.extractPattern(text, [
            /different because (.+?)(?:\.|and|so)/,
            /unique (.+?)(?:\.|and|so)/,
            /special about (.+?)(?:\.|and|so)/
        ]);
        
        // Success Vision
        dreamDNA.successVision.revenue = this.extractNumber(text, [
            /(\$?[0-9,]+) (?:per month|monthly|revenue|sales)/,
            /make (\$?[0-9,]+)/,
            /earn (\$?[0-9,]+)/
        ]);
        
        dreamDNA.execution.funding = this.extractNumber(text, [
            /need (\$?[0-9,]+)/,
            /looking for (\$?[0-9,]+)/,
            /(\$?[0-9,]+) to start/
        ]);
    }
    
    // Call 2: Structure & Legal DNA
    extractCall2DNA(text, dreamDNA) {
        dreamDNA.execution.structure = this.extractPattern(text, [
            /(llc|corporation|corp|partnership)/,
            /form (?:a|an) (.+?)(?:\.|in|for)/,
            /want (?:a|an) (.+?) structure/
        ]);
        
        dreamDNA.execution.state = this.extractPattern(text, [
            /in ([a-z]+ ?[a-z]*)/,
            /([a-z]+) state/,
            /incorporate in ([a-z]+ ?[a-z]*)/
        ]);
        
        dreamDNA.businessDNA.concept = this.extractPattern(text, [
            /call it (.+?)(?:\.|and|so)/,
            /name (?:it|is) (.+?)(?:\.|and|so)/,
            /business name (.+?)(?:\.|and|so)/
        ]);
        
        dreamDNA.execution.challenges = this.extractPattern(text, [
            /worried about (.+?)(?:\.|and|so)/,
            /concerned about (.+?)(?:\.|and|so)/,
            /challenge is (.+?)(?:\.|and|so)/
        ]);
    }
    
    // Call 3: Operations & Scaling DNA
    extractCall3DNA(text, dreamDNA) {
        dreamDNA.execution.resources = this.extractPattern(text, [
            /already have (.+?)(?:\.|and|so)/,
            /using (.+?) for/,
            /work with (.+?)(?:\.|and|so)/
        ]);
        
        dreamDNA.businessDNA.scalability = this.extractPattern(text, [
            /scale to (.+?)(?:\.|and|so)/,
            /grow to (.+?)(?:\.|and|so)/,
            /expand (.+?)(?:\.|and|so)/
        ]);
        
        dreamDNA.successVision.growth = this.extractPattern(text, [
            /eventually (.+?)(?:\.|and|so)/,
            /plan to (.+?)(?:\.|and|so)/,
            /future (.+?)(?:\.|and|so)/
        ]);
    }
    
    // Call 4: Vision & Package DNA
    extractCall4DNA(text, dreamDNA) {
        dreamDNA.packageDNA.package = this.extractPattern(text, [
            /(launch basic|launch pro|launch complete)/,
            /(basic|pro|complete) package/,
            /choose (?:the )?(.+?) package/
        ]);
        
        dreamDNA.packageDNA.urgency = this.extractPattern(text, [
            /need to start (.+?)(?:\.|and|so)/,
            /urgent because (.+?)(?:\.|and|so)/,
            /asap (.+?)(?:\.|and|so)/
        ]);
        
        dreamDNA.successVision.lifestyle = this.extractPattern(text, [
            /give me (.+?)(?:\.|and|so)/,
            /freedom to (.+?)(?:\.|and|so)/,
            /life where (.+?)(?:\.|and|so)/
        ]);
        
        dreamDNA.dreamEssence.legacy = this.extractPattern(text, [
            /so that (.+?)(?:\.|and|so)/,
            /legacy of (.+?)(?:\.|and|so)/,
            /remembered for (.+?)(?:\.|and|so)/
        ]);
    }
    
    // Helper function to extract patterns
    extractPattern(text, patterns) {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        return null;
    }
    
    // Helper function to extract numbers
    extractNumber(text, patterns) {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const num = match[1].replace(/[$,]/g, '');
                return parseFloat(num) || null;
            }
        }
        return null;
    }
    
    // Merge Dream DNA from multiple calls
    mergeDreamDNA(existingDNA, newDNA) {
        const merged = JSON.parse(JSON.stringify(existingDNA));
        
        // Deep merge - only overwrite if new value exists
        this.deepMerge(merged, newDNA);
        
        return merged;
    }
    
    deepMerge(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                this.deepMerge(target[key], source[key]);
            } else if (source[key] !== null && source[key] !== undefined) {
                target[key] = source[key];
            }
        }
    }
    
    // Analyze Dream DNA completeness
    analyzeDreamDNA(dreamDNA) {
        const analysis = {
            completeness: 0,
            strengths: [],
            gaps: [],
            recommendations: [],
            packageFit: null,
            readiness: null
        };
        
        let totalFields = 0;
        let filledFields = 0;
        
        // Count filled fields
        this.countFields(dreamDNA, totalFields, filledFields);
        
        analysis.completeness = Math.round((filledFields / totalFields) * 100);
        
        // Analyze strengths
        if (dreamDNA.dreamEssence.vision) analysis.strengths.push("Clear vision");
        if (dreamDNA.dreamEssence.purpose) analysis.strengths.push("Strong purpose");
        if (dreamDNA.businessDNA.customers) analysis.strengths.push("Defined target market");
        if (dreamDNA.successVision.revenue) analysis.strengths.push("Financial clarity");
        
        // Identify gaps
        if (!dreamDNA.dreamEssence.vision) analysis.gaps.push("Vision needs clarification");
        if (!dreamDNA.businessDNA.customers) analysis.gaps.push("Target market unclear");
        if (!dreamDNA.execution.funding) analysis.gaps.push("Funding requirements undefined");
        
        // Package recommendations
        if (dreamDNA.packageDNA.urgency || dreamDNA.successVision.revenue > 100000) {
            analysis.packageFit = "Launch Complete";
        } else if (dreamDNA.businessDNA.scalability || dreamDNA.execution.experience) {
            analysis.packageFit = "Launch Pro";
        } else {
            analysis.packageFit = "Launch Basic";
        }
        
        // Readiness assessment
        if (analysis.completeness > 80) analysis.readiness = "Ready to launch";
        else if (analysis.completeness > 60) analysis.readiness = "Almost ready";
        else analysis.readiness = "Needs more discovery";
        
        return analysis;
    }
    
    countFields(obj, total, filled) {
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                this.countFields(obj[key], total, filled);
            } else {
                total++;
                if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
                    filled++;
                }
            }
        }
        return { total, filled };
    }
}

module.exports = DreamDNAExtractor;