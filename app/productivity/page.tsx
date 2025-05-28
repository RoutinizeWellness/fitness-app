"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ListTodo,
  Target,
  TrendingUp,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  Brain,
  BarChart3,
  CheckSquare,
  MoreVertical
} from "lucide-react"

import { OrganicElement, OrganicStaggeredList } from "@/components/transitions/organic-transitions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/lib/contexts/auth-context"
import { HabitTracker } from "@/components/productivity/habit-tracker"

// Tipos
interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface Goal {
  id: string
  title: string
  description?: string
  targetDate?: string
  progress: number
  category: string
  userId: string
  createdAt: string
  updatedAt: string
}

export default function ProductivityPage() {
  const [activeTab, setActiveTab] = useState("habits")
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()

  // Cargar datos
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/welcome")
      return
    }

    const fetchData = async () => {
      try {
        // Cargar tareas
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (tasksError) {
          console.error("Error al cargar tareas:", tasksError)

          // Verificar si el error es porque la tabla no existe
          if (tasksError.code === "42P01") { // Código para "relation does not exist"
            console.log("La tabla 'tasks' no existe, intentando crearla...")

            try {
              // Intentar crear la tabla tasks
              const { error: createError } = await supabase.rpc('create_tasks_table')

              if (createError) {
                console.error("Error al crear tabla tasks:", createError)
                // Usar datos de ejemplo como último recurso
                setTasks(getSampleTasks(user?.id || 'default-user'))
              } else {
                console.log("Tabla tasks creada correctamente, insertando datos de ejemplo...")

                // Insertar datos de ejemplo
                const sampleTasks = getSampleTasks(user.id)
                const { error: insertError } = await supabase
                  .from('tasks')
                  .insert(sampleTasks.map(task => ({
                    id: task.id,
                    user_id: user.id,
                    title: task.title,
                    description: task.description,
                    due_date: task.dueDate,
                    completed: task.completed,
                    priority: task.priority,
                    category: task.category,
                    created_at: task.createdAt,
                    updated_at: task.updatedAt
                  })))

                if (insertError) {
                  console.error("Error al insertar tareas de ejemplo:", insertError)
                }

                // Establecer los datos de ejemplo en el estado
                setTasks(sampleTasks)
              }
            } catch (rpcError) {
              console.error("Error al llamar a RPC para crear tabla:", rpcError)
              // Usar datos de ejemplo como último recurso
              setTasks(getSampleTasks(user?.id || 'default-user'))
            }
          } else {
            // Otro tipo de error, usar datos de ejemplo
            setTasks(getSampleTasks(user?.id || 'default-user'))
          }
        } else {
          // Transformar los datos si es necesario
          const formattedTasks = tasksData ? tasksData.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            dueDate: task.due_date,
            completed: task.completed,
            priority: task.priority,
            category: task.category,
            userId: task.user_id,
            createdAt: task.created_at,
            updatedAt: task.updated_at
          })) : [];

          // Si no hay datos, usar datos de ejemplo
          setTasks(formattedTasks.length > 0 ? formattedTasks : getSampleTasks(user?.id || 'default-user'))
        }

        // Cargar objetivos
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (goalsError) {
          console.error("Error al cargar objetivos:", goalsError)

          // Verificar si el error es porque la tabla no existe
          if (goalsError.code === "42P01") { // Código para "relation does not exist"
            console.log("La tabla 'goals' no existe, intentando crearla...")

            try {
              // Intentar crear la tabla goals
              const { error: createError } = await supabase.rpc('create_goals_table')

              if (createError) {
                console.error("Error al crear tabla goals:", createError)
                // Usar datos de ejemplo como último recurso
                setGoals(getSampleGoals(user?.id || 'default-user'))
              } else {
                console.log("Tabla goals creada correctamente, insertando datos de ejemplo...")

                // Insertar datos de ejemplo
                const sampleGoals = getSampleGoals(user.id)
                const { error: insertError } = await supabase
                  .from('goals')
                  .insert(sampleGoals.map(goal => ({
                    id: goal.id,
                    user_id: user.id,
                    title: goal.title,
                    description: goal.description,
                    target_date: goal.targetDate,
                    progress: goal.progress,
                    category: goal.category,
                    created_at: goal.createdAt,
                    updated_at: goal.updatedAt
                  })))

                if (insertError) {
                  console.error("Error al insertar objetivos de ejemplo:", insertError)
                }

                // Establecer los datos de ejemplo en el estado
                setGoals(sampleGoals)
              }
            } catch (rpcError) {
              console.error("Error al llamar a RPC para crear tabla:", rpcError)
              // Usar datos de ejemplo como último recurso
              setGoals(getSampleGoals(user?.id || 'default-user'))
            }
          } else {
            // Otro tipo de error, usar datos de ejemplo
            setGoals(getSampleGoals(user?.id || 'default-user'))
          }
        } else {
          // Transformar los datos si es necesario
          const formattedGoals = goalsData ? goalsData.map(goal => ({
            id: goal.id,
            title: goal.title,
            description: goal.description,
            targetDate: goal.target_date,
            progress: goal.progress,
            category: goal.category,
            userId: goal.user_id,
            createdAt: goal.created_at,
            updatedAt: goal.updated_at
          })) : [];

          // Si no hay datos, usar datos de ejemplo
          setGoals(formattedGoals.length > 0 ? formattedGoals : getSampleGoals(user?.id || 'default-user'))
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        // Usar datos de ejemplo en caso de error
        setTasks(getSampleTasks(user?.id || 'default-user'))
        setGoals(getSampleGoals(user?.id || 'default-user'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, authLoading, router])

  // Marcar tarea como completada
  const toggleTaskCompletion = async (taskId: string) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return

    const updatedTask = {
      ...tasks[taskIndex],
      completed: !tasks[taskIndex].completed,
      updatedAt: new Date().toISOString()
    }

    // Actualizar estado local
    const updatedTasks = [...tasks]
    updatedTasks[taskIndex] = updatedTask
    setTasks(updatedTasks)

    try {
      // Actualizar en Supabase
      const { error } = await supabase
        .from('tasks')
        .update({
          completed: updatedTask.completed,
          updated_at: new Date().toISOString() // Usar formato de Supabase
        })
        .eq('id', taskId)

      if (error) {
        console.error("Error al actualizar tarea:", error)

        // Si el error es porque la tabla no existe, intentar crearla
        if (error.code === "42P01") {
          console.log("La tabla 'tasks' no existe al actualizar, intentando crearla...")
          toast({
            title: "Error",
            description: "La tabla de tareas no existe. Recargue la página para crearla.",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Error",
            description: "No se pudo actualizar la tarea",
            variant: "destructive"
          })
        }

        // Revertir cambio en caso de error
        updatedTasks[taskIndex] = tasks[taskIndex]
        setTasks(updatedTasks)
      } else {
        toast({
          title: "Tarea actualizada",
          description: updatedTask.completed
            ? "Tarea marcada como completada"
            : "Tarea marcada como pendiente",
        })
      }
    } catch (error) {
      console.error("Error al actualizar tarea:", error)

      // Revertir cambio en caso de error
      updatedTasks[taskIndex] = tasks[taskIndex]
      setTasks(updatedTasks)

      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar la tarea",
        variant: "destructive"
      })
    }
  }

  // Actualizar progreso de objetivo
  const updateGoalProgress = async (goalId: string, progress: number) => {
    const goalIndex = goals.findIndex(g => g.id === goalId)
    if (goalIndex === -1) return

    const updatedGoal = {
      ...goals[goalIndex],
      progress: Math.min(100, Math.max(0, progress)),
      updatedAt: new Date().toISOString()
    }

    // Actualizar estado local
    const updatedGoals = [...goals]
    updatedGoals[goalIndex] = updatedGoal
    setGoals(updatedGoals)

    try {
      // Actualizar en Supabase
      const { error } = await supabase
        .from('goals')
        .update({
          progress: updatedGoal.progress,
          updated_at: new Date().toISOString() // Usar formato de Supabase
        })
        .eq('id', goalId)

      if (error) {
        console.error("Error al actualizar objetivo:", error)

        // Si el error es porque la tabla no existe, intentar crearla
        if (error.code === "42P01") {
          console.log("La tabla 'goals' no existe al actualizar, intentando crearla...")
          toast({
            title: "Error",
            description: "La tabla de objetivos no existe. Recargue la página para crearla.",
            variant: "destructive"
          })
        } else {
          // Proporcionar información más específica del error
          const errorMessage = error.message || error.details || "No se pudo actualizar el objetivo"
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive"
          })
        }

        // Revertir cambio en caso de error
        updatedGoals[goalIndex] = goals[goalIndex]
        setGoals(updatedGoals)
      } else {
        // Mostrar mensaje de éxito
        if (updatedGoal.progress === 100) {
          toast({
            title: "¡Objetivo completado!",
            description: "Has alcanzado el 100% de progreso en este objetivo",
          })
        } else {
          toast({
            title: "Progreso actualizado",
            description: `Progreso actualizado a ${updatedGoal.progress}%`,
          })
        }
      }
    } catch (error) {
      console.error("Error al actualizar objetivo:", error)

      // Revertir cambio en caso de error
      updatedGoals[goalIndex] = goals[goalIndex]
      setGoals(updatedGoals)

      // Mejorar el manejo de errores con información más específica
      const errorMessage = error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null
          ? JSON.stringify(error)
          : "Error desconocido al actualizar el objetivo"

      toast({
        title: "Error",
        description: errorMessage || "Ocurrió un error al actualizar el objetivo",
        variant: "destructive"
      })
    }
  }

  // Renderizar tareas
  const renderTasks = () => {
    if (tasks.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No tienes tareas pendientes</p>
          <Button
            onClick={() => router.push('/productivity/new-task')}
            className="rounded-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear nueva tarea
          </Button>
        </div>
      )
    }

    const pendingTasks = tasks.filter(task => !task.completed)
    const completedTasks = tasks.filter(task => task.completed)

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Tareas pendientes ({pendingTasks.length})</h2>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => router.push('/productivity/new-task')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva
          </Button>
        </div>

        {pendingTasks.map(task => (
          <Card key={task.id} organic={true} hover={true} className="p-5">
            <div className="flex items-start">
              <button
                className={`mt-1 rounded-full border-2 ${
                  task.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300'
                } p-1 mr-3`}
                onClick={() => toggleTaskCompletion(task.id)}
              >
                {task.completed && <CheckCircle2 className="h-4 w-4" />}
                {!task.completed && <div className="h-4 w-4" />}
              </button>

              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium">{task.title}</h3>
                  <button className="text-gray-500">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                )}

                <div className="flex items-center mt-2 text-xs text-gray-500">
                  {task.dueDate && (
                    <div className="flex items-center mr-3">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className={`px-2 py-0.5 rounded-full text-white ${
                    task.priority === 'high'
                      ? 'bg-red-500'
                      : task.priority === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                  }`}>
                    {task.priority}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {completedTasks.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mt-6">Completadas ({completedTasks.length})</h2>

            {completedTasks.slice(0, 3).map(task => (
              <Card key={task.id} organic={true} className="p-5 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-start">
                  <button
                    className="mt-1 rounded-full bg-green-500 border-2 border-green-500 text-white p-1 mr-3"
                    onClick={() => toggleTaskCompletion(task.id)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium line-through text-gray-500">{task.title}</h3>
                      <button className="text-gray-400">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-400 mt-1 line-through">{task.description}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {completedTasks.length > 3 && (
              <Button
                variant="ghost"
                className="w-full text-gray-500"
                onClick={() => router.push('/productivity/completed')}
              >
                Ver todas las tareas completadas ({completedTasks.length})
              </Button>
            )}
          </>
        )}
      </div>
    )
  }

  // Renderizar objetivos
  const renderGoals = () => {
    if (goals.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No tienes objetivos establecidos</p>
          <Button
            onClick={() => router.push('/productivity/new-goal')}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear nuevo objetivo
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Mis objetivos ({goals.length})</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/productivity/new-goal')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo
          </Button>
        </div>

        {goals.map(goal => (
          <Card key={goal.id} className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{goal.title}</h3>
                {goal.description && (
                  <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                )}
              </div>
              <button className="text-gray-500">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Progreso</span>
                <span>{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-2" />
            </div>

            <div className="flex items-center justify-between mt-3">
              {goal.targetDate && (
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Meta: {new Date(goal.targetDate).toLocaleDateString()}</span>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateGoalProgress(goal.id, goal.progress - 10)}
                  disabled={goal.progress <= 0}
                >
                  -
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateGoalProgress(goal.id, goal.progress + 10)}
                  disabled={goal.progress >= 100}
                >
                  +
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  // Renderizar estadísticas
  const renderStats = () => {
    const completedTasksCount = tasks.filter(task => task.completed).length
    const totalTasksCount = tasks.length
    const completionRate = totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0

    const completedGoalsCount = goals.filter(goal => goal.progress === 100).length

    return (
      <div className="space-y-4">
        <Card className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-xl">
          <h3 className="font-semibold mb-3">Resumen de productividad</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-md p-3">
              <p className="text-xs text-gray-500 mb-1">Tareas completadas</p>
              <p className="text-xl font-semibold">{completedTasksCount}/{totalTasksCount}</p>
            </div>
            <div className="bg-green-50 rounded-md p-3">
              <p className="text-xs text-gray-500 mb-1">Tasa de finalización</p>
              <p className="text-xl font-semibold">{completionRate}%</p>
            </div>
            <div className="bg-purple-50 rounded-md p-3">
              <p className="text-xs text-gray-500 mb-1">Objetivos logrados</p>
              <p className="text-xl font-semibold">{completedGoalsCount}/{goals.length}</p>
            </div>
            <div className="bg-orange-50 rounded-md p-3">
              <p className="text-xs text-gray-500 mb-1">Tareas pendientes</p>
              <p className="text-xl font-semibold">{totalTasksCount - completedTasksCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-xl">
          <h3 className="font-semibold mb-3">Distribución de tareas</h3>
          <div className="h-40 flex items-center justify-center">
            <p className="text-gray-500">Gráfico de distribución de tareas</p>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-xl">
          <h3 className="font-semibold mb-3">Tendencia de productividad</h3>
          <div className="h-40 flex items-center justify-center">
            <p className="text-gray-500">Gráfico de tendencia de productividad</p>
          </div>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <PulseLoader message="Cargando datos de productividad..." />
      </div>
    )
  }

  return (
      <OrganicElement type="fade">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-4 mb-4 rounded-full p-1">
            <TabsTrigger value="habits" className="flex items-center rounded-full">
              <CheckSquare className="h-4 w-4 mr-2" />
              <span>Hábitos</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center rounded-full">
              <ListTodo className="h-4 w-4 mr-2" />
              <span>Tareas</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center rounded-full">
              <Target className="h-4 w-4 mr-2" />
              <span>Objetivos</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center rounded-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span>Estadísticas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="habits">
            {user && <HabitTracker userId={user.id} />}
          </TabsContent>

          <TabsContent value="tasks">
            {renderTasks()}
          </TabsContent>

          <TabsContent value="goals">
            {renderGoals()}
          </TabsContent>

          <TabsContent value="stats">
            {renderStats()}
          </TabsContent>
        </Tabs>
      </OrganicElement>
  )
}

// Datos de ejemplo
function getSampleTasks(userId: string): Task[] {
  return [
    {
      id: '1',
      title: 'Completar informe semanal',
      description: 'Preparar el informe de progreso para la reunión del lunes',
      dueDate: new Date(Date.now() + 86400000).toISOString(), // Mañana
      completed: false,
      priority: 'high',
      category: 'trabajo',
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Llamar al médico',
      description: 'Programar cita de revisión anual',
      dueDate: new Date(Date.now() + 172800000).toISOString(), // Pasado mañana
      completed: false,
      priority: 'medium',
      category: 'salud',
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Comprar víveres',
      description: 'Frutas, verduras, proteínas y snacks saludables',
      completed: false,
      priority: 'low',
      category: 'personal',
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      title: 'Revisar correos pendientes',
      completed: true,
      priority: 'medium',
      category: 'trabajo',
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      title: 'Actualizar CV',
      completed: true,
      priority: 'low',
      category: 'personal',
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
}

function getSampleGoals(userId: string): Goal[] {
  return [
    {
      id: '1',
      title: 'Leer 12 libros este año',
      description: 'Un libro por mes para mejorar conocimientos',
      targetDate: new Date(new Date().getFullYear(), 11, 31).toISOString(), // 31 de diciembre
      progress: 25,
      category: 'personal',
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Completar curso de desarrollo web',
      progress: 60,
      category: 'educación',
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Ahorrar para vacaciones',
      description: 'Meta: 2000€ para viaje de verano',
      targetDate: new Date(new Date().getFullYear(), 5, 30).toISOString(), // 30 de junio
      progress: 45,
      category: 'finanzas',
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
}
