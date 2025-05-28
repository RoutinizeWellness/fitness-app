"use client"

import React, { useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import EnhancedNavigation from "@/components/enhanced-navigation"
import { WorkoutAnalysis } from "@/components/workout-analysis"
import { MobileOptimizer } from "@/components/mobile-optimizer"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function WorkoutAnalysisPage({ params }: { params: { id: string } }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  // Usar React.use() para desenvolver los parámetros
  const unwrappedParams = use(params)
  const workoutId = unwrappedParams.id

  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <EnhancedNavigation activeTab="workout" setActiveTab={() => {}} />

      <MobileOptimizer adaptFontSize optimizeTouch>
        <main className="flex-1 container max-w-4xl mx-auto p-4 pt-20 pb-24">
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>

          {user && workoutId && (
            <WorkoutAnalysis userId={user.id} workoutId={workoutId} />
          )}
        </main>
      </MobileOptimizer>
    </div>
  )
}
