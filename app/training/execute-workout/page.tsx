"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton as Button } from "@/components/ui/safe-client-button"
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
  AlertTriangle,
  ChevronLeft
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { WorkoutPlanVerification } from "@/components/training/workout-plan-verification"
import { useAuth } from "@/lib/contexts/auth-context"

interface WorkoutDay {
  id: string
  name: string
  exercises: any[]
  estimatedDuration: number
  difficulty: string
}

export default function ExecuteWorkoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([])
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showVerification, setShowVerification] = useState(false)

  const routineId = searchParams.get('routineId')

  useEffect(() => {
    const loadWorkoutDays = async () => {
      try {
        setIsLoading(true)

        // Mock data for workout days - replace with actual Supabase query
        const mockDays: WorkoutDay[] = [
          {
            id: "day-1",
            name: "Día 1 - Pecho y Tríceps",
            exercises: [
              { name: "Press de banca", sets: 4, reps: "8-10" },
              { name: "Press inclinado", sets: 3, reps: "10-12" },
              { name: "Fondos", sets: 3, reps: "12-15" },
              { name: "Press francés", sets: 3, reps: "10-12" }
            ],
            estimatedDuration: 60,
            difficulty: "Intermedio"
          },
          {
            id: "day-2",
            name: "Día 2 - Espalda y Bíceps",
            exercises: [
              { name: "Dominadas", sets: 4, reps: "6-8" },
              { name: "Remo con barra", sets: 4, reps: "8-10" },
              { name: "Curl con barra", sets: 3, reps: "10-12" },
              { name: "Curl martillo", sets: 3, reps: "12-15" }
            ],
            estimatedDuration: 65,
            difficulty: "Intermedio"
          },
          {
            id: "day-3",
            name: "Día 3 - Piernas",
            exercises: [
              { name: "Sentadillas", sets: 4, reps: "8-10" },
              { name: "Peso muerto", sets: 4, reps: "6-8" },
              { name: "Prensa", sets: 3, reps: "12-15" },
              { name: "Curl femoral", sets: 3, reps: "10-12" }
            ],
            estimatedDuration: 70,
            difficulty: "Avanzado"
          }
        ]

        setWorkoutDays(mockDays)

      } catch (error) {
        console.error("Error loading workout days:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los días de entrenamiento",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkoutDays()
  }, [routineId, toast])

  const handleStartWorkout = async () => {
    if (!selectedDay) {
      toast({
        title: "Selecciona un día",
        description: "Por favor selecciona un día de entrenamiento para continuar",
        variant: "destructive"
      })
      return
    }

    try {
      console.log("Iniciando entrenamiento para día:", selectedDay)

      // Navigate to the specific day execution page
      const url = `/training/execute-workout/${selectedDay}`
      console.log("Navegando a:", url)

      router.push(url)

      toast({
        title: "Iniciando entrenamiento",
        description: "Preparando tu sesión de entrenamiento...",
      })
    } catch (error) {
      console.error("Error al iniciar entrenamiento:", error)
      toast({
        title: "Error",
        description: "No se pudo iniciar el entrenamiento. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  const handlePlanChange = (planId: string) => {
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

  if (isLoading) {
    return (
      <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
            <p className="mt-4 text-[#573353]">Cargando entrenamiento...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm"
            onClick={() => router.push('/training')}
          >
            <ChevronLeft className="h-5 w-5 text-[#573353]" />
          </button>
          <h1 className="text-xl font-bold text-[#573353]">Ejecutar Entrenamiento</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Verification Component */}
        {showVerification && (
          <WorkoutPlanVerification
            currentDay={selectedDay || undefined}
            onPlanChange={handlePlanChange}
          />
        )}

        {/* Workout Days Selection */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-[#573353]">
              <Calendar className="h-5 w-5 mr-2" />
              Selecciona el día de entrenamiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workoutDays.map((day) => (
              <div
                key={day.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedDay === day.id
                    ? "border-[#1B237E] bg-[#1B237E]/5"
                    : "border-gray-200 hover:border-[#1B237E]/50"
                }`}
                onClick={() => setSelectedDay(day.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-[#573353]">{day.name}</h3>
                  <Badge variant="secondary">{day.difficulty}</Badge>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Dumbbell className="h-4 w-4 mr-1" />
                  <span>{day.exercises.length} ejercicios</span>
                  <Clock className="h-4 w-4 ml-4 mr-1" />
                  <span>{day.estimatedDuration} min</span>
                </div>

                <div className="text-xs text-gray-500">
                  {day.exercises.slice(0, 3).map((ex, idx) => ex.name).join(", ")}
                  {day.exercises.length > 3 && "..."}
                </div>
              </div>
            ))}

            <Separator className="my-4" />

            <div className="space-y-3">
              <Button
                className="w-full bg-[#1B237E] hover:bg-[#1B237E]/90 text-white"
                onClick={handleStartWorkout}
                disabled={!selectedDay}
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Entrenamiento
              </Button>

              {!showVerification ? (
                <Button
                  variant="outline"
                  className="w-full border-[#1B237E] text-[#1B237E] hover:bg-[#1B237E]/5"
                  onClick={() => setShowVerification(true)}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Verificar plan de entrenamiento
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full border-[#1B237E] text-[#1B237E] hover:bg-[#1B237E]/5"
                  onClick={() => setShowVerification(false)}
                >
                  Ocultar verificación
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
