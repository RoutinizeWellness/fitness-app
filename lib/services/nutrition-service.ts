/**
 * Nutrition Service
 * 
 * This service handles all nutrition-related operations with Supabase.
 * It provides methods for:
 * - Managing food database
 * - Tracking nutrition intake
 * - Managing meal plans
 * - Tracking weight and body measurements
 * - Managing recipes
 */

import { supabaseService, QueryResponse } from "@/lib/supabase-service"
import { TABLES } from "@/lib/config/supabase-config"
import { v4 as uuidv4 } from "uuid"

// Types for nutrition module
export interface NutritionProfile {
  id: string
  userId: string
  height?: number
  currentWeight?: number
  initialWeight?: number
  targetWeight?: number
  activityLevel?: string
  goal?: string
  dietType?: string
  mealsPerDay?: number
  createdAt?: string
  updatedAt?: string
}

export interface WeightLog {
  id: string
  userId: string
  date: string
  weight: number
  notes?: string
  createdAt?: string
}

export interface FoodPreference {
  id: string
  userId: string
  foodCategory?: string
  preference: 'like' | 'dislike' | 'allergic' | 'intolerant'
  specificFoods?: string[]
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface FoodItem {
  id: string
  name: string
  brand?: string
  category?: string
  servingSize: number
  servingUnit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
  cholesterol?: number
  isSpanishProduct?: boolean
  region?: string
  supermarket?: string
  metadata?: any
  createdAt?: string
  updatedAt?: string
}

export interface CustomFood extends FoodItem {
  userId: string
  ingredients?: string[]
  isPublic?: boolean
}

export interface NutritionEntry {
  id: string
  userId: string
  date: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foodId?: string
  foodName: string
  servingSize: number
  servingUnit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
  cholesterol?: number
  notes?: string
  createdAt?: string
}

export interface MealPlan {
  id: string
  userId: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
  isActive?: boolean
  isTemplate?: boolean
  isPublic?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface MealPlanDetail {
  id: string
  mealPlanId: string
  dayOfWeek: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foodId?: string
  foodName: string
  servingSize: number
  servingUnit: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface NutritionGoal {
  id: string
  userId: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
  sugar?: number
  sodium?: number
  cholesterol?: number
  water?: number
  createdAt?: string
  updatedAt?: string
}

export interface WaterLog {
  id: string
  userId: string
  date: string
  amount: number
  createdAt?: string
}

export interface Recipe {
  id: string
  userId?: string
  title: string
  description?: string
  prepTime?: number
  cookTime?: number
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  ingredients: any[]
  instructions?: string[]
  imageUrl?: string
  category?: string[]
  region?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  isPublic?: boolean
  createdAt?: string
  updatedAt?: string
}

/**
 * Nutrition Service Class
 */
export class NutritionService {
  /**
   * Get nutrition profile for a user
   * @param userId - User ID
   * @returns Nutrition profile
   */
  static async getNutritionProfile(userId: string): Promise<QueryResponse<NutritionProfile>> {
    if (!userId) {
      return { data: null, error: { message: 'User ID is required' }, status: 400 }
    }

    return supabaseService.query<NutritionProfile>(TABLES.NUTRITION_PROFILES, {
      eq: { user_id: userId },
      single: true
    })
  }

  /**
   * Create or update nutrition profile
   * @param profile - Nutrition profile data
   * @returns Updated nutrition profile
   */
  static async saveNutritionProfile(profile: NutritionProfile): Promise<QueryResponse<NutritionProfile>> {
    if (!profile.userId) {
      return { data: null, error: { message: 'User ID is required' }, status: 400 }
    }

    if (!profile.id) {
      profile.id = uuidv4()
    }

    const supabaseData = {
      id: profile.id,
      user_id: profile.userId,
      height: profile.height,
      current_weight: profile.currentWeight,
      initial_weight: profile.initialWeight,
      target_weight: profile.targetWeight,
      activity_level: profile.activityLevel,
      goal: profile.goal,
      diet_type: profile.dietType,
      meals_per_day: profile.mealsPerDay,
      updated_at: new Date().toISOString()
    }

    // Check if profile exists
    const existingResponse = await supabaseService.query<any>(TABLES.NUTRITION_PROFILES, {
      select: 'id',
      eq: { user_id: profile.userId },
      single: true
    })

    let response

    if (!existingResponse.data) {
      // If it doesn't exist, insert it
      supabaseData.created_at = new Date().toISOString()
      response = await supabaseService.insert<any>(TABLES.NUTRITION_PROFILES, supabaseData)
    } else {
      // If it exists, update it
      response = await supabaseService.update<any>(
        TABLES.NUTRITION_PROFILES,
        supabaseData,
        { eq: { id: existingResponse.data.id } }
      )
    }

    return response
  }

  /**
   * Get food items from database
   * @param options - Query options
   * @returns List of food items
   */
  static async getFoodItems(options: {
    category?: string
    isSpanishProduct?: boolean
    region?: string
    supermarket?: string
    search?: string
    limit?: number
    offset?: number
    useCache?: boolean
  } = {}): Promise<QueryResponse<FoodItem[]>> {
    const {
      category,
      isSpanishProduct,
      region,
      supermarket,
      search,
      limit = 50,
      offset = 0,
      useCache = true
    } = options

    let queryOptions: any = {
      select: '*',
      limit,
      offset,
      order: { name: 'asc' },
      useCache
    }

    // Add filters
    if (category) {
      queryOptions.eq = { ...queryOptions.eq, category }
    }

    if (isSpanishProduct !== undefined) {
      queryOptions.eq = { ...queryOptions.eq, is_spanish_product: isSpanishProduct }
    }

    if (region) {
      queryOptions.eq = { ...queryOptions.eq, region }
    }

    if (supermarket) {
      queryOptions.eq = { ...queryOptions.eq, supermarket }
    }

    // For search, use ilike on name or brand
    if (search) {
      queryOptions.or = `name.ilike.%${search}%,brand.ilike.%${search}%`
    }

    return supabaseService.query<FoodItem[]>(TABLES.FOOD_DATABASE, queryOptions)
  }

  /**
   * Get nutrition entries for a user
   * @param userId - User ID
   * @param options - Query options
   * @returns List of nutrition entries
   */
  static async getNutritionEntries(
    userId: string,
    options: {
      startDate?: string
      endDate?: string
      mealType?: string
      limit?: number
      offset?: number
      useCache?: boolean
    } = {}
  ): Promise<QueryResponse<NutritionEntry[]>> {
    if (!userId) {
      return { data: [], error: { message: 'User ID is required' }, status: 400 }
    }

    const {
      startDate,
      endDate,
      mealType,
      limit = 50,
      offset = 0,
      useCache = true
    } = options

    let queryOptions: any = {
      select: '*',
      eq: { user_id: userId },
      limit,
      offset,
      order: { date: 'desc' },
      useCache
    }

    if (mealType) {
      queryOptions.eq = { ...queryOptions.eq, meal_type: mealType }
    }

    if (startDate) {
      queryOptions.gte = { date: startDate }
    }

    if (endDate) {
      queryOptions.lte = { date: endDate }
    }

    return supabaseService.query<NutritionEntry[]>(TABLES.NUTRITION_ENTRIES, queryOptions)
  }
}

export default NutritionService
