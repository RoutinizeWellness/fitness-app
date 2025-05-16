"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function LoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a la ruta correcta de autenticación
    router.replace("/auth/login")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Redirigiendo a la página de inicio de sesión...</p>
      </div>
    </div>
  )
}
