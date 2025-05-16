"use client"

import { useState, useEffect } from "react"
import { 
  Calculator, 
  Dumbbell, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw,
  Flame,
  Brain,
  Info,
  HelpCircle
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface WeightCalculatorProps {
  exerciseName: string
  previousWeight?: number
  previousRir?: number
  targetRir?: number
  fatigue?: number
  onWeightChange: (weight: number) => void
  className?: string
}

export function WeightCalculator({
  exerciseName,
  previousWeight = 0,
  previousRir = 2,
  targetRir = 2,
  fatigue = 50,
  onWeightChange,
  className
}: WeightCalculatorProps) {
  const [calculatedWeight, setCalculatedWeight] = useState(previousWeight)
  const [manualWeight, setManualWeight] = useState(previousWeight.toString())
  const [showInfo, setShowInfo] = useState(false)
  const [localFatigue, setLocalFatigue] = useState(fatigue)
  
  // Calcular peso recomendado basado en RIR y fatiga
  useEffect(() => {
    // Si no hay peso previo, no podemos calcular
    if (!previousWeight) {
      setCalculatedWeight(0)
      setManualWeight("0")
      return
    }
    
    // Calcular ajuste basado en diferencia de RIR
    // Si el RIR objetivo es menor que el anterior, aumentamos el peso
    // Si el RIR objetivo es mayor que el anterior, disminuimos el peso
    const rirDifference = previousRir - targetRir
    
    // Ajuste base por RIR (aproximadamente 2.5-5% por punto de RIR)
    let rirAdjustment = 1 + (rirDifference * 0.035)
    
    // Ajuste por fatiga (reducir peso si la fatiga es alta)
    // Fatiga se mide de 0-100, donde 50 es neutral
    const fatigueAdjustment = 1 - ((localFatigue - 50) * 0.003)
    
    // Calcular peso ajustado
    const adjustedWeight = previousWeight * rirAdjustment * fatigueAdjustment
    
    // Redondear a incrementos de 1.25 kg (común en muchos gimnasios)
    const roundedWeight = Math.round(adjustedWeight / 1.25) * 1.25
    
    setCalculatedWeight(roundedWeight)
    setManualWeight(roundedWeight.toString())
    
    // Notificar cambio
    onWeightChange(roundedWeight)
  }, [previousWeight, previousRir, targetRir, localFatigue, onWeightChange])
  
  // Manejar cambio manual de peso
  const handleManualWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setManualWeight(value)
    
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      setCalculatedWeight(numValue)
      onWeightChange(numValue)
    }
  }
  
  // Manejar cambio de fatiga
  const handleFatigueChange = (value: number[]) => {
    setLocalFatigue(value[0])
  }
  
  // Incrementar peso
  const incrementWeight = () => {
    const newWeight = Math.round((calculatedWeight + 2.5) * 100) / 100
    setCalculatedWeight(newWeight)
    setManualWeight(newWeight.toString())
    onWeightChange(newWeight)
  }
  
  // Decrementar peso
  const decrementWeight = () => {
    if (calculatedWeight > 2.5) {
      const newWeight = Math.round((calculatedWeight - 2.5) * 100) / 100
      setCalculatedWeight(newWeight)
      setManualWeight(newWeight.toString())
      onWeightChange(newWeight)
    }
  }
  
  // Obtener color según la fatiga
  const getFatigueColor = (fatigue: number) => {
    if (fatigue < 30) return "text-green-500"
    if (fatigue < 60) return "text-yellow-500"
    if (fatigue < 80) return "text-orange-500"
    return "text-red-500"
  }
  
  // Obtener texto según la fatiga
  const getFatigueText = (fatigue: number) => {
    if (fatigue < 30) return "Baja"
    if (fatigue < 60) return "Moderada"
    if (fatigue < 80) return "Alta"
    return "Muy alta"
  }
  
  // Calcular diferencia de peso
  const weightDifference = calculatedWeight - previousWeight
  
  return (
    <div className={className}>
      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Calculadora de peso para {exerciseName}</Card3DTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button3D 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowInfo(true)}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button3D>
              </TooltipTrigger>
              <TooltipContent>
                <p>Información sobre el cálculo de peso</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Card3DHeader>
        <Card3DContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Peso recomendado</h3>
                <p className="text-sm text-gray-500">
                  Basado en RIR y fatiga acumulada
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button3D 
                  variant="outline" 
                  size="icon"
                  onClick={decrementWeight}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button3D>
                <div className="w-20">
                  <Input
                    type="number"
                    value={manualWeight}
                    onChange={handleManualWeightChange}
                    className="text-center"
                  />
                </div>
                <Button3D 
                  variant="outline" 
                  size="icon"
                  onClick={incrementWeight}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button3D>
              </div>
            </div>
            
            {previousWeight > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span>Peso anterior: {previousWeight} kg</span>
                <span className={
                  weightDifference > 0 
                    ? "text-green-500" 
                    : weightDifference < 0 
                      ? "text-red-500" 
                      : "text-gray-500"
                }>
                  {weightDifference > 0 && "+"}
                  {weightDifference.toFixed(2)} kg
                </span>
              </div>
            )}
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Fatiga acumulada</h4>
                <Badge className={`${getFatigueColor(localFatigue)}`}>
                  {getFatigueText(localFatigue)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Baja</span>
                  <span>Alta</span>
                </div>
                <Slider
                  value={[localFatigue]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={handleFatigueChange}
                />
              </div>
              <p className="text-xs text-gray-500">
                La fatiga afecta a tu rendimiento. Ajusta según cómo te sientas hoy.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md">
              <div className="flex items-center">
                <Brain className="h-5 w-5 text-blue-500 mr-2" />
                <h4 className="font-medium text-blue-700 dark:text-blue-400">Recomendación IA</h4>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                {localFatigue > 70 ? (
                  "Tu fatiga es alta. Considera reducir el peso para mantener la técnica adecuada."
                ) : weightDifference > 5 ? (
                  "El aumento de peso es significativo. Considera un incremento más gradual."
                ) : weightDifference < -5 ? (
                  "La reducción de peso es significativa. Asegúrate de que no estás subestimando tu capacidad."
                ) : (
                  "El peso recomendado parece adecuado para tu objetivo de RIR y nivel de fatiga actual."
                )}
              </p>
            </div>
          </div>
        </Card3DContent>
      </Card3D>
      
      {/* Modal de información */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cálculo de peso recomendado</DialogTitle>
            <DialogDescription>
              Cómo calculamos el peso ideal para tus series
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nuestro algoritmo calcula el peso óptimo basándose en varios factores:
            </p>
            
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md">
                <div className="flex items-center">
                  <Dumbbell className="h-5 w-5 text-blue-500 mr-2" />
                  <h4 className="font-medium text-blue-700 dark:text-blue-400">Historial de peso</h4>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  Utilizamos tu peso anterior ({previousWeight} kg) como punto de partida.
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-md">
                <div className="flex items-center">
                  <Calculator className="h-5 w-5 text-purple-500 mr-2" />
                  <h4 className="font-medium text-purple-700 dark:text-purple-400">Ajuste por RIR</h4>
                </div>
                <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                  Comparamos tu RIR anterior ({previousRir}) con tu objetivo actual ({targetRir}) 
                  y ajustamos el peso aproximadamente un 3.5% por cada punto de diferencia.
                </p>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-md">
                <div className="flex items-center">
                  <Flame className="h-5 w-5 text-orange-500 mr-2" />
                  <h4 className="font-medium text-orange-700 dark:text-orange-400">Ajuste por fatiga</h4>
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                  Reducimos el peso si tu fatiga es alta para mantener la técnica adecuada 
                  y prevenir lesiones.
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md">
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 text-green-500 mr-2" />
                  <h4 className="font-medium text-green-700 dark:text-green-400">Redondeo práctico</h4>
                </div>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                  Redondeamos el resultado a incrementos de 1.25 kg para que sea práctico 
                  en el gimnasio.
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recuerda que esta es una recomendación. Siempre debes ajustar el peso según 
              cómo te sientas durante el entrenamiento.
            </p>
          </div>
          
          <DialogFooter>
            <Button3D onClick={() => setShowInfo(false)}>
              Entendido
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
