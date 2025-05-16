"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Card3D, 
  Card3DContent, 
  Card3DHeader, 
  Card3DTitle 
} from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Dumbbell, 
  Calendar, 
  Clock, 
  Zap, 
  Target, 
  BarChart, 
  Users, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Minus, 
  Save, 
  X, 
  Edit, 
  Trash, 
  Copy, 
  FileText, 
  Check, 
  Info, 
  HelpCircle, 
  AlertCircle 
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { 
  TrainingProgram, 
  MesoCycle, 
  MicroCycle, 
  MacroCycle,
  TRAINING_FREQUENCIES,
  TRAINING_DURATIONS,
  DELOAD_STRATEGIES,
  TRAINING_LEVELS,
  TRAINING_GOALS,
  TRAINING_TYPES,
  TrainingFrequency,
  TrainingDuration,
  DeloadStrategy,
  TrainingLevel,
  TrainingGoal,
  TrainingType,
  MesocycleFocus,
  ProgressionModel
} from "@/lib/types/training-program"
import { Exercise, WorkoutDay } from "@/lib/types/training"
import { createTrainingProgram, updateTrainingProgram } from "@/lib/training-program-service"
import { getExercises } from "@/lib/supabase-training"
import { ProgramTemplateSelector } from "@/components/training/program-template-selector"
import { MesocycleConfigurator } from "@/components/training/mesocycle-configurator"
import { MicrocycleConfigurator } from "@/components/training/microcycle-configurator"
import { v4 as uuidv4 } from "uuid"

interface ProgramConfiguratorProps {
  userId: string
  isAdmin: boolean
  onSave: (program: TrainingProgram) => void
  onCancel: () => void
  existingProgram?: TrainingProgram
}

