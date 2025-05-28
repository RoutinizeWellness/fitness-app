"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import EnhancedNavigation from "@/components/enhanced-navigation"
import AIFitnessHub from "@/components/ai-fitness-hub"

export default function AIPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <EnhancedNavigation activeTab="ai" setActiveTab={() => {}} />

      <main className="flex-1 container max-w-4xl mx-auto p-4 pt-20 pb-24">
        <AIFitnessHub />
      </main>
    </div>
  )
}
