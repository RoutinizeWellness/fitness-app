"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useSupabase } from "@/contexts/supabase-context"
import { Button } from "@/components/ui/button"
import { Loader2, Bell, X, Check, Award, Calendar } from "lucide-react"
import { NotificationService, Notification } from "@/lib/services/notification-service"
import { toast } from "@/components/ui/use-toast"

interface NotificationsListProps {
  onClose?: () => void
}

export function NotificationsList({ onClose }: NotificationsListProps) {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  // Servicio de notificaciones
  const notificationService = new NotificationService(supabase)
  
  // Cargar notificaciones
  useEffect(() => {
    if (!user) return
    
    const loadNotifications = async () => {
      try {
        const userNotifications = await notificationService.getUserNotifications(user.id)
        setNotifications(userNotifications)
      } catch (error) {
        console.error("Error loading notifications:", error)
        toast({
          title: "Error",
          description: "Failed to load notifications. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadNotifications()
  }, [user, supabase])
  
  // Marcar como leída
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const success = await notificationService.markAsRead(notificationId)
      
      if (success) {
        // Actualizar estado local
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true } 
              : notification
          )
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }
  
  // Eliminar notificación
  const handleDelete = async (notificationId: string) => {
    try {
      const success = await notificationService.deleteNotification(notificationId)
      
      if (success) {
        // Actualizar estado local
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        )
        
        toast({
          title: "Notification Deleted",
          description: "The notification has been removed.",
        })
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    if (!user) return
    
    try {
      const success = await notificationService.markAllAsRead(user.id)
      
      if (success) {
        // Actualizar estado local
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        )
        
        toast({
          title: "Success",
          description: "All notifications marked as read.",
        })
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Obtener icono según el tipo de notificación
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'habit':
        return <Calendar className="h-5 w-5 text-[#FDA758]" />
      case 'streak':
        return <Award className="h-5 w-5 text-[#FDA758]" />
      case 'subscription':
        return <Check className="h-5 w-5 text-[#FDA758]" />
      default:
        return <Bell className="h-5 w-5 text-[#FDA758]" />
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#FDA758]" />
      </div>
    )
  }
  
  return (
    <div className="p-6 bg-white rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#573353] text-xl font-medium">Notifications</h2>
        
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            onClick={handleMarkAllAsRead}
            className="text-[#FDA758] text-sm hover:bg-[#FDA758]/10"
          >
            Mark all as read
          </Button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-[#FDA758]/20 flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-[#FDA758]" />
          </div>
          <p className="text-[#573353] font-medium">No notifications</p>
          <p className="text-[#573353]/70 text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-4 rounded-xl ${notification.is_read ? 'bg-gray-50' : 'bg-[#FFF2E9]'} relative`}
            >
              <div className="flex">
                <div className="w-10 h-10 rounded-full bg-[#FDA758]/20 flex items-center justify-center mr-3 flex-shrink-0">
                  {notification.image_url ? (
                    <Image
                      src={notification.image_url}
                      alt=""
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  ) : (
                    getNotificationIcon(notification.type)
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`text-[#573353] font-medium ${!notification.is_read ? 'font-bold' : ''}`}>
                    {notification.title}
                  </h3>
                  <p className="text-[#573353]/70 text-sm mt-1">
                    {notification.message}
                  </p>
                  
                  {notification.action_url && (
                    <Link 
                      href={notification.action_url}
                      className="text-[#FDA758] text-sm mt-2 inline-block"
                      onClick={() => handleMarkAsRead(notification.id!)}
                    >
                      View Details
                    </Link>
                  )}
                  
                  <div className="text-[#573353]/50 text-xs mt-2">
                    {new Date(notification.created_at!).toLocaleString()}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(notification.id!)}
                  className="absolute top-2 right-2 text-[#573353]/50 hover:text-[#573353]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {!notification.is_read && (
                <div className="absolute top-4 right-10 w-2 h-2 rounded-full bg-[#FDA758]"></div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {onClose && (
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[#573353]"
          >
            Close
          </Button>
        </div>
      )}
    </div>
  )
}
