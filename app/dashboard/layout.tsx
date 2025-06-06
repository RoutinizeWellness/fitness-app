"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { TrainingProvider } from "@/lib/contexts/training-context"
import { UnifiedLayout } from "@/components/layout/unified-layout"
import { NotificationCenter, Notification } from "@/components/notifications/notification-center"
import { NotificationProvider } from "@/lib/contexts/notification-context"
import { useFeedback } from "@/components/feedback/action-feedback"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { CopilotChat } from "@/components/copilot-chat"
import { GeminiChat } from "@/components/gemini-chat"
import { GeminiProvider } from "@/lib/contexts/gemini-provider"
import { PageTransition } from "@/components/ui/page-transition"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Datos de ejemplo para notificaciones
const sampleNotifications: Notification[] = [
  {
    id: "1",
    title: "Nuevo entrenamiento disponible",
    message: "Hemos añadido un nuevo entrenamiento de fuerza a tu plan semanal.",
    type: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
    read: false,
    module: "training",
    actionUrl: "/training/workouts"
  },
  {
    id: "2",
    title: "¡Objetivo completado!",
    message: "Has alcanzado tu objetivo de proteínas para hoy. ¡Sigue así!",
    type: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
    read: true,
    module: "nutrition"
  },
  {
    id: "3",
    title: "Recordatorio de sueño",
    message: "Es hora de prepararte para dormir. Recuerda seguir tu rutina para un mejor descanso.",
    type: "reminder",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 horas atrás
    read: false,
    module: "sleep"
  },
  {
    id: "4",
    title: "Actualización de la aplicación",
    message: "Hemos actualizado la aplicación con nuevas funciones y mejoras de rendimiento.",
    type: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
    read: true,
    module: "system"
  },
  {
    id: "5",
    title: "Nuevo mensaje de tu entrenador",
    message: "Tu entrenador ha dejado comentarios sobre tu último entrenamiento.",
    type: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 días atrás
    read: false,
    module: "training",
    actionUrl: "/training/feedback"
  }
]

export default function DashboardLayout({
  children
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
    console.warn('DashboardLayout: AuthContext not available yet')
    user = null
    profile = null
    isLoading = true
  }

  const router = useRouter()
  const pathname = usePathname()
  const { showFeedback } = useFeedback()

  const [activeTab, setActiveTab] = useState("dashboard")
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  // Determinar la pestaña activa basada en la ruta
  useEffect(() => {
    if (pathname.includes("/training")) {
      setActiveTab("training")
    } else if (pathname.includes("/nutrition")) {
      setActiveTab("nutrition")
    } else if (pathname.includes("/sleep")) {
      setActiveTab("sleep")
    } else if (pathname.includes("/wellness")) {
      setActiveTab("wellness")
    } else {
      setActiveTab("dashboard")
    }
  }, [pathname])

  // Verificar autenticación sin forzar redirecciones innecesarias
  useEffect(() => {
    // Si estamos cargando, no hacer nada
    if (isLoading) return

    // Si no hay usuario, el middleware ya manejará la redirección
    if (!user) {
      console.log("No hay usuario autenticado en dashboard layout")
      return
    }

    console.log("Usuario autenticado en dashboard layout:", user.email)
  }, [user, isLoading])

  // Manejar cambio de pestaña
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)

    // Mostrar feedback de cambio de módulo
    showFeedback({
      message: `Cambiando a módulo de ${getTabName(tab)}`,
      type: "info",
      position: "bottom"
    })
  }

  // Obtener nombre de pestaña
  const getTabName = (tab: string) => {
    switch (tab) {
      case "dashboard":
        return "Inicio"
      case "training":
        return "Entrenamiento"
      case "nutrition":
        return "Nutrición"
      case "sleep":
        return "Sueño"
      case "wellness":
        return "Bienestar"
      default:
        return tab
    }
  }

  // Manejar apertura/cierre del panel de notificaciones
  const handleNotificationsOpenChange = (open: boolean) => {
    setIsNotificationsOpen(open)
  }

  // Mostrar loader mientras carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Cargando tu perfil..." />
      </div>
    )
  }

  // Si no hay usuario autenticado, no renderizar nada (se redirigirá a login)
  if (!user) {
    return null
  }

  // These mapping functions are no longer needed since we're only using UnifiedLayout
  // and not the CircularNavBar component in this layout

  return (
    <NotificationProvider>
      <UnifiedLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        title="Routinize"
      >
        <PageTransition>
          <TrainingProvider>
            {children}
          </TrainingProvider>
        </PageTransition>

        {/* Gemini Chat */}
        <GeminiProvider context={{ currentModule: activeTab }}>
          <GeminiChat context={{ currentModule: activeTab }} />
        </GeminiProvider>

        <NotificationCenter
          isOpen={isNotificationsOpen}
          onOpenChange={handleNotificationsOpenChange}
        />

        {/* Microsoft Copilot Studio Chat */}
        <CopilotChat />
      </UnifiedLayout>
    </NotificationProvider>
  )
}
