"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Search, Dumbbell, Brain, BarChart2, MessageSquare, Lightbulb, Info } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { askAIAssistant, generatePersonalizedRecommendations } from "@/lib/ai-service"
import { AIRecommendation, AIResponse } from "@/lib/ai-types"
import { toast } from "@/components/ui/use-toast"
import { getExerciseById } from "@/lib/supabase-queries"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Componente para mostrar un ejercicio
function ExerciseCard({ exerciseId, index }: { exerciseId: string, index: number }) {
  const [exercise, setExercise] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    async function loadExercise() {
      try {
        setIsLoading(true)
        const { data, error } = await getExerciseById(exerciseId)

        if (error) {
          console.error("Error al cargar ejercicio:", error)
          return
        }

        if (data) {
          setExercise(data)
        }
      } catch (error) {
        console.error("Error al cargar ejercicio:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadExercise()
  }, [exerciseId])

  if (isLoading) {
    return (
      <Badge variant="outline" className="text-xs py-2 px-3">
        <Skeleton className="h-4 w-20" />
      </Badge>
    )
  }

  if (!exercise) {
    return (
      <Badge variant="outline" className="text-xs py-2 px-3">
        Ejercicio no encontrado
      </Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Badge
          variant="outline"
          className="text-xs py-2 px-3 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center">
            <span className="mr-1">{index + 1}.</span>
            <span className="font-medium">{exercise.name}</span>
          </div>
        </Badge>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{exercise.name}</DialogTitle>
          <DialogDescription>
            {exercise.muscle_group} • {exercise.difficulty}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {exercise.image_url && (
            <div className="relative h-48 w-full overflow-hidden rounded-md mb-4">
              <img
                src={exercise.image_url}
                alt={exercise.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Si la imagen falla, usar una imagen de respaldo
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 p-2 rounded-md">
              <p className="text-xs font-medium text-gray-500">Grupo muscular</p>
              <p className="text-sm">{exercise.muscle_group}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-md">
              <p className="text-xs font-medium text-gray-500">Dificultad</p>
              <p className="text-sm">{exercise.difficulty}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-md">
              <p className="text-xs font-medium text-gray-500">Equipo</p>
              <p className="text-sm">{exercise.equipment || 'No especificado'}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-md">
              <p className="text-xs font-medium text-gray-500">Tipo</p>
              <p className="text-sm">{exercise.is_compound ? 'Compuesto' : 'Aislamiento'}</p>
            </div>
          </div>

          {exercise.description && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Descripción</p>
              <p className="text-sm">{exercise.description}</p>
            </div>
          )}

          {exercise.instructions && exercise.instructions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Instrucciones</p>
              <ol className="text-sm list-decimal list-inside space-y-1">
                {Array.isArray(exercise.instructions)
                  ? exercise.instructions.map((instruction: string, i: number) => (
                      <li key={i}>{instruction}</li>
                    ))
                  : <li>{exercise.instructions}</li>
                }
              </ol>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface AIAssistantProps {
  userId: string
}

export default function AIAssistant({ userId }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState("chat")
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [response, setResponse] = useState<AIResponse | null>(null)
  const { user } = useAuth()

  // Cargar recomendaciones al montar el componente
  useEffect(() => {
    if (userId) {
      loadRecommendations()
    }
  }, [userId])

  // Función para cargar recomendaciones personalizadas
  const loadRecommendations = async () => {
    try {
      setIsLoadingRecommendations(true)
      const recommendations = await generatePersonalizedRecommendations(userId)
      setRecommendations(recommendations)
    } catch (error) {
      console.error("Error al cargar recomendaciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las recomendaciones personalizadas",
        variant: "destructive",
      })
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  // Función para manejar la consulta al asistente
  const handleAskAssistant = async () => {
    if (!query.trim()) return

    try {
      setIsLoading(true)
      setResponse(null)

      const aiResponse = await askAIAssistant({
        query,
        context: {
          user_id: userId,
          recent_workouts: true
        }
      })

      setResponse(aiResponse)
    } catch (error) {
      console.error("Error al consultar al asistente:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar tu consulta. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Renderizar tarjeta de recomendación
  const renderRecommendationCard = (recommendation: AIRecommendation) => {
    const iconMap = {
      'workout': <Dumbbell className="h-5 w-5" />,
      'nutrition': <Lightbulb className="h-5 w-5" />,
      'recovery': <Brain className="h-5 w-5" />,
      'mindfulness': <Brain className="h-5 w-5" />
    }

    return (
      <Card key={recommendation.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              {iconMap[recommendation.type]}
              <CardTitle className="ml-2 text-lg">{recommendation.title}</CardTitle>
            </div>
            <Badge variant="outline" className="ml-2">
              {recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1)}
            </Badge>
          </div>
          <CardDescription className="mt-1">
            Confianza: {recommendation.confidence}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">{recommendation.description}</p>

          {/* Mostrar ejercicios recomendados si existen */}
          {recommendation.exercises && recommendation.exercises.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Ejercicios recomendados:</p>
              <div className="flex flex-wrap gap-2">
                {recommendation.exercises.map((exerciseId, index) => (
                  <ExerciseCard key={exerciseId} exerciseId={exerciseId} index={index} />
                ))}
              </div>
            </div>
          )}

          {recommendation.tags && recommendation.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {recommendation.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <p className="text-xs text-gray-500 italic">Razón: {recommendation.reason}</p>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Sparkles className="h-5 w-5 text-blue-500" />
        <h2 className="text-2xl font-bold tracking-tight">Asistente IA</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="chat" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Consultas
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Recomendaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asistente de Fitness IA</CardTitle>
              <CardDescription>
                Pregúntame sobre ejercicios, nutrición, planes de entrenamiento o cualquier duda sobre fitness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="Ej: ¿Cuáles son los mejores ejercicios para espalda?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAssistant()}
                />
                <Button onClick={handleAskAssistant} disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 rounded-full animate-spin mr-2" />
                      Pensando...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Search className="h-4 w-4 mr-2" />
                      Preguntar
                    </div>
                  )}
                </Button>
              </div>

              {response && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-800 whitespace-pre-line">{response.answer}</p>

                  {response.sources && response.sources.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500">Fuentes:</p>
                      <ul className="text-xs text-gray-500 list-disc list-inside">
                        {response.sources.map((source, index) => (
                          <li key={index}>
                            {source.url ? (
                              <a href={source.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                {source.title}
                              </a>
                            ) : (
                              source.title
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {response.related_exercises && response.related_exercises.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500">Ejercicios relacionados:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {response.related_exercises.map((exerciseId, index) => (
                          <ExerciseCard key={exerciseId} exerciseId={exerciseId} index={index} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recomendaciones Personalizadas</CardTitle>
              <CardDescription>
                Basadas en tu historial de entrenamiento y objetivos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRecommendations ? (
                <div className="space-y-3">
                  <Skeleton className="h-[125px] w-full rounded-lg" />
                  <Skeleton className="h-[125px] w-full rounded-lg" />
                </div>
              ) : recommendations.length > 0 ? (
                <ScrollArea className="h-[400px] pr-4">
                  {recommendations.map(recommendation => renderRecommendationCard(recommendation))}
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No hay recomendaciones disponibles</p>
                  <p className="text-sm text-gray-400 mt-1">Completa más entrenamientos para recibir recomendaciones personalizadas</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={loadRecommendations}
                disabled={isLoadingRecommendations}
              >
                {isLoadingRecommendations ? (
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 rounded-full animate-spin mr-2" />
                    Actualizando...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Actualizar recomendaciones
                  </div>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
