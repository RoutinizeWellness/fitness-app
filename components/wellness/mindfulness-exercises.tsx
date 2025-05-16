"use client"

import { useState, useEffect, useRef } from "react"
import {
  Brain,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Clock,
  BarChart3,
  Save,
  Filter,
  Heart,
  Sparkles,
  Flame,
  Wind,
  Leaf
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  MindfulnessExercise,
  MindfulnessLog,
  getMindfulnessExercises,
  saveMindfulnessLog,
  getMindfulnessStats,
  MindfulnessStats
} from "@/lib/mindfulness-service"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"

interface MindfulnessExercisesProps {
  userId: string
  className?: string
}

export function MindfulnessExercises({
  userId,
  className
}: MindfulnessExercisesProps) {
  const [exercises, setExercises] = useState<MindfulnessExercise[]>([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedExercise, setSelectedExercise] = useState<MindfulnessExercise | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showStatsDialog, setShowStatsDialog] = useState(false)
  const [mindfulnessStats, setMindfulnessStats] = useState<MindfulnessStats | null>(null)
  const [sessionLog, setSessionLog] = useState<Partial<MindfulnessLog>>({
    stressBefore: 5,
    stressAfter: 3,
    notes: ""
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Categorías de ejercicios
  const categories = [
    { id: "all", name: "Todos", icon: Brain },
    { id: "breathing", name: "Respiración", icon: Wind },
    { id: "meditation", name: "Meditación", icon: Sparkles },
    { id: "visualization", name: "Visualización", icon: Leaf },
    { id: "body_scan", name: "Body Scan", icon: Heart }
  ]

  // Cargar ejercicios y estadísticas
  useEffect(() => {
    if (userId) {
      loadExercises()
      loadStats()
    }
  }, [userId])

  const loadExercises = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await getMindfulnessExercises()

      if (error) {
        console.error("Error al cargar ejercicios:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los ejercicios de mindfulness",
          variant: "destructive"
        })
        return
      }

      if (data) {
        setExercises(data)
      }
    } catch (error) {
      console.error("Error al cargar ejercicios:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const { data, error } = await getMindfulnessStats(userId)

      if (error) {
        console.error("Error al cargar estadísticas:", error)
        return
      }

      if (data) {
        setMindfulnessStats(data)
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    }
  }

  // Filtrar ejercicios por categoría
  const filteredExercises = activeCategory === "all"
    ? exercises
    : exercises.filter(exercise => exercise.category === activeCategory)

  // Iniciar ejercicio
  const startExercise = (exercise: MindfulnessExercise) => {
    setSelectedExercise(exercise)
    setTimeRemaining(exercise.duration * 60) // Convertir minutos a segundos
    setCurrentStep(0)

    // Mostrar diálogo para registrar nivel de estrés antes
    setShowSaveDialog(true)
    setSessionLog(prev => ({
      ...prev,
      exerciseId: exercise.id,
      duration: exercise.duration
    }))
  }

  // Iniciar/pausar el temporizador
  const toggleTimer = () => {
    if (isRunning) {
      // Pausar
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    } else {
      // Iniciar
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Tiempo terminado
            clearInterval(timerRef.current as NodeJS.Timeout)
            completeExercise()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    setIsRunning(!isRunning)
  }

  // Avanzar al siguiente paso
  const nextStep = () => {
    if (!selectedExercise) return

    if (currentStep < selectedExercise.instructions.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  // Retroceder al paso anterior
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  // Completar ejercicio
  const completeExercise = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setIsRunning(false)

    // Reproducir sonido de finalización
    if (!isMuted && audioRef.current) {
      audioRef.current.play()
    }

    // Mostrar notificación
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Ejercicio completado', {
        body: 'Tu ejercicio de mindfulness ha terminado.',
        icon: '/icons/icon-192x192.png'
      })
    }

    // Mostrar diálogo para guardar sesión
    setShowSaveDialog(true)
    setSessionLog(prev => ({
      ...prev,
      stressAfter: prev.stressBefore ? Math.max(1, prev.stressBefore - 2) : 3 // Valor predeterminado
    }))
  }

  // Cancelar ejercicio
  const cancelExercise = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setIsRunning(false)
    setSelectedExercise(null)
  }

  // Guardar registro de mindfulness
  const handleSaveSession = async () => {
    if (!userId || !selectedExercise) return

    try {
      const logData: Omit<MindfulnessLog, 'id' | 'createdAt'> = {
        userId,
        exerciseId: selectedExercise.id,
        date: new Date().toISOString(),
        duration: selectedExercise.duration,
        stressBefore: sessionLog.stressBefore,
        stressAfter: sessionLog.stressAfter,
        notes: sessionLog.notes
      }

      const { data, error } = await saveMindfulnessLog(logData)

      if (error) {
        console.error("Error al guardar sesión:", error)
        toast({
          title: "Error",
          description: "No se pudo guardar la sesión",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Éxito",
        description: "Sesión de mindfulness guardada correctamente"
      })

      // Si es la primera vez que se muestra el diálogo (antes de empezar)
      if (!isRunning && timeRemaining === selectedExercise.duration * 60) {
        setShowSaveDialog(false)
        toggleTimer() // Iniciar automáticamente
      } else {
        // Si es después de completar
        setShowSaveDialog(false)
        setSelectedExercise(null)
      }

      // Actualizar estadísticas
      loadStats()
    } catch (error) {
      console.error("Error al guardar sesión:", error)
    }
  }

  // Formatear tiempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Calcular porcentaje de progreso
  const calculateProgress = (): number => {
    if (!selectedExercise) return 0
    const totalSeconds = selectedExercise.duration * 60
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100
  }

  // Solicitar permisos de notificación
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission()
    }
  }, [])

  // Limpiar temporizador al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Renderizar icono según categoría
  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'breathing':
        return <Wind className="h-5 w-5 text-blue-500" />
      case 'meditation':
        return <Sparkles className="h-5 w-5 text-purple-500" />
      case 'visualization':
        return <Leaf className="h-5 w-5 text-green-500" />
      case 'body_scan':
        return <Heart className="h-5 w-5 text-red-500" />
      default:
        return <Brain className="h-5 w-5 text-indigo-500" />
    }
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
        <PulseLoader message="Cargando ejercicios..." />
      </div>
    )
  }

  return (
    <div className={className}>
      {selectedExercise ? (
        // Vista de ejercicio en curso
        <Card3D className="overflow-hidden">
          <Card3DHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <div className="flex justify-between items-center">
              <Card3DTitle className="flex items-center">
                {renderCategoryIcon(selectedExercise.category)}
                <span className="ml-2">{selectedExercise.title}</span>
              </Card3DTitle>
              <Button3D
                variant="glass"
                size="icon"
                className="h-8 w-8 text-white border-white/30"
                onClick={cancelExercise}
              >
                <SkipForward className="h-4 w-4" />
              </Button3D>
            </div>
          </Card3DHeader>

          <Card3DContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-4">
                {formatTime(timeRemaining)}
              </div>

              <Progress3D
                value={calculateProgress()}
                max={100}
                className="w-full mb-6"
                height="8px"
              />

              <div className="flex justify-center space-x-2 mb-6">
                <Button3D
                  variant={isRunning ? "outline" : "default"}
                  size="icon"
                  className="h-12 w-12"
                  onClick={toggleTimer}
                >
                  {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button3D>

                <Button3D
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </Button3D>
              </div>

              <Card3D className="w-full p-4 mb-4">
                <h3 className="font-medium mb-2">Paso {currentStep + 1} de {selectedExercise.instructions.length}</h3>
                <p className="text-gray-600">{selectedExercise.instructions[currentStep].text}</p>

                {selectedExercise.instructions[currentStep].duration && (
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{selectedExercise.instructions[currentStep].duration} segundos</span>
                  </div>
                )}
              </Card3D>

              <div className="flex justify-between w-full">
                <Button3D
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Anterior
                </Button3D>
                <Button3D
                  variant="outline"
                  onClick={nextStep}
                  disabled={currentStep === selectedExercise.instructions.length - 1}
                >
                  Siguiente
                </Button3D>
              </div>
            </div>
          </Card3DContent>
        </Card3D>
      ) : (
        // Lista de ejercicios
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Ejercicios de mindfulness</h2>
            <Button3D
              variant="outline"
              size="sm"
              onClick={() => setShowStatsDialog(true)}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Estadísticas
            </Button3D>
          </div>

          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-4">
            <TabsList className="grid grid-cols-5">
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center">
                  <category.icon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {filteredExercises.length === 0 ? (
            <Card3D className="p-6 text-center">
              <div className="flex flex-col items-center justify-center py-6">
                <Brain className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay ejercicios</h3>
                <p className="text-gray-500">No se encontraron ejercicios en esta categoría</p>
              </div>
            </Card3D>
          ) : (
            <div className="space-y-4">
              {filteredExercises.map(exercise => (
                <Card3D key={exercise.id} className="overflow-hidden">
                  <div className="relative">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="mr-3">
                            {renderCategoryIcon(exercise.category)}
                          </div>

                          <div>
                            <h3 className="font-medium">{exercise.title}</h3>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>{exercise.duration} min</span>
                              <span className="mx-1">•</span>
                              <Badge variant="outline" className="text-xs h-5">
                                {exercise.category === 'breathing' ? 'Respiración' :
                                 exercise.category === 'meditation' ? 'Meditación' :
                                 exercise.category === 'visualization' ? 'Visualización' :
                                 exercise.category === 'body_scan' ? 'Body Scan' :
                                 exercise.category}
                              </Badge>
                              <span className="mx-1">•</span>
                              <Badge variant="outline" className="text-xs h-5">
                                {exercise.difficulty === 'beginner' ? 'Principiante' :
                                 exercise.difficulty === 'intermediate' ? 'Intermedio' :
                                 exercise.difficulty === 'advanced' ? 'Avanzado' :
                                 exercise.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <Button3D
                          variant="default"
                          size="sm"
                          className="h-8"
                          onClick={() => startExercise(exercise)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button3D>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">{exercise.description}</p>

                      {exercise.benefits && exercise.benefits.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-xs font-medium text-gray-500 mb-1">Beneficios:</h4>
                          <div className="flex flex-wrap gap-1">
                            {exercise.benefits.map((benefit, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card3D>
              ))}
            </div>
          )}
        </>
      )}

      {/* Audio para la alarma */}
      <audio ref={audioRef} src="/sounds/meditation-bell.mp3" />

      {/* Diálogo para guardar sesión */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {!isRunning && timeRemaining === (selectedExercise?.duration || 0) * 60
                ? "Antes de empezar"
                : "Guardar sesión de mindfulness"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>
                {!isRunning && timeRemaining === (selectedExercise?.duration || 0) * 60
                  ? "¿Cuál es tu nivel de estrés actual?"
                  : "¿Cuál es tu nivel de estrés después del ejercicio?"}
              </Label>
              <RadioGroup
                value={(!isRunning && timeRemaining === (selectedExercise?.duration || 0) * 60
                  ? sessionLog.stressBefore
                  : sessionLog.stressAfter)?.toString()}
                onValueChange={(value) => {
                  if (!isRunning && timeRemaining === (selectedExercise?.duration || 0) * 60) {
                    setSessionLog(prev => ({ ...prev, stressBefore: parseInt(value) }))
                  } else {
                    setSessionLog(prev => ({ ...prev, stressAfter: parseInt(value) }))
                  }
                }}
                className="flex justify-between"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <RadioGroupItem
                      value={value.toString()}
                      id={`stress-${value}`}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`stress-${value}`}
                      className={`cursor-pointer flex flex-col items-center p-2 rounded-md ${
                        (!isRunning && timeRemaining === (selectedExercise?.duration || 0) * 60
                          ? sessionLog.stressBefore
                          : sessionLog.stressAfter) === value
                          ? 'bg-primary/10 text-primary'
                          : ''
                      }`}
                    >
                      <span className="text-lg mb-1">
                        {value <= 3 ? '😌' : value <= 6 ? '😐' : value <= 8 ? '😟' : '😰'}
                      </span>
                      <span className="text-xs">{value}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Relajado</span>
                <span>Muy estresado</span>
              </div>
            </div>

            {!(timeRemaining === (selectedExercise?.duration || 0) * 60) && (
              <div className="grid gap-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={sessionLog.notes}
                  onChange={(e) => setSessionLog(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="¿Cómo te sientes después del ejercicio?"
                  rows={2}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button3D variant="outline" onClick={() => {
              setShowSaveDialog(false)
              if (!isRunning && timeRemaining === (selectedExercise?.duration || 0) * 60) {
                setSelectedExercise(null)
              }
            }}>
              Cancelar
            </Button3D>
            <Button3D onClick={handleSaveSession}>
              {!isRunning && timeRemaining === (selectedExercise?.duration || 0) * 60
                ? "Comenzar ejercicio"
                : "Guardar"}
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para estadísticas */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Estadísticas de mindfulness</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {!mindfulnessStats ? (
              <p className="text-center text-gray-500">No hay estadísticas disponibles</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card3D className="p-4">
                    <div className="flex flex-col items-center">
                      <Clock className="h-8 w-8 text-indigo-500 mb-2" />
                      <span className="text-sm text-gray-500">Tiempo total</span>
                      <span className="text-xl font-bold">{mindfulnessStats.totalMinutes} min</span>
                    </div>
                  </Card3D>

                  <Card3D className="p-4">
                    <div className="flex flex-col items-center">
                      <Brain className="h-8 w-8 text-purple-500 mb-2" />
                      <span className="text-sm text-gray-500">Sesiones</span>
                      <span className="text-xl font-bold">{mindfulnessStats.totalSessions}</span>
                    </div>
                  </Card3D>
                </div>

                <Card3D className="p-4">
                  <div className="flex flex-col items-center">
                    <Sparkles className="h-8 w-8 text-amber-500 mb-2" />
                    <span className="text-sm text-gray-500">Reducción de estrés promedio</span>
                    <span className="text-xl font-bold">
                      {mindfulnessStats.averageStressReduction > 0 ? '-' : ''}
                      {Math.abs(mindfulnessStats.averageStressReduction).toFixed(1)} puntos
                    </span>
                  </div>
                </Card3D>

                <div className="space-y-2">
                  <h3 className="font-medium">Recomendaciones personalizadas</h3>

                  {mindfulnessStats.totalSessions < 5 ? (
                    <p className="text-sm text-gray-500">
                      Completa al menos 5 sesiones para recibir recomendaciones personalizadas.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {mindfulnessStats.favoriteCategory && (
                        <div className="flex items-start">
                          <Heart className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                          <p className="text-sm">
                            <span className="font-medium">Tu categoría favorita:</span>{" "}
                            {mindfulnessStats.favoriteCategory === 'breathing' ? 'Respiración' :
                             mindfulnessStats.favoriteCategory === 'meditation' ? 'Meditación' :
                             mindfulnessStats.favoriteCategory === 'visualization' ? 'Visualización' :
                             mindfulnessStats.favoriteCategory === 'body_scan' ? 'Body Scan' :
                             mindfulnessStats.favoriteCategory}
                          </p>
                        </div>
                      )}

                      {mindfulnessStats.mostEffectiveExercise && (
                        <div className="flex items-start">
                          <Sparkles className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                          <p className="text-sm">
                            <span className="font-medium">Ejercicio más efectivo:</span>{" "}
                            {mindfulnessStats.mostEffectiveExercise}
                          </p>
                        </div>
                      )}

                      <div className="flex items-start">
                        <Brain className="h-4 w-4 text-indigo-500 mr-2 mt-0.5" />
                        <p className="text-sm">
                          <span className="font-medium">Consejo:</span> La práctica regular de mindfulness (5-10 minutos diarios) puede reducir significativamente los niveles de estrés.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Duración promedio: {Math.round(mindfulnessStats.averageDuration)} min | Última semana: {mindfulnessStats.lastWeekSessions} sesiones
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button3D onClick={() => setShowStatsDialog(false)}>
              Cerrar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
