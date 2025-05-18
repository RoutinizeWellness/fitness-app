import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { 
  generatePersonalizedRecommendations, 
  generateWorkoutPlan, 
  analyzeUserProgress, 
  askAIAssistant 
} from '@/lib/ai-service'
import { AIQuery, AIWorkoutPlan } from '@/lib/ai-types'

/**
 * GET handler for AI data
 * @param request - The request object
 * @returns - The response object
 */
export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get the request type from the URL
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    // Handle different request types
    switch (type) {
      case 'recommendations':
        // Get personalized recommendations
        try {
          const recommendations = await generatePersonalizedRecommendations(user.id)
          return NextResponse.json({ data: recommendations })
        } catch (error) {
          console.error('Error generating recommendations:', error)
          return NextResponse.json(
            { error: 'Failed to generate recommendations' },
            { status: 500 }
          )
        }
        
      case 'progress':
        // Get progress analysis
        const period = searchParams.get('period') as 'week' | 'month' | '3months' || 'month'
        
        try {
          const analysis = await analyzeUserProgress(user.id, period)
          return NextResponse.json({ data: analysis })
        } catch (error) {
          console.error('Error analyzing progress:', error)
          return NextResponse.json(
            { error: 'Failed to analyze progress' },
            { status: 500 }
          )
        }
        
      case 'plans':
        // Get saved workout plans
        try {
          const { data: plans, error } = await supabase
            .from('ai_workout_plans')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            
          if (error) throw error
          
          return NextResponse.json({ data: plans })
        } catch (error) {
          console.error('Error fetching workout plans:', error)
          return NextResponse.json(
            { error: 'Failed to fetch workout plans' },
            { status: 500 }
          )
        }
        
      default:
        return NextResponse.json(
          { error: 'Invalid request type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in AI API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST handler for AI data
 * @param request - The request object
 * @returns - The response object
 */
export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get the request body
    const body = await request.json()
    const { type, data } = body
    
    // Handle different request types
    switch (type) {
      case 'query':
        // Process AI assistant query
        try {
          const query: AIQuery = {
            query: data.query,
            context: {
              user_id: user.id,
              ...data.context
            }
          }
          
          const response = await askAIAssistant(query)
          return NextResponse.json({ data: response })
        } catch (error) {
          console.error('Error processing query:', error)
          return NextResponse.json(
            { error: 'Failed to process query' },
            { status: 500 }
          )
        }
        
      case 'generate_plan':
        // Generate workout plan
        try {
          const plan = await generateWorkoutPlan(user.id, data.preferences)
          return NextResponse.json({ data: plan })
        } catch (error) {
          console.error('Error generating workout plan:', error)
          return NextResponse.json(
            { error: 'Failed to generate workout plan' },
            { status: 500 }
          )
        }
        
      case 'save_plan':
        // Save workout plan
        try {
          const planData: AIWorkoutPlan = {
            ...data.plan,
            id: data.plan.id || uuidv4()
          }
          
          // Check if the plan exists
          const { data: existingPlan, error: checkError } = await supabase
            .from('ai_workout_plans')
            .select('id')
            .eq('id', planData.id)
            .maybeSingle()
          
          let result
          
          if (existingPlan) {
            // Update existing plan
            result = await supabase
              .from('ai_workout_plans')
              .update({
                title: planData.title,
                description: planData.description,
                difficulty: planData.difficulty,
                duration_weeks: planData.duration_weeks,
                sessions_per_week: planData.sessions_per_week,
                focus_areas: planData.focus_areas,
                workouts: planData.workouts,
                updated_at: new Date().toISOString()
              })
              .eq('id', planData.id)
              .select()
          } else {
            // Insert new plan
            result = await supabase
              .from('ai_workout_plans')
              .insert([{
                id: planData.id,
                user_id: user.id,
                title: planData.title,
                description: planData.description,
                difficulty: planData.difficulty,
                duration_weeks: planData.duration_weeks,
                sessions_per_week: planData.sessions_per_week,
                focus_areas: planData.focus_areas,
                workouts: planData.workouts,
                created_at: planData.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
              }])
              .select()
          }
          
          if (result.error) {
            throw result.error
          }
          
          return NextResponse.json({ data: result.data[0] })
        } catch (error) {
          console.error('Error saving workout plan:', error)
          return NextResponse.json(
            { error: 'Failed to save workout plan' },
            { status: 500 }
          )
        }
        
      default:
        return NextResponse.json(
          { error: 'Invalid request type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in AI API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler for AI data
 * @param request - The request object
 * @returns - The response object
 */
export async function DELETE(request: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get the request type from the URL
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing ID' },
        { status: 400 }
      )
    }
    
    // Handle different request types
    switch (type) {
      case 'plan':
        // Delete workout plan
        try {
          const { error } = await supabase
            .from('ai_workout_plans')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
          
          if (error) throw error
          
          return NextResponse.json({ success: true })
        } catch (error) {
          console.error('Error deleting workout plan:', error)
          return NextResponse.json(
            { error: 'Failed to delete workout plan' },
            { status: 500 }
          )
        }
        
      default:
        return NextResponse.json(
          { error: 'Invalid request type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in AI API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
