"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import ModernNavigation from "@/components/modern-navigation"
import { CircularNavBar } from "@/components/navigation/circular-nav-bar"
import { NotificationCenter, Notification } from "@/components/notifications/notification-center"
import { useFeedback } from "@/components/feedback/action-feedback"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { CopilotChat } from "@/components/copilot-chat"
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
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { showFeedback } = useFeedback()

  const [activeTab, setActiveTab] = useState("dashboard")
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications)
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

  // Forzar la redirección al dashboard si estamos en otra ruta
  useEffect(() => {
    // Si estamos cargando, no hacer nada
    if (isLoading) return

    // Si no hay usuario, redirigir a login
    if (!user) {
      console.log("No hay usuario autenticado, redirigiendo a login")
      router.push("/auth/login")
      return
    }

    // Si estamos en la ruta correcta, no hacer nada
    if (pathname === "/dashboard") {
      console.log("Ya estamos en el dashboard, no es necesario redirigir")
      return
    }

    // Si estamos en una subruta del dashboard, no hacer nada
    if (pathname.startsWith("/dashboard/")) {
      console.log("Estamos en una subruta del dashboard, no es necesario redirigir")
      return
    }

    // En cualquier otro caso, forzar la redirección al dashboard
    console.log("Forzando redirección al dashboard desde layout")
    router.push("/dashboard")
  }, [user, isLoading, router, pathname])

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

  // Manejar notificaciones
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
    setIsNotificationsOpen(false)
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

  // Map our tabs to the circular nav bar tabs - using the same IDs now
  const mapTabToNavTab = (tab: string) => {
    return tab; // We're now using the same IDs in both components
  }

  // Map circular nav bar tabs to our app tabs - using the same IDs now
  const mapNavTabToTab = (navTab: string) => {
    return navTab; // We're now using the same IDs in both components
  }

  // Handle navigation from circular nav bar
  const handleNavTabChange = (navTab: string) => {
    const tab = mapNavTabToTab(navTab)
    handleTabChange(tab)

    // The navigation is now handled directly in the CircularNavBar component
    // through the route property of each navigation item
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Keep the original navigation for now (can be removed later) */}
      <div className="hidden">
        <ModernNavigation
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          notifications={notifications.filter(n => !n.read).length}
        />
      </div>

      <div className="content-area pb-20">
        <PageTransition>
          {children}
        </PageTransition>
      </div>

      {/* New Circular Navigation Bar */}
      <CircularNavBar
        activeTab={mapTabToNavTab(activeTab)}
        onTabChange={handleNavTabChange}
      />

      <NotificationCenter
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
        onNotificationClick={handleNotificationClick}
        isOpen={isNotificationsOpen}
        onOpenChange={setIsNotificationsOpen}
      />

      {/* Microsoft Copilot Studio Chat */}
      <CopilotChat />
    </div>
  )
}
