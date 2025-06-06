"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { TrainingProvider } from "@/lib/contexts/training-context"
import { UnifiedLayout } from "@/components/layout/unified-layout"
import { PageTransition } from "@/components/ui/page-transition"
import { GeminiChat } from "@/components/gemini-chat"
import { GeminiProvider } from "@/lib/contexts/gemini-provider"
import { NotificationProvider } from "@/lib/contexts/notification-context"

export default function TrainingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Safely get auth context
  let user = null
  let profile = null
  let isLoading = true
  try {
    const authContext = useAuth()
    user = authContext?.user || null
    profile = authContext?.profile || null
    isLoading = authContext?.isLoading ?? true
  } catch (error) {
    console.warn('TrainingLayout: AuthContext not available yet')
    user = null
    profile = null
    isLoading = true
  }

  const [activeTab, setActiveTab] = useState("training")

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <NotificationProvider>
      <UnifiedLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        title="Entrenamiento"
      >
        <PageTransition>
          <TrainingProvider>
            {children}
          </TrainingProvider>
        </PageTransition>

        {/* Gemini Chat */}
        <GeminiProvider context={{ currentModule: "training" }}>
          <GeminiChat context={{ currentModule: "training" }} />
        </GeminiProvider>
      </UnifiedLayout>
    </NotificationProvider>
  )
}
