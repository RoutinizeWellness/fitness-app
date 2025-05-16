"use client"

import { useState } from "react"
import { 
  Dumbbell, 
  Minus, 
  Plus, 
  Info,
  HelpCircle,
  Check,
  X
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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

interface RirTrackingProps {
  exerciseName: string
  targetRir?: number
  currentRir?: number
  onRirChange: (rir: number) => void
  className?: string
}

export function RirTracking({
  exerciseName,
  targetRir = 2,
  currentRir,
  onRirChange,
  className
}: RirTrackingProps) {
  const [showRirInfo, setShowRirInfo] = useState(false)
  const [localRir, setLocalRir] = useState(currentRir !== undefined ? currentRir : targetRir)
  
  // Manejar cambio de RIR
  const handleRirChange = (value: number[]) => {
    const newRir = value[0]
    setLocalRir(newRir)
    onRirChange(newRir)
  }
  
  // Incrementar RIR
  const incrementRir = () => {
    if (localRir < 5) {
      const newRir = localRir + 1
      setLocalRir(newRir)
      onRirChange(newRir)
    }
  }
  
  // Decrementar RIR
  const decrementRir = () => {
    if (localRir > 0) {
      const newRir = localRir - 1
      setLocalRir(newRir)
      onRirChange(newRir)
    }
  }
  
  // Obtener color según el RIR
  const getRirColor = (rir: number) => {
    if (rir === 0) return "text-red-500"
    if (rir === 1) return "text-orange-500"
    if (rir === 2) return "text-yellow-500"
    if (rir === 3) return "text-green-500"
    if (rir >= 4) return "text-blue-500"
    return "text-gray-500"
  }
  
  // Obtener texto según el RIR
  const getRirText = (rir: number) => {
    if (rir === 0) return "Fallo muscular"
    if (rir === 1) return "Casi al fallo"
    if (rir === 2) return "Podría hacer 2 más"
    if (rir === 3) return "Podría hacer 3 más"
    if (rir === 4) return "Podría hacer 4 más"
    if (rir >= 5) return "Muchas reps en reserva"
    return "Desconocido"
  }
  
  // Obtener color de fondo según el RIR
  const getRirBackground = (rir: number) => {
    if (rir === 0) return "bg-red-50 dark:bg-red-950/30"
    if (rir === 1) return "bg-orange-50 dark:bg-orange-950/30"
    if (rir === 2) return "bg-yellow-50 dark:bg-yellow-950/30"
    if (rir === 3) return "bg-green-50 dark:bg-green-950/30"
    if (rir >= 4) return "bg-blue-50 dark:bg-blue-950/30"
    return "bg-gray-50 dark:bg-gray-900/30"
  }
  
  return (
    <div className={className}>
      <Card3D>
        <Card3DHeader>
          <Card3DTitle>RIR para {exerciseName}</Card3DTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button3D 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowRirInfo(true)}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button3D>
              </TooltipTrigger>
              <TooltipContent>
                <p>Información sobre RIR</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Card3DHeader>
        <Card3DContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Repeticiones en Reserva (RIR)</h3>
                <p className="text-sm text-gray-500">
                  Repeticiones que podrías hacer antes del fallo
                </p>
              </div>
              <div className={`${getRirBackground(localRir)} p-2 rounded-md`}>
                <span className={`text-lg font-bold ${getRirColor(localRir)}`}>
                  {localRir}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fallo</span>
                <span>Muchas en reserva</span>
              </div>
              <div className="flex items-center space-x-3">
                <Button3D 
                  variant="outline" 
                  size="icon"
                  onClick={decrementRir}
                  disabled={localRir <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button3D>
                <div className="flex-1">
                  <Slider
                    value={[localRir]}
                    min={0}
                    max={5}
                    step={1}
                    onValueChange={handleRirChange}
                  />
                </div>
                <Button3D 
                  variant="outline" 
                  size="icon"
                  onClick={incrementRir}
                  disabled={localRir >= 5}
                >
                  <Plus className="h-4 w-4" />
                </Button3D>
              </div>
            </div>
            
            <div className={`${getRirBackground(localRir)} p-3 rounded-md`}>
              <p className={`font-medium ${getRirColor(localRir)}`}>
                {getRirText(localRir)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {localRir === targetRir ? (
                  <span className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                    RIR objetivo alcanzado
                  </span>
                ) : localRir < targetRir ? (
                  <span className="flex items-center">
                    <X className="h-4 w-4 text-red-500 mr-1" />
                    Intensidad demasiado alta
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Info className="h-4 w-4 text-blue-500 mr-1" />
                    Podrías aumentar el peso
                  </span>
                )}
              </p>
            </div>
          </div>
        </Card3DContent>
      </Card3D>
      
      {/* Modal de información sobre RIR */}
      <Dialog open={showRirInfo} onOpenChange={setShowRirInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>¿Qué es el RIR?</DialogTitle>
            <DialogDescription>
              RIR significa "Repeticiones en Reserva" y es una forma de medir la intensidad de tu entrenamiento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              El RIR indica cuántas repeticiones podrías hacer antes de llegar al fallo muscular. 
              Es una herramienta útil para controlar la intensidad de tus entrenamientos y optimizar 
              tus resultados.
            </p>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="font-medium">Escala de RIR</h4>
              
              <div className="space-y-2">
                <div className="bg-red-50 dark:bg-red-950/30 p-2 rounded-md flex items-center">
                  <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    0
                  </div>
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-400">Fallo muscular</p>
                    <p className="text-xs text-red-600 dark:text-red-300">No puedes hacer ni una repetición más</p>
                  </div>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-950/30 p-2 rounded-md flex items-center">
                  <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-orange-700 dark:text-orange-400">Casi al fallo</p>
                    <p className="text-xs text-orange-600 dark:text-orange-300">Podrías hacer 1 repetición más</p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-950/30 p-2 rounded-md flex items-center">
                  <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-yellow-700 dark:text-yellow-400">Intensidad alta</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-300">Podrías hacer 2 repeticiones más</p>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded-md flex items-center">
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">Intensidad moderada</p>
                    <p className="text-xs text-green-600 dark:text-green-300">Podrías hacer 3 repeticiones más</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-md flex items-center">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    4+
                  </div>
                  <div>
                    <p className="font-medium text-blue-700 dark:text-blue-400">Intensidad baja</p>
                    <p className="text-xs text-blue-600 dark:text-blue-300">Podrías hacer 4 o más repeticiones</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium">Beneficios del RIR</h4>
              <ul className="space-y-1">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span className="text-sm">Control preciso de la intensidad</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span className="text-sm">Mejor gestión de la fatiga</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span className="text-sm">Optimización de la recuperación</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span className="text-sm">Progresión más consistente</span>
                </li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button3D onClick={() => setShowRirInfo(false)}>
              Entendido
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
