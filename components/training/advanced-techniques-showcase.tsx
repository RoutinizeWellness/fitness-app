"use client"

import { useState } from "react"
import { 
  Zap, 
  RefreshCw, 
  Clock, 
  Flame, 
  ChevronRight, 
  Info, 
  Play,
  ArrowRight,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Dumbbell
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Tipos para técnicas avanzadas
interface AdvancedTechnique {
  id: string
  name: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  category: "intensity" | "volume" | "specialization" | "recovery"
  benefits: string[]
  instructions: string[]
  warnings: string[]
  videoUrl?: string
  recommendedExercises?: string[]
}

interface AdvancedTechniquesShowcaseProps {
  className?: string
}

export function AdvancedTechniquesShowcase({
  className
}: AdvancedTechniquesShowcaseProps) {
  const [selectedTechnique, setSelectedTechnique] = useState<AdvancedTechnique | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  
  // Datos de ejemplo para técnicas avanzadas
  const advancedTechniques: AdvancedTechnique[] = [
    {
      id: "drop-sets",
      name: "Drop Sets",
      description: "Realizar una serie hasta el fallo o cerca del fallo, reducir el peso inmediatamente y continuar sin descanso.",
      difficulty: "intermediate",
      category: "intensity",
      benefits: [
        "Aumenta el tiempo bajo tensión",
        "Recluta más fibras musculares",
        "Incrementa el estrés metabólico",
        "Permite más volumen en menos tiempo"
      ],
      instructions: [
        "Selecciona un peso con el que puedas realizar 8-10 repeticiones",
        "Realiza la serie hasta el fallo o cerca del fallo",
        "Reduce el peso un 20-30% inmediatamente",
        "Continúa con más repeticiones sin descanso",
        "Repite el proceso 2-3 veces"
      ],
      warnings: [
        "Alta demanda de recuperación",
        "No usar en todos los ejercicios",
        "Limitar a 1-2 ejercicios por sesión",
        "No recomendado para principiantes"
      ],
      recommendedExercises: [
        "Curl de bíceps",
        "Press de hombros",
        "Extensiones de tríceps",
        "Elevaciones laterales",
        "Máquinas en general"
      ]
    },
    {
      id: "super-sets",
      name: "Super Sets",
      description: "Realizar dos ejercicios consecutivos sin descanso entre ellos, generalmente para grupos musculares diferentes o antagonistas.",
      difficulty: "beginner",
      category: "volume",
      benefits: [
        "Ahorra tiempo de entrenamiento",
        "Aumenta la densidad del entrenamiento",
        "Mejora la resistencia muscular",
        "Puede aumentar el gasto calórico"
      ],
      instructions: [
        "Selecciona dos ejercicios (preferiblemente para grupos musculares diferentes)",
        "Realiza el primer ejercicio con las repeticiones objetivo",
        "Sin descanso, pasa al segundo ejercicio",
        "Descansa después de completar ambos ejercicios",
        "Repite por el número de series programado"
      ],
      warnings: [
        "Puede reducir la intensidad en el segundo ejercicio",
        "No recomendable para ejercicios técnicamente complejos",
        "Monitorizar la fatiga acumulada"
      ],
      recommendedExercises: [
        "Bíceps y tríceps",
        "Pecho y espalda",
        "Cuádriceps e isquiotibiales",
        "Empujes y tirones"
      ]
    },
    {
      id: "rest-pause",
      name: "Rest-Pause",
      description: "Realizar una serie hasta el fallo o cerca del fallo, descansar brevemente (10-20 segundos), y continuar con el mismo peso para más repeticiones.",
      difficulty: "intermediate",
      category: "intensity",
      benefits: [
        "Aumenta el tiempo bajo tensión",
        "Incrementa la intensidad sin aumentar el peso",
        "Mejora la resistencia muscular",
        "Estimula más fibras musculares"
      ],
      instructions: [
        "Selecciona un peso con el que puedas realizar 8-12 repeticiones",
        "Realiza la serie hasta el fallo o cerca del fallo",
        "Descansa 10-20 segundos (respiraciones profundas)",
        "Continúa con el mismo peso hasta el fallo nuevamente",
        "Repite el proceso 2-3 veces"
      ],
      warnings: [
        "Alta demanda de recuperación",
        "No usar en todos los ejercicios",
        "Limitar a 1-2 ejercicios por sesión",
        "Monitorizar la técnica durante las mini-series"
      ],
      recommendedExercises: [
        "Press de banca",
        "Sentadillas",
        "Dominadas",
        "Press militar",
        "Remo con barra"
      ]
    },
    {
      id: "giant-sets",
      name: "Giant Sets",
      description: "Realizar 3 o más ejercicios consecutivos para el mismo grupo muscular sin descanso entre ellos.",
      difficulty: "advanced",
      category: "intensity",
      benefits: [
        "Máxima estimulación muscular",
        "Gran bomba muscular y congestión",
        "Ahorro de tiempo",
        "Excelente para romper estancamientos"
      ],
      instructions: [
        "Selecciona 3-5 ejercicios para el mismo grupo muscular",
        "Realiza cada ejercicio con las repeticiones objetivo",
        "No descanses entre ejercicios",
        "Descansa 2-3 minutos después de completar todos los ejercicios",
        "Repite por el número de series programado (generalmente 3-4)"
      ],
      warnings: [
        "Extremadamente exigente",
        "Alta demanda de recuperación",
        "No recomendado para principiantes",
        "Limitar a un grupo muscular por sesión",
        "Monitorizar signos de sobreentrenamiento"
      ],
      recommendedExercises: [
        "Combinaciones de ejercicios para hombros",
        "Circuito de ejercicios para piernas",
        "Secuencia de ejercicios para brazos",
        "Combinación de ejercicios para espalda"
      ]
    }
  ]
  
  // Filtrar técnicas por categoría
  const filteredTechniques = activeCategory === "all" 
    ? advancedTechniques 
    : advancedTechniques.filter(technique => technique.category === activeCategory)
  
  // Obtener el color según la dificultad
  const getDifficultyColor = (difficulty: AdvancedTechnique["difficulty"]) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500"
      case "intermediate": return "bg-yellow-500"
      case "advanced": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }
  
  // Obtener el icono según la categoría
  const getCategoryIcon = (category: AdvancedTechnique["category"]) => {
    switch (category) {
      case "intensity": return <Flame className="h-4 w-4 text-red-500" />
      case "volume": return <Dumbbell className="h-4 w-4 text-blue-500" />
      case "specialization": return <Zap className="h-4 w-4 text-purple-500" />
      case "recovery": return <RefreshCw className="h-4 w-4 text-green-500" />
      default: return <Info className="h-4 w-4" />
    }
  }
  
  // Obtener el nombre de la categoría
  const getCategoryName = (category: AdvancedTechnique["category"]) => {
    switch (category) {
      case "intensity": return "Intensidad"
      case "volume": return "Volumen"
      case "specialization": return "Especialización"
      case "recovery": return "Recuperación"
      default: return "Desconocido"
    }
  }
  
  return (
    <div className={className}>
      <Card3D>
        <Card3DHeader>
          <Card3DTitle gradient={true}>Técnicas avanzadas de entrenamiento</Card3DTitle>
          <div className="flex space-x-2">
            <Button3D 
              variant={activeCategory === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveCategory("all")}
            >
              Todas
            </Button3D>
            <Button3D 
              variant={activeCategory === "intensity" ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveCategory("intensity")}
            >
              <Flame className="h-4 w-4 mr-2" />
              Intensidad
            </Button3D>
            <Button3D 
              variant={activeCategory === "volume" ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveCategory("volume")}
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              Volumen
            </Button3D>
          </div>
        </Card3DHeader>
        <Card3DContent>
          <div className="space-y-4">
            {filteredTechniques.map(technique => (
              <div 
                key={technique.id} 
                className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-semibold">{technique.name}</h3>
                      <Badge className={`ml-2 ${getDifficultyColor(technique.difficulty)}`}>
                        {technique.difficulty === "beginner" ? "Principiante" : 
                         technique.difficulty === "intermediate" ? "Intermedio" : "Avanzado"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{technique.description}</p>
                    <div className="flex items-center text-xs text-gray-400 mt-2">
                      {getCategoryIcon(technique.category)}
                      <span className="ml-1">{getCategoryName(technique.category)}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex justify-between">
                  <Button3D 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedTechnique(technique)}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Detalles
                  </Button3D>
                  <Button3D size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Aplicar en entrenamiento
                  </Button3D>
                </div>
              </div>
            ))}
          </div>
        </Card3DContent>
      </Card3D>
      
      {/* Modal de detalles de técnica */}
      {selectedTechnique && (
        <Dialog open={!!selectedTechnique} onOpenChange={(open) => !open && setSelectedTechnique(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedTechnique.name}</DialogTitle>
              <DialogDescription>
                {selectedTechnique.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Badge className={getDifficultyColor(selectedTechnique.difficulty)}>
                  {selectedTechnique.difficulty === "beginner" ? "Principiante" : 
                   selectedTechnique.difficulty === "intermediate" ? "Intermedio" : "Avanzado"}
                </Badge>
                <Badge variant="outline" className="flex items-center">
                  {getCategoryIcon(selectedTechnique.category)}
                  <span className="ml-1">{getCategoryName(selectedTechnique.category)}</span>
                </Badge>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="benefits">
                  <AccordionTrigger>Beneficios</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1">
                      {selectedTechnique.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span className="text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="instructions">
                  <AccordionTrigger>Instrucciones</AccordionTrigger>
                  <AccordionContent>
                    <ol className="space-y-1 list-decimal list-inside">
                      {selectedTechnique.instructions.map((instruction, index) => (
                        <li key={index} className="text-sm">
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="warnings">
                  <AccordionTrigger>Precauciones</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1">
                      {selectedTechnique.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start">
                          <X className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                          <span className="text-sm">{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                {selectedTechnique.recommendedExercises && (
                  <AccordionItem value="exercises">
                    <AccordionTrigger>Ejercicios recomendados</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1">
                        {selectedTechnique.recommendedExercises.map((exercise, index) => (
                          <li key={index} className="flex items-start">
                            <Dumbbell className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                            <span className="text-sm">{exercise}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
            
            <DialogFooter>
              <Button3D onClick={() => setSelectedTechnique(null)}>
                Cerrar
              </Button3D>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
