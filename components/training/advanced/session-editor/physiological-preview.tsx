"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, 
  Activity, 
  Heart, 
  Brain, 
  Dumbbell, 
  Clock, 
  Zap,
  Battery,
  Flame,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PeriodizedSession, PeriodizedExercise, SpecialTechnique } from "@/lib/types/advanced-periodization"

interface PhysiologicalPreviewProps {
  session: PeriodizedSession
  userFatigue?: number // 0-100
  userReadiness?: number // 0-100
}

// Tipos para el análisis fisiológico
interface PhysiologicalAnalysis {
  metabolicStress: number // 0-100
  mechanicalTension: number // 0-100
  energySystems: {
    atpPc: number // 0-100
    glycolytic: number // 0-100
    oxidative: number // 0-100
  }
  recoveryTime: {
    hours: number
    recommendation: string
  }
  fiberTypeEmphasis: {
    typeI: number // 0-100
    typeIIa: number // 0-100
    typeIIx: number // 0-100
  }
  fatigueRatio: {
    neural: number // 0-100
    metabolic: number // 0-100
  }
  recommendations: string[]
}

export function PhysiologicalPreview({ 
  session, 
  userFatigue = 50,
  userReadiness = 50
}: PhysiologicalPreviewProps) {
  const [analysis, setAnalysis] = useState<PhysiologicalAnalysis | null>(null)
  
  // Analizar sesión cuando cambia
  useEffect(() => {
    if (session) {
      const newAnalysis = analyzeSession(session, userFatigue, userReadiness)
      setAnalysis(newAnalysis)
    }
  }, [session, userFatigue, userReadiness])
  
  // Renderizar gráfico de barras
  const renderBarChart = (value: number, label: string, color: string = 'bg-primary') => {
    return (
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <span>{label}</span>
          <span className="font-medium">{value}%</span>
        </div>
        <Progress value={value} className={color} />
      </div>
    )
  }
  
  // Renderizar gráfico de distribución
  const renderDistributionChart = (
    values: { label: string, value: number, color: string }[]
  ) => {
    // Asegurar que los valores sumen 100
    const total = values.reduce((sum, item) => sum + item.value, 0)
    const normalizedValues = values.map(item => ({
      ...item,
      value: total > 0 ? (item.value / total) * 100 : 0
    }))
    
    return (
      <div className="space-y-2">
        <div className="flex h-6 w-full rounded-full overflow-hidden">
          {normalizedValues.map((item, index) => (
            <div 
              key={index}
              className={`${item.color}`}
              style={{ width: `${item.value}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {normalizedValues.map((item, index) => (
            <div key={index} className="flex items-center space-x-1">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-xs">{item.label} ({Math.round(item.value)}%)</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground animate-spin mb-2" />
          <p className="text-muted-foreground">Analizando sesión...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card3D>
          <Card3DHeader>
            <Card3DTitle>
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Estímulo Muscular</span>
              </div>
            </Card3DTitle>
          </Card3DHeader>
          <Card3DContent className="space-y-4">
            {renderBarChart(analysis.metabolicStress, "Estrés Metabólico", "bg-red-500")}
            {renderBarChart(analysis.mechanicalTension, "Tensión Mecánica", "bg-blue-500")}
            
            <Separator />
            
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Balance de Estímulo</span>
              </div>
              {renderDistributionChart([
                { label: "Tensión", value: analysis.mechanicalTension, color: "bg-blue-500" },
                { label: "Metabólico", value: analysis.metabolicStress, color: "bg-red-500" }
              ])}
            </div>
          </Card3DContent>
        </Card3D>
        
        <Card3D>
          <Card3DHeader>
            <Card3DTitle>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <span>Sistemas Energéticos</span>
              </div>
            </Card3DTitle>
          </Card3DHeader>
          <Card3DContent className="space-y-4">
            {renderBarChart(analysis.energySystems.atpPc, "ATP-PC (Potencia)", "bg-purple-500")}
            {renderBarChart(analysis.energySystems.glycolytic, "Glucolítico (Anaeróbico)", "bg-yellow-500")}
            {renderBarChart(analysis.energySystems.oxidative, "Oxidativo (Aeróbico)", "bg-green-500")}
            
            <Separator />
            
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Distribución Energética</span>
              </div>
              {renderDistributionChart([
                { label: "ATP-PC", value: analysis.energySystems.atpPc, color: "bg-purple-500" },
                { label: "Glucolítico", value: analysis.energySystems.glycolytic, color: "bg-yellow-500" },
                { label: "Oxidativo", value: analysis.energySystems.oxidative, color: "bg-green-500" }
              ])}
            </div>
          </Card3DContent>
        </Card3D>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card3D>
          <Card3DHeader>
            <Card3DTitle>
              <div className="flex items-center space-x-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <span>Impacto Muscular</span>
              </div>
            </Card3DTitle>
          </Card3DHeader>
          <Card3DContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Énfasis en Tipos de Fibra</span>
              </div>
              {renderDistributionChart([
                { label: "Tipo I (Lentas)", value: analysis.fiberTypeEmphasis.typeI, color: "bg-green-500" },
                { label: "Tipo IIa (Intermedias)", value: analysis.fiberTypeEmphasis.typeIIa, color: "bg-blue-500" },
                { label: "Tipo IIx (Rápidas)", value: analysis.fiberTypeEmphasis.typeIIx, color: "bg-purple-500" }
              ])}
            </div>
            
            <Separator />
            
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Tipo de Fatiga</span>
              </div>
              {renderDistributionChart([
                { label: "Neural", value: analysis.fatigueRatio.neural, color: "bg-amber-500" },
                { label: "Metabólica", value: analysis.fatigueRatio.metabolic, color: "bg-red-500" }
              ])}
            </div>
          </Card3DContent>
        </Card3D>
        
        <Card3D>
          <Card3DHeader>
            <Card3DTitle>
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                <span>Recuperación</span>
              </div>
            </Card3DTitle>
          </Card3DHeader>
          <Card3DContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
                <div className="text-center">
                  <span className="text-xl font-bold">{analysis.recoveryTime.hours}</span>
                  <span className="text-xs block">horas</span>
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium">Tiempo de Recuperación Estimado</h4>
                <p className="text-sm text-muted-foreground">{analysis.recoveryTime.recommendation}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <Lightbulb className="h-4 w-4 mr-1 text-yellow-500" />
                Recomendaciones
              </h4>
              
              <ul className="space-y-1">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <ArrowRight className="h-4 w-4 mr-1 mt-0.5 text-primary flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card3DContent>
        </Card3D>
      </div>
      
      {userFatigue > 70 && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Advertencia de Fatiga</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Tu nivel de fatiga actual es alto ({userFatigue}%). Considera reducir la intensidad o volumen de esta sesión, 
              o programarla para otro día cuando tu nivel de recuperación sea mejor.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Función para analizar la sesión y generar el análisis fisiológico
function analyzeSession(
  session: PeriodizedSession, 
  userFatigue: number,
  userReadiness: number
): PhysiologicalAnalysis {
  // Valores predeterminados
  let metabolicStress = 50
  let mechanicalTension = 50
  let atpPc = 30
  let glycolytic = 40
  let oxidative = 30
  let typeI = 30
  let typeIIa = 40
  let typeIIx = 30
  let neural = 50
  let metabolic = 50
  let recoveryHours = 24
  
  // Analizar ejercicios
  if (session.exercises && session.exercises.length > 0) {
    // Calcular volumen total (series * repeticiones)
    const totalVolume = session.exercises.reduce((sum, ex) => {
      const reps = parseInt(ex.reps.split('-')[0]) || 0
      return sum + (ex.sets * reps)
    }, 0)
    
    // Calcular intensidad promedio
    const avgIntensity = session.exercises.reduce((sum, ex) => {
      const rir = ex.rir || 0
      return sum + (10 - rir)
    }, 0) / session.exercises.length
    
    // Calcular tiempo de descanso promedio
    const avgRest = session.exercises.reduce((sum, ex) => {
      return sum + (ex.rest_seconds || 60)
    }, 0) / session.exercises.length
    
    // Ajustar valores basados en el análisis
    
    // Estrés metabólico vs tensión mecánica
    if (avgRest < 45) {
      metabolicStress = 80
      mechanicalTension = 40
    } else if (avgRest > 120) {
      metabolicStress = 30
      mechanicalTension = 80
    }
    
    // Sistemas energéticos
    if (avgRest < 30) {
      glycolytic = 70
      atpPc = 20
      oxidative = 10
    } else if (avgRest < 90) {
      glycolytic = 50
      atpPc = 40
      oxidative = 10
    } else {
      atpPc = 60
      glycolytic = 30
      oxidative = 10
    }
    
    // Tipos de fibra
    if (avgIntensity > 8) {
      typeIIx = 60
      typeIIa = 30
      typeI = 10
    } else if (avgIntensity > 6) {
      typeIIa = 60
      typeIIx = 25
      typeI = 15
    } else {
      typeI = 50
      typeIIa = 40
      typeIIx = 10
    }
    
    // Tipo de fatiga
    if (avgIntensity > 8 && avgRest > 120) {
      neural = 70
      metabolic = 30
    } else if (avgRest < 60) {
      metabolic = 70
      neural = 30
    }
    
    // Tiempo de recuperación
    if (totalVolume > 150) {
      recoveryHours = 48
    } else if (avgIntensity > 8) {
      recoveryHours = 36
    } else {
      recoveryHours = 24
    }
    
    // Ajustar basado en técnicas especiales
    if (session.special_techniques && session.special_techniques.length > 0) {
      session.special_techniques.forEach(technique => {
        if (!technique.parameters) return
        
        switch (technique.parameters.type) {
          case 'rest_pause':
          case 'drop_set':
          case 'myo_reps':
            metabolicStress += 15
            recoveryHours += 12
            metabolic += 10
            break
          case 'cluster_set':
            atpPc += 15
            neural += 10
            break
          case 'superset':
          case 'giant_set':
            metabolicStress += 20
            glycolytic += 15
            recoveryHours += 8
            break
        }
      })
      
      // Normalizar valores para que no excedan 100
      metabolicStress = Math.min(100, metabolicStress)
      mechanicalTension = Math.min(100, mechanicalTension)
      atpPc = Math.min(100, atpPc)
      glycolytic = Math.min(100, glycolytic)
      oxidative = Math.min(100, oxidative)
      neural = Math.min(100, neural)
      metabolic = Math.min(100, metabolic)
    }
  }
  
  // Ajustar basado en fatiga y preparación del usuario
  if (userFatigue > 70) {
    recoveryHours += 12
  }
  
  if (userReadiness < 30) {
    recoveryHours += 8
  }
  
  // Generar recomendaciones
  const recommendations: string[] = []
  
  if (metabolicStress > 70) {
    recommendations.push("Asegúrate de estar bien hidratado y tener suficientes carbohidratos disponibles para esta sesión de alto estrés metabólico.")
  }
  
  if (mechanicalTension > 70) {
    recommendations.push("Realiza un calentamiento exhaustivo para preparar las articulaciones y tendones para el alto nivel de tensión mecánica.")
  }
  
  if (neural > 70) {
    recommendations.push("Considera programar un día completo de descanso después de esta sesión para recuperar el sistema nervioso central.")
  }
  
  if (recoveryHours > 36) {
    recommendations.push("Prioriza el sueño y la nutrición post-entrenamiento para optimizar la recuperación de esta sesión exigente.")
  }
  
  if (userFatigue > 70) {
    recommendations.push("Tu nivel de fatiga es alto. Considera reducir el volumen o intensidad en un 20% para esta sesión.")
  }
  
  if (userReadiness < 30) {
    recommendations.push("Tu nivel de preparación es bajo. Enfócate en ejercicios compuestos básicos y evita técnicas avanzadas en esta sesión.")
  }
  
  // Recomendación de recuperación
  let recoveryRecommendation = ""
  if (recoveryHours <= 24) {
    recoveryRecommendation = "Puedes entrenar el mismo grupo muscular después de 24 horas si es necesario."
  } else if (recoveryHours <= 36) {
    recoveryRecommendation = "Espera al menos 36 horas antes de volver a entrenar los mismos grupos musculares."
  } else {
    recoveryRecommendation = "Se recomienda un mínimo de 48 horas de recuperación antes de volver a entrenar estos grupos musculares."
  }
  
  return {
    metabolicStress,
    mechanicalTension,
    energySystems: {
      atpPc,
      glycolytic,
      oxidative
    },
    recoveryTime: {
      hours: recoveryHours,
      recommendation: recoveryRecommendation
    },
    fiberTypeEmphasis: {
      typeI,
      typeIIa,
      typeIIx
    },
    fatigueRatio: {
      neural,
      metabolic
    },
    recommendations
  }
}
