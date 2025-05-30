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
  Brain, 
  Heart,
  Timer,
  Mic,
  MicOff,
  SkipForward,
  SkipBack,
  Repeat
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SafeClientButton } from "@/components/ui/enhanced-button"

interface MeditationSession {
  id: string
  name: string
  description: string
  duration: number // en minutos
  category: 'mindfulness' | 'breathing' | 'body-scan' | 'loving-kindness' | 'sleep'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  instructions: string[]
  benefits: string[]
  backgroundMusic?: string
}

interface BackgroundSound {
  id: string
  name: string
  url: string
  volume: number
}

const meditationSessions: MeditationSession[] = [
  {
    id: "mindful-breathing",
    name: "Respiración Consciente",
    description: "Enfócate en tu respiración para calmar la mente",
    duration: 10,
    category: "breathing",
    difficulty: "beginner",
    instructions: [
      "Siéntate en una posición cómoda con la espalda recta",
      "Cierra los ojos suavemente",
      "Respira naturalmente y enfoca tu atención en la respiración",
      "Nota las sensaciones de cada inhalación y exhalación",
      "Si tu mente se distrae, gentilmente regresa a la respiración",
      "Continúa por toda la sesión"
    ],
    benefits: ["Reduce estrés", "Mejora concentración", "Calma la mente"]
  },
  {
    id: "body-scan",
    name: "Escaneo Corporal",
    description: "Explora las sensaciones de tu cuerpo sistemáticamente",
    duration: 15,
    category: "body-scan",
    difficulty: "intermediate",
    instructions: [
      "Acuéstate cómodamente boca arriba",
      "Cierra los ojos y respira profundamente",
      "Comienza enfocándote en los dedos de los pies",
      "Mueve tu atención lentamente por cada parte del cuerpo",
      "Nota cualquier sensación sin juzgar",
      "Termina sintiendo todo el cuerpo como un todo"
    ],
    benefits: ["Aumenta conciencia corporal", "Libera tensión", "Mejora relajación"]
  },
  {
    id: "loving-kindness",
    name: "Bondad Amorosa",
    description: "Cultiva sentimientos de amor y compasión",
    duration: 12,
    category: "loving-kindness",
    difficulty: "intermediate",
    instructions: [
      "Siéntate cómodamente y cierra los ojos",
      "Comienza enviándote amor y bondad a ti mismo",
      "Repite: 'Que sea feliz, que esté en paz'",
      "Extiende estos sentimientos a un ser querido",
      "Luego a una persona neutral",
      "Finalmente a alguien con quien tengas dificultades",
      "Termina enviando amor a todos los seres"
    ],
    benefits: ["Aumenta compasión", "Reduce emociones negativas", "Mejora relaciones"]
  },
  {
    id: "sleep-meditation",
    name: "Meditación para Dormir",
    description: "Relájate profundamente para un sueño reparador",
    duration: 20,
    category: "sleep",
    difficulty: "beginner",
    instructions: [
      "Acuéstate cómodamente en tu cama",
      "Respira lenta y profundamente",
      "Relaja cada músculo de tu cuerpo",
      "Visualiza un lugar tranquilo y seguro",
      "Deja que tu mente se aquiete gradualmente",
      "Permite que el sueño llegue naturalmente"
    ],
    benefits: ["Mejora calidad del sueño", "Reduce insomnio", "Calma la mente"]
  }
]

const backgroundSounds: BackgroundSound[] = [
  { id: "none", name: "Sin sonido", url: "", volume: 0 },
  { id: "forest", name: "Bosque tranquilo", url: "/sounds/forest-ambience.mp3", volume: 0.4 },
  { id: "ocean", name: "Olas del océano", url: "/sounds/ocean-waves.mp3", volume: 0.5 },
  { id: "rain", name: "Lluvia suave", url: "/sounds/gentle-rain.mp3", volume: 0.5 },
  { id: "tibetan", name: "Cuencos tibetanos", url: "/sounds/tibetan-bowls.mp3", volume: 0.3 },
  { id: "birds", name: "Canto de pájaros", url: "/sounds/birds-chirping.mp3", volume: 0.4 },
  { id: "wind", name: "Viento suave", url: "/sounds/gentle-wind.mp3", volume: 0.4 }
]

