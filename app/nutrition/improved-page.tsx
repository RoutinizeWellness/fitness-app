"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, PlusCircle, Search, Utensils, BarChart, Calendar, BookOpen, Apple, Sparkles, Home, User } from "lucide-react"
import ImprovedFoodDiary from "@/components/nutrition/improved-food-diary"

export default function ImprovedNutritionPage() {
  const [activeTab, setActiveTab] = useState("diary")
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
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
              <Skeleton className="h-[100px] rounded-3xl" />
              <Skeleton className="h-[100px] rounded-3xl" />
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
        <Tabs defaultValue="diary" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 bg-white rounded-full p-1 shadow-sm">
            <TabsTrigger 
              value="diary" 
              className="rounded-full data-[state=active]:bg-[#FDA758] data-[state=active]:text-white"
            >
              Diario
            </TabsTrigger>
            <TabsTrigger 
              value="plans" 
              className="rounded-full data-[state=active]:bg-[#FDA758] data-[state=active]:text-white"
            >
              Planes
            </TabsTrigger>
            <TabsTrigger 
              value="recipes" 
              className="rounded-full data-[state=active]:bg-[#FDA758] data-[state=active]:text-white"
            >
              Recetas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="diary">
            <ImprovedFoodDiary userId={user.uid} />
          </TabsContent>
          
          <TabsContent value="plans">
            <div className="bg-white rounded-3xl p-5 shadow-sm text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#FDA758]/20 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-[#FDA758]" />
              </div>
              <h3 className="text-lg font-semibold text-[#573353] mb-2">Planes de Comida</h3>
              <p className="text-[#573353]/70 mb-6 max-w-xs mx-auto">
                Crea o descubre planes de comida personalizados para alcanzar tus objetivos
              </p>
              <button className="bg-[#FDA758] text-white font-medium rounded-full px-6 py-3 flex items-center justify-center mx-auto">
                <Sparkles className="h-4 w-4 mr-2" />
                Generar Plan con IA
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="recipes">
            <div className="bg-white rounded-3xl p-5 shadow-sm text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#5DE292]/20 flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-[#5DE292]" />
              </div>
              <h3 className="text-lg font-semibold text-[#573353] mb-2">Recetas Saludables</h3>
              <p className="text-[#573353]/70 mb-6 max-w-xs mx-auto">
                Descubre recetas deliciosas y saludables adaptadas a tus preferencias
              </p>
              <button className="bg-[#5DE292] text-white font-medium rounded-full px-6 py-3 flex items-center justify-center mx-auto">
                <Search className="h-4 w-4 mr-2" />
                Explorar Recetas
              </button>
            </div>
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
            <Home className="h-5 w-5 text-[#573353]/70" />
          </div>
          <span className="text-xs mt-1 font-medium text-[#573353]/70">Inicio</span>
        </button>

        <button
          className="flex flex-col items-center w-16"
          onClick={() => router.push('/nutrition/stats')}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <BarChart className="h-5 w-5 text-[#573353]/70" />
          </div>
          <span className="text-xs mt-1 font-medium text-[#573353]/70">Estadísticas</span>
        </button>

        <button
          className="flex flex-col items-center relative w-16"
          onClick={() => {
            setActiveTab("diary")
            document.querySelector('button[value="diary"]')?.click()
          }}
        >
          <div className="w-16 h-16 rounded-full bg-[#FDA758] flex items-center justify-center absolute -top-8 shadow-md">
            <PlusCircle className="h-8 w-8 text-white" />
          </div>
          <div className="w-6 h-6 mt-8"></div>
          <span className="text-xs mt-1 font-medium text-[#573353]/70">Añadir</span>
        </button>

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
