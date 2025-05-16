"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { 
  Lightbulb, 
  Brain, 
  TrendingUp, 
  Utensils, 
  Dumbbell, 
  Moon, 
  BarChart2,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  ArrowRight
} from "lucide-react"
import { 
  getUserInsights, 
  markInsightAsRead, 
  dismissInsight,
  getUserMetrics,
  generateAnalyticsReport,
  getUserPredictions,
  analyzeWorkout,
  AnalyticsInsight,
  AnalyticsMetric
} from "@/lib/advanced-analytics"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { useIsMobile } from "@/hooks/use-mobile"

interface AIInsightsProps {
  userId: string
}

export function AIInsights({ userId }: AIInsightsProps) {
  const [activeTab, setActiveTab] = useState("insights")
  const [insights, setInsights] = useState<AnalyticsInsight[]>([])
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<AnalyticsInsight | null>(null)
  const isMobile = useIsMobile()

  // Cargar insights al montar el componente
  useEffect(() => {
    loadInsights()
    loadMetrics()
  }, [userId])

  async function loadInsights() {
    try {
      setIsLoading(true)
      const { data, error } = await getUserInsights(userId, {
        includeDismissed: false,
        limit: 10
      })
      
      if (error) throw error
      
      if (data) {
        setInsights(data)
      }
    } catch (error) {
      console.error("Error al cargar insights:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los insights",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function loadMetrics() {
    try {
      const { data, error } = await getUserMetrics(userId)
      
      if (error) throw error
      
      if (data) {
        setMetrics(data)
      }
    } catch (error) {
      console.error("Error al cargar métricas:", error)
    }
  }

  // Marcar un insight como leído
  async function handleMarkAsRead(insightId: string) {
    try {
      const { error } = await markInsightAsRead(userId, insightId)
      
      if (error) throw error
      
      // Actualizar el estado local
      setInsights(insights.map(insight => 
        insight.id === insightId 
          ? { ...insight, is_read: true } 
          : insight
      ))
      
      if (selectedInsight?.id === insightId) {
        setSelectedInsight({ ...selectedInsight, is_read: true })
      }
    } catch (error) {
      console.error("Error al marcar insight como leído:", error)
      toast({
        title: "Error",
        description: "No se pudo marcar el insight como leído",
        variant: "destructive",
      })
    }
  }

  // Descartar un insight
  async function handleDismissInsight(insightId: string) {
    try {
      const { error } = await dismissInsight(userId, insightId)
      
      if (error) throw error
      
      // Actualizar el estado local
      setInsights(insights.filter(insight => insight.id !== insightId))
      
      if (selectedInsight?.id === insightId) {
        setSelectedInsight(null)
      }
      
      toast({
        title: "Insight descartado",
        description: "El insight ha sido descartado",
      })
    } catch (error) {
      console.error("Error al descartar insight:", error)
      toast({
        title: "Error",
        description: "No se pudo descartar el insight",
        variant: "destructive",
      })
    }
  }

  // Generar un informe de análisis
  async function handleGenerateReport() {
    try {
      setIsGenerating(true)
      
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30) // Último mes
      
      const { data, error } = await generateAnalyticsReport(
        userId,
        "performance",
        {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      )
      
      if (error) throw error
      
      toast({
        title: "Informe generado",
        description: "El informe ha sido generado correctamente",
      })
      
      // En una implementación real, aquí se podría navegar al informe o mostrarlo
      console.log("Informe generado:", data)
    } catch (error) {
      console.error("Error al generar informe:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el informe",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Obtener el icono para un tipo de insight
  function getInsightIcon(type: string) {
    switch (type) {
      case 'performance':
        return <TrendingUp className="h-5 w-5" />
      case 'nutrition':
        return <Utensils className="h-5 w-5" />
      case 'recovery':
        return <Moon className="h-5 w-5" />
      case 'progress':
        return <BarChart2 className="h-5 w-5" />
      case 'recommendation':
        return <Lightbulb className="h-5 w-5" />
      default:
        return <Brain className="h-5 w-5" />
    }
  }

  // Obtener el color para un tipo de insight
  function getInsightColor(type: string) {
    switch (type) {
      case 'performance':
        return "bg-blue-100 text-blue-700"
      case 'nutrition':
        return "bg-green-100 text-green-700"
      case 'recovery':
        return "bg-purple-100 text-purple-700"
      case 'progress':
        return "bg-amber-100 text-amber-700"
      case 'recommendation':
        return "bg-indigo-100 text-indigo-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // Renderizar lista de insights
  function renderInsightsList() {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-4 p-4 border rounded-md">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-[70%]" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (insights.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No hay insights disponibles</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sigue utilizando la aplicación para recibir insights personalizados
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {insights.map((insight) => (
          <div 
            key={insight.id} 
            className={`flex items-start space-x-4 p-4 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
              !insight.is_read ? "border-primary/50" : ""
            }`}
            onClick={() => {
              setSelectedInsight(insight)
              if (!insight.is_read) {
                handleMarkAsRead(insight.id)
              }
            }}
          >
            <div className={`rounded-full p-2 ${getInsightColor(insight.type)}`}>
              {getInsightIcon(insight.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{insight.title}</h3>
                {!insight.is_read && (
                  <Badge variant="outline" className="bg-primary/10 text-primary">Nuevo</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {insight.description}
              </p>
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span className="capitalize">{insight.type}</span>
                {insight.confidence > 0.8 && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Alta confianza
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Renderizar detalle de un insight
  function renderInsightDetail() {
    if (!selectedInsight) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-8">
          <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Selecciona un insight</h3>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Selecciona un insight de la lista para ver más detalles
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`rounded-full p-2 ${getInsightColor(selectedInsight.type)}`}>
              {getInsightIcon(selectedInsight.type)}
            </div>
            <div>
              <Badge variant="outline" className="capitalize mb-1">
                {selectedInsight.type}
              </Badge>
              <h2 className="text-xl font-semibold">{selectedInsight.title}</h2>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleDismissInsight(selectedInsight.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 border rounded-md bg-muted/30">
          <p>{selectedInsight.description}</p>
        </div>

        {selectedInsight.data && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Datos relevantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(selectedInsight.data).map(([key, value]) => {
                  // Si el valor es un objeto, mostrarlo de forma especial
                  if (typeof value === 'object' && value !== null) {
                    return (
                      <div key={key} className="space-y-1">
                        <p className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</p>
                        <div className="bg-muted p-2 rounded-md">
                          {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => (
                            <div key={subKey} className="flex justify-between text-sm">
                              <span className="capitalize">{subKey.replace(/_/g, ' ')}:</span>
                              <span className="font-medium">{subValue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  
                  // Para valores simples
                  return (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedInsight.actions && selectedInsight.actions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Acciones recomendadas</h3>
            <div className="flex flex-wrap gap-2">
              {selectedInsight.actions.map((action, index) => (
                <Button 
                  key={index} 
                  variant="outline"
                  onClick={() => {
                    // En una implementación real, aquí se manejaría la acción
                    toast({
                      title: "Acción seleccionada",
                      description: `Has seleccionado: ${action.label}`,
                    })
                  }}
                >
                  {action.label}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Generado el {new Date(selectedInsight.created_at).toLocaleString()}</span>
          <div className="flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>Confianza: {Math.round(selectedInsight.confidence * 100)}%</span>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar métricas clave
  function renderMetrics() {
    if (metrics.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <BarChart2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No hay métricas disponibles</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sigue utilizando la aplicación para ver tus métricas clave
          </p>
        </div>
      )
    }

    // Agrupar métricas por categoría
    const categorizedMetrics = metrics.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category].push(metric);
      return acc;
    }, {} as Record<string, AnalyticsMetric[]>);

    return (
      <div className="space-y-6">
        {Object.entries(categorizedMetrics).map(([category, categoryMetrics]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-medium capitalize">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryMetrics.map((metric) => (
                <Card key={metric.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{metric.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold">
                        {metric.value} <span className="text-sm font-normal">{metric.unit}</span>
                      </div>
                      {metric.change && (
                        <Badge variant={metric.trend === 'up' ? 'default' : (metric.trend === 'down' ? 'destructive' : 'outline')}>
                          {metric.change > 0 ? '+' : ''}{metric.change} ({metric.change_period})
                        </Badge>
                      )}
                    </div>
                    
                    {metric.goal && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progreso hacia el objetivo</span>
                          <span>{Math.round((metric.value / metric.goal) * 100)}%</span>
                        </div>
                        <Progress value={(metric.value / metric.goal) * 100} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Renderizar predicciones
  function renderPredictions() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Predicciones personalizadas</h3>
          <Button variant="outline" size="sm">
            Ver más
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Progresión de fuerza</CardTitle>
              <CardDescription>
                Basado en tu historial de entrenamiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Sentadilla</p>
                    <p className="text-xl font-bold">100 kg → 125 kg</p>
                  </div>
                  <Badge>+25%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Press de banca</p>
                    <p className="text-xl font-bold">80 kg → 95 kg</p>
                  </div>
                  <Badge>+19%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Peso muerto</p>
                    <p className="text-xl font-bold">130 kg → 155 kg</p>
                  </div>
                  <Badge>+19%</Badge>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Predicción a 3 meses con 75% de confianza</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Composición corporal</CardTitle>
              <CardDescription>
                Basado en tu nutrición y entrenamiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Peso</p>
                    <p className="text-xl font-bold">78.5 kg → 76.2 kg</p>
                  </div>
                  <Badge>-2.9%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">% Grasa corporal</p>
                    <p className="text-xl font-bold">18.5% → 16.5%</p>
                  </div>
                  <Badge>-10.8%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Masa muscular</p>
                    <p className="text-xl font-bold">35.2 kg → 36.8 kg</p>
                  </div>
                  <Badge>+4.5%</Badge>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Predicción a 3 meses con 80% de confianza</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Factores clave para alcanzar tus objetivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 text-green-700 rounded-full p-2">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Consistencia de entrenamiento</h4>
                  <p className="text-sm text-muted-foreground">
                    Mantén una consistencia de al menos 4 días por semana para optimizar tus resultados.
                    Actualmente estás en 4.2 días/semana.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-amber-100 text-amber-700 rounded-full p-2">
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Nutrición</h4>
                  <p className="text-sm text-muted-foreground">
                    Aumenta tu ingesta de proteínas en 15g diarios para alcanzar tu objetivo de composición corporal.
                    Actualmente estás en 135g/día, objetivo 150g/día.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 text-purple-700 rounded-full p-2">
                  <Moon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Recuperación</h4>
                  <p className="text-sm text-muted-foreground">
                    Mejora tu calidad de sueño para optimizar la recuperación y el rendimiento.
                    Actualmente estás en 7.2 horas/noche, objetivo 8 horas/noche.
                  </p>
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
        <h1 className="text-2xl font-bold">Análisis Avanzado</h1>
        <Button 
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          {isGenerating ? "Generando..." : "Generar informe"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={isMobile ? "order-2" : "md:col-span-1"}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Insights de IA</CardTitle>
              <CardDescription>
                Descubre insights personalizados basados en tus datos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 rounded-none border-b">
                  <TabsTrigger value="insights" className="rounded-none">
                    Insights
                  </TabsTrigger>
                  <TabsTrigger value="metrics" className="rounded-none">
                    Métricas
                  </TabsTrigger>
                  <TabsTrigger value="predictions" className="rounded-none">
                    Predicciones
                  </TabsTrigger>
                </TabsList>
                <div className="p-4">
                  <TabsContent value="insights" className="m-0">
                    <ScrollArea className="h-[500px] pr-4">
                      {renderInsightsList()}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="metrics" className="m-0">
                    <ScrollArea className="h-[500px] pr-4">
                      {renderMetrics()}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="predictions" className="m-0">
                    <ScrollArea className="h-[500px] pr-4">
                      {renderPredictions()}
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className={isMobile ? "order-1" : "md:col-span-2"}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Detalle</CardTitle>
              <CardDescription>
                Información detallada y recomendaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {renderInsightDetail()}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
