"use client"

import { useState } from "react"
import {
  Moon,
  Sun,
  Clock,
  Calendar,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Heart,
  Activity,
  Thermometer,
  Info,
  Waves
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
import { SleepEntry, SleepGoal } from "@/lib/types/wellness"

interface SleepTrackerProps {
  entries: SleepEntry[]
  goal: SleepGoal | null
  onAddEntry: () => void
  isLoading: boolean
}

export function SleepTracker({ entries, goal, onAddEntry, isLoading }: SleepTrackerProps) {
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null)
  
  // Ordenar entradas por fecha (más reciente primero)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  // Formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    })
  }
  
  // Formatear hora
  const formatTime = (timeString: string): string => {
    return timeString
  }
  
  // Calcular porcentaje de objetivo
  const calculateGoalPercentage = (entry: SleepEntry): number => {
    if (!goal) return 100
    
    return Math.min(100, (entry.duration / goal.targetDuration) * 100)
  }
  
  // Obtener color según calidad
  const getQualityColor = (quality: number): string => {
    if (quality >= 8) return 'bg-green-500'
    if (quality >= 6) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  // Obtener color según porcentaje de objetivo
  const getGoalColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  // Manejar clic en entrada
  const handleEntryClick = (entryId: string) => {
    if (expandedEntryId === entryId) {
      setExpandedEntryId(null)
    } else {
      setExpandedEntryId(entryId)
    }
  }
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }
  
  if (entries.length === 0) {
    return (
      <Card3D>
        <Card3DContent className="flex flex-col items-center justify-center py-12">
          <Moon className="h-16 w-16 text-primary/20 mb-4" />
          <h3 className="text-xl font-medium mb-2">No hay registros de sueño</h3>
          <p className="text-muted-foreground text-center mb-6">
            Comienza a registrar tu sueño para ver tus patrones y tendencias
          </p>
          <Button3D onClick={onAddEntry}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Registro
          </Button3D>
        </Card3DContent>
      </Card3D>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Objetivo de sueño */}
      {goal && (
        <Card3D className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
          <Card3DContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-indigo-900">Tu objetivo de sueño</h3>
              <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                {Math.floor(goal.targetDuration / 60)}h {goal.targetDuration % 60}m
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <Moon className="h-4 w-4 text-indigo-600" />
                <span className="text-sm text-indigo-700">Acostarse: {goal.targetBedtime}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-indigo-700">Despertar: {goal.targetWakeTime}</span>
              </div>
            </div>
          </Card3DContent>
        </Card3D>
      )}
      
      {/* Lista de registros */}
      <div className="space-y-3">
        {sortedEntries.map((entry) => {
          const goalPercentage = calculateGoalPercentage(entry)
          const isExpanded = expandedEntryId === entry.id
          
          return (
            <Card3D 
              key={entry.id} 
              className={`border hover:border-primary/30 transition-colors ${isExpanded ? 'border-primary/30 shadow-md' : ''}`}
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => handleEntryClick(entry.id!)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{formatDate(entry.date)}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</span>
                      <span className="mx-1">•</span>
                      <span>{Math.floor(entry.duration / 60)}h {entry.duration % 60}m</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full ${getQualityColor(entry.quality)} mr-1`}></div>
                        <span className="text-sm font-medium">{entry.quality}/10</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Calidad</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full ${getGoalColor(goalPercentage)} mr-1`}></div>
                        <span className="text-sm font-medium">{Math.round(goalPercentage)}%</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Objetivo</span>
                    </div>
                    
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                {/* Barra de progreso */}
                <div className="mt-3">
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                    <span>Duración vs. Objetivo</span>
                    <span>{Math.floor(entry.duration / 60)}h {entry.duration % 60}m / {Math.floor((goal?.targetDuration || 480) / 60)}h {(goal?.targetDuration || 480) % 60}m</span>
                  </div>
                  <Progress value={goalPercentage} className={getGoalColor(goalPercentage)} />
                </div>
              </div>
              
              {/* Detalles expandidos */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  <Separator className="mb-4" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {entry.deepSleep && (
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <div className="flex items-center text-xs text-indigo-700 mb-1">
                          <Moon className="h-3 w-3 mr-1" />
                          <span>Sueño profundo</span>
                        </div>
                        <span className="text-lg font-medium text-indigo-900">
                          {Math.floor(entry.deepSleep / 60)}h {entry.deepSleep % 60}m
                        </span>
                        <div className="text-xs text-indigo-600 mt-1">
                          {Math.round((entry.deepSleep / entry.duration) * 100)}% del total
                        </div>
                      </div>
                    )}
                    
                    {entry.remSleep && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center text-xs text-blue-700 mb-1">
                          <Waves className="h-3 w-3 mr-1" />
                          <span>Sueño REM</span>
                        </div>
                        <span className="text-lg font-medium text-blue-900">
                          {Math.floor(entry.remSleep / 60)}h {entry.remSleep % 60}m
                        </span>
                        <div className="text-xs text-blue-600 mt-1">
                          {Math.round((entry.remSleep / entry.duration) * 100)}% del total
                        </div>
                      </div>
                    )}
                    
                    {entry.hrv && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center text-xs text-green-700 mb-1">
                          <Heart className="h-3 w-3 mr-1" />
                          <span>HRV</span>
                        </div>
                        <span className="text-lg font-medium text-green-900">
                          {entry.hrv} ms
                        </span>
                        <div className="text-xs text-green-600 mt-1">
                          Variabilidad cardíaca
                        </div>
                      </div>
                    )}
                    
                    {entry.restingHeartRate && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="flex items-center text-xs text-red-700 mb-1">
                          <Activity className="h-3 w-3 mr-1" />
                          <span>FC en reposo</span>
                        </div>
                        <span className="text-lg font-medium text-red-900">
                          {entry.restingHeartRate} ppm
                        </span>
                        <div className="text-xs text-red-600 mt-1">
                          Frecuencia cardíaca
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Factores que afectaron el sueño */}
                  {entry.factors && Object.values(entry.factors).some(v => v) && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Factores que afectaron tu sueño:</h4>
                      <div className="flex flex-wrap gap-2">
                        {entry.factors.alcohol && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <Wine className="h-3 w-3 mr-1" />
                            Alcohol
                          </Badge>
                        )}
                        {entry.factors.caffeine && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <Coffee className="h-3 w-3 mr-1" />
                            Cafeína
                          </Badge>
                        )}
                        {entry.factors.screens && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Tv className="h-3 w-3 mr-1" />
                            Pantallas
                          </Badge>
                        )}
                        {entry.factors.stress && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            <Activity className="h-3 w-3 mr-1" />
                            Estrés
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Notas */}
                  {entry.notes && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Notas:</h4>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        {entry.notes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card3D>
          )
        })}
      </div>
      
      <div className="flex justify-center mt-6">
        <Button3D onClick={onAddEntry}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir Registro
        </Button3D>
      </div>
    </div>
  )
}
