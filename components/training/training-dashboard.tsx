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

  // Cargar datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userId) return

      setIsLoading(true)

      try {
        // Cargar registros de entrenamiento
        const { data: logs } = await getWorkoutLogs(userId)

        if (logs && logs.length > 0) {
          // Calcular volumen semanal
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

          const recentLogs = logs.filter(log =>
            new Date(log.date) >= oneWeekAgo
          )

          // Calcular volumen total
          let totalVolume = 0
          recentLogs.forEach(log => {
            if (log.completedSets) {
              log.completedSets.forEach((set: any) => {
                totalVolume += (set.weight || 0) * (set.reps || 0)
              })
            }
          })

          setWeeklyVolume(totalVolume)
          setSessionsCompleted(recentLogs.length)
        }

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

      <Card organic={true} hover={true} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            Progreso de fuerza
          </h3>
          <Button variant="ghost" size="sm" className="text-xs">
            Ver todo
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        <div className="space-y-4">
          {strengthProgress.map((progress, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <span className="font-medium text-sm">{progress.exercise_name}</span>
                  <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                    {progress.muscle_group}
                  </Badge>
                </div>
                <span className={`text-sm font-bold ${progress.progress_percentage > 5 ? 'text-green-600' : progress.progress_percentage > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                  {progress.progress_percentage > 0 ? '+' : ''}{progress.current_weight - progress.previous_weight} kg
                </span>
              </div>
              <Progress value={progress.progress_percentage * 10} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      <Card organic={true} hover={true} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <Flame className="h-5 w-5 mr-2 text-orange-500" />
            Gestión de fatiga
          </h3>
          <Button variant="ghost" size="sm" className="text-xs">
            Ver detalles
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="border rounded-md p-3 text-center">
              <div className={`text-2xl font-bold ${fatigueData?.recoveryStatus === 'excellent' || fatigueData?.recoveryStatus === 'good' ? 'text-green-600' : 'text-amber-600'}`}>
                {fatigueData?.recoveryStatus === 'excellent' ? '90%' :
                 fatigueData?.recoveryStatus === 'good' ? '75%' :
                 fatigueData?.recoveryStatus === 'moderate' ? '50%' : '25%'}
              </div>
              <div className="text-xs text-gray-500">Recuperación</div>
            </div>
            <div className="border rounded-md p-3 text-center">
              <div className={`text-2xl font-bold ${fatigueData?.currentFatigue < 50 ? 'text-green-600' : fatigueData?.currentFatigue < 75 ? 'text-amber-600' : 'text-red-600'}`}>
                {fatigueData?.currentFatigue || 50}%
              </div>
              <div className="text-xs text-gray-500">Fatiga CNS</div>
            </div>
            <div className="border rounded-md p-3 text-center">
              <div className={`text-2xl font-bold ${fatigueData?.readyToTrain ? 'text-blue-600' : 'text-amber-600'}`}>
                {fatigueData?.readyToTrain ? '85%' : '40%'}
              </div>
              <div className="text-xs text-gray-500">Prontitud</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Fatiga por grupo muscular</h4>
            <div className="space-y-2">
              {fatigueData?.muscleGroupFatigue && Object.entries(fatigueData.muscleGroupFatigue).map(([muscle, fatigue]: [string, any]) => (
                <div key={muscle}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs capitalize">{muscle}</span>
                    <span className="text-xs font-medium">{fatigue}%</span>
                  </div>
                  <Progress
                    value={fatigue}
                    className="h-1.5"
                    indicatorClassName={
                      fatigue < 30 ? 'bg-green-500' :
                      fatigue < 70 ? 'bg-amber-500' :
                      'bg-red-500'
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
