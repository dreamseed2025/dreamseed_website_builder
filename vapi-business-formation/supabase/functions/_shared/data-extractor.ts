interface ExtractionPrompts {
  [key: number]: string
}

export class DataExtractor {
  private openaiApiKey: string
  private extractionPrompts: ExtractionPrompts

  constructor() {
    this.openaiApiKey = Deno.env.get('OPENAI_API_KEY') ?? ''
    this.extractionPrompts = {
      1: `Extract the following information from this business concept conversation transcript:
         - Customer name (if mentioned)
         - Customer email (if mentioned) 
         - Customer phone (if mentioned)
         - Business idea/concept
         - Target market
         - Revenue model
         - Funding needs (if mentioned)
         - State of operation (if mentioned)
         
         Return as JSON with keys: name, email, phone, business_idea, target_market, revenue_model, funding_needs, state_of_operation`,

      2: `Extract the following information from this legal formation conversation transcript:
         - Preferred business structure (LLC, Corporation, etc.)
         - State preferences for formation
         - Trademark needs (true/false)
         - Compliance requirements
         - Business name (if finalized)
         - Industry/business type
         
         Return as JSON with keys: preferred_business_structure, state_preferences, trademark_needs, compliance_requirements, business_name, industry`,

      3: `Extract the following information from this banking and operations conversation transcript:
         - Banking preferences
         - Payment processing needs
         - Accounting software preference
         - Operational requirements
         - Estimated revenue/deal size
         
         Return as JSON with keys: banking_preferences, payment_processing_needs, accounting_software_preference, operational_requirements, estimated_revenue`,

      4: `Extract the following information from this website and marketing conversation transcript:
         - Website requirements
         - Branding preferences  
         - Marketing goals
         - Domain preferences
         - Package selection (Launch Basic, Launch Pro, Launch Complete)
         
         Return as JSON with keys: website_requirements, branding_preferences, marketing_goals, domain_preferences, package_selected`
    }
  }

  async extractDataFromTranscript(transcript: string, callNumber: number): Promise<any> {
    if (!this.openaiApiKey) {
      console.warn('OpenAI API key not provided, skipping data extraction')
      return {}
    }

    try {
      const prompt = this.extractionPrompts[callNumber]
      if (!prompt) {
        throw new Error(`No extraction prompt defined for call ${callNumber}`)
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a data extraction expert. Extract structured information from conversation transcripts and return only valid JSON. If information is not mentioned or unclear, use null for that field.'
            },
            {
              role: 'user',
              content: `${prompt}\n\nTranscript:\n${transcript}`
            }
          ],
          temperature: 0.1,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const result = await response.json()
      const extractedText = result.choices[0]?.message?.content

      if (!extractedText) {
        throw new Error('No response from OpenAI')
      }

      // Parse the JSON response
      const extractedData = JSON.parse(extractedText)
      
      // Clean up the data
      return this.cleanExtractedData(extractedData, callNumber)

    } catch (error) {
      console.error(`Error extracting data from call ${callNumber}:`, error)
      return {}
    }
  }

  private cleanExtractedData(data: any, callNumber: number): any {
    const cleaned: any = {}

    // Common fields
    if (data.name) cleaned.name = String(data.name).trim()
    if (data.email) cleaned.email = String(data.email).toLowerCase().trim()
    if (data.phone) cleaned.phone = String(data.phone).trim()

    // Call-specific fields
    switch (callNumber) {
      case 1:
        if (data.business_idea) cleaned.business_idea = String(data.business_idea).trim()
        if (data.target_market) cleaned.target_market = String(data.target_market).trim()
        if (data.revenue_model) cleaned.revenue_model = String(data.revenue_model).trim()
        if (data.funding_needs) cleaned.funding_needs = this.parseNumber(data.funding_needs)
        if (data.state_of_operation) cleaned.state_of_operation = String(data.state_of_operation).trim()
        break

      case 2:
        if (data.preferred_business_structure) cleaned.preferred_business_structure = String(data.preferred_business_structure).trim()
        if (data.state_preferences) cleaned.state_preferences = String(data.state_preferences).trim()
        if (data.trademark_needs !== undefined) cleaned.trademark_needs = Boolean(data.trademark_needs)
        if (data.compliance_requirements) cleaned.compliance_requirements = String(data.compliance_requirements).trim()
        if (data.business_name) cleaned.business_name = String(data.business_name).trim()
        if (data.industry) cleaned.industry = String(data.industry).trim()
        break

      case 3:
        if (data.banking_preferences) cleaned.banking_preferences = String(data.banking_preferences).trim()
        if (data.payment_processing_needs) cleaned.payment_processing_needs = String(data.payment_processing_needs).trim()
        if (data.accounting_software_preference) cleaned.accounting_software_preference = String(data.accounting_software_preference).trim()
        if (data.operational_requirements) cleaned.operational_requirements = String(data.operational_requirements).trim()
        if (data.estimated_revenue) cleaned.estimated_revenue = this.parseNumber(data.estimated_revenue)
        break

      case 4:
        if (data.website_requirements) cleaned.website_requirements = String(data.website_requirements).trim()
        if (data.branding_preferences) cleaned.branding_preferences = String(data.branding_preferences).trim()
        if (data.marketing_goals) cleaned.marketing_goals = String(data.marketing_goals).trim()
        if (data.domain_preferences) cleaned.domain_preferences = String(data.domain_preferences).trim()
        if (data.package_selected) cleaned.package_selected = String(data.package_selected).trim()
        break
    }

    return cleaned
  }

  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null
    
    const num = parseFloat(String(value).replace(/[,$]/g, ''))
    return isNaN(num) ? null : num
  }

  calculateSentimentScore(transcript: string): number {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['great', 'excellent', 'perfect', 'love', 'amazing', 'wonderful', 'fantastic', 'good', 'yes', 'absolutely', 'definitely', 'excited']
    const negativeWords = ['terrible', 'awful', 'hate', 'bad', 'horrible', 'no', 'never', 'worried', 'concerned', 'difficult', 'problem']
    
    const words = transcript.toLowerCase().split(/\s+/)
    let score = 0
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1
      if (negativeWords.includes(word)) score -= 1
    })
    
    // Normalize to -1 to 1 range
    const maxWords = words.length
    return maxWords > 0 ? Math.max(-1, Math.min(1, score / maxWords * 10)) : 0
  }

  calculateConfidenceScore(extractedData: any): number {
    // Calculate confidence based on how much data was extracted
    const totalFields = Object.keys(extractedData).length
    const filledFields = Object.values(extractedData).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length
    
    return totalFields > 0 ? filledFields / totalFields : 0
  }
}