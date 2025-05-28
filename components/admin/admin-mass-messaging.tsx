"use client"

import { useState, useEffect } from "react"
import {
  MessageSquare, Send, Users, Dumbbell, Utensils,
  Clock, CheckCircle, AlertCircle, Info, Search,
  Filter, RefreshCw, Trash, Eye
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/contexts/auth-context"
import { sendMassMessage, MassMessage } from "@/lib/admin-dashboard-service"
import { supabase } from "@/lib/supabase-client"

export function AdminMassMessaging() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'compose' | 'sent'>('compose')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sentMessages, setSentMessages] = useState<MassMessage[]>([])
  const [messageTitle, setMessageTitle] = useState("")
  const [messageContent, setMessageContent] = useState("")
  const [targetGroup, setTargetGroup] = useState<'all' | 'trainers' | 'nutritionists' | 'clients'>('all')
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<MassMessage | null>(null)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Cargar mensajes enviados
  useEffect(() => {
    if (activeTab === 'sent') {
      loadSentMessages()
    }
  }, [activeTab])

  const loadSentMessages = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('mass_messages')
        .select('*')
        .order('sent_at', { ascending: false })

      if (error) throw error

      // Formatear mensajes
      const formattedMessages: MassMessage[] = (data || []).map(message => ({
        id: message.id,
        senderId: message.sender_id,
        title: message.title,
        content: message.content,
        targetGroup: message.target_group,
        sentAt: message.sent_at,
        readCount: message.read_count,
        totalRecipients: message.total_recipients
      }))

      setSentMessages(formattedMessages)
    } catch (error) {
      console.error("Error al cargar mensajes enviados:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes enviados",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar mensajes por término de búsqueda
  const filteredMessages = sentMessages.filter(message =>
    message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Enviar mensaje masivo
  const handleSendMessage = async () => {
    // Validar campos
    if (!messageTitle.trim()) {
      toast({
        title: "Error",
        description: "El título del mensaje es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!messageContent.trim()) {
      toast({
        title: "Error",
        description: "El contenido del mensaje es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "No se pudo identificar al remitente",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      const { data, error } = await sendMassMessage(
        user.id,
        messageTitle,
        messageContent,
        targetGroup
      )

      if (error) throw error

      toast({
        title: "Mensaje enviado",
        description: `El mensaje ha sido enviado a ${data?.totalRecipients || 0} destinatarios`,
      })

      // Limpiar formulario
      setMessageTitle("")
      setMessageContent("")
      setTargetGroup('all')

      // Cambiar a pestaña de mensajes enviados
      setActiveTab('sent')
      loadSentMessages()
    } catch (error) {
      console.error("Error al enviar mensaje masivo:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Refrescar mensajes enviados
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadSentMessages()
    setIsRefreshing(false)

    toast({
      title: "Mensajes actualizados",
      description: "La lista de mensajes enviados se ha actualizado",
    })
  }

  // Ver detalles de mensaje
  const viewMessageDetails = (message: MassMessage) => {
    setSelectedMessage(message)
    setShowMessageDialog(true)
  }

  // Obtener icono y color según grupo objetivo
  const getTargetGroupIcon = (group: string) => {
    switch (group) {
      case 'trainers':
        return <Dumbbell className="h-4 w-4 text-green-500" />
      case 'nutritionists':
        return <Utensils className="h-4 w-4 text-purple-500" />
      case 'clients':
        return <Users className="h-4 w-4 text-blue-500" />
      default:
        return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  // Obtener texto según grupo objetivo
  const getTargetGroupText = (group: string) => {
    switch (group) {
      case 'trainers':
        return 'Entrenadores'
      case 'nutritionists':
        return 'Nutricionistas'
      case 'clients':
        return 'Clientes'
      default:
        return 'Todos los usuarios'
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="compose" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Redactar mensaje
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center">
            <Send className="h-4 w-4 mr-2" />
            Mensajes enviados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Nuevo mensaje</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Destinatarios</label>
                  <Select value={targetGroup} onValueChange={(value) => setTargetGroup(value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar destinatarios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      <SelectItem value="trainers">Solo entrenadores</SelectItem>
                      <SelectItem value="nutritionists">Solo nutricionistas</SelectItem>
                      <SelectItem value="clients">Solo clientes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Título del mensaje</label>
                  <Input
                    placeholder="Escribe un título claro y conciso"
                    value={messageTitle}
                    onChange={(e) => setMessageTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Contenido del mensaje</label>
                  <Textarea
                    placeholder="Escribe el contenido del mensaje..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>

                <div className="flex justify-end">
                  <Button3D
                    onClick={handleSendMessage}
                    disabled={isSending || !messageTitle.trim() || !messageContent.trim()}
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar mensaje
                      </>
                    )}
                  </Button3D>
                </div>
              </div>
            </Card3DContent>
          </Card3D>

          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Consejos para mensajes efectivos</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="space-y-2">
                <div className="flex items-start">
                  <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-500">
                    Utiliza títulos claros y descriptivos para que los usuarios entiendan rápidamente el propósito del mensaje.
                  </p>
                </div>
                <div className="flex items-start">
                  <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-500">
                    Mantén los mensajes concisos y al punto. Los mensajes largos tienen menos probabilidades de ser leídos completamente.
                  </p>
                </div>
                <div className="flex items-start">
                  <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-500">
                    Si necesitas que los usuarios realicen alguna acción, indícalo claramente al principio del mensaje.
                  </p>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-500">
                    Evita enviar mensajes masivos con demasiada frecuencia para no saturar a los usuarios.
                  </p>
                </div>
              </div>
            </Card3DContent>
          </Card3D>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar mensajes..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button3D variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </>
              )}
            </Button3D>
          </div>

          <Card3D>
            <Card3DHeader>
              <div className="flex items-center justify-between">
                <Card3DTitle>Mensajes enviados</Card3DTitle>
                <Badge variant="outline">{filteredMessages.length} mensajes</Badge>
              </div>
            </Card3DHeader>
            <Card3DContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-500">Cargando mensajes...</p>
                </div>
              ) : filteredMessages.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4 pr-4">
                    {filteredMessages.map((message) => (
                      <div key={message.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{message.title}</h3>
                            <div className="flex items-center mt-1">
                              <p className="text-xs text-gray-500 mr-2">
                                Enviado: {new Date(message.sentAt).toLocaleDateString()}
                              </p>
                              <Badge variant="outline" className="flex items-center text-xs">
                                {getTargetGroupIcon(message.targetGroup)}
                                <span className="ml-1">{getTargetGroupText(message.targetGroup)}</span>
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button3D
                              variant="outline"
                              size="sm"
                              onClick={() => viewMessageDetails(message)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver detalles
                            </Button3D>
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {message.content}
                          </p>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <Users className="h-3 w-3 mr-1" />
                            <span>{message.totalRecipients} destinatarios</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            <span>{message.readCount} leídos ({Math.round((message.readCount / message.totalRecipients) * 100)}%)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay mensajes enviados</p>
                </div>
              )}
            </Card3DContent>
          </Card3D>
        </TabsContent>
      </Tabs>

      {/* Diálogo de detalles del mensaje */}
      {showMessageDialog && selectedMessage && (
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedMessage.title}</DialogTitle>
              <DialogDescription>
                Enviado el {new Date(selectedMessage.sentAt).toLocaleDateString()} a {getTargetGroupText(selectedMessage.targetGroup)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="whitespace-pre-line">{selectedMessage.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    <div>
                      <p className="font-medium">Destinatarios</p>
                      <p className="text-sm text-gray-500">{selectedMessage.totalRecipients} usuarios</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    <div>
                      <p className="font-medium">Tasa de lectura</p>
                      <p className="text-sm text-gray-500">
                        {selectedMessage.readCount} de {selectedMessage.totalRecipients} ({Math.round((selectedMessage.readCount / selectedMessage.totalRecipients) * 100)}%)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button3D>
                  Cerrar
                </Button3D>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
