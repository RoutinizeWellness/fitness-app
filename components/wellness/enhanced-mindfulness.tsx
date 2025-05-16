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
  Leaf,
  Moon,
  Sun,
  Waves,
  Zap,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check
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
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { WellnessAIService } from "@/lib/wellness-ai-service"

interface EnhancedMindfulnessProps {
  userId: string
  className?: string
}

export default function EnhancedMindfulness({ userId, className = "" }: EnhancedMindfulnessProps) {
  // Estado para la interfaz
  const [activeTab, setActiveTab] = useState("guided")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [selectedDuration, setSelectedDuration] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)

  // Estado para ejercicios y sesiones
  const [exercises, setExercises] = useState<any[]>([])
  const [selectedExercise, setSelectedExercise] = useState<any>(null)
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<any[]>([])
  const [mindfulnessStats, setMindfulnessStats] = useState<any>({
    totalSessions: 0,
    totalMinutes: 0,
    averageDuration: 0,
    averageStressReduction: 0,
    lastWeekSessions: 0,
    favoriteCategory: "",
    mostEffectiveExercise: ""
  })

  // Estado para la sesión actual
  const [isRunning, setIsRunning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [currentPhase, setCurrentPhase] = useState<'preparation' | 'focus' | 'deepening' | 'integration'>('preparation')
  const [phaseProgress, setPhaseProgress] = useState(0)
  const [sessionLog, setSessionLog] = useState({
    exerciseId: "",
    duration: 0,
    stressBefore: 5,
    stressAfter: 5,
    notes: "",
    rating: 0
  })

  // Referencias
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const wellnessService = useRef<WellnessAIService | null>(null)

  // Inicializar servicio de bienestar
  useEffect(() => {
    if (userId) {
      wellnessService.current = new WellnessAIService(userId)
    }

    // Crear elemento de audio
    audioRef.current = new Audio("/sounds/bell.mp3")

    return () => {
      // Limpiar temporizador al desmontar
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [userId])

  // Cargar ejercicios y estadísticas
  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true)
      try {
        // Cargar ejercicios desde Supabase
        const { data: exercisesData, error } = await fetch('/api/mindfulness/exercises').then(res => res.json())

        if (error) throw error

        if (exercisesData) {
          setExercises(exercisesData)
        }

        // Cargar estadísticas
        const { data: statsData, error: statsError } = await fetch(`/api/mindfulness/stats?userId=${userId}`).then(res => res.json())

        if (statsError) throw statsError

        if (statsData) {
          setMindfulnessStats(statsData)
        }

        // Cargar sesiones recientes
        const { data: sessionsData, error: sessionsError } = await fetch(`/api/mindfulness/sessions?userId=${userId}&limit=5`).then(res => res.json())

        if (sessionsError) throw sessionsError

        if (sessionsData) {
          setRecentSessions(sessionsData)
        }

        // Obtener recomendaciones personalizadas
        if (wellnessService.current) {
          const recommendations = await wellnessService.current.generateWellnessRecommendations()
          setPersonalizedRecommendations(recommendations.filter(r => r.type === 'mindfulness'))
        }
      } catch (error) {
        console.error("Error al cargar ejercicios de mindfulness:", error)
        // Usar datos de ejemplo en caso de error
        setExercises([
          {
            id: "mindful-breathing",
            title: "Respiración consciente",
            description: "Enfócate en tu respiración, notando cada inhalación y exhalación sin juzgar.",
            category: "breathing",
            duration: 10,
            difficulty: "beginner",
            guided_audio: "/audio/mindful-breathing.mp3",
            benefits: ["Reduce estrés", "Mejora concentración", "Calma la mente"],
            instructions: [
              "Siéntate en una posición cómoda con la espalda recta",
              "Cierra los ojos o mantén la mirada suave",
              "Respira naturalmente y enfoca tu atención en la respiración",
              "Nota las sensaciones de cada inhalación y exhalación",
              "Cuando tu mente divague, gentilmente regresa la atención a la respiración"
            ]
          },
          {
            id: "body-scan",
            title: "Body scan",
            description: "Recorre mentalmente cada parte de tu cuerpo, notando sensaciones sin juzgarlas.",
            category: "body_scan",
            duration: 15,
            difficulty: "intermediate",
            guided_audio: "/audio/body-scan.mp3",
            benefits: ["Reduce tensión física", "Mejora conciencia corporal", "Promueve relajación"],
            instructions: [
              "Acuéstate en una posición cómoda",
              "Cierra los ojos y toma unas respiraciones profundas",
              "Comienza a dirigir tu atención a los dedos de los pies",
              "Lentamente sube por todo el cuerpo, notando sensaciones",
              "Si encuentras tensión, respira hacia esa área y permite que se relaje"
            ]
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      loadExercises()
    }
  }, [userId])

  // Iniciar ejercicio
  const startExercise = (exercise: any) => {
    setSelectedExercise(exercise)
    setSessionLog({
      exerciseId: exercise.id,
      duration: exercise.duration,
      stressBefore: 5,
      stressAfter: 5,
      notes: "",
      rating: 0
    })
    setShowSessionDialog(true)
  }

  // Iniciar sesión
  const startSession = () => {
    if (!selectedExercise) return

    setTimeRemaining(selectedExercise.duration * 60)
    setElapsedTime(0)
    setCurrentPhase('preparation')
    setPhaseProgress(0)
    setIsRunning(true)

    // Iniciar temporizador
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Finalizar sesión
          clearInterval(timerRef.current!)
          setIsRunning(false)
          setShowCompletionDialog(true)
          return 0
        }
        return prev - 1
      })

      setElapsedTime(prev => prev + 1)

      // Actualizar fase actual
      const totalTime = selectedExercise.duration * 60
      const elapsed = elapsedTime + 1
      const progress = (elapsed / totalTime) * 100

      if (progress < 10) {
        setCurrentPhase('preparation')
      } else if (progress < 40) {
        setCurrentPhase('focus')
      } else if (progress < 80) {
        setCurrentPhase('deepening')
      } else {
        setCurrentPhase('integration')
      }

      // Actualizar progreso de fase
      const phaseRanges = {
        preparation: { start: 0, end: 10 },
        focus: { start: 10, end: 40 },
        deepening: { start: 40, end: 80 },
        integration: { start: 80, end: 100 }
      }

      const currentRange = phaseRanges[currentPhase]
      const phaseWidth = currentRange.end - currentRange.start
      const phasePosition = progress - currentRange.start
      const phaseProgressValue = (phasePosition / phaseWidth) * 100

      setPhaseProgress(Math.min(Math.max(phaseProgressValue, 0), 100))
    }, 1000)
  }

  // Pausar sesión
  const pauseSession = () => {
    setIsRunning(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  // Reanudar sesión
  const resumeSession = () => {
    setIsRunning(true)
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Finalizar sesión
          clearInterval(timerRef.current!)
          setIsRunning(false)
          setShowCompletionDialog(true)
          return 0
        }
        return prev - 1
      })

      setElapsedTime(prev => prev + 1)
    }, 1000)
  }

  // Finalizar sesión
  const completeSession = async () => {
    try {
      // Guardar sesión en Supabase
      const sessionData = {
        user_id: userId,
        exercise_id: sessionLog.exerciseId,
        duration: selectedExercise.duration,
        stress_before: sessionLog.stressBefore,
        stress_after: sessionLog.stressAfter,
        notes: sessionLog.notes,
        rating: sessionLog.rating,
        date: new Date().toISOString()
      }

      const response = await fetch('/api/mindfulness/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      })

      if (!response.ok) {
        throw new Error('Error al guardar sesión')
      }

      // Actualizar sesiones recientes
      const { data: sessionsData } = await fetch(`/api/mindfulness/sessions?userId=${userId}&limit=5`).then(res => res.json())

      if (sessionsData) {
        setRecentSessions(sessionsData)
      }

      // Actualizar estadísticas
      const { data: statsData } = await fetch(`/api/mindfulness/stats?userId=${userId}`).then(res => res.json())

      if (statsData) {
        setMindfulnessStats(statsData)
      }

      // Cerrar diálogos
      setShowCompletionDialog(false)
      setShowSessionDialog(false)

      // Mostrar mensaje de éxito
      useToast().toast({
        title: "Sesión completada",
        description: "Tu sesión de mindfulness ha sido registrada correctamente.",
      })
    } catch (error) {
      console.error("Error al completar sesión:", error)
      useToast().toast({
        title: "Error",
        description: "No se pudo guardar la sesión. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Obtener instrucción según la fase actual
  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'preparation':
        return "Prepárate. Encuentra una posición cómoda y respira profundamente."
      case 'focus':
        return "Enfoca tu atención en tu respiración. Nota cada inhalación y exhalación."
      case 'deepening':
        return "Profundiza tu práctica. Observa tus pensamientos sin juzgarlos."
      case 'integration':
        return "Integra la experiencia. Prepárate para volver gradualmente."
      default:
        return "Respira conscientemente"
    }
  }

  // Formatear tiempo (segundos a MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Filtrar ejercicios según categoría, dificultad y duración
  const filteredExercises = exercises.filter(exercise => {
    const categoryMatch = selectedCategory === 'all' || exercise.category === selectedCategory
    const difficultyMatch = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty
    const durationMatch = selectedDuration === 0 || exercise.duration <= selectedDuration
    return categoryMatch && difficultyMatch && durationMatch
  })

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="guided">Guiadas</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="recommendations">Para ti</TabsTrigger>
        </TabsList>

        <TabsContent value="guided" className="space-y-4">
          {/* Filtros */}
          <Card3D>
            <Card3DHeader>
              <div className="flex items-center justify-between">
                <Card3DTitle>Ejercicios de mindfulness</Card3DTitle>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card3DHeader>
            <Card3DContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category" className="text-sm font-medium mb-2 block">Categoría</Label>
                  <select
                    id="category"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">Todas</option>
                    <option value="breathing">Respiración</option>
                    <option value="body_scan">Body scan</option>
                    <option value="visualization">Visualización</option>
                    <option value="loving_kindness">Compasión</option>
                    <option value="mindful_movement">Movimiento</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="difficulty" className="text-sm font-medium mb-2 block">Dificultad</Label>
                  <select
                    id="difficulty"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                  >
                    <option value="all">Todas</option>
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="duration" className="text-sm font-medium mb-2 block">Duración máxima</Label>
                  <select
                    id="duration"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                  >
                    <option value="0">Cualquiera</option>
                    <option value="5">5 minutos</option>
                    <option value="10">10 minutos</option>
                    <option value="15">15 minutos</option>
                    <option value="20">20 minutos</option>
                    <option value="30">30 minutos</option>
                  </select>
                </div>
              </div>
            </Card3DContent>
          </Card3D>

          {/* Lista de ejercicios */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card3D key={i} className="animate-pulse">
                  <Card3DHeader>
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                  </Card3DHeader>
                  <Card3DContent>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </Card3DContent>
                </Card3D>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExercises.length === 0 ? (
                <Card3D>
                  <Card3DContent className="py-8 text-center">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No se encontraron ejercicios</h3>
                    <p className="text-sm text-muted-foreground">
                      Prueba con diferentes filtros o vuelve más tarde.
                    </p>
                  </Card3DContent>
                </Card3D>
              ) : (
                filteredExercises.map((exercise) => (
                  <Card3D key={exercise.id} className="overflow-hidden">
                    <Card3DHeader>
                      <div className="flex justify-between items-center">
                        <Card3DTitle>{exercise.title}</Card3DTitle>
                        <div className="flex space-x-2">
                          <Badge variant="outline">{exercise.duration} min</Badge>
                          <Badge variant="outline" className="capitalize">
                            {exercise.difficulty === 'beginner' ? 'Principiante' :
                             exercise.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                          </Badge>
                        </div>
                      </div>
                    </Card3DHeader>
                    <Card3DContent>
                      <p className="text-sm text-muted-foreground mb-4">{exercise.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {exercise.benefits.map((benefit: string, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-primary/10">
                            {benefit}
                          </Badge>
                        ))}
                      </div>

                      <Button3D onClick={() => startExercise(exercise)}>
                        <Play className="h-4 w-4 mr-2" />
                        Comenzar
                      </Button3D>
                    </Card3DContent>
                  </Card3D>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Estadísticas de mindfulness</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <h3 className="text-3xl font-bold mb-1">{mindfulnessStats.totalSessions}</h3>
                  <p className="text-sm text-muted-foreground">Sesiones totales</p>
                </div>

                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <h3 className="text-3xl font-bold mb-1">{mindfulnessStats.totalMinutes}</h3>
                  <p className="text-sm text-muted-foreground">Minutos de práctica</p>
                </div>

                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <h3 className="text-3xl font-bold mb-1">{mindfulnessStats.averageStressReduction.toFixed(1)}</h3>
                  <p className="text-sm text-muted-foreground">Reducción de estrés promedio</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Insights</h3>

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
                        <Sparkles className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                        <p className="text-sm">
                          <span className="font-medium">Ejercicio más efectivo:</span>{" "}
                          {mindfulnessStats.mostEffectiveExercise}
                        </p>
                      </div>
                    )}

                    <div className="flex items-start">
                      <Flame className="h-4 w-4 text-orange-500 mr-2 mt-0.5" />
                      <p className="text-sm">
                        <span className="font-medium">Racha actual:</span>{" "}
                        {mindfulnessStats.lastWeekSessions} sesiones en la última semana
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card3DContent>
          </Card3D>

          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Sesiones recientes</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              {recentSessions.length === 0 ? (
                <div className="text-center py-6">
                  <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Sin sesiones recientes</h3>
                  <p className="text-sm text-gray-500">
                    Comienza tu primera sesión de mindfulness para ver tu progreso aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{session.exercise_title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.date).toLocaleDateString()} • {session.duration} min
                          </p>
                        </div>
                        <Badge variant={session.stress_reduction > 3 ? "success" : "secondary"}>
                          {session.stress_reduction > 0 ? `−${session.stress_reduction}` : '0'} estrés
                        </Badge>
                      </div>
                      {session.notes && (
                        <p className="text-sm italic text-muted-foreground">"{session.notes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card3DContent>
          </Card3D>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Recomendaciones personalizadas</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              {personalizedRecommendations.length === 0 ? (
                <div className="text-center py-6">
                  <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Sin recomendaciones personalizadas</h3>
                  <p className="text-sm text-gray-500">
                    Completa más sesiones para recibir recomendaciones adaptadas a ti.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {personalizedRecommendations.map((recommendation) => (
                    <Card3D key={recommendation.id} className="bg-primary/5 border-primary/20">
                      <Card3DHeader>
                        <div className="flex justify-between items-center">
                          <Card3DTitle>{recommendation.title}</Card3DTitle>
                          <Badge variant="outline" className="bg-primary/10">
                            {recommendation.duration} min
                          </Badge>
                        </div>
                      </Card3DHeader>
                      <Card3DContent>
                        <p className="text-sm text-muted-foreground mb-4">{recommendation.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {recommendation.benefits.map((benefit: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-primary/10">
                              {benefit}
                            </Badge>
                          ))}
                        </div>

                        <Button3D onClick={() => startExercise(recommendation)}>
                          <Play className="h-4 w-4 mr-2" />
                          Comenzar
                        </Button3D>
                      </Card3DContent>
                    </Card3D>
                  ))}
                </div>
              )}
            </Card3DContent>
          </Card3D>
        </TabsContent>
      </Tabs>

      {/* Diálogo de sesión */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedExercise?.title}</DialogTitle>
          </DialogHeader>

          {!isRunning && timeRemaining === (selectedExercise?.duration || 0) * 60 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stress-before" className="text-sm font-medium">¿Cuál es tu nivel de estrés actual? (1-10)</Label>
                <RadioGroup
                  id="stress-before"
                  value={sessionLog.stressBefore.toString()}
                  onValueChange={(value) => setSessionLog({...sessionLog, stressBefore: parseInt(value)})}
                  className="flex justify-between"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <div key={value} className="flex flex-col items-center">
                      <RadioGroupItem
                        value={value.toString()}
                        id={`stress-before-${value}`}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={`stress-before-${value}`}
                        className={`cursor-pointer flex flex-col items-center p-2 rounded-md ${
                          sessionLog.stressBefore === value ? 'bg-primary/10 text-primary' : ''
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
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="volume" className="text-sm font-medium">Volumen</Label>
                  <Button3D
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    className="h-8 w-8"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button3D>
                </div>
                <Slider
                  id="volume"
                  min={0}
                  max={100}
                  step={1}
                  value={[volume]}
                  onValueChange={(values) => setVolume(values[0])}
                  disabled={isMuted}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button3D variant="outline" onClick={() => setShowSessionDialog(false)}>
                  Cancelar
                </Button3D>
                <Button3D onClick={startSession}>
                  <Play className="h-4 w-4 mr-2" />
                  Comenzar
                </Button3D>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold mb-1">{getPhaseInstruction()}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentPhase === 'preparation' ? 'Fase de preparación' :
                   currentPhase === 'focus' ? 'Fase de enfoque' :
                   currentPhase === 'deepening' ? 'Fase de profundización' :
                   'Fase de integración'}
                </p>
              </div>

              <div className="mb-4">
                <Progress3D value={phaseProgress} className="h-3" />
              </div>

              <div className="flex justify-between items-center text-sm text-muted-foreground mb-6">
                <span>Tiempo restante: {formatTime(timeRemaining)}</span>
                <span>Total: {formatTime(elapsedTime)} / {formatTime((selectedExercise?.duration || 0) * 60)}</span>
              </div>

              <div className="flex justify-center space-x-3">
                {!isRunning ? (
                  <Button3D onClick={resumeSession}>
                    <Play className="h-4 w-4 mr-2" />
                    Continuar
                  </Button3D>
                ) : (
                  <Button3D onClick={pauseSession}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </Button3D>
                )}

                <Button3D variant="outline" onClick={() => {
                  pauseSession();
                  setShowCompletionDialog(true);
                }}>
                  <SkipForward className="h-4 w-4 mr-2" />
                  Finalizar
                </Button3D>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de finalización */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sesión completada</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stress-after" className="text-sm font-medium">¿Cuál es tu nivel de estrés ahora? (1-10)</Label>
              <RadioGroup
                id="stress-after"
                value={sessionLog.stressAfter.toString()}
                onValueChange={(value) => setSessionLog({...sessionLog, stressAfter: parseInt(value)})}
                className="flex justify-between"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <RadioGroupItem
                      value={value.toString()}
                      id={`stress-after-${value}`}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`stress-after-${value}`}
                      className={`cursor-pointer flex flex-col items-center p-2 rounded-md ${
                        sessionLog.stressAfter === value ? 'bg-primary/10 text-primary' : ''
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating" className="text-sm font-medium">¿Cómo calificarías esta sesión? (1-5)</Label>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button3D
                    key={value}
                    variant={sessionLog.rating === value ? "default" : "outline"}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setSessionLog({...sessionLog, rating: value})}
                  >
                    {value}
                  </Button3D>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="¿Cómo te sentiste durante la sesión? ¿Qué observaste?"
                value={sessionLog.notes}
                onChange={(e) => setSessionLog({...sessionLog, notes: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button3D variant="outline" onClick={() => {
                setShowCompletionDialog(false);
                resumeSession();
              }}>
                Volver
              </Button3D>
              <Button3D onClick={completeSession}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button3D>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
