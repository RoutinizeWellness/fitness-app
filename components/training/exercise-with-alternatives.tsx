"use client"

import { useState } from "react"
import { 
  Dumbbell, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash, 
  MoreHorizontal,
  RefreshCw,
  Copy,
  Info
} from "lucide-react"
import { Card3D, Card3DContent } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Exercise } from "@/lib/types/training"
import { Exercise as AlternativeExercise } from "@/lib/exercise-alternatives"
import { ExerciseAlternativeSelector } from "./exercise-alternative-selector"
import { toast } from "@/components/ui/use-toast"

interface ExerciseWithAlternativesProps {
  exercise: Exercise
  alternatives?: AlternativeExercise[]
  onSelectAlternative: (originalId: string, newExercise: AlternativeExercise) => void
  onEdit?: (exerciseId: string) => void
  onDelete?: (exerciseId: string) => void
  onDuplicate?: (exerciseId: string) => void
}

export function ExerciseWithAlternatives({
  exercise,
  alternatives = [],
  onSelectAlternative,
  onEdit,
  onDelete,
  onDuplicate
}: ExerciseWithAlternativesProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAlternativeSelector, setShowAlternativeSelector] = useState(false)
  
  // Manejar selección de alternativa
  const handleSelectAlternative = (newExercise: AlternativeExercise) => {
    onSelectAlternative(exercise.id, newExercise)
    setShowAlternativeSelector(false)
    toast({
      title: "Ejercicio actualizado",
      description: `Se ha cambiado a ${newExercise.spanishName}`,
    })
  }
  
  return (
    <Card3D className="overflow-hidden">
      <Card3DContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center">
              <Dumbbell className="h-5 w-5 mr-2 text-primary" />
              <h3 className="font-medium">{exercise.name}</h3>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge variant="outline">
                {exercise.sets} series
              </Badge>
              <Badge variant="outline">
                {exercise.reps} reps
              </Badge>
              {exercise.rir !== undefined && (
                <Badge variant="outline">
                  RIR {exercise.rir}
                </Badge>
              )}
              {exercise.rest && (
                <Badge variant="outline">
                  {exercise.rest}s descanso
                </Badge>
              )}
            </div>
            
            {exercise.notes && (
              <p className="text-xs text-muted-foreground mt-1">
                {exercise.notes}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Dialog open={showAlternativeSelector} onOpenChange={setShowAlternativeSelector}>
              <DialogTrigger asChild>
                <Button3D variant="ghost" size="icon" className="h-8 w-8">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <RefreshCw className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Cambiar ejercicio</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Button3D>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <ExerciseAlternativeSelector
                  currentExerciseId={exercise.id}
                  onSelectAlternative={handleSelectAlternative}
                  onCancel={() => setShowAlternativeSelector(false)}
                />
              </DialogContent>
            </Dialog>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button3D variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button3D>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(exercise.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(exercise.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600" 
                    onClick={() => onDelete(exercise.id)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button3D 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button3D>
          </div>
        </div>
        
        {isExpanded && alternatives.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <h4 className="text-sm font-medium mb-2">Alternativas</h4>
            <div className="space-y-2">
              {alternatives.map(alt => (
                <div 
                  key={alt.id}
                  className="p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleSelectAlternative(alt)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-sm font-medium">{alt.spanishName}</h5>
                      <p className="text-xs text-muted-foreground">{alt.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {alt.equipment.map(eq => (
                          <Badge key={eq} variant="outline" className="text-xs">
                            {eq === "barbell" ? "Barra" :
                             eq === "dumbbell" ? "Mancuernas" :
                             eq === "machine" ? "Máquina" :
                             eq === "cable" ? "Cable" :
                             eq === "bodyweight" ? "Peso corporal" :
                             eq === "kettlebell" ? "Kettlebell" :
                             eq === "bands" ? "Bandas" :
                             eq === "smith_machine" ? "Máquina Smith" :
                             "Otro"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button3D variant="ghost" size="icon" className="h-6 w-6">
                            <Info className="h-3 w-3" />
                          </Button3D>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-xs">
                            <p className="text-sm">{alt.description}</p>
                            {alt.tips && alt.tips.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium">Consejos:</p>
                                <ul className="text-xs list-disc pl-4 mt-1 space-y-1">
                                  {alt.tips.slice(0, 2).map((tip, i) => (
                                    <li key={i}>{tip}</li>
                                  ))}
                                  {alt.tips.length > 2 && (
                                    <li>...</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
              
              <Button3D 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => setShowAlternativeSelector(true)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Ver más alternativas
              </Button3D>
            </div>
          </div>
        )}
        
        {isExpanded && alternatives.length === 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">No hay alternativas disponibles</p>
              <Button3D 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setShowAlternativeSelector(true)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Buscar alternativas
              </Button3D>
            </div>
          </div>
        )}
      </Card3DContent>
    </Card3D>
  )
}
