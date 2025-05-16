"use client"

import { useState, useEffect } from "react"
import { Card3D } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress } from "@/components/ui/progress"
import {
  Battery,
  BatteryCharging,
  BatteryWarning,
  Calendar,
  ArrowUp,
  ArrowDown,
  Clock,
  BarChart
} from "lucide-react"
import {
  getUserFatigue,
  updateFatigueAfterRest,
  analyzeMuscleGroupFatigue,
  UserFatigue
} from "@/lib/adaptive-learning-service"
import { WorkoutLog } from "@/lib/types/training"
import { useToast } from "@/components/ui/use-toast"

interface FatigueAnalysisProps {
  userId: string
  workoutLogs: WorkoutLog[]
}

export function FatigueAnalysis({
  userId,
  workoutLogs
}: FatigueAnalysisProps) {
  const [fatigue, setFatigue] = useState<UserFatigue | null>(null)
  const [fatigueHistory, setFatigueHistory] = useState<any[]>([])
  const [muscleGroupFatigue, setMuscleGroupFatigue] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null)
  const { toast } = useToast()

  // Cargar datos de fatiga
  useEffect(() => {
    const loadFatigueData = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        // Obtener datos de fatiga actual
        const fatigueData = await getUserFatigue(userId)
        setFatigue(fatigueData)

        // Analizar fatiga por grupo muscular
        const muscleGroupFatigueData = await analyzeMuscleGroupFatigue(userId, workoutLogs)
        setMuscleGroupFatigue(muscleGroupFatigueData)

        // Generar historial simulado para demostración
        // En una implementación real, esto vendría de la base de datos
        const now = new Date()
        const history = []

        for (let i = 6; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)

          // Encontrar entrenamientos de ese día
          const dayWorkouts = workoutLogs.filter(log => {
            const logDate = new Date(log.date)
            return logDate.toDateString() === date.toDateString()
          })

          // Calcular fatiga basada en entrenamientos
          const workoutCount = dayWorkouts.length
          const baselineFatigue = fatigueData?.baselineFatigue || 20
          const recoveryRate = fatigueData?.recoveryRate || 5

          // Simular fatiga: aumenta con entrenamientos, disminuye en días de descanso
          let simulatedFatigue

          if (workoutCount > 0) {
            // Día de entrenamiento: aumenta fatiga
            simulatedFatigue = Math.min(100, baselineFatigue + workoutCount * 15)
          } else {
            // Día de descanso: disminuye fatiga
            const previousDay = history[history.length - 1]
            const previousFatigue = previousDay ? previousDay.fatigue : baselineFatigue
            simulatedFatigue = Math.max(baselineFatigue, previousFatigue - recoveryRate)
          }

          history.push({
            date: date.toISOString().split('T')[0],
            fatigue: simulatedFatigue,
            workouts: workoutCount
          })
        }

        setFatigueHistory(history)
      } catch (error) {
        console.error("Error al cargar datos de fatiga:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de fatiga",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadFatigueData()
  }, [userId, workoutLogs, toast])

  // Simular un día de descanso
  const handleSimulateRest = async () => {
    if (!userId || !fatigue) return

    try {
      const updatedFatigue = await updateFatigueAfterRest(userId)

      if (updatedFatigue) {
        setFatigue(updatedFatigue)
        toast({
          title: "Simulación completada",
          description: "Se ha simulado un día de descanso"
        })
      }
    } catch (error) {
      console.error("Error al simular descanso:", error)
      toast({
        title: "Error",
        description: "No se pudo simular el día de descanso",
        variant: "destructive"
      })
    }
  }

  // Obtener el icono de batería según el nivel de fatiga
  const getFatigueIcon = (fatigueLevel: number) => {
    if (fatigueLevel > 70) {
      return <BatteryWarning className="h-5 w-5 text-red-500" />
    } else if (fatigueLevel > 40) {
      return <Battery className="h-5 w-5 text-amber-500" />
    } else {
      return <BatteryCharging className="h-5 w-5 text-green-500" />
    }
  }

  // Obtener el color de la barra de progreso según el nivel de fatiga
  const getFatigueProgressColor = (fatigueLevel: number) => {
    if (fatigueLevel > 70) {
      return "bg-red-500"
    } else if (fatigueLevel > 40) {
      return "bg-amber-500"
    } else {
      return "bg-green-500"
    }
  }

  // Obtener el mensaje según el nivel de fatiga
  const getFatigueMessage = (fatigueLevel: number) => {
    if (fatigueLevel > 80) {
      return "Fatiga muy alta. Considera tomar un día de descanso o hacer un entrenamiento ligero de recuperación."
    } else if (fatigueLevel > 60) {
      return "Fatiga alta. Reduce el volumen y la intensidad del entrenamiento de hoy."
    } else if (fatigueLevel > 40) {
      return "Fatiga moderada. Entrena con normalidad pero escucha a tu cuerpo."
    } else if (fatigueLevel > 20) {
      return "Fatiga baja. Buen momento para un entrenamiento productivo."
    } else {
      return "Fatiga muy baja. Aprovecha para un entrenamiento intenso o de alto volumen."
    }
  }

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card3D className="p-4">
        <div className="flex items-center space-x-2">
          <Battery className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="font-semibold">Analizando fatiga...</h3>
        </div>
        <div className="mt-4 flex justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      </Card3D>
    )
  }

  // Si no hay datos
  if (!fatigue) {
    return (
      <Card3D className="p-4">
        <div className="flex items-center space-x-2">
          <Battery className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Análisis de fatiga</h3>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          No hay datos de fatiga disponibles. Completa algunos entrenamientos para comenzar el seguimiento.
        </p>
      </Card3D>
    )
  }

  return (
    <Card3D className="p-4">
      <div className="flex items-center space-x-2 mb-4">
        {getFatigueIcon(fatigue.currentFatigue)}
        <h3 className="font-semibold">Análisis de fatiga y recuperación</h3>
      </div>

      {/* Nivel de fatiga actual */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Nivel de fatiga actual</span>
          <span className="text-sm text-gray-500">{Math.round(fatigue.currentFatigue)}%</span>
        </div>
        <Progress
          value={fatigue.currentFatigue}
          className={`h-2 ${getFatigueProgressColor(fatigue.currentFatigue)}`}
        />
        <p className="mt-1 text-xs text-gray-500">{getFatigueMessage(fatigue.currentFatigue)}</p>
      </div>

      {/* Historial de fatiga */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Historial de fatiga (últimos 7 días)</h4>
        <div className="h-40 flex items-end justify-between">
          {fatigueHistory.map((day, index) => {
            // Calcular altura de la barra según la fatiga
            const height = (day.fatigue / 100) * 120

            // Determinar color según nivel de fatiga
            let barColor
            if (day.fatigue > 70) barColor = "bg-red-500"
            else if (day.fatigue > 40) barColor = "bg-amber-500"
            else barColor = "bg-green-500"

            // Formatear fecha
            const date = new Date(day.date)
            const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' })

            return (
              <div key={day.date} className="flex flex-col items-center">
                <div className="relative">
                  <div
                    className={`${barColor} rounded-t-md w-8`}
                    style={{ height: `${height}px` }}
                  ></div>

                  {/* Indicador de entrenamiento */}
                  {day.workouts > 0 && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                      {day.workouts}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{dayName}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Métricas de recuperación */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 rounded-md p-3">
          <div className="flex items-center space-x-1 mb-1">
            <BatteryCharging className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium">Tasa de recuperación</span>
          </div>
          <p className="text-sm font-semibold">{fatigue.recoveryRate} puntos/día</p>
        </div>

        <div className="bg-green-50 rounded-md p-3">
          <div className="flex items-center space-x-1 mb-1">
            <Battery className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium">Fatiga base</span>
          </div>
          <p className="text-sm font-semibold">{fatigue.baselineFatigue}%</p>
        </div>
      </div>

      {/* Fatiga por grupo muscular */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Fatiga por grupo muscular</h4>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(muscleGroupFatigue).map(([group, value]) => {
            // Determinar color según nivel de fatiga
            let bgColor = "bg-green-100"
            let textColor = "text-green-700"
            let progressColor = "bg-green-500"

            if (value > 70) {
              bgColor = "bg-red-100"
              textColor = "text-red-700"
              progressColor = "bg-red-500"
            } else if (value > 40) {
              bgColor = "bg-amber-100"
              textColor = "text-amber-700"
              progressColor = "bg-amber-500"
            }

            // Traducir nombres de grupos musculares
            const muscleGroupNames: Record<string, string> = {
              'chest': 'Pecho',
              'back': 'Espalda',
              'legs': 'Piernas',
              'shoulders': 'Hombros',
              'arms': 'Brazos',
              'core': 'Core'
            }

            const groupName = muscleGroupNames[group] || group

            return (
              <div
                key={group}
                className={`${bgColor} rounded-md p-2 cursor-pointer ${selectedMuscleGroup === group ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedMuscleGroup(selectedMuscleGroup === group ? null : group)}
              >
                <p className={`text-xs font-medium ${textColor} mb-1`}>{groupName}</p>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${progressColor} rounded-full`}
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
                <p className={`text-xs ${textColor} text-right mt-1`}>{Math.round(value)}%</p>
              </div>
            )
          })}
        </div>

        {selectedMuscleGroup && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <h5 className="text-xs font-medium mb-2">Recomendaciones para {
              {
                'chest': 'Pecho',
                'back': 'Espalda',
                'legs': 'Piernas',
                'shoulders': 'Hombros',
                'arms': 'Brazos',
                'core': 'Core'
              }[selectedMuscleGroup] || selectedMuscleGroup
            }</h5>

            {muscleGroupFatigue[selectedMuscleGroup] > 70 ? (
              <p className="text-xs text-gray-600">
                Fatiga alta. Considera descansar este grupo muscular durante 48-72 horas o realizar ejercicios de recuperación de baja intensidad.
              </p>
            ) : muscleGroupFatigue[selectedMuscleGroup] > 40 ? (
              <p className="text-xs text-gray-600">
                Fatiga moderada. Puedes entrenar este grupo muscular con intensidad moderada, pero mantén el volumen controlado.
              </p>
            ) : (
              <p className="text-xs text-gray-600">
                Fatiga baja. Buen momento para entrenar este grupo muscular con alta intensidad o volumen.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Recomendaciones */}
      <div className="mb-4 bg-gray-50 p-3 rounded-md">
        <h4 className="text-sm font-medium mb-2">Recomendaciones</h4>
        <ul className="space-y-2 text-xs text-gray-600">
          <li className="flex items-start">
            <div className="rounded-full bg-blue-100 p-1 mr-2 mt-0.5">
              <Clock className="h-3 w-3 text-blue-600" />
            </div>
            <span>Programa al menos 1-2 días de descanso completo cada semana</span>
          </li>
          <li className="flex items-start">
            <div className="rounded-full bg-green-100 p-1 mr-2 mt-0.5">
              <ArrowDown className="h-3 w-3 text-green-600" />
            </div>
            <span>Reduce la intensidad cuando la fatiga supere el 70%</span>
          </li>
          <li className="flex items-start">
            <div className="rounded-full bg-purple-100 p-1 mr-2 mt-0.5">
              <Calendar className="h-3 w-3 text-purple-600" />
            </div>
            <span>Programa una semana de descarga cada 4-6 semanas</span>
          </li>
        </ul>
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-2">
        <Button3D
          variant="outline"
          className="flex-1"
          onClick={handleSimulateRest}
        >
          <BatteryCharging className="h-4 w-4 mr-2" />
          Simular descanso
        </Button3D>

        <Button3D className="flex-1">
          <BarChart className="h-4 w-4 mr-2" />
          Ver análisis completo
        </Button3D>
      </div>
    </Card3D>
  )
}
