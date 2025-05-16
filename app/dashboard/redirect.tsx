"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Componente para forzar la redirección al dashboard
 * Este componente se puede usar en cualquier página para forzar la redirección al dashboard
 */
export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Forzar redirección al dashboard
    console.log("Forzando redirección al dashboard desde DashboardRedirect")
    
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
  }, [router])

  return null
}
