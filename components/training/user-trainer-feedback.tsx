"use client"

import { useState, useEffect } from "react"
import {
  MessageSquare,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Bell,
  User,
  Calendar,
  Clock
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  TrainerModification,
  TrainerFeedback
} from "@/lib/types/training"
import { supabase } from "@/lib/supabase-client"
import { toast } from "@/components/ui/use-toast"

interface UserTrainerFeedbackProps {
  userId: string
  className?: string
}

export function UserTrainerFeedback({
  userId,
  className
}: UserTrainerFeedbackProps) {
  const [modifications, setModifications] = useState<TrainerModification[]>([])
  const [feedback, setFeedback] = useState<TrainerFeedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<TrainerFeedback | null>(null)
  const [responseMessage, setResponseMessage] = useState<string>('')

  // Cargar modificaciones y feedback
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      try {
        // Cargar modificaciones
        const { data: modsData, error: modsError } = await supabase
          .from('trainer_modifications')
          .select(`
            *,
            trainer:users(id, email, first_name, last_name, avatar_url)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (modsError) {
          console.error("Error al cargar modificaciones:", modsError)
        } else if (modsData) {
          // Transformar los datos al formato esperado
          const transformedMods: TrainerModification[] = modsData.map(mod => ({
            id: mod.id,
            trainerId: mod.trainer_id,
            userId: mod.user_id,
            routineId: mod.routine_id,
            dayId: mod.day_id || undefined,
            exerciseId: mod.exercise_id || undefined,
            modificationType: mod.modification_type,
            originalValue: mod.original_value,
            newValue: mod.new_value,
            reason: mod.reason,
            status: mod.status,
            createdAt: mod.created_at,
            appliedAt: mod.applied_at || undefined,
            trainer: mod.trainer
          }))

          setModifications(transformedMods)
        }

        // Cargar feedback
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('trainer_feedback')
          .select(`
            *,
            trainer:users(id, email, first_name, last_name, avatar_url)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (feedbackError) {
          console.error("Error al cargar feedback:", feedbackError)
        } else if (feedbackData) {
          // Transformar los datos al formato esperado
          const transformedFeedback: TrainerFeedback[] = feedbackData.map(fb => ({
            id: fb.id,
            trainerId: fb.trainer_id,
            userId: fb.user_id,
            workoutLogId: fb.workout_log_id || undefined,
            routineId: fb.routine_id || undefined,
            type: fb.type,
            message: fb.message,
            rating: fb.rating,
            createdAt: fb.created_at,
            readByUser: fb.read_by_user,
            userResponse: fb.user_response,
            trainer: fb.trainer
          }))

          setFeedback(transformedFeedback)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      loadData()
    }
  }, [userId])

  // Marcar feedback como leído
  const markFeedbackAsRead = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from('trainer_feedback')
        .update({ read_by_user: true })
        .eq('id', feedbackId)

      if (error) {
        throw error
      }

      // Actualizar el estado local
      setFeedback(feedback.map(fb =>
        fb.id === feedbackId ? { ...fb, readByUser: true } : fb
      ))
    } catch (error) {
      console.error("Error al marcar feedback como leído:", error)
    }
  }

  // Responder a un feedback
  const handleRespondToFeedback = async () => {
    if (!selectedFeedback) return

    if (!responseMessage.trim()) {
      toast({
        title: "Error",
        description: "Debes escribir una respuesta",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('trainer_feedback')
        .update({
          user_response: responseMessage,
          read_by_user: true
        })
        .eq('id', selectedFeedback.id)

      if (error) {
        throw error
      }

      // Actualizar el estado local
      setFeedback(feedback.map(fb =>
        fb.id === selectedFeedback.id ?
          { ...fb, userResponse: responseMessage, readByUser: true } :
          fb
      ))

      // Cerrar el diálogo y limpiar el formulario
      setShowResponseDialog(false)
      setResponseMessage('')
      setSelectedFeedback(null)

      toast({
        title: "Respuesta enviada",
        description: "Tu respuesta ha sido enviada al entrenador",
        variant: "default"
      })
    } catch (error) {
      console.error("Error al responder al feedback:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar tu respuesta",
        variant: "destructive"
      })
    }
  }

  // Contar feedback no leído
  const unreadCount = feedback.filter(fb => !fb.readByUser).length

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card3D className={className}>
        <Card3DHeader>
          <Card3DTitle>Feedback del entrenador</Card3DTitle>
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
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 text-primary mr-2" />
            <Card3DTitle>Feedback del entrenador</Card3DTitle>
          </div>

          {unreadCount > 0 && (
            <Badge variant="destructive">
              {unreadCount} nuevo{unreadCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </Card3DHeader>

      <Card3DContent>
        <Tabs defaultValue="feedback">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="feedback">
              Feedback
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="modifications">Modificaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback">
            {feedback.length > 0 ? (
              <div className="space-y-4">
                {feedback.map(fb => (
                  <FeedbackCard
                    key={fb.id}
                    feedback={fb}
                    onRespond={() => {
                      setSelectedFeedback(fb)
                      setResponseMessage(fb.userResponse || '')
                      setShowResponseDialog(true)
                      if (!fb.readByUser) {
                        markFeedbackAsRead(fb.id)
                      }
                    }}
                    onRead={() => {
                      if (!fb.readByUser) {
                        markFeedbackAsRead(fb.id)
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No has recibido feedback de tu entrenador
              </div>
            )}
          </TabsContent>

          <TabsContent value="modifications">
            {modifications.length > 0 ? (
              <div className="space-y-4">
                {modifications.map(mod => (
                  <ModificationCard
                    key={mod.id}
                    modification={mod}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay modificaciones en tus rutinas
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card3DContent>

      {/* Diálogo para responder al feedback */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder al feedback</DialogTitle>
            <DialogDescription>
              Envía una respuesta a tu entrenador.
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">
                    {selectedFeedback.trainer?.first_name} {selectedFeedback.trainer?.last_name}
                  </span>
                </div>
                <p className="text-sm">{selectedFeedback.message}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Tu respuesta</label>
                <Textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Escribe tu respuesta al entrenador"
                  className="min-h-[150px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowResponseDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D onClick={handleRespondToFeedback}>
              Enviar respuesta
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card3D>
  )
}

// Componente para mostrar un feedback
interface FeedbackCardProps {
  feedback: TrainerFeedback & { trainer?: any }
  onRespond: () => void
  onRead: () => void
}

function FeedbackCard({
  feedback,
  onRespond,
  onRead
}: FeedbackCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Expandir automáticamente si no está leído
  useEffect(() => {
    if (!feedback.readByUser) {
      setIsExpanded(true)
    }
  }, [feedback.readByUser])

  // Marcar como leído al expandir
  useEffect(() => {
    if (isExpanded && !feedback.readByUser) {
      onRead()
    }
  }, [isExpanded, feedback.readByUser, onRead])

  // Obtener color según el tipo de feedback
  const getFeedbackColor = () => {
    switch (feedback.type) {
      case 'technique':
        return 'bg-blue-100 text-blue-600'
      case 'performance':
        return 'bg-green-100 text-green-600'
      case 'progress':
        return 'bg-purple-100 text-purple-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  // Obtener texto según el tipo de feedback
  const getFeedbackTypeText = () => {
    switch (feedback.type) {
      case 'technique':
        return 'Técnica'
      case 'performance':
        return 'Rendimiento'
      case 'progress':
        return 'Progreso'
      default:
        return 'General'
    }
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${!feedback.readByUser ? 'border-primary' : ''}`}>
      <div className="p-3 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${!feedback.readByUser ? 'bg-primary' : 'bg-transparent'}`}></div>
          <div>
            <div className="flex items-center">
              <span className="font-medium mr-2">
                {feedback.trainer?.first_name} {feedback.trainer?.last_name}
              </span>
              <Badge variant="outline" className="text-xs">
                {getFeedbackTypeText()}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              {new Date(feedback.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Button3D variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button3D>
      </div>

      {isExpanded && (
        <div className="p-3 border-t">
          <p className="text-sm mb-4">{feedback.message}</p>

          {feedback.userResponse ? (
            <div className="bg-gray-50 p-3 rounded-lg mb-3">
              <div className="flex items-center mb-1">
                <User className="h-3 w-3 mr-1 text-gray-500" />
                <span className="text-xs font-medium">Tu respuesta</span>
              </div>
              <p className="text-sm">{feedback.userResponse}</p>
            </div>
          ) : (
            <Button3D size="sm" onClick={onRespond}>
              Responder
            </Button3D>
          )}
        </div>
      )}
    </div>
  )
}

// Componente para mostrar una modificación
interface ModificationCardProps {
  modification: TrainerModification & { trainer?: any }
}

function ModificationCard({
  modification
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
          <div className="flex items-center">
            <span className="font-medium mr-2">
              {modification.trainer?.first_name} {modification.trainer?.last_name}
            </span>
            <Badge variant={getBadgeVariant()}>
              {getBadgeText()}
            </Badge>
          </div>
          <p className="text-sm">{getModificationTitle()}</p>
        </div>

        <Button3D variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button3D>
      </div>

      {isExpanded && (
        <div className="p-3 border-t">
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Razón</h4>
            <p className="text-sm">{modification.reason}</p>
          </div>

          <div className="text-xs text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Creada el {new Date(modification.createdAt).toLocaleDateString()}</span>
            </div>

            {modification.appliedAt && (
              <div className="flex items-center mt-1">
                <Check className="h-3 w-3 mr-1 text-green-500" />
                <span>Aplicada el {new Date(modification.appliedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
