"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { OrganicElement } from "@/components/transitions/organic-transitions"
import { WorkoutRoutine } from "@/lib/types/training"
import { saveWorkoutRoutine } from "@/lib/training-service"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import {
  Dumbbell,
  ChevronRight,
  Info,
  Play,
  Plus,
  Check,
  X,
  ArrowUpDown,
  RotateCcw,
  Calendar,
  Clock,
  Target,
  Award,
  Zap,
  BarChart,
  Copy
} from "lucide-react"
import { v4 as uuidv4 } from "uuid"

// Plantillas de entrenamiento predefinidas
const WORKOUT_TEMPLATES = [
  {
    id: "ppl-routine",
    name: "Push Pull Legs (PPL)",
    description: "Rutina de 6 días dividida en empujar, tirar y piernas. Ideal para hipertrofia con alta frecuencia.",
    level: "intermediate",
    goal: "hypertrophy",
    frequency: "6 días por semana",
    split: "push_pull_legs",
    days: 6,
    duration: 60,
    deload: true,
    periodization: "linear",
    features: ["Alta frecuencia", "Volumen moderado", "Buena recuperación"],
    image: "/images/templates/ppl.jpg"
  },
  {
    id: "upper-lower",
    name: "Upper/Lower Split",
    description: "Rutina de 4 días dividida en tren superior e inferior. Equilibrio entre frecuencia y volumen.",
    level: "beginner",
    goal: "strength",
    frequency: "4 días por semana",
    split: "upper_lower",
    days: 4,
    duration: 60,
    deload: true,
    periodization: "undulating",
    features: ["Buena frecuencia", "Volumen moderado", "Excelente para principiantes"],
    image: "/images/templates/upper-lower.jpg"
  },
  {
    id: "full-body",
    name: "Full Body",
    description: "Rutina de cuerpo completo 3 días por semana. Máxima frecuencia para cada grupo muscular.",
    level: "beginner",
    goal: "general_fitness",
    frequency: "3 días por semana",
    split: "full_body",
    days: 3,
    duration: 60,
    deload: false,
    periodization: "linear",
    features: ["Alta frecuencia", "Bajo volumen por sesión", "Eficiente en tiempo"],
    image: "/images/templates/full-body.jpg"
  },
  {
    id: "bro-split",
    name: "Bro Split",
    description: "Rutina clásica de 5 días con un grupo muscular por día. Máximo volumen por grupo muscular.",
    level: "intermediate",
    goal: "hypertrophy",
    frequency: "5 días por semana",
    split: "bro_split",
    days: 5,
    duration: 60,
    deload: true,
    periodization: "linear",
    features: ["Alto volumen", "Baja frecuencia", "Buena para avanzados"],
    image: "/images/templates/bro-split.jpg"
  },
  {
    id: "push-pull",
    name: "Push/Pull",
    description: "Rutina de 4 días alternando entre empujar y tirar. Incluye piernas en ambos días.",
    level: "intermediate",
    goal: "strength",
    frequency: "4 días por semana",
    split: "push_pull",
    days: 4,
    duration: 60,
    deload: true,
    periodization: "block",
    features: ["Buena frecuencia", "Volumen moderado", "Buena recuperación"],
    image: "/images/templates/push-pull.jpg"
  },
  {
    id: "upper-lower-advanced",
    name: "Upper/Lower Avanzado",
    description: "Versión avanzada del Upper/Lower con técnicas especiales y mayor volumen.",
    level: "advanced",
    goal: "hypertrophy",
    frequency: "4-5 días por semana",
    split: "upper_lower",
    days: 5,
    duration: 75,
    deload: true,
    periodization: "undulating",
    features: ["Alto volumen", "Técnicas avanzadas", "Para usuarios experimentados"],
    image: "/images/templates/upper-lower-advanced.jpg"
  },
  {
    id: "strength-focus",
    name: "Enfoque en Fuerza",
    description: "Rutina centrada en los levantamientos básicos para maximizar la fuerza.",
    level: "intermediate",
    goal: "strength",
    frequency: "4 días por semana",
    split: "upper_lower",
    days: 4,
    duration: 75,
    deload: true,
    periodization: "block",
    features: ["Alta intensidad", "Bajo volumen", "Enfoque en compuestos"],
    image: "/images/templates/strength.jpg"
  },
  {
    id: "hypertrophy-focus",
    name: "Enfoque en Hipertrofia",
    description: "Rutina diseñada para maximizar el crecimiento muscular con técnicas avanzadas.",
    level: "intermediate",
    goal: "hypertrophy",
    frequency: "5 días por semana",
    split: "body_part",
    days: 5,
    duration: 60,
    deload: true,
    periodization: "undulating",
    features: ["Alto volumen", "Técnicas de intensidad", "Variedad de ejercicios"],
    image: "/images/templates/hypertrophy.jpg"
  }
]

interface WorkoutTemplatesProps {
  userId: string
  isAdmin?: boolean
}

