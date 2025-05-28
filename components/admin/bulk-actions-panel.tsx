"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Mail, MessageSquare, Settings, Download, Upload,
  AlertTriangle, CheckCircle, X, Send, FileText, Zap,
  UserCheck, UserX, RefreshCw, BarChart3, Target, Award
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface BulkActionsPanelProps {
  selectedUsers: string[]
  allUsers: any[]
  onClose: () => void
  onActionComplete: () => void
}

interface BulkAction {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'communication' | 'management' | 'data' | 'system'
  requiresConfirmation: boolean
  destructive?: boolean
}

interface CommunicationTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'email' | 'notification' | 'sms'
}

const BULK_ACTIONS: BulkAction[] = [
  {
    id: 'send_message',
    name: 'Enviar Mensaje',
    description: 'Enviar mensaje personalizado a usuarios seleccionados',
    icon: <MessageSquare className="h-5 w-5" />,
    category: 'communication',
    requiresConfirmation: false
  },
  {
    id: 'send_email',
    name: 'Enviar Email',
    description: 'Enviar email masivo con plantilla personalizable',
    icon: <Mail className="h-5 w-5" />,
    category: 'communication',
    requiresConfirmation: false
  },
  {
    id: 'update_experience_level',
    name: 'Actualizar Nivel de Experiencia',
    description: 'Cambiar el nivel de experiencia en lote',
    icon: <Target className="h-5 w-5" />,
    category: 'management',
    requiresConfirmation: true
  },
  {
    id: 'reset_adaptive_profile',
    name: 'Resetear Perfil Adaptativo',
    description: 'Reiniciar configuración adaptativa a valores por defecto',
    icon: <RefreshCw className="h-5 w-5" />,
    category: 'management',
    requiresConfirmation: true
  },
  {
    id: 'recalculate_metrics',
    name: 'Recalcular Métricas',
    description: 'Forzar recálculo de todas las métricas de progreso',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'system',
    requiresConfirmation: false
  },
  {
    id: 'export_data',
    name: 'Exportar Datos',
    description: 'Exportar datos de usuarios seleccionados a CSV/Excel',
    icon: <Download className="h-5 w-5" />,
    category: 'data',
    requiresConfirmation: false
  },
  {
    id: 'grant_achievement',
    name: 'Otorgar Logro',
    description: 'Conceder logro específico a usuarios seleccionados',
    icon: <Award className="h-5 w-5" />,
    category: 'management',
    requiresConfirmation: false
  },
  {
    id: 'suspend_users',
    name: 'Suspender Usuarios',
    description: 'Suspender temporalmente acceso de usuarios',
    icon: <UserX className="h-5 w-5" />,
    category: 'management',
    requiresConfirmation: true,
    destructive: true
  },
  {
    id: 'activate_users',
    name: 'Activar Usuarios',
    description: 'Reactivar usuarios suspendidos',
    icon: <UserCheck className="h-5 w-5" />,
    category: 'management',
    requiresConfirmation: true
  }
]

const COMMUNICATION_TEMPLATES: CommunicationTemplate[] = [
  {
    id: 'welcome',
    name: 'Mensaje de Bienvenida',
    subject: '¡Bienvenido a Routinize!',
    content: 'Hola {nombre},\n\n¡Bienvenido a nuestra plataforma de entrenamiento personalizado! Estamos emocionados de tenerte con nosotros.\n\nSaludos,\nEl equipo de Routinize',
    type: 'email'
  },
  {
    id: 'motivation',
    name: 'Mensaje Motivacional',
    subject: '¡Sigue adelante con tu entrenamiento!',
    content: 'Hola {nombre},\n\nHemos notado que has estado trabajando duro en tus entrenamientos. ¡Sigue así!\n\nRecuerda que cada día es una oportunidad para mejorar.\n\nSaludos,\nEl equipo de Routinize',
    type: 'notification'
  },
  {
    id: 'check_in',
    name: 'Check-in de Progreso',
    subject: '¿Cómo va tu progreso?',
    content: 'Hola {nombre},\n\n¿Cómo te sientes con tu rutina actual? Nos encantaría saber sobre tu progreso y si necesitas algún ajuste.\n\nSaludos,\nEl equipo de Routinize',
    type: 'email'
  }
]

