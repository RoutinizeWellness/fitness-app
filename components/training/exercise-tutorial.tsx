"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrganicSection } from "@/components/organic-layout"
import { OrganicElement } from "@/components/transitions/organic-transitions"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Info,
  AlertTriangle,
  CheckCircle,
  Dumbbell,
  Target,
  Flame
} from "lucide-react"

type ExerciseTutorialProps = {
  exercise: {
    id: string
    name: string
    description: string
    gifUrl: string
    videoUrl?: string
    muscleGroups: string[]
    difficulty: "beginner" | "intermediate" | "advanced"
    equipment: string[]
    instructions: string[]
    tips: string[]
    commonMistakes: string[]
    alternatives: {
      id: string
      name: string
      difficulty: "beginner" | "intermediate" | "advanced"
    }[]
  }
}

export function ExerciseTutorial({ exercise }: ExerciseTutorialProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState("instructions")
  
  // Función para reproducir/pausar el video
  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
    
    // Aquí iría la lógica para controlar el video si se usa un reproductor de video
    const video = document.getElementById("exercise-video") as HTMLVideoElement
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
    }
  }
  
  return (
    <Card organic={true} className="overflow-hidden">
      <div className="p-6">
        <OrganicSection title={exercise.name}>
          <div className="space-y-6">
            {/* Demostración del ejercicio */}
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
              <div className="aspect-video flex items-center justify-center">
                {exercise.videoUrl ? (
                  <video
                    id="exercise-video"
                    src={exercise.videoUrl}
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <Image
                    src={exercise.gifUrl}
                    alt={exercise.name}
                    width={400}
                    height={300}
                    className="max-h-[300px] object-contain"
                  />
                )}
              </div>
              
              {exercise.videoUrl && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="bg-black/60 backdrop-blur-sm rounded-full flex items-center p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-white hover:bg-white/20 rounded-full"
                      onClick={() => {/* Lógica para retroceder */}}
                    >
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-white hover:bg-white/20 rounded-full"
                      onClick={togglePlayback}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-white hover:bg-white/20 rounded-full"
                      onClick={() => {/* Lógica para avanzar */}}
                    >
                      <SkipForward className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Información básica */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                <div className="flex flex-col items-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mb-2">
                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Grupos musculares</p>
                  <p className="text-sm font-medium text-center">{exercise.muscleGroups.join(", ")}</p>
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl">
                <div className="flex flex-col items-center">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mb-2">
                    <Dumbbell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Equipamiento</p>
                  <p className="text-sm font-medium text-center">{exercise.equipment.join(", ")}</p>
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl">
                <div className="flex flex-col items-center">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full mb-2">
                    <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Dificultad</p>
                  <p className="text-sm font-medium capitalize">{exercise.difficulty}</p>
                </div>
              </div>
            </div>
            
            {/* Descripción */}
            <div>
              <p className="text-gray-600 dark:text-gray-300">{exercise.description}</p>
            </div>
            
            {/* Pestañas con información detallada */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid grid-cols-3 rounded-full p-1">
                <TabsTrigger value="instructions" className="rounded-full">
                  <Info className="h-4 w-4 mr-2" />
                  <span>Instrucciones</span>
                </TabsTrigger>
                <TabsTrigger value="tips" className="rounded-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Consejos</span>
                </TabsTrigger>
                <TabsTrigger value="mistakes" className="rounded-full">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>Errores comunes</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="instructions" className="mt-4">
                <OrganicElement type="fade">
                  <div className="space-y-4">
                    <h3 className="font-medium">Cómo realizar el ejercicio</h3>
                    <ol className="space-y-3">
                      {exercise.instructions.map((instruction, index) => (
                        <li key={index} className="flex">
                          <span className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-gray-600 dark:text-gray-300">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </OrganicElement>
              </TabsContent>
              
              <TabsContent value="tips" className="mt-4">
                <OrganicElement type="fade">
                  <div className="space-y-4">
                    <h3 className="font-medium">Consejos para maximizar resultados</h3>
                    <ul className="space-y-3">
                      {exercise.tips.map((tip, index) => (
                        <li key={index} className="flex">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </OrganicElement>
              </TabsContent>
              
              <TabsContent value="mistakes" className="mt-4">
                <OrganicElement type="fade">
                  <div className="space-y-4">
                    <h3 className="font-medium">Errores comunes a evitar</h3>
                    <ul className="space-y-3">
                      {exercise.commonMistakes.map((mistake, index) => (
                        <li key={index} className="flex">
                          <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300">{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </OrganicElement>
              </TabsContent>
            </Tabs>
            
            {/* Ejercicios alternativos */}
            {exercise.alternatives && exercise.alternatives.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Ejercicios alternativos</h3>
                <div className="grid grid-cols-2 gap-3">
                  {exercise.alternatives.map((alt) => (
                    <Button
                      key={alt.id}
                      variant="outline"
                      className="justify-start rounded-xl h-auto py-3"
                    >
                      <div className="flex flex-col items-start">
                        <span>{alt.name}</span>
                        <span className="text-xs text-gray-500 capitalize">{alt.difficulty}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </OrganicSection>
      </div>
    </Card>
  )
}
