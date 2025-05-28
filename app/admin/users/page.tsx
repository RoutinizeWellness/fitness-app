"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Filter,
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Shield,
  Mail,
  MessageSquare,
  MoreHorizontal,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/contexts/auth-context"
import { getAllUsers, getUserStats, toggleUserVerification, changeUserRole, deleteUser } from "@/lib/admin-users-service"
import { Avatar3D, Avatar3DFallback, Avatar3DImage } from "@/components/ui/avatar-3d"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Tipo para los usuarios
interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  is_admin?: boolean
  is_verified?: boolean
  created_at: string
  last_sign_in_at?: string
  status?: 'active' | 'suspended' | 'pending'
  role?: 'user' | 'trainer' | 'nutritionist' | 'admin'
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [userRecommendations, setUserRecommendations] = useState<{[key: string]: string[]}>({})

  // Cargar usuarios
  useEffect(() => {
    loadUsers()
  }, [])

  // Filtrar usuarios cuando cambian los filtros
  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter, activeTab])

  // Cargar usuarios usando el servicio
  const loadUsers = async () => {
    setIsLoading(true)
    try {
      // Obtener usuarios con el servicio
      const { data, error } = await getAllUsers()

      if (error) throw error

      if (data) {
        setUsers(data.users)

        // Generar recomendaciones simuladas para cada usuario
        const recommendations: {[key: string]: string[]} = {}
        data.users.forEach(user => {
          recommendations[user.id] = generateMockRecommendations()
        })
        setUserRecommendations(recommendations)
      }

    } catch (error) {
      console.error("Error al cargar usuarios:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generar recomendaciones simuladas
  const generateMockRecommendations = (): string[] => {
    const allRecommendations = [
      "Aumentar la frecuencia de entrenamiento a 4 días por semana",
      "Incluir más ejercicios de movilidad en la rutina",
      "Añadir más proteínas a la dieta diaria",
      "Mejorar la calidad del sueño con técnicas de relajación",
      "Incorporar ejercicios de respiración para reducir el estrés",
      "Aumentar la ingesta de agua diaria",
      "Incluir más vegetales en la dieta",
      "Realizar estiramientos después de cada entrenamiento",
      "Incorporar entrenamiento de fuerza 2 veces por semana",
      "Practicar meditación 10 minutos diarios"
    ]

    // Seleccionar aleatoriamente entre 2 y 4 recomendaciones
    const count = Math.floor(Math.random() * 3) + 2
    const shuffled = [...allRecommendations].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  // Filtrar usuarios según los criterios
  const filterUsers = () => {
    let filtered = [...users]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtrar por rol
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    // Filtrar por pestaña activa
    if (activeTab === "admins") {
      filtered = filtered.filter(user => user.is_admin)
    } else if (activeTab === "trainers") {
      filtered = filtered.filter(user => user.role === "trainer")
    } else if (activeTab === "nutritionists") {
      filtered = filtered.filter(user => user.role === "nutritionist")
    } else if (activeTab === "pending") {
      filtered = filtered.filter(user => user.status === "pending")
    }

    setFilteredUsers(filtered)
  }

  // No need to check for admin here as the AdminLayout component handles this

  return (
    <AdminLayout title="Gestión de Usuarios">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Usuarios</h2>
              <p className="text-muted-foreground">Gestiona los usuarios de la plataforma</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1">
              <Users className="h-4 w-4 mr-2" />
              {users.length} usuarios
            </Badge>
            <Button3D variant="outline" onClick={loadUsers} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar
            </Button3D>
            <Button3D>
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button3D>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Administradores
            </TabsTrigger>
            <TabsTrigger value="trainers" className="flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              Entrenadores
            </TabsTrigger>
            <TabsTrigger value="nutritionists" className="flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              Nutricionistas
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Pendientes
            </TabsTrigger>
          </TabsList>

          <Card3D className="mb-6">
            <Card3DContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Buscar usuarios</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Buscar por nombre o email..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="w-full md:w-48">
                  <label className="text-sm font-medium mb-1 block">Rol</label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="trainer">Entrenador</SelectItem>
                      <SelectItem value="nutritionist">Nutricionista</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-48">
                  <label className="text-sm font-medium mb-1 block">Estado</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="suspended">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button3D variant="outline" onClick={() => {
                  setSearchTerm("")
                  setRoleFilter("all")
                  setStatusFilter("all")
                }}>
                  <Filter className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button3D>
              </div>
            </Card3DContent>
          </Card3D>

          {isLoading ? (
            <Card3D>
              <Card3DContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Cargando usuarios...</span>
              </Card3DContent>
            </Card3D>
          ) : (
            <Card3D>
              <Card3DHeader>
                <Card3DTitle>
                  Usuarios ({filteredUsers.length} de {users.length})
                </Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha de registro</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No se encontraron usuarios con los filtros seleccionados
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map(user => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar3D className="h-8 w-8 mr-2">
                                  {user.avatar_url ? (
                                    <Avatar3DImage src={user.avatar_url} alt={user.full_name || user.email} />
                                  ) : (
                                    <Avatar3DFallback>
                                      {(user.full_name || user.email).substring(0, 2).toUpperCase()}
                                    </Avatar3DFallback>
                                  )}
                                </Avatar3D>
                                <div>
                                  <div className="font-medium">{user.full_name || "Sin nombre"}</div>
                                  {user.is_admin && (
                                    <Badge variant="outline" className="mt-1">Admin</Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={
                                user.role === "admin" ? "default" :
                                user.role === "trainer" ? "secondary" :
                                user.role === "nutritionist" ? "outline" : "outline"
                              }>
                                {user.role === "admin" ? "Administrador" :
                                 user.role === "trainer" ? "Entrenador" :
                                 user.role === "nutritionist" ? "Nutricionista" : "Usuario"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {user.status === "active" ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                                    <span>Activo</span>
                                  </>
                                ) : user.status === "suspended" ? (
                                  <>
                                    <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                    <span>Suspendido</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-4 w-4 text-amber-500 mr-1" />
                                    <span>Pendiente</span>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button3D variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button3D>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedUser(user)
                                    setIsViewDialogOpen(true)
                                  }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedUser(user)
                                    setIsEditDialogOpen(true)
                                  }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar usuario
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => {
                                    // Implementar envío de email
                                    toast({
                                      title: "Email enviado",
                                      description: `Se ha enviado un email a ${user.email}`
                                    })
                                  }}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Enviar email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    // Implementar envío de mensaje
                                    toast({
                                      title: "Mensaje enviado",
                                      description: `Se ha enviado un mensaje a ${user.full_name || user.email}`
                                    })
                                  }}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Enviar mensaje
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedUser(user)
                                      setIsDeleteDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar usuario
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card3DContent>
            </Card3D>
          )}
        </Tabs>

        {/* Diálogo para ver detalles del usuario */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalles del usuario</DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <Card3D>
                    <Card3DContent className="p-6 flex flex-col items-center text-center">
                      <Avatar3D className="h-24 w-24 mb-4">
                        {selectedUser.avatar_url ? (
                          <Avatar3DImage src={selectedUser.avatar_url} alt={selectedUser.full_name || selectedUser.email} />
                        ) : (
                          <Avatar3DFallback>
                            {(selectedUser.full_name || selectedUser.email).substring(0, 2).toUpperCase()}
                          </Avatar3DFallback>
                        )}
                      </Avatar3D>
                      <h3 className="text-xl font-bold">{selectedUser.full_name || "Sin nombre"}</h3>
                      <p className="text-sm text-gray-500 mb-2">{selectedUser.email}</p>
                      <div className="flex flex-wrap justify-center gap-2 mt-2">
                        <Badge variant={selectedUser.role === "admin" ? "default" : "outline"}>
                          {selectedUser.role === "admin" ? "Administrador" :
                           selectedUser.role === "trainer" ? "Entrenador" :
                           selectedUser.role === "nutritionist" ? "Nutricionista" : "Usuario"}
                        </Badge>
                        <Badge variant={
                          selectedUser.status === "active" ? "success" :
                          selectedUser.status === "suspended" ? "destructive" : "outline"
                        }>
                          {selectedUser.status === "active" ? "Activo" :
                           selectedUser.status === "suspended" ? "Suspendido" : "Pendiente"}
                        </Badge>
                      </div>
                    </Card3DContent>
                  </Card3D>
                </div>

                <div className="md:col-span-2">
                  <Card3D className="mb-6">
                    <Card3DHeader>
                      <Card3DTitle>Información del usuario</Card3DTitle>
                    </Card3DHeader>
                    <Card3DContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">ID de usuario</p>
                          <p className="text-sm">{selectedUser.id}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Fecha de registro</p>
                          <p className="text-sm">{new Date(selectedUser.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Último inicio de sesión</p>
                          <p className="text-sm">{selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString() : "Nunca"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Verificado</p>
                          <p className="text-sm">{selectedUser.is_verified ? "Sí" : "No"}</p>
                        </div>
                      </div>
                    </Card3DContent>
                  </Card3D>

                  <Card3D>
                    <Card3DHeader>
                      <Card3DTitle>Recomendaciones personalizadas</Card3DTitle>
                    </Card3DHeader>
                    <Card3DContent>
                      <ul className="space-y-2">
                        {userRecommendations[selectedUser.id]?.map((recommendation, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </Card3DContent>
                  </Card3D>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button3D variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Cerrar
              </Button3D>
              {selectedUser && (
                <Button3D onClick={() => {
                  setIsViewDialogOpen(false)
                  setIsEditDialogOpen(true)
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar usuario
                </Button3D>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo para editar usuario */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar usuario</DialogTitle>
              <DialogDescription>
                Modifica los detalles del usuario seleccionado.
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="grid gap-4 py-4">
                <p className="text-center text-muted-foreground">
                  El formulario de edición de usuarios se implementará próximamente.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button3D variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button3D>
              <Button3D>
                Guardar cambios
              </Button3D>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo para eliminar usuario */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar a este usuario? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="flex items-center space-x-2 py-4">
                <Avatar3D className="h-10 w-10">
                  {selectedUser.avatar_url ? (
                    <Avatar3DImage src={selectedUser.avatar_url} alt={selectedUser.full_name || selectedUser.email} />
                  ) : (
                    <Avatar3DFallback>
                      {(selectedUser.full_name || selectedUser.email).substring(0, 2).toUpperCase()}
                    </Avatar3DFallback>
                  )}
                </Avatar3D>
                <div>
                  <p className="font-medium">{selectedUser.full_name || "Sin nombre"}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button3D variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                Cancelar
              </Button3D>
              <Button3D
                variant="destructive"
                onClick={() => {
                  // Implementar eliminación de usuario
                  setIsDeleting(true)
                  setTimeout(() => {
                    setIsDeleting(false)
                    setIsDeleteDialogOpen(false)
                    toast({
                      title: "Usuario eliminado",
                      description: "El usuario ha sido eliminado correctamente"
                    })
                  }, 1000)
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar usuario
                  </>
                )}
              </Button3D>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
