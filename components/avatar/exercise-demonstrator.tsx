"use client"

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useAnimations, useGLTF, Html, Text } from '@react-three/drei'
import { Suspense } from 'react'
import { TrainerAvatar } from '@/lib/types/gamification'
import { useAuth } from '@/lib/contexts/auth-context'
import { getUserTrainerAvatar } from '@/lib/avatar-service'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Play, Pause, RotateCcw, Volume2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import * as THREE from 'three'

// Define the model path - this should be a path to your 3D model
const MODEL_PATH = '/models/trainer/trainer.glb'

// Exercise animations mapping
const EXERCISE_ANIMATIONS: Record<string, string> = {
  'squat': 'squat',
  'pushup': 'pushup',
  'lunge': 'lunge',
  'deadlift': 'deadlift',
  'bench_press': 'bench_press',
  'shoulder_press': 'shoulder_press',
  'bicep_curl': 'bicep_curl',
  'tricep_extension': 'tricep_extension',
  'plank': 'plank',
  'crunch': 'crunch',
  'jumping_jack': 'jumping_jack',
  'burpee': 'burpee'
}

// Exercise tips
const EXERCISE_TIPS: Record<string, string[]> = {
  'squat': [
    'Mantén la espalda recta',
    'Las rodillas no deben sobrepasar la punta de los pies',
    'Mantén el peso en los talones',
    'Baja hasta que los muslos estén paralelos al suelo'
  ],
  'pushup': [
    'Mantén el cuerpo en línea recta',
    'Los codos deben formar un ángulo de 45 grados con el cuerpo',
    'Baja hasta que el pecho casi toque el suelo',
    'Mantén el core activado'
  ],
  'lunge': [
    'Da un paso adelante y baja la cadera',
    'La rodilla delantera debe formar un ángulo de 90 grados',
    'La rodilla trasera debe casi tocar el suelo',
    'Mantén el torso erguido'
  ],
  'deadlift': [
    'Mantén la espalda recta',
    'Empuja con los talones',
    'Mantén la barra cerca del cuerpo',
    'Extiende las caderas y las rodillas simultáneamente'
  ]
}

// Import the fallback avatar
import { FallbackAvatar } from './fallback-avatar'

// Avatar model component with exercise demonstration
function AvatarModel({
  exercise = 'idle',
  playing = true,
  speed = 1,
  scale = 1.5,
  showSkeleton = false
}: {
  exercise?: string;
  playing?: boolean;
  speed?: number;
  scale?: number;
  showSkeleton?: boolean;
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
    const { actions, mixer } = useAnimations(animations, group)

    // Control animation playback
    useEffect(() => {
      // Get the animation name from the exercise
      const animationName = EXERCISE_ANIMATIONS[exercise] || 'idle'

      // Find the requested animation
      const currentAnimation = Object.keys(actions).find(name =>
        name.toLowerCase().includes(animationName.toLowerCase())
      ) || 'idle'

      // Play the animation
      const action = actions[currentAnimation]
      if (action) {
        action.reset().fadeIn(0.5).play()

        // Set playback speed
        action.setEffectiveTimeScale(speed)

        // Pause if not playing
        if (!playing) {
          action.paused = true
        } else {
          action.paused = false
        }
      } else {
        console.warn(`Animation "${animationName}" not found.`)
      }

      return () => {
        // Cleanup
        if (action) {
          action.fadeOut(0.5)
        }
      }
    }, [exercise, playing, speed, actions])

    // Update mixer on each frame
    useFrame((_, delta) => {
      if (playing && mixer) {
        mixer.update(delta)
      }
    })

    // Clone the scene to avoid modifying the cached original
    const model = scene.clone()

    return (
      <group ref={group} dispose={null} scale={[scale, scale, scale]}>
        <primitive object={model} />

        {/* Show skeleton helpers for debugging */}
        {showSkeleton && group.current && (
          <skeletonHelper args={[group.current]} />
        )}

        {/* Show exercise name */}
        <Text
          position={[0, 2, 0]}
          fontSize={0.1}
          color="#573353"
          anchorX="center"
          anchorY="middle"
        >
          {exercise.replace('_', ' ').toUpperCase()}
        </Text>
      </group>
    )
  } catch (error) {
    // If there's an error loading the model, use the fallback
    console.warn('Error loading 3D model, using fallback avatar:', error)

    // Set error state to prevent continuous retries
    useEffect(() => {
      if (!modelError) setModelError(true)
    }, [modelError])

    // Return the fallback avatar with exercise name
    return (
      <>
        <FallbackAvatar
          scale={scale}
          animation={playing ? exercise : 'idle'}
          color="#1B237E"
        />
        <Text
          position={[0, 2, 0]}
          fontSize={0.1}
          color="#573353"
          anchorX="center"
          anchorY="middle"
        >
          {exercise.replace('_', ' ').toUpperCase()}
        </Text>
      </>
    )
  }
}

