"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Moon, Clock, Calendar, Filter,
  ChevronRight, Play, Bookmark, Share2,
  BarChart3, Sun, BedDouble, Music,
  Waves, CloudRain, Wind, Plus
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Avatar3D, Avatar3DImage, Avatar3DFallback } from "@/components/ui/avatar-3d"
import { User } from "@supabase/supabase-js"
import { Badge } from "@/components/ui/badge"

interface SleepModuleProps {
  profile: User | null
  isAdmin: boolean
  isLoading?: boolean
  onNavigate?: (path: string) => void
}

export function SleepModule({
  profile,
  isAdmin,
  isLoading = false,
  onNavigate
}: SleepModuleProps) {
  const [activeCategory, setActiveCategory] = useState("all")

  // Categorías de sueño
  const categories = [
    { id: "all", name: "Todos" },
    { id: "sounds", name: "Sonidos" },
    { id: "meditation", name: "Meditación" },
    { id: "stories", name: "Historias" },
    { id: "music", name: "Música" }
  ]

  // Datos para el registro de sueño
  const sleepData = [
    { day: "Lun", hours: 7.5, quality: 85 },
    { day: "Mar", hours: 6.2, quality: 65 },
    { day: "Mié", hours: 8.0, quality: 90 },
    { day: "Jue", hours: 7.8, quality: 88 },
    { day: "Vie", hours: 6.5, quality: 70 },
    { day: "Sáb", hours: 8.5, quality: 95 },
    { day: "Dom", hours: 7.2, quality: 80 }
  ]

  // Datos para los sonidos para dormir
  const sleepSounds = [
    {
      id: "sound1",
      title: "Lluvia suave",
      duration: "45 min",
      icon: CloudRain,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: "sound2",
      title: "Ruido blanco",
      duration: "60 min",
      icon: Waves,
      color: "bg-gray-100 text-gray-600"
    },
    {
      id: "sound3",
      title: "Bosque nocturno",
      duration: "30 min",
      icon: Wind,
      color: "bg-green-100 text-green-600"
    },
    {
      id: "sound4",
      title: "Melodía relajante",
      duration: "40 min",
      icon: Music,
      color: "bg-purple-100 text-purple-600"
    }
  ]

  // Datos para las rutinas de sueño
  const sleepRoutines = [
    {
      id: "routine1",
      title: "Rutina para dormir profundamente",
      duration: "15 min",
      steps: 4,
      color: "from-indigo-500 to-purple-600"
    },
    {
      id: "routine2",
      title: "Meditación para conciliar el sueño",
      duration: "10 min",
      steps: 3,
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: "routine3",
      title: "Respiración 4-7-8 para dormir",
      duration: "5 min",
      steps: 2,
      color: "from-purple-500 to-pink-600"
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

  // Calcular el promedio de horas de sueño
  const averageSleepHours = sleepData.reduce((acc, day) => acc + day.hours, 0) / sleepData.length

  // Calcular el promedio de calidad de sueño
  const averageSleepQuality = sleepData.reduce((acc, day) => acc + day.quality, 0) / sleepData.length

  return (
    <div className="space-y-6 pb-6">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Sueño</h1>
        <div className="flex items-center">
          <div className="h-1 w-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mr-3"></div>
          <p className="text-gray-500">
            Mejora tu descanso y calidad de sueño
          </p>
        </div>
      </div>

      {/* Resumen de sueño */}
      <Card3D className="overflow-hidden border-0 shadow-lg">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500 opacity-95"></div>
          <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] opacity-10"></div>
          <div className="relative p-6 text-white">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">Tu sueño esta semana</h2>
                <p className="text-white/70 text-sm mt-1">Análisis de tus patrones de descanso</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20">
                <span className="text-lg font-bold">{averageSleepHours.toFixed(1)}</span>
                <span className="text-sm font-medium ml-1">h promedio</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-4 px-2">
              {sleepData.map((day, index) => (
                <div key={index} className="flex flex-col items-center group relative">
                  <div className="absolute -top-10 transform -translate-x-1/2 left-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {day.hours}h - Calidad: {day.quality}%
                  </div>
                  <div
                    className="w-8 bg-white/10 backdrop-blur-sm rounded-t-lg mb-1 transition-all group-hover:bg-white/20"
                    style={{ height: `${day.hours * 7}px` }}
                  >
                    <div
                      className="w-full bg-gradient-to-t from-white/60 to-white/90 rounded-t-lg transition-all"
                      style={{
                        height: `${(day.quality / 100) * 100}%`,
                        marginTop: `${(1 - day.quality / 100) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium">{day.day}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6 bg-white/10 backdrop-blur-sm p-3 rounded-xl">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-white/90 rounded-full mr-2"></div>
                <span className="text-sm text-white/90">Calidad <span className="font-bold">{averageSleepQuality.toFixed(0)}%</span></span>
              </div>
              <div className="flex items-center mx-2">
                <div className="w-3 h-3 bg-white/20 rounded-full mr-2"></div>
                <span className="text-sm text-white/90">Duración</span>
              </div>
              <Button3D
                variant="glass"
                size="sm"
                className="text-white border-white/30 backdrop-blur-md"
                onClick={() => handleNavigate("/sleep/stats")}
              >
                Ver detalles
              </Button3D>
            </div>
          </div>
        </div>
      </Card3D>

      {/* Filtros de categoría */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((category) => (
            <Button3D
              key={category.id}
              variant={activeCategory === category.id ? "gradient" : "outline"}
              size="sm"
              className={`rounded-full px-4 transition-all ${
                activeCategory === category.id
                  ? "text-white shadow-md"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </Button3D>
          ))}
        </div>

        <Button3D
          variant="outline"
          size="icon"
          className="rounded-full h-9 w-9 border border-gray-200 shadow-sm"
        >
          <Filter className="h-4 w-4" />
        </Button3D>
      </div>

      {/* Sonidos para dormir */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-bold">Sonidos para dormir</h2>
            <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-1"></div>
          </div>
          <Button3D
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-indigo-600 font-medium"
            onClick={() => handleNavigate("/sleep/sounds")}
          >
            Ver todos
            <ChevronRight className="h-4 w-4" />
          </Button3D>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {sleepSounds.map((sound) => (
            <Card3D
              key={sound.id}
              className="p-5 text-center border border-gray-100 hover:border-indigo-100 transition-all hover:shadow-md overflow-hidden group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className={`rounded-full ${sound.color} p-3 w-14 h-14 mx-auto mb-3 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <sound.icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-sm">{sound.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{sound.duration}</p>
                <Button3D
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 text-xs rounded-full border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                  onClick={() => handleNavigate(`/sleep/sounds/${sound.id}`)}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Reproducir
                </Button3D>
              </div>
            </Card3D>
          ))}
        </div>
      </div>

      {/* Rutinas para dormir */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-bold">Rutinas para dormir</h2>
            <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-1"></div>
          </div>
          <Button3D
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-purple-600 font-medium"
            onClick={() => handleNavigate("/sleep/routines")}
          >
            Ver todas
            <ChevronRight className="h-4 w-4" />
          </Button3D>
        </div>

        <div className="space-y-5">
          {sleepRoutines.map((routine) => (
            <Card3D
              key={routine.id}
              className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all"
            >
              <div className="relative h-36">
                <div className={`absolute inset-0 bg-gradient-to-br ${routine.color} opacity-95`}></div>
                <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="relative p-5 text-white h-full flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-xs font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-flex items-center">
                        <Moon className="h-3 w-3 mr-1" />
                        Rutina
                      </span>
                      <h3 className="text-xl font-bold mt-2 group-hover:translate-x-1 transition-transform">{routine.title}</h3>
                    </div>

                    <Button3D
                      variant="glass"
                      size="icon"
                      className="h-10 w-10 text-white border-white/30 backdrop-blur-sm group-hover:scale-110 transition-transform"
                      onClick={() => handleNavigate(`/sleep/routines/${routine.id}`)}
                    >
                      <Play className="h-5 w-5" />
                    </Button3D>
                  </div>

                  <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">{routine.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <BedDouble className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">{routine.steps} pasos</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>

      {/* Consejos para dormir mejor */}
      <Card3D className="border border-gray-100 shadow-md overflow-hidden">
        <Card3DHeader className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center">
            <div className="mr-3 bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-2 rounded-lg">
              <Moon className="h-5 w-5" />
            </div>
            <Card3DTitle gradient={true} className="text-xl">Consejos para dormir mejor</Card3DTitle>
          </div>
        </Card3DHeader>
        <Card3DContent className="p-5">
          <div className="space-y-4">
            <div className="flex items-start space-x-4 bg-indigo-50 p-3 rounded-xl hover:bg-indigo-100 transition-colors">
              <div className="rounded-full bg-indigo-100 text-indigo-600 p-2 mt-0.5 shadow-sm">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-900">Mantén un horario regular</p>
                <p className="text-xs text-indigo-700 mt-1">Acuéstate y levántate a la misma hora todos los días, incluso los fines de semana.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-blue-50 p-3 rounded-xl hover:bg-blue-100 transition-colors">
              <div className="rounded-full bg-blue-100 text-blue-600 p-2 mt-0.5 shadow-sm">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Exposición a la luz natural</p>
                <p className="text-xs text-blue-700 mt-1">Busca exponerte a la luz solar durante el día para regular tu ritmo circadiano.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-purple-50 p-3 rounded-xl hover:bg-purple-100 transition-colors">
              <div className="rounded-full bg-purple-100 text-purple-600 p-2 mt-0.5 shadow-sm">
                <BedDouble className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-900">Ambiente de sueño óptimo</p>
                <p className="text-xs text-purple-700 mt-1">Mantén tu habitación oscura, silenciosa y a una temperatura agradable.</p>
              </div>
            </div>
          </div>

          <Button3D
            variant="gradient"
            className="w-full mt-5 rounded-lg shadow-sm"
            onClick={() => handleNavigate("/sleep/tips")}
          >
            <span className="font-medium">Ver más consejos</span>
          </Button3D>
        </Card3DContent>
      </Card3D>

      {/* Análisis de sueño avanzado - Solo para admin */}
      {isAdmin && (
        <Card3D>
          <Card3DHeader>
            <div className="flex items-center">
              <Card3DTitle gradient={true}>Análisis de sueño avanzado</Card3DTitle>
              <Badge variant="outline" className="ml-2">Admin</Badge>
            </div>
          </Card3DHeader>
          <Card3DContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Moon className="h-4 w-4 text-indigo-500 mr-1" />
                  <span className="text-sm font-medium">Sueño profundo</span>
                </div>
                <div className="text-xl font-bold gradient-text">
                  22%
                </div>
                <p className="text-xs text-gray-500">Del tiempo total</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Waves className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm font-medium">REM</span>
                </div>
                <div className="text-xl font-bold gradient-text">
                  18%
                </div>
                <p className="text-xs text-gray-500">Del tiempo total</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Clock className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium">Latencia</span>
                </div>
                <div className="text-xl font-bold gradient-text">
                  12
                </div>
                <p className="text-xs text-gray-500">Minutos</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Sun className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-sm font-medium">Despertares</span>
                </div>
                <div className="text-xl font-bold gradient-text">
                  2.3
                </div>
                <p className="text-xs text-gray-500">Promedio</p>
              </div>
            </div>

            <Button3D
              variant="outline"
              className="w-full mt-4"
              onClick={() => handleNavigate("/admin/sleep-stats")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver análisis detallado
            </Button3D>
          </Card3DContent>
        </Card3D>
      )}

      {/* Botón flotante para registrar sueño */}
      <div className="fixed bottom-20 right-4">
        <Button3D
          size="icon"
          className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-br from-indigo-600 to-purple-600 border-none hover:shadow-indigo-200 hover:scale-105 transition-all"
          onClick={() => handleNavigate("/sleep/log")}
        >
          <Plus className="h-7 w-7 text-white" />
        </Button3D>
      </div>
    </div>
  )
}
