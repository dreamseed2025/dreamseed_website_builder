import { NextRequest, NextResponse } from 'next/server';
import TranscriptIntelligencePredictor from '../../../transcript-intelligence-predictor.js';

const predictor = new TranscriptIntelligencePredictor();

export async function POST(request: NextRequest) {
  try {
    const { userId, fieldName, predictAll = false } = await request.json();

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    console.log(`🎯 Transcript prediction request for user ${userId}`);

    if (predictAll) {
      // Predict all missing fields
      const predictions = await predictor.predictAllMissingFields(userId);
      
      return NextResponse.json({
        success: true,
        predictions: predictions,
        total_predicted: predictions.length,
        message: `Successfully predicted ${predictions.length} fields from transcript analysis`
      });

    } else if (fieldName) {
      // Predict specific field
      const prediction = await predictor.predictFieldFromTranscripts(userId, fieldName);
      
      if (!prediction) {
        return NextResponse.json({ 
          error: `Could not predict ${fieldName} - no transcripts found or prediction failed` 
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        prediction: prediction,
        field_name: fieldName,
        message: `Successfully predicted ${fieldName} with ${prediction.confidence} confidence`
      });

    } else {
      return NextResponse.json({ 
        error: 'Either fieldName or predictAll must be specified' 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Transcript prediction API error:', error);
    return NextResponse.json({ 
      error: 'Transcript prediction failed',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Get prediction analytics
    const analytics = await predictor.getPredictionAnalytics(userId);
    
    if (!analytics) {
      return NextResponse.json({ 
        error: 'No prediction analytics found for user' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      analytics: analytics,
      message: 'Prediction analytics retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Prediction analytics API error:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve prediction analytics',
      details: error.message 
    }, { status: 500 });
  }
}
