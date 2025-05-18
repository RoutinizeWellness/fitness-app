"use client"

import { useState, useEffect } from "react"
import { OrganicLayout, OrganicSection, OrganicList } from "@/components/organic-layout"
import { OrganicElement, OrganicStaggeredList } from "@/components/transitions/organic-transitions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { StatCardOrganic } from "@/components/ui/stat-card-organic"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { Separator } from "@/components/ui/separator"
import AITrainingCoach from "@/components/ai-training-coach"
import {
  Dumbbell,
  Calendar,
  BarChart,
  PlusCircle,
  Clock,
  ChevronRight,
  Edit,
  Trash2,
  Play,
  TrendingUp,
  Zap,
  RefreshCw,
  Award,
  Flame,
  Brain,
  BarChart3,
  BookOpen,
  Lightbulb,
  Sparkles,
  Camera
} from "lucide-react"
import { TrainingDashboard } from "@/components/training/training-dashboard"
import { MesocycleProgressVisualization } from "@/components/training/mesocycle-progress-visualization"
import { FatigueManagementSystem } from "@/components/training/fatigue-management-system"
import { ExerciseDemonstration } from "@/components/training/exercise-demonstration"
import { ExerciseLibrary } from "@/components/training/exercise-library"
import { WorkoutTemplates } from "@/components/training/workout-templates"
import { ProgressTracking } from "@/components/training/progress-tracking"
import WorkoutPlanDisplay from "@/components/training/workout-plan-display"
import TrainingInitialAssessment from "@/components/training/initial-assessment"
import WorkoutCalendar from "@/components/training/workout-calendar"
import WorkoutExecution from "@/components/training/workout-execution"
import PostureAnalysis from "@/components/training/posture-analysis"
import PerformanceTracking from "@/components/training/performance-tracking"
import { getTrainingProfile } from "@/lib/training-personalization-service"
import { generateWorkoutPlan } from "@/lib/workout-plan-generator"
import { getActiveWorkoutPlan } from "@/lib/workout-plan-service"
import {
  WorkoutRoutine,
  WorkoutDay,
  WorkoutLog,
  getUserRoutines,
  getWorkoutLogs,
  saveWorkoutRoutine,
  deleteWorkoutRoutine
} from "@/lib/training-service"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

