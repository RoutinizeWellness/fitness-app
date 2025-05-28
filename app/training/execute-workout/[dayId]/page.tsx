"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton as Button } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  ChevronLeft,
  Play,
  Pause,
  Dumbbell,
  Clock,
  RotateCcw,
  Check,
  Info,
  AlertCircle,
  Camera,
  Brain,
  Target,
  TrendingUp,
  Activity,
  Eye,
  Zap,
  Timer,
  Plus,
  Minus
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/contexts/auth-context"
import { advancedTrainingSystem, WorkoutSession, ExerciseSet, AITrainingRecommendation } from "@/lib/training/advanced-training-system"
import { computerVisionSystem, ExerciseAnalysis } from "@/lib/admin/computer-vision-system"
import { supabase } from "@/lib/supabase-client"
interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipment: string
  instructions: string[]
  targetSets: number
  targetReps: string
  restTime: number
  difficulty: string
  videoUrl?: string
}

interface WorkoutDay {
  id: string
  name: string
  exercises: Exercise[]
  estimatedDuration: number
  difficulty: string
}

// Enhanced workout execution with real-time tracking
const mockExercises: Exercise[] = [
  {
    id: "ex-1",
    name: "Sentadilla",
    muscleGroup: "legs",
    equipment: "barbell",
    instructions: [
      "Coloca la barra sobre tus hombros",
      "Mantén los pies separados al ancho de hombros",
      "Desciende manteniendo la espalda recta",
      "Baja hasta que los muslos estén paralelos al suelo",
      "Empuja con los talones para subir"
    ],
    targetSets: 4,
    targetReps: "8-10",
    restTime: 180,
    difficulty: "intermediate",
    videoUrl: "/videos/squat.mp4"
  },
  {
    id: "ex-2",
    name: "Press de Banca",
    muscleGroup: "chest",
    equipment: "barbell",
    instructions: [
      "Acuéstate en el banco con los pies firmes en el suelo",
      "Agarra la barra con las manos separadas al ancho de hombros",
      "Baja la barra controladamente hasta el pecho",
      "Empuja la barra hacia arriba hasta extender los brazos"
    ],
    targetSets: 4,
    targetReps: "8-10",
    restTime: 180,
    difficulty: "intermediate"
  },
  {
    id: "ex-3",
    name: "Peso Muerto",
    muscleGroup: "back",
    equipment: "barbell",
    instructions: [
      "Coloca los pies debajo de la barra",
      "Agarra la barra con las manos separadas al ancho de hombros",
      "Mantén la espalda recta y el pecho hacia arriba",
      "Levanta la barra extendiendo las caderas y rodillas",
      "Baja controladamente hasta el suelo"
    ],
    targetSets: 3,
    targetReps: "6-8",
    restTime: 240,
    difficulty: "advanced"
  }
]

