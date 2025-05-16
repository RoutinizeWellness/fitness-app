"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { 
  Dumbbell, 
  RotateCcw, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Edit,
  Play
} from "lucide-react"
import { Exercise } from "@/lib/types/training"
import { ExerciseAlternatives } from "@/components/training/exercise-alternatives"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"

interface ExerciseItemProps {
  exercise: Exercise
  availableExercises: Exercise[]
  onStartExercise?: (exerciseId: string) => void
  onChangeExercise?: (oldExerciseId: string, newExerciseId: string) => void
  showControls?: boolean
  currentSet?: number
  totalSets?: number
}

export function ExerciseItem({
  exercise,
  availableExercises,
  onStartExercise,
  onChangeExercise,
  showControls = true,
  currentSet = 1,
  totalSets
}: ExerciseItemProps) {
  const { toast } = useToast()
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [expanded, setExpanded] = useState(false)

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
      setShowDropdown(false)
      
      // Encontrar el nombre del nuevo ejercicio
      const newExercise = availableExercises.find(ex => ex.id === newExerciseId)
      
      toast({
        title: "Ejercicio cambiado",
        description: `Se ha cambiado a ${newExercise?.name || 'nuevo ejercicio'}`,
        variant: "default"
      })
    }
  }

  // Filtrar ejercicios alternativos con el mismo patrón de movimiento
  const getAlternatives = () => {
    if (!exercise.pattern) return []
    
    return availableExercises.filter(ex => 
      ex.id !== exercise.id && 
      ex.pattern === exercise.pattern
    ).slice(0, 5) // Limitar a 5 alternativas
  }

  const alternatives = getAlternatives()

  return (
    <Card className="overflow-hidden border rounded-lg">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-base">{exercise.name}</h3>
            <p className="text-sm text-muted-foreground">{exercise.muscleGroup?.[0]}</p>
          </div>
          
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2">
              {exercise.sets} × {exercise.repsMin}{exercise.repsMax ? `-${exercise.repsMax}` : ''}
            </Badge>
            
            {showControls && (
              <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Ejercicios alternativos</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {alternatives.length > 0 ? (
                    alternatives.map(alt => (
                      <DropdownMenuItem 
                        key={alt.id}
                        onClick={() => handleChangeExercise(alt.id)}
                      >
                        <Dumbbell className="h-4 w-4 mr-2 text-primary" />
                        <span>{alt.name}</span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No hay alternativas disponibles
                    </div>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowAlternatives(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Ver todas las alternativas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        <div className="flex items-center mt-2 text-sm">
          <div className="flex items-center mr-4">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{exercise.rest}s descanso</span>
          </div>
          
          {exercise.rir !== undefined && (
            <div className="flex items-center">
              <Badge variant="secondary" className="text-xs">
                RIR: {exercise.rir}
              </Badge>
            </div>
          )}
        </div>
        
        {expanded && exercise.instructions && (
          <div className="mt-3 text-sm text-muted-foreground border-t pt-2">
            <p>{exercise.instructions}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs px-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Menos detalles
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Más detalles
              </>
            )}
          </Button>
          
          {showControls && (
            <Button size="sm" onClick={handleStartExercise}>
              <Play className="h-4 w-4 mr-1" />
              Iniciar
            </Button>
          )}
        </div>
      </CardContent>
      
      <Dialog open={showAlternatives} onOpenChange={setShowAlternatives}>
        <DialogContent className="max-w-md">
          <ExerciseAlternatives
            exercise={exercise}
            availableExercises={availableExercises}
            onSelectAlternative={handleChangeExercise}
            currentExerciseId={exercise.id}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
