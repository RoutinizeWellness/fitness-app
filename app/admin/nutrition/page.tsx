"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import {
  Utensils,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Plus,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  FileText,
  Copy,
  Download,
  Apple,
  Salad,
  Beef
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface MealPlan {
  id: string
  name: string
  description: string
  user_id: string
  user_email?: string
  user_name?: string
  goal: string
  calories: number
  protein: number
  carbs: number
  fat: number
  created_at: string
  is_active: boolean
  meals_count?: number
}

export default function AdminNutritionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [filteredMealPlans, setFilteredMealPlans] = useState<MealPlan[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [goalFilter, setGoalFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Cargar planes de comida al iniciar
  useEffect(() => {
    loadMealPlans()
  }, [])

  // Filtrar planes de comida cuando cambian los filtros
  useEffect(() => {
    filterMealPlans()
  }, [mealPlans, searchTerm, goalFilter, activeTab])

  // Cargar planes de comida desde Supabase (simulado)
  const loadMealPlans = async () => {
    setIsLoading(true)
    try {
      // Simulación de carga de datos
      setTimeout(() => {
        const mockMealPlans: MealPlan[] = [
          {
            id: "1",
            name: "Plan de pérdida de peso",
            description: "Plan de alimentación para reducir grasa corporal",
            user_id: "user1",
            user_email: "usuario1@example.com",
            user_name: "Juan Pérez",
            goal: "weight_loss",
            calories: 1800,
            protein: 150,
            carbs: 150,
            fat: 60,
            created_at: new Date().toISOString(),
            is_active: true,
            meals_count: 5
          },
          {
            id: "2",
            name: "Plan de ganancia muscular",
            description: "Plan de alimentación para aumentar masa muscular",
            user_id: "user2",
            user_email: "usuario2@example.com",
            user_name: "María García",
            goal: "muscle_gain",
            calories: 2800,
            protein: 200,
            carbs: 300,
            fat: 80,
            created_at: new Date().toISOString(),
            is_active: true,
            meals_count: 6
          },
          {
            id: "3",
            name: "Plan de mantenimiento",
            description: "Plan de alimentación para mantener el peso actual",
            user_id: "user3",
            user_email: "usuario3@example.com",
            user_name: "Carlos Rodríguez",
            goal: "maintenance",
            calories: 2200,
            protein: 160,
            carbs: 220,
            fat: 70,
            created_at: new Date().toISOString(),
            is_active: false,
            meals_count: 4
          },
          {
            id: "4",
            name: "Plan vegetariano",
            description: "Plan de alimentación vegetariano",
            user_id: "user4",
            user_email: "usuario4@example.com",
            user_name: "Ana Martínez",
            goal: "health",
            calories: 2000,
            protein: 120,
            carbs: 250,
            fat: 65,
            created_at: new Date().toISOString(),
            is_active: true,
            meals_count: 5
          },
          {
            id: "5",
            name: "Plan cetogénico",
            description: "Plan de alimentación bajo en carbohidratos",
            user_id: "user5",
            user_email: "usuario5@example.com",
            user_name: "Pedro Sánchez",
            goal: "weight_loss",
            calories: 1900,
            protein: 140,
            carbs: 50,
            fat: 140,
            created_at: new Date().toISOString(),
            is_active: true,
            meals_count: 4
          }
        ]

        setMealPlans(mockMealPlans)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error al cargar planes de comida:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los planes de comida",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Filtrar planes de comida según los criterios
  const filterMealPlans = () => {
    let filtered = [...mealPlans]

    // Filtrar por pestaña activa
    if (activeTab === "active") {
      filtered = filtered.filter(plan => plan.is_active)
    } else if (activeTab === "inactive") {
      filtered = filtered.filter(plan => !plan.is_active)
    } else if (activeTab === "weight_loss") {
      filtered = filtered.filter(plan => plan.goal === "weight_loss")
    } else if (activeTab === "muscle_gain") {
      filtered = filtered.filter(plan => plan.goal === "muscle_gain")
    } else if (activeTab === "maintenance") {
      filtered = filtered.filter(plan => plan.goal === "maintenance")
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(plan => 
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por objetivo
    if (goalFilter !== "all") {
      filtered = filtered.filter(plan => plan.goal === goalFilter)
    }

    setFilteredMealPlans(filtered)
  }

  // Refrescar lista de planes de comida
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadMealPlans()
    setIsRefreshing(false)
    toast({
      title: "Lista actualizada",
      description: "La lista de planes de comida se ha actualizado correctamente",
    })
  }

  // Abrir diálogo de eliminación
  const handleDeleteDialog = (plan: MealPlan) => {
    setSelectedMealPlan(plan)
    setIsDeleteDialogOpen(true)
  }

  // Eliminar plan de comida
  const handleDeleteMealPlan = async () => {
    if (!selectedMealPlan) return

    try {
      // Simulación de eliminación
      setMealPlans(mealPlans.filter(plan => plan.id !== selectedMealPlan.id))

      toast({
        title: "Plan eliminado",
        description: "El plan de comida se ha eliminado correctamente",
      })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error al eliminar plan de comida:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el plan de comida",
        variant: "destructive",
      })
    }
  }

  // Cambiar estado de activación del plan
  const handleToggleActive = async (plan: MealPlan) => {
    try {
      // Simulación de cambio de estado
      setMealPlans(mealPlans.map(p => 
        p.id === plan.id 
          ? { ...p, is_active: !p.is_active }
          : p
      ))

      toast({
        title: plan.is_active ? "Plan desactivado" : "Plan activado",
        description: `El plan ha sido ${plan.is_active ? "desactivado" : "activado"} correctamente`,
      })
    } catch (error) {
      console.error("Error al cambiar estado de activación:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del plan",
        variant: "destructive",
      })
    }
  }

  return (
    <AdminLayout title="Gestión de Nutrición">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-3">
              <Utensils className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Planes de Nutrición</h2>
              <p className="text-muted-foreground">Gestiona los planes de alimentación de los usuarios</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button3D variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualizar
            </Button3D>
            <Button3D variant="outline" onClick={() => {}}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button3D>
            <Button3D onClick={() => router.push("/admin/nutrition/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Plan
            </Button3D>
          </div>
        </div>

        <Card3D>
          <Card3DContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all" className="flex items-center">
                  <Utensils className="h-4 w-4 mr-2" />
                  Todos
                </TabsTrigger>
                <TabsTrigger value="active" className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activos
                </TabsTrigger>
                <TabsTrigger value="inactive" className="flex items-center">
                  <XCircle className="h-4 w-4 mr-2" />
                  Inactivos
                </TabsTrigger>
                <TabsTrigger value="weight_loss" className="flex items-center">
                  <Badge className="h-2 w-2 mr-2 bg-blue-500" />
                  Pérdida de peso
                </TabsTrigger>
                <TabsTrigger value="muscle_gain" className="flex items-center">
                  <Badge className="h-2 w-2 mr-2 bg-red-500" />
                  Ganancia muscular
                </TabsTrigger>
                <TabsTrigger value="maintenance" className="flex items-center">
                  <Badge className="h-2 w-2 mr-2 bg-green-500" />
                  Mantenimiento
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre, descripción o usuario..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={goalFilter} onValueChange={setGoalFilter}>
                    <SelectTrigger className="w-[200px]">
                      <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        <span>Objetivo</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los objetivos</SelectItem>
                      <SelectItem value="weight_loss">Pérdida de peso</SelectItem>
                      <SelectItem value="muscle_gain">Ganancia muscular</SelectItem>
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                      <SelectItem value="health">Salud general</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <PulseLoader message="Cargando planes de nutrición..." />
                  </div>
                ) : filteredMealPlans.length === 0 ? (
                  <div className="text-center py-12">
                    <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No se encontraron planes de nutrición</h3>
                    <p className="text-muted-foreground">
                      No hay planes que coincidan con los criterios de búsqueda.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plan</TableHead>
                          <TableHead>Usuario</TableHead>
                          <TableHead>Objetivo</TableHead>
                          <TableHead>Calorías</TableHead>
                          <TableHead>Macros (P/C/G)</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMealPlans.map((plan) => (
                          <TableRow key={plan.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{plan.name}</div>
                                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {plan.description}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                <div>
                                  <div className="text-sm font-medium">{plan.user_name || "Usuario desconocido"}</div>
                                  <div className="text-xs text-muted-foreground">{plan.user_email || ""}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                plan.goal === "weight_loss" ? "bg-blue-500" :
                                plan.goal === "muscle_gain" ? "bg-red-500" :
                                plan.goal === "maintenance" ? "bg-green-500" : "bg-purple-500"
                              }>
                                {plan.goal === "weight_loss" ? "Pérdida de peso" :
                                 plan.goal === "muscle_gain" ? "Ganancia muscular" :
                                 plan.goal === "maintenance" ? "Mantenimiento" : "Salud general"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Beef className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{plan.calories} kcal</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="bg-red-100">P: {plan.protein}g</Badge>
                                <Badge variant="outline" className="bg-yellow-100">C: {plan.carbs}g</Badge>
                                <Badge variant="outline" className="bg-blue-100">G: {plan.fat}g</Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              {plan.is_active ? (
                                <Badge className="bg-green-500">Activo</Badge>
                              ) : (
                                <Badge variant="outline">Inactivo</Badge>
                              )}
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
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => router.push(`/admin/nutrition/${plan.id}`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => router.push(`/admin/nutrition/${plan.id}/edit`)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleActive(plan)}>
                                    {plan.is_active ? (
                                      <>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Desactivar
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Activar
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {}}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteDialog(plan)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card3DContent>
        </Card3D>
      </div>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este plan de nutrición? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedMealPlan && (
              <div className="p-4 border rounded-md">
                <div className="font-medium">{selectedMealPlan.name}</div>
                <div className="text-sm text-muted-foreground mt-1">{selectedMealPlan.description}</div>
                <div className="flex items-center mt-2 text-sm">
                  <User className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="text-gray-500">{selectedMealPlan.user_name || "Usuario desconocido"}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button3D variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button3D>
            <Button3D variant="destructive" onClick={handleDeleteMealPlan}>
              Eliminar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
