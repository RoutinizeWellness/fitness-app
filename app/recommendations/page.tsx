"use client"

import { useState } from "react"
import { OrganicLayout } from "@/components/organic-layout"
import { OrganicElement } from "@/components/transitions/organic-transitions"
import AIRecommendations from "@/components/ai-recommendations"
import { useAuth } from "@/lib/contexts/auth-context"

export default function RecommendationsPage() {
  const { user } = useAuth()

  return (
    <OrganicLayout activeTab="recommendations" title="Recomendaciones IA" profile={user}>
      <OrganicElement type="fade">
        <AIRecommendations />
      </OrganicElement>
    </OrganicLayout>
  )
}
