"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { useAuth } from "@/lib/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  MoreVertical,
  Trash2
} from "lucide-react"

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

export default function CompletedTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()

  // Cargar tareas completadas
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/welcome")
      return
    }

    const fetchCompletedTasks = async () => {
      try {
        // Cargar tareas completadas
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('completed', true)
          .order('updated_at', { ascending: false })

        if (tasksError) {
          console.error("Error al cargar tareas completadas:", tasksError)
          // Usar datos de ejemplo si hay error
          setTasks(getSampleCompletedTasks(user.id))
        } else {
          setTasks(tasksData || getSampleCompletedTasks(user.id))
        }
      } catch (error) {
        console.error("Error al cargar tareas completadas:", error)
        // Usar datos de ejemplo en caso de error
        setTasks(getSampleCompletedTasks(user.id))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompletedTasks()
  }, [user, authLoading, router])

  // Marcar tarea como no completada
  const toggleTaskCompletion = async (taskId: string) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return

    const updatedTask = {
      ...tasks[taskIndex],
      completed: false,
      updatedAt: new Date().toISOString()
    }

    // Actualizar estado local
    const updatedTasks = [...tasks]
    updatedTasks.splice(taskIndex, 1) // Eliminar de la lista de completadas
    setTasks(updatedTasks)

    try {
      // Actualizar en Supabase
      const { error } = await supabase
        .from('tasks')
        .update({
          completed: false,
          updated_at: updatedTask.updatedAt
        })
        .eq('id', taskId)

      if (error) {
        console.error("Error al actualizar tarea:", error)
        toast({
          title: "Error",
          description: "No se pudo actualizar la tarea",
          variant: "destructive"
        })

        // Revertir cambio en caso de error
        updatedTasks.splice(taskIndex, 0, tasks[taskIndex])
        setTasks(updatedTasks)
      } else {
        toast({
          title: "Tarea actualizada",
          description: "La tarea se ha marcado como pendiente",
        })
      }
    } catch (error) {
      console.error("Error al actualizar tarea:", error)
    }
  }

  // Eliminar tarea
  const deleteTask = async (taskId: string) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return

    // Actualizar estado local
    const updatedTasks = [...tasks]
    updatedTasks.splice(taskIndex, 1)
    setTasks(updatedTasks)

    try {
      // Eliminar de Supabase
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        console.error("Error al eliminar tarea:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar la tarea",
          variant: "destructive"
        })

        // Revertir cambio en caso de error
        updatedTasks.splice(taskIndex, 0, tasks[taskIndex])
        setTasks(updatedTasks)
      } else {
        toast({
          title: "Tarea eliminada",
          description: "La tarea se ha eliminado correctamente",
        })
      }
    } catch (error) {
      console.error("Error al eliminar tarea:", error)
    }
  }

  if (isLoading) {
    return (
      <RoutinizeLayout activeTab="productivity" title="Tareas completadas">
        <div className="container mx-auto p-4 pb-20 flex items-center justify-center min-h-[80vh]">
          <PulseLoader message="Cargando tareas completadas..." />
        </div>
      </RoutinizeLayout>
    )
  }

  return (
    <RoutinizeLayout activeTab="productivity" title="Tareas completadas">
      <div className="container mx-auto p-4 pb-20">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => router.push("/productivity")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Tareas completadas</h1>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No hay tareas completadas</p>
            <Button
              onClick={() => router.push('/productivity')}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Volver a Productividad
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <Card key={task.id} className="p-4 bg-gray-50 dark:bg-gray-700 shadow-sm rounded-xl">
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
                      <div className="flex space-x-1">
                        <button
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-400 mt-1 line-through">{task.description}</p>
                    )}

                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <div className="flex items-center mr-3">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Completada: {new Date(task.updatedAt).toLocaleDateString()}</span>
                      </div>

                      <div className={`px-2 py-0.5 rounded-full text-white opacity-50 ${
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
          </div>
        )}
      </div>
    </RoutinizeLayout>
  )
}

// Datos de ejemplo
function getSampleCompletedTasks(userId: string): Task[] {
  return [
    {
      id: '4',
      title: 'Revisar correos pendientes',
      description: 'Responder a todos los correos importantes',
      completed: true,
      priority: 'medium',
      category: 'trabajo',
      userId,
      createdAt: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
      updatedAt: new Date(Date.now() - 86400000).toISOString() // Hace 1 día
    },
    {
      id: '5',
      title: 'Actualizar CV',
      description: 'Añadir nuevas habilidades y experiencia',
      completed: true,
      priority: 'low',
      category: 'personal',
      userId,
      createdAt: new Date(Date.now() - 345600000).toISOString(), // Hace 4 días
      updatedAt: new Date(Date.now() - 259200000).toISOString() // Hace 3 días
    },
    {
      id: '6',
      title: 'Pagar facturas mensuales',
      completed: true,
      priority: 'high',
      category: 'finanzas',
      userId,
      createdAt: new Date(Date.now() - 518400000).toISOString(), // Hace 6 días
      updatedAt: new Date(Date.now() - 432000000).toISOString() // Hace 5 días
    },
    {
      id: '7',
      title: 'Reservar cita con el dentista',
      completed: true,
      priority: 'medium',
      category: 'salud',
      userId,
      createdAt: new Date(Date.now() - 691200000).toISOString(), // Hace 8 días
      updatedAt: new Date(Date.now() - 604800000).toISOString() // Hace 7 días
    },
    {
      id: '8',
      title: 'Completar curso online',
      description: 'Terminar los módulos pendientes del curso de programación',
      completed: true,
      priority: 'low',
      category: 'educación',
      userId,
      createdAt: new Date(Date.now() - 864000000).toISOString(), // Hace 10 días
      updatedAt: new Date(Date.now() - 777600000).toISOString() // Hace 9 días
    }
  ]
}
