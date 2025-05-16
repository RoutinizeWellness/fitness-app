import { v4 as uuidv4 } from 'uuid';
import { Exercise } from '../lib/supabase';

// Categorías principales de ejercicios
const CATEGORIES = [
  'Fuerza',
  'Cardio',
  'Flexibilidad',
  'Equilibrio',
  'Funcional',
  'Pliometría',
  'Isométrico',
  'Rehabilitación'
];

// Subcategorías por categoría principal
const SUB_CATEGORIES: Record<string, string[]> = {
  'Fuerza': [
    'Hipertrofia',
    'Fuerza máxima',
    'Resistencia muscular',
    'Potencia',
    'Fuerza-resistencia'
  ],
  'Cardio': [
    'HIIT',
    'LISS',
    'Tabata',
    'Intervalos',
    'Steady state'
  ],
  'Flexibilidad': [
    'Estiramiento estático',
    'Estiramiento dinámico',
    'PNF',
    'Movilidad articular',
    'Yoga'
  ],
  'Equilibrio': [
    'Estabilidad',
    'Propiocepción',
    'Coordinación',
    'Equilibrio unilateral',
    'Core'
  ],
  'Funcional': [
    'Movimientos compuestos',
    'Entrenamiento metabólico',
    'Circuito',
    'CrossFit',
    'Movimientos olímpicos'
  ],
  'Pliometría': [
    'Saltos',
    'Lanzamientos',
    'Rebotes',
    'Reactivo',
    'Explosivo'
  ],
  'Isométrico': [
    'Plancha',
    'Contracción estática',
    'Tiempo bajo tensión',
    'Postura',
    'Estabilización'
  ],
  'Rehabilitación': [
    'Terapéutico',
    'Correctivo',
    'Preventivo',
    'Recuperación',
    'Movilidad'
  ]
};

// Grupos musculares principales
const MUSCLE_GROUPS = [
  'Pecho',
  'Espalda',
  'Hombros',
  'Bíceps',
  'Tríceps',
  'Antebrazos',
  'Cuádriceps',
  'Isquiotibiales',
  'Glúteos',
  'Pantorrillas',
  'Abdominales',
  'Oblicuos',
  'Lumbares',
  'Core',
  'Trapecio',
  'Aductores',
  'Abductores'
];

// Equipamiento
const EQUIPMENT = [
  'Ninguno',
  'Mancuernas',
  'Barra',
  'Máquina',
  'Polea',
  'Kettlebell',
  'Bandas elásticas',
  'TRX',
  'Balón medicinal',
  'Fitball',
  'Step',
  'Bosu',
  'Anillas',
  'Cuerda',
  'Foam roller',
  'Banco',
  'Barra dominadas',
  'Paralelas',
  'Discos',
  'Saco de boxeo'
];

// Niveles de dificultad
const DIFFICULTY_LEVELS = [
  'Principiante',
  'Intermedio',
  'Avanzado',
  'Experto'
];

// Patrones de movimiento
const MOVEMENT_PATTERNS = [
  'Empuje horizontal',
  'Empuje vertical',
  'Tracción horizontal',
  'Tracción vertical',
  'Bisagra de cadera',
  'Sentadilla',
  'Zancada',
  'Rotación',
  'Anti-rotación',
  'Transportar',
  'Lanzar',
  'Saltar'
];

// Tipos de fuerza
const FORCE_TYPES = [
  'Empuje',
  'Tracción',
  'Flexión',
  'Extensión',
  'Rotación',
  'Anti-rotación',
  'Abducción',
  'Aducción'
];

// Mecánicas
const MECHANICS = [
  'Compuesto',
  'Aislamiento',
  'Unilateral',
  'Bilateral',
  'Multiarticular',
  'Monoarticular'
];

