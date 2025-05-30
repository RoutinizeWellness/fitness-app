"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { 
  Brain, 
  Target, 
  Clock, 
  TrendingUp, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  BarChart3,
  Zap,
  MessageSquare,
  Send,
  Sparkles
} from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { supabase } from "@/lib/supabase-client"

interface ProductivityGoal {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  deadline?: string
  progress: number
  status: 'pending' | 'in_progress' | 'completed' | 'paused'
  aiSuggestions: string[]
  createdAt: string
}

interface AIRecommendation {
  id: string
  type: 'time_management' | 'goal_setting' | 'habit_building' | 'stress_management'
  title: string
  description: string
  actionItems: string[]
  priority: number
  estimatedImpact: number
}

interface ProductivityMetrics {
  dailyFocusTime: number
  goalsCompleted: number
  productivityScore: number
  streakDays: number
  weeklyTrend: number
}

export default function AIProductivityAssistant() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [goals, setGoals] = useState<ProductivityGoal[]>([])
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [metrics, setMetrics] = useState<ProductivityMetrics>({
    dailyFocusTime: 0,
    goalsCompleted: 0,
    productivityScore: 0,
    streakDays: 0,
    weeklyTrend: 0
  })
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    deadline: ""
  })

  useEffect(() => {
    if (user) {
      loadProductivityData()
      generateAIRecommendations()
    }
  }, [user])

  const loadProductivityData = async () => {
    if (!user) return

    try {
      // Cargar objetivos
      const { data: goalsData, error: goalsError } = await supabase
        .from('productivity_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (goalsError) throw goalsError
      if (goalsData) setGoals(goalsData)

      // Cargar métricas (simuladas por ahora)
      setMetrics({
        dailyFocusTime: 4.5,
        goalsCompleted: 12,
        productivityScore: 78,
        streakDays: 5,
        weeklyTrend: 15
      })

    } catch (error) {
      console.error('Error al cargar datos de productividad:', error)
    }
  }

  const generateAIRecommendations = async () => {
    // Simulación de recomendaciones de IA
    const mockRecommendations: AIRecommendation[] = [
      {
        id: "rec-1",
        type: "time_management",
        title: "Técnica Pomodoro Personalizada",
        description: "Basado en tu patrón de trabajo, te recomendamos sesiones de 45 minutos con descansos de 10 minutos.",
        actionItems: [
          "Configura un temporizador para sesiones de 45 minutos",
          "Toma descansos activos de 10 minutos",
          "Después de 3 sesiones, toma un descanso largo de 30 minutos"
        ],
        priority: 9,
        estimatedImpact: 85
      },
      {
        id: "rec-2",
        type: "goal_setting",
        title: "Objetivos SMART Mejorados",
        description: "Tus objetivos actuales pueden ser más específicos y medibles.",
        actionItems: [
          "Define métricas claras para cada objetivo",
          "Establece fechas límite realistas",
          "Divide objetivos grandes en tareas más pequeñas"
        ],
        priority: 8,
        estimatedImpact: 75
      },
      {
        id: "rec-3",
        type: "habit_building",
        title: "Rutina Matutina Optimizada",
        description: "Una rutina matutina consistente puede aumentar tu productividad en un 40%.",
        actionItems: [
          "Levántate a la misma hora todos los días",
          "Incluye 10 minutos de ejercicio ligero",
          "Planifica las 3 tareas más importantes del día"
        ],
        priority: 7,
        estimatedImpact: 70
      }
    ]

    setRecommendations(mockRecommendations)
  }

  const createGoal = async () => {
    if (!user || !newGoal.title.trim()) return

    try {
      const goalData = {
        user_id: user.id,
        title: newGoal.title,
        description: newGoal.description,
        priority: newGoal.priority,
        deadline: newGoal.deadline || null,
        progress: 0,
        status: 'pending',
        ai_suggestions: [],
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('productivity_goals')
        .insert(goalData)
        .select()
        .single()

      if (error) throw error

      setGoals(prev => [data, ...prev])
      setNewGoal({ title: "", description: "", priority: "medium", deadline: "" })
      
      toast({
        title: "Objetivo creado",
        description: "Tu nuevo objetivo ha sido añadido exitosamente.",
      })

      // Generar sugerencias de IA para el nuevo objetivo
      generateGoalSuggestions(data.id, newGoal.title, newGoal.description)

    } catch (error) {
      console.error('Error al crear objetivo:', error)
      toast({
        title: "Error",
        description: "No se pudo crear el objetivo. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  const generateGoalSuggestions = async (goalId: string, title: string, description: string) => {
    // Simulación de sugerencias de IA basadas en el objetivo
    const suggestions = [
      `Divide "${title}" en tareas más pequeñas y manejables`,
      `Establece un horario específico para trabajar en este objetivo`,
      `Identifica posibles obstáculos y crea un plan para superarlos`,
      `Busca un compañero de responsabilidad para este objetivo`,
      `Celebra los pequeños logros en el camino hacia "${title}"`
    ]

    try {
      await supabase
        .from('productivity_goals')
        .update({ ai_suggestions: suggestions })
        .eq('id', goalId)

      // Actualizar el estado local
      setGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, aiSuggestions: suggestions }
          : goal
      ))
    } catch (error) {
      console.error('Error al generar sugerencias:', error)
    }
  }

  const updateGoalProgress = async (goalId: string, progress: number) => {
    try {
      await supabase
        .from('productivity_goals')
        .update({ 
          progress,
          status: progress === 100 ? 'completed' : 'in_progress'
        })
        .eq('id', goalId)

      setGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { 
              ...goal, 
              progress,
              status: progress === 100 ? 'completed' : 'in_progress'
            }
          : goal
      ))

      if (progress === 100) {
        toast({
          title: "¡Objetivo completado!",
          description: "¡Felicidades por completar tu objetivo!",
        })
      }
    } catch (error) {
      console.error('Error al actualizar progreso:', error)
    }
  }

  const sendChatMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage = { role: 'user' as const, content: currentMessage }
    setChatMessages(prev => [...prev, userMessage])
    setCurrentMessage("")
    setIsLoading(true)

    try {
      // Simulación de respuesta de IA
      setTimeout(() => {
        const aiResponse = generateAIResponse(currentMessage)
        setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
        setIsLoading(false)
      }, 1500)

    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      setIsLoading(false)
    }
  }

  const generateAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('productividad') || lowerMessage.includes('productivo')) {
      return "Para mejorar tu productividad, te sugiero: 1) Usar la técnica Pomodoro, 2) Priorizar tareas importantes, 3) Eliminar distracciones, 4) Tomar descansos regulares. ¿Te gustaría que profundice en alguna de estas estrategias?"
    }
    
    if (lowerMessage.includes('objetivo') || lowerMessage.includes('meta')) {
      return "Los objetivos efectivos deben ser SMART: Específicos, Medibles, Alcanzables, Relevantes y con Tiempo definido. ¿Tienes algún objetivo específico en mente que quieras trabajar?"
    }
    
    if (lowerMessage.includes('tiempo') || lowerMessage.includes('gestión')) {
      return "La gestión del tiempo es clave para la productividad. Te recomiendo: 1) Planificar tu día la noche anterior, 2) Usar bloques de tiempo para tareas similares, 3) Decir 'no' a compromisos que no aporten valor. ¿Cuál es tu mayor desafío con el tiempo?"
    }
    
    return "Entiendo tu consulta sobre productividad. Como tu asistente de IA, estoy aquí para ayudarte a optimizar tu rendimiento y alcanzar tus objetivos. ¿Podrías ser más específico sobre en qué área te gustaría mejorar?"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />
      case 'paused': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default: return <Target className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Métricas de Productividad */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tiempo de Enfoque</p>
                <p className="text-2xl font-bold">{metrics.dailyFocusTime}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Objetivos Completados</p>
                <p className="text-2xl font-bold">{metrics.goalsCompleted}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Puntuación</p>
                <p className="text-2xl font-bold">{metrics.productivityScore}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Racha</p>
                <p className="text-2xl font-bold">{metrics.streakDays} días</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones IA</TabsTrigger>
          <TabsTrigger value="chat">Asistente IA</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Objetivo</CardTitle>
              <CardDescription>Define un objetivo y recibe sugerencias personalizadas de IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Título del objetivo"
                value={newGoal.title}
                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Descripción detallada"
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="flex space-x-4">
                <select
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="low">Prioridad Baja</option>
                  <option value="medium">Prioridad Media</option>
                  <option value="high">Prioridad Alta</option>
                </select>
                <Input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
              <Button onClick={createGoal} disabled={!newGoal.title.trim()}>
                <Target className="h-4 w-4 mr-2" />
                Crear Objetivo
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {goals.map(goal => (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(goal.status)}
                        <h3 className="font-semibold">{goal.title}</h3>
                        <Badge className={getPriorityColor(goal.priority)}>
                          {goal.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progreso</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="w-full" />
                      </div>

                      {goal.aiSuggestions && goal.aiSuggestions.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-purple-700 mb-2 flex items-center">
                            <Sparkles className="h-4 w-4 mr-1" />
                            Sugerencias de IA
                          </h4>
                          <ul className="text-xs space-y-1">
                            {goal.aiSuggestions.slice(0, 3).map((suggestion, index) => (
                              <li key={index} className="text-gray-600">• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateGoalProgress(goal.id, Math.min(100, goal.progress + 25))}
                      disabled={goal.progress >= 100}
                    >
                      +25% Progreso
                    </Button>
                    {goal.progress === 100 && (
                      <Badge className="bg-green-100 text-green-800">
                        ¡Completado!
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.map(rec => (
            <Card key={rec.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold">{rec.title}</h3>
                      <Badge variant="outline">
                        Impacto: {rec.estimatedImpact}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Pasos a seguir:</h4>
                      <ul className="text-sm space-y-1">
                        {rec.actionItems.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-purple-600 mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Asistente de Productividad IA
              </CardTitle>
              <CardDescription>
                Pregúntame sobre productividad, gestión del tiempo, objetivos y más
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>¡Hola! Soy tu asistente de productividad con IA.</p>
                    <p className="text-sm">Pregúntame sobre gestión del tiempo, objetivos o productividad.</p>
                  </div>
                )}
                
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Escribe tu pregunta sobre productividad..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  disabled={isLoading}
                />
                <Button onClick={sendChatMessage} disabled={isLoading || !currentMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
