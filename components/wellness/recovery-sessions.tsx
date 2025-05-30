"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedList } from "@/components/ui/animated-list"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth/auth-context"
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Clock,
  Calendar,
  CheckCircle2,
  Filter,
  RefreshCw,
  Yoga,
  Wind,
  Dumbbell,
  Flame
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Datos de sesiones de recuperación
const RECOVERY_SESSIONS = [
  {
    id: "meditation-1",
    title: "Meditación para reducir el estrés",
    description: "Una meditación guiada para reducir el estrés y la ansiedad",
    type: "meditation",
    duration: 10,
    level: "beginner",
    icon: <Wind className="h-5 w-5 text-blue-500" />
  },
  {
    id: "meditation-2",
    title: "Meditación para mejorar el sueño",
    description: "Una meditación relajante para prepararte para dormir",
    type: "meditation",
    duration: 15,
    level: "beginner",
    icon: <Wind className="h-5 w-5 text-blue-500" />
  },
  {
    id: "yoga-1",
    title: "Yoga para la mañana",
    description: "Rutina de yoga suave para despertar el cuerpo",
    type: "yoga",
    duration: 20,
    level: "beginner",
    icon: <Yoga className="h-5 w-5 text-purple-500" />
  },
  {
    id: "yoga-2",
    title: "Yoga para la recuperación muscular",
    description: "Posturas de yoga para aliviar la tensión muscular",
    type: "yoga",
    duration: 25,
    level: "intermediate",
    icon: <Yoga className="h-5 w-5 text-purple-500" />
  },
  {
    id: "stretching-1",
    title: "Estiramientos post-entrenamiento",
    description: "Rutina de estiramientos para después del ejercicio",
    type: "stretching",
    duration: 15,
    level: "beginner",
    icon: <Dumbbell className="h-5 w-5 text-green-500" />
  },
  {
    id: "breathing-1",
    title: "Respiración 4-7-8",
    description: "Técnica de respiración para reducir la ansiedad",
    type: "breathing",
    duration: 5,
    level: "beginner",
    icon: <Flame className="h-5 w-5 text-orange-500" />
  }
]

interface RecoverySession {
  id: string
  user_id: string
  session_id: string
  type: string
  duration: number
  completed: boolean
  created_at: string
}

interface SessionPlayerProps {
  session: typeof RECOVERY_SESSIONS[0]
  onComplete: () => void
}

