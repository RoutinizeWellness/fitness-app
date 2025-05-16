"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home, Dumbbell, Utensils, Moon, Heart,
  Menu, Bell, Search, X, ChevronLeft,
  Settings, LogOut, User, Shield, Plus,
  BarChart2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar3D, Avatar3DImage, Avatar3DFallback } from "@/components/ui/avatar-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Card3D } from "@/components/ui/card-3d"
import { useRouter } from "next/navigation"
import { User as UserType } from "@supabase/supabase-js"
import { NotificationsPanel } from "@/components/notifications-panel"
import { notificationData } from "@/lib/notification-data"

interface RoutinizeLayoutProps {
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
  showHeader?: boolean
  profile?: UserType | null
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function RoutinizeLayout({
  children,
  title = "Routinize",
  showBackButton = false,
  showHeader = true,
  profile = null,
  activeTab = "training",
  onTabChange
}: RoutinizeLayoutProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Verificar si el usuario es admin
  useEffect(() => {
    if (profile?.email === "admin@routinize.com") {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [profile])

  const tabs = [
    { id: "dashboard", label: "Inicio", icon: Home, route: "/" },
    { id: "training", label: "Entreno", icon: Dumbbell, route: "/training" },
    { id: "nutrition", label: "Nutrición", icon: Utensils, route: "/nutrition" },
    { id: "sleep", label: "Sueño", icon: Moon, route: "/sleep" },
    { id: "productivity", label: "Productividad", icon: BarChart2, route: "/productivity" },
    { id: "wellness", label: "Bienestar", icon: Heart, route: "/wellness" },
  ]

  const handleTabChange = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 relative max-w-screen overflow-x-hidden">
      {/* Header - Optimizado para móvil */}
      {showHeader && (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm safe-top">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center">
              {showBackButton ? (
                <button
                  className="mr-2 p-2 -ml-2 rounded-full hover:bg-gray-100"
                  onClick={handleBack}
                  aria-label="Volver"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              ) : (
                <h1 className="text-lg font-bold text-blue-500">Routinize</h1>
              )}
              {showBackButton && <h1 className="text-lg font-semibold">{title}</h1>}
            </div>

            <div className="flex items-center space-x-2">
              <button
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={() => setSearchOpen(true)}
                aria-label="Buscar"
              >
                <Search className="h-5 w-5 text-gray-500" />
              </button>

              <button
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={() => setNotificationsOpen(true)}
                aria-label="Notificaciones"
              >
                <div className="relative">
                  <Bell className="h-5 w-5 text-gray-500" />
                  {notificationData.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </div>
              </button>

              <button
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={() => router.push("/profile")}
                aria-label="Perfil"
              >
                <Avatar3D className="h-8 w-8">
                  <Avatar3DFallback>
                    <User className="h-4 w-4" />
                  </Avatar3DFallback>
                </Avatar3D>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content - Optimizado para móvil */}
      <main className="flex-1 container mx-auto px-4 pt-4 pb-24 safe-bottom">
        {children}
      </main>

      {/* Floating Action Button (FAB) - Optimizado para móvil */}
      <button
        className="fixed right-4 bottom-20 z-40 w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center hover:bg-blue-600 active:bg-blue-700 transition-colors"
        onClick={() => {
          // Acción según la pestaña activa
          if (activeTab === "training") {
            router.push("/training/new");
          } else if (activeTab === "nutrition") {
            router.push("/nutrition/new");
          } else if (activeTab === "sleep") {
            router.push("/sleep/new");
          } else if (activeTab === "productivity") {
            router.push("/productivity/new");
          } else if (activeTab === "wellness") {
            router.push("/wellness/new");
          } else {
            // Por defecto, ir a la página de creación de la pestaña activa
            const activeTabObj = tabs.find(tab => tab.id === activeTab);
            if (activeTabObj) {
              router.push(`${activeTabObj.route}/new`);
            }
          }
        }}
        aria-label="Añadir nuevo"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Bottom Navigation - Optimizado para móvil */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-lg safe-bottom">
        <div className="container mx-auto">
          <div className="flex items-center justify-around h-16">
            {/* Mostrar solo las primeras 5 pestañas */}
            {tabs.slice(0, 5).map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-full",
                    "transition-colors duration-200 py-1",
                    isActive ? "text-blue-500" : "text-gray-500 hover:text-gray-700"
                  )}
                  onClick={() => {
                    router.push(tab.route);
                    if (onTabChange) {
                      onTabChange(tab.id);
                    }
                  }}
                  aria-label={tab.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="relative">
                    <Icon className="h-6 w-6 mb-1" />
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>



      {/* Search Overlay - Optimizado para móvil */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white z-50 safe-area-inset"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center p-4 border-b border-gray-100">
                <button
                  className="p-2 -ml-2 rounded-full hover:bg-gray-100"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Cerrar búsqueda"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="ml-2 text-lg font-semibold">Buscar</h2>
              </div>

              <div className="p-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar entrenamientos, ejercicios..."
                    className="w-full p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Búsquedas recientes</h3>
                <div className="space-y-3">
                  <Card3D className="p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <Search className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">Yoga para principiantes</span>
                    </div>
                  </Card3D>
                  <Card3D className="p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <Search className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">Meditación guiada</span>
                    </div>
                  </Card3D>
                  <Card3D className="p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <Search className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">Ejercicios para espalda</span>
                    </div>
                  </Card3D>
                  <Card3D className="p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <Search className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">Rutina de fuerza</span>
                    </div>
                  </Card3D>
                  <Card3D className="p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <Search className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">Recetas saludables</span>
                    </div>
                  </Card3D>
                </div>

                <h3 className="text-sm font-medium text-gray-500 mt-6 mb-3">Categorías populares</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                    Entrenamiento
                  </button>
                  <button className="px-3 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                    Nutrición
                  </button>
                  <button className="px-3 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">
                    Meditación
                  </button>
                  <button className="px-3 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-medium">
                    Yoga
                  </button>
                  <button className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium">
                    Sueño
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Overlay - Optimizado para móvil */}
      <AnimatePresence>
        {notificationsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white z-50 safe-area-inset"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center">
                  <button
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100"
                    onClick={() => setNotificationsOpen(false)}
                    aria-label="Cerrar notificaciones"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <h2 className="ml-2 text-lg font-semibold">Notificaciones</h2>
                </div>
                <button className="text-sm text-blue-500 font-medium">Marcar todo como leído</button>
              </div>

              <div className="flex-1 overflow-auto">
                {notificationData.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {notificationData.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                      >
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full mr-3 ${
                            notification.type === 'training' ? 'bg-blue-100 text-blue-600' :
                            notification.type === 'nutrition' ? 'bg-green-100 text-green-600' :
                            notification.type === 'sleep' ? 'bg-indigo-100 text-indigo-600' :
                            notification.type === 'wellness' ? 'bg-purple-100 text-purple-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {notification.type === 'training' && <Dumbbell className="h-5 w-5" />}
                            {notification.type === 'nutrition' && <Utensils className="h-5 w-5" />}
                            {notification.type === 'sleep' && <Moon className="h-5 w-5" />}
                            {notification.type === 'wellness' && <Heart className="h-5 w-5" />}
                            {notification.type === 'system' && <Bell className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                            <p className="text-gray-400 text-xs mt-2">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <Bell className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No tienes notificaciones</p>
                    <p className="text-gray-400 text-sm mt-1">Las notificaciones aparecerán aquí</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
