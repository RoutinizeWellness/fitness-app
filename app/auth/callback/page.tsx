"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { supabase } from "@/lib/supabase-client"
import { handleExternalAuth } from "@/lib/google-auth"

export default function AuthCallbackPage() {
  const router = useRouter()
  const { refreshProfile } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener la sesión actual
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (session?.user) {
          // Manejar la creación o actualización del perfil
          await handleExternalAuth(session.user)

          // Actualizar el perfil en el contexto de autenticación
          await refreshProfile()

          // Redirigir al usuario a la página principal
          router.push("/dashboard")
        } else {
          // Si no hay sesión, redirigir al login
          router.push("/auth/login?error=no-session")
        }
      } catch (error) {
        console.error("Error en la página de callback:", error)
        router.push("/auth/login?error=callback-failed")
      }
    }

    handleCallback()
  }, [router, refreshProfile])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-500">Completando inicio de sesión...</p>
      </div>
    </div>
  )
}
