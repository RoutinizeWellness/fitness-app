"use client"

import { useState, useEffect } from 'react'
import { TrainerAvatar } from '@/lib/types/gamification'
import { useAuth } from '@/lib/contexts/auth-context'
import { getUserTrainerAvatar, trainAvatarPhrases } from '@/lib/avatar-service'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Brain, MessageSquare, Dumbbell, Lightbulb, Sparkles } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

// Mock data for AI intelligence features
const MOCK_KNOWLEDGE_BASE = {
  exerciseCount: 120,
  nutritionTipsCount: 85,
  recoveryTechniquesCount: 42,
  phrasesCount: 156
}

const MOCK_LEARNING_PROGRESS = {
  exerciseRecognition: 78,
  conversationalAbility: 65,
  personalizedRecommendations: 82,
  formCorrection: 70
}

const MOCK_RECENT_LEARNINGS = [
  { id: 1, type: 'exercise', name: 'Sentadilla Búlgara', date: '2023-06-15' },
  { id: 2, type: 'nutrition', name: 'Macronutrientes post-entrenamiento', date: '2023-06-12' },
  { id: 3, type: 'phrase', name: 'Frases motivacionales', date: '2023-06-10' },
  { id: 4, type: 'exercise', name: 'Press de banca inclinado', date: '2023-06-08' }
]

