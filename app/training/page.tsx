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
import { WorkoutRoutine, WorkoutDay, WorkoutLog } from "@/lib/types/training"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

// Import our new contexts
import { useAuth } from "@/lib/contexts/auth-context"
import { useTraining } from "@/lib/contexts/training-context"

import { ExecuteWorkout } from "@/components/training/execute-workout"

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { toast } = useToast()
  const router = useRouter()

  // Use our new contexts
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

  // Load data when component mounts
  useEffect(() => {
    refreshRoutines()
    refreshLogs()
  }, [refreshRoutines, refreshLogs])

  // Crear una nueva rutina - solo para admin
  const createNewRoutine = async () => {
    if (!user) {
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
      console.log("Intentando guardar rutina:", newRoutine)
      const { success, error } = await saveRoutine(newRoutine)

      if (error) {
        console.error("Error al crear rutina:", error)
        toast({
          title: "Error",
          description: "No se pudo crear la rutina: " + (error.message || JSON.stringify(error)),
          variant: "destructive"
        })
        return
      }

      if (success) {
        // Mostrar mensaje de éxito
        toast({
          title: "Éxito",
          description: "Rutina creada correctamente",
        })

        // Redirigir a la página de edición después de un breve retraso
        setTimeout(() => {
          router.push(`/training/edit/${newRoutine.id}`)
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
    if (!user) return

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
      const { success, error } = await deleteWorkoutRoutine(routineId)

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

  // Renderizar rutinas
  const renderRoutines = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="text-indigo-700 font-medium mt-4 animate-pulse">Cargando tus rutinas de entrenamiento...</p>
          <p className="text-gray-500 text-sm mt-2">Esto solo tomará un momento</p>
        </div>
      )
    }

    if (routines.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-md">
            <Dumbbell className="h-12 w-12 text-indigo-400" />
          </div>

          <h3 className="text-2xl font-bold mb-3 text-gray-800">No tienes rutinas de entrenamiento</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Crea tu primera rutina personalizada para comenzar a entrenar y alcanzar tus objetivos fitness</p>

          <div className="flex flex-col space-y-3 max-w-xs mx-auto">
            {user?.email === "admin@routinize.com" ? (
              <>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100 mb-4 text-left">
                  <h4 className="font-medium text-indigo-800 mb-2 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2 text-indigo-600" />
                    Recomendación
                  </h4>
                  <p className="text-sm text-indigo-700">
                    Genera un plan de entrenamiento personalizado con IA basado en tus objetivos y nivel de experiencia para obtener mejores resultados.
                  </p>
                </div>

                <Button
                  variant="default"
                  onClick={() => router.push("/training/generate-plan")}
                  className="w-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md h-12"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generar plan con IA
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm text-gray-500">O crea manualmente</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => router.push("/training/create-routine")}
                  className="w-full rounded-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-11"
                >
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Crear rutina personalizada
                </Button>

                <Button
                  variant="outline"
                  onClick={createNewRoutine}
                  className="w-full rounded-full border-blue-200 text-blue-700 hover:bg-blue-50 h-11"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Crear rutina en blanco
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => router.push("/training/templates")}
                  className="w-full rounded-full text-gray-600 hover:bg-gray-100 h-11"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver plantillas científicas
                </Button>
              </>
            ) : (
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 text-center">
                <Info className="h-10 w-10 mx-auto text-blue-500 mb-3" />
                <p className="text-blue-800 font-medium mb-2">
                  Acceso restringido
                </p>
                <p className="text-blue-700 text-sm">
                  Las rutinas son administradas por el entrenador. Contacta con <span className="font-medium">admin@routinize.com</span> para solicitar cambios o nuevas rutinas.
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <OrganicElement type="fade">
          <Card organic={true} hover={true} className="p-6 border-indigo-100 bg-gradient-to-r from-white to-indigo-50/30">
            <OrganicSection
              title={
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <Dumbbell className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Mis rutinas de entrenamiento</h2>
                </div>
              }
              action={
                <div className="flex space-x-2">
                  {user?.email === "admin@routinize.com" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        onClick={() => router.push("/training/generate-plan")}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        IA
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => router.push("/training/create-routine")}
                      >
                        <Dumbbell className="h-4 w-4 mr-2" />
                        Personalizada
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
                    className="border rounded-lg p-5 hover:shadow-md transition-all duration-300 bg-white relative overflow-hidden group"
                    style={{
                      borderLeftWidth: '4px',
                      borderLeftColor:
                        routine.goal === 'hipertrofia' ? '#a855f7' :
                        routine.goal === 'fuerza' ? '#3b82f6' :
                        routine.goal === 'resistencia' ? '#22c55e' :
                        '#6366f1'
                    }}
                  >
                    {/* Indicador de nivel en la esquina superior derecha */}
                    <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                      <div
                        className={`absolute transform rotate-45 translate-y-[-50%] translate-x-[15%] w-[120%] py-1 text-center text-xs font-medium text-white shadow-sm ${routine.level === 'principiante' ? 'bg-green-500' : routine.level === 'intermedio' ? 'bg-amber-500' : 'bg-red-500'}`}
                      >
                        {routine.level}
                      </div>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-16">
                        <div className="flex items-center">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                            style={{
                              backgroundColor:
                                routine.goal === 'hipertrofia' ? '#f3e8ff' :
                                routine.goal === 'fuerza' ? '#dbeafe' :
                                routine.goal === 'resistencia' ? '#dcfce7' :
                                '#e0e7ff'
                            }}
                          >
                            {routine.goal === 'hipertrofia' ? (
                              <Dumbbell className="h-5 w-5 text-purple-600" />
                            ) : routine.goal === 'fuerza' ? (
                              <Flame className="h-5 w-5 text-blue-600" />
                            ) : routine.goal === 'resistencia' ? (
                              <Clock className="h-5 w-5 text-green-600" />
                            ) : (
                              <Dumbbell className="h-5 w-5 text-indigo-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">{routine.name}</h3>
                            <div className="flex items-center mt-1">
                              <Badge
                                className={`${routine.goal === 'hipertrofia' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                  routine.goal === 'fuerza' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  routine.goal === 'resistencia' ? 'bg-green-100 text-green-800 border-green-200' :
                                  'bg-indigo-100 text-indigo-800 border-indigo-200'}`}
                              >
                                {routine.goal === 'hipertrofia' ? 'Hipertrofia' :
                                 routine.goal === 'fuerza' ? 'Fuerza' :
                                 routine.goal === 'resistencia' ? 'Resistencia' :
                                 'General'}
                              </Badge>
                              <Badge className="ml-2 bg-gray-100 text-gray-800 border-gray-200">
                                {routine.frequency}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">{routine.description}</p>

                        <div className="flex items-center mt-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                            <span>{routine.days?.length || 0} días</span>
                          </div>
                          <span className="mx-2">•</span>
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                            <span>~{routine.days?.reduce((acc, day) => acc + (day.estimatedDuration || 45), 0) / (routine.days?.length || 1)} min/día</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-1">
                        {user?.email === "admin@routinize.com" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => editRoutine(routine.id)}
                              className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRoutine(routine.id)}
                              className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        className="rounded-full shadow-sm"
                        style={{
                          backgroundColor:
                            routine.goal === 'hipertrofia' ? '#a855f7' :
                            routine.goal === 'fuerza' ? '#3b82f6' :
                            routine.goal === 'resistencia' ? '#22c55e' :
                            '#6366f1',
                          borderColor: 'transparent'
                        }}
                        onClick={() => startWorkout(routine.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar entrenamiento
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-full border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        onClick={() => router.push(`/training/routine/${routine.id}`)}
                      >
                        <ChevronRight className="h-4 w-4 mr-2" />
                        Ver detalles
                      </Button>
                    </div>

                    {/* Indicador de hover */}
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom"></div>
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
            {user && <TrainingDashboard userId={user.id} />}
          </div>
        )}

        {/* Plan Tab */}
        {activeTab === 'plan' && (
          <div>
            {user && (
              <WorkoutPlanDisplay
                userId={user.id}
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
            {user && <ExecuteWorkout userId={user.id} setActiveTab={setActiveTab} />}
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