export default function EnhancedWorkoutExecutionPage({ params }: { params: { dayId: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  // Core state
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)

  // Exercise execution state
  const [weight, setWeight] = useState(0)
  const [reps, setReps] = useState(0)
  const [rir, setRir] = useState(2) // Reps in Reserve
  const [rpe, setRpe] = useState(7) // Rate of Perceived Exertion
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)

  // AI and Computer Vision state
  const [aiRecommendations, setAiRecommendations] = useState<AITrainingRecommendation[]>([])
  const [computerVisionEnabled, setComputerVisionEnabled] = useState(false)
  const [formAnalysis, setFormAnalysis] = useState<ExerciseAnalysis | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)

  // Progress tracking
  const [completedSets, setCompletedSets] = useState<{ [exerciseId: string]: ExerciseSet[] }>({})
  const [workoutProgress, setWorkoutProgress] = useState(0)

  const currentExercise = mockExercises[currentExerciseIndex]
  const totalSets = mockExercises.reduce((total, ex) => total + ex.targetSets, 0)
  const completedSetsCount = Object.values(completedSets).reduce((total, sets) => total + sets.length, 0)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    loadAIRecommendations()
  }, [user, router])

  // Rest timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false)
            toast({
              title: "¡Descanso terminado!",
              description: "Es hora de la siguiente serie",
            })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isResting, restTimer, toast])

  const loadAIRecommendations = async () => {
    try {
      if (!user) return

      const recommendations = await advancedTrainingSystem.generateExerciseRecommendations(
        user.id,
        { exercises: mockExercises }
      )
      setAiRecommendations(recommendations)
    } catch (error) {
      console.error('Error loading AI recommendations:', error)
    }
  }

  const startWorkout = async () => {
    try {
      if (!user) return

      const session = await advancedTrainingSystem.startWorkoutSession(
        user.id,
        `routine_${params.dayId}`
      )

      setCurrentSession(session)
      setIsWorkoutActive(true)
      setWorkoutStartTime(new Date())

      toast({
        title: "¡Entrenamiento iniciado!",
        description: "Comienza con el primer ejercicio",
      })
    } catch (error) {
      console.error('Error starting workout:', error)
      toast({
        title: "Error",
        description: "No se pudo iniciar el entrenamiento",
        variant: "destructive"
      })
    }
  }

  const completeSet = async () => {
    try {
      if (!currentSession || !currentExercise) return

      const setData: ExerciseSet = {
        setNumber: currentSetIndex + 1,
        weight,
        reps,
        rir,
        rpe,
        completed: true,
        timestamp: new Date()
      }

      // Update local state
      setCompletedSets(prev => ({
        ...prev,
        [currentExercise.id]: [...(prev[currentExercise.id] || []), setData]
      }))

      // Update session in backend
      await advancedTrainingSystem.updateSessionProgress(
        currentSession.id,
        currentExercise.id,
        setData
      )

      // Update progress
      const newProgress = ((completedSetsCount + 1) / totalSets) * 100
      setWorkoutProgress(newProgress)

      // Start rest timer
      setRestTimer(currentExercise.restTime)
      setIsResting(true)

      // Move to next set or exercise
      const exerciseSets = completedSets[currentExercise.id] || []
      if (exerciseSets.length + 1 >= currentExercise.targetSets) {
        // Move to next exercise
        if (currentExerciseIndex < mockExercises.length - 1) {
          setCurrentExerciseIndex(prev => prev + 1)
          setCurrentSetIndex(0)
        } else {
          // Workout complete
          await completeWorkout()
        }
      } else {
        // Next set of same exercise
        setCurrentSetIndex(prev => prev + 1)
      }

      toast({
        title: "Serie completada",
        description: `${reps} reps con ${weight}kg - RIR: ${rir}`,
      })
    } catch (error) {
      console.error('Error completing set:', error)
      toast({
        title: "Error",
        description: "No se pudo registrar la serie",
        variant: "destructive"
      })
    }
  }

  const completeWorkout = async () => {
    try {
      if (!currentSession) return

      await advancedTrainingSystem.completeWorkoutSession(
        currentSession.id,
        rpe,
        "Entrenamiento completado desde la app"
      )

      setIsWorkoutActive(false)
      setCurrentSession(null)

      toast({
        title: "¡Entrenamiento completado!",
        description: "Excelente trabajo. Datos guardados correctamente.",
      })

      // Navigate back to training dashboard
      router.push('/training')
    } catch (error) {
      console.error('Error completing workout:', error)
      toast({
        title: "Error",
        description: "Error al completar el entrenamiento",
        variant: "destructive"
      })
    }
  }

  const enableComputerVision = async () => {
    try {
      const initialized = await computerVisionSystem.initialize()
      if (initialized) {
        computerVisionSystem.setExerciseType(currentExercise.name.toLowerCase())

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        })
        setCameraStream(stream)
        setComputerVisionEnabled(true)

        toast({
          title: "Análisis de forma activado",
          description: "La IA analizará tu técnica en tiempo real",
        })
      }
    } catch (error) {
      console.error('Error enabling computer vision:', error)
      toast({
        title: "Error",
        description: "No se pudo activar el análisis de forma",
        variant: "destructive"
      })
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!user) {
    return (
      <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="mt-4 text-[#573353]">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100"
            onClick={() => router.push('/training')}
          >
            <ChevronLeft className="h-5 w-5 text-[#573353]" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-[#573353]">Entrenamiento</h1>
            <p className="text-sm text-gray-600">Día {params.dayId}</p>
          </div>
          <div className="w-10 h-10 flex items-center justify-center">
            {isWorkoutActive && (
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progreso</span>
            <span>{Math.round(workoutProgress)}%</span>
          </div>
          <Progress value={workoutProgress} className="h-2" />
        </div>

        {/* Workout Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-[#1B237E]">{completedSetsCount}</div>
            <div className="text-xs text-gray-600">Series</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#1B237E]">
              {workoutStartTime ? formatTime(Math.floor((Date.now() - workoutStartTime.getTime()) / 1000)) : "0:00"}
            </div>
            <div className="text-xs text-gray-600">Tiempo</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#1B237E]">{currentExerciseIndex + 1}/{mockExercises.length}</div>
            <div className="text-xs text-gray-600">Ejercicio</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {!isWorkoutActive ? (
          /* Pre-workout screen */
          <div className="space-y-6">
            {/* AI Recommendations */}
            {aiRecommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-[#1B237E]">
                    <Brain className="h-5 w-5 mr-2" />
                    Recomendaciones IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiRecommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{rec.message}</h4>
                        <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{rec.reasoning}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Exercise Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-[#1B237E]">
                  <Dumbbell className="h-5 w-5 mr-2" />
                  Ejercicios de Hoy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockExercises.map((exercise, index) => (
                  <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{exercise.name}</h4>
                      <p className="text-sm text-gray-600">{exercise.targetSets} series × {exercise.targetReps} reps</p>
                    </div>
                    <Badge variant="outline">{exercise.muscleGroup}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Start Workout Button */}
            <Button
              onClick={startWorkout}
              className="w-full h-14 bg-[#1B237E] hover:bg-[#1B237E]/90 text-white text-lg font-medium"
            >
              <Play className="h-6 w-6 mr-2" />
              Iniciar Entrenamiento
            </Button>
          </div>
        ) : (
          /* Active workout screen */
          <div className="space-y-6">
            {/* Current Exercise */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-[#1B237E]">{currentExercise.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Serie {currentSetIndex + 1} de {currentExercise.targetSets}
                    </p>
                  </div>
                  <Badge variant="outline">{currentExercise.muscleGroup}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Exercise Instructions */}
                <div>
                  <h4 className="font-medium mb-2">Instrucciones:</h4>
                  <ul className="space-y-1">
                    {currentExercise.instructions.map((instruction, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-4 h-4 bg-[#1B237E] text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Computer Vision Toggle */}
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="font-medium">Análisis de Forma IA</span>
                  </div>
                  <Switch
                    checked={computerVisionEnabled}
                    onCheckedChange={enableComputerVision}
                  />
                </div>

                {/* Form Analysis Results */}
                {formAnalysis && (
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Puntuación de Forma</span>
                      <Badge variant={formAnalysis.formScore > 80 ? 'default' : 'secondary'}>
                        {formAnalysis.formScore}/100
                      </Badge>
                    </div>
                    {formAnalysis.feedback.length > 0 && (
                      <div className="space-y-1">
                        {formAnalysis.feedback.slice(0, 2).map((feedback, index) => (
                          <p key={index} className="text-xs text-gray-600">• {feedback}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Set Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1B237E]">Registrar Serie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Weight Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Peso (kg)</label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWeight(Math.max(0, weight - 2.5))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="text-center"
                      step="2.5"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWeight(weight + 2.5)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Reps Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Repeticiones</label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReps(Math.max(0, reps - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(Number(e.target.value))}
                      className="text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReps(reps + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* RIR Slider */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    RIR (Reps en Reserva): {rir}
                  </label>
                  <Slider
                    value={[rir]}
                    onValueChange={(value) => setRir(value[0])}
                    max={5}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 (Fallo)</span>
                    <span>5 (Muy fácil)</span>
                  </div>
                </div>

                {/* RPE Slider */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    RPE (Esfuerzo Percibido): {rpe}
                  </label>
                  <Slider
                    value={[rpe]}
                    onValueChange={(value) => setRpe(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 (Muy fácil)</span>
                    <span>10 (Máximo)</span>
                  </div>
                </div>

                {/* Complete Set Button */}
                <Button
                  onClick={completeSet}
                  className="w-full h-12 bg-[#1B237E] hover:bg-[#1B237E]/90 text-white"
                  disabled={weight === 0 || reps === 0}
                >
                  <Check className="h-5 w-5 mr-2" />
                  Completar Serie
                </Button>
              </CardContent>
            </Card>

            {/* Rest Timer */}
            {isResting && (
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="text-center py-6">
                  <Timer className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <h3 className="font-bold text-lg text-orange-800">Descansando</h3>
                  <div className="text-3xl font-bold text-orange-600 my-2">
                    {formatTime(restTimer)}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsResting(false)
                      setRestTimer(0)
                    }}
                    className="mt-2"
                  >
                    Saltar Descanso
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Completed Sets */}
            {completedSets[currentExercise.id] && completedSets[currentExercise.id].length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1B237E]">Series Completadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {completedSets[currentExercise.id].map((set, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <span className="text-sm">Serie {set.setNumber}</span>
                        <span className="text-sm font-medium">
                          {set.weight}kg × {set.reps} reps (RIR: {set.rir})
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
