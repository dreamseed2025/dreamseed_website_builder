import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class TranscriptIntelligencePredictor {
  constructor() {
    this.predictionQuestions = {
      industry_category: [
        "Based on this conversation, what industry do you think this business operates in?",
        "What sector or industry category best describes this business?",
        "Given the services and problems mentioned, what industry classification applies?"
      ],
      business_model: [
        "What business model is this entrepreneur describing?",
        "How does this business generate revenue?",
        "What type of business model (SaaS, E-commerce, Service, etc.) fits this description?"
      ],
      target_revenue: [
        "What revenue goals or targets are mentioned in this conversation?",
        "What financial targets or revenue expectations are discussed?",
        "What monthly or annual revenue goals are indicated?"
      ],
      business_stage: [
        "What stage of business development is this entrepreneur in?",
        "Is this a startup, growth, or established business?",
        "What business lifecycle stage best describes their current situation?"
      ],
      risk_tolerance: [
        "What level of risk tolerance does this entrepreneur demonstrate?",
        "How risk-averse or risk-seeking does this person appear?",
        "What risk appetite indicators are present in the conversation?"
      ],
      urgency_level: [
        "How urgent is this entrepreneur to get started?",
        "What timeline pressure or urgency is expressed?",
        "How quickly do they need to launch or move forward?"
      ],
      confidence_level: [
        "How confident does this entrepreneur appear about their business idea?",
        "What confidence level (1-10) would you assign based on their communication?",
        "How sure are they about their business concept and execution?"
      ],
      package_preference: [
        "What type of service package or support level do they seem to need?",
        "What level of assistance or service package would be most appropriate?",
        "Do they prefer DIY, guided, or full-service support?"
      ],
      budget_range: [
        "What budget range or financial constraints are mentioned?",
        "What price sensitivity or budget indicators are present?",
        "What budget category would this entrepreneur fall into?"
      ],
      timeline_preference: [
        "What timeline preferences or deadlines are discussed?",
        "How quickly do they want to move through the formation process?",
        "What timeline expectations are expressed for getting started?"
      ]
    };
  }

  async predictFieldFromTranscripts(userId, fieldName, existingData = {}) {
    try {
      console.log(`🤖 Predicting ${fieldName} for user ${userId}...`);

      // 1. Get user's transcript vectors
      const transcripts = await this.getUserTranscripts(userId);
      if (!transcripts || transcripts.length === 0) {
        console.log('❌ No transcripts found for prediction');
        return null;
      }

      // 2. Get existing Dream DNA data for context
      const dreamDNA = await this.getDreamDNAContext(userId);

      // 3. Generate prediction using AI
      const prediction = await this.generateAIPrediction(
        fieldName, 
        transcripts, 
        dreamDNA, 
        existingData
      );

      // 4. Save prediction to probability table
      if (prediction) {
        await this.savePrediction(userId, fieldName, prediction);
        console.log(`✅ Predicted ${fieldName}: ${prediction.value} (confidence: ${prediction.confidence})`);
      }

      return prediction;

    } catch (error) {
      console.error(`❌ Error predicting ${fieldName}:`, error);
      return null;
    }
  }

  async getUserTranscripts(userId) {
    try {
      // Try new vectorized transcripts table first
      let { data: transcripts, error } = await supabase
        .from('transcripts_vectorized')
        .select(`
          id,
          content_summary,
          key_topics,
          business_insights,
          sentiment_score,
          vector_embedding,
          processing_metadata,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error || !transcripts || transcripts.length === 0) {
        // Fallback to legacy call_transcripts table
        const { data: legacyTranscripts, error: legacyError } = await supabase
          .from('call_transcripts')
          .select(`
            id,
            full_transcript,
            semantic_summary,
            extracted_data,
            full_transcript_vector,
            semantic_summary_vector,
            created_at
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (legacyError || !legacyTranscripts) {
          console.log('❌ No transcripts found in either table');
          return [];
        }

        // Transform legacy format to match expected structure
        transcripts = legacyTranscripts.map(t => ({
          id: t.id,
          content_summary: t.semantic_summary,
          key_topics: [],
          business_insights: [],
          sentiment_score: 0.5,
          vector_embedding: t.full_transcript_vector,
          processing_metadata: { extracted_data: t.extracted_data },
          created_at: t.created_at
        }));
      }

      return transcripts;

    } catch (error) {
      console.error('❌ Error fetching transcripts:', error);
      return [];
    }
  }

  async getDreamDNAContext(userId) {
    try {
      const { data: dreamDNA, error } = await supabase
        .from('dream_dna_truth')
        .select('*')
        .eq('user_id', userId)
        .single();

      return dreamDNA || {};
    } catch (error) {
      console.log('⚠️ No existing Dream DNA context found');
      return {};
    }
  }

  async generateAIPrediction(fieldName, transcripts, dreamDNA, existingData) {
    try {
      const questions = this.predictionQuestions[fieldName];
      if (!questions) {
        console.log(`❌ No prediction questions defined for field: ${fieldName}`);
        return null;
      }

      // Build context from transcripts and existing data
      const context = this.buildPredictionContext(transcripts, dreamDNA, existingData);
      
      // Select the most appropriate question for this field
      const question = questions[0]; // Could be randomized or selected based on context

      const prompt = `
You are an expert business analyst specializing in extracting insights from entrepreneur conversations.

CONTEXT:
${context}

EXISTING BUSINESS DATA:
${this.formatDreamDNAForPrompt(dreamDNA)}

TASK:
${question}

Please provide:
1. A clear, specific answer based on the conversation context
2. A confidence score from 0.0 to 1.0 (where 1.0 is very confident)
3. Brief reasoning for your prediction

Respond in JSON format:
{
  "value": "your prediction",
  "confidence": 0.85,
  "reasoning": "brief explanation"
}
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      return {
        value: result.value,
        confidence: parseFloat(result.confidence),
        reasoning: result.reasoning,
        source: 'transcript_analysis',
        field_name: fieldName
      };

    } catch (error) {
      console.error('❌ Error generating AI prediction:', error);
      return null;
    }
  }

  buildPredictionContext(transcripts, dreamDNA, existingData) {
    let context = 'CONVERSATION SUMMARY:\n';
    
    // Add transcript summaries
    transcripts.forEach((transcript, index) => {
      context += `\nCall ${index + 1}:\n`;
      context += `Summary: ${transcript.content_summary}\n`;
      
      if (transcript.business_insights && transcript.business_insights.length > 0) {
        context += `Key Insights: ${transcript.business_insights.join(', ')}\n`;
      }
      
      if (transcript.key_topics && transcript.key_topics.length > 0) {
        context += `Topics: ${transcript.key_topics.join(', ')}\n`;
      }
      
      context += `Sentiment: ${transcript.sentiment_score > 0.5 ? 'Positive' : transcript.sentiment_score < 0.5 ? 'Negative' : 'Neutral'}\n`;
    });

    // Add existing data context
    if (Object.keys(existingData).length > 0) {
      context += '\nEXISTING DATA:\n';
      Object.entries(existingData).forEach(([key, value]) => {
        if (value) context += `${key}: ${value}\n`;
      });
    }

    return context;
  }

  formatDreamDNAForPrompt(dreamDNA) {
    if (!dreamDNA || Object.keys(dreamDNA).length === 0) {
      return 'No existing business data available.';
    }

    let formatted = '';
    const relevantFields = [
      'business_name', 'what_problem', 'who_serves', 'how_different', 
      'primary_service', 'target_revenue', 'business_model', 'industry_category'
    ];

    relevantFields.forEach(field => {
      if (dreamDNA[field]) {
        formatted += `${field}: ${dreamDNA[field]}\n`;
      }
    });

    return formatted || 'Limited existing business data available.';
  }

  async savePrediction(userId, fieldName, prediction) {
    try {
      // Get or create probability record
      let { data: probabilityRecord, error: fetchError } = await supabase
        .from('dream_dna_probability_truth')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError || !probabilityRecord) {
        // Create new probability record
        const { error: createError } = await supabase
          .from('dream_dna_probability_truth')
          .insert({
            user_id: userId,
            dream_type: 'business_formation',
            [`${fieldName}`]: prediction.value,
            [`${fieldName}_probability`]: prediction.confidence,
            extraction_source: 'transcript_analysis',
            created_at: new Date().toISOString()
          });

        if (createError) {
          console.error('❌ Error creating probability record:', createError);
        }
      } else {
        // Update existing probability record
        const updateData = {
          [`${fieldName}`]: prediction.value,
          [`${fieldName}_probability`]: prediction.confidence,
          extraction_source: 'transcript_analysis',
          updated_at: new Date().toISOString()
        };

        const { error: updateError } = await supabase
          .from('dream_dna_probability_truth')
          .update(updateData)
          .eq('user_id', userId);

        if (updateError) {
          console.error('❌ Error updating probability record:', updateError);
        }
      }

    } catch (error) {
      console.error('❌ Error saving prediction:', error);
    }
  }

  async predictAllMissingFields(userId) {
    try {
      console.log(`🚀 Starting comprehensive field prediction for user ${userId}...`);

      // Get current Dream DNA data to identify missing fields
      const { data: dreamDNA, error } = await supabase
        .from('dream_dna_truth')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !dreamDNA) {
        console.log('❌ No Dream DNA record found for user');
        return [];
      }

      // Identify fields that are empty or have low confidence
      const fieldsToPredict = Object.keys(this.predictionQuestions).filter(field => {
        const value = dreamDNA[field];
        const confidence = dreamDNA.confidence_score || 0;
        return !value || value.trim() === '' || confidence < 0.7;
      });

      console.log(`📊 Found ${fieldsToPredict.length} fields to predict:`, fieldsToPredict);

      // Predict each missing field
      const predictions = [];
      for (const field of fieldsToPredict) {
        const prediction = await this.predictFieldFromTranscripts(userId, field, dreamDNA);
        if (prediction) {
          predictions.push(prediction);
        }
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`✅ Completed predictions: ${predictions.length} fields predicted`);
      return predictions;

    } catch (error) {
      console.error('❌ Error in comprehensive prediction:', error);
      return [];
    }
  }

  async getPredictionAnalytics(userId) {
    try {
      const { data: predictions, error } = await supabase
        .from('dream_dna_probability_truth')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !predictions) {
        return null;
      }

      // Calculate analytics
      const analytics = {
        total_predictions: 0,
        high_confidence_predictions: 0,
        average_confidence: 0,
        field_coverage: {},
        prediction_sources: {}
      };

      const probabilityFields = Object.keys(predictions).filter(key => key.endsWith('_probability'));
      
      probabilityFields.forEach(field => {
        const baseField = field.replace('_probability', '');
        const confidence = predictions[field];
        const value = predictions[baseField];

        if (confidence && value) {
          analytics.total_predictions++;
          analytics.average_confidence += confidence;
          
          if (confidence >= 0.8) {
            analytics.high_confidence_predictions++;
          }

          analytics.field_coverage[baseField] = {
            value: value,
            confidence: confidence,
            source: predictions.extraction_source || 'unknown'
          };
        }
      });

      if (analytics.total_predictions > 0) {
        analytics.average_confidence /= analytics.total_predictions;
      }

      return analytics;

    } catch (error) {
      console.error('❌ Error getting prediction analytics:', error);
      return null;
    }
  }
}

export default TranscriptIntelligencePredictor;
