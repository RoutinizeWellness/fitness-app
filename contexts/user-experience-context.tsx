"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import {
  ExperienceLevel,
  InterfaceMode,
  ExperienceDetails,
  UserInterfacePreferences,
  getUserExperienceLevel,
  updateUserExperienceLevel,
  updateUserInterfaceMode,
  getUserInterfacePreferences,
  updateUserInterfacePreferences
} from "@/lib/services/user-experience-service"
import { UserService } from "@/lib/services/user-service"

interface UserExperienceContextType {
  experienceLevel: ExperienceLevel
  interfaceMode: InterfaceMode
  experienceDetails: ExperienceDetails
  interfacePreferences: UserInterfacePreferences | null
  advancedFeaturesEnabled: boolean
  onboardingCompleted: boolean
  isLoading: boolean
  updateExperienceLevel: (level: ExperienceLevel, reason?: string, assessmentScore?: number) => Promise<boolean>
  updateInterfaceMode: (mode: InterfaceMode) => Promise<boolean>
  updateInterfacePreferences: (preferences: Partial<UserInterfacePreferences>) => Promise<boolean>
  toggleInterfaceMode: () => Promise<boolean>
  isAdvancedUser: () => boolean
  isBeginnerUser: () => boolean
  isAmateurZero: () => boolean
}

const UserExperienceContext = createContext<UserExperienceContextType | undefined>(undefined)

