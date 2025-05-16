"use client"

import { useState, useEffect, useRef } from "react"
import {
  Wind,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Save,
  Clock,
  Heart,
  Brain,
  Sparkles,
  AlertTriangle,
  Check
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { v4 as uuidv4 } from 'uuid'

interface BreathingExerciseProps {
  userId: string
  className?: string
}

interface BreathingSession {
  id: string
  userId: string
  technique: string
  duration: number
  date: string
  completed: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

interface BreathingTechnique {
  id: string
  name: string
  description: string
  inhaleTime: number
  holdInTime: number
  exhaleTime: number
  holdOutTime: number
  cycles: number
  benefits: string[]
}

export function BreathingExercise({
  userId,
  className
}: BreathingExerciseProps) {
  // Técnicas de respiración predefinidas
  const breathingTechniques: BreathingTechnique[] = [
    {
      id: "box-breathing",
      name: "Respiración cuadrada",
      description: "Inhala, mantén, exhala y mantén, todo por la misma duración. Ideal para reducir el estrés y mejorar la concentración.",
      inhaleTime: 4,
      holdInTime: 4,
      exhaleTime: 4,
      holdOutTime: 4,
      cycles: 10,
      benefits: ["Reduce estrés", "Mejora concentración", "Calma la mente"]
    },
    {
      id: "wim-hof",
      name: "Método Wim Hof",
      description: "Respiraciones profundas seguidas de retención del aliento. Aumenta la energía y fortalece el sistema inmunológico.",
      inhaleTime: 2,
      holdInTime: 0,
      exhaleTime: 2,
      holdOutTime: 0,
      cycles: 30,
      benefits: ["Aumenta energía", "Fortalece inmunidad", "Mejora resistencia"]
    },
    {
      id: "4-7-8",
      name: "Técnica 4-7-8",
      description: "Inhala por 4 segundos, mantén por 7 y exhala por 8. Excelente para conciliar el sueño y reducir la ansiedad.",
      inhaleTime: 4,
      holdInTime: 7,
      exhaleTime: 8,
      holdOutTime: 0,
      cycles: 8,
      benefits: ["Mejora sueño", "Reduce ansiedad", "Equilibra emociones"]
    },
    {
      id: "coherent-breathing",
      name: "Respiración coherente",
      description: "Respiración lenta y rítmica a 5-6 respiraciones por minuto. Equilibra el sistema nervioso y mejora la variabilidad de la frecuencia cardíaca.",
      inhaleTime: 5,
      holdInTime: 0,
      exhaleTime: 5,
      holdOutTime: 0,
      cycles: 12,
      benefits: ["Equilibra sistema nervioso", "Mejora ritmo cardíaco", "Reduce presión arterial"]
    }
  ]
  
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique>(breathingTechniques[0])
  const [isRunning, setIsRunning] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'holdIn' | 'exhale' | 'holdOut'>('inhale')
  const [currentCycle, setCurrentCycle] = useState(1)
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(70)
  const [recentSessions, setRecentSessions] = useState<BreathingSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Cargar sesiones recientes
  useEffect(() => {
    const loadRecentSessions = async () => {
      setIsLoading(true)
      
      try {
        const { data, error } = await supabase
          .from('breathing_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (error) {
          throw error
        }
        
        // Transformar los datos al formato esperado
        const transformedSessions: BreathingSession[] = data ? data.map(session => ({
          id: session.id,
          userId: session.user_id,
          technique: session.technique,
          duration: session.duration,
          date: session.date,
          completed: session.completed,
          notes: session.notes,
          createdAt: session.created_at,
          updatedAt: session.updated_at
        })) : []
        
        setRecentSessions(transformedSessions)
      } catch (error) {
        console.error("Error al cargar sesiones recientes:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (userId) {
      loadRecentSessions()
    }
  }, [userId])
  
  // Calcular tiempo total de la técnica
  useEffect(() => {
    const cycleTime = selectedTechnique.inhaleTime + 
                      selectedTechnique.holdInTime + 
                      selectedTechnique.exhaleTime + 
                      selectedTechnique.holdOutTime
    
    const total = cycleTime * selectedTechnique.cycles
    setTotalTime(total)
  }, [selectedTechnique])
  
  // Manejar la lógica del temporizador
  useEffect(() => {
    if (!isRunning) return
    
    // Inicializar el tiempo restante para la fase actual
    if (timeLeft === 0) {
      switch (currentPhase) {
        case 'inhale':
          setTimeLeft(selectedTechnique.inhaleTime)
          break
        case 'holdIn':
          setTimeLeft(selectedTechnique.holdInTime)
          break
        case 'exhale':
          setTimeLeft(selectedTechnique.exhaleTime)
          break
        case 'holdOut':
          setTimeLeft(selectedTechnique.holdOutTime)
          break
      }
    }
    
    // Reproducir sonido al cambiar de fase
    if (!isMuted && timeLeft === getPhaseTime(currentPhase)) {
      playSound(currentPhase)
    }
    
    timerRef.current = setTimeout(() => {
      if (timeLeft > 1) {
        // Decrementar el tiempo restante
        setTimeLeft(timeLeft - 1)
        setElapsedTime(elapsedTime + 1)
      } else {
        // Pasar a la siguiente fase
        let nextPhase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut' = 'inhale'
        let nextCycle = currentCycle
        
        switch (currentPhase) {
          case 'inhale':
            nextPhase = selectedTechnique.holdInTime > 0 ? 'holdIn' : 'exhale'
            break
          case 'holdIn':
            nextPhase = 'exhale'
            break
          case 'exhale':
            nextPhase = selectedTechnique.holdOutTime > 0 ? 'holdOut' : 'inhale'
            if (selectedTechnique.holdOutTime === 0) {
              nextCycle = currentCycle < selectedTechnique.cycles ? currentCycle + 1 : currentCycle
            }
            break
          case 'holdOut':
            nextPhase = 'inhale'
            nextCycle = currentCycle < selectedTechnique.cycles ? currentCycle + 1 : currentCycle
            break
        }
        
        // Verificar si hemos completado todos los ciclos
        if (nextCycle > selectedTechnique.cycles) {
          completeExercise()
          return
        }
        
        // Actualizar estado para la siguiente fase
        setCurrentPhase(nextPhase)
        setCurrentCycle(nextCycle)
        setTimeLeft(0) // Se reiniciará en el próximo ciclo
      }
    }, 1000)
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isRunning, timeLeft, currentPhase, currentCycle, elapsedTime, selectedTechnique, isMuted])
  
  // Obtener duración de la fase actual
  const getPhaseTime = (phase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut') => {
    switch (phase) {
      case 'inhale': return selectedTechnique.inhaleTime
      case 'holdIn': return selectedTechnique.holdInTime
      case 'exhale': return selectedTechnique.exhaleTime
      case 'holdOut': return selectedTechnique.holdOutTime
      default: return 0
    }
  }
  
  // Reproducir sonido según la fase
  const playSound = (phase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut') => {
    if (!audioRef.current) return
    
    // Ajustar volumen
    audioRef.current.volume = volume / 100
    
    // Reproducir sonido
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(error => {
      console.error("Error al reproducir sonido:", error)
    })
  }
  
  // Iniciar ejercicio
  const startExercise = () => {
    setIsRunning(true)
    setCurrentPhase('inhale')
    setCurrentCycle(1)
    setTimeLeft(0)
    setElapsedTime(0)
  }
  
  // Pausar ejercicio
  const pauseExercise = () => {
    setIsRunning(false)
  }
  
  // Reiniciar ejercicio
  const resetExercise = () => {
    setIsRunning(false)
    setCurrentPhase('inhale')
    setCurrentCycle(1)
    setTimeLeft(0)
    setElapsedTime(0)
  }
  
  // Completar ejercicio
  const completeExercise = async () => {
    setIsRunning(false)
    
    try {
      // Guardar sesión en Supabase
      const sessionData = {
        id: uuidv4(),
        user_id: userId,
        technique: selectedTechnique.id,
        duration: elapsedTime,
        date: new Date().toISOString(),
        completed: true
      }
      
      const { data, error } = await supabase
        .from('breathing_sessions')
        .insert(sessionData)
      
      if (error) {
        throw error
      }
      
      // Actualizar sesiones recientes
      const newSession: BreathingSession = {
        id: sessionData.id,
        userId: sessionData.user_id,
        technique: sessionData.technique,
        duration: sessionData.duration,
        date: sessionData.date,
        completed: sessionData.completed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setRecentSessions([newSession, ...recentSessions.slice(0, 4)])
      
      toast({
        title: "¡Ejercicio completado!",
        description: `Has completado ${selectedTechnique.cycles} ciclos de ${selectedTechnique.name}`,
        variant: "default"
      })
    } catch (error) {
      console.error("Error al guardar sesión:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la sesión",
        variant: "destructive"
      })
    }
    
    resetExercise()
  }
  
  // Obtener texto de instrucción según la fase
  const getInstructionText = () => {
    switch (currentPhase) {
      case 'inhale': return 'Inhala lentamente'
      case 'holdIn': return 'Mantén el aire'
      case 'exhale': return 'Exhala lentamente'
      case 'holdOut': return 'Mantén los pulmones vacíos'
      default: return 'Prepárate'
    }
  }
  
  // Calcular progreso total
  const calculateProgress = () => {
    if (totalTime === 0) return 0
    return (elapsedTime / totalTime) * 100
  }
  
  // Calcular progreso de la fase actual
  const calculatePhaseProgress = () => {
    const phaseTime = getPhaseTime(currentPhase)
    if (phaseTime === 0) return 0
    
    const phaseElapsed = phaseTime - timeLeft
    return (phaseElapsed / phaseTime) * 100
  }
  
  // Formatear tiempo (segundos a MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card3D className={className}>
        <Card3DHeader>
          <Card3DTitle>Ejercicios de respiración</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  return (
    <Card3D className={className}>
      <Card3DHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Wind className="h-5 w-5 text-primary mr-2" />
            <Card3DTitle>Ejercicios de respiración</Card3DTitle>
          </div>
          
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button3D 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button3D>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isMuted ? "Activar sonido" : "Silenciar"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button3D 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button3D>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configuración</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Card3DHeader>
      
      <Card3DContent>
        {/* Selector de técnica */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Técnica de respiración</label>
          <Select
            value={selectedTechnique.id}
            onValueChange={(value) => {
              const technique = breathingTechniques.find(t => t.id === value)
              if (technique) {
                setSelectedTechnique(technique)
                resetExercise()
              }
            }}
            disabled={isRunning}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {breathingTechniques.map(technique => (
                <SelectItem key={technique.id} value={technique.id}>
                  {technique.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <p className="text-sm text-gray-600 mt-2">
            {selectedTechnique.description}
          </p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedTechnique.benefits.map((benefit, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {benefit}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Visualización del ejercicio */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold mb-1">{getInstructionText()}</h3>
            <p className="text-sm text-gray-500">
              Ciclo {currentCycle} de {selectedTechnique.cycles}
            </p>
          </div>
          
          <div className="mb-4">
            <Progress3D value={calculatePhaseProgress()} className="h-3" />
          </div>
          
          <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
            <span>Fase actual: {timeLeft}s</span>
            <span>Total: {formatTime(elapsedTime)} / {formatTime(totalTime)}</span>
          </div>
          
          <div className="flex justify-center space-x-3">
            {!isRunning ? (
              <Button3D onClick={startExercise}>
                <Play className="h-4 w-4 mr-2" />
                {elapsedTime > 0 ? "Continuar" : "Comenzar"}
              </Button3D>
            ) : (
              <Button3D onClick={pauseExercise}>
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </Button3D>
            )}
            
            <Button3D variant="outline" onClick={resetExercise}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button3D>
          </div>
        </div>
        
        {/* Sesiones recientes */}
        <div>
          <h3 className="text-sm font-medium mb-2">Sesiones recientes</h3>
          
          {recentSessions.length > 0 ? (
            <div className="space-y-2">
              {recentSessions.map(session => {
                const technique = breathingTechniques.find(t => t.id === session.technique)
                
                return (
                  <div key={session.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{technique?.name || session.technique}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.date).toLocaleDateString()} • {formatTime(session.duration)}
                        </p>
                      </div>
                      
                      <Badge variant={session.completed ? "default" : "outline"}>
                        {session.completed ? "Completado" : "Parcial"}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <Wind className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sin sesiones</h3>
              <p className="text-sm text-gray-500">
                Completa tu primer ejercicio de respiración.
              </p>
            </div>
          )}
        </div>
      </Card3DContent>
      
      {/* Diálogo de configuración */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración</DialogTitle>
            <DialogDescription>
              Personaliza tu experiencia de respiración.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Volumen</label>
              <div className="flex items-center space-x-4">
                <VolumeX className="h-4 w-4 text-gray-500" />
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Volume2 className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Sonidos</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="mute-toggle"
                  checked={!isMuted}
                  onChange={() => setIsMuted(!isMuted)}
                  className="mr-2"
                />
                <label htmlFor="mute-toggle" className="text-sm">
                  Reproducir sonidos de guía
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button3D onClick={() => setShowSettings(false)}>
              Guardar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Elemento de audio (oculto) */}
      <audio ref={audioRef} src="/sounds/bell.mp3" />
    </Card3D>
  )
}
