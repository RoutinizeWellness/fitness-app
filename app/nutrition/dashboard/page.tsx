"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { useNutrition } from "@/contexts/nutrition-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { OrganicLayout } from "@/components/organic-layout"
import NutritionDashboard from "@/components/nutrition/nutrition-dashboard"
import FoodDiary from "@/components/nutrition/food-diary"
import NutritionStats from "@/components/nutrition/nutrition-stats"

export default function NutritionDashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const {
    nutritionEntries,
    isLoadingEntries,
    loadNutritionEntries,
    dailyStats,
    isLoadingDailyStats,
    loadDailyStats,
    nutritionGoals,
    isLoadingGoals,
    loadNutritionGoals
  } = useNutrition()
  const [isLoading, setIsLoading] = useState(true)

  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    } else if (user) {
      // Cargar datos iniciales
      const today = new Date().toISOString().split('T')[0]
      loadNutritionEntries(today)
      loadDailyStats(today)
      loadNutritionGoals()
      setIsLoading(false)
    }
  }, [user, authLoading, router, loadNutritionEntries, loadDailyStats, loadNutritionGoals])

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

  return (
    <OrganicLayout activeTab="nutrition" title="Nutrición">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="diary">Diario</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <NutritionDashboard />
        </TabsContent>
        <TabsContent value="diary">
          <FoodDiary />
        </TabsContent>
        <TabsContent value="stats">
          <NutritionStats />
        </TabsContent>
      </Tabs>
    </OrganicLayout>
  )
}
