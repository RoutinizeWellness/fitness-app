"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  CheckCircle,
  Camera,
  Video,
  Clock,
  Dumbbell,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { WorkoutDay, WorkoutExercise } from "@/lib/workout-plan-generator"
import { saveWorkoutSession } from "@/lib/workout-tracking-service"
import { saveWorkoutLog } from "@/lib/workout-logs-service"
import { analyzeWorkoutVideo } from "@/lib/edge-functions-service"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface WorkoutExecutionProps {
  workoutDay: WorkoutDay
  onComplete: () => void
}

export default function WorkoutExecution({ workoutDay, onComplete }: WorkoutExecutionProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [restTime, setRestTime] = useState(90) // Tiempo de descanso en segundos
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [exerciseCompleted, setExerciseCompleted] = useState<boolean[]>([])
  const [weight, setWeight] = useState<number[]>([])
  const [reps, setReps] = useState<number[]>([])
  const [rir, setRir] = useState<number[]>([])
  const [cameraActive, setCameraActive] = useState(false)
  const [recording, setRecording] = useState(false)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [feedbackMode, setFeedbackMode] = useState(false)
  const [postureFeedback, setPostureFeedback] = useState<string | null>(null)

  const currentExercise = workoutDay.exercises[currentExerciseIndex]
  const totalExercises = workoutDay.exercises.length
  const totalSets = currentExercise?.sets || 0
  const progress = (currentExerciseIndex / totalExercises) * 100

  // Inicializar estados
  useEffect(() => {
    if (workoutDay.exercises.length > 0) {
      setExerciseCompleted(Array(workoutDay.exercises.length).fill(false))

      // Inicializar pesos, repeticiones y RIR para cada ejercicio
      const initialWeights = workoutDay.exercises.map(ex => ex.weight || 0)
      const initialReps = workoutDay.exercises.map(ex => Math.floor((ex.repsMin + ex.repsMax) / 2))
      const initialRir = workoutDay.exercises.map(ex => ex.rir || 2)

      setWeight(initialWeights)
      setReps(initialReps)
      setRir(initialRir)
    }
  }, [workoutDay])

  // Timer para el descanso
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0) {
      setTimerActive(false)

      // Reproducir sonido cuando termine el descanso
      const audio = new Audio('/sounds/timer-end.mp3')
      audio.play()
    }

    return () => clearInterval(interval)
  }, [timerActive, timeRemaining])

  // Iniciar descanso
  const startRest = () => {
    setTimeRemaining(restTime)
    setTimerActive(true)
  }

  // Pasar al siguiente set o ejercicio
  const nextSet = () => {
    if (currentSetIndex < totalSets - 1) {
      // Pasar al siguiente set
      setCurrentSetIndex(prev => prev + 1)
      startRest()
    } else {
      // Completar ejercicio y pasar al siguiente
      const updatedCompleted = [...exerciseCompleted]
      updatedCompleted[currentExerciseIndex] = true
      setExerciseCompleted(updatedCompleted)

      if (currentExerciseIndex < totalExercises - 1) {
        setCurrentExerciseIndex(prev => prev + 1)
        setCurrentSetIndex(0)
        startRest()
      } else {
        // Todos los ejercicios completados
        completeWorkout()
      }
    }
  }

  // Completar el entrenamiento
  const completeWorkout = async () => {
    if (!user) return

    try {
      // Preparar datos del entrenamiento para el servicio antiguo
      const sessionData = {
        userId: user.id,
        workoutDayId: workoutDay.id,
        date: new Date().toISOString(),
        exercises: workoutDay.exercises.map((exercise, index) => ({
          exerciseId: exercise.id,
          name: exercise.name,
          sets: Array(exercise.sets).fill(0).map((_, setIndex) => ({
            weight: weight[index],
            reps: reps[index],
            rir: rir[index]
          }))
        }))
      }

      // Guardar sesión de entrenamiento en el servicio antiguo
      await saveWorkoutSession(sessionData)

      // Preparar datos para el nuevo servicio workout_logs
      const muscleGroupFatigue: Record<string, number> = {}
      workoutDay.exercises.forEach((exercise, index) => {
        if (exercise.muscleGroup) {
          // Si ya existe el grupo muscular, tomar el valor máximo de fatiga
          const currentFatigue = muscleGroupFatigue[exercise.muscleGroup] || 0
          const exerciseFatigue = 10 - rir[index] // Convertir RIR a fatiga (0-10)
          muscleGroupFatigue[exercise.muscleGroup] = Math.max(currentFatigue, exerciseFatigue)
        }
      })

      // Calcular fatiga general como promedio de fatiga por grupo muscular
      const fatigueValues = Object.values(muscleGroupFatigue)
      const overallFatigue = fatigueValues.length > 0
        ? Math.round(fatigueValues.reduce((sum, value) => sum + value, 0) / fatigueValues.length)
        : 5

      // Determinar rendimiento basado en la fatiga general
      let performance: 'excellent' | 'good' | 'average' | 'poor' | 'very_poor'
      if (overallFatigue <= 2) performance = 'excellent'
      else if (overallFatigue <= 4) performance = 'good'
      else if (overallFatigue <= 6) performance = 'average'
      else if (overallFatigue <= 8) performance = 'poor'
      else performance = 'very_poor'

      // Guardar en workout_logs
      const logData = {
        userId: user.id,
        routineId: workoutDay.routineId,
        dayId: workoutDay.id,
        date: new Date().toISOString(),
        duration: 60, // Duración estimada en minutos
        notes: `Entrenamiento de ${workoutDay.name} completado`,
        overallFatigue,
        muscleGroupFatigue,
        performance
      }

      await saveWorkoutLog(logData)

      toast({
        title: "¡Entrenamiento completado!",
        description: "Tu sesión ha sido guardada correctamente."
      })

      onComplete()
    } catch (error) {
      console.error("Error al guardar la sesión de entrenamiento:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la sesión de entrenamiento.",
        variant: "destructive"
      })
    }
  }

  // Activar/desactivar cámara
  const toggleCamera = async () => {
    if (cameraActive) {
      // Detener cámara
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      setCameraActive(false)
      setRecording(false)
    } else {
      try {
        // Iniciar cámara
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        setCameraActive(true)
      } catch (error) {
        console.error("Error al acceder a la cámara:", error)
        toast({
          title: "Error",
          description: "No se pudo acceder a la cámara.",
          variant: "destructive"
        })
      }
    }
  }

  // Iniciar/detener grabación
  const toggleRecording = () => {
    if (recording) {
      // Detener grabación
      setRecording(false)
      // Aquí iría la lógica para detener la grabación y obtener el blob
    } else {
      // Iniciar grabación
      setRecording(true)
      // Aquí iría la lógica para iniciar la grabación
    }
  }

  // Analizar video
  const analyzeVideo = async () => {
    if (!videoBlob || !user) return

    try {
      setFeedbackMode(true)

      // Subir video a Supabase Storage
      const fileName = `${user.id}/${Date.now()}.webm`
      const { data, error } = await supabase.storage
        .from('user_videos')
        .upload(fileName, videoBlob)

      if (error) throw error

      // Obtener URL del video
      const { data: urlData } = supabase.storage
        .from('user_videos')
        .getPublicUrl(fileName)

      // Analizar video con Edge Function
      const { data: analysisData, error: analysisError } = await analyzeWorkoutVideo(
        user.id,
        urlData.publicUrl
      )

      if (analysisError) throw analysisError

      // Mostrar feedback
      setPostureFeedback(analysisData.feedback)
    } catch (error) {
      console.error("Error al analizar el video:", error)
      toast({
        title: "Error",
        description: "No se pudo analizar el video.",
        variant: "destructive"
      })
      setFeedbackMode(false)
    }
  }

  // Renderizar temporizador
  const renderTimer = () => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60

    return (
      <div className="text-center p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-medium mb-2">Tiempo de Descanso</h3>
        <div className="text-3xl font-bold mb-2">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
        <Progress value={(timeRemaining / restTime) * 100} className="mb-4" />
        <div className="flex justify-center space-x-2">
          <Button
            variant={timerActive ? "outline" : "default"}
            size="sm"
            onClick={() => setTimerActive(!timerActive)}
          >
            {timerActive ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            {timerActive ? "Pausar" : "Reanudar"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeRemaining(restTime)}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reiniciar
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setTimeRemaining(0)}
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Omitir
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Dumbbell className="h-5 w-5 mr-2 text-primary" />
            {workoutDay.name}
          </div>
          <Badge>
            {currentExerciseIndex + 1}/{totalExercises}
          </Badge>
        </CardTitle>
        <Progress value={progress} className="h-1" />
      </CardHeader>

      <CardContent className="space-y-4">
        {timerActive ? (
          renderTimer()
        ) : (
          <Tabs defaultValue="exercise">
            <TabsList className="mb-4">
              <TabsTrigger value="exercise">Ejercicio</TabsTrigger>
              <TabsTrigger value="camera" disabled={!cameraActive && !videoBlob}>Cámara</TabsTrigger>
              {feedbackMode && (
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="exercise" className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold">{currentExercise?.name}</h2>
                <p className="text-sm text-gray-500">{currentExercise?.muscleGroup}</p>

                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Serie:</span>
                    <span>{currentSetIndex + 1} de {totalSets}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Repeticiones:</span>
                    <span>{currentExercise?.repsMin}-{currentExercise?.repsMax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Descanso:</span>
                    <span>{currentExercise?.rest}s</span>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Peso (kg)</label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newWeights = [...weight]
                          newWeights[currentExerciseIndex] = Math.max(0, newWeights[currentExerciseIndex] - 2.5)
                          setWeight(newWeights)
                        }}
                      >
                        -
                      </Button>
                      <div className="flex-1 text-center font-bold">
                        {weight[currentExerciseIndex]}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newWeights = [...weight]
                          newWeights[currentExerciseIndex] += 2.5
                          setWeight(newWeights)
                        }}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Repeticiones</label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newReps = [...reps]
                          newReps[currentExerciseIndex] = Math.max(1, newReps[currentExerciseIndex] - 1)
                          setReps(newReps)
                        }}
                      >
                        -
                      </Button>
                      <div className="flex-1 text-center font-bold">
                        {reps[currentExerciseIndex]}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newReps = [...reps]
                          newReps[currentExerciseIndex] += 1
                          setReps(newReps)
                        }}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">RIR (Repeticiones en Reserva)</label>
                    <Slider
                      min={0}
                      max={5}
                      step={1}
                      value={[rir[currentExerciseIndex]]}
                      onValueChange={(value) => {
                        const newRir = [...rir]
                        newRir[currentExerciseIndex] = value[0]
                        setRir(newRir)
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0 (Fallo)</span>
                      <span>{rir[currentExerciseIndex]}</span>
                      <span>5 (Fácil)</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="camera">
              <div className="space-y-4">
                <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {!cameraActive && videoBlob && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button onClick={() => {
                        if (videoRef.current && videoBlob) {
                          videoRef.current.src = URL.createObjectURL(videoBlob)
                          videoRef.current.play()
                        }
                      }}>
                        <Play className="h-4 w-4 mr-1" />
                        Reproducir
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-center space-x-2">
                  <Button
                    variant={cameraActive ? "destructive" : "default"}
                    onClick={toggleCamera}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    {cameraActive ? "Detener Cámara" : "Iniciar Cámara"}
                  </Button>

                  {cameraActive && (
                    <Button
                      variant={recording ? "destructive" : "default"}
                      onClick={toggleRecording}
                      disabled={!cameraActive}
                    >
                      <Video className="h-4 w-4 mr-1" />
                      {recording ? "Detener Grabación" : "Grabar"}
                    </Button>
                  )}

                  {videoBlob && (
                    <Button onClick={analyzeVideo}>
                      Analizar Técnica
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="feedback">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Análisis de Técnica</h3>

                {postureFeedback ? (
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="mb-2">{postureFeedback}</p>

                    <div className="flex justify-between mt-4">
                      <Button variant="outline" size="sm">
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Incorrecto
                      </Button>
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Correcto
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-40">
                    <p>Analizando video...</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            if (currentExerciseIndex > 0 || currentSetIndex > 0) {
              if (currentSetIndex > 0) {
                setCurrentSetIndex(prev => prev - 1)
              } else {
                setCurrentExerciseIndex(prev => prev - 1)
                setCurrentSetIndex(workoutDay.exercises[currentExerciseIndex - 1].sets - 1)
              }
            }
          }}
          disabled={currentExerciseIndex === 0 && currentSetIndex === 0}
        >
          Anterior
        </Button>

        <Button onClick={nextSet}>
          {currentExerciseIndex === totalExercises - 1 && currentSetIndex === totalSets - 1 ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              Completar Entrenamiento
            </>
          ) : (
            "Siguiente"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
