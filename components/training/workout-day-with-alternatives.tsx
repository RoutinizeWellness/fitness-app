"use client"

import { useState, useEffect } from "react"
import { 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash, 
  Plus,
  Clock,
  Dumbbell,
  BarChart3,
  Info
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress3D } from "@/components/ui/progress-3d"
import { ExerciseWithAlternatives } from "./exercise-with-alternatives"
import { Exercise, WorkoutDay } from "@/lib/types/training"
import { Exercise as AlternativeExercise, getAlternativesForExercise } from "@/lib/exercise-alternatives"
import { toast } from "@/components/ui/use-toast"

interface WorkoutDayWithAlternativesProps {
  day: WorkoutDay
  onUpdateDay: (updatedDay: WorkoutDay) => void
  onAddExercise?: (dayId: string) => void
  onEditExercise?: (dayId: string, exerciseId: string) => void
  onDeleteExercise?: (dayId: string, exerciseId: string) => void
  onDuplicateExercise?: (dayId: string, exerciseId: string) => void
}

export function WorkoutDayWithAlternatives({
  day,
  onUpdateDay,
  onAddExercise,
  onEditExercise,
  onDeleteExercise,
  onDuplicateExercise
}: WorkoutDayWithAlternativesProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [exerciseAlternatives, setExerciseAlternatives] = useState<Record<string, AlternativeExercise[]>>({})
  
  // Cargar alternativas para cada ejercicio
  useEffect(() => {
    const loadAlternatives = async () => {
      const alternatives: Record<string, AlternativeExercise[]> = {}
      
      // Para cada ejercicio, obtener sus alternativas
      day.exerciseSets.forEach(exercise => {
        alternatives[exercise.id] = getAlternativesForExercise(exercise.exerciseId)
      })
      
      setExerciseAlternatives(alternatives)
    }
    
    loadAlternatives()
  }, [day.exerciseSets])
  
  // Manejar selección de alternativa
  const handleSelectAlternative = (exerciseId: string, newExercise: AlternativeExercise) => {
    // Encontrar el ejercicio a reemplazar
    const exerciseIndex = day.exerciseSets.findIndex(ex => ex.id === exerciseId)
    
    if (exerciseIndex === -1) {
      toast({
        title: "Error",
        description: "No se pudo encontrar el ejercicio a reemplazar",
        variant: "destructive"
      })
      return
    }
    
    // Crear una copia del día con el ejercicio actualizado
    const updatedExerciseSets = [...day.exerciseSets]
    updatedExerciseSets[exerciseIndex] = {
      ...updatedExerciseSets[exerciseIndex],
      exerciseId: newExercise.id,
      name: newExercise.spanishName
    }
    
    const updatedDay: WorkoutDay = {
      ...day,
      exerciseSets: updatedExerciseSets
    }
    
    // Actualizar el día
    onUpdateDay(updatedDay)
    
    // Actualizar las alternativas para el nuevo ejercicio
    setExerciseAlternatives(prev => ({
      ...prev,
      [exerciseId]: getAlternativesForExercise(newExercise.id)
    }))
  }
  
  // Agrupar ejercicios por ID para mostrarlos juntos
  const groupedExercises: Record<string, Exercise[]> = {}
  day.exerciseSets.forEach(exercise => {
    if (!groupedExercises[exercise.exerciseId]) {
      groupedExercises[exercise.exerciseId] = []
    }
    groupedExercises[exercise.exerciseId].push(exercise)
  })
  
  // Obtener ejercicios únicos (uno por grupo)
  const uniqueExercises = Object.values(groupedExercises).map(group => group[0])
  
  return (
    <Card3D className="overflow-hidden">
      <Card3DHeader className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center">
          <Card3DTitle>{day.name}</Card3DTitle>
          <Badge variant="outline" className="ml-2">
            {day.exerciseSets.length} ejercicios
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          {day.estimatedDuration && (
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {day.estimatedDuration} min
            </Badge>
          )}
          <Button3D variant="ghost" size="icon" className="h-8 w-8">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button3D>
        </div>
      </Card3DHeader>
      
      {isExpanded && (
        <Card3DContent>
          {day.description && (
            <p className="text-sm text-muted-foreground mb-4">{day.description}</p>
          )}
          
          {day.targetMuscleGroups && day.targetMuscleGroups.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {day.targetMuscleGroups.map(muscle => (
                <Badge key={muscle} variant="secondary">
                  {muscle === "chest" ? "Pecho" :
                   muscle === "back" ? "Espalda" :
                   muscle === "shoulders" ? "Hombros" :
                   muscle === "biceps" ? "Bíceps" :
                   muscle === "triceps" ? "Tríceps" :
                   muscle === "quads" ? "Cuádriceps" :
                   muscle === "hamstrings" ? "Isquiotibiales" :
                   muscle === "glutes" ? "Glúteos" :
                   muscle === "calves" ? "Pantorrillas" :
                   muscle === "abs" ? "Abdominales" :
                   muscle === "forearms" ? "Antebrazos" :
                   muscle === "traps" ? "Trapecios" :
                   muscle === "lats" ? "Dorsales" :
                   muscle === "lower_back" ? "Lumbar" :
                   muscle === "front_delts" ? "Deltoides anterior" :
                   muscle === "side_delts" ? "Deltoides lateral" :
                   muscle === "rear_delts" ? "Deltoides posterior" :
                   muscle}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="space-y-3">
            {uniqueExercises.map(exercise => (
              <ExerciseWithAlternatives
                key={exercise.id}
                exercise={exercise}
                alternatives={exerciseAlternatives[exercise.id] || []}
                onSelectAlternative={handleSelectAlternative}
                onEdit={onEditExercise ? (exerciseId) => onEditExercise(day.id, exerciseId) : undefined}
                onDelete={onDeleteExercise ? (exerciseId) => onDeleteExercise(day.id, exerciseId) : undefined}
                onDuplicate={onDuplicateExercise ? (exerciseId) => onDuplicateExercise(day.id, exerciseId) : undefined}
              />
            ))}
          </div>
          
          {onAddExercise && (
            <Button3D 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => onAddExercise(day.id)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir ejercicio
            </Button3D>
          )}
        </Card3DContent>
      )}
    </Card3D>
  )
}
