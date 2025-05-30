"use client"

import { useState, useEffect } from "react"
import {
  AnimatedSection,
  AnimatedList
} from "@/components/animations/animated-layout"
import {
  AnimatedElement,
  AnimatedFade,
  AnimatedSlide
} from "@/components/animations/animated-transitions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dumbbell,
  Calendar,
  PlusCircle,
  Clock,
  Edit,
  Trash2,
  Play,
  Lightbulb,
  Sparkles,
  Info,
  BarChart,
  Zap,
  Award,
  Calculator,
  TrendingUp
} from "lucide-react"
import { StatCardOrganic } from "@/components/ui/static-stat-card-organic"
import { FloatingActionButton } from "@/components/ui/static-floating-action-button"
import { TrainingDashboard } from "@/components/training/training-dashboard"
import WorkoutCalendar from "@/components/training/workout-calendar"
import { ExecuteWorkout } from "@/components/training/execute-workout"
import { ExperienceSwitcher } from "@/components/training/experience-switcher"
import { RMCalculator } from "@/components/training/rm-calculator"
import { ProgressiveOverloadTracker } from "@/components/training/progressive-overload-tracker"
import { WorkoutRoutine } from "@/lib/types/training"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { useTraining } from "@/lib/contexts/training-context"
import { shouldEnableAnimations } from "@/lib/animation-utils"
import { useAnimationsReady } from "@/components/animations/safe-motion"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export default function AnimatedTrainingPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [hasError, setHasError] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const isAnimationsReady = useAnimationsReady()
  const animationsEnabled = shouldEnableAnimations()

  // Use our contexts
  const { user } = useAuth()
  const {
    routines,
    logs,
    isLoadingRoutines: isLoading,
    isLoadingLogs,
    refreshRoutines,
    refreshLogs,
    saveRoutine,
    deleteRoutine: deleteWorkoutRoutine
  } = useTraining()

  // Error boundary effect
  useEffect(() => {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Add error event listener to catch any unhandled errors
        const handleError = (event: ErrorEvent) => {
          console.error("Unhandled error in AnimatedTrainingPage:", event.error)
          setHasError(true)
          // Redirect to fallback page
          window.location.href = '/training/fallback'
        }

        window.addEventListener('error', handleError)

        return () => {
          window.removeEventListener('error', handleError)
        }
      }
    } catch (error) {
      console.error("Error in error boundary setup:", error)
      // If we can't even set up the error handler, redirect immediately
      if (typeof window !== 'undefined') {
        window.location.href = '/training/fallback'
      }
    }
  }, [])

  // Load data when component mounts
  useEffect(() => {
    refreshRoutines()
    refreshLogs()
  }, [refreshRoutines, refreshLogs])

  // Create a new routine - admin only
  const createNewRoutine = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una rutina",
        variant: "destructive"
      })
      return
    }

    // Check if user is admin
    if (user?.email !== "admin@routinize.com") {
      toast({
        title: "Acceso restringido",
        description: "Solo el administrador puede crear rutinas",
        variant: "destructive"
      })
      return
    }

    // Show loading toast
    toast({
      title: "Creando rutina",
      description: "Espera un momento...",
    })

    const newRoutine: WorkoutRoutine = {
      id: uuidv4(),
      userId: user.id,
      name: "Nueva rutina",
      description: "Descripción de la rutina",
      days: [
        {
          id: uuidv4(),
          name: "Día 1",
          exercises: []
        }
      ],
      frequency: "3-4 días por semana",
      goal: "hipertrofia",
      level: "intermedio",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      const { success, error } = await saveRoutine(newRoutine)

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo crear la rutina: " + (error.message || JSON.stringify(error)),
          variant: "destructive"
        })
        return
      }

      if (success) {
        toast({
          title: "Éxito",
          description: "Rutina creada correctamente",
        })

        setTimeout(() => {
          router.push(`/training/edit/${newRoutine.id}`)
        }, 500)
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al crear la rutina",
        variant: "destructive"
      })
    }
  }

  // Delete a routine - admin only
  const handleDeleteRoutine = async (routineId: string) => {
    if (!user) return

    if (user?.email !== "admin@routinize.com") {
      toast({
        title: "Acceso restringido",
        description: "Solo el administrador puede eliminar rutinas",
        variant: "destructive"
      })
      return
    }

    try {
      const { success, error } = await deleteWorkoutRoutine(routineId)

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la rutina",
          variant: "destructive"
        })
        return
      }

      if (success) {
        toast({
          title: "Éxito",
          description: "Rutina eliminada correctamente",
        })
      }
    } catch (error) {
      console.error("Error al eliminar rutina:", error)
    }
  }

  // Start a workout
  const startWorkout = (routineId: string) => {
    try {
      const url = `/training/execute-workout?routineId=${routineId}`;
      router.push(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar el entrenamiento. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  }

  // Edit a routine - admin only
  const editRoutine = (routineId: string) => {
    if (!user || user?.email !== "admin@routinize.com") {
      toast({
        title: "Acceso restringido",
        description: "Solo el administrador puede editar rutinas",
        variant: "destructive"
      })
      return
    }

    router.push(`/training/edit/${routineId}`)
  }

  // Render routine card with or without animations
  const renderRoutineCard = (routine: WorkoutRoutine, index: number) => {
    const cardContent = (
      <Card
        key={routine.id}
        className="p-4 rounded-xl border-gray-100 hover:shadow-md transition-all duration-200"
        style={{
          borderLeftWidth: '4px',
          borderLeftColor:
            routine.goal === 'hipertrofia' ? '#a855f7' :
            routine.goal === 'fuerza' ? '#3b82f6' :
            routine.goal === 'resistencia' ? '#22c55e' :
            '#6366f1'
        }}
      >
        <div className="flex justify-between">
          <div>
            <h3 className="font-bold">{routine.name}</h3>
            <p className="text-sm text-gray-600">{routine.description}</p>
            <div className="flex mt-2">
              <Badge>{routine.goal}</Badge>
              <Badge className="ml-2">{routine.frequency}</Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" onClick={() => startWorkout(routine.id)}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar
            </Button>
            {user?.email === "admin@routinize.com" && (
              <>
                <Button size="sm" variant="outline" onClick={() => editRoutine(routine.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDeleteRoutine(routine.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    )

    if (!isAnimationsReady || !animationsEnabled) {
      return cardContent
    }

    return (
      <AnimatedSlide
        key={routine.id}
        direction="up"
        delay={index * 0.1}
        duration={0.4}
      >
        {cardContent}
      </AnimatedSlide>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="execute">Ejecutar</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AnimatedSection>
            {user && (
              <div className="space-y-6">
                <TrainingDashboard userId={user.id} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6 border-blue-200 bg-gradient-to-r from-white to-blue-50/30">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Award className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Modo de Experiencia</h3>
                        <p className="text-sm text-muted-foreground">Personaliza tu experiencia de entrenamiento</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm">
                        Selecciona el modo que mejor se adapte a tu nivel de experiencia en entrenamiento:
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="flex flex-col items-center justify-center h-24 border-green-200 hover:bg-green-50"
                          onClick={() => router.push("/training/beginner")}
                        >
                          <Dumbbell className="h-8 w-8 text-green-500 mb-2" />
                          <span className="font-medium">Principiante</span>
                        </Button>

                        <Button
                          variant="outline"
                          className="flex flex-col items-center justify-center h-24 border-blue-200 hover:bg-blue-50"
                          onClick={() => router.push("/training/advanced-training")}
                        >
                          <BarChart className="h-8 w-8 text-blue-500 mb-2" />
                          <span className="font-medium">Avanzado</span>
                        </Button>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="link" className="w-full">
                              ¿No estás seguro? Haz el test de nivel
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <ExperienceSwitcher />
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="link"
                          className="w-full"
                          onClick={() => router.push("/training/profile")}
                        >
                          Ver o editar tu perfil de entrenamiento
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-purple-200 bg-gradient-to-r from-white to-purple-50/30">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <Zap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Herramientas Avanzadas</h3>
                        <p className="text-sm text-muted-foreground">Optimiza tu entrenamiento</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <Button
                          variant="outline"
                          className="flex items-center justify-start h-12 border-blue-200 hover:bg-blue-50"
                          onClick={() => router.push("/training/advanced-training")}
                        >
                          <Calculator className="h-5 w-5 text-blue-500 mr-3" />
                          <span className="font-medium">Calculadora de RM</span>
                        </Button>

                        <Button
                          variant="outline"
                          className="flex items-center justify-start h-12 border-green-200 hover:bg-green-50"
                          onClick={() => router.push("/training/advanced-training")}
                        >
                          <TrendingUp className="h-5 w-5 text-green-500 mr-3" />
                          <span className="font-medium">Seguimiento de Progresión</span>
                        </Button>

                        <Button
                          variant="outline"
                          className="flex items-center justify-start h-12 border-purple-200 hover:bg-purple-50"
                          onClick={() => router.push("/training/advanced-training")}
                        >
                          <Calendar className="h-5 w-5 text-purple-500 mr-3" />
                          <span className="font-medium">Periodización</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </AnimatedSection>
        </TabsContent>

        <TabsContent value="plan">
          <AnimatedSection>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Mi Plan de Entrenamiento</h2>
              {user?.email === "admin@routinize.com" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createNewRoutine}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nueva rutina
                </Button>
              )}
            </div>

            {/* Render routines */}
            {isLoading ? (
              <div className="text-center py-8">
                <p>Cargando rutinas...</p>
              </div>
            ) : routines.length === 0 ? (
              <AnimatedFade>
                <div className="text-center py-8">
                  <p>No tienes rutinas de entrenamiento</p>
                  {user?.email === "admin@routinize.com" && (
                    <Button onClick={createNewRoutine} className="mt-4">
                      Crear rutina
                    </Button>
                  )}
                </div>
              </AnimatedFade>
            ) : (
              <div className="space-y-4">
                {routines.map((routine, index) => renderRoutineCard(routine, index))}
              </div>
            )}

            <Separator className="my-8" />
            <AnimatedFade delay={0.3}>
              <WorkoutCalendar />
            </AnimatedFade>
          </AnimatedSection>
        </TabsContent>

        <TabsContent value="execute">
          <AnimatedSection>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Ejecutar Entrenamiento</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/training/execute-workout')}
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar rutina
              </Button>
            </div>
            {user && <ExecuteWorkout userId={user.id} setActiveTab={setActiveTab} />}
          </AnimatedSection>
        </TabsContent>
      </Tabs>
    </div>
  )
}
