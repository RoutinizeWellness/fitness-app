"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { useGemini } from "@/lib/contexts/gemini-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, X, Minimize, Maximize, MessageSquare, ExternalLink, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  suggestions?: string[]
  actions?: any[]
}

interface GeminiChatProps {
  className?: string
  initialOpen?: boolean
  initialMinimized?: boolean
  context?: Record<string, any>
}

export function GeminiChat({
  className,
  initialOpen = false,
  initialMinimized = false,
  context = {}
}: GeminiChatProps) {
  const { user } = useAuth()
  const { messages, isLoading, sendMessage, clearMessages, isInitialized } = useGemini()
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [isMinimized, setIsMinimized] = useState(initialMinimized)
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  // No need for initial welcome message as it's handled by the context

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Use the sendMessage function from the context with additional context data
    await sendMessage(input, context)
    setInput("")
  }

  const clearChat = () => {
    // Use the clearMessages function from the context
    clearMessages()
    toast({
      title: "Chat reiniciado",
      description: "Se ha reiniciado la conversación.",
    })
  }

  return (
    <>
      {/* Botón flotante para abrir el chat */}
      {!isOpen && (
        <button
          className="fixed bottom-20 right-4 z-40 bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
          onClick={() => setIsOpen(true)}
        >
          <Sparkles className="h-6 w-6" />
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
                    <AvatarImage src="/icons/gemini-avatar.png" />
                    <AvatarFallback><Sparkles className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-sm font-medium">Asistente Gemini</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={clearChat}
                    title="Reiniciar chat"
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
                            </div>
                          </div>
                        ))}
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
                        placeholder={isLoading ? "Pensando..." : "Escribe un mensaje..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1"
                        disabled={isLoading}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || isLoading}
                        className={isLoading ? "animate-pulse" : ""}
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
