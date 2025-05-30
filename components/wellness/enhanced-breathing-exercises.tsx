"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Settings, 
  Wind, 
  Heart,
  Timer,
  Mic,
  MicOff
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface BreathingExercise {
  id: string
  name: string
  description: string
  inhaleTime: number
  holdTime: number
  exhaleTime: number
  cycles: number
  benefits: string[]
}

interface BackgroundSound {
  id: string
  name: string
  url: string
  volume: number
}

const breathingExercises: BreathingExercise[] = [
  {
    id: "box-breathing",
    name: "Respiración Cuadrada",
    description: "Técnica utilizada por Navy SEALs para mantener la calma bajo presión",
    inhaleTime: 4,
    holdTime: 4,
    exhaleTime: 4,
    cycles: 8,
    benefits: ["Reduce estrés", "Mejora concentración", "Calma el sistema nervioso"]
  },
  {
    id: "wim-hof",
    name: "Método Wim Hof",
    description: "Técnica de respiración para aumentar energía y resistencia al frío",
    inhaleTime: 2,
    holdTime: 0,
    exhaleTime: 1,
    cycles: 30,
    benefits: ["Aumenta energía", "Fortalece sistema inmune", "Mejora resistencia"]
  },
  {
    id: "4-7-8",
    name: "Respiración 4-7-8",
    description: "Técnica relajante desarrollada por el Dr. Andrew Weil",
    inhaleTime: 4,
    holdTime: 7,
    exhaleTime: 8,
    cycles: 4,
    benefits: ["Induce relajación", "Ayuda a dormir", "Reduce ansiedad"]
  },
  {
    id: "coherent",
    name: "Respiración Coherente",
    description: "Respiración equilibrada para sincronizar corazón y mente",
    inhaleTime: 5,
    holdTime: 0,
    exhaleTime: 5,
    cycles: 12,
    benefits: ["Equilibra sistema nervioso", "Mejora variabilidad cardíaca", "Reduce presión arterial"]
  }
]

const backgroundSounds: BackgroundSound[] = [
  { id: "none", name: "Sin sonido", url: "", volume: 0 },
  { id: "ocean", name: "Olas del océano", url: "/sounds/ocean-waves.mp3", volume: 0.5 },
  { id: "rain", name: "Lluvia suave", url: "/sounds/gentle-rain.mp3", volume: 0.5 },
  { id: "forest", name: "Bosque", url: "/sounds/forest-ambience.mp3", volume: 0.5 },
  { id: "wind", name: "Viento suave", url: "/sounds/gentle-wind.mp3", volume: 0.5 },
  { id: "birds", name: "Canto de pájaros", url: "/sounds/birds-chirping.mp3", volume: 0.5 }
]

