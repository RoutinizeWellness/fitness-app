"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import SleepAssessment from "@/components/sleep/sleep-assessment"

export default function SleepAssessmentPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
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
      <div className="container mx-auto py-6">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Evaluación de Sueño</h1>
      </div>

      <div className="max-w-3xl mx-auto">
        <SleepAssessment />
      </div>
    </div>
  )
}
