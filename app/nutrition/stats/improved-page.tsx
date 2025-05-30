"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, subDays, subWeeks, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import { useAuth } from "@/lib/auth/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, BarChart, Calendar, Home, User, ArrowLeft } from "lucide-react"
import { getNutritionEntries } from "@/lib/nutrition-service"
import { NutritionEntry } from "@/lib/types/nutrition"
import CalorieHistoryChart from "@/components/nutrition/calorie-history-chart"
import MacroDistributionChart from "@/components/nutrition/macro-distribution-chart"
import TopFoodsStats from "@/components/nutrition/top-foods-stats"
import MealTypeStats from "@/components/nutrition/meal-type-stats"

export default function ImprovedNutritionStatsPage() {
  const [activeTab, setActiveTab] = useState("week")
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [nutritionData, setNutritionData] = useState<NutritionEntry[]>([])

  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  // Cargar datos de nutrición
  useEffect(() => {
    const loadNutritionData = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        let startDate
        const today = new Date()

        switch (activeTab) {
          case "week":
            startDate = format(subDays(today, 6), "yyyy-MM-dd")
            break
          case "month":
            startDate = format(subDays(today, 29), "yyyy-MM-dd")
            break
          case "3months":
            startDate = format(subMonths(today, 3), "yyyy-MM-dd")
            break
          default:
            startDate = format(subDays(today, 6), "yyyy-MM-dd")
        }

        const endDate = format(today, "yyyy-MM-dd")

        const { data, error } = await getNutritionEntries(user.uid, {
          startDate,
          endDate
        })

        if (error) {
          throw error
        }

        if (data) {
          setNutritionData(data)
        }
      } catch (error) {
        console.error("Error al cargar datos de nutrición:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNutritionData()
  }, [user, activeTab])

  // Calcular fechas para el título
  const getDateRangeTitle = () => {
    const today = new Date()
    let startDate

    switch (activeTab) {
      case "week":
        startDate = subDays(today, 6)
        return `${format(startDate, "d 'de' MMMM", { locale: es })} - ${format(today, "d 'de' MMMM", { locale: es })}`
      case "month":
        startDate = subDays(today, 29)
        return `${format(startDate, "d 'de' MMMM", { locale: es })} - ${format(today, "d 'de' MMMM", { locale: es })}`
      case "3months":
        startDate = subMonths(today, 3)
        return `${format(startDate, "MMMM", { locale: es })} - ${format(today, "MMMM", { locale: es })}`
      default:
        return format(today, "MMMM yyyy", { locale: es })
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FFF5EB]">
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFF5EB]">
          <div className="container max-w-md mx-auto px-4 h-16 flex items-center justify-between">
            <Skeleton className="h-10 w-32" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </header>
        <main className="container max-w-md mx-auto px-4 pt-20 pb-32">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3 rounded-full" />
            <Skeleton className="h-[200px] w-full rounded-3xl" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-[200px] rounded-3xl" />
              <Skeleton className="h-[200px] rounded-3xl" />
            </div>
            <Skeleton className="h-[300px] w-full rounded-3xl" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5EB]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFF5EB]">
        <div className="container max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm mr-3"
              onClick={() => router.push('/nutrition/v2')}
            >
              <ArrowLeft className="h-5 w-5 text-[#573353]" />
            </button>
            <h1 className="text-xl font-bold text-[#573353]">
              Estadísticas
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm"
              onClick={() => router.push('/profile')}
            >
              <User className="h-5 w-5 text-[#573353]/70" />
            </button>
          </div>
        </div>
      </header>

      <main className="container max-w-md mx-auto px-4 pt-20 pb-32">
        <div className="mb-6">
          <p className="text-[#573353]/70 text-sm">Período</p>
          <h2 className="text-lg font-semibold text-[#573353]">{getDateRangeTitle()}</h2>
        </div>

        <Tabs defaultValue="week" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 bg-white rounded-full p-1 shadow-sm">
            <TabsTrigger
              value="week"
              className="rounded-full data-[state=active]:bg-[#FDA758] data-[state=active]:text-white"
            >
              Semana
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className="rounded-full data-[state=active]:bg-[#FDA758] data-[state=active]:text-white"
            >
              Mes
            </TabsTrigger>
            <TabsTrigger
              value="3months"
              className="rounded-full data-[state=active]:bg-[#FDA758] data-[state=active]:text-white"
            >
              3 Meses
            </TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            {isLoading ? (
              <>
                <Skeleton className="h-[250px] w-full rounded-3xl" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-[250px] rounded-3xl" />
                  <Skeleton className="h-[250px] rounded-3xl" />
                </div>
                <Skeleton className="h-[300px] w-full rounded-3xl" />
              </>
            ) : (
              <>
                <CalorieHistoryChart
                  entries={nutritionData}
                  days={activeTab === "week" ? 7 : activeTab === "month" ? 30 : 90}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MacroDistributionChart
                    entries={nutritionData}
                    period={activeTab === "week" ? "week" : "month"}
                  />

                  <MealTypeStats
                    entries={nutritionData}
                    period={activeTab === "week" ? "week" : "month"}
                  />
                </div>

                <TopFoodsStats
                  entries={nutritionData}
                  period={activeTab === "week" ? "week" : "month"}
                  limit={5}
                />
              </>
            )}
          </div>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-3 z-10 shadow-sm">
        <button
          className="flex flex-col items-center w-16"
          onClick={() => router.push('/dashboard')}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <Home className="h-5 w-5 text-[#573353]/70" />
          </div>
          <span className="text-xs mt-1 font-medium text-[#573353]/70">Inicio</span>
        </button>

        <button
          className="flex flex-col items-center w-16"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <BarChart className="h-5 w-5 text-[#FDA758]" />
          </div>
          <span className="text-xs mt-1 font-medium text-[#FDA758]">Estadísticas</span>
        </button>

        <div className="flex flex-col items-center relative w-16">
          <div className="w-16 h-16 rounded-full bg-[#FDA758]/20 flex items-center justify-center absolute -top-8">
            <button
              className="w-12 h-12 rounded-full bg-[#FDA758] flex items-center justify-center shadow-md"
              onClick={() => router.push('/nutrition/v2')}
            >
              <CalendarIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="w-6 h-6 mt-8"></div>
          <span className="text-xs mt-1 font-medium text-[#573353]/70">Diario</span>
        </div>

        <button
          className="flex flex-col items-center w-16"
          onClick={() => router.push('/nutrition/calendar')}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-[#573353]/70" />
          </div>
          <span className="text-xs mt-1 font-medium text-[#573353]/70">Calendario</span>
        </button>

        <button
          className="flex flex-col items-center w-16"
          onClick={() => router.push('/profile')}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <User className="h-5 w-5 text-[#573353]/70" />
          </div>
          <span className="text-xs mt-1 font-medium text-[#573353]/70">Perfil</span>
        </button>
      </div>
    </div>
  )
}
