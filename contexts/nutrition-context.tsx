"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { 
  getNutritionEntries, 
  addNutritionEntry, 
  updateNutritionEntry, 
  deleteNutritionEntry,
  searchFoodDatabase,
  getFoodById,
  getUserCustomFoods,
  addCustomFood,
  updateCustomFood,
  deleteCustomFood,
  getUserMealPlans,
  getMealPlanById,
  getMealPlanDetails,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  getUserNutritionGoals,
  setNutritionGoals,
  getWaterLog,
  addWaterEntry,
  deleteWaterEntry,
  getDailyNutritionStats
} from '@/lib/nutrition-service'
import {
  NutritionEntry,
  FoodItem,
  CustomFood,
  MealPlan,
  MealPlanDetail,
  NutritionGoal,
  WaterLog,
  DailyNutrition
} from '@/lib/types/nutrition'
import { useToast } from '@/components/ui/use-toast'
import { useSupabaseOperation } from '@/hooks/use-supabase-operation'
import { format } from 'date-fns'

interface NutritionContextType {
  // Entradas de nutrición
  nutritionEntries: NutritionEntry[]
  isLoadingEntries: boolean
  entriesError: any
  
  // Alimentos
  searchResults: FoodItem[]
  isSearching: boolean
  searchError: any
  
  // Alimentos personalizados
  customFoods: CustomFood[]
  isLoadingCustomFoods: boolean
  customFoodsError: any
  
  // Planes de comida
  mealPlans: MealPlan[]
  currentMealPlan: MealPlan | null
  mealPlanDetails: MealPlanDetail[]
  isLoadingMealPlans: boolean
  isLoadingMealPlan: boolean
  mealPlanError: any
  
  // Objetivos nutricionales
  nutritionGoals: NutritionGoal | null
  isLoadingGoals: boolean
  goalsError: any
  
  // Registro de agua
  waterLogs: WaterLog[]
  isLoadingWaterLogs: boolean
  waterLogsError: any
  
  // Estadísticas diarias
  dailyStats: DailyNutrition | null
  isLoadingDailyStats: boolean
  dailyStatsError: any
  
  // Funciones
  loadNutritionEntries: (date?: string) => Promise<void>
  addEntry: (entry: Omit<NutritionEntry, 'id' | 'created_at'>) => Promise<NutritionEntry | null>
  updateEntry: (id: string, updates: Partial<NutritionEntry>) => Promise<NutritionEntry | null>
  deleteEntry: (id: string) => Promise<boolean>
  
  searchFoods: (query: string) => Promise<void>
  getFood: (id: string) => Promise<FoodItem | null>
  
  loadCustomFoods: () => Promise<void>
  addCustomFood: (food: Omit<CustomFood, 'id' | 'created_at'>) => Promise<CustomFood | null>
  updateCustomFood: (id: string, updates: Partial<CustomFood>) => Promise<CustomFood | null>
  deleteCustomFood: (id: string) => Promise<boolean>
  
  loadMealPlans: () => Promise<void>
  loadMealPlan: (id: string) => Promise<MealPlan | null>
  createMealPlan: (mealPlan: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>, details: Omit<MealPlanDetail, 'id' | 'meal_plan_id' | 'created_at'>[]) => Promise<MealPlan | null>
  updateMealPlan: (id: string, updates: Partial<MealPlan>) => Promise<MealPlan | null>
  deleteMealPlan: (id: string) => Promise<boolean>
  
  loadNutritionGoals: () => Promise<void>
  saveNutritionGoals: (goals: Omit<NutritionGoal, 'id' | 'created_at' | 'updated_at'>) => Promise<NutritionGoal | null>
  
  loadWaterLogs: (date: string) => Promise<void>
  addWaterEntry: (entry: Omit<WaterLog, 'id' | 'created_at'>) => Promise<WaterLog | null>
  deleteWaterEntry: (id: string) => Promise<boolean>
  
  loadDailyStats: (date: string) => Promise<void>
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined)

interface NutritionProviderProps {
  children: ReactNode
}

