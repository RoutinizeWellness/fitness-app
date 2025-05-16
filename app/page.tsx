"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Function to handle redirection
    const handleRedirection = async () => {
      // If loading, wait
      if (isLoading) return

      try {
        if (user) {
          // If user is authenticated, redirect to dashboard
          console.log("Usuario autenticado, redirigiendo al dashboard")

          // Método 1: Redirección con router (más suave)
          router.push("/dashboard")

          // Método 2: Redirección directa con window.location.href (inmediata)
          setTimeout(() => {
            console.log("Usando redirección directa con window.location.href...")
            window.location.href = "/dashboard"
          }, 100)

          // Método 3: Como respaldo, usar replace (más fuerte que href)
          setTimeout(() => {
            console.log("Usando redirección con replace como respaldo...")
            window.location.replace("/dashboard")
          }, 300)
        } else {
          // If not authenticated, go to login
          console.log("Usuario no autenticado, redirigiendo a login")
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Error durante la redirección:", error)
        // In case of error, redirect to login by default
        router.push("/auth/login")
      }
    }

    handleRedirection()
  }, [user, isLoading, router])

  // Show a loader while deciding redirection
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--habit-background))]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ background: 'var(--habit-gradient-primary)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
          Routinize Habit Builder
        </h1>
        <PulseLoader message="Loading your habits..." />
      </div>
    </div>
  )
}
