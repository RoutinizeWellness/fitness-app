"use client"

import { useState, useEffect } from "react"
import { 
  X, Bell, Dumbbell, Heart, Brain, 
  Utensils, Moon, CheckCircle, AlertCircle,
  Trash, Check, MoreVertical
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card3D } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Notification } from "@/lib/types/notifications"
import { notificationData } from "@/lib/notification-data"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NotificationsPanelProps {
  onClose: () => void
}

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // Cargar notificaciones
  useEffect(() => {
    // Simulamos una carga de datos
    const timer = setTimeout(() => {
      // Intentar obtener notificaciones del localStorage
      const storedNotifications = localStorage.getItem('notifications')
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications))
      } else {
        // Si no hay notificaciones en localStorage, usar los datos de demostración
        setNotifications(notificationData)
        // Guardar en localStorage para uso futuro
        localStorage.setItem('notifications', JSON.stringify(notificationData))
      }
      setIsLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Marcar todas como leídas
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({
      ...notif,
      read: true
    }))
    setNotifications(updatedNotifications)
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
  }
  
  // Marcar una notificación como leída
  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    )
    setNotifications(updatedNotifications)
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
  }
  
  // Eliminar una notificación
  const deleteNotification = (id: string) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== id)
    setNotifications(updatedNotifications)
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
  }
  
  // Eliminar todas las notificaciones
  const deleteAllNotifications = () => {
    setNotifications([])
    localStorage.setItem('notifications', JSON.stringify([]))
  }
  
  // Manejar clic en una notificación
  const handleNotificationClick = (notification: Notification) => {
    // Marcar como leída
    markAsRead(notification.id)
    
    // Navegar a la URL de acción si existe
    if (notification.actionUrl) {
      onClose()
      router.push(notification.actionUrl)
    }
  }
  
  // Obtener el icono según el tipo
  const getIcon = (icon: string) => {
    switch (icon) {
      case 'dumbbell':
        return <Dumbbell className="h-5 w-5" />
      case 'heart':
        return <Heart className="h-5 w-5" />
      case 'brain':
        return <Brain className="h-5 w-5" />
      case 'utensils':
        return <Utensils className="h-5 w-5" />
      case 'moon':
        return <Moon className="h-5 w-5" />
      case 'bell':
        return <Bell className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }
  
  // Obtener el color según el tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'training':
        return 'bg-blue-100 text-blue-600'
      case 'achievement':
        return 'bg-green-100 text-green-600'
      case 'wellness':
        return 'bg-purple-100 text-purple-600'
      case 'nutrition':
        return 'bg-orange-100 text-orange-600'
      case 'sleep':
        return 'bg-indigo-100 text-indigo-600'
      case 'productivity':
        return 'bg-yellow-100 text-yellow-600'
      case 'system':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }
  
  // Formatear fecha relativa
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffSecs < 60) {
      return 'Ahora mismo'
    } else if (diffMins < 60) {
      return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    } else if (diffDays < 7) {
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
    } else {
      return date.toLocaleDateString()
    }
  }
  
  // Contar notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-white z-50 p-4"
    >
      <div className="container max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button3D variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button3D>
            <h2 className="ml-2 text-lg font-semibold">Notificaciones</h2>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} {unreadCount === 1 ? 'nueva' : 'nuevas'}
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button3D variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button3D>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Marcar todo como leído
                </DropdownMenuItem>
                <DropdownMenuItem onClick={deleteAllNotifications}>
                  <Trash className="h-4 w-4 mr-2" />
                  Eliminar todas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
            <p className="text-gray-500">Cargando notificaciones...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">No hay notificaciones</h3>
            <p className="text-gray-500 text-center">
              Cuando tengas nuevas notificaciones, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card3D 
                    className={`p-4 cursor-pointer transition-colors ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex">
                      <div className={`rounded-full p-2 mr-3 ${getTypeColor(notification.type)}`}>
                        {getIcon(notification.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{notification.title}</p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button3D 
                                variant="ghost" 
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button3D>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!notification.read && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Marcar como leída
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}>
                                <Trash className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm text-gray-500">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(notification.createdAt)}</p>
                      </div>
                    </div>
                  </Card3D>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}