export function BulkActionsPanel({ selectedUsers, allUsers, onClose, onActionComplete }: BulkActionsPanelProps) {
  const { toast } = useToast()
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionProgress, setExecutionProgress] = useState(0)
  const [showConfirmation, setShowConfirmation] = useState(false)
  
  // Estados específicos para diferentes acciones
  const [messageContent, setMessageContent] = useState('')
  const [messageSubject, setMessageSubject] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [newExperienceLevel, setNewExperienceLevel] = useState('')
  const [selectedAchievement, setSelectedAchievement] = useState('')
  const [suspensionReason, setSuspensionReason] = useState('')
  const [suspensionDuration, setSuspensionDuration] = useState('7')

  const selectedUsersData = allUsers.filter(user => selectedUsers.includes(user.id))
  const action = BULK_ACTIONS.find(a => a.id === selectedAction)

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId)
    const action = BULK_ACTIONS.find(a => a.id === actionId)
    
    if (action?.requiresConfirmation) {
      setShowConfirmation(true)
    } else {
      executeAction(actionId)
    }
  }

  const executeAction = async (actionId: string) => {
    try {
      setIsExecuting(true)
      setExecutionProgress(0)

      switch (actionId) {
        case 'send_message':
          await executeSendMessage()
          break
        case 'send_email':
          await executeSendEmail()
          break
        case 'update_experience_level':
          await executeUpdateExperienceLevel()
          break
        case 'reset_adaptive_profile':
          await executeResetAdaptiveProfile()
          break
        case 'recalculate_metrics':
          await executeRecalculateMetrics()
          break
        case 'export_data':
          await executeExportData()
          break
        case 'grant_achievement':
          await executeGrantAchievement()
          break
        case 'suspend_users':
          await executeSuspendUsers()
          break
        case 'activate_users':
          await executeActivateUsers()
          break
        default:
          throw new Error('Acción no implementada')
      }

      toast({
        title: "Acción Completada",
        description: `Se ha ejecutado la acción para ${selectedUsers.length} usuarios`,
      })

      onActionComplete()
      onClose()
    } catch (error) {
      console.error('Error executing bulk action:', error)
      toast({
        title: "Error",
        description: "No se pudo completar la acción",
        variant: "destructive"
      })
    } finally {
      setIsExecuting(false)
      setShowConfirmation(false)
    }
  }

  const executeSendMessage = async () => {
    // Simular envío de mensajes
    for (let i = 0; i < selectedUsers.length; i++) {
      // Aquí iría la lógica real de envío
      await new Promise(resolve => setTimeout(resolve, 100))
      setExecutionProgress(((i + 1) / selectedUsers.length) * 100)
    }
  }

  const executeSendEmail = async () => {
    const template = COMMUNICATION_TEMPLATES.find(t => t.id === selectedTemplate)
    
    for (let i = 0; i < selectedUsers.length; i++) {
      const user = selectedUsersData[i]
      // Personalizar contenido
      const personalizedContent = template?.content.replace('{nombre}', user.fullName) || messageContent
      
      // Aquí iría la lógica real de envío de email
      await new Promise(resolve => setTimeout(resolve, 200))
      setExecutionProgress(((i + 1) / selectedUsers.length) * 100)
    }
  }

  const executeUpdateExperienceLevel = async () => {
    for (let i = 0; i < selectedUsers.length; i++) {
      // Aquí iría la lógica real de actualización
      await new Promise(resolve => setTimeout(resolve, 150))
      setExecutionProgress(((i + 1) / selectedUsers.length) * 100)
    }
  }

  const executeResetAdaptiveProfile = async () => {
    for (let i = 0; i < selectedUsers.length; i++) {
      // Aquí iría la lógica real de reset
      await new Promise(resolve => setTimeout(resolve, 300))
      setExecutionProgress(((i + 1) / selectedUsers.length) * 100)
    }
  }

  const executeRecalculateMetrics = async () => {
    for (let i = 0; i < selectedUsers.length; i++) {
      // Aquí iría la lógica real de recálculo
      await new Promise(resolve => setTimeout(resolve, 500))
      setExecutionProgress(((i + 1) / selectedUsers.length) * 100)
    }
  }

  const executeExportData = async () => {
    // Simular exportación
    await new Promise(resolve => setTimeout(resolve, 2000))
    setExecutionProgress(100)
    
    // Aquí se generaría y descargaría el archivo
    const csvContent = generateCSV(selectedUsersData)
    downloadCSV(csvContent, 'usuarios_exportados.csv')
  }

  const executeGrantAchievement = async () => {
    for (let i = 0; i < selectedUsers.length; i++) {
      // Aquí iría la lógica real de otorgar logro
      await new Promise(resolve => setTimeout(resolve, 100))
      setExecutionProgress(((i + 1) / selectedUsers.length) * 100)
    }
  }

  const executeSuspendUsers = async () => {
    for (let i = 0; i < selectedUsers.length; i++) {
      // Aquí iría la lógica real de suspensión
      await new Promise(resolve => setTimeout(resolve, 200))
      setExecutionProgress(((i + 1) / selectedUsers.length) * 100)
    }
  }

  const executeActivateUsers = async () => {
    for (let i = 0; i < selectedUsers.length; i++) {
      // Aquí iría la lógica real de activación
      await new Promise(resolve => setTimeout(resolve, 150))
      setExecutionProgress(((i + 1) / selectedUsers.length) * 100)
    }
  }

  const generateCSV = (users: any[]) => {
    const headers = ['ID', 'Nombre', 'Email', 'Estado', 'Nivel', 'Adherencia', 'Fatiga', 'Último Acceso']
    const rows = users.map(user => [
      user.id,
      user.fullName,
      user.email,
      user.status,
      user.adaptiveProfile?.experienceLevel || '',
      user.progressMetrics?.adherenceRate || 0,
      user.progressMetrics?.avgFatigue || 0,
      user.lastActive
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderActionForm = () => {
    switch (selectedAction) {
      case 'send_message':
        return (
          <div className="space-y-4">
            <div>
              <Label>Plantilla</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plantilla..." />
                </SelectTrigger>
                <SelectContent>
                  {COMMUNICATION_TEMPLATES.filter(t => t.type === 'notification').map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mensaje</Label>
              <Textarea
                placeholder="Escribe tu mensaje aquí..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )

      case 'send_email':
        return (
          <div className="space-y-4">
            <div>
              <Label>Plantilla de Email</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plantilla..." />
                </SelectTrigger>
                <SelectContent>
                  {COMMUNICATION_TEMPLATES.filter(t => t.type === 'email').map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Asunto</Label>
              <Input
                placeholder="Asunto del email..."
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
              />
            </div>
            <div>
              <Label>Contenido</Label>
              <Textarea
                placeholder="Contenido del email..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Usa {'{nombre}'} para personalizar con el nombre del usuario
              </p>
            </div>
          </div>
        )

      case 'update_experience_level':
        return (
          <div>
            <Label>Nuevo Nivel de Experiencia</Label>
            <Select value={newExperienceLevel} onValueChange={setNewExperienceLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nivel..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Principiante</SelectItem>
                <SelectItem value="intermediate">Intermedio</SelectItem>
                <SelectItem value="advanced">Avanzado</SelectItem>
                <SelectItem value="expert">Experto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 'grant_achievement':
        return (
          <div>
            <Label>Logro a Otorgar</Label>
            <Select value={selectedAchievement} onValueChange={setSelectedAchievement}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar logro..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first_workout">Primer Entrenamiento</SelectItem>
                <SelectItem value="week_streak">Racha de 7 días</SelectItem>
                <SelectItem value="month_streak">Racha de 30 días</SelectItem>
                <SelectItem value="strength_milestone">Hito de Fuerza</SelectItem>
                <SelectItem value="consistency_champion">Campeón de Consistencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 'suspend_users':
        return (
          <div className="space-y-4">
            <div>
              <Label>Duración de Suspensión (días)</Label>
              <Select value={suspensionDuration} onValueChange={setSuspensionDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 día</SelectItem>
                  <SelectItem value="3">3 días</SelectItem>
                  <SelectItem value="7">7 días</SelectItem>
                  <SelectItem value="14">14 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                  <SelectItem value="permanent">Permanente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Razón de Suspensión</Label>
              <Textarea
                placeholder="Describe la razón de la suspensión..."
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Acciones Masivas</h2>
            <p className="text-gray-600">
              {selectedUsers.length} usuario{selectedUsers.length !== 1 ? 's' : ''} seleccionado{selectedUsers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <SafeClientButton variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </SafeClientButton>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!selectedAction ? (
            /* Selección de acción */
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Selecciona una acción</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {BULK_ACTIONS.map((action) => (
                    <Card
                      key={action.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        action.destructive ? 'border-red-200 hover:border-red-300' : ''
                      }`}
                      onClick={() => handleActionSelect(action.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <div className={`p-2 rounded-lg mr-3 ${
                            action.destructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {action.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{action.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {action.category}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Usuarios seleccionados */}
              <div>
                <h3 className="text-lg font-medium mb-4">Usuarios Seleccionados</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {selectedUsersData.map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <span className="text-sm">{user.fullName}</span>
                        <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {user.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Configuración de acción */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{action?.name}</h3>
                  <p className="text-gray-600">{action?.description}</p>
                </div>
                <SafeClientButton variant="outline" onClick={() => setSelectedAction('')}>
                  Cambiar Acción
                </SafeClientButton>
              </div>

              {renderActionForm()}

              {isExecuting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span>{Math.round(executionProgress)}%</span>
                  </div>
                  <Progress value={executionProgress} className="h-2" />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <SafeClientButton variant="outline" onClick={() => setSelectedAction('')} disabled={isExecuting}>
                  Cancelar
                </SafeClientButton>
                <SafeClientButton
                  onClick={() => executeAction(selectedAction)}
                  disabled={isExecuting}
                  className={action?.destructive ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Ejecutando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Ejecutar Acción
                    </>
                  )}
                </SafeClientButton>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Acción</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que quieres ejecutar "{action?.name}" para {selectedUsers.length} usuario{selectedUsers.length !== 1 ? 's' : ''}?
                {action?.destructive && (
                  <span className="block mt-2 text-red-600 font-medium">
                    Esta acción puede ser irreversible.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <SafeClientButton variant="outline" onClick={() => setShowConfirmation(false)}>
                Cancelar
              </SafeClientButton>
              <SafeClientButton
                onClick={() => executeAction(selectedAction)}
                className={action?.destructive ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                Confirmar
              </SafeClientButton>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
