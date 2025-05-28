"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, Check, Trash2, Dumbbell, Utensils, Moon, Heart } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useNotifications } from "@/lib/contexts/notification-context"

// Tipos de notificaciones
type NotificationType = 'training' | 'nutrition' | 'sleep' | 'wellness' | 'system'

export function NotificationsContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications()
  const [activeTab, setActiveTab] = useState("all")

  // Filtrar notificaciones según la pestaña activa
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return !notification.read
    return notification.module === activeTab
  })

  // Obtener icono según el tipo de notificación
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'training':
        return <Dumbbell className="h-5 w-5 text-blue-500" />
      case 'nutrition':
        return <Utensils className="h-5 w-5 text-green-500" />
      case 'sleep':
        return <Moon className="h-5 w-5 text-purple-500" />
      case 'wellness':
        return <Heart className="h-5 w-5 text-red-500" />
      case 'system':
        return <Bell className="h-5 w-5 text-gray-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // Manejar la acción de marcar todas como leídas
  const handleMarkAllAsRead = () => {
    markAllAsRead()
    toast({
      title: 'Notificaciones actualizadas',
      description: 'Todas las notificaciones han sido marcadas como leídas',
    })
  }

  return (
    <div className="min-h-screen bg-[#FFF5EB] pb-20">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFF5EB]">
        <div className="container max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm"
            >
              <Bell className="h-5 w-5 text-[#573353]" />
            </button>
            <h1 className="text-xl font-bold text-[#573353]">Notificaciones</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        </div>
      </header>

      <main className="container max-w-md mx-auto px-4 pt-24 pb-32">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unread">No leídas</TabsTrigger>
            <TabsTrigger value="training">Entrenamiento</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrición</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              // Esqueletos de carga
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </Card>
              ))
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No hay notificaciones</h3>
                <p className="text-gray-500 mt-1">
                  {activeTab === 'unread' 
                    ? 'No tienes notificaciones sin leer' 
                    : activeTab === 'all' 
                      ? 'No tienes notificaciones' 
                      : `No tienes notificaciones de ${activeTab}`}
                </p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <Card 
                  key={notification.id} 
                  className={`p-4 ${!notification.read ? 'border-l-4 border-blue-500' : ''}`}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      {getNotificationIcon(notification.type || notification.module || 'system')}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt || notification.created_at), { 
                            addSuffix: true,
                            locale: es
                          })}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        {notification.actionUrl ? (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 h-auto text-blue-600"
                            onClick={() => {
                              if (notification.id) {
                                markAsRead(notification.id)
                              }
                              router.push(notification.actionUrl)
                            }}
                          >
                            Ver detalles
                          </Button>
                        ) : (
                          <div></div>
                        )}
                        <div className="flex gap-2">
                          {!notification.read && notification.id && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {notification.id && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
