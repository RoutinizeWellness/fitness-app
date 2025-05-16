"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/components/ui/use-toast"
import { useOrganicTheme } from "@/components/theme/organic-theme-provider"
import { supabase } from "@/lib/supabase-client"
import { 
  Calendar, 
  Dumbbell, 
  Clock, 
  Flame, 
  BarChart, 
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Edit,
  Copy,
  Trash,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Info
} from "lucide-react"
import { format, parseISO, addDays } from "date-fns"
import { es } from "date-fns/locale"

interface WorkoutRoutine {
  id: string
  name: string
  description: string
  type: string
  level: string
  days_per_week: number
  is_active: boolean
  created_at: string
  updated_at: string
  user_id: string
  days: WorkoutDay[]
}

interface WorkoutDay {
  id: string
  name: string
  day_number: number
  focus: string
  exercises: WorkoutExercise[]
  notes?: string
}

interface WorkoutExercise {
  id: string
  exercise_id: string
  exercise_name: string
  sets: number
  reps: string
  rest_seconds: number
  tempo?: string
  rir?: number
  notes?: string
  order: number
}

interface PersonalizedWorkoutRoutineProps {
  userId: string
  className?: string
  onStartWorkout?: (dayId: string) => void
  isTrainer?: boolean
  clientId?: string
}

