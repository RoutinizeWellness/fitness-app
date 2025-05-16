"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  ArrowRight,
  ArrowRightLeft,
  Lightbulb
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import { AdvancedAIService, CrossDomainRecommendation } from "@/lib/advanced-ai-service"

export default function CrossDomainRecommendations() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [recommendations, setRecommendations] = useState<CrossDomainRecommendation[]>([])
  
  // Cargar recomendaciones
  useEffect(() => {
    if (!user?.id) return
    
    const loadRecommendations = async () => {
      setIsLoading(true)
      try {
        // Intentar cargar desde Supabase
        const { data, error } = await supabase
          .from('cross_domain_recommendations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.warn("Error al cargar recomendaciones cruzadas:", error)
          // Generar recomendaciones con el servicio avanzado
          await generateNewRecommendations()
          return
        }
        
        if (data && data.length > 0) {
          // Convertir datos de la base de datos al formato CrossDomainRecommendation
          const formattedRecommendations: CrossDomainRecommendation[] = data.map(item => ({
            id: item.id,
            userId: item.user_id,
            primaryDomain: item.primary_domain,
            secondaryDomain: item.secondary_domain,
            title: item.title,
            description: item.description,
            reason: item.reason,
            impact: item.impact,
            priority: item.priority,
            timeToComplete: item.time_to_complete,
            tags: item.tags,
            createdAt: item.created_at
          }))
          
          setRecommendations(formattedRecommendations)
        } else {
          // No hay recomendaciones, generar nuevas
          await generateNewRecommendations()
        }
      } catch (error) {
        console.error("Error al cargar recomendaciones cruzadas:", error)
        // Generar recomendaciones con el servicio avanzado
        await generateNewRecommendations()
      } finally {
        setIsLoading(false)
      }
    }
    
    loadRecommendations()
  }, [user?.id])
  
  // Generar nuevas recomendaciones
  const generateNewRecommendations = async () => {
    try {
      if (!user?.id) return
      
      const aiService = new AdvancedAIService(user.id)
      const newRecommendations = await aiService.generateCrossDomainRecommendations()
      
      setRecommendations(newRecommendations)
    } catch (error) {
      console.error("Error al generar nuevas recomendaciones:", error)
      // Usar recomendaciones de ejemplo si hay error
      setRecommendations(generateSampleRecommendations())
    }
  }
  
  // Generar recomendaciones de ejemplo
  const generateSampleRecommendations = (): CrossDomainRecommendation[] => {
    return [
      {
        id: "1",
        userId: user?.id || "",
        primaryDomain: "sleep",
        secondaryDomain: "workout",
        title: "Optimiza tu sueño para mejorar tu rendimiento físico",
        description: "Mejora la calidad de tu sueño para potenciar tus entrenamientos y recuperación muscular.",
        reason: "Hemos detectado que tus entrenamientos son más efectivos cuando duermes mejor.",
        impact: {
          workout: {
            description: "Mejor rendimiento y recuperación",
            magnitude: 8
          },
          sleep: {
            description: "Mejor calidad de sueño",
            magnitude: 7
          }
        },
        priority: "high",
        tags: ["sueño", "rendimiento", "recuperación"],
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        userId: user?.id || "",
        primaryDomain: "nutrition",
        secondaryDomain: "productivity",
        title: "Distribución estratégica de carbohidratos",
        description: "Ajusta el consumo de carbohidratos según tu horario de trabajo para mantener niveles de energía estables.",
        reason: "Hemos observado que tu energía y concentración fluctúan significativamente durante el día, correlacionado con tus patrones de alimentación.",
        impact: {
          productivity: {
            description: "Mayor concentración y energía sostenida",
            magnitude: 8
          },
          nutrition: {
            description: "Mejor aprovechamiento de nutrientes",
            magnitude: 7
          }
        },
        priority: "medium",
        tags: ["nutrición", "energía", "productividad"],
        createdAt: new Date().toISOString()
      }
    ]
  }
  
  // Refrescar recomendaciones
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await generateNewRecommendations()
      
      toast({
        title: "Recomendaciones actualizadas",
        description: "Se han generado nuevas recomendaciones personalizadas"
      })
    } catch (error) {
      console.error("Error al refrescar recomendaciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar las recomendaciones",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }
  
  // Dar feedback a una recomendación
  const handleFeedback = async (id: string, feedback: 'positive' | 'negative') => {
    try {
      // Actualizar en la base de datos
      const { error } = await supabase
        .from('cross_domain_recommendations')
        .update({ feedback })
        .eq('id', id)
        .eq('user_id', user?.id)
      
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
  
  // Marcar como completada
  const handleComplete = async (id: string) => {
    try {
      // Actualizar en la base de datos
      const { error } = await supabase
        .from('cross_domain_recommendations')
        .update({ 
          is_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user?.id)
      
      if (error) {
        console.warn("Error al marcar como completada:", error)
      }
      
      // Actualizar estado local
      setRecommendations(prev => 
        prev.filter(rec => rec.id !== id)
      )
      
      toast({
        title: "Recomendación completada",
        description: "¡Excelente trabajo! Has completado esta recomendación."
      })
    } catch (error) {
      console.error("Error al marcar como completada:", error)
    }
  }
  
  // Renderizar icono según el dominio
  const renderIcon = (domain: string) => {
    switch (domain) {
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
  
  // Obtener color según el dominio
  const getDomainColor = (domain: string) => {
    switch (domain) {
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
  
  // Obtener texto según el dominio
  const getDomainText = (domain: string) => {
    switch (domain) {
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
        return domain
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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recomendaciones Holísticas</h2>
          <p className="text-muted-foreground">Sugerencias que conectan diferentes áreas de tu bienestar</p>
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
      
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-10">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Cargando recomendaciones holísticas...</p>
              </div>
            </CardContent>
          </Card>
        ) : recommendations.length > 0 ? (
          recommendations.map(recommendation => (
            <Card key={recommendation.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <div className={`rounded-full p-1.5 ${getDomainColor(recommendation.primaryDomain)}`}>
                        {renderIcon(recommendation.primaryDomain)}
                      </div>
                      <ArrowRight className="h-4 w-4 mx-1" />
                      <div className={`rounded-full p-1.5 ${getDomainColor(recommendation.secondaryDomain)}`}>
                        {renderIcon(recommendation.secondaryDomain)}
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className={getDomainColor(recommendation.primaryDomain)}>
                          {getDomainText(recommendation.primaryDomain)}
                        </Badge>
                        <ArrowRightLeft className="h-3 w-3 mx-1" />
                        <Badge variant="outline" className={getDomainColor(recommendation.secondaryDomain)}>
                          {getDomainText(recommendation.secondaryDomain)}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority === 'high' ? 'Alta prioridad' : 
                           recommendation.priority === 'medium' ? 'Media prioridad' : 'Baja prioridad'}
                        </Badge>
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
                
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-medium">Impacto esperado:</h4>
                  {Object.entries(recommendation.impact).map(([domain, impact]) => (
                    <div key={domain} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className={`font-medium ${getDomainColor(domain).split(' ')[1]}`}>
                          {getDomainText(domain)}
                        </span>
                        <span>{impact.description}</span>
                      </div>
                      <Progress value={impact.magnitude * 10} className="h-2" />
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {recommendation.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="text-xs text-muted-foreground">
                  Generado el {new Date(recommendation.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleFeedback(recommendation.id, 'positive')}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Útil
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleFeedback(recommendation.id, 'negative')}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    No útil
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleComplete(recommendation.id)}
                  >
                    Completar
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
                <p className="text-muted-foreground">No hay recomendaciones holísticas disponibles.</p>
                <Button 
                  className="mt-4"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Generar Recomendaciones
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
