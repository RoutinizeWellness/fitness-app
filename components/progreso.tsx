"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts"
import { Dumbbell, Heart, Brain, Calendar, ArrowUp, ArrowDown, Minus, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, subDays, isWithinInterval } from "date-fns"
import { es } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Workout, Mood } from "@/lib/supabase-client"

interface ProgresoProps {
  workoutLog: Workout[]
  moodLog: Mood[]
}

export default function Progreso({ workoutLog, moodLog }: ProgresoProps) {
  const [moodChartData, setMoodChartData] = useState([])
  const [workoutChartData, setWorkoutChartData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [dateRange, setDateRange] = useState("14") // Días por defecto
  const [dateFilter, setDateFilter] = useState({
    from: subDays(new Date(), 14),
    to: new Date(),
  })
  const [customDateRange, setCustomDateRange] = useState({
    from: subDays(new Date(), 14),
    to: new Date(),
  })

  // Preparar datos para los gráficos
  useEffect(() => {
    setIsLoading(true)

    // Filtrar datos por rango de fechas
    const filterByDateRange = (item) => {
      const itemDate = new Date(item.date)
      return isWithinInterval(itemDate, {
        start: dateFilter.from,
        end: dateFilter.to,
      })
    }

    // Datos para el gráfico de estado de ánimo
    const filteredMoodLog = moodLog.filter(filterByDateRange)
    const moodData = [...filteredMoodLog]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry) => ({
        fecha: format(new Date(entry.date), "dd/MM", { locale: es }),
        animo: entry.mood_level,
        estres: entry.stress_level,
        sueno: entry.sleep_hours,
      }))

    setMoodChartData(moodData)

    // Datos para el gráfico de entrenamientos
    const filteredWorkoutLog = workoutLog.filter(filterByDateRange)

    // Agrupar por tipo de entrenamiento y contar
    const workoutsByType = filteredWorkoutLog.reduce((acc, workout) => {
      const type = workout.type
      if (!acc[type]) {
        acc[type] = 0
      }
      acc[type]++
      return acc
    }, {})

    // Convertir a formato para gráfico
    const workoutData = Object.entries(workoutsByType).map(([type, count]) => ({
      tipo: type,
      cantidad: count,
    }))

    setWorkoutChartData(workoutData)
    setIsLoading(false)
  }, [workoutLog, moodLog, dateFilter])

  // Manejar cambio de rango de fechas
  const handleDateRangeChange = (value) => {
    setDateRange(value)

    let from = new Date()
    const to = new Date()

    switch (value) {
      case "7":
        from = subDays(to, 7)
        break
      case "14":
        from = subDays(to, 14)
        break
      case "30":
        from = subDays(to, 30)
        break
      case "90":
        from = subDays(to, 90)
        break
      case "custom":
        // Mantener el rango personalizado
        return
      default:
        from = subDays(to, 14)
    }

    setDateFilter({ from, to })
  }

  // Aplicar rango de fechas personalizado
  const applyCustomDateRange = () => {
    setDateFilter(customDateRange)
    setDateRange("custom")
  }

  // Calcular tendencias
  const calculateTrend = (data, key) => {
    if (data.length < 2) return "neutral"

    const lastValue = data[data.length - 1]?.[key]
    const prevValue = data[data.length - 2]?.[key]

    if (!lastValue || !prevValue) return "neutral"

    if (lastValue > prevValue) return "up"
    if (lastValue < prevValue) return "down"
    return "neutral"
  }

  const moodTrend = calculateTrend(moodChartData, "animo")
  const stressTrend = calculateTrend(moodChartData, "estres")
  const sleepTrend = calculateTrend(moodChartData, "sueno")

  // Renderizar icono de tendencia
  const renderTrendIcon = (trend, isPositive = true) => {
    if (trend === "up") {
      return isPositive ? <ArrowUp className="h-4 w-4 text-green-500" /> : <ArrowUp className="h-4 w-4 text-red-500" />
    }
    if (trend === "down") {
      return isPositive ? (
        <ArrowDown className="h-4 w-4 text-red-500" />
      ) : (
        <ArrowDown className="h-4 w-4 text-green-500" />
      )
    }
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tu Progreso</h2>

        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="14">Últimos 14 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          {dateRange === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rango de fechas</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">Desde</Label>
                        <CalendarComponent
                          mode="single"
                          selected={customDateRange.from}
                          onSelect={(date) => date && setCustomDateRange({ ...customDateRange, from: date })}
                          initialFocus
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">Hasta</Label>
                        <CalendarComponent
                          mode="single"
                          selected={customDateRange.to}
                          onSelect={(date) => date && setCustomDateRange({ ...customDateRange, to: date })}
                          initialFocus
                        />
                      </div>
                    </div>
                  </div>
                  <Button onClick={applyCustomDateRange} className="w-full">
                    Aplicar
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <Tabs defaultValue="bienestar" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="bienestar" className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            <span>Bienestar</span>
          </TabsTrigger>
          <TabsTrigger value="entrenamientos" className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            <span>Entrenamientos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bienestar">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Bienestar</CardTitle>
                <CardDescription>
                  {format(dateFilter.from, "PPP", { locale: es })} - {format(dateFilter.to, "PPP", { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-80">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : moodChartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={moodChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="animo" name="Ánimo" stroke="#4f46e5" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="estres" name="Estrés" stroke="#ef4444" />
                        <Line type="monotone" dataKey="sueno" name="Horas de Sueño" stroke="#0ea5e9" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <Calendar className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No hay suficientes datos para mostrar tendencias</p>
                    <p className="text-sm">Registra tu estado de ánimo para ver gráficos aquí</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Ánimo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">
                      {moodChartData.length > 0 ? moodChartData[moodChartData.length - 1]?.animo : "-"}/5
                    </div>
                    <div className="flex items-center">
                      {renderTrendIcon(moodTrend, true)}
                      <span className="ml-1 text-sm">
                        {moodTrend === "up" ? "Mejorando" : moodTrend === "down" ? "Disminuyendo" : "Estable"}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Basado en tus últimos registros de estado de ánimo</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Estrés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">
                      {moodChartData.length > 0 ? moodChartData[moodChartData.length - 1]?.estres : "-"}/5
                    </div>
                    <div className="flex items-center">
                      {renderTrendIcon(stressTrend, false)}
                      <span className="ml-1 text-sm">
                        {stressTrend === "up" ? "Aumentando" : stressTrend === "down" ? "Disminuyendo" : "Estable"}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Basado en tus últimos registros de nivel de estrés</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Sueño</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">
                      {moodChartData.length > 0 ? moodChartData[moodChartData.length - 1]?.sueno : "-"}h
                    </div>
                    <div className="flex items-center">
                      {renderTrendIcon(sleepTrend, true)}
                      <span className="ml-1 text-sm">
                        {sleepTrend === "up" ? "Mejorando" : sleepTrend === "down" ? "Disminuyendo" : "Estable"}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Basado en tus últimos registros de horas de sueño</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análisis de Bienestar</CardTitle>
                <CardDescription>Insights basados en tus datos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moodChartData.length > 0 ? (
                    <>
                      <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                          <Brain className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Relación Sueño-Ánimo</p>
                          <p className="text-sm">
                            Los días que duermes más de 7 horas, tu nivel de ánimo tiende a ser más alto.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                        <div className="bg-purple-100 text-purple-700 p-2 rounded-full">
                          <Heart className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Impacto del Ejercicio</p>
                          <p className="text-sm">
                            Los días que realizas ejercicio, tu nivel de estrés tiende a ser más bajo.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-center py-4 text-gray-500">
                      Registra más datos para recibir análisis personalizados
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="entrenamientos">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Entrenamientos</CardTitle>
                <CardDescription>
                  {format(dateFilter.from, "PPP", { locale: es })} - {format(dateFilter.to, "PPP", { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-80">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : workoutChartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workoutChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tipo" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="cantidad" name="Cantidad" fill="#4f46e5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <Dumbbell className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No hay suficientes datos para mostrar estadísticas</p>
                    <p className="text-sm">Registra tus entrenamientos para ver gráficos aquí</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Entrenamiento</CardTitle>
                <CardDescription>Resumen de tu actividad física</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Entrenamientos</p>
                    <p className="text-2xl font-bold">{workoutLog.length}</p>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Este Mes</p>
                    <p className="text-2xl font-bold">
                      {
                        workoutLog.filter((w) => {
                          const date = new Date(w.date)
                          const now = new Date()
                          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                        }).length
                      }
                    </p>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Tipo Más Frecuente</p>
                    <p className="text-2xl font-bold">
                      {workoutChartData.length > 0
                        ? workoutChartData.reduce((prev, current) =>
                            prev.cantidad > current.cantidad ? prev : current,
                          ).tipo
                        : "-"}
                    </p>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Último Entrenamiento</p>
                    <p className="text-2xl font-bold">
                      {workoutLog.length > 0
                        ? new Date(workoutLog[0].date).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                          })
                        : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones</CardTitle>
                <CardDescription>Basadas en tu historial de entrenamientos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workoutLog.length > 0 ? (
                    <>
                      <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                          <Dumbbell className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Equilibrio de Entrenamiento</p>
                          <p className="text-sm">
                            {workoutChartData.find((w) => w.tipo === "Cardio")?.cantidad <
                            workoutChartData.find((w) => w.tipo === "Fuerza")?.cantidad / 2
                              ? "Considera añadir más entrenamientos de cardio para equilibrar tu rutina."
                              : "Tu equilibrio entre fuerza y cardio es adecuado. ¡Sigue así!"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="bg-green-100 text-green-700 p-2 rounded-full">
                          <Brain className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Mindfulness</p>
                          <p className="text-sm">
                            {workoutChartData.find((w) => w.tipo === "Mindfulness")?.cantidad < 3
                              ? "Añadir más prácticas de mindfulness puede ayudar a reducir tu estrés y mejorar tu recuperación."
                              : "Estás haciendo un gran trabajo incorporando mindfulness en tu rutina."}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-center py-4 text-gray-500">
                      Registra más entrenamientos para recibir recomendaciones personalizadas
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
