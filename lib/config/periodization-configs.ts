import { 
  PeriodizationConfig, 
  PeriodizationType, 
  TrainingLevel, 
  TrainingGoal, 
  TrainingPhase 
} from "@/lib/types/advanced-periodization";

/**
 * Configuraciones para los diferentes tipos de periodización
 */
export const PERIODIZATION_CONFIGS: Record<PeriodizationType, PeriodizationConfig> = {
  linear: {
    name: "Periodización Lineal",
    description: "Progresión gradual desde alto volumen/baja intensidad hacia bajo volumen/alta intensidad. Ideal para principiantes y atletas intermedios.",
    type: "linear",
    recommendedFor: ["intermediate", "advanced"],
    bestSuitedGoals: ["strength", "hypertrophy", "power"],
    typicalDuration: 12, // semanas
    phasesSequence: ["hypertrophy", "strength", "power", "deload"],
    volumePattern: "descending",
    intensityPattern: "ascending",
    deloadFrequency: 12, // cada 12 semanas
    pros: [
      "Fácil de programar y seguir",
      "Desarrollo secuencial de cualidades físicas",
      "Buena para atletas con objetivos claros"
    ],
    cons: [
      "Puede ser monótona a largo plazo",
      "No ideal para atletas avanzados que necesitan estímulos variados",
      "Pérdida potencial de adaptaciones previas"
    ]
  },
  
  undulating: {
    name: "Periodización Ondulante",
    description: "Varía el volumen e intensidad dentro de cada ciclo, permitiendo mantener múltiples cualidades físicas simultáneamente.",
    type: "undulating",
    recommendedFor: ["advanced", "elite"],
    bestSuitedGoals: ["strength", "hypertrophy", "power", "endurance"],
    typicalDuration: 16, // semanas
    phasesSequence: ["hypertrophy", "strength", "power", "hypertrophy", "strength", "power", "deload"],
    volumePattern: "wave",
    intensityPattern: "wave",
    deloadFrequency: 8, // cada 8 semanas
    pros: [
      "Mantiene múltiples adaptaciones simultáneamente",
      "Reduce el aburrimiento y la monotonía",
      "Permite mayor flexibilidad en la programación"
    ],
    cons: [
      "Más compleja de programar",
      "Puede ser difícil de seguir para atletas menos experimentados",
      "Requiere buena capacidad de recuperación"
    ]
  },
  
  block: {
    name: "Periodización por Bloques",
    description: "Concentra el trabajo en cualidades específicas durante bloques de tiempo, maximizando adaptaciones específicas.",
    type: "block",
    recommendedFor: ["advanced", "elite"],
    bestSuitedGoals: ["strength", "power", "hypertrophy"],
    typicalDuration: 16, // semanas
    phasesSequence: ["hypertrophy", "hypertrophy", "strength", "strength", "power", "deload"],
    volumePattern: "step",
    intensityPattern: "step",
    deloadFrequency: 6, // cada 6 semanas
    pros: [
      "Concentración de estímulos para maximizar adaptaciones",
      "Fácil de ajustar basado en respuesta individual",
      "Ideal para atletas avanzados con objetivos específicos"
    ],
    cons: [
      "Puede llevar a pérdida de adaptaciones no entrenadas",
      "Requiere planificación cuidadosa",
      "No ideal para atletas con múltiples objetivos simultáneos"
    ]
  },
  
  conjugate: {
    name: "Periodización Conjugada",
    description: "Trabaja múltiples cualidades simultáneamente con énfasis rotativo, ideal para atletas avanzados.",
    type: "conjugate",
    recommendedFor: ["advanced", "elite"],
    bestSuitedGoals: ["strength", "power"],
    typicalDuration: 12, // semanas
    phasesSequence: ["strength", "power", "hypertrophy", "strength", "power", "deload"],
    volumePattern: "wave",
    intensityPattern: "wave",
    deloadFrequency: 4, // cada 4 semanas
    pros: [
      "Desarrollo simultáneo de múltiples cualidades",
      "Reduce el riesgo de lesiones por variedad de estímulos",
      "Ideal para atletas de fuerza avanzados"
    ],
    cons: [
      "Muy compleja de programar correctamente",
      "Requiere experiencia para implementar",
      "Necesita equipamiento especializado (bandas, cadenas, etc.)"
    ]
  },
  
  dup: {
    name: "Periodización Ondulante Diaria (DUP)",
    description: "Varía volumen e intensidad diariamente, permitiendo entrenar las mismas cualidades varias veces por semana.",
    type: "dup",
    recommendedFor: ["advanced", "elite"],
    bestSuitedGoals: ["strength", "hypertrophy", "power"],
    typicalDuration: 12, // semanas
    phasesSequence: ["hypertrophy", "strength", "power", "deload"],
    volumePattern: "wave",
    intensityPattern: "wave",
    deloadFrequency: 6, // cada 6 semanas
    pros: [
      "Frecuencia óptima para cada cualidad física",
      "Variedad diaria que reduce monotonía",
      "Excelente para atletas con buena capacidad de recuperación"
    ],
    cons: [
      "Requiere planificación detallada",
      "Puede ser difícil de recuperarse adecuadamente",
      "No ideal para atletas con limitaciones de tiempo"
    ]
  },
  
  wup: {
    name: "Periodización Ondulante Semanal (WUP)",
    description: "Varía volumen e intensidad semanalmente, equilibrando estímulos variados con recuperación adecuada.",
    type: "wup",
    recommendedFor: ["intermediate", "advanced"],
    bestSuitedGoals: ["strength", "hypertrophy", "endurance"],
    typicalDuration: 12, // semanas
    phasesSequence: ["hypertrophy", "strength", "hypertrophy", "strength", "power", "deload"],
    volumePattern: "wave",
    intensityPattern: "wave",
    deloadFrequency: 6, // cada 6 semanas
    pros: [
      "Más fácil de implementar que DUP",
      "Buen equilibrio entre variedad y recuperación",
      "Adecuada para la mayoría de atletas intermedios y avanzados"
    ],
    cons: [
      "Menos específica que la periodización por bloques",
      "Puede ser subóptima para atletas de élite",
      "Requiere buena planificación semanal"
    ]
  }
};

