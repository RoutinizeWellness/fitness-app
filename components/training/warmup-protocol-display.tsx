import React, { useState } from "react"
import { Card3D, Card3DContent } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  Dumbbell, 
  Clock, 
  RotateCcw,
  CheckCircle2,
  Info
} from "lucide-react"
import { 
  getWarmupProtocol, 
  getWarmupMobilityExercises,
  ExerciseData
} from "@/lib/exercise-library"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Progress3D } from "@/components/ui/progress-3d"

interface WarmupProtocolDisplayProps {
  exercise: ExerciseData
  workingWeight: number
  onWarmupComplete?: () => void
}

export function WarmupProtocolDisplay({
  exercise,
  workingWeight,
  onWarmupComplete
}: WarmupProtocolDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [completedSets, setCompletedSets] = useState<string[]>([])
  
  // Obtener el protocolo de calentamiento
  const warmupSets = getWarmupProtocol(exercise.id, workingWeight)
  const mobilityExercises = getWarmupMobilityExercises(exercise.id)
  
  // Verificar si hay protocolo de calentamiento
  if (!exercise.warmupProtocol) {
    return (
      <Card3D className="bg-muted/50 mb-4">
        <Card3DContent className="p-4">
          <div className="flex items-center text-muted-foreground">
            <Info className="h-4 w-4 mr-2" />
            <p className="text-sm">No hay protocolo de calentamiento específico para este ejercicio.</p>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  // Marcar un set como completado
  const toggleSetCompletion = (setId: string) => {
    if (completedSets.includes(setId)) {
      setCompletedSets(completedSets.filter(id => id !== setId))
    } else {
      setCompletedSets([...completedSets, setId])
    }
  }
  
  // Calcular progreso del calentamiento
  const warmupProgress = warmupSets.length > 0 
    ? Math.round((completedSets.length / warmupSets.length) * 100) 
    : 0
  
  // Verificar si el calentamiento está completo
  const isWarmupComplete = warmupSets.length > 0 && completedSets.length === warmupSets.length
  
  return (
    <Card3D className="mb-4">
      <Card3DContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Flame className="h-5 w-5 mr-2 text-orange-500" />
            <h3 className="text-base font-medium">Protocolo de Calentamiento</h3>
          </div>
          <Button3D 
            variant="ghost" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button3D>
        </div>
        
        {/* Progreso del calentamiento */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Progreso</span>
            <span className="text-xs font-medium">{warmupProgress}%</span>
          </div>
          <Progress3D value={warmupProgress} />
        </div>
        
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Calentamiento general */}
            <div>
              <h4 className="text-sm font-medium mb-2">Calentamiento General</h4>
              <p className="text-sm text-muted-foreground">{exercise.warmupProtocol.generalWarmup}</p>
            </div>
            
            {/* Ejercicios de movilidad */}
            {mobilityExercises.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Movilidad Específica</h4>
                <ul className="text-sm space-y-1">
                  {mobilityExercises.map((exercise, index) => (
                    <li key={index} className="flex items-center">
                      <RotateCcw className="h-3 w-3 mr-2 text-blue-500" />
                      {exercise}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Series de calentamiento específicas */}
            {warmupSets.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Series de Calentamiento</h4>
                <div className="space-y-2">
                  {warmupSets.map((set, index) => {
                    const setId = `${exercise.id}-warmup-${index}`
                    const isCompleted = completedSets.includes(setId)
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-2 rounded-md ${
                          isCompleted ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center">
                          <Dumbbell className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <div className="flex items-center">
                              <span className="text-sm font-medium">
                                {set.percentage === 0 ? 'Barra vacía' : `${set.percentage}%`}
                              </span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className="ml-2">
                                      {set.calculatedWeight} kg
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Peso calculado para esta serie</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {set.reps} repeticiones
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center mr-3">
                                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <span className="text-xs">{set.restSeconds}s</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Descanso después de esta serie</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <Button3D 
                            variant={isCompleted ? "default" : "outline"} 
                            size="sm"
                            onClick={() => toggleSetCompletion(setId)}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            ) : (
                              "Completar"
                            )}
                          </Button3D>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Botón para marcar como completado */}
            {warmupSets.length > 0 && (
              <div className="pt-2">
                <Button3D 
                  className="w-full"
                  disabled={!isWarmupComplete}
                  onClick={onWarmupComplete}
                >
                  {isWarmupComplete ? "Calentamiento Completado" : "Completa todas las series"}
                </Button3D>
              </div>
            )}
          </div>
        )}
      </Card3DContent>
    </Card3D>
  )
}
