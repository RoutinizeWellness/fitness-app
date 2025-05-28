/**
 * Admin Service
 * 
 * This service handles administrative operations with Supabase.
 * It provides methods for:
 * - Managing users
 * - Importing data
 * - Viewing analytics
 * - Managing content
 */

import { supabaseService, QueryResponse } from "@/lib/supabase-service"
import { TABLES } from "@/lib/config/supabase-config"

// Types for admin module
export interface AdminUser {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  isAdmin: boolean
  lastSignIn?: string
  createdAt: string
}

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  newUsers: number
  totalWorkouts: number
  totalExercises: number
  totalNutritionEntries: number
  totalRecipes: number
  totalMoodLogs: number
  totalFocusSessions: number
}

/**
 * Admin Service Class
 */
export class AdminService {
  /**
   * Check if user is admin
   * @param userId - User ID
   * @returns Boolean indicating if user is admin
   */
  static async isAdmin(userId: string): Promise<QueryResponse<boolean>> {
    if (!userId) {
      return { data: false, error: { message: 'User ID is required' }, status: 400 }
    }

    const response = await supabaseService.query<any>(TABLES.PROFILES, {
      select: 'is_admin',
      eq: { user_id: userId },
      single: true
    })

    if (response.data) {
      return { ...response, data: response.data.is_admin === true }
    }

    return { ...response, data: false }
  }

  /**
   * Get all users
   * @param options - Query options
   * @returns List of users
   */
  static async getUsers(options: {
    limit?: number
    offset?: number
    search?: string
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
    useCache?: boolean
  } = {}): Promise<QueryResponse<AdminUser[]>> {
    const {
      limit = 50,
      offset = 0,
      search,
      orderBy = 'created_at',
      orderDirection = 'desc',
      useCache = false
    } = options

    // This requires admin privileges
    const response = await supabaseService.rpc<any[]>('get_all_users', {
      page_size: limit,
      page_number: Math.floor(offset / limit) + 1,
      search_query: search || '',
      order_by_column: orderBy,
      order_direction: orderDirection
    })

    return response
  }