export default function EnhancedMeditationModule() {
  const { toast } = useToast()
  
  // Estados principales
  const [selectedSession, setSelectedSession] = useState<MeditationSession>(meditationSessions[0])
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [progress, setProgress] = useState(0)

  // Estados de configuración
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [backgroundSound, setBackgroundSound] = useState<BackgroundSound>(backgroundSounds[1])
  const [soundVolume, setSoundVolume] = useState(50)
  const [voiceVolume, setVoiceVolume] = useState(70)
  const [showSettings, setShowSettings] = useState(false)
  const [sessionCompleted, setSessionCompleted] = useState(false)

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

    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = selectedVoice
    utterance.volume = voiceVolume / 100
    utterance.rate = 0.7
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

  // Lógica principal de la meditación
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

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Avanzar al siguiente paso o completar sesión
          nextStep()
          return 0
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
  }, [isActive, isPaused, currentStep])

  const nextStep = () => {
    if (currentStep + 1 >= selectedSession.instructions.length) {
      // Sesión completada
      completeSession()
      return
    }
    
    setCurrentStep(prev => prev + 1)
    const nextInstruction = selectedSession.instructions[currentStep + 1]
    speak(nextInstruction)
    
    // Tiempo por paso (dividir duración total entre pasos)
    const timePerStep = Math.floor((selectedSession.duration * 60) / selectedSession.instructions.length)
    setTimeRemaining(timePerStep)
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      const prevInstruction = selectedSession.instructions[currentStep - 1]
      speak(prevInstruction)
      
      const timePerStep = Math.floor((selectedSession.duration * 60) / selectedSession.instructions.length)
      setTimeRemaining(timePerStep)
    }
  }

  const startSession = () => {
    setIsActive(true)
    setIsPaused(false)
    setCurrentStep(0)
    setSessionCompleted(false)
    
    const totalSeconds = selectedSession.duration * 60
    const timePerStep = Math.floor(totalSeconds / selectedSession.instructions.length)
    
    setTotalTime(totalSeconds)
    setTimeRemaining(timePerStep)
    setProgress(0)
    
    speak(`Comenzando ${selectedSession.name}. ${selectedSession.instructions[0]}`)
  }

  const pauseSession = () => {
    setIsPaused(!isPaused)
    if (!isPaused) {
      speak('Meditación pausada')
    } else {
      speak('Continuando meditación')
    }
  }

  const stopSession = () => {
    setIsActive(false)
    setIsPaused(false)
    setCurrentStep(0)
    setProgress(0)
    speechSynthesis.cancel()
    
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const completeSession = () => {
    setIsActive(false)
    setSessionCompleted(true)
    setProgress(100)
    speak('Meditación completada. Excelente trabajo. Tómate un momento para notar cómo te sientes.')
    
    toast({
      title: "¡Sesión completada!",
      description: `Has completado ${selectedSession.name} de ${selectedSession.duration} minutos`,
    })

    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  // Calcular progreso
  useEffect(() => {
    if (totalTime > 0) {
      const elapsed = totalTime - timeRemaining
      const newProgress = Math.min(100, (elapsed / totalTime) * 100)
      setProgress(newProgress)
    }
  }, [timeRemaining, totalTime])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600'
      case 'intermediate': return 'text-yellow-600'
      case 'advanced': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breathing': return <Heart className="h-4 w-4" />
      case 'body-scan': return <Brain className="h-4 w-4" />
      case 'mindfulness': return <Brain className="h-4 w-4" />
      case 'loving-kindness': return <Heart className="h-4 w-4" />
      case 'sleep': return <Timer className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Selector de sesión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-6 w-6 mr-2" />
            Meditación Guiada
          </CardTitle>
          <CardDescription>
            Sesiones de meditación con guía de voz y sonidos ambientales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Seleccionar sesión</Label>
              <Select
                value={selectedSession.id}
                onValueChange={(value) => {
                  const session = meditationSessions.find(s => s.id === value)
                  if (session) {
                    setSelectedSession(session)
                    stopSession()
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meditationSessions.map(session => (
                    <SelectItem key={session.id} value={session.id}>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(session.category)}
                        <span>{session.name} ({session.duration} min)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{selectedSession.name}</h4>
                <span className={`text-sm font-medium ${getDifficultyColor(selectedSession.difficulty)}`}>
                  {selectedSession.difficulty === 'beginner' ? 'Principiante' : 
                   selectedSession.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{selectedSession.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Duración:</span> {selectedSession.duration} minutos
                </div>
                <div>
                  <span className="font-medium">Pasos:</span> {selectedSession.instructions.length}
                </div>
              </div>
              <div className="mt-3">
                <span className="font-medium text-sm">Beneficios:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedSession.benefits.map((benefit, index) => (
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

      {/* Visualización de la sesión */}
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Círculo de meditación animado */}
            <div className="relative w-48 h-48 mx-auto">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-purple-200"
                animate={{
                  scale: isActive && !isPaused ? [1, 1.1, 1] : 1,
                  borderColor: isActive ? '#8B5CF6' : '#E5E7EB'
                }}
                transition={{ duration: 4, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {isActive ? `Paso ${currentStep + 1} de ${selectedSession.instructions.length}` : 'Listo para comenzar'}
                  </div>
                </div>
              </div>
            </div>

            {/* Instrucción actual */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-purple-600">
                {isActive ? selectedSession.instructions[currentStep] : 'Presiona comenzar para iniciar'}
              </h3>
              {sessionCompleted && (
                <p className="text-green-600 font-medium">
                  ¡Sesión completada! Tómate un momento para reflexionar.
                </p>
              )}
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
                <SafeClientButton onClick={startSession} size="lg" className="px-8">
                  <Play className="h-5 w-5 mr-2" />
                  Comenzar
                </SafeClientButton>
              ) : (
                <>
                  <SafeClientButton onClick={previousStep} variant="outline" size="lg" disabled={currentStep === 0}>
                    <SkipBack className="h-5 w-5" />
                  </SafeClientButton>
                  <SafeClientButton onClick={pauseSession} variant="outline" size="lg">
                    {isPaused ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
                    {isPaused ? 'Continuar' : 'Pausar'}
                  </SafeClientButton>
                  <SafeClientButton onClick={nextStep} variant="outline" size="lg" disabled={currentStep === selectedSession.instructions.length - 1}>
                    <SkipForward className="h-5 w-5" />
                  </SafeClientButton>
                  <SafeClientButton onClick={stopSession} variant="destructive" size="lg">
                    <Square className="h-5 w-5 mr-2" />
                    Detener
                  </SafeClientButton>
                </>
              )}
              <SafeClientButton onClick={() => setShowSettings(!showSettings)} variant="ghost" size="lg">
                <Settings className="h-5 w-5" />
              </SafeClientButton>
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
                  Configuración de Audio
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
