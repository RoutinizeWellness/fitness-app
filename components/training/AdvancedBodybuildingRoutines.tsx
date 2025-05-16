"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import {
  Dumbbell, Calendar, Filter, Plus,
  ChevronRight, BarChart3, Settings,
  Clock, Zap, Award, Flame,
  ArrowRight, Check, X, Info,
  Loader2, Save, RefreshCw, Layers,
  BarChart4, Repeat, Gauge, Brain,
  Droplets, Lightbulb, Sparkles
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Progress3D } from "@/components/ui/progress-3d"
import { WorkoutRoutine, WorkoutDay, ExerciseSet, Exercise } from "@/lib/types/training"
import { saveWorkoutRoutine } from "@/lib/supabase-training"
import {
  TrainingLevel,
  TrainingGoal,
  TrainingSplit,
  getOptimalVolume,
  getRecommendedRest,
  getRecommendedDeload,
  ADVANCED_TECHNIQUES,
  getRecommendedTechniques,
  getExerciseVariants,
  PROGRESSION_METHODS,
  MesocycleStructure,
  MESOCYCLE_STRUCTURES,
  getRecommendedMesocycle,
  calculateMesocycleVolume,
  generateMesocyclePlan,
  EXTENDED_TECHNIQUES,
  getExtendedTechniques
} from "@/lib/bodybuilding-science"
import {
  SPANISH_MESOCYCLE_CONFIGS,
  SPANISH_ADVANCED_TECHNIQUES,
  getRecommendedMesocycle as getSpanishMesocycle,
  getRecommendedLongTermPlan,
  LONG_TERM_PERIODIZATION_MODELS
} from "@/lib/spanish-training-science"
import { MesocycleProgressVisualization } from "@/components/training/mesocycle-progress-visualization"
import { FatigueManagementSystem } from "@/components/training/fatigue-management-system"

interface AdvancedBodybuildingRoutinesProps {
  userId: string
  availableExercises: Exercise[]
  onSave: (routine: WorkoutRoutine) => void
  onCancel: () => void
}

