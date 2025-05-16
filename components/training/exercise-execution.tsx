"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import {
  Dumbbell,
  RotateCcw,
  Clock,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Play,
  Pause,
  Timer
} from "lucide-react"
import { Exercise } from "@/lib/types/training"
import { ExerciseAlternatives } from "@/components/training/exercise-alternatives-simple"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"

interface ExerciseExecutionProps {
  exercise: Exercise
  availableExercises: Exercise[]
  onChangeExercise?: (oldExerciseId: string, newExerciseId: string) => void
  onComplete?: (exerciseData: {
    exerciseId: string;
    weight: number;
    reps: number;
    rir: number;
    completed: boolean;
  }) => void
  currentSet?: number
  totalSets?: number
}

export function ExerciseExecution({
  exercise,
  availableExercises,
  onChangeExercise,
  onComplete,
  currentSet = 1,
  totalSets
}: ExerciseExecutionProps) {
  const { toast } = useToast()
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [weight, setWeight] = useState(0)
  const [reps, setReps] = useState(exercise.repsMin || 10)
  const [rir, setRir] = useState(exercise.rir || 2)
  const [timerActive, setTimerActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(exercise.rest || 60)
  const [isCompleted, setIsCompleted] = useState(false)

  // Reiniciar el temporizador cuando cambia el ejercicio o el set
  useEffect(() => {
    setTimeRemaining(exercise.rest || 60)
    setTimerActive(false)
    setReps(exercise.repsMin || 10)
    setRir(exercise.rir || 2)
    setIsCompleted(false)
  }, [exercise, currentSet])

  // Manejar el temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0) {
      setTimerActive(false)
      toast({
        title: "¡Tiempo de descanso completado!",
        description: "Es hora de comenzar la siguiente serie.",
      })
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timeRemaining, toast])

  // Manejar el cambio de ejercicio
  const handleChangeExercise = (newExerciseId: string) => {
    if (onChangeExercise) {
      onChangeExercise(exercise.id, newExerciseId)
      setShowAlternatives(false)
      setShowDropdown(false)

      // Encontrar el nombre del nuevo ejercicio
      const newExercise = availableExercises.find(ex => ex.id === newExerciseId)

      toast({
        title: "Ejercicio cambiado",
        description: `Se ha cambiado a ${newExercise?.name || 'nuevo ejercicio'}`,
        variant: "default"
      })
    }
  }

  // Filtrar ejercicios alternativos con el mismo patrón de movimiento
  const getAlternatives = () => {
    if (!exercise.pattern) return []

    return availableExercises.filter(ex =>
      ex.id !== exercise.id &&
      ex.pattern === exercise.pattern
    ).slice(0, 5) // Limitar a 5 alternativas
  }

  // Incrementar/decrementar peso
  const adjustWeight = (amount: number) => {
    setWeight(prev => Math.max(0, prev + amount))
  }

  // Incrementar/decrementar repeticiones
  const adjustReps = (amount: number) => {
    setReps(prev => Math.max(1, prev + amount))
  }

  // Iniciar/pausar el temporizador
  const toggleTimer = () => {
    setTimerActive(prev => !prev)
  }

  // Reiniciar el temporizador
  const resetTimer = () => {
    setTimerActive(false)
    setTimeRemaining(exercise.rest || 60)
  }

  // Completar el ejercicio
  const completeExercise = () => {
    setIsCompleted(true)

    if (onComplete) {
      onComplete({
        exerciseId: exercise.id,
        weight,
        reps,
        rir,
        completed: true
      })
    }
  }

  // Formatear el tiempo restante
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const alternatives = getAlternatives()

  return (
    <Card className="overflow-hidden border rounded-lg">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center">
              <Badge className="mr-2 bg-blue-500 text-white">
                {currentSet}/{exercise.sets}
              </Badge>
              <h3 className="font-medium text-base">{exercise.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{exercise.muscleGroup?.[0]}</p>
          </div>

          <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Alternativas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Ejercicios alternativos</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {alternatives.length > 0 ? (
                alternatives.map(alt => (
                  <DropdownMenuItem
                    key={alt.id}
                    onClick={() => handleChangeExercise(alt.id)}
                  >
                    <Dumbbell className="h-4 w-4 mr-2 text-primary" />
                    <span>{alt.name}</span>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No hay alternativas disponibles
                </div>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowAlternatives(true)}>
                Ver todas las alternativas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-6">
          {/* Información del ejercicio */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground">Serie</p>
              <p className="font-medium">{currentSet} de {exercise.sets}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Repeticiones</p>
              <p className="font-medium">{exercise.repsMin}-{exercise.repsMax}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Descanso</p>
              <p className="font-medium">{exercise.rest}s</p>
            </div>
          </div>

          {/* Peso (kg) */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Peso (kg)</span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => adjustWeight(-2.5)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-4 font-bold text-lg">{weight}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => adjustWeight(2.5)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setWeight(0)}
              >
                0
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setWeight(5)}
              >
                5
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setWeight(10)}
              >
                10
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setWeight(20)}
              >
                20
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setWeight(30)}
              >
                30
              </Button>
            </div>
          </div>

          {/* Repeticiones */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Repeticiones</span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => adjustReps(-1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-4 font-bold text-lg">{reps}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => adjustReps(1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setReps(exercise.repsMin || 8)}
              >
                {exercise.repsMin || 8}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setReps(exercise.repsMax || 12)}
              >
                {exercise.repsMax || 12}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setReps(Math.round((exercise.repsMin || 8) + (exercise.repsMax || 12)) / 2)}
              >
                Media
              </Button>
            </div>
          </div>

          {/* RIR (Repeticiones en Reserva) */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">RIR (Repeticiones en Reserva)</span>
              <Badge variant={
                rir <= 1 ? "destructive" :
                rir <= 2 ? "default" :
                "secondary"
              }>
                {rir <= 1 ? "Alta intensidad" :
                 rir <= 2 ? "Intensidad media" :
                 "Baja intensidad"}
              </Badge>
            </div>
            <Slider
              value={[rir]}
              min={0}
              max={5}
              step={1}
              onValueChange={(value) => setRir(value[0])}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <p>RIR {rir}: {
                rir === 0 ? "No podrías hacer ni una repetición más" :
                rir === 1 ? "Podrías hacer 1 repetición más" :
                rir === 2 ? "Podrías hacer 2 repeticiones más" :
                rir === 3 ? "Podrías hacer 3 repeticiones más" :
                rir === 4 ? "Podrías hacer 4 repeticiones más" :
                "Podrías hacer 5 o más repeticiones más"
              }</p>
            </div>
          </div>

          {/* Temporizador */}
          {!isCompleted && (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h3 className="text-sm font-medium mb-1">Tiempo de descanso</h3>
              <div className={`text-3xl font-bold ${timeRemaining < 10 && timerActive ? 'text-red-500 animate-pulse' : ''}`}>
                {formatTime(timeRemaining)}
              </div>

              <div className="w-full bg-gray-200 h-2 rounded-full mt-2 mb-3">
                <div
                  className={`h-full rounded-full ${timerActive ? 'bg-primary' : 'bg-gray-400'}`}
                  style={{
                    width: `${(timeRemaining / (exercise.rest || 60)) * 100}%`,
                    transition: 'width 1s linear'
                  }}
                ></div>
              </div>

              <div className="flex justify-center gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={resetTimer}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reiniciar
                </Button>
                <Button
                  variant={timerActive ? "destructive" : "default"}
                  size="sm"
                  onClick={toggleTimer}
                >
                  {timerActive ? (
                    <><Pause className="h-4 w-4 mr-1" /> Pausar</>
                  ) : (
                    <><Play className="h-4 w-4 mr-1" /> Iniciar</>
                  )}
                </Button>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    setTimerActive(false);
                    setTimeRemaining(30);
                  }}
                >
                  30s
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    setTimerActive(false);
                    setTimeRemaining(60);
                  }}
                >
                  60s
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    setTimerActive(false);
                    setTimeRemaining(90);
                  }}
                >
                  90s
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    setTimerActive(false);
                    setTimeRemaining(120);
                  }}
                >
                  120s
                </Button>
              </div>
            </div>
          )}

          {/* Botón de completar */}
          {!isCompleted ? (
            <Button
              className="w-full h-12 text-base font-bold"
              onClick={completeExercise}
            >
              Completar serie {currentSet} de {exercise.sets}
            </Button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-600 font-medium">Serie completada</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                {currentSet < (exercise.sets || 1) ?
                  `Prepárate para la serie ${currentSet + 1} de ${exercise.sets}` :
                  "¡Has completado todas las series de este ejercicio!"}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={showAlternatives} onOpenChange={setShowAlternatives}>
        <DialogContent className="max-w-md">
          <ExerciseAlternatives
            exercise={exercise}
            availableExercises={availableExercises}
            onSelectAlternative={handleChangeExercise}
            currentExerciseId={exercise.id}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
