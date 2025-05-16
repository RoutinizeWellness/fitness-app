"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
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
  PieChart,
  Pie,
  Cell
} from "recharts"
import {
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Utensils,
  Moon,
  Brain,
  Activity,
  Scale,
  Heart,
  TrendingUp
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { format, subDays, subMonths, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from "date-fns"
import { es } from "date-fns/locale"

// Tipos de datos
interface ProgressData {
  date: string;
  value: number;
  category?: string;
}

interface BodyMeasurement {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  created_at: string;
}

interface WorkoutSummary {
  date: string;
  duration: number;
  calories_burned: number;
  exercises_completed: number;
  volume: number;
}

interface NutritionSummary {
  date: string;
  calories_consumed: number;
  protein: number;
  carbs: number;
  fat: number;
  adherence_score: number;
}

interface SleepSummary {
  date: string;
  duration: number;
  quality: number;
  deep_sleep: number;
  rem_sleep: number;
}

export default function ProgressPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("week")
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([])
  const [workoutData, setWorkoutData] = useState<WorkoutSummary[]>([])
  const [nutritionData, setNutritionData] = useState<NutritionSummary[]>([])
  const [sleepData, setSleepData] = useState<SleepSummary[]>([])
  const { toast } = useToast()

  // Colores para gráficos
  const COLORS = {
    primary: "#0ea5e9",
    secondary: "#f97316",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    purple: "#8b5cf6",
    pink: "#ec4899",
    blue: "#3b82f6",
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
    gray: "#6b7280"
  }

  // Cargar datos
  useEffect(() => {
    const fetchProgressData = async () => {
      setIsLoading(true)
      try {
        // Obtener usuario actual
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new Error("Usuario no autenticado")
        }

        // Calcular rango de fechas
        let startDate = new Date()
        let endDate = new Date()

        if (timeRange === "week") {
          startDate = subDays(new Date(), 7)
        } else if (timeRange === "month") {
          startDate = subMonths(new Date(), 1)
        } else if (timeRange === "3months") {
          startDate = subMonths(new Date(), 3)
        } else if (timeRange === "year") {
          startDate = subMonths(new Date(), 12)
        }

        // Formatear fechas para consultas
        const startDateStr = startDate.toISOString()
        const endDateStr = endDate.toISOString()

        // Obtener medidas corporales
        const { data: measurementsData, error: measurementsError } = await supabase
          .from('body_measurements')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', startDateStr)
          .lte('date', endDateStr)
          .order('date', { ascending: true })

        if (measurementsError) throw measurementsError
        setBodyMeasurements(measurementsData || [])

        // Obtener datos de entrenamiento
        try {
          const { data: workoutLogsData, error: workoutLogsError } = await supabase
            .from('workout_tracking')
            .select('date, duration, calories_burned, exercises_completed, volume')
            .eq('user_id', user.id)
            .gte('date', startDateStr)
            .lte('date', endDateStr)
            .order('date', { ascending: true })

          if (workoutLogsError) {
            console.warn("Error fetching workout tracking data:", workoutLogsError);
          } else {
            setWorkoutData(workoutLogsData || []);
          }
        } catch (error) {
          console.warn("Error in workout tracking query:", error);
          // Continuamos sin error fatal
        }

        // Obtener datos de nutrición
        const { data: nutritionLogsData, error: nutritionLogsError } = await supabase
          .from('nutrition_logs')
          .select('date, calories_consumed, protein, carbs, fat, adherence_score')
          .eq('user_id', user.id)
          .gte('date', startDateStr)
          .lte('date', endDateStr)
          .order('date', { ascending: true })

        if (nutritionLogsError) throw nutritionLogsError
        setNutritionData(nutritionLogsData || [])

        // Obtener datos de sueño
        const { data: sleepLogsData, error: sleepLogsError } = await supabase
          .from('sleep_logs')
          .select('date, duration, quality, deep_sleep, rem_sleep')
          .eq('user_id', user.id)
          .gte('date', startDateStr)
          .lte('date', endDateStr)
          .order('date', { ascending: true })

        if (sleepLogsError) throw sleepLogsError
        setSleepData(sleepLogsData || [])

      } catch (error) {
        console.error("Error fetching progress data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de progreso.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgressData()
  }, [timeRange, toast])

  // Generar datos de ejemplo si no hay datos reales
  useEffect(() => {
    if (!isLoading && bodyMeasurements.length === 0) {
      // Generar datos de ejemplo para medidas corporales
      const sampleBodyMeasurements: BodyMeasurement[] = []
      const startDate = subDays(new Date(), 30)

      for (let i = 0; i < 5; i++) {
        const date = addDays(startDate, i * 7).toISOString()
        sampleBodyMeasurements.push({
          id: `sample-${i}`,
          user_id: "sample",
          date,
          weight: 75 - (i * 0.5),
          body_fat_percentage: 18 - (i * 0.3),
          muscle_mass: 30 + (i * 0.2),
          chest: 95,
          waist: 80 - (i * 0.5),
          hips: 90,
          arms: 35 + (i * 0.1),
          thighs: 55,
          created_at: date
        })
      }

      setBodyMeasurements(sampleBodyMeasurements)
    }

    if (!isLoading && workoutData.length === 0) {
      // Generar datos de ejemplo para entrenamientos
      const sampleWorkoutData: WorkoutSummary[] = []
      const startDate = subDays(new Date(), 7)

      for (let i = 0; i < 7; i++) {
        const date = format(addDays(startDate, i), 'yyyy-MM-dd')
        sampleWorkoutData.push({
          date,
          duration: 45 + Math.floor(Math.random() * 30),
          calories_burned: 300 + Math.floor(Math.random() * 200),
          exercises_completed: 8 + Math.floor(Math.random() * 5),
          volume: 5000 + Math.floor(Math.random() * 2000)
        })
      }

      setWorkoutData(sampleWorkoutData)
    }

    if (!isLoading && nutritionData.length === 0) {
      // Generar datos de ejemplo para nutrición
      const sampleNutritionData: NutritionSummary[] = []
      const startDate = subDays(new Date(), 7)

      for (let i = 0; i < 7; i++) {
        const date = format(addDays(startDate, i), 'yyyy-MM-dd')
        sampleNutritionData.push({
          date,
          calories_consumed: 2000 + Math.floor(Math.random() * 500),
          protein: 120 + Math.floor(Math.random() * 40),
          carbs: 200 + Math.floor(Math.random() * 50),
          fat: 60 + Math.floor(Math.random() * 20),
          adherence_score: 70 + Math.floor(Math.random() * 30)
        })
      }

      setNutritionData(sampleNutritionData)
    }

    if (!isLoading && sleepData.length === 0) {
      // Generar datos de ejemplo para sueño
      const sampleSleepData: SleepSummary[] = []
      const startDate = subDays(new Date(), 7)

      for (let i = 0; i < 7; i++) {
        const date = format(addDays(startDate, i), 'yyyy-MM-dd')
        const totalSleep = 6 + Math.random() * 2
        sampleSleepData.push({
          date,
          duration: totalSleep,
          quality: 60 + Math.floor(Math.random() * 40),
          deep_sleep: totalSleep * 0.25,
          rem_sleep: totalSleep * 0.2
        })
      }

      setSleepData(sampleSleepData)
    }
  }, [isLoading, bodyMeasurements.length, workoutData.length, nutritionData.length, sleepData.length])

  // Formatear fecha para mostrar
  const formatDateForDisplay = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM', { locale: es })
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Cargando datos de progreso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Seguimiento de Progreso</h1>
          <p className="text-muted-foreground">Visualiza y analiza tu progreso en todas las áreas</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="overview">General</TabsTrigger>
          <TabsTrigger value="body">Medidas</TabsTrigger>
          <TabsTrigger value="training">Entrenamiento</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrición</TabsTrigger>
          <TabsTrigger value="sleep">Sueño</TabsTrigger>
        </TabsList>

        {/* Pestaña de Visión General */}
        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gráfico de peso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scale className="mr-2 h-5 w-5 text-primary" />
                  Evolución de Peso
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={bodyMeasurements}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDateForDisplay}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} kg`, 'Peso']}
                      labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke={COLORS.primary}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de calorías */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Utensils className="mr-2 h-5 w-5 text-primary" />
                  Consumo Calórico
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={nutritionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} kcal`, 'Calorías']}
                      labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
                    />
                    <Bar dataKey="calories_consumed" fill={COLORS.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de entrenamiento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Dumbbell className="mr-2 h-5 w-5 text-primary" />
                  Actividad Física
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={workoutData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'duration') return [`${value} min`, 'Duración'];
                        if (name === 'calories_burned') return [`${value} kcal`, 'Calorías'];
                        return [value, name];
                      }}
                      labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="duration"
                      name="Duración"
                      stroke={COLORS.blue}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="calories_burned"
                      name="Calorías"
                      stroke={COLORS.red}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de sueño */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Moon className="mr-2 h-5 w-5 text-primary" />
                  Calidad de Sueño
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sleepData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'duration') return [`${value} h`, 'Total'];
                        if (name === 'deep_sleep') return [`${value} h`, 'Sueño profundo'];
                        if (name === 'rem_sleep') return [`${value} h`, 'Sueño REM'];
                        return [value, name];
                      }}
                      labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
                    />
                    <Legend />
                    <Bar dataKey="deep_sleep" name="Sueño profundo" stackId="a" fill={COLORS.purple} />
                    <Bar dataKey="rem_sleep" name="Sueño REM" stackId="a" fill={COLORS.blue} />
                    <Bar dataKey="duration" name="Total" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Medidas Corporales */}
        <TabsContent value="body" className="space-y-4 mt-6">
          {/* Implementar gráficos detallados de medidas corporales */}
          <Card>
            <CardHeader>
              <CardTitle>Medidas Corporales</CardTitle>
              <CardDescription>
                Seguimiento detallado de tus medidas corporales a lo largo del tiempo
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={bodyMeasurements}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateForDisplay}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'weight') return [`${value} kg`, 'Peso'];
                      if (name === 'body_fat_percentage') return [`${value}%`, 'Grasa corporal'];
                      if (name === 'muscle_mass') return [`${value} kg`, 'Masa muscular'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    name="Peso"
                    stroke={COLORS.primary}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="body_fat_percentage"
                    name="Grasa corporal"
                    stroke={COLORS.red}
                  />
                  <Line
                    type="monotone"
                    dataKey="muscle_mass"
                    name="Masa muscular"
                    stroke={COLORS.green}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Entrenamiento */}
        <TabsContent value="training" className="space-y-4 mt-6">
          {/* Implementar gráficos detallados de entrenamiento */}
          <Card>
            <CardHeader>
              <CardTitle>Progreso de Entrenamiento</CardTitle>
              <CardDescription>
                Análisis detallado de tus entrenamientos
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={workoutData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'volume') return [`${value} kg`, 'Volumen'];
                      if (name === 'exercises_completed') return [`${value}`, 'Ejercicios'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    name="Volumen"
                    stroke={COLORS.primary}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="exercises_completed"
                    name="Ejercicios"
                    stroke={COLORS.secondary}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Nutrición */}
        <TabsContent value="nutrition" className="space-y-4 mt-6">
          {/* Implementar gráficos detallados de nutrición */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis Nutricional</CardTitle>
              <CardDescription>
                Seguimiento detallado de tu nutrición
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={nutritionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'protein') return [`${value}g`, 'Proteína'];
                      if (name === 'carbs') return [`${value}g`, 'Carbohidratos'];
                      if (name === 'fat') return [`${value}g`, 'Grasas'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
                  />
                  <Legend />
                  <Bar dataKey="protein" name="Proteína" stackId="a" fill={COLORS.blue} />
                  <Bar dataKey="carbs" name="Carbohidratos" stackId="a" fill={COLORS.yellow} />
                  <Bar dataKey="fat" name="Grasas" stackId="a" fill={COLORS.red} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Sueño */}
        <TabsContent value="sleep" className="space-y-4 mt-6">
          {/* Implementar gráficos detallados de sueño */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Sueño</CardTitle>
              <CardDescription>
                Seguimiento detallado de tus patrones de sueño
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={sleepData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'duration') return [`${value} h`, 'Duración'];
                      if (name === 'quality') return [`${value}%`, 'Calidad'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="duration"
                    name="Duración"
                    stroke={COLORS.primary}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="quality"
                    name="Calidad"
                    stroke={COLORS.purple}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
