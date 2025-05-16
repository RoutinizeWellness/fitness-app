"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Heart, Clock, Calendar, Filter,
  ChevronRight, Play, Bookmark, Share2,
  BarChart3, Smile, Frown, Meh,
  Sun, Cloud, Droplet, Leaf, Plus,
  Wind, Lungs, Timer, X
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Avatar3D, Avatar3DImage, Avatar3DFallback } from "@/components/ui/avatar-3d"
import { User } from "@supabase/supabase-js"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { WimHofBreathing } from "@/components/wellness/wim-hof-breathing"
import { BreathingStats } from "@/components/wellness/breathing-stats"

interface WellnessModuleProps {
  profile: User | null
  isAdmin: boolean
  isLoading?: boolean
  onNavigate?: (path: string) => void
}

export function WellnessModule({
  profile,
  isAdmin,
  isLoading = false,
  onNavigate
}: WellnessModuleProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [showWimHof, setShowWimHof] = useState(false)

  // Categorías de bienestar
  const categories = [
    { id: "all", name: "Todos" },
    { id: "mental", name: "Mental" },
    { id: "emotional", name: "Emocional" },
    { id: "physical", name: "Físico" },
    { id: "social", name: "Social" }
  ]

  // Datos para el seguimiento del estado de ánimo
  const moodData = [
    { day: "Lun", mood: 4, icon: Smile, color: "text-green-500" },
    { day: "Mar", mood: 3, icon: Meh, color: "text-amber-500" },
    { day: "Mié", mood: 5, icon: Smile, color: "text-green-500" },
    { day: "Jue", mood: 4, icon: Smile, color: "text-green-500" },
    { day: "Vie", mood: 2, icon: Frown, color: "text-red-500" },
    { day: "Sáb", mood: 4, icon: Smile, color: "text-green-500" },
    { day: "Dom", mood: 5, icon: Smile, color: "text-green-500" }
  ]

  // Datos para las actividades de bienestar
  const wellnessActivities = [
    {
      id: "wim-hof",
      title: "Método Wim Hof",
      category: "Físico",
      duration: "15 min",
      color: "from-blue-500 to-indigo-600",
      action: () => setShowWimHof(true)
    },
    {
      id: "activity1",
      title: "Meditación guiada",
      category: "Mental",
      duration: "10 min",
      color: "from-indigo-500 to-purple-600"
    },
    {
      id: "activity2",
      title: "Respiración 4-7-8",
      category: "Emocional",
      duration: "5 min",
      color: "from-cyan-500 to-blue-600"
    },
    {
      id: "activity3",
      title: "Caminata consciente",
      category: "Físico",
      duration: "20 min",
      color: "from-green-500 to-teal-600"
    }
  ]

  // Datos para los consejos de bienestar
  const wellnessTips = [
    {
      id: "tip1",
      title: "Practica la gratitud",
      description: "Escribe tres cosas por las que estés agradecido cada día.",
      icon: Sun,
      color: "bg-amber-100 text-amber-600"
    },
    {
      id: "tip2",
      title: "Hidratación consciente",
      description: "Bebe agua regularmente a lo largo del día.",
      icon: Droplet,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: "tip3",
      title: "Contacto con la naturaleza",
      description: "Pasa al menos 20 minutos al día al aire libre.",
      icon: Leaf,
      color: "bg-green-100 text-green-600"
    }
  ]

  // Función para manejar la navegación
  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Calcular el promedio de estado de ánimo
  const averageMood = moodData.reduce((acc, day) => acc + day.mood, 0) / moodData.length

  return (
    <div className="space-y-6 pb-6">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold gradient-text">Bienestar</h1>
        <p className="text-gray-500">
          Cuida tu salud mental y emocional
        </p>
      </div>

      {/* Pregunta de estado de ánimo */}
      <Card3D className="p-6">
        <h2 className="text-lg font-semibold mb-4">¿Cómo te sientes hoy?</h2>
        <div className="flex justify-between items-center">
          <Button3D
            variant="ghost"
            className="flex flex-col items-center p-3"
          >
            <Frown className="h-8 w-8 text-red-500 mb-1" />
            <span className="text-xs">Mal</span>
          </Button3D>

          <Button3D
            variant="ghost"
            className="flex flex-col items-center p-3"
          >
            <Meh className="h-8 w-8 text-amber-500 mb-1" />
            <span className="text-xs">Regular</span>
          </Button3D>

          <Button3D
            variant="ghost"
            className="flex flex-col items-center p-3"
          >
            <Smile className="h-8 w-8 text-green-500 mb-1" />
            <span className="text-xs">Bien</span>
          </Button3D>
        </div>
      </Card3D>

      {/* Seguimiento del estado de ánimo */}
      <Card3D className="overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-90"></div>
          <div className="relative p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Tu estado de ánimo</h2>
              <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
                Esta semana
              </span>
            </div>

            <div className="flex justify-between items-end mb-2">
              {moodData.map((day, index) => {
                const Icon = day.icon
                return (
                  <div key={index} className="flex flex-col items-center">
                    <Icon className={`h-6 w-6 ${day.color} mb-1`} />
                    <span className="text-xs">{day.day}</span>
                  </div>
                )
              })}
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Promedio</span>
                <span className="text-sm font-medium">{averageMood.toFixed(1)}/5</span>
              </div>
              <Progress3D
                value={averageMood * 20}
                max={100}
                height="6px"
                fillColor="rgba(255, 255, 255, 0.9)"
                backgroundColor="rgba(255, 255, 255, 0.2)"
              />
            </div>

            <Button3D
              variant="glass"
              className="w-full mt-4 text-white border-white/30"
              onClick={() => handleNavigate("/wellness/mood")}
            >
              Ver historial completo
            </Button3D>
          </div>
        </div>
      </Card3D>

      {/* Filtros de categoría */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
          {categories.map((category) => (
            <Button3D
              key={category.id}
              variant={activeCategory === category.id ? "gradient" : "outline"}
              size="sm"
              className={activeCategory === category.id ? "text-white" : ""}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </Button3D>
          ))}
        </div>

        <Button3D variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button3D>
      </div>

      {/* Actividades de bienestar */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Actividades recomendadas</h2>
          <Button3D variant="ghost" size="sm" onClick={() => handleNavigate("/wellness/activities")}>
            Ver todas
          </Button3D>
        </div>

        <div className="space-y-4">
          {wellnessActivities.map((activity) => (
            <Card3D key={activity.id} className="overflow-hidden">
              <div className="relative h-32">
                <div className={`absolute inset-0 bg-gradient-to-r ${activity.color} opacity-90`}></div>
                <div className="relative p-4 text-white h-full flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                        {activity.category}
                      </span>
                      <h3 className="text-lg font-semibold mt-1">{activity.title}</h3>
                    </div>

                    <Button3D
                      variant="glass"
                      size="icon"
                      className="h-8 w-8 text-white border-white/30"
                      onClick={() => activity.action ? activity.action() : handleNavigate(`/wellness/activity/${activity.id}`)}
                    >
                      <Play className="h-4 w-4" />
                    </Button3D>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">{activity.duration}</span>
                  </div>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>

      {/* Consejos de bienestar */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Consejos para tu bienestar</h2>
          <Button3D variant="ghost" size="sm" onClick={() => handleNavigate("/wellness/tips")}>
            Ver todos
          </Button3D>
        </div>

        <div className="space-y-4">
          {wellnessTips.map((tip) => (
            <Card3D key={tip.id} className="p-4">
              <div className="flex items-start">
                <div className={`rounded-full ${tip.color} p-2 mr-3`}>
                  <tip.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">{tip.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{tip.description}</p>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>

      {/* Diario de gratitud */}
      <Card3D>
        <Card3DHeader>
          <Card3DTitle gradient={true}>Diario de gratitud</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <p className="text-sm text-gray-500 mb-4">
            Escribe tres cosas por las que estés agradecido hoy para mejorar tu bienestar emocional.
          </p>

          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Estoy agradecido por..."
                className="w-full p-3 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Sun className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Estoy agradecido por..."
                className="w-full p-3 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Sun className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Estoy agradecido por..."
                className="w-full p-3 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Sun className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <Button3D
            className="w-full mt-4"
            onClick={() => handleNavigate("/wellness/gratitude")}
          >
            Guardar entrada
          </Button3D>
        </Card3DContent>
      </Card3D>

      {/* Análisis de bienestar - Solo para admin */}
      {isAdmin && (
        <Card3D>
          <Card3DHeader>
            <div className="flex items-center">
              <Card3DTitle gradient={true}>Análisis de bienestar</Card3DTitle>
              <Badge variant="outline" className="ml-2">Admin</Badge>
            </div>
          </Card3DHeader>
          <Card3DContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Smile className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium">Estado de ánimo</span>
                </div>
                <div className="text-xl font-bold gradient-text">
                  4.2/5
                </div>
                <p className="text-xs text-gray-500">Promedio general</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Heart className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm font-medium">Bienestar</span>
                </div>
                <div className="text-xl font-bold gradient-text">
                  78%
                </div>
                <p className="text-xs text-gray-500">Índice general</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Cloud className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm font-medium">Estrés</span>
                </div>
                <div className="text-xl font-bold gradient-text">
                  32%
                </div>
                <p className="text-xs text-gray-500">Nivel promedio</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Sun className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-sm font-medium">Gratitud</span>
                </div>
                <div className="text-xl font-bold gradient-text">
                  85%
                </div>
                <p className="text-xs text-gray-500">Nivel de práctica</p>
              </div>
            </div>

            <Button3D
              variant="outline"
              className="w-full mt-4"
              onClick={() => handleNavigate("/admin/wellness-stats")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver análisis detallado
            </Button3D>
          </Card3DContent>
        </Card3D>
      )}

      {/* Estadísticas de respiración */}
      <BreathingStats className="mt-6" />

      {/* Botón flotante para registrar estado de ánimo */}
      <div className="fixed bottom-20 right-4">
        <Button3D
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => handleNavigate("/wellness/log-mood")}
        >
          <Plus className="h-6 w-6" />
        </Button3D>
      </div>

      {/* Diálogo para el método Wim Hof */}
      <Dialog open={showWimHof} onOpenChange={setShowWimHof}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogTitle className="sr-only">Método de Respiración Wim Hof</DialogTitle>
          <WimHofBreathing
            onComplete={() => setShowWimHof(false)}
            onCancel={() => setShowWimHof(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
