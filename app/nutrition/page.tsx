"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, PlusCircle, Search, Utensils, BarChart, Calendar, BookOpen, Apple, Sparkles, ChevronRight } from "lucide-react"
import { OrganicLayout, OrganicSection } from "@/components/organic-layout"
import { OrganicElement, OrganicStaggeredList } from "@/components/transitions/organic-transitions"
import NutritionDashboard from "@/components/nutrition/nutrition-dashboard"
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

  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    } else if (user) {
      setIsLoading(false)
    }
  }, [user, authLoading, router])

  if (isLoading || authLoading) {
    return (
      <OrganicLayout activeTab="nutrition" title="Nutrición">
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3 rounded-full" />
          <Skeleton className="h-[200px] w-full rounded-3xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-[100px] rounded-3xl" />
            <Skeleton className="h-[100px] rounded-3xl" />
          </div>
          <Skeleton className="h-[300px] w-full rounded-3xl" />
        </div>
      </OrganicLayout>
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
              Nutrition
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
              <TabsTrigger value="dashboard" className="rounded-full">Dashboard</TabsTrigger>
              <TabsTrigger value="diary" className="rounded-full">Diario</TabsTrigger>
              <TabsTrigger value="recipes" className="rounded-full">Recetas</TabsTrigger>
              <TabsTrigger value="plan" className="rounded-full">Plan</TabsTrigger>
              <TabsTrigger value="water" className="rounded-full">Agua</TabsTrigger>
              <TabsTrigger value="stats" className="rounded-full">Stats</TabsTrigger>
              <TabsTrigger value="restrictions" className="rounded-full">Restricciones</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="container max-w-md mx-auto px-4 pt-28 pb-32">
        <TabsContent value="dashboard" className="mt-0">
          {/* Today's Meals */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-[#573353] mb-4">Today's Meals</h2>
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-[#8C80F8] flex items-center justify-center mr-3">
                    <Utensils className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[#573353] font-semibold text-base">Weight Loss Plan</h3>
                    <p className="text-[#573353]/70 text-sm mt-0.5">1800 calories • 5 meals</p>
                  </div>
                </div>
                <button className="bg-[#8C80F8] text-white font-medium rounded-full px-4 py-2 text-sm shadow-sm">
                  View
                </button>
              </div>

              <div className="h-2.5 bg-[#F5F5F5] rounded-full mb-3">
                <div className="h-full rounded-full bg-[#8C80F8]" style={{ width: '60%' }} />
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-[#573353]/70">3 of 5 meals completed</span>
                <span className="text-[#8C80F8] font-medium">60%</span>
              </div>
            </div>
          </div>

        {/* Meal Plans */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-[#573353]">Meal Plans</h2>
            <div className="flex space-x-2">
              <button
                className="text-sm bg-[#FDA758] text-white font-medium flex items-center px-3 py-1 rounded-full"
                onClick={() => router.push('/nutrition/generate-plan')}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Generar con IA
              </button>
              <button className="text-sm text-[#FDA758] font-medium flex items-center">
                View All
                <svg className="ml-1 w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6L15 12L9 18" stroke="#FDA758" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {mealPlans.map(plan => (
              <div
                key={plan.id}
                className="bg-white rounded-3xl p-5 shadow-sm cursor-pointer"
                onClick={() => router.push(`/nutrition/plan/${plan.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: plan.color }}
                    >
                      <Utensils className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-[#573353] font-semibold text-base">{plan.title}</h3>
                      <p className="text-[#573353]/70 text-sm mt-0.5">{plan.description}</p>
                    </div>
                  </div>
                  <CalendarIcon className="h-5 w-5 text-[#573353]/40" />
                </div>

                <div className="flex mt-4 space-x-4">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-[#573353]/70 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.5 12.5C19.5 11.12 20.62 10 22 10V9C22 5 21 4 17 4H7C3 4 2 5 2 9V9.5C3.38 9.5 4.5 10.62 4.5 12C4.5 13.38 3.38 14.5 2 14.5V15C2 19 3 20 7 20H17C21 20 22 19 22 15C20.62 15 19.5 13.88 19.5 12.5Z" stroke="#573353" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 4L10 20" stroke="#573353" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 5"/>
                    </svg>
                    <span className="text-xs text-[#573353]/70">{plan.calories} cal</span>
                  </div>
                  <div className="flex items-center">
                    <Utensils className="h-4 w-4 text-[#573353]/70 mr-1" />
                    <span className="text-xs text-[#573353]/70">{plan.meals} meals</span>
                  </div>
                  <div className="bg-[#F5F5F5] px-2 py-1 rounded-full">
                    <span className="text-xs text-[#573353]/70">{plan.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Food Categories */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-[#573353]">Food Categories</h2>
            <button className="text-sm text-[#FDA758] font-medium flex items-center">
              View All
              <svg className="ml-1 w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L15 12L9 18" stroke="#FDA758" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#FDA758] flex items-center justify-center mb-3">
                <Apple className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-[#573353] font-semibold text-base">Fruits</h3>
              <p className="text-[#573353]/70 text-sm mt-1">25 items</p>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#5DE292] flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-[#573353] font-semibold text-base">Vegetables</h3>
              <p className="text-[#573353]/70 text-sm mt-1">30 items</p>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#FF7285] flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-[#573353] font-semibold text-base">Proteins</h3>
              <p className="text-[#573353]/70 text-sm mt-1">20 items</p>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#8C80F8] flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-[#573353] font-semibold text-base">Beverages</h3>
              <p className="text-[#573353]/70 text-sm mt-1">15 items</p>
            </div>
          </div>
        </div>

        {/* Healthy Recipes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-[#573353]">Healthy Recipes</h2>
            <button className="text-sm text-[#FDA758] font-medium flex items-center">
              View All
              <svg className="ml-1 w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L15 12L9 18" stroke="#FDA758" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {recipes.map(recipe => (
              <div key={recipe.id} className="bg-white rounded-3xl p-5 shadow-sm cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center mr-3 overflow-hidden">
                      <Utensils className="h-6 w-6 text-[#573353]/40" />
                    </div>
                    <div>
                      <h3 className="text-[#573353] font-semibold text-base">{recipe.title}</h3>
                      <p className="text-[#573353]/70 text-sm mt-0.5">{recipe.category}</p>
                    </div>
                  </div>
                  <CalendarIcon className="h-5 w-5 text-[#573353]/40" />
                </div>

                <div className="flex mt-4 space-x-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-[#573353]/70 mr-1" />
                    <span className="text-xs text-[#573353]/70">{recipe.prepTime} min</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-[#573353]/70 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.5 12.5C19.5 11.12 20.62 10 22 10V9C22 5 21 4 17 4H7C3 4 2 5 2 9V9.5C3.38 9.5 4.5 10.62 4.5 12C4.5 13.38 3.38 14.5 2 14.5V15C2 19 3 20 7 20H17C21 20 22 19 22 15C20.62 15 19.5 13.88 19.5 12.5Z" stroke="#573353" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 4L10 20" stroke="#573353" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 5"/>
                    </svg>
                    <span className="text-xs text-[#573353]/70">{recipe.calories} cal</span>
                  </div>
                  <div className="bg-[#F5F5F5] px-2 py-1 rounded-full">
                    <span className="text-xs text-[#573353]/70">{recipe.protein}g protein</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </TabsContent>

        {/* Pestaña de Diario de Alimentos */}
        <TabsContent value="diary" className="mt-0">
          <EnhancedFoodTracker />
        </TabsContent>

        {/* Pestaña de Recetas */}
        <TabsContent value="recipes" className="mt-0">
          <HealthyRecipes />
        </TabsContent>

        {/* Pestaña de Plan de Comidas */}
        <TabsContent value="plan" className="mt-0">
          <MealPlanGenerator />
        </TabsContent>

        {/* Pestaña de Seguimiento de Agua */}
        <TabsContent value="water" className="mt-0">
          <WaterTracker />
        </TabsContent>

        {/* Pestaña de Estadísticas Nutricionales */}
        <TabsContent value="stats" className="mt-0">
          <NutritionStats />
        </TabsContent>

        {/* Pestaña de Restricciones Alimentarias */}
        <TabsContent value="restrictions" className="mt-0">
          <DietaryRestrictions />
        </TabsContent>
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
