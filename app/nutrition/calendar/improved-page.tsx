"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, BarChart, Calendar, Home, User, ArrowLeft } from "lucide-react"
import { getNutritionEntries } from "@/lib/nutrition-service"
import { NutritionEntry } from "@/lib/types/nutrition"
import NutritionCalendar from "@/components/nutrition/nutrition-calendar"
import SelectedDaySummary from "@/components/nutrition/selected-day-summary"

export default function ImprovedNutritionCalendarPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isLoading, setIsLoading] = useState(true)
  const [nutritionData, setNutritionData] = useState<NutritionEntry[]>([])
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get("date") || new Date().toISOString().split("T")[0]
  )

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
        // Cargar datos para el mes actual y el anterior para tener suficientes datos
        const today = new Date()
        const firstDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const startDate = firstDayOfPreviousMonth.toISOString().split("T")[0]

        const { data, error } = await getNutritionEntries(user.uid, {
          startDate
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
  }, [user])

  // Manejar selección de fecha
  const handleDateSelect = (date: string) => {
    setSelectedDate(date)

    // Actualizar URL sin recargar la página
    const url = new URL(window.location.href)
    url.searchParams.set("date", date)
    window.history.pushState({}, "", url.toString())
  }

  // Filtrar entradas para la fecha seleccionada
  const selectedDateEntries = nutritionData.filter(entry => entry.date === selectedDate)

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
            <Skeleton className="h-[350px] w-full rounded-3xl" />
            <Skeleton className="h-[200px] w-full rounded-3xl" />
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
              Calendario
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
        <div className="space-y-6">
          {isLoading ? (
            <>
              <Skeleton className="h-[350px] w-full rounded-3xl" />
              <Skeleton className="h-[200px] w-full rounded-3xl" />
            </>
          ) : (
            <>
              <NutritionCalendar
                entries={nutritionData}
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
              />

              <SelectedDaySummary
                date={selectedDate}
                entries={selectedDateEntries}
              />
            </>
          )}
        </div>
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
          onClick={() => router.push('/nutrition/stats/v2')}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <BarChart className="h-5 w-5 text-[#573353]/70" />
          </div>
          <span className="text-xs mt-1 font-medium text-[#573353]/70">Estadísticas</span>
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
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-[#FDA758]" />
          </div>
          <span className="text-xs mt-1 font-medium text-[#FDA758]">Calendario</span>
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
