"use client"

import { useState } from "react"
import { 
  Calendar, Clock, ChevronRight, 
  ChevronDown, ChevronUp, BarChart3,
  Dumbbell, TrendingUp, TrendingDown, 
  Minus, Filter
} from "lucide-react"
import { Card3D, Card3DContent } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { WorkoutLog } from "@/lib/types/training"
import { motion, AnimatePresence } from "framer-motion"

interface WorkoutHistoryProps {
  logs: WorkoutLog[]
}

export function WorkoutHistory({
  logs
}: WorkoutHistoryProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)
  const [filterPeriod, setFilterPeriod] = useState("all")
  
  // Función para alternar la expansión de un log
  const toggleLogExpansion = (logId: string) => {
    if (expandedLogId === logId) {
      setExpandedLogId(null)
    } else {
      setExpandedLogId(logId)
    }
  }
  
  // Función para formatear la duración
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    
    return `${mins}m`
  }
  
  // Función para obtener el icono de rendimiento
  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case "better":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "worse":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }
  
  // Filtrar logs por período
  const filteredLogs = logs.filter(log => {
    if (filterPeriod === "all") return true
    
    const logDate = new Date(log.date)
    const now = new Date()
    
    switch (filterPeriod) {
      case "week":
        const weekAgo = new Date()
        weekAgo.setDate(now.getDate() - 7)
        return logDate >= weekAgo
      case "month":
        const monthAgo = new Date()
        monthAgo.setMonth(now.getMonth() - 1)
        return logDate >= monthAgo
      case "year":
        const yearAgo = new Date()
        yearAgo.setFullYear(now.getFullYear() - 1)
        return logDate >= yearAgo
      default:
        return true
    }
  })
  
  // Ordenar logs por fecha (más reciente primero)
  const sortedLogs = [...filteredLogs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  // Nombres de ejercicios
  const exerciseNames: Record<string, string> = {
    "bench-press": "Press de banca",
    "incline-dumbbell-press": "Press inclinado con mancuernas",
    "triceps-pushdown": "Extensiones de tríceps en polea",
    "pull-up": "Dominadas",
    "barbell-row": "Remo con barra",
    "bicep-curl": "Curl de bíceps con mancuernas",
    "squat": "Sentadilla",
    "leg-press": "Prensa de piernas",
    "overhead-press": "Press militar",
    "dumbbell-press": "Press con mancuernas",
    "machine-chest-press": "Press en máquina",
    "push-up": "Flexiones",
    "incline-bench-press": "Press inclinado con barra",
    "cable-fly": "Aperturas con cable",
    "skull-crusher": "Extensiones de tríceps tumbado",
    "dips": "Fondos",
    "lat-pulldown": "Jalón al pecho",
    "assisted-pull-up": "Dominadas asistidas",
    "dumbbell-row": "Remo con mancuerna",
    "cable-row": "Remo en polea",
    "barbell-curl": "Curl de bíceps con barra",
    "hammer-curl": "Curl martillo",
    "front-squat": "Sentadilla frontal",
    "hack-squat": "Hack squat",
    "lunges": "Zancadas",
    "dumbbell-shoulder-press": "Press de hombros con mancuernas",
    "arnold-press": "Press Arnold"
  }
  
  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Historial de entrenamientos</h2>
        
        <div className="flex items-center space-x-2">
          <Button3D
            variant={filterPeriod === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPeriod("all")}
          >
            Todos
          </Button3D>
          <Button3D
            variant={filterPeriod === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPeriod("week")}
          >
            Semana
          </Button3D>
          <Button3D
            variant={filterPeriod === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPeriod("month")}
          >
            Mes
          </Button3D>
        </div>
      </div>
      
      {sortedLogs.length === 0 ? (
        <Card3D className="p-6 text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay entrenamientos registrados</h3>
            <p className="text-gray-500 mb-4">Comienza a entrenar para ver tu historial</p>
          </div>
        </Card3D>
      ) : (
        <div className="space-y-4">
          {sortedLogs.map((log) => {
            const isExpanded = expandedLogId === log.id
            const logDate = new Date(log.date)
            
            return (
              <Card3D key={log.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {format(logDate, "EEEE, d 'de' MMMM", { locale: es })}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline" className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(log.duration)}
                        </Badge>
                        <Badge variant="outline" className="flex items-center">
                          <Dumbbell className="h-3 w-3 mr-1" />
                          {log.completedSets.length} ejercicios
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`flex items-center ${
                            log.performance === "better" ? "text-green-600" : 
                            log.performance === "worse" ? "text-red-600" : ""
                          }`}
                        >
                          {getPerformanceIcon(log.performance)}
                          <span className="ml-1">
                            {log.performance === "better" ? "Mejor" : 
                             log.performance === "worse" ? "Peor" : "Igual"}
                          </span>
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Button3D
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleLogExpansion(log.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button3D>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 space-y-4"
                      >
                        {/* Detalles del entrenamiento */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Ejercicios realizados</h4>
                          
                          {log.completedSets.map((set, index) => {
                            const exerciseId = set.alternativeExerciseId || set.exerciseId
                            const exerciseName = exerciseNames[exerciseId] || "Ejercicio"
                            
                            return (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-sm">{exerciseName}</p>
                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <span>{set.completedReps} reps</span>
                                    <span className="mx-1">•</span>
                                    <span>{set.completedWeight} kg</span>
                                    <span className="mx-1">•</span>
                                    <span>RIR {set.completedRir}</span>
                                  </div>
                                </div>
                                
                                {set.notes && (
                                  <Badge variant="outline" className="text-xs">
                                    Notas
                                  </Badge>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        
                        {/* Nivel de fatiga */}
                        <div>
                          <h4 className="font-medium text-sm mb-2">Nivel de fatiga</h4>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${(log.overallFatigue / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm">{log.overallFatigue}/10</span>
                          </div>
                        </div>
                        
                        {/* Notas */}
                        {log.notes && (
                          <div>
                            <h4 className="font-medium text-sm mb-1">Notas</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {log.notes}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card3D>
            )
          })}
        </div>
      )}
    </div>
  )
}
