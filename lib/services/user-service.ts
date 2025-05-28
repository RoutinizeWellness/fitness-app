/**
 * User Service
 *
 * This service handles user-related operations with Supabase.
 * It provides methods for:
 * - Managing user profiles
 * - Handling user preferences
 * - Managing user experience levels
 */

import { supabase } from "@/lib/supabase-client"
import { v4 as uuidv4 } from "uuid"

// Define QueryResponse type locally
export interface QueryResponse<T> {
  data: T | null
  error: any
  status?: number
}

// Types for user module
export interface UserProfile {
  id: string
  userId: string
  fullName?: string
  avatarUrl?: string
  weight?: number
  height?: number
  goal?: string
  level?: string
  isAdmin?: boolean
  experienceLevel?: string
  interfaceMode?: string
  experienceDetails?: {
    yearsOfTraining?: number
    consistencyLevel?: string
    technicalProficiency?: string
    knowledgeLevel?: string
  }
  onboardingCompleted?: boolean
  advancedFeaturesEnabled?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UserInterfacePreferences {
  id: string
  userId: string
  interfaceMode?: string
  theme?: string
  colorScheme?: string
  showAdvancedMetrics?: boolean
  showScientificExplanations?: boolean
  showDetailedAnalytics?: boolean
  showPeriodizationTools?: boolean
  simplifiedNavigation?: boolean
  showTutorialTips?: boolean
  createdAt?: string
  updatedAt?: string
}

/**
 * User Service Class
 */
export class UserService {
  /**
   * Get user profile
   * @param userId - User ID
   * @returns User profile
   */
  static async getUserProfile(userId: string): Promise<QueryResponse<UserProfile>> {
    if (!userId) {
      return { data: null, error: { message: 'User ID is required' }, status: 400 }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    const response = { data, error, status: error ? 500 : 200 }

    // Transform database data to interface format
    if (response.data) {
      const profile: UserProfile = {
        id: response.data.id,
        userId: response.data.user_id,
        fullName: response.data.full_name,
        avatarUrl: response.data.avatar_url,
        weight: response.data.weight,
        height: response.data.height,
        goal: response.data.goal,
        level: response.data.level,
        isAdmin: response.data.is_admin,
        experienceLevel: response.data.experience_level,
        interfaceMode: response.data.interface_mode,
        experienceDetails: response.data.experience_details,
        onboardingCompleted: response.data.onboarding_completed,
        advancedFeaturesEnabled: response.data.advanced_features_enabled,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at
      }

      return { ...response, data: profile }
    }

    return response
  }

  /**
   * Update user profile
   * @param profile - User profile data
   * @returns Updated user profile
   */
  static async updateUserProfile(profile: Partial<UserProfile> & { userId: string }): Promise<QueryResponse<UserProfile>> {
    if (!profile.userId) {
      return { data: null, error: { message: 'User ID is required' }, status: 400 }
    }

    // Get existing profile
    const { data: existingData, error: existingError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', profile.userId)
      .single()

    if (existingError || !existingData) {
      return { data: null, error: { message: 'User profile not found' }, status: 404 }
    }

    const profileId = existingData.id

    // Prepare data for update
    const updateData = {
      full_name: profile.fullName,
      avatar_url: profile.avatarUrl,
      weight: profile.weight,
      height: profile.height,
      goal: profile.goal,
      level: profile.level,
      experience_level: profile.experienceLevel,
      interface_mode: profile.interfaceMode,
      experience_details: profile.experienceDetails,
      onboarding_completed: profile.onboardingCompleted,
      advanced_features_enabled: profile.advancedFeaturesEnabled,
      updated_at: new Date().toISOString()
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profileId)
      .select()
      .single()

    const response = { data, error, status: error ? 500 : 200 }

    // Transform database data to interface format
    if (response.data) {
      const data = Array.isArray(response.data) ? response.data[0] : response.data

      const updatedProfile: UserProfile = {
        id: data.id,
        userId: data.user_id,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        weight: data.weight,
        height: data.height,
        goal: data.goal,
        level: data.level,
        isAdmin: data.is_admin,
        experienceLevel: data.experience_level,
        interfaceMode: data.interface_mode,
        experienceDetails: data.experience_details,
        onboardingCompleted: data.onboarding_completed,
        advancedFeaturesEnabled: data.advanced_features_enabled,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { ...response, data: updatedProfile }
    }

    return response
  }

  /**
   * Get user interface preferences
   * @param userId - User ID
   * @returns User interface preferences
   */
  static async getUserInterfacePreferences(userId: string): Promise<QueryResponse<UserInterfacePreferences>> {
    if (!userId) {
      return { data: null, error: { message: 'User ID is required' }, status: 400 }
    }

    const { data, error } = await supabase
      .from('user_interface_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    const response = { data, error, status: error ? 500 : 200 }

    // Transform database data to interface format
    if (response.data) {
      const preferences: UserInterfacePreferences = {
        id: response.data.id,
        userId: response.data.user_id,
        interfaceMode: response.data.interface_mode,
        theme: response.data.theme,
        colorScheme: response.data.color_scheme,
        showAdvancedMetrics: response.data.show_advanced_metrics,
        showScientificExplanations: response.data.show_scientific_explanations,
        showDetailedAnalytics: response.data.show_detailed_analytics,
        showPeriodizationTools: response.data.show_periodization_tools,
        simplifiedNavigation: response.data.simplified_navigation,
        showTutorialTips: response.data.show_tutorial_tips,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at
      }

      return { ...response, data: preferences }
    }

    return response
  }

  /**
   * Update user interface preferences
   * @param preferences - User interface preferences data
   * @returns Updated user interface preferences
   */
  static async updateUserInterfacePreferences(
    preferences: Partial<UserInterfacePreferences> & { userId: string }
  ): Promise<QueryResponse<UserInterfacePreferences>> {
    if (!preferences.userId) {
      return { data: null, error: { message: 'User ID is required' }, status: 400 }
    }

    // Get existing preferences
    const { data: existingData, error: existingError } = await supabase
      .from('user_interface_preferences')
      .select('id')
      .eq('user_id', preferences.userId)
      .single()

    // Prepare data for update
    const updateData = {
      user_id: preferences.userId,
      interface_mode: preferences.interfaceMode,
      theme: preferences.theme,
      color_scheme: preferences.colorScheme,
      show_advanced_metrics: preferences.showAdvancedMetrics,
      show_scientific_explanations: preferences.showScientificExplanations,
      show_detailed_analytics: preferences.showDetailedAnalytics,
      show_periodization_tools: preferences.showPeriodizationTools,
      simplified_navigation: preferences.simplifiedNavigation,
      show_tutorial_tips: preferences.showTutorialTips,
      updated_at: new Date().toISOString()
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    let response

    if (existingError || !existingData) {
      // If preferences don't exist, create them
      updateData.id = uuidv4()
      updateData.created_at = updateData.updated_at

      const { data, error } = await supabase
        .from('user_interface_preferences')
        .insert(updateData)
        .select()
        .single()

      response = { data, error, status: error ? 500 : 200 }
    } else {
      // If preferences exist, update them
      const { data, error } = await supabase
        .from('user_interface_preferences')
        .update(updateData)
        .eq('id', existingData.id)
        .select()
        .single()

      response = { data, error, status: error ? 500 : 200 }
    }

    // Transform database data to interface format
    if (response.data) {
      const data = Array.isArray(response.data) ? response.data[0] : response.data

      const updatedPreferences: UserInterfacePreferences = {
        id: data.id,
        userId: data.user_id,
        interfaceMode: data.interface_mode,
        theme: data.theme,
        colorScheme: data.color_scheme,
        showAdvancedMetrics: data.show_advanced_metrics,
        showScientificExplanations: data.show_scientific_explanations,
        showDetailedAnalytics: data.show_detailed_analytics,
        showPeriodizationTools: data.show_periodization_tools,
        simplifiedNavigation: data.simplified_navigation,
        showTutorialTips: data.show_tutorial_tips,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { ...response, data: updatedPreferences }
    }

    return response
  }
}

export default UserService
