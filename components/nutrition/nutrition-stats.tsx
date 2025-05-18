"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts"
import { Calendar, TrendingUp, PieChart as PieChartIcon, BarChart2, Activity, Award, Target } from "lucide-react"

// Datos de ejemplo para los gráficos
const weeklyData = [
  { day: "Lun", calories: 1850, protein: 95, carbs: 180, fat: 65, fiber: 22, sugar: 35 },
  { day: "Mar", calories: 2100, protein: 110, carbs: 210, fat: 70, fiber: 25, sugar: 40 },
  { day: "Mié", calories: 1920, protein: 105, carbs: 190, fat: 62, fiber: 20, sugar: 32 },
  { day: "Jue", calories: 2050, protein: 115, carbs: 200, fat: 68, fiber: 24, sugar: 38 },
  { day: "Vie", calories: 2200, protein: 120, carbs: 220, fat: 75, fiber: 28, sugar: 42 },
  { day: "Sáb", calories: 2300, protein: 125, carbs: 230, fat: 80, fiber: 30, sugar: 45 },
  { day: "Dom", calories: 1950, protein: 100, carbs: 195, fat: 65, fiber: 23, sugar: 36 }
]

const monthlyData = [
  { week: "Semana 1", calories: 14500, protein: 750, carbs: 1400, fat: 480 },
  { week: "Semana 2", calories: 15200, protein: 780, carbs: 1450, fat: 510 },
  { week: "Semana 3", calories: 14800, protein: 760, carbs: 1420, fat: 490 },
  { week: "Semana 4", calories: 15500, protein: 800, carbs: 1480, fat: 520 }
]

const macroDistribution = [
  { name: "Proteínas", value: 25, color: "#4f46e5" },
  { name: "Carbohidratos", value: 50, color: "#10b981" },
  { name: "Grasas", value: 25, color: "#f59e0b" }
]

const nutrientQuality = [
  { subject: "Proteínas", A: 120, B: 100, fullMark: 150 },
  { subject: "Grasas saludables", A: 98, B: 100, fullMark: 150 },
  { subject: "Fibra", A: 86, B: 100, fullMark: 150 },
  { subject: "Vitaminas", A: 99, B: 100, fullMark: 150 },
  { subject: "Minerales", A: 85, B: 100, fullMark: 150 },
  { subject: "Antioxidantes", A: 65, B: 100, fullMark: 150 }
]

const mealDistribution = [
  { name: "Desayuno", value: 25, color: "#60a5fa" },
  { name: "Almuerzo", value: 35, color: "#34d399" },
  { name: "Cena", value: 30, color: "#a78bfa" },
  { name: "Snacks", value: 10, color: "#fbbf24" }
]

const foodGroups = [
  { name: "Frutas y verduras", value: 35, target: 40, color: "#84cc16" },
  { name: "Proteínas", value: 25, target: 25, color: "#ef4444" },
  { name: "Granos enteros", value: 20, target: 25, color: "#f59e0b" },
  { name: "Lácteos", value: 10, target: 10, color: "#3b82f6" },
  { name: "Grasas y aceites", value: 10, target: 5, color: "#ec4899" }
]