// Ejercicios base por grupo muscular
const BASE_EXERCISES: Record<string, string[]> = {
  'Pecho': [
    'Press de banca', 'Press inclinado', 'Press declinado', 'Aperturas', 'Fondos',
    'Pull-over', 'Press con mancuernas', 'Flexiones', 'Crossover en polea', 'Pec deck'
  ],
  'Espalda': [
    'Dominadas', 'Remo con barra', 'Remo con mancuerna', 'Jalón al pecho', 'Remo en T',
    'Pull-over', 'Hiperextensiones', 'Remo en máquina', 'Jalón en polea', 'Face pull'
  ],
  'Hombros': [
    'Press militar', 'Elevaciones laterales', 'Elevaciones frontales', 'Pájaro', 'Press Arnold',
    'Remo al mentón', 'Press con mancuernas', 'Encogimientos de hombros', 'Elevaciones posteriores', 'Push press'
  ],
  'Bíceps': [
    'Curl con barra', 'Curl con mancuernas', 'Curl martillo', 'Curl concentrado', 'Curl Scott',
    'Curl en polea', 'Curl 21s', 'Curl inclinado', 'Curl araña', 'Curl Zottman'
  ],
  'Tríceps': [
    'Press francés', 'Extensiones en polea', 'Fondos en banco', 'Patada de tríceps', 'Press cerrado',
    'Extensión sobre cabeza', 'Extensión con mancuerna', 'Fondos en paralelas', 'Extensión en máquina', 'Skull crusher'
  ],
  'Antebrazos': [
    'Curl de muñeca', 'Extensión de muñeca', 'Curl inverso', 'Agarre con pinza', 'Rotación de muñeca',
    'Curl de dedos', 'Extensión de dedos', 'Agarre con barra', 'Rodillo de muñeca', 'Farmer walk'
  ],
  'Cuádriceps': [
    'Sentadilla', 'Prensa de piernas', 'Extensión de piernas', 'Zancada', 'Sentadilla frontal',
    'Sentadilla búlgara', 'Hack squat', 'Pistol squat', 'Sentadilla sumo', 'Step-up'
  ],
  'Isquiotibiales': [
    'Peso muerto', 'Curl femoral', 'Buenos días', 'Peso muerto rumano', 'Puente de glúteos',
    'Peso muerto a una pierna', 'Curl nórdico', 'Glute-ham raise', 'Extensión de cadera', 'Zancada inversa'
  ],
  'Glúteos': [
    'Hip thrust', 'Patada de glúteo', 'Elevación de cadera', 'Sentadilla sumo', 'Abducción de cadera',
    'Puente de glúteos', 'Peso muerto', 'Zancada', 'Step-up', 'Sentadilla búlgara'
  ],
  'Pantorrillas': [
    'Elevación de talones de pie', 'Elevación de talones sentado', 'Burro calf raise', 'Prensa de pantorrillas', 'Saltos',
    'Elevación unilateral', 'Elevación en máquina', 'Elevación en prensa', 'Elevación en step', 'Skipping'
  ],
  'Abdominales': [
    'Crunch', 'Plancha', 'Elevación de piernas', 'Russian twist', 'Rueda abdominal',
    'Crunch inverso', 'Hollow hold', 'Dragon flag', 'Crunch en polea', 'Sit-up'
  ],
  'Oblicuos': [
    'Russian twist', 'Flexión lateral', 'Plancha lateral', 'Windshield wiper', 'Crunch oblicuo',
    'Elevación de piernas lateral', 'Woodchopper', 'Pallof press', 'Rotación con cable', 'Bicicleta'
  ],
  'Lumbares': [
    'Hiperextensión', 'Superman', 'Good morning', 'Bird dog', 'Extensión en máquina',
    'Plancha inversa', 'Natación', 'Puente lateral', 'Extensión de cadera', 'Deadbug'
  ],
  'Core': [
    'Plancha', 'Hollow hold', 'Pallof press', 'Rueda abdominal', 'Deadbug',
    'Bird dog', 'Dragonflag', 'Plancha lateral', 'Turkish get-up', 'Windmill'
  ],
  'Trapecio': [
    'Encogimiento de hombros', 'Remo al mentón', 'Elevación de hombros', 'Farmer walk', 'Encogimiento con barra',
    'Encogimiento con mancuernas', 'Face pull', 'Remo en T', 'Encogimiento en máquina', 'Upright row'
  ],
  'Aductores': [
    'Aducción en máquina', 'Sentadilla sumo', 'Aducción con banda', 'Aducción en suelo', 'Copenhagen plank',
    'Aducción en cable', 'Sentadilla pliométrica', 'Aducción con fitball', 'Aducción isométrica', 'Zancada lateral'
  ],
  'Abductores': [
    'Abducción en máquina', 'Elevación lateral de pierna', 'Abducción con banda', 'Sentadilla lateral', 'Clamshell',
    'Abducción en cable', 'Fire hydrant', 'Abducción en suelo', 'Abducción con fitball', 'Zancada lateral'
  ]
};

