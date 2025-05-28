"use client"

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useAnimations, useGLTF } from '@react-three/drei'
import { Suspense } from 'react'
import { TrainerAvatar } from '@/lib/types/gamification'
import { useAuth } from '@/lib/contexts/auth-context'
import { getUserTrainerAvatar } from '@/lib/avatar-service'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Mic, Volume2, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import * as THREE from 'three'

// Define the model path - this should be a path to your 3D model
const MODEL_PATH = '/models/trainer/trainer.glb'

// Import the fallback avatar
import { FallbackAvatar } from './fallback-avatar'

// Avatar model component
function AvatarModel({
  animation = 'idle',
  onAnimationComplete,
  scale = 1.5
}: {
  animation?: string;
  onAnimationComplete?: () => void;
  scale?: number;
}) {
  const group = useRef<THREE.Group>(null)
  const [modelError, setModelError] = useState(false)
  const { camera } = useThree()

  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 1, 2)
  }, [camera])

  // Use try-catch with ErrorBoundary pattern for GLTF loading
  try {
    const { scene, animations } = useGLTF(MODEL_PATH)
    const { actions, names } = useAnimations(animations, group)

    // Play animation when it changes
    useEffect(() => {
      // Reset all animations
      Object.values(actions).forEach(action => action?.stop())

      // Find the requested animation
      const currentAnimation = names.find(name =>
        name.toLowerCase().includes(animation.toLowerCase())
      ) || 'idle'

      // Play the animation
      const action = actions[currentAnimation]
      if (action) {
        action.reset().fadeIn(0.5).play()

        // Handle animation completion
        if (onAnimationComplete && !action.loop) {
          const duration = action.getClip().duration
          const timeoutId = setTimeout(() => {
            onAnimationComplete()
          }, duration * 1000)

          return () => clearTimeout(timeoutId)
        }
      } else {
        console.warn(`Animation "${animation}" not found. Available animations:`, names)
      }
    }, [animation, actions, names, onAnimationComplete])

    // Clone the scene to avoid modifying the cached original
    const model = scene.clone()

    return (
      <group ref={group} dispose={null} scale={[scale, scale, scale]}>
        <primitive object={model} />
      </group>
    )
  } catch (error) {
    // If there's an error loading the model, use the fallback
    console.warn('Error loading 3D model, using fallback avatar:', error)

    // Set error state to prevent continuous retries
    useEffect(() => {
      if (!modelError) setModelError(true)
    }, [modelError])

    // Return the fallback avatar
    return (
      <FallbackAvatar
        scale={scale}
        animation={animation}
        onAnimationComplete={onAnimationComplete}
      />
    )
  }
}

