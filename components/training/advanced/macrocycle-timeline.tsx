"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Edit, 
  BarChart4,
  Target,
  ArrowRight
} from "lucide-react"
import { format, parseISO, differenceInWeeks, addWeeks } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Macrocycle, 
  Mesocycle,
  TrainingPhase
} from "@/lib/types/advanced-training"
import { getMesocyclesByMacrocycle } from "@/lib/services/advanced-training-service"

interface MacrocycleTimelineProps {
  macrocycle: Macrocycle
  onAddMesocycle?: (macrocycleId: string, weekStart: number) => void
  onEditMesocycle?: (mesocycle: Mesocycle) => void
  onDeleteMesocycle?: (mesocycleId: string) => void
  onEditMacrocycle?: (macrocycle: Macrocycle) => void
  className?: string
}

export function MacrocycleTimeline({
  macrocycle,
  onAddMesocycle,
  onEditMesocycle,
  onDeleteMesocycle,
  onEditMacrocycle,
  className = ""
}: MacrocycleTimelineProps) {
  const [mesocycles, setMesocycles] = useState<Mesocycle[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)
  
  // Cargar los mesociclos
  useEffect(() => {
    const loadMesocycles = async () => {
      setLoading(true)
      try {
        const data = await getMesocyclesByMacrocycle(macrocycle.id)
        if (data) {
          setMesocycles(data)
        }
      } catch (error) {
        console.error("Error al cargar mesociclos:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadMesocycles()
  }, [macrocycle.id])
  
  // Obtener el color según la fase de entrenamiento
  const getPhaseColor = (phase: TrainingPhase): string => {
    switch (phase) {
      case 'accumulation':
        return "bg-blue-100 text-blue-700 border-blue-200"
      case 'intensification':
        return "bg-purple-100 text-purple-700 border-purple-200"
      case 'realization':
        return "bg-amber-100 text-amber-700 border-amber-200"
      case 'deload':
        return "bg-green-100 text-green-700 border-green-200"
      case 'transition':
        return "bg-gray-100 text-gray-700 border-gray-200"
      case 'maintenance':
        return "bg-indigo-100 text-indigo-700 border-indigo-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }
  
  // Obtener el texto de la fase de entrenamiento
  const getPhaseText = (phase: TrainingPhase): string => {
    switch (phase) {
      case 'accumulation':
        return "Acumulación"
      case 'intensification':
        return "Intensificación"
      case 'realization':
        return "Realización"
      case 'deload':
        return "Descarga"
      case 'transition':
        return "Transición"
      case 'maintenance':
        return "Mantenimiento"
      default:
        return phase
    }
  }
  
  // Obtener el texto del modelo de periodización
  const getPeriodizationModelText = (model: string): string => {
    switch (model) {
      case 'linear':
        return "Periodización Lineal"
      case 'undulating':
        return "Periodización Ondulante"
      case 'block':
        return "Periodización en Bloques"
      case 'conjugate':
        return "Sistema Conjugado"
      case 'concurrent':
        return "Periodización Concurrente"
      case 'reverse_linear':
        return "Periodización Lineal Inversa"
      case 'scientific_ppl':
        return "PPL Científico"
      case 'nippard_system':
        return "Sistema Nippard"
      case 'cbum_method':
        return "Método CBUM"
      default:
        return model
    }
  }
  
  // Obtener el texto del objetivo de entrenamiento
  const getTrainingGoalText = (goal: string): string => {
    switch (goal) {
      case 'strength':
        return "Fuerza Máxima"
      case 'hypertrophy':
        return "Hipertrofia"
      case 'power':
        return "Potencia"
      case 'endurance':
        return "Resistencia Muscular"
      case 'competition':
        return "Preparación para Competición"
      case 'recomposition':
        return "Recomposición Corporal"
      case 'maintenance':
        return "Mantenimiento"
      default:
        return goal
    }
  }
  
  // Calcular la posición y ancho de cada mesociclo en la línea de tiempo
  const calculateMesocyclePosition = (mesocycle: Mesocycle) => {
    const macroStartDate = parseISO(macrocycle.start_date)
    const mesoStartDate = parseISO(mesocycle.start_date)
    const mesoEndDate = parseISO(mesocycle.end_date)
    
    const startOffset = differenceInWeeks(mesoStartDate, macroStartDate)
    const duration = differenceInWeeks(mesoEndDate, mesoStartDate) + 1
    
    const totalWeeks = macrocycle.duration_weeks
    const startPercent = (startOffset / totalWeeks) * 100
    const widthPercent = (duration / totalWeeks) * 100
    
    return {
      left: `${startPercent}%`,
      width: `${widthPercent}%`
    }
  }
  
  // Generar semanas vacías para añadir mesociclos
  const generateEmptyWeeks = () => {
    const macroStartDate = parseISO(macrocycle.start_date)
    const totalWeeks = macrocycle.duration_weeks
    const emptyWeeks = []
    
    // Crear un mapa de semanas ocupadas
    const occupiedWeeks = new Map<number, boolean>()
    
    mesocycles.forEach(meso => {
      const mesoStartDate = parseISO(meso.start_date)
      const mesoEndDate = parseISO(meso.end_date)
      
      const startOffset = differenceInWeeks(mesoStartDate, macroStartDate)
      const endOffset = differenceInWeeks(mesoEndDate, macroStartDate)
      
      for (let week = startOffset; week <= endOffset; week++) {
        occupiedWeeks.set(week, true)
      }
    })
    
    // Encontrar espacios vacíos
    let currentEmptyStart = null
    
    for (let week = 0; week < totalWeeks; week++) {
      if (!occupiedWeeks.has(week)) {
        if (currentEmptyStart === null) {
          currentEmptyStart = week
        }
      } else if (currentEmptyStart !== null) {
        emptyWeeks.push({
          startWeek: currentEmptyStart,
          endWeek: week - 1,
          duration: week - currentEmptyStart
        })
        currentEmptyStart = null
      }
    }
    
    // Añadir el último espacio vacío si existe
    if (currentEmptyStart !== null) {
      emptyWeeks.push({
        startWeek: currentEmptyStart,
        endWeek: totalWeeks - 1,
        duration: totalWeeks - currentEmptyStart
      })
    }
    
    return emptyWeeks
  }
  
  const emptyWeeks = generateEmptyWeeks()
  
  return (
    <div className={`border rounded-lg overflow-hidden bg-white ${className}`}>
      {/* Encabezado */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-[#FDA758] mr-2" />
          <h3 className="text-lg font-medium text-[#573353]">{macrocycle.name}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {onEditMacrocycle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditMacrocycle(macrocycle)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 p-0"
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Información básica */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-[#573353] opacity-70">Fechas</p>
            <p className="text-sm font-medium text-[#573353]">
              {format(parseISO(macrocycle.start_date), "dd MMM yyyy", { locale: es })} - {format(parseISO(macrocycle.end_date), "dd MMM yyyy", { locale: es })}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-[#573353] opacity-70">Duración</p>
            <p className="text-sm font-medium text-[#573353]">
              {macrocycle.duration_weeks} semanas
            </p>
          </div>
          
          <div>
            <p className="text-xs text-[#573353] opacity-70">Modelo</p>
            <p className="text-sm font-medium text-[#573353]">
              {getPeriodizationModelText(macrocycle.periodization_model)}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-[#573353] opacity-70">Objetivo Principal</p>
            <p className="text-sm font-medium text-[#573353]">
              {getTrainingGoalText(macrocycle.primary_goal)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Contenido expandible */}
      {expanded && (
        <div className="p-4">
          {/* Línea de tiempo */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#573353] mb-2">Línea de Tiempo</h4>
            
            {loading ? (
              <div className="h-20 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-t-transparent border-[#FDA758] rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="relative h-20 bg-gray-100 rounded-lg overflow-hidden">
                {/* Línea base */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300"></div>
                
                {/* Marcadores de semanas */}
                {Array.from({ length: macrocycle.duration_weeks + 1 }).map((_, index) => (
                  <div
                    key={`week-${index}`}
                    className="absolute top-0 bottom-0 w-px bg-gray-300"
                    style={{ left: `${(index / macrocycle.duration_weeks) * 100}%` }}
                  >
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                      {index}
                    </div>
                  </div>
                ))}
                
                {/* Mesociclos */}
                {mesocycles.map((mesocycle) => {
                  const position = calculateMesocyclePosition(mesocycle)
                  const phaseColor = getPhaseColor(mesocycle.phase as TrainingPhase)
                  
                  return (
                    <TooltipProvider key={mesocycle.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`absolute top-1/2 transform -translate-y-1/2 h-10 rounded-lg border ${phaseColor} cursor-pointer transition-all hover:h-12`}
                            style={position}
                            onClick={() => onEditMesocycle && onEditMesocycle(mesocycle)}
                          >
                            <div className="h-full w-full flex items-center justify-center text-xs font-medium truncate px-2">
                              {mesocycle.name}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">{mesocycle.name}</p>
                            <p className="text-xs">Fase: {getPhaseText(mesocycle.phase as TrainingPhase)}</p>
                            <p className="text-xs">Semanas: {mesocycle.duration_weeks}</p>
                            <p className="text-xs">Volumen: {mesocycle.volume_level}/10</p>
                            <p className="text-xs">Intensidad: {mesocycle.intensity_level}/10</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
                
                {/* Espacios vacíos para añadir mesociclos */}
                {emptyWeeks.map((emptyWeek, index) => {
                  const startPercent = (emptyWeek.startWeek / macrocycle.duration_weeks) * 100
                  const widthPercent = (emptyWeek.duration / macrocycle.duration_weeks) * 100
                  
                  return (
                    <div
                      key={`empty-${index}`}
                      className="absolute top-1/2 transform -translate-y-1/2 h-10 rounded-lg border border-dashed border-gray-400 bg-white/50 cursor-pointer hover:bg-gray-100 transition-all flex items-center justify-center"
                      style={{
                        left: `${startPercent}%`,
                        width: `${widthPercent}%`
                      }}
                      onClick={() => onAddMesocycle && onAddMesocycle(macrocycle.id, emptyWeek.startWeek)}
                    >
                      <Plus className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-500 ml-1">Añadir Mesociclo</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          
          {/* Lista de mesociclos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-[#573353]">Mesociclos</h4>
              
              {emptyWeeks.length > 0 && onAddMesocycle && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddMesocycle(macrocycle.id, emptyWeeks[0].startWeek)}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir Mesociclo
                </Button>
              )}
            </div>
            
            {loading ? (
              <div className="h-20 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-t-transparent border-[#FDA758] rounded-full animate-spin"></div>
              </div>
            ) : mesocycles.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <BarChart4 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-[#573353] opacity-70">No hay mesociclos definidos</p>
                {onAddMesocycle && (
                  <Button
                    variant="link"
                    onClick={() => onAddMesocycle(macrocycle.id, 0)}
                    className="mt-2"
                  >
                    Añadir primer mesociclo
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {mesocycles.map((mesocycle) => (
                  <div
                    key={mesocycle.id}
                    className={`p-3 rounded-lg border ${getPhaseColor(mesocycle.phase as TrainingPhase)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-[#573353]">{mesocycle.name}</h5>
                        <div className="flex items-center text-xs text-[#573353] opacity-80 mt-1">
                          <span className="mr-2">
                            Semanas {differenceInWeeks(parseISO(mesocycle.start_date), parseISO(macrocycle.start_date))}-
                            {differenceInWeeks(parseISO(mesocycle.end_date), parseISO(macrocycle.start_date))}
                          </span>
                          <span className="mr-2">•</span>
                          <span>{getPhaseText(mesocycle.phase as TrainingPhase)}</span>
                          <span className="mr-2">•</span>
                          <span>Vol: {mesocycle.volume_level}/10</span>
                          <span className="mr-2">•</span>
                          <span>Int: {mesocycle.intensity_level}/10</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {onEditMesocycle && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditMesocycle(mesocycle)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {onDeleteMesocycle && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteMesocycle(mesocycle.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
