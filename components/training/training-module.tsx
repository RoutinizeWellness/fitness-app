"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dumbbell, Calendar, Filter, Plus,
  ChevronRight, BarChart3, Settings,
  Clock, Zap, Award, Flame,
  ArrowRight, Check, X, Info,
  Loader2, Brain
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar3D, Avatar3DImage, Avatar3DFallback } from "@/components/ui/avatar-3d"
import { User } from "@supabase/supabase-js"
import { WorkoutRoutine, WorkoutDay, WorkoutLog, Exercise } from "@/lib/types/training"
import { RoutinesList } from "@/components/training/routines-list"
import { ActiveWorkout } from "@/components/training/active-workout"
import { WorkoutHistory } from "@/components/training/workout-history"
import { TrainingStats } from "@/components/training/training-stats"
import { RoutineBuilder } from "@/components/training/routine-builder"
import { RoutineTemplateCreator } from "@/components/training/routine-template-creator"
import { UserTrainerFeedback } from "@/components/training/user-trainer-feedback"
import { AdaptiveRecommendations } from "@/components/training/adaptive-recommendations"
import { ExperienceConditional, ExperienceContent } from "@/components/ui/experience-conditional"
import { ExperienceModeToggle } from "@/components/ui/experience-mode-toggle"
import { useUserExperience } from "@/contexts/user-experience-context"
import { SimplifiedWorkoutBuilder } from "@/components/training/beginner/simplified-workout-builder"
import { PeriodizationPlanner } from "@/components/training/advanced/periodization-planner"
import { PerformanceAnalytics } from "@/components/training/advanced/performance-analytics"
import { EnhancedRoutineSelector } from "@/components/training/enhanced-routine-selector"
import { SmartRoutineRecommendations } from "@/components/training/smart-routine-recommendations"
import { RealTimeRoutineModifier } from "@/components/training/real-time-routine-modifier"
import { getUserAdaptiveProfile, adaptRoutineForUser } from "@/lib/adaptive-routine-engine"
import { calculateProgressiveOverload } from "@/lib/progressive-overload-calculator"
import {
  getWorkoutRoutines,
  getWorkoutLogs,
  getExercises,
  saveWorkoutRoutine,
  saveWorkoutLog,
  subscribeToWorkoutRoutines,
  subscribeToWorkoutLogs
} from "@/lib/supabase-training"
import { toast } from "@/components/ui/use-toast"

interface TrainingModuleProps {
  profile: User | null
  isAdmin: boolean
  isLoading?: boolean
  onNavigate?: (path: string) => void
}

