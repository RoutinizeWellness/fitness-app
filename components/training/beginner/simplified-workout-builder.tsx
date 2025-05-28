"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dumbbell, Info, Plus, Check, ChevronRight, HelpCircle } from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { useUserExperience } from "@/contexts/user-experience-context"
import { supabase } from "@/lib/supabase-client"
import { v4 as uuidv4 } from "uuid"

// Tipos simplificados para principiantes
interface SimplifiedExercise {
  id: string
  name: string
  muscleGroup: string
  sets: number
  reps: string // "8-12" o similar
  restMinutes: number
  image?: string
  videoUrl?: string
  notes?: string
  difficulty: "beginner" | "intermediate" | "advanced"
}

interface SimplifiedWorkoutDay {
  id: string
  name: string
  exercises: SimplifiedExercise[]
  notes?: string
}

interface SimplifiedWorkoutPlan {
  id: string
  userId: string
  name: string
  description: string
  days: SimplifiedWorkoutDay[]
  daysPerWeek: number
  goal: string
  createdAt: string
  updatedAt: string
}

// Datos de ejemplo para ejercicios
const SAMPLE_EXERCISES: SimplifiedExercise[] = [
  {
    id: "ex1",
    name: "Sentadilla con peso corporal",
    muscleGroup: "legs",
    sets: 3,
    reps: "10-15",
    restMinutes: 1,
    image: "/images/exercises/bodyweight-squat.jpg",
    difficulty: "beginner"
  },
  {
    id: "ex2",
    name: "Flexiones modificadas",
    muscleGroup: "chest",
    sets: 3,
    reps: "8-12",
    restMinutes: 1,
    image: "/images/exercises/modified-pushup.jpg",
    difficulty: "beginner"
  },
  {
    id: "ex3",
    name: "Remo con mancuerna",
    muscleGroup: "back",
    sets: 3,
    reps: "10-12",
    restMinutes: 1,
    image: "/images/exercises/dumbbell-row.jpg",
    difficulty: "beginner"
  },
  {
    id: "ex4",
    name: "Elevaciones laterales",
    muscleGroup: "shoulders",
    sets: 3,
    reps: "12-15",
    restMinutes: 1,
    image: "/images/exercises/lateral-raise.jpg",
    difficulty: "beginner"
  },
  {
    id: "ex5",
    name: "Curl de bíceps con mancuernas",
    muscleGroup: "arms",
    sets: 3,
    reps: "10-12",
    restMinutes: 1,
    image: "/images/exercises/dumbbell-curl.jpg",
    difficulty: "beginner"
  }
]

// Plantillas de rutinas para principiantes
const BEGINNER_TEMPLATES = [
  {
    id: "template1",
    name: "Rutina de cuerpo completo para principiantes",
    description: "Perfecta para empezar a entrenar, 3 días por semana",
    daysPerWeek: 3,
    goal: "general_fitness",
    days: [
      {
        id: "day1",
        name: "Día 1: Cuerpo Completo A",
        exercises: [
          SAMPLE_EXERCISES[0], // Sentadilla
          SAMPLE_EXERCISES[1], // Flexiones
          SAMPLE_EXERCISES[2], // Remo
          SAMPLE_EXERCISES[3]  // Elevaciones laterales
        ]
      },
      {
        id: "day2",
        name: "Día 2: Cuerpo Completo B",
        exercises: [
          SAMPLE_EXERCISES[0], // Sentadilla
          SAMPLE_EXERCISES[1], // Flexiones
          SAMPLE_EXERCISES[2], // Remo
          SAMPLE_EXERCISES[4]  // Curl de bíceps
        ]
      },
      {
        id: "day3",
        name: "Día 3: Cuerpo Completo C",
        exercises: [
          SAMPLE_EXERCISES[0], // Sentadilla
          SAMPLE_EXERCISES[1], // Flexiones
          SAMPLE_EXERCISES[2], // Remo
          SAMPLE_EXERCISES[3], // Elevaciones laterales
          SAMPLE_EXERCISES[4]  // Curl de bíceps
        ]
      }
    ]
  },
  {
    id: "template2",
    name: "Rutina de 2 días para principiantes",
    description: "Ideal si solo puedes entrenar 2 días a la semana",
    daysPerWeek: 2,
    goal: "general_fitness",
    days: [
      {
        id: "day1",
        name: "Día 1: Parte Superior",
        exercises: [
          SAMPLE_EXERCISES[1], // Flexiones
          SAMPLE_EXERCISES[2], // Remo
          SAMPLE_EXERCISES[3], // Elevaciones laterales
          SAMPLE_EXERCISES[4]  // Curl de bíceps
        ]
      },
      {
        id: "day2",
        name: "Día 2: Parte Inferior",
        exercises: [
          SAMPLE_EXERCISES[0], // Sentadilla
          // Añadir más ejercicios de pierna
        ]
      }
    ]
  }
]

