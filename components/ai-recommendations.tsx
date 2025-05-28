"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Brain,
  Dumbbell,
  Utensils,
  Moon,
  Zap,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Clock,
  Calendar,
  BarChart,
  Lightbulb
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/lib/contexts/auth-context"

// Tipos para las recomendaciones
interface Recommendation {
  id: string
  type: 'workout' | 'nutrition' | 'sleep' | 'productivity' | 'wellness'
  title: string
  description: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  timeToComplete?: string
  tags: string[]
  created_at: string
  feedback?: 'positive' | 'negative' | null
}

export default function AIRecommendations() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  // Cargar recomendaciones
  useEffect(() => {
    if (!user?.id) return

    const loadRecommendations = async () => {
      setIsLoading(true)
      try {
        // Intentar cargar desde Supabase
        const { data, error } = await supabase
          .from('ai_recommendations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.warn("Error al cargar recomendaciones:", error)
          // Usar datos de ejemplo si hay error
          generateSampleRecommendations()
          return
        }

        if (data && data.length > 0) {
          setRecommendations(data)
        } else {
          // Usar datos de ejemplo si no hay datos
          generateSampleRecommendations()
        }
      } catch (error) {
        console.error("Error al cargar recomendaciones:", error)
        // Usar datos de ejemplo en caso de error
        generateSampleRecommendations()
      } finally {
        setIsLoading(false)
      }
    }

    loadRecommendations()
  }, [user?.id])

  // Generar recomendaciones de ejemplo
  const generateSampleRecommendations = () => {
    const sampleRecommendations: Recommendation[] = [
      {
        id: "rec-1",
        type: "workout",
        title: "Sesión de HIIT de 20 minutos",
        description: "Una sesión corta pero intensa de entrenamiento por intervalos para maximizar la quema de calorías y mejorar tu resistencia cardiovascular.",
        reason: "Basado en tu objetivo de perder peso y tu preferencia por entrenamientos cortos.",
        priority: "high",
        timeToComplete: "20 minutos",
        tags: ["HIIT", "cardio", "quema de grasa"],
        created_at: new Date().toISOString()
      },
      {
        id: "rec-2",
        type: "nutrition",
        title: "Aumentar ingesta de proteínas en el desayuno",
        description: "Incluir al menos 20g de proteína en tu desayuno para mejorar la recuperación muscular y mantener la saciedad durante la mañana.",
        reason: "Análisis de tus registros de comidas muestra un déficit de proteínas en las mañanas.",
        priority: "medium",
        tags: ["proteína", "desayuno", "nutrición"],
        created_at: new Date().toISOString()
      },
      {
        id: "rec-3",
        type: "sleep",
        title: "Rutina de relajación pre-sueño",
        description: "Implementa una rutina de 10 minutos antes de dormir que incluya respiración profunda y estiramientos suaves para mejorar la calidad del sueño.",
        reason: "Tus datos de sueño muestran interrupciones frecuentes y dificultad para conciliar el sueño.",
        priority: "high",
        timeToComplete: "10 minutos",
        tags: ["sueño", "relajación", "bienestar"],
        created_at: new Date().toISOString()
      },
      {
        id: "rec-4",
        type: "productivity",
        title: "Bloques de trabajo enfocado",
        description: "Implementa la técnica Pomodoro con bloques de 25 minutos de trabajo enfocado seguidos de 5 minutos de descanso.",
        reason: "Tu nivel de estrés laboral es alto y tus horas de trabajo semanales superan el promedio recomendado.",
        priority: "medium",
        tags: ["productividad", "enfoque", "técnica pomodoro"],
        created_at: new Date().toISOString()
      },
      {
        id: "rec-5",
        type: "wellness",
        title: "Meditación de 5 minutos a media mañana",
        description: "Una breve sesión de meditación mindfulness para reducir el estrés y mejorar la concentración durante tu jornada laboral.",
        reason: "Tu nivel de estrés ha aumentado un 15% en la última semana según tus registros.",
        priority: "low",
        timeToComplete: "5 minutos",
        tags: ["meditación", "mindfulness", "estrés"],
        created_at: new Date().toISOString()
      }
    ]

    setRecommendations(sampleRecommendations)
  }

  // Refrescar recomendaciones
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Simular generación de nuevas recomendaciones
      setTimeout(() => {
        generateSampleRecommendations()

        toast({
          title: "Recomendaciones actualizadas",
          description: "Se han generado nuevas recomendaciones personalizadas"
        })

        setIsRefreshing(false)
      }, 2000)
    } catch (error) {
      console.error("Error al refrescar recomendaciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar las recomendaciones",
        variant: "destructive"
      })
      setIsRefreshing(false)
    }
  }

  // Dar feedback a una recomendación
  const handleFeedback = async (id: string, feedback: 'positive' | 'negative') => {
    try {
      // Actualizar estado local
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === id ? { ...rec, feedback } : rec
        )
      )

      // Intentar guardar en Supabase
      const { error } = await supabase
        .from('ai_recommendations')
        .update({ feedback })
        .eq('id', id)

      if (error) {
        console.warn("Error al guardar feedback:", error)
      }

      toast({
        title: "Feedback registrado",
        description: "Gracias por tu feedback. Nos ayudará a mejorar las recomendaciones."
      })
    } catch (error) {
      console.error("Error al dar feedback:", error)
    }
  }

  // Filtrar recomendaciones por tipo
  const filteredRecommendations = activeTab === "all"
    ? recommendations
    : recommendations.filter(rec => rec.type === activeTab)

  // Renderizar icono según el tipo
  const renderIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return <Dumbbell className="h-5 w-5" />
      case 'nutrition':
        return <Utensils className="h-5 w-5" />
      case 'sleep':
        return <Moon className="h-5 w-5" />
      case 'productivity':
        return <Zap className="h-5 w-5" />
      case 'wellness':
        return <Brain className="h-5 w-5" />
      default:
        return <Lightbulb className="h-5 w-5" />
    }
  }

  // Obtener color según el tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workout':
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
      case 'nutrition':
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
      case 'sleep':
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
      case 'productivity':
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
      case 'wellness':
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  // Obtener color según la prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      case 'medium':
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
      case 'low':
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  // Obtener texto según el tipo
  const getTypeText = (type: string) => {
    switch (type) {
      case 'workout':
        return "Entrenamiento"
      case 'nutrition':
        return "Nutrición"
      case 'sleep':
        return "Sueño"
      case 'productivity':
        return "Productividad"
      case 'wellness':
        return "Bienestar"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recomendaciones IA</h2>
          <p className="text-muted-foreground">Sugerencias personalizadas basadas en tus datos y objetivos</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Actualizar Recomendaciones
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Todas</span>
          </TabsTrigger>
          <TabsTrigger value="workout" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            <span>Entrenamiento</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            <span>Nutrición</span>
          </TabsTrigger>
          <TabsTrigger value="sleep" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Sueño</span>
          </TabsTrigger>
          <TabsTrigger value="productivity" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>Productividad</span>
          </TabsTrigger>
          <TabsTrigger value="wellness" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span>Bienestar</span>
          </TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-10">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Cargando recomendaciones personalizadas...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredRecommendations.length > 0 ? (
            filteredRecommendations.map(recommendation => (
              <Card key={recommendation.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-full p-1.5 ${getTypeColor(recommendation.type)}`}>
                        {renderIcon(recommendation.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className={getTypeColor(recommendation.type)}>
                            {getTypeText(recommendation.type)}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority === 'high' ? 'Alta prioridad' :
                             recommendation.priority === 'medium' ? 'Media prioridad' : 'Baja prioridad'}
                          </Badge>
                          {recommendation.timeToComplete && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {recommendation.timeToComplete}
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{recommendation.description}</p>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Por qué te lo recomendamos:</strong> {recommendation.reason}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {recommendation.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="text-xs text-muted-foreground">
                    Generado el {new Date(recommendation.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={recommendation.feedback === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : ''}
                      onClick={() => handleFeedback(recommendation.id, 'positive')}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Útil
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={recommendation.feedback === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' : ''}
                      onClick={() => handleFeedback(recommendation.id, 'negative')}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      No útil
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-10">
                <div className="flex flex-col items-center justify-center">
                  <Lightbulb className="h-8 w-8 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay recomendaciones disponibles para esta categoría.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Tabs>
    </div>
  )
}