// Variaciones de ejercicios
const VARIATIONS = [
  'con mancuernas', 'con barra', 'en máquina', 'con bandas elásticas', 'con kettlebell',
  'unilateral', 'isométrico', 'excéntrico', 'en banco inclinado', 'en banco declinado',
  'con agarre cerrado', 'con agarre abierto', 'con agarre neutro', 'con agarre supino', 'con agarre prono',
  'con salto', 'con pausa', 'con cadenas', 'con resistencia variable', 'con tempo lento',
  'en TRX', 'en bosu', 'en fitball', 'en step', 'en anillas',
  'con peso corporal', 'asistido', 'lastrado', 'pliométrico', 'balístico'
];

// Consejos generales para ejercicios
const GENERAL_TIPS = [
  'Mantén la espalda recta durante todo el movimiento.',
  'Respira correctamente: exhala en el esfuerzo, inhala en la recuperación.',
  'Mantén el core activado para proteger la columna.',
  'Controla el movimiento tanto en la fase concéntrica como en la excéntrica.',
  'No bloquees las articulaciones al extender completamente.',
  'Mantén una buena postura y alineación corporal.',
  'Concéntrate en la conexión mente-músculo.',
  'Utiliza un rango de movimiento completo para maximizar los beneficios.',
  'Ajusta el peso según tu nivel de fuerza y experiencia.',
  'Mantén un ritmo controlado sin usar impulso.',
  'Asegúrate de calentar adecuadamente antes de realizar este ejercicio.',
  'Aumenta el peso gradualmente a medida que mejora tu técnica.',
  'Mantén las muñecas en posición neutral para evitar lesiones.',
  'Distribuye el peso uniformemente en ambos lados del cuerpo.',
  'Mantén la tensión muscular durante todo el movimiento.',
  'Evita compensaciones con otros grupos musculares.',
  'Mantén la mirada al frente para una correcta alineación de la columna.',
  'Ajusta el equipamiento a tu anatomía y nivel de movilidad.',
  'Realiza el ejercicio con control y precisión, no con velocidad.',
  'Descansa lo suficiente entre series para una recuperación adecuada.'
];

