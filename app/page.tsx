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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="text-center max-w-md px-4">
        <div className="mb-8 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-primary"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Routinize Fitness
        </h1>
        <p className="text-muted-foreground mb-8">
          Tu compañero de entrenamiento personalizado
        </p>
        <div className="relative h-1.5 w-48 bg-primary/20 rounded-full mx-auto overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-primary rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Cargando tu perfil...</p>
      </div>
    </div>
  )
}
