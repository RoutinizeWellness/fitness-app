"use client"

import { useState } from "react"
import { OrganicLayout } from "@/components/organic-layout"
import { OrganicElement } from "@/components/transitions/organic-transitions"
import WearableDashboard from "@/components/wearable-dashboard"
import { useAuth } from "@/lib/contexts/auth-context"

export default function ActivityPage() {
  const { user } = useAuth()

  return (
    <OrganicLayout activeTab="activity" title="Actividad Física" profile={user}>
      <OrganicElement type="fade">
        <WearableDashboard />
      </OrganicElement>
    </OrganicLayout>
  )
}