export function PersonalizedWorkoutRoutine({ 
  userId, 
  className,
  onStartWorkout,
  isTrainer = false,
  clientId
}: PersonalizedWorkoutRoutineProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([])
  const [activeRoutine, setActiveRoutine] = useState<WorkoutRoutine | null>(null)
  const [activeTab, setActiveTab] = useState("current")
  const [expandedDays, setExpandedDays] = useState<string[]>([])
  
  const { toast } = useToast()
  const { isDark, animation } = useOrganicTheme()
  
  // Determine the actual user ID to use (for trainer view)
  const targetUserId = clientId || userId
  
  useEffect(() => {
    loadRoutines()
  }, [targetUserId])
  
  const loadRoutines = async () => {
    setIsLoading(true)
    try {
      // Fetch routines
      const { data: routinesData, error: routinesError } = await supabase
        .from('workout_routines')
        .select('*')
        .eq('user_id', targetUserId)
        .order('is_active', { ascending: false })
        .order('updated_at', { ascending: false })
      
      if (routinesError) throw routinesError
      
      if (!routinesData || routinesData.length === 0) {
        setRoutines([])
        setActiveRoutine(null)
        setIsLoading(false)
        return
      }
      
      // Find active routine
      const active = routinesData.find(r => r.is_active) || routinesData[0]
      
      // Fetch days for all routines
      const { data: daysData, error: daysError } = await supabase
        .from('workout_days')
        .select('*')
        .in('routine_id', routinesData.map(r => r.id))
        .order('day_number', { ascending: true })
      
      if (daysError) throw daysError
      
      // Fetch exercises for all days
      const dayIds = daysData?.map(d => d.id) || []
      
      if (dayIds.length > 0) {
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('workout_exercises')
          .select('*, exercise:exercise_id(name)')
          .in('day_id', dayIds)
          .order('order', { ascending: true })
        
        if (exercisesError) throw exercisesError
        
        // Organize data into nested structure
        const routinesWithDays = routinesData.map(routine => {
          const routineDays = daysData
            ?.filter(day => day.routine_id === routine.id)
            .map(day => {
              const dayExercises = exercisesData
                ?.filter(ex => ex.day_id === day.id)
                .map(ex => ({
                  id: ex.id,
                  exercise_id: ex.exercise_id,
                  exercise_name: ex.exercise?.name || 'Ejercicio desconocido',
                  sets: ex.sets,
                  reps: ex.reps,
                  rest_seconds: ex.rest_seconds,
                  tempo: ex.tempo,
                  rir: ex.rir,
                  notes: ex.notes,
                  order: ex.order
                })) || []
              
              return {
                ...day,
                exercises: dayExercises
              }
            }) || []
          
          return {
            ...routine,
            days: routineDays
          }
        })
        
        setRoutines(routinesWithDays)
        setActiveRoutine(routinesWithDays.find(r => r.id === active.id) || null)
      } else {
        // No days found
        setRoutines(routinesData.map(r => ({ ...r, days: [] })))
        setActiveRoutine(routinesData.find(r => r.is_active) || routinesData[0] || null)
      }
    } catch (error) {
      console.error("Error loading workout routines:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las rutinas de entrenamiento",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const activateRoutine = async (routineId: string) => {
    try {
      // First, deactivate all routines
      await supabase
        .from('workout_routines')
        .update({ is_active: false })
        .eq('user_id', targetUserId)
      
      // Then activate the selected routine
      const { error } = await supabase
        .from('workout_routines')
        .update({ is_active: true })
        .eq('id', routineId)
      
      if (error) throw error
      
      // Update local state
      setRoutines(prev => prev.map(routine => ({
        ...routine,
        is_active: routine.id === routineId
      })))
      
      setActiveRoutine(routines.find(r => r.id === routineId) || null)
      
      toast({
        title: "Rutina activada",
        description: "La rutina ha sido activada correctamente",
        variant: "default"
      })
    } catch (error) {
      console.error("Error activating routine:", error)
      toast({
        title: "Error",
        description: "No se pudo activar la rutina",
        variant: "destructive"
      })
    }
  }
  
  const duplicateRoutine = async (routine: WorkoutRoutine) => {
    try {
      // Create a copy of the routine
      const { data: newRoutine, error: routineError } = await supabase
        .from('workout_routines')
        .insert({
          name: `${routine.name} (Copia)`,
          description: routine.description,
          type: routine.type,
          level: routine.level,
          days_per_week: routine.days_per_week,
          is_active: false,
          user_id: targetUserId
        })
        .select()
        .single()
      
      if (routineError) throw routineError
      
      // Create copies of all days
      for (const day of routine.days) {
        const { data: newDay, error: dayError } = await supabase
          .from('workout_days')
          .insert({
            routine_id: newRoutine.id,
            name: day.name,
            day_number: day.day_number,
            focus: day.focus,
            notes: day.notes
          })
          .select()
          .single()
        
        if (dayError) throw dayError
        
        // Create copies of all exercises
        for (const exercise of day.exercises) {
          await supabase
            .from('workout_exercises')
            .insert({
              day_id: newDay.id,
              exercise_id: exercise.exercise_id,
              sets: exercise.sets,
              reps: exercise.reps,
              rest_seconds: exercise.rest_seconds,
              tempo: exercise.tempo,
              rir: exercise.rir,
              notes: exercise.notes,
              order: exercise.order
            })
        }
      }
      
      // Reload routines
      loadRoutines()
      
      toast({
        title: "Rutina duplicada",
        description: "La rutina ha sido duplicada correctamente",
        variant: "default"
      })
    } catch (error) {
      console.error("Error duplicating routine:", error)
      toast({
        title: "Error",
        description: "No se pudo duplicar la rutina",
        variant: "destructive"
      })
    }
  }
  
  const deleteRoutine = async (routineId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta rutina? Esta acción no se puede deshacer.")) {
      return
    }
    
    try {
      // Delete the routine (cascade should handle days and exercises)
      const { error } = await supabase
        .from('workout_routines')
        .delete()
        .eq('id', routineId)
      
      if (error) throw error
      
      // Update local state
      setRoutines(prev => prev.filter(r => r.id !== routineId))
      
      if (activeRoutine?.id === routineId) {
        setActiveRoutine(routines.find(r => r.id !== routineId) || null)
      }
      
      toast({
        title: "Rutina eliminada",
        description: "La rutina ha sido eliminada correctamente",
        variant: "default"
      })
    } catch (error) {
      console.error("Error deleting routine:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la rutina",
        variant: "destructive"
      })
    }
  }
  
  const handleDayClick = (dayId: string) => {
    if (expandedDays.includes(dayId)) {
      setExpandedDays(expandedDays.filter(id => id !== dayId))
    } else {
      setExpandedDays([...expandedDays, dayId])
    }
  }
  
  const handleStartWorkout = (dayId: string) => {
    if (onStartWorkout) {
      onStartWorkout(dayId)
    }
  }
  
  const getLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
      case 'principiante':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Principiante</Badge>
      case 'intermediate':
      case 'intermedio':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Intermedio</Badge>
      case 'advanced':
      case 'avanzado':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Avanzado</Badge>
      default:
        return <Badge>{level}</Badge>
    }
  }
  
  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'strength':
      case 'fuerza':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Fuerza</Badge>
      case 'hypertrophy':
      case 'hipertrofia':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Hipertrofia</Badge>
      case 'endurance':
      case 'resistencia':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Resistencia</Badge>
      case 'power':
      case 'potencia':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Potencia</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }
  
  const getFocusBadge = (focus: string) => {
    const focusLower = focus.toLowerCase()
    
    if (focusLower.includes('pecho') || focusLower.includes('chest')) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">{focus}</Badge>
    } else if (focusLower.includes('espalda') || focusLower.includes('back')) {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{focus}</Badge>
    } else if (focusLower.includes('pierna') || focusLower.includes('leg')) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">{focus}</Badge>
    } else if (focusLower.includes('hombro') || focusLower.includes('shoulder')) {
      return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">{focus}</Badge>
    } else if (focusLower.includes('brazo') || focusLower.includes('arm')) {
      return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{focus}</Badge>
    } else if (focusLower.includes('core') || focusLower.includes('abdom')) {
      return <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">{focus}</Badge>
    } else if (focusLower.includes('cardio')) {
      return <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">{focus}</Badge>
    } else if (focusLower.includes('descanso') || focusLower.includes('rest')) {
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">{focus}</Badge>
    } else {
      return <Badge>{focus}</Badge>
    }
  }
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  }
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Rutinas de Entrenamiento</CardTitle>
          <CardDescription>Cargando rutinas...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }
  
  if (routines.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Rutinas de Entrenamiento</CardTitle>
          <CardDescription>No hay rutinas disponibles</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center h-64 text-center">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay rutinas configuradas</h3>
          <p className="text-muted-foreground mb-4">
            {isTrainer 
              ? "Este cliente no tiene rutinas de entrenamiento configuradas."
              : "No tienes rutinas de entrenamiento configuradas."}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear nueva rutina
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Rutinas de Entrenamiento</CardTitle>
            <CardDescription>
              {isTrainer 
                ? "Gestiona las rutinas de entrenamiento del cliente"
                : "Gestiona tus rutinas de entrenamiento personalizadas"}
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva rutina
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="current">Rutina Actual</TabsTrigger>
              <TabsTrigger value="all">Todas las Rutinas</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="current" className="pt-2 px-6 pb-6">
            {activeRoutine ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{activeRoutine.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getLevelBadge(activeRoutine.level)}
                      {getTypeBadge(activeRoutine.type)}
                      <Badge variant="outline">{activeRoutine.days_per_week} días/semana</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => duplicateRoutine(activeRoutine)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
                
                {activeRoutine.description && (
                  <p className="text-muted-foreground mb-4">{activeRoutine.description}</p>
                )}
                
                <motion.div
                  variants={containerVariants}
                  initial={animation !== "none" ? "hidden" : "visible"}
                  animate="visible"
                  className="space-y-4"
                >
                  {activeRoutine.days.map((day) => (
                    <motion.div key={day.id} variants={itemVariants}>
                      <Card>
                        <CardHeader className="p-4 cursor-pointer" onClick={() => handleDayClick(day.id)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="bg-primary/10 p-2 rounded-full mr-3">
                                <Dumbbell className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">{day.name}</h4>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <span>Día {day.day_number}</span>
                                  <span className="mx-2">•</span>
                                  {getFocusBadge(day.focus)}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className={`h-5 w-5 transition-transform ${expandedDays.includes(day.id) ? 'rotate-90' : ''}`} />
                          </div>
                        </CardHeader>
                        
                        {expandedDays.includes(day.id) && (
                          <CardContent className="p-4 pt-0">
                            <div className="border-t pt-4">
                              {day.exercises.length > 0 ? (
                                <div className="space-y-3">
                                  {day.exercises.map((exercise, index) => (
                                    <div key={exercise.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                      <div className="flex items-center">
                                        <div className="bg-primary/5 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                                          <span className="text-sm font-medium">{index + 1}</span>
                                        </div>
                                        <div>
                                          <h5 className="font-medium">{exercise.exercise_name}</h5>
                                          <div className="flex items-center text-sm text-muted-foreground">
                                            <span>{exercise.sets} series</span>
                                            <span className="mx-1">×</span>
                                            <span>{exercise.reps}</span>
                                            {exercise.rir !== undefined && (
                                              <>
                                                <span className="mx-1">@</span>
                                                <span>RIR {exercise.rir}</span>
                                              </>
                                            )}
                                            <span className="mx-1">•</span>
                                            <Clock className="h-3 w-3 mr-1" />
                                            <span>{exercise.rest_seconds}s</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-center text-muted-foreground py-4">
                                  No hay ejercicios configurados para este día
                                </p>
                              )}
                              
                              {day.notes && (
                                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm text-muted-foreground">{day.notes}</p>
                                </div>
                              )}
                              
                              <div className="mt-4 flex justify-end">
                                <Button onClick={() => handleStartWorkout(day.id)}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Iniciar entrenamiento
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hay una rutina activa</p>
                <Button className="mt-4" onClick={() => setActiveTab("all")}>
                  Ver todas las rutinas
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="pt-2 px-6 pb-6">
            <div className="space-y-4">
              {routines.map((routine) => (
                <Card key={routine.id} className={routine.is_active ? "border-primary" : ""}>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          {routine.name}
                          {routine.is_active && (
                            <Badge className="ml-2 bg-primary/20 text-primary">Activa</Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getLevelBadge(routine.level)}
                          {getTypeBadge(routine.type)}
                          <Badge variant="outline">{routine.days_per_week} días/semana</Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!routine.is_active && (
                          <Button variant="outline" size="sm" onClick={() => activateRoutine(routine.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Activar
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => duplicateRoutine(routine)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        {!routine.is_active && (
                          <Button variant="outline" size="sm" onClick={() => deleteRoutine(routine.id)}>
                            <Trash className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0">
                    {routine.description && (
                      <p className="text-muted-foreground mb-4 border-t pt-4">{routine.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {routine.days.map((day) => (
                        <Badge key={day.id} variant="outline" className="flex items-center gap-1">
                          <span>Día {day.day_number}:</span>
                          <span>{day.focus}</span>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-muted-foreground">
          {routines.length} {routines.length === 1 ? "rutina" : "rutinas"} disponibles
        </div>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva rutina
        </Button>
      </CardFooter>
    </Card>
  )
}
