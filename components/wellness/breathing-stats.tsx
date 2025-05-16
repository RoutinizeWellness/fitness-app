"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, Wind, Calendar, 
  Clock, Award, TrendingUp, 
  RefreshCw, Filter
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getBreathingStats } from "@/lib/breathing-service"
import { useUser } from "@/hooks/use-user"

interface BreathingStatsProps {
  sessionType?: string
  className?: string
}

export function BreathingStats({
  sessionType = 'wim_hof',
  className
}: BreathingStatsProps) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')
  
  const { user } = useUser()
  
  // Cargar estadísticas
  const loadStats = async () => {
    if (!user) return
    
    setIsLoading(true)
    
    try {
      // Calcular fechas para el filtro
      let startDate: string | undefined
      const now = new Date()
      
      if (timeRange === 'week') {
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        startDate = weekAgo.toISOString()
      } else if (timeRange === 'month') {
        const monthAgo = new Date(now)
        monthAgo.setMonth(now.getMonth() - 1)
        startDate = monthAgo.toISOString()
      }
      
      const { data, error } = await getBreathingStats(user.id, {
        startDate,
        sessionType
      })
      
      if (error) {
        console.error('Error al cargar estadísticas:', error)
        return
      }
      
      setStats(data)
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadStats()
  }, [user, timeRange, sessionType])
  
  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card3D className={className}>
        <Card3DHeader>
          <Card3DTitle>Estadísticas de respiración</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  // Si no hay estadísticas
  if (!stats || stats.totalSessions === 0) {
    return (
      <Card3D className={className}>
        <Card3DHeader>
          <Card3DTitle>Estadísticas de respiración</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="text-center py-6">
            <Wind className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay datos disponibles</h3>
            <p className="text-sm text-gray-500 mb-4">
              Completa tu primera sesión de respiración para ver estadísticas.
            </p>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  // Formatear el tiempo en minutos y segundos
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <Card3D className={className}>
      <Card3DHeader>
        <div className="flex justify-between items-center">
          <Card3DTitle>Estadísticas de respiración</Card3DTitle>
          <Button3D variant="ghost" size="icon" onClick={loadStats}>
            <RefreshCw className="h-4 w-4" />
          </Button3D>
        </div>
      </Card3DHeader>
      <Card3DContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="progress">Progreso</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="flex justify-end mb-2">
              <div className="flex bg-gray-100 rounded-md p-1">
                <Button3D 
                  variant={timeRange === 'week' ? "default" : "ghost"} 
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setTimeRange('week')}
                >
                  Semana
                </Button3D>
                <Button3D 
                  variant={timeRange === 'month' ? "default" : "ghost"} 
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setTimeRange('month')}
                >
                  Mes
                </Button3D>
                <Button3D 
                  variant={timeRange === 'all' ? "default" : "ghost"} 
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setTimeRange('all')}
                >
                  Todo
                </Button3D>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Calendar className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm font-medium">Sesiones</span>
                </div>
                <div className="text-xl font-bold">
                  {stats.totalSessions}
                </div>
                <p className="text-xs text-gray-500">Total de sesiones</p>
              </div>
              
              <div className="bg-indigo-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <RefreshCw className="h-4 w-4 text-indigo-500 mr-1" />
                  <span className="text-sm font-medium">Rondas</span>
                </div>
                <div className="text-xl font-bold">
                  {stats.totalRounds}
                </div>
                <p className="text-xs text-gray-500">Total de rondas</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Clock className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-sm font-medium">Retención</span>
                </div>
                <div className="text-xl font-bold">
                  {formatTime(stats.avgRetentionTime)}
                </div>
                <p className="text-xs text-gray-500">Tiempo promedio</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Award className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium">Récord</span>
                </div>
                <div className="text-xl font-bold">
                  {formatTime(stats.maxRetentionTime)}
                </div>
                <p className="text-xs text-gray-500">Tiempo máximo</p>
              </div>
            </div>
            
            {stats.feelingChange !== 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm font-medium">Cambio en sensación</span>
                </div>
                <div className="flex items-center">
                  <Progress3D 
                    value={(stats.feelingChange / 4) * 100} 
                    max={100} 
                    className="flex-1 mr-2" 
                  />
                  <span className="text-sm font-medium">
                    {stats.feelingChange > 0 ? '+' : ''}{stats.feelingChange.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Diferencia promedio entre antes y después de las sesiones
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-4">
            {stats.progress && stats.progress.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Tiempo de retención promedio</h3>
                  <div className="h-40 bg-gray-50 rounded-lg p-3 relative">
                    {/* Aquí iría un gráfico de progreso */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-sm text-gray-500">Gráfico de progreso</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Últimas sesiones</h3>
                  <div className="space-y-2">
                    {stats.progress.slice(0, 5).map((session: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div className="text-sm">{session.date}</div>
                          <div className="text-sm font-medium">{formatTime(session.avgRetention)}</div>
                        </div>
                        <div className="mt-1">
                          <Progress3D 
                            value={(session.avgRetention / stats.maxRetentionTime) * 100} 
                            max={100} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay datos de progreso</h3>
                <p className="text-sm text-gray-500">
                  Completa más sesiones para ver tu progreso.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card3DContent>
    </Card3D>
  )
}
