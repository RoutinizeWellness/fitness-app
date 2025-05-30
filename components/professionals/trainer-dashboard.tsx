"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Users, UserPlus, Calendar, MessageSquare, ClipboardList,
  BarChart2, DollarSign, Award, Settings, Plus, Search,
  ChevronRight, Filter, ArrowUpRight, ArrowDownRight
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { getTrainerProfile, getClientRelationships } from "@/lib/professional-service"
import { TrainerProfile, ClientRelationship, ClientWithProfessional } from "@/lib/types/professionals"
import { getUserProfile } from "@/lib/supabase-client"
import { isUserAdmin, setupAdminProfessionalProfiles } from "@/lib/admin-service"

export function TrainerDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<TrainerProfile | null>(null)
  const [clients, setClients] = useState<ClientWithProfessional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  // Cargar perfil y clientes
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para acceder al dashboard",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      setIsLoading(true)

      try {
        // Cargar perfil de entrenador
        const { data: trainerProfile, error: profileError } = await getTrainerProfile(user.id)

        if (profileError) {
          console.error("Error al cargar perfil de entrenador:", profileError)

          // Verificar si el usuario es administrador
          const { isAdmin } = await isUserAdmin(user.id)

          if (isAdmin) {
            // Si es admin, configurar automáticamente el perfil de entrenador
            const { success, trainerProfile: newProfile } = await setupAdminProfessionalProfiles(user.id)

            if (success && newProfile) {
              setProfile(newProfile)
            } else {
              toast({
                title: "Error",
                description: "No se pudo configurar tu perfil de entrenador automáticamente.",
                variant: "destructive",
              })
              router.push("/trainer-registration")
              return
            }
          } else {
            toast({
              title: "Error",
              description: "No se pudo cargar tu perfil de entrenador. ¿Ya te has registrado como entrenador?",
              variant: "destructive",
            })
            router.push("/trainer-registration")
            return
          }
        } else if (!trainerProfile) {
          // Verificar si el usuario es administrador
          const { isAdmin } = await isUserAdmin(user.id)

          if (isAdmin) {
            // Si es admin, configurar automáticamente el perfil de entrenador
            const { success, trainerProfile: newProfile } = await setupAdminProfessionalProfiles(user.id)

            if (success && newProfile) {
              setProfile(newProfile)
            } else {
              toast({
                title: "Perfil no encontrado",
                description: "No se encontró tu perfil de entrenador. Por favor, regístrate primero.",
                variant: "destructive",
              })
              router.push("/trainer-registration")
              return
            }
          } else {
            toast({
              title: "Perfil no encontrado",
              description: "No se encontró tu perfil de entrenador. Por favor, regístrate primero.",
              variant: "destructive",
            })
            router.push("/trainer-registration")
            return
          }
        } else {
          setProfile(trainerProfile)
        }

        // Cargar relaciones con clientes
        const { data: relationships, error: relationshipsError } = await getClientRelationships(user.id, 'professional')

        if (relationshipsError) {
          console.error("Error al cargar relaciones con clientes:", relationshipsError)
          toast({
            title: "Error",
            description: "No se pudieron cargar tus clientes",
            variant: "destructive",
          })
        }

        // Cargar información de cada cliente
        if (relationships && relationships.length > 0) {
          const clientsData: ClientWithProfessional[] = []

          for (const relationship of relationships) {
            try {
              const { data: clientProfile } = await getUserProfile(relationship.clientId)

              if (clientProfile) {
                clientsData.push({
                  clientId: relationship.clientId,
                  clientName: clientProfile.full_name || "Cliente sin nombre",
                  clientEmail: clientProfile.email,
                  clientAvatar: clientProfile.avatar_url,
                  relationshipId: relationship.id,
                  relationshipStatus: relationship.status,
                  startDate: relationship.startDate,
                  activeAssignments: 0, // Esto se cargaría de otra consulta
                })
              }
            } catch (error) {
              console.error("Error al cargar perfil de cliente:", error)
            }
          }

          setClients(clientsData)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los datos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, router])

  // Filtrar clientes por término de búsqueda
  const filteredClients = clients.filter(client =>
    client.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  // Renderizar mensaje si no hay perfil
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Perfil no encontrado</h2>
          <p className="text-gray-500 mb-6">No se encontró tu perfil de entrenador. Por favor, regístrate primero.</p>
          <Button3D onClick={() => router.push("/trainer-registration")}>
            Registrarse como entrenador
          </Button3D>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">Dashboard de Entrenador</h2>
        <Button3D variant="outline" onClick={() => router.push("/trainer-profile")}>
          <Settings className="h-4 w-4 mr-2" />
          Editar perfil
        </Button3D>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
          <TabsTrigger value="messages">Mensajes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card3D>
              <Card3DContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Clientes activos</p>
                    <h3 className="text-2xl font-bold mt-1">{clients.filter(c => c.relationshipStatus === 'active').length}</h3>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={(clients.filter(c => c.relationshipStatus === 'active').length / profile.maxClients) * 100} />
                  <p className="text-xs text-gray-500 mt-1">
                    {clients.filter(c => c.relationshipStatus === 'active').length} de {profile.maxClients} clientes máximos
                  </p>
                </div>
              </Card3DContent>
            </Card3D>

            <Card3D>
              <Card3DContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Solicitudes pendientes</p>
                    <h3 className="text-2xl font-bold mt-1">{clients.filter(c => c.relationshipStatus === 'pending').length}</h3>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <UserPlus className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  {clients.filter(c => c.relationshipStatus === 'pending').length > 0 ? (
                    <>
                      <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                      <span>Nuevas solicitudes por revisar</span>
                    </>
                  ) : (
                    <>
                      <span>No hay solicitudes pendientes</span>
                    </>
                  )}
                </div>
              </Card3DContent>
            </Card3D>

            <Card3D>
              <Card3DContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Asignaciones activas</p>
                    <h3 className="text-2xl font-bold mt-1">0</h3>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <span>0 rutinas asignadas a clientes</span>
                </div>
              </Card3DContent>
            </Card3D>

            <Card3D>
              <Card3DContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Mensajes sin leer</p>
                    <h3 className="text-2xl font-bold mt-1">0</h3>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-full">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <span>No hay mensajes sin leer</span>
                </div>
              </Card3DContent>
            </Card3D>
          </div>

          {/* Próximas sesiones */}
          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Próximas sesiones</Card3DTitle>
            </Card3DHeader>
            <Card3DContent className="p-6">
              {clients.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-500">No hay sesiones programadas</p>
                  <Button3D>
                    <Calendar className="h-4 w-4 mr-2" />
                    Programar nueva sesión
                  </Button3D>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">No tienes clientes activos</p>
                  <Button3D>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Añadir nuevo cliente
                  </Button3D>
                </div>
              )}
            </Card3DContent>
          </Card3D>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar clientes..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button3D>
              <UserPlus className="h-4 w-4 mr-2" />
              Añadir cliente
            </Button3D>
          </div>

          {filteredClients.length > 0 ? (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                {filteredClients.map((client) => (
                  <Card3D key={client.clientId} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={client.clientAvatar || undefined} />
                            <AvatarFallback>{client.clientName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{client.clientName}</h3>
                            <div className="flex items-center mt-1">
                              <Badge
                                variant={client.relationshipStatus === 'active' ? 'default' :
                                        client.relationshipStatus === 'pending' ? 'outline' : 'secondary'}
                                className="text-xs"
                              >
                                {client.relationshipStatus === 'active' ? 'Activo' :
                                 client.relationshipStatus === 'pending' ? 'Pendiente' :
                                 client.relationshipStatus === 'paused' ? 'Pausado' : 'Terminado'}
                              </Badge>
                              {client.startDate && (
                                <span className="text-xs text-gray-500 ml-2">
                                  Desde {new Date(client.startDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button3D size="sm">
                          Ver perfil
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button3D>
                      </div>
                    </div>
                  </Card3D>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No se encontraron clientes</p>
              {searchTerm ? (
                <p className="text-sm text-gray-400">Prueba con otros términos de búsqueda</p>
              ) : (
                <Button3D>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Añadir primer cliente
                </Button3D>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Asignaciones de entrenamiento</h3>
            <Button3D>
              <Plus className="h-4 w-4 mr-2" />
              Nueva asignación
            </Button3D>
          </div>

          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay asignaciones de entrenamiento</p>
            <p className="text-sm text-gray-400 mb-6">
              Crea rutinas personalizadas y asígnalas a tus clientes
            </p>
            <Button3D>
              <Plus className="h-4 w-4 mr-2" />
              Crear primera asignación
            </Button3D>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Mensajes</h3>
            <Button3D>
              <MessageSquare className="h-4 w-4 mr-2" />
              Nuevo mensaje
            </Button3D>
          </div>

          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay mensajes</p>
            <p className="text-sm text-gray-400 mb-6">
              Mantén comunicación con tus clientes para un mejor seguimiento
            </p>
            <Button3D>
              <MessageSquare className="h-4 w-4 mr-2" />
              Enviar primer mensaje
            </Button3D>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
