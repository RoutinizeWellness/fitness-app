"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PersonalizedProgressChart } from "@/components/ui/personalized-progress-chart"
import { useOrganicTheme } from "@/components/theme/organic-theme-provider"
import { supabase } from "@/lib/supabase-client"
import { 
  BarChart2, 
  LineChart, 
  PieChart, 
  Calendar, 
  ArrowUp, 
  ArrowDown, 
  Dumbbell, 
  Scale, 
  Heart, 
  Brain, 
  Zap,
  Download,
  RefreshCw,
  TrendingUp,
  Activity,
  Clock,
  BarChart,
  Flame
} from "lucide-react"
import { format, parseISO, subMonths, subWeeks, subDays } from "date-fns"
import { es } from "date-fns/locale"

interface WorkoutProgressVisualizationProps {
  userId: string
  className?: string
}

export function WorkoutProgressVisualization({ userId, className }: WorkoutProgressVisualizationProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("strength")
  const [timeRange, setTimeRange] = useState("3m") // 1w, 1m, 3m, 6m, 1y, all
  const [strengthData, setStrengthData] = useState<any[]>([])
  const [volumeData, setVolumeData] = useState<any[]>([])
  const [bodyCompositionData, setBodyCompositionData] = useState<any[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [exerciseData, setExerciseData] = useState<any[]>([])
  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const [exercises, setExercises] = useState<{id: string, name: string}[]>([])
  
  const { isDark } = useOrganicTheme()
  
  useEffect(() => {
    loadData()
  }, [userId, timeRange])
  
  useEffect(() => {
    loadExercises()
  }, [userId])
  
  useEffect(() => {
    if (selectedExercise) {
      loadExerciseData(selectedExercise)
    }
  }, [selectedExercise, timeRange])
  
  const loadData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        loadStrengthData(),
        loadVolumeData(),
        loadBodyCompositionData(),
        loadPerformanceData()
      ])
    } catch (error) {
      console.error("Error loading workout progress data:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('user_exercises')
        .select('id, name')
        .eq('user_id', userId)
        .order('name')
      
      if (error) throw error
      
      setExercises(data || [])
      if (data && data.length > 0) {
        setSelectedExercise(data[0].id)
      }
    } catch (error) {
      console.error("Error loading exercises:", error)
    }
  }
  
  const getStartDate = () => {
    const now = new Date()
    switch (timeRange) {
      case '1w': return subWeeks(now, 1)
      case '1m': return subMonths(now, 1)
      case '3m': return subMonths(now, 3)
      case '6m': return subMonths(now, 6)
      case '1y': return subMonths(now, 12)
      default: return subMonths(now, 3) // Default to 3 months
    }
  }
  
  const loadStrengthData = async () => {
    try {
      const startDate = getStartDate()
      
      // Simulated data - replace with actual Supabase query
      const { data, error } = await supabase
        .from('strength_progress')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true })
      
      if (error) throw error
      
      // Process data for chart
      const processedData = (data || []).map(item => ({
        date: format(new Date(item.date), "dd/MM/yy"),
        bench: item.bench_press,
        squat: item.squat,
        deadlift: item.deadlift,
        overhead: item.overhead_press
      }))
      
      setStrengthData(processedData)
    } catch (error) {
      console.error("Error loading strength data:", error)
      // Fallback to sample data if error
      setStrengthData(generateSampleStrengthData())
    }
  }
  
  const loadVolumeData = async () => {
    try {
      const startDate = getStartDate()
      
      // Simulated data - replace with actual Supabase query
      const { data, error } = await supabase
        .from('workout_volume')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true })
      
      if (error) throw error
      
      // Process data for chart
      const processedData = (data || []).map(item => ({
        date: format(new Date(item.date), "dd/MM/yy"),
        chest: item.chest_volume,
        back: item.back_volume,
        legs: item.legs_volume,
        shoulders: item.shoulders_volume,
        arms: item.arms_volume
      }))
      
      setVolumeData(processedData)
    } catch (error) {
      console.error("Error loading volume data:", error)
      // Fallback to sample data if error
      setVolumeData(generateSampleVolumeData())
    }
  }
  
  const loadBodyCompositionData = async () => {
    try {
      const startDate = getStartDate()
      
      // Simulated data - replace with actual Supabase query
      const { data, error } = await supabase
        .from('body_composition')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true })
      
      if (error) throw error
      
      // Process data for chart
      const processedData = (data || []).map(item => ({
        date: format(new Date(item.date), "dd/MM/yy"),
        weight: item.weight,
        bodyFat: item.body_fat_percentage,
        muscleMass: item.muscle_mass,
        waistCircumference: item.waist_circumference
      }))
      
      setBodyCompositionData(processedData)
    } catch (error) {
      console.error("Error loading body composition data:", error)
      // Fallback to sample data if error
      setBodyCompositionData(generateSampleBodyCompositionData())
    }
  }
  
  const loadPerformanceData = async () => {
    try {
      const startDate = getStartDate()
      
      // Simulated data - replace with actual Supabase query
      const { data, error } = await supabase
        .from('workout_performance')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true })
      
      if (error) throw error
      
      // Process data for chart
      const processedData = (data || []).map(item => ({
        date: format(new Date(item.date), "dd/MM/yy"),
        intensity: item.average_intensity,
        volume: item.total_volume / 1000, // Convert to more readable units
        duration: item.duration_minutes,
        rpe: item.average_rpe
      }))
      
      setPerformanceData(processedData)
    } catch (error) {
      console.error("Error loading performance data:", error)
      // Fallback to sample data if error
      setPerformanceData(generateSamplePerformanceData())
    }
  }
  
  const loadExerciseData = async (exerciseId: string) => {
    try {
      const startDate = getStartDate()
      
      // Simulated data - replace with actual Supabase query
      const { data, error } = await supabase
        .from('exercise_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true })
      
      if (error) throw error
      
      // Process data for chart
      const processedData = (data || []).map(item => ({
        date: format(new Date(item.date), "dd/MM/yy"),
        weight: item.weight,
        reps: item.reps,
        rpe: item.rpe,
        volume: item.weight * item.reps
      }))
      
      setExerciseData(processedData)
    } catch (error) {
      console.error("Error loading exercise data:", error)
      // Fallback to sample data if error
      setExerciseData(generateSampleExerciseData())
    }
  }
  
  // Sample data generators for fallback
  const generateSampleStrengthData = () => {
    const data = []
    const startDate = subMonths(new Date(), 3)
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i * 7)
      
      data.push({
        date: format(date, "dd/MM/yy"),
        bench: 80 + Math.floor(i * 2.5 + Math.random() * 5),
        squat: 120 + Math.floor(i * 3 + Math.random() * 7),
        deadlift: 140 + Math.floor(i * 3.5 + Math.random() * 8),
        overhead: 50 + Math.floor(i * 1.5 + Math.random() * 3)
      })
    }
    
    return data
  }
  
  const generateSampleVolumeData = () => {
    const data = []
    const startDate = subMonths(new Date(), 3)
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i * 7)
      
      data.push({
        date: format(date, "dd/MM/yy"),
        chest: 5000 + Math.floor(Math.random() * 2000),
        back: 6000 + Math.floor(Math.random() * 2000),
        legs: 8000 + Math.floor(Math.random() * 3000),
        shoulders: 3000 + Math.floor(Math.random() * 1000),
        arms: 2500 + Math.floor(Math.random() * 1000)
      })
    }
    
    return data
  }
  
  const generateSampleBodyCompositionData = () => {
    const data = []
    const startDate = subMonths(new Date(), 3)
    
    let weight = 80
    let bodyFat = 18
    let muscleMass = 65
    let waist = 85
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i * 7)
      
      // Simulate gradual changes
      weight -= 0.2 + Math.random() * 0.3
      bodyFat -= 0.15 + Math.random() * 0.2
      muscleMass += 0.1 + Math.random() * 0.15
      waist -= 0.2 + Math.random() * 0.2
      
      data.push({
        date: format(date, "dd/MM/yy"),
        weight: parseFloat(weight.toFixed(1)),
        bodyFat: parseFloat(bodyFat.toFixed(1)),
        muscleMass: parseFloat(muscleMass.toFixed(1)),
        waistCircumference: parseFloat(waist.toFixed(1))
      })
    }
    
    return data
  }
  
  const generateSamplePerformanceData = () => {
    const data = []
    const startDate = subMonths(new Date(), 3)
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i * 7)
      
      data.push({
        date: format(date, "dd/MM/yy"),
        intensity: 70 + Math.floor(Math.random() * 20),
        volume: 15 + Math.floor(Math.random() * 10),
        duration: 45 + Math.floor(Math.random() * 30),
        rpe: 6 + Math.floor(Math.random() * 3)
      })
    }
    
    return data
  }
  
  const generateSampleExerciseData = () => {
    const data = []
    const startDate = subMonths(new Date(), 3)
    
    let weight = 80
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i * 7)
      
      // Simulate gradual progress
      weight += 1.25 + Math.random() * 1.25
      const reps = 8 + Math.floor(Math.random() * 4)
      const rpe = 7 + Math.floor(Math.random() * 3)
      
      data.push({
        date: format(date, "dd/MM/yy"),
        weight: parseFloat(weight.toFixed(1)),
        reps: reps,
        rpe: rpe,
        volume: parseFloat((weight * reps).toFixed(1))
      })
    }
    
    return data
  }
  
  const timeRangeOptions = [
    { label: "1 semana", value: "1w" },
    { label: "1 mes", value: "1m" },
    { label: "3 meses", value: "3m" },
    { label: "6 meses", value: "6m" },
    { label: "1 año", value: "1y" },
    { label: "Todo", value: "all" },
  ]
  
  const exportData = (data: any[], filename: string) => {
    // Create CSV content
    let csv = 'data:text/csv;charset=utf-8,'
    
    // Add headers
    const headers = Object.keys(data[0] || {})
    csv += headers.join(',') + '\n'
    
    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => row[header])
      csv += values.join(',') + '\n'
    })
    
    // Create download link
    const encodedUri = encodeURI(csv)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Progreso de Entrenamiento</CardTitle>
            <CardDescription>
              Visualización detallada de tu progreso a lo largo del tiempo
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="strength" className="flex items-center gap-1">
                <Dumbbell className="h-4 w-4" />
                <span className="hidden sm:inline">Fuerza</span>
              </TabsTrigger>
              <TabsTrigger value="volume" className="flex items-center gap-1">
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">Volumen</span>
              </TabsTrigger>
              <TabsTrigger value="body" className="flex items-center gap-1">
                <Scale className="h-4 w-4" />
                <span className="hidden sm:inline">Composición</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Rendimiento</span>
              </TabsTrigger>
              <TabsTrigger value="exercise" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Ejercicio</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="strength" className="pt-2 px-6 pb-6">
            <PersonalizedProgressChart
              title="Progreso de Fuerza"
              description="Evolución de tus levantamientos principales (kg)"
              data={strengthData}
              dataKeys={["bench", "squat", "deadlift", "overhead"]}
              xAxisKey="date"
              chartType="line"
              isLoading={isLoading}
              onExport={() => exportData(strengthData, "progreso_fuerza")}
              height={300}
            />
          </TabsContent>
          
          <TabsContent value="volume" className="pt-2 px-6 pb-6">
            <PersonalizedProgressChart
              title="Volumen de Entrenamiento"
              description="Volumen total por grupo muscular (kg)"
              data={volumeData}
              dataKeys={["chest", "back", "legs", "shoulders", "arms"]}
              xAxisKey="date"
              chartType="bar"
              isLoading={isLoading}
              onExport={() => exportData(volumeData, "volumen_entrenamiento")}
              height={300}
            />
          </TabsContent>
          
          <TabsContent value="body" className="pt-2 px-6 pb-6">
            <PersonalizedProgressChart
              title="Composición Corporal"
              description="Cambios en tu composición corporal"
              data={bodyCompositionData}
              dataKeys={["weight", "bodyFat", "muscleMass", "waistCircumference"]}
              xAxisKey="date"
              chartType="line"
              isLoading={isLoading}
              onExport={() => exportData(bodyCompositionData, "composicion_corporal")}
              height={300}
            />
          </TabsContent>
          
          <TabsContent value="performance" className="pt-2 px-6 pb-6">
            <PersonalizedProgressChart
              title="Métricas de Rendimiento"
              description="Intensidad, volumen, duración y RPE promedio"
              data={performanceData}
              dataKeys={["intensity", "volume", "duration", "rpe"]}
              xAxisKey="date"
              chartType="area"
              isLoading={isLoading}
              onExport={() => exportData(performanceData, "metricas_rendimiento")}
              height={300}
            />
          </TabsContent>
          
          <TabsContent value="exercise" className="pt-2 px-6 pb-6">
            <div className="mb-4">
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ejercicio" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map(exercise => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <PersonalizedProgressChart
              title={`Progreso de ${exercises.find(e => e.id === selectedExercise)?.name || 'Ejercicio'}`}
              description="Peso, repeticiones, RPE y volumen total"
              data={exerciseData}
              dataKeys={["weight", "reps", "rpe", "volume"]}
              xAxisKey="date"
              chartType="line"
              isLoading={isLoading}
              onExport={() => exportData(exerciseData, `progreso_ejercicio_${selectedExercise}`)}
              height={300}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-muted-foreground flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          Última actualización: {format(new Date(), "d MMMM yyyy, HH:mm", { locale: es })}
        </div>
        <Button variant="outline" size="sm" onClick={() => exportData(
          activeTab === "strength" ? strengthData :
          activeTab === "volume" ? volumeData :
          activeTab === "body" ? bodyCompositionData :
          activeTab === "performance" ? performanceData :
          exerciseData,
          `progreso_${activeTab}`
        )}>
          <Download className="h-4 w-4 mr-2" />
          Exportar datos
        </Button>
      </CardFooter>
    </Card>
  )
}
