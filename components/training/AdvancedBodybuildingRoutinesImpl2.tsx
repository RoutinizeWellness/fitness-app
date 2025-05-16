import { TrainingLevel, TrainingGoal, TrainingSplit, WorkoutRoutine } from "@/lib/types/training";
import { Dumbbell, Calendar, BarChart3, Gauge, Layers, Sparkles, Brain, RefreshCw, Lightbulb, Droplets, Check, Info, Loader2, Save, Zap } from "lucide-react";
import { Card3D, Card3DHeader, Card3DContent, Card3DTitle } from "@/components/ui/card-3d";
import { Button3D } from "@/components/ui/button-3d";
import { Badge } from "@/components/ui/badge";
import { MesocycleProgressVisualization } from "@/components/training/mesocycle-progress-visualization";
import { FatigueManagementSystem } from "@/components/training/fatigue-management-system";
import { TemplatesTabProps, PreviewTabProps } from "./AdvancedBodybuildingRoutinesImpl";

// Implementación del componente TemplatesTab
export function TemplatesTab({
  level,
  goal,
  setSelectedMesocycle,
  setSplit,
  setFrequency,
  setDuration,
  setIncludeDeload,
  setDeloadFrequency,
  setActiveTab,
  generateRoutine
}: TemplatesTabProps) {
  // Plantillas predefinidas basadas en recursos de culturismo
  const templates = [
    {
      id: "ppl-hypertrophy",
      name: "PPL Hipertrofia Avanzada",
      description: "Rutina Push/Pull/Legs de 6 días enfocada en hipertrofia máxima con técnicas avanzadas",
      split: "ppl" as TrainingSplit,
      frequency: 6,
      duration: 8,
      level: "intermediate" as TrainingLevel,
      goal: "hypertrophy" as TrainingGoal,
      includeDeload: true,
      deloadFrequency: 4,
      mesocycle: "Hipertrofia Estándar",
      features: ["Drop Sets", "Super Sets", "Rest-Pause", "Periodización Ondulada", "RIR Tracking"],
      image: "ppl-advanced.jpg"
    },
    {
      id: "upper-lower-strength",
      name: "Upper/Lower para Fuerza",
      description: "Rutina Upper/Lower de 4 días enfocada en ganancias de fuerza con periodización lineal",
      split: "upper_lower" as TrainingSplit,
      frequency: 4,
      duration: 8,
      level: "advanced" as TrainingLevel,
      goal: "strength" as TrainingGoal,
      includeDeload: true,
      deloadFrequency: 4,
      mesocycle: "Fuerza Pura",
      features: ["Cluster Sets", "Rest-Pause", "Periodización Lineal", "Isometría", "RIR Tracking"],
      image: "upper-lower-strength.jpg"
    },
    {
      id: "full-body-hypertrophy",
      name: "Full Body Científico",
      description: "Rutina Full Body de 3 días basada en principios científicos de hipertrofia",
      split: "full_body" as TrainingSplit,
      frequency: 3,
      duration: 8,
      level: "intermediate" as TrainingLevel,
      goal: "hypertrophy" as TrainingGoal,
      includeDeload: true,
      deloadFrequency: 4,
      mesocycle: "Hipertrofia Estándar",
      features: ["Myo-reps", "Tempo Training", "Periodización Ondulada", "RIR Tracking"],
      image: "full-body-science.jpg"
    },
    {
      id: "body-part-definition",
      name: "Body Part para Definición",
      description: "Rutina de 5 días dividida por grupos musculares para máxima definición",
      split: "body_part" as TrainingSplit,
      frequency: 5,
      duration: 6,
      level: "advanced" as TrainingLevel,
      goal: "weight_loss" as TrainingGoal,
      includeDeload: true,
      deloadFrequency: 3,
      mesocycle: "Definición Avanzada",
      features: ["Giant Sets", "Super Sets", "Drop Sets", "Cardio Integrado", "RIR Tracking"],
      image: "body-part-definition.jpg"
    }
  ];

  // Filtrar plantillas según nivel y objetivo
  const filteredTemplates = templates.filter(template => {
    // Para principiantes, mostrar solo plantillas de nivel principiante
    if (level === "beginner") {
      return template.level === "beginner";
    }
    
    // Para intermedios, mostrar plantillas de nivel principiante e intermedio
    if (level === "intermediate") {
      return template.level === "beginner" || template.level === "intermediate";
    }
    
    // Para avanzados, mostrar todas las plantillas
    return true;
  });

  // Función para aplicar una plantilla
  const applyTemplate = (template: typeof templates[0]) => {
    setSplit(template.split);
    setFrequency(template.frequency);
    setDuration(template.duration);
    setIncludeDeload(template.includeDeload);
    setDeloadFrequency(template.deloadFrequency);
    setSelectedMesocycle(template.mesocycle);
    
    // Cambiar a la pestaña de vista previa y generar la rutina
    setActiveTab("preview");
    generateRoutine();
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map(template => (
          <Card3D key={template.id} className="overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Dumbbell className="h-16 w-16 text-white opacity-50" />
            </div>
            <Card3DHeader>
              <Card3DTitle>{template.name}</Card3DTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-50">{template.split.replace('_', '/')}</Badge>
                <Badge variant="outline" className="bg-green-50">{template.frequency} días/semana</Badge>
                <Badge variant="outline" className="bg-purple-50">
                  {template.goal === "hypertrophy" ? "Hipertrofia" : 
                   template.goal === "strength" ? "Fuerza" : 
                   template.goal === "weight_loss" ? "Definición" : 
                   template.goal === "power" ? "Potencia" : "Resistencia"}
                </Badge>
              </div>
            </Card3DHeader>
            <Card3DContent>
              <p className="text-gray-600 mb-4">{template.description}</p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Características:</h4>
                <ul className="space-y-1">
                  {template.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button3D className="w-full" onClick={() => applyTemplate(template)}>
                <Zap className="h-4 w-4 mr-2" />
                Usar esta plantilla
              </Button3D>
            </Card3DContent>
          </Card3D>
        ))}
      </div>
    </>
  );
}

