"use client"

import { useState } from "react"
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  Zap, 
  Target, 
  BarChart, 
  Plus, 
  Minus, 
  Save, 
  Trash, 
  Edit, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle 
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  MesoCycle, 
  MicroCycle, 
  MesocycleFocus,
  ProgressionModel,
  DeloadStrategy
} from "@/lib/types/training-program"
import { Exercise, WorkoutDay } from "@/lib/types/training"
import { MicrocycleConfigurator } from "@/components/training/microcycle-configurator"
import { v4 as uuidv4 } from "uuid"

interface MesocycleConfiguratorProps {
  mesocycle: MesoCycle
  onUpdate: (mesocycle: MesoCycle) => void
  onDelete: () => void
  availableExercises: Exercise[]
}

export function MesocycleConfigurator({
  mesocycle,
  onUpdate,
  onDelete,
  availableExercises
}: MesocycleConfiguratorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedMesocycle, setEditedMesocycle] = useState<MesoCycle>(mesocycle)
  
  // Manejar cambios en los campos
  const handleChange = (field: keyof MesoCycle, value: any) => {
    setEditedMesocycle(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Guardar cambios
  const handleSave = () => {
    onUpdate(editedMesocycle)
    setIsEditing(false)
  }
  
  // Cancelar edición
  const handleCancel = () => {
    setEditedMesocycle(mesocycle)
    setIsEditing(false)
  }
  
  // Añadir un nuevo microciclo
  const addMicrocycle = () => {
    const newMicrocycle: MicroCycle = {
      id: uuidv4(),
      name: `Microciclo ${editedMesocycle.microCycles.length + 1}`,
      description: "Semana de entrenamiento",
      days: [],
      duration: 7, // 7 días
      intensity: "moderate",
      volume: "moderate",
      isDeload: false,
      notes: ""
    }
    
    // Si es el último microciclo y hay deload, marcarlo como deload
    if (editedMesocycle.includesDeload && editedMesocycle.microCycles.length > 0) {
      // El penúltimo microciclo (que ahora será el antepenúltimo) no debe ser deload
      const updatedMicrocycles = [...editedMesocycle.microCycles]
      if (updatedMicrocycles.length > 0 && updatedMicrocycles[updatedMicrocycles.length - 1].isDeload) {
        updatedMicrocycles[updatedMicrocycles.length - 1].isDeload = false
      }
      
      // El nuevo microciclo será deload
      newMicrocycle.isDeload = true
      newMicrocycle.name = "Microciclo de descarga"
      newMicrocycle.intensity = "low"
      newMicrocycle.volume = "low"
      
      setEditedMesocycle(prev => ({
        ...prev,
        microCycles: [...updatedMicrocycles, newMicrocycle]
      }))
    } else {
      setEditedMesocycle(prev => ({
        ...prev,
        microCycles: [...prev.microCycles, newMicrocycle]
      }))
    }
  }
  
  // Actualizar un microciclo
  const updateMicrocycle = (index: number, updatedMicrocycle: MicroCycle) => {
    const updatedMicrocycles = [...editedMesocycle.microCycles]
    updatedMicrocycles[index] = updatedMicrocycle
    
    setEditedMesocycle(prev => ({
      ...prev,
      microCycles: updatedMicrocycles
    }))
  }
  
  // Eliminar un microciclo
  const removeMicrocycle = (index: number) => {
    const updatedMicrocycles = [...editedMesocycle.microCycles]
    updatedMicrocycles.splice(index, 1)
    
    // Si hay deload y eliminamos el último, marcar el nuevo último como deload
    if (editedMesocycle.includesDeload && index === editedMesocycle.microCycles.length - 1 && updatedMicrocycles.length > 0) {
      updatedMicrocycles[updatedMicrocycles.length - 1].isDeload = true
    }
    
    setEditedMesocycle(prev => ({
      ...prev,
      microCycles: updatedMicrocycles
    }))
  }
  
  // Manejar cambio en includesDeload
  const handleDeloadChange = (checked: boolean) => {
    // Actualizar el estado de deload
    setEditedMesocycle(prev => ({
      ...prev,
      includesDeload: checked
    }))
    
    // Si activamos deload y hay microciclos, marcar el último como deload
    if (checked && editedMesocycle.microCycles.length > 0) {
      const updatedMicrocycles = [...editedMesocycle.microCycles]
      updatedMicrocycles[updatedMicrocycles.length - 1].isDeload = true
      updatedMicrocycles[updatedMicrocycles.length - 1].intensity = "low"
      updatedMicrocycles[updatedMicrocycles.length - 1].volume = "low"
      
      setEditedMesocycle(prev => ({
        ...prev,
        microCycles: updatedMicrocycles
      }))
    }
    
    // Si desactivamos deload, quitar la marca de deload de todos los microciclos
    if (!checked) {
      const updatedMicrocycles = editedMesocycle.microCycles.map(micro => ({
        ...micro,
        isDeload: false
      }))
      
      setEditedMesocycle(prev => ({
        ...prev,
        microCycles: updatedMicrocycles
      }))
    }
  }
  
  return (
    <div className="space-y-6">
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mesocycle-name">Nombre</Label>
              <Input
                id="mesocycle-name"
                value={editedMesocycle.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mesocycle-duration">Duración (semanas)</Label>
              <Input
                id="mesocycle-duration"
                type="number"
                min={1}
                max={12}
                value={editedMesocycle.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mesocycle-description">Descripción</Label>
            <Textarea
              id="mesocycle-description"
              value={editedMesocycle.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mesocycle-focus">Enfoque</Label>
              <Select
                value={editedMesocycle.focus}
                onValueChange={(value) => handleChange('focus', value)}
              >
                <SelectTrigger id="mesocycle-focus">
                  <SelectValue placeholder="Selecciona enfoque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Fuerza</SelectItem>
                  <SelectItem value="hypertrophy">Hipertrofia</SelectItem>
                  <SelectItem value="endurance">Resistencia</SelectItem>
                  <SelectItem value="power">Potencia</SelectItem>
                  <SelectItem value="mixed">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mesocycle-progression">Modelo de progresión</Label>
              <Select
                value={editedMesocycle.progressionModel}
                onValueChange={(value) => handleChange('progressionModel', value)}
              >
                <SelectTrigger id="mesocycle-progression">
                  <SelectValue placeholder="Selecciona modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Lineal</SelectItem>
                  <SelectItem value="undulating">Ondulante</SelectItem>
                  <SelectItem value="block">Por bloques</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="includes-deload" className="cursor-pointer">
                Incluir semana de descarga (Deload)
              </Label>
              <Switch
                id="includes-deload"
                checked={editedMesocycle.includesDeload}
                onCheckedChange={handleDeloadChange}
              />
            </div>
            
            {editedMesocycle.includesDeload && (
              <div className="pl-6 border-l-2 border-primary/20 mt-2">
                <Label htmlFor="deload-strategy" className="mb-2 block">
                  Estrategia de descarga
                </Label>
                <Select
                  value={editedMesocycle.deloadStrategy || 'volume'}
                  onValueChange={(value) => handleChange('deloadStrategy', value)}
                >
                  <SelectTrigger id="deload-strategy">
                    <SelectValue placeholder="Selecciona estrategia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volume">Reducción de volumen</SelectItem>
                    <SelectItem value="intensity">Reducción de intensidad</SelectItem>
                    <SelectItem value="both">Reducción completa</SelectItem>
                    <SelectItem value="frequency">Reducción de frecuencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button3D variant="outline" onClick={handleCancel}>
              Cancelar
            </Button3D>
            <Button3D onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </Button3D>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">{mesocycle.name}</h3>
              <p className="text-sm text-muted-foreground">{mesocycle.description}</p>
            </div>
            <div className="flex space-x-2">
              <Button3D variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button3D>
              <Button3D variant="destructive" size="sm" onClick={onDelete}>
                <Trash className="h-4 w-4 mr-2" />
                Eliminar
              </Button3D>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-accent/10 p-3 rounded-lg">
              <div className="flex items-center text-sm font-medium mb-1">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                Duración
              </div>
              <div className="text-lg font-semibold">{mesocycle.duration} semanas</div>
            </div>
            
            <div className="bg-accent/10 p-3 rounded-lg">
              <div className="flex items-center text-sm font-medium mb-1">
                <Target className="h-4 w-4 mr-2 text-primary" />
                Enfoque
              </div>
              <div className="text-lg font-semibold capitalize">
                {mesocycle.focus === 'strength' ? 'Fuerza' :
                 mesocycle.focus === 'hypertrophy' ? 'Hipertrofia' :
                 mesocycle.focus === 'endurance' ? 'Resistencia' :
                 mesocycle.focus === 'power' ? 'Potencia' :
                 mesocycle.focus === 'mixed' ? 'Mixto' : mesocycle.focus}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-accent/10 p-3 rounded-lg">
              <div className="flex items-center text-sm font-medium mb-1">
                <BarChart className="h-4 w-4 mr-2 text-primary" />
                Progresión
              </div>
              <div className="text-lg font-semibold capitalize">
                {mesocycle.progressionModel === 'linear' ? 'Lineal' :
                 mesocycle.progressionModel === 'undulating' ? 'Ondulante' :
                 mesocycle.progressionModel === 'block' ? 'Por bloques' :
                 mesocycle.progressionModel === 'custom' ? 'Personalizada' : mesocycle.progressionModel}
              </div>
            </div>
            
            <div className="bg-accent/10 p-3 rounded-lg">
              <div className="flex items-center text-sm font-medium mb-1">
                <Zap className="h-4 w-4 mr-2 text-primary" />
                Descarga (Deload)
              </div>
              <div className="text-lg font-semibold">
                {mesocycle.includesDeload ? (
                  <span className="flex items-center">
                    <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                    Incluida
                  </span>
                ) : (
                  <span className="flex items-center">
                    <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
                    No incluida
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Microciclos</h3>
          <Button3D variant="outline" size="sm" onClick={addMicrocycle}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir microciclo
          </Button3D>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {editedMesocycle.microCycles.map((microcycle, index) => (
            <AccordionItem key={microcycle.id} value={microcycle.id}>
              <AccordionTrigger className="hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  <span>{microcycle.name}</span>
                  {microcycle.isDeload && (
                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                      Deload
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4">
                <MicrocycleConfigurator
                  microcycle={microcycle}
                  onUpdate={(updated) => updateMicrocycle(index, updated)}
                  onDelete={() => removeMicrocycle(index)}
                  availableExercises={availableExercises}
                  isDeload={microcycle.isDeload}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        {editedMesocycle.microCycles.length === 0 && (
          <div className="text-center py-6 bg-accent/5 rounded-lg">
            <Clock className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No hay microciclos configurados. Añade uno para comenzar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