// Función para generar un ejercicio aleatorio
export function generateRandomExercise(): Exercise {
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const subCategories = SUB_CATEGORIES[category];
  const subCategory = subCategories[Math.floor(Math.random() * subCategories.length)];

  const muscleGroup = MUSCLE_GROUPS[Math.floor(Math.random() * MUSCLE_GROUPS.length)];
  const baseExercises = BASE_EXERCISES[muscleGroup];
  const baseExercise = baseExercises[Math.floor(Math.random() * baseExercises.length)];

  // Decidir si añadir una variación
  const addVariation = Math.random() > 0.3;
  const variation = addVariation ? VARIATIONS[Math.floor(Math.random() * VARIATIONS.length)] : '';

  const name = addVariation ? `${baseExercise} ${variation}` : baseExercise;

  // Generar grupos musculares secundarios (0-3)
  const numSecondaryMuscles = Math.floor(Math.random() * 4);
  const secondaryMuscleGroups: string[] = [];
  const availableMuscles = MUSCLE_GROUPS.filter(m => m !== muscleGroup);

  for (let i = 0; i < numSecondaryMuscles; i++) {
    if (availableMuscles.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableMuscles.length);
      secondaryMuscleGroups.push(availableMuscles[randomIndex]);
      availableMuscles.splice(randomIndex, 1);
    }
  }

  // Generar equipamiento
  const equipment = EQUIPMENT[Math.floor(Math.random() * EQUIPMENT.length)];

  // Generar dificultad
  const difficulty = DIFFICULTY_LEVELS[Math.floor(Math.random() * DIFFICULTY_LEVELS.length)];

  // Generar patrón de movimiento
  const movementPattern = MOVEMENT_PATTERNS[Math.floor(Math.random() * MOVEMENT_PATTERNS.length)];

  // Generar tipo de fuerza
  const forceType = FORCE_TYPES[Math.floor(Math.random() * FORCE_TYPES.length)];

  // Generar mecánica
  const mechanics = MECHANICS[Math.floor(Math.random() * MECHANICS.length)];

  // Generar si es compuesto
  const isCompound = mechanics === 'Compuesto' || mechanics === 'Multiarticular';

  // Generar calorías quemadas (5-20 por minuto)
  const caloriesBurned = Math.floor(Math.random() * 16) + 5;

  // Generar popularidad (1-100)
  const popularity = Math.floor(Math.random() * 100) + 1;

  // Generar valoración media (3-5)
  const averageRating = (Math.random() * 2) + 3;

  // Generar etiquetas
  const numTags = Math.floor(Math.random() * 5) + 1;
  const tags = [category, muscleGroup, difficulty];
  if (subCategory) tags.push(subCategory);
  if (equipment !== 'Ninguno') tags.push(equipment);

  // Generar descripción más detallada
  let description = '';

  // Descripciones específicas por grupo muscular
  const muscleDescriptions: Record<string, string[]> = {
    'Pecho': [
      `${name} es un ejercicio ${mechanics.toLowerCase()} que desarrolla principalmente los músculos pectorales, con énfasis en ${subCategory?.toLowerCase() || 'fuerza e hipertrofia'}.`,
      `Excelente ejercicio para desarrollar la fuerza y tamaño del pecho, involucrando también hombros y tríceps como músculos secundarios.`,
      `Este ejercicio de ${difficulty.toLowerCase()} nivel trabaja el pecho desde un ángulo óptimo, permitiendo una gran activación muscular y desarrollo.`
    ],
    'Espalda': [
      `${name} es un potente ejercicio para desarrollar la musculatura de la espalda, enfocándose en ${secondaryMuscleGroups?.join(', ') || 'múltiples grupos musculares'}.`,
      `Este movimiento de ${category.toLowerCase()} fortalece la espalda y mejora la postura, trabajando desde los trapecios hasta los lumbares.`,
      `Ejercicio completo para desarrollar anchura y grosor en la espalda, fundamental en cualquier rutina de entrenamiento de fuerza.`
    ],
    'Hombros': [
      `${name} es ideal para desarrollar deltoides ${forceType === 'Empuje' ? 'anteriores y medios' : 'posteriores y medios'}, mejorando la definición y fuerza del hombro.`,
      `Excelente ejercicio para aumentar el tamaño y la fuerza de los hombros, creando una apariencia más amplia en la parte superior del cuerpo.`,
      `Este movimiento de ${difficulty.toLowerCase()} nivel aísla efectivamente los deltoides, permitiendo un desarrollo óptimo de los hombros.`
    ]
  };

  // Si tenemos una descripción específica para el grupo muscular, la usamos
  if (muscleDescriptions[muscleGroup]) {
    const specificDescriptions = muscleDescriptions[muscleGroup];
    description = specificDescriptions[Math.floor(Math.random() * specificDescriptions.length)];
  } else {
    // Descripción genérica mejorada
    const genericDescriptions = [
      `${name} es un ejercicio ${mechanics.toLowerCase()} de ${difficulty.toLowerCase()} nivel que trabaja principalmente ${muscleGroup.toLowerCase()}, ideal para ${isCompound ? 'desarrollar fuerza y masa muscular' : 'tonificar y definir'}.`,
      `Este ejercicio de ${category.toLowerCase()} se enfoca en ${muscleGroup.toLowerCase()}, involucrando también ${secondaryMuscleGroups?.join(' y ') || 'otros grupos musculares'} como apoyo, perfecto para rutinas de ${subCategory?.toLowerCase() || 'entrenamiento general'}.`,
      `${name} es una excelente opción para quienes buscan mejorar su ${isCompound ? 'fuerza funcional' : 'definición muscular'} en ${muscleGroup.toLowerCase()}, con un nivel de dificultad ${difficulty.toLowerCase()}.`,
      `Ejercicio ${mechanics.toLowerCase()} que enfatiza el desarrollo de ${muscleGroup.toLowerCase()}, utilizando ${equipment.toLowerCase()} como resistencia principal, ideal para rutinas de ${subCategory?.toLowerCase() || category.toLowerCase()}.`,
      `Perfecto para mejorar la ${isCompound ? 'fuerza y potencia' : 'resistencia y definición'} en ${muscleGroup.toLowerCase()}, este ejercicio de ${difficulty.toLowerCase()} nivel es fundamental en programas de entrenamiento de ${category.toLowerCase()}.`
    ];
    description = genericDescriptions[Math.floor(Math.random() * genericDescriptions.length)];
  }

  // Generar instrucciones más detalladas y específicas
  let instructionsBase: string[] = [];

  // Instrucciones específicas por tipo de ejercicio
  if (category === 'Fuerza' && equipment !== 'Ninguno') {
    instructionsBase = [
      `1. Prepara el ${equipment.toLowerCase()} con un peso adecuado para tu nivel de fuerza.`,
      `2. Adopta una postura estable con los pies a la anchura de los hombros y el core activado.`,
      `3. Realiza el movimiento controlando tanto la fase concéntrica (esfuerzo) como la excéntrica (retorno).`,
      `4. Mantén una respiración adecuada: exhala durante el esfuerzo e inhala durante el retorno.`,
      `5. Completa el número de repeticiones establecido manteniendo la técnica correcta en todo momento.`
    ];
  } else if (category === 'Cardio') {
    instructionsBase = [
      `1. Comienza con un breve calentamiento de 3-5 minutos a intensidad baja.`,
      `2. Incrementa gradualmente la intensidad hasta alcanzar tu zona de entrenamiento objetivo.`,
      `3. Mantén un ritmo constante o sigue los intervalos indicados según el tipo de entrenamiento.`,
      `4. Controla tu respiración y mantén una postura adecuada durante todo el ejercicio.`,
      `5. Finaliza con una fase de enfriamiento reduciendo gradualmente la intensidad.`
    ];
  } else if (category === 'Flexibilidad') {
    instructionsBase = [
      `1. Adopta la posición inicial de forma lenta y controlada.`,
      `2. Lleva el estiramiento hasta el punto de tensión, sin llegar al dolor.`,
      `3. Mantén la posición durante 20-30 segundos, respirando profundamente.`,
      `4. Relaja y repite el estiramiento, intentando aumentar ligeramente el rango de movimiento.`,
      `5. Realiza el ejercicio de forma bilateral para mantener el equilibrio muscular.`
    ];
  } else {
    // Instrucciones genéricas mejoradas
    instructionsBase = [
      `1. Colócate en posición inicial con ${equipment === 'Ninguno' ? 'el cuerpo alineado y estable' : 'el ' + equipment.toLowerCase() + ' en posición correcta'}.`,
      `2. Mantén la espalda recta, el core activado y las articulaciones ligeramente flexionadas para protegerlas.`,
      `3. Realiza el movimiento de forma controlada, prestando atención a la técnica y al rango de movimiento completo.`,
      `4. Regresa a la posición inicial de forma controlada, resistiendo la fase excéntrica del movimiento.`,
      `5. Repite el ejercicio por el número de repeticiones o tiempo establecido, manteniendo la calidad del movimiento.`
    ];
  }

  // Generar consejos
  const numTips = Math.floor(Math.random() * 3) + 1;
  const tips: string[] = [];
  const availableTips = [...GENERAL_TIPS];

  for (let i = 0; i < numTips; i++) {
    if (availableTips.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableTips.length);
      tips.push(availableTips[randomIndex]);
      availableTips.splice(randomIndex, 1);
    }
  }

  // Generar variaciones
  const numVariations = Math.floor(Math.random() * 3);
  const exerciseVariations: string[] = [];

  for (let i = 0; i < numVariations; i++) {
    const variationText = VARIATIONS[Math.floor(Math.random() * VARIATIONS.length)];
    exerciseVariations.push(`${baseExercise} ${variationText}`);
  }

  // Generar URL de imagen más específica y realista
  const imageNum = Math.floor(Math.random() * 1000) + 1;
  const imageKeywords = [muscleGroup, category, name.split(' ')[0], 'exercise', 'workout', 'fitness'];
  const randomKeywords = imageKeywords.slice(0, 3).join(',');

  // Asegurarnos de que todos los ejercicios tengan imagen
  const imageUrl = `https://source.unsplash.com/featured/800x600?${encodeURIComponent(randomKeywords)},${imageNum}`;

  // Lista de IDs de videos de ejercicios reales en YouTube
  const videoIds = [
    'vC0dJ3qks8o', 'IODxDxX7oi4', 'DHOPWvO3ZcI', 'YaXPRqUwItQ',
    '2pLT-olgUJs', 'vthMCtgVtFw', 'Dy28eq2PjcM', '1fbU_MkV7NE',
    'eGo4IYlbE5g', 'rT7DgCr-3pg', 'U8HRf51V-aY', 'bEv6CCg2BC8',
    'ASdvN_XEl_c', 'DHvYvRCEkUk', 'Plh1CyiEbDQ', 'YQmpO9VT2X4',
    '3p8EBPVZ2Iw', 'jv31A4Ab4wA', 'dJlFmxiL11Q', 'VmB1G1K7v94',
    'HB8QBk7RN9w', 'Xns7xUpXsNI', 'JDcdhTuycOI', 'U4s4mEQ5VqU',
    '6kALZikXxLc', 'JB2oyawG4KI', '2Q2LzPaIDe0', 'YnxHyBbYXPE',
    // Añadimos más IDs de videos para tener mayor variedad
    'ml6cT4AZdqI', 'CnFPO-j4-4w', 'XxWbfYs1JRQ', 'Gu7xYkboIDI',
    'eMJITr3dpYU', 'Vzo-EL_62fQ', 'eE7rw_7-hPs', 'JOQJf0GyNRE',
    'Qo0lbWhYLys', 'Yz8fDytQx5c', 'Yz-q9ADrCik', 'UKwkChzThMg',
    'dFf82MDr5K0', 'rxEMKXW0YlU', 'zcQ2cwsMIpI', 'JDWKJvvTlNA',
    'Qo3Zqu8pOSs', 'Yz-q9ADrCik', 'UKwkChzThMg', 'dFf82MDr5K0',
    'rxEMKXW0YlU', 'zcQ2cwsMIpI', 'JDWKJvvTlNA', 'Qo3Zqu8pOSs'
  ];

  // Asegurarnos de que todos los ejercicios tengan video
  const videoUrl = `https://www.youtube.com/watch?v=${videoIds[Math.floor(Math.random() * videoIds.length)]}`;

  return {
    id: uuidv4(),
    name,
    muscle_group: muscleGroup,
    secondary_muscle_groups: secondaryMuscleGroups.length > 0 ? secondaryMuscleGroups : null,
    category,
    sub_category: subCategory,
    difficulty,
    equipment,
    description,
    image_url: imageUrl, // Aseguramos que todos tengan imagen
    video_url: videoUrl, // Aseguramos que todos tengan video
    instructions: instructionsBase.join('\n'),
    tips: tips.join('\n'),
    variations: exerciseVariations.length > 0 ? exerciseVariations : null,
    calories_burned: caloriesBurned,
    is_compound: isCompound,
    movement_pattern: movementPattern,
    force_type: forceType,
    mechanics,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    popularity,
    average_rating: parseFloat(averageRating.toFixed(1)),
    tags: tags
  };
}

// Función para generar múltiples ejercicios
export function generateExercises(count: number): Exercise[] {
  const exercises: Exercise[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let exercise = generateRandomExercise();

    // Asegurarse de que no haya nombres duplicados
    while (usedNames.has(exercise.name)) {
      exercise = generateRandomExercise();
    }

    usedNames.add(exercise.name);
    exercises.push(exercise);
  }

  return exercises;
}

// Exportar función principal
export default generateExercises;
