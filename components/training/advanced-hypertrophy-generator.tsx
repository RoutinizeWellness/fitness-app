"use client"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { 
  Dumbbell, 
  Calendar, 
  BarChart, 
  Clock, 
  ArrowRight, 
  Check, 
  Info,
  Save,
  X
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { Exercise } from "@/lib/supabase"
import { WorkoutRoutine, WorkoutRoutineExercise } from "@/lib/workout-routines"

// Tipos para la configuración de hipertrofia
interface HypertrophyConfig {
  programType: "ppl" | "upperLower" | "fullBody" | "bodyPart"
  trainingLevel: "beginner" | "intermediate" | "advanced"
  frequency: number // 3-6 días por semana
  duration: number // 4-16 semanas
  includeDeload: boolean
  deloadFrequency: number // Cada cuántas semanas (3-6)
  volumePreference: "low" | "moderate" | "high"
  intensityPreference: "low" | "moderate" | "high"
  restPeriods: "short" | "moderate" | "long"
  specialTechniques: {
    dropSets: boolean
    superSets: boolean
    restPause: boolean
    giantSets: boolean
    myo: boolean // Entrenamiento de reps parciales para hipertrofia miofibrilar
    sarcoplasmic: boolean // Entrenamiento de alto volumen para hipertrofia sarcoplasmática
  }
  focusAreas: string[] // Grupos musculares prioritarios
}

// Constantes para configuración de hipertrofia
const DEFAULT_HYPERTROPHY_CONFIG: HypertrophyConfig = {
  programType: "ppl",
  trainingLevel: "intermediate",
  frequency: 4,
  duration: 8,
  includeDeload: true,
  deloadFrequency: 4,
  volumePreference: "moderate",
  intensityPreference: "moderate",
  restPeriods: "moderate",
  specialTechniques: {
    dropSets: false,
    superSets: true,
    restPause: false,
    giantSets: false,
    myo: true,
    sarcoplasmic: true
  },
  focusAreas: []
}

// Constantes para configuración de ejercicios
const EXERCISE_CONFIGS = {
  beginner: {
    setsPerExercise: { min: 2, max: 3 },
    exercisesPerMuscleGroup: { min: 1, max: 2 },
    repRanges: {
      compound: "8-12",
      isolation: "10-15"
    },
    restPeriods: {
      short: 60,
      moderate: 90,
      long: 120
    },
    rirRanges: {
      compound: 2,
      isolation: 1
    }
  },
  intermediate: {
    setsPerExercise: { min: 3, max: 4 },
    exercisesPerMuscleGroup: { min: 2, max: 3 },
    repRanges: {
      compound: "6-10",
      isolation: "8-15"
    },
    restPeriods: {
      short: 45,
      moderate: 75,
      long: 120
    },
    rirRanges: {
      compound: 1,
      isolation: 1
    }
  },
  advanced: {
    setsPerExercise: { min: 3, max: 5 },
    exercisesPerMuscleGroup: { min: 2, max: 4 },
    repRanges: {
      compound: "4-12",
      isolation: "8-20"
    },
    restPeriods: {
      short: 30,
      moderate: 60,
      long: 120
    },
    rirRanges: {
      compound: 0,
      isolation: 0
    }
  }
}

// Constantes para volumen semanal por grupo muscular
const VOLUME_CONFIGS = {
  low: {
    chest: { sets: "8-10", frequency: 1 },
    back: { sets: "8-10", frequency: 1 },
    legs: { sets: "8-10", frequency: 1 },
    shoulders: { sets: "6-8", frequency: 1 },
    arms: { sets: "6-8", frequency: 1 },
    core: { sets: "4-6", frequency: 1 }
  },
  moderate: {
    chest: { sets: "12-16", frequency: 2 },
    back: { sets: "12-16", frequency: 2 },
    legs: { sets: "12-16", frequency: 2 },
    shoulders: { sets: "8-12", frequency: 2 },
    arms: { sets: "8-12", frequency: 2 },
    core: { sets: "6-8", frequency: 2 }
  },
  high: {
    chest: { sets: "18-22", frequency: 3 },
    back: { sets: "18-22", frequency: 3 },
    legs: { sets: "18-22", frequency: 3 },
    shoulders: { sets: "12-16", frequency: 3 },
    arms: { sets: "12-16", frequency: 3 },
    core: { sets: "8-12", frequency: 3 }
  }
}

interface AdvancedHypertrophyGeneratorProps {
  availableExercises: Exercise[]
  userId: string
  onSave: (routine: WorkoutRoutine) => void
  onCancel: () => void
}

export function AdvancedHypertrophyGenerator({
  availableExercises,
  userId,
  onSave,
  onCancel
}: AdvancedHypertrophyGeneratorProps) {
  const { toast } = useToast()
  const [config, setConfig] = useState<HypertrophyConfig>(DEFAULT_HYPERTROPHY_CONFIG)
  const [currentStep, setCurrentStep] = useState(1)
  const [generatedRoutine, setGeneratedRoutine] = useState<WorkoutRoutine | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Función para actualizar la configuración
  const updateConfig = (key: keyof HypertrophyConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }
  
  // Función para actualizar técnicas especiales
  const updateSpecialTechnique = (technique: keyof HypertrophyConfig["specialTechniques"], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      specialTechniques: {
        ...prev.specialTechniques,
        [technique]: value
      }
    }))
  }
  
  // Función para generar la rutina
  const generateRoutine = () => {
    setIsGenerating(true)
    
    // Simular tiempo de generación
    setTimeout(() => {
      try {
        // Aquí iría la lógica real de generación basada en los principios de hipertrofia
        // Por ahora, crearemos una rutina de ejemplo basada en la configuración
        
        const routine: WorkoutRoutine = {
          id: uuidv4(),
          user_id: userId,
          name: `Rutina de Hipertrofia ${config.programType.toUpperCase()}`,
          description: `Rutina avanzada de hipertrofia con enfoque en ${config.focusAreas.join(", ") || "desarrollo muscular general"}. Incluye técnicas especiales como ${Object.entries(config.specialTechniques)
            .filter(([_, value]) => value)
            .map(([key]) => key)
            .join(", ")}.`,
          level: config.trainingLevel,
          is_template: false,
          exercises: generateExercisesForRoutine(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        setGeneratedRoutine(routine)
        setIsGenerating(false)
        
        toast({
          title: "Rutina generada",
          description: "Se ha creado una rutina avanzada de hipertrofia según tus preferencias",
        })
      } catch (error) {
        console.error("Error al generar rutina:", error)
        setIsGenerating(false)
        
        toast({
          title: "Error",
          description: "No se pudo generar la rutina",
          variant: "destructive"
        })
      }
    }, 2000)
  }
  
  // Función para generar ejercicios para la rutina
  const generateExercisesForRoutine = (): WorkoutRoutineExercise[] => {
    // Esta es una implementación simplificada
    // En una implementación real, se generarían ejercicios basados en la configuración
    // y se distribuirían según el tipo de programa (PPL, Upper/Lower, etc.)
    
    const exercises: WorkoutRoutineExercise[] = []
    
    // Filtrar ejercicios disponibles por grupo muscular
    const chestExercises = availableExercises.filter(e => e.muscle_group === "chest")
    const backExercises = availableExercises.filter(e => e.muscle_group === "back")
    const legsExercises = availableExercises.filter(e => e.muscle_group === "legs")
    const shouldersExercises = availableExercises.filter(e => e.muscle_group === "shoulders")
    const armsExercises = availableExercises.filter(e => e.muscle_group === "arms")
    
    // Añadir ejercicios según el tipo de programa
    if (config.programType === "ppl") {
      // Día de pecho
      if (chestExercises.length > 0) {
        exercises.push({
          exercise_id: chestExercises[0].id,
          sets: 4,
          reps: "8-10",
          rest: 90,
          exercise: chestExercises[0]
        })
      }
      
      // Día de espalda
      if (backExercises.length > 0) {
        exercises.push({
          exercise_id: backExercises[0].id,
          sets: 4,
          reps: "8-10",
          rest: 90,
          exercise: backExercises[0]
        })
      }
      
      // Día de piernas
      if (legsExercises.length > 0) {
        exercises.push({
          exercise_id: legsExercises[0].id,
          sets: 4,
          reps: "8-12",
          rest: 120,
          exercise: legsExercises[0]
        })
      }
    }
    
    return exercises
  }
  
  // Función para guardar la rutina
  const handleSave = () => {
    if (generatedRoutine) {
      onSave(generatedRoutine)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Generador de Rutinas Avanzadas de Hipertrofia</h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {!generatedRoutine ? (
        <Tabs value={`step-${currentStep}`} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="step-1" onClick={() => setCurrentStep(1)}>
              Configuración Básica
            </TabsTrigger>
            <TabsTrigger value="step-2" onClick={() => setCurrentStep(2)}>
              Volumen y Técnicas
            </TabsTrigger>
            <TabsTrigger value="step-3" onClick={() => setCurrentStep(3)}>
              Áreas de Enfoque
            </TabsTrigger>
          </TabsList>
          
          {/* Paso 1: Configuración Básica */}
          <TabsContent value="step-1" className="space-y-4">
            {/* Contenido del paso 1 */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración Básica</CardTitle>
                <CardDescription>
                  Configura los parámetros fundamentales de tu rutina de hipertrofia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tipo de programa */}
                <div className="space-y-2">
                  <Label>Tipo de Programa</Label>
                  <Select
                    value={config.programType}
                    onValueChange={(value: any) => updateConfig("programType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo de programa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ppl">Push-Pull-Legs (PPL)</SelectItem>
                      <SelectItem value="upperLower">Upper-Lower</SelectItem>
                      <SelectItem value="fullBody">Full Body</SelectItem>
                      <SelectItem value="bodyPart">Body Part Split</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Nivel de entrenamiento */}
                <div className="space-y-2">
                  <Label>Nivel de Entrenamiento</Label>
                  <Select
                    value={config.trainingLevel}
                    onValueChange={(value: any) => updateConfig("trainingLevel", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Frecuencia semanal */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Frecuencia Semanal</Label>
                    <span className="text-sm text-gray-500">{config.frequency} días/semana</span>
                  </div>
                  <Slider
                    value={[config.frequency]}
                    min={3}
                    max={6}
                    step={1}
                    onValueChange={(value) => updateConfig("frequency", value[0])}
                  />
                </div>
                
                {/* Duración del programa */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Duración del Programa</Label>
                    <span className="text-sm text-gray-500">{config.duration} semanas</span>
                  </div>
                  <Slider
                    value={[config.duration]}
                    min={4}
                    max={16}
                    step={4}
                    onValueChange={(value) => updateConfig("duration", value[0])}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => setCurrentStep(2)}>
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Paso 2: Volumen y Técnicas */}
          <TabsContent value="step-2" className="space-y-4">
            {/* Contenido del paso 2 */}
            <Card>
              <CardHeader>
                <CardTitle>Volumen y Técnicas Especiales</CardTitle>
                <CardDescription>
                  Configura el volumen de entrenamiento y las técnicas avanzadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preferencia de volumen */}
                <div className="space-y-2">
                  <Label>Preferencia de Volumen</Label>
                  <RadioGroup
                    value={config.volumePreference}
                    onValueChange={(value: any) => updateConfig("volumePreference", value)}
                    className="flex space-x-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="volume-low" />
                      <Label htmlFor="volume-low">Bajo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="moderate" id="volume-moderate" />
                      <Label htmlFor="volume-moderate">Moderado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="volume-high" />
                      <Label htmlFor="volume-high">Alto</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Preferencia de intensidad */}
                <div className="space-y-2">
                  <Label>Preferencia de Intensidad</Label>
                  <RadioGroup
                    value={config.intensityPreference}
                    onValueChange={(value: any) => updateConfig("intensityPreference", value)}
                    className="flex space-x-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="intensity-low" />
                      <Label htmlFor="intensity-low">Baja</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="moderate" id="intensity-moderate" />
                      <Label htmlFor="intensity-moderate">Moderada</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="intensity-high" />
                      <Label htmlFor="intensity-high">Alta</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Períodos de descanso */}
                <div className="space-y-2">
                  <Label>Períodos de Descanso</Label>
                  <RadioGroup
                    value={config.restPeriods}
                    onValueChange={(value: any) => updateConfig("restPeriods", value)}
                    className="flex space-x-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="short" id="rest-short" />
                      <Label htmlFor="rest-short">Cortos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="moderate" id="rest-moderate" />
                      <Label htmlFor="rest-moderate">Moderados</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="long" id="rest-long" />
                      <Label htmlFor="rest-long">Largos</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Técnicas especiales */}
                <div className="space-y-2">
                  <Label>Técnicas Especiales</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="dropsets"
                        checked={config.specialTechniques.dropSets}
                        onChange={(e) => updateSpecialTechnique("dropSets", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="dropsets">Drop Sets</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="supersets"
                        checked={config.specialTechniques.superSets}
                        onChange={(e) => updateSpecialTechnique("superSets", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="supersets">Super Sets</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="restpause"
                        checked={config.specialTechniques.restPause}
                        onChange={(e) => updateSpecialTechnique("restPause", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="restpause">Rest-Pause</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="giantsets"
                        checked={config.specialTechniques.giantSets}
                        onChange={(e) => updateSpecialTechnique("giantSets", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="giantsets">Giant Sets</Label>
                    </div>
                  </div>
                </div>
                
                {/* Incluir deload */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includedeload"
                      checked={config.includeDeload}
                      onChange={(e) => updateConfig("includeDeload", e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="includedeload">Incluir Semanas de Descarga (Deload)</Label>
                  </div>
                  
                  {config.includeDeload && (
                    <div className="pl-6 space-y-2">
                      <div className="flex justify-between">
                        <Label>Frecuencia de Deload</Label>
                        <span className="text-sm text-gray-500">Cada {config.deloadFrequency} semanas</span>
                      </div>
                      <Slider
                        value={[config.deloadFrequency]}
                        min={3}
                        max={6}
                        step={1}
                        onValueChange={(value) => updateConfig("deloadFrequency", value[0])}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Anterior
                </Button>
                <Button onClick={() => setCurrentStep(3)}>
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Paso 3: Áreas de Enfoque */}
          <TabsContent value="step-3" className="space-y-4">
            {/* Contenido del paso 3 */}
            <Card>
              <CardHeader>
                <CardTitle>Áreas de Enfoque</CardTitle>
                <CardDescription>
                  Selecciona los grupos musculares en los que quieres enfocarte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {["chest", "back", "legs", "shoulders", "arms", "core"].map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`focus-${area}`}
                        checked={config.focusAreas.includes(area)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateConfig("focusAreas", [...config.focusAreas, area])
                          } else {
                            updateConfig("focusAreas", config.focusAreas.filter(a => a !== area))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`focus-${area}`} className="capitalize">{area}</Label>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4">
                  <p className="text-sm text-gray-500">
                    Nota: Si no seleccionas ningún área de enfoque, se creará una rutina equilibrada para todos los grupos musculares.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Anterior
                </Button>
                <Button onClick={generateRoutine} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Dumbbell className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Dumbbell className="mr-2 h-4 w-4" />
                      Generar Rutina
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Rutina Generada</CardTitle>
            <CardDescription>
              Se ha generado una rutina avanzada de hipertrofia según tus preferencias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Detalles de la Rutina</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium">{generatedRoutine.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="font-medium capitalize">{config.programType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nivel</p>
                  <p className="font-medium capitalize">{config.trainingLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duración</p>
                  <p className="font-medium">{config.duration} semanas</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="font-medium">Ejercicios</h3>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {generatedRoutine.exercises.map((exercise, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{exercise.exercise?.name || `Ejercicio ${index + 1}`}</p>
                          <p className="text-sm text-gray-500">
                            {exercise.sets} series × {exercise.reps} reps • {exercise.rest}s descanso
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {exercise.exercise?.muscle_group || "Grupo muscular"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setGeneratedRoutine(null)}>
              Volver a Editar
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Guardar Rutina
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
