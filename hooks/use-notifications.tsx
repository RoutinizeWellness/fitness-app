"use client"

import { useState, useEffect } from 'react'
import { NotificationService, Notification, Achievement } from '@/lib/notification-service'
import { useAuth } from '@/contexts/auth-context'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [latestAchievement, setLatestAchievement] = useState<Achievement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    let mounted = true
    const notificationService = NotificationService.getInstance()
    
    const initializeNotifications = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        
        // Inicializar el servicio con el ID de usuario
        await notificationService.setUserId(user.id)
        
        // Obtener notificaciones iniciales
        if (mounted) {
          setNotifications(notificationService.getAllNotifications())
          setUnreadCount(notificationService.getUnreadNotifications().length)
          setAchievements(notificationService.getAllAchievements())
          setIsLoading(false)
        }
        
        // Configurar listeners para actualizaciones
        const handleNotificationsUpdate = (updatedNotifications: Notification[]) => {
          if (mounted) {
            setNotifications(updatedNotifications)
            setUnreadCount(notificationService.getUnreadNotifications().length)
          }
        }
        
        const handleAchievementUpdate = (achievement: Achievement) => {
          if (mounted) {
            setLatestAchievement(achievement)
            setAchievements(notificationService.getAllAchievements())
          }
        }
        
        // Agregar listeners
        notificationService.addNotificationListener(handleNotificationsUpdate)
        notificationService.addAchievementListener(handleAchievementUpdate)
        
        // Limpiar listeners al desmontar
        return () => {
          mounted = false
          notificationService.removeNotificationListener(handleNotificationsUpdate)
          notificationService.removeAchievementListener(handleAchievementUpdate)
        }
      } catch (error) {
        console.error('Error al inicializar el servicio de notificaciones:', error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }
    
    initializeNotifications()
    
    // Limpiar al desmontar
    return () => {
      mounted = false
    }
  }, [user])
  
  // Enviar una notificación
  const sendNotification = async (
    title: string,
    message: string,
    type: 'achievement' | 'reminder' | 'goal' | 'info' | 'alert' = 'info',
    icon?: string,
    actionUrl?: string,
    expiresAt?: Date
  ) => {
    if (!user) return
    
    try {
      const notificationService = NotificationService.getInstance()
      const notificationId = await notificationService.sendNotification({
        title,
        message,
        type,
        icon,
        actionUrl,
        expiresAt
      })
      
      return notificationId
    } catch (error) {
      console.error('Error al enviar notificación:', error)
    }
  }
  
  // Marcar notificación como leída
  const markAsRead = async (notificationId: string) => {
    if (!user) return false
    
    try {
      const notificationService = NotificationService.getInstance()
      return await notificationService.markAsRead(notificationId)
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error)
      return false
    }
  }
  
  // Eliminar notificación
  const deleteNotification = async (notificationId: string) => {
    if (!user) return false
    
    try {
      const notificationService = NotificationService.getInstance()
      return await notificationService.deleteNotification(notificationId)
    } catch (error) {
      console.error('Error al eliminar notificación:', error)
      return false
    }
  }
  
  // Verificar logros relacionados con pasos
  const checkStepAchievements = async (steps: number) => {
    if (!user) return
    
    try {
      const notificationService = NotificationService.getInstance()
      await notificationService.checkStepAchievements(steps)
    } catch (error) {
      console.error('Error al verificar logros de pasos:', error)
    }
  }
  
  // Verificar logros relacionados con entrenamientos
  const checkWorkoutAchievements = async (workoutCount: number) => {
    if (!user) return
    
    try {
      const notificationService = NotificationService.getInstance()
      await notificationService.checkWorkoutAchievements(workoutCount)
    } catch (error) {
      console.error('Error al verificar logros de entrenamientos:', error)
    }
  }
  
  // Actualizar progreso de un logro
  const updateAchievementProgress = async (achievementId: string, progress: number) => {
    if (!user) return false
    
    try {
      const notificationService = NotificationService.getInstance()
      return await notificationService.updateAchievementProgress(achievementId, progress)
    } catch (error) {
      console.error('Error al actualizar progreso de logro:', error)
      return false
    }
  }
  
  return {
    notifications,
    unreadCount,
    achievements,
    latestAchievement,
    isLoading,
    sendNotification,
    markAsRead,
    deleteNotification,
    checkStepAchievements,
    checkWorkoutAchievements,
    updateAchievementProgress
  }
}
