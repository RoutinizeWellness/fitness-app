"use client"

import { useState } from "react"
import { OrganicLayout } from "@/components/organic-layout"
import { OrganicElement } from "@/components/transitions/organic-transitions"
import WearableDashboard from "@/components/wearable-dashboard"
import { useAuth } from "@/lib/auth/auth-context"

export default function ActivityPage() {
  // Safely get auth context
  let user = null
  try {
    const authContext = useAuth()
    user = authContext?.user || null
  } catch (error) {
    console.warn('ActivityPage: AuthContext not available yet')
    user = null
  }

  return (
    <OrganicLayout activeTab="activity" title="Actividad Física" profile={user}>
      <OrganicElement type="fade">
        <WearableDashboard />
      </OrganicElement>
    </OrganicLayout>
  )
}