// Main Avatar Intelligence component
export function AvatarIntelligence() {
  const [avatar, setAvatar] = useState<TrainerAvatar | null>(null)
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)
  const [newPhrases, setNewPhrases] = useState('')
  const [phraseCategory, setPhraseCategory] = useState<keyof TrainerAvatar['phrases']>('greeting')
  const [aiSettings, setAiSettings] = useState({
    personalizedGreetings: true,
    exerciseRecommendations: true,
    formCorrection: true,
    adaptiveResponses: true,
    voiceInteraction: true,
    learningRate: 70
  })
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Load avatar data
  useEffect(() => {
    async function loadAvatar() {
      if (!user) return
      
      try {
        setLoading(true)
        const avatarData = await getUserTrainerAvatar(user.id)
        setAvatar(avatarData)
      } catch (error) {
        console.error('Error loading trainer avatar:', error)
        toast({
          title: 'Error',
          description: 'No se pudo cargar el avatar del entrenador',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadAvatar()
  }, [user, toast])
  
  // Train the avatar with new phrases
  const handleTrainAvatar = async () => {
    if (!user || !avatar || !newPhrases.trim()) return
    
    try {
      setTraining(true)
      
      // Split phrases by new line
      const phrases = newPhrases
        .split('\n')
        .map(phrase => phrase.trim())
        .filter(phrase => phrase.length > 0)
      
      if (phrases.length === 0) {
        toast({
          title: 'Error',
          description: 'Por favor, introduce al menos una frase',
          variant: 'destructive'
        })
        return
      }
      
      const success = await trainAvatarPhrases(user.id, phraseCategory, phrases)
      
      if (success) {
        toast({
          title: 'Entrenamiento completado',
          description: `Se han añadido ${phrases.length} frases nuevas a tu entrenador`,
        })
        
        // Update local avatar data
        setAvatar(prev => {
          if (!prev) return null
          
          return {
            ...prev,
            phrases: {
              ...prev.phrases,
              [phraseCategory]: [...prev.phrases[phraseCategory], ...phrases]
            }
          }
        })
        
        setNewPhrases('')
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron añadir las frases',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error training avatar:', error)
      toast({
        title: 'Error',
        description: 'Ocurrió un error al entrenar el avatar',
        variant: 'destructive'
      })
    } finally {
      setTraining(false)
    }
  }
  
  // Update AI settings
  const updateAiSetting = (key: keyof typeof aiSettings, value: any) => {
    setAiSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }
  
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Cargando inteligencia del avatar...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FDA758]"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (!avatar) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Inteligencia del Avatar</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-sm text-[#573353]/70">No se pudo cargar el avatar</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium">Inteligencia del Entrenador</CardTitle>
            <CardDescription>
              Entrena y personaliza la inteligencia de tu entrenador virtual
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Entrenamiento</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Conocimiento</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Dumbbell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Ajustes</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* AI Intelligence Overview */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Base de Conocimiento</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Ejercicios</span>
                        <span>{MOCK_KNOWLEDGE_BASE.exerciseCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Consejos nutricionales</span>
                        <span>{MOCK_KNOWLEDGE_BASE.nutritionTipsCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Técnicas de recuperación</span>
                        <span>{MOCK_KNOWLEDGE_BASE.recoveryTechniquesCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Frases</span>
                        <span>{MOCK_KNOWLEDGE_BASE.phrasesCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Capacidades de IA</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Reconocimiento de ejercicios</span>
                          <span>{MOCK_LEARNING_PROGRESS.exerciseRecognition}%</span>
                        </div>
                        <Progress value={MOCK_LEARNING_PROGRESS.exerciseRecognition} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Capacidad conversacional</span>
                          <span>{MOCK_LEARNING_PROGRESS.conversationalAbility}%</span>
                        </div>
                        <Progress value={MOCK_LEARNING_PROGRESS.conversationalAbility} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Recomendaciones personalizadas</span>
                          <span>{MOCK_LEARNING_PROGRESS.personalizedRecommendations}%</span>
                        </div>
                        <Progress value={MOCK_LEARNING_PROGRESS.personalizedRecommendations} className="h-1.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recent Learnings */}
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Aprendizajes Recientes</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    {MOCK_RECENT_LEARNINGS.map(learning => (
                      <div key={learning.id} className="flex justify-between items-center">
                        <div className="flex items-center">
                          {learning.type === 'exercise' && <Dumbbell className="h-4 w-4 mr-2 text-blue-500" />}
                          {learning.type === 'nutrition' && <Lightbulb className="h-4 w-4 mr-2 text-green-500" />}
                          {learning.type === 'phrase' && <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />}
                          <span className="text-sm">{learning.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(learning.date).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="training">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium">Entrenar con Frases</CardTitle>
                <CardDescription>
                  Añade nuevas frases para personalizar tu entrenador virtual
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Categoría de frases</Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <Button
                        variant={phraseCategory === 'greeting' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPhraseCategory('greeting')}
                        className="justify-start"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Saludos
                      </Button>
                      <Button
                        variant={phraseCategory === 'encouragement' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPhraseCategory('encouragement')}
                        className="justify-start"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Ánimos
                      </Button>
                      <Button
                        variant={phraseCategory === 'milestone' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPhraseCategory('milestone')}
                        className="justify-start"
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Logros
                      </Button>
                      <Button
                        variant={phraseCategory === 'workout' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPhraseCategory('workout')}
                        className="justify-start"
                      >
                        <Dumbbell className="h-4 w-4 mr-2" />
                        Ejercicios
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Nuevas frases</Label>
                    <Textarea
                      placeholder="Escribe cada frase en una línea nueva"
                      value={newPhrases}
                      onChange={(e) => setNewPhrases(e.target.value)}
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Escribe frases naturales que tu entrenador pueda usar durante las sesiones.
                    </p>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Frases actuales</Label>
                    <ScrollArea className="h-32 border rounded-md p-2">
                      <div className="space-y-1">
                        {avatar.phrases[phraseCategory].map((phrase, index) => (
                          <div key={index} className="text-sm p-1 hover:bg-muted rounded">
                            {phrase}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-4 py-3 flex justify-end">
                <Button
                  onClick={handleTrainAvatar}
                  disabled={training || !newPhrases.trim()}
                >
                  {training ? 'Entrenando...' : 'Entrenar Avatar'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="knowledge">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium">Base de Conocimiento</CardTitle>
                <CardDescription>
                  Información que tu entrenador virtual conoce
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Ejercicios</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Card className="p-3">
                        <div className="flex items-center">
                          <Dumbbell className="h-5 w-5 mr-2 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">Ejercicios de fuerza</p>
                            <p className="text-xs text-muted-foreground">45 ejercicios</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-3">
                        <div className="flex items-center">
                          <Dumbbell className="h-5 w-5 mr-2 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">Ejercicios de cardio</p>
                            <p className="text-xs text-muted-foreground">28 ejercicios</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-3">
                        <div className="flex items-center">
                          <Dumbbell className="h-5 w-5 mr-2 text-purple-500" />
                          <div>
                            <p className="text-sm font-medium">Ejercicios de flexibilidad</p>
                            <p className="text-xs text-muted-foreground">32 ejercicios</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-3">
                        <div className="flex items-center">
                          <Dumbbell className="h-5 w-5 mr-2 text-orange-500" />
                          <div>
                            <p className="text-sm font-medium">Ejercicios de equilibrio</p>
                            <p className="text-xs text-muted-foreground">15 ejercicios</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Nutrición y Recuperación</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Card className="p-3">
                        <div className="flex items-center">
                          <Lightbulb className="h-5 w-5 mr-2 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">Consejos nutricionales</p>
                            <p className="text-xs text-muted-foreground">85 consejos</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-3">
                        <div className="flex items-center">
                          <Lightbulb className="h-5 w-5 mr-2 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">Técnicas de recuperación</p>
                            <p className="text-xs text-muted-foreground">42 técnicas</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium">Configuración de IA</CardTitle>
                <CardDescription>
                  Personaliza el comportamiento inteligente de tu entrenador
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Saludos personalizados</Label>
                      <p className="text-xs text-muted-foreground">
                        Saludos basados en la hora del día y tu progreso
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.personalizedGreetings}
                      onCheckedChange={(checked) => updateAiSetting('personalizedGreetings', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Recomendaciones de ejercicios</Label>
                      <p className="text-xs text-muted-foreground">
                        Sugerencias basadas en tu perfil y objetivos
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.exerciseRecommendations}
                      onCheckedChange={(checked) => updateAiSetting('exerciseRecommendations', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Corrección de forma</Label>
                      <p className="text-xs text-muted-foreground">
                        Feedback sobre tu técnica durante los ejercicios
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.formCorrection}
                      onCheckedChange={(checked) => updateAiSetting('formCorrection', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Respuestas adaptativas</Label>
                      <p className="text-xs text-muted-foreground">
                        Ajustes basados en tu nivel de energía y recuperación
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.adaptiveResponses}
                      onCheckedChange={(checked) => updateAiSetting('adaptiveResponses', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Interacción por voz</Label>
                      <p className="text-xs text-muted-foreground">
                        Comunicación mediante reconocimiento y síntesis de voz
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.voiceInteraction}
                      onCheckedChange={(checked) => updateAiSetting('voiceInteraction', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Velocidad de aprendizaje</Label>
                      <span className="text-sm">{aiSettings.learningRate}%</span>
                    </div>
                    <Slider
                      value={[aiSettings.learningRate]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={(value) => updateAiSetting('learningRate', value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Controla qué tan rápido tu entrenador adapta su comportamiento a tus preferencias
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-4 py-3 flex justify-end">
                <Button>
                  Guardar configuración
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
