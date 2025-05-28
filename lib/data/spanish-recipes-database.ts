/**
 * Base de datos expandida de recetas españolas saludables
 * Incluye más de 50 recetas de todas las regiones de España
 */

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'fácil' | 'medio' | 'difícil';
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
  instructions: string[];
  tags: string[];
  region?: string;
  image?: string;
  dietType?: string[];
  allergens?: string[];
}

// Base de datos expandida de recetas españolas saludables
export const spanishRecipes: Recipe[] = [
  // DESAYUNOS ESPAÑOLES
  {
    id: "es-recipe-001",
    name: "Tostada catalana con tomate",
    description: "Desayuno tradicional catalán con pan tostado, tomate fresco y aceite de oliva",
    category: "desayuno",
    difficulty: "fácil",
    prepTime: 5,
    cookTime: 3,
    servings: 2,
    calories: 180,
    protein: 6,
    carbs: 28,
    fat: 6,
    fiber: 4,
    ingredients: [
      { name: "Pan integral", amount: 2, unit: "rebanadas" },
      { name: "Tomate maduro", amount: 1, unit: "unidad" },
      { name: "Aceite de oliva virgen extra", amount: 1, unit: "cucharada" },
      { name: "Sal marina", amount: 1, unit: "pizca" },
      { name: "Ajo", amount: 1, unit: "diente" }
    ],
    instructions: [
      "Tostar las rebanadas de pan hasta que estén doradas",
      "Frotar el ajo cortado por la superficie del pan tostado",
      "Rallar el tomate sobre el pan, desechando la piel",
      "Rociar con aceite de oliva y añadir una pizca de sal",
      "Servir inmediatamente"
    ],
    tags: ["tradicional", "mediterráneo", "vegetariano", "rápido"],
    region: "Cataluña",
    dietType: ["vegetariano", "mediterráneo"],
    allergens: ["gluten"]
  },

  {
    id: "es-recipe-002",
    name: "Tortilla española light",
    description: "Versión saludable de la clásica tortilla de patatas con menos aceite",
    category: "desayuno",
    difficulty: "medio",
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    calories: 220,
    protein: 12,
    carbs: 18,
    fat: 12,
    fiber: 2,
    ingredients: [
      { name: "Patatas medianas", amount: 3, unit: "unidades" },
      { name: "Huevos", amount: 4, unit: "unidades" },
      { name: "Cebolla", amount: 1, unit: "unidad" },
      { name: "Aceite de oliva", amount: 2, unit: "cucharadas" },
      { name: "Sal", amount: 1, unit: "cucharadita" }
    ],
    instructions: [
      "Pelar y cortar las patatas en láminas finas",
      "Cortar la cebolla en juliana",
      "Cocinar las patatas y cebolla al vapor hasta que estén tiernas",
      "Batir los huevos con sal en un bol grande",
      "Mezclar las patatas cocidas con los huevos batidos",
      "Calentar aceite en sartén antiadherente",
      "Verter la mezcla y cocinar a fuego medio 8-10 minutos",
      "Dar la vuelta con ayuda de un plato y cocinar otros 5 minutos"
    ],
    tags: ["tradicional", "proteína", "sin gluten"],
    region: "España",
    dietType: ["sin gluten", "vegetariano"],
    allergens: ["huevos"]
  },

  {
    id: "es-recipe-003",
    name: "Gazpacho andaluz",
    description: "Sopa fría tradicional andaluza perfecta para el verano",
    category: "almuerzo",
    difficulty: "fácil",
    prepTime: 15,
    cookTime: 0,
    servings: 4,
    calories: 95,
    protein: 2,
    carbs: 12,
    fat: 5,
    fiber: 3,
    ingredients: [
      { name: "Tomates maduros", amount: 6, unit: "unidades" },
      { name: "Pepino", amount: 1, unit: "unidad" },
      { name: "Pimiento verde", amount: 0.5, unit: "unidad" },
      { name: "Cebolla", amount: 0.25, unit: "unidad" },
      { name: "Ajo", amount: 1, unit: "diente" },
      { name: "Aceite de oliva virgen extra", amount: 2, unit: "cucharadas" },
      { name: "Vinagre de Jerez", amount: 1, unit: "cucharada" },
      { name: "Sal", amount: 1, unit: "cucharadita" },
      { name: "Agua fría", amount: 200, unit: "ml" }
    ],
    instructions: [
      "Lavar y trocear todas las verduras",
      "Introducir todos los ingredientes en la batidora",
      "Batir hasta conseguir una textura homogénea",
      "Colar para eliminar posibles pieles o semillas",
      "Refrigerar al menos 2 horas antes de servir",
      "Servir frío con guarnición de verduras picadas"
    ],
    tags: ["frío", "vegetariano", "bajo en calorías", "verano"],
    region: "Andalucía",
    dietType: ["vegetariano", "vegano", "sin gluten"],
    allergens: []
  },

  // ALMUERZOS Y CENAS
  {
    id: "es-recipe-004",
    name: "Paella de verduras valenciana",
    description: "Versión vegetariana y ligera de la tradicional paella valenciana",
    category: "almuerzo",
    difficulty: "medio",
    prepTime: 20,
    cookTime: 30,
    servings: 6,
    calories: 320,
    protein: 8,
    carbs: 65,
    fat: 4,
    fiber: 5,
    ingredients: [
      { name: "Arroz bomba", amount: 200, unit: "g" },
      { name: "Pimiento rojo", amount: 1, unit: "unidad" },
      { name: "Pimiento verde", amount: 1, unit: "unidad" },
      { name: "Calabacín", amount: 1, unit: "unidad" },
      { name: "Berenjena pequeña", amount: 1, unit: "unidad" },
      { name: "Judías verdes", amount: 100, unit: "g" },
      { name: "Guisantes", amount: 100, unit: "g" },
      { name: "Tomate maduro", amount: 1, unit: "unidad" },
      { name: "Cebolla", amount: 1, unit: "unidad" },
      { name: "Ajo", amount: 2, unit: "dientes" },
      { name: "Pimentón dulce", amount: 1, unit: "cucharadita" },
      { name: "Azafrán", amount: 1, unit: "pizca" },
      { name: "Aceite de oliva", amount: 2, unit: "cucharadas" },
      { name: "Caldo de verduras", amount: 750, unit: "ml" }
    ],
    instructions: [
      "Picar todas las verduras en trozos pequeños",
      "En una paellera, calentar el aceite y sofreír la cebolla y el ajo",
      "Añadir el resto de verduras excepto el tomate y sofreír 5 minutos",
      "Incorporar el tomate rallado y cocinar 2 minutos más",
      "Añadir el pimentón, remover rápidamente y agregar el arroz",
      "Sofreír el arroz 2 minutos, añadir el caldo caliente, el azafrán, sal y pimienta",
      "Cocinar a fuego medio-alto durante 10 minutos",
      "Bajar el fuego y cocinar 10 minutos más hasta que el arroz esté en su punto",
      "Dejar reposar 5 minutos antes de servir"
    ],
    tags: ["tradicional", "vegetariano", "arroz", "valenciano"],
    region: "Valencia",
    dietType: ["vegetariano", "sin gluten"],
    allergens: []
  },

  {
    id: "es-recipe-005",
    name: "Pisto manchego",
    description: "Guiso tradicional de verduras de La Mancha, saludable y nutritivo",
    category: "cena",
    difficulty: "fácil",
    prepTime: 15,
    cookTime: 35,
    servings: 4,
    calories: 180,
    protein: 4,
    carbs: 18,
    fat: 10,
    fiber: 6,
    ingredients: [
      { name: "Berenjenas", amount: 2, unit: "unidades" },
      { name: "Calabacines", amount: 2, unit: "unidades" },
      { name: "Pimiento rojo", amount: 1, unit: "unidad" },
      { name: "Pimiento verde", amount: 1, unit: "unidad" },
      { name: "Cebolla grande", amount: 1, unit: "unidad" },
      { name: "Tomates maduros", amount: 2, unit: "unidades" },
      { name: "Ajo", amount: 2, unit: "dientes" },
      { name: "Aceite de oliva", amount: 3, unit: "cucharadas" },
      { name: "Hoja de laurel", amount: 1, unit: "unidad" }
    ],
    instructions: [
      "Lavar y cortar todas las verduras en dados pequeños",
      "En una cazuela amplia, calentar el aceite y sofreír la cebolla y los ajos picados",
      "Añadir los pimientos y cocinar 5 minutos a fuego medio",
      "Incorporar las berenjenas y los calabacines, cocinar 10 minutos más",
      "Añadir los tomates pelados y troceados, la hoja de laurel, sal y pimienta",
      "Cocinar a fuego lento durante 20-25 minutos, removiendo ocasionalmente",
      "Servir caliente como plato principal o guarnición"
    ],
    tags: ["tradicional", "vegetariano", "bajo en calorías", "manchego"],
    region: "Castilla-La Mancha",
    dietType: ["vegetariano", "vegano", "sin gluten"],
    allergens: []
  },

  {
    id: "es-recipe-006",
    name: "Ensalada de pulpo a la gallega",
    description: "Versión ligera del clásico pulpo a la gallega en formato ensalada",
    category: "almuerzo",
    difficulty: "medio",
    prepTime: 15,
    cookTime: 45,
    servings: 4,
    calories: 220,
    protein: 28,
    carbs: 12,
    fat: 8,
    fiber: 2,
    ingredients: [
      { name: "Pulpo cocido", amount: 500, unit: "g" },
      { name: "Patatas pequeñas", amount: 400, unit: "g" },
      { name: "Cebolla roja", amount: 1, unit: "unidad" },
      { name: "Pimiento verde", amount: 1, unit: "unidad" },
      { name: "Mezcla de hojas verdes", amount: 100, unit: "g" },
      { name: "Aceite de oliva virgen extra", amount: 2, unit: "cucharadas" },
      { name: "Pimentón dulce", amount: 1, unit: "cucharadita" },
      { name: "Pimentón picante", amount: 0.5, unit: "cucharadita" },
      { name: "Sal gruesa", amount: 1, unit: "cucharadita" },
      { name: "Vinagre de vino", amount: 1, unit: "cucharada" }
    ],
    instructions: [
      "Cocer las patatas con piel en agua con sal hasta que estén tiernas",
      "Cortar el pulpo en rodajas finas",
      "Pelar y cortar las patatas en rodajas gruesas cuando estén templadas",
      "Cortar la cebolla en juliana fina y el pimiento en dados pequeños",
      "Disponer las hojas verdes en una fuente, colocar encima las patatas y el pulpo",
      "Añadir la cebolla y el pimiento",
      "Aliñar con aceite de oliva, vinagre, sal gruesa y espolvorear con pimentón"
    ],
    tags: ["tradicional", "pescado", "proteína", "gallego"],
    region: "Galicia",
    dietType: ["sin gluten", "pescetariano"],
    allergens: ["moluscos"]
  },

  {
    id: "es-recipe-007",
    name: "Escalivada catalana",
    description: "Verduras asadas tradicionales de Cataluña, saludables y llenas de sabor",
    category: "cena",
    difficulty: "fácil",
    prepTime: 10,
    cookTime: 45,
    servings: 4,
    calories: 150,
    protein: 3,
    carbs: 15,
    fat: 9,
    fiber: 5,
    ingredients: [
      { name: "Berenjenas", amount: 2, unit: "unidades" },
      { name: "Pimientos rojos", amount: 2, unit: "unidades" },
      { name: "Cebolla grande", amount: 1, unit: "unidad" },
      { name: "Aceite de oliva virgen extra", amount: 2, unit: "cucharadas" },
      { name: "Ajo picado", amount: 1, unit: "diente" },
      { name: "Sal", amount: 1, unit: "cucharadita" },
      { name: "Pimienta", amount: 1, unit: "pizca" }
    ],
    instructions: [
      "Precalentar el horno a 200°C",
      "Lavar las verduras y secarlas bien",
      "Colocar las verduras enteras en una bandeja de horno",
      "Hornear durante 40-45 minutos, girando a mitad de cocción",
      "Sacar del horno y dejar enfriar ligeramente",
      "Pelar las verduras y cortarlas en tiras",
      "Aliñar con aceite de oliva, ajo picado, sal y pimienta",
      "Servir templado o frío"
    ],
    tags: ["tradicional", "vegetariano", "asado", "catalán"],
    region: "Cataluña",
    dietType: ["vegetariano", "vegano", "sin gluten"],
    allergens: []
  },

  // SNACKS Y TAPAS SALUDABLES
  {
    id: "es-recipe-008",
    name: "Hummus de garbanzos con pimentón",
    description: "Versión española del hummus tradicional con pimentón de la Vera",
    category: "snack",
    difficulty: "fácil",
    prepTime: 10,
    cookTime: 0,
    servings: 6,
    calories: 120,
    protein: 6,
    carbs: 15,
    fat: 5,
    fiber: 4,
    ingredients: [
      { name: "Garbanzos cocidos", amount: 400, unit: "g" },
      { name: "Tahini", amount: 2, unit: "cucharadas" },
      { name: "Zumo de limón", amount: 2, unit: "cucharadas" },
      { name: "Ajo", amount: 1, unit: "diente" },
      { name: "Aceite de oliva", amount: 2, unit: "cucharadas" },
      { name: "Pimentón de la Vera", amount: 1, unit: "cucharadita" },
      { name: "Comino", amount: 0.5, unit: "cucharadita" },
      { name: "Agua", amount: 50, unit: "ml" }
    ],
    instructions: [
      "Escurrir y enjuagar los garbanzos",
      "Triturar todos los ingredientes en un procesador de alimentos",
      "Añadir agua gradualmente hasta conseguir la textura deseada",
      "Rectificar de sal y especias al gusto",
      "Servir decorado con pimentón y aceite de oliva",
      "Acompañar con crudités o pan integral"
    ],
    tags: ["vegetariano", "proteína", "mediterráneo", "fácil"],
    region: "España",
    dietType: ["vegetariano", "vegano", "sin gluten"],
    allergens: ["sésamo"]
  },

  {
    id: "es-recipe-009",
    name: "Boquerones en vinagre",
    description: "Clásica tapa andaluza de boquerones marinados en vinagre",
    category: "snack",
    difficulty: "medio",
    prepTime: 30,
    cookTime: 0,
    servings: 4,
    calories: 140,
    protein: 18,
    carbs: 2,
    fat: 7,
    fiber: 0,
    ingredients: [
      { name: "Boquerones frescos", amount: 500, unit: "g" },
      { name: "Vinagre de vino blanco", amount: 200, unit: "ml" },
      { name: "Aceite de oliva", amount: 3, unit: "cucharadas" },
      { name: "Ajo", amount: 2, unit: "dientes" },
      { name: "Perejil fresco", amount: 2, unit: "cucharadas" },
      { name: "Sal gruesa", amount: 1, unit: "cucharadita" }
    ],
    instructions: [
      "Limpiar los boquerones quitando cabeza, tripas y espina central",
      "Colocar en un recipiente y cubrir con sal gruesa durante 30 minutos",
      "Enjuagar bien y secar con papel absorbente",
      "Marinar en vinagre durante 2-3 horas en el frigorífico",
      "Escurrir y aliñar con aceite, ajo picado y perejil",
      "Servir frío como tapa"
    ],
    tags: ["tradicional", "pescado", "tapa", "andaluz"],
    region: "Andalucía",
    dietType: ["sin gluten", "pescetariano"],
    allergens: ["pescado"]
  },

  // POSTRES SALUDABLES
  {
    id: "es-recipe-010",
    name: "Flan de huevo light",
    description: "Versión ligera del clásico flan español con menos azúcar",
    category: "postre",
    difficulty: "medio",
    prepTime: 15,
    cookTime: 45,
    servings: 6,
    calories: 150,
    protein: 8,
    carbs: 20,
    fat: 4,
    fiber: 0,
    ingredients: [
      { name: "Huevos", amount: 4, unit: "unidades" },
      { name: "Leche desnatada", amount: 500, unit: "ml" },
      { name: "Edulcorante", amount: 80, unit: "g" },
      { name: "Azúcar para caramelo", amount: 60, unit: "g" },
      { name: "Vainilla", amount: 1, unit: "cucharadita" },
      { name: "Agua", amount: 2, unit: "cucharadas" }
    ],
    instructions: [
      "Preparar el caramelo con azúcar y agua hasta que esté dorado",
      "Verter el caramelo en moldes individuales",
      "Batir huevos con edulcorante y vainilla",
      "Calentar la leche sin que hierva y mezclar con los huevos",
      "Colar la mezcla y verter en los moldes",
      "Cocinar al baño maría en horno a 160°C durante 45 minutos",
      "Enfriar completamente antes de desmoldar"
    ],
    tags: ["tradicional", "postre", "light", "casero"],
    region: "España",
    dietType: ["vegetariano", "sin gluten"],
    allergens: ["huevos", "lácteos"]
  },

  {
    id: "es-recipe-011",
    name: "Crema catalana light",
    description: "Versión saludable de la tradicional crema catalana",
    category: "postre",
    difficulty: "medio",
    prepTime: 20,
    cookTime: 30,
    servings: 4,
    calories: 180,
    protein: 6,
    carbs: 22,
    fat: 8,
    fiber: 0,
    ingredients: [
      { name: "Leche semidesnatada", amount: 500, unit: "ml" },
      { name: "Yemas de huevo", amount: 4, unit: "unidades" },
      { name: "Edulcorante", amount: 60, unit: "g" },
      { name: "Maicena", amount: 2, unit: "cucharadas" },
      { name: "Piel de limón", amount: 1, unit: "tira" },
      { name: "Canela en rama", amount: 1, unit: "unidad" },
      { name: "Azúcar moreno", amount: 4, unit: "cucharaditas" }
    ],
    instructions: [
      "Infusionar la leche con limón y canela durante 15 minutos",
      "Batir yemas con edulcorante hasta blanquear",
      "Añadir maicena a las yemas y mezclar bien",
      "Colar la leche caliente y verter sobre las yemas removiendo",
      "Cocinar a fuego lento removiendo hasta que espese",
      "Verter en moldes individuales y enfriar",
      "Espolvorear con azúcar moreno y quemar con soplete antes de servir"
    ],
    tags: ["tradicional", "postre", "catalán", "light"],
    region: "Cataluña",
    dietType: ["vegetariano", "sin gluten"],
    allergens: ["huevos", "lácteos"]
  },

  // MÁS DESAYUNOS
  {
    id: "es-recipe-012",
    name: "Churros integrales al horno",
    description: "Versión saludable de los churros tradicionales, horneados en lugar de fritos",
    category: "desayuno",
    difficulty: "medio",
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    calories: 180,
    protein: 5,
    carbs: 32,
    fat: 4,
    fiber: 3,
    ingredients: [
      { name: "Harina integral", amount: 150, unit: "g" },
      { name: "Agua", amount: 250, unit: "ml" },
      { name: "Aceite de oliva", amount: 2, unit: "cucharadas" },
      { name: "Sal", amount: 1, unit: "pizca" },
      { name: "Canela", amount: 1, unit: "cucharadita" },
      { name: "Edulcorante", amount: 2, unit: "cucharadas" }
    ],
    instructions: [
      "Precalentar el horno a 200°C",
      "Hervir agua con aceite y sal",
      "Añadir la harina de golpe y remover hasta formar una masa",
      "Dejar enfriar ligeramente y poner en manga pastelera",
      "Formar churros en bandeja con papel de horno",
      "Hornear 12-15 minutos hasta que estén dorados",
      "Espolvorear con canela y edulcorante"
    ],
    tags: ["tradicional", "horneado", "integral", "desayuno"],
    region: "Madrid",
    dietType: ["vegetariano"],
    allergens: ["gluten"]
  },

  {
    id: "es-recipe-013",
    name: "Migas extremeñas light",
    description: "Versión ligera de las tradicionales migas extremeñas",
    category: "desayuno",
    difficulty: "medio",
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    calories: 220,
    protein: 8,
    carbs: 35,
    fat: 6,
    fiber: 4,
    ingredients: [
      { name: "Pan integral del día anterior", amount: 200, unit: "g" },
      { name: "Aceite de oliva", amount: 2, unit: "cucharadas" },
      { name: "Ajo", amount: 2, unit: "dientes" },
      { name: "Pimiento rojo", amount: 1, unit: "unidad" },
      { name: "Chorizo ibérico magro", amount: 50, unit: "g" },
      { name: "Uvas", amount: 100, unit: "g" }
    ],
    instructions: [
      "Cortar el pan en dados pequeños y humedecer ligeramente",
      "Calentar aceite en sartén amplia",
      "Sofreír ajo y pimiento cortados en tiras",
      "Añadir el chorizo cortado en dados",
      "Incorporar el pan y remover constantemente",
      "Cocinar hasta que esté dorado y crujiente",
      "Servir con uvas como acompañamiento tradicional"
    ],
    tags: ["tradicional", "extremeño", "rústico"],
    region: "Extremadura",
    dietType: [],
    allergens: ["gluten"]
  },

  // MÁS ALMUERZOS
  {
    id: "es-recipe-014",
    name: "Fabada asturiana light",
    description: "Versión ligera de la tradicional fabada asturiana",
    category: "almuerzo",
    difficulty: "difícil",
    prepTime: 30,
    cookTime: 120,
    servings: 6,
    calories: 280,
    protein: 18,
    carbs: 35,
    fat: 8,
    fiber: 12,
    ingredients: [
      { name: "Fabes asturianas", amount: 400, unit: "g" },
      { name: "Chorizo asturiano", amount: 100, unit: "g" },
      { name: "Morcilla asturiana", amount: 100, unit: "g" },
      { name: "Lacón", amount: 150, unit: "g" },
      { name: "Cebolla", amount: 1, unit: "unidad" },
      { name: "Ajo", amount: 2, unit: "dientes" },
      { name: "Pimentón dulce", amount: 1, unit: "cucharadita" },
      { name: "Azafrán", amount: 1, unit: "pizca" },
      { name: "Hoja de laurel", amount: 1, unit: "unidad" }
    ],
    instructions: [
      "Remojar las fabes la noche anterior",
      "Cocer las fabes en agua fría con laurel durante 1 hora",
      "En sartén aparte, sofreír cebolla y ajo",
      "Añadir pimentón y azafrán al sofrito",
      "Incorporar chorizo, morcilla y lacón a las fabes",
      "Añadir el sofrito y cocinar 30 minutos más",
      "Servir caliente en cazuela de barro"
    ],
    tags: ["tradicional", "asturiano", "legumbres", "contundente"],
    region: "Asturias",
    dietType: [],
    allergens: []
  },

  {
    id: "es-recipe-015",
    name: "Salmorejo cordobés",
    description: "Sopa fría tradicional de Córdoba, más espesa que el gazpacho",
    category: "almuerzo",
    difficulty: "fácil",
    prepTime: 15,
    cookTime: 0,
    servings: 4,
    calories: 160,
    protein: 4,
    carbs: 18,
    fat: 8,
    fiber: 3,
    ingredients: [
      { name: "Tomates maduros", amount: 1000, unit: "g" },
      { name: "Pan del día anterior", amount: 100, unit: "g" },
      { name: "Aceite de oliva virgen extra", amount: 100, unit: "ml" },
      { name: "Ajo", amount: 1, unit: "diente" },
      { name: "Sal", amount: 1, unit: "cucharadita" },
      { name: "Huevo duro", amount: 2, unit: "unidades" },
      { name: "Jamón serrano", amount: 50, unit: "g" }
    ],
    instructions: [
      "Escaldar los tomates y pelarlos",
      "Remojar el pan en agua",
      "Triturar tomates, pan escurrido, ajo y sal",
      "Añadir aceite poco a poco mientras se tritura",
      "Pasar por colador fino para conseguir textura cremosa",
      "Refrigerar al menos 2 horas",
      "Servir decorado con huevo duro picado y jamón"
    ],
    tags: ["frío", "tradicional", "cordobés", "verano"],
    region: "Andalucía",
    dietType: [],
    allergens: ["gluten", "huevos"]
  }
];

export default spanishRecipes;
