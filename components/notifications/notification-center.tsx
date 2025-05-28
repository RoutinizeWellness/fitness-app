"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  X,
  Check,
  Info,
  AlertTriangle,
  AlertCircle,
  Dumbbell,
  Utensils,
  Moon,
  Heart,
  Calendar,
  Clock,
  User,
  Settings,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"

import { useNotifications, Notification } from "@/lib/contexts/notification-context"
import { Trophy } from "lucide-react"

interface NotificationCenterProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationCenter({
  isOpen,
  onOpenChange
}: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  } = useNotifications()
  const [activeTab, setActiveTab] = useState<string>("all")

  // Filtrar notificaciones según la pestaña activa
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    return notification.module === activeTab
  })

  // Obtener el icono según el tipo de notificación
  const getNotificationIcon = (notification: Notification) => {
    // Si la notificación tiene un icono personalizado, usarlo
    if (notification.icon) {
      const Icon = notification.icon
      return <Icon className="h-5 w-5" />
    }

    // Iconos por tipo
    switch (notification.type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "success":
        return <Check className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "achievement":
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case "reminder":
        return <Clock className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // Obtener el color de fondo según el tipo de notificación
  const getNotificationBgColor = (notification: Notification) => {
    if (notification.read) return "bg-gray-50 hover:bg-gray-100"

    switch (notification.type) {
      case "info":
        return "bg-blue-50 hover:bg-blue-100"
      case "success":
        return "bg-green-50 hover:bg-green-100"
      case "warning":
        return "bg-amber-50 hover:bg-amber-100"
      case "error":
        return "bg-red-50 hover:bg-red-100"
      case "achievement":
        return "bg-yellow-50 hover:bg-yellow-100"
      case "reminder":
        return "bg-purple-50 hover:bg-purple-100"
      default:
        return "bg-gray-50 hover:bg-gray-100"
    }
  }

  // Obtener el icono según el módulo
  const getModuleIcon = (module?: string) => {
    switch (module) {
      case "training":
        return <Dumbbell className="h-4 w-4" />
      case "nutrition":
        return <Utensils className="h-4 w-4" />
      case "sleep":
        return <Moon className="h-4 w-4" />
      case "wellness":
        return <Heart className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[90%] sm:w-[400px] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notificaciones
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount} nuevas
                  </Badge>
                )}
              </SheetTitle>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Marcar todo como leído
                </Button>
              </div>
            </div>
          </SheetHeader>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b">
              <TabsList className="w-full justify-start p-0 h-auto bg-transparent border-b-0">
                <div className="flex overflow-x-auto p-2 space-x-2 scrollbar-hide">
                  <TabsTrigger
                    value="all"
                    className="rounded-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    Todas
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="rounded-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    No leídas
                  </TabsTrigger>
                  <TabsTrigger
                    value="training"
                    className="rounded-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <Dumbbell className="h-4 w-4 mr-1" />
                    Entreno
                  </TabsTrigger>
                  <TabsTrigger
                    value="nutrition"
                    className="rounded-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <Utensils className="h-4 w-4 mr-1" />
                    Nutrición
                  </TabsTrigger>
                  <TabsTrigger
                    value="sleep"
                    className="rounded-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <Moon className="h-4 w-4 mr-1" />
                    Sueño
                  </TabsTrigger>
                </div>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <TabsContent value={activeTab} className="m-0 p-0">
                <AnimatePresence initial={false}>
                  {filteredNotifications.length > 0 ? (
                    <div className="divide-y">
                      {filteredNotifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "p-4 transition-colors cursor-pointer relative",
                            getNotificationBgColor(notification)
                          )}
                          onClick={() => {
                            if (!notification.read && notification.id) {
                              markAsRead(notification.id)
                            }
                            if (notification.actionUrl) {
                              onOpenChange(false)
                              router.push(notification.actionUrl)
                            }
                          }}
                        >
                          <div className="flex">
                            <div className="mr-3 mt-0.5">
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                {notification.image ? (
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={notification.image} />
                                    <AvatarFallback>
                                      {getNotificationIcon(notification)}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  getNotificationIcon(notification)
                                )}
                              </div>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className={cn(
                                  "text-sm font-medium",
                                  !notification.read && "font-semibold"
                                )}>
                                  {notification.title}
                                </h3>
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(notification.timestamp, {
                                    addSuffix: true,
                                    locale: es
                                  })}
                                </span>
                              </div>

                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>

                              {notification.module && (
                                <div className="flex items-center mt-2">
                                  <Badge
                                    variant="outline"
                                    className="text-xs flex items-center gap-1 font-normal"
                                  >
                                    {getModuleIcon(notification.module)}
                                    <span className="capitalize">{notification.module}</span>
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>

                          {!notification.read && (
                            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary"></div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Bell className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">No hay notificaciones</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {activeTab === "all"
                          ? "No tienes notificaciones en este momento."
                          : activeTab === "unread"
                            ? "No tienes notificaciones sin leer."
                            : `No tienes notificaciones de ${activeTab}.`
                        }
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <SheetFooter className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={deleteAllNotifications}
              disabled={notifications.length === 0}
            >
              Borrar todas las notificaciones
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