export function NutritionProvider({ children }: NutritionProviderProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const { execute } = useSupabaseOperation()
  
  // Estado para entradas de nutrición
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>([])
  const [isLoadingEntries, setIsLoadingEntries] = useState(false)
  const [entriesError, setEntriesError] = useState<any>(null)
  
  // Estado para búsqueda de alimentos
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<any>(null)
  
  // Estado para alimentos personalizados
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([])
  const [isLoadingCustomFoods, setIsLoadingCustomFoods] = useState(false)
  const [customFoodsError, setCustomFoodsError] = useState<any>(null)
  
  // Estado para planes de comida
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null)
  const [mealPlanDetails, setMealPlanDetails] = useState<MealPlanDetail[]>([])
  const [isLoadingMealPlans, setIsLoadingMealPlans] = useState(false)
  const [isLoadingMealPlan, setIsLoadingMealPlan] = useState(false)
  const [mealPlanError, setMealPlanError] = useState<any>(null)
  
  // Estado para objetivos nutricionales
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoal | null>(null)
  const [isLoadingGoals, setIsLoadingGoals] = useState(false)
  const [goalsError, setGoalsError] = useState<any>(null)
  
  // Estado para registro de agua
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([])
  const [isLoadingWaterLogs, setIsLoadingWaterLogs] = useState(false)
  const [waterLogsError, setWaterLogsError] = useState<any>(null)
  
  // Estado para estadísticas diarias
  const [dailyStats, setDailyStats] = useState<DailyNutrition | null>(null)
  const [isLoadingDailyStats, setIsLoadingDailyStats] = useState(false)
  const [dailyStatsError, setDailyStatsError] = useState<any>(null)
  
  // Cargar entradas de nutrición
  const loadNutritionEntries = async (date?: string) => {
    if (!user) return
    
    setIsLoadingEntries(true)
    setEntriesError(null)
    
    try {
      const options = date ? { date } : undefined
      const { data, error } = await getNutritionEntries(user.id, options)
      
      if (error) {
        throw error
      }
      
      setNutritionEntries(data || [])
    } catch (error) {
      console.error('Error al cargar entradas de nutrición:', error)
      setEntriesError(error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las entradas de nutrición',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingEntries(false)
    }
  }
  
  // Añadir entrada de nutrición
  const addEntry = async (entry: Omit<NutritionEntry, 'id' | 'created_at'>): Promise<NutritionEntry | null> => {
    if (!user) return null
    
    return await execute(
      async () => {
        const { data, error } = await addNutritionEntry(entry)
        
        if (error) {
          throw error
        }
        
        // Actualizar la lista de entradas
        setNutritionEntries(prev => [data, ...prev])
        
        // Actualizar estadísticas diarias si corresponde
        if (data.date === format(new Date(), 'yyyy-MM-dd')) {
          loadDailyStats(data.date)
        }
        
        return data
      },
      {
        loadingMessage: 'Guardando entrada...',
        successMessage: 'Entrada guardada correctamente',
        errorMessage: 'Error al guardar la entrada',
      }
    )
  }
  
  // Actualizar entrada de nutrición
  const updateEntry = async (id: string, updates: Partial<NutritionEntry>): Promise<NutritionEntry | null> => {
    if (!user) return null
    
    return await execute(
      async () => {
        const { data, error } = await updateNutritionEntry(id, updates)
        
        if (error) {
          throw error
        }
        
        // Actualizar la lista de entradas
        setNutritionEntries(prev => 
          prev.map(entry => entry.id === id ? data : entry)
        )
        
        // Actualizar estadísticas diarias si corresponde
        if (data.date === format(new Date(), 'yyyy-MM-dd')) {
          loadDailyStats(data.date)
        }
        
        return data
      },
      {
        loadingMessage: 'Actualizando entrada...',
        successMessage: 'Entrada actualizada correctamente',
        errorMessage: 'Error al actualizar la entrada',
      }
    )
  }
  
  // Eliminar entrada de nutrición
  const deleteEntry = async (id: string): Promise<boolean> => {
    if (!user) return false
    
    return await execute(
      async () => {
        const { error } = await deleteNutritionEntry(id)
        
        if (error) {
          throw error
        }
        
        // Actualizar la lista de entradas
        setNutritionEntries(prev => prev.filter(entry => entry.id !== id))
        
        // Actualizar estadísticas diarias
        const today = format(new Date(), 'yyyy-MM-dd')
        const deletedEntry = nutritionEntries.find(entry => entry.id === id)
        if (deletedEntry && deletedEntry.date === today) {
          loadDailyStats(today)
        }
        
        return true
      },
      {
        loadingMessage: 'Eliminando entrada...',
        successMessage: 'Entrada eliminada correctamente',
        errorMessage: 'Error al eliminar la entrada',
      }
    )
  }
  
  // Buscar alimentos
  const searchFoods = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    setSearchError(null)
    
    try {
      const { data, error } = await searchFoodDatabase(query)
      
      if (error) {
        throw error
      }
      
      setSearchResults(data || [])
    } catch (error) {
      console.error('Error al buscar alimentos:', error)
      setSearchError(error)
      toast({
        title: 'Error',
        description: 'No se pudieron buscar alimentos',
        variant: 'destructive',
      })
    } finally {
      setIsSearching(false)
    }
  }
  
  // Obtener alimento por ID
  const getFood = async (id: string): Promise<FoodItem | null> => {
    try {
      const { data, error } = await getFoodById(id)
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Error al obtener alimento:', error)
      toast({
        title: 'Error',
        description: 'No se pudo obtener el alimento',
        variant: 'destructive',
      })
      return null
    }
  }
  
  // Cargar alimentos personalizados
  const loadCustomFoods = async () => {
    if (!user) return
    
    setIsLoadingCustomFoods(true)
    setCustomFoodsError(null)
    
    try {
      const { data, error } = await getUserCustomFoods(user.id)
      
      if (error) {
        throw error
      }
      
      setCustomFoods(data || [])
    } catch (error) {
      console.error('Error al cargar alimentos personalizados:', error)
      setCustomFoodsError(error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los alimentos personalizados',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingCustomFoods(false)
    }
  }
  
  // Añadir alimento personalizado
  const addCustomFoodItem = async (food: Omit<CustomFood, 'id' | 'created_at'>): Promise<CustomFood | null> => {
    if (!user) return null
    
    return await execute(
      async () => {
        const { data, error } = await addCustomFood(food)
        
        if (error) {
          throw error
        }
        
        // Actualizar la lista de alimentos personalizados
        setCustomFoods(prev => [...prev, data])
        
        return data
      },
      {
        loadingMessage: 'Guardando alimento...',
        successMessage: 'Alimento guardado correctamente',
        errorMessage: 'Error al guardar el alimento',
      }
    )
  }
  
  // Actualizar alimento personalizado
  const updateCustomFoodItem = async (id: string, updates: Partial<CustomFood>): Promise<CustomFood | null> => {
    if (!user) return null
    
    return await execute(
      async () => {
        const { data, error } = await updateCustomFood(id, updates)
        
        if (error) {
          throw error
        }
        
        // Actualizar la lista de alimentos personalizados
        setCustomFoods(prev => 
          prev.map(food => food.id === id ? data : food)
        )
        
        return data
      },
      {
        loadingMessage: 'Actualizando alimento...',
        successMessage: 'Alimento actualizado correctamente',
        errorMessage: 'Error al actualizar el alimento',
      }
    )
  }
  
  // Eliminar alimento personalizado
  const deleteCustomFoodItem = async (id: string): Promise<boolean> => {
    if (!user) return false
    
    return await execute(
      async () => {
        const { error } = await deleteCustomFood(id)
        
        if (error) {
          throw error
        }
        
        // Actualizar la lista de alimentos personalizados
        setCustomFoods(prev => prev.filter(food => food.id !== id))
        
        return true
      },
      {
        loadingMessage: 'Eliminando alimento...',
        successMessage: 'Alimento eliminado correctamente',
        errorMessage: 'Error al eliminar el alimento',
      }
    )
  }
  
  // Cargar planes de comida
  const loadMealPlans = async () => {
    if (!user) return
    
    setIsLoadingMealPlans(true)
    setMealPlanError(null)
    
    try {
      const { data, error } = await getUserMealPlans(user.id)
      
      if (error) {
        throw error
      }
      
      setMealPlans(data || [])
    } catch (error) {
      console.error('Error al cargar planes de comida:', error)
      setMealPlanError(error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los planes de comida',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingMealPlans(false)
    }
  }
  
  // Cargar plan de comida específico
  const loadMealPlan = async (id: string): Promise<MealPlan | null> => {
    if (!user) return null
    
    setIsLoadingMealPlan(true)
    setMealPlanError(null)
    
    try {
      const { data: plan, error: planError } = await getMealPlanById(id)
      
      if (planError) {
        throw planError
      }
      
      if (!plan) {
        throw new Error('No se encontró el plan de comida')
      }
      
      setCurrentMealPlan(plan)
      
      // Cargar detalles del plan
      const { data: details, error: detailsError } = await getMealPlanDetails(id)
      
      if (detailsError) {
        throw detailsError
      }
      
      setMealPlanDetails(details || [])
      
      return plan
    } catch (error) {
      console.error('Error al cargar plan de comida:', error)
      setMealPlanError(error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar el plan de comida',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsLoadingMealPlan(false)
    }
  }
  
  // Crear plan de comida
  const createNewMealPlan = async (
    mealPlan: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>,
    details: Omit<MealPlanDetail, 'id' | 'meal_plan_id' | 'created_at'>[]
  ): Promise<MealPlan | null> => {
    if (!user) return null
    
    return await execute(
      async () => {
        const { data, error } = await createMealPlan(mealPlan, details)
        
        if (error) {
          throw error
        }
        
        // Actualizar la lista de planes
        setMealPlans(prev => [...prev, data])
        
        return data
      },
      {
        loadingMessage: 'Creando plan de comida...',
        successMessage: 'Plan de comida creado correctamente',
        errorMessage: 'Error al crear el plan de comida',
      }
    )
  }
  
  // Actualizar plan de comida
  const updateMealPlanItem = async (id: string, updates: Partial<MealPlan>): Promise<MealPlan | null> => {
    if (!user) return null
    
    return await execute(
      async () => {
        const { data, error } = await updateMealPlan(id, updates)
        
        if (error) {
          throw error
        }
        
        // Actualizar la lista de planes
        setMealPlans(prev => 
          prev.map(plan => plan.id === id ? data : plan)
        )
        
        // Actualizar el plan actual si es el mismo
        if (currentMealPlan && currentMealPlan.id === id) {
          setCurrentMealPlan(data)
        }
        
        return data
      },
      {
        loadingMessage: 'Actualizando plan de comida...',
        successMessage: 'Plan de comida actualizado correctamente',
        errorMessage: 'Error al actualizar el plan de comida',
      }
    )
  }
  
  // Eliminar plan de comida
  const deleteMealPlanItem = async (id: string): Promise<boolean> => {
    if (!user) return false
    
    return await execute(
      async () => {
        const { error } = await deleteMealPlan(id)
        
        if (error) {
          throw error
        }
        
        // Actualizar la lista de planes
        setMealPlans(prev => prev.filter(plan => plan.id !== id))
        
        // Limpiar el plan actual si es el mismo
        if (currentMealPlan && currentMealPlan.id === id) {
          setCurrentMealPlan(null)
          setMealPlanDetails([])
        }
        
        return true
      },
      {
        loadingMessage: 'Eliminando plan de comida...',
        successMessage: 'Plan de comida eliminado correctamente',
        errorMessage: 'Error al eliminar el plan de comida',
      }
    )
  }
  
  // Cargar objetivos nutricionales
  const loadNutritionGoals = async () => {
    if (!user) return
    
    setIsLoadingGoals(true)
    setGoalsError(null)
    
    try {
      const { data, error } = await getUserNutritionGoals(user.id)
      
      if (error) {
        throw error
      }
      
      setNutritionGoals(data)
    } catch (error) {
      console.error('Error al cargar objetivos nutricionales:', error)
      setGoalsError(error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los objetivos nutricionales',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingGoals(false)
    }
  }
  
  // Guardar objetivos nutricionales
  const saveNutritionGoalsItem = async (goals: Omit<NutritionGoal, 'id' | 'created_at' | 'updated_at'>): Promise<NutritionGoal | null> => {
    if (!user) return null
    
    return await execute(
      async () => {
        const { data, error } = await setNutritionGoals(goals)
        
        if (error) {
          throw error
        }
        
        setNutritionGoals(data)
        return data
      },
      {
        loadingMessage: 'Guardando objetivos...',
        successMessage: 'Objetivos guardados correctamente',
        errorMessage: 'Error al guardar los objetivos',
      }
    )
  }
  
  // Cargar registros de agua
  const loadWaterLogs = async (date: string) => {
    if (!user) return
    
    setIsLoadingWaterLogs(true)
    setWaterLogsError(null)
    
    try {
      const { data, error } = await getWaterLog(user.id, date)
      
      if (error) {
        throw error
      }
      
      setWaterLogs(data || [])
    } catch (error) {
      console.error('Error al cargar registros de agua:', error)
      setWaterLogsError(error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los registros de agua',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingWaterLogs(false)
    }
  }
  
  // Añadir registro de agua
  const addWaterEntryItem = async (entry: Omit<WaterLog, 'id' | 'created_at'>): Promise<WaterLog | null> => {
    if (!user) return null
    
    return await execute(
      async () => {
        const { data, error } = await addWaterEntry(entry)
        
        if (error) {
          throw error
        }
        
        // Actualizar la lista de registros
        setWaterLogs(prev => [...prev, data])
        
        return data
      },
      {
        loadingMessage: 'Guardando registro...',
        successMessage: 'Registro de agua guardado correctamente',
        errorMessage: 'Error al guardar el registro de agua',
      }
    )
  }
  
  // Eliminar registro de agua
  const deleteWaterEntryItem = async (id: string): Promise<boolean> => {
    if (!user) return false
    
    return await execute(
      async () => {
        const { error } = await deleteWaterEntry(id)
        
        if (error) {
          throw error
        }
        
        // Actualizar la lista de registros
        setWaterLogs(prev => prev.filter(log => log.id !== id))
        
        return true
      },
      {
        loadingMessage: 'Eliminando registro...',
        successMessage: 'Registro de agua eliminado correctamente',
        errorMessage: 'Error al eliminar el registro de agua',
      }
    )
  }
  
  // Cargar estadísticas diarias
  const loadDailyStats = async (date: string) => {
    if (!user) return
    
    setIsLoadingDailyStats(true)
    setDailyStatsError(null)
    
    try {
      const { data, error } = await getDailyNutritionStats(user.id, date)
      
      if (error) {
        throw error
      }
      
      setDailyStats(data)
    } catch (error) {
      console.error('Error al cargar estadísticas diarias:', error)
      setDailyStatsError(error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las estadísticas diarias',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingDailyStats(false)
    }
  }
  
  // Cargar datos iniciales cuando hay un usuario
  useEffect(() => {
    if (user) {
      const today = format(new Date(), 'yyyy-MM-dd')
      loadNutritionEntries(today)
      loadCustomFoods()
      loadMealPlans()
      loadNutritionGoals()
      loadWaterLogs(today)
      loadDailyStats(today)
    } else {
      // Limpiar datos cuando no hay usuario
      setNutritionEntries([])
      setSearchResults([])
      setCustomFoods([])
      setMealPlans([])
      setCurrentMealPlan(null)
      setMealPlanDetails([])
      setNutritionGoals(null)
      setWaterLogs([])
      setDailyStats(null)
    }
  }, [user])
  
  const value = {
    // Entradas de nutrición
    nutritionEntries,
    isLoadingEntries,
    entriesError,
    
    // Alimentos
    searchResults,
    isSearching,
    searchError,
    
    // Alimentos personalizados
    customFoods,
    isLoadingCustomFoods,
    customFoodsError,
    
    // Planes de comida
    mealPlans,
    currentMealPlan,
    mealPlanDetails,
    isLoadingMealPlans,
    isLoadingMealPlan,
    mealPlanError,
    
    // Objetivos nutricionales
    nutritionGoals,
    isLoadingGoals,
    goalsError,
    
    // Registro de agua
    waterLogs,
    isLoadingWaterLogs,
    waterLogsError,
    
    // Estadísticas diarias
    dailyStats,
    isLoadingDailyStats,
    dailyStatsError,
    
    // Funciones
    loadNutritionEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    
    searchFoods,
    getFood,
    
    loadCustomFoods,
    addCustomFood: addCustomFoodItem,
    updateCustomFood: updateCustomFoodItem,
    deleteCustomFood: deleteCustomFoodItem,
    
    loadMealPlans,
    loadMealPlan,
    createMealPlan: createNewMealPlan,
    updateMealPlan: updateMealPlanItem,
    deleteMealPlan: deleteMealPlanItem,
    
    loadNutritionGoals,
    saveNutritionGoals: saveNutritionGoalsItem,
    
    loadWaterLogs,
    addWaterEntry: addWaterEntryItem,
    deleteWaterEntry: deleteWaterEntryItem,
    
    loadDailyStats
  }
  
  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  )
}

export function useNutrition() {
  const context = useContext(NutritionContext)
  
  if (context === undefined) {
    throw new Error('useNutrition debe ser usado dentro de un NutritionProvider')
  }
  
  return context
}

export default NutritionProvider
