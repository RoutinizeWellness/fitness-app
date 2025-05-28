"use client"

import { useState, useEffect, useRef } from 'react'
import { getUserTrainerAvatar, trainAvatarPhrases } from '@/lib/avatar-service'
import { TrainerAvatar as TrainerAvatarType } from '@/lib/types/gamification'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { Bot, Mic, Send, Volume2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function TrainerAvatar() {
  const [avatar, setAvatar] = useState<TrainerAvatarType | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [currentPhrase, setCurrentPhrase] = useState('')
  const [isTraining, setIsTraining] = useState(false)
  const [newPhrases, setNewPhrases] = useState('')
  const [phraseCategory, setPhraseCategory] = useState<keyof TrainerAvatarType['phrases']>('greeting')
  const { user } = useAuth()
  const { toast } = useToast()
  const avatarContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadAvatar() {
      if (!user) return

      try {
        setLoading(true)
        const avatarData = await getUserTrainerAvatar(user.id)
        setAvatar(avatarData)
        
        // Show a random greeting
        if (avatarData?.phrases.greeting.length) {
          const randomIndex = Math.floor(Math.random() * avatarData.phrases.greeting.length)
          setCurrentPhrase(avatarData.phrases.greeting[randomIndex])
        }
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

  const handleSendMessage = () => {
    if (!message.trim() || !avatar) return

    // Simple keyword matching for responses
    let responseCategory: keyof TrainerAvatarType['phrases'] = 'greeting'
    
    if (message.toLowerCase().includes('ejercicio') || 
        message.toLowerCase().includes('entrenamiento') ||
        message.toLowerCase().includes('rutina')) {
      responseCategory = 'workout'
    } else if (message.toLowerCase().includes('logro') || 
               message.toLowerCase().includes('conseguido') ||
               message.toLowerCase().includes('completado')) {
      responseCategory = 'milestone'
    } else {
      responseCategory = 'encouragement'
    }

    // Get a random phrase from the category
    if (avatar.phrases[responseCategory].length) {
      const randomIndex = Math.floor(Math.random() * avatar.phrases[responseCategory].length)
      setCurrentPhrase(avatar.phrases[responseCategory][randomIndex])
    }

    setMessage('')
  }

  const handleTrainAvatar = async () => {
    if (!user || !avatar || !newPhrases.trim()) return

    try {
      setIsTraining(true)
      
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
      setIsTraining(false)
    }
  }

  const speakPhrase = () => {
    if (!currentPhrase) return
    
    // Use the Web Speech API to speak the phrase
    const utterance = new SpeechSynthesisUtterance(currentPhrase)
    utterance.lang = 'es-ES'
    window.speechSynthesis.speak(utterance)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Cargando entrenador...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
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
          <CardTitle className="text-lg font-medium">Entrenador Personal</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm text-[#573353]/70">No se pudo cargar el entrenador</p>
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
            <CardTitle className="text-lg font-medium">{avatar.name}</CardTitle>
            <CardDescription>
              {avatar.personality === 'motivational' ? 'Motivador' : 
               avatar.personality === 'technical' ? 'Técnico' :
               avatar.personality === 'supportive' ? 'Apoyo' : 'Desafiante'}
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Bot className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Entrenar a {avatar.name}</DialogTitle>
                <DialogDescription>
                  Añade nuevas frases para personalizar tu entrenador virtual.
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="greeting">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger 
                    value="greeting" 
                    onClick={() => setPhraseCategory('greeting')}
                  >
                    Saludos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="encouragement" 
                    onClick={() => setPhraseCategory('encouragement')}
                  >
                    Ánimos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="milestone" 
                    onClick={() => setPhraseCategory('milestone')}
                  >
                    Logros
                  </TabsTrigger>
                  <TabsTrigger 
                    value="workout" 
                    onClick={() => setPhraseCategory('workout')}
                  >
                    Ejercicios
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="greeting" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Frases que el entrenador dirá al saludar.
                  </p>
                  <Textarea
                    placeholder="Escribe cada frase en una línea nueva"
                    value={newPhrases}
                    onChange={(e) => setNewPhrases(e.target.value)}
                    rows={5}
                  />
                </TabsContent>
                
                <TabsContent value="encouragement" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Frases motivadoras durante el entrenamiento.
                  </p>
                  <Textarea
                    placeholder="Escribe cada frase en una línea nueva"
                    value={newPhrases}
                    onChange={(e) => setNewPhrases(e.target.value)}
                    rows={5}
                  />
                </TabsContent>
                
                <TabsContent value="milestone" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Frases para celebrar logros y hitos.
                  </p>
                  <Textarea
                    placeholder="Escribe cada frase en una línea nueva"
                    value={newPhrases}
                    onChange={(e) => setNewPhrases(e.target.value)}
                    rows={5}
                  />
                </TabsContent>
                
                <TabsContent value="workout" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Consejos técnicos sobre ejercicios.
                  </p>
                  <Textarea
                    placeholder="Escribe cada frase en una línea nueva"
                    value={newPhrases}
                    onChange={(e) => setNewPhrases(e.target.value)}
                    rows={5}
                  />
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button 
                  onClick={handleTrainAvatar} 
                  disabled={isTraining || !newPhrases.trim()}
                >
                  {isTraining ? 'Entrenando...' : 'Entrenar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="flex flex-col items-center">
          {/* 3D Avatar Placeholder - In a real implementation, this would be a 3D model */}
          <div 
            ref={avatarContainerRef}
            className="w-full h-48 bg-gradient-to-b from-[#F9F9F9] to-[#F5F5F5] rounded-lg mb-4 flex items-center justify-center relative"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="/images/trainer-avatar-placeholder.png" 
                alt="Entrenador virtual" 
                className="h-40 object-contain"
              />
            </div>
          </div>
          
          {currentPhrase && (
            <div className="bg-[#F9F9F9] p-3 rounded-lg w-full mb-4 relative">
              <p className="text-sm">{currentPhrase}</p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-2"
                onClick={speakPhrase}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="flex w-full space-x-2">
            <Button variant="outline" size="icon">
              <Mic className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Escribe un mensaje a tu entrenador..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button 
              variant="default" 
              size="icon"
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
