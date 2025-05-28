"use client"

import { useState } from "react"
import {
  Moon,
  Sun,
  Clock,
  Calendar,
  BarChart2,
  Heart,
  Activity,
  Thermometer,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SleepEntry, SleepStats } from "@/lib/types/wellness"

interface SleepAnalyticsProps {
  stats: SleepStats | null
  entries: SleepEntry[]
  isLoading: boolean
}

export function SleepAnalytics({ stats, entries, isLoading }: SleepAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Filtrar entradas según el rango de tiempo seleccionado
  const getFilteredEntries = (): SleepEntry[] => {
    if (!entries || entries.length === 0) return []

    const now = new Date()
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const cutoffDate = new Date(now.setDate(now.getDate() - days))

    return entries.filter(entry => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const filteredEntries = getFilteredEntries()

  // Obtener datos para gráficos
  const getDurationData = (): number[] => {
    return filteredEntries.map(entry => entry.duration / 60) // Convertir a horas
  }

  const getQualityData = (): number[] => {
    return filteredEntries.map(entry => entry.quality)
  }

  const getHrvData = (): number[] => {
    return filteredEntries
      .filter(entry => entry.hrv !== undefined)
      .map(entry => entry.hrv!)
  }

  const getRestingHeartRateData = (): number[] => {
    return filteredEntries
      .filter(entry => entry.restingHeartRate !== undefined)
      .map(entry => entry.restingHeartRate!)
  }

  const getDates = (): string[] => {
    return filteredEntries.map(entry => {
      const date = new Date(entry.date)
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    })
  }

  // Calcular tendencias
  const calculateTrend = (data: number[]): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable'

    const firstHalf = data.slice(0, Math.floor(data.length / 2))
    const secondHalf = data.slice(Math.floor(data.length / 2))

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

    const difference = secondAvg - firstAvg

    if (Math.abs(difference) < 0.1 * firstAvg) return 'stable'
    return difference > 0 ? 'up' : 'down'
  }

  // Renderizar icono de tendencia
  const renderTrendIcon = (trend: 'up' | 'down' | 'stable', isPositive: boolean = true) => {
    if (trend === 'up') {
      return <ArrowUp className={`h-4 w-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
    } else if (trend === 'down') {
      return <ArrowDown className={`h-4 w-4 ${isPositive ? 'text-red-500' : 'text-green-500'}`} />
    } else {
      return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  // Renderizar gráfico de barras simple
  const renderBarChart = (data: number[], maxValue: number, color: string) => {
    if (data.length === 0) return null

    return (
      <div className="flex items-end h-24 space-x-1">
        {data.map((value, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col items-center group"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`w-full ${color} rounded-sm transition-all hover:opacity-80`}
                  style={{ height: `${(value / maxValue) * 100}%` }}
                ></div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{value.toFixed(1)}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded-lg"></div>
          <div className="h-60 bg-gray-200 rounded-lg"></div>
          <div className="h-60 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!stats || filteredEntries.length === 0) {
    return (
      <Card3D>
        <Card3DContent className="flex flex-col items-center justify-center py-12">
          <BarChart2 className="h-16 w-16 text-primary/20 mb-4" />
          <h3 className="text-xl font-medium mb-2">No hay suficientes datos</h3>
          <p className="text-muted-foreground text-center mb-6">
            Necesitas al menos 2 registros de sueño para ver análisis y tendencias
          </p>
        </Card3DContent>
      </Card3D>
    )
  }

  // Datos para gráficos
  const durationData = getDurationData()
  const qualityData = getQualityData()
  const hrvData = getHrvData()
  const rhrData = getRestingHeartRateData()
  const dates = getDates()

  // Calcular tendencias
  const durationTrend = calculateTrend(durationData)
  const qualityTrend = calculateTrend(qualityData)
  const hrvTrend = calculateTrend(hrvData)
  const rhrTrend = calculateTrend(rhrData)

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Selector de rango de tiempo */}
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Análisis de sueño</h3>

          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card3D className="p-4">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-primary mr-1" />
                <span className="text-sm font-medium">Duración</span>
              </div>
              {renderTrendIcon(durationTrend)}
            </div>

            <div className="text-2xl font-bold mb-1">
              {stats.averageDuration ? (
                `${Math.floor(stats.averageDuration / 60)}h ${stats.averageDuration % 60}m`
              ) : (
                '--'
              )}
            </div>

            <span className="text-xs text-muted-foreground">Promedio</span>
          </div>
        </Card3D>

        <Card3D className="p-4">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <Moon className="h-4 w-4 text-primary mr-1" />
                <span className="text-sm font-medium">Calidad</span>
              </div>
              {renderTrendIcon(qualityTrend)}
            </div>

            <div className="text-2xl font-bold mb-1">
              {stats.averageQuality ? (
                `${stats.averageQuality.toFixed(1)}/10`
              ) : (
                '--'
              )}
            </div>

            <span className="text-xs text-muted-foreground">Promedio</span>
          </div>
        </Card3D>

        <Card3D className="p-4">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-primary mr-1" />
                <span className="text-sm font-medium">HRV</span>
              </div>
              {renderTrendIcon(hrvTrend)}
            </div>

            <div className="text-2xl font-bold mb-1">
              {stats.averageHrv ? (
                `${stats.averageHrv.toFixed(0)} ms`
              ) : (
                '--'
              )}
            </div>

            <span className="text-xs text-muted-foreground">Promedio</span>
          </div>
        </Card3D>

        <Card3D className="p-4">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-primary mr-1" />
                <span className="text-sm font-medium">FC Reposo</span>
              </div>
              {renderTrendIcon(rhrTrend, false)}
            </div>

            <div className="text-2xl font-bold mb-1">
              {stats.averageRestingHeartRate ? (
                `${stats.averageRestingHeartRate.toFixed(0)} ppm`
              ) : (
                '--'
              )}
            </div>

            <span className="text-xs text-muted-foreground">Promedio</span>
          </div>
        </Card3D>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de duración */}
        <Card3D>
          <Card3DHeader>
            <Card3DTitle>Duración del sueño</Card3DTitle>
          </Card3DHeader>
          <Card3DContent>
            {renderBarChart(durationData, Math.max(...durationData) * 1.1, 'bg-blue-500')}

            <div className="flex justify-between mt-2 text-xs text-muted-foreground overflow-hidden">
              {dates.map((date, index) => (
                <div
                  key={index}
                  className="text-center"
                  style={{
                    width: `${100 / dates.length}%`,
                    transform: dates.length > 10 ? `rotate(-45deg)` : 'none'
                  }}
                >
                  {dates.length <= 14 || index % Math.ceil(dates.length / 14) === 0 ? date : ''}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center text-sm">
                <span>Deuda de sueño</span>
                <span className="font-medium">
                  {stats.sleepDebt ? (
                    `${Math.floor(stats.sleepDebt / 60)}h ${stats.sleepDebt % 60}m`
                  ) : (
                    '0h 0m'
                  )}
                </span>
              </div>
              <Progress
                value={stats.sleepDebt ? Math.min(100, (stats.sleepDebt / 120) * 100) : 0}
                className="bg-gray-200 mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Sueño acumulado por debajo del objetivo en los últimos 7 días
              </p>
            </div>
          </Card3DContent>
        </Card3D>

        {/* Gráfico de calidad */}
        <Card3D>
          <Card3DHeader>
            <Card3DTitle>Calidad del sueño</Card3DTitle>
          </Card3DHeader>
          <Card3DContent>
            {renderBarChart(qualityData, 10, 'bg-green-500')}

            <div className="flex justify-between mt-2 text-xs text-muted-foreground overflow-hidden">
              {dates.map((date, index) => (
                <div
                  key={index}
                  className="text-center"
                  style={{
                    width: `${100 / dates.length}%`,
                    transform: dates.length > 10 ? `rotate(-45deg)` : 'none'
                  }}
                >
                  {dates.length <= 14 || index % Math.ceil(dates.length / 14) === 0 ? date : ''}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center text-sm">
                <span>Consistencia</span>
                <span className="font-medium">
                  {stats.consistencyScore ? (
                    `${stats.consistencyScore.toFixed(0)}%`
                  ) : (
                    '0%'
                  )}
                </span>
              </div>
              <Progress
                value={stats.consistencyScore || 0}
                className="bg-gray-200 mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Regularidad en tus horarios de sueño
              </p>
            </div>
          </Card3DContent>
        </Card3D>
      </div>

      {/* Distribución de fases de sueño */}
      {stats.averageDeepSleep && stats.averageRemSleep && stats.averageLightSleep && (
        <Card3D>
          <Card3DHeader>
            <Card3DTitle>Distribución de fases de sueño</Card3DTitle>
          </Card3DHeader>
          <Card3DContent>
            <div className="h-6 w-full rounded-full overflow-hidden flex">
              <div
                className="bg-indigo-600"
                style={{ width: `${(stats.averageDeepSleep / stats.averageDuration) * 100}%` }}
              ></div>
              <div
                className="bg-blue-500"
                style={{ width: `${(stats.averageRemSleep / stats.averageDuration) * 100}%` }}
              ></div>
              <div
                className="bg-sky-400"
                style={{ width: `${(stats.averageLightSleep / stats.averageDuration) * 100}%` }}
              ></div>
              <div
                className="bg-gray-300"
                style={{ width: `${(stats.averageAwakeTime || 0) / stats.averageDuration * 100}%` }}
              ></div>
            </div>

            <div className="flex justify-between mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div>
                <div>
                  <div className="text-sm font-medium">Sueño profundo</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.floor(stats.averageDeepSleep / 60)}h {stats.averageDeepSleep % 60}m
                    <span className="ml-1">
                      ({Math.round((stats.averageDeepSleep / stats.averageDuration) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <div>
                  <div className="text-sm font-medium">Sueño REM</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.floor(stats.averageRemSleep / 60)}h {stats.averageRemSleep % 60}m
                    <span className="ml-1">
                      ({Math.round((stats.averageRemSleep / stats.averageDuration) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-3 h-3 bg-sky-400 rounded-full mr-2"></div>
                <div>
                  <div className="text-sm font-medium">Sueño ligero</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.floor(stats.averageLightSleep / 60)}h {stats.averageLightSleep % 60}m
                    <span className="ml-1">
                      ({Math.round((stats.averageLightSleep / stats.averageDuration) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card3DContent>
        </Card3D>
      )}
      </div>
    </TooltipProvider>
  )
}
