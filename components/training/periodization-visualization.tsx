"use client"

import { useState, useEffect } from "react"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from "recharts"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Progress3D } from "@/components/ui/progress-3d"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  TrendingUp, 
  Download, 
  Share2, 
  ChevronRight,
  ChevronLeft,
  Filter,
  RefreshCw,
  FileText,
  BarChart3,
  Dumbbell,
  Zap,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon
} from "lucide-react"
import { format, addWeeks, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { 
  MesoCycle, 
  MicroCycle, 
  TrainingPhase, 
  TrainingGoal 
} from "@/lib/enhanced-periodization"
import { WorkoutLog } from "@/lib/types/training"

interface PeriodizationVisualizationProps {
  mesoCycle?: MesoCycle
  workoutLogs?: WorkoutLog[]
  userId?: string
}

export function PeriodizationVisualization({
  mesoCycle,
  workoutLogs = [],
  userId
}: PeriodizationVisualizationProps) {
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("line")
  const [metricType, setMetricType] = useState<"volume" | "intensity" | "fatigue">("volume")
  
  // Generate sample data if no mesoCycle is provided
  const getMesoCycleData = () => {
    if (mesoCycle) return mesoCycle
    
    // Sample mesocycle for demonstration
    return {
      id: "sample-mesocycle",
      name: "Mesociclo de Hipertrofia",
      duration: 6, // 6 weeks
      microCycles: [
        {
          id: "micro-1",
          name: "Semana 1 - Adaptación",
          weekNumber: 1,
          volume: "moderate",
          intensity: "low",
          frequency: 4,
          isDeload: false
        },
        {
          id: "micro-2",
          name: "Semana 2 - Acumulación",
          weekNumber: 2,
          volume: "high",
          intensity: "moderate",
          frequency: 5,
          isDeload: false
        },
        {
          id: "micro-3",
          name: "Semana 3 - Intensificación",
          weekNumber: 3,
          volume: "high",
          intensity: "high",
          frequency: 5,
          isDeload: false
        },
        {
          id: "micro-4",
          name: "Semana 4 - Sobrecarga",
          weekNumber: 4,
          volume: "very_high",
          intensity: "high",
          frequency: 5,
          isDeload: false
        },
        {
          id: "micro-5",
          name: "Semana 5 - Intensificación",
          weekNumber: 5,
          volume: "high",
          intensity: "very_high",
          frequency: 5,
          isDeload: false
        },
        {
          id: "micro-6",
          name: "Semana 6 - Descarga",
          weekNumber: 6,
          volume: "low",
          intensity: "moderate",
          frequency: 3,
          isDeload: true
        }
      ],
      phase: "hypertrophy",
      goal: "hypertrophy",
      volumeProgression: "wave",
      intensityProgression: "ascending",
      includesDeload: true,
      deloadStrategy: {
        type: "volume",
        volumeReduction: 50,
        intensityReduction: 20,
        frequencyReduction: 2,
        duration: 7,
        timing: "fixed"
      }
    } as MesoCycle
  }
  
  // Get the mesocycle data
  const cycleData = getMesoCycleData()
  
  // Convert volume and intensity to numeric values
  const getVolumeValue = (volume: string): number => {
    switch (volume) {
      case "very_low": return 20
      case "low": return 40
      case "moderate": return 60
      case "high": return 80
      case "very_high": return 100
      default: return 60
    }
  }
  
  const getIntensityValue = (intensity: string): number => {
    switch (intensity) {
      case "very_low": return 20
      case "low": return 40
      case "moderate": return 60
      case "high": return 80
      case "very_high": return 100
      default: return 60
    }
  }
  
  // Generate data for the periodization chart
  const getPeriodizationData = () => {
    return cycleData.microCycles.map(micro => ({
      name: `Semana ${micro.weekNumber}`,
      volume: getVolumeValue(micro.volume),
      intensity: getIntensityValue(micro.intensity),
      frequency: micro.frequency,
      isDeload: micro.isDeload
    }))
  }
  
  // Generate data for workout logs if available
  const getWorkoutLogData = () => {
    if (!workoutLogs || workoutLogs.length === 0) {
      // Generate sample data if no logs available
      return cycleData.microCycles.map(micro => {
        const baseVolume = getVolumeValue(micro.volume)
        const baseIntensity = getIntensityValue(micro.intensity)
        
        return {
          name: `Semana ${micro.weekNumber}`,
          volume: baseVolume * (0.9 + Math.random() * 0.2), // Random variation
          intensity: baseIntensity * (0.9 + Math.random() * 0.2),
          fatigue: micro.isDeload ? 30 + Math.random() * 20 : 60 + Math.random() * 30,
          isDeload: micro.isDeload
        }
      })
    }
    
    // Process actual workout logs
    const logsByWeek: Record<number, WorkoutLog[]> = {}
    
    // Group logs by week
    workoutLogs.forEach(log => {
      const logDate = parseISO(log.date)
      const weekNumber = Math.ceil((logDate.getTime() - parseISO(cycleData.microCycles[0].id).getTime()) / (7 * 24 * 60 * 60 * 1000))
      
      if (weekNumber > 0 && weekNumber <= cycleData.duration) {
        if (!logsByWeek[weekNumber]) {
          logsByWeek[weekNumber] = []
        }
        logsByWeek[weekNumber].push(log)
      }
    })
    
    // Calculate metrics for each week
    return cycleData.microCycles.map(micro => {
      const weekLogs = logsByWeek[micro.weekNumber] || []
      
      // Calculate total volume (sets * reps * weight)
      let totalVolume = 0
      let totalIntensity = 0
      let totalFatigue = 0
      
      weekLogs.forEach(log => {
        // Calculate volume
        log.completedSets.forEach(set => {
          if (set.completedReps && set.completedWeight) {
            totalVolume += set.completedReps * set.completedWeight
          }
        })
        
        // Calculate average intensity (% of 1RM or RPE)
        // This is a simplified calculation
        totalIntensity += log.completedSets.reduce((sum, set) => {
          if (set.completedRir !== undefined) {
            // Convert RIR to RPE (RPE = 10 - RIR)
            return sum + (10 - set.completedRir)
          }
          return sum
        }, 0) / (log.completedSets.length || 1)
        
        // Get fatigue
        totalFatigue += log.overallFatigue
      })
      
      // Average values if there are logs
      const avgIntensity = weekLogs.length > 0 ? totalIntensity / weekLogs.length : getIntensityValue(micro.intensity)
      const avgFatigue = weekLogs.length > 0 ? totalFatigue / weekLogs.length : 5
      
      return {
        name: `Semana ${micro.weekNumber}`,
        volume: weekLogs.length > 0 ? totalVolume : getVolumeValue(micro.volume) * 100,
        intensity: avgIntensity * 10, // Scale to 0-100
        fatigue: avgFatigue * 10, // Scale to 0-100
        isDeload: micro.isDeload
      }
    })
  }
  
  // Get the appropriate data based on available information
  const chartData = workoutLogs.length > 0 ? getWorkoutLogData() : getPeriodizationData()
  
  // Get phase color
  const getPhaseColor = (phase: TrainingPhase): string => {
    switch (phase) {
      case "anatomical_adaptation": return "#60a5fa" // blue-400
      case "hypertrophy": return "#34d399" // emerald-400
      case "strength": return "#f87171" // red-400
      case "power": return "#a78bfa" // violet-400
      case "deload": return "#fbbf24" // amber-400
      case "maintenance": return "#94a3b8" // slate-400
      case "metabolic": return "#fb923c" // orange-400
      default: return "#60a5fa" // blue-400
    }
  }
  
  // Get goal label
  const getGoalLabel = (goal: TrainingGoal): string => {
    switch (goal) {
      case "strength": return "Fuerza"
      case "hypertrophy": return "Hipertrofia"
      case "endurance": return "Resistencia"
      case "power": return "Potencia"
      case "weight_loss": return "Pérdida de peso"
      case "general_fitness": return "Fitness general"
      default: return "Hipertrofia"
    }
  }
  
  // Get phase label
  const getPhaseLabel = (phase: TrainingPhase): string => {
    switch (phase) {
      case "anatomical_adaptation": return "Adaptación Anatómica"
      case "hypertrophy": return "Hipertrofia"
      case "strength": return "Fuerza"
      case "power": return "Potencia"
      case "deload": return "Descarga"
      case "maintenance": return "Mantenimiento"
      case "metabolic": return "Metabólico"
      default: return "Hipertrofia"
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header with mesocycle info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{cycleData.name}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {getPhaseLabel(cycleData.phase)}
            </Badge>
            <Badge className="bg-secondary/10 text-secondary border-secondary/20">
              {getGoalLabel(cycleData.goal)}
            </Badge>
            <Badge className="bg-muted text-muted-foreground">
              {cycleData.duration} semanas
            </Badge>
            {cycleData.includesDeload && (
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                Incluye descarga
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button3D
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
          >
            <LineChartIcon className="h-4 w-4 mr-2" />
            Líneas
          </Button3D>
          <Button3D
            variant={chartType === 'area' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('area')}
          >
            <AreaChartIcon className="h-4 w-4 mr-2" />
            Área
          </Button3D>
          <Button3D
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Barras
          </Button3D>
        </div>
      </div>
      
      {/* Periodization visualization */}
      <Card3D>
        <Card3DHeader>
          <Card3DTitle gradient={true}>Visualización de Periodización</Card3DTitle>
          <div className="flex items-center space-x-2">
            <Button3D
              variant={metricType === 'volume' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMetricType('volume')}
            >
              Volumen
            </Button3D>
            <Button3D
              variant={metricType === 'intensity' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMetricType('intensity')}
            >
              Intensidad
            </Button3D>
            <Button3D
              variant={metricType === 'fatigue' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMetricType('fatigue')}
            >
              Fatiga
            </Button3D>
          </div>
        </Card3DHeader>
        <Card3DContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {metricType === 'volume' && (
                    <Line 
                      type="monotone" 
                      dataKey="volume" 
                      name="Volumen" 
                      stroke="#3b82f6" 
                      activeDot={{ r: 8 }} 
                    />
                  )}
                  {metricType === 'intensity' && (
                    <Line 
                      type="monotone" 
                      dataKey="intensity" 
                      name="Intensidad" 
                      stroke="#ef4444" 
                      activeDot={{ r: 8 }} 
                    />
                  )}
                  {metricType === 'fatigue' && (
                    <Line 
                      type="monotone" 
                      dataKey="fatigue" 
                      name="Fatiga" 
                      stroke="#f59e0b" 
                      activeDot={{ r: 8 }} 
                    />
                  )}
                  {chartData.map((data, index) => (
                    data.isDeload && (
                      <ReferenceLine 
                        key={`deload-${index}`}
                        x={data.name} 
                        stroke="#f59e0b" 
                        strokeDasharray="3 3"
                        label={{ value: 'Deload', position: 'top' }} 
                      />
                    )
                  ))}
                </LineChart>
              ) : chartType === 'area' ? (
                <AreaChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {metricType === 'volume' && (
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      name="Volumen" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                    />
                  )}
                  {metricType === 'intensity' && (
                    <Area 
                      type="monotone" 
                      dataKey="intensity" 
                      name="Intensidad" 
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.3}
                    />
                  )}
                  {metricType === 'fatigue' && (
                    <Area 
                      type="monotone" 
                      dataKey="fatigue" 
                      name="Fatiga" 
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.3}
                    />
                  )}
                  {chartData.map((data, index) => (
                    data.isDeload && (
                      <ReferenceLine 
                        key={`deload-${index}`}
                        x={data.name} 
                        stroke="#f59e0b" 
                        strokeDasharray="3 3"
                        label={{ value: 'Deload', position: 'top' }} 
                      />
                    )
                  ))}
                </AreaChart>
              ) : (
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {metricType === 'volume' && (
                    <Bar 
                      dataKey="volume" 
                      name="Volumen" 
                      fill="#3b82f6" 
                    />
                  )}
                  {metricType === 'intensity' && (
                    <Bar 
                      dataKey="intensity" 
                      name="Intensidad" 
                      fill="#ef4444" 
                    />
                  )}
                  {metricType === 'fatigue' && (
                    <Bar 
                      dataKey="fatigue" 
                      name="Fatiga" 
                      fill="#f59e0b" 
                    />
                  )}
                  {chartData.map((data, index) => (
                    data.isDeload && (
                      <ReferenceLine 
                        key={`deload-${index}`}
                        x={data.name} 
                        stroke="#f59e0b" 
                        strokeDasharray="3 3"
                        label={{ value: 'Deload', position: 'top' }} 
                      />
                    )
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card3DContent>
      </Card3D>
    </div>
  )
}
