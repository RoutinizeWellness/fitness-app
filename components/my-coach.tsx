"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  MessageSquare, 
  Calendar, 
  ClipboardList, 
  Send,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getClientCoach, getCoachMessages, sendCoachMessage } from "@/lib/supabase-coach"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MyCoachProps {
  userId: string
}

export default function MyCoach({ userId }: MyCoachProps) {
  const [activeTab, setActiveTab] = useState("messages")
  const [coach, setCoach] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  // Cargar datos del entrenador al montar el componente
  useEffect(() => {
    async function loadCoachData() {
      try {
        setIsLoading(true)
        const { data, error } = await getClientCoach(userId)
        
        if (error) throw error
        
        if (data) {
          setCoach(data)
          loadMessages()
        }
      } catch (error) {
        console.error("Error al cargar datos del entrenador:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del entrenador",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadCoachData()
  }, [userId])

  // Cargar mensajes
  async function loadMessages() {
    try {
      const { data, error } = await getCoachMessages(userId)
      
      if (error) throw error
      
      if (data) {
        setMessages(data)
      }
    } catch (error) {
      console.error("Error al cargar mensajes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive",
      })
    }
  }

  // Enviar mensaje al entrenador
  async function handleSendMessage() {
    if (!message.trim() || !coach) return
    
    try {
      setIsSending(true)
      const { error } = await sendCoachMessage({
        coach_id: coach.id,
        client_id: userId,
        message,
        type: "text"
      })
      
      if (error) throw error
      
      // Actualizar mensajes
      await loadMessages()
      
      setMessage("")
      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado al entrenador",
      })
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Renderizar mensajes
  function renderMessages() {
    if (messages.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No hay mensajes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Envía un mensaje a tu entrenador para comenzar una conversación
            </p>
          </div>
        </div>
      )
    }

    return (
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.client_id === userId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.client_id === userId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mi Entrenador</h1>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : coach ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={coach.avatar_url} />
                  <AvatarFallback>{coach.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{coach.full_name}</CardTitle>
                  <CardDescription>{coach.specialty || "Entrenador personal"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="messages" className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Mensajes
                  </TabsTrigger>
                  <TabsTrigger value="plans" className="flex items-center">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Planes
                  </TabsTrigger>
                  <TabsTrigger value="sessions" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Sesiones
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="messages" className="space-y-4">
                  {renderMessages()}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} disabled={isSending || !message.trim()}>
                      {isSending ? (
                        <Skeleton className="h-4 w-4 rounded-full animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="plans" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Plan actual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div>
                            <p className="font-medium">Plan de hipertrofia - Fase 1</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>4 semanas · 3 días/semana</span>
                            </div>
                          </div>
                          <Badge>En progreso</Badge>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Progreso</p>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: "35%" }} />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Semana 2 de 4</span>
                            <span>35% completado</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Próximos entrenamientos</p>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 border rounded-md">
                              <div className="flex items-center">
                                <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3">
                                  <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium">Entrenamiento de piernas</p>
                                  <p className="text-xs text-muted-foreground">Mañana</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">Ver</Button>
                            </div>
                            <div className="flex justify-between items-center p-2 border rounded-md">
                              <div className="flex items-center">
                                <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3">
                                  <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium">Entrenamiento de pecho</p>
                                  <p className="text-xs text-muted-foreground">Jueves</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">Ver</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Próximas sesiones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 border rounded-md">
                          <div className="flex items-center">
                            <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">Sesión de evaluación</p>
                              <p className="text-xs text-muted-foreground">Viernes, 15:00</p>
                            </div>
                          </div>
                          <Badge variant="outline">Confirmada</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-md">
                          <div className="flex items-center">
                            <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">Entrenamiento guiado</p>
                              <p className="text-xs text-muted-foreground">Lunes próximo, 18:00</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                            <Button size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirmar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Historial de sesiones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 border rounded-md">
                          <div className="flex items-center">
                            <div className="bg-muted text-muted-foreground rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">Evaluación inicial</p>
                              <p className="text-xs text-muted-foreground">Hace 2 semanas</p>
                            </div>
                          </div>
                          <Badge variant="outline">Completada</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No tienes un entrenador asignado</CardTitle>
            <CardDescription>
              Contrata un entrenador para recibir planes personalizados y seguimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Buscar entrenador</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