export function WorkoutTemplates({ userId, isAdmin = false }: WorkoutTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const router = useRouter()

  // Filtrar plantillas por nivel
  const getFilteredTemplates = () => {
    if (activeTab === "all") return WORKOUT_TEMPLATES
    return WORKOUT_TEMPLATES.filter(template => template.level === activeTab)
  }

  // Aplicar plantilla al usuario
  const applyTemplate = async (template: any) => {
    if (!userId || !isAdmin) {
      toast({
        title: "Acceso restringido",
        description: "Solo el administrador puede aplicar plantillas",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Crear una nueva rutina basada en la plantilla
      const newRoutine: WorkoutRoutine = {
        id: uuidv4(),
        userId: userId,
        name: template.name,
        description: template.description,
        days: [], // Se completará con los días reales de la plantilla
        frequency: template.frequency,
        goal: template.goal,
        level: template.level,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        includesDeload: template.deload,
        deloadFrequency: 4, // Cada 4 semanas
        deloadStrategy: "volume",
        source: "Template",
        tags: [template.split, template.goal, template.level],
        split: template.split
      }

      // Guardar la rutina
      const { data, error } = await saveWorkoutRoutine(newRoutine)

      if (error) {
        console.error("Error al guardar la plantilla:", error)
        toast({
          title: "Error",
          description: "No se pudo aplicar la plantilla",
          variant: "destructive"
        })
        return
      }

      if (data) {
        toast({
          title: "Éxito",
          description: "Plantilla aplicada correctamente",
        })

        // Redirigir a la página de edición
        setTimeout(() => {
          router.push(`/training/edit/${data.id}`)
        }, 500)
      }
    } catch (error) {
      console.error("Error al aplicar plantilla:", error)
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al aplicar la plantilla",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 mb-4 rounded-full p-1">
          <TabsTrigger value="all" className="rounded-full">
            Todos
          </TabsTrigger>
          <TabsTrigger value="beginner" className="rounded-full">
            Principiante
          </TabsTrigger>
          <TabsTrigger value="intermediate" className="rounded-full">
            Intermedio
          </TabsTrigger>
          <TabsTrigger value="advanced" className="rounded-full">
            Avanzado
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {getFilteredTemplates().map(template => (
          <OrganicElement key={template.id} type="fade">
            <Card className="p-4 hover:border-primary/50 transition-colors">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className={`text-xs ${template.level === 'beginner' ? 'bg-green-50' : template.level === 'intermediate' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                        {template.level === 'beginner' ? 'Principiante' : template.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${template.goal === 'strength' ? 'bg-blue-50' : template.goal === 'hypertrophy' ? 'bg-purple-50' : 'bg-green-50'}`}>
                        {template.goal === 'strength' ? 'Fuerza' : template.goal === 'hypertrophy' ? 'Hipertrofia' : 'Fitness general'}
                      </Badge>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{template.name}</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh]">
                        <div className="space-y-4 py-2">
                          <p className="text-sm text-gray-600">{template.description}</p>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm">{template.frequency}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm">{template.duration} min/sesión</span>
                            </div>
                            <div className="flex items-center">
                              <Target className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm">{template.goal === 'strength' ? 'Fuerza' : template.goal === 'hypertrophy' ? 'Hipertrofia' : 'Fitness general'}</span>
                            </div>
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm">{template.level === 'beginner' ? 'Principiante' : template.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}</span>
                            </div>
                          </div>

                          <Separator />
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Características</h4>
                            <ul className="space-y-1">
                              {template.features.map((feature, index) => (
                                <li key={index} className="flex items-center text-sm">
                                  <Check className="h-3 w-3 mr-2 text-green-500" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Periodización</h4>
                            <p className="text-sm text-gray-600">
                              {template.periodization === 'linear' ? 'Lineal: Progresión gradual de volumen a intensidad' : 
                               template.periodization === 'undulating' ? 'Ondulante: Variación de volumen e intensidad por sesión' : 
                               'Por bloques: Fases específicas de volumen, fuerza y potencia'}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Deload</h4>
                            <p className="text-sm text-gray-600">
                              {template.deload ? 'Incluye semanas de descarga cada 4-6 semanas' : 'No incluye semanas de descarga programadas'}
                            </p>
                          </div>
                        </div>
                      </ScrollArea>
                      {isAdmin && (
                        <div className="flex justify-end mt-4">
                          <Button 
                            onClick={() => applyTemplate(template)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2"></div>
                            ) : (
                              <Copy className="h-4 w-4 mr-2" />
                            )}
                            Aplicar plantilla
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{template.description}</p>

                <div className="flex items-center text-xs text-gray-400 mt-2 space-x-2">
                  <span>{template.days} días</span>
                  <span>•</span>
                  <span>{template.frequency}</span>
                  <span>•</span>
                  <span>{template.duration} min/sesión</span>
                </div>

                <div className="mt-auto pt-4">
                  {isAdmin ? (
                    <Button 
                      className="w-full rounded-full"
                      onClick={() => applyTemplate(template)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2"></div>
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Aplicar plantilla
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => {
                        toast({
                          title: "Acceso restringido",
                          description: "Solo el administrador puede aplicar plantillas",
                          variant: "destructive"
                        })
                      }}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      Ver detalles
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </OrganicElement>
        ))}
      </div>
    </div>
  )
}
