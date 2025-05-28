"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import HealthyRecipes from "@/components/nutrition/healthy-recipes"

export default function RecipesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5EB] pb-20">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFF5EB]">
        <div className="container max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="#573353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-xl font-bold text-[#573353]">Recetas Saludables</h1>
          </div>
        </div>
      </header>

      <main className="container max-w-md mx-auto px-4 pt-24 pb-32">
        <HealthyRecipes />
      </main>
    </div>
  )
}
