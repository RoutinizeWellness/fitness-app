"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Calendar, 
  Save, 
  Calendar as CalendarIcon,
  BarChart4,
  Target,
  Activity,
  Repeat,
  TrendingUp,
  AlertTriangle
} from "lucide-react"
import { format, addWeeks, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Slider } from "@/components/ui/slider"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Mesocycle, 
  TrainingPhase, 
  DeloadStrategy,
  Macrocycle
} from "@/lib/types/advanced-training"
import { createMesocycle, updateMesocycle, getMacrocycleById } from "@/lib/services/advanced-training-service"

interface MesocycleEditorProps {
  macrocycleId: string
  initialData?: Partial<Mesocycle>
  weekStart?: number
  onSave?: (mesocycle: Mesocycle) => void
  onCancel?: () => void
}

export function MesocycleEditor({
  macrocycleId,
  initialData,
  weekStart = 0,
  onSave,
  onCancel
}: MesocycleEditorProps) {
  const [macrocycle, setMacrocycle] = useState<Macrocycle | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Partial<Mesocycle>>({
    macrocycle_id: macrocycleId,
    name: "",
    description: "",
    phase: "accumulation",
    start_date: "",
    end_date: "",
    duration_weeks: 4,
    volume_level: 7,
    intensity_level: 6,
    frequency_per_week: 4,
    primary_focus: "Fuerza General",
    secondary_focus: [],
    includes_deload: false,
    deload_strategy: "volume",
    deload_week: -1,
    volume_progression: "linear",
    intensity_progression: "linear",
    notes: "",
    ...initialData
  })
  
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.start_date ? parseISO(initialData.start_date) : undefined
  )
  
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.end_date ? parseISO(initialData.end_date) : undefined
  )
  
  // Cargar el macrociclo
  useEffect(() => {
    const loadMacrocycle = async () => {
      setLoading(true)
      try {
        const data = await getMacrocycleById(macrocycleId)
        if (data) {
          setMacrocycle(data)
          
          // Si no hay fechas iniciales, calcularlas basadas en el weekStart
          if (!startDate) {
            const macroStartDate = parseISO(data.start_date)
            const calculatedStartDate = addWeeks(macroStartDate, weekStart)
            setStartDate(calculatedStartDate)
            
            // Calcular fecha de fin por defecto (4 semanas después)
            const calculatedEndDate = addWeeks(calculatedStartDate, 3)
            setEndDate(calculatedEndDate)
            
            // Actualizar el formulario
            setFormData(prev => ({
              ...prev,
              start_date: calculatedStartDate.toISOString(),
              end_date: calculatedEndDate.toISOString()
            }))
          }
        }
      } catch (error) {
        console.error("Error al cargar macrociclo:", error)
        setError("Error al cargar datos del macrociclo")
      } finally {
        setLoading(false)
      }
    }
    
    loadMacrocycle()
  }, [macrocycleId, weekStart, startDate])
  
  // Actualizar la duración en semanas cuando cambian las fechas
  useEffect(() => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const diffWeeks = Math.ceil(diffDays / 7)
      
      setFormData(prev => ({
        ...prev,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        duration_weeks: diffWeeks
      }))
    }
  }, [startDate, endDate])
  
  // Manejar cambios en los campos del formulario
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Manejar cambios en los focos secundarios
  const handleSecondaryFocusChange = (focus: string, checked: boolean) => {
    const currentFocus = formData.secondary_focus || []
    
    if (checked && !currentFocus.includes(focus)) {
      handleChange('secondary_focus', [...currentFocus, focus])
    } else if (!checked && currentFocus.includes(focus)) {
      handleChange('secondary_focus', currentFocus.filter(f => f !== focus))
    }
  }
  
  // Guardar el mesociclo
  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      
      // Validar campos requeridos
      if (!formData.name || !formData.start_date || !formData.end_date || !formData.phase || !formData.primary_focus) {
        setError("Por favor, completa todos los campos requeridos")
        setSaving(false)
        return
      }
      
      // Crear o actualizar el mesociclo
      let savedMesocycle: Mesocycle | null
      
      if (initialData?.id) {
        // Actualizar mesociclo existente
        savedMesocycle = await updateMesocycle(initialData.id, formData)
      } else {
        // Crear nuevo mesociclo
        savedMesocycle = await createMesocycle(formData as Omit<Mesocycle, 'id' | 'created_at' | 'updated_at'>)
      }
      
      if (!savedMesocycle) {
        throw new Error("Error al guardar el mesociclo")
      }
      
      // Llamar al callback onSave
      if (onSave) {
        onSave(savedMesocycle)
      }
    } catch (err) {
      console.error("Error al guardar el mesociclo:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al guardar")
    } finally {
      setSaving(false)
    }
  }
  
  // Opciones para las fases de entrenamiento
  const trainingPhases: { value: TrainingPhase; label: string; description: string }[] = [
    { value: "accumulation", label: "Acumulación", description: "Fase de alto volumen para acumular masa muscular y preparar para intensidades mayores" },
    { value: "intensification", label: "Intensificación", description: "Fase de intensidad moderada-alta para desarrollar fuerza y potencia" },
    { value: "realization", label: "Realización", description: "Fase de alta intensidad para maximizar fuerza y rendimiento" },
    { value: "deload", label: "Descarga", description: "Fase de reducción de volumen/intensidad para recuperación" },
    { value: "transition", label: "Transición", description: "Fase entre ciclos para recuperación activa y preparación" },
    { value: "maintenance", label: "Mantenimiento", description: "Fase para mantener ganancias con mínimo esfuerzo" }
  ]
  
  // Opciones para las estrategias de deload
  const deloadStrategies: { value: DeloadStrategy; label: string; description: string }[] = [
    { value: "volume", label: "Reducción de Volumen", description: "Mantener intensidad pero reducir series/repeticiones" },
    { value: "intensity", label: "Reducción de Intensidad", description: "Mantener volumen pero reducir pesos/intensidad" },
    { value: "frequency", label: "Reducción de Frecuencia", description: "Reducir número de sesiones semanales" },
    { value: "complete", label: "Descanso Completo", description: "Descanso total sin entrenamiento" },
    { value: "active_recovery", label: "Recuperación Activa", description: "Actividades de baja intensidad para promover recuperación" }
  ]
  
  // Opciones para las progresiones
  const progressionTypes: { value: string; label: string; description: string }[] = [
    { value: "linear", label: "Lineal", description: "Incremento constante y gradual" },
    { value: "step", label: "Escalonada", description: "Incrementos en bloques con mesetas" },
    { value: "wave", label: "Ondulante", description: "Ciclos de incremento y reducción" },
    { value: "undulating", label: "Ondulante Diaria", description: "Variación frecuente (diaria o semanal)" }
  ]
  
  // Opciones para los focos de entrenamiento
  const trainingFocusOptions = [
    "Fuerza General",
    "Hipertrofia General",
    "Pecho/Espalda",
    "Piernas/Glúteos",
    "Hombros/Brazos",
    "Tren Superior",
    "Tren Inferior",
    "Empujes",
    "Tirones",
    "Cuádriceps",
    "Isquiotibiales",
    "Glúteos",
    "Pecho",
    "Espalda",
    "Hombros",
    "Bíceps",
    "Tríceps",
    "Core",
    "Técnica",
    "Potencia",
    "Resistencia Muscular"
  ]
  
  // Renderizar estado de carga
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-t-transparent border-[#FDA758] rounded-full animate-spin"></div>
      </div>
    )
  }
  
  // Renderizar error si no se pudo cargar el macrociclo
  if (!macrocycle) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#573353] mb-2">Error al cargar datos</h3>
          <p className="text-[#573353] opacity-70 mb-4">
            No se pudo cargar la información del macrociclo.
          </p>
          {onCancel && (
            <Button onClick={onCancel}>
              Volver
            </Button>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-[#573353] mb-6">
        {initialData?.id ? "Editar Mesociclo" : "Crear Nuevo Mesociclo"}
      </h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <div className="space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#573353] flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-[#FDA758]" />
            Información Básica
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#573353] mb-1">
                Nombre del Mesociclo *
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ej: Bloque de Hipertrofia 1"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#573353] mb-1">
                Fase de Entrenamiento *
              </label>
              <Select
                value={formData.phase || "accumulation"}
                onValueChange={(value) => handleChange("phase", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona fase de entrenamiento" />
                </SelectTrigger>
                <SelectContent>
                  {trainingPhases.map((phase) => (
                    <SelectItem key={phase.value} value={phase.value}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{phase.label}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{phase.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#573353] mb-1">
              Descripción
            </label>
            <Textarea
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe el propósito y enfoque de este mesociclo"
              className="w-full"
              rows={3}
            />
          </div>
        </div>
        
        {/* Fechas y duración */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#573353] flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-[#FDA758]" />
            Fechas y Duración
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#573353] mb-1">
                Fecha de Inicio *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    disabled={(date) => 
                      date < parseISO(macrocycle.start_date) || 
                      date > parseISO(macrocycle.end_date)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#573353] mb-1">
                Fecha de Fin *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                    disabled={(date) => 
                      date < (startDate || parseISO(macrocycle.start_date)) || 
                      date > parseISO(macrocycle.end_date)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#573353] mb-1">
                Duración (semanas)
              </label>
              <Input
                value={formData.duration_weeks || 0}
                onChange={(e) => handleChange("duration_weeks", parseInt(e.target.value))}
                type="number"
                min={1}
                className="w-full"
                disabled
              />
            </div>
          </div>
        </div>
        
        {/* Volumen e intensidad */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#573353] flex items-center">
            <BarChart4 className="mr-2 h-5 w-5 text-[#FDA758]" />
            Volumen e Intensidad
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[#573353]">
                  Nivel de Volumen: {formData.volume_level}/10
                </label>
                <span className="text-xs text-[#573353] opacity-70">
                  {formData.volume_level && formData.volume_level <= 3 ? "Bajo" : 
                   formData.volume_level && formData.volume_level <= 7 ? "Moderado" : "Alto"}
                </span>
              </div>
              <Slider
                value={[formData.volume_level || 5]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => handleChange("volume_level", value[0])}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[#573353]">
                  Nivel de Intensidad: {formData.intensity_level}/10
                </label>
                <span className="text-xs text-[#573353] opacity-70">
                  {formData.intensity_level && formData.intensity_level <= 3 ? "Bajo" : 
                   formData.intensity_level && formData.intensity_level <= 7 ? "Moderado" : "Alto"}
                </span>
              </div>
              <Slider
                value={[formData.intensity_level || 5]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => handleChange("intensity_level", value[0])}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#573353] mb-1">
                Frecuencia Semanal
              </label>
              <Select
                value={formData.frequency_per_week?.toString() || "4"}
                onValueChange={(value) => handleChange("frequency_per_week", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6, 7].map((freq) => (
                    <SelectItem key={freq} value={freq.toString()}>
                      {freq} {freq === 1 ? "día" : "días"} por semana
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#573353] mb-1">
                Progresión de Volumen
              </label>
              <Select
                value={formData.volume_progression || "linear"}
                onValueChange={(value) => handleChange("volume_progression", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona progresión" />
                </SelectTrigger>
                <SelectContent>
                  {progressionTypes.map((prog) => (
                    <SelectItem key={prog.value} value={prog.value}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{prog.label}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{prog.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#573353] mb-1">
                Progresión de Intensidad
              </label>
              <Select
                value={formData.intensity_progression || "linear"}
                onValueChange={(value) => handleChange("intensity_progression", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona progresión" />
                </SelectTrigger>
                <SelectContent>
                  {progressionTypes.map((prog) => (
                    <SelectItem key={prog.value} value={prog.value}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{prog.label}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{prog.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Foco de entrenamiento */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#573353] flex items-center">
            <Target className="mr-2 h-5 w-5 text-[#FDA758]" />
            Foco de Entrenamiento
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-[#573353] mb-1">
              Foco Principal *
            </label>
            <Select
              value={formData.primary_focus || ""}
              onValueChange={(value) => handleChange("primary_focus", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona foco principal" />
              </SelectTrigger>
              <SelectContent>
                {trainingFocusOptions.map((focus) => (
                  <SelectItem key={focus} value={focus}>
                    {focus}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#573353] mb-1">
              Focos Secundarios (opcional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {trainingFocusOptions
                .filter(focus => focus !== formData.primary_focus)
                .map((focus) => (
                  <div key={focus} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`focus-${focus}`}
                      checked={(formData.secondary_focus || []).includes(focus)}
                      onChange={(e) => handleSecondaryFocusChange(focus, e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor={`focus-${focus}`} className="text-sm text-[#573353]">
                      {focus}
                    </label>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        {/* Deload */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#573353] flex items-center">
            <Activity className="mr-2 h-5 w-5 text-[#FDA758]" />
            Estrategia de Deload
          </h3>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="includes-deload"
              checked={formData.includes_deload || false}
              onChange={(e) => handleChange("includes_deload", e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="includes-deload" className="text-sm text-[#573353]">
              Incluir semana de deload en este mesociclo
            </label>
          </div>
          
          {formData.includes_deload && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#573353] mb-1">
                  Estrategia de Deload
                </label>
                <Select
                  value={formData.deload_strategy || "volume"}
                  onValueChange={(value) => handleChange("deload_strategy", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona estrategia" />
                  </SelectTrigger>
                  <SelectContent>
                    {deloadStrategies.map((strategy) => (
                      <SelectItem key={strategy.value} value={strategy.value}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>{strategy.label}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{strategy.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#573353] mb-1">
                  Semana de Deload
                </label>
                <Select
                  value={formData.deload_week?.toString() || "-1"}
                  onValueChange={(value) => handleChange("deload_week", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona semana" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Última semana</SelectItem>
                    {Array.from({ length: formData.duration_weeks || 0 }).map((_, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        Semana {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        
        {/* Notas adicionales */}
        <div>
          <label className="block text-sm font-medium text-[#573353] mb-1">
            Notas Adicionales
          </label>
          <Textarea
            value={formData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Añade cualquier información adicional relevante"
            className="w-full"
            rows={3}
          />
        </div>
        
        {/* Botones de acción */}
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              Cancelar
            </Button>
          )}
          
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#FDA758] hover:bg-[#FD9A40]"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {initialData?.id ? "Actualizar Mesociclo" : "Crear Mesociclo"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
