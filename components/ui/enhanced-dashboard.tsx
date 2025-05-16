"use client"

import { useState, useEffect } from "react"
import { 
  Activity, 
  BarChart3, 
  Heart, 
  Moon, 
  Sun, 
  Zap, 
  Utensils, 
  Brain, 
  Dumbbell, 
  Flame, 
  Droplet, 
  Clock, 
  TrendingUp, 
  Award, 
  ChevronRight,
  Sparkles,
  MoreHorizontal
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { AdvancedAIService } from "@/lib/advanced-ai-service"

interface EnhancedDashboardProps {
  userId: string
  className?: string
}

export default function EnhancedDashboard({ userId, className = "" }: EnhancedDashboardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [healthMetrics, setHealthMetrics] = useState<any>({
    steps: 0,
    stepsGoal: 10000,
    heartRate: 0,
    calories: 0,
    caloriesGoal: 2500,
    water: 0,
    waterGoal: 2000,
    sleep: 0,
    sleepGoal: 8,
    stress: 50,
    mood: 3
  })
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  
  // Cargar datos del usuario y métricas
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true)
      try {
        // Obtener datos del usuario
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (userError) throw userError
        
        setUserData(userData)
        
        // Obtener métricas de salud más recientes
        const today = new Date().toISOString().split('T')[0]
        
        // Pasos y actividad
        const { data: activityData } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .single()
        
        // Frecuencia cardíaca
        const { data: heartRateData } = await supabase
          .from('heart_rate_logs')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single()
        
        // Sueño
        const { data: sleepData } = await supabase
          .from('sleep_logs')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(1)
          .single()
        
        // Nutrición
        const { data: nutritionData } = await supabase
          .from('nutrition_logs')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .single()
        
        // Estado de ánimo
        const { data: moodData } = await supabase
          .from('moods')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(1)
          .single()
        
        // Actualizar métricas de salud
        const updatedMetrics = { ...healthMetrics }
        
        if (activityData) {
          updatedMetrics.steps = activityData.steps || 0
          updatedMetrics.calories = activityData.calories_burned || 0
        }
        
        if (heartRateData) {
          updatedMetrics.heartRate = heartRateData.value || 0
        }
        
        if (sleepData) {
          updatedMetrics.sleep = sleepData.duration || 0
        }
        
        if (nutritionData) {
          updatedMetrics.water = nutritionData.water || 0
          updatedMetrics.calories = nutritionData.calories || 0
        }
        
        if (moodData) {
          updatedMetrics.mood = moodData.mood_level || 3
          updatedMetrics.stress = moodData.stress_level || 50
        }
        
        // Establecer objetivos personalizados si están disponibles
        if (userData.goals) {
          updatedMetrics.stepsGoal = userData.goals.steps || 10000
          updatedMetrics.caloriesGoal = userData.goals.calories || 2500
          updatedMetrics.waterGoal = userData.goals.water || 2000
          updatedMetrics.sleepGoal = userData.goals.sleep || 8
        }
        
        setHealthMetrics(updatedMetrics)
        
        // Generar recomendaciones e insights con IA avanzada
        if (userId) {
          const aiService = new AdvancedAIService(userId)
          const aiRecommendations = await aiService.generateCrossDomainRecommendations()
          setRecommendations(aiRecommendations)
          
          // Generar insights sobre fatiga y recuperación
          const fatigueData = await aiService.predictOptimalTrainingLoad()
          
          const newInsights = [
            {
              id: 'fatigue',
              title: 'Nivel de fatiga',
              value: fatigueData.fatigueLevel,
              icon: <Flame className="h-5 w-5 text-orange-500" />,
              description: `Tu nivel de fatiga actual es ${
                fatigueData.fatigueLevel < 30 ? 'bajo' : 
                fatigueData.fatigueLevel < 60 ? 'moderado' : 'alto'
              }.`,
              recommendation: fatigueData.recommendations[0] || 'Monitorea tu nivel de fatiga regularmente.'
            },
            {
              id: 'recovery',
              title: 'Nivel de recuperación',
              value: fatigueData.recoveryLevel,
              icon: <Zap className="h-5 w-5 text-blue-500" />,
              description: `Tu nivel de recuperación actual es ${
                fatigueData.recoveryLevel < 30 ? 'bajo' : 
                fatigueData.recoveryLevel < 60 ? 'moderado' : 'óptimo'
              }.`,
              recommendation: fatigueData.recommendations[1] || 'Prioriza estrategias de recuperación efectivas.'
            },
            {
              id: 'readiness',
              title: 'Preparación para entrenar',
              value: fatigueData.readinessScore,
              icon: <Dumbbell className="h-5 w-5 text-green-500" />,
              description: `Tu nivel de preparación para entrenar es ${
                fatigueData.readinessScore < 30 ? 'bajo' : 
                fatigueData.readinessScore < 60 ? 'moderado' : 'óptimo'
              }.`,
              recommendation: `Intensidad óptima: ${fatigueData.optimalIntensity}/10. Volumen óptimo: ${fatigueData.optimalVolume}/10.`
            }
          ]
          
          setInsights(newInsights)
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error)
        // Usar datos de ejemplo en caso de error
        setUserData({
          first_name: "Usuario",
          last_name: "Ejemplo",
          email: "usuario@ejemplo.com",
          avatar_url: "/avatars/default.png"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (userId) {
      loadUserData()
    }
  }, [userId])
  
  // Formatear valor de progreso
  const formatProgress = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100)
  }
  
  // Renderizar icono de estado de ánimo
  const renderMoodIcon = (mood: number) => {
    switch (mood) {
      case 1: return '😔'
      case 2: return '😕'
      case 3: return '😐'
      case 4: return '🙂'
      case 5: return '😄'
      default: return '😐'
    }
  }
  
  // Navegar a una sección
  const navigateTo = (path: string) => {
    router.push(path)
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Tarjeta de bienvenida */}
          <Card3D>
            <Card3DHeader>
              <div className="flex justify-between items-center">
                <div>
                  <Card3DTitle>
                    Hola, {isLoading ? 'Cargando...' : userData?.first_name || 'Usuario'}
                  </Card3DTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-primary/10">
                    <Sparkles className="h-3 w-3 mr-1" />
                    IA Avanzada
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10">
                    <Activity className="h-3 w-3 mr-1" />
                    Wearables
                  </Badge>
                </div>
              </div>
            </Card3DHeader>
            <Card3DContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center justify-center p-3 bg-primary/5 rounded-lg">
                  <Dumbbell className="h-6 w-6 text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">Entrenamiento</span>
                  <span className="font-medium">
                    {insights[2]?.value < 30 ? 'Descanso' : 
                     insights[2]?.value < 60 ? 'Moderado' : 'Óptimo'}
                  </span>
                </div>
                
                <div className="flex flex-col items-center justify-center p-3 bg-primary/5 rounded-lg">
                  <Heart className="h-6 w-6 text-red-500 mb-2" />
                  <span className="text-xs text-muted-foreground">Frecuencia</span>
                  <span className="font-medium">{healthMetrics.heartRate} bpm</span>
                </div>
                
                <div className="flex flex-col items-center justify-center p-3 bg-primary/5 rounded-lg">
                  <Moon className="h-6 w-6 text-indigo-500 mb-2" />
                  <span className="text-xs text-muted-foreground">Sueño</span>
                  <span className="font-medium">{healthMetrics.sleep}h</span>
                </div>
                
                <div className="flex flex-col items-center justify-center p-3 bg-primary/5 rounded-lg">
                  <div className="text-2xl mb-1">{renderMoodIcon(healthMetrics.mood)}</div>
                  <span className="text-xs text-muted-foreground">Estado</span>
                  <span className="font-medium">
                    {healthMetrics.mood <= 2 ? 'Bajo' : 
                     healthMetrics.mood === 3 ? 'Neutral' : 'Positivo'}
                  </span>
                </div>
              </div>
            </Card3DContent>
          </Card3D>
          
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card3D>
              <Card3DHeader>
                <div className="flex justify-between items-center">
                  <Card3DTitle>Actividad diaria</Card3DTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card3DHeader>
              <Card3DContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pasos</span>
                      <span className="font-medium">{healthMetrics.steps} / {healthMetrics.stepsGoal}</span>
                    </div>
                    <Progress3D value={formatProgress(healthMetrics.steps, healthMetrics.stepsGoal)} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Calorías</span>
                      <span className="font-medium">{healthMetrics.calories} / {healthMetrics.caloriesGoal} kcal</span>
                    </div>
                    <Progress3D value={formatProgress(healthMetrics.calories, healthMetrics.caloriesGoal)} />
                  </div>
                  
                  <Button3D variant="outline" className="w-full" onClick={() => navigateTo('/training')}>
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Ver entrenamientos
                  </Button3D>
                </div>
              </Card3DContent>
            </Card3D>
            
            <Card3D>
              <Card3DHeader>
                <div className="flex justify-between items-center">
                  <Card3DTitle>Bienestar</Card3DTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card3DHeader>
              <Card3DContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hidratación</span>
                      <span className="font-medium">{healthMetrics.water} / {healthMetrics.waterGoal} ml</span>
                    </div>
                    <Progress3D value={formatProgress(healthMetrics.water, healthMetrics.waterGoal)} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nivel de estrés</span>
                      <span className="font-medium">{healthMetrics.stress}/100</span>
                    </div>
                    <Progress3D value={healthMetrics.stress} variant={
                      healthMetrics.stress < 30 ? "success" : 
                      healthMetrics.stress < 70 ? "default" : "destructive"
                    } />
                  </div>
                  
                  <Button3D variant="outline" className="w-full" onClick={() => navigateTo('/wellness')}>
                    <Brain className="h-4 w-4 mr-2" />
                    Ver bienestar
                  </Button3D>
                </div>
              </Card3DContent>
            </Card3D>
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card3D>
              <Card3DContent className="py-8 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sin insights disponibles</h3>
                <p className="text-sm text-muted-foreground">
                  Registra más datos para recibir insights personalizados.
                </p>
              </Card3DContent>
            </Card3D>
          ) : (
            insights.map((insight) => (
              <Card3D key={insight.id}>
                <Card3DHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {insight.icon}
                      <Card3DTitle className="ml-2">{insight.title}</Card3DTitle>
                    </div>
                    <Badge variant={
                      insight.id === 'fatigue' ? 
                        (insight.value < 30 ? "success" : insight.value < 60 ? "default" : "destructive") :
                      insight.id === 'recovery' || insight.id === 'readiness' ? 
                        (insight.value < 30 ? "destructive" : insight.value < 60 ? "default" : "success") :
                      "default"
                    }>
                      {insight.value}/100
                    </Badge>
                  </div>
                </Card3DHeader>
                <Card3DContent>
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  <div className="mb-4">
                    <Progress3D value={insight.value} variant={
                      insight.id === 'fatigue' ? 
                        (insight.value < 30 ? "success" : insight.value < 60 ? "default" : "destructive") :
                      insight.id === 'recovery' || insight.id === 'readiness' ? 
                        (insight.value < 30 ? "destructive" : insight.value < 60 ? "default" : "success") :
                      "default"
                    } />
                  </div>
                  <p className="text-sm font-medium">Recomendación:</p>
                  <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                </Card3DContent>
              </Card3D>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card3D>
              <Card3DContent className="py-8 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sin recomendaciones disponibles</h3>
                <p className="text-sm text-muted-foreground">
                  Registra más datos para recibir recomendaciones personalizadas.
                </p>
              </Card3DContent>
            </Card3D>
          ) : (
            recommendations.map((recommendation) => (
              <Card3D key={recommendation.id} className="overflow-hidden">
                <Card3DHeader>
                  <div className="flex justify-between items-center">
                    <Card3DTitle>{recommendation.title}</Card3DTitle>
                    <Badge variant={recommendation.priority === 'high' ? "destructive" : "default"}>
                      {recommendation.priority === 'high' ? 'Alta' : 
                       recommendation.priority === 'medium' ? 'Media' : 'Baja'} prioridad
                    </Badge>
                  </div>
                </Card3DHeader>
                <Card3DContent>
                  <p className="text-sm text-muted-foreground mb-4">{recommendation.description}</p>
                  
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium mb-1">Razón:</p>
                    <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {recommendation.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-primary/10">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button3D onClick={() => {
                    // Navegar a la sección correspondiente
                    switch (recommendation.primaryDomain) {
                      case 'workout':
                        navigateTo('/training')
                        break
                      case 'nutrition':
                        navigateTo('/nutrition')
                        break
                      case 'sleep':
                        navigateTo('/sleep')
                        break
                      case 'wellness':
                        navigateTo('/wellness')
                        break
                      case 'productivity':
                        navigateTo('/productivity')
                        break
                      default:
                        navigateTo('/')
                    }
                  }}>
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Ver detalles
                  </Button3D>
                </Card3DContent>
              </Card3D>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