  /**
   * Get admin statistics
   * @returns Admin statistics
   */
  static async getStats(): Promise<QueryResponse<AdminStats>> {
    // Get total users
    const usersResponse = await supabaseService.query<any[]>(TABLES.PROFILES, {
      select: 'count',
      count: 'exact'
    })

    // Get active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const activeUsersResponse = await supabaseService.rpc<number>('count_active_users', {
      days_ago: 30
    })

    // Get new users (created within last 30 days)
    const newUsersResponse = await supabaseService.query<any[]>(TABLES.PROFILES, {
      select: 'count',
      count: 'exact',
      gte: { created_at: thirtyDaysAgo.toISOString() }
    })

    // Get total workouts
    const workoutsResponse = await supabaseService.query<any[]>(TABLES.WORKOUT_LOGS, {
      select: 'count',
      count: 'exact'
    })

    // Get total exercises
    const exercisesResponse = await supabaseService.query<any[]>(TABLES.EXERCISES, {
      select: 'count',
      count: 'exact'
    })

    // Get total nutrition entries
    const nutritionResponse = await supabaseService.query<any[]>(TABLES.NUTRITION_ENTRIES, {
      select: 'count',
      count: 'exact'
    })

    // Get total recipes
    const recipesResponse = await supabaseService.query<any[]>(TABLES.RECIPES, {
      select: 'count',
      count: 'exact'
    })

    // Get total mood logs
    const moodLogsResponse = await supabaseService.query<any[]>('mood_entries', {
      select: 'count',
      count: 'exact'
    })

    // Get total focus sessions
    const focusSessionsResponse = await supabaseService.query<any[]>(TABLES.FOCUS_SESSIONS, {
      select: 'count',
      count: 'exact'
    })

    const stats: AdminStats = {
      totalUsers: usersResponse.data?.[0]?.count || 0,
      activeUsers: activeUsersResponse.data || 0,
      newUsers: newUsersResponse.data?.[0]?.count || 0,
      totalWorkouts: workoutsResponse.data?.[0]?.count || 0,
      totalExercises: exercisesResponse.data?.[0]?.count || 0,
      totalNutritionEntries: nutritionResponse.data?.[0]?.count || 0,
      totalRecipes: recipesResponse.data?.[0]?.count || 0,
      totalMoodLogs: moodLogsResponse.data?.[0]?.count || 0,
      totalFocusSessions: focusSessionsResponse.data?.[0]?.count || 0
    }

    return { data: stats, error: null, status: 200 }
  }

  /**
   * Import exercises from JSON
   * @param exercises - Array of exercises to import
   * @returns Import result
   */
  static async importExercises(exercises: any[]): Promise<QueryResponse<{ count: number }>> {
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return { data: { count: 0 }, error: { message: 'No exercises to import' }, status: 400 }
    }

    // Transform exercises to match database schema
    const transformedExercises = exercises.map(exercise => ({
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      category: exercise.category,
      muscle_group: Array.isArray(exercise.muscleGroup) ? exercise.muscleGroup : [exercise.muscleGroup],
      secondary_muscle_groups: exercise.secondaryMuscleGroups || [],
      difficulty: exercise.difficulty || 'intermediate',
      equipment: exercise.equipment || [],
      is_compound: exercise.isCompound || false,
      image_url: exercise.imageUrl,
      video_url: exercise.videoUrl,
      instructions: exercise.instructions,
      tips: exercise.tips || [],
      alternatives: exercise.alternatives || []
    }))

    // Insert exercises in batches of 100
    const batchSize = 100
    const batches = []
    
    for (let i = 0; i < transformedExercises.length; i += batchSize) {
      const batch = transformedExercises.slice(i, i + batchSize)
      batches.push(batch)
    }

    let totalInserted = 0
    
    for (const batch of batches) {
      const response = await supabaseService.insert<any>(
        TABLES.EXERCISES,
        batch,
        { upsert: true }
      )
      
      if (response.error) {
        return { 
          data: { count: totalInserted }, 
          error: { 
            message: `Error after importing ${totalInserted} exercises: ${response.error.message}` 
          }, 
          status: response.status 
        }
      }
      
      totalInserted += batch.length
    }

    return { data: { count: totalInserted }, error: null, status: 200 }
  }

  /**
   * Import food database from JSON
   * @param foods - Array of food items to import
   * @returns Import result
   */
  static async importFoodDatabase(foods: any[]): Promise<QueryResponse<{ count: number }>> {
    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      return { data: { count: 0 }, error: { message: 'No food items to import' }, status: 400 }
    }

    // Transform food items to match database schema
    const transformedFoods = foods.map(food => ({
      id: food.id,
      name: food.name,
      brand: food.brand,
      category: food.category,
      serving_size: food.servingSize,
      serving_unit: food.servingUnit,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      sugar: food.sugar,
      sodium: food.sodium,
      cholesterol: food.cholesterol,
      is_spanish_product: food.isSpanishProduct || false,
      region: food.region,
      supermarket: food.supermarket,
      metadata: food.metadata || {}
    }))

    // Insert food items in batches of 100
    const batchSize = 100
    const batches = []
    
    for (let i = 0; i < transformedFoods.length; i += batchSize) {
      const batch = transformedFoods.slice(i, i + batchSize)
      batches.push(batch)
    }

    let totalInserted = 0
    
    for (const batch of batches) {
      const response = await supabaseService.insert<any>(
        TABLES.FOOD_DATABASE,
        batch,
        { upsert: true }
      )
      
      if (response.error) {
        return { 
          data: { count: totalInserted }, 
          error: { 
            message: `Error after importing ${totalInserted} food items: ${response.error.message}` 
          }, 
          status: response.status 
        }
      }
      
      totalInserted += batch.length
    }

    return { data: { count: totalInserted }, error: null, status: 200 }
  }
}

export default AdminService
