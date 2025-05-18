"use client"

import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts"
import { CalendarIcon, Utensils, Coffee, Apple, Moon, Droplet, TrendingUp, AlertCircle } from "lucide-react"
import { useNutrition } from "@/contexts/nutrition-context"
import { NutritionEntry, NutritionGoal, WaterLog, MacroBreakdown, DailyNutrition } from "@/lib/types/nutrition"

interface NutritionDashboardProps {}

export default function NutritionDashboard({}: NutritionDashboardProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [waterProgress, setWaterProgress] = useState(0)
  const { toast } = useToast()

  // Usar el contexto de nutrición
  const {
    dailyStats,
    isLoadingDailyStats,
    loadDailyStats,
    nutritionGoals,
    isLoadingGoals,
    loadNutritionGoals,
    waterLogs,
    isLoadingWaterLogs,
    loadWaterLogs
  } = useNutrition()

  // Cargar datos de nutrición
  useEffect(() => {
    loadDailyStats(selectedDate)
    loadNutritionGoals()
    loadWaterLogs(selectedDate)
  }, [selectedDate, loadDailyStats, loadNutritionGoals, loadWaterLogs])

  // Calcular progreso de agua
  useEffect(() => {
    if (waterLogs && nutritionGoals?.waterIntake) {
      const totalWater = waterLogs.reduce((sum, entry) => sum + entry.amount, 0)
      setWaterProgress(Math.min(100, (totalWater / nutritionGoals.waterIntake) * 100))
    } else {
      setWaterProgress(0)
    }
  }, [waterLogs, nutritionGoals])

  // Calcular progreso de calorías
  const calorieProgress = nutritionGoals?.calories && dailyStats
    ? Math.min(100, (dailyStats.totalCalories / nutritionGoals.calories) * 100)
    : 0

  // Datos para el gráfico de macronutrientes
  const macrosData = dailyStats ? [
    { name: "Proteínas", value: dailyStats.totalProtein * 4, color: "#4f46e5" },
    { name: "Carbohidratos", value: dailyStats.totalCarbs * 4, color: "#10b981" },
    { name: "Grasas", value: dailyStats.totalFat * 9, color: "#f59e0b" },
  ] : []

  // Renderizar icono según el tipo de comida
  const renderMealIcon = (mealType: string) => {
    switch (mealType) {
      case "desayuno":
        return <Coffee className="h-4 w-4" />
      case "almuerzo":
        return <Utensils className="h-4 w-4" />
      case "cena":
        return <Moon className="h-4 w-4" />
      case "snack":
        return <Apple className="h-4 w-4" />
      default:
        return <Utensils className="h-4 w-4" />
    }
  }

  // Cambiar a día anterior
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate)
    const previousDay = subDays(currentDate, 1)
    setSelectedDate(previousDay.toISOString().split("T")[0])
  }

  // Cambiar a día siguiente
  const goToNextDay = () => {
    const currentDate = new Date(selectedDate)
    const nextDay = new Date(currentDate)
    nextDay.setDate(currentDate.getDate() + 1)

    // No permitir seleccionar fechas futuras
    if (nextDay <= new Date()) {
      setSelectedDate(nextDay.toISOString().split("T")[0])
    }
  }

  if (isLoadingDailyStats || isLoadingGoals || isLoadingWaterLogs) {
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
      {/* Selector de fecha */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full h-9 w-9 p-0"
          onClick={goToPreviousDay}
        >
          &lt;
        </Button>
        <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-full">
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
          <span className="text-sm font-medium">
            {format(new Date(selectedDate), "EEEE, d 'de' MMMM", { locale: es })}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full h-9 w-9 p-0"
          onClick={goToNextDay}
          disabled={new Date(selectedDate).toDateString() === new Date().toDateString()}
        >
          &gt;
        </Button>
      </div>

      {/* Resumen de calorías y macros */}
      <Card organic={true} className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Resumen Nutricional</CardTitle>
          <CardDescription>
            {nutritionStats?.entries
              ? `${nutritionStats.entries} alimentos registrados hoy`
              : "No hay alimentos registrados hoy"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Calorías */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Calorías</span>
                  <span className="text-sm">
                    {dailyStats?.totalCalories || 0} / {nutritionGoals?.calories || "---"} kcal
                  </span>
                </div>
                <Progress value={calorieProgress} className="h-2" />
              </div>

              {/* Proteínas */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Proteínas</span>
                  <span className="text-sm">
                    {dailyStats?.totalProtein || 0} / {nutritionGoals?.protein || "---"} g
                  </span>
                </div>
                <Progress
                  value={nutritionGoals?.protein
                    ? Math.min(100, ((dailyStats?.totalProtein || 0) / nutritionGoals.protein) * 100)
                    : 0}
                  className="h-2 bg-blue-100"
                />
              </div>

              {/* Carbohidratos */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Carbohidratos</span>
                  <span className="text-sm">
                    {dailyStats?.totalCarbs || 0} / {nutritionGoals?.carbs || "---"} g
                  </span>
                </div>
                <Progress
                  value={nutritionGoals?.carbs
                    ? Math.min(100, ((dailyStats?.totalCarbs || 0) / nutritionGoals.carbs) * 100)
                    : 0}
                  className="h-2 bg-green-100"
                />
              </div>

              {/* Grasas */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Grasas</span>
                  <span className="text-sm">
                    {dailyStats?.totalFat || 0} / {nutritionGoals?.fat || "---"} g
                  </span>
                </div>
                <Progress
                  value={nutritionGoals?.fat
                    ? Math.min(100, ((dailyStats?.totalFat || 0) / nutritionGoals.fat) * 100)
                    : 0}
                  className="h-2 bg-yellow-100"
                />
              </div>

              {/* Agua */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Agua</span>
                  <span className="text-sm">
                    {waterLog.reduce((sum, entry) => sum + entry.amount, 0) / 1000 || 0} / {nutritionGoals?.water ? nutritionGoals.water / 1000 : "---"} L
                  </span>
                </div>
                <Progress value={waterProgress} className="h-2 bg-blue-100" />
              </div>
            </div>

            {/* Gráfico de macros */}
            <div className="flex flex-col items-center justify-center">
              {macrosData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={macrosData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {macrosData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <AlertCircle className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No hay datos suficientes para mostrar el gráfico</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 gap-4">
        {/* Agua */}
        <Card organic={true} className="overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-2">
                <Droplet className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              </div>
              Consumo de Agua
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              {(waterLogs.reduce((sum, entry) => sum + entry.amount, 0) / 1000).toFixed(1)} L
            </div>
            <p className="text-xs text-gray-500">
              {nutritionGoals?.waterIntake
                ? `${waterProgress.toFixed(0)}% de tu objetivo diario`
                : "Sin objetivo establecido"}
            </p>
          </CardContent>
        </Card>

        {/* Tendencia */}
        <Card organic={true} className="overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-2">
                <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />
              </div>
              Tendencia
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              {nutritionStats && nutritionGoals?.calories
                ? nutritionStats.calories > nutritionGoals.calories
                  ? "Exceso"
                  : nutritionStats.calories < nutritionGoals.calories * 0.8
                  ? "Déficit"
                  : "Equilibrio"
                : "---"}
            </div>
            <p className="text-xs text-gray-500">
              {nutritionStats && nutritionGoals?.calories
                ? `${Math.abs(nutritionStats.calories - (nutritionGoals.calories || 0))} kcal de diferencia`
                : "Sin datos suficientes"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