export function SimplifiedWorkoutBuilder() {
  const { experienceLevel } = useUserExperience()
  const [activeTab, setActiveTab] = useState("templates")
  const [selectedTemplate, setSelectedTemplate] = useState<SimplifiedWorkoutPlan | null>(null)
  const [customPlan, setCustomPlan] = useState<SimplifiedWorkoutPlan | null>(null)
  const [showExerciseHelp, setShowExerciseHelp] = useState(false)
  
  // Crear un plan personalizado
  const createCustomPlan = () => {
    const newPlan: SimplifiedWorkoutPlan = {
      id: uuidv4(),
      userId: "", // Se asignará al guardar
      name: "Mi rutina personalizada",
      description: "Mi primera rutina de entrenamiento",
      days: [
        {
          id: uuidv4(),
          name: "Día 1",
          exercises: []
        }
      ],
      daysPerWeek: 3,
      goal: "general_fitness",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setCustomPlan(newPlan)
    setActiveTab("custom")
  }
  
  // Seleccionar una plantilla
  const selectTemplate = (template: any) => {
    // Convertir la plantilla al formato de plan
    const plan: SimplifiedWorkoutPlan = {
      id: uuidv4(),
      userId: "", // Se asignará al guardar
      name: template.name,
      description: template.description,
      days: template.days,
      daysPerWeek: template.daysPerWeek,
      goal: template.goal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setSelectedTemplate(plan)
    setActiveTab("review")
  }
  
  // Guardar el plan seleccionado
  const savePlan = async () => {
    const planToSave = selectedTemplate || customPlan
    if (!planToSave) return
    
    try {
      // Aquí se guardaría el plan en Supabase
      toast({
        title: "Plan guardado",
        description: "Tu rutina de entrenamiento ha sido guardada correctamente."
      })
      
      // Redirigir a la vista de planes
      setActiveTab("templates")
    } catch (error) {
      console.error("Error al guardar plan:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la rutina de entrenamiento.",
        variant: "destructive"
      })
    }
  }
  
  return (
    <Card3D className="w-full">
      <Card3DHeader>
        <div className="flex justify-between items-center">
          <Card3DTitle>Creador de Rutinas Simplificado</Card3DTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setShowExerciseHelp(true)}>
                  <HelpCircle className="h-5 w-5" />
                  <span className="sr-only">Ayuda</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Obtén ayuda sobre cómo crear tu rutina</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Card3DHeader>
      <Card3DContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
            <TabsTrigger value="custom">Personalizada</TabsTrigger>
            <TabsTrigger value="review">Revisar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BEGINNER_TEMPLATES.map(template => (
                <div 
                  key={template.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => selectTemplate(template)}
                >
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Dumbbell className="h-3 w-3 mr-1" />
                    <span>{template.daysPerWeek} días por semana</span>
                  </div>
                </div>
              ))}
              
              <div 
                className="border border-dashed rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer flex flex-col items-center justify-center text-center"
                onClick={createCustomPlan}
              >
                <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
                <h3 className="font-medium">Crear rutina personalizada</h3>
                <p className="text-sm text-muted-foreground">Diseña tu propia rutina desde cero</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            {customPlan && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan-name">Nombre de la rutina</Label>
                    <Input
                      id="plan-name"
                      value={customPlan.name}
                      onChange={(e) => setCustomPlan({ ...customPlan, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan-days">Días por semana</Label>
                    <Select
                      value={String(customPlan.daysPerWeek)}
                      onValueChange={(value) => setCustomPlan({ ...customPlan, daysPerWeek: parseInt(value) })}
                    >
                      <SelectTrigger id="plan-days">
                        <SelectValue placeholder="Selecciona los días" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 días</SelectItem>
                        <SelectItem value="3">3 días</SelectItem>
                        <SelectItem value="4">4 días</SelectItem>
                        <SelectItem value="5">5 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plan-description">Descripción</Label>
                  <Input
                    id="plan-description"
                    value={customPlan.description}
                    onChange={(e) => setCustomPlan({ ...customPlan, description: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Objetivo principal</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="goal-fitness" 
                        checked={customPlan.goal === "general_fitness"}
                        onCheckedChange={() => setCustomPlan({ ...customPlan, goal: "general_fitness" })}
                      />
                      <label htmlFor="goal-fitness" className="text-sm">Fitness general</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="goal-strength" 
                        checked={customPlan.goal === "strength"}
                        onCheckedChange={() => setCustomPlan({ ...customPlan, goal: "strength" })}
                      />
                      <label htmlFor="goal-strength" className="text-sm">Fuerza</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="goal-muscle" 
                        checked={customPlan.goal === "muscle_gain"}
                        onCheckedChange={() => setCustomPlan({ ...customPlan, goal: "muscle_gain" })}
                      />
                      <label htmlFor="goal-muscle" className="text-sm">Ganar músculo</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="goal-weight" 
                        checked={customPlan.goal === "weight_loss"}
                        onCheckedChange={() => setCustomPlan({ ...customPlan, goal: "weight_loss" })}
                      />
                      <label htmlFor="goal-weight" className="text-sm">Perder peso</label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setActiveTab("templates")}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setActiveTab("review")}>
                    Continuar
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="review" className="space-y-4">
            {(selectedTemplate || customPlan) && (
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">{selectedTemplate?.name || customPlan?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate?.description || customPlan?.description}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Dumbbell className="h-3 w-3 mr-1" />
                    <span>{selectedTemplate?.daysPerWeek || customPlan?.daysPerWeek} días por semana</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Días de entrenamiento</h3>
                  {(selectedTemplate?.days || customPlan?.days || []).map((day, index) => (
                    <div key={day.id} className="border rounded-lg p-4">
                      <h4 className="font-medium">{day.name}</h4>
                      <div className="mt-2 space-y-2">
                        {day.exercises.map(exercise => (
                          <div key={exercise.id} className="flex items-center justify-between py-1 border-b">
                            <div>
                              <p className="font-medium">{exercise.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {exercise.sets} series x {exercise.reps} repeticiones
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setActiveTab("templates")}>
                    Volver
                  </Button>
                  <Button onClick={savePlan}>
                    Guardar Rutina
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Dialog open={showExerciseHelp} onOpenChange={setShowExerciseHelp}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Guía para crear tu rutina</DialogTitle>
              <DialogDescription>
                Consejos para principiantes sobre cómo crear una rutina efectiva
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Frecuencia recomendada</h4>
                <p className="text-sm">Para principiantes, lo ideal es entrenar 2-3 días por semana con al menos un día de descanso entre sesiones.</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Ejercicios básicos</h4>
                <p className="text-sm">Enfócate en ejercicios compuestos que trabajen varios grupos musculares: sentadillas, flexiones, remo, press de hombros.</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Series y repeticiones</h4>
                <p className="text-sm">Comienza con 2-3 series de 10-15 repeticiones por ejercicio. Aumenta gradualmente a medida que progreses.</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setShowExerciseHelp(false)}>Entendido</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card3DContent>
    </Card3D>
  )
}
