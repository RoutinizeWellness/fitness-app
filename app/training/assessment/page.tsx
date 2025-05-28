"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { OrganicElement } from "@/components/transitions/organic-transitions"
import { FitnessAssessment } from "@/components/training/fitness-assessment"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"

export default function FitnessAssessmentPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Obtener el usuario actual
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setIsLoading(false)
      } else {
        router.push('/auth/login')
      }
    }

    fetchUser()
  }, [router])

  const handleAssessmentComplete = () => {
    toast({
      title: "Evaluación completada",
      description: "Tu plan de entrenamiento ha sido personalizado según tus resultados"
    })

    // Redirigir al dashboard de entrenamiento
    setTimeout(() => {
      router.push('/training')
    }, 1500)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
      <OrganicElement type="fade">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Evaluación de condición física</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Completa esta evaluación para que podamos personalizar tu plan de entrenamiento.
          </p>
        </div>

        {userId && (
          <FitnessAssessment
            userId={userId}
            onComplete={handleAssessmentComplete}
          />
        )}
      </OrganicElement>
  )
}
