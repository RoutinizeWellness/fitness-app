"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { 
  Users, Search, Dumbbell, Calendar, ClipboardEdit, CheckCircle, 
  XCircle, User, ArrowRight, Edit, Save, Trash2, Plus, Filter
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { getExercises, type Exercise } from "@/lib/supabase"
import { getWorkoutRoutines, updateWorkoutRoutine, type WorkoutRoutine } from "@/lib/workout-routines"

interface TrainerDashboardProps {
  userId: string
}

export default function TrainerDashboard({ userId }: TrainerDashboardProps) {
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [userWorkouts, setUserWorkouts] = useState<any[]>([])
  const [userRoutines, setUserRoutines] = useState<WorkoutRoutine[]>([])
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([])

  // Cargar usuarios
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true)
        
        // Verificar si el usuario actual es admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', userId)
          .single()
        
        if (profileError || !profile || !profile.is_admin) {
          toast({
            title: "Acceso denegado",
            description: "No tienes permisos de entrenador para acceder a esta sección",
            variant: "destructive",
          })
          return
        }
        
        // Cargar usuarios
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('full_name', { ascending: true })
        
        if (error) {
          throw error
        }
        
        if (data) {
          setUsers(data)
          setFilteredUsers(data)
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUsers()
  }, [userId])
  
  // Filtrar usuarios cuando cambia la búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users)
      return
    }
    
    const filtered = users.filter(user => 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    setFilteredUsers(filtered)
  }, [searchQuery, users])
  
  // Cargar entrenamientos y rutinas del usuario seleccionado
  useEffect(() => {
    if (!selectedUser) return
    
    const loadUserData = async () => {
      try {
        setIsLoading(true)
        
        // Cargar entrenamientos
        const { data: workouts, error: workoutsError } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', selectedUser.user_id)
          .order('date', { ascending: false })
        
        if (workoutsError) {
          throw workoutsError
        }
        
        setUserWorkouts(workouts || [])
        
        // Cargar rutinas
        const { data: routines, error: routinesError } = await getWorkoutRoutines(
          selectedUser.user_id, 
          { includeExerciseDetails: true }
        )
        
        if (routinesError) {
          throw routinesError
        }
        
        setUserRoutines(routines || [])
        
        // Cargar ejercicios para edición
        const { data: exercisesData, error: exercisesError } = await getExercises({
          limit: 500
        })
        
        if (exercisesError) {
          throw exercisesError
        }
        
        setExercises(exercisesData || [])
        
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
    
    loadUserData()
  }, [selectedUser])
  
  // Cargar solicitudes pendientes de aprobación
  useEffect(() => {
    const loadPendingApprovals = async () => {
      try {
        const { data, error } = await supabase
          .from('trainer_approvals')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        setPendingApprovals(data || [])
      } catch (error) {
        console.error("Error al cargar aprobaciones pendientes:", error)
      }
    }
    
    loadPendingApprovals()
  }, [])
  
  // Seleccionar usuario
  const handleSelectUser = (user: any) => {
    setSelectedUser(user)
    setActiveTab("user-details")
  }
  
  // Volver a la lista de usuarios
  const handleBackToUsers = () => {
    setSelectedUser(null)
    setActiveTab("users")
  }
  
  // Editar rutina
  const handleEditRoutine = (routine: WorkoutRoutine) => {
    setEditingRoutine({...routine})
  }
  
  // Guardar cambios en la rutina
  const handleSaveRoutine = async () => {
    if (!editingRoutine) return
    
    try {
      const { error } = await updateWorkoutRoutine(editingRoutine.id, editingRoutine)
      
      if (error) {
        throw error
      }
      
      // Actualizar la lista de rutinas
      setUserRoutines(prev => 
        prev.map(r => r.id === editingRoutine.id ? editingRoutine : r)
      )
      
      toast({
        title: "Rutina actualizada",
        description: "Los cambios han sido guardados correctamente",
      })
      
      setEditingRoutine(null)
    } catch (error) {
      console.error("Error al guardar rutina:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      })
    }
  }
  
  // Añadir ejercicio a la rutina
  const handleAddExercise = (exercise: Exercise) => {
    if (!editingRoutine) return
    
    const newExercise = {
      exercise_id: exercise.id,
      sets: 3,
      reps: "12",
      rest: 60,
      weight: "",
      notes: "",
      exercise: exercise
    }
    
    setEditingRoutine({
      ...editingRoutine,
      exercises: [...editingRoutine.exercises, newExercise]
    })
  }
  
  // Eliminar ejercicio de la rutina
  const handleRemoveExercise = (index: number) => {
    if (!editingRoutine) return
    
    const updatedExercises = [...editingRoutine.exercises]
    updatedExercises.splice(index, 1)
    
    setEditingRoutine({
      ...editingRoutine,
      exercises: updatedExercises
    })
  }
  
  // Actualizar ejercicio en la rutina
  const handleUpdateExercise = (index: number, field: string, value: any) => {
    if (!editingRoutine) return
    
    const updatedExercises = [...editingRoutine.exercises]
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    }
    
    setEditingRoutine({
      ...editingRoutine,
      exercises: updatedExercises
    })
  }
  
  // Aprobar o rechazar solicitud
  const handleApprovalAction = async (approvalId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('trainer_approvals')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', approvalId)
      
      if (error) {
        throw error
      }
      
      // Actualizar la lista de aprobaciones pendientes
      setPendingApprovals(prev => prev.filter(a => a.id !== approvalId))
      
      toast({
        title: status === 'approved' ? "Solicitud aprobada" : "Solicitud rechazada",
        description: "La acción se ha completado correctamente",
      })
    } catch (error) {
      console.error("Error al procesar la solicitud:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud",
        variant: "destructive",
      })
    }
  }
  
  // Renderizar la interfaz
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Panel del Entrenador</h1>
        {selectedUser && (
          <Button variant="outline" onClick={handleBackToUsers}>
            <Users className="mr-2 h-4 w-4" />
            Volver a usuarios
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="users" disabled={!!selectedUser}>
            <Users className="h-4 w-4 mr-2" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="user-details" disabled={!selectedUser}>
            <User className="h-4 w-4 mr-2" />
            Detalles
          </TabsTrigger>
          <TabsTrigger value="approvals">
            <ClipboardEdit className="h-4 w-4 mr-2" />
            Aprobaciones
            {pendingApprovals.length > 0 && (
              <Badge className="ml-2 bg-red-500">{pendingApprovals.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        {/* Lista de usuarios */}
        <TabsContent value="users" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>Gestiona los entrenamientos de tus usuarios</CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar usuarios..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
                  ))}
                </div>
              ) : filteredUsers.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {filteredUsers.map(user => (
                      <div 
                        key={user.id}
                        className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectUser(user)}
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.level} • {user.goal}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No se encontraron usuarios</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Detalles del usuario */}
        <TabsContent value="user-details" className="mt-0">
          {selectedUser && (
            <div className="space-y-6">
              {/* Información del usuario */}
              <Card>
                <CardHeader>
                  <CardTitle>{selectedUser.full_name}</CardTitle>
                  <CardDescription>
                    Nivel: {selectedUser.level} • Objetivo: {selectedUser.goal}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Peso</p>
                      <p>{selectedUser.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Altura</p>
                      <p>{selectedUser.height} cm</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Rutinas del usuario */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Rutinas de entrenamiento</CardTitle>
                  <CardDescription>
                    Revisa y ajusta las rutinas del usuario
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userRoutines.length > 0 ? (
                    <div className="space-y-4">
                      {userRoutines.map(routine => (
                        <Card key={routine.id} className="border-none shadow-sm">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{routine.name}</CardTitle>
                              <Badge variant="outline">{routine.level}</Badge>
                            </div>
                            <CardDescription>{routine.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="space-y-2">
                              {routine.exercises.map((exercise, index) => (
                                <div key={index} className="flex items-center p-2 border rounded-md">
                                  <div className="flex-1">
                                    <p className="font-medium">{exercise.exercise?.name || `Ejercicio ${index + 1}`}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {exercise.sets} series x {exercise.reps} reps
                                      {exercise.weight && ` • ${exercise.weight} kg`}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditRoutine(routine)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar rutina
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">El usuario no tiene rutinas</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Historial de entrenamientos */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Historial de entrenamientos</CardTitle>
                  <CardDescription>
                    Últimos entrenamientos registrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userWorkouts.length > 0 ? (
                    <div className="space-y-2">
                      {userWorkouts.slice(0, 10).map(workout => (
                        <div key={workout.id} className="flex items-center p-3 border rounded-lg">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <Dumbbell className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium">{workout.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(workout.date).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {workout.sets && `${workout.sets} series x ${workout.reps} reps`}
                              {workout.weight && ` • ${workout.weight} kg`}
                              {workout.duration && ` • ${workout.duration} min`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No hay entrenamientos registrados</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        {/* Aprobaciones pendientes */}
        <TabsContent value="approvals" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes pendientes</CardTitle>
              <CardDescription>
                Aprueba o rechaza las solicitudes de los usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length > 0 ? (
                <div className="space-y-4">
                  {pendingApprovals.map(approval => (
                    <Card key={approval.id} className="border-none shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{approval.title}</CardTitle>
                          <Badge variant="outline">
                            {new Date(approval.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        <CardDescription>{approval.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="text-sm">{approval.details}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleApprovalAction(approval.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-2 text-red-500" />
                          Rechazar
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleApprovalAction(approval.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprobar
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No hay solicitudes pendientes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo para editar rutina */}
      {editingRoutine && (
        <Dialog open={!!editingRoutine} onOpenChange={(open) => !open && setEditingRoutine(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar rutina</DialogTitle>
              <DialogDescription>
                Modifica los ejercicios y detalles de la rutina
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre</label>
                  <Input 
                    value={editingRoutine.name} 
                    onChange={(e) => setEditingRoutine({...editingRoutine, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nivel</label>
                  <Select 
                    value={editingRoutine.level} 
                    onValueChange={(value) => setEditingRoutine({
                      ...editingRoutine, 
                      level: value as 'beginner' | 'intermediate' | 'advanced'
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea 
                  value={editingRoutine.description || ''} 
                  onChange={(e) => setEditingRoutine({...editingRoutine, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <Separator />
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Ejercicios</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir ejercicio
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Añadir ejercicio</DialogTitle>
                        <DialogDescription>
                          Selecciona un ejercicio para añadir a la rutina
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="my-4">
                        <Input 
                          placeholder="Buscar ejercicios..." 
                          className="mb-4"
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-2">
                            {exercises
                              .filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
                              .map(exercise => (
                                <div 
                                  key={exercise.id}
                                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                  onClick={() => handleAddExercise(exercise)}
                                >
                                  <div className="flex-1">
                                    <p className="font-medium">{exercise.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {exercise.muscle_group} • {exercise.difficulty}
                                    </p>
                                  </div>
                                  <Plus className="h-5 w-5 text-primary" />
                                </div>
                              ))
                            }
                          </div>
                        </ScrollArea>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-3">
                  {editingRoutine.exercises.map((exercise, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">
                          {exercise.exercise?.name || `Ejercicio ${index + 1}`}
                        </h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveExercise(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-xs font-medium">Series</label>
                          <Input 
                            type="number" 
                            value={exercise.sets} 
                            onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Repeticiones</label>
                          <Input 
                            value={exercise.reps} 
                            onChange={(e) => handleUpdateExercise(index, 'reps', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Descanso (seg)</label>
                          <Input 
                            type="number" 
                            value={exercise.rest} 
                            onChange={(e) => handleUpdateExercise(index, 'rest', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Peso (kg)</label>
                          <Input 
                            value={exercise.weight || ''} 
                            onChange={(e) => handleUpdateExercise(index, 'weight', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <label className="text-xs font-medium">Notas</label>
                        <Textarea 
                          value={exercise.notes || ''} 
                          onChange={(e) => handleUpdateExercise(index, 'notes', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {editingRoutine.exercises.length === 0 && (
                    <div className="text-center py-6 border rounded-lg">
                      <p className="text-muted-foreground">No hay ejercicios en esta rutina</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingRoutine(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveRoutine}>
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
