import { 
  AIRecommendation, 
  AIWorkoutPlan, 
  AIProgressAnalysis, 
  AIQuery, 
  AIResponse 
} from './ai-types'

/**
 * Get personalized recommendations
 * @returns - The recommendations and any error
 */
export async function getPersonalizedRecommendations(): Promise<{ data: AIRecommendation[] | null, error: any }> {
  try {
    const response = await fetch(`/api/ai?type=recommendations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      return { data: null, error: result.error }
    }
    
    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getPersonalizedRecommendations:', error)
    return { data: null, error }
  }
}

/**
 * Get progress analysis
 * @param period - The period to analyze
 * @returns - The progress analysis and any error
 */
export async function getProgressAnalysis(period: 'week' | 'month' | '3months' = 'month'): Promise<{ data: AIProgressAnalysis | null, error: any }> {
  try {
    const response = await fetch(`/api/ai?type=progress&period=${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      return { data: null, error: result.error }
    }
    
    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getProgressAnalysis:', error)
    return { data: null, error }
  }
}

/**
 * Get saved workout plans
 * @returns - The workout plans and any error
 */
export async function getSavedWorkoutPlans(): Promise<{ data: AIWorkoutPlan[] | null, error: any }> {
  try {
    const response = await fetch(`/api/ai?type=plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      return { data: null, error: result.error }
    }
    
    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getSavedWorkoutPlans:', error)
    return { data: null, error }
  }
}

/**
 * Ask AI assistant
 * @param query - The query to ask
 * @param context - The context for the query
 * @returns - The AI response and any error
 */
export async function askAI(query: string, context?: any): Promise<{ data: AIResponse | null, error: any }> {
  try {
    const response = await fetch(`/api/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'query',
        data: {
          query,
          context
        }
      })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      return { data: null, error: result.error }
    }
    
    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in askAI:', error)
    return { data: null, error }
  }
}

/**
 * Generate workout plan
 * @param preferences - The preferences for the workout plan
 * @returns - The workout plan and any error
 */
export async function generateAIWorkoutPlan(preferences: {
  goal: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  focusAreas: string[];
  duration: number;
  limitations?: string[];
}): Promise<{ data: AIWorkoutPlan | null, error: any }> {
  try {
    const response = await fetch(`/api/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'generate_plan',
        data: {
          preferences
        }
      })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      return { data: null, error: result.error }
    }
    
    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in generateAIWorkoutPlan:', error)
    return { data: null, error }
  }
}

/**
 * Save workout plan
 * @param plan - The workout plan to save
 * @returns - The saved workout plan and any error
 */
export async function saveAIWorkoutPlan(plan: AIWorkoutPlan): Promise<{ data: AIWorkoutPlan | null, error: any }> {
  try {
    const response = await fetch(`/api/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'save_plan',
        data: {
          plan
        }
      })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      return { data: null, error: result.error }
    }
    
    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in saveAIWorkoutPlan:', error)
    return { data: null, error }
  }
}

/**
 * Delete workout plan
 * @param planId - The ID of the workout plan to delete
 * @returns - Success status and any error
 */
export async function deleteAIWorkoutPlan(planId: string): Promise<{ success: boolean, error: any }> {
  try {
    const response = await fetch(`/api/ai?type=plan&id=${planId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      return { success: false, error: result.error }
    }
    
    return { success: true, error: null }
  } catch (error) {
    console.error('Error in deleteAIWorkoutPlan:', error)
    return { success: false, error }
  }
}
