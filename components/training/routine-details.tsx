"use client"

import { useState } from "react"
import { 
  Calendar, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  Dumbbell, 
  Play,
  Check,
  ArrowRight,
  Star
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Exercise } from "@/lib/types/training"

// Tipos para rutinas
interface RoutineExercise {
  id: string
  exercise: Exercise
  sets: number
  reps: string
  rest: number
  weight?: string
  notes?: string
}

interface RoutineDay {
  id: string
  name: string
  exercises: RoutineExercise[]
  targetMuscleGroups: string[]
  completed?: boolean
}

interface Routine {
  id: string
  name: string
  description: string
  level: string
  goal: string
  frequency: number
  duration: number
  days: RoutineDay[]
  imageUrl?: string
  progress?: number
  startDate?: string
  endDate?: string
}

interface RoutineDetailsProps {
  routine: Routine
  onStartWorkout?: (dayId: string) => void
  onEditRoutine?: () => void
}

export function RoutineDetails({ 
  routine, 
  onStartWorkout,
  onEditRoutine
}: RoutineDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  
  // Calcular progreso de la rutina
  const completedDays = routine.days.filter(day => day.completed).length
  const progress = routine.progress || (completedDays / routine.days.length * 100)
  
  // Formatear objetivo
  const formatGoal = (goal: string) => {
    switch (goal) {
      case "strength": return "Fuerza"
      case "hypertrophy": return "Hipertrofia"
      case "weight_loss": return "Pérdida de peso"
      case "general_fitness": return "Fitness general"
      case "endurance": return "Resistencia"
      case "athletic": return "Rendimiento atlético"
      default: return goal
    }
  }
  
  // Formatear nivel
  const formatLevel = (level: string) => {
    switch (level) {
      case "beginner": return "Principiante"
      case "intermediate": return "Intermedio"
      case "advanced": return "Avanzado"
      default: return level
    }
  }
  
  return (
    <Card className="overflow-hidden border-none shadow-lg">
      {/* Cabecera con imagen */}
      {routine.imageUrl && (
        <div className="relative h-48 w-full">
          <img 
            src={routine.imageUrl} 
            alt={routine.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30" />
          <div className="absolute bottom-0 left-0 p-6">
            <Badge className="mb-2">
              {formatLevel(routine.level)}
            </Badge>
            <h2 className="text-white text-2xl font-bold">{routine.name}</h2>
            <p className="text-white/80 text-sm mt-1">{routine.description}</p>
          </div>
        </div>
      )}
      
      {/* Si no hay imagen, mostrar cabecera normal */}
      {!routine.imageUrl && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{routine.name}</CardTitle>
              <CardDescription>{routine.description}</CardDescription>
            </div>
            <Badge>{formatLevel(routine.level)}</Badge>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="p-6">
        {/* Progreso */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Progreso</h3>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Pestañas */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="schedule">Programa</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Objetivo</p>
                  <p className="text-sm text-muted-foreground">
                    {formatGoal(routine.goal)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Frecuencia</p>
                  <p className="text-sm text-muted-foreground">{routine.frequency} días/semana</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Duración</p>
                  <p className="text-sm text-muted-foreground">~{routine.duration} min/sesión</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Ejercicios</p>
                  <p className="text-sm text-muted-foreground">
                    {routine.days.reduce((total, day) => total + day.exercises.length, 0)} en total
                  </p>
                </div>
              </div>
            </div>
            
            {/* Fechas si están disponibles */}
            {(routine.startDate || routine.endDate) && (
              <div className="bg-muted/50 rounded-lg p-4 mt-4">
                <h3 className="text-sm font-medium mb-2">Periodo de entrenamiento</h3>
                <div className="flex items-center justify-between">
                  {routine.startDate && (
                    <div>
                      <p className="text-xs text-muted-foreground">Inicio</p>
                      <p className="text-sm font-medium">{routine.startDate}</p>
                    </div>
                  )}
                  {routine.startDate && routine.endDate && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  {routine.endDate && (
                    <div>
                      <p className="text-xs text-muted-foreground">Fin</p>
                      <p className="text-sm font-medium">{routine.endDate}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Distribución muscular */}
            <div>
              <h3 className="text-sm font-medium mb-2">Distribución muscular</h3>
              <div className="grid grid-cols-2 gap-2">
                {routine.days.map((day, index) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="text-sm">{day.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {day.targetMuscleGroups.join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              <Accordion type="single" collapsible className="w-full">
                {routine.days.map((day, index) => (
                  <AccordionItem key={day.id} value={day.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center">
                        <Badge 
                          variant={day.completed ? "default" : "outline"} 
                          className={`h-6 w-6 rounded-full p-0 flex items-center justify-center mr-2 ${day.completed ? "bg-green-500 hover:bg-green-500" : ""}`}
                        >
                          {day.completed ? <Check className="h-3 w-3" /> : index + 1}
                        </Badge>
                        <span>{day.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {day.exercises.length} ejercicios
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pl-8">
                        {day.exercises.map((exercise) => (
                          <div key={exercise.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{exercise.exercise.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {exercise.sets} series × {exercise.reps} reps • {exercise.rest}s descanso
                                </p>
                                {exercise.notes && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    {exercise.notes}
                                  </p>
                                )}
                              </div>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(exercise.exercise.videoUrl || `https://www.youtube.com/results?search_query=${exercise.exercise.name}+exercise+tutorial`, "_blank")}>
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {onStartWorkout && (
                          <Button 
                            className="w-full mt-2" 
                            onClick={() => onStartWorkout(day.id)}
                          >
                            {day.completed ? "Repetir entrenamiento" : "Iniciar entrenamiento"}
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        {onEditRoutine && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onEditRoutine}
          >
            Editar rutina
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
