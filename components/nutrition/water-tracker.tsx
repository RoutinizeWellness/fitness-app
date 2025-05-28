"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts"
import { Droplet, Plus, Minus, TrendingUp, Calendar, BarChart2 } from "lucide-react"

// Datos de ejemplo para los gráficos
const weeklyData = [
  { day: "Lun", amount: 1.8 },
  { day: "Mar", amount: 2.3 },
  { day: "Mié", amount: 1.9 },
  { day: "Jue", amount: 2.5 },
  { day: "Vie", amount: 2.2 },
  { day: "Sáb", amount: 1.7 },
  { day: "Dom", amount: 2.0 }
]

const monthlyData = [
  { week: "Semana 1", amount: 14.5 },
  { week: "Semana 2", amount: 15.2 },
  { week: "Semana 3", amount: 14.8 },
  { week: "Semana 4", amount: 15.5 }
]

export default function WaterTracker() {
  const [waterGoal, setWaterGoal] = useState(2.5) // en litros
  const [waterIntake, setWaterIntake] = useState(1.2) // en litros
  const [activeTab, setActiveTab] = useState("today")
  const [timeRange, setTimeRange] = useState("week")
  const [waterHistory, setWaterHistory] = useState<{time: string, amount: number}[]>([
    { time: "08:30", amount: 0.3 },
    { time: "10:15", amount: 0.25 },
    { time: "12:45", amount: 0.35 },
    { time: "15:20", amount: 0.3 }
  ])

  // Calcular el progreso como porcentaje
  const progress = Math.min(100, Math.round((waterIntake / waterGoal) * 100))

  // Añadir agua
  const addWater = (amount: number) => {
    const newIntake = Math.min(waterGoal * 1.5, waterIntake + amount)
    setWaterIntake(newIntake)

    // Añadir al historial
    const now = new Date()
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    setWaterHistory([...waterHistory, { time: timeString, amount }])
  }

  // Restar agua
  const subtractWater = (amount: number) => {
    const newIntake = Math.max(0, waterIntake - amount)
    setWaterIntake(newIntake)

    // Si hay entradas en el historial, eliminar la última
    if (waterHistory.length > 0) {
      setWaterHistory(waterHistory.slice(0, -1))
    }
  }

  // Obtener el color según el progreso
  const getProgressColor = () => {
    if (progress < 25) return "bg-red-500"
    if (progress < 50) return "bg-orange-500"
    if (progress < 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  // Obtener mensaje según el progreso
  const getProgressMessage = () => {
    if (progress < 25) return "¡Necesitas beber más agua!"
    if (progress < 50) return "Vas por buen camino, sigue bebiendo"
    if (progress < 75) return "¡Bien! Continúa hidratándote"
    if (progress < 100) return "¡Casi llegas a tu objetivo!"
    return "¡Felicidades! Has alcanzado tu objetivo"
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="today">Hoy</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="settings">Ajustes</TabsTrigger>
        </TabsList>

        {/* Pestaña de Hoy */}
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Droplet className="h-5 w-5 mr-2 text-blue-500" />
                Seguimiento de agua
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-4">
                  {/* Círculo de fondo */}
                  <div className="absolute inset-0 rounded-full border-8 border-gray-100"></div>

                  {/* Círculo de progreso */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      strokeDasharray={`${progress * 2.89}, 289`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>

                  {/* Contenido central */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Droplet className="h-8 w-8 text-blue-500 mb-1" />
                    <div className="text-3xl font-bold">{waterIntake.toFixed(1)}L</div>
                    <div className="text-sm text-gray-500">de {waterGoal}L</div>
                  </div>
                </div>

                <p className="text-center text-sm mb-4">{getProgressMessage()}</p>

                <div className="grid grid-cols-3 gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => addWater(0.1)}
                  >
                    +100ml
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => addWater(0.25)}
                  >
                    +250ml
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => addWater(0.5)}
                  >
                    +500ml
                  </Button>
                </div>

                <div className="flex justify-between w-full mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => subtractWater(0.25)}
                    disabled={waterIntake <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setWaterIntake(0)}
                    disabled={waterIntake <= 0}
                  >
                    Reiniciar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Historial de hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {waterHistory.length > 0 ? (
                  waterHistory.map((entry, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <Droplet className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">{entry.amount * 1000}ml</p>
                          <p className="text-xs text-gray-500">{entry.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-gray-500 py-2">
                    No hay registros de agua hoy
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Historial */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Historial de consumo</h2>
            <div className="flex space-x-2">
              <Button
                variant={timeRange === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("week")}
              >
                Semana
              </Button>
              <Button
                variant={timeRange === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("month")}
              >
                Mes
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeRange === "week" ? weeklyData : monthlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={timeRange === "week" ? "day" : "week"} />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} L`, "Consumo de agua"]}
                    />
                    <Bar
                      dataKey="amount"
                      name="Consumo de agua"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    <ReferenceLine y={waterGoal} stroke="#ef4444" strokeDasharray="3 3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Promedio diario</p>
                  <p className="text-xl font-bold">
                    {(weeklyData.reduce((sum, day) => sum + day.amount, 0) / weeklyData.length).toFixed(1)} L
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mejor día</p>
                  <p className="text-xl font-bold">
                    {Math.max(...weeklyData.map(day => day.amount)).toFixed(1)} L
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Días en objetivo</p>
                  <p className="text-xl font-bold">
                    {weeklyData.filter(day => day.amount >= waterGoal).length} / 7
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total semanal</p>
                  <p className="text-xl font-bold">
                    {weeklyData.reduce((sum, day) => sum + day.amount, 0).toFixed(1)} L
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Ajustes */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Objetivo diario de agua</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-4xl font-bold mb-1">{waterGoal.toFixed(1)} L</p>
                  <p className="text-sm text-gray-500">{(waterGoal * 1000).toFixed(0)} ml</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">1.0 L</span>
                    <span className="text-sm">4.0 L</span>
                  </div>
                  <Slider
                    value={[waterGoal]}
                    min={1.0}
                    max={4.0}
                    step={0.1}
                    onValueChange={(value) => setWaterGoal(value[0])}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Recomendación personalizada</h3>
                  <p className="text-sm text-gray-600">
                    Basado en tu peso, actividad física y clima, te recomendamos beber aproximadamente 2.5 litros de agua al día.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Recordatorios</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Activar recordatorios</span>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Frecuencia</span>
                    <Select defaultValue="2">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Cada hora</SelectItem>
                        <SelectItem value="2">Cada 2 horas</SelectItem>
                        <SelectItem value="3">Cada 3 horas</SelectItem>
                        <SelectItem value="4">Cada 4 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="w-full">Guardar cambios</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Información</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>¿Por qué es importante beber agua?</strong><br />
                  El agua es esencial para el funcionamiento del cuerpo. Ayuda a regular la temperatura corporal, mantener la piel saludable, eliminar toxinas y mejorar la digestión.
                </p>
                <p>
                  <strong>¿Cuánta agua debo beber?</strong><br />
                  La recomendación general es de 2 a 3 litros al día, pero puede variar según tu peso, nivel de actividad física y clima.
                </p>
                <p>
                  <strong>Consejos para mantenerte hidratado:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Lleva siempre una botella de agua contigo</li>
                  <li>Bebe un vaso de agua al despertar</li>
                  <li>Consume alimentos con alto contenido de agua como frutas y verduras</li>
                  <li>Establece recordatorios para beber agua regularmente</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
