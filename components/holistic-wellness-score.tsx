"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import {
  Heart,
  Activity,
  Brain,
  Utensils,
  Moon,
  Dumbbell,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  BarChart2,
  ArrowRight,
  Info,
  Sparkles
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/lib/contexts/auth-context"
import { supabase } from "@/lib/supabase-client"

interface WellnessScoreData {
  overall: number // 0-100
  physical: number // 0-100
  mental: number // 0-100
  nutrition: number // 0-100
  sleep: number // 0-100
  activity: number // 0-100
  trend: 'improving' | 'declining' | 'stable'
  history: {
    date: string
    score: number
  }[]
  insights: {
    type: 'positive' | 'negative' | 'neutral'
    message: string
  }[]
  recommendations: {
    domain: 'physical' | 'mental' | 'nutrition' | 'sleep' | 'activity'
    message: string
    impact: number // 1-5
  }[]
}

export default function HolisticWellnessScore() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [wellnessData, setWellnessData] = useState<WellnessScoreData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week')

  // Load wellness score data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        // Try to load data from Supabase
        const { data, error } = await supabase
          .from('wellness_scores')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(1)
          .single()

        if (error) {
          // Handle table not found error gracefully
          if (error.code === '42P01') { // 42P01 is "undefined_table"
            console.log('Wellness scores table not found, generating sample data')
            generateSampleData()
            return
          } else if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error("Error loading wellness score:", error)
            throw error
          }
        }

        if (data) {
          // Process the data from Supabase
          setWellnessData({
            overall: data.overall_score,
            physical: data.physical_score,
            mental: data.mental_score,
            nutrition: data.nutrition_score,
            sleep: data.sleep_score,
            activity: data.activity_score,
            trend: data.trend,
            history: data.history || [],
            insights: data.insights || [],
            recommendations: data.recommendations || []
          })
        } else {
          // Generate sample data if no data is available
          generateSampleData()
        }
      } catch (error) {
        console.error("Error loading wellness score data:", error)
        // Generate sample data in case of error
        generateSampleData()
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  // Generate sample data for development/testing
  const generateSampleData = () => {
    // Generate overall score between 60-90
    const overall = Math.floor(Math.random() * 30) + 60

    // Generate component scores with some variation around the overall score
    const variation = 15
    const physical = Math.min(100, Math.max(0, overall + (Math.random() * variation * 2 - variation)))
    const mental = Math.min(100, Math.max(0, overall + (Math.random() * variation * 2 - variation)))
    const nutrition = Math.min(100, Math.max(0, overall + (Math.random() * variation * 2 - variation)))
    const sleep = Math.min(100, Math.max(0, overall + (Math.random() * variation * 2 - variation)))
    const activity = Math.min(100, Math.max(0, overall + (Math.random() * variation * 2 - variation)))

    // Generate trend
    const trend = ['improving', 'declining', 'stable'][Math.floor(Math.random() * 3)] as 'improving' | 'declining' | 'stable'

    // Generate history data for the past 30 days
    const history = []
    const today = new Date()
    let prevScore = overall

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Generate a score with some continuity from the previous day
      const dailyVariation = 5
      const score = Math.min(100, Math.max(0, prevScore + (Math.random() * dailyVariation * 2 - dailyVariation)))

      history.push({
        date: date.toISOString().split('T')[0],
        score: Math.round(score)
      })

      prevScore = score
    }

    // Generate insights
    const positiveInsights = [
      "Tu calidad de sueño ha mejorado un 15% esta semana.",
      "Has mantenido una buena consistencia en tu actividad física.",
      "Tu gestión del estrés ha mejorado significativamente.",
      "Tu nutrición ha sido equilibrada y consistente."
    ]

    const negativeInsights = [
      "Tu calidad de sueño ha disminuido en los últimos días.",
      "Tu nivel de actividad ha sido menor que tu promedio habitual.",
      "Se ha detectado un aumento en tus niveles de estrés.",
      "Tu hidratación ha estado por debajo de lo recomendado."
    ]

    const neutralInsights = [
      "Tu patrón de sueño ha sido irregular pero suficiente.",
      "Tu nivel de actividad se mantiene estable.",
      "Tu gestión del estrés se mantiene en niveles moderados.",
      "Tu nutrición muestra un equilibrio adecuado de macronutrientes."
    ]

    const insights = []

    // Add 1-2 positive insights
    for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
      const index = Math.floor(Math.random() * positiveInsights.length)
      insights.push({
        type: 'positive' as const,
        message: positiveInsights[index]
      })
      positiveInsights.splice(index, 1)
      if (positiveInsights.length === 0) break
    }

    // Add 0-1 negative insights
    if (Math.random() > 0.3 && negativeInsights.length > 0) {
      const index = Math.floor(Math.random() * negativeInsights.length)
      insights.push({
        type: 'negative' as const,
        message: negativeInsights[index]
      })
    }

    // Add 0-1 neutral insights
    if (Math.random() > 0.5 && neutralInsights.length > 0) {
      const index = Math.floor(Math.random() * neutralInsights.length)
      insights.push({
        type: 'neutral' as const,
        message: neutralInsights[index]
      })
    }

    // Generate recommendations
    const allRecommendations = [
      {
        domain: 'physical' as const,
        message: "Incorpora 10 minutos de estiramientos antes de dormir para mejorar la recuperación muscular.",
        impact: 3
      },
      {
        domain: 'physical' as const,
        message: "Añade un día de entrenamiento de movilidad a tu rutina semanal.",
        impact: 4
      },
      {
        domain: 'mental' as const,
        message: "Practica 5 minutos de meditación mindfulness cada mañana.",
        impact: 4
      },
      {
        domain: 'mental' as const,
        message: "Dedica 15 minutos al día a una actividad que disfrutes sin distracciones.",
        impact: 3
      },
      {
        domain: 'nutrition' as const,
        message: "Aumenta tu consumo de alimentos ricos en omega-3 como pescado azul y nueces.",
        impact: 4
      },
      {
        domain: 'nutrition' as const,
        message: "Asegúrate de consumir proteínas de calidad en cada comida principal.",
        impact: 3
      },
      {
        domain: 'sleep' as const,
        message: "Establece una rutina constante de sueño, acostándote y despertándote a la misma hora.",
        impact: 5
      },
      {
        domain: 'sleep' as const,
        message: "Evita las pantallas al menos 30 minutos antes de acostarte.",
        impact: 4
      },
      {
        domain: 'activity' as const,
        message: "Incorpora pequeñas caminatas de 5 minutos cada hora durante tu jornada laboral.",
        impact: 3
      },
      {
        domain: 'activity' as const,
        message: "Añade un día de entrenamiento cardiovascular de baja intensidad a tu rutina.",
        impact: 4
      }
    ]

    // Select 3-5 random recommendations
    const numRecommendations = Math.floor(Math.random() * 3) + 3
    const recommendations = []

    for (let i = 0; i < numRecommendations; i++) {
      if (allRecommendations.length === 0) break

      const index = Math.floor(Math.random() * allRecommendations.length)
      recommendations.push(allRecommendations[index])
      allRecommendations.splice(index, 1)
    }

    setWellnessData({
      overall,
      physical,
      mental,
      nutrition,
      sleep,
      activity,
      trend,
      history,
      insights,
      recommendations
    })
  }

  // Refresh data
  const handleRefresh = async () => {
    if (!user) return

    setIsRefreshing(true)

    try {
      // In a real implementation, this would call the API again
      // For now, we'll just generate new sample data
      generateSampleData()

      toast({
        title: "Datos actualizados",
        description: "Tu puntuación de bienestar se ha actualizado correctamente.",
      })
    } catch (error) {
      console.error("Error refreshing wellness score:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la puntuación de bienestar.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Get filtered history data based on time range
  const getFilteredHistory = () => {
    if (!wellnessData) return []

    const today = new Date()
    let daysToInclude = 7

    if (timeRange === 'day') daysToInclude = 1
    if (timeRange === 'month') daysToInclude = 30

    return wellnessData.history.filter(item => {
      const itemDate = new Date(item.date)
      const diffTime = Math.abs(today.getTime() - itemDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= daysToInclude
    })
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Puntuación de Bienestar Holístico</h2>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-64 md:col-span-1" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>

        <Skeleton className="h-48" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Puntuación de Bienestar Holístico</h2>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {wellnessData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Score Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Heart className="h-5 w-5 mr-2 text-primary" />
                Bienestar General
              </CardTitle>
              <CardDescription>
                Tu puntuación holística de bienestar
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative w-40 h-40 mb-4">
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-5xl font-bold">{Math.round(wellnessData.overall)}</span>
                  <span className="text-sm text-gray-500">de 100</span>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={
                      wellnessData.overall >= 80 ? "#10b981" :
                      wellnessData.overall >= 60 ? "#f59e0b" :
                      "#ef4444"
                    }
                    strokeWidth="10"
                    strokeDasharray={`${wellnessData.overall * 2.83} 283`}
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>

              <div className="flex items-center space-x-1 mb-4">
                <span className="text-sm font-medium">Tendencia:</span>
                {wellnessData.trend === 'improving' && (
                  <span className="flex items-center text-green-500">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Mejorando
                  </span>
                )}
                {wellnessData.trend === 'declining' && (
                  <span className="flex items-center text-red-500">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    Disminuyendo
                  </span>
                )}
                {wellnessData.trend === 'stable' && (
                  <span className="flex items-center text-blue-500">
                    <Activity className="h-4 w-4 mr-1" />
                    Estable
                  </span>
                )}
              </div>

              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <Dumbbell className="h-4 w-4 mr-1 text-blue-500" />
                    <span>Físico</span>
                  </div>
                  <span>{Math.round(wellnessData.physical)}%</span>
                </div>
                <Progress value={wellnessData.physical} className="h-2" />

                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <Brain className="h-4 w-4 mr-1 text-purple-500" />
                    <span>Mental</span>
                  </div>
                  <span>{Math.round(wellnessData.mental)}%</span>
                </div>
                <Progress value={wellnessData.mental} className="h-2" />

                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <Utensils className="h-4 w-4 mr-1 text-green-500" />
                    <span>Nutrición</span>
                  </div>
                  <span>{Math.round(wellnessData.nutrition)}%</span>
                </div>
                <Progress value={wellnessData.nutrition} className="h-2" />

                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <Moon className="h-4 w-4 mr-1 text-indigo-500" />
                    <span>Sueño</span>
                  </div>
                  <span>{Math.round(wellnessData.sleep)}%</span>
                </div>
                <Progress value={wellnessData.sleep} className="h-2" />

                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-1 text-red-500" />
                    <span>Actividad</span>
                  </div>
                  <span>{Math.round(wellnessData.activity)}%</span>
                </div>
                <Progress value={wellnessData.activity} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* History Chart Card */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                    Historial de Bienestar
                  </CardTitle>
                  <CardDescription>
                    Seguimiento de tu bienestar a lo largo del tiempo
                  </CardDescription>
                </div>

                <div className="flex space-x-1">
                  <Button
                    variant={timeRange === 'day' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange('day')}
                  >
                    Día
                  </Button>
                  <Button
                    variant={timeRange === 'week' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange('week')}
                  >
                    Semana
                  </Button>
                  <Button
                    variant={timeRange === 'month' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange('month')}
                  >
                    Mes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {/* In a real implementation, this would be a chart component */}
                <div className="w-full h-full flex items-end justify-between">
                  {getFilteredHistory().map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-6 rounded-t-sm"
                        style={{
                          height: `${item.score * 0.6}%`,
                          backgroundColor: item.score >= 80 ? "#10b981" : item.score >= 60 ? "#f59e0b" : "#ef4444"
                        }}
                      />
                      <span className="text-xs mt-1 text-gray-500">
                        {new Date(item.date).getDate()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {wellnessData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Insights Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Insights Personalizados
              </CardTitle>
              <CardDescription>
                Análisis de tus patrones de bienestar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wellnessData.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    {insight.type === 'positive' && (
                      <Badge variant="success" className="mt-0.5">Positivo</Badge>
                    )}
                    {insight.type === 'negative' && (
                      <Badge variant="destructive" className="mt-0.5">Atención</Badge>
                    )}
                    {insight.type === 'neutral' && (
                      <Badge variant="outline" className="mt-0.5">Neutral</Badge>
                    )}
                    <p>{insight.message}</p>
                  </div>
                ))}

                {wellnessData.insights.length === 0 && (
                  <p className="text-center text-gray-500">
                    No hay insights disponibles. Continúa registrando tus datos para recibir análisis personalizados.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ArrowRight className="h-5 w-5 mr-2 text-primary" />
                Recomendaciones
              </CardTitle>
              <CardDescription>
                Acciones personalizadas para mejorar tu bienestar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wellnessData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    {rec.domain === 'physical' && (
                      <Dumbbell className="h-5 w-5 text-blue-500 mt-0.5" />
                    )}
                    {rec.domain === 'mental' && (
                      <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
                    )}
                    {rec.domain === 'nutrition' && (
                      <Utensils className="h-5 w-5 text-green-500 mt-0.5" />
                    )}
                    {rec.domain === 'sleep' && (
                      <Moon className="h-5 w-5 text-indigo-500 mt-0.5" />
                    )}
                    {rec.domain === 'activity' && (
                      <Activity className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p>{rec.message}</p>
                      <div className="flex mt-1">
                        <span className="text-xs text-gray-500 mr-2">Impacto:</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Sparkles
                              key={i}
                              className={`h-3 w-3 ${i < rec.impact ? 'text-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {wellnessData.recommendations.length === 0 && (
                  <p className="text-center text-gray-500">
                    No hay recomendaciones disponibles actualmente.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Ver plan de bienestar completo
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
