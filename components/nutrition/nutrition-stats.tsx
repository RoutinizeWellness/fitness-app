"use client"

import { useState, useEffect } from "react"
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { useNutrition } from "@/contexts/nutrition-context"
import { NutritionStats } from "@/lib/types/nutrition"
import { handleSupabaseError } from "@/lib/error-handlers/supabase-error-handler"
import NutritionErrorBoundaryWithRouter from "./nutrition-error-boundary"

interface NutritionStatsProps {}

// Componente principal envuelto en límite de error
function NutritionStatsContent({}: NutritionStatsProps) {
  const [activeTab, setActiveTab] = useState("week")
  const [dateRange, setDateRange] = useState({
    start: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
    end: format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")
  })
  const [stats, setStats] = useState<NutritionStats | null>(null)
  const { toast } = useToast()

  // Usar el contexto de nutrición
  const {
    dailyStats,
    isLoadingDailyStats,
    loadDailyStats,
    nutritionGoals,
    isLoadingGoals,
    loadNutritionGoals
  } = useNutrition()

  // Cargar estadísticas
  useEffect(() => {
    // Aquí se implementaría la carga de estadísticas para el rango de fechas
    // Por ahora, usaremos datos de ejemplo
    const mockStats: NutritionStats = {
      averageCalories: 2100,
      averageProtein: 120,
      averageCarbs: 200,
      averageFat: 70,
      caloriesTrend: eachDayOfInterval({
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      }).map(date => ({
        date: format(date, "yyyy-MM-dd"),
        value: Math.floor(1800 + Math.random() * 800)
      })),
      macroDistribution: {
        protein: 25,
        carbs: 50,
        fat: 25
      },
      mealTypeDistribution: {
        breakfast: 25,
        lunch: 35,
        dinner: 30,
        snack: 10
      },
      topFoods: [
        { id: "1", name: "Pollo a la plancha", count: 5 },
        { id: "2", name: "Arroz integral", count: 4 },
        { id: "3", name: "Huevos", count: 3 },
        { id: "4", name: "Avena", count: 3 },
        { id: "5", name: "Plátano", count: 2 }
      ],
      consistencyScore: 85,
      streakDays: 5
    }

    setStats(mockStats)
  }, [dateRange])

  // Cambiar rango de fechas según la pestaña activa
  useEffect(() => {
    const today = new Date()

    if (activeTab === "week") {
      setDateRange({
        start: format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        end: format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd")
      })
    } else if (activeTab === "month") {
      // Últimos 30 días
      setDateRange({
        start: format(subDays(today, 29), "yyyy-MM-dd"),
        end: format(today, "yyyy-MM-dd")
      })
    }
  }, [activeTab])

  // Colores para los gráficos
  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"]

  // Datos para el gráfico de distribución de macros
  const macroData = stats ? [
    { name: "Proteínas", value: stats.macroDistribution.protein },
    { name: "Carbohidratos", value: stats.macroDistribution.carbs },
    { name: "Grasas", value: stats.macroDistribution.fat }
  ] : []

  // Datos para el gráfico de distribución de comidas
  const mealData = stats ? [
    { name: "Desayuno", value: stats.mealTypeDistribution.breakfast },
    { name: "Almuerzo", value: stats.mealTypeDistribution.lunch },
    { name: "Cena", value: stats.mealTypeDistribution.dinner },
    { name: "Snacks", value: stats.mealTypeDistribution.snack }
  ] : []

  if (!stats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[300px] w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    )
  }

  // Manejar errores de carga
  useEffect(() => {
    // Verificar si hay errores en el contexto de nutrición
    const { dailyStatsError } = useNutrition();

    if (dailyStats === null && !isLoadingDailyStats && dailyStatsError) {
      handleSupabaseError(dailyStatsError, {
        context: 'Estadísticas de Nutrición',
        showToast: true
      })
    }
  }, [dailyStats, isLoadingDailyStats])

  return (
    <div className="space-y-4">
      <Tabs defaultValue="week" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Estadísticas de Nutrición</h2>
          <TabsList>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="week" className="space-y-4">
          {/* Gráfico de tendencia de calorías */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Calorías</CardTitle>
              <CardDescription>
                {format(new Date(dateRange.start), "dd MMM", { locale: es })} - {format(new Date(dateRange.end), "dd MMM", { locale: es })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.caloriesTrend}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), "EEE", { locale: es })}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} kcal`, "Calorías"]}
                      labelFormatter={(date) => format(new Date(date), "EEEE, d MMMM", { locale: es })}
                    />
                    <Bar dataKey="value" fill="#4f46e5" name="Calorías" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de macronutrientes y distribución de comidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Distribución de macronutrientes */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Macronutrientes</CardTitle>
                <CardDescription>Promedio semanal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-sm">
                  <p>Proteínas: {stats.averageProtein}g ({stats.macroDistribution.protein}%)</p>
                  <p>Carbohidratos: {stats.averageCarbs}g ({stats.macroDistribution.carbs}%)</p>
                  <p>Grasas: {stats.averageFat}g ({stats.macroDistribution.fat}%)</p>
                </div>
              </CardContent>
            </Card>

            {/* Distribución por comidas */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Comidas</CardTitle>
                <CardDescription>Porcentaje de calorías por comida</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mealData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mealData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Promedio de calorías */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Promedio de Calorías</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageCalories} kcal</div>
                <p className="text-xs text-gray-500">
                  {nutritionGoals?.calories
                    ? `${Math.round((stats.averageCalories / nutritionGoals.calories) * 100)}% de tu objetivo`
                    : "Sin objetivo establecido"}
                </p>
              </CardContent>
            </Card>

            {/* Puntuación de consistencia */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Consistencia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.consistencyScore}/100</div>
                <p className="text-xs text-gray-500">Racha actual: {stats.streakDays} días</p>
              </CardContent>
            </Card>

            {/* Alimentos más consumidos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Alimentos Más Consumidos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  {stats.topFoods.slice(0, 3).map((food) => (
                    <li key={food.id} className="flex justify-between">
                      <span>{food.name}</span>
                      <span className="text-gray-500">{food.count}x</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="month" className="space-y-4">
          {/* Contenido similar al de la semana pero con datos mensuales */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Calorías (Mensual)</CardTitle>
              <CardDescription>
                {format(new Date(dateRange.start), "dd MMM", { locale: es })} - {format(new Date(dateRange.end), "dd MMM", { locale: es })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.caloriesTrend}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), "dd/MM")}
                      interval={2}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} kcal`, "Calorías"]}
                      labelFormatter={(date) => format(new Date(date), "EEEE, d MMMM", { locale: es })}
                    />
                    <Bar dataKey="value" fill="#4f46e5" name="Calorías" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Resto de gráficos similares a la vista semanal */}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Componente exportado con límite de error
export default function NutritionStats(props: NutritionStatsProps) {
  return (
    <NutritionErrorBoundaryWithRouter>
      <NutritionStatsContent {...props} />
    </NutritionErrorBoundaryWithRouter>
  )
}
