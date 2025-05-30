"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getWorkoutStats, searchWorkouts } from "@/lib/supabase-queries"
import {
  Loader2, Calendar, BarChart, Search, Activity,
  TrendingUp, Dumbbell, BarChart2, PieChart as PieChartIcon,
  LineChart as LineChartIcon, Calendar as CalendarIcon
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, subDays, subMonths, isWithinInterval, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { Progress } from "@/components/ui/progress"
import { ProgressRing } from "@/components/ui/progress-ring"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts"

// Colores para los gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function WorkoutAnalytics() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [timeRange, setTimeRange] = useState("month") // week, month, year, all
  const [dateFilter, setDateFilter] = useState({
    from: subMonths(new Date(), 1),
    to: new Date(),
  })
  const [chartType, setChartType] = useState("bar") // bar, line, pie, radar

  // Datos simulados para los gráficos (en una implementación real, estos vendrían de la API)
  const [volumeData, setVolumeData] = useState([
    { name: 'Semana 1', volumen: 2400 },
    { name: 'Semana 2', volumen: 1398 },
    { name: 'Semana 3', volumen: 9800 },
    { name: 'Semana 4', volumen: 3908 },
    { name: 'Semana 5', volumen: 4800 },
    { name: 'Semana 6', volumen: 3800 },
    { name: 'Semana 7', volumen: 4300 },
  ])

  const [muscleGroupData, setMuscleGroupData] = useState([
    { name: 'Pecho', value: 400 },
    { name: 'Espalda', value: 300 },
    { name: 'Piernas', value: 500 },
    { name: 'Hombros', value: 200 },
    { name: 'Brazos', value: 278 },
    { name: 'Core', value: 189 },
  ])

  const [progressData, setProgressData] = useState([
    { name: 'Press Banca', inicio: 60, actual: 80 },
    { name: 'Sentadillas', inicio: 80, actual: 120 },
    { name: 'Peso Muerto', inicio: 100, actual: 140 },
    { name: 'Dominadas', inicio: 5, actual: 12 },
    { name: 'Fondos', inicio: 8, actual: 15 },
  ])

  const [radarData, setRadarData] = useState([
    {
      subject: 'Fuerza',
      A: 120,
      B: 110,
      fullMark: 150,
    },
    {
      subject: 'Resistencia',
      A: 98,
      B: 130,
      fullMark: 150,
    },
    {
      subject: 'Flexibilidad',
      A: 86,
      B: 130,
      fullMark: 150,
    },
    {
      subject: 'Velocidad',
      A: 99,
      B: 100,
      fullMark: 150,
    },
    {
      subject: 'Potencia',
      A: 85,
      B: 90,
      fullMark: 150,
    },
    {
      subject: 'Equilibrio',
      A: 65,
      B: 85,
      fullMark: 150,
    },
  ])

  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return

      try {
        setLoading(true)
        const { data, error } = await getWorkoutStats(user.id)

        if (error) {
          console.error("Error al cargar estadísticas:", error)
          return
        }

        if (data) {
          setStats(data)

          // En una implementación real, aquí cargaríamos los datos para los gráficos
          // desde la API en función del rango de fechas seleccionado
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user, timeRange, dateFilter])

  // Manejar búsqueda
  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) return

    try {
      setSearchLoading(true)
      const { data, error } = await searchWorkouts(user.id, {
        query: searchQuery,
        limit: 5,
      })

      if (error) {
        console.error("Error en la búsqueda:", error)
        return
      }

      if (data) {
        setSearchResults(data)
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Cambiar rango de tiempo
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range)

    const now = new Date()
    let from = now

    switch (range) {
      case 'week':
        from = subDays(now, 7)
        break
      case 'month':
        from = subMonths(now, 1)
        break
      case 'year':
        from = subMonths(now, 12)
        break
      case 'all':
        from = subMonths(now, 60) // 5 años atrás como "todo"
        break
    }

    setDateFilter({ from, to: now })
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Entrenamientos</CardTitle>
          <CardDescription>Inicia sesión para ver tus estadísticas detalladas</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Análisis de Entrenamientos</CardTitle>
            <CardDescription>Visualiza y analiza tu progreso en detalle</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = "/workout-stats"}
            >
              <BarChart className="h-4 w-4 mr-2" />
              Vista básica
            </Button>
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
                <SelectItem value="all">Todo el historial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="volume">
              <BarChart className="h-4 w-4 mr-2" />
              Volumen
            </TabsTrigger>
            <TabsTrigger value="progress">
              <TrendingUp className="h-4 w-4 mr-2" />
              Progreso
            </TabsTrigger>
            <TabsTrigger value="distribution">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Distribución
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de Resumen */}
          <TabsContent value="overview" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <Dumbbell className="h-8 w-8 text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Total Entrenamientos</p>
                      <p className="text-2xl font-bold">{stats?.totalWorkouts || 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <BarChart2 className="h-8 w-8 text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Volumen Total</p>
                      <p className="text-2xl font-bold">{stats?.totalVolume || 0} kg</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <Activity className="h-8 w-8 text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Frecuencia</p>
                      <p className="text-2xl font-bold">{stats?.frequency || 0}/sem</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <CalendarIcon className="h-8 w-8 text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Último Entrenamiento</p>
                      <p className="text-lg font-medium">
                        {stats?.latestWorkout ? (
                          format(new Date(stats.latestWorkout.date), "dd/MM/yy")
                        ) : (
                          "Sin datos"
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Distribución por Grupo Muscular</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={muscleGroupData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {muscleGroupData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Volumen de Entrenamiento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart
                            data={volumeData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="volumen" fill="#8884d8" name="Volumen (kg)" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Perfil de Rendimiento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis />
                          <Radar
                            name="Actual"
                            dataKey="A"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.6}
                          />
                          <Radar
                            name="Objetivo"
                            dataKey="B"
                            stroke="#82ca9d"
                            fill="#82ca9d"
                            fillOpacity={0.6}
                          />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Pestaña de Volumen */}
          <TabsContent value="volume" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Volumen de Entrenamiento</h3>
              <div className="flex space-x-2">
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Tipo de gráfico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Barras</SelectItem>
                    <SelectItem value="line">Líneas</SelectItem>
                    <SelectItem value="area">Área</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <RechartsBarChart
                        data={volumeData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="volumen" fill="#8884d8" name="Volumen (kg)" />
                      </RechartsBarChart>
                    ) : chartType === 'line' ? (
                      <LineChart
                        data={volumeData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="volumen"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                          name="Volumen (kg)"
                        />
                      </LineChart>
                    ) : (
                      <LineChart
                        data={volumeData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="volumen"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.3}
                          name="Volumen (kg)"
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <ProgressRing value={85} size={120} strokeWidth={10} showPercentage>
                    <Dumbbell className="h-6 w-6 text-primary" />
                  </ProgressRing>
                  <h3 className="mt-4 font-medium">Volumen Semanal</h3>
                  <p className="text-muted-foreground text-sm">vs. semana anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-4">Volumen por Ejercicio</h3>
                  <div className="space-y-4">
                    {progressData.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.name}</span>
                          <span className="font-medium">{item.actual} kg</span>
                        </div>
                        <Progress value={(item.actual / 150) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-4">Estadísticas de Volumen</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volumen total</span>
                      <span className="font-medium">12,450 kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Promedio semanal</span>
                      <span className="font-medium">2,490 kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Máximo semanal</span>
                      <span className="font-medium">3,200 kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mínimo semanal</span>
                      <span className="font-medium">1,800 kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tendencia</span>
                      <span className="font-medium flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        +15%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pestaña de Progreso */}
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Progreso en Ejercicios Principales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={progressData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="inicio" fill="#8884d8" name="Peso Inicial (kg)" />
                      <Bar dataKey="actual" fill="#82ca9d" name="Peso Actual (kg)" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Mejoras Porcentuales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {progressData.map((item, index) => {
                      const improvement = ((item.actual - item.inicio) / item.inicio) * 100;
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{item.name}</span>
                            <span className="font-medium text-green-600">+{improvement.toFixed(1)}%</span>
                          </div>
                          <Progress value={improvement} max={100} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Récords Personales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {progressData.map((item, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Mejor marca: {item.actual} kg</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          PR
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pestaña de Distribución */}
          <TabsContent value="distribution" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Distribución por Grupo Muscular</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={muscleGroupData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {muscleGroupData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Distribución por Tipo de Ejercicio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Compuestos', value: 65 },
                            { name: 'Aislamiento', value: 35 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#0088FE" />
                          <Cell fill="#00C49F" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Distribución por Día de la Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { name: 'Lunes', value: 12 },
                        { name: 'Martes', value: 8 },
                        { name: 'Miércoles', value: 10 },
                        { name: 'Jueves', value: 7 },
                        { name: 'Viernes', value: 11 },
                        { name: 'Sábado', value: 5 },
                        { name: 'Domingo', value: 2 },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Número de entrenamientos" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
