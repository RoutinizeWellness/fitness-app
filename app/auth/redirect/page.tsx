"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function RedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Intentar redirección con diferentes métodos
    try {
      console.log("Redirigiendo al dashboard...")
      
      // Método 1: window.location.replace
      window.location.replace("/dashboard")
      
      // Método 2: Si el anterior falla, intentar con setTimeout
      setTimeout(() => {
        console.log("Intentando redirección con setTimeout...")
        window.location.href = "/dashboard"
      }, 1000)
      
      // Método 3: Si los anteriores fallan, intentar con router.push
      setTimeout(() => {
        console.log("Intentando redirección con router.push...")
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error en redirección:", error)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#FFF5EB] flex flex-col items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#FDA758]" />
        <h1 className="text-2xl font-bold text-[#573353] mb-2">Redirigiendo...</h1>
        <p className="text-[#573353]/70 mb-8">Por favor espera mientras te redirigimos al dashboard.</p>
        
        <div className="mt-8">
          <button 
            onClick={() => window.location.href = "/dashboard"}
            className="bg-[#FDA758] text-white font-medium rounded-full px-6 py-3"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
