"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  User, Settings, LogOut, Award,
  Heart, Bell, Shield, HelpCircle,
  ChevronRight, Dumbbell, Brain, Calendar,
  Clock, BarChart3, Zap, Bookmark
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Avatar3D, Avatar3DImage, Avatar3DFallback } from "@/components/ui/avatar-3d"
import { User as UserType } from "@supabase/supabase-js"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface HolisticProfileProps {
  profile: UserType | null
  isLoading?: boolean
  onNavigate?: (path: string) => void
  onLogout?: () => void
}

export function HolisticProfile({
  profile,
  isLoading = false,
  onNavigate,
  onLogout
}: HolisticProfileProps) {
  // Datos para los logros
  const achievements = [
    {
      id: "achievement1",
      title: "Primera meditación",
      description: "Completaste tu primera sesión de meditación",
      icon: Brain,
      color: "bg-purple-100 text-purple-600",
      date: "15/05/2023"
    },
    {
      id: "achievement2",
      title: "Racha de 7 días",
      description: "Mantuviste una racha de actividad durante 7 días",
      icon: Zap,
      color: "bg-amber-100 text-amber-600",
      date: "22/05/2023"
    },
    {
      id: "achievement3",
      title: "Plan completado",
      description: "Completaste tu primer plan de entrenamiento",
      icon: Dumbbell,
      color: "bg-blue-100 text-blue-600",
      date: "10/06/2023"
    }
  ]

  // Datos para las estadísticas
  const stats = [
    {
      id: "stat1",
      title: "Entrenamientos",
      value: 24,
      icon: Dumbbell,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: "stat2",
      title: "Meditaciones",
      value: 18,
      icon: Brain,
      color: "bg-purple-100 text-purple-600"
    },
    {
      id: "stat3",
      title: "Días activos",
      value: 32,
      icon: Calendar,
      color: "bg-green-100 text-green-600"
    },
    {
      id: "stat4",
      title: "Horas totales",
      value: 45,
      icon: Clock,
      color: "bg-amber-100 text-amber-600"
    }
  ]

  // Datos para los elementos guardados
  const savedItems = [
    {
      id: "saved1",
      title: "Yoga para principiantes",
      type: "Entrenamiento",
      icon: Dumbbell,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: "saved2",
      title: "Meditación guiada",
      type: "Mindfulness",
      icon: Brain,
      color: "bg-purple-100 text-purple-600"
    },
    {
      id: "saved3",
      title: "Receta de bowl proteico",
      type: "Nutrición",
      icon: Heart,
      color: "bg-red-100 text-red-600"
    }
  ]

  // Función para manejar la navegación
  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    }
  }

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Perfil del usuario */}
      <Card3D className="p-6">
        <div className="flex items-center">
          <Avatar3D className="h-16 w-16 mr-4">
            <Avatar3DImage src={profile?.user_metadata?.avatar_url || "/placeholder.svg"} />
            <Avatar3DFallback>{profile?.user_metadata?.full_name?.charAt(0) || "U"}</Avatar3DFallback>
          </Avatar3D>

          <div>
            <h1 className="text-xl font-bold">{profile?.user_metadata?.full_name || "Usuario"}</h1>
            <p className="text-gray-500">{profile?.email || "usuario@ejemplo.com"}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {profile?.user_metadata?.goal && (
                <Badge variant="outline">
                  Objetivo: {profile.user_metadata.goal === "build_muscle" ? "Ganar músculo" :
                            profile.user_metadata.goal === "lose_weight" ? "Perder peso" :
                            profile.user_metadata.goal === "maintain" ? "Mantener" :
                            profile.user_metadata.goal}
                </Badge>
              )}
              {profile?.user_metadata?.level && (
                <Badge variant="outline">
                  Nivel: {profile.user_metadata.level === "beginner" ? "Principiante" :
                         profile.user_metadata.level === "intermediate" ? "Intermedio" :
                         profile.user_metadata.level === "advanced" ? "Avanzado" :
                         profile.user_metadata.level}
                </Badge>
              )}
            </div>
            <div className="flex space-x-2 mt-2">
              <Button3D
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => handleNavigate("/profile/edit")}
              >
                Editar perfil
              </Button3D>
              <Button3D
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => handleNavigate("/profile/settings")}
              >
                <Settings className="h-3 w-3 mr-1" />
                Ajustes
              </Button3D>
            </div>
          </div>
        </div>
      </Card3D>

      {/* Estadísticas */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Tus estadísticas</h2>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <Card3D key={stat.id} className="p-4">
              <div className="flex items-center mb-2">
                <div className={`rounded-full ${stat.color} p-2 mr-2`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{stat.title}</span>
              </div>
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
            </Card3D>
          ))}
        </div>

        <Button3D
          variant="outline"
          className="w-full mt-4"
          onClick={() => handleNavigate("/profile/stats")}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Ver estadísticas detalladas
        </Button3D>
      </div>

      {/* Logros */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Tus logros</h2>
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <Card3D key={achievement.id} className="p-4">
              <div className="flex items-start">
                <div className={`rounded-full ${achievement.color} p-2 mr-3`}>
                  <achievement.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">{achievement.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Conseguido el {achievement.date}</p>
                </div>
              </div>
            </Card3D>
          ))}
        </div>

        <Button3D
          variant="outline"
          className="w-full mt-4"
          onClick={() => handleNavigate("/profile/achievements")}
        >
          <Award className="h-4 w-4 mr-2" />
          Ver todos los logros
        </Button3D>
      </div>

      {/* Elementos guardados */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Guardados</h2>
        <Card3D>
          <Card3DContent className="p-0">
            <div className="divide-y divide-gray-100">
              {savedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    <div className={`rounded-full ${item.color} p-2 mr-3`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-xs text-gray-500">{item.type}</p>
                    </div>
                  </div>
                  <Button3D
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button3D>
                </div>
              ))}
            </div>
          </Card3DContent>
        </Card3D>

        <Button3D
          variant="outline"
          className="w-full mt-4"
          onClick={() => handleNavigate("/profile/saved")}
        >
          <Bookmark className="h-4 w-4 mr-2" />
          Ver todos los guardados
        </Button3D>
      </div>

      {/* Opciones de cuenta */}
      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Opciones de cuenta</Card3DTitle>
        </Card3DHeader>
        <Card3DContent className="p-0">
          <div className="divide-y divide-gray-100">
            <Button3D
              variant="ghost"
              className="w-full justify-start rounded-none h-auto py-3 px-4"
              onClick={() => handleNavigate("/profile/notifications")}
            >
              <Bell className="h-4 w-4 mr-3" />
              Notificaciones
            </Button3D>

            <Button3D
              variant="ghost"
              className="w-full justify-start rounded-none h-auto py-3 px-4"
              onClick={() => handleNavigate("/profile/privacy")}
            >
              <Shield className="h-4 w-4 mr-3" />
              Privacidad y seguridad
            </Button3D>

            <Button3D
              variant="ghost"
              className="w-full justify-start rounded-none h-auto py-3 px-4"
              onClick={() => handleNavigate("/help")}
            >
              <HelpCircle className="h-4 w-4 mr-3" />
              Ayuda y soporte
            </Button3D>

            <Button3D
              variant="ghost"
              className="w-full justify-start rounded-none h-auto py-3 px-4 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Cerrar sesión
            </Button3D>
          </div>
        </Card3DContent>
      </Card3D>
    </div>
  )
}
