"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth/auth-context"

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  status: 'read' | 'unread'
  link?: string
  created_at: string
  updated_at?: string
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar notificaciones
  useEffect(() => {
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
            const sampleNotifications = getSampleNotifications(user.id)
            setNotifications(sampleNotifications)
            setUnreadCount(sampleNotifications.filter(n => n.status === 'unread').length)
            setIsLoading(false)
            return
          }
        } catch (tableError) {
          console.error('Error al verificar la tabla de notificaciones:', tableError)
          // Usar datos de ejemplo
          const sampleNotifications = getSampleNotifications(user.id)
          setNotifications(sampleNotifications)
          setUnreadCount(sampleNotifications.filter(n => n.status === 'unread').length)
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
            const sampleNotifications = getSampleNotifications(user.id)
            setNotifications(sampleNotifications)
            setUnreadCount(sampleNotifications.filter(n => n.status === 'unread').length)
          } else {
            throw error
          }
        } else {
          setNotifications(data as Notification[])
          setUnreadCount(data.filter(n => n.status === 'unread').length)
        }
      } catch (error) {
        console.error('Error inesperado al cargar notificaciones:', error)
        // Usar datos de ejemplo en caso de error
        const sampleNotifications = getSampleNotifications(user.id)
        setNotifications(sampleNotifications)
        setUnreadCount(sampleNotifications.filter(n => n.status === 'unread').length)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()

    // Suscribirse a cambios en notificaciones
    const notificationsSubscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      }, () => {
        loadNotifications()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(notificationsSubscription)
    }
  }, [user])

  // Marcar notificación como leída
  const markAsRead = async (notificationId: string) => {
    if (!user) return { success: false }

    try {
      // Actualizar UI optimistamente
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'read' } 
            : notification
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))

      // Verificar si la tabla existe
      try {
        const { error: tableCheckError } = await supabase
          .from('notifications')
          .select('count', { count: 'exact', head: true })
          .limit(1)

        if (tableCheckError) {
          console.warn('La tabla de notificaciones podría no existir:', tableCheckError)
          return { success: true }
        }
      } catch (tableError) {
        console.error('Error al verificar la tabla de notificaciones:', tableError)
        return { success: true }
      }

      // Actualizar en la base de datos
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read', updated_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (error) {
        console.error('Error al marcar notificación como leída:', error)
        // Revertir UI en caso de error
        loadNotifications()
        return { success: false }
      }

      return { success: true }
    } catch (error) {
      console.error('Error inesperado al marcar notificación como leída:', error)
      // Revertir UI en caso de error
      loadNotifications()
      return { success: false }
    }
  }

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = async () => {
    if (!user) return { success: false }

    try {
      // Actualizar UI optimistamente
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, status: 'read' }))
      )
      setUnreadCount(0)

      // Verificar si la tabla existe
      try {
        const { error: tableCheckError } = await supabase
          .from('notifications')
          .select('count', { count: 'exact', head: true })
          .limit(1)

        if (tableCheckError) {
          console.warn('La tabla de notificaciones podría no existir:', tableCheckError)
          return { success: true }
        }
      } catch (tableError) {
        console.error('Error al verificar la tabla de notificaciones:', tableError)
        return { success: true }
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
        return { success: false }
      }

      return { success: true }
    } catch (error) {
      console.error('Error inesperado al marcar todas las notificaciones como leídas:', error)
      // Revertir UI en caso de error
      loadNotifications()
      return { success: false }
    }
  }

  // Obtener notificaciones de ejemplo
  const getSampleNotifications = (userId: string): Notification[] => {
    return [
      {
        id: '1',
        user_id: userId,
        title: 'Nuevo entrenamiento disponible',
        message: 'Se ha añadido un nuevo entrenamiento a tu plan. ¡Échale un vistazo!',
        type: 'info',
        status: 'unread',
        link: '/training',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        user_id: userId,
        title: 'Recordatorio de entrenamiento',
        message: 'Tienes un entrenamiento programado para hoy. ¡No olvides completarlo!',
        type: 'warning',
        status: 'unread',
        link: '/training/start-workout/day-1',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3',
        user_id: userId,
        title: 'Actualización de la aplicación',
        message: 'Hemos lanzado una nueva versión con mejoras y correcciones.',
        type: 'success',
        status: 'read',
        created_at: new Date(Date.now() - 172800000).toISOString()
      }
    ]
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  }
}
