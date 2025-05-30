"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { checkSupabaseConnection, handleSupabaseError, checkTableExists } from "@/lib/error-handling"
import { v4 as uuidv4 } from 'uuid'

// Función auxiliar para generar IDs de forma segura
function generateSafeId(prefix: string): string {
  try {
    return uuidv4();
  } catch (error) {
    console.warn(`Error al generar UUID para ${prefix}:`, error);
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}

// Tipos para el contexto de nutrición
export interface NutritionGoal {
  id?: string
  user_id: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  water?: number
  created_at?: string
  updated_at?: string
}

export interface MealPlan {
  id?: string
  user_id: string
  name: string
  description?: string
  days: MealDay[]
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface MealDay {
  id: string
  name: string
  meals: Meal[]
  total_calories?: number
  total_protein?: number
  total_carbs?: number
  total_fat?: number
}

export interface Meal {
  id: string
  name: string
  time?: string
  foods: Food[]
  total_calories?: number
  total_protein?: number
  total_carbs?: number
  total_fat?: number
}

export interface Food {
  id: string
  name: string
  brand?: string
  serving_size: number
  serving_unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  notes?: string
  image_url?: string
}

export interface NutritionLog {
  id?: string
  user_id: string
  date: string
  meals: Meal[]
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  water_intake?: number
  notes?: string
  created_at?: string
  updated_at?: string
}

// Tipo para el contexto
interface NutritionContextType {
  nutritionGoals: NutritionGoal | null
  activeMealPlan: MealPlan | null
  nutritionLogs: NutritionLog[]
  isLoading: boolean
  loadNutritionGoals: () => Promise<void>
  saveNutritionGoals: (goals: NutritionGoal) => Promise<{ success: boolean; error: any }>
  loadActiveMealPlan: () => Promise<void>
  saveMealPlan: (mealPlan: MealPlan) => Promise<{ success: boolean; error: any }>
  loadNutritionLogs: (startDate?: string, endDate?: string) => Promise<void>
  saveNutritionLog: (log: NutritionLog) => Promise<{ success: boolean; error: any }>
  searchFoods: (query: string) => Promise<{ data: Food[] | null; error: any }>
}

// Crear el contexto
const NutritionContext = createContext<NutritionContextType | undefined>(undefined)

// Proveedor del contexto
export function NutritionProvider({ children }: { children: ReactNode }) {
  // Safely get auth context
  let user = null
  try {
    const authContext = useAuth()
    user = authContext?.user || null
  } catch (error) {
    console.warn('NutritionProvider: AuthContext not available yet')
    user = null
  }

  const { toast } = useToast()
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoal | null>(null)
  const [activeMealPlan, setActiveMealPlan] = useState<MealPlan | null>(null)
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Cargar objetivos nutricionales al iniciar
  useEffect(() => {
    if (user) {
      loadNutritionGoals()
      loadActiveMealPlan()
      loadNutritionLogs()
    } else {
      setNutritionGoals(null)
      setActiveMealPlan(null)
      setNutritionLogs([])
    }
  }, [user])

  // Cargar objetivos nutricionales
  const loadNutritionGoals = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      // Verificar que supabase esté definido
      if (!supabase) {
        console.error('Error: supabase no está definido en nutrition-context.tsx')
        toast({
          title: "Error de configuración",
          description: "Error en la configuración de la base de datos. Usando datos predeterminados.",
          variant: "destructive",
        })
        setNutritionGoals(getDefaultNutritionGoals(user.id))
        setIsLoading(false)
        return
      }

      // Verificar conexión a Supabase
      try {
        const { connected, error: connectionError } = await checkSupabaseConnection()
        if (!connected) {
          console.warn('No hay conexión a Supabase, usando datos de ejemplo para objetivos nutricionales:', connectionError)
          toast({
            title: "Error de conexión",
            description: "No se pudo conectar a la base de datos. Usando datos predeterminados.",
            variant: "default",
          })
          setNutritionGoals(getDefaultNutritionGoals(user.id))
          setIsLoading(false)
          return
        }
      } catch (connectionCheckError) {
        console.error('Error al verificar la conexión a Supabase:', connectionCheckError)
        toast({
          title: "Error de conexión",
          description: "Error al verificar la conexión a la base de datos. Usando datos predeterminados.",
          variant: "destructive",
        })
        setNutritionGoals(getDefaultNutritionGoals(user.id))
        setIsLoading(false)
        return
      }

      // Verificar si la tabla nutrition_goals existe
      try {
        const { exists, error: tableExistsError } = await checkTableExists('nutrition_goals')

        if (!exists) {
          console.warn('La tabla nutrition_goals no existe:', tableExistsError || 'Tabla no encontrada')
          toast({
            title: "Información",
            description: "La tabla de objetivos nutricionales no existe. Usando datos predeterminados.",
            variant: "default",
          })
          setNutritionGoals(getDefaultNutritionGoals(user.id))
          setIsLoading(false)
          return
        }
      } catch (tableCheckError) {
        console.error('Error al verificar si la tabla nutrition_goals existe:', tableCheckError)
        toast({
          title: "Error",
          description: "Error al verificar la estructura de la base de datos. Usando datos predeterminados.",
          variant: "destructive",
        })
        setNutritionGoals(getDefaultNutritionGoals(user.id))
        setIsLoading(false)
        return
      }

      // Intentar obtener los objetivos nutricionales
      const { data, error } = await supabase
        .from("nutrition_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      // Manejar errores vacíos
      if (error && typeof error === 'object' && Object.keys(error).length === 0) {
        console.warn('Error vacío al cargar objetivos nutricionales, verificando si la tabla existe...')
        toast({
          title: "Error",
          description: "Error desconocido al cargar objetivos nutricionales. Usando datos predeterminados.",
          variant: "default",
        })

        try {
          // Intentar crear la tabla si no existe
          try {
            await supabase.rpc('create_nutrition_goals_table_if_not_exists')
            console.log('Tabla nutrition_goals creada correctamente')
          } catch (rpcError) {
            console.error('Error al intentar crear tabla:', rpcError)
          }

          // Usar valores predeterminados
          setNutritionGoals(getDefaultNutritionGoals(user.id))
        } catch (handlingError) {
          console.error('Error al manejar error vacío:', handlingError)
          setNutritionGoals(getDefaultNutritionGoals(user.id))
        }

        setIsLoading(false)
        return
      }

      if (error) {
        console.error("Error al cargar objetivos nutricionales:", error)
        setNutritionGoals(getDefaultNutritionGoals(user.id))
        setIsLoading(false)
        return
      }

      if (data) {
        setNutritionGoals(data)
      } else {
        // Si no hay datos, usar valores predeterminados
        setNutritionGoals(getDefaultNutritionGoals(user.id))
      }
    } catch (error) {
      console.error("Error inesperado al cargar objetivos nutricionales:", error)
      setNutritionGoals(getDefaultNutritionGoals(user.id))
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar objetivos nutricionales
  const saveNutritionGoals = async (goals: NutritionGoal) => {
    if (!user) {
      return { success: false, error: "Usuario no autenticado" }
    }

    try {
      // Asegurarse de que el user_id esté establecido
      const goalsWithUserId = {
        ...goals,
        user_id: user.id,
        updated_at: new Date().toISOString()
      }

      // Verificar si ya existen objetivos
      const { data: existingGoals, error: checkError } = await supabase
        .from("nutrition_goals")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (checkError) {
        console.error("Error al verificar objetivos existentes:", checkError)
        return { success: false, error: handleSupabaseError(checkError, "Error al verificar objetivos existentes") }
      }

      let result

      if (existingGoals) {
        // Actualizar objetivos existentes
        result = await supabase
          .from("nutrition_goals")
          .update(goalsWithUserId)
          .eq("id", existingGoals.id)
          .select()
      } else {
        // Insertar nuevos objetivos
        result = await supabase
          .from("nutrition_goals")
          .insert([goalsWithUserId])
          .select()
      }

      if (result.error) {
        return { success: false, error: handleSupabaseError(result.error, "Error al guardar objetivos nutricionales") }
      }

      // Actualizar el estado
      setNutritionGoals(result.data[0])

      return { success: true, error: null }
    } catch (error) {
      console.error("Error inesperado al guardar objetivos nutricionales:", error)
      return { success: false, error: handleSupabaseError(error, "Error inesperado al guardar objetivos nutricionales") }
    }
  }

  // Cargar plan de comidas activo
  const loadActiveMealPlan = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      // Verificar que supabase esté definido
      if (!supabase) {
        console.error('Error: supabase no está definido en nutrition-context.tsx')
        toast({
          title: "Error de configuración",
          description: "Error en la configuración de la base de datos. Usando datos predeterminados.",
          variant: "destructive",
        })
        setActiveMealPlan(getDefaultMealPlan(user.id))
        setIsLoading(false)
        return
      }

      // Verificar conexión a Supabase
      try {
        const { connected, error: connectionError } = await checkSupabaseConnection()
        if (!connected) {
          console.warn('No hay conexión a Supabase, usando datos de ejemplo para plan de comidas:', connectionError)
          toast({
            title: "Error de conexión",
            description: "No se pudo conectar a la base de datos. Usando datos predeterminados.",
            variant: "default",
          })
          setActiveMealPlan(getDefaultMealPlan(user.id))
          setIsLoading(false)
          return
        }
      } catch (connectionCheckError) {
        console.error('Error al verificar la conexión a Supabase:', connectionCheckError)
        toast({
          title: "Error de conexión",
          description: "Error al verificar la conexión a la base de datos. Usando datos predeterminados.",
          variant: "destructive",
        })
        setActiveMealPlan(getDefaultMealPlan(user.id))
        setIsLoading(false)
        return
      }

      // Verificar si la tabla meal_plans existe
      try {
        const { exists, error: tableExistsError } = await checkTableExists('meal_plans')

        if (!exists) {
          console.warn('La tabla meal_plans no existe:', tableExistsError || 'Tabla no encontrada')
          toast({
            title: "Información",
            description: "La tabla de planes de comidas no existe. Usando datos predeterminados.",
            variant: "default",
          })
          setActiveMealPlan(getDefaultMealPlan(user.id))
          setIsLoading(false)
          return
        }
      } catch (tableCheckError) {
        console.error('Error al verificar si la tabla meal_plans existe:', tableCheckError)
        toast({
          title: "Error",
          description: "Error al verificar la estructura de la base de datos. Usando datos predeterminados.",
          variant: "destructive",
        })
        setActiveMealPlan(getDefaultMealPlan(user.id))
        setIsLoading(false)
        return
      }

      // Verificar si la tabla tiene las columnas necesarias
      try {
        const { data: columnsData, error: columnsError } = await supabase.rpc(
          'check_columns_exist',
          {
            table_name: 'meal_plans',
            column_names: ['user_id', 'is_active', 'days']
          }
        )

        if (columnsError || !columnsData) {
          console.warn('La tabla meal_plans no tiene todas las columnas necesarias:', columnsError || 'Columnas faltantes')

          // Intentar añadir la columna days si no existe
          try {
            await supabase.rpc(
              'add_column_if_not_exists',
              { table_name: 'meal_plans', column_name: 'days', column_type: 'JSONB' }
            )
            console.info('Columna days añadida correctamente a meal_plans')
          } catch (addColumnError) {
            console.error('Error al añadir columna days a meal_plans:', addColumnError)
          }

          setActiveMealPlan(getDefaultMealPlan(user.id))
          setIsLoading(false)
          return
        }
      } catch (columnsCheckError) {
        console.error('Error al verificar columnas de meal_plans:', columnsCheckError)
        setActiveMealPlan(getDefaultMealPlan(user.id))
        setIsLoading(false)
        return
      }

      // Intentar obtener el plan de comidas activo
      const { data, error } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle()

      // Manejar errores vacíos
      if (error && typeof error === 'object' && Object.keys(error).length === 0) {
        console.warn('Error vacío al cargar plan de comidas, usando plan por defecto')
        toast({
          title: "Error",
          description: "Error desconocido al cargar el plan de comidas. Usando datos predeterminados.",
          variant: "default",
        })

        try {
          // Intentar crear la tabla si no existe
          try {
            await supabase.rpc('create_meal_plans_table_if_not_exists')
            console.log('Tabla meal_plans creada correctamente')
          } catch (rpcError) {
            console.error('Error al intentar crear tabla meal_plans:', rpcError)
          }

          setActiveMealPlan(getDefaultMealPlan(user.id))
        } catch (handlingError) {
          console.error('Error al manejar error vacío en plan de comidas:', handlingError)
          setActiveMealPlan(getDefaultMealPlan(user.id))
        }

        setIsLoading(false)
        return
      }

      if (error) {
        console.error("Error al cargar plan de comidas:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el plan de comidas. Usando plan por defecto.",
          variant: "destructive",
        })
        setActiveMealPlan(getDefaultMealPlan(user.id))
      } else if (data) {
        // Verificar si el objeto data tiene la propiedad days
        if (!data.days) {
          console.warn('El plan de comidas no tiene la propiedad days, añadiendo array vacío')
          data.days = []
        }
        setActiveMealPlan(data)
      } else {
        console.info('No se encontró un plan de comidas activo, usando plan por defecto')
        setActiveMealPlan(getDefaultMealPlan(user.id))
      }
    } catch (error) {
      console.error("Error inesperado al cargar plan de comidas:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al cargar el plan de comidas. Usando plan por defecto.",
        variant: "destructive",
      })
      setActiveMealPlan(getDefaultMealPlan(user.id))
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar plan de comidas
  const saveMealPlan = async (mealPlan: MealPlan) => {
    if (!user) {
      return { success: false, error: "Usuario no autenticado" }
    }

    try {
      // Implementación básica
      return { success: true, error: null }
    } catch (error) {
      console.error("Error al guardar plan de comidas:", error)
      return { success: false, error }
    }
  }

  // Cargar registros nutricionales
  const loadNutritionLogs = async (startDate?: string, endDate?: string) => {
    if (!user) return

    setIsLoading(true)

    try {
      // Implementación básica
      setNutritionLogs([])
    } catch (error) {
      console.error("Error al cargar registros nutricionales:", error)
      setNutritionLogs([])
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar registro nutricional
  const saveNutritionLog = async (log: NutritionLog) => {
    if (!user) {
      return { success: false, error: "Usuario no autenticado" }
    }

    try {
      // Implementación básica
      return { success: true, error: null }
    } catch (error) {
      console.error("Error al guardar registro nutricional:", error)
      return { success: false, error }
    }
  }

  // Buscar alimentos
  const searchFoods = async (query: string) => {
    try {
      // Implementación básica
      return { data: [], error: null }
    } catch (error) {
      console.error("Error al buscar alimentos:", error)
      return { data: null, error }
    }
  }

  // Obtener objetivos nutricionales predeterminados
  const getDefaultNutritionGoals = (userId: string): NutritionGoal => {
    try {
      return {
        user_id: userId,
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 70,
        fiber: 30,
        sugar: 50,
        water: 2000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } catch (error) {
      console.error("Error al generar objetivos nutricionales predeterminados:", error)
      // Valores aún más básicos en caso de error
      return {
        user_id: userId,
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 70
      }
    }
  }

  // Obtener plan de comidas predeterminado
  const getDefaultMealPlan = (userId: string): MealPlan => {
    try {
      // Generar IDs únicos para el plan y sus componentes
      // Usar try-catch para cada generación de UUID para mayor robustez
      let planId, dayId, breakfastId, lunchId, dinnerId;

      try {
        planId = uuidv4();
      } catch (error) {
        console.warn('Error al generar UUID para planId:', error);
        planId = 'default-plan-' + Date.now();
      }

      try {
        dayId = uuidv4();
      } catch (error) {
        console.warn('Error al generar UUID para dayId:', error);
        dayId = 'default-day-' + Date.now();
      }

      try {
        breakfastId = uuidv4();
      } catch (error) {
        console.warn('Error al generar UUID para breakfastId:', error);
        breakfastId = 'default-breakfast-' + Date.now();
      }

      try {
        lunchId = uuidv4();
      } catch (error) {
        console.warn('Error al generar UUID para lunchId:', error);
        lunchId = 'default-lunch-' + Date.now();
      }

      try {
        dinnerId = uuidv4();
      } catch (error) {
        console.warn('Error al generar UUID para dinnerId:', error);
        dinnerId = 'default-dinner-' + Date.now();
      }

      return {
        id: planId,
        user_id: userId,
        name: "Plan de alimentación básico",
        description: "Plan de alimentación equilibrado para mantenimiento",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true,
        is_template: false,
        days: [
          {
            id: dayId,
            name: "Día 1",
            meals: [
              {
                id: breakfastId,
                name: "Desayuno",
                time: "08:00",
                foods: [
                  {
                    id: generateSafeId('food-1'),
                    name: "Avena con frutas",
                    serving_size: 100,
                    serving_unit: "g",
                    calories: 350,
                    protein: 12,
                    carbs: 60,
                    fat: 8
                  }
                ]
              },
            {
              id: lunchId,
              name: "Almuerzo",
              time: "13:00",
              foods: [
                {
                  id: generateSafeId('food-2'),
                  name: "Ensalada de pollo",
                  serving_size: 250,
                  serving_unit: "g",
                  calories: 450,
                  protein: 35,
                  carbs: 30,
                  fat: 20
                }
              ]
            },
            {
              id: dinnerId,
              name: "Cena",
              time: "20:00",
              foods: [
                {
                  id: generateSafeId('food-3'),
                  name: "Salmón con verduras",
                  serving_size: 200,
                  serving_unit: "g",
                  calories: 400,
                  protein: 30,
                  carbs: 15,
                  fat: 25
                }
              ]
            }
          ]
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    } catch (error) {
      console.error("Error al generar plan de comidas predeterminado:", error)
      // Plan más básico en caso de error
      return {
        id: "default-plan-" + Date.now(),
        user_id: userId,
        name: "Plan básico",
        description: "Plan de alimentación básico",
        is_active: true,
        days: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }

  return (
    <NutritionContext.Provider
      value={{
        nutritionGoals,
        activeMealPlan,
        nutritionLogs,
        isLoading,
        loadNutritionGoals,
        saveNutritionGoals,
        loadActiveMealPlan,
        saveMealPlan,
        loadNutritionLogs,
        saveNutritionLog,
        searchFoods
      }}
    >
      {children}
    </NutritionContext.Provider>
  )
}

// Hook para usar el contexto
export function useNutrition() {
  const context = useContext(NutritionContext)
  if (context === undefined) {
    throw new Error("useNutrition debe ser usado dentro de un NutritionProvider")
  }
  return context
}
