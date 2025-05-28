"use client"

import { useState, useEffect } from "react"
import { useGemini } from "@/lib/contexts/gemini-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import {
  Sparkles,
  Dumbbell,
  Utensils,
  Brain,
  RefreshCw,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"

interface Recommendation {
  id: string
  title: string
  description: string
  type: string
}

interface GeminiRecommendationsProps {
  className?: string
}

export function GeminiRecommendations({ className }: GeminiRecommendationsProps) {
  const { generateRecommendations, isInitialized } = useGemini()
  const [activeTab, setActiveTab] = useState("workout")
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({})

  // Load recommendations when tab changes
  useEffect(() => {
    loadRecommendations(activeTab)
  }, [activeTab])

  const loadRecommendations = async (type: string) => {
    if (!isInitialized) {
      toast({
        title: "API no disponible",
        description: "El servicio de IA no está disponible en este momento.",
        variant: "destructive",
      })
      setRecommendations([])
      return
    }

    setIsLoading(true)
    try {
      // Use the generateRecommendations function from the context
      const recs = await generateRecommendations(type)
      setRecommendations(recs)
    } catch (error) {
      console.error("Error al cargar recomendaciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las recomendaciones. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      })
      setRecommendations([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadRecommendations(activeTab)
  }

  const handleFeedback = (id: string, isPositive: boolean) => {
    // In a real app, you would send this feedback to your backend
    toast({
      title: isPositive ? "¡Gracias por tu feedback positivo!" : "Gracias por tu feedback",
      description: isPositive
        ? "Nos alegra que esta recomendación te haya sido útil."
        : "Usaremos tu feedback para mejorar nuestras recomendaciones.",
    })

    // Mark this recommendation as having received feedback
    setFeedbackGiven(prev => ({
      ...prev,
      [id]: true
    }))
  }

  const renderRecommendationCard = (recommendation: Recommendation) => {
    return (
      <Card key={recommendation.id} className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{recommendation.title}</CardTitle>
            <Badge variant="outline" className="ml-2">
              {recommendation.type === "workout" && "Entrenamiento"}
              {recommendation.type === "nutrition" && "Nutrición"}
              {recommendation.type === "wellness" && "Bienestar"}
              {recommendation.type === "general" && "General"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{recommendation.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          {!feedbackGiven[recommendation.id] ? (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(recommendation.id, true)}
                className="text-xs"
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                Útil
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(recommendation.id, false)}
                className="text-xs"
              >
                <ThumbsDown className="h-3 w-3 mr-1" />
                No útil
              </Button>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Gracias por tu feedback</span>
          )}
        </CardFooter>
      </Card>
    )
  }

  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-[180px]" />
            <Skeleton className="h-5 w-[100px]" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-8 w-[120px]" />
        </CardFooter>
      </Card>
    ))
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-xl font-bold">Recomendaciones IA</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="workout" className="flex items-center">
            <Dumbbell className="h-4 w-4 mr-2" />
            Entrenamiento
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center">
            <Utensils className="h-4 w-4 mr-2" />
            Nutrición
          </TabsTrigger>
          <TabsTrigger value="wellness" className="flex items-center">
            <Brain className="h-4 w-4 mr-2" />
            Bienestar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workout" className="mt-0 space-y-4">
          {isLoading ? renderSkeletons() : recommendations.map(renderRecommendationCard)}
        </TabsContent>

        <TabsContent value="nutrition" className="mt-0 space-y-4">
          {isLoading ? renderSkeletons() : recommendations.map(renderRecommendationCard)}
        </TabsContent>

        <TabsContent value="wellness" className="mt-0 space-y-4">
          {isLoading ? renderSkeletons() : recommendations.map(renderRecommendationCard)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
