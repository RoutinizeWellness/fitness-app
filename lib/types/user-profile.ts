export interface UserPreferences {
  // Preferencias de entrenamiento
  trainingPreferences: {
    preferredWorkoutDays: string[] // ["monday", "wednesday", "friday"]
    preferredWorkoutTime: string // "morning", "afternoon", "evening"
    workoutDuration: number // minutos
    exerciseIntensity: "low" | "moderate" | "high"
    focusAreas: string[] // ["chest", "back", "legs", etc.]
    avoidedExercises: string[] // IDs de ejercicios a evitar
    favoriteExercises: string[] // IDs de ejercicios favoritos
    equipmentAvailable: string[] // ["dumbbells", "barbell", "machine", etc.]
    trainingExperience: "beginner" | "intermediate" | "advanced"
    trainingGoals: string[] // ["muscle_gain", "fat_loss", "strength", "endurance", etc.]
    injuryHistory: string[] // ["shoulder", "knee", "back", etc.]
  }

  // Preferencias de nutrición
  nutritionPreferences: {
    dietType: string // "omnivore", "vegetarian", "vegan", "keto", etc.
    mealsPerDay: number
    calorieGoal: number
    macroRatios: {
      protein: number // porcentaje
      carbs: number // porcentaje
      fat: number // porcentaje
    }
    allergies: string[]
    dislikedFoods: string[]
    favoriteFoods: string[]
    mealPrepFrequency: "daily" | "weekly" | "none"
    supplementsUsed: string[]
    waterIntakeGoal: number // ml
  }

  // Preferencias de bienestar
  wellnessPreferences: {
    sleepGoal: number // horas
    stressManagementTechniques: string[] // ["meditation", "yoga", "breathing", etc.]
    recoveryMethods: string[] // ["stretching", "foam_rolling", "massage", etc.]
    mindfulnessPreference: "guided" | "unguided" | "none"
    mindfulnessDuration: number // minutos
    wellnessReminders: boolean
    wellnessReminderFrequency: "daily" | "weekly" | "none"
  }

  // Preferencias de interfaz
  uiPreferences: {
    theme: "light" | "dark" | "system"
    accentColor: string
    dashboardLayout: "compact" | "detailed" | "minimal"
    notificationsEnabled: boolean
    notificationTypes: {
      workout: boolean
      nutrition: boolean
      wellness: boolean
      progress: boolean
      tips: boolean
    }
    language: string
    measurementSystem: "metric" | "imperial"
    dataVisualizationPreference: "charts" | "tables" | "both"
  }
}

export interface UserMetrics {
  // Métricas físicas
  physicalMetrics: {
    height: number // cm
    weight: number // kg
    bodyFat?: number // porcentaje
    muscleMass?: number // kg
    restingHeartRate?: number // bpm
    vo2Max?: number // ml/kg/min
    bloodPressure?: {
      systolic: number
      diastolic: number
    }
  }

  // Métricas de entrenamiento
  trainingMetrics: {
    workoutsPerWeek: number
    averageWorkoutDuration: number // minutos
    maxLifts?: {
      [exerciseId: string]: number // kg
    }
    personalRecords?: {
      [exerciseId: string]: number // kg o reps
    }
    consistencyScore?: number // 0-100
    recoveryScore?: number // 0-100
    progressRate?: number // porcentaje de mejora mensual
  }

  // Métricas de bienestar
  wellnessMetrics: {
    averageSleepDuration: number // horas
    sleepQuality: number // 1-10
    stressLevel: number // 1-10
    energyLevel: number // 1-10
    moodScore: number // 1-10
    mindfulnessMinutesPerWeek: number
    recoverySessionsPerWeek: number
  }

  // Métricas de nutrición
  nutritionMetrics: {
    averageCalorieIntake: number
    averageMacros: {
      protein: number // g
      carbs: number // g
      fat: number // g
    }
    waterIntake: number // ml
    mealAdherence: number // porcentaje
    nutritionScore: number // 0-100
  }
}

export interface UserBehavior {
  // Patrones de uso de la aplicación
  appUsage: {
    mostVisitedSections: string[] // ["workouts", "nutrition", "wellness", etc.]
    averageSessionDuration: number // minutos
    sessionsPerWeek: number
    preferredTimeOfUse: string // "morning", "afternoon", "evening"
    featureEngagement: {
      [feature: string]: number // porcentaje de uso
    }
    completionRates: {
      workouts: number // porcentaje
      nutritionTracking: number // porcentaje
      wellnessActivities: number // porcentaje
    }
  }

  // Patrones de entrenamiento
  trainingPatterns: {
    preferredExerciseTypes: string[] // basado en el uso real
    skippedExercises: string[] // ejercicios que suele saltar
    modifiedExercises: string[] // ejercicios que suele modificar
    restTimeBetweenSets: number // segundos promedio
    workoutCompletionTime: number // porcentaje del tiempo estimado
    consistentWorkoutDays: string[] // días en los que entrena consistentemente
    missedWorkoutReasons: string[] // ["time", "fatigue", "motivation", etc.]
  }

  // Patrones de bienestar
  wellnessPatterns: {
    stressfulDays: string[] // ["monday", "friday", etc.]
    recoveryTechniquesUsed: string[] // técnicas que realmente usa
    sleepScheduleConsistency: number // 0-100
    mindfulnessSessionCompletion: number // porcentaje
    moodTrends: {
      [day: string]: number // promedio por día de la semana
    }
  }

  // Patrones de nutrición
  nutritionPatterns: {
    mealTimings: {
      breakfast: string // hora promedio
      lunch: string // hora promedio
      dinner: string // hora promedio
      snacks: string[] // horas promedio
    }
    weekdayVsWeekendDifference: number // porcentaje de variación
    commonNutritionChallenges: string[] // ["skipping_breakfast", "late_night_eating", etc.]
    nutritionAdherenceTrends: {
      [day: string]: number // porcentaje por día de la semana
    }
  }
}

export interface EnhancedUserProfile {
  userId: string
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    dateOfBirth: string
    gender: string
    occupation: string
    activityLevel: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active"
  }
  preferences: UserPreferences
  metrics: UserMetrics
  behavior: UserBehavior
  aiInsights?: {
    strengthsAndWeaknesses: {
      strengths: string[]
      weaknesses: string[]
      opportunities: string[]
    }
    personalizedTips: string[]
    adaptationSuggestions: {
      training: string[]
      nutrition: string[]
      wellness: string[]
    }
    progressPredictions: {
      shortTerm: string[]
      longTerm: string[]
    }
    lastUpdated: string
  }
}
