"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Calendar, 
  Clock, 
  Award, 
  TrendingUp, 
  Dumbbell, 
  Flame, 
  Trophy 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BeginnerTrainingProgress, TrainingAchievement } from "@/lib/types/beginner-training"
import { getTrainingProgress, getUserAchievements } from "@/lib/services/beginner-training-progress-service"
import { getBeginnerExerciseById } from "@/lib/services/beginner-exercise-service"

interface BeginnerTrainingProgressProps {
  userId: string
  className?: string
}

export function BeginnerTrainingProgressCard({
  userId,
  className = ""
}: BeginnerTrainingProgressProps) {
  const [progress, setProgress] = useState<BeginnerTrainingProgress | null>(null)
  const [achievements, setAchievements] = useState<TrainingAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [topExercises, setTopExercises] = useState<any[]>([])
  
  // Cargar el progreso y los logros
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      
      try {
        // Cargar el progreso
        const progressData = await getTrainingProgress(userId)
        
        if (progressData) {
          setProgress(progressData)
          
          // Cargar los logros
          const achievementsData = await getUserAchievements(userId)
          
          if (achievementsData) {
            setAchievements(achievementsData)
          }
          
          // Cargar los ejercicios más realizados
          if (progressData.exercise_progress && progressData.exercise_progress.length > 0) {
            // Ordenar por veces realizadas
            const sortedExercises = [...progressData.exercise_progress]
              .sort((a, b) => b.times_performed - a.times_performed)
              .slice(0, 3) // Tomar los 3 primeros
            
            const exercisesWithDetails = []
            
            for (const exerciseProgress of sortedExercises) {
              const exerciseDetails = await getBeginnerExerciseById(exerciseProgress.exercise_id)
              
              if (exerciseDetails) {
                exercisesWithDetails.push({
                  ...exerciseProgress,
                  details: exerciseDetails
                })
              }
            }
            
            setTopExercises(exercisesWithDetails)
          }
        }
      } catch (error) {
        console.error('Error al cargar el progreso de entrenamiento:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) {
      loadData()
    }
  }, [userId])
  
  // Formatear la duración total
  const formatTotalTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (remainingMinutes === 0) {
      return `${hours} h`
    }
    
    return `${hours} h ${remainingMinutes} min`
  }
  
  // Renderizar el estado de carga
  if (loading) {
    return (
      <div className={`p-4 border rounded-lg bg-white ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-t-transparent border-[#FDA758] rounded-full animate-spin"></div>
          <span className="ml-2 text-[#573353]">Cargando progreso...</span>
        </div>
      </div>
    )
  }
  
  // Renderizar cuando no hay progreso
  if (!progress) {
    return (
      <div className={`p-4 border rounded-lg bg-white ${className}`}>
        <div className="text-center py-8">
          <Dumbbell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#573353] mb-2">Sin datos de entrenamiento</h3>
          <p className="text-[#573353] opacity-70 mb-4">
            Completa tu primer entrenamiento para comenzar a ver tu progreso.
          </p>
          <Button className="bg-[#FDA758] hover:bg-[#FD9A40]">
            Explorar entrenamientos
          </Button>
        </div>
      </div>
    )
  }
  
  // Renderizar el progreso
  return (
    <div className={`border rounded-lg overflow-hidden bg-white ${className}`}>
      {/* Encabezado */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium text-[#573353]">Tu progreso de entrenamiento</h3>
      </div>
      
      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {/* Entrenamientos completados */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-[#573353]">Entrenamientos</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {progress.workouts_completed}
          </div>
          <div className="text-xs text-[#573353] opacity-70 mt-1">
            completados
          </div>
        </div>
        
        {/* Tiempo total */}
        <div className="p-3 rounded-lg bg-green-50 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-[#573353]">Tiempo total</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {formatTotalTime(progress.total_time)}
          </div>
          <div className="text-xs text-[#573353] opacity-70 mt-1">
            de entrenamiento
          </div>
        </div>
        
        {/* Racha actual */}
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Flame className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-[#573353]">Racha actual</span>
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {progress.current_streak} {progress.current_streak === 1 ? 'día' : 'días'}
          </div>
          <div className="text-xs text-[#573353] opacity-70 mt-1">
            consecutivos
          </div>
        </div>
        
        {/* Racha más larga */}
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-[#573353]">Mejor racha</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {progress.longest_streak} {progress.longest_streak === 1 ? 'día' : 'días'}
          </div>
          <div className="text-xs text-[#573353] opacity-70 mt-1">
            consecutivos
          </div>
        </div>
      </div>
      
      {/* Último entrenamiento */}
      {progress.last_workout_date && (
        <div className="px-4 pb-4">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-[#573353] opacity-70" />
              <span className="text-sm font-medium text-[#573353]">Último entrenamiento</span>
            </div>
            <div className="text-[#573353]">
              {new Date(progress.last_workout_date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Ejercicios más realizados */}
      {topExercises.length > 0 && (
        <div className="px-4 pb-4">
          <h4 className="font-medium text-[#573353] mb-2">Tus ejercicios favoritos</h4>
          <div className="space-y-2">
            {topExercises.map((exercise, index) => (
              <div key={index} className="p-3 rounded-lg bg-white border border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <span className="font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[#573353]">{exercise.details.name}</div>
                  <div className="text-xs text-[#573353] opacity-70">
                    Realizado {exercise.times_performed} {exercise.times_performed === 1 ? 'vez' : 'veces'}
                    {exercise.best_weight ? ` • Mejor peso: ${exercise.best_weight} kg` : ''}
                    {exercise.best_reps ? ` • Mejor reps: ${exercise.best_reps}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Logros */}
      {achievements.length > 0 && (
        <div className="px-4 pb-4">
          <h4 className="font-medium text-[#573353] mb-2">Logros desbloqueados ({achievements.length})</h4>
          <div className="grid grid-cols-2 gap-2">
            {achievements.slice(0, 4).map((achievement, index) => (
              <div key={index} className="p-3 rounded-lg bg-white border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <Award className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-[#573353]">{achievement.name}</span>
                </div>
                <p className="text-xs text-[#573353] opacity-70">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
          
          {achievements.length > 4 && (
            <Button variant="ghost" className="w-full mt-2 text-[#573353]">
              Ver todos los logros ({achievements.length})
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
