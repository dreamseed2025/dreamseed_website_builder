import { NextRequest, NextResponse } from 'next/server'

// This is a testing endpoint to simulate different user contexts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const step = parseInt(searchParams.get('step') || '1')
  const businessType = searchParams.get('type') || 'new'
  const businessName = searchParams.get('name') || 'Test Business'

  const testContext = {
    user_id: 'test-user',
    current_step: Math.min(Math.max(step, 1), 4), // Ensure step is 1-4
    business_type: businessType,
    business_name: businessName,
    completed_calls: step - 1,
    dream_dna_data: {
      what_problem: getTestProblem(businessType, step),
      who_serves: getTestAudience(businessType, step),
      stage: getTestStage(step)
    },
    next_recommended_action: getTestAction(step)
  }

  return NextResponse.json(testContext)
}

function getTestProblem(type: string, step: number): string {
  const problems = {
    new: [
      'Exploring new business opportunities and market gaps',
      'Defining the core problem my business will solve',
      'Validating business concept and market demand',
      'Preparing to launch with proper legal structure'
    ],
    existing: [
      'Optimizing current business operations and growth',
      'Expanding market reach and customer base', 
      'Formalizing business structure and compliance',
      'Scaling operations for sustainable growth'
    ]
  }
  return problems[type as keyof typeof problems]?.[step - 1] || 'Business development'
}

function getTestAudience(type: string, step: number): string {
  return type === 'new' 
    ? 'Potential customers in an untapped market segment'
    : 'Current customers with potential for expansion'
}

function getTestStage(step: number): string {
  const stages = ['ideation', 'planning', 'structuring', 'launching']
  return stages[step - 1] || 'development'
}

function getTestAction(step: number): string {
  const actions = [
    'Define your business concept and problem statement',
    'Identify target market and value proposition', 
    'Choose business structure and formation requirements',
    'Finalize legal documents and launch your business'
  ]
  return actions[step - 1] || 'Continue business development'
}