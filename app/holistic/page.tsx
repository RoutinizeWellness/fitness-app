"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HolisticLayout } from "@/components/holistic-layout"
import { HolisticHome } from "@/components/holistic-home"
import { HolisticTraining } from "@/components/holistic-training"
import { HolisticMind } from "@/components/holistic-mind"
import { HolisticHealth } from "@/components/holistic-health"
import { HolisticProfile } from "@/components/holistic-profile"
import CrossDomainRecommendations from "@/components/cross-domain-recommendations"
import { useAuth } from "@/contexts/auth-context"
import { useSupabase } from "@/contexts/supabase-context"
import { Workout, Mood, NutritionEntry } from "@/lib/supabase-client"

export default function HolisticPage() {
  const { user, signOut } = useAuth()
  const { supabase } = useSupabase()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("home")
  const [isLoading, setIsLoading] = useState(true)
  const [workoutLog, setWorkoutLog] = useState<Workout[]>([])
  const [moodLog, setMoodLog] = useState<Mood[]>([])
  const [nutritionLog, setNutritionLog] = useState<NutritionEntry[]>([])

  // Cargar datos del usuario
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const fetchUserData = async () => {
      setIsLoading(true)

      try {
        // Cargar entrenamientos
        const { data: workouts, error: workoutsError } = await supabase
          .from("workouts")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })

        if (workoutsError) throw workoutsError
        setWorkoutLog(workouts || [])

        // Cargar registros de estado de ánimo
        const { data: moods, error: moodsError } = await supabase
          .from("moods")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })

        if (moodsError) throw moodsError
        setMoodLog(moods || [])

        // Cargar registros de nutrición
        const { data: nutrition, error: nutritionError } = await supabase
          .from("nutrition")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })

        if (nutritionError) throw nutritionError
        setNutritionLog(nutrition || [])
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user, supabase, router])

  // Manejar la navegación
  const handleNavigate = (path: string) => {
    router.push(path)
  }

  // Manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Determinar el título según la pestaña activa
  const getTitle = () => {
    switch (activeTab) {
      case "home":
        return "Routinize"
      case "training":
        return "Entrenamiento"
      case "mind":
        return "Mindfulness"
      case "health":
        return "Salud"
      case "recommendations":
        return "Recomendaciones Holísticas"
      case "profile":
        return "Perfil"
      default:
        return "Routinize"
    }
  }

  // Renderizar el contenido según la pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HolisticHome
            profile={user}
            workoutLog={workoutLog}
            moodLog={moodLog}
            nutritionLog={nutritionLog}
            isLoading={isLoading}
            onNavigate={handleNavigate}
          />
        )
      case "training":
        return (
          <HolisticTraining
            profile={user}
            workoutLog={workoutLog}
            isLoading={isLoading}
            onNavigate={handleNavigate}
          />
        )
      case "mind":
        return (
          <HolisticMind
            profile={user}
            moodLog={moodLog}
            isLoading={isLoading}
            onNavigate={handleNavigate}
          />
        )
      case "health":
        return (
          <HolisticHealth
            profile={user}
            nutritionLog={nutritionLog}
            isLoading={isLoading}
            onNavigate={handleNavigate}
          />
        )
      case "recommendations":
        return (
          <div className="p-4">
            <CrossDomainRecommendations />
          </div>
        )
      case "profile":
        return (
          <HolisticProfile
            profile={user}
            isLoading={isLoading}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )
      default:
        return (
          <HolisticHome
            profile={user}
            workoutLog={workoutLog}
            moodLog={moodLog}
            nutritionLog={nutritionLog}
            isLoading={isLoading}
            onNavigate={handleNavigate}
          />
        )
    }
  }

  return (
    <HolisticLayout
      title={getTitle()}
      profile={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </HolisticLayout>
  )
}
