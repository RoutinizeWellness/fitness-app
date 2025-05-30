"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  Info,
  Pause,
  Play,
  SkipForward,
  ThumbsDown,
  ThumbsUp,
  Heart,
  X,
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { WorkoutRoutine, getWorkoutRoutineById } from "@/lib/workout-routines"
import { getExerciseById, addWorkout } from "@/lib/supabase-queries"
import { Exercise } from "@/lib/supabase"
import { useAuth } from "@/lib/auth/auth-context"

export default function WorkoutActivePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const routineId = searchParams.get("routineId")
  const { user } = useAuth()
  const { toast } = useToast()

  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null)
  const [exercises, setExercises] = useState<(Exercise & {
    sets: number;
    reps: string;
    weight?: string;
    rest: number;
    notes?: string;
    completedSets: number[];
  })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [isResting, setIsResting] = useState(false)
  const [restTime, setRestTime] = useState(60)
  const [isPaused, setIsPaused] = useState(false)
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)
  const [workoutDuration, setWorkoutDuration] = useState(0)
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [workoutNotes, setWorkoutNotes] = useState("")

  // Cargar la rutina y los ejercicios
  useEffect(() => {
    const loadRoutineAndExercises = async () => {
      setIsLoading(true)
      try {
        if (routineId) {
          // Cargar rutina desde Supabase
          const { data: routineData, error: routineError } = await getWorkoutRoutineById(routineId)

          if (routineError) {
            throw routineError
          }

          if (routineData) {
            setRoutine(routineData)

            // Cargar detalles de cada ejercicio
            const exercisesWithDetails = await Promise.all(
              routineData.exercises.map(async (exerciseItem) => {
                // Verificar que el ID del ejercicio sea válido
                if (!exerciseItem.exercise_id) {
                  console.warn('ID de ejercicio no válido o indefinido en la rutina');
                  // Crear un ejercicio por defecto
                  return {
                    id: 'default-exercise-' + Math.random().toString(36).substring(2, 9),
                    name: "Ejercicio genérico",
                    muscle_group: "General",
                    category: "Fuerza",
                    difficulty: "Intermedio",
                    equipment: "Peso corporal",
                    description: "Ejercicio de entrenamiento general",
                    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop',
                    instructions: "1. Prepárate en posición inicial\n2. Realiza el movimiento con control\n3. Vuelve a la posición inicial\n4. Repite el movimiento",
                    sets: exerciseItem.sets,
                    reps: exerciseItem.reps,
                    weight: exerciseItem.weight,
                    rest: exerciseItem.rest,
                    notes: exerciseItem.notes,
                    completedSets: []
                  };
                }

                const { data: exerciseData } = await getExerciseById(exerciseItem.exercise_id)
                return {
                  ...exerciseData,
                  sets: exerciseItem.sets,
                  reps: exerciseItem.reps,
                  weight: exerciseItem.weight,
                  rest: exerciseItem.rest,
                  notes: exerciseItem.notes,
                  completedSets: []
                }
              })
            )

            setExercises(exercisesWithDetails.filter(Boolean))
          }
        } else {
          // Si no hay rutina, usar ejercicios de ejemplo
          setExercises([
            {
              id: "1",
              name: "Press de Banca",
              muscle_group: "Pecho",
              difficulty: "Intermedio",
              equipment: "Barra y banco",
              description: "Ejercicio compuesto para desarrollar el pecho, hombros y tríceps",
              image_url: "/placeholder.svg",
              sets: 4,
              reps: "8-10",
              weight: "60 kg",
              rest: 90,
              completedSets: [],
              instructions: "1. Acuéstate en un banco plano con los pies apoyados en el suelo\n2. Agarra la barra con las manos un poco más separadas que el ancho de los hombros\n3. Baja la barra hasta que toque ligeramente tu pecho\n4. Empuja la barra hacia arriba hasta extender completamente los brazos\n5. Repite el movimiento manteniendo el control en todo momento"
            },
            {
              id: "2",
              name: "Remo con Barra",
              muscle_group: "Espalda",
              difficulty: "Intermedio",
              equipment: "Barra",
              description: "Ejercicio para desarrollar la espalda y los bíceps",
              image_url: "/placeholder.svg",
              sets: 3,
              reps: "10-12",
              weight: "50 kg",
              rest: 60,
              completedSets: [],
              instructions: "1. Inclínate hacia adelante con las rodillas ligeramente flexionadas\n2. Agarra la barra con las manos a la anchura de los hombros\n3. Tira de la barra hacia tu abdomen inferior\n4. Baja la barra con control\n5. Repite el movimiento manteniendo la espalda recta"
            },
            {
              id: "3",
              name: "Press de Hombros",
              muscle_group: "Hombros",
              difficulty: "Intermedio",
              equipment: "Barra o mancuernas",
              description: "Ejercicio para desarrollar los hombros",
              image_url: "/placeholder.svg",
              sets: 3,
              reps: "8-10",
              weight: "40 kg",
              rest: 90,
              completedSets: [],
              instructions: "1. Siéntate en un banco con respaldo vertical\n2. Sostén la barra a la altura de los hombros\n3. Empuja la barra hacia arriba hasta extender completamente los brazos\n4. Baja la barra con control hasta la posición inicial\n5. Repite el movimiento manteniendo la espalda recta"
            }
          ])
        }

        // Iniciar el temporizador del entrenamiento
        setWorkoutStartTime(new Date())

      } catch (error) {
        console.error("Error al cargar la rutina y ejercicios:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la rutina de entrenamiento",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadRoutineAndExercises()

    // Limpiar el temporizador al desmontar
    return () => {
      // Limpiar temporizadores si es necesario
    }
  }, [routineId, toast])

  // Actualizar la duración del entrenamiento
  useEffect(() => {
    if (!workoutStartTime) return

    const intervalId = setInterval(() => {
      const now = new Date()
      const durationInSeconds = Math.floor((now.getTime() - workoutStartTime.getTime()) / 1000)
      setWorkoutDuration(durationInSeconds)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [workoutStartTime])

  // Si está cargando, mostrar esqueleto
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-background border-b">
          <div className="container max-w-md mx-auto p-4 flex items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-4 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-1 w-full" />
        </header>

        <main className="flex-1 container max-w-md mx-auto p-4">
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </div>
    )
  }

  // Si no hay ejercicios, mostrar mensaje de error
  if (!exercises || exercises.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-background border-b">
          <div className="container max-w-md mx-auto p-4 flex items-center">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="ml-4">
              <h1 className="font-bold">Error</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 container max-w-md mx-auto p-4 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="bg-red-100 text-red-600 rounded-full p-4 mx-auto w-fit">
              <X className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold">No se encontraron ejercicios</h2>
            <p className="text-muted-foreground">No se pudieron cargar los ejercicios para esta rutina</p>
            <Button onClick={() => router.push("/")}>
              Volver al inicio
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Obtener el ejercicio actual y asegurarse de que tenga un nombre
  let currentExerciseData = exercises[currentExercise]

  // Depuración para ver los datos del ejercicio actual
  console.log("Datos del ejercicio actual:", currentExerciseData)

  // Si no hay nombre, usar datos de ejemplo
  if (!currentExerciseData?.name) {
    console.log("⚠️ Nombre de ejercicio no encontrado, usando datos de ejemplo")

    // Datos de ejemplo basados en el índice del ejercicio
    const exampleExercises = [
      {
        name: "Press de Banca",
        muscle_group: "Pecho",
        equipment: "Barra y banco",
        instructions: "1. Acuéstate en un banco plano con los pies apoyados en el suelo\n2. Agarra la barra con las manos un poco más separadas que el ancho de los hombros\n3. Baja la barra hasta que toque ligeramente tu pecho\n4. Empuja la barra hacia arriba hasta extender completamente los brazos\n5. Repite el movimiento manteniendo el control en todo momento"
      },
      {
        name: "Sentadilla",
        muscle_group: "Piernas",
        equipment: "Barra",
        instructions: "1. Coloca la barra en la parte superior de los trapecios\n2. Mantén la espalda recta y los pies separados al ancho de los hombros\n3. Flexiona las rodillas y baja hasta que los muslos estén paralelos al suelo\n4. Empuja a través de los talones para volver a la posición inicial\n5. Mantén la tensión en el core durante todo el movimiento"
      },
      {
        name: "Peso Muerto",
        muscle_group: "Espalda",
        equipment: "Barra",
        instructions: "1. Colócate frente a la barra con los pies separados al ancho de las caderas\n2. Flexiona las caderas y rodillas para agarrar la barra\n3. Mantén la espalda recta y levanta la barra extendiendo caderas y rodillas\n4. Baja la barra con control manteniendo la espalda recta\n5. Repite el movimiento manteniendo la tensión en el core"
      }
    ]

    // Usar el ejercicio de ejemplo correspondiente o el primero si no hay suficientes
    const exampleIndex = currentExercise % exampleExercises.length

    // Mantener los datos originales pero añadir los datos de ejemplo que faltan
    currentExerciseData = {
      ...currentExerciseData,
      name: exampleExercises[exampleIndex].name,
      muscle_group: currentExerciseData?.muscle_group || exampleExercises[exampleIndex].muscle_group,
      equipment: currentExerciseData?.equipment || exampleExercises[exampleIndex].equipment,
      instructions: currentExerciseData?.instructions || exampleExercises[exampleIndex].instructions
    }
  }

  const totalExercises = exercises.length
  const totalSets = currentExerciseData.sets
  const progress = (currentExercise / totalExercises) * 100 + (currentSet / totalSets) * (100 / totalExercises)

  // Formatear la duración del entrenamiento
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Algoritmo para calcular el peso recomendado basado en la fatiga acumulada
  const calculateRecommendedWeight = (baseWeight: number, exerciseIndex: number, currentSetIndex: number, totalSets: number) => {
    // Factores que afectan a la fatiga
    const exercisePositionFactor = 1 - (exerciseIndex * 0.05); // Reducción del 5% por cada ejercicio previo
    const setFatigueFactor = 1 - (currentSetIndex * 0.03); // Reducción del 3% por cada serie previa
    const workoutDurationFactor = workoutDuration > 1800 ? 0.95 : 1; // Reducción del 5% si el entrenamiento dura más de 30 minutos

    // Calcular el peso recomendado teniendo en cuenta todos los factores
    let recommendedWeight = baseWeight * exercisePositionFactor * setFatigueFactor * workoutDurationFactor;

    // Redondear al múltiplo de 2.5 más cercano (pesos estándar)
    recommendedWeight = Math.round(recommendedWeight / 2.5) * 2.5;

    return recommendedWeight;
  }

  const handleCompleteSet = () => {
    // Guardar el set completado
    const updatedExercises = [...exercises]
    updatedExercises[currentExercise].completedSets.push(currentSet)
    setExercises(updatedExercises)

    if (currentSet < totalSets) {
      // Pasar al siguiente set
      setIsResting(true)
      setRestTime(currentExerciseData.rest)
    } else {
      // Pasar al siguiente ejercicio
      if (currentExercise < totalExercises - 1) {
        setCurrentExercise(currentExercise + 1)
        setCurrentSet(1)
      } else {
        // Entrenamiento completo
        setIsCompleteDialogOpen(true)
      }
    }
  }

  const handleRestComplete = () => {
    setIsResting(false)
    setCurrentSet(currentSet + 1)
  }

  const handleSkipRest = () => {
    setIsResting(false)
    setCurrentSet(currentSet + 1)
  }

  const handleCompleteWorkout = async () => {
    try {
      // Calcular la duración total en minutos
      const durationMinutes = Math.ceil(workoutDuration / 60)

      // Crear el registro de entrenamiento
      const workout = {
        user_id: user.id,
        date: new Date().toISOString().split("T")[0],
        type: routine?.level === "beginner" ? "Principiante" : routine?.level === "advanced" ? "Avanzado" : "Intermedio",
        name: routine?.name || "Entrenamiento personalizado",
        sets: totalExercises.toString(),
        duration: `${durationMinutes} minutos`,
        notes: workoutNotes || `Ejercicios: ${exercises.map(e => e.name).join(", ")}`,
      }

      const { error } = await addWorkout(workout)

      if (error) {
        throw error
      }

      toast({
        title: "Entrenamiento completado",
        description: "El entrenamiento ha sido registrado correctamente",
      })

      // Calcular calorías estimadas basadas en la duración y tipo de entrenamiento
      const intensityFactor = workout.type === "Avanzado" ? 10 : workout.type === "Intermedio" ? 8.5 : 7;
      const estimatedCalories = Math.round(durationMinutes * intensityFactor);

      // Redirigir a la página de entrenamiento completado con parámetros
      router.push(`/workout-complete?exercises=${totalExercises}&duration=${durationMinutes} minutos&calories=${estimatedCalories}&name=${encodeURIComponent(workout.name)}&type=${encodeURIComponent(workout.type)}`);
    } catch (error) {
      console.error("Error al registrar el entrenamiento:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el entrenamiento",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative">
      {/* Phone mockup rotated in background */}
      <div className="w-[383.868px] h-[830.788px] transform rotate-[-45deg] absolute -top-[100px] -right-[100px] z-0 rounded-[35px] bg-[url('/images/phone-mockup-rotated.svg')] bg-no-repeat bg-cover opacity-10"></div>
      {/* Gradient background */}
      <div className="w-[414px] h-[692px] absolute bottom-0 left-0 z-0 bg-gradient-to-t from-[#FFF3E9] via-[rgba(255,243,233,0.5)] to-transparent"></div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-[#FFF3E9]">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm mr-3"
              onClick={() => router.push('/training')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="#573353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-xl font-bold text-[#573353]">
              Active Workout
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-[#F5F5F5] px-3 py-1.5 rounded-full">
              <span className="text-sm text-[#573353]/70">{formatDuration(workoutDuration)}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-[#F5F5F5]">
          <div className="h-full bg-[#FDA758]" style={{ width: `${progress}%` }}></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pt-20 pb-32 overflow-y-auto h-[calc(896px-80px)] relative z-10">
        {isResting ? (
          <div className="bg-white rounded-[24px] p-6 shadow-sm mb-6 text-center">
            <h2 className="text-xl font-bold text-[#573353] mb-2">Rest Time</h2>
            <div className="w-40 h-40 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold text-[#573353]">{restTime}s</span>
            </div>
            <p className="text-[#573353]/70 mb-4">Next: Set {currentSet + 1} of {totalSets}</p>

            <div className="flex justify-center space-x-4">
              <button
                className="bg-[#F5F5F5] text-[#573353] font-medium rounded-full px-4 py-2 text-sm"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>

              <button
                className="bg-[#FDA758] text-white font-medium rounded-full px-4 py-2 text-sm shadow-sm"
                onClick={handleSkipRest}
              >
                Skip
              </button>
            </div>

            <div className="mt-6">
              <h3 className="font-medium text-[#573353] mb-2">Next Exercise</h3>
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-[#FDA758] flex items-center justify-center mr-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.5 6.5L17.5 17.5M6.5 17.5L17.5 6.5M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[#573353] font-medium">{currentExerciseData.name}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Exercise Info */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full bg-[#FDA758] flex items-center justify-center mr-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.5 6.5L17.5 17.5M6.5 17.5L17.5 6.5M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-[#573353] font-semibold text-lg">{currentExerciseData.name}</h2>
                  <p className="text-[#573353]/70 text-sm">{currentExerciseData.muscle_group} • {currentExerciseData.equipment}</p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="bg-[#F5F5F5] px-3 py-1.5 rounded-full">
                  <span className="text-sm text-[#573353]/70">Set {currentSet} of {totalSets}</span>
                </div>

                <div className="bg-[#F5F5F5] px-3 py-1.5 rounded-full">
                  <span className="text-sm text-[#573353]/70">Exercise {currentExercise + 1} of {totalExercises}</span>
                </div>
              </div>

              {/* Exercise Image */}
              <div className="h-[200px] bg-[#F5F5F5] rounded-[16px] overflow-hidden mb-4 flex items-center justify-center">
                <img
                  src={currentExerciseData?.image_url || "/images/exercise-placeholder.svg"}
                  alt={currentExerciseData.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/exercise-placeholder.svg";
                  }}
                />
              </div>

              {/* Exercise Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-[#573353] font-medium mb-2">Instructions</h3>
                  <div className="bg-[#F5F5F5] rounded-[16px] p-4">
                    <ul className="space-y-2 text-[#573353]/70 text-sm">
                      {currentExerciseData?.instructions?.split('\n').map((line, index) => (
                        <li key={index} className="flex">
                          <span className="mr-2">{line.match(/^\d+\./) ? '' : '•'}</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-[#573353] font-medium mb-2">Current Set</h3>
                  <div className="bg-[#F5F5F5] rounded-[16px] p-4">
                    <div className="flex justify-between mb-3">
                      <div>
                        <p className="text-sm text-[#573353]/70">Weight</p>
                        <p className="text-[#573353] font-medium">{currentExerciseData?.weight || "Bodyweight"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#573353]/70">Reps</p>
                        <p className="text-[#573353] font-medium">{currentExerciseData?.reps}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#573353]/70">Rest</p>
                        <p className="text-[#573353] font-medium">{currentExerciseData?.rest}s</p>
                      </div>
                    </div>

                    <button
                      className="w-full py-3 rounded-full bg-[#FDA758] text-white font-medium text-sm flex items-center justify-center shadow-sm"
                      onClick={handleCompleteSet}
                    >
                      <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Complete Set
                    </button>
                  </div>
                </div>
              </div>

              {/* Next Exercise */}
              <div className="mt-6">
                <h3 className="text-[#573353] font-medium mb-2">Next Exercise</h3>
                <div className="bg-white rounded-[24px] p-5 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-[#8C80F8] flex items-center justify-center mr-3">
                      <span className="text-white font-medium">{currentExercise + 2}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#573353] font-semibold">
                        {currentExercise < totalExercises - 1 ? exercises[currentExercise + 1].name : "Workout Complete"}
                      </h3>
                      {currentExercise < totalExercises - 1 && (
                        <p className="text-[#573353]/70 text-sm">
                          {exercises[currentExercise + 1].sets} sets • {exercises[currentExercise + 1].reps} reps
                        </p>
                      )}
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 6L15 12L9 18" stroke="#573353" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Workout Complete Dialog */}
      <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center ${isCompleteDialogOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-[24px] w-[350px] p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#5DE292] flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#573353] mb-2">Workout Completed!</h2>
            <p className="text-[#573353]/70">Would you like to save this workout?</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="workout-notes" className="block text-sm font-medium text-[#573353] mb-2">Notes (optional)</label>
              <textarea
                id="workout-notes"
                className="w-full p-3 border border-gray-200 rounded-[16px] text-[#573353]"
                placeholder="Add notes about your workout..."
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                rows={3}
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F5F5F5] p-3 rounded-[16px] text-center">
                <p className="text-sm text-[#573353]/70">Duration</p>
                <p className="text-[#573353] font-medium">{formatDuration(workoutDuration)}</p>
              </div>
              <div className="bg-[#F5F5F5] p-3 rounded-[16px] text-center">
                <p className="text-sm text-[#573353]/70">Exercises</p>
                <p className="text-[#573353] font-medium">{totalExercises}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              className="flex-1 py-3 rounded-full border border-[#FDA758] text-[#FDA758] font-medium"
              onClick={() => router.push("/training")}
            >
              Discard
            </button>
            <button
              className="flex-1 py-3 rounded-full bg-[#FDA758] text-white font-medium shadow-sm"
              onClick={handleCompleteWorkout}
            >
              Save Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface RestTimerProps {
  time: number;
  onComplete: () => void;
  onSkip: () => void;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  currentExercise: any;
  currentSet: number;
  totalSets: number;
}

function RestTimer({
  time,
  onComplete,
  onSkip,
  isPaused,
  setIsPaused,
  currentExercise,
  currentSet,
  totalSets
}: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(time)
  const progress = (timeLeft / time) * 100;

  // Asegurarse de que el ejercicio tenga un nombre
  const exerciseData = currentExercise?.name ? currentExercise : {
    name: "Ejercicio Actual",
    muscle_group: currentExercise?.muscle_group || "Grupo muscular",
    equipment: currentExercise?.equipment || "Equipo"
  }

  // Temporizador de descanso
  useEffect(() => {
    if (isPaused) return

    if (timeLeft <= 0) {
      onComplete()
      return
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timerId)
  }, [timeLeft, isPaused, onComplete])

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm mb-6 text-center">
      <h2 className="text-xl font-bold text-[#573353] mb-2">Rest Time</h2>
      <div className="w-40 h-40 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-4 relative">
        <div className="absolute inset-0">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#F5F5F5"
              strokeWidth="12"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#FDA758"
              strokeWidth="12"
              strokeDasharray="439.8"
              strokeDashoffset={439.8 - (progress / 100) * 439.8}
              transform="rotate(-90 80 80)"
            />
          </svg>
        </div>
        <span className="text-4xl font-bold text-[#573353]">{timeLeft}s</span>
      </div>
      <p className="text-[#573353]/70 mb-4">Next: Set {currentSet + 1} of {totalSets}</p>

      <div className="flex justify-center space-x-4">
        <button
          className="bg-[#F5F5F5] text-[#573353] font-medium rounded-full px-4 py-2 text-sm"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        <button
          className="bg-[#FDA758] text-white font-medium rounded-full px-4 py-2 text-sm shadow-sm"
          onClick={onSkip}
        >
          Skip
        </button>
      </div>

      <div className="mt-6">
        <h3 className="font-medium text-[#573353] mb-2">Next Exercise</h3>
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#FDA758] flex items-center justify-center mr-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.5 6.5L17.5 17.5M6.5 17.5L17.5 6.5M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[#573353] font-medium">{exerciseData.name}</span>
        </div>
      </div>
    </div>
  )
}
