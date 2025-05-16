"use client"

import { useState, useEffect } from "react"
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, TrendingUp, PieChart as PieChartIcon, BarChart as BarChartIcon, Activity, AlertCircle } from "lucide-react"
import { getNutritionEntries, getUserNutritionGoals, getNutritionAnalysis } from "@/lib/nutrition-service"
import { NutritionEntry, NutritionGoal, NutritionAnalysis } from "@/lib/types/nutrition"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts"

interface NutritionAnalyticsProps {
  userId: string
}

export default function NutritionAnalytics({ userId }: NutritionAnalyticsProps) {
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>([])
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoal | null>(null)
  const [nutritionAnalysis, setNutritionAnalysis] = useState<NutritionAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("calories")
  const [timeRange, setTimeRange] = useState("week")
  const { toast } = useToast()

  // Cargar datos de nutrición
  useEffect(() => {
    const loadNutritionData = async () => {
      setIsLoading(true)
      try {
        // Determinar fechas según el rango seleccionado
        const today = new Date()
        let startDate: Date
        
        switch (timeRange) {
          case "week":
            startDate = subDays(today, 6)
            break
          case "month":
            startDate = subDays(today, 29)
            break
          case "year":
            startDate = subDays(today, 364)
            break
          default:
            startDate = subDays(today, 6)
        }

        // Cargar entradas de nutrición
        const { data: entries, error: entriesError } = await getNutritionEntries(userId, {
          startDate: startDate.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0]
        })

        if (entriesError) {
          throw entriesError
        }

        if (entries) {
          setNutritionEntries(entries)
        }

        // Cargar objetivos de nutrición
        const { data: goals, error: goalsError } = await getUserNutritionGoals(userId)

        if (!goalsError && goals) {
          setNutritionGoals(goals)
        }

        // Cargar análisis de nutrición
        const { data: analysis, error: analysisError } = await getNutritionAnalysis(userId, timeRange)

        if (!analysisError && analysis) {
          setNutritionAnalysis(analysis)
        }
      } catch (error) {
        console.error("Error al cargar datos de nutrición:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de análisis nutricional",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadNutritionData()
  }, [userId, timeRange, toast])

  // Preparar datos para gráficos
  const prepareChartData = () => {
    if (!nutritionEntries || nutritionEntries.length === 0) {
      return []
    }

    // Agrupar entradas por fecha
    const entriesByDate: { [date: string]: NutritionEntry[] } = {}
    nutritionEntries.forEach(entry => {
      if (!entriesByDate[entry.date]) {
        entriesByDate[entry.date] = []
      }
      entriesByDate[entry.date].push(entry)
    })

    // Calcular totales por día
    const dailyTotals = Object.entries(entriesByDate).map(([date, entries]) => {
      const totals = {
        date,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        entries: entries.length
      }

      entries.forEach(entry => {
        totals.calories += entry.calories || 0
        totals.protein += entry.protein || 0
        totals.carbs += entry.carbs || 0
        totals.fat += entry.fat || 0
      })

      return totals
    })

    // Ordenar por fecha
    dailyTotals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return dailyTotals
  }

  // Preparar datos para gráfico de distribución de macros
  const prepareMacroDistributionData = () => {
    if (!nutritionEntries || nutritionEntries.length === 0) {
      return []
    }

    // Calcular totales
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    nutritionEntries.forEach(entry => {
      totalProtein += entry.protein || 0
      totalCarbs += entry.carbs || 0
      totalFat += entry.fat || 0
    })

    // Calcular calorías por macro
    const proteinCalories = totalProtein * 4
    const carbsCalories = totalCarbs * 4
    const fatCalories = totalFat * 9
    const totalCalories = proteinCalories + carbsCalories + fatCalories

    // Calcular porcentajes
    const data = [
      {
        name: "Proteínas",
        value: totalCalories > 0 ? (proteinCalories / totalCalories) * 100 : 0,
        calories: proteinCalories,
        grams: totalProtein,
        color: "#4f46e5"
      },
      {
        name: "Carbohidratos",
        value: totalCalories > 0 ? (carbsCalories / totalCalories) * 100 : 0,
        calories: carbsCalories,
        grams: totalCarbs,
        color: "#10b981"
      },
      {
        name: "Grasas",
        value: totalCalories > 0 ? (fatCalories / totalCalories) * 100 : 0,
        calories: fatCalories,
        grams: totalFat,
        color: "#f59e0b"
      }
    ]

    return data
  }

  // Preparar datos para gráfico de distribución por comidas
  const prepareMealDistributionData = () => {
    if (!nutritionEntries || nutritionEntries.length === 0) {
      return []
    }

    // Agrupar por tipo de comida
    const mealTypes: { [key: string]: { calories: number, count: number } } = {
      desayuno: { calories: 0, count: 0 },
      almuerzo: { calories: 0, count: 0 },
      cena: { calories: 0, count: 0 },
      snack: { calories: 0, count: 0 }
    }

    nutritionEntries.forEach(entry => {
      if (mealTypes[entry.meal_type]) {
        mealTypes[entry.meal_type].calories += entry.calories || 0
        mealTypes[entry.meal_type].count += 1
      }
    })

    // Convertir a array para el gráfico
    const data = Object.entries(mealTypes).map(([mealType, stats]) => ({
      name: mealType === "desayuno" ? "Desayuno" :
            mealType === "almuerzo" ? "Almuerzo" :
            mealType === "cena" ? "Cena" : "Snack",
      calories: stats.calories,
      count: stats.count,
      color: mealType === "desayuno" ? "#fbbf24" :
             mealType === "almuerzo" ? "#10b981" :
             mealType === "cena" ? "#3b82f6" : "#8b5cf6"
    }))

    return data
  }

  // Calcular estadísticas generales
  const calculateStats = () => {
    if (!nutritionEntries || nutritionEntries.length === 0) {
      return {
        avgCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFat: 0,
        daysTracked: 0,
        completionRate: 0
      }
    }

    const chartData = prepareChartData()
    const totalDays = chartData.length
    
    const totalCalories = chartData.reduce((sum, day) => sum + day.calories, 0)
    const totalProtein = chartData.reduce((sum, day) => sum + day.protein, 0)
    const totalCarbs = chartData.reduce((sum, day) => sum + day.carbs, 0)
    const totalFat = chartData.reduce((sum, day) => sum + day.fat, 0)

    // Calcular promedio diario
    const avgCalories = totalDays > 0 ? totalCalories / totalDays : 0
    const avgProtein = totalDays > 0 ? totalProtein / totalDays : 0
    const avgCarbs = totalDays > 0 ? totalCarbs / totalDays : 0
    const avgFat = totalDays > 0 ? totalFat / totalDays : 0

    // Calcular tasa de completado (días con registros / días totales en el rango)
    const today = new Date()
    let startDate: Date
    
    switch (timeRange) {
      case "week":
        startDate = subDays(today, 6)
        break
      case "month":
        startDate = subDays(today, 29)
        break
      case "year":
        startDate = subDays(today, 364)
        break
      default:
        startDate = subDays(today, 6)
    }

    const totalDaysInRange = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const completionRate = totalDaysInRange > 0 ? (totalDays / totalDaysInRange) * 100 : 0

    return {
      avgCalories,
      avgProtein,
      avgCarbs,
      avgFat,
      daysTracked: totalDays,
      completionRate
    }
  }

  const chartData = prepareChartData()
  const macroDistributionData = prepareMacroDistributionData()
  const mealDistributionData = prepareMealDistributionData()
  const stats = calculateStats()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-[100px]" />
          <Skeleton className="h-[100px]" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selector de rango de tiempo */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Análisis Nutricional</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar rango" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mes</SelectItem>
            <SelectItem value="year">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="mr-2 h-4 w-4 text-primary" />
              Promedio Diario
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{Math.round(stats.avgCalories)} kcal</div>
            <p className="text-xs text-gray-500">
              P: {stats.avgProtein.toFixed(1)}g · C: {stats.avgCarbs.toFixed(1)}g · G: {stats.avgFat.toFixed(1)}g
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
              Seguimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.daysTracked} días</div>
            <p className="text-xs text-gray-500">
              {stats.completionRate.toFixed(0)}% de días registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes gráficos */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="calories" className="flex items-center">
            <BarChartIcon className="mr-2 h-4 w-4" />
            <span>Calorías</span>
          </TabsTrigger>
          <TabsTrigger value="macros" className="flex items-center">
            <PieChartIcon className="mr-2 h-4 w-4" />
            <span>Macros</span>
          </TabsTrigger>
          <TabsTrigger value="meals" className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>Comidas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calories" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Calorías Diarias</CardTitle>
              <CardDescription>
                Seguimiento de calorías consumidas por día
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), "dd/MM")}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`${value} kcal`, "Calorías"]}
                        labelFormatter={(date) => format(new Date(date), "EEEE, d 'de' MMMM", { locale: es })}
                      />
                      <Legend />
                      <Bar 
                        dataKey="calories" 
                        name="Calorías" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]}
                      />
                      {nutritionGoals?.calories && (
                        <ReferenceLine 
                          y={nutritionGoals.calories} 
                          stroke="#ef4444" 
                          strokeDasharray="3 3" 
                          label={{ 
                            value: "Objetivo", 
                            position: "insideTopRight",
                            fill: "#ef4444",
                            fontSize: 12
                          }} 
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <AlertCircle className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500">No hay datos suficientes para mostrar el gráfico</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="macros" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Macronutrientes</CardTitle>
              <CardDescription>
                Porcentaje de calorías por macronutriente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {macroDistributionData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={macroDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {macroDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value.toFixed(1)}%`, ""]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Detalles</h3>
                    <div className="space-y-3">
                      {macroDistributionData.map((macro, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: macro.color }}
                            ></div>
                            <span className="text-sm">{macro.name}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{macro.grams.toFixed(1)}g</span>
                            <span className="text-gray-500 ml-2">({macro.value.toFixed(1)}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {nutritionGoals && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-2">Comparación con objetivos</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Proteínas</span>
                            <span>
                              {macroDistributionData[0].grams.toFixed(1)}g / {nutritionGoals.protein || "---"}g
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Carbohidratos</span>
                            <span>
                              {macroDistributionData[1].grams.toFixed(1)}g / {nutritionGoals.carbs || "---"}g
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Grasas</span>
                            <span>
                              {macroDistributionData[2].grams.toFixed(1)}g / {nutritionGoals.fat || "---"}g
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <AlertCircle className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500">No hay datos suficientes para mostrar el gráfico</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meals" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Comidas</CardTitle>
              <CardDescription>
                Calorías consumidas por tipo de comida
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mealDistributionData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={mealDistributionData}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip 
                          formatter={(value: number) => [`${value} kcal`, "Calorías"]}
                        />
                        <Legend />
                        <Bar 
                          dataKey="calories" 
                          name="Calorías" 
                          radius={[0, 4, 4, 0]}
                        >
                          {mealDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Detalles</h3>
                    <div className="space-y-3">
                      {mealDistributionData.map((meal, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: meal.color }}
                            ></div>
                            <span className="text-sm">{meal.name}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{meal.calories} kcal</span>
                            <span className="text-gray-500 ml-2">({meal.count} registros)</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">Análisis</h3>
                      <p className="text-xs text-gray-500">
                        {mealDistributionData.sort((a, b) => b.calories - a.calories)[0].name} es tu comida con mayor aporte calórico, 
                        representando el {((mealDistributionData.sort((a, b) => b.calories - a.calories)[0].calories / 
                        mealDistributionData.reduce((sum, meal) => sum + meal.calories, 0)) * 100).toFixed(0)}% 
                        del total de calorías.
                      </p>
                      {mealDistributionData.some(meal => meal.count === 0) && (
                        <p className="text-xs text-gray-500 mt-2">
                          No has registrado ninguna comida del tipo {mealDistributionData.find(meal => meal.count === 0)?.name.toLowerCase()}.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <AlertCircle className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500">No hay datos suficientes para mostrar el gráfico</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
