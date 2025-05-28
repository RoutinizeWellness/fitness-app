"use client"

import { AmateurZeroProgressionSystem } from "@/components/training/amateur-zero-progression-system"
import { TrainingLayout } from "@/components/layouts/training-layout"
import { useAuth } from "@/lib/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"

export default function AmateurZeroProgressPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAmateurZero, setIsAmateurZero] = useState(false)

  // Verificar si el usuario es principiante absoluto
  useEffect(() => {
    const checkUserLevel = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('experience_level')
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        // Verificar si el usuario es amateur_zero
        setIsAmateurZero(data?.experience_level === 'amateur_zero')
        
        // Si no es amateur_zero, redirigir a la página de progreso regular
        if (data?.experience_level !== 'amateur_zero') {
          router.push('/training/progress')
        }
      } catch (error) {
        console.error("Error al verificar nivel de usuario:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUserLevel()
  }, [user, router])

  if (isLoading) {
    return (
      <TrainingLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      </TrainingLayout>
    )
  }

  if (!isAmateurZero) {
    return (
      <TrainingLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">Redirigiendo...</h2>
            <p className="text-muted-foreground">
              Esta página está diseñada para principiantes absolutos.
            </p>
          </div>
        </div>
      </TrainingLayout>
    )
  }

  return (
    <TrainingLayout>
      <div className="container mx-auto py-6">
        <AmateurZeroProgressionSystem />
      </div>
    </TrainingLayout>
  )
}