export function UserExperienceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('intermediate')
  const [interfaceMode, setInterfaceMode] = useState<InterfaceMode>('beginner')
  const [experienceDetails, setExperienceDetails] = useState<ExperienceDetails>({
    yearsOfTraining: 0,
    consistencyLevel: 'moderate',
    technicalProficiency: 'novice',
    knowledgeLevel: 'basic'
  })
  const [interfacePreferences, setInterfacePreferences] = useState<UserInterfacePreferences | null>(null)
  const [advancedFeaturesEnabled, setAdvancedFeaturesEnabled] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load user experience level
  useEffect(() => {
    const loadUserExperience = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        // Load user profile with experience data
        const profileResponse = await UserService.getUserProfile(user.id)

        if (profileResponse.data) {
          const profile = profileResponse.data

          // Set experience level from profile
          setExperienceLevel((profile.experienceLevel || 'intermediate') as ExperienceLevel)
          setInterfaceMode((profile.interfaceMode || 'beginner') as InterfaceMode)
          setExperienceDetails(profile.experienceDetails || {
            yearsOfTraining: 0,
            consistencyLevel: 'moderate',
            technicalProficiency: 'novice',
            knowledgeLevel: 'basic'
          })
          setAdvancedFeaturesEnabled(profile.advancedFeaturesEnabled || false)
          setOnboardingCompleted(profile.onboardingCompleted || false)
        } else {
          // Fallback to legacy method
          const experienceData = await getUserExperienceLevel(user.id)
          if (experienceData) {
            setExperienceLevel(experienceData.level)
            setInterfaceMode(experienceData.interfaceMode)
            setExperienceDetails(experienceData.experienceDetails)
            setAdvancedFeaturesEnabled(experienceData.advancedFeaturesEnabled)
            setOnboardingCompleted(experienceData.onboardingCompleted)
          }
        }

        // Load interface preferences
        const preferencesResponse = await UserService.getUserInterfacePreferences(user.id)

        if (preferencesResponse.data) {
          setInterfacePreferences(preferencesResponse.data)
          // Sync interface mode with preferences
          if (preferencesResponse.data.interfaceMode) {
            setInterfaceMode(preferencesResponse.data.interfaceMode as InterfaceMode)
          }
        } else {
          // Fallback to legacy method
          const preferencesData = await getUserInterfacePreferences(user.id)
          if (preferencesData) {
            setInterfacePreferences(preferencesData)
            // Sync interface mode with preferences
            setInterfaceMode(preferencesData.interface_mode)
          }
        }
      } catch (error) {
        console.error("Error loading user experience:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserExperience()
  }, [user])

  // Update experience level
  const updateExperienceLevel = async (
    level: ExperienceLevel,
    reason?: string,
    assessmentScore?: number
  ): Promise<boolean> => {
    if (!user) return false

    // Try to update with new service first
    const response = await UserService.updateUserProfile({
      userId: user.id,
      experienceLevel: level,
      experienceDetails: {
        ...experienceDetails,
        // Update experience details based on level
        technicalProficiency:
          level === 'beginner' ? 'novice' :
          level === 'intermediate' ? 'developing' :
          level === 'advanced' ? 'proficient' : 'expert'
      }
    })

    // If new service fails, fall back to legacy method
    if (!response.data) {
      const success = await updateUserExperienceLevel(
        user.id,
        level,
        experienceLevel,
        reason,
        assessmentScore
      )

      if (!success) return false
    }

    // Update local state
    setExperienceLevel(level)

    // If user advances to a higher level, enable advanced features
    if (
      (level === 'intermediate' && experienceLevel === 'beginner') ||
      (level === 'advanced' && ['beginner', 'intermediate'].includes(experienceLevel)) ||
      (level === 'expert' && ['beginner', 'intermediate', 'advanced'].includes(experienceLevel))
    ) {
      setAdvancedFeaturesEnabled(true)

      // Also update the profile with advanced features enabled
      await UserService.updateUserProfile({
        userId: user.id,
        advancedFeaturesEnabled: true
      })
    }

    return true
  }

  // Update interface mode
  const updateInterfaceMode = async (mode: InterfaceMode): Promise<boolean> => {
    if (!user) return false

    // Try to update with new service first
    const profileResponse = await UserService.updateUserProfile({
      userId: user.id,
      interfaceMode: mode
    })

    // Update interface preferences
    let preferencesUpdated = false

    if (interfacePreferences) {
      // Create updated preferences object
      const updatedPreferences = {
        userId: user.id,
        interfaceMode: mode,
        // Update other preferences based on mode
        showAdvancedMetrics: mode === 'advanced',
        showScientificExplanations: mode === 'advanced',
        showDetailedAnalytics: mode === 'advanced',
        showPeriodizationTools: mode === 'advanced',
        simplifiedNavigation: mode === 'beginner',
        showTutorialTips: mode === 'beginner'
      }

      // Try to update with new service
      const preferencesResponse = await UserService.updateUserInterfacePreferences(updatedPreferences)

      if (preferencesResponse.data) {
        setInterfacePreferences(preferencesResponse.data)
        preferencesUpdated = true
      } else {
        // Fall back to legacy method
        const legacyPreferences = {
          ...interfacePreferences,
          interface_mode: mode,
          show_advanced_metrics: mode === 'advanced',
          show_scientific_explanations: mode === 'advanced',
          show_detailed_analytics: mode === 'advanced',
          show_periodization_tools: mode === 'advanced',
          simplified_navigation: mode === 'beginner',
          show_tutorial_tips: mode === 'beginner'
        }

        const result = await updateUserInterfacePreferences(legacyPreferences)
        if (result) {
          setInterfacePreferences(result)
          preferencesUpdated = true
        }
      }
    }

    // If both profile and preferences updates failed, try legacy method
    if (!profileResponse.data && !preferencesUpdated) {
      const success = await updateUserInterfaceMode(user.id, mode)
      if (!success) return false
    }

    // Update local state
    setInterfaceMode(mode)

    return true
  }

  // Toggle between interface modes
  const toggleInterfaceMode = async (): Promise<boolean> => {
    const newMode: InterfaceMode = interfaceMode === 'beginner' ? 'advanced' : 'beginner'
    return updateInterfaceMode(newMode)
  }

  // Update interface preferences
  const updateInterfacePrefs = async (
    preferences: Partial<UserInterfacePreferences>
  ): Promise<boolean> => {
    if (!user) return false

    // Create updated preferences object
    const updatedPreferences = interfacePreferences
      ? { ...interfacePreferences, ...preferences }
      : { userId: user.id, ...preferences }

    // Try to update with new service
    const preferencesResponse = await UserService.updateUserInterfacePreferences({
      userId: user.id,
      interfaceMode: updatedPreferences.interface_mode || interfaceMode,
      showAdvancedMetrics: updatedPreferences.show_advanced_metrics,
      showScientificExplanations: updatedPreferences.show_scientific_explanations,
      showDetailedAnalytics: updatedPreferences.show_detailed_analytics,
      showPeriodizationTools: updatedPreferences.show_periodization_tools,
      simplifiedNavigation: updatedPreferences.simplified_navigation,
      showTutorialTips: updatedPreferences.show_tutorial_tips
    })

    if (preferencesResponse.data) {
      setInterfacePreferences(preferencesResponse.data)

      // If interface mode was updated, sync the state
      if (preferencesResponse.data.interfaceMode) {
        setInterfaceMode(preferencesResponse.data.interfaceMode as InterfaceMode)
      }

      return true
    } else {
      // Fall back to legacy method
      const result = await updateUserInterfacePreferences(updatedPreferences)

      if (result) {
        setInterfacePreferences(result)
        // If interface mode was updated, sync the state
        if (preferences.interface_mode) {
          setInterfaceMode(preferences.interface_mode)
        }
        return true
      }
    }

    return false
  }

  // Check if user is advanced
  const isAdvancedUser = (): boolean => {
    return ['advanced', 'expert'].includes(experienceLevel)
  }

  // Check if user is beginner
  const isBeginnerUser = (): boolean => {
    return ['amateur_zero', 'beginner'].includes(experienceLevel)
  }

  // Check if user is amateur zero
  const isAmateurZero = (): boolean => {
    return experienceLevel === 'amateur_zero'
  }

  return (
    <UserExperienceContext.Provider
      value={{
        experienceLevel,
        interfaceMode,
        experienceDetails,
        interfacePreferences,
        advancedFeaturesEnabled,
        onboardingCompleted,
        isLoading,
        updateExperienceLevel,
        updateInterfaceMode,
        updateInterfacePreferences: updateInterfacePrefs,
        toggleInterfaceMode,
        isAdvancedUser,
        isBeginnerUser,
        isAmateurZero
      }}
    >
      {children}
    </UserExperienceContext.Provider>
  )
}

export function useUserExperience() {
  const context = useContext(UserExperienceContext)
  if (context === undefined) {
    throw new Error("useUserExperience must be used within a UserExperienceProvider")
  }
  return context
}
