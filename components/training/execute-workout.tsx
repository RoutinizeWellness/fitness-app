"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Play,
  Calendar,
  Dumbbell,
  Clock,
  ChevronRight,
  BarChart,
  Activity,
  AlertTriangle
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { WorkoutPlanVerification } from "@/components/training/workout-plan-verification"
import { useAuth } from "@/lib/contexts/auth-context"

// Datos simulados para los días de entrenamiento
const workoutDays = [
  {
    id: "day-1",
    name: "Lunes: Piernas",
    description: "Entrenamiento enfocado en piernas con énfasis en cuádriceps y glúteos",
    muscleGroups: ["Piernas", "Glúteos"],
    exerciseCount: 5,
    duration: "60-75 min",
    difficulty: "Intermedio"
  },
  {
    id: "day-2",
    name: "Martes: Pecho y Espalda",
    description: "Entrenamiento de empuje y tracción para el tren superior",
    muscleGroups: ["Pecho", "Espalda"],
    exerciseCount: 6,
    duration: "70-80 min",
    difficulty: "Avanzado"
  },
  {
    id: "day-3",
    name: "Jueves: Hombros y Brazos",
    description: "Entrenamiento de hombros, bíceps y tríceps",
    muscleGroups: ["Hombros", "Brazos"],
    exerciseCount: 5,
    duration: "50-60 min",
    difficulty: "Intermedio"
  },
  {
    id: "day-4",
    name: "Viernes: Piernas",
    description: "Segundo entrenamiento de piernas con énfasis en isquiotibiales y glúteos",
    muscleGroups: ["Piernas"],
    exerciseCount: 4,
    duration: "55-65 min",
    difficulty: "Intermedio"
  }
]

interface ExecuteWorkoutProps {
  userId: string | null
  setActiveTab?: (tab: string) => void
}

export function ExecuteWorkout({ userId, setActiveTab }: ExecuteWorkoutProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showVerification, setShowVerification] = useState(true)

  useEffect(() => {
    // Simular carga de datos
    const loadData = async () => {
      setIsLoading(true)
      // En un entorno real, aquí cargaríamos los datos de Supabase
      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    }

    loadData()
  }, [userId])

  // Manejar la selección de un día
  const handleSelectDay = (dayId: string) => {
    setSelectedDay(dayId)
  }

  // Iniciar el entrenamiento seleccionado
  const handleStartWorkout = () => {
    if (!selectedDay) {
      toast({
        title: "Selecciona un día",
        description: "Por favor, selecciona un día de entrenamiento para continuar.",
        variant: "destructive"
      })
      return
    }

    try {
      console.log("Iniciando entrenamiento para día:", selectedDay);

      // Usar una navegación directa para evitar problemas
      const url = `/training/execute-workout/${selectedDay}`;
      console.log("Navegando a:", url);

      // Usar el método push básico para mayor compatibilidad
      router.push(url);

      // Mostrar feedback al usuario
      toast({
        title: "Iniciando entrenamiento",
        description: "Preparando tu sesión de entrenamiento...",
      })
    } catch (error) {
      console.error("Error al iniciar entrenamiento:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el entrenamiento. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }

  // Manejar el cambio de plan
  const handlePlanChange = (planId: string) => {
    // Recargar los datos después de cambiar el plan
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setShowVerification(false)
      toast({
        title: "Plan actualizado",
        description: "Se ha actualizado tu plan de entrenamiento",
        variant: "default"
      })
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* Componente de verificación de plan */}
      {showVerification && (
        <WorkoutPlanVerification
          currentDay={selectedDay || undefined}
          onPlanChange={handlePlanChange}
        />
      )}

      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Ejecutar entrenamiento</h3>
              <p className="text-sm text-muted-foreground">
                Selecciona un día de tu plan de entrenamiento para comenzar
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            {workoutDays.map(day => (
              <div
                key={day.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedDay === day.id
                    ? 'border-primary border-2'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleSelectDay(day.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{day.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{day.description}</p>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {day.muscleGroups.map(group => (
                        <Badge key={group} variant="outline" className="text-xs">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedDay === day.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Dumbbell className="h-3.5 w-3.5 mr-1" />
                    <span>{day.exerciseCount} ejercicios</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{day.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={
                      day.difficulty === "Principiante" ? "secondary" :
                      day.difficulty === "Intermedio" ? "default" :
                      "destructive"
                    } className="text-[10px] h-5">
                      {day.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <Button
              className="w-full"
              onClick={handleStartWorkout}
              disabled={!selectedDay}
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Entrenamiento
            </Button>

            {!showVerification ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowVerification(true)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Verificar plan de entrenamiento
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowVerification(false)}
              >
                Ocultar verificación
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Estadísticas de entrenamiento</h3>
              <p className="text-sm text-muted-foreground">
                Resumen de tu actividad reciente
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <BarChart className="h-4 w-4 mr-1" />
                <span>Entrenamientos</span>
              </div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground">Últimos 30 días</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4 mr-1" />
                <span>Tiempo total</span>
              </div>
              <p className="text-2xl font-bold">8.5h</p>
              <p className="text-xs text-muted-foreground">Últimos 30 días</p>
            </div>
          </div>

          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (setActiveTab) {
                  setActiveTab('progress')
                } else {
                  router.push('/training?tab=progress')
                }
              }}
            >
              <BarChart className="h-4 w-4 mr-2" />
              Ver progreso detallado
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
