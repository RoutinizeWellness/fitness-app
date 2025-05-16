"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Dumbbell, Brain, Heart, Calendar, Clock, 
  TrendingUp, Award, Zap, Flame, ArrowRight,
  Play, Bookmark, Share2
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { StatCard3D } from "@/components/ui/stat-card-3d"
import { Avatar3D, Avatar3DImage, Avatar3DFallback } from "@/components/ui/avatar-3d"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { User } from "@supabase/supabase-js"
import type { Workout, Mood, NutritionEntry } from "@/lib/supabase-client"

interface HolisticHomeProps {
  profile: User | null
  workoutLog?: Workout[]
  moodLog?: Mood[]
  nutritionLog?: NutritionEntry[]
  isLoading?: boolean
  onNavigate?: (path: string) => void
}

export function HolisticHome({
  profile,
  workoutLog = [],
  moodLog = [],
  nutritionLog = [],
  isLoading = false,
  onNavigate
}: HolisticHomeProps) {
  const [greeting, setGreeting] = useState("Buenos días")
  const [todayProgress, setTodayProgress] = useState(0)
  const [weeklyProgress, setWeeklyProgress] = useState(0)
  const [todayCalories, setTodayCalories] = useState(0)
  const [mindfulMinutes, setMindfulMinutes] = useState(0)
  
  // Establecer saludo según la hora del día
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      setGreeting("Buenos días")
    } else if (hour >= 12 && hour < 19) {
      setGreeting("Buenas tardes")
    } else {
      setGreeting("Buenas noches")
    }
  }, [])
  
  // Calcular progreso diario (simulado)
  useEffect(() => {
    // Simulamos un progreso diario basado en la hora actual
    const hour = new Date().getHours()
    const progress = Math.min(Math.round((hour / 24) * 100), 100)
    setTodayProgress(progress)
    
    // Simulamos un progreso semanal
    const day = new Date().getDay()
    const weekProgress = Math.min(Math.round(((day + 1) / 7) * 100), 100)
    setWeeklyProgress(weekProgress)
    
    // Simulamos calorías consumidas
    setTodayCalories(nutritionLog.length > 0 ? 1200 + Math.floor(Math.random() * 800) : 0)
    
    // Simulamos minutos de mindfulness
    setMindfulMinutes(moodLog.length > 0 ? 10 + Math.floor(Math.random() * 20) : 0)
  }, [nutritionLog.length, moodLog.length])
  
  // Datos para las tarjetas de programas recomendados
  const recommendedPrograms = [
    {
      id: "yoga",
      title: "Yoga para principiantes",
      category: "Mente y Cuerpo",
      duration: "20 min",
      image: "/images/programs/yoga.jpg",
      color: "from-blue-400 to-purple-500"
    },
    {
      id: "meditation",
      title: "Meditación guiada",
      category: "Mindfulness",
      duration: "10 min",
      image: "/images/programs/meditation.jpg",
      color: "from-purple-400 to-pink-500"
    },
    {
      id: "strength",
      title: "Entrenamiento de fuerza",
      category: "Fitness",
      duration: "30 min",
      image: "/images/programs/strength.jpg",
      color: "from-orange-400 to-red-500"
    }
  ]
  
  // Datos para las tarjetas de entrenadores
  const coaches = [
    {
      id: "coach1",
      name: "Ana García",
      specialty: "Yoga y Meditación",
      image: "/images/coaches/coach1.jpg"
    },
    {
      id: "coach2",
      name: "Carlos Ruiz",
      specialty: "Entrenamiento funcional",
      image: "/images/coaches/coach2.jpg"
    },
    {
      id: "coach3",
      name: "Laura Martín",
      specialty: "Nutrición holística",
      image: "/images/coaches/coach3.jpg"
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
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6 pb-6">
      {/* Saludo y fecha */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold gradient-text">
          {greeting}, {profile?.user_metadata?.full_name?.split(" ")[0] || "Amigo"}
        </h1>
        <p className="text-gray-500">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
        </p>
      </div>
      
      {/* Tarjeta de progreso diario */}
      <Card3D className="overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-90"></div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                <h3 className="font-semibold">Tu día holístico</h3>
              </div>
              <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
                {todayProgress}%
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="bg-white/20 rounded-full p-2 w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <p className="text-xs">Entreno</p>
                <p className="text-sm font-semibold">1/2</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/20 rounded-full p-2 w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                  <Brain className="h-5 w-5" />
                </div>
                <p className="text-xs">Mente</p>
                <p className="text-sm font-semibold">{mindfulMinutes} min</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/20 rounded-full p-2 w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                  <Heart className="h-5 w-5" />
                </div>
                <p className="text-xs">Salud</p>
                <p className="text-sm font-semibold">{todayCalories} kcal</p>
              </div>
            </div>
            
            <Progress3D 
              value={todayProgress} 
              max={100} 
              height="6px"
              fillColor="rgba(255, 255, 255, 0.9)"
              backgroundColor="rgba(255, 255, 255, 0.2)"
            />
            
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-white/80">
                Completa tus actividades para un bienestar integral
              </p>
              <Button3D
                variant="glass"
                size="sm"
                className="text-white border-white/30"
                onClick={() => handleNavigate("/progress")}
              >
                Detalles
              </Button3D>
            </div>
          </div>
        </div>
      </Card3D>
      
      {/* Programas recomendados */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Programas para ti</h2>
          <Button3D variant="ghost" size="sm" onClick={() => handleNavigate("/programs")}>
            Ver todos
          </Button3D>
        </div>
        
        <div className="space-y-4">
          {recommendedPrograms.map((program) => (
            <Card3D key={program.id} className="overflow-hidden">
              <div className="relative h-40">
                <div className={`absolute inset-0 bg-gradient-to-r ${program.color} opacity-90`}></div>
                <div className="relative p-4 text-white h-full flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                      {program.category}
                    </span>
                    <h3 className="text-lg font-semibold mt-2">{program.title}</h3>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">{program.duration}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button3D
                        variant="glass"
                        size="icon"
                        className="h-8 w-8 text-white border-white/30"
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button3D>
                      <Button3D
                        variant="glass"
                        size="icon"
                        className="h-8 w-8 text-white border-white/30"
                      >
                        <Play className="h-4 w-4" />
                      </Button3D>
                    </div>
                  </div>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
      
      {/* Entrenadores */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Entrenadores destacados</h2>
          <Button3D variant="ghost" size="sm" onClick={() => handleNavigate("/coaches")}>
            Ver todos
          </Button3D>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-2 -mx-4 px-4">
          {coaches.map((coach) => (
            <Card3D key={coach.id} className="min-w-[160px] flex-shrink-0">
              <Card3DContent className="p-4 flex flex-col items-center text-center">
                <Avatar3D className="h-16 w-16 mb-3">
                  <Avatar3DImage src={coach.image} />
                  <Avatar3DFallback>{coach.name.charAt(0)}</Avatar3DFallback>
                </Avatar3D>
                <h3 className="font-medium text-sm">{coach.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{coach.specialty}</p>
                <Button3D
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full text-xs"
                >
                  Ver perfil
                </Button3D>
              </Card3DContent>
            </Card3D>
          ))}
        </div>
      </div>
      
      {/* Estadísticas semanales */}
      <Card3D>
        <Card3DHeader>
          <Card3DTitle gradient={true}>Tu semana en números</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold gradient-text">
                <AnimatedCounter value={workoutLog.length || 0} />
              </div>
              <p className="text-xs text-gray-500">Entrenamientos</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold gradient-text">
                <AnimatedCounter value={mindfulMinutes} formatter={(value) => `${value} min`} />
              </div>
              <p className="text-xs text-gray-500">Mindfulness</p>
            </div>
          </div>
          
          <Progress3D 
            value={weeklyProgress} 
            max={100} 
            className="mb-2"
          />
          
          <p className="text-xs text-gray-500 text-center">
            {weeklyProgress}% de tu objetivo semanal completado
          </p>
        </Card3DContent>
      </Card3D>
      
      {/* Consejos de bienestar */}
      <Card3D>
        <Card3DHeader>
          <Card3DTitle gradient={true}>Consejo del día</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="flex items-start space-x-3">
            <div className="rounded-full bg-blue-100 text-blue-700 p-2 mt-1">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm">
                "La meditación no se trata de dejar de pensar, sino de observar tus pensamientos sin juzgarlos."
              </p>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-500">Dr. María López, Psicóloga</span>
                <div className="flex space-x-2">
                  <Button3D variant="ghost" size="icon" className="h-7 w-7">
                    <Bookmark className="h-3.5 w-3.5" />
                  </Button3D>
                  <Button3D variant="ghost" size="icon" className="h-7 w-7">
                    <Share2 className="h-3.5 w-3.5" />
                  </Button3D>
                </div>
              </div>
            </div>
          </div>
        </Card3DContent>
      </Card3D>
    </div>
  )
}
