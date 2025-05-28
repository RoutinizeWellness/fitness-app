"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { useNutrition } from "@/contexts/nutrition-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, PlusCircle, Search, Utensils, BarChart, Calendar, BookOpen, Apple, Sparkles, ChevronRight } from "lucide-react"
import { OrganicLayout, OrganicSection } from "@/components/organic-layout"
import NutritionErrorBoundaryWithRouter from "@/components/nutrition/nutrition-error-boundary"
import SupabaseConnectionChecker from "@/components/nutrition/supabase-connection-checker"
import { OrganicElement, OrganicStaggeredList } from "@/components/transitions/organic-transitions"
import { NutritionDashboard } from "@/components/nutrition/nutrition-dashboard"
import FoodDiary from "@/components/nutrition/food-diary"
import MealPlanner from "@/components/nutrition/meal-planner"
import NutritionAnalytics from "@/components/nutrition/nutrition-analytics"
import FoodDatabase from "@/components/nutrition/food-database"
import DietManager from "@/components/nutrition/diet-manager"
import MealPlanDisplay from "@/components/nutrition/meal-plan-display"
import EnhancedFoodTracker from "@/components/nutrition/enhanced-food-tracker"
import HealthyRecipes from "@/components/nutrition/healthy-recipes"
import AdvancedNutritionAnalysis from "@/components/nutrition/advanced-nutrition-analysis"
import MealPlanGenerator from "@/components/nutrition/meal-plan-generator"
import WaterTracker from "@/components/nutrition/water-tracker"
import NutritionStats from "@/components/nutrition/nutrition-stats"
import DietaryRestrictions from "@/components/nutrition/dietary-restrictions"

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  // Usar el contexto de nutrición para inicializar datos
  const {
    loadNutritionGoals,
    loadDailyStats,
    nutritionGoals,
    dailyStats,
    isLoadingGoals,
    isLoadingDailyStats
  } = useNutrition()

  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    } else if (user) {
      setIsLoading(false)
    }
  }, [user, authLoading, router])

  // Cargar datos iniciales cuando el usuario está autenticado
  useEffect(() => {
    if (user) {
      try {
        // Cargar objetivos nutricionales
        if (!nutritionGoals && !isLoadingGoals) {
          loadNutritionGoals()
        }

        // Cargar estadísticas diarias
        if (!dailyStats && !isLoadingDailyStats) {
          const today = new Date().toISOString().split('T')[0]
          loadDailyStats(today)
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales de nutrición:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar algunos datos de nutrición',
          variant: 'destructive'
        })
      }
    }
  }, [user, nutritionGoals, dailyStats, isLoadingGoals, isLoadingDailyStats, loadNutritionGoals, loadDailyStats, toast])

  if (isLoading || authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3 rounded-full" />
        <Skeleton className="h-[200px] w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-[100px] rounded-3xl" />
          <Skeleton className="h-[100px] rounded-3xl" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-3xl" />
      </div>
    )
  }

  // Sample meal plans
  const mealPlans = [
    {
      id: "1",
      title: "Weight Loss Plan",
      description: "Calorie deficit diet plan",
      calories: 1800,
      meals: 5,
      duration: "4 weeks",
      category: "weight-loss",
      color: "#8C80F8"
    },
    {
      id: "2",
      title: "Muscle Gain Plan",
      description: "High protein diet for muscle growth",
      calories: 2500,
      meals: 6,
      duration: "8 weeks",
      category: "muscle-gain",
      color: "#FDA758"
    },
    {
      id: "3",
      title: "Balanced Diet",
      description: "Balanced macronutrients for maintenance",
      calories: 2200,
      meals: 4,
      duration: "Ongoing",
      category: "maintenance",
      color: "#5DE292"
    }
  ]

  // Sample recipes
  const recipes = [
    {
      id: "r1",
      title: "Protein Smoothie Bowl",
      category: "Breakfast",
      prepTime: 10,
      calories: 350,
      protein: 25,
      image: "/images/smoothie-bowl.jpg"
    },
    {
      id: "r2",
      title: "Grilled Chicken Salad",
      category: "Lunch",
      prepTime: 20,
      calories: 420,
      protein: 35,
      image: "/images/chicken-salad.jpg"
    }
  ]

  return (
    <div className="min-h-screen bg-[#FFF5EB]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFF5EB]">
        <div className="container max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm mr-3"
              onClick={() => router.push('/dashboard')}
            >
              <CalendarIcon className="h-5 w-5 text-[#573353] rotate-180" />
            </button>
            <h1 className="text-xl font-bold text-[#573353]">
              Nutrición
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm">
              <Search className="h-5 w-5 text-[#573353]/70" />
            </button>

            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm relative">
              <CalendarIcon className="h-5 w-5 text-[#573353]/70" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FDA758] text-white text-xs flex items-center justify-center shadow-sm">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Pestañas principales */}
        <div className="container max-w-md mx-auto px-4 mt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-7 mb-4 bg-white">
              <TabsTrigger value="dashboard" className="rounded-full">Inicio</TabsTrigger>
              <TabsTrigger value="diary" className="rounded-full">Diario</TabsTrigger>
              <TabsTrigger value="recipes" className="rounded-full">Recetas</TabsTrigger>
              <TabsTrigger value="plan" className="rounded-full">Plan</TabsTrigger>
              <TabsTrigger value="water" className="rounded-full">Agua</TabsTrigger>
              <TabsTrigger value="stats" className="rounded-full">Estadísticas</TabsTrigger>
              <TabsTrigger value="restrictions" className="rounded-full">Restricciones</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="container max-w-md mx-auto px-4 pt-6 pb-24">
        {/* Verificador de conexión a Supabase */}
        <NutritionErrorBoundaryWithRouter>
          <SupabaseConnectionChecker className="mb-4" />
        </NutritionErrorBoundaryWithRouter>

        {/* Botones de navegación eliminados - ahora integrados en el dashboard */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="dashboard" className="mt-0">
          <NutritionErrorBoundaryWithRouter>
            <NutritionDashboard />
          </NutritionErrorBoundaryWithRouter>
        </TabsContent>

        {/* Pestaña de Diario de Alimentos */}
        <TabsContent value="diary" className="mt-0">
          <NutritionErrorBoundaryWithRouter>
            <EnhancedFoodTracker />
          </NutritionErrorBoundaryWithRouter>
        </TabsContent>

        {/* Pestaña de Recetas */}
        <TabsContent value="recipes" className="mt-0">
          <NutritionErrorBoundaryWithRouter>
            <HealthyRecipes />
          </NutritionErrorBoundaryWithRouter>
        </TabsContent>

        {/* Pestaña de Plan de Comidas */}
        <TabsContent value="plan" className="mt-0">
          <NutritionErrorBoundaryWithRouter>
            <MealPlanGenerator />
          </NutritionErrorBoundaryWithRouter>
        </TabsContent>

        {/* Pestaña de Seguimiento de Agua */}
        <TabsContent value="water" className="mt-0">
          <NutritionErrorBoundaryWithRouter>
            <WaterTracker />
          </NutritionErrorBoundaryWithRouter>
        </TabsContent>

        {/* Pestaña de Estadísticas Nutricionales */}
        <TabsContent value="stats" className="mt-0">
          <NutritionErrorBoundaryWithRouter>
            <NutritionStats />
          </NutritionErrorBoundaryWithRouter>
        </TabsContent>

        {/* Pestaña de Restricciones Alimentarias */}
        <TabsContent value="restrictions" className="mt-0">
          <NutritionErrorBoundaryWithRouter>
            <DietaryRestrictions />
          </NutritionErrorBoundaryWithRouter>
        </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-3 z-10 shadow-sm">
        <button
          className="flex flex-col items-center w-16"
          onClick={() => router.push('/dashboard')}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg className="h-5 w-5 text-[#573353]/70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 22V12H15V22M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#573353" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs mt-1 font-medium text-[#573353]/70">Home</span>
        </button>

        <button
          className="flex flex-col items-center w-16"
          onClick={() => router.push('/habit-dashboard/stats')}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <BarChart className="h-5 w-5 text-[#573353]/70" />
          </div>
          <span className="text-xs mt-1 font-medium text-[#573353]/70">Stats</span>
        </button>

        <button
          className="flex flex-col items-center relative w-16"
          onClick={() => router.push('/add-habit')}
        >
          <div className="w-16 h-16 rounded-full bg-[#FDA758] flex items-center justify-center absolute -top-8 shadow-md">
            <PlusCircle className="h-8 w-8 text-white" />
          </div>
          <div className="w-6 h-6 mt-8"></div>
          <span className="text-xs mt-1 font-medium text-[#573353]/70">Add</span>
        </button>

        <button
          className="flex flex-col items-center w-16"
          onClick={() => router.push('/habit-calendar')}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-[#573353]/70" />
          </div>
          <span className="text-xs mt-1 font-medium text-[#573353]/70">Calendar</span>
        </button>

        <button
          className="flex flex-col items-center w-16"
          onClick={() => router.push('/profile/habit-dashboard')}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg className="h-5 w-5 text-[#573353]/70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#573353" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs mt-1 font-medium text-[#573353]/70">Profile</span>
        </button>
      </div>
    </div>
  )
}
