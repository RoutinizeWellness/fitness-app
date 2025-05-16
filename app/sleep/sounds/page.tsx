"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Play, Pause, CloudRain,
  Waves, Wind, Music, Volume2, Heart,
  Clock, Plus, Search
} from "lucide-react"
import { Button3D } from "@/components/ui/button-3d"
import { Card3D } from "@/components/ui/card-3d"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"

export default function SleepSoundsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSound, setActiveSound] = useState<string | null>(null)
  const [volume, setVolume] = useState(70)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  // Datos para los sonidos para dormir
  const sleepSounds = [
    {
      id: "sound1",
      title: "Lluvia suave",
      duration: "45 min",
      icon: CloudRain,
      color: "bg-blue-100 text-blue-600",
      audioUrl: "/sounds/rain.mp3", // Archivo de audio (deberías agregar estos archivos)
      description: "Sonido relajante de lluvia suave cayendo sobre un tejado"
    },
    {
      id: "sound2",
      title: "Ruido blanco",
      duration: "60 min",
      icon: Waves,
      color: "bg-gray-100 text-gray-600",
      audioUrl: "/sounds/white-noise.mp3",
      description: "Ruido blanco constante para bloquear distracciones"
    },
    {
      id: "sound3",
      title: "Bosque nocturno",
      duration: "30 min",
      icon: Wind,
      color: "bg-green-100 text-green-600",
      audioUrl: "/sounds/forest.mp3",
      description: "Sonidos nocturnos de un bosque tranquilo con grillos y viento suave"
    },
    {
      id: "sound4",
      title: "Melodía relajante",
      duration: "40 min",
      icon: Music,
      color: "bg-purple-100 text-purple-600",
      audioUrl: "/sounds/melody.mp3",
      description: "Melodía instrumental suave para ayudarte a conciliar el sueño"
    },
    {
      id: "sound5",
      title: "Olas del mar",
      duration: "50 min",
      icon: Waves,
      color: "bg-blue-100 text-blue-600",
      audioUrl: "/sounds/ocean.mp3",
      description: "Sonido rítmico de olas rompiendo en la orilla"
    },
    {
      id: "sound6",
      title: "Tormenta lejana",
      duration: "35 min",
      icon: CloudRain,
      color: "bg-indigo-100 text-indigo-600",
      audioUrl: "/sounds/thunder.mp3",
      description: "Sonido de una tormenta a lo lejos con truenos ocasionales"
    }
  ]

  // Filtrar sonidos según la búsqueda
  const filteredSounds = sleepSounds.filter(sound =>
    sound.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sound.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Manejar la reproducción de audio
  useEffect(() => {
    // Limpiar el audio al desmontar el componente
    return () => {
      if (audio) {
        audio.pause()
        audio.src = ""
      }
    }
  }, [audio])

  const playSound = (soundId: string) => {
    const sound = sleepSounds.find(s => s.id === soundId)
    if (!sound) return

    // Si ya hay un audio reproduciéndose, detenerlo
    if (audio) {
      audio.pause()
      audio.src = ""
    }

    // Simular la reproducción (en una implementación real, usaríamos archivos de audio)
    toast({
      title: `Reproduciendo: ${sound.title}`,
      description: "El audio comenzará a reproducirse en unos segundos",
    })

    // En una implementación real, cargaríamos el archivo de audio
    // const newAudio = new Audio(sound.audioUrl)
    // newAudio.volume = volume / 100
    // newAudio.loop = true
    // newAudio.play()
    // setAudio(newAudio)

    setActiveSound(soundId)
    setIsPlaying(true)
  }

  const pauseSound = () => {
    if (audio) {
      audio.pause()
    }
    setIsPlaying(false)
  }

  const resumeSound = () => {
    if (audio) {
      audio.play()
    }
    setIsPlaying(true)
  }

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0]
    setVolume(vol)
    if (audio) {
      audio.volume = vol / 100
    }
  }

  return (
    <div className="container max-w-md mx-auto py-6 px-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <Button3D
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button3D>
        <h1 className="text-2xl font-bold gradient-text">Sonidos para dormir</h1>
        <div className="w-10"></div> {/* Espaciador para centrar el título */}
      </div>

      {/* Buscador */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-indigo-400" />
        </div>
        <Input
          placeholder="Buscar sonidos relajantes..."
          className="pl-10 border-indigo-100 focus:border-indigo-300 rounded-xl shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Reproductor (visible solo cuando hay un sonido activo) */}
      {activeSound && (
        <Card3D className="mb-8 p-0 overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">
                  {sleepSounds.find(s => s.id === activeSound)?.title}
                </h3>
                <p className="text-sm text-white/80">
                  {sleepSounds.find(s => s.id === activeSound)?.duration}
                </p>
              </div>
              <Button3D
                variant="glass"
                size="icon"
                className="h-12 w-12 text-white border-white/30 backdrop-blur-sm"
                onClick={() => isPlaying ? pauseSound() : resumeSound()}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button3D>
            </div>

            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg">
              <Volume2 className="h-4 w-4 text-white/80" />
              <Slider
                value={[volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="flex-1"
              />
              <span className="text-xs font-medium text-white/80">{volume}%</span>
            </div>
          </div>
        </Card3D>
      )}

      {/* Lista de sonidos */}
      <div className="grid grid-cols-2 gap-5">
        {filteredSounds.map((sound) => (
          <Card3D
            key={sound.id}
            className={`p-5 text-center border border-gray-100 hover:border-indigo-100 transition-all hover:shadow-md overflow-hidden group relative ${
              activeSound === sound.id ? 'ring-2 ring-indigo-500 shadow-md' : ''
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className={`rounded-full ${sound.color} p-3 w-14 h-14 mx-auto mb-3 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${
                activeSound === sound.id ? 'scale-110' : ''
              }`}>
                <sound.icon className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-sm">{sound.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{sound.duration}</p>
              <Button3D
                variant={activeSound === sound.id ? "gradient" : "outline"}
                size="sm"
                className={`w-full mt-4 text-xs rounded-full ${
                  activeSound === sound.id
                    ? "shadow-sm"
                    : "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                }`}
                onClick={() => playSound(sound.id)}
              >
                {activeSound === sound.id ? (
                  <span className="flex items-center justify-center">
                    <span className="h-2 w-2 bg-white rounded-full mr-2 animate-pulse"></span>
                    Reproduciendo
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Play className="h-3 w-3 mr-1" />
                    Reproducir
                  </span>
                )}
              </Button3D>
            </div>
          </Card3D>
        ))}
      </div>
    </div>
  )
}
