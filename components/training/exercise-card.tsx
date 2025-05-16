"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Dumbbell, RotateCcw, Play, Info, Check } from "lucide-react"
import { Exercise } from "@/lib/types/training"
import { ExerciseAlternatives } from "@/components/training/exercise-alternatives"
import { useToast } from "@/components/ui/use-toast"

interface ExerciseCardProps {
  exercise: Exercise
  availableExercises: Exercise[]
  onStartExercise?: (exerciseId: string) => void
  onChangeExercise?: (oldExerciseId: string, newExerciseId: string) => void
  showControls?: boolean
}

export function ExerciseCard({
  exercise,
  availableExercises,
  onStartExercise,
  onChangeExercise,
  showControls = true
}: ExerciseCardProps) {
  const { toast } = useToast()
  const [showAlternatives, setShowAlternatives] = useState(false)

  // Manejar el inicio del ejercicio
  const handleStartExercise = () => {
    if (onStartExercise) {
      onStartExercise(exercise.id)
    }
  }

  // Manejar el cambio de ejercicio
  const handleChangeExercise = (newExerciseId: string) => {
    if (onChangeExercise) {
      onChangeExercise(exercise.id, newExerciseId)
      setShowAlternatives(false)
      
      // Encontrar el nombre del nuevo ejercicio
      const newExercise = availableExercises.find(ex => ex.id === newExerciseId)
      
      toast({
        title: "Ejercicio cambiado",
        description: `Se ha cambiado a ${newExercise?.name || 'nuevo ejercicio'}`,
        variant: "default"
      })
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 bg-primary/5">
        <CardTitle className="text-base flex justify-between items-center">
          <span className="flex items-center">
            <Dumbbell className="h-4 w-4 mr-2 text-primary" />
            {exercise.name}
          </span>
          {exercise.sets && exercise.repsMin && (
            <span className="text-sm text-muted-foreground">
              {exercise.sets} × {exercise.repsMin}{exercise.repsMax ? `-${exercise.repsMax}` : ''}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3">
        <div className="flex flex-wrap gap-1 mb-2">
          {exercise.category && (
            <Badge variant="outline">{exercise.category}</Badge>
          )}
          {exercise.muscleGroup && exercise.muscleGroup.map(group => (
            <Badge key={group} variant="secondary">{group}</Badge>
          ))}
          {exercise.equipment && exercise.equipment.map(eq => (
            <Badge key={eq} variant="outline" className="text-xs">{eq}</Badge>
          ))}
        </div>
        
        {exercise.instructions && (
          <p className="text-sm text-muted-foreground mb-3">{exercise.instructions}</p>
        )}
        
        {showControls && (
          <div className="flex gap-2 mt-2">
            <Dialog open={showAlternatives} onOpenChange={setShowAlternatives}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Alternativas
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <ExerciseAlternatives
                  exercise={exercise}
                  availableExercises={availableExercises}
                  onSelectAlternative={handleChangeExercise}
                  currentExerciseId={exercise.id}
                />
              </DialogContent>
            </Dialog>
            
            <Button size="sm" className="flex-1" onClick={handleStartExercise}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
