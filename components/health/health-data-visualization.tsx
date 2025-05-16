"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Share2,
  Activity,
  Heart,
  Flame,
  Moon,
  Droplet,
  Map,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon
} from "lucide-react"
import { format, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { useHealthData } from "@/hooks/use-health-data"
import { supabase } from "@/lib/supabase-client"
import { exportToCSV } from "@/lib/export-utils"
import { toast } from "@/components/ui/use-toast"

interface HealthDataVisualizationProps {
  userId: string
}

// Tipos para datos de salud
interface HealthDataPoint {
  date: string
  steps?: number
  heart_rate?: number
  calories_burned?: number
  active_minutes?: number
  distance?: number
  sleep_duration?: number
  water_intake?: number
}

// Colores para gráficos
const COLORS = {
  steps: '#3b82f6',
  heart_rate: '#ef4444',
  calories: '#f97316',
  sleep: '#8b5cf6',
  water: '#0ea5e9',
  distance: '#10b981'
}

// Componente principal
export function HealthDataVisualization({ userId }: HealthDataVisualizationProps) {
  const [activeTab, setActiveTab] = useState("daily")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    endOfWeek(new Date(), { weekStartsOn: 1 })
  ])
  const [healthData, setHealthData] = useState<HealthDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line')
  const [metricType, setMetricType] = useState<'steps' | 'heart_rate' | 'calories' | 'sleep' | 'water' | 'distance'>('steps')
  
  const { healthStats } = useHealthData()
  
  // Cargar datos de salud
  useEffect(() => {
    const fetchHealthData = async () => {
      if (!userId) return
      
      setIsLoading(true)
      
      try {
        let startDate, endDate
        
        // Determinar rango de fechas según la pestaña activa
        if (activeTab === 'daily') {
          startDate = new Date(selectedDate)
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(selectedDate)
          endDate.setHours(23, 59, 59, 999)
        } else if (activeTab === 'weekly') {
          startDate = dateRange[0]
          endDate = dateRange[1]
        } else if (activeTab === 'monthly') {
          startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
          endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
        }
        
        // Consultar datos de Supabase
        const { data, error } = await supabase
          .from('health_data')
          .select('*')
          .eq('user_id', userId)
          .gte('date', startDate.toISOString())
          .lte('date', endDate.toISOString())
          .order('date', { ascending: true })
        
        if (error) throw error
        
        if (data) {
          // Transformar datos para visualización
          const formattedData = data.map(item => ({
            date: format(new Date(item.date), 'yyyy-MM-dd'),
            steps: item.steps,
            heart_rate: item.heart_rate,
            calories_burned: item.calories_burned,
            active_minutes: item.active_minutes,
            distance: item.distance,
            sleep_duration: item.sleep_duration,
            water_intake: item.water_intake
          }))
          
          // Si es vista diaria, asegurar que hay datos para cada hora
          if (activeTab === 'daily') {
            // Implementación simplificada - en una app real, se desglosaría por horas
            setHealthData(formattedData)
          } 
          // Si es vista semanal, asegurar que hay datos para cada día
          else if (activeTab === 'weekly') {
            const days = eachDayOfInterval({ start: dateRange[0], end: dateRange[1] })
            const filledData = days.map(day => {
              const dayStr = format(day, 'yyyy-MM-dd')
              const existingData = formattedData.find(d => d.date === dayStr)
              
              return existingData || { date: dayStr }
            })
            
            setHealthData(filledData)
          }
          // Si es vista mensual, asegurar que hay datos para cada día del mes
          else if (activeTab === 'monthly') {
            const days = eachDayOfInterval({ 
              start: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
              end: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
            })
            
            const filledData = days.map(day => {
              const dayStr = format(day, 'yyyy-MM-dd')
              const existingData = formattedData.find(d => d.date === dayStr)
              
              return existingData || { date: dayStr }
            })
            
            setHealthData(filledData)
          }
        }
      } catch (error) {
        console.error('Error al cargar datos de salud:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de salud",
          variant: "destructive"
        })
        
        // Usar datos simulados en caso de error
        generateMockData()
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchHealthData()
  }, [userId, activeTab, selectedDate, dateRange])
  
  // Generar datos simulados para demostración
  const generateMockData = () => {
    let mockData: HealthDataPoint[] = []
    
    if (activeTab === 'daily') {
      // Datos por hora para un día
      for (let hour = 0; hour < 24; hour++) {
        mockData.push({
          date: `${format(selectedDate, 'yyyy-MM-dd')} ${hour}:00`,
          steps: Math.floor(Math.random() * 1000) + 100,
          heart_rate: Math.floor(Math.random() * 20) + 60,
          calories_burned: Math.floor(Math.random() * 100) + 50,
          active_minutes: Math.floor(Math.random() * 30),
          distance: parseFloat((Math.random() * 0.5).toFixed(2)),
          sleep_duration: hour >= 22 || hour <= 6 ? parseFloat((Math.random() * 1).toFixed(1)) : 0,
          water_intake: hour >= 8 && hour <= 22 ? parseFloat((Math.random() * 0.3).toFixed(1)) : 0
        })
      }
    } else if (activeTab === 'weekly') {
      // Datos por día para una semana
      const days = eachDayOfInterval({ start: dateRange[0], end: dateRange[1] })
      
      mockData = days.map(day => ({
        date: format(day, 'yyyy-MM-dd'),
        steps: Math.floor(Math.random() * 5000) + 3000,
        heart_rate: Math.floor(Math.random() * 20) + 60,
        calories_burned: Math.floor(Math.random() * 500) + 1000,
        active_minutes: Math.floor(Math.random() * 60) + 30,
        distance: parseFloat((Math.random() * 3 + 1).toFixed(2)),
        sleep_duration: parseFloat((Math.random() * 2 + 6).toFixed(1)),
        water_intake: parseFloat((Math.random() * 1 + 1).toFixed(1))
      }))
    } else if (activeTab === 'monthly') {
      // Datos por día para un mes
      const days = eachDayOfInterval({ 
        start: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
        end: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
      })
      
      mockData = days.map(day => ({
        date: format(day, 'yyyy-MM-dd'),
        steps: Math.floor(Math.random() * 5000) + 3000,
        heart_rate: Math.floor(Math.random() * 20) + 60,
        calories_burned: Math.floor(Math.random() * 500) + 1000,
        active_minutes: Math.floor(Math.random() * 60) + 30,
        distance: parseFloat((Math.random() * 3 + 1).toFixed(2)),
        sleep_duration: parseFloat((Math.random() * 2 + 6).toFixed(1)),
        water_intake: parseFloat((Math.random() * 1 + 1).toFixed(1))
      }))
    }
    
    setHealthData(mockData)
  }
  
  // Navegar a día anterior
  const goToPreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1))
  }
  
  // Navegar a día siguiente
  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1))
  }
  
  // Navegar a semana anterior
  const goToPreviousWeek = () => {
    setDateRange(([start, end]) => [
      subDays(start, 7),
      subDays(end, 7)
    ])
  }
  
  // Navegar a semana siguiente
  const goToNextWeek = () => {
    setDateRange(([start, end]) => [
      addDays(start, 7),
      addDays(end, 7)
    ])
  }
  
  // Navegar a mes anterior
  const goToPreviousMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }
  
  // Navegar a mes siguiente
  const goToNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }
  
  // Exportar datos a CSV
  const handleExportCSV = () => {
    exportToCSV(healthData, `health-data-${activeTab}-${format(selectedDate, 'yyyy-MM-dd')}`)
    
    toast({
      title: "Datos exportados",
      description: "Los datos se han exportado correctamente en formato CSV",
    })
  }
  
  // Obtener título según la pestaña activa
  const getTitle = () => {
    if (activeTab === 'daily') {
      return `Datos del ${format(selectedDate, 'd MMMM yyyy', { locale: es })}`
    } else if (activeTab === 'weekly') {
      return `Semana del ${format(dateRange[0], 'd MMM', { locale: es })} al ${format(dateRange[1], 'd MMM yyyy', { locale: es })}`
    } else if (activeTab === 'monthly') {
      return `${format(selectedDate, 'MMMM yyyy', { locale: es })}`
    }
    return ''
  }
  
  // Obtener etiqueta para el eje X según la pestaña activa
  const getXAxisLabel = () => {
    if (activeTab === 'daily') {
      return 'Hora'
    } else if (activeTab === 'weekly') {
      return 'Día'
    } else if (activeTab === 'monthly') {
      return 'Día'
    }
    return ''
  }
  
  // Formatear etiqueta del eje X
  const formatXAxis = (value: string) => {
    if (activeTab === 'daily') {
      // Extraer la hora
      const hour = value.split(' ')[1]?.split(':')[0]
      return hour ? `${hour}h` : value
    } else if (activeTab === 'weekly' || activeTab === 'monthly') {
      // Mostrar solo el día
      const date = new Date(value)
      return format(date, 'd', { locale: es })
    }
    return value
  }
  
  // Obtener unidad según el tipo de métrica
  const getMetricUnit = () => {
    switch (metricType) {
      case 'steps':
        return 'pasos'
      case 'heart_rate':
        return 'bpm'
      case 'calories':
        return 'kcal'
      case 'sleep':
        return 'horas'
      case 'water':
        return 'L'
      case 'distance':
        return 'km'
      default:
        return ''
    }
  }
  
  // Obtener nombre de la métrica
  const getMetricName = () => {
    switch (metricType) {
      case 'steps':
        return 'Pasos'
      case 'heart_rate':
        return 'Frecuencia Cardíaca'
      case 'calories':
        return 'Calorías'
      case 'sleep':
        return 'Sueño'
      case 'water':
        return 'Agua'
      case 'distance':
        return 'Distancia'
      default:
        return ''
    }
  }
  
  // Obtener datos para el gráfico según la métrica seleccionada
  const getChartData = () => {
    return healthData.map(item => {
      let value = 0
      
      switch (metricType) {
        case 'steps':
          value = item.steps || 0
          break
        case 'heart_rate':
          value = item.heart_rate || 0
          break
        case 'calories':
          value = item.calories_burned || 0
          break
        case 'sleep':
          value = item.sleep_duration || 0
          break
        case 'water':
          value = item.water_intake || 0
          break
        case 'distance':
          value = item.distance || 0
          break
      }
      
      return {
        date: item.date,
        value
      }
    })
  }
  
  // Renderizar el gráfico según el tipo seleccionado
  const renderChart = () => {
    const data = getChartData()
    const color = COLORS[metricType]
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatXAxis} />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} ${getMetricUnit()}`, getMetricName()]}
                labelFormatter={(label) => {
                  if (activeTab === 'daily') {
                    return label
                  } else {
                    return format(new Date(label), 'dd/MM/yyyy')
                  }
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                name={getMetricName()}
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          ) : chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatXAxis} />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} ${getMetricUnit()}`, getMetricName()]}
                labelFormatter={(label) => {
                  if (activeTab === 'daily') {
                    return label
                  } else {
                    return format(new Date(label), 'dd/MM/yyyy')
                  }
                }}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                fill={color} 
                name={getMetricName()}
              />
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatXAxis} />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} ${getMetricUnit()}`, getMetricName()]}
                labelFormatter={(label) => {
                  if (activeTab === 'daily') {
                    return label
                  } else {
                    return format(new Date(label), 'dd/MM/yyyy')
                  }
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                fill={color} 
                fillOpacity={0.3}
                name={getMetricName()}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    )
  }
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{getTitle()}</CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="daily">Diario</TabsTrigger>
              <TabsTrigger value="weekly">Semanal</TabsTrigger>
              <TabsTrigger value="monthly">Mensual</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChartType('line')}
                className={chartType === 'line' ? 'bg-primary text-primary-foreground' : ''}
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChartType('bar')}
                className={chartType === 'bar' ? 'bg-primary text-primary-foreground' : ''}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChartType('area')}
                className={chartType === 'area' ? 'bg-primary text-primary-foreground' : ''}
              >
                <PieChartIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              {activeTab === 'daily' && (
                <>
                  <Button variant="outline" size="sm" onClick={goToPreviousDay}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">{format(selectedDate, 'd MMM yyyy', { locale: es })}</span>
                  <Button variant="outline" size="sm" onClick={goToNextDay}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {activeTab === 'weekly' && (
                <>
                  <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {format(dateRange[0], 'd MMM', { locale: es })} - {format(dateRange[1], 'd MMM', { locale: es })}
                  </span>
                  <Button variant="outline" size="sm" onClick={goToNextWeek}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {activeTab === 'monthly' && (
                <>
                  <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">{format(selectedDate, 'MMMM yyyy', { locale: es })}</span>
                  <Button variant="outline" size="sm" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMetricType('steps')}
                className={metricType === 'steps' ? 'bg-primary text-primary-foreground' : ''}
              >
                <Activity className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Pasos</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMetricType('heart_rate')}
                className={metricType === 'heart_rate' ? 'bg-primary text-primary-foreground' : ''}
              >
                <Heart className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">FC</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMetricType('calories')}
                className={metricType === 'calories' ? 'bg-primary text-primary-foreground' : ''}
              >
                <Flame className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Cal</span>
              </Button>
            </div>
          </div>
          
          {renderChart()}
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <MetricCard 
              title="Pasos"
              value={healthStats?.steps.current || 0}
              goal={healthStats?.steps.goal || 10000}
              icon={<Activity className="h-5 w-5" />}
              color={COLORS.steps}
              onClick={() => setMetricType('steps')}
            />
            
            <MetricCard 
              title="Frecuencia Cardíaca"
              value={healthStats?.heart_rate.current || 0}
              unit="bpm"
              icon={<Heart className="h-5 w-5" />}
              color={COLORS.heart_rate}
              onClick={() => setMetricType('heart_rate')}
            />
            
            <MetricCard 
              title="Calorías"
              value={healthStats?.calories.burned || 0}
              goal={healthStats?.calories.goal || 2200}
              icon={<Flame className="h-5 w-5" />}
              color={COLORS.calories}
              onClick={() => setMetricType('calories')}
            />
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Componente para tarjeta de métrica
interface MetricCardProps {
  title: string
  value: number
  goal?: number
  unit?: string
  icon: React.ReactNode
  color: string
  onClick?: () => void
}

function MetricCard({ title, value, goal, unit, icon, color, onClick }: MetricCardProps) {
  const percentage = goal ? Math.min(100, (value / goal) * 100) : 0
  
  return (
    <div 
      className="bg-white rounded-lg p-3 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center mb-2">
        <div className="p-1.5 rounded-md mr-2" style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
        <div className="text-sm font-medium">{title}</div>
      </div>
      
      <div className="text-lg font-semibold">
        {value.toLocaleString()} {unit}
      </div>
      
      {goal && (
        <div className="text-xs text-gray-500 mt-1">
          {percentage.toFixed(0)}% de {goal.toLocaleString()}
        </div>
      )}
    </div>
  )
}
