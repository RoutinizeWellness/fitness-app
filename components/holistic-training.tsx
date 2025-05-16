"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Dumbbell, Clock, Calendar, Filter, 
  ChevronRight, Play, Bookmark, Share2,
  BarChart3, Heart, Flame, Zap
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Avatar3D, Avatar3DImage, Avatar3DFallback } from "@/components/ui/avatar-3d"
import { User } from "@supabase/supabase-js"
import type { Workout } from "@/lib/supabase-client"

interface HolisticTrainingProps {
  profile: User | null
  workoutLog?: Workout[]
  isLoading?: boolean
  onNavigate?: (path: string) => void
}

export function HolisticTraining({
  profile,
  workoutLog = [],
  isLoading = false,
  onNavigate
}: HolisticTrainingProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  
  // Categorías de entrenamiento
  const categories = [
    { id: "all", name: "Todos" },
    { id: "strength", name: "Fuerza" },
    { id: "cardio", name: "Cardio" },
    { id: "yoga", name: "Yoga" },
    { id: "pilates", name: "Pilates" },
    { id: "hiit", name: "HIIT" }
  ]
  
  // Datos para los entrenamientos recomendados
  const recommendedWorkouts = [
    {
      id: "workout1",
      title: "Entrenamiento de fuerza total",
      category: "Fuerza",
      duration: "45 min",
      level: "Intermedio",
      image: "/images/workouts/strength.jpg",
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: "workout2",
      title: "Yoga para flexibilidad",
      category: "Yoga",
      duration: "30 min",
      level: "Principiante",
      image: "/images/workouts/yoga.jpg",
      color: "from-purple-500 to-pink-600"
    },
    {
      id: "workout3",
      title: "HIIT quema grasa",
      category: "HIIT",
      duration: "20 min",
      level: "Avanzado",
      image: "/images/workouts/hiit.jpg",
      color: "from-red-500 to-orange-600"
    }
  ]
  
  // Datos para los planes de entrenamiento
  const trainingPlans = [
    {
      id: "plan1",
      title: "Plan de 30 días para tonificar",
      workouts: 24,
      progress: 25,
      image: "/images/plans/tone.jpg"
    },
    {
      id: "plan2",
      title: "Yoga para principiantes",
      workouts: 15,
      progress: 40,
      image: "/images/plans/yoga.jpg"
    },
    {
      id: "plan3",
      title: "Entrenamiento funcional",
      workouts: 20,
      progress: 10,
      image: "/images/plans/functional.jpg"
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
  
  return (
    <div className="space-y-6 pb-6">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold gradient-text">Entrenamiento</h1>
        <p className="text-gray-500">
          Descubre entrenamientos personalizados para tu bienestar integral
        </p>
      </div>
      
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
      
      {/* Entrenamiento destacado */}
      <Card3D className="overflow-hidden">
        <div className="relative h-64">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-90"></div>
          <div className="relative p-6 text-white h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                    Destacado
                  </span>
                  <h2 className="text-xl font-bold mt-2">Entrenamiento holístico</h2>
                  <p className="text-sm text-white/80 mt-1">
                    Combina fuerza, flexibilidad y mindfulness
                  </p>
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
                    <Share2 className="h-4 w-4" />
                  </Button3D>
                </div>
              </div>
            </div>
            
            <div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="bg-white/20 rounded-full p-2 w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                  <p className="text-xs">Duración</p>
                  <p className="text-sm font-semibold">45 min</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-white/20 rounded-full p-2 w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                    <Flame className="h-5 w-5" />
                  </div>
                  <p className="text-xs">Calorías</p>
                  <p className="text-sm font-semibold">320 kcal</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-white/20 rounded-full p-2 w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                    <Zap className="h-5 w-5" />
                  </div>
                  <p className="text-xs">Nivel</p>
                  <p className="text-sm font-semibold">Intermedio</p>
                </div>
              </div>
              
              <Button3D
                variant="glass"
                className="w-full text-white border-white/30"
                onClick={() => handleNavigate("/workouts/holistic")}
              >
                <Play className="h-4 w-4 mr-2" />
                Comenzar entrenamiento
              </Button3D>
            </div>
          </div>
        </div>
      </Card3D>
      
      {/* Entrenamientos recomendados */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recomendados para ti</h2>
          <Button3D variant="ghost" size="sm" onClick={() => handleNavigate("/workouts")}>
            Ver todos
          </Button3D>
        </div>
        
        <div className="space-y-4">
          {recommendedWorkouts.map((workout) => (
            <Card3D key={workout.id} className="overflow-hidden">
              <div className="relative h-32">
                <div className={`absolute inset-0 bg-gradient-to-r ${workout.color} opacity-90`}></div>
                <div className="relative p-4 text-white h-full flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                        {workout.category}
                      </span>
                      <h3 className="text-lg font-semibold mt-1">{workout.title}</h3>
                    </div>
                    
                    <Button3D
                      variant="glass"
                      size="icon"
                      className="h-8 w-8 text-white border-white/30"
                    >
                      <Play className="h-4 w-4" />
                    </Button3D>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">{workout.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-1" />
                      <span className="text-sm">{workout.level}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
      
      {/* Planes de entrenamiento */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tus planes activos</h2>
          <Button3D variant="ghost" size="sm" onClick={() => handleNavigate("/plans")}>
            Ver todos
          </Button3D>
        </div>
        
        <div className="space-y-4">
          {trainingPlans.map((plan) => (
            <Card3D key={plan.id} className="p-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{plan.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.workouts} entrenamientos</p>
                  
                  <div className="mt-3">
                    <Progress3D 
                      value={plan.progress} 
                      max={100} 
                      className="mb-1"
                      height="6px"
                    />
                    <p className="text-xs text-gray-500">{plan.progress}% completado</p>
                  </div>
                </div>
                
                <Button3D
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 self-start"
                  onClick={() => handleNavigate(`/plans/${plan.id}`)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button3D>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
      
      {/* Estadísticas de entrenamiento */}
      <Card3D>
        <Card3DHeader>
          <Card3DTitle gradient={true}>Tus estadísticas</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <Calendar className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm font-medium">Este mes</span>
              </div>
              <div className="text-xl font-bold gradient-text">
                {workoutLog.length || 0}
              </div>
              <p className="text-xs text-gray-500">Entrenamientos</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <Flame className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <div className="text-xl font-bold gradient-text">
                4,320
              </div>
              <p className="text-xs text-gray-500">Calorías quemadas</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <Clock className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium">Tiempo</span>
              </div>
              <div className="text-xl font-bold gradient-text">
                6.5h
              </div>
              <p className="text-xs text-gray-500">Entrenamiento</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <Heart className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm font-medium">Promedio</span>
              </div>
              <div className="text-xl font-bold gradient-text">
                142
              </div>
              <p className="text-xs text-gray-500">Ritmo cardíaco</p>
            </div>
          </div>
          
          <Button3D
            variant="outline"
            className="w-full mt-4"
            onClick={() => handleNavigate("/stats")}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Ver análisis detallado
          </Button3D>
        </Card3DContent>
      </Card3D>
    </div>
  )
}