// Implementación del componente PreviewTab
export function PreviewTab({
  isGenerating,
  generatedRoutine,
  saveRoutine,
  level,
  goal,
  split,
  frequency,
  includeDeload,
  deloadFrequency,
  usePeriodization,
  selectedMesocycle
}: PreviewTabProps) {
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-xl font-medium mb-2">Generando rutina avanzada...</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Estamos creando una rutina personalizada basada en principios científicos de entrenamiento.
          Esto puede tomar unos momentos.
        </p>
      </div>
    );
  }

  if (!generatedRoutine) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Info className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No hay rutina generada</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Configura los parámetros en la pestaña de configuración o selecciona una plantilla
          para generar una rutina avanzada de entrenamiento.
        </p>
      </div>
    );
  }

  return (
    <>
      <Card3D>
        <Card3DHeader>
          <Card3DTitle>{generatedRoutine.name}</Card3DTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-blue-50">
              {split === "ppl" ? "Push/Pull/Legs" :
               split === "upper_lower" ? "Upper/Lower" :
               split === "full_body" ? "Full Body" :
               split === "body_part" ? "Body Part" : "Push/Pull"}
            </Badge>
            <Badge variant="outline" className="bg-green-50">{frequency} días/semana</Badge>
            <Badge variant="outline" className="bg-purple-50">
              {goal === "hypertrophy" ? "Hipertrofia" : 
               goal === "strength" ? "Fuerza" : 
               goal === "weight_loss" ? "Definición" : 
               goal === "power" ? "Potencia" : "Resistencia"}
            </Badge>
            <Badge variant="outline" className="bg-amber-50">
              {level === "beginner" ? "Principiante" :
               level === "intermediate" ? "Intermedio" : "Avanzado"}
            </Badge>
          </div>
        </Card3DHeader>
        <Card3DContent>
          <p className="text-gray-600 mb-6">{generatedRoutine.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Características de la Rutina</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Calendar className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Duración:</span> {includeDeload ? `${Math.ceil(generatedRoutine.days.length / frequency)} semanas con deload cada ${deloadFrequency} semanas` : `${Math.ceil(generatedRoutine.days.length / frequency)} semanas sin deload`}
                  </div>
                </li>
                <li className="flex items-start">
                  <Dumbbell className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Frecuencia:</span> {frequency} días por semana
                  </div>
                </li>
                <li className="flex items-start">
                  <BarChart3 className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Periodización:</span> {usePeriodization ? `${selectedMesocycle}` : "No utilizada"}
                  </div>
                </li>
                <li className="flex items-start">
                  <Gauge className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Intensidad:</span> {goal === "strength" ? "Alta (80-90% 1RM)" : goal === "hypertrophy" ? "Moderada-Alta (70-85% 1RM)" : "Moderada (60-75% 1RM)"}
                  </div>
                </li>
                <li className="flex items-start">
                  <Layers className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Volumen:</span> {goal === "hypertrophy" ? "Alto (12-20 series por grupo muscular/semana)" : goal === "strength" ? "Moderado (10-15 series por grupo muscular/semana)" : "Variable según fase"}
                  </div>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Beneficios Principales</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Sparkles className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    {goal === "hypertrophy" ? "Maximiza el crecimiento muscular a través de volumen óptimo y técnicas avanzadas" : 
                     goal === "strength" ? "Desarrolla fuerza máxima con progresión de cargas y periodización específica" :
                     goal === "weight_loss" ? "Optimiza la quema de calorías y preserva masa muscular durante el déficit" :
                     "Mejora el rendimiento físico general y la composición corporal"}
                  </div>
                </li>
                <li className="flex items-start">
                  <Brain className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    Diseño basado en principios científicos de entrenamiento y adaptado a tu nivel
                  </div>
                </li>
                <li className="flex items-start">
                  <RefreshCw className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    {includeDeload ? "Incluye periodos de descarga para optimizar recuperación y prevenir sobreentrenamiento" : "Estructura progresiva que maximiza resultados mientras gestiona la fatiga"}
                  </div>
                </li>
                <li className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    Incorpora técnicas avanzadas específicas para tu objetivo de {goal === "hypertrophy" ? "hipertrofia" : goal === "strength" ? "fuerza" : goal === "weight_loss" ? "definición" : "rendimiento"}
                  </div>
                </li>
                <li className="flex items-start">
                  <Droplets className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    Sistema de gestión de fatiga que previene el sobreentrenamiento y optimiza resultados
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          {usePeriodization && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Visualización de Progresión</h3>
              <MesocycleProgressVisualization />
            </div>
          )}
          
          <div className="flex justify-end">
            <Button3D onClick={saveRoutine}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Rutina
            </Button3D>
          </div>
        </Card3DContent>
      </Card3D>
      
      <FatigueManagementSystem />
    </>
  );
}