export function ProgramConfigurator({
  userId,
  isAdmin,
  onSave,
  onCancel,
  existingProgram
}: ProgramConfiguratorProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  
  // Estado para el programa
  const [program, setProgram] = useState<Partial<TrainingProgram>>(
    existingProgram || {
      userId,
      name: "Nuevo programa de entrenamiento",
      description: "Programa personalizado",
      level: "intermediate",
      type: "full_body",
      duration: 8, // 8 semanas por defecto
      frequency: 3, // 3 días por semana por defecto
      goal: "hypertrophy",
      structure: "mesocycle",
      mesoCycles: [],
      createdBy: userId,
      isTemplate: false,
      isActive: false
    }
  )
  
  // Cargar ejercicios disponibles
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const { data, error } = await getExercises()
        if (error) throw error
        if (data) setAvailableExercises(data)
      } catch (error) {
        console.error("Error al cargar ejercicios:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los ejercicios",
          variant: "destructive"
        })
      }
    }
    
    loadExercises()
  }, [toast])
  
  // Manejar cambios en los campos básicos
  const handleBasicChange = (field: keyof TrainingProgram, value: any) => {
    setProgram(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Manejar cambio de estructura
  const handleStructureChange = (structure: 'mesocycle' | 'macrocycle' | 'simple') => {
    setProgram(prev => ({
      ...prev,
      structure,
      // Inicializar la estructura correspondiente si no existe
      ...(structure === 'mesocycle' && !prev.mesoCycles ? { 
        mesoCycles: [createDefaultMesocycle()] 
      } : {}),
      ...(structure === 'macrocycle' && !prev.macroCycle ? { 
        macroCycle: createDefaultMacrocycle() 
      } : {}),
      ...(structure === 'simple' && !prev.routines ? { 
        routines: [] 
      } : {})
    }))
  }
  
  // Crear un mesociclo por defecto
  const createDefaultMesocycle = (): MesoCycle => ({
    id: uuidv4(),
    name: "Mesociclo 1",
    description: "Fase inicial",
    microCycles: [createDefaultMicrocycle()],
    duration: 4, // 4 semanas
    focus: "hypertrophy",
    progressionModel: "linear",
    includesDeload: true,
    deloadStrategy: "volume",
    notes: ""
  })
  
  // Crear un microciclo por defecto
  const createDefaultMicrocycle = (): MicroCycle => ({
    id: uuidv4(),
    name: "Microciclo 1",
    description: "Semana de entrenamiento",
    days: [],
    duration: 7, // 7 días
    intensity: "moderate",
    volume: "moderate",
    isDeload: false,
    notes: ""
  })
  
  // Crear un macrociclo por defecto
  const createDefaultMacrocycle = (): MacroCycle => ({
    id: uuidv4(),
    name: "Macrociclo",
    description: "Plan completo de entrenamiento",
    mesoCycles: [createDefaultMesocycle()],
    duration: 3, // 3 meses
    periodizationType: "linear",
    primaryGoal: "hypertrophy",
    secondaryGoal: "strength",
    notes: ""
  })
  
  // Añadir un nuevo mesociclo
  const addMesocycle = () => {
    if (!program.mesoCycles) return
    
    const newMesocycle = createDefaultMesocycle()
    newMesocycle.name = `Mesociclo ${program.mesoCycles.length + 1}`
    
    setProgram(prev => ({
      ...prev,
      mesoCycles: [...(prev.mesoCycles || []), newMesocycle]
    }))
  }
  
  // Actualizar un mesociclo
  const updateMesocycle = (index: number, updatedMesocycle: MesoCycle) => {
    if (!program.mesoCycles) return
    
    const updatedMesocycles = [...program.mesoCycles]
    updatedMesocycles[index] = updatedMesocycle
    
    setProgram(prev => ({
      ...prev,
      mesoCycles: updatedMesocycles
    }))
  }
  
  // Eliminar un mesociclo
  const removeMesocycle = (index: number) => {
    if (!program.mesoCycles) return
    
    const updatedMesocycles = [...program.mesoCycles]
    updatedMesocycles.splice(index, 1)
    
    setProgram(prev => ({
      ...prev,
      mesoCycles: updatedMesocycles
    }))
  }
  
  // Guardar el programa
  const handleSaveProgram = async () => {
    try {
      setIsLoading(true)
      
      // Validar datos mínimos
      if (!program.name || !program.level || !program.type || !program.goal) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos obligatorios",
          variant: "destructive"
        })
        return
      }
      
      // Preparar el programa completo
      const completeProgram: TrainingProgram = {
        ...(program as TrainingProgram),
        id: program.id || uuidv4(),
        createdAt: program.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Guardar el programa
      if (existingProgram) {
        const { data, error } = await updateTrainingProgram(existingProgram.id, completeProgram)
        if (error) throw error
        
        toast({
          title: "Programa actualizado",
          description: "El programa se ha actualizado correctamente"
        })
        
        onSave(data!)
      } else {
        const { data, error } = await createTrainingProgram(completeProgram)
        if (error) throw error
        
        toast({
          title: "Programa creado",
          description: "El programa se ha creado correctamente"
        })
        
        onSave(data!)
      }
    } catch (error) {
      console.error("Error al guardar programa:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el programa",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Renderizar configuración básica
  const renderBasicConfig = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="program-name">Nombre del programa</Label>
          <Input
            id="program-name"
            value={program.name || ''}
            onChange={(e) => handleBasicChange('name', e.target.value)}
            placeholder="Ej: Programa de hipertrofia 8 semanas"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="program-description">Descripción</Label>
          <Textarea
            id="program-description"
            value={program.description || ''}
            onChange={(e) => handleBasicChange('description', e.target.value)}
            placeholder="Describe el objetivo y estructura del programa"
            rows={3}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="program-level">Nivel</Label>
          <Select
            value={program.level}
            onValueChange={(value) => handleBasicChange('level', value)}
          >
            <SelectTrigger id="program-level">
              <SelectValue placeholder="Selecciona nivel" />
            </SelectTrigger>
            <SelectContent>
              {TRAINING_LEVELS.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {TRAINING_LEVELS.find(l => l.value === program.level)?.description}
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="program-goal">Objetivo principal</Label>
          <Select
            value={program.goal}
            onValueChange={(value) => handleBasicChange('goal', value)}
          >
            <SelectTrigger id="program-goal">
              <SelectValue placeholder="Selecciona objetivo" />
            </SelectTrigger>
            <SelectContent>
              {TRAINING_GOALS.map(goal => (
                <SelectItem key={goal.value} value={goal.value}>
                  {goal.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {TRAINING_GOALS.find(g => g.value === program.goal)?.description}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="program-duration">Duración</Label>
          <Select
            value={program.duration?.toString()}
            onValueChange={(value) => handleBasicChange('duration', parseInt(value))}
          >
            <SelectTrigger id="program-duration">
              <SelectValue placeholder="Selecciona duración" />
            </SelectTrigger>
            <SelectContent>
              {TRAINING_DURATIONS.map(duration => (
                <SelectItem key={duration.value} value={duration.value.toString()}>
                  {duration.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {TRAINING_DURATIONS.find(d => d.value === program.duration)?.description}
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="program-frequency">Frecuencia</Label>
          <Select
            value={program.frequency?.toString()}
            onValueChange={(value) => handleBasicChange('frequency', parseInt(value))}
          >
            <SelectTrigger id="program-frequency">
              <SelectValue placeholder="Selecciona frecuencia" />
            </SelectTrigger>
            <SelectContent>
              {TRAINING_FREQUENCIES.map(frequency => (
                <SelectItem key={frequency.value} value={frequency.value.toString()}>
                  {frequency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {TRAINING_FREQUENCIES.find(f => f.value === program.frequency)?.description}
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="program-type">Tipo de entrenamiento</Label>
        <Select
          value={program.type}
          onValueChange={(value) => handleBasicChange('type', value)}
        >
          <SelectTrigger id="program-type">
            <SelectValue placeholder="Selecciona tipo" />
          </SelectTrigger>
          <SelectContent>
            {TRAINING_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {TRAINING_TYPES.find(t => t.value === program.type)?.description}
        </p>
      </div>
    </div>
  )
  
  // Renderizar configuración avanzada
  const renderAdvancedConfig = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Estructura del programa</Label>
        <RadioGroup
          value={program.structure}
          onValueChange={(value) => handleStructureChange(value as 'mesocycle' | 'macrocycle' | 'simple')}
          className="grid grid-cols-3 gap-4"
        >
          <div>
            <RadioGroupItem
              value="mesocycle"
              id="structure-mesocycle"
              className="peer sr-only"
            />
            <Label
              htmlFor="structure-mesocycle"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Calendar className="mb-2 h-6 w-6" />
              <span className="text-sm font-medium">Mesociclo</span>
              <span className="text-xs text-muted-foreground text-center mt-1">
                Programa de 4-12 semanas
              </span>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem
              value="macrocycle"
              id="structure-macrocycle"
              className="peer sr-only"
            />
            <Label
              htmlFor="structure-macrocycle"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <BarChart className="mb-2 h-6 w-6" />
              <span className="text-sm font-medium">Macrociclo</span>
              <span className="text-xs text-muted-foreground text-center mt-1">
                Programa de 3-6 meses
              </span>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem
              value="simple"
              id="structure-simple"
              className="peer sr-only"
            />
            <Label
              htmlFor="structure-simple"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Dumbbell className="mb-2 h-6 w-6" />
              <span className="text-sm font-medium">Simple</span>
              <span className="text-xs text-muted-foreground text-center mt-1">
                Rutina semanal básica
              </span>
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label>Estrategia de descarga (Deload)</Label>
        <Select
          value={program.deloadStrategy || 'none'}
          onValueChange={(value) => handleBasicChange('deloadStrategy', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona estrategia de descarga" />
          </SelectTrigger>
          <SelectContent>
            {DELOAD_STRATEGIES.map(strategy => (
              <SelectItem key={strategy.value} value={strategy.value}>
                {strategy.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {DELOAD_STRATEGIES.find(s => s.value === program.deloadStrategy)?.description}
        </p>
      </div>
      
      <div className="space-y-2">
        <Label>Grupos musculares prioritarios</Label>
        <div className="grid grid-cols-3 gap-2">
          {['chest', 'back', 'shoulders', 'arms', 'legs', 'core'].map(group => (
            <div key={group} className="flex items-center space-x-2">
              <Checkbox
                id={`muscle-${group}`}
                checked={(program.targetMuscleGroups || []).includes(group)}
                onCheckedChange={(checked) => {
                  const currentGroups = program.targetMuscleGroups || []
                  const updatedGroups = checked
                    ? [...currentGroups, group]
                    : currentGroups.filter(g => g !== group)
                  
                  handleBasicChange('targetMuscleGroups', updatedGroups)
                }}
              />
              <Label htmlFor={`muscle-${group}`} className="capitalize">
                {group === 'chest' ? 'Pecho' : 
                 group === 'back' ? 'Espalda' : 
                 group === 'shoulders' ? 'Hombros' : 
                 group === 'arms' ? 'Brazos' : 
                 group === 'legs' ? 'Piernas' : 
                 group === 'core' ? 'Core' : group}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
  
  // Renderizar configuración de mesociclos
  const renderMesocycleConfig = () => (
    <div className="space-y-6">
      {program.structure === 'mesocycle' && program.mesoCycles && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Mesociclos</h3>
            <Button3D variant="outline" size="sm" onClick={addMesocycle}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir mesociclo
            </Button3D>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {program.mesoCycles.map((mesocycle, index) => (
              <AccordionItem key={mesocycle.id} value={mesocycle.id}>
                <AccordionTrigger className="hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    <span>{mesocycle.name}</span>
                    {mesocycle.includesDeload && (
                      <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                        Deload
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-4">
                  <MesocycleConfigurator
                    mesocycle={mesocycle}
                    onUpdate={(updated) => updateMesocycle(index, updated)}
                    onDelete={() => removeMesocycle(index)}
                    availableExercises={availableExercises}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
      )}
      
      {program.structure !== 'mesocycle' && (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Configuración de mesociclos no disponible</h3>
          <p className="text-sm text-gray-500 mb-4">
            Selecciona la estructura de "Mesociclo" en la configuración avanzada para habilitar esta opción
          </p>
          <Button3D variant="outline" onClick={() => {
            setActiveTab("advanced")
            handleStructureChange('mesocycle')
          }}>
            Cambiar a estructura de mesociclo
          </Button3D>
        </div>
      )}
    </div>
  )
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">
          {existingProgram ? "Editar programa" : "Crear programa de entrenamiento"}
        </h2>
        <div className="flex items-center space-x-2">
          <Button3D variant="outline" onClick={() => setShowTemplateSelector(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Usar plantilla
          </Button3D>
          <Button3D variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button3D>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="advanced">Avanzado</TabsTrigger>
          <TabsTrigger value="mesocycles">Mesociclos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          {renderBasicConfig()}
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          {renderAdvancedConfig()}
        </TabsContent>
        
        <TabsContent value="mesocycles" className="space-y-4">
          {renderMesocycleConfig()}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button3D variant="outline" onClick={onCancel}>
          Cancelar
        </Button3D>
        <Button3D onClick={handleSaveProgram} disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">
                <Clock className="h-4 w-4" />
              </span>
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar programa
            </>
          )}
        </Button3D>
      </div>
      
      {showTemplateSelector && (
        <ProgramTemplateSelector
          onSelect={(template) => {
            // Implementar lógica para aplicar la plantilla
            setShowTemplateSelector(false)
          }}
          onCancel={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  )
}