function SessionPlayer({ session, onComplete }: SessionPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Formatear tiempo en minutos:segundos
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Iniciar o pausar la sesión
  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  // Reiniciar la sesión
  const resetSession = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    setProgress(0)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Completar la sesión
  const completeSession = () => {
    setIsPlaying(false)
    setCurrentTime(session.duration * 60)
    setProgress(100)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    onComplete()

    toast({
      title: "¡Sesión completada!",
      description: `Has completado la sesión "${session.title}"`,
    })
  }

  // Efecto para manejar el temporizador
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1
          const totalTime = session.duration * 60
          const newProgress = Math.min((newTime / totalTime) * 100, 100)
          setProgress(newProgress)

          if (newTime >= totalTime) {
            completeSession()
            return totalTime
          }

          return newTime
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, session.duration])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {session.icon}
          <CardTitle>{session.title}</CardTitle>
        </div>
        <CardDescription>{session.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={resetSession}
            disabled={currentTime === 0}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={completeSession}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(session.duration * 60)}</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="flex justify-center gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{session.duration} min</span>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Badge variant="outline" className="capitalize">
              {session.level}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function RecoverySessions() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("sessions")
  const [isLoading, setIsLoading] = useState(false)
  const [completedSessions, setCompletedSessions] = useState<RecoverySession[]>([])
  const [selectedSession, setSelectedSession] = useState<typeof RECOVERY_SESSIONS[0] | null>(null)
  const [filterType, setFilterType] = useState<string>("all")

  // Cargar sesiones completadas
  useEffect(() => {
    if (user) {
      loadCompletedSessions()
    }
  }, [user])

  // Cargar sesiones completadas desde Supabase
  const loadCompletedSessions = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      // Crear tabla si no existe
      const { error: createError } = await supabase.rpc('create_recovery_sessions_if_not_exists')

      if (createError) {
        console.error("Error creating table:", createError)
      }

      const { data, error } = await supabase
        .from("recovery_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setCompletedSessions(data || [])
    } catch (error) {
      console.error("Error loading completed sessions:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las sesiones completadas",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar sesión completada
  const saveCompletedSession = async (sessionId: string, type: string, duration: number) => {
    if (!user) return

    try {
      const sessionData = {
        user_id: user.id,
        session_id: sessionId,
        type,
        duration,
        completed: true
      }

      const { error } = await supabase
        .from("recovery_sessions")
        .insert(sessionData)

      if (error) throw error

      // Recargar sesiones completadas
      await loadCompletedSessions()
    } catch (error) {
      console.error("Error saving completed session:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la sesión completada",
        variant: "destructive"
      })
    }
  }

  // Manejar la selección de una sesión
  const handleSelectSession = (session: typeof RECOVERY_SESSIONS[0]) => {
    setSelectedSession(session)
    setActiveTab("player")
  }

  // Manejar la finalización de una sesión
  const handleSessionComplete = () => {
    if (selectedSession) {
      saveCompletedSession(
        selectedSession.id,
        selectedSession.type,
        selectedSession.duration
      )
    }
  }

  // Filtrar sesiones por tipo
  const filteredSessions = RECOVERY_SESSIONS.filter(session =>
    filterType === "all" || session.type === filterType
  )

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy - HH:mm", { locale: es })
  }

  // Obtener icono según el tipo de sesión
  const getSessionIcon = (type: string) => {
    switch (type) {
      case "meditation":
        return <Wind className="h-5 w-5 text-blue-500" />
      case "yoga":
        return <Yoga className="h-5 w-5 text-purple-500" />
      case "stretching":
        return <Dumbbell className="h-5 w-5 text-green-500" />
      case "breathing":
        return <Flame className="h-5 w-5 text-orange-500" />
      default:
        return <Wind className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="sessions">Sesiones</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            {selectedSession && (
              <TabsTrigger value="player">Reproductor</TabsTrigger>
            )}
          </TabsList>

          {activeTab === "sessions" && (
            <div className="flex items-center gap-2">
              <Select
                value={filterType}
                onValueChange={setFilterType}
              >
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="meditation">Meditación</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="stretching">Estiramientos</SelectItem>
                  <SelectItem value="breathing">Respiración</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {activeTab === "history" && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadCompletedSessions}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>

        <TabsContent value="sessions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <AnimatedCard
                key={session.id}
                className="cursor-pointer"
                hoverEffect="lift"
                onClick={() => handleSelectSession(session)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    {session.icon}
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {session.description}
                  </p>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{session.duration} min</span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {session.level}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleSelectSession(session)}>
                    <Play className="h-4 w-4 mr-2" />
                    Comenzar
                  </Button>
                </CardFooter>
              </AnimatedCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de sesiones</CardTitle>
              <CardDescription>
                Registro de tus sesiones de recuperación completadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingAnimation />
                </div>
              ) : completedSessions.length > 0 ? (
                <AnimatedList
                  items={completedSessions.map((session) => {
                    // Encontrar detalles de la sesión
                    const sessionDetails = RECOVERY_SESSIONS.find(s => s.id === session.session_id)

                    return (
                      <div key={session.id} className="flex items-center gap-4 p-4 border-b last:border-0">
                        <div className="flex-shrink-0">
                          {getSessionIcon(session.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {sessionDetails?.title || session.type}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{session.duration} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(session.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    )
                  })}
                  animationType="stagger"
                  staggerDelay={0.05}
                  emptyState={
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No hay sesiones completadas en tu historial.
                      </p>
                    </div>
                  }
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No has completado ninguna sesión de recuperación. ¡Comienza una sesión para mejorar tu bienestar!
                  </p>
                  <Button onClick={() => setActiveTab("sessions")}>
                    Ver sesiones disponibles
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="player">
          {selectedSession && (
            <SessionPlayer
              session={selectedSession}
              onComplete={handleSessionComplete}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
