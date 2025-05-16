"use client"

import { useState } from "react"
import { 
  Calendar, 
  Edit, 
  Trash, 
  Plus,
  Clock,
  Dumbbell,
  BarChart3,
  Info,
  Settings,
  Play,
  Download,
  Share2,
  RefreshCw
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress3D } from "@/components/ui/progress-3d"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkoutDayWithAlternatives } from "./workout-day-with-alternatives"
import { PeriodizationVisualization } from "./periodization-visualization"
import { WorkoutRoutine, WorkoutDay, Exercise } from "@/lib/types/training"
import { MesoCycle } from "@/lib/enhanced-periodization"
import { toast } from "@/components/ui/use-toast"

interface WorkoutRoutineWithAlternativesProps {
  routine: WorkoutRoutine
  mesoCycle?: MesoCycle
  onUpdateRoutine: (updatedRoutine: WorkoutRoutine) => void
  onStartWorkout?: (routineId: string) => void
  onEditRoutine?: (routineId: string) => void
  onDeleteRoutine?: (routineId: string) => void
  onAddDay?: (routineId: string) => void
  onEditDay?: (routineId: string, dayId: string) => void
  onDeleteDay?: (routineId: string, dayId: string) => void
  onAddExercise?: (routineId: string, dayId: string) => void
  onEditExercise?: (routineId: string, dayId: string, exerciseId: string) => void
  onDeleteExercise?: (routineId: string, dayId: string, exerciseId: string) => void
  onDuplicateExercise?: (routineId: string, dayId: string, exerciseId: string) => void
}

export function WorkoutRoutineWithAlternatives({
  routine,
  mesoCycle,
  onUpdateRoutine,
  onStartWorkout,
  onEditRoutine,
  onDeleteRoutine,
  onAddDay,
  onEditDay,
  onDeleteDay,
  onAddExercise,
  onEditExercise,
  onDeleteExercise,
  onDuplicateExercise
}: WorkoutRoutineWithAlternativesProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "periodization">("overview")
  
  // Manejar actualización de un día
  const handleUpdateDay = (updatedDay: WorkoutDay) => {
    // Encontrar el día a actualizar
    const dayIndex = routine.days.findIndex(day => day.id === updatedDay.id)
    
    if (dayIndex === -1) {
      toast({
        title: "Error",
        description: "No se pudo encontrar el día a actualizar",
        variant: "destructive"
      })
      return
    }
    
    // Crear una copia de la rutina con el día actualizado
    const updatedDays = [...routine.days]
    updatedDays[dayIndex] = updatedDay
    
    const updatedRoutine: WorkoutRoutine = {
      ...routine,
      days: updatedDays
    }
    
    // Actualizar la rutina
    onUpdateRoutine(updatedRoutine)
  }
  
  // Calcular estadísticas de la rutina
  const totalExercises = routine.days.reduce((total, day) => {
    // Contar ejercicios únicos por día
    const uniqueExercises = new Set(day.exerciseSets.map(ex => ex.exerciseId))
    return total + uniqueExercises.size
  }, 0)
  
  const totalSets = routine.days.reduce((total, day) => {
    return total + day.exerciseSets.length
  }, 0)
  
  const estimatedDuration = routine.days.reduce((total, day) => {
    return total + (day.estimatedDuration || 0)
  }, 0)
  
  // Obtener nivel de dificultad en español
  const getLevelLabel = (level: string) => {
    switch (level) {
      case "beginner": return "Principiante"
      case "intermediate": return "Intermedio"
      case "advanced": return "Avanzado"
      default: return level
    }
  }
  
  // Obtener objetivo en español
  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case "strength": return "Fuerza"
      case "hypertrophy": return "Hipertrofia"
      case "endurance": return "Resistencia"
      case "power": return "Potencia"
      case "weight_loss": return "Pérdida de peso"
      case "general_fitness": return "Fitness general"
      default: return goal
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{routine.name}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {routine.level && (
              <Badge variant="outline">
                {getLevelLabel(routine.level)}
              </Badge>
            )}
            {routine.goal && (
              <Badge variant="outline">
                {getGoalLabel(routine.goal)}
              </Badge>
            )}
            <Badge variant="outline">
              {routine.frequency} días/semana
            </Badge>
            {routine.includesDeload && (
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                Incluye descarga
              </Badge>
            )}
          </div>
          {routine.description && (
            <p className="text-sm text-muted-foreground mt-2">{routine.description}</p>
          )}
        </div>
        
        <div className="flex space-x-2">
          {onStartWorkout && (
            <Button3D onClick={() => onStartWorkout(routine.id)}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar
            </Button3D>
          )}
          <Button3D variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button3D>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="overview">Visión General</TabsTrigger>
          <TabsTrigger value="periodization">Periodización</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Estadísticas de la rutina */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card3D>
              <Card3DContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ejercicios</p>
                    <p className="text-2xl font-bold">{totalExercises}</p>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </Card3DContent>
            </Card3D>
            
            <Card3D>
              <Card3DContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Series totales</p>
                    <p className="text-2xl font-bold">{totalSets}</p>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </Card3DContent>
            </Card3D>
            
            <Card3D>
              <Card3DContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Duración estimada</p>
                    <p className="text-2xl font-bold">{estimatedDuration} min</p>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </Card3DContent>
            </Card3D>
          </div>
          
          {/* Días de entrenamiento */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Días de entrenamiento</h2>
              {onAddDay && (
                <Button3D variant="outline" size="sm" onClick={() => onAddDay(routine.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir día
                </Button3D>
              )}
            </div>
            
            {routine.days.map(day => (
              <WorkoutDayWithAlternatives
                key={day.id}
                day={day}
                onUpdateDay={handleUpdateDay}
                onAddExercise={onAddExercise ? (dayId) => onAddExercise(routine.id, dayId) : undefined}
                onEditExercise={onEditExercise ? (dayId, exerciseId) => onEditExercise(routine.id, dayId, exerciseId) : undefined}
                onDeleteExercise={onDeleteExercise ? (dayId, exerciseId) => onDeleteExercise(routine.id, dayId, exerciseId) : undefined}
                onDuplicateExercise={onDuplicateExercise ? (dayId, exerciseId) => onDuplicateExercise(routine.id, dayId, exerciseId) : undefined}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="periodization" className="space-y-6">
          {mesoCycle ? (
            <PeriodizationVisualization mesoCycle={mesoCycle} />
          ) : (
            <Card3D>
              <Card3DContent className="p-6 text-center">
                <div className="flex flex-col items-center justify-center py-8">
                  <RefreshCw className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay periodización configurada</h3>
                  <p className="text-gray-500 mb-4">
                    Configura la periodización para visualizar el progreso a lo largo del tiempo
                  </p>
                  <Button3D>
                    <Plus className="mr-2 h-4 w-4" />
                    Configurar Periodización
                  </Button3D>
                </div>
              </Card3DContent>
            </Card3D>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex space-x-2">
          {onEditRoutine && (
            <Button3D variant="outline" size="sm" onClick={() => onEditRoutine(routine.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button3D>
          )}
          {onDeleteRoutine && (
            <Button3D variant="outline" size="sm" className="text-red-600" onClick={() => onDeleteRoutine(routine.id)}>
              <Trash className="h-4 w-4 mr-2" />
              Eliminar
            </Button3D>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button3D variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button3D>
          <Button3D variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button3D>
        </div>
      </div>
    </div>
  )
}
