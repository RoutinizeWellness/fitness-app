"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
  Dumbbell,
  Users,
  Edit,
  Trash2,
  Search,
  Filter,
  ArrowLeft,
  Eye,
  Copy,
  AlertTriangle,
  Loader2,
  Plus,
  Calendar,
  BarChart2,
  RefreshCw,
  FileText,
  Settings
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getAllUserRoutines, deleteUserRoutine } from "@/lib/admin-training-service"
import { WorkoutRoutine } from "@/lib/types/training"

export default function AdminTrainingPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [routines, setRoutines] = useState<WorkoutRoutine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState("all")
  const [filterGoal, setFilterGoal] = useState("all")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Cargar rutinas de todos los usuarios
  useEffect(() => {
    const loadRoutines = async () => {
      if (!user || !isAdmin) return

      setIsLoading(true)
      try {
        const { data, error } = await getAllUserRoutines()

        if (error) {
          throw error
        }

        if (data) {
          setRoutines(data)
        }
      } catch (error) {
        console.error("Error al cargar rutinas:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las rutinas de entrenamiento",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user && isAdmin && !authLoading) {
      loadRoutines()
    }
  }, [user, isAdmin, authLoading, toast])

  // Filtrar rutinas
  const filteredRoutines = routines.filter(routine => {
    const matchesSearch = searchTerm === "" ||
      routine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      routine.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      routine.userId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLevel = filterLevel === "all" || routine.level === filterLevel
    const matchesGoal = filterGoal === "all" || routine.goal === filterGoal

    return matchesSearch && matchesLevel && matchesGoal
  })

  // Eliminar rutina
  const handleDeleteRoutine = async (routineId: string) => {
    setIsDeleting(true)

    try {
      const { success, error } = await deleteUserRoutine(routineId)

      if (error) {
        throw error
      }

      if (success) {
        setRoutines(prev => prev.filter(routine => routine.id !== routineId))
        toast({
          title: "Rutina eliminada",
          description: "La rutina se ha eliminado correctamente",
        })
      }
    } catch (error) {
      console.error("Error al eliminar rutina:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la rutina",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setConfirmDelete(null)
    }
  }

  // Editar rutina
  const handleEditRoutine = (routineId: string) => {
    router.push(`/admin/training/edit/${routineId}`)
  }

  // Ver rutina
  const handleViewRoutine = (routineId: string) => {
    router.push(`/admin/training/view/${routineId}`)
  }

  // No need to check for admin here as the AdminLayout component handles this

  return (
    <AdminLayout title="Administración de Entrenamiento">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full mr-3">
              <Dumbbell className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Rutinas de Entrenamiento</h2>
              <p className="text-muted-foreground">Gestiona las rutinas de entrenamiento de los usuarios</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button3D variant="outline" onClick={() => {
              setIsLoading(true);
              getAllUserRoutines().then(({ data, error }) => {
                if (error) {
                  toast({
                    title: "Error",
                    description: "No se pudieron actualizar las rutinas",
                    variant: "destructive"
                  });
                } else if (data) {
                  setRoutines(data);
                  toast({
                    title: "Datos actualizados",
                    description: "Las rutinas se han actualizado correctamente"
                  });
                }
                setIsLoading(false);
              });
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button3D>
            <Button3D onClick={() => router.push("/admin/training/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva rutina
            </Button3D>
          </div>
        </div>

        <Tabs defaultValue="routines" className="mb-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="routines">
              <Dumbbell className="h-4 w-4 mr-2" />
              Rutinas
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="h-4 w-4 mr-2" />
              Plantillas
            </TabsTrigger>
            <TabsTrigger value="programs">
              <Calendar className="h-4 w-4 mr-2" />
              Programas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="routines">
            <Card3D className="mb-6">
              <Card3DHeader>
                <Card3DTitle>Filtros y búsqueda</Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="search" className="mb-2">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Nombre, descripción o ID"
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="level-filter" className="mb-2">Nivel</Label>
                    <Select value={filterLevel} onValueChange={setFilterLevel}>
                      <SelectTrigger id="level-filter">
                        <SelectValue placeholder="Todos los niveles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los niveles</SelectItem>
                        <SelectItem value="beginner">Principiante</SelectItem>
                        <SelectItem value="intermediate">Intermedio</SelectItem>
                        <SelectItem value="advanced">Avanzado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="goal-filter" className="mb-2">Objetivo</Label>
                    <Select value={filterGoal} onValueChange={setFilterGoal}>
                      <SelectTrigger id="goal-filter">
                        <SelectValue placeholder="Todos los objetivos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los objetivos</SelectItem>
                        <SelectItem value="strength">Fuerza</SelectItem>
                        <SelectItem value="hypertrophy">Hipertrofia</SelectItem>
                        <SelectItem value="endurance">Resistencia</SelectItem>
                        <SelectItem value="weight_loss">Pérdida de peso</SelectItem>
                        <SelectItem value="general_fitness">Fitness general</SelectItem>
                        <SelectItem value="athletic">Rendimiento atlético</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card3DContent>
            </Card3D>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredRoutines.length === 0 ? (
              <Card3D>
                <Card3DContent className="py-12 text-center">
                  <p className="text-muted-foreground">No se encontraron rutinas que coincidan con los filtros</p>
                </Card3DContent>
              </Card3D>
            ) : (
              <Card3D>
                <Card3DContent>
                  <Table>
                    <TableCaption>Lista de rutinas de entrenamiento de todos los usuarios</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Nivel</TableHead>
                        <TableHead>Objetivo</TableHead>
                        <TableHead>Días</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoutines.map((routine) => (
                        <TableRow key={routine.id}>
                          <TableCell className="font-medium">{routine.name}</TableCell>
                          <TableCell>
                            {routine.profiles?.full_name || routine.userId.substring(0, 8)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {routine.level === "beginner" && "Principiante"}
                              {routine.level === "intermediate" && "Intermedio"}
                              {routine.level === "advanced" && "Avanzado"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {routine.goal === "strength" && "Fuerza"}
                            {routine.goal === "hypertrophy" && "Hipertrofia"}
                            {routine.goal === "endurance" && "Resistencia"}
                            {routine.goal === "weight_loss" && "Pérdida de peso"}
                            {routine.goal === "general_fitness" && "Fitness general"}
                            {routine.goal === "athletic" && "Rendimiento atlético"}
                          </TableCell>
                          <TableCell>{routine.days?.length || 0}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button3D
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewRoutine(routine.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button3D>
                              <Button3D
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditRoutine(routine.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button3D>
                              <Dialog open={confirmDelete === routine.id} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                                <DialogTrigger asChild>
                                  <Button3D
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setConfirmDelete(routine.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button3D>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirmar eliminación</DialogTitle>
                                    <DialogDescription>
                                      ¿Estás seguro de que deseas eliminar la rutina "{routine.name}"?
                                      Esta acción no se puede deshacer.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button3D
                                      variant="outline"
                                      onClick={() => setConfirmDelete(null)}
                                      disabled={isDeleting}
                                    >
                                      Cancelar
                                    </Button3D>
                                    <Button3D
                                      variant="destructive"
                                      onClick={() => handleDeleteRoutine(routine.id)}
                                      disabled={isDeleting}
                                    >
                                      {isDeleting ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Eliminando...
                                        </>
                                      ) : (
                                        <>Eliminar</>
                                      )}
                                    </Button3D>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card3DContent>
              </Card3D>
            )}
          </TabsContent>

          <TabsContent value="templates">
            <Card3D>
              <Card3DContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-primary mb-4" />
                <h2 className="text-xl font-bold mb-2">Plantillas de rutinas</h2>
                <p className="text-muted-foreground mb-6 text-center">
                  Esta sección está en desarrollo. Próximamente podrás gestionar plantillas de rutinas predefinidas.
                </p>
                <Button3D variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar plantillas
                </Button3D>
              </Card3DContent>
            </Card3D>
          </TabsContent>

          <TabsContent value="programs">
            <Card3D>
              <Card3DContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <h2 className="text-xl font-bold mb-2">Programas de entrenamiento</h2>
                <p className="text-muted-foreground mb-6 text-center">
                  Esta sección está en desarrollo. Próximamente podrás gestionar programas de entrenamiento completos.
                </p>
                <Button3D variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar programas
                </Button3D>
              </Card3DContent>
            </Card3D>
          </TabsContent>
        </Tabs>


      </div>
    </AdminLayout>
  )
}
