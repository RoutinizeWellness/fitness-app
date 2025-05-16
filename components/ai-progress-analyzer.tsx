"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles, TrendingUp, ArrowUp, ArrowDown, Minus, BarChart2, LineChart, PieChart } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { analyzeUserProgress } from "@/lib/ai-service"
import { AIProgressAnalysis } from "@/lib/ai-types"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts"

interface AIProgressAnalyzerProps {
  userId: string
}

export default function AIProgressAnalyzer({ userId }: AIProgressAnalyzerProps) {
  const [period, setPeriod] = useState<'week' | 'month' | '3months'>('month')
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<AIProgressAnalysis | null>(null)
  
  // Cargar análisis al montar el componente o cambiar el período
  useEffect(() => {
    if (userId) {
      loadAnalysis()
    }
  }, [userId, period])
  
  // Función para cargar el análisis
  const loadAnalysis = async () => {
    try {
      setIsLoading(true)
      const analysis = await analyzeUserProgress(userId, period)
      setAnalysis(analysis)
    } catch (error) {
      console.error("Error al cargar análisis:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el análisis de progreso",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Datos para el gráfico de radar
  const radarData = analysis ? [
    {
      subject: 'Volumen',
      A: Math.max(0, 50 + analysis.metrics.volume_change),
      fullMark: 100,
    },
    {
      subject: 'Fuerza',
      A: Math.max(0, 50 + analysis.metrics.strength_change),
      fullMark: 100,
    },
    {
      subject: 'Consistencia',
      A: analysis.metrics.consistency,
      fullMark: 100,
    },
    {
      subject: 'Recuperación',
      A: analysis.metrics.recovery_quality,
      fullMark: 100,
    },
  ] : []
  
  // Datos para el gráfico de barras
  const barData = analysis ? [
    {
      name: 'Volumen',
      value: analysis.metrics.volume_change,
    },
    {
      name: 'Fuerza',
      value: analysis.metrics.strength_change,
    },
  ] : []
  
  // Renderizar indicador de cambio
  const renderChangeIndicator = (value: number) => {
    if (value > 0) {
      return <ArrowUp className="h-4 w-4 text-green-500" />
    } else if (value < 0) {
      return <ArrowDown className="h-4 w-4 text-red-500" />
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Sparkles className="h-5 w-5 text-blue-500" />
        <h2 className="text-2xl font-bold tracking-tight">Análisis de Progreso IA</h2>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Análisis inteligente de tu progreso basado en tus datos de entrenamiento
        </p>
        
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={(value: 'week' | 'month' | '3months') => setPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecciona período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={loadAnalysis} disabled={isLoading}>
            {isLoading ? (
              <Skeleton className="h-4 w-4 rounded-full animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      ) : analysis ? (
        <div className="space-y-4">
          {/* Resumen */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Resumen del período</CardTitle>
              <CardDescription>
                {period === 'week' ? 'Última semana' : 
                 period === 'month' ? 'Último mes' : 'Últimos 3 meses'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{analysis.summary}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Volumen</span>
                    <div className="flex items-center">
                      {renderChangeIndicator(analysis.metrics.volume_change)}
                      <span className={`text-sm font-bold ml-1 ${
                        analysis.metrics.volume_change > 0 ? 'text-green-500' : 
                        analysis.metrics.volume_change < 0 ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {analysis.metrics.volume_change > 0 ? '+' : ''}
                        {analysis.metrics.volume_change}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fuerza</span>
                    <div className="flex items-center">
                      {renderChangeIndicator(analysis.metrics.strength_change)}
                      <span className={`text-sm font-bold ml-1 ${
                        analysis.metrics.strength_change > 0 ? 'text-green-500' : 
                        analysis.metrics.strength_change < 0 ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {analysis.metrics.strength_change > 0 ? '+' : ''}
                        {analysis.metrics.strength_change}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Consistencia</span>
                    <span className="text-sm font-bold">
                      {analysis.metrics.consistency}%
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Recuperación</span>
                    <span className="text-sm font-bold">
                      {analysis.metrics.recovery_quality}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Análisis de rendimiento</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Rendimiento"
                      dataKey="A"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Cambios en métricas clave</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    width={500}
                    height={300}
                    data={barData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Cambio %" fill="#8884d8" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Insights y recomendaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.insights.map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 p-1 rounded-full mr-2 mt-0.5">
                        <TrendingUp className="h-3 w-3" />
                      </span>
                      <span className="text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2 mt-0.5">
                        <Sparkles className="h-3 w-3" />
                      </span>
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart2 className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">No hay datos de análisis disponibles</p>
            <p className="text-sm text-gray-400 mt-1">Selecciona un período y haz clic en el botón de actualizar</p>
            <Button className="mt-4" onClick={loadAnalysis}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generar análisis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
