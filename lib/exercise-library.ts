/**
 * Biblioteca avanzada de ejercicios con alternativas específicas
 * Basada en programas de Jeff Nippard, Pure Bodybuilding, Essentials Program y otros
 */

import { v4 as uuidv4 } from "uuid";

// Tipos para la biblioteca de ejercicios
export interface ExerciseData {
  id: string;
  name: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroups: string[];
  equipment: string[];
  isCompound: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  mechanics?: 'push' | 'pull' | 'hinge' | 'squat' | 'carry' | 'rotation' | 'isolation';
  forceType?: 'concentric' | 'eccentric' | 'isometric';
  alternatives: string[]; // IDs de ejercicios alternativos
  variations: ExerciseVariation[];
  warmupProtocol?: WarmupProtocol;
  executionTips?: string[];
  videoUrl?: string;
  imageUrl?: string;
}

export interface ExerciseVariation {
  name: string;
  description: string;
  targetEmphasis: string[];
  difficultyModifier: number; // -1 (más fácil) a +1 (más difícil)
  equipment?: string[];
}

export interface WarmupProtocol {
  generalWarmup: string;
  specificWarmup: WarmupSet[];
  mobilityExercises?: string[];
}

export interface WarmupSet {
  percentage: number; // Porcentaje del peso de trabajo
  reps: number;
  restSeconds: number;
  calculatedWeight?: number; // Peso calculado en kg basado en el porcentaje
}

// Protocolos de calentamiento específicos
export const WARMUP_PROTOCOLS: Record<string, WarmupProtocol> = {
  compound_heavy: {
    generalWarmup: "5-7 minutos de cardio ligero (elíptica, bicicleta o remo) + movilidad articular general",
    specificWarmup: [
      { percentage: 0, reps: 15, restSeconds: 60 }, // Barra vacía o peso corporal
      { percentage: 40, reps: 10, restSeconds: 60 },
      { percentage: 60, reps: 6, restSeconds: 90 },
      { percentage: 80, reps: 3, restSeconds: 120 }
    ],
    mobilityExercises: [
      "Rotación de hombros",
      "Movilidad de cadera",
      "Movilidad de tobillos",
      "Rotación torácica",
      "Puente de glúteos"
    ]
  },
  compound_moderate: {
    generalWarmup: "5 minutos de cardio ligero + movilidad articular específica",
    specificWarmup: [
      { percentage: 0, reps: 12, restSeconds: 60 }, // Barra vacía o peso corporal
      { percentage: 50, reps: 8, restSeconds: 60 },
      { percentage: 70, reps: 5, restSeconds: 90 }
    ],
    mobilityExercises: [
      "Movilidad específica para la articulación principal",
      "Activación de músculos estabilizadores"
    ]
  },
  isolation: {
    generalWarmup: "Activación del grupo muscular objetivo",
    specificWarmup: [
      { percentage: 50, reps: 15, restSeconds: 45 },
      { percentage: 70, reps: 10, restSeconds: 45 }
    ],
    mobilityExercises: [
      "Estiramientos dinámicos del músculo objetivo"
    ]
  },
  squat_specific: {
    generalWarmup: "5 minutos de cardio ligero + movilidad específica de cadera y rodilla",
    specificWarmup: [
      { percentage: 0, reps: 15, restSeconds: 60 }, // Barra vacía
      { percentage: 40, reps: 8, restSeconds: 60 },
      { percentage: 60, reps: 5, restSeconds: 90 },
      { percentage: 75, reps: 3, restSeconds: 120 },
      { percentage: 85, reps: 1, restSeconds: 180 }
    ],
    mobilityExercises: [
      "Sentadilla profunda con peso corporal",
      "Movilidad de cadera 90/90",
      "Movilidad de tobillos contra pared",
      "Puente de glúteos",
      "Activación de core con plancha"
    ]
  },
  bench_specific: {
    generalWarmup: "5 minutos de cardio ligero + movilidad específica de hombros",
    specificWarmup: [
      { percentage: 0, reps: 15, restSeconds: 60 }, // Barra vacía
      { percentage: 40, reps: 10, restSeconds: 60 },
      { percentage: 60, reps: 6, restSeconds: 90 },
      { percentage: 75, reps: 4, restSeconds: 120 },
      { percentage: 85, reps: 2, restSeconds: 150 }
    ],
    mobilityExercises: [
      "Rotación externa/interna de hombros con banda",
      "Retracción escapular",
      "Rotación de hombros con brazos extendidos",
      "Estiramiento de pectorales en esquina",
      "Activación de serrato con push-up plus"
    ]
  },
  deadlift_specific: {
    generalWarmup: "5 minutos de cardio ligero + movilidad específica de cadera y espalda baja",
    specificWarmup: [
      { percentage: 0, reps: 10, restSeconds: 60 }, // Peso ligero para aprender el patrón
      { percentage: 40, reps: 8, restSeconds: 60 },
      { percentage: 60, reps: 5, restSeconds: 90 },
      { percentage: 75, reps: 3, restSeconds: 120 },
      { percentage: 85, reps: 1, restSeconds: 180 }
    ],
    mobilityExercises: [
      "Hip hinge con banda",
      "Good morning con peso corporal",
      "Puente de glúteos",
      "Estiramiento de isquiotibiales activo",
      "Activación de core con bird-dog"
    ]
  },
  upper_body_pull: {
    generalWarmup: "5 minutos de cardio ligero + movilidad específica de hombros y escápulas",
    specificWarmup: [
      { percentage: 40, reps: 12, restSeconds: 60 },
      { percentage: 60, reps: 8, restSeconds: 60 },
      { percentage: 75, reps: 5, restSeconds: 90 }
    ],
    mobilityExercises: [
      "Retracción y protracción escapular",
      "Rotación externa de hombros con banda",
      "Colgarse pasivamente de barra",
      "Activación de dorsal con pullover ligero"
    ]
  },
  leg_isolation: {
    generalWarmup: "5 minutos de cardio específico para piernas (bicicleta o elíptica)",
    specificWarmup: [
      { percentage: 40, reps: 15, restSeconds: 45 },
      { percentage: 60, reps: 12, restSeconds: 45 },
      { percentage: 75, reps: 8, restSeconds: 60 }
    ],
    mobilityExercises: [
      "Estiramiento dinámico de cuádriceps",
      "Estiramiento dinámico de isquiotibiales",
      "Movilidad de cadera en círculos",
      "Activación de glúteos con puente"
    ]
  }
};

