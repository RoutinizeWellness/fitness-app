"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  ComposedChart
} from "recharts"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  TrendingUp,
  BarChart3,
  Dumbbell,
  Zap,
  RefreshCw,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Info,
  Download,
  Share2
} from "lucide-react"
import { format, addWeeks, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MesocycleProgressVisualizationProps {
  userId?: string
  mesocycleId?: string
}

export function MesocycleProgressVisualization({
  userId,
  mesocycleId
}: MesocycleProgressVisualizationProps) {
  const [chartType, setChartType] = useState<"line" | "bar" | "area" | "composed">("composed")
  const [metricType, setMetricType] = useState<"volume" | "intensity" | "fatigue" | "all">("all")
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<"current" | "comparison" | "all">("current")

  // Generate sample data for visualization
  const generateSampleData = () => {
    const weeks = 8
    const data = []

    for (let i = 1; i <= weeks; i++) {
      // Calculate values with some variation to simulate real data
      const baseVolume = 100 + (i * 5) // Increasing volume
      const baseIntensity = 70 + (i * 2) // Increasing intensity
      const baseFatigue = 40 + (i * 5) // Increasing fatigue

      // Add some randomness
      const volumeVariation = Math.random() * 10 - 5
      const intensityVariation = Math.random() * 6 - 3
      const fatigueVariation = Math.random() * 8 - 4

      // Simulate deload weeks
      const isDeload = i % 4 === 0
      const volumeMultiplier = isDeload ? 0.6 : 1
      const intensityMultiplier = isDeload ? 0.8 : 1
      const fatigueMultiplier = isDeload ? 0.5 : 1

      data.push({
        name: `Semana ${i}`,
        volume: Math.round((baseVolume + volumeVariation) * volumeMultiplier),
        intensity: Math.round((baseIntensity + intensityVariation) * intensityMultiplier),
        fatigue: Math.round((baseFatigue + fatigueVariation) * fatigueMultiplier),
        isDeload,
        performance: Math.round(85 + (i * 1.5) + (Math.random() * 6 - 3)),
        volumeUnit: "toneladas",
        intensityUnit: "%",
        fatigueUnit: "/100"
      })
    }

    return data
  }

  const chartData = generateSampleData()

  // Muscle group options
  const muscleGroups = [
    { value: "all", label: "Todos los grupos musculares" },
    { value: "chest", label: "Pecho" },
    { value: "back", label: "Espalda" },
    { value: "legs", label: "Piernas" },
    { value: "shoulders", label: "Hombros" },
    { value: "arms", label: "Brazos" }
  ]

  // Function to get the appropriate color for each metric
  const getMetricColor = (metric: string) => {
    switch (metric) {
      case "volume":
        return "#3b82f6" // blue
      case "intensity":
        return "#ef4444" // red
      case "fatigue":
        return "#f59e0b" // amber
      case "performance":
        return "#10b981" // green
      default:
        return "#6366f1" // indigo
    }
  }

  // Function to get the appropriate unit for each metric
  const getMetricUnit = (metric: string) => {
    switch (metric) {
      case "volume":
        return "toneladas"
      case "intensity":
        return "%"
      case "fatigue":
      case "performance":
        return "/100"
      default:
        return ""
    }
  }

  // Custom tooltip formatter
  const formatTooltip = (value: number, name: string) => {
    const unit = getMetricUnit(name.toLowerCase())
    const formattedName = name === "volume" ? "Volumen" :
                          name === "intensity" ? "Intensidad" :
                          name === "fatigue" ? "Fatiga" :
                          name === "performance" ? "Rendimiento" : name

    return [`${value} ${unit}`, formattedName]
  }

  return (
    <Card3D>
      <Card3DHeader>
        <Card3DTitle gradient={true}>Progreso a lo largo del Mesociclo</Card3DTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={metricType} onValueChange={(value: any) => setMetricType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar métrica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las métricas</SelectItem>
              <SelectItem value="volume">Volumen</SelectItem>
              <SelectItem value="intensity">Intensidad</SelectItem>
              <SelectItem value="fatigue">Fatiga</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Seleccionar grupo muscular" />
            </SelectTrigger>
            <SelectContent>
              {muscleGroups.map(group => (
                <SelectItem key={group.value} value={group.value}>
                  {group.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card3DHeader>
      <Card3DContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'composed' ? (
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={formatTooltip} />
                <Legend />

                {(metricType === 'all' || metricType === 'volume') && (
                  <Bar
                    yAxisId="left"
                    dataKey="volume"
                    name="Volumen"
                    fill={getMetricColor("volume")}
                    barSize={20}
                  />
                )}

                {(metricType === 'all' || metricType === 'intensity') && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="intensity"
                    name="Intensidad"
                    stroke={getMetricColor("intensity")}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}

                {(metricType === 'all' || metricType === 'fatigue') && (
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="fatigue"
                    name="Fatiga"
                    fill={getMetricColor("fatigue")}
                    stroke={getMetricColor("fatigue")}
                    fillOpacity={0.3}
                  />
                )}

                {(metricType === 'all') && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="performance"
                    name="Rendimiento"
                    stroke={getMetricColor("performance")}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                  />
                )}

                {chartData.map((data, index) => (
                  data.isDeload && (
                    <ReferenceLine
                      key={`deload-${index}`}
                      x={data.name}
                      stroke="#f59e0b"
                      strokeDasharray="3 3"
                      label={{ value: 'Deload', position: 'top', fill: '#f59e0b' }}
                      yAxisId="left"
                    />
                  )
                ))}
              </ComposedChart>
            ) : chartType === 'line' ? (
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={formatTooltip} />
                <Legend />

                {(metricType === 'all' || metricType === 'volume') && (
                  <Line
                    type="monotone"
                    dataKey="volume"
                    name="Volumen"
                    stroke={getMetricColor("volume")}
                    activeDot={{ r: 8 }}
                  />
                )}

                {(metricType === 'all' || metricType === 'intensity') && (
                  <Line
                    type="monotone"
                    dataKey="intensity"
                    name="Intensidad"
                    stroke={getMetricColor("intensity")}
                    activeDot={{ r: 8 }}
                  />
                )}

                {(metricType === 'all' || metricType === 'fatigue') && (
                  <Line
                    type="monotone"
                    dataKey="fatigue"
                    name="Fatiga"
                    stroke={getMetricColor("fatigue")}
                    activeDot={{ r: 8 }}
                  />
                )}

                {chartData.map((data, index) => (
                  data.isDeload && (
                    <ReferenceLine
                      key={`deload-${index}`}
                      x={data.name}
                      stroke="#f59e0b"
                      strokeDasharray="3 3"
                      label={{ value: 'Deload', position: 'top', fill: '#f59e0b' }}
                      yAxisId="0"
                    />
                  )
                ))}
              </LineChart>
            ) : chartType === 'bar' ? (
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={formatTooltip} />
                <Legend />

                {(metricType === 'all' || metricType === 'volume') && (
                  <Bar dataKey="volume" name="Volumen" fill={getMetricColor("volume")} />
                )}

                {(metricType === 'all' || metricType === 'intensity') && (
                  <Bar dataKey="intensity" name="Intensidad" fill={getMetricColor("intensity")} />
                )}

                {(metricType === 'all' || metricType === 'fatigue') && (
                  <Bar dataKey="fatigue" name="Fatiga" fill={getMetricColor("fatigue")} />
                )}

                {chartData.map((data, index) => (
                  data.isDeload && (
                    <ReferenceLine
                      key={`deload-${index}`}
                      x={data.name}
                      stroke="#f59e0b"
                      strokeDasharray="3 3"
                      label={{ value: 'Deload', position: 'top', fill: '#f59e0b' }}
                      yAxisId="0"
                    />
                  )
                ))}
              </BarChart>
            ) : (
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={formatTooltip} />
                <Legend />

                {(metricType === 'all' || metricType === 'volume') && (
                  <Area
                    type="monotone"
                    dataKey="volume"
                    name="Volumen"
                    fill={getMetricColor("volume")}
                    stroke={getMetricColor("volume")}
                    fillOpacity={0.3}
                  />
                )}

                {(metricType === 'all' || metricType === 'intensity') && (
                  <Area
                    type="monotone"
                    dataKey="intensity"
                    name="Intensidad"
                    fill={getMetricColor("intensity")}
                    stroke={getMetricColor("intensity")}
                    fillOpacity={0.3}
                  />
                )}

                {(metricType === 'all' || metricType === 'fatigue') && (
                  <Area
                    type="monotone"
                    dataKey="fatigue"
                    name="Fatiga"
                    fill={getMetricColor("fatigue")}
                    stroke={getMetricColor("fatigue")}
                    fillOpacity={0.3}
                  />
                )}

                {chartData.map((data, index) => (
                  data.isDeload && (
                    <ReferenceLine
                      key={`deload-${index}`}
                      x={data.name}
                      stroke="#f59e0b"
                      strokeDasharray="3 3"
                      label={{ value: 'Deload', position: 'top', fill: '#f59e0b' }}
                      yAxisId="0"
                    />
                  )
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-2">
            <Button3D
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Barras
            </Button3D>
            <Button3D
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              <LineChartIcon className="h-4 w-4 mr-2" />
              Líneas
            </Button3D>
            <Button3D
              variant={chartType === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('area')}
            >
              <AreaChartIcon className="h-4 w-4 mr-2" />
              Área
            </Button3D>
            <Button3D
              variant={chartType === 'composed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('composed')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Compuesto
            </Button3D>
          </div>

          <div className="flex items-center space-x-2">
            <Button3D variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button3D>
            <Button3D variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button3D>
          </div>
        </div>
      </Card3DContent>
    </Card3D>
  )
}