export function TrainingModule({
  profile,
  isAdmin,
  isLoading = false,
  onNavigate
}: TrainingModuleProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("routines")
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([])
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [activeRoutine, setActiveRoutine] = useState<WorkoutRoutine | null>(null)
  const [activeDay, setActiveDay] = useState<WorkoutDay | null>(null)
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false)
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null)
  const [isLoadingRoutines, setIsLoadingRoutines] = useState(false)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [isLoadingExercises, setIsLoadingExercises] = useState(false)
  const [adaptiveProfile, setAdaptiveProfile] = useState<any>(null)
  const [showAdaptiveSelector, setShowAdaptiveSelector] = useState(false)
  const [selectedAdaptiveRoutine, setSelectedAdaptiveRoutine] = useState<WorkoutRoutine | null>(null)
  const [isAdaptingRoutine, setIsAdaptingRoutine] = useState(false)

  // Cargar rutinas y logs del usuario
  useEffect(() => {
    if (!profile) return

    const fetchData = async () => {
      // Cargar rutinas
      setIsLoadingRoutines(true)
      try {
        const { data: routinesData, error: routinesError } = await getWorkoutRoutines(profile.id)
        if (routinesError) {
          console.error('Error al cargar rutinas:', routinesError)
          toast({
            title: 'Error al cargar rutinas',
            description: 'No se pudieron cargar tus rutinas de entrenamiento.',
            variant: 'destructive'
          })
        } else if (routinesData) {
          console.log('Rutinas cargadas:', routinesData)
          setRoutines(routinesData)

          // Si hay una rutina activa, establecerla
          const active = routinesData.find(r => r.isActive)
          if (active) {
            setActiveRoutine(active)
            // Determinar qué día toca hoy
            const today = new Date().getDay()
            // Simplemente tomamos el día correspondiente al día de la semana (0 = domingo)
            const dayIndex = today % active.days.length
            setActiveDay(active.days[dayIndex])
          }
        }
      } catch (error) {
        console.error('Error al cargar rutinas:', error)
      } finally {
        setIsLoadingRoutines(false)
      }

      // Cargar logs
      setIsLoadingLogs(true)
      try {
        const { data: logsData, error: logsError } = await getWorkoutLogs(profile.id)
        if (logsError) {
          console.error('Error al cargar logs:', logsError)
          toast({
            title: 'Error al cargar historial',
            description: 'No se pudo cargar tu historial de entrenamientos.',
            variant: 'destructive'
          })
        } else if (logsData) {
          console.log('Logs cargados:', logsData)
          setWorkoutLogs(logsData)
        }
      } catch (error) {
        console.error('Error al cargar logs:', error)
      } finally {
        setIsLoadingLogs(false)
      }

      // Cargar ejercicios
      setIsLoadingExercises(true)
      try {
        const { data: exercisesData, error: exercisesError } = await getExercises()
        if (exercisesError) {
          console.error('Error al cargar ejercicios:', exercisesError)
          toast({
            title: 'Error al cargar ejercicios',
            description: 'No se pudieron cargar los ejercicios disponibles.',
            variant: 'destructive'
          })
        } else if (exercisesData) {
          console.log('Ejercicios cargados:', exercisesData)
          setExercises(exercisesData)
        }
      } catch (error) {
        console.error('Error al cargar ejercicios:', error)
      } finally {
        setIsLoadingExercises(false)
      }

      // Cargar perfil adaptativo
      try {
        const adaptiveProfileData = await getUserAdaptiveProfile(profile.id)
        setAdaptiveProfile(adaptiveProfileData)
      } catch (error) {
        console.error('Error al cargar perfil adaptativo:', error)
      }
    }

    fetchData()

    // Suscribirse a cambios en tiempo real
    const routinesSubscription = subscribeToWorkoutRoutines(profile.id, async (payload) => {
      console.log('Cambio en rutinas:', payload)
      // Recargar rutinas
      const { data, error } = await getWorkoutRoutines(profile.id)
      if (!error && data) {
        setRoutines(data)
      }
    })

    const logsSubscription = subscribeToWorkoutLogs(profile.id, async (payload) => {
      console.log('Cambio en logs:', payload)
      // Recargar logs
      const { data, error } = await getWorkoutLogs(profile.id)
      if (!error && data) {
        setWorkoutLogs(data)
      }
    })

    // Limpiar suscripciones
    return () => {
      routinesSubscription.unsubscribe()
      logsSubscription.unsubscribe()
    }
  }, [profile])

  // Función para iniciar un entrenamiento
  const startWorkout = (routineId: string, dayId: string) => {
    const routine = routines.find(r => r.id === routineId)
    if (!routine) return

    const day = routine.days.find(d => d.id === dayId)
    if (!day) return

    setActiveRoutine(routine)
    setActiveDay(day)
    setActiveTab("workout")
  }

  // Función para crear una nueva rutina
  const createNewRoutine = () => {
    setIsCreatingRoutine(true)
    setIsCreatingTemplate(false)
    setEditingRoutine(null)
    setActiveTab("builder")
  }

  // Función para editar una rutina existente
  const editRoutine = (routine: WorkoutRoutine) => {
    setEditingRoutine(routine)
    setIsCreatingRoutine(false)
    setIsCreatingTemplate(false)
    setActiveTab("builder")
  }

  // Función para crear una rutina a partir de plantilla
  const createTemplateRoutine = () => {
    setIsCreatingTemplate(true)
    setIsCreatingRoutine(false)
    setActiveTab("template")
  }

  // Función para guardar una nueva rutina
  const saveRoutine = async (routine: WorkoutRoutine) => {
    try {
      console.log('Guardando rutina:', routine.name, 'ID:', routine.id)

      // Asegurarse de que el ID de usuario sea válido
      if (!profile?.id) {
        toast({
          title: 'Error al guardar rutina',
          description: 'No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.',
          variant: 'destructive'
        })
        return
      }

      // Asegurarse de que la rutina tenga un ID de usuario válido
      const routineWithUserId = {
        ...routine,
        userId: profile.id
      }

      const { data, error } = await saveWorkoutRoutine(routineWithUserId)

      if (error) {
        console.error('Error al guardar rutina:', error)
        let errorMessage = 'No se pudo guardar la rutina de entrenamiento.'

        // Intentar obtener un mensaje de error más específico
        if (error instanceof Error) {
          errorMessage = error.message || errorMessage
        } else if (typeof error === 'object' && error !== null) {
          errorMessage = JSON.stringify(error)
        }

        toast({
          title: 'Error al guardar rutina',
          description: errorMessage,
          variant: 'destructive'
        })
        return
      }

      toast({
        title: 'Rutina guardada',
        description: 'Tu rutina de entrenamiento ha sido guardada correctamente.',
        variant: 'default'
      })

      // Recargar rutinas
      try {
        const { data: routinesData, error: routinesError } = await getWorkoutRoutines(profile.id)
        if (routinesError) {
          console.error('Error al recargar rutinas:', routinesError)
        } else if (routinesData) {
          setRoutines(routinesData)
        }
      } catch (reloadError) {
        console.error('Error al recargar rutinas:', reloadError)
      }

      // Limpiar estado y volver a la lista de rutinas
      setIsCreatingRoutine(false)
      setIsCreatingTemplate(false)
      setEditingRoutine(null)
      setActiveTab("routines")
    } catch (error) {
      console.error('Error al guardar rutina:', error)
      let errorMessage = 'Ocurrió un error inesperado al guardar la rutina.'

      if (error instanceof Error) {
        console.error('Mensaje de error:', error.message)
        console.error('Stack trace:', error.stack)
        errorMessage = error.message || errorMessage
      }

      toast({
        title: 'Error al guardar rutina',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }

  // Función para registrar un entrenamiento completado
  const logWorkout = async (log: WorkoutLog) => {
    try {
      const { data, error } = await saveWorkoutLog(log)

      if (error) {
        console.error('Error al guardar entrenamiento:', error)
        toast({
          title: 'Error al guardar entrenamiento',
          description: 'No se pudo guardar el registro de entrenamiento.',
          variant: 'destructive'
        })
        return
      }

      toast({
        title: 'Entrenamiento registrado',
        description: '¡Buen trabajo! Tu entrenamiento ha sido registrado correctamente.',
        variant: 'default'
      })

      // Recargar logs
      const { data: logsData, error: logsError } = await getWorkoutLogs(profile?.id || '')
      if (!logsError && logsData) {
        setWorkoutLogs(logsData)
      }

      setActiveTab("history")
    } catch (error) {
      console.error('Error al guardar entrenamiento:', error)
      toast({
        title: 'Error al guardar entrenamiento',
        description: 'Ocurrió un error inesperado al guardar el entrenamiento.',
        variant: 'destructive'
      })
    }
  }

  // Funciones para rutinas adaptativas
  const handleSelectAdaptiveRoutine = async (routine: WorkoutRoutine) => {
    try {
      setIsAdaptingRoutine(true)

      if (adaptiveProfile) {
        const adapted = await adaptRoutineForUser(routine, {
          userId: profile.id,
          goal: routine.goal as any,
          duration: routine.duration || 8,
          autoAdjust: true,
          considerFatigue: true,
          considerPerformance: true,
          allowEquipmentSubstitutions: true,
          difficultyScaling: 'auto'
        })

        setSelectedAdaptiveRoutine(adapted.adaptedRoutine)
        setActiveRoutine(adapted.adaptedRoutine)

        toast({
          title: "Rutina Adaptada",
          description: `Rutina personalizada según tu perfil. ${adapted.adaptations.length} adaptaciones aplicadas.`,
        })
      } else {
        setSelectedAdaptiveRoutine(routine)
        setActiveRoutine(routine)
      }

      setShowAdaptiveSelector(false)
    } catch (error) {
      console.error('Error al adaptar rutina:', error)
      toast({
        title: "Error",
        description: "No se pudo adaptar la rutina",
        variant: "destructive"
      })
    } finally {
      setIsAdaptingRoutine(false)
    }
  }

  const handlePreviewAdaptiveRoutine = async (routine: WorkoutRoutine) => {
    // Implementar vista previa de rutina adaptativa
    console.log('Vista previa de rutina:', routine)
  }

  const handleStartAdaptiveWorkout = async (routine: WorkoutRoutine) => {
    await handleSelectAdaptiveRoutine(routine)
    setActiveTab("workout")
  }

  const handleAdaptiveRoutineModified = (modifiedRoutine: WorkoutRoutine) => {
    setSelectedAdaptiveRoutine(modifiedRoutine)
    setActiveRoutine(modifiedRoutine)
  }

  const handleAdaptiveDayModified = (modifiedDay: WorkoutDay) => {
    if (selectedAdaptiveRoutine) {
      const updatedRoutine = {
        ...selectedAdaptiveRoutine,
        days: selectedAdaptiveRoutine.days.map(day =>
          day.id === modifiedDay.id ? modifiedDay : day
        )
      }
      setSelectedAdaptiveRoutine(updatedRoutine)
      setActiveRoutine(updatedRoutine)
    }
  }

  // Mostrar estado de carga
  const isDataLoading = isLoading || isLoadingRoutines || isLoadingLogs || isLoadingExercises

  if (isDataLoading) {
    return (
      <div className="space-y-6 py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold gradient-text">Entrenamiento</h1>
          <p className="text-gray-500">
            Cargando datos...
          </p>
        </div>

        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-500">
              {isLoadingRoutines ? "Cargando rutinas..." :
               isLoadingLogs ? "Cargando historial..." :
               isLoadingExercises ? "Cargando ejercicios..." :
               "Cargando datos..."}
            </p>
          </div>
        </div>

        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Encabezado */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Entrenamiento</h1>
            <p className="text-gray-500">
              Gestiona tus rutinas y registra tus progresos
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button3D
              variant="outline"
              size="sm"
              onClick={() => router.push('/training/elite')}
              className="flex items-center"
            >
              <Brain className="h-4 w-4 mr-1" />
              Elite
            </Button3D>
            <ExperienceModeToggle variant="button" />
          </div>
        </div>
      </div>

      {/* Pestañas de navegación */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ExperienceConditional
          beginnerContent={
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="routines">Rutinas</TabsTrigger>
              <TabsTrigger value="adaptive">IA Adaptiva</TabsTrigger>
              <TabsTrigger value="workout">Entrenar</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>
          }
          advancedContent={
            <TabsList className="grid grid-cols-8 mb-4">
              <TabsTrigger value="routines">Rutinas</TabsTrigger>
              <TabsTrigger value="adaptive">IA Adaptiva</TabsTrigger>
              <TabsTrigger value="workout">Entrenar</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
              <TabsTrigger value="periodization">Periodización</TabsTrigger>
              <TabsTrigger value="analytics">Análisis</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>
          }
        />

        {/* Contenido de las pestañas */}
        <TabsContent value="routines" className="space-y-4">
          <RoutinesList
            routines={routines}
            onStartWorkout={startWorkout}
            onCreateRoutine={createNewRoutine}
            onCreateTemplateRoutine={createTemplateRoutine}
            onEditRoutine={editRoutine}
          />
        </TabsContent>

        <TabsContent value="adaptive" className="space-y-4">
          {profile && (
            <div className="space-y-6">
              {/* Recomendaciones inteligentes */}
              <SmartRoutineRecommendations
                userId={profile.id}
                currentRoutines={routines}
                onSelectRecommendation={handleSelectAdaptiveRoutine}
                onPreviewRecommendation={handlePreviewAdaptiveRoutine}
              />

              {/* Selector de rutinas mejorado */}
              <EnhancedRoutineSelector
                routines={routines}
                userId={profile.id}
                onSelectRoutine={handleSelectAdaptiveRoutine}
                onPreviewRoutine={handlePreviewAdaptiveRoutine}
                onStartWorkout={handleStartAdaptiveWorkout}
              />

              {/* Modificador en tiempo real - Solo si hay rutina activa */}
              {selectedAdaptiveRoutine && activeDay && (
                <RealTimeRoutineModifier
                  routine={selectedAdaptiveRoutine}
                  currentDay={activeDay}
                  userId={profile.id}
                  onRoutineModified={handleAdaptiveRoutineModified}
                  onDayModified={handleAdaptiveDayModified}
                />
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workout" className="space-y-4">
          {activeRoutine && activeDay ? (
            <ActiveWorkout
              routine={activeRoutine}
              day={activeDay}
              onComplete={logWorkout}
              availableExercises={exercises}
            />
          ) : (
            <Card3D className="p-6 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <Dumbbell className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay entrenamiento activo</h3>
                <p className="text-gray-500 mb-4">Selecciona una rutina para comenzar a entrenar</p>
                <Button3D onClick={() => setActiveTab("routines")}>
                  Ver rutinas
                </Button3D>
              </div>
            </Card3D>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <WorkoutHistory logs={workoutLogs} />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <TrainingStats
            logs={workoutLogs}
            userId={profile?.id || ""}
          />

          {profile && (
            <AdaptiveRecommendations
              userId={profile.id}
              routines={routines}
              logs={workoutLogs}
              className="mt-6"
            />
          )}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          {profile && (
            <UserTrainerFeedback userId={profile.id} />
          )}
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <ExperienceConditional
            beginnerContent={
              <SimplifiedWorkoutBuilder />
            }
            advancedContent={
              <RoutineBuilder
                isCreating={isCreatingRoutine}
                onSave={saveRoutine}
                onCancel={() => {
                  setIsCreatingRoutine(false)
                  setEditingRoutine(null)
                  setActiveTab("routines")
                }}
                userId={profile?.id || ""}
                availableExercises={exercises}
                existingRoutine={editingRoutine}
              />
            }
          />
        </TabsContent>

        <TabsContent value="template" className="space-y-4">
          <RoutineTemplateCreator
            userId={profile?.id || ""}
            availableExercises={exercises}
            onSave={saveRoutine}
            onCancel={() => {
              setIsCreatingTemplate(false)
              setActiveTab("routines")
            }}
          />
        </TabsContent>

        {/* Pestañas avanzadas */}
        <TabsContent value="periodization" className="space-y-4">
          <ExperienceContent interfaceMode="advanced">
            <PeriodizationPlanner />
          </ExperienceContent>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <ExperienceContent interfaceMode="advanced">
            <PerformanceAnalytics />
          </ExperienceContent>
        </TabsContent>
      </Tabs>

      {/* Botón flotante para añadir rutina */}
      {activeTab === "routines" && (
        <div className="fixed bottom-20 right-4">
          <Button3D
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
            onClick={createNewRoutine}
          >
            <Plus className="h-6 w-6" />
          </Button3D>
        </div>
      )}

      {/* Panel de administrador - Solo visible para administradores */}
      {isAdmin && activeTab === "stats" && (
        <Card3D>
          <Card3DHeader>
            <div className="flex items-center">
              <Card3DTitle gradient={true}>Panel de Administrador</Card3DTitle>
              <Badge variant="outline" className="ml-2">Admin</Badge>
            </div>
          </Card3DHeader>
          <Card3DContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Como administrador, puedes acceder a funciones avanzadas para gestionar el sistema de entrenamiento.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Button3D variant="outline" className="flex items-center justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar algoritmo
                </Button3D>

                <Button3D variant="outline" className="flex items-center justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Análisis avanzado
                </Button3D>
              </div>
            </div>
          </Card3DContent>
        </Card3D>
      )}
    </div>
  )
}