// Main Exercise Demonstrator component
export function ExerciseDemonstrator({
  initialExercise = 'squat'
}: {
  initialExercise?: string;
}) {
  const [avatar, setAvatar] = useState<TrainerAvatar | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentExercise, setCurrentExercise] = useState(initialExercise)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
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
        console.log('No user available for exercise demonstrator, using default avatar')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log(`Loading avatar for exercise demonstrator (user ${user.id})...`)

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => {
            console.warn('Exercise demonstrator avatar loading timed out after 5 seconds')
            resolve(null)
          }, 5000)
        })

        // Race between actual loading and timeout
        const avatarData = await Promise.race([
          getUserTrainerAvatar(user.id),
          timeoutPromise
        ])

        if (!avatarData) {
          console.warn('Failed to load avatar data for exercise demonstrator within timeout')
          toast({
            title: 'Aviso',
            description: 'Usando configuración predeterminada para las demostraciones',
            variant: 'default'
          })
        } else {
          console.log('Exercise demonstrator avatar loaded successfully')
          setAvatar(avatarData)
        }
      } catch (error) {
        console.error('Error loading trainer avatar for exercise demonstrator:', error)
        toast({
          title: 'Aviso',
          description: 'Usando configuración predeterminada para las demostraciones',
          variant: 'default'
        })
      } finally {
        setLoading(false)
      }
    }

    loadAvatar()
  }, [user, toast])

  // Get exercise tips
  const exerciseTips = EXERCISE_TIPS[currentExercise] || []

  // Speak the current tip
  const speakTip = () => {
    if (!exerciseTips.length) return

    const tip = exerciseTips[currentTipIndex]
    const utterance = new SpeechSynthesisUtterance(tip)
    utterance.lang = 'es-ES'
    window.speechSynthesis.speak(utterance)
  }

  // Navigate through tips
  const nextTip = () => {
    if (currentTipIndex < exerciseTips.length - 1) {
      setCurrentTipIndex(currentTipIndex + 1)
    } else {
      setCurrentTipIndex(0)
    }
  }

  const prevTip = () => {
    if (currentTipIndex > 0) {
      setCurrentTipIndex(currentTipIndex - 1)
    } else {
      setCurrentTipIndex(exerciseTips.length - 1)
    }
  }

  // Change exercise
  const changeExercise = (exercise: string) => {
    setCurrentExercise(exercise)
    setCurrentTipIndex(0)
    setPlaying(true)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Cargando demostración...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
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
            <CardTitle className="text-lg font-medium">Demostración de Ejercicios</CardTitle>
            <CardDescription>
              Observa la técnica correcta
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
                  exercise={currentExercise}
                  playing={playing}
                  speed={speed}
                />
              </Suspense>
              <OrbitControls
                enableZoom={false}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2}
              />
            </Canvas>
          </div>

          {/* Exercise tips */}
          {exerciseTips.length > 0 && (
            <div className="bg-[#F9F9F9] p-3 rounded-lg w-full mb-4 relative min-h-[80px] flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2"
                onClick={prevTip}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <p className="text-sm text-center mx-10">{exerciseTips[currentTipIndex]}</p>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={nextTip}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={speakTip}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Playback controls */}
          <div className="flex w-full space-x-2 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPlaying(!playing)}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setPlaying(true)
                setSpeed(1)
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <div className="flex-1 px-2">
              <Slider
                value={[speed]}
                min={0.5}
                max={1.5}
                step={0.1}
                onValueChange={(value) => setSpeed(value[0])}
              />
            </div>

            <div className="w-10 text-center">
              {speed.toFixed(1)}x
            </div>
          </div>

          {/* Exercise selection */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {Object.keys(EXERCISE_ANIMATIONS).slice(0, 6).map((exercise) => (
              <Button
                key={exercise}
                variant={currentExercise === exercise ? "default" : "outline"}
                className="text-xs"
                onClick={() => changeExercise(exercise)}
              >
                {exercise.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
