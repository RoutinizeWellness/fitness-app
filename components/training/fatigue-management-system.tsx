"use client"

import { useState, useEffect } from "react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Battery, 
  BatteryCharging, 
  BatteryWarning,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  Dumbbell,
  Brain,
  RefreshCw,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts"

interface FatigueManagementSystemProps {
  userId?: string
}

export function FatigueManagementSystem({
  userId
}: FatigueManagementSystemProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [globalFatigue, setGlobalFatigue] = useState(65)
  const [muscleGroupFatigue, setMuscleGroupFatigue] = useState({
    chest: 72,
    back: 58,
    legs: 80,
    shoulders: 45,
    arms: 62
  })
  const [recoveryRate, setRecoveryRate] = useState(8) // % per day
  const [fatigueThreshold, setFatigueThreshold] = useState(85)
  const [recommendedDeload, setRecommendedDeload] = useState(false)
  
  // Simulate fatigue calculation
  useEffect(() => {
    // Check if any muscle group is above threshold
    const needsDeload = Object.values(muscleGroupFatigue).some(fatigue => fatigue > fatigueThreshold)
    setRecommendedDeload(needsDeload)
  }, [muscleGroupFatigue, fatigueThreshold])
  
  // Get fatigue color based on level
  const getFatigueColor = (fatigue: number) => {
    if (fatigue < 40) return "bg-green-500"
    if (fatigue < 70) return "bg-yellow-500"
    return "bg-red-500"
  }
  
  // Get fatigue status text
  const getFatigueStatus = (fatigue: number) => {
    if (fatigue < 40) return "Baja"
    if (fatigue < 70) return "Moderada"
    return "Alta"
  }
  
  // Get fatigue icon
  const getFatigueIcon = (fatigue: number) => {
    if (fatigue < 40) return <BatteryCharging className="h-5 w-5 text-green-500" />
    if (fatigue < 70) return <Battery className="h-5 w-5 text-yellow-500" />
    return <BatteryWarning className="h-5 w-5 text-red-500" />
  }
  
  // Prepare data for radar chart
  const radarData = [
    { subject: 'Pecho', A: muscleGroupFatigue.chest, fullMark: 100 },
    { subject: 'Espalda', A: muscleGroupFatigue.back, fullMark: 100 },
    { subject: 'Piernas', A: muscleGroupFatigue.legs, fullMark: 100 },
    { subject: 'Hombros', A: muscleGroupFatigue.shoulders, fullMark: 100 },
    { subject: 'Brazos', A: muscleGroupFatigue.arms, fullMark: 100 },
  ]
  
  // Prepare data for pie chart
  const pieData = [
    { name: 'Fatiga', value: globalFatigue, color: getFatigueColor(globalFatigue).replace('bg-', 'text-') },
    { name: 'Recuperación', value: 100 - globalFatigue, color: 'text-gray-200' },
  ]
  
  // Generate weight adjustment recommendations based on fatigue
  const getWeightAdjustments = () => {
    const adjustments: {group: string, adjustment: number, reason: string}[] = []
    
    Object.entries(muscleGroupFatigue).forEach(([group, fatigue]) => {
      let adjustment = 0
      let reason = ""
      
      if (fatigue > 80) {
        adjustment = -10
        reason = "Fatiga extremadamente alta"
      } else if (fatigue > 70) {
        adjustment = -5
        reason = "Fatiga alta"
      } else if (fatigue < 30) {
        adjustment = +5
        reason = "Fatiga muy baja, posible subentrenamiento"
      }
      
      if (adjustment !== 0) {
        adjustments.push({
          group: group === 'chest' ? 'Pecho' :
                 group === 'back' ? 'Espalda' :
                 group === 'legs' ? 'Piernas' :
                 group === 'shoulders' ? 'Hombros' : 'Brazos',
          adjustment,
          reason
        })
      }
    })
    
    return adjustments
  }
  
  return (
    <Card3D>
      <Card3DHeader>
        <Card3DTitle gradient={true}>Sistema de Gestión de Fatiga</Card3DTitle>
      </Card3DHeader>
      <Card3DContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Visión General</TabsTrigger>
            <TabsTrigger value="muscle-groups">Grupos Musculares</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Fatiga Global</h3>
                <p className="text-sm text-muted-foreground">
                  Nivel de fatiga acumulada en todo el sistema
                </p>
              </div>
              {getFatigueIcon(globalFatigue)}
            </div>
            
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color.replace('text-', '#')} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <span className="text-3xl font-bold">{globalFatigue}%</span>
                <Badge className={`ml-2 ${getFatigueColor(globalFatigue).replace('bg-', 'bg-')}`}>
                  {getFatigueStatus(globalFatigue)}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm">Recuperación diaria: <span className="font-medium">{recoveryRate}%</span></p>
                <p className="text-sm">Umbral de alerta: <span className="font-medium">{fatigueThreshold}%</span></p>
              </div>
            </div>
            
            {recommendedDeload && (
              <div className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 p-3 rounded-md flex items-start mt-4">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Semana de descarga recomendada</p>
                  <p className="text-sm">La fatiga acumulada ha superado el umbral recomendado. Considera programar una semana de descarga para facilitar la recuperación.</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="muscle-groups" className="space-y-4">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Fatiga"
                    dataKey="A"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3 mt-4">
              {Object.entries(muscleGroupFatigue).map(([group, fatigue]) => (
                <div key={group} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {group === 'chest' ? 'Pecho' :
                       group === 'back' ? 'Espalda' :
                       group === 'legs' ? 'Piernas' :
                       group === 'shoulders' ? 'Hombros' : 'Brazos'}
                    </span>
                    <span className="text-sm font-medium">{fatigue}%</span>
                  </div>
                  <Progress3D value={fatigue} max={100} className={`h-2 ${getFatigueColor(fatigue)}`} />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start">
                <Zap className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium">Ajustes de Carga Recomendados</h3>
                  <p className="text-sm text-muted-foreground">
                    Basados en tu nivel actual de fatiga por grupo muscular
                  </p>
                </div>
              </div>
              
              {getWeightAdjustments().length > 0 ? (
                <div className="space-y-3 mt-2">
                  {getWeightAdjustments().map((adjustment, index) => (
                    <div key={index} className="bg-muted p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{adjustment.group}</span>
                        <Badge className={adjustment.adjustment > 0 ? "bg-green-500" : "bg-red-500"}>
                          {adjustment.adjustment > 0 ? "+" : ""}{adjustment.adjustment}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{adjustment.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 p-3 rounded-md flex items-start mt-2">
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Niveles de fatiga óptimos</p>
                    <p className="text-sm">Todos los grupos musculares están dentro de los rangos recomendados de fatiga. No se requieren ajustes en este momento.</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start mt-6">
                <RefreshCw className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium">Estrategia de Descarga</h3>
                  <p className="text-sm text-muted-foreground">
                    Recomendaciones para tu próxima semana de descarga
                  </p>
                </div>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium">Próxima descarga recomendada:</h4>
                <p className="text-sm mt-1">
                  {recommendedDeload ? (
                    <span className="text-red-500 font-medium">Inmediatamente (fatiga crítica)</span>
                  ) : (
                    <span>En 2 semanas</span>
                  )}
                </p>
                
                <h4 className="font-medium mt-3">Tipo de descarga recomendado:</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <p className="text-sm font-medium">Volumen</p>
                    <p className="text-xs text-muted-foreground">Reducir 40% el volumen total</p>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-md">
                    <p className="text-sm font-medium">Intensidad</p>
                    <p className="text-xs text-muted-foreground">Mantener 80-85% de la intensidad</p>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-md">
                    <p className="text-sm font-medium">Frecuencia</p>
                    <p className="text-xs text-muted-foreground">Reducir a 3-4 días/semana</p>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-md">
                    <p className="text-sm font-medium">Enfoque</p>
                    <p className="text-xs text-muted-foreground">Priorizar piernas y pecho</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card3DContent>
    </Card3D>
  )
}
