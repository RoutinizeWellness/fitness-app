"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-context'
import { 
  getPersonalizedRecommendations, 
  getProgressAnalysis, 
  getSavedWorkoutPlans, 
  askAI, 
  generateAIWorkoutPlan, 
  saveAIWorkoutPlan, 
  deleteAIWorkoutPlan 
} from '@/lib/ai-api-service'
import { 
  AIRecommendation, 
  AIWorkoutPlan, 
  AIProgressAnalysis, 
  AIResponse 
} from '@/lib/ai-types'
import { toast } from '@/components/ui/use-toast'

interface AIContextType {
  // Recommendations
  recommendations: AIRecommendation[]
  isLoadingRecommendations: boolean
  loadRecommendations: () => Promise<void>
  
  // Progress Analysis
  progressAnalysis: AIProgressAnalysis | null
  isLoadingAnalysis: boolean
  loadProgressAnalysis: (period?: 'week' | 'month' | '3months') => Promise<void>
  
  // Workout Plans
  workoutPlans: AIWorkoutPlan[]
  isLoadingPlans: boolean
  loadWorkoutPlans: () => Promise<void>
  generateWorkoutPlan: (preferences: any) => Promise<AIWorkoutPlan | null>
  savePlan: (plan: AIWorkoutPlan) => Promise<AIWorkoutPlan | null>
  deletePlan: (planId: string) => Promise<boolean>
  
  // AI Assistant
  askAssistant: (query: string, context?: any) => Promise<AIResponse | null>
  isLoadingAssistant: boolean
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  
  // Progress Analysis state
  const [progressAnalysis, setProgressAnalysis] = useState<AIProgressAnalysis | null>(null)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)
  
  // Workout Plans state
  const [workoutPlans, setWorkoutPlans] = useState<AIWorkoutPlan[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(false)
  
  // AI Assistant state
  const [isLoadingAssistant, setIsLoadingAssistant] = useState(false)
  
  // Load recommendations
  const loadRecommendations = async () => {
    if (!user) return
    
    try {
      setIsLoadingRecommendations(true)
      const { data, error } = await getPersonalizedRecommendations()
      
      if (error) {
        console.error('Error loading recommendations:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las recomendaciones',
          variant: 'destructive'
        })
        return
      }
      
      if (data) {
        setRecommendations(data)
      }
    } catch (error) {
      console.error('Error loading recommendations:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las recomendaciones',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingRecommendations(false)
    }
  }
  
  // Load progress analysis
  const loadProgressAnalysis = async (period: 'week' | 'month' | '3months' = 'month') => {
    if (!user) return
    
    try {
      setIsLoadingAnalysis(true)
      const { data, error } = await getProgressAnalysis(period)
      
      if (error) {
        console.error('Error loading progress analysis:', error)
        toast({
          title: 'Error',
          description: 'No se pudo cargar el análisis de progreso',
          variant: 'destructive'
        })
        return
      }
      
      if (data) {
        setProgressAnalysis(data)
      }
    } catch (error) {
      console.error('Error loading progress analysis:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar el análisis de progreso',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingAnalysis(false)
    }
  }
  
  // Load workout plans
  const loadWorkoutPlans = async () => {
    if (!user) return
    
    try {
      setIsLoadingPlans(true)
      const { data, error } = await getSavedWorkoutPlans()
      
      if (error) {
        console.error('Error loading workout plans:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los planes de entrenamiento',
          variant: 'destructive'
        })
        return
      }
      
      if (data) {
        setWorkoutPlans(data)
      }
    } catch (error) {
      console.error('Error loading workout plans:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los planes de entrenamiento',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingPlans(false)
    }
  }
  
  // Generate workout plan
  const generateWorkoutPlan = async (preferences: any): Promise<AIWorkoutPlan | null> => {
    if (!user) return null
    
    try {
      const { data, error } = await generateAIWorkoutPlan(preferences)
      
      if (error) {
        console.error('Error generating workout plan:', error)
        toast({
          title: 'Error',
          description: 'No se pudo generar el plan de entrenamiento',
          variant: 'destructive'
        })
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error generating workout plan:', error)
      toast({
        title: 'Error',
        description: 'No se pudo generar el plan de entrenamiento',
        variant: 'destructive'
      })
      return null
    }
  }
  
  // Save workout plan
  const savePlan = async (plan: AIWorkoutPlan): Promise<AIWorkoutPlan | null> => {
    if (!user) return null
    
    try {
      const { data, error } = await saveAIWorkoutPlan(plan)
      
      if (error) {
        console.error('Error saving workout plan:', error)
        toast({
          title: 'Error',
          description: 'No se pudo guardar el plan de entrenamiento',
          variant: 'destructive'
        })
        return null
      }
      
      // Update local state
      await loadWorkoutPlans()
      
      return data
    } catch (error) {
      console.error('Error saving workout plan:', error)
      toast({
        title: 'Error',
        description: 'No se pudo guardar el plan de entrenamiento',
        variant: 'destructive'
      })
      return null
    }
  }
  
  // Delete workout plan
  const deletePlan = async (planId: string): Promise<boolean> => {
    if (!user) return false
    
    try {
      const { success, error } = await deleteAIWorkoutPlan(planId)
      
      if (error) {
        console.error('Error deleting workout plan:', error)
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el plan de entrenamiento',
          variant: 'destructive'
        })
        return false
      }
      
      // Update local state
      await loadWorkoutPlans()
      
      return success
    } catch (error) {
      console.error('Error deleting workout plan:', error)
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el plan de entrenamiento',
        variant: 'destructive'
      })
      return false
    }
  }
  
  // Ask AI assistant
  const askAssistant = async (query: string, context?: any): Promise<AIResponse | null> => {
    if (!user) return null
    
    try {
      setIsLoadingAssistant(true)
      const { data, error } = await askAI(query, context)
      
      if (error) {
        console.error('Error asking AI assistant:', error)
        toast({
          title: 'Error',
          description: 'No se pudo procesar tu consulta',
          variant: 'destructive'
        })
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error asking AI assistant:', error)
      toast({
        title: 'Error',
        description: 'No se pudo procesar tu consulta',
        variant: 'destructive'
      })
      return null
    } finally {
      setIsLoadingAssistant(false)
    }
  }
  
  // Load initial data when user changes
  useEffect(() => {
    if (user) {
      loadRecommendations()
      loadProgressAnalysis()
      loadWorkoutPlans()
    } else {
      // Reset state when user logs out
      setRecommendations([])
      setProgressAnalysis(null)
      setWorkoutPlans([])
    }
  }, [user])
  
  const value = {
    // Recommendations
    recommendations,
    isLoadingRecommendations,
    loadRecommendations,
    
    // Progress Analysis
    progressAnalysis,
    isLoadingAnalysis,
    loadProgressAnalysis,
    
    // Workout Plans
    workoutPlans,
    isLoadingPlans,
    loadWorkoutPlans,
    generateWorkoutPlan,
    savePlan,
    deletePlan,
    
    // AI Assistant
    askAssistant,
    isLoadingAssistant
  }
  
  return <AIContext.Provider value={value}>{children}</AIContext.Provider>
}

export function useAI() {
  const context = useContext(AIContext)
  
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider')
  }
  
  return context
}