export default function EnhancedBreathingExercises() {
  const { toast } = useToast()
  
  // Estados principales
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise>(breathingExercises[0])
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentCycle, setCurrentCycle] = useState(0)
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [progress, setProgress] = useState(0)

  // Estados de configuración
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [backgroundSound, setBackgroundSound] = useState<BackgroundSound>(backgroundSounds[0])
  const [soundVolume, setSoundVolume] = useState(50)
  const [voiceVolume, setVoiceVolume] = useState(70)
  const [showSettings, setShowSettings] = useState(false)

  // Referencias
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Configuración de voz
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)

  // Cargar voces disponibles
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      const spanishVoices = availableVoices.filter(voice => 
        voice.lang.startsWith('es') || voice.name.toLowerCase().includes('spanish')
      )
      setVoices(spanishVoices.length > 0 ? spanishVoices : availableVoices.slice(0, 5))
      
      if (spanishVoices.length > 0) {
        setSelectedVoice(spanishVoices[0])
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0])
      }
    }

    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  // Función para hablar
  const speak = (text: string) => {
    if (!voiceEnabled || !selectedVoice) return

    // Cancelar cualquier síntesis anterior
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = selectedVoice
    utterance.volume = voiceVolume / 100
    utterance.rate = 0.8
    utterance.pitch = 1

    speechSynthesisRef.current = utterance
    speechSynthesis.speak(utterance)
  }

  // Configurar audio de fondo
  useEffect(() => {
    if (backgroundSound.url && backgroundSound.id !== 'none') {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      
      audioRef.current = new Audio(backgroundSound.url)
      audioRef.current.loop = true
      audioRef.current.volume = (soundVolume / 100) * backgroundSound.volume
      
      if (isActive && !isPaused) {
        audioRef.current.play().catch(console.error)
      }
    } else if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [backgroundSound, soundVolume])

  // Actualizar volumen del audio de fondo
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (soundVolume / 100) * backgroundSound.volume
    }
  }, [soundVolume, backgroundSound.volume])

  // Lógica principal del ejercicio
  useEffect(() => {
    if (!isActive || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
      return
    }

    // Reproducir audio de fondo
    if (audioRef.current) {
      audioRef.current.play().catch(console.error)
    }

    const totalPhaseTime = getCurrentPhaseTime()
    setTimeRemaining(totalPhaseTime)

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Cambiar a la siguiente fase
          nextPhase()
          return getCurrentPhaseTime()
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, isPaused, currentPhase, currentCycle])

  const getCurrentPhaseTime = (): number => {
    switch (currentPhase) {
      case 'inhale': return selectedExercise.inhaleTime
      case 'hold': return selectedExercise.holdTime
      case 'exhale': return selectedExercise.exhaleTime
      default: return 0
    }
  }

  const nextPhase = () => {
    if (currentPhase === 'inhale') {
      if (selectedExercise.holdTime > 0) {
        setCurrentPhase('hold')
        speak('Mantén')
      } else {
        setCurrentPhase('exhale')
        speak('Exhala')
      }
    } else if (currentPhase === 'hold') {
      setCurrentPhase('exhale')
      speak('Exhala')
    } else {
      // Completar ciclo
      if (currentCycle + 1 >= selectedExercise.cycles) {
        // Ejercicio completado
        completeExercise()
        return
      }
      
      setCurrentCycle(prev => prev + 1)
      setCurrentPhase('inhale')
      speak('Inhala')
    }
  }

  const startExercise = () => {
    setIsActive(true)
    setIsPaused(false)
    setCurrentCycle(0)
    setCurrentPhase('inhale')
    setProgress(0)
    speak(`Comenzando ${selectedExercise.name}. Inhala`)
  }

  const pauseExercise = () => {
    setIsPaused(!isPaused)
    if (!isPaused) {
      speak('Pausado')
    } else {
      speak('Continuando')
    }
  }

  const stopExercise = () => {
    setIsActive(false)
    setIsPaused(false)
    setCurrentCycle(0)
    setCurrentPhase('inhale')
    setProgress(0)
    speechSynthesis.cancel()
    
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const completeExercise = () => {
    setIsActive(false)
    setProgress(100)
    speak('Ejercicio completado. Excelente trabajo.')
    
    toast({
      title: "¡Ejercicio completado!",
      description: `Has completado ${selectedExercise.cycles} ciclos de ${selectedExercise.name}`,
    })

    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  // Calcular progreso
  useEffect(() => {
    if (selectedExercise.cycles > 0) {
      const cycleProgress = (currentCycle / selectedExercise.cycles) * 100
      const phaseProgress = ((getCurrentPhaseTime() - timeRemaining) / getCurrentPhaseTime()) * (100 / selectedExercise.cycles)
      setProgress(Math.min(100, cycleProgress + phaseProgress))
    }
  }, [currentCycle, timeRemaining, selectedExercise.cycles])

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'inhale': return 'Inhala profundamente'
      case 'hold': return 'Mantén la respiración'
      case 'exhale': return 'Exhala lentamente'
      default: return 'Prepárate'
    }
  }

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale': return 'text-blue-600'
      case 'hold': return 'text-yellow-600'
      case 'exhale': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Selector de ejercicio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wind className="h-6 w-6 mr-2" />
            Ejercicios de Respiración
          </CardTitle>
          <CardDescription>
            Técnicas de respiración guiadas con instrucciones de voz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Seleccionar ejercicio</Label>
              <Select
                value={selectedExercise.id}
                onValueChange={(value) => {
                  const exercise = breathingExercises.find(ex => ex.id === value)
                  if (exercise) {
                    setSelectedExercise(exercise)
                    stopExercise()
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {breathingExercises.map(exercise => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">{selectedExercise.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{selectedExercise.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Patrón:</span> {selectedExercise.inhaleTime}-{selectedExercise.holdTime}-{selectedExercise.exhaleTime}
                </div>
                <div>
                  <span className="font-medium">Ciclos:</span> {selectedExercise.cycles}
                </div>
              </div>
              <div className="mt-3">
                <span className="font-medium text-sm">Beneficios:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedExercise.benefits.map((benefit, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualización del ejercicio */}
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Círculo de respiración animado */}
            <div className="relative w-48 h-48 mx-auto">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-blue-200"
                animate={{
                  scale: currentPhase === 'inhale' ? 1.2 : currentPhase === 'exhale' ? 0.8 : 1,
                  borderColor: currentPhase === 'inhale' ? '#3B82F6' : currentPhase === 'exhale' ? '#10B981' : '#F59E0B'
                }}
                transition={{ duration: getCurrentPhaseTime(), ease: "easeInOut" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getPhaseColor()}`}>
                    {timeRemaining}
                  </div>
                  <div className="text-sm text-gray-600">segundos</div>
                </div>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="space-y-2">
              <h3 className={`text-xl font-semibold ${getPhaseColor()}`}>
                {getPhaseInstruction()}
              </h3>
              <p className="text-gray-600">
                Ciclo {currentCycle + 1} de {selectedExercise.cycles}
              </p>
            </div>

            {/* Barra de progreso */}
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600">
                {Math.round(progress)}% completado
              </p>
            </div>

            {/* Controles */}
            <div className="flex justify-center space-x-4">
              {!isActive ? (
                <Button onClick={startExercise} size="lg" className="px-8">
                  <Play className="h-5 w-5 mr-2" />
                  Comenzar
                </Button>
              ) : (
                <>
                  <Button onClick={pauseExercise} variant="outline" size="lg">
                    {isPaused ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
                    {isPaused ? 'Continuar' : 'Pausar'}
                  </Button>
                  <Button onClick={stopExercise} variant="destructive" size="lg">
                    <Square className="h-5 w-5 mr-2" />
                    Detener
                  </Button>
                </>
              )}
              <Button onClick={() => setShowSettings(!showSettings)} variant="ghost" size="lg">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Panel de configuración */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configuración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configuración de voz */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center">
                      {voiceEnabled ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
                      Guía de voz
                    </Label>
                    <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                  </div>
                  
                  {voiceEnabled && (
                    <>
                      <div>
                        <Label>Voz</Label>
                        <Select
                          value={selectedVoice?.name || ''}
                          onValueChange={(value) => {
                            const voice = voices.find(v => v.name === value)
                            if (voice) setSelectedVoice(voice)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar voz" />
                          </SelectTrigger>
                          <SelectContent>
                            {voices.map(voice => (
                              <SelectItem key={voice.name} value={voice.name}>
                                {voice.name} ({voice.lang})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Volumen de voz: {voiceVolume}%</Label>
                        <Slider
                          value={[voiceVolume]}
                          onValueChange={(value) => setVoiceVolume(value[0])}
                          max={100}
                          step={10}
                          className="mt-2"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Configuración de sonido de fondo */}
                <div className="space-y-4">
                  <div>
                    <Label>Sonido de fondo</Label>
                    <Select
                      value={backgroundSound.id}
                      onValueChange={(value) => {
                        const sound = backgroundSounds.find(s => s.id === value)
                        if (sound) setBackgroundSound(sound)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {backgroundSounds.map(sound => (
                          <SelectItem key={sound.id} value={sound.id}>
                            {sound.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {backgroundSound.id !== 'none' && (
                    <div>
                      <Label className="flex items-center">
                        {soundVolume > 0 ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                        Volumen de fondo: {soundVolume}%
                      </Label>
                      <Slider
                        value={[soundVolume]}
                        onValueChange={(value) => setSoundVolume(value[0])}
                        max={100}
                        step={10}
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
