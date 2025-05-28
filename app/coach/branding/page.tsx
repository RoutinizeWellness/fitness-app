"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import EnhancedNavigation from "@/components/enhanced-navigation"
import CoachBranding from "@/components/coach-branding"

export default function CoachBrandingPage() {
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
      <EnhancedNavigation activeTab="coach-dashboard" setActiveTab={() => {}} />

      <main className="flex-1 container max-w-6xl mx-auto p-4 pt-20 pb-24">
        {user && <CoachBranding coachId={user.id} />}
      </main>
    </div>
  )
}
