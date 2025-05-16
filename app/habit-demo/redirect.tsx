"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HabitDemoRedirect() {
  const router = useRouter()

  useEffect(() => {
    console.log("Redirigiendo desde habit-demo a dashboard...")
    
    // Intentar redirección con router primero
    router.replace("/dashboard")
    
    // Como respaldo, usar redirección directa después de un breve retraso
    setTimeout(() => {
      console.log("Usando redirección directa como respaldo...")
      window.location.href = "/dashboard"
    }, 500)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FFF3E9]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDA758] mx-auto"></div>
        <p className="mt-4 text-[#573353]">Redirigiendo al dashboard...</p>
      </div>
    </div>
  )
}
