"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import EnhancedNavigation from "@/components/enhanced-navigation"
import WorkoutAnalytics from "@/components/workout-analytics"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WorkoutAnalyticsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <EnhancedNavigation activeTab="stats" setActiveTab={() => {}} />

      <main className="flex-1 container max-w-4xl mx-auto p-4 pt-20 pb-24">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.push("/workout-stats")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Análisis Avanzado de Entrenamientos</h1>
        </div>
        
        {user && <WorkoutAnalytics />}
      </main>
    </div>
  )
}
