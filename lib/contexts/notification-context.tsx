"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error" | "achievement" | "reminder"
  module?: string
  read: boolean
  timestamp: Date
  actionUrl?: string
  image?: string
  icon?: any
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  deleteAllNotifications: () => Promise<void>
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

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
  }
]

export function NotificationProvider({ children }: { children: ReactNode }) {
  // Safely get auth context
  let user = null
  try {
    const authContext = useAuth()
    user = authContext?.user || null
  } catch (error) {
    console.warn('NotificationProvider: AuthContext not available yet')
    user = null
  }

  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar notificaciones
  const loadNotifications = async () => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      // Verificar si la tabla existe
      try {
        const { error: tableCheckError } = await supabase
          .from('notifications')
          .select('count', { count: 'exact', head: true })
          .limit(1)

        if (tableCheckError) {
          console.warn('La tabla de notificaciones podría no existir:', tableCheckError)
          // Usar datos de ejemplo
          setNotifications(sampleNotifications)
          setUnreadCount(sampleNotifications.filter(n => !n.read).length)
          setIsLoading(false)
          return
        }
      } catch (tableError) {
        console.error('Error al verificar la tabla de notificaciones:', tableError)
        // Usar datos de ejemplo
        setNotifications(sampleNotifications)
        setUnreadCount(sampleNotifications.filter(n => !n.read).length)
        setIsLoading(false)
        return
      }

      // Obtener notificaciones
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error al cargar notificaciones:', error)
        // Manejar errores vacíos
        if (typeof error === 'object' && Object.keys(error).length === 0) {
          console.warn('Error vacío al cargar notificaciones, usando datos de ejemplo')
          setNotifications(sampleNotifications)
          setUnreadCount(sampleNotifications.filter(n => !n.read).length)
        } else {
          throw error
        }
      } else {
        // Transformar datos de Supabase al formato de la aplicación
        const formattedNotifications: Notification[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          message: item.message,
          type: item.type || "info",
          module: item.module,
          read: item.status === "read",
          timestamp: new Date(item.created_at),
          actionUrl: item.link,
          image: item.image
        }))

        setNotifications(formattedNotifications)
        setUnreadCount(formattedNotifications.filter(n => !n.read).length)
      }
    } catch (error) {
      console.error('Error inesperado al cargar notificaciones:', error)
      // Usar datos de ejemplo en caso de error
      setNotifications(sampleNotifications)
      setUnreadCount(sampleNotifications.filter(n => !n.read).length)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar notificaciones al iniciar y suscribirse a cambios
  useEffect(() => {
    loadNotifications()

    // Suscribirse a cambios en notificaciones
    if (user) {
      const notificationsSubscription = supabase
        .channel('notifications_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          loadNotifications()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(notificationsSubscription)
      }
    }
  }, [user])

  // Marcar notificación como leída
  const markAsRead = async (id: string) => {
    if (!user) return

    // Actualizar UI optimistamente
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      // Verificar si la tabla existe
      try {
        const { error: tableCheckError } = await supabase
          .from('notifications')
          .select('count', { count: 'exact', head: true })
          .limit(1)

        if (tableCheckError) {
          console.warn('La tabla de notificaciones podría no existir:', tableCheckError)
          return
        }
      } catch (tableError) {
        console.error('Error al verificar la tabla de notificaciones:', tableError)
        return
      }

      // Actualizar en la base de datos
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read', updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Error al marcar notificación como leída:', error)
        // Revertir UI en caso de error
        loadNotifications()
      }
    } catch (error) {
      console.error('Error inesperado al marcar notificación como leída:', error)
      // Revertir UI en caso de error
      loadNotifications()
    }
  }

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = async () => {
    if (!user) return

    // Actualizar UI optimistamente
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)

    try {
      // Verificar si la tabla existe
      try {
        const { error: tableCheckError } = await supabase
          .from('notifications')
          .select('count', { count: 'exact', head: true })
          .limit(1)

        if (tableCheckError) {
          console.warn('La tabla de notificaciones podría no existir:', tableCheckError)
          return
        }
      } catch (tableError) {
        console.error('Error al verificar la tabla de notificaciones:', tableError)
        return
      }

      // Actualizar en la base de datos
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read', updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('status', 'unread')

      if (error) {
        console.error('Error al marcar todas las notificaciones como leídas:', error)
        // Revertir UI en caso de error
        loadNotifications()
      }
    } catch (error) {
      console.error('Error inesperado al marcar todas las notificaciones como leídas:', error)
      // Revertir UI en caso de error
      loadNotifications()
    }
  }

  // Eliminar una notificación
  const deleteNotification = async (id: string) => {
    if (!user) return

    // Actualizar UI optimistamente
    const notificationToDelete = notifications.find(n => n.id === id)
    setNotifications(prev => prev.filter(notification => notification.id !== id))
    if (notificationToDelete && !notificationToDelete.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    try {
      // Verificar si la tabla existe
      try {
        const { error: tableCheckError } = await supabase
          .from('notifications')
          .select('count', { count: 'exact', head: true })
          .limit(1)

        if (tableCheckError) {
          console.warn('La tabla de notificaciones podría no existir:', tableCheckError)
          return
        }
      } catch (tableError) {
        console.error('Error al verificar la tabla de notificaciones:', tableError)
        return
      }

      // Eliminar de la base de datos
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error al eliminar notificación:', error)
        // Revertir UI en caso de error
        loadNotifications()
      }
    } catch (error) {
      console.error('Error inesperado al eliminar notificación:', error)
      // Revertir UI en caso de error
      loadNotifications()
    }
  }

  // Eliminar todas las notificaciones
  const deleteAllNotifications = async () => {
    if (!user) return

    // Actualizar UI optimistamente
    setNotifications([])
    setUnreadCount(0)

    try {
      // Verificar si la tabla existe
      try {
        const { error: tableCheckError } = await supabase
          .from('notifications')
          .select('count', { count: 'exact', head: true })
          .limit(1)

        if (tableCheckError) {
          console.warn('La tabla de notificaciones podría no existir:', tableCheckError)
          return
        }
      } catch (tableError) {
        console.error('Error al verificar la tabla de notificaciones:', tableError)
        return
      }

      // Eliminar de la base de datos
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('Error al eliminar todas las notificaciones:', error)
        // Revertir UI en caso de error
        loadNotifications()
      }
    } catch (error) {
      console.error('Error inesperado al eliminar todas las notificaciones:', error)
      // Revertir UI en caso de error
      loadNotifications()
    }
  }

  // Añadir una nueva notificación
  const addNotification = async (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    if (!user) return

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }

    // Actualizar UI optimistamente
    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)

    try {
      // Verificar si la tabla existe
      try {
        const { error: tableCheckError } = await supabase
          .from('notifications')
          .select('count', { count: 'exact', head: true })
          .limit(1)

        if (tableCheckError) {
          console.warn('La tabla de notificaciones podría no existir:', tableCheckError)
          return
        }
      } catch (tableError) {
        console.error('Error al verificar la tabla de notificaciones:', tableError)
        return
      }

      // Añadir a la base de datos
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          module: notification.module,
          status: 'unread',
          link: notification.actionUrl,
          image: notification.image,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error al añadir notificación:', error)
        // Revertir UI en caso de error
        loadNotifications()
      }
    } catch (error) {
      console.error('Error inesperado al añadir notificación:', error)
      // Revertir UI en caso de error
      loadNotifications()
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        addNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
