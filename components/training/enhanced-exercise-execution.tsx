"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog"
import { Exercise } from "@/lib/types/training"
import { 
  Dumbbell, 
  Clock, 
  RotateCcw, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  SkipForward,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Video,
  Info,
  RefreshCw,
  Zap,
  Flame
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

interface EnhancedExerciseExecutionProps {
  exercise: Exercise
  availableExercises: Exercise[]
  onChangeExercise: (newExerciseId: string) => void
  onComplete: () => void
  currentSet: number
  totalSets: number
}

export function EnhancedExerciseExecution({
  exercise,
  availableExercises,
  onChangeExercise,
  onComplete,
  currentSet,
  totalSets
}: EnhancedExerciseExecutionProps) {
  const { toast } = useToast()
  const [weight, setWeight] = useState<number>(0)
  const [reps, setReps] = useState<number>(exercise.repsMin)
  const [rir, setRir] = useState<number>(2)
  const [notes, setNotes] = useState<string>("")
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [timerActive, setTimerActive] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(exercise.rest || 60)
  const [initialTimerSeconds, setInitialTimerSeconds] = useState(exercise.rest || 60)
  const [showTimer, setShowTimer] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Reiniciar valores cuando cambia el ejercicio
  useEffect(() => {
    setWeight(0)
    setReps(exercise.repsMin)
    setRir(2)
    setNotes("")
    setInitialTimerSeconds(exercise.rest || 60)
    setTimerSeconds(exercise.rest || 60)
    setTimerActive(false)
    setShowTimer(false)
  }, [exercise])

  // Manejar el temporizador
  useEffect(() => {
    if (timerActive && timerSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setTimerSeconds(prev => prev - 1)
      }, 1000)
    } else if (timerSeconds === 0) {
      setTimerActive(false)
      toast({
        title: "¡Descanso completado!",
        description: "Es hora de comenzar la siguiente serie.",
        variant: "default"
      })
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timerActive, timerSeconds, toast])

  // Iniciar el temporizador
  const startTimer = () => {
    setTimerActive(true)
  }

  // Pausar el temporizador
  const pauseTimer = () => {
    setTimerActive(false)
  }

  // Reiniciar el temporizador
  const resetTimer = () => {
    setTimerActive(false)
    setTimerSeconds(initialTimerSeconds)
  }

  // Saltar el temporizador
  const skipTimer = () => {
    setTimerActive(false)
    setTimerSeconds(0)
    toast({
      title: "Temporizador omitido",
      description: "Has saltado el tiempo de descanso.",
      variant: "default"
    })
  }

  // Formatear el tiempo en MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Manejar la finalización de una serie
  const handleCompleteSet = () => {
    // Validar que se hayan ingresado los datos necesarios
    if (weight <= 0) {
      toast({
        title: "Peso no válido",
        description: "Por favor, ingresa un peso válido para esta serie.",
        variant: "destructive"
      })
      return
    }

    if (reps < 1) {
      toast({
        title: "Repeticiones no válidas",
        description: "Por favor, ingresa al menos 1 repetición para esta serie.",
        variant: "destructive"
      })
      return
    }

    // Guardar los datos de la serie
    // En un entorno real, aquí enviaríamos los datos a Supabase
    console.log("Serie completada:", {
      exerciseId: exercise.id,
      set: currentSet,
      weight,
      reps,
      rir,
      notes
    })

    // Mostrar el temporizador si no es la última serie
    if (currentSet < totalSets) {
      setShowTimer(true)
      startTimer()
    }

    // Llamar a la función de completar
    onComplete()

    // Reiniciar valores para la siguiente serie
    setNotes("")
  }

  // Manejar el cambio de ejercicio
  const handleChangeExercise = (newExerciseId: string) => {
    onChangeExercise(newExerciseId)
    setShowAlternatives(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-medium">{exercise.name}</CardTitle>
            <Badge variant={
              exercise.difficulty === "beginner" ? "secondary" :
              exercise.difficulty === "intermediate" ? "default" :
              "destructive"
            }>
              {exercise.difficulty === "beginner" ? "Principiante" :
               exercise.difficulty === "intermediate" ? "Intermedio" :
               "Avanzado"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Serie {currentSet} de {totalSets}</p>
                <p className="text-xs text-muted-foreground">
                  {exercise.repsMin}-{exercise.repsMax} repeticiones
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => setShowVideo(true)}>
                      <Video className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver demostración</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => setShowAlternatives(true)}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cambiar ejercicio</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setWeight(prev => Math.max(0, prev - 2.5))}
                    disabled={weight <= 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    className="mx-2 text-center"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setWeight(prev => prev + 2.5)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reps">Repeticiones</Label>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setReps(prev => Math.max(1, prev - 1))}
                    disabled={reps <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Input
                    id="reps"
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                    className="mx-2 text-center"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setReps(prev => prev + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="rir">RIR (Repeticiones en Reserva)</Label>
                <Badge variant="outline">{rir}</Badge>
              </div>
              <Slider
                id="rir"
                min={0}
                max={5}
                step={1}
                value={[rir]}
                onValueChange={(value) => setRir(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fallo (0)</span>
                <span>Moderado (3)</span>
                <span>Fácil (5)</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                placeholder="Ej: Sensación en el músculo, dificultad, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button className="w-full" onClick={handleCompleteSet}>
            <Check className="h-4 w-4 mr-2" />
            {currentSet < totalSets ? "Completar Serie" : "Finalizar Ejercicio"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Temporizador de descanso */}
      {showTimer && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-700">Tiempo de Descanso</h3>
              </div>
              
              <div className="text-4xl font-bold text-blue-700 mb-4">
                {formatTime(timerSeconds)}
              </div>
              
              <Progress 
                value={(timerSeconds / initialTimerSeconds) * 100} 
                className="h-2 mb-4 w-full"
              />
              
              <div className="flex space-x-2">
                {timerActive ? (
                  <Button variant="outline" size="sm" onClick={pauseTimer}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={startTimer}>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar
                  </Button>
                )}
                
                <Button variant="outline" size="sm" onClick={resetTimer}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reiniciar
                </Button>
                
                <Button variant="outline" size="sm" onClick={skipTimer}>
                  <SkipForward className="h-4 w-4 mr-2" />
                  Omitir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Diálogo para mostrar video */}
      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Demostración: {exercise.name}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
            {exercise.videoUrl ? (
              <video 
                src={exercise.videoUrl} 
                controls 
                className="w-full h-full rounded-md"
                poster={exercise.imageUrl}
              >
                Tu navegador no soporta videos.
              </video>
            ) : (
              <div className="text-center p-4">
                <Video className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No hay video disponible para este ejercicio.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVideo(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para mostrar alternativas */}
      <Dialog open={showAlternatives} onOpenChange={setShowAlternatives}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alternativas para {exercise.name}</DialogTitle>
            <DialogDescription>
              Selecciona un ejercicio alternativo que trabaje los mismos grupos musculares.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto pr-2">
            <div className="space-y-2">
              {availableExercises
                .filter(ex => 
                  ex.id !== exercise.id && 
                  ex.pattern === exercise.pattern
                )
                .map(ex => (
                  <Card 
                    key={ex.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleChangeExercise(ex.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{ex.name}</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {ex.muscleGroup.map(group => (
                              <Badge key={group} variant="outline" className="text-xs">
                                {group}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Badge variant={
                          ex.difficulty === "beginner" ? "secondary" :
                          ex.difficulty === "intermediate" ? "default" :
                          "destructive"
                        } className="ml-2">
                          {ex.difficulty === "beginner" ? "Principiante" :
                           ex.difficulty === "intermediate" ? "Intermedio" :
                           "Avanzado"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlternatives(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
