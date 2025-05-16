"use client"

import EnhancedDashboard from "@/components/enhanced-dashboard"
import type { Workout, Mood, NutritionEntry } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

interface DashboardProps {
  workoutLog: Workout[]
  moodLog: Mood[]
  nutritionLog: NutritionEntry[]
  profile: User | null
  isLoading: boolean
  setActiveTab: (tab: string) => void
}

export default function Dashboard({
  workoutLog,
  moodLog,
  nutritionLog,
  profile,
  isLoading,
  setActiveTab,
}: DashboardProps) {
  // Usar el nuevo componente EnhancedDashboard con diseño 3D
  return (
    <EnhancedDashboard
      workoutLog={workoutLog}
      moodLog={moodLog}
      nutritionLog={nutritionLog}
      profile={profile}
      isLoading={isLoading}
      setActiveTab={setActiveTab}
    />
  )
}
