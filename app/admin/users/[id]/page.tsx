"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { useToast } from "@/components/ui/use-toast"
import { AIRecommendations } from "@/components/admin/ai-recommendations"
import { UserProgress } from "@/components/admin/user-progress"
import { 
  getUserById, 
  toggleUserVerification, 
  changeUserRole 
} from "@/lib/admin-users-service"
import { 
  generateUserRecommendations, 
  getUserProgress, 
  AIRecommendation 
} from "@/lib/admin-ai-recommendations"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Mail,
  Calendar,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Edit,
  Trash2,
  RefreshCw,
  MessageSquare,
  Dumbbell,
  Utensils,
  Brain,
  Moon,
  Activity,
  BarChart,
  FileText,
  Settings
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UserDetailsProps {
  params: {
    id: string
  }
}

export default function UserDetailsPage({ params }: UserDetailsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: "",
    role: "",
    is_verified: false
  })
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [userProgress, setUserProgress] = useState<any>(null)
  const [isLoadingProgress, setIsLoadingProgress] = useState(false)

  // Cargar datos del usuario
  useEffect(() => {
    loadUserData()
  }, [params.id])

  // Cargar datos del usuario
  const loadUserData = async () => {
    setIsLoading(true)
    try {
      // Obtener datos del usuario
      const { data: userData, error: userError } = await getUserById(params.id)

      if (userError) throw userError

      if (userData) {
        setUser(userData)
        setEditForm({
          full_name: userData.full_name || "",
          role: userData.role || "user",
          is_verified: userData.is_verified || false
        })
      }

      // Cargar recomendaciones y progreso
      loadRecommendations()
      loadUserProgress()
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del usuario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar recomendaciones de IA
  const loadRecommendations = async () => {
    setIsLoadingRecommendations(true)
    try {
      const { data, error } = await generateUserRecommendations(params.id)

      if (error) throw error

      if (data) {
        setRecommendations(data)
      }
    } catch (error) {
      console.error("Error al cargar recomendaciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las recomendaciones de IA",
        variant: "destructive",
      })
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  // Cargar progreso del usuario
  const loadUserProgress = async () => {
    setIsLoadingProgress(true)
    try {
      const { data, error } = await getUserProgress(params.id)

      if (error) throw error

      if (data) {
        setUserProgress(data)
      }
    } catch (error) {
      console.error("Error al cargar progreso del usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el progreso del usuario",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProgress(false)
    }
  }

  // Cambiar estado de verificación
  const handleToggleVerification = async () => {
    try {
      const { data, error } = await toggleUserVerification(params.id, !user.is_verified)

      if (error) throw error

      setUser({ ...user, is_verified: !user.is_verified })
      
      toast({
        title: user.is_verified ? "Usuario desverificado" : "Usuario verificado",
        description: `El usuario ha sido ${user.is_verified ? "desverificado" : "verificado"} correctamente`,
      })
    } catch (error) {
      console.error("Error al cambiar estado de verificación:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de verificación",
        variant: "destructive",
      })
    }
  }

  // Cambiar rol
  const handleChangeRole = async (newRole: string) => {
    try {
      const { data, error } = await changeUserRole(params.id, newRole)

      if (error) throw error

      setUser({ ...user, role: newRole, is_admin: newRole === "admin" })
      
      toast({
        title: "Rol actualizado",
        description: `El rol del usuario ha sido actualizado a ${newRole}`,
      })
    } catch (error) {
      console.error("Error al cambiar rol:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el rol del usuario",
        variant: "destructive",
      })
    }
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <AdminLayout title="Detalles de Usuario">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <PulseLoader message="Cargando datos del usuario..." />
        </div>
      ) : !user ? (
        <Card3D>
          <Card3DContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold mb-2">Usuario no encontrado</h2>
            <p className="text-muted-foreground mb-6 text-center">
              No se encontró el usuario con el ID especificado.
            </p>
            <Button3D onClick={() => router.push("/admin/users")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista de usuarios
            </Button3D>
          </Card3DContent>
        </Card3D>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button3D variant="outline" onClick={() => router.push("/admin/users")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button3D>
            <div className="flex gap-2">
              <Button3D variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button3D>
              <Button3D variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button3D>
            </div>
          </div>

          {/* Tarjeta de perfil */}
          <Card3D>
            <Card3DContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user.avatar_url || ""} alt={user.full_name || user.email} />
                    <AvatarFallback className="text-2xl">
                      {(user.full_name || user.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge className={user.is_verified ? "bg-green-500" : "bg-gray-200"}>
                      {user.is_verified ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {user.is_verified ? "Verificado" : "No verificado"}
                    </Badge>
                    <Badge variant={
                      user.role === "admin" ? "default" :
                      user.role === "trainer" ? "secondary" :
                      user.role === "nutritionist" ? "outline" : "outline"
                    }>
                      {user.role === "admin" ? (
                        <Shield className="h-3 w-3 mr-1" />
                      ) : null}
                      {user.role === "admin" ? "Administrador" :
                       user.role === "trainer" ? "Entrenador" :
                       user.role === "nutritionist" ? "Nutricionista" : "Usuario"}
                    </Badge>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{user.full_name || "Sin nombre"}</h2>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Registrado el {formatDate(user.created_at)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Último acceso: {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Nunca"}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button3D size="sm" onClick={handleToggleVerification}>
                      {user.is_verified ? (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Desverificar
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verificar
                        </>
                      )}
                    </Button3D>
                    <Select value={user.role} onValueChange={handleChangeRole}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Cambiar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="trainer">Entrenador</SelectItem>
                        <SelectItem value="nutritionist">Nutricionista</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button3D size="sm" variant="outline" onClick={() => {
                      toast({
                        title: "Mensaje enviado",
                        description: `Se ha enviado un mensaje a ${user.email}`
                      })
                    }}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Enviar mensaje
                    </Button3D>
                  </div>
                </div>
              </div>
            </Card3DContent>
          </Card3D>

          {/* Pestañas */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="overview">
                <User className="h-4 w-4 mr-2" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="recommendations">
                <Brain className="h-4 w-4 mr-2" />
                Recomendaciones
              </TabsTrigger>
              <TabsTrigger value="progress">
                <BarChart className="h-4 w-4 mr-2" />
                Progreso
              </TabsTrigger>
            </TabsList>

            {/* Pestaña de resumen */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card3D>
                  <Card3DHeader>
                    <Card3DTitle className="flex items-center">
                      <Dumbbell className="h-5 w-5 mr-2 text-primary" />
                      Entrenamiento
                    </Card3DTitle>
                  </Card3DHeader>
                  <Card3DContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Rutinas activas</span>
                        <Badge>3</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Entrenamientos completados</span>
                        <Badge>27</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Nivel</span>
                        <Badge variant="outline">Intermedio</Badge>
                      </div>
                      <Button3D className="w-full" onClick={() => router.push(`/admin/training?user=${params.id}`)}>
                        Ver rutinas
                      </Button3D>
                    </div>
                  </Card3DContent>
                </Card3D>

                <Card3D>
                  <Card3DHeader>
                    <Card3DTitle className="flex items-center">
                      <Utensils className="h-5 w-5 mr-2 text-primary" />
                      Nutrición
                    </Card3DTitle>
                  </Card3DHeader>
                  <Card3DContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Planes activos</span>
                        <Badge>1</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Adherencia</span>
                        <Badge>85%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Objetivo</span>
                        <Badge variant="outline">Pérdida de peso</Badge>
                      </div>
                      <Button3D className="w-full" onClick={() => router.push(`/admin/nutrition?user=${params.id}`)}>
                        Ver planes
                      </Button3D>
                    </div>
                  </Card3DContent>
                </Card3D>
              </div>
            </TabsContent>

            {/* Pestaña de recomendaciones */}
            <TabsContent value="recommendations">
              <AIRecommendations 
                recommendations={recommendations}
                isLoading={isLoadingRecommendations}
                onRefresh={loadRecommendations}
                title="Recomendaciones personalizadas"
                emptyMessage="No hay recomendaciones disponibles para este usuario."
                onApply={(recommendation) => {
                  // Actualizar la recomendación en el estado
                  setRecommendations(recommendations.map(rec => 
                    rec.id === recommendation.id ? recommendation : rec
                  ));
                  
                  toast({
                    title: "Recomendación aplicada",
                    description: "La recomendación se ha aplicado correctamente.",
                  });
                }}
              />
            </TabsContent>

            {/* Pestaña de progreso */}
            <TabsContent value="progress">
              <UserProgress 
                progress={userProgress}
                isLoading={isLoadingProgress}
                onRefresh={loadUserProgress}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Formulario de edición */}
          </div>
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

      {/* Diálogo de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {user && (
              <div className="p-4 border rounded-md">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={user.avatar_url || ""} alt={user.full_name || user.email} />
                    <AvatarFallback>
                      {(user.full_name || user.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.full_name || "Sin nombre"}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button3D variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button3D>
            <Button3D variant="destructive">
              Eliminar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