export function AdvancedBodybuildingRoutines({
  userId,
  availableExercises,
  onSave,
  onCancel
}: AdvancedBodybuildingRoutinesProps) {
  // Estado para la configuración de la rutina
  const [name, setName] = useState("Rutina de Hipertrofia Avanzada")
  const [description, setDescription] = useState("Basada en principios científicos de hipertrofia")
  const [level, setLevel] = useState<TrainingLevel>("intermediate")
  const [goal, setGoal] = useState<TrainingGoal>("hypertrophy")
  const [split, setSplit] = useState<TrainingSplit>("ppl")
  const [frequency, setFrequency] = useState(5)
  const [duration, setDuration] = useState(8) // Duración en semanas
  const [includeDeload, setIncludeDeload] = useState(true)
  const [deloadFrequency, setDeloadFrequency] = useState(4) // Cada cuántas semanas hacer deload
  const [deloadType, setDeloadType] = useState<string>("volume") // Tipo de deload

  // Estado para técnicas avanzadas
  const [useAdvancedTechniques, setUseAdvancedTechniques] = useState(true)
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([])
  const [selectedSpanishTechniques, setSelectedSpanishTechniques] = useState<string[]>([])

  // Estado para variantes de ejercicios
  const [useExerciseVariants, setUseExerciseVariants] = useState(true)
  const [useExerciseAlternatives, setUseExerciseAlternatives] = useState(true)

  // Estado para periodización
  const [usePeriodization, setUsePeriodization] = useState(true)
  const [periodizationType, setPeriodizationType] = useState("undulating")
  const [selectedMesocycle, setSelectedMesocycle] = useState<string>("Hipertrofia Estándar")

  // Estado para planificación a largo plazo
  const [useLongTermPlan, setUseLongTermPlan] = useState(false)
  const [selectedLongTermPlan, setSelectedLongTermPlan] = useState("")

  // Estado para RIR y gestión de fatiga
  const [useRirTracking, setUseRirTracking] = useState(true)
  const [useFatigueManagement, setUseFatigueManagement] = useState(true)

  // Estado para la generación de la rutina
  const [activeTab, setActiveTab] = useState("config")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedRoutine, setGeneratedRoutine] = useState<WorkoutRoutine | null>(null)

  // Cargar técnicas recomendadas al cambiar el nivel o objetivo
  useEffect(() => {
    // Obtener técnicas recomendadas según el nivel y objetivo
    const recommendedTechniques = ADVANCED_TECHNIQUES
      .filter(technique =>
        technique.applicableGoals.includes(goal) &&
        (level !== "beginner" || technique.fatigueImpact < 6)
      )
      .map(technique => technique.name);

    // Seleccionar automáticamente algunas técnicas recomendadas
    setSelectedTechniques(recommendedTechniques.slice(0, 3));

    // Seleccionar técnicas españolas recomendadas
    const spanishTechniques = SPANISH_ADVANCED_TECHNIQUES
      .filter(technique =>
        technique.recommendedPhase.includes(goal === "hypertrophy" ? "hipertrofia" : "fuerza") &&
        (level !== "beginner" || technique.fatigueImpact < 6)
      )
      .map(technique => technique.name);

    setSelectedSpanishTechniques(spanishTechniques.slice(0, 2));

    // Configurar mesociclo recomendado
    const mesocycle = getRecommendedMesocycle(level, goal);
    setSelectedMesocycle(mesocycle.name);

    // Configurar deload según recomendaciones
    const deload = getRecommendedDeload(level, goal);
    setDeloadType(deload.type);

    // Configurar plan a largo plazo recomendado
    if (LONG_TERM_PERIODIZATION_MODELS.length > 0) {
      const recommendedPlan = getRecommendedLongTermPlan(level, goal === "hypertrophy" ? "hipertrofia" : "fuerza");
      setSelectedLongTermPlan(recommendedPlan?.name || LONG_TERM_PERIODIZATION_MODELS[0].name);
    }
  }, [level, goal]);

  // Ajustar frecuencia según el split seleccionado
  useEffect(() => {
    switch (split) {
      case "ppl":
        setFrequency(Math.min(frequency, 6));
        break;
      case "upper_lower":
        setFrequency(Math.min(frequency, 4));
        break;
      case "full_body":
        setFrequency(Math.min(frequency, 4));
        break;
      case "body_part":
        setFrequency(Math.min(frequency, 5));
        break;
      case "push_pull":
        setFrequency(Math.min(frequency, 4));
        break;
    }
  }, [split]);

  // Generar la rutina
  const generateRoutine = () => {
    setIsGenerating(true);
    setActiveTab("preview");

    // Simular tiempo de generación
    setTimeout(() => {
      try {
        // Crear la rutina según la configuración
        const routine = usePeriodization
          ? generateMesocyclePlan(userId, level, goal, split, frequency, includeDeload)
          : createAdvancedRoutine();

        setGeneratedRoutine(routine);

        toast({
          title: "Rutina generada",
          description: "Se ha creado una rutina avanzada de entrenamiento",
        });
      } catch (error) {
        console.error("Error al generar rutina:", error);
        toast({
          title: "Error",
          description: "No se pudo generar la rutina",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    }, 2000);
  };

  // Guardar la rutina
  const saveRoutine = async () => {
    if (!generatedRoutine) return;

    try {
      // Guardar la rutina en Supabase
      const { data, error } = await saveWorkoutRoutine(generatedRoutine);

      if (error) throw error;

      toast({
        title: "Rutina guardada",
        description: "La rutina se ha guardado correctamente",
      });

      // Llamar al callback de guardado
      onSave(generatedRoutine);
    } catch (error) {
      console.error("Error al guardar rutina:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la rutina",
        variant: "destructive",
      });
    }
  };

  // Crear una rutina avanzada personalizada
  const createAdvancedRoutine = (): WorkoutRoutine => {
    // Implementación de la creación de rutina avanzada
    // (Esta función se completará en la siguiente parte)

    // Por ahora, devolvemos una rutina básica
    return {
      id: uuidv4(),
      userId,
      name,
      description,
      days: [],
      frequency,
      goal,
      level,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      startDate: new Date().toISOString(),
      includesDeload,
      deloadFrequency,
      source: "Advanced Bodybuilding",
      tags: [level, goal, split],
      split
    };
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rutinas Avanzadas de Culturismo</h1>
        <Button3D variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button3D>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Layers className="h-4 w-4 mr-2" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="preview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Vista Previa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <ConfigurationTab
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            level={level}
            setLevel={setLevel}
            goal={goal}
            setGoal={setGoal}
            split={split}
            setSplit={setSplit}
            frequency={frequency}
            setFrequency={setFrequency}
            duration={duration}
            setDuration={setDuration}
            includeDeload={includeDeload}
            setIncludeDeload={setIncludeDeload}
            deloadFrequency={deloadFrequency}
            setDeloadFrequency={setDeloadFrequency}
            deloadType={deloadType}
            setDeloadType={setDeloadType}
            useAdvancedTechniques={useAdvancedTechniques}
            setUseAdvancedTechniques={setUseAdvancedTechniques}
            selectedTechniques={selectedTechniques}
            setSelectedTechniques={setSelectedTechniques}
            selectedSpanishTechniques={selectedSpanishTechniques}
            setSelectedSpanishTechniques={setSelectedSpanishTechniques}
            useExerciseVariants={useExerciseVariants}
            setUseExerciseVariants={setUseExerciseVariants}
            useExerciseAlternatives={useExerciseAlternatives}
            setUseExerciseAlternatives={setUseExerciseAlternatives}
            usePeriodization={usePeriodization}
            setUsePeriodization={setUsePeriodization}
            periodizationType={periodizationType}
            setPeriodizationType={setPeriodizationType}
            selectedMesocycle={selectedMesocycle}
            setSelectedMesocycle={setSelectedMesocycle}
            useLongTermPlan={useLongTermPlan}
            setUseLongTermPlan={setUseLongTermPlan}
            selectedLongTermPlan={selectedLongTermPlan}
            setSelectedLongTermPlan={setSelectedLongTermPlan}
            useRirTracking={useRirTracking}
            setUseRirTracking={setUseRirTracking}
            useFatigueManagement={useFatigueManagement}
            setUseFatigueManagement={setUseFatigueManagement}
            generateRoutine={generateRoutine}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TemplatesTab
            level={level}
            goal={goal}
            setSelectedMesocycle={setSelectedMesocycle}
            setSplit={setSplit}
            setFrequency={setFrequency}
            setDuration={setDuration}
            setIncludeDeload={setIncludeDeload}
            setDeloadFrequency={setDeloadFrequency}
            setActiveTab={setActiveTab}
            generateRoutine={generateRoutine}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <PreviewTab
            isGenerating={isGenerating}
            generatedRoutine={generatedRoutine}
            saveRoutine={saveRoutine}
            level={level}
            goal={goal}
            split={split}
            frequency={frequency}
            includeDeload={includeDeload}
            deloadFrequency={deloadFrequency}
            usePeriodization={usePeriodization}
            selectedMesocycle={selectedMesocycle}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componentes auxiliares para las pestañas
interface ConfigurationTabProps {
  // Propiedades para la configuración
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  level: TrainingLevel;
  setLevel: (value: TrainingLevel) => void;
  goal: TrainingGoal;
  setGoal: (value: TrainingGoal) => void;
  split: TrainingSplit;
  setSplit: (value: TrainingSplit) => void;
  frequency: number;
  setFrequency: (value: number) => void;
  duration: number;
  setDuration: (value: number) => void;
  includeDeload: boolean;
  setIncludeDeload: (value: boolean) => void;
  deloadFrequency: number;
  setDeloadFrequency: (value: number) => void;
  deloadType: string;
  setDeloadType: (value: string) => void;
  useAdvancedTechniques: boolean;
  setUseAdvancedTechniques: (value: boolean) => void;
  selectedTechniques: string[];
  setSelectedTechniques: (value: string[]) => void;
  selectedSpanishTechniques: string[];
  setSelectedSpanishTechniques: (value: string[]) => void;
  useExerciseVariants: boolean;
  setUseExerciseVariants: (value: boolean) => void;
  useExerciseAlternatives: boolean;
  setUseExerciseAlternatives: (value: boolean) => void;
  usePeriodization: boolean;
  setUsePeriodization: (value: boolean) => void;
  periodizationType: string;
  setPeriodizationType: (value: string) => void;
  selectedMesocycle: string;
  setSelectedMesocycle: (value: string) => void;
  useLongTermPlan: boolean;
  setUseLongTermPlan: (value: boolean) => void;
  selectedLongTermPlan: string;
  setSelectedLongTermPlan: (value: string) => void;
  useRirTracking: boolean;
  setUseRirTracking: (value: boolean) => void;
  useFatigueManagement: boolean;
  setUseFatigueManagement: (value: boolean) => void;
  generateRoutine: () => void;
}

// Importar las implementaciones de los componentes
import { ConfigurationTab } from "./AdvancedBodybuildingRoutinesImpl";
import { TemplatesTab, PreviewTab } from "./AdvancedBodybuildingRoutinesImpl2";
