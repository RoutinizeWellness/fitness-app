import { TrainingLevel, TrainingGoal, TrainingSplit, MuscleGroup, WorkoutRoutine } from "@/lib/types/training";
import { Dumbbell, Calendar, BarChart3, Gauge, Layers, Sparkles, Brain, RefreshCw, Lightbulb, Droplets, Check, Info, Loader2, Save, Zap, X } from "lucide-react";
import { Card3D, Card3DHeader, Card3DContent, Card3DTitle } from "@/components/ui/card-3d";
import { Button3D } from "@/components/ui/button-3d";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MesocycleProgressVisualization } from "@/components/training/mesocycle-progress-visualization";
import { FatigueManagementSystem } from "@/components/training/fatigue-management-system";
import { MESOCYCLE_STRUCTURES, EXTENDED_TECHNIQUES } from "@/lib/bodybuilding-science";
import { SPANISH_ADVANCED_TECHNIQUES, LONG_TERM_PERIODIZATION_MODELS } from "@/lib/spanish-training-science";

// Interfaces para las props de los componentes
export interface ConfigurationTabProps {
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

export interface TemplatesTabProps {
  level: TrainingLevel;
  goal: TrainingGoal;
  setSelectedMesocycle: (value: string) => void;
  setSplit: (value: TrainingSplit) => void;
  setFrequency: (value: number) => void;
  setDuration: (value: number) => void;
  setIncludeDeload: (value: boolean) => void;
  setDeloadFrequency: (value: number) => void;
  setActiveTab: (value: string) => void;
  generateRoutine: () => void;
}

export interface PreviewTabProps {
  isGenerating: boolean;
  generatedRoutine: WorkoutRoutine | null;
  saveRoutine: () => void;
  level: TrainingLevel;
  goal: TrainingGoal;
  split: TrainingSplit;
  frequency: number;
  includeDeload: boolean;
  deloadFrequency: number;
  usePeriodization: boolean;
  selectedMesocycle: string;
}

// Implementación del componente ConfigurationTab
export function ConfigurationTab({
  name,
  setName,
  description,
  setDescription,
  level,
  setLevel,
  goal,
  setGoal,
  split,
  setSplit,
  frequency,
  setFrequency,
  duration,
  setDuration,
  includeDeload,
  setIncludeDeload,
  deloadFrequency,
  setDeloadFrequency,
  deloadType,
  setDeloadType,
  useAdvancedTechniques,
  setUseAdvancedTechniques,
  selectedTechniques,
  setSelectedTechniques,
  selectedSpanishTechniques,
  setSelectedSpanishTechniques,
  useExerciseVariants,
  setUseExerciseVariants,
  useExerciseAlternatives,
  setUseExerciseAlternatives,
  usePeriodization,
  setUsePeriodization,
  periodizationType,
  setPeriodizationType,
  selectedMesocycle,
  setSelectedMesocycle,
  useLongTermPlan,
  setUseLongTermPlan,
  selectedLongTermPlan,
  setSelectedLongTermPlan,
  useRirTracking,
  setUseRirTracking,
  useFatigueManagement,
  setUseFatigueManagement,
  generateRoutine
}: ConfigurationTabProps) {
  return (
    <>
      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Información Básica</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la rutina</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la rutina"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción breve"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Nivel de entrenamiento</Label>
              <Select value={level} onValueChange={(value) => setLevel(value as TrainingLevel)}>
                <SelectTrigger id="level">
                  <SelectValue placeholder="Selecciona nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Objetivo principal</Label>
              <Select value={goal} onValueChange={(value) => setGoal(value as TrainingGoal)}>
                <SelectTrigger id="goal">
                  <SelectValue placeholder="Selecciona objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hypertrophy">Hipertrofia</SelectItem>
                  <SelectItem value="strength">Fuerza</SelectItem>
                  <SelectItem value="power">Potencia</SelectItem>
                  <SelectItem value="endurance">Resistencia</SelectItem>
                  <SelectItem value="weight_loss">Pérdida de peso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card3DContent>
      </Card3D>

      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Estructura de Entrenamiento</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="split">División de entrenamiento</Label>
              <Select value={split} onValueChange={(value) => setSplit(value as TrainingSplit)}>
                <SelectTrigger id="split">
                  <SelectValue placeholder="Selecciona división" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ppl">Push/Pull/Legs (PPL)</SelectItem>
                  <SelectItem value="upper_lower">Upper/Lower</SelectItem>
                  <SelectItem value="full_body">Full Body</SelectItem>
                  <SelectItem value="body_part">Body Part</SelectItem>
                  <SelectItem value="push_pull">Push/Pull</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frecuencia semanal</Label>
              <Select value={frequency.toString()} onValueChange={(value) => setFrequency(parseInt(value))}>
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Selecciona frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 días/semana</SelectItem>
                  <SelectItem value="4">4 días/semana</SelectItem>
                  <SelectItem value="5">5 días/semana</SelectItem>
                  <SelectItem value="6">6 días/semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duración (semanas)</Label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Selecciona duración" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 semanas</SelectItem>
                  <SelectItem value="6">6 semanas</SelectItem>
                  <SelectItem value="8">8 semanas</SelectItem>
                  <SelectItem value="12">12 semanas</SelectItem>
                  <SelectItem value="16">16 semanas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="includeDeload">Incluir semanas de descarga</Label>
                <Switch
                  id="includeDeload"
                  checked={includeDeload}
                  onCheckedChange={setIncludeDeload}
                />
              </div>
              {includeDeload && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label htmlFor="deloadFrequency">Frecuencia de deload</Label>
                    <Select value={deloadFrequency.toString()} onValueChange={(value) => setDeloadFrequency(parseInt(value))}>
                      <SelectTrigger id="deloadFrequency">
                        <SelectValue placeholder="Cada cuántas semanas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">Cada 3 semanas</SelectItem>
                        <SelectItem value="4">Cada 4 semanas</SelectItem>
                        <SelectItem value="6">Cada 6 semanas</SelectItem>
                        <SelectItem value="8">Cada 8 semanas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="deloadType">Tipo de deload</Label>
                    <Select value={deloadType} onValueChange={setDeloadType}>
                      <SelectTrigger id="deloadType">
                        <SelectValue placeholder="Tipo de deload" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="volume">Reducción de volumen</SelectItem>
                        <SelectItem value="intensity">Reducción de intensidad</SelectItem>
                        <SelectItem value="both">Reducción combinada</SelectItem>
                        <SelectItem value="frequency">Reducción de frecuencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card3DContent>
      </Card3D>

      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Características Avanzadas</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Técnicas Avanzadas</h3>
                  <p className="text-sm text-muted-foreground">
                    Incluir técnicas especiales como drop sets, rest-pause, etc.
                  </p>
                </div>
                <Switch
                  checked={useAdvancedTechniques}
                  onCheckedChange={setUseAdvancedTechniques}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Variantes de Ejercicios</h3>
                  <p className="text-sm text-muted-foreground">
                    Incluir variantes (diferentes agarres, ángulos, etc.)
                  </p>
                </div>
                <Switch
                  checked={useExerciseVariants}
                  onCheckedChange={setUseExerciseVariants}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Ejercicios Alternativos</h3>
                  <p className="text-sm text-muted-foreground">
                    Incluir ejercicios alternativos para cada movimiento
                  </p>
                </div>
                <Switch
                  checked={useExerciseAlternatives}
                  onCheckedChange={setUseExerciseAlternatives}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Periodización</h3>
                  <p className="text-sm text-muted-foreground">
                    Estructurar el entrenamiento en fases progresivas
                  </p>
                </div>
                <Switch
                  checked={usePeriodization}
                  onCheckedChange={setUsePeriodization}
                />
              </div>

              {usePeriodization && (
                <div className="space-y-2">
                  <Label htmlFor="mesocycle">Modelo de Mesociclo</Label>
                  <Select value={selectedMesocycle} onValueChange={setSelectedMesocycle}>
                    <SelectTrigger id="mesocycle">
                      <SelectValue placeholder="Selecciona modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {MESOCYCLE_STRUCTURES.map((mesocycle) => (
                        <SelectItem key={mesocycle.name} value={mesocycle.name}>
                          {mesocycle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Seguimiento de RIR</h3>
                  <p className="text-sm text-muted-foreground">
                    Usar Repeticiones en Reserva para ajustar cargas
                  </p>
                </div>
                <Switch
                  checked={useRirTracking}
                  onCheckedChange={setUseRirTracking}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Gestión de Fatiga</h3>
                  <p className="text-sm text-muted-foreground">
                    Sistema inteligente para gestionar la fatiga acumulada
                  </p>
                </div>
                <Switch
                  checked={useFatigueManagement}
                  onCheckedChange={setUseFatigueManagement}
                />
              </div>
            </div>
          </div>
        </Card3DContent>
      </Card3D>

      <div className="flex justify-end mt-6">
        <Button3D onClick={generateRoutine}>
          <Zap className="h-4 w-4 mr-2" />
          Generar Rutina Avanzada
        </Button3D>
      </div>
    </>
  );
}
