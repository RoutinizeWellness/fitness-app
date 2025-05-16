"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { ProgressTracking, ProgressMetric } from "@/lib/adaptive-learning-service"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts"
import { 
  BarChart2, 
  LineChart as LineChartIcon, 
  PieChart, 
  Calendar, 
  ArrowUp, 
  ArrowDown, 
  Dumbbell, 
  Scale, 
  Heart, 
  Brain, 
  Zap,
  Download
} from "lucide-react"
import { format, parseISO, subMonths } from "date-fns"
import { es } from "date-fns/locale"

interface ClientProgressVisualizationProps {
  clientId: string
}

export function ClientProgressVisualization({ clientId }: ClientProgressVisualizationProps) {
  const [progressData, setProgressData] = useState<ProgressTracking | null>(null)
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([])
  const [bodyCompositionData, setBodyCompositionData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("strength")
  const [timeRange, setTimeRange] = useState("3m") // 1m, 3m, 6m, 1y, all
  const [chartType, setChartType] = useState("line")
  
  const { toast } = useToast()
  
  useEffect(() => {
    loadProgressData()
    loadWorkoutLogs()
    loadBodyCompositionData()
  }, [clientId, timeRange])
  
  const loadProgressData = async () => {
    setIsLoading(true)
    try {
      // Obtener datos de progreso
      const { data, error } = await supabase
        .from('progress_tracking')
        .select('*')
        .eq('user_id', clientId)
        .single()
      
      if (error) {
        // Si no hay datos, crear estructura vacía
        setProgressData({
          userId: clientId,
          metrics: {
            strength: [],
            hypertrophy: [],
            endurance: [],
            bodyComposition: [],
            nutrition: [],
            recovery: []
          },
          lastUpdated: new Date().toISOString()
        })
      } else {
        // Transformar datos al formato esperado
        setProgressData({
          userId: data.user_id,
          metrics: {
            strength: data.metrics.strength || [],
            hypertrophy: data.metrics.hypertrophy || [],
            endurance: data.metrics.endurance || [],
            bodyComposition: data.metrics.body_composition || [],
            nutrition: data.metrics.nutrition || [],
            recovery: data.metrics.recovery || []
          },
          lastUpdated: data.last_updated
        })
      }
    } catch (error) {
      console.error("Error al cargar datos de progreso:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de progreso",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadWorkoutLogs = async () => {
    try {
      // Determinar fecha de inicio según el rango seleccionado
      const startDate = getStartDateForRange(timeRange)
      
      // Obtener registros de entrenamiento
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', clientId)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true })
      
      if (error) throw error
      
      setWorkoutLogs(data || [])
    } catch (error) {
      console.error("Error al cargar registros de entrenamiento:", error)
    }
  }
  
  const loadBodyCompositionData = async () => {
    try {
      // Determinar fecha de inicio según el rango seleccionado
      const startDate = getStartDateForRange(timeRange)
      
      // Obtener datos de composición corporal
      const { data, error } = await supabase
        .from('body_composition')
        .select('*')
        .eq('user_id', clientId)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true })
      
      if (error) throw error
      
      setBodyCompositionData(data || [])
    } catch (error) {
      console.error("Error al cargar datos de composición corporal:", error)
    }
  }
  
  const getStartDateForRange = (range: string): Date => {
    const now = new Date()
    
    switch (range) {
      case '1m':
        return subMonths(now, 1)
      case '3m':
        return subMonths(now, 3)
      case '6m':
        return subMonths(now, 6)
      case '1y':
        return subMonths(now, 12)
      case 'all':
      default:
        return new Date(0) // Fecha muy antigua para obtener todos los datos
    }
  }
  
  const getMetricsForTab = (): ProgressMetric[] => {
    if (!progressData) return []
    
    // Filtrar por fecha según el rango seleccionado
    const startDate = getStartDateForRange(timeRange)
    
    switch (activeTab) {
      case 'strength':
        return progressData.metrics.strength.filter(m => new Date(m.date) >= startDate)
      case 'hypertrophy':
        return progressData.metrics.hypertrophy.filter(m => new Date(m.date) >= startDate)
      case 'endurance':
        return progressData.metrics.endurance.filter(m => new Date(m.date) >= startDate)
      case 'bodyComposition':
        return progressData.metrics.bodyComposition.filter(m => new Date(m.date) >= startDate)
      case 'nutrition':
        return progressData.metrics.nutrition.filter(m => new Date(m.date) >= startDate)
      case 'recovery':
        return progressData.metrics.recovery.filter(m => new Date(m.date) >= startDate)
      default:
        return []
    }
  }
  
  const getChartData = () => {
    const metrics = getMetricsForTab()
    
    // Agrupar por nombre de métrica
    const metricsByName: Record<string, ProgressMetric[]> = {}
    
    metrics.forEach(metric => {
      if (!metricsByName[metric.name]) {
        metricsByName[metric.name] = []
      }
      metricsByName[metric.name].push(metric)
    })
    
    // Convertir a formato para gráfico
    const chartData: any[] = []
    
    // Para cada fecha única
    const allDates = [...new Set(metrics.map(m => m.date))].sort()
    
    allDates.forEach(date => {
      const dataPoint: any = {
        date: format(new Date(date), "dd/MM/yy")
      }
      
      // Añadir valor para cada métrica en esta fecha
      Object.entries(metricsByName).forEach(([name, metricsForName]) => {
        const metricForDate = metricsForName.find(m => m.date === date)
        if (metricForDate) {
          dataPoint[name] = metricForDate.value
        }
      })
      
      chartData.push(dataPoint)
    })
    
    return chartData
  }
  
  const getWorkoutPerformanceData = () => {
    // Calcular rendimiento promedio por semana
    const weeklyPerformance: Record<string, { 
      totalVolume: number, 
      totalSets: number,
      avgIntensity: number,
      workoutCount: number
    }> = {}
    
    workoutLogs.forEach(log => {
      const date = new Date(log.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = format(weekStart, "yyyy-MM-dd")
      
      if (!weeklyPerformance[weekKey]) {
        weeklyPerformance[weekKey] = {
          totalVolume: 0,
          totalSets: 0,
          avgIntensity: 0,
          workoutCount: 0
        }
      }
      
      // Calcular volumen total (peso * reps * sets)
      let workoutVolume = 0
      let workoutSets = 0
      let totalRPE = 0
      let rpeCount = 0
      
      if (log.completed_sets && Array.isArray(log.completed_sets)) {
        log.completed_sets.forEach((set: any) => {
          workoutVolume += (set.weight || 0) * (set.reps || 0)
          workoutSets++
          
          if (set.completed_rpe) {
            totalRPE += set.completed_rpe
            rpeCount++
          }
        })
      }
      
      weeklyPerformance[weekKey].totalVolume += workoutVolume
      weeklyPerformance[weekKey].totalSets += workoutSets
      weeklyPerformance[weekKey].avgIntensity += rpeCount > 0 ? totalRPE / rpeCount : 0
      weeklyPerformance[weekKey].workoutCount++
    })
    
    // Convertir a formato para gráfico
    return Object.entries(weeklyPerformance).map(([week, data]) => ({
      week: format(new Date(week), "dd/MM"),
      volume: data.totalVolume,
      sets: data.totalSets,
      intensity: data.avgIntensity / data.workoutCount,
      workouts: data.workoutCount
    }))
  }
  
  const getBodyCompositionChartData = () => {
    return bodyCompositionData.map(entry => ({
      date: format(new Date(entry.date), "dd/MM/yy"),
      weight: entry.weight,
      bodyFat: entry.body_fat_percentage,
      muscleMass: entry.muscle_mass,
      waistCircumference: entry.waist_circumference
    }))
  }
  
  const getTabTitle = () => {
    switch (activeTab) {
      case 'strength': return "Fuerza"
      case 'hypertrophy': return "Hipertrofia"
      case 'endurance': return "Resistencia"
      case 'bodyComposition': return "Composición Corporal"
      case 'nutrition': return "Nutrición"
      case 'recovery': return "Recuperación"
      default: return ""
    }
  }
  
  const getTabIcon = () => {
    switch (activeTab) {
      case 'strength': return <Dumbbell className="h-5 w-5 text-purple-500" />
      case 'hypertrophy': return <Zap className="h-5 w-5 text-blue-500" />
      case 'endurance': return <Heart className="h-5 w-5 text-red-500" />
      case 'bodyComposition': return <Scale className="h-5 w-5 text-green-500" />
      case 'nutrition': return <PieChart className="h-5 w-5 text-yellow-500" />
      case 'recovery': return <Brain className="h-5 w-5 text-indigo-500" />
      default: return <BarChart2 className="h-5 w-5" />
    }
  }
  
  const getChartColors = () => {
    switch (activeTab) {
      case 'strength': return ['#8b5cf6', '#6d28d9', '#4c1d95']
      case 'hypertrophy': return ['#3b82f6', '#2563eb', '#1d4ed8']
      case 'endurance': return ['#ef4444', '#dc2626', '#b91c1c']
      case 'bodyComposition': return ['#10b981', '#059669', '#047857']
      case 'nutrition': return ['#f59e0b', '#d97706', '#b45309']
      case 'recovery': return ['#6366f1', '#4f46e5', '#4338ca']
      default: return ['#6b7280', '#4b5563', '#374151']
    }
  }
  
  const exportData = () => {
    try {
      const metrics = getMetricsForTab()
      const chartData = getChartData()
      
      // Crear CSV
      let csv = 'Fecha,'
      
      // Encabezados
      const metricNames = [...new Set(metrics.map(m => m.name))]
      csv += metricNames.join(',') + '\n'
      
      // Datos
      chartData.forEach(dataPoint => {
        csv += dataPoint.date + ','
        metricNames.forEach(name => {
          csv += (dataPoint[name] !== undefined ? dataPoint[name] : '') + ','
        })
        csv += '\n'
      })
      
      // Descargar
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `progreso_${activeTab}_${timeRange}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Datos exportados",
        description: "Los datos se han exportado correctamente",
        variant: "default"
      })
    } catch (error) {
      console.error("Error al exportar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos",
        variant: "destructive"
      })
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getTabIcon()}
            <div>
              <CardTitle>Visualización de Progreso - {getTabTitle()}</CardTitle>
              <CardDescription>
                Seguimiento de métricas de rendimiento y progreso
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1 mes</SelectItem>
                <SelectItem value="3m">3 meses</SelectItem>
                <SelectItem value="6m">6 meses</SelectItem>
                <SelectItem value="1y">1 año</SelectItem>
                <SelectItem value="all">Todo</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Tipo de gráfico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Líneas</SelectItem>
                <SelectItem value="bar">Barras</SelectItem>
                <SelectItem value="radar">Radar</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={exportData}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid grid-cols-6">
            <TabsTrigger value="strength">Fuerza</TabsTrigger>
            <TabsTrigger value="hypertrophy">Hipertrofia</TabsTrigger>
            <TabsTrigger value="endurance">Resistencia</TabsTrigger>
            <TabsTrigger value="bodyComposition">Composición</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrición</TabsTrigger>
            <TabsTrigger value="recovery">Recuperación</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-80">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={activeTab === 'bodyComposition' ? getBodyCompositionChartData() : getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(activeTab === 'bodyComposition' ? getBodyCompositionChartData()[0] || {} : getChartData()[0] || {})
                      .filter(key => key !== 'date')
                      .map((key, index) => (
                        <Line 
                          key={key} 
                          type="monotone" 
                          dataKey={key} 
                          stroke={getChartColors()[index % getChartColors().length]} 
                          activeDot={{ r: 8 }} 
                        />
                      ))}
                  </LineChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={activeTab === 'bodyComposition' ? getBodyCompositionChartData() : getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(activeTab === 'bodyComposition' ? getBodyCompositionChartData()[0] || {} : getChartData()[0] || {})
                      .filter(key => key !== 'date')
                      .map((key, index) => (
                        <Bar 
                          key={key} 
                          dataKey={key} 
                          fill={getChartColors()[index % getChartColors().length]} 
                        />
                      ))}
                  </BarChart>
                ) : (
                  <RadarChart data={activeTab === 'bodyComposition' ? getBodyCompositionChartData() : getChartData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="date" />
                    <PolarRadiusAxis />
                    {Object.keys(activeTab === 'bodyComposition' ? getBodyCompositionChartData()[0] || {} : getChartData()[0] || {})
                      .filter(key => key !== 'date')
                      .map((key, index) => (
                        <Radar 
                          key={key} 
                          name={key} 
                          dataKey={key} 
                          stroke={getChartColors()[index % getChartColors().length]} 
                          fill={getChartColors()[index % getChartColors().length]} 
                          fillOpacity={0.6} 
                        />
                      ))}
                    <Legend />
                  </RadarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Tabs>
      
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-gray-500">
          <Calendar className="h-4 w-4 inline mr-1" />
          Última actualización: {progressData ? format(new Date(progressData.lastUpdated), "d MMMM yyyy, HH:mm", { locale: es }) : "N/A"}
        </div>
        <Button variant="ghost" size="sm" onClick={loadProgressData}>
          <BarChart2 className="h-4 w-4 mr-2" />
          Actualizar datos
        </Button>
      </CardFooter>
    </Card>
  )
}
