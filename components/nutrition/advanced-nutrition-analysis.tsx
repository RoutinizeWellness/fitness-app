"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
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
  Legend 
} from "recharts"
import { Calendar, TrendingUp, PieChart as PieChartIcon, BarChart2, Activity } from "lucide-react"

// Datos de ejemplo para los gráficos
const weeklyData = [
  { day: "Lun", calories: 1850, protein: 95, carbs: 180, fat: 65 },
  { day: "Mar", calories: 2100, protein: 110, carbs: 210, fat: 70 },
  { day: "Mié", calories: 1920, protein: 105, carbs: 190, fat: 62 },
  { day: "Jue", calories: 2050, protein: 115, carbs: 200, fat: 68 },
  { day: "Vie", calories: 2200, protein: 120, carbs: 220, fat: 75 },
  { day: "Sáb", calories: 2300, protein: 125, carbs: 230, fat: 80 },
  { day: "Dom", calories: 1950, protein: 100, carbs: 195, fat: 65 }
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

const nutrientIntake = [
  { nutrient: "Fibra", actual: 22, target: 30 },
  { nutrient: "Azúcares", actual: 35, target: 25 },
  { nutrient: "Sodio", actual: 1800, target: 2000 },
  { nutrient: "Potasio", actual: 2500, target: 3500 },
  { nutrient: "Calcio", actual: 800, target: 1000 },
  { nutrient: "Hierro", actual: 12, target: 15 }
]

export default function AdvancedNutritionAnalysis() {
  const [activeTab, setActiveTab] = useState("macros")
  const [timeRange, setTimeRange] = useState("week")

  // Datos según el rango de tiempo seleccionado
  const data = timeRange === "week" ? weeklyData : monthlyData
  const xAxisKey = timeRange === "week" ? "day" : "week"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Análisis Nutricional</h2>
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
          <TabsTrigger value="macros">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Macros
          </TabsTrigger>
          <TabsTrigger value="calories">
            <TrendingUp className="h-4 w-4 mr-2" />
            Calorías
          </TabsTrigger>
          <TabsTrigger value="nutrients">
            <BarChart2 className="h-4 w-4 mr-2" />
            Nutrientes
          </TabsTrigger>
          <TabsTrigger value="trends">
            <Activity className="h-4 w-4 mr-2" />
            Tendencias
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Macronutrientes */}
        <TabsContent value="macros" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribución de Macronutrientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {macroDistribution.map((entry, index) => (
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
              <CardTitle className="text-lg">Consumo Diario de Macronutrientes</CardTitle>
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
        </TabsContent>

        {/* Pestaña de Calorías */}
        <TabsContent value="calories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consumo de Calorías</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
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
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribución de Calorías por Comida</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Desayuno", value: 25, color: "#60a5fa" },
                        { name: "Almuerzo", value: 35, color: "#34d399" },
                        { name: "Cena", value: 30, color: "#a78bfa" },
                        { name: "Snacks", value: 10, color: "#fbbf24" }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: "Desayuno", value: 25, color: "#60a5fa" },
                        { name: "Almuerzo", value: 35, color: "#34d399" },
                        { name: "Cena", value: 30, color: "#a78bfa" },
                        { name: "Snacks", value: 10, color: "#fbbf24" }
                      ].map((entry, index) => (
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
        </TabsContent>

        {/* Pestaña de Nutrientes */}
        <TabsContent value="nutrients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ingesta de Micronutrientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={nutrientIntake}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="nutrient" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="actual" name="Consumo Actual" fill="#3b82f6" />
                    <Bar dataKey="target" name="Objetivo" fill="#9ca3af" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nutrientIntake.slice(0, 3).map((nutrient, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div>
                    <h3 className="font-medium">{nutrient.nutrient}</h3>
                    <div className="flex items-end justify-between mt-2">
                      <p className="text-2xl font-bold">{nutrient.actual}</p>
                      <p className="text-sm text-gray-500">
                        de {nutrient.target} {nutrient.nutrient === "Sodio" || nutrient.nutrient === "Potasio" ? "mg" : "g"}
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div 
                        className={`h-2.5 rounded-full ${
                          nutrient.nutrient === "Azúcares" && nutrient.actual > nutrient.target
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                        style={{ 
                          width: `${Math.min(100, (nutrient.actual / nutrient.target) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vitaminas y Minerales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Vitamina A", value: 85, color: "#f97316" },
                  { name: "Vitamina C", value: 120, color: "#84cc16" },
                  { name: "Vitamina D", value: 60, color: "#facc15" },
                  { name: "Calcio", value: 75, color: "#3b82f6" },
                  { name: "Hierro", value: 80, color: "#ef4444" },
                  { name: "Magnesio", value: 90, color: "#8b5cf6" },
                  { name: "Zinc", value: 70, color: "#14b8a6" },
                  { name: "Potasio", value: 65, color: "#ec4899" }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="relative mx-auto w-20 h-20">
                      <svg className="w-20 h-20" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={item.color}
                          strokeWidth="3"
                          strokeDasharray={`${item.value}, 100`}
                        />
                      </svg>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-semibold">
                        {item.value}%
                      </div>
                    </div>
                    <p className="text-sm mt-2">{item.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Tendencias */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tendencias de Consumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeRange === "week" ? weeklyData : monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xAxisKey} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="calories" 
                      name="Calorías (kcal)" 
                      stroke="#f43f5e" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="protein" 
                      name="Proteínas (g)" 
                      stroke="#4f46e5" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comparación con Objetivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Calorías", actual: 2050, target: 2000, unit: "kcal" },
                    { name: "Proteínas", actual: 110, target: 120, unit: "g" },
                    { name: "Carbohidratos", actual: 205, target: 200, unit: "g" },
                    { name: "Grasas", actual: 68, target: 65, unit: "g" }
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 p-1.5 rounded-full mr-3">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Aumenta tu ingesta de proteínas</h4>
                      <p className="text-xs text-gray-500">
                        Estás un 8% por debajo de tu objetivo diario de proteínas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-yellow-100 text-yellow-600 p-1.5 rounded-full mr-3">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Controla los carbohidratos</h4>
                      <p className="text-xs text-gray-500">
                        Tu consumo de carbohidratos está ligeramente por encima del objetivo.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-green-100 text-green-600 p-1.5 rounded-full mr-3">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Mantén la consistencia</h4>
                      <p className="text-xs text-gray-500">
                        Has mantenido un buen equilibrio calórico durante la semana.
                      </p>
                    </div>
                  </div>

                  <Button className="w-full mt-2">Ver plan personalizado</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
