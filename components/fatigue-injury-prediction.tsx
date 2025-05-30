"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertTriangle,
  Activity,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Zap,
  Heart,
  ArrowRight,
  Info,
  Dumbbell,
  Calendar
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/lib/auth/auth-context"
import { getUserFatigue } from "@/lib/adaptive-learning-service"
import { isReadyToTrain } from "@/lib/wearable-integration"

interface FatigueData {
  currentFatigue: number // 0-100
  fatigueLevel: 'low' | 'moderate' | 'high' | 'extreme'
  muscleGroupFatigue: {
    [key: string]: number // 0-100
  }
  trend: 'increasing' | 'decreasing' | 'stable'
  readyToTrain: boolean
  recoveryScore: number // 0-100
  recommendations: string[]
}

interface InjuryRiskData {
  overallRisk: number // 0-100
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme'
  riskFactors: {
    factor: string
    contribution: number // 0-100
    description: string
  }[]
  recommendations: string[]
}

export default function FatigueInjuryPrediction() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [fatigueData, setFatigueData] = useState<FatigueData | null>(null)
  const [injuryRiskData, setInjuryRiskData] = useState<InjuryRiskData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load fatigue and injury risk data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        // Load fatigue data from the API
        const { data: fatigueResponse, error: fatigueError } = await getUserFatigue(user.id)

        if (fatigueError) {
          console.error("Error loading fatigue data:", fatigueError)
          throw fatigueError
        }

        // Load ready to train data
        const { data: readyToTrainData, error: readyError } = await isReadyToTrain(user.id)

        if (readyError) {
          console.error("Error loading ready to train data:", readyError)
          throw readyError
        }

        // Process fatigue data
        if (fatigueResponse) {
          const fatigue: FatigueData = {
            currentFatigue: fatigueResponse.currentFatigue,
            fatigueLevel: getFatigueLevel(fatigueResponse.currentFatigue),
            muscleGroupFatigue: fatigueResponse.muscleGroupFatigue || {
              "chest": Math.random() * 100,
              "back": Math.random() * 100,
              "legs": Math.random() * 100,
              "shoulders": Math.random() * 100,
              "arms": Math.random() * 100,
              "core": Math.random() * 100
            },
            trend: fatigueResponse.trend || (Math.random() > 0.5 ? 'increasing' : 'decreasing'),
            readyToTrain: readyToTrainData?.ready || false,
            recoveryScore: readyToTrainData?.recovery_score || 0,
            recommendations: readyToTrainData?.recommendations || []
          }

          setFatigueData(fatigue)

          // Generate injury risk data based on fatigue
          generateInjuryRiskData(fatigue)
        } else {
          // Generate sample data if no data is available
          generateSampleData()
        }
      } catch (error) {
        console.error("Error loading fatigue and injury risk data:", error)
        // Generate sample data in case of error
        generateSampleData()
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  // Get fatigue level based on fatigue value
  const getFatigueLevel = (fatigue: number): 'low' | 'moderate' | 'high' | 'extreme' => {
    if (fatigue < 30) return 'low'
    if (fatigue < 60) return 'moderate'
    if (fatigue < 85) return 'high'
    return 'extreme'
  }

  // Generate injury risk data based on fatigue
  const generateInjuryRiskData = (fatigue: FatigueData) => {
    // Calculate overall risk based on fatigue and other factors
    const baseRisk = fatigue.currentFatigue * 0.7 // 70% contribution from fatigue
    const randomFactor = Math.random() * 20 // Random factor for variation
    const overallRisk = Math.min(100, Math.max(0, baseRisk + randomFactor - 10))

    // Determine risk level
    let riskLevel: 'low' | 'moderate' | 'high' | 'extreme'
    if (overallRisk < 30) riskLevel = 'low'
    else if (overallRisk < 60) riskLevel = 'moderate'
    else if (overallRisk < 85) riskLevel = 'high'
    else riskLevel = 'extreme'

    // Generate risk factors
    const riskFactors = []

    // Add fatigue as a risk factor
    riskFactors.push({
      factor: "Fatiga acumulada",
      contribution: fatigue.currentFatigue,
      description: "La fatiga acumulada aumenta el riesgo de lesiones debido a la disminución de la coordinación y la fuerza."
    })

    // Add muscle imbalance as a risk factor if there's high variation in muscle group fatigue
    const muscleValues = Object.values(fatigue.muscleGroupFatigue)
    const maxFatigue = Math.max(...muscleValues)
    const minFatigue = Math.min(...muscleValues)

    if (maxFatigue - minFatigue > 30) {
      riskFactors.push({
        factor: "Desequilibrio muscular",
        contribution: Math.min(100, (maxFatigue - minFatigue) * 1.5),
        description: "Grandes diferencias en la fatiga entre grupos musculares pueden llevar a compensaciones y aumentar el riesgo de lesiones."
      })
    }

    // Add recovery as a risk factor if recovery score is low
    if (fatigue.recoveryScore < 70) {
      riskFactors.push({
        factor: "Recuperación insuficiente",
        contribution: 100 - fatigue.recoveryScore,
        description: "Una recuperación inadecuada entre sesiones de entrenamiento aumenta significativamente el riesgo de lesiones."
      })
    }

    // Add random risk factors
    const possibleFactors = [
      {
        factor: "Técnica de ejercicio",
        description: "Problemas en la técnica de ejercicio detectados en sesiones recientes."
      },
      {
        factor: "Historial de lesiones",
        description: "Lesiones previas aumentan el riesgo de recurrencia, especialmente bajo fatiga."
      },
      {
        factor: "Intensidad de entrenamiento",
        description: "Entrenamientos de alta intensidad sin suficiente recuperación aumentan el riesgo."
      },
      {
        factor: "Estrés psicológico",
        description: "Niveles elevados de estrés pueden contribuir a lesiones por tensión muscular y falta de concentración."
      }
    ]

    // Add 1-2 random factors
    const numRandomFactors = Math.floor(Math.random() * 2) + 1
    for (let i = 0; i < numRandomFactors; i++) {
      const randomIndex = Math.floor(Math.random() * possibleFactors.length)
      const factor = possibleFactors[randomIndex]

      riskFactors.push({
        factor: factor.factor,
        contribution: Math.floor(Math.random() * 50) + 30, // 30-80
        description: factor.description
      })

      // Remove the factor to avoid duplicates
      possibleFactors.splice(randomIndex, 1)

      if (possibleFactors.length === 0) break
    }

    // Generate recommendations based on risk level
    const recommendations = []

    if (riskLevel === 'high' || riskLevel === 'extreme') {
      recommendations.push("Considera tomar 1-2 días de descanso completo para recuperarte.")
      recommendations.push("Reduce la intensidad de tus entrenamientos en un 40-50% durante la próxima semana.")
    }

    if (riskLevel === 'moderate') {
      recommendations.push("Reduce la intensidad de tus entrenamientos en un 20-30% durante los próximos días.")
      recommendations.push("Enfócate en ejercicios de movilidad y recuperación activa.")
    }

    recommendations.push("Prioriza el sueño y la nutrición para optimizar la recuperación.")

    // Add specific recommendations based on risk factors
    for (const factor of riskFactors) {
      if (factor.factor === "Desequilibrio muscular") {
        recommendations.push("Trabaja en equilibrar tu entrenamiento entre grupos musculares antagonistas.")
      }

      if (factor.factor === "Técnica de ejercicio") {
        recommendations.push("Considera una sesión con un entrenador para revisar tu técnica en ejercicios clave.")
      }

      if (factor.factor === "Estrés psicológico") {
        recommendations.push("Incorpora técnicas de reducción de estrés como meditación o respiración profunda.")
      }
    }

    setInjuryRiskData({
      overallRisk,
      riskLevel,
      riskFactors,
      recommendations
    })
  }

  // Generate sample data for development/testing
  const generateSampleData = () => {
    // Generate sample fatigue data
    const fatigue: FatigueData = {
      currentFatigue: Math.floor(Math.random() * 100),
      fatigueLevel: 'moderate',
      muscleGroupFatigue: {
        "chest": Math.floor(Math.random() * 100),
        "back": Math.floor(Math.random() * 100),
        "legs": Math.floor(Math.random() * 100),
        "shoulders": Math.floor(Math.random() * 100),
        "arms": Math.floor(Math.random() * 100),
        "core": Math.floor(Math.random() * 100)
      },
      trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
      readyToTrain: Math.random() > 0.3,
      recoveryScore: Math.floor(Math.random() * 100),
      recommendations: [
        "Reduce la intensidad de tu próximo entrenamiento",
        "Enfócate en ejercicios de recuperación activa",
        "Asegúrate de dormir al menos 8 horas esta noche"
      ]
    }

    fatigue.fatigueLevel = getFatigueLevel(fatigue.currentFatigue)

    setFatigueData(fatigue)

    // Generate injury risk data based on fatigue
    generateInjuryRiskData(fatigue)
  }

  // Refresh data
  const handleRefresh = async () => {
    if (!user) return

    setIsRefreshing(true)

    try {
      // In a real implementation, this would call the API again
      // For now, we'll just generate new sample data
      generateSampleData()

      toast({
        title: "Datos actualizados",
        description: "Los datos de fatiga y riesgo de lesión se han actualizado.",
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Predicción de Fatiga y Riesgo de Lesión</h2>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Predicción de Fatiga y Riesgo de Lesión</h2>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fatigue Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center">
                  <Battery className="h-5 w-5 mr-2 text-primary" />
                  Estado de Fatiga
                </CardTitle>
                <CardDescription>
                  Análisis de tu nivel actual de fatiga y recuperación
                </CardDescription>
              </div>

              {fatigueData && (
                <Badge variant={
                  fatigueData.readyToTrain ? "success" : "destructive"
                }>
                  {fatigueData.readyToTrain ? "Listo para entrenar" : "Necesita recuperación"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            {fatigueData && (
              <>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <span className="font-medium">Fatiga General</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 ml-1 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              La fatiga general representa tu nivel de cansancio acumulado basado en tus entrenamientos recientes, patrones de sueño y otros factores.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">{fatigueData.currentFatigue}%</span>
                      {fatigueData.trend === 'increasing' && (
                        <TrendingUp className="h-4 w-4 ml-1 text-red-500" />
                      )}
                      {fatigueData.trend === 'decreasing' && (
                        <TrendingDown className="h-4 w-4 ml-1 text-green-500" />
                      )}
                    </div>
                  </div>
                  <Progress
                    value={fatigueData.currentFatigue}
                    className="h-2"
                    indicatorClassName={
                      fatigueData.fatigueLevel === 'low' ? "bg-green-500" :
                      fatigueData.fatigueLevel === 'moderate' ? "bg-yellow-500" :
                      fatigueData.fatigueLevel === 'high' ? "bg-orange-500" :
                      "bg-red-500"
                    }
                  />
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Puntuación de Recuperación</span>
                    <span className="font-medium">{fatigueData.recoveryScore}%</span>
                  </div>
                  <Progress
                    value={fatigueData.recoveryScore}
                    className="h-2"
                    indicatorClassName="bg-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Fatiga por Grupo Muscular</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(fatigueData.muscleGroupFatigue).map(([muscle, value]) => (
                      <div key={muscle} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="capitalize">{muscle}</span>
                          <span>{Math.round(value)}%</span>
                        </div>
                        <Progress
                          value={value}
                          className="h-1"
                          indicatorClassName={
                            value < 30 ? "bg-green-500" :
                            value < 60 ? "bg-yellow-500" :
                            value < 85 ? "bg-orange-500" :
                            "bg-red-500"
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Ver detalles de fatiga
            </Button>
          </CardFooter>
        </Card>

        {/* Injury Risk Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                  Riesgo de Lesión
                </CardTitle>
                <CardDescription>
                  Análisis predictivo de tu riesgo actual de lesión
                </CardDescription>
              </div>

              {injuryRiskData && (
                <Badge variant={
                  injuryRiskData.riskLevel === 'low' ? "outline" :
                  injuryRiskData.riskLevel === 'moderate' ? "default" :
                  injuryRiskData.riskLevel === 'high' ? "warning" :
                  "destructive"
                }>
                  Riesgo {
                    injuryRiskData.riskLevel === 'low' ? "Bajo" :
                    injuryRiskData.riskLevel === 'moderate' ? "Moderado" :
                    injuryRiskData.riskLevel === 'high' ? "Alto" :
                    "Extremo"
                  }
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            {injuryRiskData && (
              <>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Riesgo General</span>
                    <span className="font-medium">{Math.round(injuryRiskData.overallRisk)}%</span>
                  </div>
                  <Progress
                    value={injuryRiskData.overallRisk}
                    className="h-2"
                    indicatorClassName={
                      injuryRiskData.riskLevel === 'low' ? "bg-green-500" :
                      injuryRiskData.riskLevel === 'moderate' ? "bg-yellow-500" :
                      injuryRiskData.riskLevel === 'high' ? "bg-orange-500" :
                      "bg-red-500"
                    }
                  />
                </div>

                <div className="space-y-2 mb-4">
                  <h4 className="font-medium">Factores de Riesgo Principales</h4>
                  <div className="space-y-3">
                    {injuryRiskData.riskFactors.slice(0, 3).map((factor, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{factor.factor}</span>
                          <span>{Math.round(factor.contribution)}%</span>
                        </div>
                        <Progress
                          value={factor.contribution}
                          className="h-1"
                          indicatorClassName={
                            factor.contribution < 30 ? "bg-green-500" :
                            factor.contribution < 60 ? "bg-yellow-500" :
                            factor.contribution < 85 ? "bg-orange-500" :
                            "bg-red-500"
                          }
                        />
                        <p className="text-xs text-gray-500">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Recomendaciones</h4>
                  <ul className="text-sm space-y-1">
                    {injuryRiskData.recommendations.slice(0, 2).map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <ArrowRight className="h-4 w-4 mr-1 mt-0.5 text-primary" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Ver plan de prevención
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
