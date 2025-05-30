"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  TrendingUp,
  Award,
  Star,
  Calendar,
  CheckCircle,
  Info,
  ChevronRight,
  Dumbbell,
  Trophy,
  Target,
  ArrowUpRight,
  Sparkles
} from "lucide-react"

// Tipos para el sistema de progresión
interface ProgressionData {
  totalWorkouts: number;
  totalSets: number;
  totalExercises: number;
  consistency: number;
  streak: number;
  level: {
    current: string;
    progress: number;
    nextLevel: string;
    requirements: {
      workouts: number;
      consistency: number;
      exercises: number;
    };
  };
  achievements: Achievement[];
  milestones: Milestone[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  completed: boolean;
  date?: string;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  unit: string;
}

export function AmateurZeroProgressionSystem() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [progressionData, setProgressionData] = useState<ProgressionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("progress")

  // Cargar datos de progresión
  useEffect(() => {
    const fetchProgressionData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Obtener sesiones de entrenamiento completadas
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('completed', true)
          .order('date', { ascending: false })

        if (sessionsError) throw sessionsError

        // Calcular estadísticas básicas
        const totalWorkouts = sessionsData?.length || 0

        // Calcular racha actual
        let streak = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const sortedSessions = [...(sessionsData || [])].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        if (sortedSessions.length > 0) {
          // Verificar si hay un entrenamiento hoy
          const lastSessionDate = new Date(sortedSessions[0].date)
          lastSessionDate.setHours(0, 0, 0, 0)

          const diffDays = Math.floor((today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24))

          if (diffDays <= 1) { // Hoy o ayer
            streak = 1

            // Contar días consecutivos hacia atrás
            for (let i = 1; i < sortedSessions.length; i++) {
              const currentDate = new Date(sortedSessions[i-1].date)
              currentDate.setHours(0, 0, 0, 0)

              const prevDate = new Date(sortedSessions[i].date)
              prevDate.setHours(0, 0, 0, 0)

              const daysBetween = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

              if (daysBetween <= 2) { // Permitir un día de descanso
                streak++
              } else {
                break
              }
            }
          }
        }

        // Calcular consistencia (% de semanas con al menos 2 entrenamientos)
        let consistency = 0
        if (totalWorkouts > 0) {
          const weekMap = new Map<string, number>()

          sortedSessions.forEach(session => {
            const sessionDate = new Date(session.date)
            const weekKey = `${sessionDate.getFullYear()}-${Math.floor(sessionDate.getDate() / 7)}`

            weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + 1)
          })

          const weeksWithEnoughWorkouts = [...weekMap.values()].filter(count => count >= 2).length
          const totalWeeks = weekMap.size

          consistency = totalWeeks > 0 ? Math.round((weeksWithEnoughWorkouts / totalWeeks) * 100) : 0
        }

        // Obtener ejercicios realizados
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('workout_exercises')
          .select('*')
          .eq('user_id', user.id)

        if (exercisesError) throw exercisesError

        const totalExercises = exercisesData?.length || 0
        const totalSets = totalWorkouts * 10 // Estimación aproximada

        // Determinar nivel y progreso
        let level = {
          current: "Amateur Cero",
          progress: 0,
          nextLevel: "Principiante",
          requirements: {
            workouts: 12,
            consistency: 70,
            exercises: 8
          }
        }

        // Calcular progreso hacia el siguiente nivel
        const workoutProgress = Math.min(totalWorkouts / level.requirements.workouts, 1)
        const consistencyProgress = Math.min(consistency / level.requirements.consistency, 1)
        const exerciseProgress = Math.min(totalExercises / level.requirements.exercises, 1)

        // Promedio ponderado de los factores
        level.progress = Math.round(((workoutProgress * 0.5) + (consistencyProgress * 0.3) + (exerciseProgress * 0.2)) * 100)

        // Logros
        const achievements: Achievement[] = [
          {
            id: "first_workout",
            name: "Primer Entrenamiento",
            description: "Completaste tu primera sesión de entrenamiento",
            icon: "dumbbell",
            completed: totalWorkouts >= 1,
            date: totalWorkouts >= 1 ? sortedSessions[sortedSessions.length - 1]?.date : undefined
          },
          {
            id: "consistency_week",
            name: "Semana Consistente",
            description: "Completaste 3 entrenamientos en una semana",
            icon: "calendar",
            completed: consistency >= 30,
            date: consistency >= 30 ? sortedSessions[0]?.date : undefined
          },
          {
            id: "streak_3",
            name: "Racha Inicial",
            description: "Mantuviste una racha de 3 días de entrenamiento",
            icon: "fire",
            completed: streak >= 3,
            date: streak >= 3 ? sortedSessions[0]?.date : undefined
          },
          {
            id: "five_workouts",
            name: "Compromiso Inicial",
            description: "Completaste 5 sesiones de entrenamiento",
            icon: "star",
            completed: totalWorkouts >= 5,
            date: totalWorkouts >= 5 ? sortedSessions[sortedSessions.length - 5]?.date : undefined
          },
          {
            id: "all_exercises",
            name: "Explorador de Ejercicios",
            description: "Probaste todos los ejercicios básicos",
            icon: "compass",
            completed: totalExercises >= 8,
            date: totalExercises >= 8 ? sortedSessions[0]?.date : undefined
          }
        ]

        // Hitos
        const milestones: Milestone[] = [
          {
            id: "workouts_12",
            name: "12 Entrenamientos",
            description: "Completa 12 sesiones de entrenamiento",
            target: 12,
            current: totalWorkouts,
            unit: "sesiones"
          },
          {
            id: "consistency_70",
            name: "70% Consistencia",
            description: "Alcanza un 70% de consistencia semanal",
            target: 70,
            current: consistency,
            unit: "%"
          },
          {
            id: "exercises_8",
            name: "8 Ejercicios Dominados",
            description: "Domina la técnica de 8 ejercicios básicos",
            target: 8,
            current: Math.min(totalExercises, 8),
            unit: "ejercicios"
          },
          {
            id: "streak_7",
            name: "Racha de 7 Días",
            description: "Mantén una racha de 7 días consecutivos",
            target: 7,
            current: streak,
            unit: "días"
          }
        ]

        // Establecer datos de progresión
        setProgressionData({
          totalWorkouts,
          totalSets,
          totalExercises,
          consistency,
          streak,
          level,
          achievements,
          milestones
        })

      } catch (error) {
        console.error("Error al cargar datos de progresión:", error)
        toast({
          title: "Error",
          description: "No pudimos cargar tus datos de progreso. Por favor, intenta de nuevo.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgressionData()
  }, [user, toast])

  // Verificar si el usuario está listo para avanzar al siguiente nivel
  const isReadyForNextLevel = () => {
    if (!progressionData) return false
    return progressionData.level.progress >= 100
  }

  // Avanzar al siguiente nivel
  const advanceToNextLevel = async () => {
    if (!user || !progressionData || !isReadyForNextLevel()) return

    try {
      // Actualizar nivel de experiencia en el perfil
      const { error } = await supabase
        .from('user_profiles')
        .update({
          experience_level: 'beginner',
          level_up_date: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: "¡Felicidades!",
        description: "Has avanzado al nivel Principiante. ¡Sigue así!",
      })

      // Redirigir a la página de celebración
      router.push('/training/level-up')
    } catch (error) {
      console.error("Error al avanzar de nivel:", error)
      toast({
        title: "Error",
        description: "No pudimos actualizar tu nivel. Por favor, intenta de nuevo.",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!progressionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Progresión</CardTitle>
          <CardDescription>
            No pudimos cargar tus datos de progreso
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Button onClick={() => router.push('/training/dashboard')}>
              Volver al Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          Tu Progreso Fitness
        </CardTitle>
        <CardDescription>
          Seguimiento de tu evolución y camino hacia el siguiente nivel
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="progress" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>Progreso</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span>Logros</span>
            </TabsTrigger>
            <TabsTrigger value="milestones" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>Objetivos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-medium">Nivel Actual: {progressionData.level.current}</h3>
                    <p className="text-sm text-muted-foreground">Próximo nivel: {progressionData.level.nextLevel}</p>
                  </div>
                  <div className="bg-white rounded-full p-2 shadow-sm">
                    <Star className="h-6 w-6 text-amber-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>Progreso hacia {progressionData.level.nextLevel}</span>
                    <span>{progressionData.level.progress}%</span>
                  </div>
                  <Progress value={progressionData.level.progress} className="h-2" />
                </div>

                {isReadyForNextLevel() && (
                  <div className="mt-4">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      onClick={advanceToNextLevel}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      ¡Avanzar al Nivel Principiante!
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{progressionData.totalWorkouts}</div>
                  <div className="text-sm text-muted-foreground">Entrenamientos Completados</div>
                </div>

                <div className="border rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{progressionData.streak}</div>
                  <div className="text-sm text-muted-foreground">Racha Actual</div>
                </div>

                <div className="border rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{progressionData.consistency}%</div>
                  <div className="text-sm text-muted-foreground">Consistencia Semanal</div>
                </div>

                <div className="border rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{progressionData.totalSets}</div>
                  <div className="text-sm text-muted-foreground">Series Totales</div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-md p-4 text-sm">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800">¿Cómo avanzar al siguiente nivel?</p>
                    <p className="text-blue-700 mt-1">
                      Para avanzar al nivel Principiante, necesitas:
                    </p>
                    <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
                      <li>Completar al menos 12 entrenamientos</li>
                      <li>Mantener una consistencia semanal del 70%</li>
                      <li>Dominar la técnica de 8 ejercicios básicos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tus Logros</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {progressionData.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`border rounded-lg p-4 ${achievement.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-start">
                      <div className={`rounded-full p-2 mr-3 flex-shrink-0 ${achievement.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {achievement.icon === 'dumbbell' && <Dumbbell className={`h-5 w-5 ${achievement.completed ? 'text-green-500' : 'text-gray-400'}`} />}
                        {achievement.icon === 'calendar' && <Calendar className={`h-5 w-5 ${achievement.completed ? 'text-green-500' : 'text-gray-400'}`} />}
                        {achievement.icon === 'fire' && <TrendingUp className={`h-5 w-5 ${achievement.completed ? 'text-green-500' : 'text-gray-400'}`} />}
                        {achievement.icon === 'star' && <Star className={`h-5 w-5 ${achievement.completed ? 'text-green-500' : 'text-gray-400'}`} />}
                        {achievement.icon === 'compass' && <Trophy className={`h-5 w-5 ${achievement.completed ? 'text-green-500' : 'text-gray-400'}`} />}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium">{achievement.name}</h4>
                          {achievement.completed && <CheckCircle className="h-4 w-4 text-green-500 ml-2" />}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                        {achievement.completed && achievement.date && (
                          <p className="text-xs text-green-600 mt-2">
                            Completado el {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {progressionData.achievements.filter(a => a.completed).length} de {progressionData.achievements.length} logros desbloqueados
              </div>
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Objetivos para Nivel Principiante</h3>

              <div className="space-y-4">
                {progressionData.milestones.map((milestone) => (
                  <div key={milestone.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{milestone.name}</h4>
                      <Badge variant={milestone.current >= milestone.target ? "default" : "outline"}>
                        {milestone.current} / {milestone.target} {milestone.unit}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                    <Progress
                      value={Math.min((milestone.current / milestone.target) * 100, 100)}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 rounded-md p-4 text-sm">
                <div className="flex">
                  <Info className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800">Beneficios del Nivel Principiante</p>
                    <p className="text-amber-700 mt-1">
                      Al avanzar al nivel Principiante, desbloquearás:
                    </p>
                    <ul className="list-disc list-inside text-amber-700 mt-2 space-y-1">
                      <li>Acceso a rutinas más avanzadas</li>
                      <li>Nuevos ejercicios y variaciones</li>
                      <li>Herramientas de seguimiento de progreso detalladas</li>
                      <li>Personalización avanzada de entrenamientos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/training/dashboard')}>
          Volver al Dashboard
        </Button>
        {isReadyForNextLevel() && (
          <Button onClick={advanceToNextLevel}>
            <ArrowUpRight className="h-4 w-4 mr-1" />
            Avanzar de Nivel
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
