"use client"

import { useState, useEffect } from 'react'
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Battery, 
  BatteryCharging, 
  BatteryWarning, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Dumbbell, 
  Info, 
  LineChart, 
  Loader2, 
  RefreshCw, 
  Zap 
} from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { generateDeloadRecommendation, DeloadRecommendation, calculateFatigueMetrics, FatigueMetrics } from "@/lib/deload-algorithm"
import { useToast } from "@/components/ui/use-toast"

interface DeloadRecommendationComponentProps {
  userId: string
  onApplyDeload?: (recommendation: DeloadRecommendation) => void
}

export function DeloadRecommendationComponent({ 
  userId,
  onApplyDeload 
}: DeloadRecommendationComponentProps) {
  const [recommendation, setRecommendation] = useState<DeloadRecommendation | null>(null)
  const [fatigueMetrics, setFatigueMetrics] = useState<FatigueMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const { toast } = useToast()

  useEffect(() => {
    async function loadRecommendation() {
      if (!userId) return
      
      try {
        setLoading(true)
        
        // Cargar métricas de fatiga
        const metrics = await calculateFatigueMetrics(userId)
        setFatigueMetrics(metrics)
        
        // Generar recomendación de deload
        const deloadRec = await generateDeloadRecommendation(userId)
        setRecommendation(deloadRec)
      } catch (error) {
        console.error('Error al cargar recomendación de deload:', error)
        toast({
          title: 'Error',
          description: 'No se pudo cargar la recomendación de deload',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadRecommendation()
  }, [userId, toast])
  
  const handleRefresh = async () => {
    try {
      setLoading(true)
      
      // Cargar métricas de fatiga
      const metrics = await calculateFatigueMetrics(userId)
      setFatigueMetrics(metrics)
      
      // Generar recomendación de deload
      const deloadRec = await generateDeloadRecommendation(userId)
      setRecommendation(deloadRec)
      
      toast({
        title: 'Actualizado',
        description: 'Recomendación de deload actualizada correctamente',
      })
    } catch (error) {
      console.error('Error al actualizar recomendación de deload:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la recomendación de deload',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleApplyDeload = () => {
    if (recommendation && onApplyDeload) {
      onApplyDeload(recommendation)
    }
  }
  
  // Renderizar estado de carga
  if (loading) {
    return (
      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Análisis de Fatiga</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Analizando datos de entrenamiento...</span>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  // Si no hay recomendación de deload
  if (!recommendation || !fatigueMetrics) {
    return (
      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Análisis de Fatiga</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="text-center py-6">
            <BatteryCharging className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <h3 className="text-lg font-medium mb-2">No se necesita deload</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tus niveles de fatiga y recuperación están en rangos óptimos.
              Continúa con tu plan de entrenamiento actual.
            </p>
            <Button3D onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar análisis
            </Button3D>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  // Determinar color según urgencia
  const urgencyColor = {
    'low': 'bg-green-100 text-green-800 border-green-200',
    'moderate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'high': 'bg-orange-100 text-orange-800 border-orange-200',
    'critical': 'bg-red-100 text-red-800 border-red-200'
  }[recommendation.urgency]
  
  // Determinar icono según tipo de deload
  const deloadTypeIcon = {
    'volume': <Dumbbell className="h-4 w-4" />,
    'intensity': <Zap className="h-4 w-4" />,
    'frequency': <Calendar className="h-4 w-4" />,
    'complete': <BatteryCharging className="h-4 w-4" />,
    'active_recovery': <RefreshCw className="h-4 w-4" />
  }[recommendation.type]
  
  // Determinar texto según tipo de deload
  const deloadTypeText = {
    'volume': 'Reducción de volumen',
    'intensity': 'Reducción de intensidad',
    'frequency': 'Reducción de frecuencia',
    'complete': 'Descanso completo',
    'active_recovery': 'Recuperación activa'
  }[recommendation.type]
  
  return (
    <Card3D className="overflow-hidden">
      <Card3DHeader className="flex justify-between items-center">
        <div className="flex items-center">
          <Card3DTitle>Recomendación de Deload</Card3DTitle>
          <Badge className={`ml-2 ${urgencyColor}`}>
            {recommendation.urgency === 'low' ? 'Baja' :
             recommendation.urgency === 'moderate' ? 'Moderada' :
             recommendation.urgency === 'high' ? 'Alta' : 'Crítica'}
          </Badge>
        </div>
        <Button3D
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button3D>
      </Card3DHeader>
      
      <Card3DContent>
        <div className="space-y-4">
          {/* Resumen de la recomendación */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {deloadTypeIcon}
              <span className="ml-2 font-medium">{deloadTypeText}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{recommendation.duration} días</span>
            </div>
          </div>
          
          {/* Alerta de recomendación */}
          <Alert>
            <BatteryWarning className="h-4 w-4" />
            <AlertTitle>Se recomienda un periodo de deload</AlertTitle>
            <AlertDescription>
              Basado en tus datos de entrenamiento y fatiga, es recomendable realizar un periodo de deload 
              para optimizar tu recuperación y rendimiento.
            </AlertDescription>
          </Alert>
          
          {/* Métricas de fatiga */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Fatiga general</span>
                <span className="text-sm">{fatigueMetrics.overallFatigue.toFixed(0)}%</span>
              </div>
              <Progress3D 
                value={fatigueMetrics.overallFatigue} 
                max={100} 
                className="h-2"
                colorClass={fatigueMetrics.overallFatigue > 70 ? 'bg-red-500' : 
                           fatigueMetrics.overallFatigue > 50 ? 'bg-yellow-500' : 'bg-green-500'}
              />
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Rendimiento</span>
                <span className="text-sm">-{recommendation.expectedPerformanceImprovement}%</span>
              </div>
              <Progress3D 
                value={recommendation.expectedPerformanceImprovement} 
                max={20} 
                className="h-2"
                colorClass="bg-red-500"
              />
            </div>
          </div>
          
          {expanded && (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="overview">Resumen</TabsTrigger>
                  <TabsTrigger value="details">Detalles</TabsTrigger>
                  <TabsTrigger value="muscles">Músculos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Razones para el deload:</h4>
                    <ul className="text-sm space-y-1">
                      {recommendation.reasoning.map((reason, index) => (
                        <li key={index} className="flex items-start">
                          <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Actividades recomendadas:</h4>
                    <ul className="text-sm space-y-1">
                      {recommendation.suggestedActivities.map((activity, index) => (
                        <li key={index} className="flex items-start">
                          <Dumbbell className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Reducción de volumen</span>
                        <span className="text-sm">{recommendation.volumeReduction}%</span>
                      </div>
                      <Progress3D 
                        value={recommendation.volumeReduction} 
                        max={100} 
                        className="h-2"
                        colorClass="bg-blue-500"
                      />
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Reducción de intensidad</span>
                        <span className="text-sm">{recommendation.intensityReduction}%</span>
                      </div>
                      <Progress3D 
                        value={recommendation.intensityReduction} 
                        max={100} 
                        className="h-2"
                        colorClass="bg-purple-500"
                      />
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Reducción de frecuencia</span>
                        <span className="text-sm">{recommendation.frequencyReduction}%</span>
                      </div>
                      <Progress3D 
                        value={recommendation.frequencyReduction} 
                        max={100} 
                        className="h-2"
                        colorClass="bg-green-500"
                      />
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Tiempo de recuperación</span>
                        <span className="text-sm">{recommendation.expectedRecoveryTime} días</span>
                      </div>
                      <Progress3D 
                        value={recommendation.expectedRecoveryTime} 
                        max={14} 
                        className="h-2"
                        colorClass="bg-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Métricas adicionales:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>RPE promedio:</span>
                        <span className="font-medium">{fatigueMetrics.rpeAverage.toFixed(1)}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>RIR promedio:</span>
                        <span className="font-medium">{fatigueMetrics.rirAverage.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Calidad de sueño:</span>
                        <span className="font-medium">{fatigueMetrics.sleepQuality.toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nivel de estrés:</span>
                        <span className="font-medium">{fatigueMetrics.stressLevel.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="muscles" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Grupos musculares más fatigados:</h4>
                    <div className="space-y-3">
                      {Object.entries(fatigueMetrics.muscleGroupFatigue)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([group, fatigue]) => (
                          <div key={group} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm capitalize">{group}</span>
                              <span className="text-sm">{fatigue.toFixed(0)}%</span>
                            </div>
                            <Progress3D 
                              value={fatigue} 
                              max={100} 
                              className="h-2"
                              colorClass={
                                fatigue > 80 ? 'bg-red-500' : 
                                fatigue > 60 ? 'bg-orange-500' : 
                                fatigue > 40 ? 'bg-yellow-500' : 'bg-green-500'
                              }
                            />
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Grupos musculares a priorizar en el deload:</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.targetMuscleGroups.map(group => (
                        <Badge key={group} variant="outline" className="capitalize">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
          
          <div className="flex justify-between pt-2">
            <Button3D
              variant="outline"
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button3D>
            
            <Button3D
              onClick={handleApplyDeload}
              disabled={!onApplyDeload}
            >
              <BatteryCharging className="h-4 w-4 mr-2" />
              Aplicar Deload
            </Button3D>
          </div>
        </div>
      </Card3DContent>
    </Card3D>
  )
}
