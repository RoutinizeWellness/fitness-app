"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import {
  getNutritionEntries,
  addNutritionEntry,
  updateNutritionEntry,
  deleteNutritionEntry,
  getUserNutritionGoals,
  setNutritionGoals,
  getWaterLog,
  addWaterEntry,
  deleteWaterEntry,
  getDailyNutritionStats
} from '@/lib/supabase/nutrition-service'
import {
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
  deleteMealPlan
} from '@/lib/nutrition-service'
import spanishFoodService from '@/lib/spanish-food-service'
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
import { useSupabaseOperation } from '../hooks/use-supabase-operation'
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

  // Initialize Supabase client
  const supabase = createClient()

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
      // Buscar en la base de datos de Supabase
      const { data: supabaseData, error } = await searchFoodDatabase(query)

      if (error) {
        throw error
      }

      // Si hay resultados en Supabase, verificar si hay alimentos españoles con el mismo ID
      // para evitar duplicados y asegurarse de que los datos de Supabase tienen prioridad
      const supabaseIds = new Set((supabaseData || []).map(food => food.id))

      // Buscar en la base de datos local de alimentos españoles
      const spanishData = spanishFoodService.searchSpanishFoods(query, { limit: 10 })

      // Filtrar alimentos españoles que ya existen en Supabase
      const uniqueSpanishData = spanishData.filter(food => !supabaseIds.has(food.id))

      // Combinar resultados, priorizando los de Supabase
      const combinedResults = [...(supabaseData || []), ...uniqueSpanishData];

      // Ordenar resultados por relevancia (primero los que coinciden exactamente con el término de búsqueda)
      const normalizedQuery = query.toLowerCase().trim()
      combinedResults.sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().includes(normalizedQuery) ? 1 : 0
        const bNameMatch = b.name.toLowerCase().includes(normalizedQuery) ? 1 : 0
        return bNameMatch - aNameMatch
      })

      setSearchResults(combinedResults)
    } catch (error) {
      console.error('Error al buscar alimentos:', error)
      setSearchError(error)

      // Intentar buscar solo en la base de datos local como fallback
      try {
        const spanishData = spanishFoodService.searchSpanishFoods(query, { limit: 20 })
        if (spanishData.length > 0) {
          setSearchResults(spanishData)
          toast({
            title: 'Información',
            description: 'Mostrando resultados de la base de datos local',
            variant: 'default',
          })
          return
        }
      } catch (localError) {
        console.error('Error en búsqueda local:', localError)
      }

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
      // Primero intentar obtener el alimento de Supabase, independientemente del ID
      const { data, error } = await getFoodById(id)

      // Si se encuentra en Supabase, devolverlo
      if (!error && data) {
        return data
      }

      // Si no se encuentra en Supabase y es un ID de alimento español (comienza con "es-"),
      // buscarlo en la base de datos local
      if (id.startsWith('es-')) {
        const spanishFood = spanishFoodService.getSpanishFoodById(id)
        if (spanishFood) {
          // Intentar guardar el alimento en Supabase para futuras consultas
          try {
            await spanishFoodService.saveSpanishFoodToSupabase(spanishFood)
            console.log(`Alimento español ${id} guardado en Supabase para futuras consultas`)
          } catch (saveError) {
            console.warn(`No se pudo guardar el alimento español ${id} en Supabase:`, saveError)
          }

          return spanishFood
        }
      }

      // Si llegamos aquí, el alimento no se encontró ni en Supabase ni en la base de datos local
      if (error) {
        throw error
      }

      return null
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
        // Si el error contiene un mensaje sobre la tabla no existente, mostrar un mensaje más amigable
        if (error.message && error.message.includes('no existe')) {
          console.warn('La tabla custom_foods no existe en Supabase:', error.message)

          // Establecer un array vacío para evitar errores en la UI
          setCustomFoods([])

          toast({
            title: 'Información',
            description: 'La funcionalidad de alimentos personalizados no está disponible en este momento. Se está configurando la base de datos.',
            variant: 'default',
          })

          setIsLoadingCustomFoods(false)
          return
        }

        // Manejar errores vacíos
        if (typeof error === 'object' && Object.keys(error).length === 0) {
          console.error('Error vacío detectado al cargar alimentos personalizados. Esto podría indicar un problema de conexión o un error en la estructura de datos.')
          throw new Error('Error desconocido al cargar alimentos personalizados. Verifica la conexión y la estructura de datos.')
        }
        throw error
      }

      setCustomFoods(data || [])
    } catch (error) {
      console.error('Error al cargar alimentos personalizados:', error)
      setCustomFoodsError(error)

      // Mostrar un mensaje de error más descriptivo
      let errorMessage = 'No se pudieron cargar los alimentos personalizados'
      if (error instanceof Error && error.message) {
        errorMessage = error.message
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })

      // Establecer un array vacío para evitar errores en la UI
      setCustomFoods([])
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
      // Verificar la conexión a Supabase antes de hacer la consulta
      try {
        // Verificar que supabase esté definido
        if (!supabase) {
          console.error('Error: supabase no está definido en nutrition-context.tsx');
          throw new Error('La instancia de Supabase no está definida. Verifica la configuración.');
        }

        const { data: connectionTest, error: connectionError } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1);

        if (connectionError) {
          console.error('Error de conexión a Supabase:', connectionError);
          throw new Error('No se pudo conectar a la base de datos. Verifica tu conexión a internet.');
        }
      } catch (connectionTestError) {
        console.error('Error al verificar la conexión:', connectionTestError);
        throw new Error('No se pudo verificar la conexión a la base de datos.');
      }

      const { data, error } = await getUserNutritionGoals(user.id)

      // Importar la función isEmptyErrorObject desde error-utils
      const { isEmptyErrorObject } = await import('@/lib/error-utils');

      if (error) {
        // Si el error contiene un mensaje sobre la tabla no existente, mostrar un mensaje más amigable
        if (error.message && error.message.includes('no existe')) {
          console.warn('La tabla nutrition_goals no existe en Supabase:', error.message)

          // Establecer valores predeterminados para evitar errores en la UI
          setNutritionGoals({
            id: 'default',
            user_id: user.id,
            calories: 2000,
            protein: 150,
            carbs: 200,
            fat: 70,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

          toast({
            title: 'Información',
            description: 'Los objetivos nutricionales no están disponibles en este momento. Se está configurando la base de datos.',
            variant: 'default',
          })

          setIsLoadingGoals(false)
          return
        }

        // Manejar errores vacíos usando la función especializada
        if (isEmptyErrorObject(error)) {
          console.error('Error vacío detectado al cargar objetivos nutricionales. Esto podría indicar un problema de conexión o un error en la estructura de datos.')

          // Log detallado para diagnóstico
          console.info('Detalles del error vacío:', {
            errorType: typeof error,
            errorKeys: Object.keys(error),
            errorJSON: JSON.stringify(error),
            timestamp: new Date().toISOString(),
            userId: user.id
          });

          // Establecer valores predeterminados para evitar errores en la UI
          setNutritionGoals({
            id: 'default',
            user_id: user.id,
            calories: 2000,
            protein: 150,
            carbs: 200,
            fat: 70,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

          // Intentar crear la tabla si no existe
          try {
            // Verificar que supabase esté definido
            if (!supabase) {
              console.error('Error: supabase no está definido al intentar crear tabla');
              toast({
                title: 'Error de conexión',
                description: 'No se pudo conectar a la base de datos. Por favor, recarga la página.',
                variant: 'destructive',
              })
              return;
            }

            // Intentar crear la tabla de objetivos nutricionales
            const { error: rpcError } = await supabase.rpc('create_nutrition_goals_if_not_exists');

            if (rpcError) {
              console.error('Error al intentar crear la tabla:', rpcError);
              toast({
                title: 'Error',
                description: 'No se pudo configurar la base de datos. Por favor, inténtalo más tarde.',
                variant: 'destructive',
              })
            } else {
              toast({
                title: 'Información',
                description: 'Se ha configurado la estructura necesaria. Por favor, recarga la página.',
                variant: 'default',
              })
            }

            return;
          } catch (rpcError) {
            console.error('Error al intentar crear la tabla:', rpcError);
            // No lanzar error para evitar romper la UI
            toast({
              title: 'Error',
              description: 'Error al configurar la base de datos. Por favor, contacta al soporte técnico.',
              variant: 'destructive',
            })
            return;
          }
        }
        throw error
      }

      setNutritionGoals(data)
    } catch (error) {
      console.error('Error al cargar objetivos nutricionales:', error)
      setGoalsError(error)

      // Importar la función getUserFriendlyErrorMessage desde error-utils si aún no está importada
      const { getUserFriendlyErrorMessage } = await import('@/lib/error-utils');

      // Obtener un mensaje de error más descriptivo usando la función especializada
      const errorMessage = getUserFriendlyErrorMessage(
        error,
        'No se pudieron cargar los objetivos nutricionales. Verifica tu conexión a internet e inténtalo de nuevo.'
      );

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })

      // Establecer valores predeterminados para evitar errores en la UI
      setNutritionGoals({
        id: 'default',
        user_id: user.id,
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 70,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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

      // Importar la función isEmptyErrorObject desde error-utils
      const { isEmptyErrorObject } = await import('@/lib/error-utils');

      if (error) {
        // Si el error contiene un mensaje sobre la tabla no existente, mostrar un mensaje más amigable
        if (error.message && error.message.includes('no existe')) {
          console.warn('La tabla water_log no existe en Supabase:', error.message)

          // Establecer un array vacío para evitar errores en la UI
          setWaterLogs([])

          toast({
            title: 'Información',
            description: 'El registro de agua no está disponible en este momento. Se está configurando la base de datos.',
            variant: 'default',
          })

          setIsLoadingWaterLogs(false)
          return
        }

        // Manejar errores vacíos usando la función especializada
        if (isEmptyErrorObject(error)) {
          console.error('Error vacío detectado al cargar registros de agua. Esto podría indicar un problema de conexión o un error en la estructura de datos.')

          // Log detallado para diagnóstico
          console.info('Detalles del error vacío en water_log:', {
            errorType: typeof error,
            errorKeys: Object.keys(error),
            errorJSON: JSON.stringify(error),
            timestamp: new Date().toISOString(),
            userId: user.id,
            date: date
          });

          // Establecer un array vacío para evitar errores en la UI
          setWaterLogs([])

          toast({
            title: 'Información',
            description: 'Error de conexión al cargar registros de agua. Verifica tu conexión a internet e inténtalo de nuevo.',
            variant: 'default',
          })

          setIsLoadingWaterLogs(false)
          return
        }
        throw error
      }

      setWaterLogs(data || [])
    } catch (error) {
      console.error('Error al cargar registros de agua:', error)
      setWaterLogsError(error)

      // Importar la función getUserFriendlyErrorMessage desde error-utils si aún no está importada
      const { getUserFriendlyErrorMessage } = await import('@/lib/error-utils');

      // Obtener un mensaje de error más descriptivo usando la función especializada
      const errorMessage = getUserFriendlyErrorMessage(
        error,
        'No se pudieron cargar los registros de agua. Verifica tu conexión a internet e inténtalo de nuevo.'
      );

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })

      // Establecer un array vacío para evitar errores en la UI
      setWaterLogs([])
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
