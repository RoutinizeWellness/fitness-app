"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Save, 
  Calendar as CalendarIcon,
  Target,
  BarChart4,
  Clock
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Macrocycle, 
  PeriodizationModel, 
  AdvancedTrainingGoal, 
  AdvancedExperienceLevel 
} from "@/lib/types/advanced-training"
import { createMacrocycle, updateMacrocycle } from "@/lib/services/advanced-training-service"

interface MacrocycleEditorProps {
  userId: string
  initialData?: Partial<Macrocycle>
  onSave?: (macrocycle: Macrocycle) => void
  onCancel?: () => void
}

export function MacrocycleEditor({
  userId,
  initialData,
  onSave,
  onCancel
}: MacrocycleEditorProps) {
  const [formData, setFormData] = useState<Partial<Macrocycle>>({
    user_id: userId,
    name: "",
    description: "",
    start_date: new Date().toISOString(),
    end_date: addWeeks(new Date(), 12).toISOString(),
    duration_weeks: 12,
    periodization_model: "linear",
    primary_goal: "strength",
    secondary_goals: [],
    experience_level: "intermediate",
    competition_dates: [],
    notes: "",
    mesocycles: [],
    ...initialData
  })
  
  const [startDate, setStartDate] = useState<Date>(
    initialData?.start_date ? parseISO(initialData.start_date) : new Date()
  )
  
  const [endDate, setEndDate] = useState<Date>(
    initialData?.end_date ? parseISO(initialData.end_date) : addWeeks(new Date(), 12)
  )
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Actualizar la duración en semanas cuando cambian las fechas
  useEffect(() => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffWeeks = Math.ceil(diffDays / 7)
    
    setFormData(prev => ({
      ...prev,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      duration_weeks: diffWeeks
    }))
  }, [startDate, endDate])
  
  // Manejar cambios en los campos del formulario
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Manejar cambios en los objetivos secundarios
  const handleSecondaryGoalChange = (goal: AdvancedTrainingGoal, checked: boolean) => {
    const currentGoals = formData.secondary_goals || []
    
    if (checked && !currentGoals.includes(goal)) {
      handleChange('secondary_goals', [...currentGoals, goal])
    } else if (!checked && currentGoals.includes(goal)) {
      handleChange('secondary_goals', currentGoals.filter(g => g !== goal))
    }
  }
  
  // Guardar el macrociclo
  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      
      // Validar campos requeridos
      if (!formData.name || !formData.start_date || !formData.end_date || !formData.periodization_model || !formData.primary_goal) {
        setError("Por favor, completa todos los campos requeridos")
        setSaving(false)
        return
      }
      
      // Crear o actualizar el macrociclo
      let savedMacrocycle: Macrocycle | null
      
      if (initialData?.id) {
        // Actualizar macrociclo existente
        savedMacrocycle = await updateMacrocycle(initialData.id, formData)
      } else {
        // Crear nuevo macrociclo
        savedMacrocycle = await createMacrocycle(formData as Omit<Macrocycle, 'id' | 'created_at' | 'updated_at'>)
      }
      
      if (!savedMacrocycle) {
        throw new Error("Error al guardar el macrociclo")
      }
      
      // Llamar al callback onSave
      if (onSave) {
        onSave(savedMacrocycle)
      }
    } catch (err) {
      console.error("Error al guardar el macrociclo:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al guardar")
    } finally {
      setSaving(false)
    }
  }
  
  // Opciones para los modelos de periodización
  const periodizationModels: { value: PeriodizationModel; label: string; description: string }[] = [
    { value: "linear", label: "Periodización Lineal", description: "Progresión gradual de volumen alto/intensidad baja a volumen bajo/intensidad alta" },
    { value: "undulating", label: "Periodización Ondulante", description: "Variación frecuente de volumen e intensidad (diaria o semanal)" },
    { value: "block", label: "Periodización en Bloques", description: "Concentración de cargas específicas en bloques secuenciales" },
    { value: "conjugate", label: "Sistema Conjugado", description: "Desarrollo simultáneo de múltiples cualidades con rotación de ejercicios" },
    { value: "concurrent", label: "Periodización Concurrente", description: "Desarrollo simultáneo de fuerza, hipertrofia y resistencia" },
    { value: "reverse_linear", label: "Periodización Lineal Inversa", description: "Progresión de intensidad alta/volumen bajo a intensidad baja/volumen alto" },
    { value: "scientific_ppl", label: "PPL Científico", description: "Sistema Push/Pull/Legs con progresión basada en evidencia científica" },
    { value: "nippard_system", label: "Sistema Nippard", description: "Periodización basada en el enfoque de Jeff Nippard" },
    { value: "cbum_method", label: "Método CBUM", description: "Enfoque de entrenamiento basado en Chris Bumstead" }
  ]
  
  // Opciones para los objetivos de entrenamiento
  const trainingGoals: { value: AdvancedTrainingGoal; label: string; description: string }[] = [
    { value: "strength", label: "Fuerza Máxima", description: "Aumentar la capacidad de producir fuerza máxima" },
    { value: "hypertrophy", label: "Hipertrofia", description: "Aumentar el tamaño muscular" },
    { value: "power", label: "Potencia", description: "Mejorar la capacidad de generar fuerza rápidamente" },
    { value: "endurance", label: "Resistencia Muscular", description: "Mejorar la capacidad de mantener esfuerzos submáximos" },
    { value: "competition", label: "Preparación para Competición", description: "Optimizar el rendimiento para una competición específica" },
    { value: "recomposition", label: "Recomposición Corporal", description: "Perder grasa y ganar músculo simultáneamente" },
    { value: "maintenance", label: "Mantenimiento", description: "Mantener las ganancias actuales con mínimo esfuerzo" }
  ]
  
  // Opciones para los niveles de experiencia
  const experienceLevels: { value: AdvancedExperienceLevel; label: string; description: string }[] = [
    { value: "intermediate", label: "Intermedio", description: "1-3 años de entrenamiento consistente" },
    { value: "advanced", label: "Avanzado", description: "3-5 años de entrenamiento consistente" },
    { value: "elite", label: "Elite", description: "5+ años de entrenamiento consistente" }
  ]
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-[#573353] mb-6">
        {initialData?.id ? "Editar Macrociclo" : "Crear Nuevo Macrociclo"}
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
                Nombre del Macrociclo *
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ej: Preparación 2023"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#573353] mb-1">
                Nivel de Experiencia *
              </label>
              <Select
                value={formData.experience_level || "intermediate"}
                onValueChange={(value) => handleChange("experience_level", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona nivel de experiencia" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{level.label}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{level.description}</p>
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
              placeholder="Describe el propósito y enfoque de este macrociclo"
              className="w-full"
              rows={3}
            />
          </div>
        </div>
        
        {/* Fechas y duración */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#573353] flex items-center">
            <Clock className="mr-2 h-5 w-5 text-[#FDA758]" />
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
                    disabled={(date) => date < startDate}
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
        
        {/* Modelo de periodización y objetivos */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#573353] flex items-center">
            <BarChart4 className="mr-2 h-5 w-5 text-[#FDA758]" />
            Modelo de Periodización
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-[#573353] mb-1">
              Modelo de Periodización *
            </label>
            <Select
              value={formData.periodization_model || "linear"}
              onValueChange={(value) => handleChange("periodization_model", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona modelo de periodización" />
              </SelectTrigger>
              <SelectContent>
                {periodizationModels.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{model.label}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{model.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#573353] flex items-center">
            <Target className="mr-2 h-5 w-5 text-[#FDA758]" />
            Objetivos
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-[#573353] mb-1">
              Objetivo Principal *
            </label>
            <Select
              value={formData.primary_goal || "strength"}
              onValueChange={(value) => handleChange("primary_goal", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona objetivo principal" />
              </SelectTrigger>
              <SelectContent>
                {trainingGoals.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{goal.label}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{goal.description}</p>
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
              Objetivos Secundarios (opcional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {trainingGoals
                .filter(goal => goal.value !== formData.primary_goal)
                .map((goal) => (
                  <div key={goal.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`goal-${goal.value}`}
                      checked={(formData.secondary_goals || []).includes(goal.value as AdvancedTrainingGoal)}
                      onChange={(e) => handleSecondaryGoalChange(goal.value as AdvancedTrainingGoal, e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor={`goal-${goal.value}`} className="text-sm text-[#573353]">
                      {goal.label}
                    </label>
                  </div>
                ))}
            </div>
          </div>
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
                {initialData?.id ? "Actualizar Macrociclo" : "Crear Macrociclo"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
