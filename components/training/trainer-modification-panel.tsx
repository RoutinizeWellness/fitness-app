"use client"

import { useState, useEffect } from "react"
import {
  Edit,
  Plus,
  Trash,
  RotateCcw,
  MessageSquare,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Send
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  WorkoutRoutine, 
  WorkoutDay, 
  Exercise,
  ExerciseSet,
  TrainerModification,
  TrainerFeedback
} from "@/lib/types/training"
import { 
  createTrainerModification,
  getTrainerModifications,
  updateModificationStatus,
  applyModification
} from "@/lib/trainer-service"
import { getExercises } from "@/lib/supabase-training"
import { toast } from "@/components/ui/use-toast"

interface TrainerModificationPanelProps {
  trainerId: string
  userId: string
  routine: WorkoutRoutine
  onRoutineUpdated?: () => void
  className?: string
}

export function TrainerModificationPanel({
  trainerId,
  userId,
  routine,
  onRoutineUpdated,
  className
}: TrainerModificationPanelProps) {
  const [modifications, setModifications] = useState<TrainerModification[]>([])
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [modificationType, setModificationType] = useState<string>('add_exercise')
  const [newExerciseId, setNewExerciseId] = useState<string>('')
  const [modificationReason, setModificationReason] = useState<string>('')
  const [feedbackMessage, setFeedbackMessage] = useState<string>('')
  const [feedbackType, setFeedbackType] = useState<string>('technique')
  
  // Cargar modificaciones y ejercicios disponibles
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      try {
        // Cargar modificaciones
        const { data: modsData, error: modsError } = await getTrainerModifications(trainerId, {
          userId,
          routineId: routine.id
        })
        
        if (modsError) {
          console.error("Error al cargar modificaciones:", modsError)
        } else if (modsData) {
          setModifications(modsData)
        }
        
        // Cargar ejercicios disponibles
        const { data: exercisesData, error: exercisesError } = await getExercises()
        
        if (exercisesError) {
          console.error("Error al cargar ejercicios:", exercisesError)
        } else if (exercisesData) {
          setAvailableExercises(exercisesData)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (trainerId && userId && routine) {
      loadData()
    }
  }, [trainerId, userId, routine])
  
  // Crear una nueva modificación
  const handleCreateModification = async () => {
    if (!selectedDay && modificationType !== 'general_feedback') {
      toast({
        title: "Error",
        description: "Debes seleccionar un día de entrenamiento",
        variant: "destructive"
      })
      return
    }
    
    if ((modificationType === 'replace_exercise' || modificationType === 'adjust_sets') && !selectedExercise) {
      toast({
        title: "Error",
        description: "Debes seleccionar un ejercicio",
        variant: "destructive"
      })
      return
    }
    
    if ((modificationType === 'add_exercise' || modificationType === 'replace_exercise') && !newExerciseId) {
      toast({
        title: "Error",
        description: "Debes seleccionar un ejercicio nuevo",
        variant: "destructive"
      })
      return
    }
    
    if (!modificationReason) {
      toast({
        title: "Error",
        description: "Debes proporcionar una razón para la modificación",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Preparar datos de la modificación
      const modificationData: Omit<TrainerModification, 'id' | 'createdAt' | 'status'> = {
        trainerId,
        userId,
        routineId: routine.id,
        dayId: selectedDay?.id,
        exerciseId: selectedExercise || undefined,
        modificationType: modificationType as any,
        reason: modificationReason,
        originalValue: selectedExercise || undefined,
        newValue: newExerciseId || undefined
      }
      
      // Crear la modificación
      const { data, error } = await createTrainerModification(modificationData)
      
      if (error) {
        throw error
      }
      
      // Actualizar la lista de modificaciones
      if (data) {
        setModifications([data, ...modifications])
      }
      
      // Cerrar el diálogo y limpiar el formulario
      setShowAddDialog(false)
      resetForm()
      
      toast({
        title: "Modificación creada",
        description: "La modificación se ha creado correctamente",
        variant: "default"
      })
    } catch (error) {
      console.error("Error al crear modificación:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la modificación",
        variant: "destructive"
      })
    }
  }
  
  // Enviar feedback al usuario
  const handleSendFeedback = async () => {
    if (!feedbackMessage) {
      toast({
        title: "Error",
        description: "Debes escribir un mensaje de feedback",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Crear una modificación de tipo feedback
      const modificationData: Omit<TrainerModification, 'id' | 'createdAt' | 'status'> = {
        trainerId,
        userId,
        routineId: routine.id,
        modificationType: 'general_feedback',
        reason: feedbackMessage,
        originalValue: feedbackType
      }
      
      // Crear la modificación
      const { data, error } = await createTrainerModification(modificationData)
      
      if (error) {
        throw error
      }
      
      // Actualizar la lista de modificaciones
      if (data) {
        setModifications([data, ...modifications])
      }
      
      // Cerrar el diálogo y limpiar el formulario
      setShowFeedbackDialog(false)
      setFeedbackMessage('')
      
      toast({
        title: "Feedback enviado",
        description: "El feedback se ha enviado correctamente",
        variant: "default"
      })
    } catch (error) {
      console.error("Error al enviar feedback:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el feedback",
        variant: "destructive"
      })
    }
  }
  
  // Aplicar una modificación
  const handleApplyModification = async (modificationId: string) => {
    try {
      const { success, error } = await applyModification(modificationId)
      
      if (error) {
        throw error
      }
      
      if (success) {
        // Actualizar el estado de la modificación en la lista
        const updatedModifications = modifications.map(mod => 
          mod.id === modificationId ? { ...mod, status: 'applied', appliedAt: new Date().toISOString() } : mod
        )
        
        setModifications(updatedModifications)
        
        // Notificar al componente padre para que actualice la rutina
        if (onRoutineUpdated) {
          onRoutineUpdated()
        }
        
        toast({
          title: "Modificación aplicada",
          description: "La modificación se ha aplicado correctamente",
          variant: "default"
        })
      }
    } catch (error) {
      console.error("Error al aplicar modificación:", error)
      toast({
        title: "Error",
        description: "No se pudo aplicar la modificación",
        variant: "destructive"
      })
    }
  }
  
  // Rechazar una modificación
  const handleRejectModification = async (modificationId: string) => {
    try {
      const { data, error } = await updateModificationStatus(modificationId, 'rejected')
      
      if (error) {
        throw error
      }
      
      // Actualizar el estado de la modificación en la lista
      const updatedModifications = modifications.map(mod => 
        mod.id === modificationId ? { ...mod, status: 'rejected' } : mod
      )
      
      setModifications(updatedModifications)
      
      toast({
        title: "Modificación rechazada",
        description: "La modificación se ha rechazado correctamente",
        variant: "default"
      })
    } catch (error) {
      console.error("Error al rechazar modificación:", error)
      toast({
        title: "Error",
        description: "No se pudo rechazar la modificación",
        variant: "destructive"
      })
    }
  }
  
  // Resetear el formulario
  const resetForm = () => {
    setSelectedDay(null)
    setSelectedExercise(null)
    setModificationType('add_exercise')
    setNewExerciseId('')
    setModificationReason('')
  }
  
  // Obtener el nombre de un ejercicio por su ID
  const getExerciseName = (exerciseId: string) => {
    const exercise = availableExercises.find(ex => ex.id === exerciseId)
    return exercise ? exercise.name : 'Ejercicio desconocido'
  }
  
  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card3D className={className}>
        <Card3DHeader>
          <Card3DTitle>Panel de modificaciones</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  return (
    <Card3D className={className}>
      <Card3DHeader>
        <div className="flex justify-between items-center">
          <Card3DTitle>Panel de modificaciones</Card3DTitle>
          
          <div className="flex space-x-2">
            <Button3D variant="outline" size="sm" onClick={() => setShowFeedbackDialog(true)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </Button3D>
            
            <Button3D size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva modificación
            </Button3D>
          </div>
        </div>
      </Card3DHeader>
      
      <Card3DContent>
        <Tabs defaultValue="pending">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="applied">Aplicadas</TabsTrigger>
            <TabsTrigger value="rejected">Rechazadas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            {modifications.filter(mod => mod.status === 'pending').length > 0 ? (
              <div className="space-y-4">
                {modifications
                  .filter(mod => mod.status === 'pending')
                  .map(mod => (
                    <ModificationCard
                      key={mod.id}
                      modification={mod}
                      getExerciseName={getExerciseName}
                      onApply={() => handleApplyModification(mod.id)}
                      onReject={() => handleRejectModification(mod.id)}
                    />
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay modificaciones pendientes
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="applied">
            {modifications.filter(mod => mod.status === 'applied').length > 0 ? (
              <div className="space-y-4">
                {modifications
                  .filter(mod => mod.status === 'applied')
                  .map(mod => (
                    <ModificationCard
                      key={mod.id}
                      modification={mod}
                      getExerciseName={getExerciseName}
                      isReadOnly
                    />
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay modificaciones aplicadas
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="rejected">
            {modifications.filter(mod => mod.status === 'rejected').length > 0 ? (
              <div className="space-y-4">
                {modifications
                  .filter(mod => mod.status === 'rejected')
                  .map(mod => (
                    <ModificationCard
                      key={mod.id}
                      modification={mod}
                      getExerciseName={getExerciseName}
                      isReadOnly
                    />
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay modificaciones rechazadas
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card3DContent>
      
      {/* Diálogo para crear una nueva modificación */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva modificación</DialogTitle>
            <DialogDescription>
              Crea una nueva modificación para la rutina del usuario.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Día de entrenamiento</label>
              <Select
                value={selectedDay?.id || ''}
                onValueChange={(value) => {
                  const day = routine.days.find(d => d.id === value)
                  setSelectedDay(day || null)
                  setSelectedExercise(null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un día" />
                </SelectTrigger>
                <SelectContent>
                  {routine.days.map(day => (
                    <SelectItem key={day.id} value={day.id}>
                      {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo de modificación</label>
              <Select
                value={modificationType}
                onValueChange={setModificationType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add_exercise">Añadir ejercicio</SelectItem>
                  <SelectItem value="remove_exercise">Eliminar ejercicio</SelectItem>
                  <SelectItem value="replace_exercise">Reemplazar ejercicio</SelectItem>
                  <SelectItem value="adjust_sets">Ajustar series</SelectItem>
                  <SelectItem value="adjust_routine">Ajustar rutina</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(modificationType === 'remove_exercise' || 
              modificationType === 'replace_exercise' || 
              modificationType === 'adjust_sets') && selectedDay && (
              <div>
                <label className="text-sm font-medium mb-1 block">Ejercicio actual</label>
                <Select
                  value={selectedExercise || ''}
                  onValueChange={setSelectedExercise}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un ejercicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDay.exercises.map(ex => (
                      <SelectItem key={ex.id} value={ex.id}>
                        {getExerciseName(ex.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {(modificationType === 'add_exercise' || modificationType === 'replace_exercise') && (
              <div>
                <label className="text-sm font-medium mb-1 block">Nuevo ejercicio</label>
                <Select
                  value={newExerciseId}
                  onValueChange={setNewExerciseId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un ejercicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableExercises.map(ex => (
                      <SelectItem key={ex.id} value={ex.id}>
                        {ex.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-1 block">Razón de la modificación</label>
              <Textarea
                value={modificationReason}
                onChange={(e) => setModificationReason(e.target.value)}
                placeholder="Explica por qué estás haciendo esta modificación"
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D onClick={handleCreateModification}>
              Crear modificación
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para enviar feedback */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar feedback</DialogTitle>
            <DialogDescription>
              Envía feedback al usuario sobre su entrenamiento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo de feedback</label>
              <Select
                value={feedbackType}
                onValueChange={setFeedbackType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technique">Técnica</SelectItem>
                  <SelectItem value="performance">Rendimiento</SelectItem>
                  <SelectItem value="progress">Progreso</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Mensaje</label>
              <Textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Escribe tu feedback para el usuario"
                className="min-h-[150px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowFeedbackDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D onClick={handleSendFeedback}>
              Enviar feedback
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card3D>
  )
}

// Componente para mostrar una modificación
interface ModificationCardProps {
  modification: TrainerModification
  getExerciseName: (id: string) => string
  onApply?: () => void
  onReject?: () => void
  isReadOnly?: boolean
}

function ModificationCard({
  modification,
  getExerciseName,
  onApply,
  onReject,
  isReadOnly = false
}: ModificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Obtener título según el tipo de modificación
  const getModificationTitle = () => {
    switch (modification.modificationType) {
      case 'add_exercise':
        return 'Añadir ejercicio'
      case 'remove_exercise':
        return 'Eliminar ejercicio'
      case 'replace_exercise':
        return 'Reemplazar ejercicio'
      case 'adjust_sets':
        return 'Ajustar series'
      case 'adjust_reps':
        return 'Ajustar repeticiones'
      case 'adjust_weight':
        return 'Ajustar peso'
      case 'adjust_routine':
        return 'Ajustar rutina'
      case 'general_feedback':
        return 'Feedback general'
      default:
        return 'Modificación'
    }
  }
  
  // Obtener descripción según el tipo de modificación
  const getModificationDescription = () => {
    switch (modification.modificationType) {
      case 'add_exercise':
        return `Añadir ${getExerciseName(modification.newValue as string)}`
      case 'remove_exercise':
        return `Eliminar ${getExerciseName(modification.originalValue as string)}`
      case 'replace_exercise':
        return `Reemplazar ${getExerciseName(modification.originalValue as string)} por ${getExerciseName(modification.newValue as string)}`
      case 'adjust_sets':
        return `Ajustar series de ${getExerciseName(modification.exerciseId as string)}`
      case 'adjust_reps':
        return `Ajustar repeticiones de ${getExerciseName(modification.exerciseId as string)}`
      case 'adjust_weight':
        return `Ajustar peso de ${getExerciseName(modification.exerciseId as string)}`
      case 'adjust_routine':
        return 'Ajustar propiedades de la rutina'
      case 'general_feedback':
        return `Feedback: ${modification.originalValue}`
      default:
        return 'Modificación de entrenamiento'
    }
  }
  
  // Obtener color de la insignia según el estado
  const getBadgeVariant = () => {
    switch (modification.status) {
      case 'pending':
        return 'outline'
      case 'applied':
        return 'default'
      case 'rejected':
        return 'destructive'
      default:
        return 'outline'
    }
  }
  
  // Obtener texto de la insignia según el estado
  const getBadgeText = () => {
    switch (modification.status) {
      case 'pending':
        return 'Pendiente'
      case 'applied':
        return 'Aplicada'
      case 'rejected':
        return 'Rechazada'
      default:
        return 'Desconocido'
    }
  }
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-3 bg-gray-50 flex justify-between items-center">
        <div>
          <h3 className="font-medium">{getModificationTitle()}</h3>
          <p className="text-sm text-gray-600">{getModificationDescription()}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={getBadgeVariant()}>
            {getBadgeText()}
          </Badge>
          
          <Button3D variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button3D>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3 border-t">
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Razón</h4>
            <p className="text-sm">{modification.reason}</p>
          </div>
          
          <div className="text-xs text-gray-500 mb-3">
            Creada el {new Date(modification.createdAt).toLocaleDateString()}
            {modification.appliedAt && (
              <span> · Aplicada el {new Date(modification.appliedAt).toLocaleDateString()}</span>
            )}
          </div>
          
          {!isReadOnly && modification.status === 'pending' && (
            <div className="flex justify-end space-x-2">
              {onReject && (
                <Button3D variant="outline" size="sm" onClick={onReject}>
                  <X className="h-4 w-4 mr-1" />
                  Rechazar
                </Button3D>
              )}
              
              {onApply && (
                <Button3D size="sm" onClick={onApply}>
                  <Check className="h-4 w-4 mr-1" />
                  Aplicar
                </Button3D>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
