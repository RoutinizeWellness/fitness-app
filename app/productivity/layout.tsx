"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { UnifiedLayout } from "@/components/layout/unified-layout"
import { PageTransition } from "@/components/ui/page-transition"
import { GeminiChat } from "@/components/gemini-chat"
import { NotificationProvider } from "@/lib/contexts/notification-context"

export default function ProductivityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("productivity")

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
        title="Productividad"
      >
        <PageTransition>
          {children}
        </PageTransition>

        {/* Gemini Chat */}
        <GeminiChat context={{ currentModule: "productivity" }} />
      </UnifiedLayout>
    </NotificationProvider>
  )
}