// Biblioteca de ejercicios para pecho
export const CHEST_EXERCISES: ExerciseData[] = [
  {
    id: "chest-001",
    name: "Press de Banca",
    primaryMuscleGroup: "chest",
    secondaryMuscleGroups: ["triceps", "front_delts"],
    equipment: ["barbell", "bench"],
    isCompound: true,
    difficulty: "intermediate",
    category: "horizontal_push",
    mechanics: "push",
    alternatives: ["chest-002", "chest-003", "chest-004"],
    variations: [
      {
        name: "Agarre Cerrado",
        description: "Manos a la anchura de los hombros, mayor énfasis en tríceps",
        targetEmphasis: ["triceps", "inner_chest"],
        difficultyModifier: 0.2,
        equipment: ["barbell", "bench"]
      },
      {
        name: "Agarre Ancho",
        description: "Manos más separadas que la anchura de los hombros, mayor énfasis en pectorales",
        targetEmphasis: ["outer_chest", "front_delts"],
        difficultyModifier: 0,
        equipment: ["barbell", "bench"]
      },
      {
        name: "Pausa",
        description: "Pausa de 2-3 segundos en la parte inferior del movimiento",
        targetEmphasis: ["chest", "triceps"],
        difficultyModifier: 0.3,
        equipment: ["barbell", "bench"]
      },
      {
        name: "Tempo 4-1-1",
        description: "4 segundos en fase excéntrica, 1 segundo pausa, 1 segundo concéntrica",
        targetEmphasis: ["chest"],
        difficultyModifier: 0.3,
        equipment: ["barbell", "bench"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.bench_specific,
    executionTips: [
      "Mantén los omóplatos retraídos y deprimidos",
      "Pies firmes en el suelo",
      "Arco lumbar natural, no excesivo",
      "Baja la barra hasta rozar el pecho a la altura de los pezones",
      "Trayectoria ligeramente diagonal hacia los hombros"
    ]
  },
  {
    id: "chest-002",
    name: "Press de Banca Inclinado",
    primaryMuscleGroup: "chest",
    secondaryMuscleGroups: ["front_delts", "triceps"],
    equipment: ["barbell", "incline_bench"],
    isCompound: true,
    difficulty: "intermediate",
    category: "incline_push",
    mechanics: "push",
    alternatives: ["chest-001", "chest-005", "chest-006"],
    variations: [
      {
        name: "Inclinación Baja (15-30°)",
        description: "Mayor énfasis en la parte media del pecho",
        targetEmphasis: ["mid_chest", "front_delts"],
        difficultyModifier: 0,
        equipment: ["barbell", "incline_bench"]
      },
      {
        name: "Inclinación Alta (45-60°)",
        description: "Mayor énfasis en la parte superior del pecho y deltoides frontales",
        targetEmphasis: ["upper_chest", "front_delts"],
        difficultyModifier: 0.1,
        equipment: ["barbell", "incline_bench"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.bench_specific,
    executionTips: [
      "Ajusta la inclinación según tu objetivo (15-30° para más pecho, 45-60° para más hombro)",
      "Mantén los codos a unos 45-60° respecto al torso",
      "Baja la barra hasta la parte superior del pecho"
    ]
  },
  {
    id: "chest-003",
    name: "Press con Mancuernas",
    primaryMuscleGroup: "chest",
    secondaryMuscleGroups: ["triceps", "front_delts"],
    equipment: ["dumbbells", "bench"],
    isCompound: true,
    difficulty: "intermediate",
    category: "horizontal_push",
    mechanics: "push",
    alternatives: ["chest-001", "chest-004", "chest-007"],
    variations: [
      {
        name: "Neutro (Palmas enfrentadas)",
        description: "Palmas enfrentadas, mayor rango de movimiento y énfasis en la parte interna",
        targetEmphasis: ["inner_chest", "triceps"],
        difficultyModifier: 0,
        equipment: ["dumbbells", "bench"]
      },
      {
        name: "Rotación",
        description: "Rotar las muñecas durante el movimiento, de pronación a semipronación",
        targetEmphasis: ["chest", "biceps"],
        difficultyModifier: 0.2,
        equipment: ["dumbbells", "bench"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.compound_moderate,
    executionTips: [
      "Mayor rango de movimiento que con barra",
      "Permite descender más abajo que la barra",
      "Puedes rotar las muñecas durante el movimiento para mayor activación"
    ]
  },
  {
    id: "chest-004",
    name: "Press en Máquina",
    primaryMuscleGroup: "chest",
    secondaryMuscleGroups: ["triceps", "front_delts"],
    equipment: ["machine"],
    isCompound: true,
    difficulty: "beginner",
    category: "horizontal_push",
    mechanics: "push",
    alternatives: ["chest-001", "chest-003", "chest-008"],
    variations: [
      {
        name: "Agarre Ancho",
        description: "Manos en las agarraderas más externas, énfasis en pectorales externos",
        targetEmphasis: ["outer_chest"],
        difficultyModifier: 0,
        equipment: ["machine"]
      },
      {
        name: "Agarre Estrecho",
        description: "Manos en las agarraderas más internas, énfasis en pectorales internos y tríceps",
        targetEmphasis: ["inner_chest", "triceps"],
        difficultyModifier: 0,
        equipment: ["machine"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.compound_moderate,
    executionTips: [
      "Ajusta el asiento para que las agarraderas estén a la altura de la mitad del pecho",
      "Mantén los omóplatos retraídos",
      "Empuja a través de los pectorales, no de los hombros"
    ]
  },
  {
    id: "chest-005",
    name: "Press Inclinado con Mancuernas",
    primaryMuscleGroup: "chest",
    secondaryMuscleGroups: ["front_delts", "triceps"],
    equipment: ["dumbbells", "incline_bench"],
    isCompound: true,
    difficulty: "intermediate",
    category: "incline_push",
    mechanics: "push",
    alternatives: ["chest-002", "chest-006", "chest-009"],
    variations: [
      {
        name: "Inclinación Baja",
        description: "15-30° de inclinación, mayor énfasis en pectoral medio",
        targetEmphasis: ["mid_chest"],
        difficultyModifier: 0,
        equipment: ["dumbbells", "incline_bench"]
      },
      {
        name: "Inclinación Alta",
        description: "45-60° de inclinación, mayor énfasis en pectoral superior y deltoides",
        targetEmphasis: ["upper_chest", "front_delts"],
        difficultyModifier: 0.2,
        equipment: ["dumbbells", "incline_bench"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.compound_moderate,
    executionTips: [
      "Permite que los codos desciendan más que con la barra",
      "Mantén una ligera flexión en los codos en la parte superior",
      "Puedes rotar las muñecas durante el movimiento"
    ]
  },
  {
    id: "chest-006",
    name: "Aperturas con Mancuernas",
    primaryMuscleGroup: "chest",
    secondaryMuscleGroups: ["front_delts"],
    equipment: ["dumbbells", "bench"],
    isCompound: false,
    difficulty: "intermediate",
    category: "isolation",
    mechanics: "isolation",
    alternatives: ["chest-010", "chest-011", "chest-012"],
    variations: [
      {
        name: "Banco Plano",
        description: "Énfasis en pectoral medio",
        targetEmphasis: ["mid_chest"],
        difficultyModifier: 0,
        equipment: ["dumbbells", "bench"]
      },
      {
        name: "Banco Inclinado",
        description: "Énfasis en pectoral superior",
        targetEmphasis: ["upper_chest"],
        difficultyModifier: 0.1,
        equipment: ["dumbbells", "incline_bench"]
      },
      {
        name: "Banco Declinado",
        description: "Énfasis en pectoral inferior",
        targetEmphasis: ["lower_chest"],
        difficultyModifier: 0.1,
        equipment: ["dumbbells", "decline_bench"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.isolation,
    executionTips: [
      "Mantén una ligera flexión en los codos durante todo el movimiento",
      "Imagina que abrazas un barril",
      "Siente el estiramiento en los pectorales en la parte inferior",
      "No desciendas demasiado para evitar lesiones en los hombros"
    ]
  },
  {
    id: "chest-007",
    name: "Fondos en Paralelas",
    primaryMuscleGroup: "chest",
    secondaryMuscleGroups: ["triceps", "front_delts"],
    equipment: ["dip_bars"],
    isCompound: true,
    difficulty: "intermediate",
    category: "vertical_push",
    mechanics: "push",
    alternatives: ["chest-001", "chest-013", "chest-014"],
    variations: [
      {
        name: "Inclinación Hacia Adelante",
        description: "Mayor inclinación del torso, énfasis en pectorales",
        targetEmphasis: ["lower_chest"],
        difficultyModifier: 0,
        equipment: ["dip_bars"]
      },
      {
        name: "Vertical",
        description: "Torso vertical, énfasis en tríceps",
        targetEmphasis: ["triceps"],
        difficultyModifier: 0,
        equipment: ["dip_bars"]
      },
      {
        name: "Con Peso",
        description: "Añadir peso con cinturón o mancuerna entre las piernas",
        targetEmphasis: ["chest", "triceps"],
        difficultyModifier: 0.5,
        equipment: ["dip_bars", "weight_belt"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.compound_moderate,
    executionTips: [
      "Inclina el torso hacia adelante para mayor énfasis en el pecho",
      "Desciende hasta que los hombros estén paralelos a los codos o ligeramente por debajo",
      "Mantén los codos cerca del cuerpo para proteger los hombros"
    ]
  },
  {
    id: "chest-008",
    name: "Aperturas en Polea",
    primaryMuscleGroup: "chest",
    secondaryMuscleGroups: ["front_delts"],
    equipment: ["cable_machine"],
    isCompound: false,
    difficulty: "beginner",
    category: "isolation",
    mechanics: "isolation",
    alternatives: ["chest-006", "chest-010", "chest-011"],
    variations: [
      {
        name: "Polea Alta",
        description: "Poleas por encima de la cabeza, énfasis en pectoral inferior",
        targetEmphasis: ["lower_chest"],
        difficultyModifier: 0,
        equipment: ["cable_machine"]
      },
      {
        name: "Polea Media",
        description: "Poleas a la altura del pecho, énfasis en pectoral medio",
        targetEmphasis: ["mid_chest"],
        difficultyModifier: 0,
        equipment: ["cable_machine"]
      },
      {
        name: "Polea Baja",
        description: "Poleas por debajo de la cintura, énfasis en pectoral superior",
        targetEmphasis: ["upper_chest"],
        difficultyModifier: 0,
        equipment: ["cable_machine"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.isolation,
    executionTips: [
      "Mantén una ligera flexión en los codos",
      "Focaliza la tensión en los pectorales durante todo el movimiento",
      "Ajusta la altura de las poleas según la parte del pecho que quieras enfatizar"
    ]
  }
];

// Biblioteca de ejercicios para espalda
export const BACK_EXERCISES: ExerciseData[] = [
  {
    id: "back-001",
    name: "Dominadas",
    primaryMuscleGroup: "back",
    secondaryMuscleGroups: ["biceps", "forearms", "rear_delts"],
    equipment: ["pull_up_bar"],
    isCompound: true,
    difficulty: "advanced",
    category: "vertical_pull",
    mechanics: "pull",
    alternatives: ["back-002", "back-003", "back-004"],
    variations: [
      {
        name: "Agarre Prono (Normal)",
        description: "Palmas mirando hacia adelante, énfasis en dorsal ancho",
        targetEmphasis: ["lats", "teres_major"],
        difficultyModifier: 0,
        equipment: ["pull_up_bar"]
      },
      {
        name: "Agarre Supino (Chin-up)",
        description: "Palmas mirando hacia ti, mayor énfasis en bíceps",
        targetEmphasis: ["biceps", "lower_lats"],
        difficultyModifier: -0.2,
        equipment: ["pull_up_bar"]
      },
      {
        name: "Agarre Neutro",
        description: "Palmas enfrentadas, posición más natural para los hombros",
        targetEmphasis: ["lats", "biceps"],
        difficultyModifier: -0.1,
        equipment: ["pull_up_bar"]
      },
      {
        name: "Agarre Ancho",
        description: "Manos más separadas que los hombros, mayor énfasis en dorsal ancho",
        targetEmphasis: ["upper_lats", "teres_minor"],
        difficultyModifier: 0.2,
        equipment: ["pull_up_bar"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.upper_body_pull,
    executionTips: [
      "Inicia el movimiento con una retracción escapular",
      "Tira con los codos hacia abajo y ligeramente hacia atrás",
      "Intenta llevar el pecho hacia la barra",
      "Controla la fase excéntrica"
    ]
  },
  {
    id: "back-002",
    name: "Jalón al Pecho",
    primaryMuscleGroup: "back",
    secondaryMuscleGroups: ["biceps", "forearms", "rear_delts"],
    equipment: ["lat_pulldown_machine"],
    isCompound: true,
    difficulty: "beginner",
    category: "vertical_pull",
    mechanics: "pull",
    alternatives: ["back-001", "back-003", "back-004"],
    variations: [
      {
        name: "Agarre Abierto",
        description: "Agarre más ancho que los hombros, énfasis en dorsales",
        targetEmphasis: ["lats", "teres_major"],
        difficultyModifier: 0,
        equipment: ["lat_pulldown_machine"]
      },
      {
        name: "Agarre Cerrado",
        description: "Manos juntas, mayor énfasis en la parte inferior de los dorsales",
        targetEmphasis: ["lower_lats", "rhomboids"],
        difficultyModifier: 0,
        equipment: ["lat_pulldown_machine"]
      },
      {
        name: "Agarre Supino",
        description: "Palmas hacia ti, mayor activación de bíceps",
        targetEmphasis: ["biceps", "lower_lats"],
        difficultyModifier: -0.1,
        equipment: ["lat_pulldown_machine"]
      },
      {
        name: "Agarre en V",
        description: "Usando un accesorio en forma de V, posición neutra para los hombros",
        targetEmphasis: ["mid_back", "lats"],
        difficultyModifier: -0.1,
        equipment: ["lat_pulldown_machine", "v_handle"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.compound_moderate,
    executionTips: [
      "Mantén el pecho elevado y los hombros hacia atrás",
      "Tira de la barra hacia la parte superior del pecho",
      "Lleva los codos hacia abajo y ligeramente hacia atrás",
      "Evita balancear el torso para generar impulso"
    ]
  },
  {
    id: "back-003",
    name: "Remo con Barra",
    primaryMuscleGroup: "back",
    secondaryMuscleGroups: ["biceps", "rear_delts", "traps"],
    equipment: ["barbell"],
    isCompound: true,
    difficulty: "intermediate",
    category: "horizontal_pull",
    mechanics: "pull",
    alternatives: ["back-004", "back-005", "back-006"],
    variations: [
      {
        name: "Agarre Prono",
        description: "Palmas hacia abajo, mayor énfasis en trapecios y romboides",
        targetEmphasis: ["traps", "rhomboids"],
        difficultyModifier: 0,
        equipment: ["barbell"]
      },
      {
        name: "Agarre Supino",
        description: "Palmas hacia arriba, mayor énfasis en dorsales y bíceps",
        targetEmphasis: ["lats", "biceps"],
        difficultyModifier: 0,
        equipment: ["barbell"]
      },
      {
        name: "Pendlay Row",
        description: "Torso paralelo al suelo, mayor énfasis en trapecios medios",
        targetEmphasis: ["mid_traps", "rhomboids"],
        difficultyModifier: 0.3,
        equipment: ["barbell"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.upper_body_pull,
    executionTips: [
      "Mantén la espalda recta y las rodillas ligeramente flexionadas",
      "Tira de la barra hacia el abdomen inferior",
      "Aprieta los omóplatos al final del movimiento",
      "Controla el descenso de la barra"
    ]
  },
  {
    id: "back-004",
    name: "Remo con Mancuerna",
    primaryMuscleGroup: "back",
    secondaryMuscleGroups: ["biceps", "rear_delts", "traps"],
    equipment: ["dumbbell", "bench"],
    isCompound: true,
    difficulty: "beginner",
    category: "horizontal_pull",
    mechanics: "pull",
    alternatives: ["back-003", "back-005", "back-006"],
    variations: [
      {
        name: "Apoyado en Banco",
        description: "Una mano y rodilla apoyadas en banco, mayor estabilidad",
        targetEmphasis: ["lats", "rhomboids"],
        difficultyModifier: 0,
        equipment: ["dumbbell", "bench"]
      },
      {
        name: "Remo a 45°",
        description: "Torso inclinado a 45°, trabajando contra la gravedad",
        targetEmphasis: ["mid_back", "traps"],
        difficultyModifier: 0.1,
        equipment: ["dumbbell"]
      },
      {
        name: "Remo Meadows",
        description: "Codo pegado al cuerpo, mayor énfasis en dorsal",
        targetEmphasis: ["lats", "teres_major"],
        difficultyModifier: 0.2,
        equipment: ["dumbbell"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.compound_moderate,
    executionTips: [
      "Mantén la espalda recta y el núcleo activado",
      "Tira del codo hacia atrás y arriba",
      "Gira ligeramente la muñeca al final del movimiento para mayor activación",
      "Controla el descenso de la mancuerna"
    ]
  },
  {
    id: "back-005",
    name: "Remo en Máquina",
    primaryMuscleGroup: "back",
    secondaryMuscleGroups: ["biceps", "rear_delts"],
    equipment: ["machine"],
    isCompound: true,
    difficulty: "beginner",
    category: "horizontal_pull",
    mechanics: "pull",
    alternatives: ["back-003", "back-004", "back-006"],
    variations: [
      {
        name: "Agarre Ancho",
        description: "Manos separadas, mayor énfasis en parte superior de la espalda",
        targetEmphasis: ["upper_back", "rear_delts"],
        difficultyModifier: 0,
        equipment: ["machine"]
      },
      {
        name: "Agarre Cerrado",
        description: "Manos juntas, mayor énfasis en dorsales",
        targetEmphasis: ["lats", "teres_major"],
        difficultyModifier: 0,
        equipment: ["machine"]
      },
      {
        name: "Agarre Neutro",
        description: "Palmas enfrentadas, posición natural para hombros",
        targetEmphasis: ["mid_back", "rhomboids"],
        difficultyModifier: -0.1,
        equipment: ["machine"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.compound_moderate,
    executionTips: [
      "Ajusta el asiento para que las agarraderas queden a la altura del pecho",
      "Mantén el pecho elevado y los hombros hacia atrás",
      "Tira con los codos, no con los brazos",
      "Aprieta los omóplatos al final del movimiento"
    ]
  },
  {
    id: "back-006",
    name: "Remo en Polea Baja",
    primaryMuscleGroup: "back",
    secondaryMuscleGroups: ["biceps", "rear_delts", "forearms"],
    equipment: ["cable_machine"],
    isCompound: true,
    difficulty: "beginner",
    category: "horizontal_pull",
    mechanics: "pull",
    alternatives: ["back-003", "back-004", "back-005"],
    variations: [
      {
        name: "Agarre Ancho",
        description: "Barra recta con agarre ancho, énfasis en parte superior de la espalda",
        targetEmphasis: ["upper_back", "traps"],
        difficultyModifier: 0,
        equipment: ["cable_machine", "straight_bar"]
      },
      {
        name: "Agarre en V",
        description: "Usando un accesorio en V, posición neutra para los hombros",
        targetEmphasis: ["mid_back", "lats"],
        difficultyModifier: -0.1,
        equipment: ["cable_machine", "v_handle"]
      },
      {
        name: "Agarre Supino",
        description: "Palmas hacia arriba, mayor énfasis en bíceps y dorsales",
        targetEmphasis: ["lats", "biceps"],
        difficultyModifier: 0,
        equipment: ["cable_machine", "straight_bar"]
      },
      {
        name: "Un Brazo",
        description: "Remo con un solo brazo, mayor rango de movimiento",
        targetEmphasis: ["lats", "teres_major"],
        difficultyModifier: 0.1,
        equipment: ["cable_machine", "d_handle"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.compound_moderate,
    executionTips: [
      "Mantén la espalda recta y las rodillas ligeramente flexionadas",
      "Tira del accesorio hacia el abdomen",
      "Mantén los codos cerca del cuerpo",
      "Controla el retorno del peso"
    ]
  }
];

// Biblioteca de ejercicios para piernas
export const LEG_EXERCISES: ExerciseData[] = [
  {
    id: "leg-001",
    name: "Sentadilla con Barra",
    primaryMuscleGroup: "quads",
    secondaryMuscleGroups: ["glutes", "hamstrings", "calves", "core"],
    equipment: ["barbell", "squat_rack"],
    isCompound: true,
    difficulty: "intermediate",
    category: "squat",
    mechanics: "squat",
    alternatives: ["leg-002", "leg-003", "leg-004"],
    variations: [
      {
        name: "Alta (High Bar)",
        description: "Barra apoyada en trapecios, posición más vertical del torso",
        targetEmphasis: ["quads", "glutes"],
        difficultyModifier: 0,
        equipment: ["barbell", "squat_rack"]
      },
      {
        name: "Baja (Low Bar)",
        description: "Barra apoyada más abajo en los deltoides posteriores, mayor inclinación del torso",
        targetEmphasis: ["glutes", "hamstrings"],
        difficultyModifier: 0.2,
        equipment: ["barbell", "squat_rack"]
      },
      {
        name: "Frontal",
        description: "Barra apoyada en deltoides frontales, mayor énfasis en cuádriceps",
        targetEmphasis: ["quads", "core"],
        difficultyModifier: 0.3,
        equipment: ["barbell", "squat_rack"]
      },
      {
        name: "Pausa",
        description: "Pausa de 2-3 segundos en la parte inferior del movimiento",
        targetEmphasis: ["quads", "glutes"],
        difficultyModifier: 0.3,
        equipment: ["barbell", "squat_rack"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.squat_specific,
    executionTips: [
      "Mantén la espalda recta y el pecho elevado",
      "Empuja las rodillas hacia afuera durante el descenso",
      "Desciende hasta que los muslos estén paralelos al suelo o más abajo",
      "Distribuye el peso en todo el pie, con énfasis en el talón y borde externo",
      "Mantén una respiración adecuada: inhala al descender, exhala al subir"
    ]
  },
  {
    id: "leg-002",
    name: "Prensa de Piernas",
    primaryMuscleGroup: "quads",
    secondaryMuscleGroups: ["glutes", "hamstrings"],
    equipment: ["leg_press_machine"],
    isCompound: true,
    difficulty: "beginner",
    category: "machine_compound",
    mechanics: "push",
    alternatives: ["leg-001", "leg-003", "leg-005"],
    variations: [
      {
        name: "Pies Altos",
        description: "Pies colocados en la parte superior de la plataforma, mayor énfasis en glúteos y isquiotibiales",
        targetEmphasis: ["glutes", "hamstrings"],
        difficultyModifier: 0,
        equipment: ["leg_press_machine"]
      },
      {
        name: "Pies Bajos",
        description: "Pies colocados en la parte inferior de la plataforma, mayor énfasis en cuádriceps",
        targetEmphasis: ["quads"],
        difficultyModifier: 0,
        equipment: ["leg_press_machine"]
      },
      {
        name: "Pies Juntos",
        description: "Pies juntos en el centro, mayor énfasis en cuádriceps externos",
        targetEmphasis: ["outer_quads"],
        difficultyModifier: 0,
        equipment: ["leg_press_machine"]
      },
      {
        name: "Pies Separados",
        description: "Pies separados más allá de la anchura de hombros, mayor énfasis en aductores",
        targetEmphasis: ["inner_quads", "adductors"],
        difficultyModifier: 0,
        equipment: ["leg_press_machine"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.compound_moderate,
    executionTips: [
      "Ajusta el asiento para que las rodillas formen un ángulo de 90° en la posición inicial",
      "Mantén la espalda baja pegada al respaldo durante todo el movimiento",
      "No bloquees completamente las rodillas en la parte superior",
      "Controla el descenso del peso"
    ]
  },
  {
    id: "leg-003",
    name: "Extensión de Piernas",
    primaryMuscleGroup: "quads",
    secondaryMuscleGroups: [],
    equipment: ["leg_extension_machine"],
    isCompound: false,
    difficulty: "beginner",
    category: "isolation",
    mechanics: "isolation",
    alternatives: ["leg-001", "leg-002", "leg-006"],
    variations: [
      {
        name: "Estándar",
        description: "Movimiento completo con ambas piernas",
        targetEmphasis: ["quads"],
        difficultyModifier: 0,
        equipment: ["leg_extension_machine"]
      },
      {
        name: "Una Pierna",
        description: "Realizar el ejercicio con una pierna a la vez",
        targetEmphasis: ["quads"],
        difficultyModifier: 0.1,
        equipment: ["leg_extension_machine"]
      },
      {
        name: "Isométrico + Dinámico",
        description: "Mantener contracción isométrica en la parte superior y luego realizar repeticiones",
        targetEmphasis: ["quads"],
        difficultyModifier: 0.3,
        equipment: ["leg_extension_machine"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.leg_isolation,
    executionTips: [
      "Ajusta la máquina para que la rodilla esté alineada con el eje de rotación",
      "Extiende completamente la rodilla en la parte superior",
      "Contrae los cuádriceps en la parte superior del movimiento",
      "Controla el descenso del peso"
    ]
  },
  {
    id: "leg-004",
    name: "Curl Femoral Tumbado",
    primaryMuscleGroup: "hamstrings",
    secondaryMuscleGroups: ["glutes", "calves"],
    equipment: ["leg_curl_machine"],
    isCompound: false,
    difficulty: "beginner",
    category: "isolation",
    mechanics: "isolation",
    alternatives: ["leg-007", "leg-008", "leg-009"],
    variations: [
      {
        name: "Pies Neutros",
        description: "Pies en posición neutra, trabajo equilibrado de isquiotibiales",
        targetEmphasis: ["hamstrings"],
        difficultyModifier: 0,
        equipment: ["leg_curl_machine"]
      },
      {
        name: "Pies Rotados Hacia Dentro",
        description: "Pies rotados hacia dentro, mayor énfasis en porción externa de isquiotibiales",
        targetEmphasis: ["outer_hamstrings"],
        difficultyModifier: 0.1,
        equipment: ["leg_curl_machine"]
      },
      {
        name: "Pies Rotados Hacia Fuera",
        description: "Pies rotados hacia fuera, mayor énfasis en porción interna de isquiotibiales",
        targetEmphasis: ["inner_hamstrings"],
        difficultyModifier: 0.1,
        equipment: ["leg_curl_machine"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.leg_isolation,
    executionTips: [
      "Ajusta la máquina para que la rodilla esté alineada con el eje de rotación",
      "Mantén las caderas pegadas al banco durante todo el movimiento",
      "Contrae los isquiotibiales en la parte superior del movimiento",
      "Controla el retorno del peso"
    ]
  },
  {
    id: "leg-005",
    name: "Peso Muerto",
    primaryMuscleGroup: "hamstrings",
    secondaryMuscleGroups: ["glutes", "lower_back", "traps", "forearms"],
    equipment: ["barbell"],
    isCompound: true,
    difficulty: "advanced",
    category: "hinge",
    mechanics: "hinge",
    alternatives: ["leg-006", "leg-007", "leg-008"],
    variations: [
      {
        name: "Convencional",
        description: "Pies a la anchura de caderas, trabajo equilibrado de toda la cadena posterior",
        targetEmphasis: ["hamstrings", "glutes", "lower_back"],
        difficultyModifier: 0,
        equipment: ["barbell"]
      },
      {
        name: "Sumo",
        description: "Pies más separados que los hombros, mayor énfasis en aductores y glúteos",
        targetEmphasis: ["glutes", "adductors", "quads"],
        difficultyModifier: 0,
        equipment: ["barbell"]
      },
      {
        name: "Rumano",
        description: "Menor flexión de rodillas, mayor énfasis en isquiotibiales",
        targetEmphasis: ["hamstrings", "glutes"],
        difficultyModifier: 0.1,
        equipment: ["barbell"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.deadlift_specific,
    executionTips: [
      "Mantén la espalda recta y el pecho elevado",
      "Inicia el movimiento con flexión de caderas, no de espalda",
      "Mantén la barra cerca del cuerpo durante todo el movimiento",
      "Extiende completamente las caderas en la parte superior",
      "Contrae los glúteos al final del movimiento"
    ]
  },
  {
    id: "leg-006",
    name: "Zancada",
    primaryMuscleGroup: "quads",
    secondaryMuscleGroups: ["glutes", "hamstrings", "calves", "core"],
    equipment: ["dumbbells"],
    isCompound: true,
    difficulty: "intermediate",
    category: "lunge",
    mechanics: "squat",
    alternatives: ["leg-001", "leg-002", "leg-010"],
    variations: [
      {
        name: "Estática",
        description: "Posición fija, sin avanzar",
        targetEmphasis: ["quads", "glutes"],
        difficultyModifier: 0,
        equipment: ["dumbbells"]
      },
      {
        name: "Caminando",
        description: "Avanzando con cada repetición",
        targetEmphasis: ["quads", "glutes", "core"],
        difficultyModifier: 0.2,
        equipment: ["dumbbells"]
      },
      {
        name: "Reversa",
        description: "Paso hacia atrás, menor estrés en rodillas",
        targetEmphasis: ["glutes", "hamstrings"],
        difficultyModifier: 0.1,
        equipment: ["dumbbells"]
      },
      {
        name: "Lateral",
        description: "Paso hacia el lado, mayor énfasis en aductores",
        targetEmphasis: ["adductors", "glutes"],
        difficultyModifier: 0.2,
        equipment: ["dumbbells"]
      }
    ],
    warmupProtocol: WARMUP_PROTOCOLS.compound_moderate,
    executionTips: [
      "Mantén el torso erguido",
      "La rodilla delantera debe estar alineada con el pie",
      "Desciende hasta que la rodilla trasera casi toque el suelo",
      "Empuja a través del talón de la pierna delantera para volver a la posición inicial"
    ]
  }
];

// Exportar todas las categorías de ejercicios
export const EXERCISE_LIBRARY = [
  ...CHEST_EXERCISES,
  ...BACK_EXERCISES,
  ...LEG_EXERCISES,
  // Añadir más categorías aquí
];

// Función para obtener ejercicios por grupo muscular
export function getExercisesByMuscleGroup(muscleGroup: string): ExerciseData[] {
  return EXERCISE_LIBRARY.filter(exercise =>
    exercise.primaryMuscleGroup === muscleGroup ||
    exercise.secondaryMuscleGroups.includes(muscleGroup)
  );
}

// Función para obtener ejercicios alternativos
export function getAlternativeExercises(exerciseId: string): ExerciseData[] {
  const exercise = EXERCISE_LIBRARY.find(ex => ex.id === exerciseId);
  if (!exercise) return [];

  return exercise.alternatives
    .map(altId => EXERCISE_LIBRARY.find(ex => ex.id === altId))
    .filter(ex => ex !== undefined) as ExerciseData[];
}

// Función para obtener protocolo de calentamiento
export function getWarmupProtocol(exerciseId: string, workingWeight: number): WarmupSet[] {
  const exercise = EXERCISE_LIBRARY.find(ex => ex.id === exerciseId);
  if (!exercise || !exercise.warmupProtocol) return [];

  // Función para redondear el peso a incrementos de 2.5kg o 5lb
  const roundWeight = (weight: number, increment: number = 2.5): number => {
    return Math.round(weight / increment) * increment;
  };

  return exercise.warmupProtocol.specificWarmup.map(set => {
    // Si el porcentaje es 0, usar peso corporal o barra vacía (20kg/45lb)
    const calculatedWeight = set.percentage === 0
      ? 20 // Barra vacía (o 0 para ejercicios con peso corporal)
      : roundWeight(workingWeight * (set.percentage / 100));

    return {
      ...set,
      // Calcular el peso real basado en el porcentaje y el peso de trabajo
      percentage: set.percentage,
      calculatedWeight: calculatedWeight,
      reps: set.reps,
      restSeconds: set.restSeconds
    };
  });
}

// Función para obtener ejercicios de movilidad para calentamiento
export function getWarmupMobilityExercises(exerciseId: string): string[] {
  const exercise = EXERCISE_LIBRARY.find(ex => ex.id === exerciseId);
  if (!exercise || !exercise.warmupProtocol || !exercise.warmupProtocol.mobilityExercises) {
    return [];
  }

  return exercise.warmupProtocol.mobilityExercises;
}
