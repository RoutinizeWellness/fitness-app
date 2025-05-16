"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { 
  Send, 
  MessageSquare, 
  Clock, 
  CheckCheck, 
  FileText, 
  PlusCircle,
  Calendar,
  AlertCircle,
  ThumbsUp,
  Dumbbell,
  Utensils
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Tipos para los mensajes
interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  type: 'text' | 'template' | 'feedback' | 'adjustment' | 'reminder'
  read: boolean
  created_at: string
  metadata?: {
    template_id?: string
    workout_id?: string
    nutrition_id?: string
    feedback_type?: string
    adjustment_type?: string
    reminder_type?: string
  }
}

interface MessageTemplate {
  id: string
  title: string
  content: string
  type: 'workout' | 'nutrition' | 'motivation' | 'check_in' | 'feedback'
  tags: string[]
}

interface ClientProfile {
  id: string
  user_id: string
  full_name: string
  avatar_url?: string
  last_active?: string
}

interface ProfessionalProfile {
  id: string
  user_id: string
  full_name: string
  avatar_url?: string
  role: 'trainer' | 'nutritionist' | 'admin'
}

// Componente principal de mensajería
export function ClientMessaging({ 
  clientId, 
  professionalId,
  professionalRole = 'trainer'
}: { 
  clientId: string
  professionalId: string
  professionalRole?: 'trainer' | 'nutritionist' | 'admin'
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile | null>(null)
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [activeTab, setActiveTab] = useState("messages")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  
  // Cargar mensajes y perfiles
  useEffect(() => {
    loadMessages()
    loadProfiles()
    loadMessageTemplates()
    
    // Suscribirse a nuevos mensajes
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${professionalId}`
      }, (payload) => {
        const newMsg = payload.new as Message
        if (newMsg.sender_id === clientId) {
          setMessages(prev => [...prev, newMsg])
          scrollToBottom()
        }
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [clientId, professionalId])
  
  // Desplazarse al final de los mensajes
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const loadMessages = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${clientId},receiver_id.eq.${clientId}`)
        .or(`sender_id.eq.${professionalId},receiver_id.eq.${professionalId}`)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      setMessages(data || [])
      
      // Marcar mensajes como leídos
      const unreadMessages = data?.filter(msg => 
        msg.receiver_id === professionalId && 
        msg.sender_id === clientId && 
        !msg.read
      ) || []
      
      if (unreadMessages.length > 0) {
        const unreadIds = unreadMessages.map(msg => msg.id)
        await supabase
          .from('messages')
          .update({ read: true })
          .in('id', unreadIds)
      }
    } catch (error) {
      console.error("Error al cargar mensajes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadProfiles = async () => {
    try {
      // Cargar perfil del cliente
      const { data: clientData, error: clientError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', clientId)
        .single()
      
      if (clientError) throw clientError
      
      setClientProfile({
        id: clientData.id,
        user_id: clientData.user_id,
        full_name: clientData.full_name,
        avatar_url: clientData.avatar_url,
        last_active: clientData.updated_at
      })
      
      // Cargar perfil del profesional
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', professionalId)
        .single()
      
      if (profError) throw profError
      
      setProfessionalProfile({
        id: profData.id,
        user_id: profData.user_id,
        full_name: profData.full_name,
        avatar_url: profData.avatar_url,
        role: professionalRole
      })
    } catch (error) {
      console.error("Error al cargar perfiles:", error)
    }
  }
  
  const loadMessageTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('professional_role', professionalRole)
      
      if (error) throw error
      
      setMessageTemplates(data || [])
    } catch (error) {
      console.error("Error al cargar plantillas:", error)
    }
  }
  
  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedTemplate) return
    
    try {
      const messageContent = selectedTemplate ? selectedTemplate.content : newMessage
      const messageType = selectedTemplate ? 'template' : 'text'
      
      const message: Partial<Message> = {
        sender_id: professionalId,
        receiver_id: clientId,
        content: messageContent,
        type: messageType,
        read: false,
        created_at: new Date().toISOString()
      }
      
      if (selectedTemplate) {
        message.metadata = {
          template_id: selectedTemplate.id
        }
      }
      
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
      
      if (error) throw error
      
      setMessages(prev => [...prev, data[0] as Message])
      setNewMessage("")
      setSelectedTemplate(null)
      setShowTemplates(false)
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive"
      })
    }
  }
  
  const selectMessageTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    setNewMessage(template.content)
    setShowTemplates(false)
  }
  
  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'template':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'feedback':
        return <ThumbsUp className="h-4 w-4 text-green-500" />
      case 'adjustment':
        return <Dumbbell className="h-4 w-4 text-purple-500" />
      case 'reminder':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }
  
  return (
    <Card className="w-full h-[600px] flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={clientProfile?.avatar_url || ""} />
            <AvatarFallback>{clientProfile?.full_name?.charAt(0) || "C"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{clientProfile?.full_name || "Cliente"}</h3>
            <p className="text-xs text-gray-500">
              {clientProfile?.last_active ? 
                `Última actividad: ${format(new Date(clientProfile.last_active), "d MMM, HH:mm", { locale: es })}` : 
                "Sin actividad reciente"}
            </p>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <TabsContent value="messages" className="flex-1 overflow-hidden flex flex-col p-0 m-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender_id === professionalId ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_id === professionalId 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {message.sender_id !== professionalId && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={clientProfile?.avatar_url || ""} />
                      <AvatarFallback>{clientProfile?.full_name?.charAt(0) || "C"}</AvatarFallback>
                    </Avatar>
                  )}
                  {getMessageTypeIcon(message.type)}
                  <span className="text-xs opacity-70">
                    {format(new Date(message.created_at), "HH:mm", { locale: es })}
                  </span>
                  {message.sender_id === professionalId && (
                    <CheckCheck className={`h-4 w-4 ${message.read ? 'text-green-500' : 'text-gray-400'}`} />
                  )}
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t">
          {selectedTemplate && (
            <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Plantilla: {selectedTemplate.title}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedTemplate(null)}
                className="h-6 w-6 p-0 rounded-full"
              >
                ×
              </Button>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowTemplates(!showTemplates)}
              className="rounded-full"
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
            <Button onClick={sendMessage} className="rounded-full">
              <Send className="h-5 w-5" />
            </Button>
          </div>
          
          {showTemplates && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-40 overflow-y-auto">
              <div className="text-sm font-medium mb-2">Plantillas de mensajes</div>
              <div className="space-y-1">
                {messageTemplates.map((template) => (
                  <div 
                    key={template.id}
                    onClick={() => selectMessageTemplate(template)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer flex items-center"
                  >
                    {template.type === 'workout' && <Dumbbell className="h-4 w-4 mr-2 text-purple-500" />}
                    {template.type === 'nutrition' && <Utensils className="h-4 w-4 mr-2 text-green-500" />}
                    {template.type === 'motivation' && <ThumbsUp className="h-4 w-4 mr-2 text-yellow-500" />}
                    {template.type === 'check_in' && <Calendar className="h-4 w-4 mr-2 text-blue-500" />}
                    {template.type === 'feedback' && <MessageSquare className="h-4 w-4 mr-2 text-red-500" />}
                    <span>{template.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="templates" className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          {messageTemplates.map((template) => (
            <Card key={template.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  {template.type === 'workout' && <Dumbbell className="h-5 w-5 mr-2 text-purple-500" />}
                  {template.type === 'nutrition' && <Utensils className="h-5 w-5 mr-2 text-green-500" />}
                  {template.type === 'motivation' && <ThumbsUp className="h-5 w-5 mr-2 text-yellow-500" />}
                  {template.type === 'check_in' && <Calendar className="h-5 w-5 mr-2 text-blue-500" />}
                  {template.type === 'feedback' && <MessageSquare className="h-5 w-5 mr-2 text-red-500" />}
                  <h4 className="font-medium">{template.title}</h4>
                </div>
                <div className="flex space-x-1">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {template.content}
              </p>
              <Button 
                onClick={() => selectMessageTemplate(template)}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Usar plantilla
              </Button>
            </Card>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="history" className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Historial de comunicaciones</h3>
          
          <div className="space-y-2">
            {/* Aquí se mostraría un resumen del historial de comunicaciones */}
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Esta sección mostrará un resumen de las comunicaciones con el cliente,
              incluyendo frecuencia, temas principales y patrones de respuesta.
            </p>
          </div>
        </div>
      </TabsContent>
    </Card>
  )
}
