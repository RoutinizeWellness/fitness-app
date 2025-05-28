"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useRouter } from "next/navigation"

import { Brain, ChevronLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import EnhancedMindfulness from "@/components/wellness/enhanced-mindfulness"

export default function MindfulnessPage() {
  const { user, isLoading, profile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")

  // Redirigir a welcome si no hay usuario autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/welcome")
    }
  }, [user, isLoading, router])

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  // No mostrar nada si no hay usuario (redirigiendo)
  if (!user) {
    return null
  }

  return (
      <div className="space-y-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => router.push("/wellness")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Mindfulness</h1>
              <p className="text-gray-500 text-sm mt-1">Entrena tu mente para el bienestar</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            <Sparkles className="h-3 w-3 mr-1" />
            IA Avanzada
          </Badge>
        </div>

        {user && <EnhancedMindfulness userId={user.id} />}
      </div>
  )
}
