"use client"

import { useEffect } from "react"
import { AmateurZeroOnboarding } from "@/components/onboarding/amateur-zero-onboarding"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export default function AmateurZeroOnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Verificar si el usuario ya ha completado el onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('onboarding_completed, experience_level')
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        // Si el usuario ya completó el onboarding y no es amateur_zero, redirigir al dashboard
        if (data?.onboarding_completed && data?.experience_level !== 'amateur_zero') {
          router.push('/training/dashboard')
        }
      } catch (error) {
        console.error("Error al verificar estado de onboarding:", error)
      }
    }

    checkOnboardingStatus()
  }, [user, router])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Cargando...</div>
      </div>
    )
  }

  return <AmateurZeroOnboarding />
}