/**
 * Obtiene la configuración recomendada según nivel y objetivo
 */
export function getRecommendedPeriodization(
  level: TrainingLevel,
  goal: TrainingGoal
): PeriodizationType {
  if (level === "elite") {
    if (goal === "strength" || goal === "power") {
      return "conjugate";
    } else {
      return "dup";
    }
  } else if (level === "advanced") {
    if (goal === "hypertrophy") {
      return "block";
    } else if (goal === "strength") {
      return "dup";
    } else {
      return "undulating";
    }
  } else {
    // intermediate
    if (goal === "hypertrophy" || goal === "strength") {
      return "linear";
    } else {
      return "wup";
    }
  }
}

/**
 * Genera una estructura básica de programa basada en el tipo de periodización
 */
export function generateBasicProgramStructure(
  type: PeriodizationType,
  level: TrainingLevel,
  goal: TrainingGoal,
  durationWeeks: number = 12,
  frequency: number = 4
) {
  const config = PERIODIZATION_CONFIGS[type];
  const structure: any = {
    type,
    level,
    goal,
    durationWeeks,
    frequency,
    mesocycles: []
  };

  // Determinar cuántos mesociclos crear
  let mesocycleCount = Math.floor(durationWeeks / 4);
  if (mesocycleCount < 1) mesocycleCount = 1;

  // Crear mesociclos
  for (let i = 0; i < mesocycleCount; i++) {
    const phaseIndex = i % config.phasesSequence.length;
    const phase = config.phasesSequence[phaseIndex];
    const isLastMesocycle = i === mesocycleCount - 1;
    
    const mesocycle = {
      name: `Mesociclo ${i + 1}: ${getPhaseDisplayName(phase)}`,
      phase,
      position: i + 1,
      duration_weeks: isLastMesocycle ? (durationWeeks - i * 4) : 4,
      includes_deload: phase === "deload" || (i + 1) % (config.deloadFrequency / 4) === 0,
      volume_level: getVolumeLevel(phase, config.volumePattern),
      intensity_level: getIntensityLevel(phase, config.intensityPattern),
      microcycles: []
    };

    // Crear microciclos para este mesociclo
    for (let j = 0; j < mesocycle.duration_weeks; j++) {
      const isDeload = j === mesocycle.duration_weeks - 1 && mesocycle.includes_deload;
      
      const microcycle = {
        week_number: j + 1,
        name: isDeload ? "Semana de Descarga" : `Semana ${j + 1}`,
        is_deload: isDeload,
        volume_multiplier: getVolumeMultiplier(j + 1, mesocycle.duration_weeks, config.volumePattern, isDeload),
        intensity_multiplier: getIntensityMultiplier(j + 1, mesocycle.duration_weeks, config.intensityPattern, isDeload),
        sessions: []
      };

      // Crear sesiones para este microciclo
      for (let k = 0; k < frequency; k++) {
        const session = {
          day_of_week: k + 1, // Asumiendo que empezamos en lunes (1)
          name: `Entrenamiento ${k + 1}`,
          focus: getSessionFocus(k, frequency, goal),
          rpe_target: isDeload ? 6 : 8,
          rir_target: isDeload ? 3 : 1
        };

        microcycle.sessions.push(session);
      }

      mesocycle.microcycles.push(microcycle);
    }

    structure.mesocycles.push(mesocycle);
  }

  return structure;
}

