"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedCard } from "@/components/ui/animated-card"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth/auth-context"
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
  Legend
} from "recharts"
import {
  Calendar,
  Heart,
  Moon,
  Activity,
  Zap,
  Save,
  RefreshCw,
  BarChart3,
  LineChart as LineChartIcon
} from "lucide-react"

interface WellnessScore {
  user_id: string
  date: string
  mood: number
  sleep_hours: number
  stress_level: number
  hrv: number
  recovery_score: number
  recommendations: string
}

export function WellnessScoreTracker() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("today")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [chartType, setChartType] = useState<"line" | "bar">("line")
  const [historicalData, setHistoricalData] = useState<WellnessScore[]>([])

  // Estado para el formulario de hoy
  const [todayScore, setTodayScore] = useState<Omit<WellnessScore, "user_id" | "recovery_score" | "recommendations">>({
    date: new Date().toISOString().split("T")[0],
    mood: 7,
    sleep_hours: 7.5,
    stress_level: 4,
    hrv: 65
  })

  // Estado para la puntuación calculada y recomendaciones
  const [calculatedScore, setCalculatedScore] = useState<{
    recovery_score: number
    recommendations: string
  } | null>(null)

  // Cargar datos históricos
  useEffect(() => {
    if (user) {
      loadHistoricalData()
    }
  }, [user])

  // Cargar datos históricos de Supabase
  const loadHistoricalData = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("wellness_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(14)

      if (error) {
        throw error
      }

      // Ordenar por fecha ascendente para el gráfico
      const sortedData = [...data].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      setHistoricalData(sortedData)

      // Verificar si ya existe un registro para hoy
      const today = new Date().toISOString().split("T")[0]
      const todayRecord = data.find(record => record.date === today)

      if (todayRecord) {
        setTodayScore({
          date: todayRecord.date,
          mood: todayRecord.mood,
          sleep_hours: todayRecord.sleep_hours,
          stress_level: todayRecord.stress_level,
          hrv: todayRecord.hrv
        })

        setCalculatedScore({
          recovery_score: todayRecord.recovery_score,
          recommendations: todayRecord.recommendations
        })
      }
    } catch (error) {
      console.error("Error loading wellness scores:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de bienestar",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular puntuación de recuperación y recomendaciones
  const calculateRecoveryScore = () => {
    // Algoritmo simple para calcular la puntuación de recuperación
    const moodFactor = todayScore.mood * 1.2 // Más peso al estado de ánimo
    const sleepFactor = todayScore.sleep_hours < 7
      ? todayScore.sleep_hours * 0.8
      : todayScore.sleep_hours * 1.2
    const stressFactor = (10 - todayScore.stress_level) * 1.1 // Invertir el nivel de estrés
    const hrvFactor = todayScore.hrv * 0.08

    // Calcular puntuación total (máximo 100)
    let score = Math.round((moodFactor + sleepFactor + stressFactor + hrvFactor) * 2.5)
    score = Math.min(Math.max(score, 0), 100) // Limitar entre 0 y 100

    // Generar recomendaciones basadas en los factores
    let recommendations = ""

    if (todayScore.mood < 5) {
      recommendations += "• Considera realizar actividades que te gusten para mejorar tu estado de ánimo.\n"
    }

    if (todayScore.sleep_hours < 7) {
      recommendations += "• Intenta dormir más horas para mejorar tu recuperación.\n"
    }

    if (todayScore.stress_level > 6) {
      recommendations += "• Practica técnicas de respiración o meditación para reducir el estrés.\n"
    }

    if (todayScore.hrv < 60) {
      recommendations += "• Tu variabilidad cardíaca es baja. Considera reducir la intensidad del entrenamiento hoy.\n"
    }

    if (score < 50) {
      recommendations += "• Tu puntuación de recuperación es baja. Prioriza el descanso y la recuperación hoy.\n"
    } else if (score >= 80) {
      recommendations += "• ¡Excelente recuperación! Es un buen día para un entrenamiento de alta intensidad.\n"
    } else {
      recommendations += "• Tu recuperación es moderada. Considera un entrenamiento de intensidad media.\n"
    }

    return {
      recovery_score: score,
      recommendations: recommendations.trim()
    }
  }

  // Guardar puntuación de bienestar
  const saveWellnessScore = async () => {
    if (!user) return

    setIsSaving(true)

    try {
      // Calcular puntuación de recuperación y recomendaciones
      const calculated = calculateRecoveryScore()
      setCalculatedScore(calculated)

      // Preparar datos para guardar
      const wellnessData = {
        user_id: user.id,
        ...todayScore,
        recovery_score: calculated.recovery_score,
        recommendations: calculated.recommendations
      }

      // Verificar si ya existe un registro para hoy
      const { data: existingData, error: checkError } = await supabase
        .from("wellness_scores")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", todayScore.date)
        .maybeSingle()

      if (checkError) {
        throw checkError
      }

      let saveError

      if (existingData) {
        // Actualizar registro existente
        const { error } = await supabase
          .from("wellness_scores")
          .update(wellnessData)
          .eq("user_id", user.id)
          .eq("date", todayScore.date)

        saveError = error
      } else {
        // Insertar nuevo registro
        const { error } = await supabase
          .from("wellness_scores")
          .insert(wellnessData)

        saveError = error
      }

      if (saveError) {
        throw saveError
      }

      // Recargar datos históricos
      await loadHistoricalData()

      toast({
        title: "Guardado",
        description: "Tu puntuación de bienestar ha sido guardada correctamente",
      })
    } catch (error) {
      console.error("Error saving wellness score:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la puntuación de bienestar",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
  }

  // Obtener color según la puntuación
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-blue-500"
    if (score >= 40) return "text-yellow-500"
    return "text-red-500"
  }

  // Obtener clase de fondo según la puntuación
  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20"
    if (score >= 60) return "bg-blue-100 dark:bg-blue-900/20"
    if (score >= 40) return "bg-yellow-100 dark:bg-yellow-900/20"
    return "bg-red-100 dark:bg-red-900/20"
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="today">Hoy</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          {activeTab === "history" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChartType(chartType === "line" ? "bar" : "line")}
              >
                {chartType === "line" ? <BarChart3 className="h-4 w-4" /> : <LineChartIcon className="h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={loadHistoricalData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="today">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formulario de bienestar */}
            <Card>
              <CardHeader>
                <CardTitle>Registro de bienestar</CardTitle>
                <CardDescription>
                  Registra tu bienestar diario para obtener recomendaciones personalizadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="mood">Estado de ánimo</Label>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="font-medium">{todayScore.mood}/10</span>
                      </div>
                    </div>
                    <Slider
                      id="mood"
                      min={1}
                      max={10}
                      step={1}
                      value={[todayScore.mood]}
                      onValueChange={(value) => setTodayScore({...todayScore, mood: value[0]})}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Bajo</span>
                      <span>Alto</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="sleep">Horas de sueño</Label>
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{todayScore.sleep_hours} h</span>
                      </div>
                    </div>
                    <Slider
                      id="sleep"
                      min={0}
                      max={12}
                      step={0.5}
                      value={[todayScore.sleep_hours]}
                      onValueChange={(value) => setTodayScore({...todayScore, sleep_hours: value[0]})}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0h</span>
                      <span>12h</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="stress">Nivel de estrés</Label>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{todayScore.stress_level}/10</span>
                      </div>
                    </div>
                    <Slider
                      id="stress"
                      min={1}
                      max={10}
                      step={1}
                      value={[todayScore.stress_level]}
                      onValueChange={(value) => setTodayScore({...todayScore, stress_level: value[0]})}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Bajo</span>
                      <span>Alto</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="hrv">Variabilidad cardíaca (HRV)</Label>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">{todayScore.hrv} ms</span>
                      </div>
                    </div>
                    <Slider
                      id="hrv"
                      min={20}
                      max={100}
                      step={1}
                      value={[todayScore.hrv]}
                      onValueChange={(value) => setTodayScore({...todayScore, hrv: value[0]})}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>20ms</span>
                      <span>100ms</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={saveWellnessScore}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingAnimation size="sm" type="spinner" showText={false} className="mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar registro
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Puntuación y recomendaciones */}
            <AnimatedCard hoverEffect="lift">
              <CardHeader>
                <CardTitle>Puntuación de recuperación</CardTitle>
                <CardDescription>
                  Basada en tus métricas de bienestar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {calculatedScore ? (
                  <>
                    <div className="flex justify-center">
                      <div className={`text-center p-6 rounded-full w-32 h-32 flex items-center justify-center ${getScoreBackground(calculatedScore.recovery_score)}`}>
                        <div>
                          <div className={`text-4xl font-bold ${getScoreColor(calculatedScore.recovery_score)}`}>
                            {calculatedScore.recovery_score}
                          </div>
                          <div className="text-xs text-muted-foreground">de 100</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recomendaciones:</h4>
                      <div className="bg-muted p-3 rounded-md text-sm">
                        {calculatedScore.recommendations.split('\n').map((rec, index) => (
                          <p key={index} className="mb-1">{rec}</p>
                        ))}
                      </div>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      <Calendar className="inline-block h-4 w-4 mr-1" />
                      {new Date().toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Completa y guarda tu registro de bienestar para ver tu puntuación de recuperación y recomendaciones personalizadas.
                    </p>
                  </div>
                )}
              </CardContent>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de bienestar</CardTitle>
              <CardDescription>
                Seguimiento de tus métricas de bienestar a lo largo del tiempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <LoadingAnimation />
                </div>
              ) : historicalData.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "line" ? (
                      <LineChart
                        data={historicalData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "recovery_score") return [`${value}`, "Recuperación"]
                            if (name === "mood") return [`${value}/10`, "Estado de ánimo"]
                            if (name === "sleep_hours") return [`${value} h`, "Horas de sueño"]
                            if (name === "stress_level") return [`${value}/10`, "Nivel de estrés"]
                            if (name === "hrv") return [`${value} ms`, "HRV"]
                            return [value, name]
                          }}
                          labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="recovery_score"
                          name="Recuperación"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                        <Line type="monotone" dataKey="mood" name="Estado de ánimo" stroke="#ff7300" />
                        <Line type="monotone" dataKey="sleep_hours" name="Horas de sueño" stroke="#0088fe" />
                        <Line type="monotone" dataKey="stress_level" name="Nivel de estrés" stroke="#ff0000" />
                        <Line type="monotone" dataKey="hrv" name="HRV" stroke="#00C49F" />
                      </LineChart>
                    ) : (
                      <BarChart
                        data={historicalData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "recovery_score") return [`${value}`, "Recuperación"]
                            if (name === "mood") return [`${value}/10`, "Estado de ánimo"]
                            if (name === "sleep_hours") return [`${value} h`, "Horas de sueño"]
                            if (name === "stress_level") return [`${value}/10`, "Nivel de estrés"]
                            if (name === "hrv") return [`${value} ms`, "HRV"]
                            return [value, name]
                          }}
                          labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        />
                        <Legend />
                        <Bar dataKey="recovery_score" name="Recuperación" fill="#8884d8" />
                        <Bar dataKey="mood" name="Estado de ánimo" fill="#ff7300" />
                        <Bar dataKey="sleep_hours" name="Horas de sueño" fill="#0088fe" />
                        <Bar dataKey="stress_level" name="Nivel de estrés" fill="#ff0000" />
                        <Bar dataKey="hrv" name="HRV" fill="#00C49F" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No hay datos de bienestar registrados. Comienza a registrar tu bienestar diario para ver tu historial.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
