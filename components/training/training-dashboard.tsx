"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { StatCardOrganic } from "@/components/ui/stat-card-organic"
import { Separator } from "@/components/ui/separator"
import { OrganicElement } from "@/components/transitions/organic-transitions"
import { AIWorkoutRecommendations } from "@/components/training/ai-workout-recommendations"
import { StrengthProgressCard } from "@/components/training/strength-progress-card"
import {
  BarChart,
  Calendar,
  ChevronRight,
  TrendingUp,
  Flame,
  Sparkles,
  Brain
} from "lucide-react"
import { getWorkoutLogs } from "@/lib/training-service"
import { getUserFatigue } from "@/lib/adaptive-learning-service"
import { supabase } from "@/lib/supabase-client"
import { getTrainingStats, getUserWorkoutRoutines } from "@/lib/services/unified-training-service"

interface TrainingDashboardProps {
  userId: string
}

export function TrainingDashboard({ userId }: TrainingDashboardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [weeklyVolume, setWeeklyVolume] = useState(0)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [sessionsPlanned, setSessionsPlanned] = useState(5)
  const [fatigueData, setFatigueData] = useState<any>(null)
  const [strengthProgress, setStrengthProgress] = useState<any[]>([])
  const [trainingStats, setTrainingStats] = useState<any>(null)
  const [routines, setRoutines] = useState<any[]>([])

  // Cargar datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userId) return

      setIsLoading(true)

      try {
        // Cargar estadísticas de entrenamiento usando el servicio unificado
        const stats = await getTrainingStats(userId)
        if (stats) {
          setTrainingStats(stats)
          setWeeklyVolume(stats.weekly_volume)
          setSessionsCompleted(stats.total_workouts)
        }

        // Cargar rutinas del usuario
        const userRoutines = await getUserWorkoutRoutines(userId, false)
        setRoutines(userRoutines)

        // Cargar datos de fatiga
        try {
          const fatigue = await getUserFatigue(userId)
          if (fatigue) {
            setFatigueData(fatigue)
          }
        } catch (error) {
          console.error("Error al obtener datos de fatiga:", error)
        }

        // Cargar progreso de fuerza
        const { data: progressData, error: progressError } = await supabase
          .from('strength_progress')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(3)

        if (!progressError && progressData) {
          setStrengthProgress(progressData)
        } else {
          // Datos de ejemplo si no hay datos reales
          setStrengthProgress([
            {
              exercise_id: "bench-press",
              exercise_name: "Press de banca",
              muscle_group: "Pecho",
              current_weight: 80,
              previous_weight: 75,
              progress_percentage: 6.67
            },
            {
              exercise_id: "squat",
              exercise_name: "Sentadilla",
              muscle_group: "Piernas",
              current_weight: 120,
              previous_weight: 112.5,
              progress_percentage: 6.67
            },
            {
              exercise_id: "deadlift",
              exercise_name: "Peso muerto",
              muscle_group: "Espalda",
              current_weight: 140,
              previous_weight: 137.5,
              progress_percentage: 1.82
            }
          ])
        }
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCardOrganic
          title="Volumen semanal"
          value={`${weeklyVolume.toLocaleString()} kg`}
          description={`${weeklyVolume > 10000 ? '↑' : '↓'} ${Math.abs(Math.round((weeklyVolume - 10000) / 100))}% vs semana anterior`}
          icon={<BarChart className="h-4 w-4" />}
          color="blue"
        />
        <StatCardOrganic
          title="Sesiones completadas"
          value={`${sessionsCompleted} / ${sessionsPlanned}`}
          description={`${Math.round((sessionsCompleted / sessionsPlanned) * 100)}% de adherencia`}
          icon={<Calendar className="h-4 w-4" />}
          color="green"
        />
      </div>

      <Card organic={true} hover={true} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
            Recomendaciones IA
          </h3>
          <Button variant="ghost" size="sm" className="text-xs">
            Ver todo
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        <AIWorkoutRecommendations userId={userId} />
      </Card>

      {/* Nuevo componente de progreso de fuerza y gestión de fatiga */}
      <StrengthProgressCard />

      {/* Tarjeta de recomendaciones de entrenamiento */}
      <Card organic={true} hover={true} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-500" />
            Recomendaciones de entrenamiento
          </h3>
          <Button variant="ghost" size="sm" className="text-xs">
            Ver detalles
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-medium mb-2 text-blue-800">Entrenamiento óptimo para hoy</h4>
            <p className="text-sm text-blue-700 mb-3">
              Basado en tu nivel de fatiga actual y tu historial de entrenamiento, te recomendamos:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-md p-3 shadow-sm">
                <div className="text-sm font-medium mb-1">Intensidad</div>
                <div className="text-lg font-bold text-blue-600">
                  {fatigueData?.readyToTrain ? '85%' : '70%'} 1RM
                </div>
              </div>
              <div className="bg-white rounded-md p-3 shadow-sm">
                <div className="text-sm font-medium mb-1">Volumen</div>
                <div className="text-lg font-bold text-blue-600">
                  {fatigueData?.readyToTrain ? 'Normal' : 'Reducido'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
