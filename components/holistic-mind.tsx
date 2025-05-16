"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Brain, Clock, Calendar, Filter, 
  ChevronRight, Play, Bookmark, Share2,
  Moon, Sun, Cloud, Sparkles, Music
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Avatar3D, Avatar3DImage, Avatar3DFallback } from "@/components/ui/avatar-3d"
import { User } from "@supabase/supabase-js"
import type { Mood } from "@/lib/supabase-client"

interface HolisticMindProps {
  profile: User | null
  moodLog?: Mood[]
  isLoading?: boolean
  onNavigate?: (path: string) => void
}

export function HolisticMind({
  profile,
  moodLog = [],
  isLoading = false,
  onNavigate
}: HolisticMindProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  
  // Categorías de mindfulness
  const categories = [
    { id: "all", name: "Todos" },
    { id: "meditation", name: "Meditación" },
    { id: "breathing", name: "Respiración" },
    { id: "sleep", name: "Sueño" },
    { id: "focus", name: "Concentración" }
  ]
  
  // Datos para las sesiones recomendadas
  const recommendedSessions = [
    {
      id: "session1",
      title: "Meditación guiada para principiantes",
      category: "Meditación",
      duration: "10 min",
      instructor: "Ana García",
      color: "from-indigo-500 to-purple-600"
    },
    {
      id: "session2",
      title: "Respiración para reducir el estrés",
      category: "Respiración",
      duration: "5 min",
      instructor: "Carlos Ruiz",
      color: "from-blue-500 to-cyan-600"
    },
    {
      id: "session3",
      title: "Sonidos para dormir profundamente",
      category: "Sueño",
      duration: "45 min",
      instructor: "Laura Martín",
      color: "from-purple-500 to-indigo-600"
    }
  ]
  
  // Datos para los programas de mindfulness
  const mindPrograms = [
    {
      id: "program1",
      title: "7 días de meditación consciente",
      sessions: 7,
      progress: 30,
      image: "/images/mind/meditation.jpg"
    },
    {
      id: "program2",
      title: "Técnicas de respiración avanzadas",
      sessions: 5,
      progress: 20,
      image: "/images/mind/breathing.jpg"
    },
    {
      id: "program3",
      title: "Mejora tu sueño en 14 días",
      sessions: 14,
      progress: 15,
      image: "/images/mind/sleep.jpg"
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
        <h1 className="text-2xl font-bold gradient-text">Mindfulness</h1>
        <p className="text-gray-500">
          Cuida tu mente con meditación, respiración y más
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
      
      {/* Sesión destacada */}
      <Card3D className="overflow-hidden">
        <div className="relative h-64">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-90"></div>
          <div className="relative p-6 text-white h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                    Destacado
                  </span>
                  <h2 className="text-xl font-bold mt-2">Meditación para el bienestar</h2>
                  <p className="text-sm text-white/80 mt-1">
                    Reduce el estrés y mejora tu concentración
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
                  <p className="text-sm font-semibold">15 min</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-white/20 rounded-full p-2 w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                    <Brain className="h-5 w-5" />
                  </div>
                  <p className="text-xs">Tipo</p>
                  <p className="text-sm font-semibold">Guiada</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-white/20 rounded-full p-2 w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-xs">Nivel</p>
                  <p className="text-sm font-semibold">Todos</p>
                </div>
              </div>
              
              <Button3D
                variant="glass"
                className="w-full text-white border-white/30"
                onClick={() => handleNavigate("/mind/meditation")}
              >
                <Play className="h-4 w-4 mr-2" />
                Comenzar meditación
              </Button3D>
            </div>
          </div>
        </div>
      </Card3D>
      
      {/* Sesiones recomendadas */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recomendados para ti</h2>
          <Button3D variant="ghost" size="sm" onClick={() => handleNavigate("/mind/sessions")}>
            Ver todos
          </Button3D>
        </div>
        
        <div className="space-y-4">
          {recommendedSessions.map((session) => (
            <Card3D key={session.id} className="overflow-hidden">
              <div className="relative h-32">
                <div className={`absolute inset-0 bg-gradient-to-r ${session.color} opacity-90`}></div>
                <div className="relative p-4 text-white h-full flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                        {session.category}
                      </span>
                      <h3 className="text-lg font-semibold mt-1">{session.title}</h3>
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
                      <span className="text-sm">{session.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Avatar3D className="h-5 w-5 mr-1">
                        <Avatar3DFallback>{session.instructor.charAt(0)}</Avatar3DFallback>
                      </Avatar3D>
                      <span className="text-sm">{session.instructor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
      
      {/* Programas de mindfulness */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tus programas activos</h2>
          <Button3D variant="ghost" size="sm" onClick={() => handleNavigate("/mind/programs")}>
            Ver todos
          </Button3D>
        </div>
        
        <div className="space-y-4">
          {mindPrograms.map((program) => (
            <Card3D key={program.id} className="p-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{program.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{program.sessions} sesiones</p>
                  
                  <div className="mt-3">
                    <Progress3D 
                      value={program.progress} 
                      max={100} 
                      className="mb-1"
                      height="6px"
                    />
                    <p className="text-xs text-gray-500">{program.progress}% completado</p>
                  </div>
                </div>
                
                <Button3D
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 self-start"
                  onClick={() => handleNavigate(`/mind/programs/${program.id}`)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button3D>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
      
      {/* Sonidos para dormir */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Sonidos para dormir</h2>
          <Button3D variant="ghost" size="sm" onClick={() => handleNavigate("/mind/sounds")}>
            Ver todos
          </Button3D>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card3D className="p-4 text-center">
            <div className="rounded-full bg-indigo-100 text-indigo-600 p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <Moon className="h-6 w-6" />
            </div>
            <h3 className="font-medium text-sm">Lluvia nocturna</h3>
            <p className="text-xs text-gray-500 mt-1">45 min</p>
            <Button3D
              variant="outline"
              size="sm"
              className="w-full mt-3 text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Reproducir
            </Button3D>
          </Card3D>
          
          <Card3D className="p-4 text-center">
            <div className="rounded-full bg-blue-100 text-blue-600 p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <Cloud className="h-6 w-6" />
            </div>
            <h3 className="font-medium text-sm">Ruido blanco</h3>
            <p className="text-xs text-gray-500 mt-1">60 min</p>
            <Button3D
              variant="outline"
              size="sm"
              className="w-full mt-3 text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Reproducir
            </Button3D>
          </Card3D>
          
          <Card3D className="p-4 text-center">
            <div className="rounded-full bg-green-100 text-green-600 p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <Music className="h-6 w-6" />
            </div>
            <h3 className="font-medium text-sm">Melodía relajante</h3>
            <p className="text-xs text-gray-500 mt-1">30 min</p>
            <Button3D
              variant="outline"
              size="sm"
              className="w-full mt-3 text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Reproducir
            </Button3D>
          </Card3D>
          
          <Card3D className="p-4 text-center">
            <div className="rounded-full bg-yellow-100 text-yellow-600 p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <Sun className="h-6 w-6" />
            </div>
            <h3 className="font-medium text-sm">Amanecer</h3>
            <p className="text-xs text-gray-500 mt-1">20 min</p>
            <Button3D
              variant="outline"
              size="sm"
              className="w-full mt-3 text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Reproducir
            </Button3D>
          </Card3D>
        </div>
      </div>
      
      {/* Estadísticas de mindfulness */}
      <Card3D>
        <Card3DHeader>
          <Card3DTitle gradient={true}>Tu práctica</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <Calendar className="h-4 w-4 text-indigo-500 mr-1" />
                <span className="text-sm font-medium">Este mes</span>
              </div>
              <div className="text-xl font-bold gradient-text">
                {moodLog.length || 0}
              </div>
              <p className="text-xs text-gray-500">Sesiones</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <Clock className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <div className="text-xl font-bold gradient-text">
                120
              </div>
              <p className="text-xs text-gray-500">Minutos</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <Brain className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-sm font-medium">Racha</span>
              </div>
              <div className="text-xl font-bold gradient-text">
                5
              </div>
              <p className="text-xs text-gray-500">Días</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <Sparkles className="h-4 w-4 text-amber-500 mr-1" />
                <span className="text-sm font-medium">Favorita</span>
              </div>
              <div className="text-xl font-bold gradient-text">
                Guiada
              </div>
              <p className="text-xs text-gray-500">Meditación</p>
            </div>
          </div>
        </Card3DContent>
      </Card3D>
    </div>
  )
}
