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
  ReferenceLine
} from "recharts"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  TrendingUp, 
  Download, 
  Share2, 
  ChevronRight,
  ChevronLeft,
  Filter,
  RefreshCw,
  FileText,
  BarChart3,
  Dumbbell,
  Zap
} from "lucide-react"
import { format, subMonths, isWithinInterval, startOfMonth, endOfMonth, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { WorkoutLog } from "@/lib/types/training"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress3D } from "@/components/ui/progress-3d"
import { exportToPDF } from "@/lib/export-utils"
import { toast } from "@/components/ui/use-toast"

interface TrainingCyclesVisualizationProps {
  logs: WorkoutLog[]
  userId: string
}

// Tipo para un ciclo de entrenamiento
interface TrainingCycle {
  id: string
  name: string
  startDate: string
  endDate: string
  type: 'volume' | 'strength' | 'hypertrophy' | 'deload' | 'maintenance'
  description?: string
}

// Tipo para datos de rendimiento por ciclo
interface CyclePerformanceData {
  cycle: string
  totalVolume: number
  maxWeight: number
  averageRIR: number
  workoutCount: number
  averageFatigue: number
  progress: number
  startDate: string
  endDate: string
  type: TrainingCycle['type']
}

export function TrainingCyclesVisualization({
  logs,
  userId
}: TrainingCyclesVisualizationProps) {
  const [cycles, setCycles] = useState<TrainingCycle[]>([])
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null)
  const [comparisonCycle, setComparisonCycle] = useState<string | null>(null)
  const [cyclePerformance, setCyclePerformance] = useState<CyclePerformanceData[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [metricType, setMetricType] = useState<'volume' | 'weight' | 'fatigue'>('volume')
  
  // Cargar ciclos de entrenamiento (simulados para este ejemplo)
  useEffect(() => {
    // En una implementación real, estos datos vendrían de Supabase
    const mockCycles: TrainingCycle[] = [
      {
        id: 'cycle-1',
        name: 'Ciclo de Volumen Q1',
        startDate: '2023-01-01',
        endDate: '2023-02-28',
        type: 'volume',
        description: 'Enfoque en incrementar volumen de entrenamiento'
      },
      {
        id: 'cycle-2',
        name: 'Ciclo de Fuerza Q2',
        startDate: '2023-03-01',
        endDate: '2023-04-30',
        type: 'strength',
        description: 'Enfoque en aumentar fuerza máxima'
      },
      {
        id: 'cycle-3',
        name: 'Ciclo de Hipertrofia Q3',
        startDate: '2023-05-01',
        endDate: '2023-06-30',
        type: 'hypertrophy',
        description: 'Enfoque en hipertrofia muscular'
      },
      {
        id: 'cycle-4',
        name: 'Ciclo de Mantenimiento Q4',
        startDate: '2023-07-01',
        endDate: '2023-08-31',
        type: 'maintenance',
        description: 'Mantenimiento de ganancias previas'
      },
      {
        id: 'cycle-5',
        name: 'Ciclo Actual',
        startDate: '2023-09-01',
        endDate: '2023-10-31',
        type: 'hypertrophy',
        description: 'Ciclo actual de entrenamiento'
      }
    ]
    
    setCycles(mockCycles)
    setSelectedCycle(mockCycles[mockCycles.length - 1].id) // Seleccionar el ciclo más reciente
    
    // Generar datos de rendimiento para cada ciclo
    const performanceData: CyclePerformanceData[] = mockCycles.map((cycle, index) => {
      // En una implementación real, estos datos se calcularían a partir de los logs
      const baseVolume = 50000 + (index * 5000)
      const baseWeight = 100 + (index * 10)
      const baseRIR = 2 - (index * 0.2)
      const baseFatigue = 6 + (index * 0.5)
      
      return {
        cycle: cycle.name,
        totalVolume: baseVolume + Math.random() * 10000,
        maxWeight: baseWeight + Math.random() * 20,
        averageRIR: Math.max(0, baseRIR + Math.random()),
        workoutCount: 12 + Math.floor(Math.random() * 8),
        averageFatigue: Math.min(10, baseFatigue + Math.random()),
        progress: Math.min(100, (index + 1) * 20 + Math.random() * 10),
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        type: cycle.type
      }
    })
    
    setCyclePerformance(performanceData)
    setIsLoading(false)
  }, [logs, userId])
  
  // Generar datos para la comparación de ciclos
  const getComparisonData = () => {
    if (!selectedCycle) return []
    
    const selectedData = cyclePerformance.find(data => data.cycle === cycles.find(c => c.id === selectedCycle)?.name)
    
    if (!selectedData) return []
    
    let comparisonData = []
    
    if (comparisonCycle) {
      const comparisonData = cyclePerformance.find(data => data.cycle === cycles.find(c => c.id === comparisonCycle)?.name)
      
      if (comparisonData) {
        return [
          {
            name: 'Volumen Total (kg)',
            [selectedData.cycle]: selectedData.totalVolume / 1000,
            [comparisonData.cycle]: comparisonData.totalVolume / 1000
          },
          {
            name: 'Peso Máximo (kg)',
            [selectedData.cycle]: selectedData.maxWeight,
            [comparisonData.cycle]: comparisonData.maxWeight
          },
          {
            name: 'RIR Promedio',
            [selectedData.cycle]: selectedData.averageRIR,
            [comparisonData.cycle]: comparisonData.averageRIR
          },
          {
            name: 'Fatiga Media',
            [selectedData.cycle]: selectedData.averageFatigue,
            [comparisonData.cycle]: comparisonData.averageFatigue
          },
          {
            name: 'Entrenamientos',
            [selectedData.cycle]: selectedData.workoutCount,
            [comparisonData.cycle]: comparisonData.workoutCount
          }
        ]
      }
    }
    
    return [
      {
        name: 'Volumen Total (kg)',
        [selectedData.cycle]: selectedData.totalVolume / 1000
      },
      {
        name: 'Peso Máximo (kg)',
        [selectedData.cycle]: selectedData.maxWeight
      },
      {
        name: 'RIR Promedio',
        [selectedData.cycle]: selectedData.averageRIR
      },
      {
        name: 'Fatiga Media',
        [selectedData.cycle]: selectedData.averageFatigue
      },
      {
        name: 'Entrenamientos',
        [selectedData.cycle]: selectedData.workoutCount
      }
    ]
  }
  
  // Generar datos para la progresión a lo largo del tiempo
  const getProgressionData = () => {
    return cyclePerformance.map(data => {
      const result: any = {
        name: data.cycle,
        type: data.type
      }
      
      switch (metricType) {
        case 'volume':
          result.value = data.totalVolume / 1000
          result.unit = 'k kg'
          break
        case 'weight':
          result.value = data.maxWeight
          result.unit = 'kg'
          break
        case 'fatigue':
          result.value = data.averageFatigue
          result.unit = '/10'
          break
      }
      
      return result
    })
  }
  
  // Exportar datos a PDF
  const handleExportPDF = () => {
    const selectedCycleData = cyclePerformance.find(
      data => data.cycle === cycles.find(c => c.id === selectedCycle)?.name
    )
    
    if (!selectedCycleData) return
    
    const comparisonData = comparisonCycle 
      ? cyclePerformance.find(data => data.cycle === cycles.find(c => c.id === comparisonCycle)?.name)
      : null
    
    const title = comparisonData 
      ? `Comparación: ${selectedCycleData.cycle} vs ${comparisonData.cycle}`
      : `Informe de Ciclo: ${selectedCycleData.cycle}`
    
    const content = {
      title,
      cycleData: selectedCycleData,
      comparisonData,
      progressionData: getProgressionData(),
      comparisonChartData: getComparisonData(),
      userId
    }
    
    exportToPDF(content, 'training-cycle-report')
    
    toast({
      title: "Informe exportado",
      description: "El informe de ciclo se ha exportado correctamente",
    })
  }
  
  // Compartir informe
  const handleShare = () => {
    // En una implementación real, esto generaría un enlace compartible
    toast({
      title: "Compartir informe",
      description: "Enlace de informe copiado al portapapeles",
    })
  }
  
  // Renderizar el contenido principal
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Visualización de Ciclos de Entrenamiento</h2>
        
        <div className="flex items-center space-x-2">
          <Button3D
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button3D>
          <Button3D
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button3D>
        </div>
      </div>
      
      {/* Selector de ciclos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Ciclo seleccionado</label>
          <Select value={selectedCycle || ''} onValueChange={setSelectedCycle}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar ciclo" />
            </SelectTrigger>
            <SelectContent>
              {cycles.map(cycle => (
                <SelectItem key={cycle.id} value={cycle.id}>
                  {cycle.name} ({format(new Date(cycle.startDate), 'MMM yyyy', { locale: es })})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Comparar con</label>
          <Select value={comparisonCycle || ''} onValueChange={setComparisonCycle}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar ciclo para comparar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Ninguno</SelectItem>
              {cycles
                .filter(cycle => cycle.id !== selectedCycle)
                .map(cycle => (
                  <SelectItem key={cycle.id} value={cycle.id}>
                    {cycle.name} ({format(new Date(cycle.startDate), 'MMM yyyy', { locale: es })})
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Pestañas de visualización */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
          <TabsTrigger value="progression">Progresión</TabsTrigger>
        </TabsList>
        
        {/* Contenido de las pestañas */}
        <TabsContent value="overview" className="space-y-4">
          {selectedCycle && (
            <CycleOverview 
              cycle={cycles.find(c => c.id === selectedCycle)!}
              performance={cyclePerformance.find(
                p => p.cycle === cycles.find(c => c.id === selectedCycle)?.name
              )!}
            />
          )}
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-4">
          <div className="flex justify-end mb-4">
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
                <TrendingUp className="h-4 w-4 mr-2" />
                Líneas
              </Button3D>
            </div>
          </div>
          
          <Card3D>
            <Card3DHeader>
              <Card3DTitle gradient={true}>Comparación de Ciclos</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart
                      data={getComparisonData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {selectedCycle && (
                        <Bar 
                          dataKey={cycles.find(c => c.id === selectedCycle)?.name || ''} 
                          fill="#3b82f6" 
                        />
                      )}
                      {comparisonCycle && (
                        <Bar 
                          dataKey={cycles.find(c => c.id === comparisonCycle)?.name || ''} 
                          fill="#10b981" 
                        />
                      )}
                    </BarChart>
                  ) : (
                    <LineChart
                      data={getComparisonData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {selectedCycle && (
                        <Line 
                          type="monotone" 
                          dataKey={cycles.find(c => c.id === selectedCycle)?.name || ''} 
                          stroke="#3b82f6" 
                          activeDot={{ r: 8 }} 
                        />
                      )}
                      {comparisonCycle && (
                        <Line 
                          type="monotone" 
                          dataKey={cycles.find(c => c.id === comparisonCycle)?.name || ''} 
                          stroke="#10b981" 
                          activeDot={{ r: 8 }} 
                        />
                      )}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </Card3DContent>
          </Card3D>
        </TabsContent>
        
        <TabsContent value="progression" className="space-y-4">
          <div className="flex justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Button3D
                variant={metricType === 'volume' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMetricType('volume')}
              >
                <Dumbbell className="h-4 w-4 mr-2" />
                Volumen
              </Button3D>
              <Button3D
                variant={metricType === 'weight' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMetricType('weight')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Peso
              </Button3D>
              <Button3D
                variant={metricType === 'fatigue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMetricType('fatigue')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Fatiga
              </Button3D>
            </div>
            
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
                <TrendingUp className="h-4 w-4 mr-2" />
                Líneas
              </Button3D>
            </div>
          </div>
          
          <Card3D>
            <Card3DHeader>
              <Card3DTitle gradient={true}>
                Progresión a lo largo del tiempo: {
                  metricType === 'volume' ? 'Volumen Total' :
                  metricType === 'weight' ? 'Peso Máximo' : 'Fatiga Media'
                }
              </Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart
                      data={getProgressionData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [`${value} ${getProgressionData()[0].unit}`, name]} />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        name={
                          metricType === 'volume' ? 'Volumen Total' :
                          metricType === 'weight' ? 'Peso Máximo' : 'Fatiga Media'
                        }
                        fill="#3b82f6" 
                      />
                    </BarChart>
                  ) : (
                    <LineChart
                      data={getProgressionData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [`${value} ${getProgressionData()[0].unit}`, name]} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name={
                          metricType === 'volume' ? 'Volumen Total' :
                          metricType === 'weight' ? 'Peso Máximo' : 'Fatiga Media'
                        }
                        stroke="#3b82f6" 
                        activeDot={{ r: 8 }} 
                      />
                      {/* Líneas de referencia para los deloads */}
                      {getProgressionData()
                        .filter(data => data.type === 'deload')
                        .map((data, index) => (
                          <ReferenceLine 
                            key={index}
                            x={data.name} 
                            stroke="#f97316" 
                            strokeDasharray="3 3"
                            label={{ value: 'Deload', position: 'top', fill: '#f97316' }}
                          />
                        ))
                      }
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </Card3DContent>
          </Card3D>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Componente para mostrar el resumen de un ciclo
function CycleOverview({ 
  cycle, 
  performance 
}: { 
  cycle: TrainingCycle, 
  performance: CyclePerformanceData 
}) {
  return (
    <div className="space-y-4">
      <Card3D>
        <Card3DHeader>
          <Card3DTitle gradient={true}>{cycle.name}</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {cycle.type === 'volume' ? 'Volumen' : 
                 cycle.type === 'strength' ? 'Fuerza' :
                 cycle.type === 'hypertrophy' ? 'Hipertrofia' :
                 cycle.type === 'deload' ? 'Descarga' : 'Mantenimiento'}
              </Badge>
              <Badge variant="outline" className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(cycle.startDate), 'd MMM', { locale: es })} - {format(new Date(cycle.endDate), 'd MMM yyyy', { locale: es })}
              </Badge>
            </div>
            
            {cycle.description && (
              <p className="text-sm text-gray-600">{cycle.description}</p>
            )}
            
            <div className="pt-2">
              <div className="text-sm font-medium mb-1">Progreso del ciclo</div>
              <Progress3D value={performance.progress} max={100} showValue height="8px" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <div className="text-sm text-gray-500">Volumen total</div>
                <div className="text-lg font-semibold">{(performance.totalVolume / 1000).toFixed(1)}k kg</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Peso máximo</div>
                <div className="text-lg font-semibold">{performance.maxWeight} kg</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">RIR promedio</div>
                <div className="text-lg font-semibold">{performance.averageRIR.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Fatiga media</div>
                <div className="text-lg font-semibold">{performance.averageFatigue.toFixed(1)}/10</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Entrenamientos</div>
                <div className="text-lg font-semibold">{performance.workoutCount}</div>
              </div>
            </div>
          </div>
        </Card3DContent>
      </Card3D>
    </div>
  )
}
