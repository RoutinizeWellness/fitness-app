"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Dumbbell,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  X,
  AlertCircle,
  Timer
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { WorkoutRoutine, WorkoutDay, saveWorkoutLog } from "@/lib/training-service"
import WorkoutTimer from "./workout-timer"
import ExerciseSetTracker, { ExerciseSet } from "./exercise-set-tracker"
import { v4 as uuidv4 } from "uuid"

interface WorkoutExecutionProps {
  routine: WorkoutRoutine
  userId: string
  onComplete: () => void
  onCancel: () => void
}

export default function ImprovedWorkoutExecution({
  routine,
  userId,
  onComplete,
  onCancel
}: WorkoutExecutionProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  // State for tracking workout progress
  const [activeDay, setActiveDay] = useState<string>(routine.days[0]?.id || "")
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0)
  const [exerciseSets, setExerciseSets] = useState<Record<string, ExerciseSet[]>>({})
  const [completedExercises, setCompletedExercises] = useState<string[]>([])
  const [isResting, setIsResting] = useState(false)
  const [restDuration, setRestDuration] = useState(60) // Default rest time in seconds
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)
  const [workoutEndTime, setWorkoutEndTime] = useState<Date | null>(null)
  const [notes, setNotes] = useState("")

  // Get current day and exercise
  const currentDay = routine.days.find(day => day.id === activeDay) || routine.days[0]
  const currentExercise = currentDay?.exercises[activeExerciseIndex]
  
  // Initialize workout
  useEffect(() => {
    if (!workoutStartTime) {
      setWorkoutStartTime(new Date())
    }
    
    // Initialize exercise sets
    const initialSets: Record<string, ExerciseSet[]> = {}
    
    routine.days.forEach(day => {
      day.exercises.forEach(exercise => {
        const sets: ExerciseSet[] = []
        for (let i = 0; i < (exercise.sets || 3); i++) {
          sets.push({
            id: uuidv4(),
            weight: exercise.weight || 0,
            reps: exercise.reps || 10,
            completed: false
          })
        }
        initialSets[exercise.id] = sets
      })
    })
    
    setExerciseSets(initialSets)
  }, [routine, workoutStartTime])

  // Handle exercise completion
  const handleExerciseComplete = () => {
    if (!currentExercise) return
    
    // Mark exercise as completed
    setCompletedExercises(prev => [...prev, currentExercise.id])
    
    // Check if there are more exercises
    if (activeExerciseIndex < currentDay.exercises.length - 1) {
      // Start rest timer
      setIsResting(true)
      setRestDuration(currentExercise.rest || 60)
    } else {
      // Check if there are more days
      const currentDayIndex = routine.days.findIndex(day => day.id === activeDay)
      if (currentDayIndex < routine.days.length - 1) {
        // Move to next day
        setActiveDay(routine.days[currentDayIndex + 1].id)
        setActiveExerciseIndex(0)
      } else {
        // Workout completed
        handleWorkoutComplete()
      }
    }
  }

  // Handle rest completion
  const handleRestComplete = () => {
    setIsResting(false)
    // Move to next exercise
    setActiveExerciseIndex(prev => prev + 1)
  }

  // Handle workout completion
  const handleWorkoutComplete = () => {
    setWorkoutEndTime(new Date())
    
    // Calculate workout duration in minutes
    const duration = workoutStartTime 
      ? Math.round((new Date().getTime() - workoutStartTime.getTime()) / 60000) 
      : 0
    
    // Prepare completed sets data
    const completedSets: any[] = []
    Object.entries(exerciseSets).forEach(([exerciseId, sets]) => {
      sets.forEach(set => {
        if (set.completed) {
          completedSets.push({
            exercise_id: exerciseId,
            weight: set.weight,
            reps: set.reps,
            notes: set.notes
          })
        }
      })
    })
    
    // Save workout log
    const workoutLog = {
      id: uuidv4(),
      userId,
      routineId: routine.id,
      dayId: activeDay,
      date: new Date().toISOString().split('T')[0],
      duration,
      completedSets,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    saveWorkoutLog(workoutLog)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error saving workout log:", error)
          toast({
            title: "Error",
            description: "No se pudo guardar el registro de entrenamiento",
            variant: "destructive"
          })
        } else {
          toast({
            title: "¡Entrenamiento completado!",
            description: "Tu registro de entrenamiento ha sido guardado",
          })
          onComplete()
        }
      })
  }

  // Handle navigation to previous exercise
  const goToPreviousExercise = () => {
    if (activeExerciseIndex > 0) {
      setActiveExerciseIndex(prev => prev - 1)
    } else {
      // Go to previous day if possible
      const currentDayIndex = routine.days.findIndex(day => day.id === activeDay)
      if (currentDayIndex > 0) {
        setActiveDay(routine.days[currentDayIndex - 1].id)
        setActiveExerciseIndex(routine.days[currentDayIndex - 1].exercises.length - 1)
      }
    }
  }

  // Handle navigation to next exercise
  const goToNextExercise = () => {
    if (activeExerciseIndex < currentDay.exercises.length - 1) {
      setActiveExerciseIndex(prev => prev + 1)
    } else {
      // Go to next day if possible
      const currentDayIndex = routine.days.findIndex(day => day.id === activeDay)
      if (currentDayIndex < routine.days.length - 1) {
        setActiveDay(routine.days[currentDayIndex + 1].id)
        setActiveExerciseIndex(0)
      }
    }
  }

  // Calculate progress
  const totalExercises = routine.days.reduce((total, day) => total + day.exercises.length, 0)
  const completedCount = completedExercises.length
  const progressPercentage = Math.round((completedCount / totalExercises) * 100)

  // If no current exercise, show loading or error
  if (!currentExercise) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-[#573353]/30 mb-4" />
            <p className="text-[#573353]">No hay ejercicios disponibles</p>
            <Button 
              className="mt-4 bg-[#FDA758] hover:bg-[#FDA758]/90 rounded-full"
              onClick={onCancel}
            >
              Volver
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-white rounded-3xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-[#573353]">
              {routine.name}
            </CardTitle>
            <CardDescription>
              {currentDay.name}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full border-red-200 text-red-500 hover:bg-red-50"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[#573353]/70">Progreso</span>
            <span className="text-[#573353]">{completedCount}/{totalExercises} ejercicios</span>
          </div>
          <div className="h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#FDA758] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {isResting ? (
            <motion.div 
              key="rest"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-8 flex flex-col items-center"
            >
              <div className="bg-[#FDA758]/10 rounded-full p-4 mb-4">
                <Timer className="h-8 w-8 text-[#FDA758]" />
              </div>
              <h3 className="text-xl font-bold text-[#573353] mb-2">Tiempo de descanso</h3>
              <p className="text-[#573353]/70 mb-6 text-center">
                Descansa antes del siguiente ejercicio
              </p>
              
              <WorkoutTimer 
                duration={restDuration} 
                onComplete={handleRestComplete}
                autoStart={true}
                size="lg"
              />
              
              <Button 
                className="mt-6 bg-[#FDA758] hover:bg-[#FDA758]/90 rounded-full"
                onClick={handleRestComplete}
              >
                Saltar descanso
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="exercise"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-4"
            >
              <div className="flex justify-between items-center mb-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToPreviousExercise}
                  disabled={activeExerciseIndex === 0 && routine.days.findIndex(day => day.id === activeDay) === 0}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-5 w-5 text-[#573353]/70" />
                </Button>
                
                <div className="text-center">
                  <Badge className="bg-[#FDA758] text-white rounded-full px-3 mb-2">
                    Ejercicio {activeExerciseIndex + 1} de {currentDay.exercises.length}
                  </Badge>
                  <h3 className="text-xl font-bold text-[#573353]">{currentExercise.name}</h3>
                  <p className="text-[#573353]/70">{currentExercise.muscleGroup}</p>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToNextExercise}
                  disabled={
                    activeExerciseIndex === currentDay.exercises.length - 1 && 
                    routine.days.findIndex(day => day.id === activeDay) === routine.days.length - 1
                  }
                  className="rounded-full"
                >
                  <ChevronRight className="h-5 w-5 text-[#573353]/70" />
                </Button>
              </div>
              
              <div className="bg-[#F9F9F9] rounded-2xl p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <Dumbbell className="h-4 w-4 mr-2 text-[#573353]/70" />
                    <span className="text-sm text-[#573353]">
                      {currentExercise.sets || 3} series x {currentExercise.reps || 10} reps
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-[#573353]/70" />
                    <span className="text-sm text-[#573353]">
                      {currentExercise.rest || 60}s descanso
                    </span>
                  </div>
                </div>
                
                {currentExercise.notes && (
                  <p className="text-sm text-[#573353]/70 mt-2 bg-white p-2 rounded-lg">
                    {currentExercise.notes}
                  </p>
                )}
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-[#573353] mb-3">Series</h4>
                <ExerciseSetTracker 
                  sets={exerciseSets[currentExercise.id] || []}
                  onChange={(sets) => {
                    setExerciseSets(prev => ({
                      ...prev,
                      [currentExercise.id]: sets
                    }))
                  }}
                  onComplete={handleExerciseComplete}
                />
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  className="rounded-full border-[#573353]/20 text-[#573353]/70"
                  onClick={goToPreviousExercise}
                  disabled={activeExerciseIndex === 0 && routine.days.findIndex(day => day.id === activeDay) === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                
                <Button 
                  className="rounded-full bg-[#FDA758] hover:bg-[#FDA758]/90"
                  onClick={goToNextExercise}
                  disabled={
                    activeExerciseIndex === currentDay.exercises.length - 1 && 
                    routine.days.findIndex(day => day.id === activeDay) === routine.days.length - 1
                  }
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="flex justify-between pt-4 border-t border-[#573353]/10">
        <div className="text-sm text-[#573353]/70">
          <span className="font-medium text-[#573353]">
            {workoutStartTime ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </span>
          {' '}iniciado
        </div>
        
        <Button 
          variant="outline" 
          className="rounded-full border-[#5DE292] text-[#5DE292] hover:bg-[#5DE292]/10"
          onClick={handleWorkoutComplete}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Finalizar
        </Button>
      </CardFooter>
    </Card>
  )
}
