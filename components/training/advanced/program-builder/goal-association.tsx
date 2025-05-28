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
  Calendar,
  Link,
  Unlink
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { 
  TrainingObjective,
  ObjectiveAssociation,
  ObjectivePriority,
  PeriodizationProgram,
  Mesocycle,
  Microcycle
} from "@/lib/types/advanced-periodization"

interface GoalAssociationProps {
  programId: string
  objectives: TrainingObjective[]
  mesocycles: Mesocycle[]
  associations: ObjectiveAssociation[]
  onAssociationsChange: (associations: ObjectiveAssociation[]) => void
}

export function GoalAssociation({ 
  programId, 
  objectives, 
  mesocycles,
  associations, 
  onAssociationsChange 
}: GoalAssociationProps) {
  const [selectedEntityType, setSelectedEntityType] = useState<'program' | 'mesocycle'>('mesocycle')
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  
  // Obtener asociaciones para la entidad seleccionada
  const getEntityAssociations = () => {
    if (!selectedEntityId) return []
    
    return associations.filter(
      assoc => assoc.entity_type === selectedEntityType && assoc.entity_id === selectedEntityId
    )
  }
  
  // Obtener objetivos asociados a la entidad seleccionada
  const getEntityObjectives = () => {
    const entityAssociations = getEntityAssociations()
    return entityAssociations.map(assoc => {
      const objective = objectives.find(obj => obj.id === assoc.objective_id)
      return {
        ...objective,
        priority: assoc.priority,
        expected_progress: assoc.expected_progress,
        association_id: assoc.id
      }
    }).filter(Boolean)
  }
  
  // Obtener objetivos disponibles (no asociados a la entidad seleccionada)
  const getAvailableObjectives = () => {
    const entityAssociations = getEntityAssociations()
    const associatedObjectiveIds = entityAssociations.map(assoc => assoc.objective_id)
    return objectives.filter(obj => !associatedObjectiveIds.includes(obj.id!))
  }
  
  // Asociar objetivo a la entidad seleccionada
  const handleAssociateObjective = (
    objectiveId: string, 
    priority: ObjectivePriority,
    expectedProgress?: number
  ) => {
    if (!selectedEntityId) return
    
    const newAssociation: ObjectiveAssociation = {
      id: `temp-${Date.now()}`,
      objective_id: objectiveId,
      entity_type: selectedEntityType,
      entity_id: selectedEntityId,
      priority,
      expected_progress: expectedProgress
    }
    
    const updatedAssociations = [...associations, newAssociation]
    onAssociationsChange(updatedAssociations)
    
    toast({
      title: "Objetivo asociado",
      description: "El objetivo ha sido asociado correctamente"
    })
    
    setShowAddDialog(false)
  }
  
  // Eliminar asociación
  const handleRemoveAssociation = (associationId: string) => {
    const updatedAssociations = associations.filter(assoc => assoc.id !== associationId)
    onAssociationsChange(updatedAssociations)
    
    toast({
      title: "Asociación eliminada",
      description: "La asociación ha sido eliminada correctamente"
    })
  }
  
  // Actualizar prioridad de una asociación
  const handleUpdatePriority = (associationId: string, priority: ObjectivePriority) => {
    const updatedAssociations = associations.map(assoc => 
      assoc.id === associationId ? { ...assoc, priority } : assoc
    )
    onAssociationsChange(updatedAssociations)
  }
  
  // Actualizar progreso esperado de una asociación
  const handleUpdateExpectedProgress = (associationId: string, expectedProgress: number) => {
    const updatedAssociations = associations.map(assoc => 
      assoc.id === associationId ? { ...assoc, expected_progress: expectedProgress } : assoc
    )
    onAssociationsChange(updatedAssociations)
  }
  
  // Renderizar selector de entidad
  const renderEntitySelector = () => {
    return (
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Button3D 
            variant={selectedEntityType === 'program' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedEntityType('program')
              setSelectedEntityId(programId)
            }}
          >
            Programa Completo
          </Button3D>
          <Button3D 
            variant={selectedEntityType === 'mesocycle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedEntityType('mesocycle')
              setSelectedEntityId(null)
            }}
          >
            Mesociclos
          </Button3D>
        </div>
        
        {selectedEntityType === 'mesocycle' && (
          <div className="grid grid-cols-2 gap-2">
            {mesocycles.map(mesocycle => (
              <Button3D 
                key={mesocycle.id}
                variant={selectedEntityId === mesocycle.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedEntityId(mesocycle.id)}
                className="justify-start"
              >
                {mesocycle.name}
              </Button3D>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  // Renderizar objetivos asociados
  const renderAssociatedObjectives = () => {
    const entityObjectives = getEntityObjectives()
    
    if (entityObjectives.length === 0) {
      return (
        <div className="text-center py-6 border border-dashed rounded-lg">
          <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No hay objetivos asociados</p>
          <Button3D 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => setShowAddDialog(true)}
            disabled={!selectedEntityId || getAvailableObjectives().length === 0}
          >
            <Plus className="h-4 w-4 mr-1" />
            Asociar Objetivo
          </Button3D>
        </div>
      )
    }
    
    return (
      <div className="space-y-3">
        {entityObjectives.map(objective => (
          <div 
            key={objective.association_id}
            className="border rounded-lg p-3 hover:border-primary/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <h4 className="font-medium">{objective.name}</h4>
                  <PriorityBadge priority={objective.priority} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">{objective.description}</p>
              </div>
              
              <div className="flex space-x-1">
                <Button3D 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveAssociation(objective.association_id!)}
                >
                  <Unlink className="h-4 w-4" />
                </Button3D>
              </div>
            </div>
            
            {(objective.target_value !== undefined && objective.units) && (
              <div className="mt-2">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span>
                    Meta: {objective.target_value} {objective.units}
                  </span>
                  <span>
                    Progreso esperado: {objective.expected_progress || 0}%
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={objective.expected_progress || 0} className="flex-1" />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={objective.expected_progress || 0}
                    onChange={(e) => handleUpdateExpectedProgress(
                      objective.association_id!, 
                      parseInt(e.target.value)
                    )}
                    className="w-16 h-6 text-xs"
                  />
                </div>
              </div>
            )}
            
            <div className="mt-3 flex space-x-2">
              <Button3D 
                size="sm"
                variant={objective.priority === 'primary' ? 'default' : 'outline'}
                className="text-xs h-7 px-2"
                onClick={() => handleUpdatePriority(objective.association_id!, 'primary')}
              >
                Primario
              </Button3D>
              <Button3D 
                size="sm"
                variant={objective.priority === 'secondary' ? 'default' : 'outline'}
                className="text-xs h-7 px-2"
                onClick={() => handleUpdatePriority(objective.association_id!, 'secondary')}
              >
                Secundario
              </Button3D>
              <Button3D 
                size="sm"
                variant={objective.priority === 'tertiary' ? 'default' : 'outline'}
                className="text-xs h-7 px-2"
                onClick={() => handleUpdatePriority(objective.association_id!, 'tertiary')}
              >
                Terciario
              </Button3D>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Asociación de Objetivos</h3>
        <Button3D 
          size="sm" 
          onClick={() => setShowAddDialog(true)}
          disabled={!selectedEntityId || getAvailableObjectives().length === 0}
        >
          <Plus className="h-4 w-4 mr-1" />
          Asociar Objetivo
        </Button3D>
      </div>
      
      <Card3D>
        <Card3DContent>
          {renderEntitySelector()}
        </Card3DContent>
      </Card3D>
      
      {selectedEntityId && (
        <Card3D>
          <Card3DHeader>
            <Card3DTitle>
              Objetivos para {selectedEntityType === 'program' ? 'el Programa Completo' : 'el Mesociclo Seleccionado'}
            </Card3DTitle>
          </Card3DHeader>
          <Card3DContent>
            {renderAssociatedObjectives()}
          </Card3DContent>
        </Card3D>
      )}
      
      {/* Diálogo para asociar objetivo */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asociar Objetivo</DialogTitle>
            <DialogDescription>
              Selecciona un objetivo para asociar a {selectedEntityType === 'program' ? 'el programa completo' : 'este mesociclo'}
            </DialogDescription>
          </DialogHeader>
          
          <AssociateObjectiveForm 
            objectives={getAvailableObjectives()}
            onAssociate={handleAssociateObjective}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Formulario para asociar objetivos
function AssociateObjectiveForm({ 
  objectives, 
  onAssociate, 
  onCancel 
}: { 
  objectives: TrainingObjective[]
  onAssociate: (objectiveId: string, priority: ObjectivePriority, expectedProgress?: number) => void
  onCancel: () => void
}) {
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>('')
  const [priority, setPriority] = useState<ObjectivePriority>('primary')
  const [expectedProgress, setExpectedProgress] = useState<number>(50)
  
  const handleSubmit = () => {
    if (!selectedObjectiveId) {
      toast({
        title: "Error",
        description: "Selecciona un objetivo",
        variant: "destructive"
      })
      return
    }
    
    onAssociate(selectedObjectiveId, priority, expectedProgress)
  }
  
  return (
    <div className="space-y-4">
      {objectives.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No hay objetivos disponibles para asociar</p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos los objetivos ya están asociados o no has creado ninguno
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="objective-select">Objetivo *</Label>
            <select
              id="objective-select"
              value={selectedObjectiveId}
              onChange={(e) => setSelectedObjectiveId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecciona un objetivo</option>
              {objectives.map(objective => (
                <option key={objective.id} value={objective.id}>
                  {objective.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority-select">Prioridad *</Label>
            <select
              id="priority-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as ObjectivePriority)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="primary">Primario</option>
              <option value="secondary">Secundario</option>
              <option value="tertiary">Terciario</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expected-progress">
              Progreso esperado (%)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-1 inline-block text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Porcentaje del objetivo que esperas lograr en este bloque</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="expected-progress"
                type="number"
                min={0}
                max={100}
                value={expectedProgress}
                onChange={(e) => setExpectedProgress(parseInt(e.target.value))}
              />
              <span>%</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button3D variant="outline" onClick={onCancel}>
              Cancelar
            </Button3D>
            <Button3D onClick={handleSubmit}>
              Asociar Objetivo
            </Button3D>
          </DialogFooter>
        </>
      )}
    </div>
  )
}

// Badge para mostrar la prioridad
function PriorityBadge({ priority }: { priority: ObjectivePriority }) {
  let color = ''
  let label = ''
  
  switch (priority) {
    case 'primary':
      color = 'bg-green-100 text-green-800 border-green-200'
      label = 'Primario'
      break
    case 'secondary':
      color = 'bg-blue-100 text-blue-800 border-blue-200'
      label = 'Secundario'
      break
    case 'tertiary':
      color = 'bg-purple-100 text-purple-800 border-purple-200'
      label = 'Terciario'
      break
  }
  
  return (
    <Badge variant="outline" className={`ml-2 ${color}`}>
      {label}
    </Badge>
  )
}
