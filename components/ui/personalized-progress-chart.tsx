"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOrganicTheme } from "@/components/theme/organic-theme-provider"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from "recharts"
import { 
  BarChart2, 
  LineChart as LineChartIcon, 
  PieChart, 
  Calendar, 
  Download,
  RefreshCw,
  Maximize2,
  Info
} from "lucide-react"

interface ChartData {
  [key: string]: any
}

interface PersonalizedProgressChartProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  data: ChartData[]
  dataKeys: string[]
  colors?: string[]
  xAxisKey?: string
  chartType?: "line" | "bar" | "area" | "radar"
  timeRanges?: { label: string; value: string }[]
  defaultTimeRange?: string
  onTimeRangeChange?: (range: string) => void
  isLoading?: boolean
  onRefresh?: () => void
  onExport?: () => void
  onFullscreen?: () => void
  height?: number
  showLegend?: boolean
  animationDelay?: number
}

const PersonalizedProgressChart = React.forwardRef<HTMLDivElement, PersonalizedProgressChartProps>(
  ({ 
    className, 
    title,
    description,
    data,
    dataKeys,
    colors,
    xAxisKey = "date",
    chartType = "line",
    timeRanges,
    defaultTimeRange,
    onTimeRangeChange,
    isLoading = false,
    onRefresh,
    onExport,
    onFullscreen,
    height = 300,
    showLegend = true,
    animationDelay = 0,
    ...props 
  }, ref) => {
    const { isDark, animation } = useOrganicTheme()
    const [selectedTimeRange, setSelectedTimeRange] = React.useState(defaultTimeRange || (timeRanges && timeRanges[0]?.value))
    const [selectedChartType, setSelectedChartType] = React.useState(chartType)
    
    // Determinar si se deben usar animaciones
    const shouldAnimate = animation !== "none"
    
    // Configurar las animaciones
    const containerVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.5,
          delay: animationDelay,
          ease: [0.43, 0.13, 0.23, 0.96]
        }
      }
    }
    
    // Manejar cambio de rango de tiempo
    const handleTimeRangeChange = (value: string) => {
      setSelectedTimeRange(value)
      if (onTimeRangeChange) {
        onTimeRangeChange(value)
      }
    }
    
    // Obtener colores para el gráfico
    const getChartColors = () => {
      if (colors && colors.length > 0) {
        return colors
      }
      
      return isDark 
        ? ['#60a5fa', '#4ade80', '#f97316', '#a78bfa', '#f43f5e']
        : ['#3b82f6', '#22c55e', '#ea580c', '#8b5cf6', '#ec4899']
    }
    
    // Renderizar el gráfico según el tipo seleccionado
    const renderChart = () => {
      if (isLoading) {
        return (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        )
      }
      
      if (!data || data.length === 0) {
        return (
          <div className="flex flex-col justify-center items-center h-full text-center">
            <Info className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No hay datos disponibles para mostrar</p>
          </div>
        )
      }
      
      switch (selectedChartType) {
        case 'line':
          return (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                <XAxis 
                  dataKey={xAxisKey} 
                  tick={{ fill: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
                />
                <YAxis tick={{ fill: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.9)',
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: isDark ? 'white' : 'black',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
                {showLegend && <Legend />}
                {dataKeys.map((key, index) => (
                  <Line 
                    key={key} 
                    type="monotone" 
                    dataKey={key} 
                    stroke={getChartColors()[index % getChartColors().length]} 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                    dot={{ strokeWidth: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )
        
        case 'bar':
          return (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                <XAxis 
                  dataKey={xAxisKey} 
                  tick={{ fill: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
                />
                <YAxis tick={{ fill: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.9)',
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: isDark ? 'white' : 'black',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
                {showLegend && <Legend />}
                {dataKeys.map((key, index) => (
                  <Bar 
                    key={key} 
                    dataKey={key} 
                    fill={getChartColors()[index % getChartColors().length]} 
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )
        
        case 'area':
          return (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                <XAxis 
                  dataKey={xAxisKey} 
                  tick={{ fill: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
                />
                <YAxis tick={{ fill: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.9)',
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: isDark ? 'white' : 'black',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
                {showLegend && <Legend />}
                {dataKeys.map((key, index) => (
                  <Area 
                    key={key} 
                    type="monotone" 
                    dataKey={key} 
                    stroke={getChartColors()[index % getChartColors().length]} 
                    fill={`${getChartColors()[index % getChartColors().length]}40`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )
        
        case 'radar':
          return (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data}>
                <PolarGrid stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} />
                <PolarAngleAxis 
                  dataKey={xAxisKey} 
                  tick={{ fill: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
                />
                <PolarRadiusAxis tick={{ fill: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.9)',
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: isDark ? 'white' : 'black',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
                {showLegend && <Legend />}
                {dataKeys.map((key, index) => (
                  <Radar 
                    key={key} 
                    name={key} 
                    dataKey={key} 
                    stroke={getChartColors()[index % getChartColors().length]} 
                    fill={`${getChartColors()[index % getChartColors().length]}40`} 
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          )
        
        default:
          return null
      }
    }
    
    // Renderizar el componente
    const content = (
      <Card 
        ref={ref}
        className={cn(
          "chart-container overflow-hidden",
          className
        )}
        {...props}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {timeRanges && timeRanges.length > 0 && (
              <Select
                value={selectedTimeRange}
                onValueChange={handleTimeRangeChange}
              >
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Select
              value={selectedChartType}
              onValueChange={setSelectedChartType}
            >
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Línea</SelectItem>
                <SelectItem value="bar">Barras</SelectItem>
                <SelectItem value="area">Área</SelectItem>
                <SelectItem value="radar">Radar</SelectItem>
              </SelectContent>
            </Select>
            
            {onRefresh && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            
            {onExport && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            {onFullscreen && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div style={{ height: `${height}px` }}>
          {renderChart()}
        </div>
      </Card>
    )
    
    // Aplicar animación si está habilitada
    if (shouldAnimate) {
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          {content}
        </motion.div>
      )
    }
    
    return content
  }
)
PersonalizedProgressChart.displayName = "PersonalizedProgressChart"

export { PersonalizedProgressChart }
