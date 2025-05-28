"use client"

import { useState } from "react"
import { 
  Moon, 
  Sun, 
  Clock, 
  Calendar, 
  Lightbulb, 
  ArrowRight, 
  Check, 
  X,
  Coffee,
  Wine,
  Tv,
  Smartphone,
  Thermometer,
  Droplet,
  Utensils,
  Music,
  BookOpen,
  Bed,
  Sunrise,
  Sunset,
  Zap
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SleepEntry, SleepGoal, SleepStats } from "@/lib/types/wellness"

interface SleepRecommendationsProps {
  stats: SleepStats | null
  goal: SleepGoal | null
  entries: SleepEntry[]
}

export function SleepRecommendations({ stats, goal, entries }: SleepRecommendationsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Obtener última entrada de sueño
  const getLatestEntry = (): SleepEntry | null => {
    if (!entries || entries.length === 0) return null
    
    return entries.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]
  }
  
  const latestEntry = getLatestEntry()
  
  // Generar recomendaciones personalizadas
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = []
    
    // Recomendaciones basadas en duración
    if (stats && stats.averageDuration < 420) { // Menos de 7 horas
      recommendations.push({
        id: 'duration-1',
        title: 'Aumenta tu tiempo de sueño',
        description: 'Tu duración media de sueño está por debajo de lo recomendado. Intenta acostarte 30 minutos antes cada noche.',
        priority: 'high',
        category: 'duration',
        icon: <Clock className="h-5 w-5" />
      })
    }
    
    // Recomendaciones basadas en calidad
    if (stats && stats.averageQuality < 6) {
      recommendations.push({
        id: 'quality-1',
        title: 'Mejora la calidad de tu sueño',
        description: 'Tu calidad de sueño es baja. Considera crear un ritual nocturno relajante y mantener una temperatura óptima en tu habitación (18-20°C).',
        priority: 'high',
        category: 'quality',
        icon: <Moon className="h-5 w-5" />
      })
    }
    
    // Recomendaciones basadas en consistencia
    if (stats && stats.consistencyScore && stats.consistencyScore < 70) {
      recommendations.push({
        id: 'consistency-1',
        title: 'Mantén un horario regular',
        description: 'Tu horario de sueño es irregular. Intenta acostarte y levantarte a la misma hora todos los días, incluso los fines de semana.',
        priority: 'medium',
        category: 'consistency',
        icon: <Calendar className="h-5 w-5" />
      })
    }
    
    // Recomendaciones basadas en factores
    if (latestEntry && latestEntry.factors) {
      if (latestEntry.factors.alcohol) {
        recommendations.push({
          id: 'factors-1',
          title: 'Limita el consumo de alcohol',
          description: 'El alcohol puede ayudarte a conciliar el sueño, pero reduce significativamente su calidad. Evita el alcohol al menos 3 horas antes de acostarte.',
          priority: 'medium',
          category: 'habits',
          icon: <Wine className="h-5 w-5" />
        })
      }
      
      if (latestEntry.factors.caffeine) {
        recommendations.push({
          id: 'factors-2',
          title: 'Reduce la cafeína por la tarde',
          description: 'La cafeína puede permanecer en tu sistema hasta 8 horas. Evita el café, té y bebidas energéticas después del mediodía.',
          priority: 'high',
          category: 'habits',
          icon: <Coffee className="h-5 w-5" />
        })
      }
      
      if (latestEntry.factors.screens) {
        recommendations.push({
          id: 'factors-3',
          title: 'Limita el uso de pantallas',
          description: 'La luz azul de las pantallas suprime la melatonina. Evita teléfonos, tablets y ordenadores al menos 1 hora antes de acostarte.',
          priority: 'high',
          category: 'habits',
          icon: <Smartphone className="h-5 w-5" />
        })
      }
    }
    
    // Recomendaciones generales
    recommendations.push({
      id: 'general-1',
      title: 'Optimiza tu entorno de sueño',
      description: 'Mantén tu habitación oscura, fresca y silenciosa. Considera usar una máscara para los ojos, tapones para los oídos o una máquina de ruido blanco si es necesario.',
      priority: 'medium',
      category: 'environment',
      icon: <Thermometer className="h-5 w-5" />
    })
    
    recommendations.push({
      id: 'general-2',
      title: 'Hidratación adecuada',
      description: 'Mantente bien hidratado durante el día, pero reduce la ingesta de líquidos 1-2 horas antes de acostarte para evitar despertares nocturnos.',
      priority: 'low',
      category: 'habits',
      icon: <Droplet className="h-5 w-5" />
    })
    
    recommendations.push({
      id: 'general-3',
      title: 'Cena ligera',
      description: 'Evita comidas pesadas o picantes al menos 3 horas antes de acostarte. Una cena ligera favorece un sueño más reparador.',
      priority: 'medium',
      category: 'habits',
      icon: <Utensils className="h-5 w-5" />
    })
    
    recommendations.push({
      id: 'general-4',
      title: 'Ritual nocturno relajante',
      description: 'Establece una rutina relajante antes de dormir: un baño caliente, música suave, meditación o lectura pueden preparar a tu cuerpo para el sueño.',
      priority: 'medium',
      category: 'routine',
      icon: <BookOpen className="h-5 w-5" />
    })
    
    recommendations.push({
      id: 'general-5',
      title: 'Exposición a luz natural',
      description: 'Exponte a la luz natural por la mañana para regular tu ritmo circadiano. Esto ayuda a establecer un ciclo de sueño-vigilia saludable.',
      priority: 'medium',
      category: 'routine',
      icon: <Sunrise className="h-5 w-5" />
    })
    
    // Recomendaciones basadas en HRV
    if (stats && stats.averageHrv && stats.averageHrv < 50) {
      recommendations.push({
        id: 'hrv-1',
        title: 'Mejora tu recuperación',
        description: 'Tu HRV promedio es bajo, lo que puede indicar estrés o recuperación insuficiente. Considera técnicas de respiración profunda o meditación antes de dormir.',
        priority: 'high',
        category: 'recovery',
        icon: <Zap className="h-5 w-5" />
      })
    }
    
    return recommendations
  }
  
  // Filtrar recomendaciones por categoría
  const filterRecommendations = (recommendations: Recommendation[]): Recommendation[] => {
    if (selectedCategory === 'all') return recommendations
    
    return recommendations.filter(rec => rec.category === selectedCategory)
  }
  
  // Ordenar recomendaciones por prioridad
  const sortRecommendations = (recommendations: Recommendation[]): Recommendation[] => {
    const priorityOrder: Record<Priority, number> = {
      high: 0,
      medium: 1,
      low: 2
    }
    
    return [...recommendations].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }
  
  // Obtener color según prioridad
  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }
  
  // Obtener icono según prioridad
  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return <ArrowRight className="h-4 w-4" />
      case 'medium':
        return <ArrowRight className="h-4 w-4" />
      case 'low':
        return <ArrowRight className="h-4 w-4" />
      default:
        return <ArrowRight className="h-4 w-4" />
    }
  }
  
  const recommendations = generateRecommendations()
  const filteredRecommendations = filterRecommendations(recommendations)
  const sortedRecommendations = sortRecommendations(filteredRecommendations)
  
  // Categorías de recomendaciones
  const categories = [
    { id: 'all', name: 'Todas', icon: <Lightbulb className="h-4 w-4" /> },
    { id: 'duration', name: 'Duración', icon: <Clock className="h-4 w-4" /> },
    { id: 'quality', name: 'Calidad', icon: <Moon className="h-4 w-4" /> },
    { id: 'consistency', name: 'Consistencia', icon: <Calendar className="h-4 w-4" /> },
    { id: 'habits', name: 'Hábitos', icon: <Coffee className="h-4 w-4" /> },
    { id: 'environment', name: 'Entorno', icon: <Thermometer className="h-4 w-4" /> },
    { id: 'routine', name: 'Rutina', icon: <Bed className="h-4 w-4" /> },
    { id: 'recovery', name: 'Recuperación', icon: <Zap className="h-4 w-4" /> }
  ]
  
  if (!stats || !latestEntry) {
    return (
      <Card3D>
        <Card3DContent className="flex flex-col items-center justify-center py-12">
          <Lightbulb className="h-16 w-16 text-primary/20 mb-4" />
          <h3 className="text-xl font-medium mb-2">No hay suficientes datos</h3>
          <p className="text-muted-foreground text-center mb-6">
            Necesitamos más registros de sueño para generar recomendaciones personalizadas
          </p>
        </Card3DContent>
      </Card3D>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Filtro de categorías */}
      <div className="flex overflow-x-auto pb-2 space-x-2">
        {categories.map(category => (
          <Button3D
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="whitespace-nowrap"
          >
            <div className="flex items-center">
              {category.icon}
              <span className="ml-1">{category.name}</span>
            </div>
          </Button3D>
        ))}
      </div>
      
      {/* Lista de recomendaciones */}
      <div className="space-y-4">
        {sortedRecommendations.length === 0 ? (
          <Card3D>
            <Card3DContent className="flex flex-col items-center justify-center py-8">
              <Check className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">¡Buen trabajo!</h3>
              <p className="text-muted-foreground text-center">
                No hay recomendaciones específicas en esta categoría
              </p>
            </Card3DContent>
          </Card3D>
        ) : (
          sortedRecommendations.map(recommendation => (
            <Card3D key={recommendation.id} className="border hover:border-primary/30 transition-colors">
              <Card3DContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${getPriorityColor(recommendation.priority)}`}>
                    {recommendation.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{recommendation.title}</h3>
                      <Badge 
                        variant="outline" 
                        className={getPriorityColor(recommendation.priority)}
                      >
                        {recommendation.priority === 'high' ? 'Alta' : 
                         recommendation.priority === 'medium' ? 'Media' : 'Baja'} prioridad
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {recommendation.description}
                    </p>
                  </div>
                </div>
              </Card3DContent>
            </Card3D>
          ))
        )}
      </div>
      
      {/* Resumen de sueño ideal */}
      <Card3D className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
        <Card3DHeader>
          <Card3DTitle className="text-indigo-900">Tu sueño ideal</Card3DTitle>
        </Card3DHeader>
        <Card3DContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-indigo-900">Horario óptimo</h4>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Sunset className="h-5 w-5 text-amber-600 mr-2" />
                  <div>
                    <div className="text-sm font-medium">Acostarse</div>
                    <div className="text-xs text-indigo-700">{goal?.targetBedtime || '22:30'}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Sunrise className="h-5 w-5 text-amber-600 mr-2" />
                  <div>
                    <div className="text-sm font-medium">Despertar</div>
                    <div className="text-xs text-indigo-700">{goal?.targetWakeTime || '06:30'}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span>Duración objetivo</span>
                  <span className="font-medium">
                    {goal ? (
                      `${Math.floor(goal.targetDuration / 60)}h ${goal.targetDuration % 60}m`
                    ) : (
                      '8h 00m'
                    )}
                  </span>
                </div>
                <Progress value={100} className="bg-indigo-200 h-2">
                  <div className="h-full bg-indigo-600 rounded-full"></div>
                </Progress>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-indigo-900">Distribución ideal</h4>
              
              <div className="h-6 w-full rounded-full overflow-hidden flex">
                <div 
                  className="bg-indigo-600" 
                  style={{ width: `${goal?.targetDeepSleepPercentage || 20}%` }}
                ></div>
                <div 
                  className="bg-blue-500" 
                  style={{ width: `${goal?.targetRemSleepPercentage || 25}%` }}
                ></div>
                <div 
                  className="bg-sky-400" 
                  style={{ width: `${100 - (goal?.targetDeepSleepPercentage || 20) - (goal?.targetRemSleepPercentage || 25)}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div>
                  <div>
                    <div className="text-xs font-medium">Sueño profundo</div>
                    <div className="text-xs text-indigo-700">{goal?.targetDeepSleepPercentage || 20}%</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <div>
                    <div className="text-xs font-medium">Sueño REM</div>
                    <div className="text-xs text-indigo-700">{goal?.targetRemSleepPercentage || 25}%</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-sky-400 rounded-full mr-2"></div>
                  <div>
                    <div className="text-xs font-medium">Sueño ligero</div>
                    <div className="text-xs text-indigo-700">
                      {100 - (goal?.targetDeepSleepPercentage || 20) - (goal?.targetRemSleepPercentage || 25)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card3DContent>
      </Card3D>
    </div>
  )
}

// Tipos
type Priority = 'high' | 'medium' | 'low'

interface Recommendation {
  id: string
  title: string
  description: string
  priority: Priority
  category: string
  icon: React.ReactNode
}
