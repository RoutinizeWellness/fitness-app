"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ThumbsUp, ThumbsDown, RefreshCw, AlertCircle, ChevronDown, ChevronUp, Activity, Users } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  generateSmartRecommendations,
  getSmartRecommendations,
  saveRecommendationFeedback,
  analyzeWorkoutPatterns
} from "@/lib/learning-algorithm"
import { SmartRecommendation } from "@/lib/learning-algorithm"
import { supabase } from "@/lib/supabase-client"
import { runMigrations } from "@/lib/supabase-migrations"

interface SmartRecommendationsProps {
  userId: string
}

export default function SmartRecommendations({ userId }: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [feedbackInProgress, setFeedbackInProgress] = useState<string | null>(null)
  const [dbError, setDbError] = useState<string | null>(null)

  // Cargar recomendaciones al montar el componente
  useEffect(() => {
    if (userId) {
      loadRecommendations()
    }
  }, [userId])

  // Función para cargar recomendaciones
  const loadRecommendations = async () => {
    try {
      setIsLoading(true)

      // Verificar si la tabla existe primero
      try {
        const { error: tableCheckError } = await supabase
          .from('smart_recommendations')
          .select('count')
          .limit(1)
          .single()

        if (tableCheckError) {
          console.error("Error al verificar la tabla smart_recommendations:", tableCheckError)
          setDbError(tableCheckError.message || "La tabla de recomendaciones no existe")
          toast({
            title: "Error de base de datos",
            description: "La tabla de recomendaciones no existe. Ejecuta las migraciones de la base de datos primero.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      } catch (tableError) {
        console.error("Error al verificar la tabla:", tableError)
      }

      // Intentar obtener recomendaciones
      const { data, error } = await getSmartRecommendations(userId, {
        activeOnly: true
      })

      if (error) {
        console.error("Error al cargar recomendaciones:", error)
        toast({
          title: "Error",
          description: `No se pudieron cargar las recomendaciones: ${error.message || 'Error desconocido'}`,
          variant: "destructive",
        })
        return
      }

      if (data && data.length > 0) {
        setRecommendations(data)
      } else {
        // Si no hay recomendaciones, intentar generarlas
        await generateRecommendations()
      }
    } catch (error) {
      console.error("Error al cargar recomendaciones:", error)
      toast({
        title: "Error",
        description: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Estado para opciones avanzadas
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [includeWearableData, setIncludeWearableData] = useState(false)
  const [includeSimilarUsers, setIncludeSimilarUsers] = useState(false)

  // Función para generar nuevas recomendaciones
  const generateRecommendations = async () => {
    try {
      setIsAnalyzing(true)

      // Verificar si las tablas necesarias existen
      try {
        // Verificar tabla user_patterns
        const { error: patternsTableError } = await supabase
          .from('user_patterns')
          .select('count')
          .limit(1)
          .single()

        if (patternsTableError) {
          console.error("Error al verificar la tabla user_patterns:", patternsTableError)
          setDbError(patternsTableError.message || "La tabla de patrones de usuario no existe")
          toast({
            title: "Error de base de datos",
            description: "La tabla de patrones de usuario no existe. Ejecuta las migraciones de la base de datos primero.",
            variant: "destructive",
          })
          setIsAnalyzing(false)
          return
        }

        // Verificar tabla smart_recommendations
        const { error: recsTableError } = await supabase
          .from('smart_recommendations')
          .select('count')
          .limit(1)
          .single()

        if (recsTableError) {
          console.error("Error al verificar la tabla smart_recommendations:", recsTableError)
          setDbError(recsTableError.message || "La tabla de recomendaciones no existe")
          toast({
            title: "Error de base de datos",
            description: "La tabla de recomendaciones no existe. Ejecuta las migraciones de la base de datos primero.",
            variant: "destructive",
          })
          setIsAnalyzing(false)
          return
        }
      } catch (tableError) {
        console.error("Error al verificar las tablas:", tableError)
      }

      // Primero analizamos los patrones
      const { error: analysisError } = await analyzeWorkoutPatterns(userId)

      if (analysisError) {
        console.error("Error al analizar patrones:", analysisError)
        toast({
          title: "Información",
          description: `Necesitamos más datos de entrenamiento: ${analysisError.message}`,
        })
        return
      }

      // Luego generamos recomendaciones basadas en esos patrones
      const { data, error } = await generateSmartRecommendations(userId, {
        includeWearableData,
        includeSimilarUsers
      })

      if (error) {
        console.error("Error al generar recomendaciones:", error)
        toast({
          title: "Error",
          description: `No se pudieron generar recomendaciones: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      if (data && data.length > 0) {
        setRecommendations(data)
        toast({
          title: "Recomendaciones generadas",
          description: `Se han generado ${data.length} recomendaciones basadas en tus patrones de entrenamiento.`,
        })
      } else {
        toast({
          title: "Información",
          description: "No se pudieron generar recomendaciones. Necesitamos más datos de entrenamiento.",
        })
      }
    } catch (error) {
      console.error("Error al generar recomendaciones:", error)
      toast({
        title: "Error",
        description: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }



  // Función para ejecutar migraciones de la base de datos
  const executeMigrations = async () => {
    try {
      setIsMigrating(true)
      setDbError(null)

      // Ejecutar la migración para crear las tablas necesarias
      const { success, error } = await runMigrations([
        '20240701000000_user_learning_patterns.sql',
        '20240702000000_advanced_learning_features.sql'
      ])

      if (!success || error) {
        console.error("Error al ejecutar migraciones:", error)
        setDbError(error?.message || 'Error desconocido al ejecutar migraciones')
        toast({
          title: "Error de migración",
          description: `No se pudieron ejecutar las migraciones: ${error?.message || 'Error desconocido'}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Migraciones completadas",
        description: "Las tablas de la base de datos se han creado correctamente.",
      })

      // Recargar recomendaciones
      await loadRecommendations()
    } catch (error) {
      console.error("Error al ejecutar migraciones:", error)
      setDbError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsMigrating(false)
    }
  }

  // Función para enviar feedback sobre una recomendación
  const handleFeedback = async (recommendationId: string, rating: number) => {
    try {
      setFeedbackInProgress(recommendationId)

      const { error } = await saveRecommendationFeedback({
        user_id: userId,
        recommendation_id: recommendationId,
        recommendation_type: 'workout', // Por defecto
        rating
      })

      if (error) {
        console.error("Error al enviar feedback:", error)
        toast({
          title: "Error",
          description: "No se pudo enviar tu valoración. Inténtalo de nuevo más tarde.",
          variant: "destructive",
        })
        return
      }

      // Actualizar la lista de recomendaciones si la valoración es negativa
      if (rating < 3) {
        setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId))
        toast({
          title: "Feedback registrado",
          description: "Gracias por tu valoración. Hemos eliminado esta recomendación.",
        })
      } else {
        toast({
          title: "Feedback registrado",
          description: "Gracias por tu valoración. Usaremos esta información para mejorar tus recomendaciones.",
        })
      }
    } catch (error) {
      console.error("Error al enviar feedback:", error)
    } finally {
      setFeedbackInProgress(null)
    }
  }

  // Renderizar el componente
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center">
          <Sparkles className="h-6 w-6 mr-2 text-yellow-500" />
          Recomendaciones Inteligentes
        </h2>
        <div className="flex items-center gap-2">
          <Collapsible
            open={showAdvancedOptions}
            onOpenChange={setShowAdvancedOptions}
            className="w-[250px]"
          >
            <div className="flex items-center">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  Opciones avanzadas
                  {showAdvancedOptions ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-2 p-2 border rounded-md">
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <Label htmlFor="wearable-data">Datos de wearables</Label>
                </div>
                <Switch
                  id="wearable-data"
                  checked={includeWearableData}
                  onCheckedChange={setIncludeWearableData}
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <Label htmlFor="similar-users">Usuarios similares</Label>
                </div>
                <Switch
                  id="similar-users"
                  checked={includeSimilarUsers}
                  onCheckedChange={setIncludeSimilarUsers}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Button
            variant="outline"
            size="sm"
            onClick={generateRecommendations}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Skeleton className="h-4 w-4 rounded-full animate-spin mr-2" />
                Analizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </>
            )}
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground">
        Recomendaciones personalizadas basadas en el análisis de tus patrones de entrenamiento.
        <span className="text-xs text-gray-400 block mt-1">ID de usuario: {userId}</span>
      </p>

      {dbError ? (
        // Mostrar error de base de datos
        <Card className="border-red-300">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error de base de datos</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              No se pudieron cargar las recomendaciones porque las tablas necesarias no existen en la base de datos.
              Ejecuta las migraciones para crear las tablas requeridas.
            </p>
            <div className="text-xs text-red-500 p-2 bg-red-50 rounded mb-4 max-w-full overflow-auto">
              <code>{dbError}</code>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={executeMigrations}
                disabled={isMigrating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isMigrating ? (
                  <>
                    <Skeleton className="h-4 w-4 rounded-full animate-spin mr-2" />
                    Ejecutando migraciones...
                  </>
                ) : (
                  "Ejecutar migraciones"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        // Mostrar esqueletos de carga
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-20 mr-2" />
                <Skeleton className="h-9 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        // Mostrar recomendaciones
        <div className="space-y-4">
          {recommendations.map(recommendation => (
            <Card key={recommendation.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {recommendation.recommendation_data?.source === 'similar_users' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Users className="h-3 w-3 mr-1" />
                        Usuarios similares
                      </Badge>
                    )}
                    {recommendation.recommendation_data?.recovery_score !== undefined && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Activity className="h-3 w-3 mr-1" />
                        Wearable
                      </Badge>
                    )}
                    <Badge variant="outline" className="ml-2">
                      {recommendation.confidence.toFixed(0)}% confianza
                    </Badge>
                  </div>
                </div>
                <CardDescription>{recommendation.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <strong>Razonamiento:</strong> {recommendation.reasoning}
                </div>

                {/* Mostrar datos adicionales según el tipo de recomendación */}
                {recommendation.recommendation_type === 'recovery' && recommendation.recommendation_data?.recommendations && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <p className="text-sm font-medium text-blue-800 mb-1">Recomendaciones de recuperación:</p>
                    <ul className="text-xs text-blue-700 pl-4 list-disc">
                      {recommendation.recommendation_data.recommendations.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {recommendation.recommendation_data?.source === 'similar_users' && (
                  <div className="mt-2 p-2 bg-green-50 rounded-md">
                    <p className="text-sm font-medium text-green-800">
                      Basado en datos de usuarios con patrones de entrenamiento similares a los tuyos.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => handleFeedback(recommendation.id, 5)}
                    disabled={feedbackInProgress === recommendation.id}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Me gusta
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeedback(recommendation.id, 1)}
                    disabled={feedbackInProgress === recommendation.id}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    No me gusta
                  </Button>
                </div>
                <Button variant="default" size="sm">
                  Ver detalles
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // Mostrar mensaje cuando no hay recomendaciones
        <Card>
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay recomendaciones disponibles</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Necesitamos más datos sobre tus entrenamientos para generar recomendaciones personalizadas.
              Continúa registrando tus actividades para obtener sugerencias adaptadas a tus preferencias.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={generateRecommendations} disabled={isAnalyzing}>
                {isAnalyzing ? "Analizando..." : "Intentar de nuevo"}
              </Button>


            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
