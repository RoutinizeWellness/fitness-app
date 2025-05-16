"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { 
  ArrowLeft, 
  Dumbbell, 
  Calendar, 
  Filter, 
  ChevronRight,
  Search,
  Clock,
  Zap,
  Flame,
  Brain,
  RefreshCw
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"

// Tipos para plantillas de entrenamiento
interface TrainingTemplate {
  id: string
  name: string
  description: string
  level: "beginner" | "intermediate" | "advanced" | "all"
  goal: "strength" | "hypertrophy" | "endurance" | "power" | "weight_loss" | "general"
  duration: number // En semanas
  frequency: number // Días por semana
  category: "scientific" | "bodybuilding" | "athletic" | "functional"
  features: string[]
  imageUrl?: string
}

export default function TrainingTemplatesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [templates, setTemplates] = useState<TrainingTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<TrainingTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [goalFilter, setGoalFilter] = useState<string>("all")
  
  // Cargar plantillas (simuladas para este ejemplo)
  useEffect(() => {
    // En una implementación real, estos datos vendrían de Supabase
    const mockTemplates: TrainingTemplate[] = [
      {
        id: "ppl",
        name: "Push Pull Legs (PPL)",
        description: "Rutina de 6 días dividida en empuje, tirón y piernas. Ideal para maximizar la hipertrofia con alta frecuencia de entrenamiento.",
        level: "intermediate",
        goal: "hypertrophy",
        duration: 12,
        frequency: 6,
        category: "scientific",
        features: [
          "Alta frecuencia de entrenamiento",
          "Enfoque en grupos musculares específicos",
          "Incluye periodización ondulante",
          "Semanas de descarga programadas"
        ]
      },
      {
        id: "upper-lower",
        name: "Upper/Lower Split",
        description: "Rutina de 4 días dividida en tren superior e inferior. Equilibrio perfecto entre frecuencia, volumen y recuperación.",
        level: "all",
        goal: "strength",
        duration: 8,
        frequency: 4,
        category: "scientific",
        features: [
          "Buena frecuencia de entrenamiento",
          "Equilibrio entre volumen y recuperación",
          "Ideal para fuerza y tamaño",
          "Adaptable a todos los niveles"
        ]
      },
      {
        id: "full-body",
        name: "Full Body 3x",
        description: "Rutina de cuerpo completo 3 veces por semana. Máxima frecuencia de estímulo para cada grupo muscular.",
        level: "beginner",
        goal: "general",
        duration: 8,
        frequency: 3,
        category: "scientific",
        features: [
          "Alta frecuencia para cada grupo muscular",
          "Ideal para principiantes",
          "Eficiente en tiempo",
          "Enfoque en movimientos compuestos"
        ]
      },
      {
        id: "bro-split",
        name: "Bro Split",
        description: "Rutina clásica de 5 días con un grupo muscular por día. Máximo volumen para cada grupo muscular.",
        level: "intermediate",
        goal: "hypertrophy",
        duration: 10,
        frequency: 5,
        category: "bodybuilding",
        features: [
          "Alto volumen por grupo muscular",
          "Máxima congestión y bomba muscular",
          "Recuperación completa entre entrenamientos",
          "Enfoque en ejercicios de aislamiento"
        ]
      },
      {
        id: "strength-program",
        name: "Programa de Fuerza 5x5",
        description: "Rutina enfocada en fuerza con progresión lineal. Basada en ejercicios compuestos con series de 5 repeticiones.",
        level: "intermediate",
        goal: "strength",
        duration: 12,
        frequency: 3,
        category: "scientific",
        features: [
          "Enfoque en fuerza máxima",
          "Progresión lineal de cargas",
          "Ejercicios compuestos principales",
          "Estructura simple y efectiva"
        ]
      },
      {
        id: "german-volume",
        name: "German Volume Training",
        description: "Método de entrenamiento de alto volumen con 10 series de 10 repeticiones. Diseñado para maximizar la hipertrofia.",
        level: "advanced",
        goal: "hypertrophy",
        duration: 6,
        frequency: 4,
        category: "bodybuilding",
        features: [
          "Extremadamente alto volumen",
          "10 series de 10 repeticiones",
          "Enfoque en tiempo bajo tensión",
          "Ideal para romper estancamientos"
        ]
      }
    ]
    
    setTemplates(mockTemplates)
    setFilteredTemplates(mockTemplates)
    setIsLoading(false)
  }, [])
  
  // Filtrar plantillas cuando cambian los filtros
  useEffect(() => {
    let filtered = templates
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filtrar por nivel
    if (levelFilter !== "all") {
      filtered = filtered.filter(template => 
        template.level === levelFilter || template.level === "all"
      )
    }
    
    // Filtrar por objetivo
    if (goalFilter !== "all") {
      filtered = filtered.filter(template => 
        template.goal === goalFilter
      )
    }
    
    setFilteredTemplates(filtered)
  }, [searchTerm, levelFilter, goalFilter, templates])
  
  // Obtener el color de la insignia según el nivel
  const getLevelBadgeColor = (level: TrainingTemplate["level"]) => {
    switch (level) {
      case "beginner": return "bg-green-500"
      case "intermediate": return "bg-blue-500"
      case "advanced": return "bg-red-500"
      case "all": return "bg-purple-500"
      default: return "bg-gray-500"
    }
  }
  
  // Obtener el color de la insignia según el objetivo
  const getGoalBadgeColor = (goal: TrainingTemplate["goal"]) => {
    switch (goal) {
      case "strength": return "bg-blue-500"
      case "hypertrophy": return "bg-purple-500"
      case "endurance": return "bg-green-500"
      case "power": return "bg-yellow-500"
      case "weight_loss": return "bg-red-500"
      case "general": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }
  
  // Obtener el texto del nivel
  const getLevelText = (level: TrainingTemplate["level"]) => {
    switch (level) {
      case "beginner": return "Principiante"
      case "intermediate": return "Intermedio"
      case "advanced": return "Avanzado"
      case "all": return "Todos los niveles"
      default: return level
    }
  }
  
  // Obtener el texto del objetivo
  const getGoalText = (goal: TrainingTemplate["goal"]) => {
    switch (goal) {
      case "strength": return "Fuerza"
      case "hypertrophy": return "Hipertrofia"
      case "endurance": return "Resistencia"
      case "power": return "Potencia"
      case "weight_loss": return "Pérdida de peso"
      case "general": return "General"
      default: return goal
    }
  }
  
  return (
    <RoutinizeLayout activeTab="training" title="Plantillas de entrenamiento">
      <div className="container mx-auto p-4 pb-20">
        <div className="flex items-center mb-6">
          <Button3D 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button3D>
          <h1 className="text-2xl font-bold">Plantillas científicas</h1>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <PulseLoader message="Cargando plantillas..." />
          </div>
        ) : (
          <div className="space-y-6">
            <Card3D>
              <Card3DHeader>
                <Card3DTitle gradient={true}>Plantillas de entrenamiento científicas</Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Nuestras plantillas están diseñadas por expertos en ciencias del ejercicio y 
                    basadas en investigaciones científicas para maximizar tus resultados. 
                    Selecciona una plantilla y personalízala según tus necesidades.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Brain className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="font-medium text-blue-700 dark:text-blue-400">Basadas en ciencia</h3>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        Diseñadas según principios científicos de entrenamiento y periodización.
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <RefreshCw className="h-5 w-5 text-purple-500 mr-2" />
                        <h3 className="font-medium text-purple-700 dark:text-purple-400">Periodización</h3>
                      </div>
                      <p className="text-sm text-purple-600 dark:text-purple-300">
                        Incluyen ciclos de entrenamiento con semanas de descarga programadas.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Zap className="h-5 w-5 text-green-500 mr-2" />
                        <h3 className="font-medium text-green-700 dark:text-green-400">Personalizables</h3>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        Adaptables a tus necesidades, equipo disponible y preferencias.
                      </p>
                    </div>
                  </div>
                </div>
              </Card3DContent>
            </Card3D>
            
            {/* Filtros */}
            <Card3D>
              <Card3DHeader>
                <Card3DTitle>Filtrar plantillas</Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar plantillas..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nivel</label>
                      <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los niveles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los niveles</SelectItem>
                          <SelectItem value="beginner">Principiante</SelectItem>
                          <SelectItem value="intermediate">Intermedio</SelectItem>
                          <SelectItem value="advanced">Avanzado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Objetivo</label>
                      <Select value={goalFilter} onValueChange={setGoalFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los objetivos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los objetivos</SelectItem>
                          <SelectItem value="strength">Fuerza</SelectItem>
                          <SelectItem value="hypertrophy">Hipertrofia</SelectItem>
                          <SelectItem value="endurance">Resistencia</SelectItem>
                          <SelectItem value="power">Potencia</SelectItem>
                          <SelectItem value="weight_loss">Pérdida de peso</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card3DContent>
            </Card3D>
            
            {/* Lista de plantillas */}
            <div className="space-y-4">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <Dumbbell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No se encontraron plantillas</h3>
                  <p className="text-gray-500 mb-4">Prueba con otros filtros o términos de búsqueda</p>
                  <Button3D onClick={() => {
                    setSearchTerm("")
                    setLevelFilter("all")
                    setGoalFilter("all")
                  }}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restablecer filtros
                  </Button3D>
                </div>
              ) : (
                filteredTemplates.map(template => (
                  <Card3D key={template.id}>
                    <Card3DContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                            <Badge className={getLevelBadgeColor(template.level)}>
                              {getLevelText(template.level)}
                            </Badge>
                            <Badge className={getGoalBadgeColor(template.goal)}>
                              {getGoalText(template.goal)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-4">{template.description}</p>
                          
                          <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                              <span className="text-sm text-gray-600">{template.duration} semanas</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-500 mr-1" />
                              <span className="text-sm text-gray-600">{template.frequency} días/semana</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Características</h4>
                            <ul className="space-y-1">
                              {template.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                  <Flame className="h-4 w-4 text-orange-500 mr-2 mt-0.5 shrink-0" />
                                  <span className="text-sm">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="flex justify-between">
                        <Button3D 
                          variant="outline"
                          onClick={() => router.push(`/training/templates/${template.id}`)}
                        >
                          <Dumbbell className="h-4 w-4 mr-2" />
                          Ver detalles
                        </Button3D>
                        <Button3D onClick={() => router.push(`/training/templates/${template.id}/use`)}>
                          <Zap className="h-4 w-4 mr-2" />
                          Usar plantilla
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button3D>
                      </div>
                    </Card3DContent>
                  </Card3D>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </RoutinizeLayout>
  )
}
