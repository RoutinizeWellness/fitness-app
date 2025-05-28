"use client"

import { useState, useEffect } from "react"
import {
  Users, UserPlus, Search, Filter, ChevronRight,
  Dumbbell, Utensils, MessageSquare, Eye, Edit,
  Trash, MoreHorizontal, RefreshCw, CheckCircle,
  XCircle, Calendar, Clock, Activity
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { supabase } from "@/lib/supabase-client"

// Tipo para cliente con detalles
interface ClientWithDetails {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  lastActive?: string;
  trainers: {
    id: string;
    name: string;
    relationshipStatus: string;
  }[];
  nutritionists: {
    id: string;
    name: string;
    relationshipStatus: string;
  }[];
  workoutCount: number;
  mealPlanCount: number;
  assessmentCount: number;
}

export function AdminClientManagement() {
  const { user } = useAuth()
  const [clients, setClients] = useState<ClientWithDetails[]>([])
  const [filteredClients, setFilteredClients] = useState<ClientWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<'all' | 'with_trainer' | 'with_nutritionist' | 'no_professional'>('all')
  const [selectedClient, setSelectedClient] = useState<ClientWithDetails | null>(null)
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalClients, setTotalClients] = useState(0)
  const [showAssignTrainerDialog, setShowAssignTrainerDialog] = useState(false)
  const [showAssignNutritionistDialog, setShowAssignNutritionistDialog] = useState(false)
  const [showSendMessageDialog, setShowSendMessageDialog] = useState(false)
  const [clientToModify, setClientToModify] = useState<ClientWithDetails | null>(null)
  const [availableTrainers, setAvailableTrainers] = useState<{id: string, name: string}[]>([])
  const [availableNutritionists, setAvailableNutritionists] = useState<{id: string, name: string}[]>([])
  const [messageText, setMessageText] = useState("")
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("")
  const itemsPerPage = 10

  // Cargar clientes
  useEffect(() => {
    loadClients()
    loadAvailableProfessionals()
  }, [])

  // Aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters()
  }, [clients, searchTerm, filterType])

  const loadClients = async () => {
    setIsLoading(true)
    try {
      // Obtener usuarios que no son administradores, entrenadores ni nutricionistas
      const { data: clientProfiles, error: clientsError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          avatar_url,
          created_at,
          auth_users:auth.users(email, last_sign_in_at)
        `)
        .eq('is_admin', false)
        .not('user_id', 'in', (subquery) => {
          return subquery.from('trainer_profiles').select('user_id');
        })
        .not('user_id', 'in', (subquery) => {
          return subquery.from('nutritionist_profiles').select('user_id');
        })
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      // Obtener relaciones cliente-profesional para cada cliente
      const clientsWithDetails: ClientWithDetails[] = await Promise.all(
        (clientProfiles || []).map(async (profile) => {
          // Obtener relaciones con entrenadores
          const { data: trainerRelationships, error: trainerError } = await supabase
            .from('client_relationships')
            .select(`
              id,
              professional_id,
              status,
              professionals:profiles!client_relationships_professional_id_fkey(full_name)
            `)
            .eq('client_id', profile.user_id)
            .eq('professional_type', 'trainer');

          if (trainerError) console.error("Error al obtener relaciones con entrenadores:", trainerError);

          // Obtener relaciones con nutricionistas
          const { data: nutritionistRelationships, error: nutritionistError } = await supabase
            .from('client_relationships')
            .select(`
              id,
              professional_id,
              status,
              professionals:profiles!client_relationships_professional_id_fkey(full_name)
            `)
            .eq('client_id', profile.user_id)
            .eq('professional_type', 'nutritionist');

          if (nutritionistError) console.error("Error al obtener relaciones con nutricionistas:", nutritionistError);

          // Obtener conteo de entrenamientos
          const { count: workoutCount, error: workoutError } = await supabase
            .from('workouts')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', profile.user_id);

          if (workoutError) console.error("Error al obtener conteo de entrenamientos:", workoutError);

          // Obtener conteo de planes de comida
          const { count: mealPlanCount, error: mealPlanError } = await supabase
            .from('meal_plans')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', profile.user_id);

          if (mealPlanError) console.error("Error al obtener conteo de planes de comida:", mealPlanError);

          // Obtener conteo de evaluaciones
          const { count: assessmentCount, error: assessmentError } = await supabase
            .from('client_assessments')
            .select('id', { count: 'exact', head: true })
            .eq('client_id', profile.user_id);

          if (assessmentError) console.error("Error al obtener conteo de evaluaciones:", assessmentError);

          return {
            id: profile.user_id,
            userId: profile.user_id,
            fullName: profile.full_name || 'Usuario sin nombre',
            email: profile.auth_users?.email || '',
            avatarUrl: profile.avatar_url,
            createdAt: profile.created_at,
            lastActive: profile.auth_users?.last_sign_in_at,
            trainers: (trainerRelationships || []).map(rel => ({
              id: rel.professional_id,
              name: rel.professionals?.full_name || 'Entrenador desconocido',
              relationshipStatus: rel.status
            })),
            nutritionists: (nutritionistRelationships || []).map(rel => ({
              id: rel.professional_id,
              name: rel.professionals?.full_name || 'Nutricionista desconocido',
              relationshipStatus: rel.status
            })),
            workoutCount: workoutCount || 0,
            mealPlanCount: mealPlanCount || 0,
            assessmentCount: assessmentCount || 0
          };
        })
      );

      setClients(clientsWithDetails);
      setTotalClients(clientsWithDetails.length);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar filtros a los clientes
  const applyFilters = () => {
    let filtered = [...clients];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo de profesional
    if (filterType === 'with_trainer') {
      filtered = filtered.filter(client => client.trainers.length > 0);
    } else if (filterType === 'with_nutritionist') {
      filtered = filtered.filter(client => client.nutritionists.length > 0);
    } else if (filterType === 'no_professional') {
      filtered = filtered.filter(client =>
        client.trainers.length === 0 && client.nutritionists.length === 0
      );
    }

    setFilteredClients(filtered);
  };

  // Refrescar lista de clientes
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadClients();
    setIsRefreshing(false);

    toast({
      title: "Clientes actualizados",
      description: "La lista de clientes se ha actualizado correctamente",
    });
  };

  // Cargar entrenadores y nutricionistas disponibles
  const loadAvailableProfessionals = async () => {
    try {
      // Cargar entrenadores
      const { data: trainers, error: trainersError } = await supabase
        .from('trainer_profiles')
        .select(`
          user_id,
          profiles:user_id(full_name)
        `)
        .eq('is_verified', true);

      if (trainersError) throw trainersError;

      // Cargar nutricionistas
      const { data: nutritionists, error: nutritionistsError } = await supabase
        .from('nutritionist_profiles')
        .select(`
          user_id,
          profiles:user_id(full_name)
        `)
        .eq('is_verified', true);

      if (nutritionistsError) throw nutritionistsError;

      // Formatear datos
      setAvailableTrainers(
        trainers.map(trainer => ({
          id: trainer.user_id,
          name: trainer.profiles?.full_name || 'Entrenador sin nombre'
        }))
      );

      setAvailableNutritionists(
        nutritionists.map(nutritionist => ({
          id: nutritionist.user_id,
          name: nutritionist.profiles?.full_name || 'Nutricionista sin nombre'
        }))
      );
    } catch (error) {
      console.error("Error al cargar profesionales:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los profesionales disponibles",
        variant: "destructive"
      });
    }
  };

  // Manejar asignación de entrenador
  const handleAssignTrainer = (client: ClientWithDetails) => {
    setClientToModify(client);
    setSelectedProfessionalId("");
    setShowAssignTrainerDialog(true);
  };

  // Manejar asignación de nutricionista
  const handleAssignNutritionist = (client: ClientWithDetails) => {
    setClientToModify(client);
    setSelectedProfessionalId("");
    setShowAssignNutritionistDialog(true);
  };

  // Manejar envío de mensaje
  const handleSendMessage = (client: ClientWithDetails) => {
    setClientToModify(client);
    setMessageText("");
    setShowSendMessageDialog(true);
  };

  // Confirmar asignación de entrenador
  const confirmAssignTrainer = async () => {
    if (!clientToModify || !selectedProfessionalId) return;

    try {
      // Crear relación cliente-entrenador
      const { error } = await supabase
        .from('client_relationships')
        .insert({
          client_id: clientToModify.userId,
          professional_id: selectedProfessionalId,
          professional_type: 'trainer',
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Entrenador asignado",
        description: "Se ha asignado el entrenador correctamente"
      });

      // Recargar clientes para actualizar la vista
      await loadClients();
      setShowAssignTrainerDialog(false);
    } catch (error) {
      console.error("Error al asignar entrenador:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar el entrenador",
        variant: "destructive"
      });
    }
  };

  // Confirmar asignación de nutricionista
  const confirmAssignNutritionist = async () => {
    if (!clientToModify || !selectedProfessionalId) return;

    try {
      // Crear relación cliente-nutricionista
      const { error } = await supabase
        .from('client_relationships')
        .insert({
          client_id: clientToModify.userId,
          professional_id: selectedProfessionalId,
          professional_type: 'nutritionist',
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Nutricionista asignado",
        description: "Se ha asignado el nutricionista correctamente"
      });

      // Recargar clientes para actualizar la vista
      await loadClients();
      setShowAssignNutritionistDialog(false);
    } catch (error) {
      console.error("Error al asignar nutricionista:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar el nutricionista",
        variant: "destructive"
      });
    }
  };

  // Confirmar envío de mensaje
  const confirmSendMessage = async () => {
    if (!clientToModify || !messageText.trim()) return;

    try {
      // Guardar mensaje en la base de datos
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          recipient_id: clientToModify.userId,
          content: messageText,
          is_read: false,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Mensaje enviado",
        description: "Se ha enviado el mensaje correctamente"
      });

      setShowSendMessageDialog(false);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive"
      });
    }
  };

  // Ver detalles del cliente
  const viewClientDetails = (client: ClientWithDetails) => {
    setSelectedClient(client);
    setShowClientDialog(true);
  };

  // Paginación
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Gestión de Clientes</h2>
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar clientes..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por profesional" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los clientes</SelectItem>
            <SelectItem value="with_trainer">Con entrenador</SelectItem>
            <SelectItem value="with_nutritionist">Con nutricionista</SelectItem>
            <SelectItem value="no_professional">Sin profesionales</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card3D>
        <Card3DHeader>
          <div className="flex items-center justify-between">
            <Card3DTitle>Clientes ({filteredClients.length})</Card3DTitle>
            <Badge variant="outline">
              {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredClients.length)} de {filteredClients.length}
            </Badge>
          </div>
        </Card3DHeader>
        <Card3DContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Cargando clientes...</p>
            </div>
          ) : paginatedClients.length > 0 ? (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4 pr-4">
                {paginatedClients.map((client) => (
                  <div key={client.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={client.avatarUrl || undefined} />
                          <AvatarFallback>{client.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{client.fullName}</h3>
                          <p className="text-sm text-gray-500">{client.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button3D
                          variant="outline"
                          size="sm"
                          onClick={() => viewClientDetails(client)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver detalles
                        </Button3D>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button3D variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button3D>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSendMessage(client)}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Enviar mensaje
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAssignTrainer(client)}>
                              <Dumbbell className="h-4 w-4 mr-2" />
                              Asignar entrenador
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAssignNutritionist(client)}>
                              <Utensils className="h-4 w-4 mr-2" />
                              Asignar nutricionista
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {client.trainers.length > 0 ? (
                        <Badge variant="outline" className="flex items-center">
                          <Dumbbell className="h-3 w-3 mr-1" />
                          {client.trainers.length} entrenador(es)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center text-gray-400">
                          <Dumbbell className="h-3 w-3 mr-1" />
                          Sin entrenador
                        </Badge>
                      )}

                      {client.nutritionists.length > 0 ? (
                        <Badge variant="outline" className="flex items-center">
                          <Utensils className="h-3 w-3 mr-1" />
                          {client.nutritionists.length} nutricionista(s)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center text-gray-400">
                          <Utensils className="h-3 w-3 mr-1" />
                          Sin nutricionista
                        </Badge>
                      )}

                      <Badge variant="outline" className="flex items-center">
                        <Activity className="h-3 w-3 mr-1" />
                        {client.workoutCount} entrenamientos
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron clientes</p>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <Button3D
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button3D>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Mostrar páginas alrededor de la página actual
                let pageToShow = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pageToShow = currentPage - 2 + i;
                  }
                  if (currentPage > totalPages - 2) {
                    pageToShow = totalPages - 4 + i;
                  }
                }

                return (
                  <Button3D
                    key={i}
                    variant={currentPage === pageToShow ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageToShow)}
                  >
                    {pageToShow}
                  </Button3D>
                );
              })}

              <Button3D
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button3D>
            </div>
          )}
        </Card3DContent>
      </Card3D>

      {/* Diálogo de detalles del cliente */}
      {showClientDialog && selectedClient && (
        <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Detalles del cliente</DialogTitle>
              <DialogDescription>
                Información detallada y actividad del cliente
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex items-center">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage src={selectedClient.avatarUrl || undefined} />
                  <AvatarFallback>{selectedClient.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{selectedClient.fullName}</h2>
                  <p className="text-gray-500">{selectedClient.email}</p>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Registrado: {new Date(selectedClient.createdAt).toLocaleDateString()}</span>
                    {selectedClient.lastActive && (
                      <>
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Último acceso: {new Date(selectedClient.lastActive).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card3D>
                  <Card3DHeader>
                    <Card3DTitle className="flex items-center">
                      <Dumbbell className="h-5 w-5 mr-2" />
                      Entrenadores
                    </Card3DTitle>
                  </Card3DHeader>
                  <Card3DContent>
                    {selectedClient.trainers.length > 0 ? (
                      <div className="space-y-2">
                        {selectedClient.trainers.map((trainer, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span>{trainer.name}</span>
                              <Badge variant={
                                trainer.relationshipStatus === 'active' ? 'default' :
                                trainer.relationshipStatus === 'pending' ? 'outline' : 'secondary'
                              }>
                                {trainer.relationshipStatus === 'active' ? 'Activo' :
                                 trainer.relationshipStatus === 'pending' ? 'Pendiente' : 'Inactivo'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No tiene entrenadores asignados</p>
                    )}
                  </Card3DContent>
                </Card3D>

                <Card3D>
                  <Card3DHeader>
                    <Card3DTitle className="flex items-center">
                      <Utensils className="h-5 w-5 mr-2" />
                      Nutricionistas
                    </Card3DTitle>
                  </Card3DHeader>
                  <Card3DContent>
                    {selectedClient.nutritionists.length > 0 ? (
                      <div className="space-y-2">
                        {selectedClient.nutritionists.map((nutritionist, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span>{nutritionist.name}</span>
                              <Badge variant={
                                nutritionist.relationshipStatus === 'active' ? 'default' :
                                nutritionist.relationshipStatus === 'pending' ? 'outline' : 'secondary'
                              }>
                                {nutritionist.relationshipStatus === 'active' ? 'Activo' :
                                 nutritionist.relationshipStatus === 'pending' ? 'Pendiente' : 'Inactivo'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No tiene nutricionistas asignados</p>
                    )}
                  </Card3DContent>
                </Card3D>

                <Card3D>
                  <Card3DHeader>
                    <Card3DTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Actividad
                    </Card3DTitle>
                  </Card3DHeader>
                  <Card3DContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Entrenamientos</span>
                        <Badge variant="outline">{selectedClient.workoutCount}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Planes de comida</span>
                        <Badge variant="outline">{selectedClient.mealPlanCount}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Evaluaciones</span>
                        <Badge variant="outline">{selectedClient.assessmentCount}</Badge>
                      </div>
                    </div>
                  </Card3DContent>
                </Card3D>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button3D
                  variant="outline"
                  className="flex items-center"
                  onClick={() => {
                    setShowClientDialog(false);
                    handleSendMessage(selectedClient);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar mensaje
                </Button3D>
              </div>
              <DialogClose asChild>
                <Button3D>Cerrar</Button3D>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo para asignar entrenador */}
      <Dialog open={showAssignTrainerDialog} onOpenChange={setShowAssignTrainerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar entrenador</DialogTitle>
            <DialogDescription>
              Selecciona un entrenador para asignar a {clientToModify?.fullName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Select value={selectedProfessionalId} onValueChange={setSelectedProfessionalId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar entrenador" />
              </SelectTrigger>
              <SelectContent>
                {availableTrainers.map(trainer => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {clientToModify?.trainers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Entrenadores actuales</h4>
                <div className="space-y-2">
                  {clientToModify.trainers.map((trainer, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span>{trainer.name}</span>
                        <Badge variant={
                          trainer.relationshipStatus === 'active' ? 'default' :
                          trainer.relationshipStatus === 'pending' ? 'outline' : 'secondary'
                        }>
                          {trainer.relationshipStatus === 'active' ? 'Activo' :
                           trainer.relationshipStatus === 'pending' ? 'Pendiente' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowAssignTrainerDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D
              onClick={confirmAssignTrainer}
              disabled={!selectedProfessionalId}
            >
              Asignar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para asignar nutricionista */}
      <Dialog open={showAssignNutritionistDialog} onOpenChange={setShowAssignNutritionistDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar nutricionista</DialogTitle>
            <DialogDescription>
              Selecciona un nutricionista para asignar a {clientToModify?.fullName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Select value={selectedProfessionalId} onValueChange={setSelectedProfessionalId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nutricionista" />
              </SelectTrigger>
              <SelectContent>
                {availableNutritionists.map(nutritionist => (
                  <SelectItem key={nutritionist.id} value={nutritionist.id}>
                    {nutritionist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {clientToModify?.nutritionists.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Nutricionistas actuales</h4>
                <div className="space-y-2">
                  {clientToModify.nutritionists.map((nutritionist, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span>{nutritionist.name}</span>
                        <Badge variant={
                          nutritionist.relationshipStatus === 'active' ? 'default' :
                          nutritionist.relationshipStatus === 'pending' ? 'outline' : 'secondary'
                        }>
                          {nutritionist.relationshipStatus === 'active' ? 'Activo' :
                           nutritionist.relationshipStatus === 'pending' ? 'Pendiente' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowAssignNutritionistDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D
              onClick={confirmAssignNutritionist}
              disabled={!selectedProfessionalId}
            >
              Asignar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para enviar mensaje */}
      <Dialog open={showSendMessageDialog} onOpenChange={setShowSendMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar mensaje</DialogTitle>
            <DialogDescription>
              Envía un mensaje a {clientToModify?.fullName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Mensaje
              </label>
              <Textarea
                id="message"
                placeholder="Escribe tu mensaje aquí..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowSendMessageDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D
              onClick={confirmSendMessage}
              disabled={!messageText.trim()}
            >
              Enviar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
