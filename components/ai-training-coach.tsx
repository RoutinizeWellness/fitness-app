"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkles, Search, Dumbbell, Brain, BarChart2, MessageSquare, Lightbulb, Info, Zap } from 'lucide-react'
import { useAI } from '@/contexts/ai-context'
import { useTraining } from '@/contexts/training-context'
import { AIResponse } from '@/lib/ai-types'
import { toast } from '@/components/ui/use-toast'

export default function AITrainingCoach() {
  const [activeTab, setActiveTab] = useState("coach")
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState<AIResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const { 
    askAssistant, 
    isLoadingAssistant, 
    recommendations, 
    isLoadingRecommendations, 
    loadRecommendations 
  } = useAI()
  
  const { routines, workoutLogs } = useTraining()
  
  // Load recommendations when component mounts
  useEffect(() => {
    loadRecommendations()
  }, [])
  
  // Handle query submission
  const handleAskCoach = async () => {
    if (!query.trim()) return
    
    try {
      setIsLoading(true)
      setResponse(null)
      
      // Add context about user's training
      const context = {
        routines: routines.length,
        workouts: workoutLogs.length,
        recent_workouts: true,
        training_focus: routines.length > 0 ? routines[0].goal : undefined
      }
      
      const aiResponse = await askAssistant(query, context)
      
      if (aiResponse) {
        setResponse(aiResponse)
      }
    } catch (error) {
      console.error("Error al consultar al coach:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar tu consulta. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 mr-2 text-primary" />
          Coach de Entrenamiento IA
        </CardTitle>
        <CardDescription>
          Tu asistente personal para optimizar tu entrenamiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="coach" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Consultas
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Recomendaciones
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="coach" className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Ej: ¿Cómo puedo mejorar mi técnica de sentadilla?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskCoach()}
              />
              <Button onClick={handleAskCoach} disabled={isLoading || isLoadingAssistant}>
                {isLoading || isLoadingAssistant ? (
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
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-foreground whitespace-pre-line">{response.answer}</p>
                
                {response.sources && response.sources.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground">Fuentes:</p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                      {response.sources.map((source, index) => (
                        <li key={index}>
                          {source.url ? (
                            <a href={source.url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
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
              </div>
            )}
            
            {!response && !isLoading && !isLoadingAssistant && (
              <div className="mt-4 p-6 border border-dashed rounded-lg text-center">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-1">¿En qué puedo ayudarte hoy?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Pregúntame sobre técnicas de ejercicios, planes de entrenamiento, o consejos para mejorar tu rendimiento.
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                  <Button 
                    variant="outline" 
                    className="text-xs justify-start"
                    onClick={() => setQuery("¿Cómo puedo mejorar mi técnica de sentadilla?")}
                  >
                    ¿Cómo mejorar mi técnica de sentadilla?
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-xs justify-start"
                    onClick={() => setQuery("¿Cuánto descanso necesito entre series?")}
                  >
                    ¿Cuánto descanso entre series?
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-xs justify-start"
                    onClick={() => setQuery("¿Qué ejercicios son mejores para la espalda?")}
                  >
                    ¿Mejores ejercicios para espalda?
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-xs justify-start"
                    onClick={() => setQuery("¿Cómo evitar lesiones al entrenar?")}
                  >
                    ¿Cómo evitar lesiones?
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            {isLoadingRecommendations ? (
              <div className="space-y-3">
                <Skeleton className="h-[125px] w-full rounded-lg" />
                <Skeleton className="h-[125px] w-full rounded-lg" />
              </div>
            ) : recommendations.length > 0 ? (
              <ScrollArea className="h-[300px] pr-4">
                {recommendations
                  .filter(rec => rec.type === 'workout')
                  .map(recommendation => (
                    <Card key={recommendation.id} className="mb-4">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <Dumbbell className="h-5 w-5 text-primary" />
                            <CardTitle className="ml-2 text-lg">{recommendation.title}</CardTitle>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {recommendation.confidence}% confianza
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{recommendation.description}</p>
                        
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
                        <p className="text-xs text-muted-foreground italic">Razón: {recommendation.reason}</p>
                      </CardFooter>
                    </Card>
                  ))}
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No hay recomendaciones disponibles</p>
                <p className="text-sm text-muted-foreground mt-1">Completa más entrenamientos para recibir recomendaciones personalizadas</p>
              </div>
            )}
            
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
