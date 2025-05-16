"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { Button3D } from "@/components/ui/button-3d"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { WorkoutRoutineWithAlternatives } from "@/components/training/workout-routine-with-alternatives"
import { getWorkoutRoutineById, updateWorkoutRoutine } from "@/lib/supabase-training"
import { WorkoutRoutine, WorkoutDay, Exercise } from "@/lib/types/training"
import { MesoCycle } from "@/lib/enhanced-periodization"
import { toast } from "@/components/ui/use-toast"
import { use } from "react"

interface RoutinePageProps {
  params: {
    id: string
  }
}

export default function RoutinePage({ params }: RoutinePageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mesoCycle, setMesoCycle] = useState<MesoCycle | null>(null)
  const [routineId, setRoutineId] = useState<string>("")

  // Set the routine ID from params using React.use()
  useEffect(() => {
    // Unwrap params with React.use() as recommended by Next.js
    const unwrappedParams = use(params);
    if (unwrappedParams && unwrappedParams.id) {
      setRoutineId(unwrappedParams.id)
    }
  }, [])

  // Cargar la rutina
  useEffect(() => {
    const loadRoutine = async () => {
      if (!user) {
        router.push("/welcome")
        return
      }

      if (!routineId) {
        return // Wait until we have the routine ID
      }

      setIsLoading(true)
      try {
        const { data, error } = await getWorkoutRoutineById(routineId)

        if (error) {
          throw error
        }

        if (data) {
          setRoutine(data)

          // Si la rutina tiene configuración de periodización, cargarla
          if (data.periodizationId) {
            // Aquí cargaríamos la periodización desde la API
            // Por ahora, usamos datos de ejemplo
            setMesoCycle({
              id: "sample-mesocycle",
              name: "Mesociclo de Hipertrofia",
              duration: 6, // 6 semanas
              microCycles: [
                {
                  id: "micro-1",
                  name: "Semana 1 - Adaptación",
                  weekNumber: 1,
                  volume: "moderate",
                  intensity: "low",
                  frequency: 4,
                  isDeload: false
                },
                {
                  id: "micro-2",
                  name: "Semana 2 - Acumulación",
                  weekNumber: 2,
                  volume: "high",
                  intensity: "moderate",
                  frequency: 5,
                  isDeload: false
                },
                {
                  id: "micro-3",
                  name: "Semana 3 - Intensificación",
                  weekNumber: 3,
                  volume: "high",
                  intensity: "high",
                  frequency: 5,
                  isDeload: false
                },
                {
                  id: "micro-4",
                  name: "Semana 4 - Sobrecarga",
                  weekNumber: 4,
                  volume: "very_high",
                  intensity: "high",
                  frequency: 5,
                  isDeload: false
                },
                {
                  id: "micro-5",
                  name: "Semana 5 - Intensificación",
                  weekNumber: 5,
                  volume: "high",
                  intensity: "very_high",
                  frequency: 5,
                  isDeload: false
                },
                {
                  id: "micro-6",
                  name: "Semana 6 - Descarga",
                  weekNumber: 6,
                  volume: "low",
                  intensity: "moderate",
                  frequency: 3,
                  isDeload: true
                }
              ],
              phase: "hypertrophy",
              goal: "hypertrophy",
              volumeProgression: "wave",
              intensityProgression: "ascending",
              includesDeload: true,
              deloadStrategy: {
                type: "volume",
                volumeReduction: 50,
                intensityReduction: 20,
                frequencyReduction: 2,
                duration: 7,
                timing: "fixed"
              }
            })
          }
        }
      } catch (error) {
        console.error("Error al cargar la rutina:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la rutina",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadRoutine()
  }, [user, routineId, router])

  // Manejar actualización de la rutina
  const handleUpdateRoutine = async (updatedRoutine: WorkoutRoutine) => {
    try {
      const { error } = await updateWorkoutRoutine(updatedRoutine)

      if (error) {
        throw error
      }

      setRoutine(updatedRoutine)

      toast({
        title: "Rutina actualizada",
        description: "Los cambios se han guardado correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar la rutina:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la rutina",
        variant: "destructive"
      })
    }
  }

  // Manejar inicio de entrenamiento
  const handleStartWorkout = (routineId: string) => {
    router.push(`/workout-active?routineId=${routineId}`)
  }

  // Manejar edición de rutina
  const handleEditRoutine = (routineId: string) => {
    router.push(`/training/routine/edit/${routineId}`)
  }

  // Manejar eliminación de rutina
  const handleDeleteRoutine = (routineId: string) => {
    // Mostrar confirmación antes de eliminar
    if (confirm("¿Estás seguro de que quieres eliminar esta rutina? Esta acción no se puede deshacer.")) {
      // Aquí iría la lógica para eliminar la rutina
      router.push("/training")
    }
  }

  // Manejar adición de día
  const handleAddDay = (routineId: string) => {
    router.push(`/training/routine/${routineId}/add-day`)
  }

  // Manejar edición de día
  const handleEditDay = (routineId: string, dayId: string) => {
    router.push(`/training/routine/${routineId}/edit-day/${dayId}`)
  }

  // Manejar eliminación de día
  const handleDeleteDay = (routineId: string, dayId: string) => {
    // Mostrar confirmación antes de eliminar
    if (confirm("¿Estás seguro de que quieres eliminar este día? Esta acción no se puede deshacer.")) {
      // Aquí iría la lógica para eliminar el día
    }
  }

  // Manejar adición de ejercicio
  const handleAddExercise = (routineId: string, dayId: string) => {
    router.push(`/training/routine/${routineId}/day/${dayId}/add-exercise`)
  }

  // Manejar edición de ejercicio
  const handleEditExercise = (routineId: string, dayId: string, exerciseId: string) => {
    router.push(`/training/routine/${routineId}/day/${dayId}/edit-exercise/${exerciseId}`)
  }

  // Manejar eliminación de ejercicio
  const handleDeleteExercise = (routineId: string, dayId: string, exerciseId: string) => {
    // Mostrar confirmación antes de eliminar
    if (confirm("¿Estás seguro de que quieres eliminar este ejercicio? Esta acción no se puede deshacer.")) {
      // Aquí iría la lógica para eliminar el ejercicio
      if (routine) {
        // Encontrar el día
        const dayIndex = routine.days.findIndex(day => day.id === dayId)

        if (dayIndex !== -1) {
          // Crear una copia de los días
          const updatedDays = [...routine.days]

          // Crear una copia del día con los ejercicios actualizados
          updatedDays[dayIndex] = {
            ...updatedDays[dayIndex],
            exerciseSets: updatedDays[dayIndex].exerciseSets.filter(ex => ex.id !== exerciseId)
          }

          // Actualizar la rutina
          const updatedRoutine: WorkoutRoutine = {
            ...routine,
            days: updatedDays
          }

          handleUpdateRoutine(updatedRoutine)
        }
      }
    }
  }

  // Manejar duplicación de ejercicio
  const handleDuplicateExercise = (routineId: string, dayId: string, exerciseId: string) => {
    if (routine) {
      // Encontrar el día
      const dayIndex = routine.days.findIndex(day => day.id === dayId)

      if (dayIndex !== -1) {
        // Encontrar el ejercicio
        const exercise = routine.days[dayIndex].exerciseSets.find(ex => ex.id === exerciseId)

        if (exercise) {
          // Crear una copia del ejercicio con un nuevo ID
          const duplicatedExercise: Exercise = {
            ...exercise,
            id: `${exercise.id}-copy-${Date.now()}`
          }

          // Crear una copia de los días
          const updatedDays = [...routine.days]

          // Crear una copia del día con el ejercicio duplicado
          updatedDays[dayIndex] = {
            ...updatedDays[dayIndex],
            exerciseSets: [...updatedDays[dayIndex].exerciseSets, duplicatedExercise]
          }

          // Actualizar la rutina
          const updatedRoutine: WorkoutRoutine = {
            ...routine,
            days: updatedDays
          }

          handleUpdateRoutine(updatedRoutine)
        }
      }
    }
  }

  if (isLoading) {
    return (
      <RoutinizeLayout>
        <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24">
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </RoutinizeLayout>
    )
  }

  if (!routine) {
    return (
      <RoutinizeLayout>
        <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24">
          <div className="flex items-center mb-6">
            <Button3D
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button3D>
            <h1 className="text-2xl font-bold">Rutina no encontrada</h1>
          </div>

          <p className="text-muted-foreground">
            La rutina que estás buscando no existe o no tienes permisos para verla.
          </p>

          <Button3D className="mt-4" onClick={() => router.push("/training")}>
            Volver a Entrenamientos
          </Button3D>
        </div>
      </RoutinizeLayout>
    )
  }

  return (
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative">
      {/* Phone mockup rotated in background */}
      <div className="w-[383.868px] h-[830.788px] transform rotate-[-45deg] absolute -top-[100px] -right-[100px] z-0 rounded-[35px] bg-[url('/images/phone-mockup-rotated.svg')] bg-no-repeat bg-cover opacity-10"></div>
      {/* Gradient background */}
      <div className="w-[414px] h-[692px] absolute bottom-0 left-0 z-0 bg-gradient-to-t from-[#FFF3E9] via-[rgba(255,243,233,0.5)] to-transparent"></div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-[#FFF3E9]">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm mr-3"
              onClick={() => router.push('/training')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="#573353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-xl font-bold text-[#573353]">
              Workout Details
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

      {/* Main Content */}
      <main className="px-6 pt-20 pb-32 overflow-y-auto h-[calc(896px-80px)] relative z-10">
        {/* Workout Header */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm mb-6">
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 rounded-full bg-[#FDA758] flex items-center justify-center mr-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.5 6.5L17.5 17.5M6.5 17.5L17.5 6.5M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-[#573353] font-semibold text-lg">{routine.name}</h2>
              <p className="text-[#573353]/70 text-sm">{routine.description}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <div className="bg-[#F5F5F5] px-3 py-1.5 rounded-full">
                <span className="text-sm text-[#573353]/70 capitalize">{routine.level}</span>
              </div>
              <div className="bg-[#F5F5F5] px-3 py-1.5 rounded-full">
                <span className="text-sm text-[#573353]/70 capitalize">{routine.goal}</span>
              </div>
            </div>

            <button
              className="bg-[#FDA758] text-white font-medium rounded-full px-4 py-2 text-sm shadow-sm"
              onClick={() => handleStartWorkout(routine.id)}
            >
              Start Workout
            </button>
          </div>
        </div>

        {/* Workout Days */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-[#573353] mb-4">Workout Days</h2>

          <div className="space-y-4">
            {routine.days.map((day, index) => (
              <div key={day.id} className="bg-white rounded-[24px] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#8C80F8] flex items-center justify-center mr-3">
                      <span className="text-white font-medium">{index + 1}</span>
                    </div>
                    <h3 className="text-[#573353] font-semibold">{day.name}</h3>
                  </div>

                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F5F5F5]"
                    onClick={() => handleEditDay(routine.id, day.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#573353" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {/* Exercises */}
                <div className="space-y-3">
                  {day.exerciseSets && day.exerciseSets.length > 0 ? (
                    day.exerciseSets.map((exercise, exIndex) => (
                      <div key={exercise.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center mr-3">
                            <span className="text-[#573353]/70 text-sm font-medium">{exIndex + 1}</span>
                          </div>
                          <div>
                            <p className="text-[#573353] font-medium">{exercise.name}</p>
                            <p className="text-[#573353]/70 text-xs">
                              {exercise.sets} sets • {exercise.reps} reps • {exercise.weight ? `${exercise.weight}kg` : 'Bodyweight'}
                            </p>
                          </div>
                        </div>

                        <button
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F5F5F5]"
                          onClick={() => handleEditExercise(routine.id, day.id, exercise.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#573353" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-[#573353]/50">
                      <p>No exercises added yet</p>
                    </div>
                  )}
                </div>

                <button
                  className="w-full mt-4 py-2 rounded-full border border-[#FDA758] text-[#FDA758] font-medium text-sm flex items-center justify-center"
                  onClick={() => handleAddExercise(routine.id, day.id)}
                >
                  <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="#FDA758" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Add Exercise
                </button>
              </div>
            ))}
          </div>

          <button
            className="w-full mt-4 py-3 rounded-full bg-[#FDA758] text-white font-medium text-sm flex items-center justify-center shadow-sm"
            onClick={() => handleAddDay(routine.id)}
          >
            <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add Workout Day
          </button>
        </div>
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
          onClick={() => router.push('/habit-dashboard/stats')}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 20V10M12 20V4M6 20V14"
                stroke="#573353"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-[#573353]/70">Stats</span>
        </button>

        <button
          className="flex flex-col items-center relative w-[20%]"
          onClick={() => router.push('/add-habit')}
        >
          <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-r from-[#FDA758] to-[#FE9870] flex items-center justify-center absolute -top-[26px] shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="w-7 h-7 mt-8"></div>
          <span className="text-xs font-medium text-[#573353]/70">Add</span>
        </button>

        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => router.push('/habit-calendar')}
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
          onClick={() => router.push('/profile/habit-dashboard')}
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
