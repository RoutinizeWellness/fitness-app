"use client"

import { useState, useEffect, useMemo } from "react"
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useNutrition } from "@/contexts/nutrition-context"
import { NutritionStats as NutritionStatsType } from '@/lib/types/nutrition-improved'
import CaloriesTrendChart from "./charts/calories-trend-chart"
import MacroDistributionChart from "./charts/macro-distribution-chart"
import MealDistributionChart from "./charts/meal-distribution-chart"
import NutritionStatsCards from "./stats/nutrition-stats-cards"
import { useErrorHandler } from "@/hooks/use-error-handler"

interface NutritionStatsProps {}

/**
 * Componente principal para mostrar estadísticas nutricionales
 */
export default function NutritionStats({}: NutritionStatsProps) {
  const [activeTab, setActiveTab] = useState("week")
  const [dateRange, setDateRange] = useState({
    start: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
    end: format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")
  })
  const [stats, setStats] = useState<NutritionStatsType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Usar el contexto de nutrición
  const {
    dailyStats,
    isLoadingDailyStats,
    loadDailyStats,
    nutritionGoals,
    isLoadingGoals,
    loadNutritionGoals
  } = useNutrition()
  
  // Usar el manejador de errores personalizado
  const handleError = useErrorHandler()
  
  // Cambiar rango de fechas según la pestaña activa
  useEffect(() => {
    const today = new Date()
    
    if (activeTab === "week") {
      setDateRange({
        start: format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        end: format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd")
      })
    } else if (activeTab === "month") {
      // Últimos 30 días
      setDateRange({
        start: format(subDays(today, 29), "yyyy-MM-dd"),
        end: format(today, "yyyy-MM-dd")
      })
    }
  }, [activeTab])
  
  // Cargar estadísticas
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    
    try {
      // En una implementación real, aquí se cargarían los datos desde la API
      // Por ahora, usamos datos de ejemplo
      const mockStats: NutritionStatsType = {
        averageCalories: 2100,
        averageProtein: 120,
        averageCarbs: 200,
        averageFat: 70,
        caloriesTrend: eachDayOfInterval({
          start: new Date(dateRange.start),
          end: new Date(dateRange.end)
        }).map(date => ({
          date: format(date, "yyyy-MM-dd"),
          value: Math.floor(1800 + Math.random() * 800)
        })),
        macroDistribution: {
          protein: 25,
          carbs: 50,
          fat: 25
        },
        mealTypeDistribution: {
          breakfast: 25,
          lunch: 35,
          dinner: 30,
          snack: 10
        },
        topFoods: [
          { id: "1", name: "Pollo a la plancha", count: 5 },
          { id: "2", name: "Arroz integral", count: 4 },
          { id: "3", name: "Huevos", count: 3 },
          { id: "4", name: "Avena", count: 3 },
          { id: "5", name: "Plátano", count: 2 }
        ],
        consistencyScore: 85,
        streakDays: 5
      }
      
      setStats(mockStats)
    } catch (err) {
      const error = handleError(err, "No se pudieron cargar las estadísticas nutricionales")
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange, handleError])
  
  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[300px] w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    )
  }
  
  // Mostrar mensaje de error
  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
        <h3 className="font-medium">Error al cargar estadísticas</h3>
        <p>{error.message}</p>
        <button 
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm transition-colors"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    )
  }
  
  // Si no hay datos
  if (!stats) {
    return (
      <div className="p-4 border border-gray-200 bg-gray-50 rounded-md">
        <h3 className="font-medium">No hay datos disponibles</h3>
        <p className="text-gray-500">No se encontraron estadísticas nutricionales para el período seleccionado.</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="week" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Estadísticas de Nutrición</h2>
          <TabsList>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="week" className="space-y-4">
          {/* Gráfico de tendencia de calorías */}
          <CaloriesTrendChart 
            data={stats.caloriesTrend}
            startDate={dateRange.start}
            endDate={dateRange.end}
            period="week"
          />

          {/* Resumen de macronutrientes y distribución de comidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Distribución de macronutrientes */}
            <MacroDistributionChart 
              data={stats.macroDistribution}
              averageProtein={stats.averageProtein}
              averageCarbs={stats.averageCarbs}
              averageFat={stats.averageFat}
            />

            {/* Distribución por comidas */}
            <MealDistributionChart 
              data={stats.mealTypeDistribution}
            />
          </div>

          {/* Estadísticas adicionales */}
          <NutritionStatsCards 
            averageCalories={stats.averageCalories}
            caloriesGoal={nutritionGoals?.calories}
            consistencyScore={stats.consistencyScore}
            streakDays={stats.streakDays}
            topFoods={stats.topFoods}
          />
        </TabsContent>

        <TabsContent value="month" className="space-y-4">
          {/* Gráfico de tendencia de calorías (mensual) */}
          <CaloriesTrendChart 
            data={stats.caloriesTrend}
            startDate={dateRange.start}
            endDate={dateRange.end}
            period="month"
          />

          {/* Resto de gráficos similares a la vista semanal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MacroDistributionChart 
              data={stats.macroDistribution}
              averageProtein={stats.averageProtein}
              averageCarbs={stats.averageCarbs}
              averageFat={stats.averageFat}
            />

            <MealDistributionChart 
              data={stats.mealTypeDistribution}
            />
          </div>

          <NutritionStatsCards 
            averageCalories={stats.averageCalories}
            caloriesGoal={nutritionGoals?.calories}
            consistencyScore={stats.consistencyScore}
            streakDays={stats.streakDays}
            topFoods={stats.topFoods}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
