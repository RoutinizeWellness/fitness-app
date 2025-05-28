"use client"

import { useState, useEffect } from "react"
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Check,
  ArrowRight,
  BarChart3,
  Calendar
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { 
  TrainingObjective,
  ObjectivePriority
} from "@/lib/types/advanced-periodization"
import { PeriodizationService } from "@/lib/services/periodization-service"

interface TrainingObjectivesProps {
  userId: string
  objectives: TrainingObjective[]
  onObjectivesChange: (objectives: TrainingObjective[]) => void
}

export function TrainingObjectives({ 
  userId, 
  objectives, 
  onObjectivesChange 
}: TrainingObjectivesProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingObjective, setEditingObjective] = useState<TrainingObjective | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Crear nuevo objetivo
  const handleCreateObjective = async (objective: TrainingObjective) => {
    setIsLoading(true)
    
    try {
      // Asignar ID temporal para UI
      const newObjective = {
        ...objective,
        user_id: userId,
        id: `temp-${Date.now()}`
      }
      
      // Actualizar estado local
      const updatedObjectives = [...objectives, newObjective]
      onObjectivesChange(updatedObjectives)
      
      // Cerrar diálogo
      setShowAddDialog(false)
      setEditingObjective(null)
      
      toast({
        title: "Objetivo creado",
        description: "El objetivo ha sido creado correctamente"
      })
    } catch (error) {
      console.error('Error al crear objetivo:', error)
      toast({
        title: "Error",
        description: "No se pudo crear el objetivo",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Actualizar objetivo
  const handleUpdateObjective = async (objective: TrainingObjective) => {
    if (!objective.id) return
    
    setIsLoading(true)
    
    try {
      // Actualizar estado local
      const updatedObjectives = objectives.map(obj => 
        obj.id === objective.id ? objective : obj
      )
      onObjectivesChange(updatedObjectives)
      
      // Cerrar diálogo
      setEditingObjective(null)
      
      toast({
        title: "Objetivo actualizado",
        description: "El objetivo ha sido actualizado correctamente"
      })
    } catch (error) {
      console.error('Error al actualizar objetivo:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el objetivo",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Eliminar objetivo
  const handleDeleteObjective = async (objectiveId: string) => {
    setIsLoading(true)
    
    try {
      // Actualizar estado local
      const updatedObjectives = objectives.filter(obj => obj.id !== objectiveId)
      onObjectivesChange(updatedObjectives)
      
      toast({
        title: "Objetivo eliminado",
        description: "El objetivo ha sido eliminado correctamente"
      })
    } catch (error) {
      console.error('Error al eliminar objetivo:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el objetivo",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Objetivos de Entrenamiento</h3>
        <Button3D size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nuevo Objetivo
        </Button3D>
      </div>
      
      {objectives.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No hay objetivos definidos</p>
          <Button3D 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Añadir Objetivo
          </Button3D>
        </div>
      ) : (
        <div className="space-y-2">
          {objectives.map(objective => (
            <ObjectiveCard 
              key={objective.id}
              objective={objective}
              onEdit={() => setEditingObjective(objective)}
              onDelete={() => handleDeleteObjective(objective.id!)}
            />
          ))}
        </div>
      )}
      
      {/* Diálogo para añadir objetivo */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Objetivo de Entrenamiento</DialogTitle>
            <DialogDescription>
              Define un objetivo medible para tu programa de entrenamiento
            </DialogDescription>
          </DialogHeader>
          
          <ObjectiveForm 
            onSubmit={handleCreateObjective}
            onCancel={() => setShowAddDialog(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para editar objetivo */}
      <Dialog open={!!editingObjective} onOpenChange={(open) => !open && setEditingObjective(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Objetivo</DialogTitle>
            <DialogDescription>
              Modifica los detalles de tu objetivo de entrenamiento
            </DialogDescription>
          </DialogHeader>
          
          {editingObjective && (
            <ObjectiveForm 
              objective={editingObjective}
              onSubmit={handleUpdateObjective}
              onCancel={() => setEditingObjective(null)}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente para mostrar un objetivo
function ObjectiveCard({ 
  objective, 
  onEdit, 
  onDelete 
}: { 
  objective: TrainingObjective
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="border rounded-lg p-3 hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h4 className="font-medium">{objective.name}</h4>
            <Badge 
              variant="outline" 
              className="ml-2 bg-primary/10 text-primary"
            >
              {getCategoryName(objective.category)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{objective.description}</p>
        </div>
        
        <div className="flex space-x-1">
          <Button3D variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button3D>
          <Button3D variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button3D>
        </div>
      </div>
      
      {(objective.target_value !== undefined && objective.units) && (
        <div className="mt-2 flex items-center text-sm">
          <Target className="h-4 w-4 mr-1 text-primary" />
          <span>
            Meta: {objective.target_value} {objective.units}
            {objective.current_value !== undefined && (
              <> (Actual: {objective.current_value} {objective.units})</>
            )}
          </span>
        </div>
      )}
      
      {objective.deadline && (
        <div className="mt-1 flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-1 text-primary" />
          <span>Fecha límite: {new Date(objective.deadline).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  )
}

// Formulario para crear/editar objetivos
function ObjectiveForm({ 
  objective, 
  onSubmit, 
  onCancel,
  isLoading
}: { 
  objective?: TrainingObjective
  onSubmit: (objective: TrainingObjective) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [name, setName] = useState(objective?.name || '')
  const [description, setDescription] = useState(objective?.description || '')
  const [category, setCategory] = useState(objective?.category || 'strength')
  const [targetValue, setTargetValue] = useState(objective?.target_value?.toString() || '')
  const [currentValue, setCurrentValue] = useState(objective?.current_value?.toString() || '')
  const [units, setUnits] = useState(objective?.units || 'kg')
  const [deadline, setDeadline] = useState(objective?.deadline || '')
  const [associatedExercise, setAssociatedExercise] = useState(objective?.associated_exercise || '')
  const [measurementProtocol, setMeasurementProtocol] = useState(objective?.measurement_protocol || '')
  const [successCriteria, setSuccessCriteria] = useState(objective?.success_criteria || '')
  
  const handleSubmit = () => {
    if (!name) {
      toast({
        title: "Error",
        description: "El nombre del objetivo es obligatorio",
        variant: "destructive"
      })
      return
    }
    
    const newObjective: TrainingObjective = {
      id: objective?.id,
      name,
      description,
      category: category as 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'skill',
      target_value: targetValue ? parseFloat(targetValue) : undefined,
      current_value: currentValue ? parseFloat(currentValue) : undefined,
      units,
      deadline: deadline || undefined,
      associated_exercise: associatedExercise || undefined,
      measurement_protocol: measurementProtocol || undefined,
      success_criteria: successCriteria || undefined,
      is_achieved: objective?.is_achieved || false
    }
    
    onSubmit(newObjective)
  }
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="objective-name">Nombre del objetivo *</Label>
        <Input
          id="objective-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Aumentar press de banca"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="objective-description">Descripción</Label>
        <Textarea
          id="objective-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe tu objetivo en detalle"
          rows={2}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="objective-category">Categoría *</Label>
          <select
            id="objective-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="strength">Fuerza</option>
            <option value="hypertrophy">Hipertrofia</option>
            <option value="power">Potencia</option>
            <option value="endurance">Resistencia</option>
            <option value="skill">Técnica</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="objective-exercise">Ejercicio asociado</Label>
          <Input
            id="objective-exercise"
            value={associatedExercise}
            onChange={(e) => setAssociatedExercise(e.target.value)}
            placeholder="Ej: Press de banca"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="objective-target">Valor objetivo</Label>
          <Input
            id="objective-target"
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="Ej: 100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="objective-current">Valor actual</Label>
          <Input
            id="objective-current"
            type="number"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder="Ej: 80"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="objective-units">Unidades</Label>
          <Input
            id="objective-units"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            placeholder="Ej: kg"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="objective-deadline">Fecha límite</Label>
        <Input
          id="objective-deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="objective-protocol">Protocolo de medición</Label>
        <Textarea
          id="objective-protocol"
          value={measurementProtocol}
          onChange={(e) => setMeasurementProtocol(e.target.value)}
          placeholder="Ej: Test de 1RM con 3 minutos de descanso"
          rows={2}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="objective-criteria">Criterios de éxito</Label>
        <Textarea
          id="objective-criteria"
          value={successCriteria}
          onChange={(e) => setSuccessCriteria(e.target.value)}
          placeholder="Ej: Completar 3 repeticiones con técnica perfecta"
          rows={2}
        />
      </div>
      
      <DialogFooter>
        <Button3D variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button3D>
        <Button3D onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Guardando...' : (objective ? 'Actualizar' : 'Crear')}
        </Button3D>
      </DialogFooter>
    </div>
  )
}

// Funciones auxiliares

function getCategoryName(category: string): string {
  switch (category) {
    case 'strength': return 'Fuerza'
    case 'hypertrophy': return 'Hipertrofia'
    case 'power': return 'Potencia'
    case 'endurance': return 'Resistencia'
    case 'skill': return 'Técnica'
    default: return category
  }
}
