"use client"

import { useState, useEffect } from "react"
import {
  Dumbbell,
  RotateCcw,
  Check,
  Edit,
  Trash,
  Plus,
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Exercise, ExerciseSet } from "@/lib/types/training"
import { ExerciseAlternatives } from "@/components/training/exercise-alternatives"
import { toast } from "@/components/ui/use-toast"

interface ExerciseSetCardProps {
  exercise: Exercise
  sets: ExerciseSet[]
  availableExercises: Exercise[]
  onUpdateSets: (sets: ExerciseSet[]) => void
  onAddSet?: () => void
  onRemoveSet?: (setId: string) => void
  isEditable?: boolean
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export function ExerciseSetCard({
  exercise,
  sets,
  availableExercises,
  onUpdateSets,
  onAddSet,
  onRemoveSet,
  isEditable = true,
  isExpanded = false,
  onToggleExpand
}: ExerciseSetCardProps) {
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [alternativeExercise, setAlternativeExercise] = useState<Exercise | null>(null)
  
  // Buscar el ejercicio alternativo si existe
  useEffect(() => {
    if (sets.length > 0 && sets[0].alternativeExerciseId) {
      const altExercise = availableExercises.find(ex => ex.id === sets[0].alternativeExerciseId)
      if (altExercise) {
        setAlternativeExercise(altExercise)
      }
    } else {
      setAlternativeExercise(null)
    }
  }, [sets, availableExercises])
  
  // Manejar selección de ejercicio alternativo
  const handleSelectAlternative = (alternativeId: string) => {
    // Buscar el ejercicio alternativo
    const altExercise = availableExercises.find(ex => ex.id === alternativeId)
    if (!altExercise) return
    
    // Actualizar todos los sets con el nuevo ejercicio alternativo
    const updatedSets = sets.map(set => ({
      ...set,
      alternativeExerciseId: alternativeId
    }))
    
    // Actualizar el estado local
    setAlternativeExercise(altExercise)
    
    // Notificar al componente padre
    onUpdateSets(updatedSets)
    
    // Cerrar el diálogo
    setShowAlternatives(false)
  }
  
  // Restablecer el ejercicio original
  const resetToOriginalExercise = () => {
    // Actualizar todos los sets para quitar el ejercicio alternativo
    const updatedSets = sets.map(set => ({
      ...set,
      alternativeExerciseId: undefined
    }))
    
    // Actualizar el estado local
    setAlternativeExercise(null)
    
    // Notificar al componente padre
    onUpdateSets(updatedSets)
    
    // Mostrar notificación
    toast({
      title: "Ejercicio restablecido",
      description: "Se ha restablecido el ejercicio original",
      variant: "default"
    })
  }
  
  // Actualizar un set específico
  const updateSet = (setId: string, updates: Partial<ExerciseSet>) => {
    const updatedSets = sets.map(set => 
      set.id === setId ? { ...set, ...updates } : set
    )
    onUpdateSets(updatedSets)
  }
  
  // Obtener el ejercicio que se está mostrando (original o alternativo)
  const displayExercise = alternativeExercise || exercise
  
  return (
    <Card3D className="overflow-hidden">
      <Card3DHeader className="p-3 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center">
              <Dumbbell className="h-4 w-4 text-primary mr-2" />
              <Card3DTitle className="text-base font-medium">
                {displayExercise.name}
              </Card3DTitle>
              
              {alternativeExercise && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Alternativo
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge variant="outline" className="text-xs">
                {displayExercise.category}
              </Badge>
              {displayExercise.equipment && displayExercise.equipment.map(eq => (
                <Badge key={eq} variant="secondary" className="text-xs">
                  {eq}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {isEditable && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Dialog open={showAlternatives} onOpenChange={setShowAlternatives}>
                        <DialogTrigger asChild>
                          <Button3D variant="ghost" size="icon" className="h-8 w-8">
                            <RotateCcw className="h-4 w-4" />
                          </Button3D>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <ExerciseAlternatives
                            exercise={exercise}
                            availableExercises={availableExercises}
                            onSelectAlternative={handleSelectAlternative}
                            currentExerciseId={exercise.id}
                          />
                        </DialogContent>
                      </Dialog>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cambiar ejercicio</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {alternativeExercise && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button3D variant="ghost" size="icon" className="h-8 w-8" onClick={resetToOriginalExercise}>
                          <Check className="h-4 w-4" />
                        </Button3D>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Restablecer ejercicio original</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </>
            )}
            
            {onToggleExpand && (
              <Button3D variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleExpand}>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button3D>
            )}
          </div>
        </div>
      </Card3DHeader>
      
      {isExpanded && (
        <Card3DContent className="p-3">
          <div className="space-y-3">
            {/* Cabecera de la tabla */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
              <div className="col-span-1">#</div>
              <div className="col-span-2">Reps</div>
              <div className="col-span-2">RIR</div>
              <div className="col-span-3">Peso (kg)</div>
              <div className="col-span-3">Descanso</div>
              <div className="col-span-1"></div>
            </div>
            
            {/* Sets */}
            {sets.map((set, index) => (
              <div key={set.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1 text-sm font-medium">{index + 1}</div>
                
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={set.targetReps}
                    onChange={(e) => updateSet(set.id, { targetReps: parseInt(e.target.value) || 0 })}
                    className="h-8 text-sm"
                    disabled={!isEditable}
                  />
                </div>
                
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={set.targetRir}
                    onChange={(e) => updateSet(set.id, { targetRir: parseInt(e.target.value) || 0 })}
                    className="h-8 text-sm"
                    disabled={!isEditable}
                  />
                </div>
                
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={set.weight || ""}
                    onChange={(e) => updateSet(set.id, { weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="h-8 text-sm"
                    placeholder="Opcional"
                    disabled={!isEditable}
                  />
                </div>
                
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={set.restTime || ""}
                    onChange={(e) => updateSet(set.id, { restTime: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="h-8 text-sm"
                    placeholder="Seg."
                    disabled={!isEditable}
                  />
                </div>
                
                <div className="col-span-1">
                  {isEditable && onRemoveSet && (
                    <Button3D variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemoveSet(set.id)}>
                      <Trash className="h-3 w-3" />
                    </Button3D>
                  )}
                </div>
              </div>
            ))}
            
            {/* Botón para añadir set */}
            {isEditable && onAddSet && (
              <div className="pt-2">
                <Button3D variant="outline" size="sm" className="w-full" onClick={onAddSet}>
                  <Plus className="h-3 w-3 mr-1" />
                  Añadir serie
                </Button3D>
              </div>
            )}
          </div>
        </Card3DContent>
      )}
    </Card3D>
  )
}