// Main 3D Avatar component
export function ThreeDAvatar() {
  const [avatar, setAvatar] = useState<TrainerAvatar | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentAnimation, setCurrentAnimation] = useState('idle')
  const [message, setMessage] = useState('')
  const [currentPhrase, setCurrentPhrase] = useState('')
  const { user } = useAuth()
  const { toast } = useToast()

  // Preload the model
  useEffect(() => {
    // Preload the 3D model
    useGLTF.preload(MODEL_PATH)
  }, [])

  // Load avatar data with enhanced error handling
  useEffect(() => {
    async function loadAvatar() {
      if (!user) {
        console.log('No user available, using default avatar')
        // Create a temporary avatar for non-authenticated users
        const tempAvatar: TrainerAvatar = {
          id: 'temp-avatar',
          name: 'Entrenador',
          customization: {
            bodyType: 'athletic',
            hairStyle: 'short',
            hairColor: 'brown',
            skinTone: 'medium',
            facialFeatures: 'neutral',
            outfit: 'athletic',
            accessories: []
          },
          personality: 'motivational',
          specialization: 'general',
          phrases: {
            greeting: [
              '¡Hola! Soy tu entrenador virtual. Inicia sesión para personalizar tu experiencia.',
              'Bienvenido a Routinize. Inicia sesión para acceder a todas las funciones.'
            ],
            encouragement: [
              '¡Vamos a entrenar juntos!',
              'La constancia es clave para el éxito.'
            ],
            milestone: [
              '¡Cada paso cuenta!',
              'El progreso comienza con decisiones pequeñas.'
            ],
            workout: [
              'Mantén una buena postura durante los ejercicios.',
              'Recuerda respirar correctamente durante el entrenamiento.'
            ]
          },
          animation: {
            idle: 'avatar_idle',
            demonstrating: 'avatar_demo',
            celebrating: 'avatar_celebrate',
            guiding: 'avatar_guide'
          }
        }
        setAvatar(tempAvatar)

        // Show a greeting
        setCurrentPhrase(tempAvatar.phrases.greeting[0])
        setCurrentAnimation('greeting')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log(`Loading avatar for user ${user.id}...`)

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => {
            console.warn('Avatar loading timed out after 5 seconds')
            resolve(null)
          }, 5000)
        })

        // Race between actual loading and timeout
        const avatarData = await Promise.race([
          getUserTrainerAvatar(user.id),
          timeoutPromise
        ])

        if (!avatarData) {
          console.warn('Failed to load avatar data within timeout, using fallback')
          toast({
            title: 'Aviso',
            description: 'Usando avatar predeterminado debido a problemas de conexión',
            variant: 'default'
          })
          // The getUserTrainerAvatar function should have returned a default avatar
          // but we'll check again just to be safe
          const fallbackAvatar = await getUserTrainerAvatar(user.id)
          setAvatar(fallbackAvatar)
        } else {
          console.log('Avatar loaded successfully')
          setAvatar(avatarData)
        }

        // Show a random greeting if we have avatar data
        const finalAvatar = avatarData || await getUserTrainerAvatar(user.id)
        if (finalAvatar?.phrases?.greeting?.length) {
          const randomIndex = Math.floor(Math.random() * finalAvatar.phrases.greeting.length)
          setCurrentPhrase(finalAvatar.phrases.greeting[randomIndex])
          setCurrentAnimation('greeting')
        }
      } catch (error) {
        console.error('Error loading trainer avatar:', error)
        toast({
          title: 'Aviso',
          description: 'Usando avatar predeterminado debido a un error',
          variant: 'default'
        })

        // Try one more time with error handling disabled
        try {
          const fallbackAvatar = await getUserTrainerAvatar(user.id)
          setAvatar(fallbackAvatar)
        } catch (fallbackError) {
          console.error('Critical error loading avatar:', fallbackError)
        }
      } finally {
        setLoading(false)
      }
    }

    loadAvatar()
  }, [user, toast])

  // Handle sending a message to the avatar
  const handleSendMessage = () => {
    if (!message.trim() || !avatar) return

    // Simple keyword matching for responses
    let responseCategory: keyof TrainerAvatar['phrases'] = 'greeting'
    let animationType = 'idle'

    if (message.toLowerCase().includes('ejercicio') ||
        message.toLowerCase().includes('entrenamiento') ||
        message.toLowerCase().includes('rutina')) {
      responseCategory = 'workout'
      animationType = 'demonstrating'
    } else if (message.toLowerCase().includes('logro') ||
               message.toLowerCase().includes('conseguido') ||
               message.toLowerCase().includes('completado')) {
      responseCategory = 'milestone'
      animationType = 'celebrating'
    } else {
      responseCategory = 'encouragement'
      animationType = 'guiding'
    }

    // Get a random phrase from the category
    if (avatar.phrases[responseCategory].length) {
      const randomIndex = Math.floor(Math.random() * avatar.phrases[responseCategory].length)
      setCurrentPhrase(avatar.phrases[responseCategory][randomIndex])
      setCurrentAnimation(animationType)
    }

    setMessage('')
  }

  // Handle animation completion
  const handleAnimationComplete = () => {
    setCurrentAnimation('idle')
  }

  // Speak the current phrase
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
          <div className="h-64 flex items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
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
          <div className="h-64 flex items-center justify-center">
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
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="flex flex-col items-center">
          {/* 3D Avatar */}
          <div className="w-full h-64 bg-gradient-to-b from-[#F9F9F9] to-[#F5F5F5] rounded-lg mb-4">
            <Canvas shadows>
              <ambientLight intensity={0.5} />
              <directionalLight
                position={[5, 5, 5]}
                intensity={1}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <Suspense fallback={null}>
                <AvatarModel
                  animation={currentAnimation}
                  onAnimationComplete={handleAnimationComplete}
                />
              </Suspense>
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 2}
              />
            </Canvas>
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
