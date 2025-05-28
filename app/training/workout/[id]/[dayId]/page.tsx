"use client"

import { useEffect, useState } from "react"
import { AmateurZeroWorkoutExecution } from "@/components/training/amateur-zero-workout-execution"
import { ExecuteWorkout } from "@/components/training/execute-workout"
import { useAuth } from "@/lib/contexts/auth-context"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export default function WorkoutExecutionPage({ 
  params 
}: { 
  params: { id: string; dayId: string } 
}) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userLevel, setUserLevel] = useState<string | null>(null)

  // Verificar nivel de experiencia del usuario
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

        setUserLevel(data?.experience_level || null)
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }

  // Renderizar componente según nivel de experiencia
  return (
    <div className="container mx-auto py-6">
      {userLevel === 'amateur_zero' ? (
        <AmateurZeroWorkoutExecution 
          planId={params.id} 
          dayId={params.dayId} 
        />
      ) : (
        <ExecuteWorkout 
          planId={params.id} 
          dayId={params.dayId} 
        />
      )}
    </div>
  )
}
