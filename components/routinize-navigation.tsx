"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dumbbell, Utensils, Moon, Brain, Heart,
  Bell, Search, X, ChevronLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar3D, Avatar3DImage, Avatar3DFallback } from "@/components/ui/avatar-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Card3D } from "@/components/ui/card-3d"
import { User as UserType } from "@supabase/supabase-js"

interface RoutinizeNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  profile?: UserType | null
  isAdmin?: boolean
}

export default function RoutinizeNavigation({
  activeTab,
  setActiveTab,
  profile = null,
  isAdmin = false
}: RoutinizeNavigationProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const tabs = [
    { id: "dashboard", label: "Inicio", icon: ChevronLeft },
    { id: "training", label: "Entreno", icon: Dumbbell },
    { id: "nutrition", label: "Nutrición", icon: Utensils },
    { id: "sleep", label: "Sueño", icon: Moon },
    { id: "wellness", label: "Bienestar", icon: Heart }
  ]

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold gradient-text">Routinize</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button3D
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button3D>

            <Button3D
              variant="ghost"
              size="icon"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell className="h-5 w-5" />
            </Button3D>

            <Button3D
              variant="ghost"
              size="icon"
              className="rounded-full p-0"
              onClick={() => setActiveTab("profile")}
            >
              <Avatar3D className="h-9 w-9 border-2 border-primary">
                <Avatar3DImage src={profile?.user_metadata?.avatar_url || "/placeholder.svg"} alt={profile?.user_metadata?.full_name || "Usuario"} />
                <Avatar3DFallback>{profile?.user_metadata?.full_name?.charAt(0) || profile?.email?.charAt(0)?.toUpperCase() || "U"}</Avatar3DFallback>
              </Avatar3D>
            </Button3D>
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-lg">
        <div className="container max-w-md mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-full",
                    "transition-colors duration-200",
                    isActive ? "text-primary" : "text-gray-500 hover:text-gray-700"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5 mb-1" />
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"
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



      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white z-50 p-4"
          >
            <div className="container max-w-md mx-auto">
              <div className="flex items-center mb-4">
                <Button3D variant="ghost" size="icon" onClick={() => setSearchOpen(false)}>
                  <X className="h-5 w-5" />
                </Button3D>
                <h2 className="ml-2 text-lg font-semibold">Buscar</h2>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar entrenamientos, ejercicios..."
                  className="w-full p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Búsquedas recientes</h3>
                <div className="space-y-2">
                  <Card3D className="p-3">
                    <div className="flex items-center">
                      <Search className="h-4 w-4 text-gray-400 mr-2" />
                      <span>Yoga para principiantes</span>
                    </div>
                  </Card3D>
                  <Card3D className="p-3">
                    <div className="flex items-center">
                      <Search className="h-4 w-4 text-gray-400 mr-2" />
                      <span>Meditación guiada</span>
                    </div>
                  </Card3D>
                  <Card3D className="p-3">
                    <div className="flex items-center">
                      <Search className="h-4 w-4 text-gray-400 mr-2" />
                      <span>Ejercicios para espalda</span>
                    </div>
                  </Card3D>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Overlay */}
      <AnimatePresence>
        {notificationsOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white z-50 p-4"
          >
            <div className="container max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Button3D variant="ghost" size="icon" onClick={() => setNotificationsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button3D>
                  <h2 className="ml-2 text-lg font-semibold">Notificaciones</h2>
                </div>
                <Button3D variant="ghost" size="sm">Marcar todo como leído</Button3D>
              </div>

              <div className="space-y-3">
                <Card3D className="p-4">
                  <div className="flex">
                    <div className="rounded-full bg-blue-100 p-2 mr-3">
                      <Dumbbell className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Nuevo entrenamiento disponible</p>
                      <p className="text-sm text-gray-500">Hemos añadido un nuevo entrenamiento de yoga para ti.</p>
                      <p className="text-xs text-gray-400 mt-1">Hace 2 horas</p>
                    </div>
                  </div>
                </Card3D>

                <Card3D className="p-4">
                  <div className="flex">
                    <div className="rounded-full bg-green-100 p-2 mr-3">
                      <Heart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">¡Felicidades!</p>
                      <p className="text-sm text-gray-500">Has completado tu objetivo semanal de actividad.</p>
                      <p className="text-xs text-gray-400 mt-1">Ayer</p>
                    </div>
                  </div>
                </Card3D>

                <Card3D className="p-4">
                  <div className="flex">
                    <div className="rounded-full bg-purple-100 p-2 mr-3">
                      <Brain className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Recordatorio de meditación</p>
                      <p className="text-sm text-gray-500">No olvides tu sesión de meditación diaria.</p>
                      <p className="text-xs text-gray-400 mt-1">Hace 2 días</p>
                    </div>
                  </div>
                </Card3D>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
