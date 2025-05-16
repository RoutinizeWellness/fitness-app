"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { 
  BarChart2, 
  Dumbbell, 
  Activity, 
  Clock, 
  Zap, 
  Heart,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Download,
  Share2
} from "lucide-react"
import { analyzeWorkout } from "@/lib/advanced-analytics"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface WorkoutAnalysisProps {
  userId: string
  workoutId: string
}

export function WorkoutAnalysis({ userId, workoutId }: WorkoutAnalysisProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useIsMobile()

  // Cargar análisis al montar el componente
  useEffect(() => {
    loadAnalysis()
  }, [userId, workoutId])

  async function loadAnalysis() {
    try {
      setIsLoading(true)
      const { data, error } = await analyzeWorkout(userId, workoutId)
      
      if (error) throw error
      
      if (data) {
        setAnalysis(data)
      }
    } catch (error) {
      console.error("Error al cargar análisis:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el análisis del entrenamiento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Renderizar resumen del entrenamiento
  function renderOverview() {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      )
    }

    if (!analysis) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <BarChart2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No hay análisis disponible</h3>
          <p className="text-sm text-muted-foreground mt-1">
            No se pudo encontrar el análisis para este entrenamiento
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Duración</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                <div className="font-medium text-2xl">{analysis.duration} min</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Volumen total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Dumbbell className="h-5 w-5 mr-2 text-muted-foreground" />
                <div className="font-medium text-2xl">{analysis.total_volume.toLocaleString()} kg</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Intensidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-muted-foreground" />
                <div className="font-medium text-2xl">{analysis.intensity}/10</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recuperación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-muted-foreground" />
                <div className="font-medium text-2xl">{analysis.recovery_impact}/10</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ~{analysis.estimated_recovery_time}h para recuperar
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Activación muscular</CardTitle>
            <CardDescription>
              Distribución del trabajo por grupos musculares
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.muscle_groups.map((group) => (
                <div key={group.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{group.name}</span>
                    <span className="font-medium">{group.activation}%</span>
                  </div>
                  <Progress value={group.activation} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
            <CardDescription>
              Análisis de tu entrenamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.insights.map((insight, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <h3 className="font-medium">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones</CardTitle>
            <CardDescription>
              Sugerencias para mejorar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="bg-primary/10 text-primary rounded-full p-1.5 mt-0.5">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium">{recommendation.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {recommendation.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Renderizar detalles de ejercicios
  function renderExercises() {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )
    }

    if (!analysis || !analysis.exercises) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No hay ejercicios disponibles</h3>
          <p className="text-sm text-muted-foreground mt-1">
            No se encontraron detalles de ejercicios para este entrenamiento
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {analysis.exercises.map((exercise, index) => (
            <AccordionItem key={index} value={`exercise-${index}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center">
                    <div className="bg-primary/10 text-primary rounded-full p-2 mr-3">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">{exercise.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {exercise.sets} series · {exercise.total_reps} reps · {exercise.max_weight} kg máx
                      </p>
                    </div>
                  </div>
                  <Badge variant={exercise.improvement > 0 ? "default" : "outline"}>
                    {exercise.improvement > 0 ? `+${exercise.improvement}%` : "Sin cambios"}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-12 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Volumen</p>
                      <p className="font-medium">{exercise.volume.toLocaleString()} kg</p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Rendimiento</p>
                      <p className="font-medium">{exercise.performance}/10</p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Mejora</p>
                      <p className="font-medium">{exercise.improvement}%</p>
                    </div>
                  </div>
                  
                  {exercise.notes && (
                    <div className="p-3 border rounded-md">
                      <p className="text-sm font-medium">Notas</p>
                      <p className="text-sm text-muted-foreground mt-1">{exercise.notes}</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    )
  }

  // Renderizar sistemas energéticos
  function renderEnergySystems() {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )
    }

    if (!analysis || !analysis.energy_systems) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No hay datos disponibles</h3>
          <p className="text-sm text-muted-foreground mt-1">
            No se encontraron datos de sistemas energéticos para este entrenamiento
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sistemas energéticos</CardTitle>
            <CardDescription>
              Distribución del trabajo por sistemas energéticos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.energy_systems.map((system) => (
                <div key={system.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{system.name}</span>
                    <span className="font-medium">{system.activation}%</span>
                  </div>
                  <Progress value={system.activation} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Impacto en la recuperación</CardTitle>
            <CardDescription>
              Cómo afecta este entrenamiento a tu recuperación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Impacto general</p>
                  <p className="text-xl font-bold">{analysis.recovery_impact}/10</p>
                </div>
                <Badge variant={analysis.recovery_impact > 7 ? "destructive" : "outline"}>
                  {analysis.recovery_impact > 7 ? "Alto" : (analysis.recovery_impact > 4 ? "Medio" : "Bajo")}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Tiempo estimado de recuperación</p>
                <div className="p-3 bg-muted rounded-md">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Recuperación completa</p>
                    <p className="font-medium">{analysis.estimated_recovery_time} horas</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Recomendaciones de recuperación</p>
                <div className="p-3 border rounded-md">
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Prioriza el descanso de {analysis.muscle_groups[0].name.toLowerCase()} y {analysis.muscle_groups[1].name.toLowerCase()} en las próximas 24-48 horas.</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Asegúrate de consumir suficiente proteína (25-30g) en las próximas 2 horas.</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Considera técnicas de recuperación activa como estiramientos o movilidad ligera.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Análisis de Entrenamiento</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 rounded-none border-b">
              <TabsTrigger value="overview" className="rounded-none">
                Resumen
              </TabsTrigger>
              <TabsTrigger value="exercises" className="rounded-none">
                Ejercicios
              </TabsTrigger>
              <TabsTrigger value="energy" className="rounded-none">
                Sistemas energéticos
              </TabsTrigger>
            </TabsList>
            <div className="p-4">
              <TabsContent value="overview" className="m-0">
                {renderOverview()}
              </TabsContent>
              <TabsContent value="exercises" className="m-0">
                {renderExercises()}
              </TabsContent>
              <TabsContent value="energy" className="m-0">
                {renderEnergySystems()}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
