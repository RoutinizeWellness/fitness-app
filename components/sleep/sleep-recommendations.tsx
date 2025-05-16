"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { 
  Moon, 
  Clock, 
  ChevronRight, 
  Info,
  Sparkles,
  Home,
  Calendar,
  Utensils,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Bookmark
} from "lucide-react"
import { SleepRecommendation, SleepScore, getSleepProfile, calculateSleepScore, generateSleepRecommendations } from "@/lib/sleep-analysis-service"
import { supabase } from "@/lib/supabase-client"

interface SleepRecommendationsProps {
  userId: string
}

export default function SleepRecommendations({ userId }: SleepRecommendationsProps) {
  const { toast } = useToast()
  const [sleepScore, setSleepScore] = useState<SleepScore | null>(null)
  const [recommendations, setRecommendations] = useState<SleepRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savedRecommendations, setSavedRecommendations] = useState<string[]>([])
  
  // Cargar puntuación de sueño y recomendaciones
  useEffect(() => {
    const loadSleepData = async () => {
      if (!userId) return
      
      setIsLoading(true)
      
      try {
        // Obtener perfil de sueño
        const { data: profile, error } = await getSleepProfile(userId)
        
        if (error) {
          console.error('Error al cargar el perfil de sueño:', error)
          return
        }
        
        if (profile) {
          // Calcular puntuación de sueño
          const score = calculateSleepScore(profile)
          setSleepScore(score)
          
          // Generar recomendaciones
          const recs = generateSleepRecommendations(profile)
          setRecommendations(recs)
          
          // Cargar recomendaciones guardadas
          loadSavedRecommendations(userId)
        }
      } catch (error) {
        console.error('Error al cargar los datos de sueño:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSleepData()
  }, [userId])
  
  // Cargar recomendaciones guardadas
  const loadSavedRecommendations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('saved_sleep_recommendations')
        .select('recommendation_id')
        .eq('user_id', userId)
      
      if (error) {
        console.error('Error al cargar recomendaciones guardadas:', error)
        return
      }
      
      if (data) {
        const savedIds = data.map(item => item.recommendation_id)
        setSavedRecommendations(savedIds)
      }
    } catch (error) {
      console.error('Error al cargar recomendaciones guardadas:', error)
    }
  }
  
  // Guardar o eliminar una recomendación
  const toggleSaveRecommendation = async (recommendationId: string) => {
    if (!userId) return
    
    const isSaved = savedRecommendations.includes(recommendationId)
    
    try {
      if (isSaved) {
        // Eliminar de guardados
        const { error } = await supabase
          .from('saved_sleep_recommendations')
          .delete()
          .eq('user_id', userId)
          .eq('recommendation_id', recommendationId)
        
        if (error) throw error
        
        setSavedRecommendations(prev => prev.filter(id => id !== recommendationId))
        
        toast({
          title: "Recomendación eliminada",
          description: "La recomendación ha sido eliminada de tus guardados",
        })
      } else {
        // Añadir a guardados
        const { error } = await supabase
          .from('saved_sleep_recommendations')
          .insert([
            {
              user_id: userId,
              recommendation_id: recommendationId,
              saved_at: new Date().toISOString()
            }
          ])
        
        if (error) throw error
        
        setSavedRecommendations(prev => [...prev, recommendationId])
        
        toast({
          title: "Recomendación guardada",
          description: "La recomendación ha sido guardada para referencia futura",
        })
      }
    } catch (error) {
      console.error('Error al guardar/eliminar recomendación:', error)
      toast({
        title: "Error",
        description: "No se pudo procesar tu solicitud. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }
  
  // Dar feedback sobre una recomendación
  const giveRecommendationFeedback = async (recommendationId: string, helpful: boolean) => {
    if (!userId) return
    
    try {
      const { error } = await supabase
        .from('sleep_recommendation_feedback')
        .insert([
          {
            user_id: userId,
            recommendation_id: recommendationId,
            helpful,
            created_at: new Date().toISOString()
          }
        ])
      
      if (error) throw error
      
      toast({
        title: "Gracias por tu feedback",
        description: helpful 
          ? "Nos alegra que esta recomendación te haya resultado útil" 
          : "Gracias por ayudarnos a mejorar nuestras recomendaciones",
      })
    } catch (error) {
      console.error('Error al enviar feedback:', error)
      toast({
        title: "Error",
        description: "No se pudo enviar tu feedback. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }
  
  // Obtener icono según la categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'environment':
        return <Home className="h-5 w-5 text-blue-500" />
      case 'habits':
        return <Calendar className="h-5 w-5 text-purple-500" />
      case 'schedule':
        return <Clock className="h-5 w-5 text-amber-500" />
      case 'relaxation':
        return <Moon className="h-5 w-5 text-indigo-500" />
      case 'nutrition':
        return <Utensils className="h-5 w-5 text-green-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }
  
  // Obtener color según la prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-amber-100 text-amber-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Obtener color según la dificultad
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'moderate':
        return 'bg-amber-100 text-amber-800'
      case 'challenging':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }
  
  // Renderizar mensaje si no hay puntuación de sueño
  if (!sleepScore) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Moon className="h-5 w-5 mr-2 text-primary" />
            Recomendaciones de Sueño
          </CardTitle>
          <CardDescription>
            No tenemos suficiente información para generar recomendaciones personalizadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Info className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">Evaluación Necesaria</h3>
          <p className="text-center text-gray-500 mb-4">
            Para recibir recomendaciones personalizadas, completa la evaluación de sueño.
          </p>
          <Button onClick={() => window.location.href = "/sleep/assessment"}>
            Completar Evaluación
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Puntuación de sueño */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Tu Puntuación de Sueño
          </CardTitle>
          <CardDescription>
            Basada en tu evaluación y hábitos de sueño
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{sleepScore.overall}</span>
              </div>
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3"
                  strokeDasharray={`${sleepScore.overall}, 100`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="text-center mb-2">
              <h3 className="text-lg font-medium">
                {sleepScore.overall >= 80 ? '¡Excelente!' :
                 sleepScore.overall >= 60 ? 'Buen trabajo' :
                 sleepScore.overall >= 40 ? 'Puede mejorar' : 'Necesita atención'}
              </h3>
              <p className="text-sm text-gray-500">
                {sleepScore.overall >= 80 ? 'Tu sueño es de alta calidad' :
                 sleepScore.overall >= 60 ? 'Tu sueño es bueno, pero hay margen de mejora' :
                 sleepScore.overall >= 40 ? 'Tu sueño necesita algunas mejoras' : 'Tu sueño necesita atención significativa'}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Duración</span>
                <span>{sleepScore.duration}/100</span>
              </div>
              <Progress value={sleepScore.duration} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Calidad</span>
                <span>{sleepScore.quality}/100</span>
              </div>
              <Progress value={sleepScore.quality} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Consistencia</span>
                <span>{sleepScore.consistency}/100</span>
              </div>
              <Progress value={sleepScore.consistency} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Eficiencia</span>
                <span>{sleepScore.efficiency}/100</span>
              </div>
              <Progress value={sleepScore.efficiency} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recomendaciones */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-primary" />
            Recomendaciones Personalizadas
          </CardTitle>
          <CardDescription>
            Basadas en tu perfil de sueño y objetivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay recomendaciones disponibles en este momento.</p>
              </div>
            ) : (
              recommendations.map((recommendation) => (
                <Card key={recommendation.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {getCategoryIcon(recommendation.category)}
                        <div className="ml-2">
                          <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                          <CardDescription className="capitalize">{recommendation.category}</CardDescription>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority === 'high' ? 'Alta' : 
                           recommendation.priority === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-700 mb-4">{recommendation.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Badge variant="outline" className={getDifficultyColor(recommendation.implementationDifficulty)}>
                          {recommendation.implementationDifficulty === 'easy' ? 'Fácil' : 
                           recommendation.implementationDifficulty === 'moderate' ? 'Moderado' : 'Desafiante'}
                        </Badge>
                        <Badge variant="outline">
                          Impacto: {recommendation.expectedImpact === 'high' ? 'Alto' : 
                                   recommendation.expectedImpact === 'medium' ? 'Medio' : 'Bajo'}
                        </Badge>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => giveRecommendationFeedback(recommendation.id, true)}
                          title="Útil"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => giveRecommendationFeedback(recommendation.id, false)}
                          title="No útil"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toggleSaveRecommendation(recommendation.id)}
                          title={savedRecommendations.includes(recommendation.id) ? "Eliminar de guardados" : "Guardar"}
                          className={savedRecommendations.includes(recommendation.id) ? "text-primary" : ""}
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/sleep/assessment"}>
            Actualizar Evaluación
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
