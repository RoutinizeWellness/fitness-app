"use client"

import { useState } from "react"
import {
  Flame, ChevronDown, ChevronUp, Clock, 
  RotateCcw, Info, Check, AlertCircle
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Progress3D } from "@/components/ui/progress-3d"
import { 
  ExerciseData, 
  WarmupSet, 
  getWarmupProtocol 
} from "@/lib/exercise-library"

interface WarmupProtocolProps {
  exercise: ExerciseData
  workingWeight: number
  onComplete?: () => void
}

export function WarmupProtocol({
  exercise,
  workingWeight,
  onComplete
}: WarmupProtocolProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [completedSets, setCompletedSets] = useState<string[]>([])
  const [currentWeight, setCurrentWeight] = useState<number>(workingWeight)
  
  // Obtener el protocolo de calentamiento
  const warmupProtocol = exercise.warmupProtocol
  
  if (!warmupProtocol) {
    return (
      <Card3D className="bg-muted/50">
        <Card3DContent className="p-4">
          <div className="flex items-center text-muted-foreground">
            <Info className="h-4 w-4 mr-2" />
            <p className="text-sm">No hay protocolo de calentamiento específico para este ejercicio.</p>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  // Calcular los sets de calentamiento con pesos reales
  const warmupSets = warmupProtocol.specificWarmup.map((set, index) => {
    const actualWeight = set.percentage === 0 
      ? 0 // Barra vacía o peso corporal
      : Math.round((set.percentage / 100) * currentWeight)
    
    return {
      id: `warmup-${index}`,
      percentage: set.percentage,
      reps: set.reps,
      restSeconds: set.restSeconds,
      weight: actualWeight
    }
  })
  
  // Marcar un set como completado
  const toggleSetCompletion = (setId: string) => {
    if (completedSets.includes(setId)) {
      setCompletedSets(completedSets.filter(id => id !== setId))
    } else {
      setCompletedSets([...completedSets, setId])
    }
  }
  
  // Calcular el progreso del calentamiento
  const warmupProgress = warmupSets.length > 0
    ? (completedSets.length / warmupSets.length) * 100
    : 0
  
  // Actualizar el peso de trabajo
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWeight = parseFloat(e.target.value)
    if (!isNaN(newWeight) && newWeight >= 0) {
      setCurrentWeight(newWeight)
    }
  }
  
  // Completar todo el calentamiento
  const completeAllWarmup = () => {
    const allSetIds = warmupSets.map(set => set.id)
    setCompletedSets(allSetIds)
    if (onComplete) {
      onComplete()
    }
  }
  
  // Reiniciar el calentamiento
  const resetWarmup = () => {
    setCompletedSets([])
  }
  
  return (
    <Card3D className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <Card3DHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Flame className="h-5 w-5 mr-2 text-orange-500" />
            <Card3DTitle>Protocolo de Calentamiento</Card3DTitle>
          </div>
          <Button3D 
            variant="ghost" 
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button3D>
        </div>
        {!isExpanded && (
          <Progress3D 
            value={warmupProgress} 
            className="h-1 mt-2"
            indicatorClassName="bg-orange-500"
          />
        )}
      </Card3DHeader>
      
      {isExpanded && (
        <Card3DContent className="pt-0">
          <div className="text-sm text-muted-foreground mb-4">
            {warmupProtocol.generalWarmup}
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <Label htmlFor="working-weight" className="flex-shrink-0">Peso de trabajo:</Label>
            <Input
              id="working-weight"
              type="number"
              value={currentWeight}
              onChange={handleWeightChange}
              className="w-24"
            />
            <span className="text-sm">kg</span>
          </div>
          
          <div className="space-y-2 mb-4">
            {warmupSets.map((set) => (
              <div 
                key={set.id}
                className={`flex items-center justify-between p-2 rounded-md border ${
                  completedSets.includes(set.id) 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                    : 'bg-card/50 border-border'
                }`}
              >
                <div className="flex items-center">
                  <Button3D
                    variant={completedSets.includes(set.id) ? "default" : "outline"}
                    size="icon"
                    className={`h-6 w-6 mr-3 ${
                      completedSets.includes(set.id) ? 'bg-green-500 hover:bg-green-600' : ''
                    }`}
                    onClick={() => toggleSetCompletion(set.id)}
                  >
                    <Check className="h-3 w-3" />
                  </Button3D>
                  <div>
                    <div className="font-medium">
                      {set.percentage === 0 
                        ? 'Barra vacía / Peso corporal' 
                        : `${set.percentage}% (${set.weight} kg)`
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {set.reps} repeticiones
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {set.restSeconds}s
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          {warmupProtocol.mobilityExercises && (
            <Accordion type="single" collapsible className="mb-4">
              <AccordionItem value="mobility">
                <AccordionTrigger className="text-sm">
                  Ejercicios de Movilidad Recomendados
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {warmupProtocol.mobilityExercises.map((exercise, index) => (
                      <li key={index}>{exercise}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button3D 
                    variant="outline" 
                    size="sm"
                    onClick={resetWarmup}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reiniciar
                  </Button3D>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reiniciar el progreso del calentamiento</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button3D 
              size="sm"
              onClick={completeAllWarmup}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Completar Calentamiento
            </Button3D>
          </div>
          
          <div className="mt-4">
            <Progress3D 
              value={warmupProgress} 
              className="h-2"
              indicatorClassName="bg-orange-500"
            />
            <div className="text-xs text-right mt-1 text-muted-foreground">
              {completedSets.length} de {warmupSets.length} series completadas
            </div>
          </div>
          
          {warmupProgress === 100 && (
            <div className="flex items-center mt-4 p-2 bg-green-50 dark:bg-green-950/20 rounded-md text-green-700 dark:text-green-300">
              <Check className="h-4 w-4 mr-2" />
              <span className="text-sm">¡Calentamiento completado! Listo para comenzar las series de trabajo.</span>
            </div>
          )}
          
          {warmupProgress < 50 && warmupProgress > 0 && (
            <div className="flex items-center mt-4 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-md text-amber-700 dark:text-amber-300">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">Completa el calentamiento para reducir el riesgo de lesiones.</span>
            </div>
          )}
        </Card3DContent>
      )}
    </Card3D>
  )
}
