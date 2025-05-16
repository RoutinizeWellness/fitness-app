"use client"

import { useState, useEffect } from "react"
import { Card3D } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { 
  Dumbbell, 
  TrendingUp, 
  TrendingDown, 
  Zap,
  Info
} from "lucide-react"
import { calculateIdealWeight, getUserFatigue } from "@/lib/adaptive-learning-service"
import { WorkoutLog } from "@/lib/types/training"

interface WeightRecommendationChartProps {
  userId: string
  exerciseId: string
  exerciseName: string
  workoutLogs: WorkoutLog[]
  currentWeight?: number
  targetReps?: number
  targetRir?: number
  onWeightSelect?: (weight: number) => void
}

export function WeightRecommendationChart({
  userId,
  exerciseId,
  exerciseName,
  workoutLogs,
  currentWeight,
  targetReps = 8,
  targetRir = 2,
  onWeightSelect
}: WeightRecommendationChartProps) {
  const [recommendedWeight, setRecommendedWeight] = useState<number | null>(null)
  const [weightHistory, setWeightHistory] = useState<{date: string, weight: number}[]>([])
  const [userFatigue, setUserFatigue] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null)

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      if (!userId || !exerciseId) {
        setIsLoading(false)
        return
      }

      try {
        // Obtener fatiga del usuario
        const fatigue = await getUserFatigue(userId)
        if (fatigue) {
          setUserFatigue(fatigue.currentFatigue)
        }

        // Calcular peso recomendado
        const weight = await calculateIdealWeight(
          userId,
          exerciseId,
          targetReps,
          targetRir
        )
        setRecommendedWeight(weight)

        // Extraer historial de pesos de los logs
        const history: {date: string, weight: number}[] = []
        
        // Ordenar logs por fecha (más reciente primero)
        const sortedLogs = [...workoutLogs].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        
        // Extraer pesos para este ejercicio
        sortedLogs.forEach(log => {
          const exerciseSets = log.completedSets?.filter(set => 
            set.exerciseId === exerciseId && set.completedWeight
          )
          
          if (exerciseSets && exerciseSets.length > 0) {
            // Calcular peso promedio usado en este entrenamiento
            const totalWeight = exerciseSets.reduce((sum, set) => sum + (set.completedWeight || 0), 0)
            const avgWeight = totalWeight / exerciseSets.length
            
            history.push({
              date: log.date,
              weight: avgWeight
            })
          }
        })
        
        // Limitar a los últimos 5 entrenamientos
        setWeightHistory(history.slice(0, 5).reverse())
        
        // Establecer peso seleccionado
        if (weight) {
          setSelectedWeight(weight)
        } else if (currentWeight) {
          setSelectedWeight(currentWeight)
        } else if (history.length > 0) {
          setSelectedWeight(history[history.length - 1].weight)
        }
      } catch (error) {
        console.error("Error al cargar datos de recomendación:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId, exerciseId, targetReps, targetRir, workoutLogs, currentWeight])

  // Generar opciones de peso
  const generateWeightOptions = () => {
    if (!selectedWeight) return []
    
    const baseWeight = Math.round(selectedWeight / 2.5) * 2.5
    const options: number[] = []
    
    // Generar 5 opciones (2 por debajo, el peso base, 2 por encima)
    for (let i = -2; i <= 2; i++) {
      options.push(baseWeight + (i * 2.5))
    }
    
    return options
  }

  // Seleccionar un peso
  const handleSelectWeight = (weight: number) => {
    setSelectedWeight(weight)
    if (onWeightSelect) {
      onWeightSelect(weight)
    }
  }

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card3D className="p-4">
        <div className="flex items-center space-x-2">
          <Dumbbell className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="font-semibold">Calculando recomendación...</h3>
        </div>
        <div className="mt-4 flex justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      </Card3D>
    )
  }

  return (
    <Card3D className="p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Dumbbell className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Recomendación de peso: {exerciseName}</h3>
      </div>
      
      {/* Historial de pesos */}
      {weightHistory.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Historial de pesos</h4>
          <div className="h-40 flex items-end justify-between">
            {weightHistory.map((entry, index) => {
              // Calcular altura de la barra según el peso
              const maxWeight = Math.max(...weightHistory.map(e => e.weight))
              const minWeight = Math.min(...weightHistory.map(e => e.weight))
              const range = maxWeight - minWeight || 1
              const height = ((entry.weight - minWeight) / range) * 100 + 20
              
              // Formatear fecha
              const date = new Date(entry.date)
              const formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">{entry.weight} kg</div>
                  <div
                    className="bg-blue-500 rounded-t-md w-10"
                    style={{ height: `${height}px` }}
                  ></div>
                  <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Recomendación de peso */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">Peso recomendado</h4>
          <Badge variant="outline">
            {targetReps} reps · RIR {targetRir}
          </Badge>
        </div>
        
        {recommendedWeight ? (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start">
              <Zap className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <div className="flex items-center">
                  <p className="text-lg font-bold text-blue-700">{recommendedWeight} kg</p>
                  {currentWeight && recommendedWeight !== currentWeight && (
                    <Badge 
                      variant={recommendedWeight > currentWeight ? "success" : "destructive"}
                      className="ml-2"
                    >
                      {recommendedWeight > currentWeight ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {recommendedWeight > currentWeight 
                        ? `+${(recommendedWeight - currentWeight).toFixed(1)}` 
                        : `${(recommendedWeight - currentWeight).toFixed(1)}`} kg
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Basado en tu historial y nivel de fatiga actual ({userFatigue !== null ? `${Math.round(userFatigue)}%` : 'desconocido'})
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Sin datos suficientes</p>
                <p className="text-xs text-gray-600">
                  No hay suficientes datos para calcular una recomendación personalizada.
                  Continúa registrando tus entrenamientos para obtener recomendaciones más precisas.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Selector de peso */}
      <div>
        <h4 className="text-sm font-medium mb-2">Seleccionar peso</h4>
        <div className="grid grid-cols-5 gap-2">
          {generateWeightOptions().map((weight, index) => (
            <Button3D
              key={index}
              variant={selectedWeight === weight ? "default" : "outline"}
              onClick={() => handleSelectWeight(weight)}
              className="h-10"
            >
              {weight} kg
            </Button3D>
          ))}
        </div>
      </div>
    </Card3D>
  )
}
