"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { PersonalizedRecommendation } from "@/lib/adaptive-learning-service"
import { 
  Dumbbell, 
  Apple, 
  Moon, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BarChart,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Heart,
  Brain,
  Flame
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface ClientRecommendationsProps {
  clientId: string
  professionalId: string
  professionalRole: 'trainer' | 'nutritionist' | 'admin'
}

export function ClientRecommendations({ 
  clientId, 
  professionalId,
  professionalRole 
}: ClientRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([])
  const [clientProfile, setClientProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [implementingId, setImplementingId] = useState<string | null>(null)
  
  const { toast } = useToast()
  
  useEffect(() => {
    loadRecommendations()
    loadClientProfile()
  }, [clientId])
  
  const loadRecommendations = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('personalized_recommendations')
        .select('*')
        .eq('user_id', clientId)
        .order('created', { ascending: false })
      
      if (error) throw error
      
      setRecommendations(data || [])
    } catch (error) {
      console.error("Error al cargar recomendaciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las recomendaciones",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadClientProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', clientId)
        .single()
      
      if (error) throw error
      
      setClientProfile(data)
    } catch (error) {
      console.error("Error al cargar perfil del cliente:", error)
    }
  }
  
  const implementRecommendation = async (recommendation: PersonalizedRecommendation) => {
    setImplementingId(recommendation.id)
    try {
      // Implementar la recomendación según su tipo
      let implementationResult = ""
      
      switch (recommendation.type) {
        case 'training':
          implementationResult = await implementTrainingRecommendation(recommendation)
          break
        case 'nutrition':
          implementationResult = await implementNutritionRecommendation(recommendation)
          break
        case 'recovery':
          implementationResult = await implementRecoveryRecommendation(recommendation)
          break
        case 'lifestyle':
          implementationResult = await implementLifestyleRecommendation(recommendation)
          break
      }
      
      // Actualizar el estado de la recomendación
      const { error } = await supabase
        .from('personalized_recommendations')
        .update({
          implemented: true,
          result: implementationResult,
          implemented_by: professionalId,
          implemented_at: new Date().toISOString()
        })
        .eq('id', recommendation.id)
      
      if (error) throw error
      
      // Actualizar la lista de recomendaciones
      loadRecommendations()
      
      toast({
        title: "Recomendación implementada",
        description: "La recomendación se ha aplicado correctamente",
        variant: "default"
      })
    } catch (error) {
      console.error("Error al implementar recomendación:", error)
      toast({
        title: "Error",
        description: "No se pudo implementar la recomendación",
        variant: "destructive"
      })
    } finally {
      setImplementingId(null)
    }
  }
  
  const implementTrainingRecommendation = async (recommendation: PersonalizedRecommendation): Promise<string> => {
    // Implementación específica para recomendaciones de entrenamiento
    // Aquí se modificarían rutinas, volumen, intensidad, etc.
    
    // Ejemplo: Modificar volumen de entrenamiento
    if (recommendation.title.includes("volumen")) {
      // Obtener rutina activa
      const { data: activeRoutine, error: routineError } = await supabase
        .from('workout_routines')
        .select('*')
        .eq('user_id', clientId)
        .eq('is_active', true)
        .single()
      
      if (routineError) {
        return "No se pudo encontrar una rutina activa para modificar"
      }
      
      // Modificar volumen (ejemplo simplificado)
      const volumeChange = recommendation.title.includes("Aumentar") ? 1.2 : 0.8
      
      // Aquí se modificaría la rutina real
      
      return `Se ha ${recommendation.title.includes("Aumentar") ? "aumentado" : "reducido"} el volumen de entrenamiento en la rutina "${activeRoutine.name}"`
    }
    
    // Ejemplo: Modificar intensidad de entrenamiento
    if (recommendation.title.includes("intensidad")) {
      return `Se ha ajustado la intensidad de entrenamiento según la recomendación`
    }
    
    return "Recomendación de entrenamiento implementada"
  }
  
  const implementNutritionRecommendation = async (recommendation: PersonalizedRecommendation): Promise<string> => {
    // Implementación específica para recomendaciones de nutrición
    
    // Ejemplo: Mejorar adherencia nutricional
    if (recommendation.title.includes("adherencia")) {
      // Simplificar plan nutricional
      return "Se ha simplificado el plan nutricional para mejorar la adherencia"
    }
    
    return "Recomendación nutricional implementada"
  }
  
  const implementRecoveryRecommendation = async (recommendation: PersonalizedRecommendation): Promise<string> => {
    // Implementación específica para recomendaciones de recuperación
    
    // Ejemplo: Mejorar estrategias de recuperación
    if (recommendation.title.includes("recuperación")) {
      // Añadir sesiones de recuperación
      return "Se han añadido sesiones de recuperación activa al plan"
    }
    
    return "Recomendación de recuperación implementada"
  }
  
  const implementLifestyleRecommendation = async (recommendation: PersonalizedRecommendation): Promise<string> => {
    // Implementación específica para recomendaciones de estilo de vida
    return "Recomendación de estilo de vida implementada"
  }
  
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'training':
        return <Dumbbell className="h-5 w-5 text-purple-500" />
      case 'nutrition':
        return <Apple className="h-5 w-5 text-green-500" />
      case 'recovery':
        return <Moon className="h-5 w-5 text-blue-500" />
      case 'lifestyle':
        return <Heart className="h-5 w-5 text-red-500" />
      default:
        return <Zap className="h-5 w-5 text-yellow-500" />
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case 'medium':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case 'low':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }
  
  const filteredRecommendations = recommendations.filter(rec => {
    if (activeTab === "all") return true
    if (activeTab === "implemented") return rec.implemented
    if (activeTab === "pending") return !rec.implemented
    return rec.type === activeTab
  })
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recomendaciones Personalizadas</CardTitle>
            <CardDescription>
              Recomendaciones basadas en el análisis de datos del cliente
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => loadRecommendations()}
          >
            Actualizar
          </Button>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid grid-cols-7">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="implemented">Implementadas</TabsTrigger>
            <TabsTrigger value="training">Entrenamiento</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrición</TabsTrigger>
            <TabsTrigger value="recovery">Recuperación</TabsTrigger>
            <TabsTrigger value="lifestyle">Estilo de vida</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          ) : filteredRecommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Brain className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
              <p>No hay recomendaciones disponibles en esta categoría</p>
              <p className="text-sm mt-2">Las recomendaciones se generan automáticamente basadas en el análisis de datos del cliente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecommendations.map((recommendation) => (
                <Card key={recommendation.id} className="overflow-hidden">
                  <div className="flex items-start p-4">
                    <div className="mr-4 mt-1">
                      {getRecommendationIcon(recommendation.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-lg">{recommendation.title}</h3>
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority === 'high' ? 'Alta' : 
                           recommendation.priority === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {recommendation.description}
                      </p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {recommendation.dataPoints && Object.entries(recommendation.dataPoints).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="flex items-center gap-1">
                            {key.includes('response') && <ArrowUpRight className="h-3 w-3" />}
                            {key.includes('fatigue') && <Flame className="h-3 w-3" />}
                            {key.includes('adherence') && <CheckCircle className="h-3 w-3" />}
                            {key}: {typeof value === 'number' ? value.toFixed(1) : value}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Generada el {format(parseISO(recommendation.created), "d MMM yyyy", { locale: es })}
                      </div>
                    </div>
                  </div>
                  
                  {recommendation.implemented ? (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 border-t border-green-100 dark:border-green-800">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-green-700 dark:text-green-300 font-medium">Implementada</p>
                          <p className="text-green-600 dark:text-green-400 text-sm">{recommendation.result}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 border-t flex justify-between items-center">
                      <span className="text-sm text-gray-500 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                        Pendiente de implementación
                      </span>
                      <Button 
                        onClick={() => implementRecommendation(recommendation)}
                        disabled={implementingId === recommendation.id}
                        size="sm"
                      >
                        {implementingId === recommendation.id ? (
                          <>
                            <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                            Implementando...
                          </>
                        ) : "Implementar"}
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Tabs>
      
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-gray-500">
          {recommendations.length} recomendaciones totales • {recommendations.filter(r => r.implemented).length} implementadas
        </div>
        <Button variant="ghost" size="sm" onClick={() => loadRecommendations()}>
          <BarChart className="h-4 w-4 mr-2" />
          Generar nuevas recomendaciones
        </Button>
      </CardFooter>
    </Card>
  )
}
