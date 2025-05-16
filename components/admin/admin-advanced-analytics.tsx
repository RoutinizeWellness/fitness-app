"use client"

import { useState, useEffect } from "react"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts"
import {
  Calendar, ChevronDown, ChevronUp, Download, Filter, RefreshCw,
  BarChart2, LineChart as LineChartIcon, PieChart as PieChartIcon, 
  Activity, Users, Dumbbell, Utensils
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"

// Tipos para los datos de analíticas
interface AnalyticsData {
  userGrowth: {
    date: string;
    total: number;
    active: number;
    new: number;
  }[];
  professionalDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  activityByDay: {
    day: string;
    workouts: number;
    mealPlans: number;
    assessments: number;
  }[];
  userRetention: {
    month: string;
    retention: number;
  }[];
  professionalPerformance: {
    name: string;
    clients: number;
    rating: number;
    completionRate: number;
    responseTime: number;
  }[];
  muscleGroupFocus: {
    group: string;
    value: number;
  }[];
}

export function AdminAdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months' | '6months' | 'year'>('month')
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('line')
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [activeTab, setActiveTab] = useState('user-growth')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Colores para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  // Cargar datos de analíticas
  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // En un entorno real, aquí se cargarían los datos desde Supabase
      // Para este ejemplo, generamos datos simulados
      const data = await generateMockAnalyticsData(timeRange)
      setAnalyticsData(data)
    } catch (error) {
      console.error("Error al cargar datos de analíticas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de analíticas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generar datos simulados para demostración
  const generateMockAnalyticsData = async (range: string): Promise<AnalyticsData> => {
    // Simular una llamada a la API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Determinar el número de puntos de datos según el rango
    let dataPoints = 0
    switch (range) {
      case 'week':
        dataPoints = 7
        break
      case 'month':
        dataPoints = 30
        break
      case '3months':
        dataPoints = 12 // Agrupados por semana
        break
      case '6months':
        dataPoints = 24 // Agrupados por semana
        break
      case 'year':
        dataPoints = 12 // Agrupados por mes
        break
      default:
        dataPoints = 30
    }

    // Generar datos de crecimiento de usuarios
    const userGrowth = Array.from({ length: dataPoints }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (dataPoints - i - 1))
      
      // Crear una tendencia creciente con algo de variación aleatoria
      const baseTotal = 1000 + i * 20
      const baseActive = baseTotal * 0.7
      const baseNew = 10 + i * 0.5
      
      return {
        date: date.toISOString().split('T')[0],
        total: Math.floor(baseTotal + (Math.random() * 50 - 25)),
        active: Math.floor(baseActive + (Math.random() * 40 - 20)),
        new: Math.floor(baseNew + (Math.random() * 5 - 2.5))
      }
    })

    // Distribución de profesionales
    const professionalDistribution = [
      { name: 'Entrenadores', value: 120, color: '#0088FE' },
      { name: 'Nutricionistas', value: 80, color: '#00C49F' },
      { name: 'Ambos roles', value: 30, color: '#FFBB28' },
      { name: 'Pendientes de verificación', value: 25, color: '#FF8042' }
    ]

    // Actividad por día de la semana
    const activityByDay = [
      { day: 'Lunes', workouts: 150, mealPlans: 80, assessments: 30 },
      { day: 'Martes', workouts: 130, mealPlans: 90, assessments: 25 },
      { day: 'Miércoles', workouts: 145, mealPlans: 85, assessments: 28 },
      { day: 'Jueves', workouts: 160, mealPlans: 75, assessments: 32 },
      { day: 'Viernes', workouts: 170, mealPlans: 70, assessments: 35 },
      { day: 'Sábado', workouts: 200, mealPlans: 60, assessments: 40 },
      { day: 'Domingo', workouts: 120, mealPlans: 50, assessments: 20 }
    ]

    // Retención de usuarios por mes
    const userRetention = [
      { month: 'Ene', retention: 95 },
      { month: 'Feb', retention: 92 },
      { month: 'Mar', retention: 88 },
      { month: 'Abr', retention: 91 },
      { month: 'May', retention: 87 },
      { month: 'Jun', retention: 85 },
      { month: 'Jul', retention: 89 },
      { month: 'Ago', retention: 92 },
      { month: 'Sep', retention: 94 },
      { month: 'Oct', retention: 93 },
      { month: 'Nov', retention: 90 },
      { month: 'Dic', retention: 88 }
    ]

    // Rendimiento de profesionales
    const professionalPerformance = [
      { name: 'Entrenador A', clients: 25, rating: 4.8, completionRate: 95, responseTime: 2 },
      { name: 'Entrenador B', clients: 18, rating: 4.5, completionRate: 90, responseTime: 3 },
      { name: 'Nutricionista A', clients: 22, rating: 4.9, completionRate: 98, responseTime: 1 },
      { name: 'Nutricionista B', clients: 15, rating: 4.2, completionRate: 85, responseTime: 4 },
      { name: 'Entrenador C', clients: 20, rating: 4.7, completionRate: 92, responseTime: 2 }
    ]

    // Enfoque en grupos musculares
    const muscleGroupFocus = [
      { group: 'Pecho', value: 80 },
      { group: 'Espalda', value: 75 },
      { group: 'Piernas', value: 65 },
      { group: 'Hombros', value: 60 },
      { group: 'Brazos', value: 70 },
      { group: 'Core', value: 55 },
      { group: 'Glúteos', value: 50 }
    ]

    return {
      userGrowth,
      professionalDistribution,
      activityByDay,
      userRetention,
      professionalPerformance,
      muscleGroupFocus
    }
  }

  // Refrescar datos
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadAnalyticsData()
    setIsRefreshing(false)
    
    toast({
      title: "Datos actualizados",
      description: "Los datos de analíticas se han actualizado correctamente",
    })
  }

  // Exportar datos a CSV
  const handleExportData = () => {
    if (!analyticsData) return
    
    // Implementación básica de exportación a CSV
    let csvContent = ""
    
    // Exportar datos según la pestaña activa
    if (activeTab === 'user-growth') {
      csvContent = "Fecha,Total Usuarios,Usuarios Activos,Nuevos Usuarios\n"
      analyticsData.userGrowth.forEach(item => {
        csvContent += `${item.date},${item.total},${item.active},${item.new}\n`
      })
    } else if (activeTab === 'professional-distribution') {
      csvContent = "Tipo,Cantidad\n"
      analyticsData.professionalDistribution.forEach(item => {
        csvContent += `${item.name},${item.value}\n`
      })
    }
    // Añadir más casos para otras pestañas
    
    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `analytics_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Datos exportados",
      description: "Los datos se han exportado correctamente en formato CSV",
    })
  }

  // Renderizar estado de carga
  if (isLoading && !analyticsData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando analíticas avanzadas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Analíticas Avanzadas</h2>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rango de tiempo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>
          
          <Button3D variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </>
            )}
          </Button3D>
          
          <Button3D variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button3D>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="user-growth" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Crecimiento de usuarios
          </TabsTrigger>
          <TabsTrigger value="professional-distribution" className="flex items-center">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Distribución de profesionales
          </TabsTrigger>
          <TabsTrigger value="activity-patterns" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Patrones de actividad
          </TabsTrigger>
          <TabsTrigger value="retention" className="flex items-center">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Retención
          </TabsTrigger>
        </TabsList>
        
        {analyticsData && (
          <>
            <TabsContent value="user-growth" className="space-y-4">
              <Card3D>
                <Card3DHeader>
                  <Card3DTitle>Crecimiento de usuarios a lo largo del tiempo</Card3DTitle>
                </Card3DHeader>
                <Card3DContent>
                  <div className="flex mb-4 space-x-2">
                    <Button3D 
                      variant={chartType === 'line' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setChartType('line')}
                    >
                      <LineChartIcon className="h-4 w-4 mr-2" />
                      Línea
                    </Button3D>
                    <Button3D 
                      variant={chartType === 'bar' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setChartType('bar')}
                    >
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Barras
                    </Button3D>
                    <Button3D 
                      variant={chartType === 'area' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setChartType('area')}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Área
                    </Button3D>
                  </div>
                  
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'line' ? (
                        <LineChart data={analyticsData.userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="total" name="Total usuarios" stroke="#8884d8" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="active" name="Usuarios activos" stroke="#82ca9d" />
                          <Line type="monotone" dataKey="new" name="Nuevos usuarios" stroke="#ffc658" />
                        </LineChart>
                      ) : chartType === 'bar' ? (
                        <BarChart data={analyticsData.userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total" name="Total usuarios" fill="#8884d8" />
                          <Bar dataKey="active" name="Usuarios activos" fill="#82ca9d" />
                          <Bar dataKey="new" name="Nuevos usuarios" fill="#ffc658" />
                        </BarChart>
                      ) : (
                        <AreaChart data={analyticsData.userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="total" name="Total usuarios" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                          <Area type="monotone" dataKey="active" name="Usuarios activos" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                          <Area type="monotone" dataKey="new" name="Nuevos usuarios" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </Card3DContent>
              </Card3D>
            </TabsContent>
            
            <TabsContent value="professional-distribution" className="space-y-4">
              <Card3D>
                <Card3DHeader>
                  <Card3DTitle>Distribución de profesionales</Card3DTitle>
                </Card3DHeader>
                <Card3DContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.professionalDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {analyticsData.professionalDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card3DContent>
              </Card3D>
            </TabsContent>
            
            <TabsContent value="activity-patterns" className="space-y-4">
              <Card3D>
                <Card3DHeader>
                  <Card3DTitle>Patrones de actividad por día de la semana</Card3DTitle>
                </Card3DHeader>
                <Card3DContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.activityByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="workouts" name="Entrenamientos" fill="#8884d8" />
                        <Bar dataKey="mealPlans" name="Planes de comida" fill="#82ca9d" />
                        <Bar dataKey="assessments" name="Evaluaciones" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card3DContent>
              </Card3D>
              
              <Card3D>
                <Card3DHeader>
                  <Card3DTitle>Enfoque en grupos musculares</Card3DTitle>
                </Card3DHeader>
                <Card3DContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={150} data={analyticsData.muscleGroupFocus}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="group" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Enfoque" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card3DContent>
              </Card3D>
            </TabsContent>
            
            <TabsContent value="retention" className="space-y-4">
              <Card3D>
                <Card3DHeader>
                  <Card3DTitle>Retención de usuarios por mes</Card3DTitle>
                </Card3DHeader>
                <Card3DContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.userRetention}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Retención']} />
                        <Legend />
                        <Line type="monotone" dataKey="retention" name="Retención (%)" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card3DContent>
              </Card3D>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