// Funciones auxiliares

function getPhaseDisplayName(phase: TrainingPhase): string {
  const names: Record<TrainingPhase, string> = {
    hypertrophy: "Hipertrofia",
    strength: "Fuerza",
    power: "Potencia",
    endurance: "Resistencia",
    deload: "Descarga"
  };
  return names[phase] || phase;
}

function getVolumeLevel(phase: TrainingPhase, pattern: string): number {
  if (phase === "deload") return 3;
  
  switch (phase) {
    case "hypertrophy": return 8;
    case "strength": return 6;
    case "power": return 4;
    case "endurance": return 7;
    default: return 5;
  }
}

function getIntensityLevel(phase: TrainingPhase, pattern: string): number {
  if (phase === "deload") return 4;
  
  switch (phase) {
    case "hypertrophy": return 6;
    case "strength": return 8;
    case "power": return 9;
    case "endurance": return 5;
    default: return 5;
  }
}

function getVolumeMultiplier(weekNumber: number, totalWeeks: number, pattern: string, isDeload: boolean): number {
  if (isDeload) return 0.6;
  
  switch (pattern) {
    case "ascending":
      return 0.8 + (weekNumber / totalWeeks) * 0.4;
    case "descending":
      return 1.2 - (weekNumber / totalWeeks) * 0.4;
    case "wave":
      return 0.9 + Math.sin((weekNumber / totalWeeks) * Math.PI) * 0.3;
    case "step":
      return weekNumber % 2 === 0 ? 0.9 : 1.1;
    default:
      return 1.0;
  }
}

function getIntensityMultiplier(weekNumber: number, totalWeeks: number, pattern: string, isDeload: boolean): number {
  if (isDeload) return 0.7;
  
  switch (pattern) {
    case "ascending":
      return 0.8 + (weekNumber / totalWeeks) * 0.4;
    case "descending":
      return 1.2 - (weekNumber / totalWeeks) * 0.4;
    case "wave":
      return 0.9 + Math.sin((weekNumber / totalWeeks) * Math.PI) * 0.3;
    case "step":
      return weekNumber % 2 === 0 ? 0.9 : 1.1;
    default:
      return 1.0;
  }
}

function getSessionFocus(sessionIndex: number, frequency: number, goal: TrainingGoal): string[] {
  // Distribución básica para 4 días por semana
  if (frequency === 4) {
    switch (sessionIndex) {
      case 0: return ["chest", "shoulders", "triceps"];
      case 1: return ["back", "biceps"];
      case 2: return ["legs", "core"];
      case 3: return ["shoulders", "arms", "core"];
    }
  }
  
  // Distribución para 3 días por semana
  if (frequency === 3) {
    switch (sessionIndex) {
      case 0: return ["chest", "shoulders", "triceps"];
      case 1: return ["back", "biceps"];
      case 2: return ["legs", "core"];
    }
  }
  
  // Distribución para 5 días por semana
  if (frequency === 5) {
    switch (sessionIndex) {
      case 0: return ["chest"];
      case 1: return ["back"];
      case 2: return ["legs"];
      case 3: return ["shoulders"];
      case 4: return ["arms", "core"];
    }
  }
  
  // Distribución para 6 días por semana
  if (frequency === 6) {
    switch (sessionIndex) {
      case 0: return ["chest"];
      case 1: return ["back"];
      case 2: return ["legs"];
      case 3: return ["shoulders"];
      case 4: return ["arms"];
      case 5: return ["core", "cardio"];
    }
  }
  
  // Distribución genérica
  return ["full_body"];
}
