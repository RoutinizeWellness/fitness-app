"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
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
  Dumbbell,
  Search,
  Filter,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Save,
  X
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { supabase } from "@/lib/supabase-client"
import { Exercise } from "@/lib/types/training"
import { ExerciseForm } from "@/components/admin/exercise-form"

export default function AdminExercisesPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [muscleGroupFilter, setMuscleGroupFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)
  const [muscleGroups, setMuscleGroups] = useState<string[]>([])
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([])

  // Cargar ejercicios
  useEffect(() => {
    loadExercises()
  }, [])

  // Filtrar ejercicios cuando cambian los filtros
  useEffect(() => {
    filterExercises()
  }, [exercises, searchTerm, muscleGroupFilter, difficultyFilter])

  // Cargar ejercicios desde Supabase
  const loadExercises = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name')

      if (error) throw error

      // Transformar datos al formato de la aplicación
      const formattedExercises: Exercise[] = data.map(ex => {
        // Procesar los arrays si vienen como strings
        let muscleGroup = ex.muscle_group || []
        let equipment = ex.equipment || []

        if (typeof muscleGroup === 'string') {
          try {
            muscleGroup = JSON.parse(muscleGroup)
          } catch (e) {
            muscleGroup = [muscleGroup]
          }
        }

        if (typeof equipment === 'string') {
          try {
            equipment = JSON.parse(equipment)
          } catch (e) {
            equipment = [equipment]
          }
        }

        return {
          id: ex.id,
          name: ex.name,
          category: ex.category || 'other',
          muscleGroup: Array.isArray(muscleGroup) ? muscleGroup : [muscleGroup],
          equipment: Array.isArray(equipment) ? equipment : [equipment],
          description: ex.description || '',
          videoUrl: ex.video_url || undefined,
          imageUrl: ex.image_url || undefined,
          difficulty: (ex.difficulty || 'intermediate') as 'beginner' | 'intermediate' | 'advanced',
          isCompound: ex.is_compound || false
        }
      })

      setExercises(formattedExercises)

      // Extraer grupos musculares y equipamiento únicos
      const uniqueMuscleGroups = new Set<string>()
      const uniqueEquipment = new Set<string>()

      formattedExercises.forEach(ex => {
        ex.muscleGroup.forEach(mg => uniqueMuscleGroups.add(mg))
        ex.equipment.forEach(eq => uniqueEquipment.add(eq))
      })

      setMuscleGroups(Array.from(uniqueMuscleGroups).sort())
      setEquipmentTypes(Array.from(uniqueEquipment).sort())

    } catch (error) {
      console.error("Error al cargar ejercicios:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los ejercicios",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar ejercicios según los criterios
  const filterExercises = () => {
    let filtered = [...exercises]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por grupo muscular
    if (muscleGroupFilter !== "all") {
      filtered = filtered.filter(ex =>
        ex.muscleGroup.includes(muscleGroupFilter)
      )
    }

    // Filtrar por dificultad
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(ex =>
        ex.difficulty === difficultyFilter
      )
    }

    setFilteredExercises(filtered)
  }

  // Verificar si el usuario es administrador
  if (!isAdmin) {
    return (
      <RoutinizeLayout>
        <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24">
          <Card3D>
            <Card3DContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Acceso restringido</h2>
              <p className="text-muted-foreground mb-6 text-center">
                No tienes permisos de administrador para acceder a esta página.
              </p>
              <Button3D onClick={() => router.push("/")}>
                Volver al inicio
              </Button3D>
            </Card3DContent>
          </Card3D>
        </div>
      </RoutinizeLayout>
    )
  }

  return (
    <RoutinizeLayout>
      <div className="container max-w-6xl mx-auto p-4 pt-20 pb-24">
        <div className="flex items-center mb-6">
          <Button3D
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => router.push("/admin")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button3D>
          <h1 className="text-2xl font-bold">Gestión de Ejercicios</h1>
        </div>

        <Card3D className="mb-6">
          <Card3DContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Buscar ejercicios</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre o descripción..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full md:w-48">
                <label className="text-sm font-medium mb-1 block">Grupo muscular</label>
                <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Grupo muscular" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {muscleGroups.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-48">
                <label className="text-sm font-medium mb-1 block">Dificultad</label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dificultad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="beginner">Principiante</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button3D variant="outline" onClick={() => {
                setSearchTerm("")
                setMuscleGroupFilter("all")
                setDifficultyFilter("all")
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button3D>

              <Button3D onClick={() => {
                setCurrentExercise(null)
                setIsCreating(true)
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo ejercicio
              </Button3D>
            </div>
          </Card3DContent>
        </Card3D>

        {isLoading ? (
          <Card3D>
            <Card3DContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando ejercicios...</span>
            </Card3DContent>
          </Card3D>
        ) : (
          <Card3D>
            <Card3DHeader>
              <Card3DTitle>
                Ejercicios ({filteredExercises.length} de {exercises.length})
              </Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Grupo muscular</TableHead>
                      <TableHead>Dificultad</TableHead>
                      <TableHead>Equipamiento</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExercises.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No se encontraron ejercicios con los filtros seleccionados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExercises.map(exercise => (
                        <TableRow key={exercise.id}>
                          <TableCell className="font-medium">{exercise.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {exercise.muscleGroup.map(group => (
                                <Badge key={group} variant="outline">{group}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              exercise.difficulty === "beginner" ? "secondary" :
                              exercise.difficulty === "intermediate" ? "default" : "destructive"
                            }>
                              {exercise.difficulty === "beginner" ? "Principiante" :
                               exercise.difficulty === "intermediate" ? "Intermedio" : "Avanzado"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {exercise.equipment.map(eq => (
                                <Badge key={eq} variant="outline">{eq}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button3D
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setCurrentExercise(exercise)
                                setIsEditing(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button3D>
                            <Button3D
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={async () => {
                                if (confirm(`¿Estás seguro de que deseas eliminar el ejercicio "${exercise.name}"?`)) {
                                  try {
                                    const { error } = await supabase
                                      .from('exercises')
                                      .delete()
                                      .eq('id', exercise.id);

                                    if (error) throw error;

                                    // Eliminar de la lista local
                                    setExercises(prev => prev.filter(ex => ex.id !== exercise.id));

                                    toast({
                                      title: "Ejercicio eliminado",
                                      description: "El ejercicio ha sido eliminado correctamente"
                                    });
                                  } catch (error) {
                                    console.error("Error al eliminar ejercicio:", error);
                                    toast({
                                      title: "Error",
                                      description: "No se pudo eliminar el ejercicio",
                                      variant: "destructive"
                                    });
                                  }
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button3D>
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

        {/* Diálogo para crear/editar ejercicio */}
        <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false)
            setIsEditing(false)
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isCreating ? "Crear nuevo ejercicio" : "Editar ejercicio"}</DialogTitle>
              <DialogDescription>
                {isCreating
                  ? "Completa los detalles para añadir un nuevo ejercicio a la base de datos."
                  : "Modifica los detalles del ejercicio seleccionado."}
              </DialogDescription>
            </DialogHeader>

            <ExerciseForm
              exercise={currentExercise || undefined}
              muscleGroups={muscleGroups}
              equipmentTypes={equipmentTypes}
              onSave={(savedExercise) => {
                if (isCreating) {
                  // Añadir el nuevo ejercicio a la lista
                  setExercises(prev => [...prev, savedExercise]);
                } else if (isEditing && currentExercise) {
                  // Actualizar el ejercicio existente
                  setExercises(prev =>
                    prev.map(ex => ex.id === savedExercise.id ? savedExercise : ex)
                  );
                }

                // Cerrar el diálogo
                setIsCreating(false);
                setIsEditing(false);

                // Mostrar mensaje de éxito
                toast({
                  title: isCreating ? "Ejercicio creado" : "Ejercicio actualizado",
                  description: isCreating
                    ? "El ejercicio ha sido creado correctamente"
                    : "El ejercicio ha sido actualizado correctamente"
                });
              }}
              onCancel={() => {
                setIsCreating(false);
                setIsEditing(false);
              }}
            />

            {/* Los botones están incluidos en el formulario */}
          </DialogContent>
        </Dialog>
      </div>
    </RoutinizeLayout>
  )
}
