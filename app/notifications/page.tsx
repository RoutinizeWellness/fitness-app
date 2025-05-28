"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { NotificationProvider, useNotifications } from "@/lib/contexts/notification-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, ArrowLeft, Check, Trash2, Calendar, Dumbbell, Utensils, Moon, Heart } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

// Tipos de notificaciones
type NotificationType = 'training' | 'nutrition' | 'sleep' | 'wellness' | 'system'
type NotificationStatus = 'unread' | 'read'

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  status: NotificationStatus
  link?: string
  created_at: string
  metadata?: any
}

// Importar el componente de contenido de notificaciones
import { NotificationsContent } from "@/components/notifications/notifications-content"

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])



  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <NotificationProvider>
      <NotificationsContent />
    </NotificationProvider>
  )
}
