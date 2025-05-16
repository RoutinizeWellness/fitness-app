"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  UserPlus, 
  Search, 
  Dumbbell, 
  MessageSquare, 
  Calendar, 
  Clock, 
  ChevronRight 
} from "lucide-react"
import { TrainerModificationPanel } from "@/components/training/trainer-modification-panel"
import { getTrainerClients } from "@/lib/trainer-service"
import { getWorkoutRoutines } from "@/lib/supabase-training"
import { supabase } from "@/lib/supabase-client"
import { toast } from "@/components/ui/use-toast"

export default function TrainerPage() {
  const router = useRouter()
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const [clientRoutines, setClientRoutines] = useState<any[]>([])
  const [selectedRoutine, setSelectedRoutine] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  
  // Cargar usuario actual
  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setCurrentUser(user)
      } else {
        // Redirigir al login si no hay usuario
        router.push("/login")
      }
    }
    
    loadCurrentUser()
  }, [router])
  
  // Cargar clientes del entrenador
  useEffect(() => {
    const loadClients = async () => {
      if (!currentUser) return
      
      setIsLoading(true)
      
      try {
        const { data, error } = await getTrainerClients(currentUser.id)
        
        if (error) {
          throw error
        }
        
        if (data) {
          setClients(data)
          
          // Seleccionar el primer cliente por defecto
          if (data.length > 0 && !selectedClient) {
            setSelectedClient(data[0])
          }
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (currentUser) {
      loadClients()
    }
  }, [currentUser, selectedClient])
  
  // Cargar rutinas del cliente seleccionado
  useEffect(() => {
    const loadClientRoutines = async () => {
      if (!selectedClient) return
      
      try {
        const { data, error } = await getWorkoutRoutines(selectedClient.userId)
        
        if (error) {
          throw error
        }
        
        if (data) {
          setClientRoutines(data)
          
          // Seleccionar la primera rutina por defecto
          if (data.length > 0 && !selectedRoutine) {
            setSelectedRoutine(data[0])
          }
        }
      } catch (error) {
        console.error("Error al cargar rutinas del cliente:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las rutinas del cliente",
          variant: "destructive"
        })
      }
    }
    
    if (selectedClient) {
      loadClientRoutines()
    }
  }, [selectedClient, selectedRoutine])
  
  // Filtrar clientes por búsqueda
  const filteredClients = clients.filter(client => {
    const fullName = `${client.user?.first_name || ''} ${client.user?.last_name || ''}`.toLowerCase()
    const email = client.user?.email?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    
    return fullName.includes(query) || email.includes(query)
  })
  
  // Manejar selección de cliente
  const handleSelectClient = (client: any) => {
    setSelectedClient(client)
    setSelectedRoutine(null)
  }
  
  // Manejar selección de rutina
  const handleSelectRoutine = (routine: any) => {
    setSelectedRoutine(routine)
  }
  
  // Manejar actualización de rutina
  const handleRoutineUpdated = async () => {
    if (!selectedClient) return
    
    try {
      const { data, error } = await getWorkoutRoutines(selectedClient.userId)
      
      if (error) {
        throw error
      }
      
      if (data) {
        setClientRoutines(data)
        
        // Actualizar la rutina seleccionada
        if (selectedRoutine) {
          const updatedRoutine = data.find(r => r.id === selectedRoutine.id)
          if (updatedRoutine) {
            setSelectedRoutine(updatedRoutine)
          }
        }
      }
    } catch (error) {
      console.error("Error al actualizar rutinas:", error)
    }
  }
  
  // Renderizar estado de carga
  if (isLoading && !currentUser) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Entrenador</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de clientes */}
        <div className="md:col-span-1">
          <Card3D>
            <Card3DHeader>
              <div className="flex justify-between items-center">
                <Card3DTitle>Mis Clientes</Card3DTitle>
                <Button3D size="sm" variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Añadir
                </Button3D>
              </div>
            </Card3DHeader>
            <Card3DContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar cliente..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredClients.length > 0 ? (
                    filteredClients.map(client => (
                      <div
                        key={client.userId}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedClient?.userId === client.userId
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleSelectClient(client)}
                      >
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={client.user?.avatar_url} />
                            <AvatarFallback>
                              {client.user?.first_name?.[0] || client.user?.email?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h3 className="font-medium">
                              {client.user?.first_name} {client.user?.last_name}
                            </h3>
                            <p className="text-sm text-gray-500">{client.user?.email}</p>
                          </div>
                          
                          <Badge variant={client.status === 'active' ? 'default' : 'outline'}>
                            {client.status === 'active' ? 'Activo' : 'Pendiente'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {searchQuery ? 'No se encontraron clientes' : 'No tienes clientes aún'}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card3DContent>
          </Card3D>
        </div>
        
        {/* Contenido principal */}
        <div className="md:col-span-2">
          {selectedClient ? (
            <Tabs defaultValue="routines">
              <TabsList className="mb-4">
                <TabsTrigger value="routines">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Rutinas
                </TabsTrigger>
                <TabsTrigger value="messages">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mensajes
                </TabsTrigger>
                <TabsTrigger value="schedule">
                  <Calendar className="h-4 w-4 mr-2" />
                  Horario
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="routines">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {clientRoutines.map(routine => (
                    <Card3D
                      key={routine.id}
                      className={`cursor-pointer transition-all ${
                        selectedRoutine?.id === routine.id
                          ? 'ring-2 ring-primary'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleSelectRoutine(routine)}
                    >
                      <Card3DContent className="p-4">
                        <h3 className="font-medium mb-1">{routine.name}</h3>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {routine.description || 'Sin descripción'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{routine.days.length} días</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {routine.days.reduce((acc, day) => acc + (day.estimatedDuration || 0), 0)} min
                            </span>
                          </div>
                        </div>
                      </Card3DContent>
                    </Card3D>
                  ))}
                  
                  {clientRoutines.length === 0 && (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                      Este cliente no tiene rutinas asignadas
                    </div>
                  )}
                </div>
                
                {selectedRoutine && (
                  <TrainerModificationPanel
                    trainerId={currentUser.id}
                    userId={selectedClient.userId}
                    routine={selectedRoutine}
                    onRoutineUpdated={handleRoutineUpdated}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="messages">
                <Card3D>
                  <Card3DHeader>
                    <Card3DTitle>Mensajes</Card3DTitle>
                  </Card3DHeader>
                  <Card3DContent>
                    <p className="text-center py-8 text-gray-500">
                      Próximamente: Sistema de mensajería entre entrenador y cliente
                    </p>
                  </Card3DContent>
                </Card3D>
              </TabsContent>
              
              <TabsContent value="schedule">
                <Card3D>
                  <Card3DHeader>
                    <Card3DTitle>Horario</Card3DTitle>
                  </Card3DHeader>
                  <Card3DContent>
                    <p className="text-center py-8 text-gray-500">
                      Próximamente: Calendario de entrenamientos y citas
                    </p>
                  </Card3DContent>
                </Card3D>
              </TabsContent>
            </Tabs>
          ) : (
            <Card3D>
              <Card3DContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecciona un cliente</h3>
                <p className="text-gray-500">
                  Selecciona un cliente de la lista para ver sus rutinas y enviar feedback
                </p>
              </Card3DContent>
            </Card3D>
          )}
        </div>
      </div>
    </div>
  )
}
