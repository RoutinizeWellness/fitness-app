"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Brain, Clock, Calendar, Filter, 
  ChevronRight, Play, Bookmark, Share2,
  BarChart3, CheckCircle, ListTodo, Timer,
  Target, Lightbulb, Focus, Plus, Zap
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Avatar3D, Avatar3DImage, Avatar3DFallback } from "@/components/ui/avatar-3d"
import { User } from "@supabase/supabase-js"
import { Badge } from "@/components/ui/badge"

interface ProductivityModuleProps {
  profile: User | null
  isAdmin: boolean
  isLoading?: boolean
  onNavigate?: (path: string) => void
}

export function ProductivityModule({
  profile,
  isAdmin,
  isLoading = false,
  onNavigate
}: ProductivityModuleProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  
  // Categorías de productividad
  const categories = [
    { id: "all", name: "Todos" },
    { id: "focus", name: "Enfoque" },
    { id: "tasks", name: "Tareas" },
    { id: "goals", name: "Objetivos" },
    { id: "habits", name: "Hábitos" }
  ]
  
  // Datos para las tareas
  const tasks = [
    {
      id: "task1",
      title: "Completar informe semanal",
      priority: "Alta",
      dueTime: "Hoy, 17:00",
      completed: false,
      color: "bg-red-100 text-red-600"
    },
    {
      id: "task2",
      title: "Preparar presentación",
      priority: "Media",
      dueTime: "Mañana, 12:00",
      completed: false,
      color: "bg-amber-100 text-amber-600"
    },
    {
      id: "task3",
      title: "Revisar correos pendientes",
      priority: "Baja",
      dueTime: "Hoy, 15:00",
      completed: true,
      color: "bg-green-100 text-green-600"
    },
    {
      id: "task4",
      title: "Llamar al cliente",
      priority: "Media",
      dueTime: "Mañana, 10:00",
      completed: false,
      color: "bg-amber-100 text-amber-600"
    }
  ]
  
  // Datos para las técnicas de enfoque
  const focusTechniques = [
    {
      id: "technique1",
      title: "Pomodoro",
      description: "25 minutos de trabajo, 5 de descanso",
      icon: Timer,
      color: "from-red-500 to-orange-600"
    },
    {
      id: "technique2",
      title: "Flujo profundo",
      description: "90 minutos de concentración intensa",
      icon: Focus,
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: "technique3",
      title: "Método 52/17",
      description: "52 minutos de trabajo, 17 de descanso",
      icon: Clock,
      color: "from-green-500 to-teal-600"
    }
  ]
  
  // Datos para los objetivos
  const goals = [
    {
      id: "goal1",
      title: "Completar curso de desarrollo web",
      progress: 65,
      deadline: "15 días restantes"
    },
    {
      id: "goal2",
      title: "Leer 2 libros este mes",
      progress: 50,
      deadline: "18 días restantes"
    },
    {
      id: "goal3",
      title: "Implementar sistema de gestión de tareas",
      progress: 30,
      deadline: "25 días restantes"
    }
  ]
  
  // Función para manejar la navegación
  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    }
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
  
  // Calcular tareas completadas
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length
  const taskCompletionPercentage = (completedTasks / totalTasks) * 100
  
  return (
    <div className="space-y-6 pb-6">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold gradient-text">Productividad</h1>
        <p className="text-gray-500">
          Gestiona tu tiempo y mejora tu concentración
        </p>
      </div>
      
      {/* Resumen de productividad */}
      <Card3D className="overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-90"></div>
          <div className="relative p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Resumen de hoy</h2>
              <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
                {completedTasks}/{totalTasks} tareas
              </span>
            </div>
            
            <Progress3D 
              value={taskCompletionPercentage} 
              max={100} 
              height="8px"
              fillColor="rgba(255, 255, 255, 0.9)"
              backgroundColor="rgba(255, 255, 255, 0.2)"
              className="mb-4"
            />
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-white/20 rounded-full p-2 w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                  <Focus className="h-5 w-5" />
                </div>
                <p className="text-xs">Enfoque</p>
                <p className="text-sm font-semibold">2.5h</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/20 rounded-full p-2 w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <p className="text-xs">Completadas</p>
                <p className="text-sm font-semibold">{completedTasks}</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/20 rounded-full p-2 w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                  <Target className="h-5 w-5" />
                </div>
                <p className="text-xs">Objetivos</p>
                <p className="text-sm font-semibold">3</p>
              </div>
            </div>
          </div>
        </div>
      </Card3D>
      
      {/* Filtros de categoría */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
          {categories.map((category) => (
            <Button3D
              key={category.id}
              variant={activeCategory === category.id ? "gradient" : "outline"}
              size="sm"
              className={activeCategory === category.id ? "text-white" : ""}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </Button3D>
          ))}
        </div>
        
        <Button3D variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button3D>
      </div>
      
      {/* Tareas */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tareas pendientes</h2>
          <Button3D
            variant="outline"
            size="sm"
            onClick={() => handleNavigate("/productivity/add-task")}
          >
            <Plus className="h-4 w-4 mr-1" />
            Añadir
          </Button3D>
        </div>
        
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card3D key={task.id} className={`p-4 ${task.completed ? 'opacity-60' : ''}`}>
              <div className="flex items-start">
                <div className={`rounded-full ${task.color} p-2 mr-3`}>
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <ListTodo className="h-5 w-5" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-medium ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                      {task.priority}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">{task.dueTime}</span>
                    <Button3D
                      variant={task.completed ? "outline" : "default"}
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleNavigate(`/productivity/tasks/${task.id}`)}
                    >
                      {task.completed ? 'Deshacer' : 'Completar'}
                    </Button3D>
                  </div>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
        
        <Button3D
          variant="ghost"
          className="w-full mt-3"
          onClick={() => handleNavigate("/productivity/tasks")}
        >
          Ver todas las tareas
        </Button3D>
      </div>
      
      {/* Técnicas de enfoque */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Técnicas de enfoque</h2>
          <Button3D variant="ghost" size="sm" onClick={() => handleNavigate("/productivity/focus")}>
            Ver todas
          </Button3D>
        </div>
        
        <div className="space-y-4">
          {focusTechniques.map((technique) => (
            <Card3D key={technique.id} className="overflow-hidden">
              <div className="relative h-24">
                <div className={`absolute inset-0 bg-gradient-to-r ${technique.color} opacity-90`}></div>
                <div className="relative p-4 text-white h-full flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{technique.title}</h3>
                    <p className="text-sm text-white/80">{technique.description}</p>
                  </div>
                  
                  <Button3D
                    variant="glass"
                    size="icon"
                    className="h-10 w-10 text-white border-white/30"
                    onClick={() => handleNavigate(`/productivity/focus/${technique.id}`)}
                  >
                    <Play className="h-5 w-5" />
                  </Button3D>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
      
      {/* Objetivos */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tus objetivos</h2>
          <Button3D variant="ghost" size="sm" onClick={() => handleNavigate("/productivity/goals")}>
            Ver todos
          </Button3D>
        </div>
        
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card3D key={goal.id} className="p-4">
              <div>
                <h3 className="font-medium">{goal.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{goal.deadline}</p>
                
                <div className="mt-3">
                  <Progress3D 
                    value={goal.progress} 
                    max={100} 
                    className="mb-1"
                    height="6px"
                  />
                  <p className="text-xs text-gray-500">{goal.progress}% completado</p>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
      
      {/* Consejos de productividad */}
      <Card3D>
        <Card3DHeader>
          <Card3DTitle gradient={true}>Consejo del día</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="flex items-start space-x-3">
            <div className="rounded-full bg-blue-100 text-blue-600 p-2 mt-0.5">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">La regla de los 2 minutos</p>
              <p className="text-sm text-gray-500 mt-1">
                Si una tarea toma menos de 2 minutos en completarse, hazla inmediatamente en lugar de posponerla.
              </p>
              <div className="flex justify-end mt-3">
                <Button3D
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate("/productivity/tips")}
                >
                  Más consejos
                </Button3D>
              </div>
            </div>
          </div>
        </Card3DContent>
      </Card3D>
      
      {/* Análisis de productividad - Solo para admin */}
      {isAdmin && (
        <Card3D>
          <Card3DHeader>
            <div className="flex items-center">
              <Card3DTitle gradient={true}>Análisis de productividad</Card3DTitle>
              <Badge variant="outline" className="ml-2">Admin</Badge>
            </div>
          </Card3DHeader>
          <Card3DContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Focus className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm font-medium">Tiempo de enfoque</span>
                </div>
                <div className="text-xl font-bold gradient-text">
                  4.2h
                </div>
                <p className="text-xs text-gray-500">Promedio diario</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium">Tasa de completado</span>
                </div>
                <div className="text-xl font-bold gradient-text">
                  78%
                </div>
                <p className="text-xs text-gray-500">De todas las tareas</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Zap className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-sm font-medium">Horas pico</span>
                </div>
                <div className="text-xl font-bold gradient-text">
                  10-12h
                </div>
                <p className="text-xs text-gray-500">Mayor productividad</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Target className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm font-medium">Objetivos</span>
                </div>
                <div className="text-xl font-bold gradient-text">
                  85%
                </div>
                <p className="text-xs text-gray-500">Tasa de éxito</p>
              </div>
            </div>
            
            <Button3D
              variant="outline"
              className="w-full mt-4"
              onClick={() => handleNavigate("/admin/productivity-stats")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver análisis detallado
            </Button3D>
          </Card3DContent>
        </Card3D>
      )}
      
      {/* Botón flotante para iniciar sesión de enfoque */}
      <div className="fixed bottom-20 right-4">
        <Button3D
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => handleNavigate("/productivity/start-focus")}
        >
          <Play className="h-6 w-6" />
        </Button3D>
      </div>
    </div>
  )
}
