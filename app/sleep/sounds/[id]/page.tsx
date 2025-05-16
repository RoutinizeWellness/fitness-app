"use client"

import { useState, useEffect, use } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft, Play, Pause, Volume2,
  Clock, Heart, Share2, Download,
  Moon, Plus, Minus
} from "lucide-react"
import { Button3D } from "@/components/ui/button-3d"
import { Card3D } from "@/components/ui/card-3d"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"

export default function SleepSoundPage() {
  const router = useRouter()
  const params = useParams()
  // Usar React.use() para desenvolver los parámetros
  const unwrappedParams = use(params)
  const { toast } = useToast()
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(70)
  const [duration, setDuration] = useState(30) // Duración en minutos
  const [timeRemaining, setTimeRemaining] = useState(30 * 60) // Tiempo restante en segundos
  const [isFavorite, setIsFavorite] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  // Datos para los sonidos para dormir
  const sleepSounds = [
    {
      id: "sound1",
      title: "Lluvia suave",
      duration: "45 min",
      icon: "🌧️",
      color: "bg-blue-100 text-blue-600",
      audioUrl: "/sounds/rain.mp3", // Archivo de audio (deberías agregar estos archivos)
      description: "Sonido relajante de lluvia suave cayendo sobre un tejado"
    },
    {
      id: "sound2",
      title: "Ruido blanco",
      duration: "60 min",
      icon: "🌊",
      color: "bg-gray-100 text-gray-600",
      audioUrl: "/sounds/white-noise.mp3",
      description: "Ruido blanco constante para bloquear distracciones"
    },
    {
      id: "sound3",
      title: "Bosque nocturno",
      duration: "30 min",
      icon: "🌲",
      color: "bg-green-100 text-green-600",
      audioUrl: "/sounds/forest.mp3",
      description: "Sonidos nocturnos de un bosque tranquilo con grillos y viento suave"
    },
    {
      id: "sound4",
      title: "Melodía relajante",
      duration: "40 min",
      icon: "🎵",
      color: "bg-purple-100 text-purple-600",
      audioUrl: "/sounds/melody.mp3",
      description: "Melodía instrumental suave para ayudarte a conciliar el sueño"
    }
  ]

  // Obtener el sonido actual
  const currentSound = sleepSounds.find(sound => sound.id === unwrappedParams.id) || sleepSounds[0]

  // Iniciar o detener la reproducción
  const togglePlayback = () => {
    if (isPlaying) {
      // Detener reproducción
      if (audio) {
        audio.pause()
      }
      setIsPlaying(false)
      toast({
        title: "Reproducción pausada",
        description: `Has pausado "${currentSound.title}"`,
      })
    } else {
      // Iniciar reproducción
      // En una implementación real, cargaríamos el archivo de audio
      // const newAudio = new Audio(currentSound.audioUrl)
      // newAudio.volume = volume / 100
      // newAudio.loop = true
      // newAudio.play()
      // setAudio(newAudio)

      setIsPlaying(true)
      toast({
        title: "Reproduciendo",
        description: `Reproduciendo "${currentSound.title}"`,
      })
    }
  }

  // Manejar cambios de volumen
  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0]
    setVolume(vol)
    if (audio) {
      audio.volume = vol / 100
    }
  }

  // Manejar cambios de duración
  const increaseDuration = () => {
    if (duration < 120) { // Máximo 2 horas
      setDuration(prev => prev + 5)
      setTimeRemaining(prev => prev + 5 * 60)
    }
  }

  const decreaseDuration = () => {
    if (duration > 5) { // Mínimo 5 minutos
      setDuration(prev => prev - 5)
      setTimeRemaining(prev => prev - 5 * 60)
    }
  }

  // Formatear tiempo restante
  const formatTimeRemaining = () => {
    const hours = Math.floor(timeRemaining / 3600)
    const minutes = Math.floor((timeRemaining % 3600) / 60)
    const seconds = timeRemaining % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }

  // Temporizador para actualizar el tiempo restante
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isPlaying && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setIsPlaying(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
      if (audio) {
        audio.pause()
        audio.src = ""
      }
    }
  }, [isPlaying, timeRemaining, audio])

  return (
    <div className="container max-w-md mx-auto py-6 px-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <Button3D variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button3D>
        <h1 className="text-xl font-bold gradient-text">Sonido para dormir</h1>
        <div className="w-9"></div> {/* Espaciador para centrar el título */}
      </div>

      {/* Tarjeta principal */}
      <Card3D className="overflow-hidden mb-6">
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-90`}></div>
          <div className="relative p-6 text-white">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-6xl mb-4">{currentSound.icon}</div>
              <h2 className="text-xl font-bold mb-1">{currentSound.title}</h2>
              <p className="text-sm text-white/80 text-center mb-6">{currentSound.description}</p>

              <div className="flex items-center space-x-3 mb-8">
                <Button3D
                  variant="glass"
                  size="icon"
                  className="h-10 w-10 text-white border-white/30"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-white' : ''}`} />
                </Button3D>

                <Button3D
                  variant="glass"
                  size="icon"
                  className="h-16 w-16 text-white border-white/30"
                  onClick={togglePlayback}
                >
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                </Button3D>

                <Button3D
                  variant="glass"
                  size="icon"
                  className="h-10 w-10 text-white border-white/30"
                  onClick={() => {
                    toast({
                      title: "Compartido",
                      description: "Enlace copiado al portapapeles",
                    })
                  }}
                >
                  <Share2 className="h-5 w-5" />
                </Button3D>
              </div>

              {isPlaying && (
                <div className="text-center mb-4">
                  <p className="text-sm text-white/80 mb-1">Tiempo restante</p>
                  <p className="text-2xl font-bold">{formatTimeRemaining()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card3D>

      {/* Controles */}
      <Card3D className="p-4 mb-6">
        <h3 className="font-medium mb-4">Volumen</h3>
        <div className="flex items-center space-x-3 mb-6">
          <Volume2 className="h-4 w-4 text-gray-400" />
          <Slider
            value={[volume]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
        </div>

        <h3 className="font-medium mb-4">Duración</h3>
        <div className="flex items-center justify-between">
          <Button3D
            variant="outline"
            size="icon"
            onClick={decreaseDuration}
            disabled={duration <= 5}
          >
            <Minus className="h-4 w-4" />
          </Button3D>

          <div className="text-center">
            <span className="text-xl font-bold">{duration}</span>
            <span className="text-sm text-gray-500 ml-1">min</span>
          </div>

          <Button3D
            variant="outline"
            size="icon"
            onClick={increaseDuration}
            disabled={duration >= 120}
          >
            <Plus className="h-4 w-4" />
          </Button3D>
        </div>
      </Card3D>

      {/* Sugerencias */}
      <h3 className="font-medium mb-4">Sonidos similares</h3>
      <div className="grid grid-cols-2 gap-4">
        {sleepSounds.filter(sound => sound.id !== unwrappedParams.id).slice(0, 2).map((sound) => (
          <Card3D
            key={sound.id}
            className="p-4 text-center cursor-pointer"
            onClick={() => router.push(`/sleep/sounds/${sound.id}`)}
          >
            <div className="text-3xl mb-2">{sound.icon}</div>
            <h3 className="font-medium text-sm">{sound.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{sound.duration}</p>
          </Card3D>
        ))}
      </div>
    </div>
  )
}
