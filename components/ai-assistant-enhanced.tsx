"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/contexts/auth-context"
import { 
  Bot, 
  User, 
  Send, 
  X, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Sparkles,
  Loader2,
  ChevronRight,
  ExternalLink
} from "lucide-react"
import { 
  aiAssistantService, 
  AssistantMessage, 
  AssistantAction 
} from "@/lib/services/ai-assistant-service"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface AIAssistantEnhancedProps {
  initialMessage?: string
  currentModule?: string
  className?: string
}

export function AIAssistantEnhanced({
  initialMessage = "¡Hola! Soy tu asistente de fitness. ¿En qué puedo ayudarte hoy?",
  currentModule,
  className
}: AIAssistantEnhancedProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [actions, setActions] = useState<AssistantAction[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Inicializar el asistente con el mensaje inicial
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      const initialAssistantMessage: AssistantMessage = {
        id: "initial-message",
        content: initialMessage,
        role: "assistant",
        timestamp: new Date(),
        metadata: {
          suggestions: ["Entrenamientos", "Nutrición", "Sueño", "Bienestar"]
        }
      }
      
      setMessages([initialAssistantMessage])
      setSuggestions(initialAssistantMessage.metadata?.suggestions || [])
    }
  }, [initialMessage, messages.length])

  // Actualizar el contexto del asistente cuando cambia el módulo actual
  useEffect(() => {
    if (currentModule) {
      aiAssistantService.updateContext({ currentModule })
    }
  }, [currentModule])

  // Cargar el historial de conversación cuando el usuario inicia sesión
  useEffect(() => {
    if (user) {
      loadConversationHistory()
    }
  }, [user])

  // Desplazarse al final de los mensajes cuando se añaden nuevos
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cargar el historial de conversación desde Supabase
  const loadConversationHistory = async () => {
    if (!user) return
    
    try {
      // Actualizar el contexto con el ID del usuario
      aiAssistantService.updateContext({ userId: user.id })
      
      // Enriquecer el contexto con datos del usuario
      await aiAssistantService.enrichContextWithUserData(user.id)
      
      // Cargar el historial de conversación
      const historyLoaded = await aiAssistantService.loadConversationHistory(user.id)
      
      if (historyLoaded) {
        const history = aiAssistantService.getConversationHistory()
        
        if (history.length > 0) {
          setMessages(history)
          
          // Obtener sugerencias y acciones del último mensaje del asistente
          const lastAssistantMessage = [...history]
            .reverse()
            .find(msg => msg.role === "assistant")
          
          if (lastAssistantMessage?.metadata) {
            setSuggestions(lastAssistantMessage.metadata.suggestions || [])
            setActions(lastAssistantMessage.metadata.actions || [])
          }
        }
      }
    } catch (error) {
      console.error("Error al cargar el historial de conversación:", error)
    }
  }

  // Desplazarse al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Manejar el envío de mensajes
  const handleSendMessage = async () => {
    if (!message.trim()) return
    
    // Crear mensaje del usuario
    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      content: message,
      role: "user",
      timestamp: new Date()
    }
    
    // Actualizar la interfaz de usuario
    setMessages(prev => [...prev, userMessage])
    setMessage("")
    setSuggestions([])
    setActions([])
    setIsLoading(true)
    
    try {
      // Enviar mensaje al asistente
      const response = await aiAssistantService.sendMessage(message)
      
      // Actualizar sugerencias y acciones
      setSuggestions(response.suggestions || [])
      setActions(response.actions || [])
      
      // Enfocar el campo de entrada
      inputRef.current?.focus()
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar el envío de mensajes con Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Manejar clic en sugerencia
  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
    handleSendMessage()
  }

  // Manejar clic en acción
  const handleActionClick = (action: AssistantAction) => {
    if (action.type === "link") {
      router.push(action.value)
    } else if (action.type === "function") {
      // Implementar manejo de funciones personalizadas
      toast({
        title: "Acción",
        description: `Ejecutando acción: ${action.label}`
      })
    }
  }

  // Limpiar la conversación
  const handleClearConversation = () => {
    // Mensaje inicial
    const initialAssistantMessage: AssistantMessage = {
      id: "initial-message",
      content: initialMessage,
      role: "assistant",
      timestamp: new Date(),
      metadata: {
        suggestions: ["Entrenamientos", "Nutrición", "Sueño", "Bienestar"]
      }
    }
    
    // Actualizar estado
    setMessages([initialAssistantMessage])
    setSuggestions(initialAssistantMessage.metadata?.suggestions || [])
    setActions([])
    
    // Limpiar historial en el servicio
    aiAssistantService.clearConversationHistory()
    
    // Guardar historial vacío si hay usuario
    if (user) {
      aiAssistantService.saveConversationHistory(user.id)
    }
    
    toast({
      title: "Conversación limpiada",
      description: "Se ha reiniciado la conversación."
    })
  }

  // Renderizar mensajes
  const renderMessages = () => {
    return messages.map((msg, index) => (
      <div
        key={msg.id}
        className={cn(
          "flex w-full mb-4",
          msg.role === "user" ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "flex items-start gap-2 max-w-[80%]",
            msg.role === "user" && "flex-row-reverse"
          )}
        >
          {/* Avatar */}
          <Avatar className="h-8 w-8">
            {msg.role === "assistant" ? (
              <>
                <AvatarImage src="/images/assistant-avatar.png" alt="AI" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </>
            ) : (
              <>
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name || "Usuario"} />
                <AvatarFallback className="bg-muted">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </>
            )}
          </Avatar>
          
          {/* Mensaje */}
          <div
            className={cn(
              "rounded-lg px-3 py-2 text-sm",
              msg.role === "assistant"
                ? "bg-muted text-foreground"
                : "bg-primary text-primary-foreground"
            )}
          >
            <div className="whitespace-pre-wrap">{msg.content}</div>
            
            {/* Hora del mensaje */}
            <div
              className={cn(
                "text-xs mt-1 text-right",
                msg.role === "assistant"
                  ? "text-muted-foreground"
                  : "text-primary-foreground/80"
              )}
            >
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    ))
  }

  // Renderizar sugerencias
  const renderSuggestions = () => {
    if (suggestions.length === 0) return null
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <ChevronRight className="h-3 w-3 mr-1" />
            {suggestion}
          </Button>
        ))}
      </div>
    )
  }

  // Renderizar acciones
  const renderActions = () => {
    if (actions.length === 0) return null
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => handleActionClick(action)}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            {action.label}
          </Button>
        ))}
      </div>
    )
  }

  // Si el asistente está cerrado, mostrar solo el botón para abrirlo
  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="rounded-full h-12 w-12 fixed bottom-4 right-4 shadow-lg"
              onClick={() => setIsOpen(true)}
            >
              <Sparkles className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Abrir asistente</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Card
      className={cn(
        "fixed z-50 transition-all duration-200 shadow-lg",
        isExpanded
          ? "inset-4 md:inset-8 lg:inset-10"
          : "bottom-4 right-4 w-80 md:w-96",
        className
      )}
    >
      <CardHeader className="p-3 flex flex-row items-center justify-between bg-primary text-primary-foreground">
        <div className="flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Asistente IA</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary/80"
            onClick={handleClearConversation}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary/80"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary/80"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea
          className={cn(
            "p-4",
            isExpanded ? "h-[calc(100vh-12rem)]" : "h-80"
          )}
        >
          {renderMessages()}
          
          {/* Indicador de carga */}
          {isLoading && (
            <div className="flex w-full justify-start mb-4">
              <div className="flex items-start gap-2 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-3 py-2 text-sm bg-muted text-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            </div>
          )}
          
          {/* Elemento para desplazarse al final */}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex flex-col gap-3">
        {/* Sugerencias */}
        {renderSuggestions()}
        
        {/* Acciones */}
        {renderActions()}
        
        {/* Campo de entrada */}
        <div className="flex w-full items-center gap-2">
          <Input
            ref={inputRef}
            placeholder="Escribe un mensaje..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
