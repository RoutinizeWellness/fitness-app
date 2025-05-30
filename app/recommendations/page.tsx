"use client"

import { useState } from "react"
import { OrganicLayout } from "@/components/organic-layout"
import { OrganicElement } from "@/components/transitions/organic-transitions"
import AIRecommendations from "@/components/ai-recommendations"
import { useAuth } from "@/lib/auth/auth-context"

export default function RecommendationsPage() {
  // Safely get auth context
  let user = null
  try {
    const authContext = useAuth()
    user = authContext?.user || null
  } catch (error) {
    console.warn('RecommendationsPage: AuthContext not available yet')
    user = null
  }

  return (
    <OrganicLayout activeTab="recommendations" title="Recomendaciones IA" profile={user}>
      <OrganicElement type="fade">
        <AIRecommendations />
      </OrganicElement>
    </OrganicLayout>
  )
}
