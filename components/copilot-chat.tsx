"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, X, Minimize, Maximize, MessageSquare, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  suggestions?: string[]
  actions?: any[]
}

interface CopilotChatProps {
  className?: string
}

export function CopilotChat({ className }: CopilotChatProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          content: `¡Hola${user?.displayName ? ` ${user.displayName}` : ""}! Soy tu asistente de fitness. ¿En qué puedo ayudarte hoy?`,
          sender: "bot",
          timestamp: new Date()
        }
      ])
    }
  }, [isOpen, messages.length, user?.displayName])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Obtener el módulo actual basado en la URL
      const pathname = window.location.pathname
      let currentModule = "dashboard"

      if (pathname.includes("/training")) {
        currentModule = "training"
      } else if (pathname.includes("/nutrition")) {
        currentModule = "nutrition"
      } else if (pathname.includes("/sleep")) {
        currentModule = "sleep"
      } else if (pathname.includes("/wellness")) {
        currentModule = "wellness"
      }

      // Llamar a la API de Copilot
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          context: {
            currentModule
          }
        }),
      })

      if (!response.ok) {
        throw new Error("Error al comunicarse con el asistente")
      }

      const data = await response.json()

      // Crear mensaje de respuesta del bot con sugerencias y acciones
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response.message,
        sender: "bot",
        timestamp: new Date(),
        suggestions: data.response.suggestions,
        actions: data.response.actions
      }

      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error("Error al enviar mensaje:", error)

      // Mensaje de error como respuesta del bot
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Lo siento, estoy teniendo problemas para procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.",
        sender: "bot",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Botón flotante para abrir el chat */}
      {!isOpen && (
        <button
          className="fixed bottom-20 right-4 z-40 bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div
          className={cn(
            "fixed z-50 shadow-xl transition-all duration-200",
            isMinimized
              ? "bottom-20 right-4 w-auto"
              : "bottom-20 right-4 w-80 sm:w-96 md:w-[450px]",
            className
          )}
        >
            <Card className="border-primary/20 overflow-hidden">
              <CardHeader className="bg-primary/10 p-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2 bg-primary/20">
                    <AvatarImage src="/icons/bot-avatar.png" />
                    <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-sm font-medium">Asistente de Fitness</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {!isMinimized && (
                <>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[350px] p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex",
                              message.sender === "user" ? "justify-end" : "justify-start"
                            )}
                          >
                            <div className="flex flex-col">
                              <div
                                className={cn(
                                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                                  message.sender === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                )}
                              >
                                {message.content}
                              </div>

                              {/* Sugerencias */}
                              {message.sender === "bot" && message.suggestions && message.suggestions.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {message.suggestions.map((suggestion, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      className="text-xs"
                                      onClick={() => {
                                        setInput(suggestion)
                                        inputRef.current?.focus()
                                      }}
                                    >
                                      {suggestion}
                                    </Button>
                                  ))}
                                </div>
                              )}

                              {/* Acciones */}
                              {message.sender === "bot" && message.actions && message.actions.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {message.actions.map((action, index) => (
                                    <Button
                                      key={index}
                                      variant="default"
                                      size="sm"
                                      className="text-xs"
                                      onClick={() => {
                                        if (action.type === "link") {
                                          router.push(action.value)
                                          setIsOpen(false)
                                        } else if (action.type === "function") {
                                          // Aquí se implementaría la lógica para ejecutar funciones
                                          console.log("Ejecutar función:", action.value)
                                        }
                                      }}
                                    >
                                      {action.type === "link" && <ExternalLink className="h-3 w-3 mr-1" />}
                                      {action.label}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-muted">
                              <span className="flex items-center space-x-1">
                                <span className="animate-bounce">.</span>
                                <span className="animate-bounce delay-75">.</span>
                                <span className="animate-bounce delay-150">.</span>
                              </span>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>

                  <CardFooter className="p-3 pt-0">
                    <form
                      className="flex w-full items-center space-x-2"
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSendMessage()
                      }}
                    >
                      <Input
                        ref={inputRef}
                        placeholder="Escribe un mensaje..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || isLoading}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </CardFooter>
                </>
              )}
            </Card>
          </div>
        )}
    </>
  )
}