export default function NutritionStats() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("week")

  // Datos según el rango de tiempo seleccionado
  const data = timeRange === "week" ? weeklyData : monthlyData
  const xAxisKey = timeRange === "week" ? "day" : "week"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Estadísticas Nutricionales</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Esta semana</SelectItem>
            <SelectItem value="month">Este mes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="macros">
            <BarChart2 className="h-4 w-4 mr-2" />
            Macros
          </TabsTrigger>
          <TabsTrigger value="quality">
            <Award className="h-4 w-4 mr-2" />
            Calidad
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="h-4 w-4 mr-2" />
            Objetivos
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Resumen */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calorías diarias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={xAxisKey} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="calories" 
                        name="Calorías (kcal)" 
                        stroke="#f43f5e" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribución de macronutrientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {macroDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </ResponsiveContainer>
                  </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribución por comidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mealDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {mealDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Promedio Diario</h3>
                    <p className="text-2xl font-bold mt-1">
                      {Math.round(data.reduce((sum, item) => sum + item.calories, 0) / data.length)} kcal
                    </p>
                  </div>
                  <div className="bg-red-100 text-red-600 p-2 rounded-full">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Objetivo Diario</h3>
                    <p className="text-2xl font-bold mt-1">2000 kcal</p>
                  </div>
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                    <Target className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Macronutrientes */}
        <TabsContent value="macros" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consumo de macronutrientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xAxisKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="protein" name="Proteínas (g)" fill="#4f46e5" />
                    <Bar dataKey="carbs" name="Carbohidratos (g)" fill="#10b981" />
                    <Bar dataKey="fat" name="Grasas (g)" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {macroDistribution.map((macro, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{macro.name}</h3>
                      <p className="text-sm text-gray-500">
                        {macro.name === "Proteínas" ? "4 kcal/g" : 
                         macro.name === "Carbohidratos" ? "4 kcal/g" : "9 kcal/g"}
                      </p>
                    </div>
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: macro.color + "20", color: macro.color }}
                    >
                      {macro.value}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Desglose de carbohidratos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xAxisKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="fiber" 
                      name="Fibra (g)" 
                      stroke="#84cc16" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sugar" 
                      name="Azúcares (g)" 
                      stroke="#f43f5e" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Calidad Nutricional */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calidad nutricional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={nutrientQuality}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} />
                    <Radar
                      name="Tu dieta"
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
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribución de grupos alimenticios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={foodGroups}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value) => [`${value}%`, "Porcentaje"]} />
                    <Legend />
                    <Bar dataKey="value" name="Actual" fill="#3b82f6" />
                    <Bar dataKey="target" name="Objetivo" fill="#9ca3af" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Puntuación de calidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-4">
                    <svg className="w-32 h-32" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray="85, 100"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-3xl font-bold">85%</div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-500">
                    Tu dieta tiene una buena calidad nutricional
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-green-100 text-green-600 p-1.5 rounded-full mr-3">
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Aumenta el consumo de fibra</h4>
                      <p className="text-xs text-gray-500">
                        Incluye más frutas, verduras y granos enteros.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-yellow-100 text-yellow-600 p-1.5 rounded-full mr-3">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Reduce los azúcares añadidos</h4>
                      <p className="text-xs text-gray-500">
                        Limita los alimentos procesados y bebidas azucaradas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 p-1.5 rounded-full mr-3">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Mejora la variedad</h4>
                      <p className="text-xs text-gray-500">
                        Incluye una mayor diversidad de alimentos en tu dieta.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Objetivos */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progreso hacia objetivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Calorías", actual: 2050, target: 2000, unit: "kcal" },
                  { name: "Proteínas", actual: 110, target: 120, unit: "g" },
                  { name: "Carbohidratos", actual: 205, target: 200, unit: "g" },
                  { name: "Grasas", actual: 68, target: 65, unit: "g" },
                  { name: "Fibra", actual: 22, target: 30, unit: "g" },
                  { name: "Agua", actual: 1.8, target: 2.5, unit: "L" }
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-gray-500">
                        {item.actual} / {item.target} {item.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          item.actual > item.target * 1.1
                            ? "bg-red-500"
                            : item.actual < item.target * 0.9
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ 
                          width: `${Math.min(100, (item.actual / item.target) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Objetivo actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Pérdida de peso</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Déficit calórico de 300-500 kcal/día
                    </p>
                  </div>
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                    <Target className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="h-2.5 rounded-full bg-blue-500"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 p-1.5 rounded-full mr-3">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Mantén el déficit calórico</h4>
                      <p className="text-xs text-gray-500">
                        Continúa con tu plan actual para alcanzar tu objetivo.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-green-100 text-green-600 p-1.5 rounded-full mr-3">
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Aumenta la proteína</h4>
                      <p className="text-xs text-gray-500">
                        Estás un 8% por debajo de tu objetivo diario de proteínas.
                      </p>
                    </div>
                  </div>

                  <Button className="w-full mt-2">Ajustar objetivos</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