import { ExecuteWorkout } from "@/components/training/execute-workout"

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([])
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Obtener el usuario actual
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setUser(user)
      }
    }

    fetchUser()
  }, [])

  // Cargar rutinas de entrenamiento
  useEffect(() => {
    const loadRoutines = async () => {
      if (!userId) return

      try {
        const { data, error } = await getUserRoutines(userId)

        if (error) {
          console.error("Error al cargar rutinas:", error)
          toast({
            title: "Error",
            description: "No se pudieron cargar las rutinas de entrenamiento",
            variant: "destructive"
          })
          return
        }

        if (data) {
          setRoutines(data)
        }
      } catch (error) {
        console.error("Error al cargar rutinas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRoutines()
  }, [userId, toast])

  // Cargar registros de entrenamiento
  useEffect(() => {
    const loadLogs = async () => {
      if (!userId) return

      setIsLoadingLogs(true)
      try {
        const { data, error } = await getWorkoutLogs(userId)

        if (error) {
          console.error("Error al cargar registros:", error)
          toast({
            title: "Error",
            description: "No se pudieron cargar los registros de entrenamiento",
            variant: "destructive"
          })
          return
        }

        if (data) {
          // Ordenar por fecha (más reciente primero)
          const sortedLogs = [...data].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          setLogs(sortedLogs)
        }
      } catch (error) {
        console.error("Error al cargar registros:", error)
      } finally {
        setIsLoadingLogs(false)
      }
    }

    loadLogs()
  }, [userId, toast])

  // Crear una nueva rutina - solo para admin
  const createNewRoutine = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una rutina",
        variant: "destructive"
      })
      return
    }

    // Verificar si el usuario es admin
    if (user?.email !== "admin@routinize.com") {
      toast({
        title: "Acceso restringido",
        description: "Solo el administrador puede crear rutinas",
        variant: "destructive"
      })
      return
    }

    // Mostrar toast de carga
    toast({
      title: "Creando rutina",
      description: "Espera un momento...",
    })

    const newRoutine: WorkoutRoutine = {
      id: uuidv4(),
      userId: userId,
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
      console.log("Intentando guardar rutina:", newRoutine)
      const { data, error } = await saveWorkoutRoutine(newRoutine)

      if (error) {
        console.error("Error al crear rutina:", error)
        toast({
          title: "Error",
          description: "No se pudo crear la rutina: " + (error.message || JSON.stringify(error)),
          variant: "destructive"
        })
        return
      }

      if (data) {
        // Actualizar el estado local
        setRoutines(prev => [data, ...prev])

        // Mostrar mensaje de éxito
        toast({
          title: "Éxito",
          description: "Rutina creada correctamente",
        })

        // Redirigir a la página de edición después de un breve retraso
        setTimeout(() => {
          router.push(`/training/edit/${data.id}`)
        }, 500)
      }
    } catch (error) {
      console.error("Error al crear rutina:", error)
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al crear la rutina",
        variant: "destructive"
      })
    }
  }

  // Eliminar una rutina - solo para admin
  const handleDeleteRoutine = async (routineId: string) => {
    if (!userId) return

    // Verificar si el usuario es admin
    if (user?.email !== "admin@routinize.com") {
      toast({
        title: "Acceso restringido",
        description: "Solo el administrador puede eliminar rutinas",
        variant: "destructive"
      })
      return
    }

    try {
      const { success, error } = await deleteWorkoutRoutine(routineId, userId)

      if (error) {
        console.error("Error al eliminar rutina:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar la rutina",
          variant: "destructive"
        })
        return
      }

      if (success) {
        setRoutines(prev => prev.filter(routine => routine.id !== routineId))
        toast({
          title: "Éxito",
          description: "Rutina eliminada correctamente",
        })
      }
    } catch (error) {
      console.error("Error al eliminar rutina:", error)
    }
  }

  // Iniciar un entrenamiento
  const startWorkout = (routineId: string) => {
    router.push(`/workout-active?routineId=${routineId}`)
  }

  // Editar una rutina - solo para admin
  const editRoutine = (routineId: string) => {
    // Verificar si el usuario es admin
    if (user?.email !== "admin@routinize.com") {
      toast({
        title: "Acceso restringido",
        description: "Solo el administrador puede editar rutinas",
        variant: "destructive"
      })
      return
    }

    router.push(`/training/edit/${routineId}`)
  }

  // Renderizar rutinas
  const renderRoutines = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      )
    }

    if (routines.length === 0) {
      return (
        <div className="text-center py-8">
          <Dumbbell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium mb-2">No tienes rutinas de entrenamiento</h3>
          <p className="text-gray-500 mb-6">Crea tu primera rutina para comenzar a entrenar</p>
          <div className="flex flex-col space-y-3 max-w-xs mx-auto">
            {user?.email === "admin@routinize.com" ? (
              <>
                <Button
                  variant="default"
                  onClick={() => router.push("/training/generate-plan")}
                  className="w-full rounded-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar plan con IA
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/training/create-routine")}
                  className="w-full rounded-full"
                >
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Crear rutina personalizada
                </Button>
                <Button
                  variant="outline"
                  onClick={createNewRoutine}
                  className="w-full rounded-full"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Crear rutina en blanco
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/training/templates")}
                  className="w-full rounded-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver plantillas científicas
                </Button>
              </>
            ) : (
              <p className="text-center text-gray-500">
                Las rutinas son administradas por el entrenador. Contacta con admin@routinize.com para solicitar cambios.
              </p>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <OrganicElement type="fade">
          <Card organic={true} hover={true} className="p-6">
            <OrganicSection
              title="Mis rutinas de entrenamiento"
              action={
                <div className="flex space-x-2">
                  {user?.email === "admin@routinize.com" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => router.push("/training/generate-plan")}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        IA
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => router.push("/training/create-routine")}
                      >
                        <Dumbbell className="h-4 w-4 mr-2" />
                        Personalizada
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-full"
                        onClick={createNewRoutine}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Nueva
                      </Button>
                    </>
                  )}
                </div>
              }
            >
              <div className="space-y-3">
                {routines.map(routine => (
                  <div
                    key={routine.id}
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-semibold">{routine.name}</h3>
                          {routine.goal === 'hipertrofia' && (
                            <Badge className="ml-2 bg-purple-500">Hipertrofia</Badge>
                          )}
                          {routine.goal === 'fuerza' && (
                            <Badge className="ml-2 bg-blue-500">Fuerza</Badge>
                          )}
                          {routine.goal === 'resistencia' && (
                            <Badge className="ml-2 bg-green-500">Resistencia</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{routine.description}</p>
                        <div className="flex items-center text-xs text-gray-400 mt-2">
                          <span className="capitalize">{routine.level}</span>
                          <span className="mx-2">•</span>
                          <span>{routine.frequency}</span>
                          <span className="mx-2">•</span>
                          <span>{routine.days?.length || 0} días</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {user?.email === "admin@routinize.com" && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => editRoutine(routine.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRoutine(routine.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="w-full rounded-full"
                        onClick={() => startWorkout(routine.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar entrenamiento
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full rounded-full"
                        onClick={() => router.push(`/training/routine/${routine.id}`)}
                      >
                        <ChevronRight className="h-4 w-4 mr-2" />
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </OrganicSection>
          </Card>
        </OrganicElement>
      </div>
    )
  }

  return (
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative">
      {/* Phone mockup rotated in background */}
      <div className="w-[383.868px] h-[830.788px] transform rotate-[-45deg] absolute -top-[100px] -right-[100px] z-0 rounded-[35px] bg-[url('/images/phone-mockup-rotated.svg')] bg-no-repeat bg-cover opacity-10"></div>
      {/* Gradient background */}
      <div className="w-[414px] h-[692px] absolute bottom-0 left-0 z-0 bg-gradient-to-t from-[#FFF3E9] via-[rgba(255,243,233,0.5)] to-transparent"></div>
      <header className="absolute top-0 left-0 right-0 z-50 bg-[#FFF3E9]">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm mr-3"
              onClick={() => router.push('/dashboard')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="#573353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-xl font-bold text-[#573353]">
              Training
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#573353" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="#573353" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#573353" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#573353" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FDA758] text-white text-xs flex items-center justify-center shadow-sm font-medium">
                3
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 pt-20 pb-32 overflow-y-auto h-[calc(896px-80px)] relative z-10">
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'dashboard' ? 'bg-[#FDA758] text-white' : 'bg-white text-[#573353]'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="flex items-center">
                <BarChart className="h-4 w-4 mr-2" />
                Dashboard
              </div>
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'plan' ? 'bg-[#FDA758] text-white' : 'bg-white text-[#573353]'}`}
              onClick={() => setActiveTab('plan')}
            >
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Mi Plan
              </div>
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'calendar' ? 'bg-[#FDA758] text-white' : 'bg-white text-[#573353]'}`}
              onClick={() => setActiveTab('calendar')}
            >
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Calendario
              </div>
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'execute' ? 'bg-[#FDA758] text-white' : 'bg-white text-[#573353]'}`}
              onClick={() => setActiveTab('execute')}
            >
              <div className="flex items-center">
                <Play className="h-4 w-4 mr-2" />
                Entrenar
              </div>
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'analysis' ? 'bg-[#FDA758] text-white' : 'bg-white text-[#573353]'}`}
              onClick={() => setActiveTab('analysis')}
            >
              <div className="flex items-center">
                <Camera className="h-4 w-4 mr-2" />
                Análisis
              </div>
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'progress' ? 'bg-[#FDA758] text-white' : 'bg-white text-[#573353]'}`}
              onClick={() => setActiveTab('progress')}
            >
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Progreso
              </div>
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {userId && <TrainingDashboard userId={userId} />}
          </div>
        )}

        {/* Plan Tab */}
        {activeTab === 'plan' && (
          <div>
            {userId && (
              <WorkoutPlanDisplay
                userId={userId}
                onGenerateNewPlan={() => router.push("/training/generate-plan")}
              />
            )}
          </div>
        )}

        {/* Routines Tab */}
        {activeTab === 'routines' && (
          <>
            {/* Today's Workout */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-[#573353] mb-4">Today's Workout</h2>
              <div className="bg-white rounded-[24px] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-14 h-14 rounded-full bg-[#FDA758] flex items-center justify-center mr-3">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.5 6.5L17.5 17.5M6.5 17.5L17.5 6.5M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[#573353] font-semibold text-base">Upper Body Workout</h3>
                      <p className="text-[#573353]/70 text-sm mt-0.5">45 minutes • 8 exercises</p>
                    </div>
                  </div>
                  <button className="bg-[#FDA758] text-white font-medium rounded-full px-4 py-2 text-sm shadow-sm">
                    Start
                  </button>
                </div>

                <div className="h-2.5 bg-[#F5F5F5] rounded-full">
                  <div className="h-full rounded-full bg-[#FDA758]" style={{ width: '0%' }} />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'routines' && (
          <>
            {/* Workout Plans */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-[#573353]">Workout Plans</h2>
                <button className="text-sm text-[#FDA758] font-medium flex items-center">
                  View All
                  <svg className="ml-1 w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6L15 12L9 18" stroke="#FDA758" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {routines.slice(0, 3).map(routine => (
                  <div
                    key={routine.id}
                    className="bg-white rounded-[24px] p-5 shadow-sm cursor-pointer"
                    onClick={() => router.push(`/training/routine/${routine.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-14 h-14 rounded-full bg-[#FDA758] flex items-center justify-center mr-3"
                        >
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.5 6.5L17.5 17.5M6.5 17.5L17.5 6.5M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-[#573353] font-semibold text-base">{routine.name}</h3>
                          <p className="text-[#573353]/70 text-sm mt-0.5">{routine.description}</p>
                        </div>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 6L15 12L9 18" stroke="#573353" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>

                    <div className="flex mt-4 space-x-4">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-[#573353]/70 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 6.5V12L15 15M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2Z" stroke="#573353" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-xs text-[#573353]/70">45 min</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-[#573353]/70 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6.5 6.5L17.5 17.5M6.5 17.5L17.5 6.5M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#573353" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-xs text-[#573353]/70">{routine.days?.length || 0} days</span>
                      </div>
                      <div className="bg-[#F5F5F5] px-2 py-1 rounded-full">
                        <span className="text-xs text-[#573353]/70 capitalize">{routine.level}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Training Coach */}
            <div className="mb-8">
              <AITrainingCoach />
            </div>

            {/* Workout History */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-[#573353]">Workout History</h2>
                <button
                  className="text-sm text-[#FDA758] font-medium flex items-center"
                  onClick={() => router.push('/training/history')}
                >
                  View All
                  <svg className="ml-1 w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6L15 12L9 18" stroke="#FDA758" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="bg-white rounded-[24px] p-5 shadow-sm">
                <div className="space-y-5">
                  {logs.length > 0 ? (
                    logs.slice(0, 3).map(log => (
                      <div
                        key={log.id}
                        className="flex items-center cursor-pointer"
                        onClick={() => router.push(`/training/workout-details/${log.id}`)}
                      >
                        <div className="bg-[#5DE292] p-3 rounded-full mr-4 w-14 h-14 flex items-center justify-center">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[#573353]">{new Date(log.date).toLocaleDateString()}</p>
                          <p className="text-xs text-[#573353]/70">{log.duration} min • {log.completedSets?.length || 0} sets</p>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 6L15 12L9 18" stroke="#573353" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-[#573353]/70 text-sm mb-4">No hay entrenamientos registrados</p>
                      <button
                        className="bg-[#FDA758] text-white font-medium rounded-full px-4 py-2 text-sm shadow-sm"
                        onClick={() => router.push('/training/log-workout')}
                      >
                        Registrar entrenamiento
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    className="bg-white border border-[#FDA758] text-[#FDA758] font-medium rounded-full px-4 py-2 text-sm shadow-sm"
                    onClick={() => router.push('/training/log-workout')}
                  >
                    Registrar entrenamiento manualmente
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-[#573353]">Exercise Library</h2>
              <button className="text-sm text-[#FDA758] font-medium flex items-center">
                View All
                <svg className="ml-1 w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6L15 12L9 18" stroke="#FDA758" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[24px] p-5 shadow-sm cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-[#8C80F8] flex items-center justify-center mb-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.5 6.5L17.5 17.5M6.5 17.5L17.5 6.5M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-[#573353] font-semibold text-base">Chest</h3>
                <p className="text-[#573353]/70 text-sm mt-1">12 exercises</p>
              </div>

              <div className="bg-white rounded-[24px] p-5 shadow-sm cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-[#5DE292] flex items-center justify-center mb-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-[#573353] font-semibold text-base">Back</h3>
                <p className="text-[#573353]/70 text-sm mt-1">15 exercises</p>
              </div>

              <div className="bg-white rounded-[24px] p-5 shadow-sm cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-[#FF7285] flex items-center justify-center mb-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-[#573353] font-semibold text-base">Legs</h3>
                <p className="text-[#573353]/70 text-sm mt-1">18 exercises</p>
              </div>

              <div className="bg-white rounded-[24px] p-5 shadow-sm cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-[#5CC2FF] flex items-center justify-center mb-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-[#573353] font-semibold text-base">Arms</h3>
                <p className="text-[#573353]/70 text-sm mt-1">10 exercises</p>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-[#573353]">Calendario de Entrenamiento</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/training/calendar')}
                className="rounded-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Ver completo
              </Button>
            </div>
            <WorkoutCalendar />
          </div>
        )}

        {/* Execute Tab */}
        {activeTab === 'execute' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-[#573353]">Ejecutar Entrenamiento</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/training/execute-workout')}
                className="rounded-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar rutina
              </Button>
            </div>
            <ExecuteWorkout userId={userId} setActiveTab={setActiveTab} />
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-[#573353]">Análisis de Postura</h2>
            </div>
            <PostureAnalysis
              onSave={(feedback) => {
                toast({
                  title: "Análisis guardado",
                  description: "El análisis de postura ha sido guardado correctamente"
                })
              }}
            />
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-[#573353]">Progreso de Entrenamiento</h2>
            </div>
            <PerformanceTracking />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 w-[414px] h-[80px] bg-white border-t border-gray-100 flex justify-around items-center py-3 px-2 z-10 shadow-md">
        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => router.push('/dashboard')}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 22V12H15V22M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                stroke="#573353"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-[#573353]/70">Home</span>
        </button>

        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => setActiveTab('execute')}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3L19 12L5 21V3Z"
                stroke="#573353"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-[#573353]/70">Entrenar</span>
        </button>

        <button
          className="flex flex-col items-center relative w-[20%]"
          onClick={() => router.push('/training/execute-workout')}
        >
          <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-r from-[#FDA758] to-[#FE9870] flex items-center justify-center absolute -top-[26px] shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="w-7 h-7 mt-8"></div>
          <span className="text-xs font-medium text-[#573353]/70">Ejecutar</span>
        </button>

        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => setActiveTab('calendar')}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                stroke="#573353"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
              <path d="M16 2V6M8 2V6M3 10H21M8 14H8.01M12 14H12.01M16 14H16.01M8 18H8.01M12 18H12.01M16 18H16.01"
                stroke="#573353"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-[#573353]/70">Calendar</span>
        </button>

        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => router.push('/profile')}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                stroke="#573353"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-[#573353]/70">Profile</span>
        </button>
      </div>
    </div>
  )
}
