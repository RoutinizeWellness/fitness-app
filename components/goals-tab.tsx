"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, Target, Plus, Calendar, Trash2, Edit, CheckCircle, TrendingUp, Weight, Dumbbell, Heart, Apple, Award } from "lucide-react"
import { format, parseISO, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { getGoals, createGoal, updateGoal, deleteGoal, updateGoalProgress, suggestGoals, Goal } from "@/lib/goals"
import { setupGoalsTable } from "@/lib/setup-database"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface GoalsTabProps {
  userId: string
}

export default function GoalsTab({ userId }: GoalsTabProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [activeTab, setActiveTab] = useState("active")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null)
  const [suggestedGoalsList, setSuggestedGoalsList] = useState<Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id'>[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [newGoal, setNewGoal] = useState<Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id'>>({
    title: "",
    description: "",
    category: "custom",
    target_value: 100,
    current_value: 0,
    completed: false
  })

  // Estado para controlar si la tabla existe
  const [tableExists, setTableExists] = useState<boolean | null>(null);

  // Configurar tabla y cargar objetivos
  useEffect(() => {
    const setupAndLoad = async () => {
      if (!userId) return;

      // Verificar si la tabla goals existe
      try {
        const { success, error } = await setupGoalsTable();
        setTableExists(success);

        if (!success) {
          console.error("Error al verificar la tabla goals:", error);
          toast({
            title: "Tabla no encontrada",
            description: "La tabla de objetivos no existe en la base de datos. Por favor, contacta al administrador para crearla.",
            variant: "destructive",
          });
        } else {
          console.log("Tabla goals verificada correctamente");
          // Cargar objetivos solo si la tabla existe
          loadGoals();
        }
      } catch (error) {
        console.error("Error al verificar la tabla goals:", error);
        setTableExists(false);
        toast({
          title: "Error",
          description: "No se pudo verificar la tabla de objetivos",
          variant: "destructive",
        });
      }
    };

    setupAndLoad();
  }, [userId, activeTab])

  const loadGoals = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      // Cargar objetivos activos primero
      const { data, error } = await getGoals(userId, {
        completed: activeTab === "completed",
        orderBy: { column: 'created_at', ascending: false }
      })

      if (error) {
        console.error("Error al cargar objetivos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los objetivos",
          variant: "destructive",
        })
        setGoals([]) // Establecer un array vacío para evitar errores
        return
      }

      if (data) {
        setGoals(data)

        // Solo intentar actualizar el progreso si hay objetivos
        if (data.length > 0) {
          try {
            // Actualizar progreso de objetivos
            const { data: updatedGoals, error: progressError } = await updateGoalProgress(userId)

            if (progressError) {
              console.error("Error al actualizar progreso:", progressError)
            } else if (updatedGoals && updatedGoals.length > 0) {
              // Actualizar los objetivos con los valores actualizados
              setGoals(updatedGoals.filter(goal => goal.completed === (activeTab === "completed")))
            }
          } catch (progressError) {
            console.error("Error al actualizar progreso:", progressError)
          }
        }
      } else {
        setGoals([]) // Establecer un array vacío si no hay datos
      }
    } catch (error) {
      console.error("Error al cargar objetivos:", error)
      setGoals([]) // Establecer un array vacío para evitar errores
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar sugerencias de objetivos
  const loadSuggestions = async () => {
    if (!userId) return

    setIsLoadingSuggestions(true)
    try {
      const { data, error } = await suggestGoals(userId)

      if (error) {
        console.error("Error al cargar sugerencias:", error)
        toast({
          title: "Información",
          description: "No se pudieron cargar las sugerencias de objetivos. Puedes crear objetivos personalizados.",
        })
        setSuggestedGoalsList([]) // Establecer un array vacío para evitar errores
        return
      }

      if (data) {
        setSuggestedGoalsList(data)
      } else {
        setSuggestedGoalsList([]) // Establecer un array vacío si no hay datos
      }
    } catch (error) {
      console.error("Error al cargar sugerencias:", error)
      setSuggestedGoalsList([]) // Establecer un array vacío para evitar errores
      toast({
        title: "Información",
        description: "No se pudieron cargar las sugerencias de objetivos. Puedes crear objetivos personalizados.",
      })
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  // Manejar cambio de pestaña
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Cargar los objetivos después de cambiar el estado
    setTimeout(() => {
      loadGoals()
    }, 0)
  }

  // Crear nuevo objetivo
  const handleCreateGoal = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear objetivos",
        variant: "destructive",
      })
      return
    }

    // Validar datos del objetivo
    if (!newGoal.title.trim()) {
      toast({
        title: "Error",
        description: "El título del objetivo es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!newGoal.target_value || newGoal.target_value <= 0) {
      toast({
        title: "Error",
        description: "El valor objetivo debe ser mayor que cero",
        variant: "destructive",
      })
      return
    }

    // Mostrar indicador de carga
    setIsLoading(true)

    try {
      // Verificar si la tabla goals existe
      try {
        const { success, error } = await setupGoalsTable();
        if (!success) {
          console.error("Error al verificar la tabla goals:", error);
          toast({
            title: "Tabla no encontrada",
            description: "La tabla de objetivos no existe en la base de datos. Por favor, contacta al administrador para crearla.",
            variant: "destructive",
          });
          setIsLoading(false)
          return
        }
      } catch (setupError) {
        console.error("Error al verificar la tabla goals:", setupError);
        toast({
          title: "Error",
          description: "No se pudo verificar la tabla de objetivos",
          variant: "destructive",
        });
        setIsLoading(false)
        return
      }

      // Preparar el objetivo para crear
      const goalToCreate = {
        ...newGoal,
        user_id: userId,
        // Asegurar que los valores numéricos son números
        target_value: Number(newGoal.target_value),
        current_value: Number(newGoal.current_value || 0)
      }

      // Crear el objetivo
      const { data, error } = await createGoal(goalToCreate)

      if (error) {
        console.error("Error al crear objetivo:", error)
        toast({
          title: "Error",
          description: error.message || "No se pudo crear el objetivo",
          variant: "destructive",
        })
        return
      }

      if (data) {
        toast({
          title: "Objetivo creado",
          description: "El objetivo se ha creado correctamente",
        })

        // Cerrar el diálogo y resetear el formulario
        setIsDialogOpen(false)
        setNewGoal({
          title: "",
          description: "",
          category: "custom",
          target_value: 100,
          current_value: 0,
          completed: false
        })

        // Recargar objetivos
        await loadGoals()
      } else {
        toast({
          title: "Advertencia",
          description: "El objetivo se creó pero no se pudo obtener la información actualizada",
        })
      }
    } catch (error) {
      console.error("Error al crear objetivo:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al crear el objetivo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Actualizar progreso de un objetivo
  const handleUpdateProgress = async (id: string, newValue: number) => {
    try {
      const { data, error } = await updateGoal(id, {
        current_value: newValue
      })

      if (error) {
        console.error("Error al actualizar progreso:", error)
        toast({
          title: "Error",
          description: "No se pudo actualizar el progreso",
          variant: "destructive",
        })
        return
      }

      if (data) {
        // Actualizar el objetivo en la lista local
        setGoals(goals.map(goal => goal.id === id ? data : goal))

        // Verificar si el objetivo se ha completado
        if (data.completed && !goals.find(g => g.id === id)?.completed) {
          toast({
            title: "¡Objetivo completado!",
            description: "Has alcanzado tu objetivo. ¡Felicidades!",
          })
        }
      }
    } catch (error) {
      console.error("Error al actualizar progreso:", error)
    }
  }

  // Eliminar objetivo
  const handleDeleteGoal = async () => {
    if (!goalToDelete) return

    try {
      const { error } = await deleteGoal(goalToDelete)

      if (error) {
        console.error("Error al eliminar objetivo:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el objetivo",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Objetivo eliminado",
        description: "El objetivo se ha eliminado correctamente",
      })

      // Actualizar la lista local
      setGoals(goals.filter(goal => goal.id !== goalToDelete))
      setGoalToDelete(null)
    } catch (error) {
      console.error("Error al eliminar objetivo:", error)
    }
  }

  // Añadir objetivo sugerido
  const handleAddSuggestedGoal = async (suggestedGoal: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para añadir objetivos",
        variant: "destructive",
      })
      return
    }

    // Mostrar indicador de carga
    setIsLoadingSuggestions(true)

    try {
      // Verificar si la tabla goals existe
      try {
        const { success, error } = await setupGoalsTable();
        if (!success) {
          console.error("Error al verificar la tabla goals:", error);
          toast({
            title: "Tabla no encontrada",
            description: "La tabla de objetivos no existe en la base de datos. Por favor, contacta al administrador para crearla.",
            variant: "destructive",
          });
          setIsLoadingSuggestions(false)
          return
        }
      } catch (setupError) {
        console.error("Error al verificar la tabla goals:", setupError);
        toast({
          title: "Error",
          description: "No se pudo verificar la tabla de objetivos",
          variant: "destructive",
        });
        setIsLoadingSuggestions(false)
        return
      }

      // Preparar el objetivo para crear
      const goalToCreate = {
        ...suggestedGoal,
        user_id: userId,
        // Asegurar que los valores numéricos son números
        target_value: Number(suggestedGoal.target_value),
        current_value: Number(suggestedGoal.current_value || 0)
      }

      // Crear el objetivo
      const { data, error } = await createGoal(goalToCreate)

      if (error) {
        console.error("Error al crear objetivo sugerido:", error)
        toast({
          title: "Error",
          description: error.message || "No se pudo añadir el objetivo sugerido",
          variant: "destructive",
        })
        setIsLoadingSuggestions(false)
        return
      }

      if (data) {
        toast({
          title: "Objetivo añadido",
          description: "El objetivo sugerido se ha añadido correctamente",
        })

        // Eliminar de la lista de sugerencias
        setSuggestedGoalsList(suggestedGoalsList.filter(
          goal => goal.title !== suggestedGoal.title
        ))

        // Recargar objetivos
        await loadGoals()

        // Cerrar el diálogo
        setIsDialogOpen(false)
      } else {
        toast({
          title: "Advertencia",
          description: "El objetivo se creó pero no se pudo obtener la información actualizada",
        })
      }
    } catch (error) {
      console.error("Error al añadir objetivo sugerido:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al añadir el objetivo",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  // Renderizar icono según la categoría
  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case "weight":
        return <Weight className="h-5 w-5" />
      case "strength":
        return <Dumbbell className="h-5 w-5" />
      case "cardio":
        return <TrendingUp className="h-5 w-5" />
      case "nutrition":
        return <Apple className="h-5 w-5" />
      case "habit":
        return <CheckCircle className="h-5 w-5" />
      case "custom":
      default:
        return <Target className="h-5 w-5" />
    }
  }

  // Calcular porcentaje de progreso
  const calculateProgress = (goal: Goal) => {
    if (goal.category === 'weight') {
      // Para objetivos de peso, el progreso puede ser de reducción o aumento
      const isWeightLossGoal = goal.target_value < goal.current_value;
      if (isWeightLossGoal) {
        // Objetivo de pérdida de peso
        const initialValue = goal.current_value;
        const targetValue = goal.target_value;
        const currentValue = goal.current_value;
        const totalLoss = initialValue - targetValue;
        const currentLoss = initialValue - currentValue;
        return Math.min(Math.max((currentLoss / totalLoss) * 100, 0), 100);
      } else {
        // Objetivo de ganancia de peso
        const initialValue = goal.current_value;
        const targetValue = goal.target_value;
        const currentValue = goal.current_value;
        const totalGain = targetValue - initialValue;
        const currentGain = currentValue - initialValue;
        return Math.min(Math.max((currentGain / totalGain) * 100, 0), 100);
      }
    } else {
      // Para otros objetivos, el progreso es lineal hacia el valor objetivo
      return Math.min(Math.max((goal.current_value / goal.target_value) * 100, 0), 100);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Objetivos</h2>
        {tableExists && (
          <Button onClick={() => {
            loadSuggestions()
            setIsDialogOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Objetivo
          </Button>
        )}
      </div>

      {tableExists === null ? (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Verificando la tabla de objetivos...</p>
          </div>
        </div>
      ) : tableExists === false ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                La tabla de objetivos no existe en la base de datos. Por favor, contacta al administrador para crearla.
              </p>
              <p className="mt-2 text-xs text-yellow-700">
                Consulta la consola del navegador para ver las instrucciones de creación de la tabla.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="active">Activos</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : goals.length > 0 ? (
              goals.map((goal) => (
                <Card key={goal.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className={`
                          p-2 rounded-full mr-3
                          ${goal.category === 'weight' ? 'bg-blue-100 text-blue-700' : ''}
                          ${goal.category === 'strength' ? 'bg-purple-100 text-purple-700' : ''}
                          ${goal.category === 'cardio' ? 'bg-red-100 text-red-700' : ''}
                          ${goal.category === 'nutrition' ? 'bg-green-100 text-green-700' : ''}
                          ${goal.category === 'habit' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${goal.category === 'custom' ? 'bg-gray-100 text-gray-700' : ''}
                        `}>
                          {renderCategoryIcon(goal.category)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          {goal.description && (
                            <CardDescription>{goal.description}</CardDescription>
                          )}
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setGoalToDelete(goal.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar objetivo?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente este objetivo.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setGoalToDelete(null)}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteGoal}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span>Progreso: {goal.current_value} / {goal.target_value}</span>
                        <span>{Math.round(calculateProgress(goal))}%</span>
                      </div>
                      <Progress value={calculateProgress(goal)} className="h-2" />

                      <div className="pt-2">
                        <Label htmlFor={`progress-${goal.id}`}>Actualizar progreso:</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Slider
                            id={`progress-${goal.id}`}
                            min={0}
                            max={goal.target_value * 1.5}
                            step={1}
                            value={[goal.current_value]}
                            onValueChange={(value) => handleUpdateProgress(goal.id, value[0])}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={goal.current_value}
                            onChange={(e) => handleUpdateProgress(goal.id, Number(e.target.value))}
                            className="w-20"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 py-2 px-6 flex justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      {goal.deadline && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Fecha límite: {format(new Date(goal.deadline), 'dd/MM/yyyy')}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant={goal.completed ? "success" : "outline"}>
                      {goal.completed ? "Completado" : "En progreso"}
                    </Badge>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No tienes objetivos activos</h3>
                <p className="text-gray-500 mb-4">Crea un nuevo objetivo para hacer seguimiento de tu progreso</p>
                <Button onClick={() => {
                  loadSuggestions()
                  setIsDialogOpen(true)
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Objetivo
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : goals.length > 0 ? (
              goals.map((goal) => (
                <Card key={goal.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className={`
                          p-2 rounded-full mr-3
                          ${goal.category === 'weight' ? 'bg-blue-100 text-blue-700' : ''}
                          ${goal.category === 'strength' ? 'bg-purple-100 text-purple-700' : ''}
                          ${goal.category === 'cardio' ? 'bg-red-100 text-red-700' : ''}
                          ${goal.category === 'nutrition' ? 'bg-green-100 text-green-700' : ''}
                          ${goal.category === 'habit' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${goal.category === 'custom' ? 'bg-gray-100 text-gray-700' : ''}
                        `}>
                          {renderCategoryIcon(goal.category)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          {goal.description && (
                            <CardDescription>{goal.description}</CardDescription>
                          )}
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setGoalToDelete(goal.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar objetivo?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente este objetivo.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setGoalToDelete(null)}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteGoal}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span>Valor final: {goal.current_value} / {goal.target_value}</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 py-2 px-6 flex justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      {goal.updated_at && (
                        <div className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>Completado: {format(new Date(goal.updated_at), 'dd/MM/yyyy')}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="success">Completado</Badge>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No tienes objetivos completados</h3>
                <p className="text-gray-500">Completa tus objetivos activos para verlos aquí</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Diálogo para crear nuevo objetivo */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear nuevo objetivo</DialogTitle>
            <DialogDescription>
              Define un objetivo para hacer seguimiento de tu progreso
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="custom" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="custom">Personalizado</TabsTrigger>
              <TabsTrigger value="suggested">Sugeridos</TabsTrigger>
            </TabsList>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="Ej: Correr 5km"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción (opcional)</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="Describe tu objetivo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={newGoal.category}
                    onValueChange={(value) => setNewGoal({ ...newGoal, category: value as Goal['category'] })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">Peso</SelectItem>
                      <SelectItem value="strength">Fuerza</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="nutrition">Nutrición</SelectItem>
                      <SelectItem value="habit">Hábito</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Valor objetivo</Label>
                  <Input
                    id="target"
                    type="number"
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current">Valor actual</Label>
                  <Input
                    id="current"
                    type="number"
                    value={newGoal.current_value}
                    onChange={(e) => setNewGoal({ ...newGoal, current_value: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Fecha límite (opcional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoal.deadline || ""}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="suggested" className="space-y-4">
              {isLoadingSuggestions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : suggestedGoalsList.length > 0 ? (
                <div className="space-y-3">
                  {suggestedGoalsList.map((goal, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className={`
                              p-2 rounded-full mr-3
                              ${goal.category === 'weight' ? 'bg-blue-100 text-blue-700' : ''}
                              ${goal.category === 'strength' ? 'bg-purple-100 text-purple-700' : ''}
                              ${goal.category === 'cardio' ? 'bg-red-100 text-red-700' : ''}
                              ${goal.category === 'nutrition' ? 'bg-green-100 text-green-700' : ''}
                              ${goal.category === 'habit' ? 'bg-yellow-100 text-yellow-700' : ''}
                              ${goal.category === 'custom' ? 'bg-gray-100 text-gray-700' : ''}
                            `}>
                              {renderCategoryIcon(goal.category)}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{goal.title}</CardTitle>
                              {goal.description && (
                                <CardDescription>{goal.description}</CardDescription>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm">
                          Valor objetivo: {goal.target_value}
                          {goal.current_value > 0 && ` (actual: ${goal.current_value})`}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end">
                        <Button onClick={() => handleAddSuggestedGoal(goal)}>
                          Añadir
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay sugerencias disponibles</h3>
                  <p className="text-gray-500">Completa tu perfil y registra actividades para recibir sugerencias personalizadas</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateGoal}>
              Crear Objetivo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
