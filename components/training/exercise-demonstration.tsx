"use client"

import { useState, useEffect } from "react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Maximize2,
  Volume2,
  VolumeX,
  Info,
  ChevronRight,
  ChevronLeft,
  Dumbbell,
  Lightbulb,
  AlertTriangle
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface ExerciseDemonstrationProps {
  exerciseId?: string
  techniqueId?: string
}

export function ExerciseDemonstration({
  exerciseId,
  techniqueId
}: ExerciseDemonstrationProps) {
  const [activeTab, setActiveTab] = useState("exercises")
  const [selectedExercise, setSelectedExercise] = useState("bench-press")
  const [selectedTechnique, setSelectedTechnique] = useState("drop-set")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [totalFrames, setTotalFrames] = useState(10)
  // Exercise and technique data will be loaded from the database

  // Get current exercise
  const currentExercise = exercises.find(ex => ex.id === selectedExercise)

  // Get current technique
  const currentTechnique = techniques.find(tech => tech.id === selectedTechnique)

  // Simulate animation playback
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame(prev => {
          if (prev >= totalFrames - 1) {
            return 0
          }
          return prev + 1
        })
      }, 200)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, totalFrames])

  // Handle play/pause
  const togglePlayback = () => {
    setIsPlaying(prev => !prev)
  }

  // Handle next frame
  const nextFrame = () => {
    setIsPlaying(false)
    setCurrentFrame(prev => (prev >= totalFrames - 1 ? 0 : prev + 1))
  }

  // Handle previous frame
  const prevFrame = () => {
    setIsPlaying(false)
    setCurrentFrame(prev => (prev <= 0 ? totalFrames - 1 : prev - 1))
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500"
      case "intermediate":
        return "bg-yellow-500"
      case "advanced":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <Card3D>
      <Card3DHeader>
        <Card3DTitle gradient={true}>Demostraciones Avanzadas</Card3DTitle>
      </Card3DHeader>
      <Card3DContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="exercises">Ejercicios</TabsTrigger>
            <TabsTrigger value="techniques">Técnicas Avanzadas</TabsTrigger>
          </TabsList>

          <TabsContent value="exercises" className="space-y-4">
            <div className="flex flex-col space-y-4">
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ejercicio" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map(exercise => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {currentExercise && (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Placeholder for exercise animation/video */}
                      <div className="relative w-full h-full">
                        <Image
                          src={`/images/exercises/${selectedExercise}-${currentFrame}.jpg`}
                          alt={currentExercise.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // Fallback image if the specific frame doesn't exist
                            const target = e.target as HTMLImageElement
                            target.src = "/images/exercises/placeholder.jpg"
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                          {currentExercise.name} - Frame {currentFrame + 1}/{totalFrames}
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                      <Button3D size="icon" variant="secondary" onClick={prevFrame}>
                        <SkipBack className="h-4 w-4" />
                      </Button3D>
                      <Button3D size="icon" variant="secondary" onClick={togglePlayback}>
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button3D>
                      <Button3D size="icon" variant="secondary" onClick={nextFrame}>
                        <SkipForward className="h-4 w-4" />
                      </Button3D>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{currentExercise.name}</h3>
                      <Badge className={getDifficultyColor(currentExercise.difficulty)}>
                        {currentExercise.difficulty === "beginner" ? "Principiante" :
                         currentExercise.difficulty === "intermediate" ? "Intermedio" : "Avanzado"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {currentExercise.category === "compound" ? "Compuesto" : "Aislamiento"}
                      </Badge>
                      <Badge variant="outline">
                        {currentExercise.muscleGroup === "chest" ? "Pecho" :
                         currentExercise.muscleGroup === "back" ? "Espalda" :
                         currentExercise.muscleGroup === "legs" ? "Piernas" :
                         currentExercise.muscleGroup === "shoulders" ? "Hombros" : "Brazos"}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-medium">Ejecución Correcta</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-start">
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>Mantén los omóplatos retraídos y el pecho elevado</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>Baja la barra de forma controlada hasta rozar el pecho</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>Empuja a través de los pies para generar tensión en todo el cuerpo</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Errores Comunes</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>Levantar las caderas del banco durante la ejecución</span>
                        </li>
                        <li className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>Rebotar la barra en el pecho</span>
                        </li>
                        <li className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>No bloquear los codos en la parte superior del movimiento</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="techniques" className="space-y-4">
            <div className="flex flex-col space-y-4">
              <Select value={selectedTechnique} onValueChange={setSelectedTechnique}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar técnica" />
                </SelectTrigger>
                <SelectContent>
                  {techniques.map(technique => (
                    <SelectItem key={technique.id} value={technique.id}>
                      {technique.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {currentTechnique && (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Placeholder for technique animation/video */}
                      <div className="relative w-full h-full">
                        <Image
                          src={`/images/techniques/${selectedTechnique}-${currentFrame}.jpg`}
                          alt={currentTechnique.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // Fallback image if the specific frame doesn't exist
                            const target = e.target as HTMLImageElement
                            target.src = "/images/techniques/placeholder.jpg"
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                          {currentTechnique.name} - Frame {currentFrame + 1}/{totalFrames}
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                      <Button3D size="icon" variant="secondary" onClick={prevFrame}>
                        <SkipBack className="h-4 w-4" />
                      </Button3D>
                      <Button3D size="icon" variant="secondary" onClick={togglePlayback}>
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button3D>
                      <Button3D size="icon" variant="secondary" onClick={nextFrame}>
                        <SkipForward className="h-4 w-4" />
                      </Button3D>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{currentTechnique.name}</h3>
                      <Badge className={getDifficultyColor(currentTechnique.difficulty)}>
                        {currentTechnique.difficulty === "beginner" ? "Principiante" :
                         currentTechnique.difficulty === "intermediate" ? "Intermedio" : "Avanzado"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {currentTechnique.category === "intensity" ? "Intensidad" : "Eficiencia"}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-medium">Implementación</h4>
                      <p className="text-sm">
                        {selectedTechnique === "drop-set" &&
                          "Realiza una serie hasta el fallo muscular, reduce el peso en un 20-30% y continúa inmediatamente hasta el fallo nuevamente. Puedes realizar 2-3 reducciones de peso."}
                        {selectedTechnique === "rest-pause" &&
                          "Realiza una serie hasta el fallo muscular, descansa 10-15 segundos y continúa con el mismo peso hasta el fallo nuevamente. Repite 2-3 veces."}
                        {selectedTechnique === "super-set" &&
                          "Realiza dos ejercicios consecutivos sin descanso entre ellos. Puedes combinar ejercicios para el mismo grupo muscular o para grupos musculares antagonistas."}
                        {selectedTechnique === "mechanical-drop-set" &&
                          "Realiza un ejercicio hasta el fallo y cambia inmediatamente a una variante mecánicamente más ventajosa del mismo ejercicio."}
                        {selectedTechnique === "partial-reps" &&
                          "Después de alcanzar el fallo muscular con repeticiones completas, continúa con repeticiones parciales en el rango de movimiento donde eres más fuerte."}
                        {selectedTechnique === "3-7-method" &&
                          "Realiza 5 mini-series de 3 repeticiones con 15 segundos de descanso entre ellas, seguidas de una serie de 7 repeticiones hasta el fallo."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Beneficios</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-start">
                          <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>Aumenta el tiempo bajo tensión y el estrés metabólico</span>
                        </li>
                        <li className="flex items-start">
                          <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>Recluta un mayor número de fibras musculares</span>
                        </li>
                        <li className="flex items-start">
                          <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>Aumenta la producción de hormonas anabólicas</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Precauciones</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>Limita el uso a 1-2 ejercicios por sesión para evitar sobreentrenamiento</span>
                        </li>
                        <li className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>No utilices esta técnica en cada sesión de entrenamiento</span>
                        </li>
                        <li className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>Asegúrate de tener una buena base de fuerza antes de implementarla</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card3DContent>
    </Card3D>
  )
}
