"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart2, 
  Settings, 
  Search,
  PlusCircle,
  Bell,
  Filter,
  ChevronRight
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { 
  getCoachClients, 
  getClientWorkouts, 
  getClientProfile,
  sendClientMessage
} from "@/lib/supabase-coach"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CoachDashboardProps {
  coachId: string
}

export default function CoachDashboard({ coachId }: CoachDashboardProps) {
  const [activeTab, setActiveTab] = useState("clients")
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientWorkouts, setClientWorkouts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [message, setMessage] = useState("")

  // Cargar clientes al montar el componente
  useEffect(() => {
    async function loadClients() {
      try {
        setIsLoading(true)
        const { data, error } = await getCoachClients(coachId)
        
        if (error) throw error
        
        if (data) {
          setClients(data)
          // Seleccionar el primer cliente por defecto si existe
          if (data.length > 0) {
            setSelectedClient(data[0])
            loadClientWorkouts(data[0].id)
          }
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadClients()
  }, [coachId])

  // Cargar entrenamientos del cliente seleccionado
  async function loadClientWorkouts(clientId) {
    try {
      const { data, error } = await getClientWorkouts(clientId)
      
      if (error) throw error
      
      if (data) {
        setClientWorkouts(data)
      }
    } catch (error) {
      console.error("Error al cargar entrenamientos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los entrenamientos del cliente",
        variant: "destructive",
      })
    }
  }

  // Seleccionar un cliente
  function handleSelectClient(client) {
    setSelectedClient(client)
    loadClientWorkouts(client.id)
  }

  // Enviar mensaje a un cliente
  async function handleSendMessage() {
    if (!message.trim() || !selectedClient) return
    
    try {
      const { error } = await sendClientMessage({
        coach_id: coachId,
        client_id: selectedClient.id,
        message,
        type: "text"
      })
      
      if (error) throw error
      
      toast({
        title: "Mensaje enviado",
        description: "El mensaje ha sido enviado al cliente",
      })
      
      setMessage("")
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      })
    }
  }

  // Filtrar clientes por búsqueda
  const filteredClients = clients.filter(client => 
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Panel de Entrenador</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Cliente
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="clients" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Agenda
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Mensajes
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Ajustes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lista de clientes */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Mis Clientes</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar clientes..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center space-x-4 p-2">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-3 w-[100px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredClients.length > 0 ? (
                    <div className="space-y-2">
                      {filteredClients.map((client) => (
                        <div
                          key={client.id}
                          className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer ${
                            selectedClient?.id === client.id ? "bg-primary/10" : "hover:bg-muted"
                          }`}
                          onClick={() => handleSelectClient(client)}
                        >
                          <Avatar>
                            <AvatarImage src={client.avatar_url} />
                            <AvatarFallback>{client.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{client.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {client.last_active ? `Activo: ${client.last_active}` : "Nuevo cliente"}
                            </p>
                          </div>
                          {client.has_updates && (
                            <Badge variant="secondary" className="ml-auto">Nuevo</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No se encontraron clientes</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Detalles del cliente */}
            <Card className="md:col-span-2">
              {selectedClient ? (
                <>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{selectedClient.full_name}</CardTitle>
                        <CardDescription>
                          Cliente desde {new Date(selectedClient.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Mensaje
                        </Button>
                        <Button size="sm">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Asignar Plan
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid grid-cols-4 mb-4">
                        <TabsTrigger value="overview">Resumen</TabsTrigger>
                        <TabsTrigger value="workouts">Entrenamientos</TabsTrigger>
                        <TabsTrigger value="progress">Progreso</TabsTrigger>
                        <TabsTrigger value="plans">Planes</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Último entrenamiento</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {clientWorkouts.length > 0 ? (
                                <div>
                                  <p className="font-medium">{clientWorkouts[0].name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(clientWorkouts[0].date).toLocaleDateString()}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">Sin entrenamientos</p>
                              )}
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Adherencia</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center">
                                <div className="font-medium text-lg">85%</div>
                                <Badge className="ml-2" variant="outline">Buena</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Últimas 4 semanas
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Notas</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">
                              {selectedClient.notes || "Sin notas. Haz clic para añadir."}
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Próximos entrenamientos</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                                <div>
                                  <p className="font-medium">Entrenamiento de piernas</p>
                                  <p className="text-xs text-muted-foreground">Mañana, 18:00</p>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                                <div>
                                  <p className="font-medium">Entrenamiento de pecho</p>
                                  <p className="text-xs text-muted-foreground">Jueves, 19:00</p>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="workouts">
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg">Historial de entrenamientos</CardTitle>
                              <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filtrar
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {clientWorkouts.length > 0 ? (
                              <div className="space-y-2">
                                {clientWorkouts.map((workout) => (
                                  <div key={workout.id} className="flex justify-between items-center p-3 border rounded-md">
                                    <div>
                                      <p className="font-medium">{workout.name}</p>
                                      <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {new Date(workout.date).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <Badge variant="outline">{workout.type}</Badge>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {workout.sets} series · {workout.duration}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <p className="text-muted-foreground">No hay entrenamientos registrados</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="progress">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Progreso del cliente</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[300px] flex items-center justify-center bg-muted rounded-md">
                              <p className="text-muted-foreground">Gráficos de progreso (en desarrollo)</p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="plans">
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg">Planes de entrenamiento</CardTitle>
                              <Button size="sm">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Nuevo Plan
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">No hay planes asignados</p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </>
              ) : (
                <div className="flex items-center justify-center h-[600px]">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Selecciona un cliente</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Selecciona un cliente para ver sus detalles
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Agenda de Sesiones</CardTitle>
              <CardDescription>
                Gestiona tus sesiones y citas con clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] flex items-center justify-center bg-muted rounded-md">
                <p className="text-muted-foreground">Calendario de sesiones (en desarrollo)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Mensajes</CardTitle>
              <CardDescription>
                Comunícate con tus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[500px]">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Conversaciones</h3>
                  <div className="space-y-2">
                    {clients.slice(0, 5).map((client) => (
                      <div key={client.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={client.avatar_url} />
                          <AvatarFallback>{client.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{client.full_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2 border rounded-md flex flex-col">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">
                      {selectedClient ? selectedClient.full_name : "Selecciona un cliente"}
                    </h3>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">Selecciona un cliente para ver los mensajes</p>
                    </div>
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Escribe un mensaje..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={!selectedClient}
                      />
                      <Button onClick={handleSendMessage} disabled={!selectedClient || !message.trim()}>
                        Enviar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Clientes</CardTitle>
              <CardDescription>
                Estadísticas y métricas de tus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Adherencia promedio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="font-medium text-2xl">78%</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Basado en todos los clientes
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Clientes activos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="font-medium text-2xl">{clients.length}</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total de clientes
                    </p>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Progreso de clientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center bg-muted rounded-md">
                      <p className="text-muted-foreground">Gráficos de progreso (en desarrollo)</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>
                Gestiona tu perfil y preferencias como entrenador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Perfil de entrenador</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>EN</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Entrenador</p>
                        <p className="text-sm text-muted-foreground">entrenador@ejemplo.com</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Editar perfil
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Personalización</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications">Notificaciones</Label>
                      <Switch id="notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emails">Emails de resumen</Label>
                      <Switch id="emails" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
