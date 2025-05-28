"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { TrainingProvider } from "@/lib/contexts/training-context"
import { UnifiedLayout } from "@/components/layout/unified-layout"
import { PageTransition } from "@/components/ui/page-transition"
import { GeminiChat } from "@/components/gemini-chat"
import { GeminiProvider } from "@/lib/contexts/gemini-provider"
import { NotificationProvider } from "@/lib/contexts/notification-context"

interface TrainingLayoutProps {
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
}

export function TrainingLayout({
  children,
  title = "Entrenamiento",
  showBackButton = false,
}: TrainingLayoutProps) {
  const router = useRouter()
  const { user, profile, isLoading } = useAuth()
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
        title={title}
        showBackButton={showBackButton}
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
