"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { TrainingModule } from "@/components/training/training-module"
import { NutritionModule } from "@/components/modules/nutrition-module"
import { SleepModule } from "@/components/modules/sleep-module"
import { ProductivityModule } from "@/components/modules/productivity-module"
import { WellnessModule } from "@/components/modules/wellness-module"
import { ProfileSettings } from "@/components/profile-settings"
import { HolisticProfile } from "@/components/holistic-profile"
import { useAuth } from "@/contexts/auth-context"
import { useSupabase } from "@/contexts/supabase-context"

export default function RoutinizePage() {
  const { user, signOut } = useAuth()
  const { supabase } = useSupabase()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("training")
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // Verificar si el usuario está autenticado y si es admin
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setIsAdmin(user.email === "admin@routinize.com")
    setIsLoading(false)
  }, [user, router])

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
      case "dashboard":
        return "Inicio"
      case "training":
        return "Entrenamiento"
      case "nutrition":
        return "Nutrición"
      case "sleep":
        return "Sueño"
      case "productivity":
        return "Productividad"
      case "wellness":
        return "Bienestar"
      case "profile":
        return "Mi Perfil"
      default:
        return "Routinize"
    }
  }

  // Renderizar el contenido según la pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <HolisticProfile
            profile={user}
            isLoading={isLoading}
            onNavigate={handleNavigate}
          />
        )
      case "training":
        return (
          <TrainingModule
            profile={user}
            isAdmin={isAdmin}
            isLoading={isLoading}
            onNavigate={handleNavigate}
          />
        )
      case "nutrition":
        return (
          <NutritionModule
            profile={user}
            isAdmin={isAdmin}
            isLoading={isLoading}
            onNavigate={handleNavigate}
          />
        )
      case "sleep":
        return (
          <SleepModule
            profile={user}
            isAdmin={isAdmin}
            isLoading={isLoading}
            onNavigate={handleNavigate}
          />
        )
      case "productivity":
        return (
          <ProductivityModule
            profile={user}
            isAdmin={isAdmin}
            isLoading={isLoading}
            onNavigate={handleNavigate}
          />
        )
      case "wellness":
        return (
          <WellnessModule
            profile={user}
            isAdmin={isAdmin}
            isLoading={isLoading}
            onNavigate={handleNavigate}
          />
        )
      case "profile":
        return (
          <ProfileSettings
            profile={user}
            isLoading={isLoading}
            onSave={() => {
              // Recargar la página para mostrar los cambios
              window.location.reload()
            }}
            onCancel={() => setActiveTab("dashboard")}
          />
        )
      default:
        return (
          <TrainingModule
            profile={user}
            isAdmin={isAdmin}
            isLoading={isLoading}
            onNavigate={handleNavigate}
          />
        )
    }
  }

  return (
    <RoutinizeLayout
      title={getTitle()}
      profile={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </RoutinizeLayout>
  )
}
