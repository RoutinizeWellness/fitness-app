import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';
import {
  NutritionProfile,
  FoodPreference,
  WeightLog,
  FoodItem,
  MealPlan,
  MealPlanDetail,
  NutritionGoal,
  Recipe,
  MealType,
  MEAL_TYPES
} from './types/nutrition';
import { calculateBMR, calculateTDEE, calculateMacros } from './nutrition-profile-service';

// Datos de alimentos para respaldo cuando no hay suficientes en la base de datos
const fallbackFoods = {
  desayuno: [
    { name: 'Avena con leche', serving_size: 1, serving_unit: 'taza', calories: 150, protein: 5, carbs: 27, fat: 3 },
    { name: 'Plátano', serving_size: 1, serving_unit: 'unidad', calories: 105, protein: 1, carbs: 27, fat: 0 },
    { name: 'Huevos revueltos', serving_size: 2, serving_unit: 'unidad', calories: 180, protein: 12, carbs: 2, fat: 12 },
    { name: 'Tostada integral', serving_size: 2, serving_unit: 'rebanada', calories: 160, protein: 6, carbs: 30, fat: 2 },
    { name: 'Yogur natural', serving_size: 1, serving_unit: 'taza', calories: 120, protein: 10, carbs: 12, fat: 5 }
  ],
  almuerzo: [
    { name: 'Pechuga de pollo a la plancha', serving_size: 150, serving_unit: 'g', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: 'Arroz integral', serving_size: 1, serving_unit: 'taza', calories: 216, protein: 5, carbs: 45, fat: 1.8 },
    { name: 'Ensalada verde', serving_size: 1, serving_unit: 'taza', calories: 15, protein: 1, carbs: 3, fat: 0 },
    { name: 'Lentejas', serving_size: 1, serving_unit: 'taza', calories: 230, protein: 18, carbs: 40, fat: 1 },
    { name: 'Batata asada', serving_size: 1, serving_unit: 'unidad', calories: 180, protein: 4, carbs: 41, fat: 0 }
  ],
  cena: [
    { name: 'Salmón al horno', serving_size: 150, serving_unit: 'g', calories: 280, protein: 39, carbs: 0, fat: 13 },
    { name: 'Brócoli al vapor', serving_size: 1, serving_unit: 'taza', calories: 55, protein: 3.7, carbs: 11.2, fat: 0.6 },
    { name: 'Quinoa', serving_size: 1, serving_unit: 'taza', calories: 222, protein: 8, carbs: 39, fat: 3.6 },
    { name: 'Tofu salteado', serving_size: 150, serving_unit: 'g', calories: 144, protein: 16, carbs: 4, fat: 8 },
    { name: 'Espárragos', serving_size: 1, serving_unit: 'taza', calories: 40, protein: 4, carbs: 7, fat: 0 }
  ],
  snack: [
    { name: 'Yogur griego', serving_size: 1, serving_unit: 'taza', calories: 130, protein: 12, carbs: 5, fat: 4 },
    { name: 'Nueces', serving_size: 30, serving_unit: 'g', calories: 196, protein: 4.5, carbs: 4.1, fat: 19.2 },
    { name: 'Manzana', serving_size: 1, serving_unit: 'unidad', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
    { name: 'Hummus con zanahoria', serving_size: 1, serving_unit: 'porción', calories: 166, protein: 6, carbs: 14, fat: 10 },
    { name: 'Batido de proteínas', serving_size: 1, serving_unit: 'vaso', calories: 150, protein: 20, carbs: 10, fat: 3 }
  ]
};

// Función para filtrar alimentos según el tipo de dieta
const filterFoodsByDietType = (foods: any[], dietType: DietType): any[] => {
  switch (dietType) {
    case 'vegetarian':
      return foods.filter(food =>
        !food.name.toLowerCase().includes('carne') &&
        !food.name.toLowerCase().includes('pollo') &&
        !food.name.toLowerCase().includes('pescado') &&
        !food.name.toLowerCase().includes('cerdo') &&
        !food.name.toLowerCase().includes('jamón') &&
        !food.name.toLowerCase().includes('salchich')
      );
    case 'vegan':
      return foods.filter(food =>
        !food.name.toLowerCase().includes('carne') &&
        !food.name.toLowerCase().includes('pollo') &&
        !food.name.toLowerCase().includes('pescado') &&
        !food.name.toLowerCase().includes('cerdo') &&
        !food.name.toLowerCase().includes('jamón') &&
        !food.name.toLowerCase().includes('salchich') &&
        !food.name.toLowerCase().includes('leche') &&
        !food.name.toLowerCase().includes('queso') &&
        !food.name.toLowerCase().includes('yogur') &&
        !food.name.toLowerCase().includes('huevo') &&
        !food.name.toLowerCase().includes('miel')
      );
    case 'keto':
      return foods.filter(food =>
        (food.carbs / food.calories) < 0.1 &&
        (food.fat * 9 / food.calories) > 0.6
      );
    case 'paleo':
      return foods.filter(food =>
        !food.name.toLowerCase().includes('pan') &&
        !food.name.toLowerCase().includes('pasta') &&
        !food.name.toLowerCase().includes('arroz') &&
        !food.name.toLowerCase().includes('cereal') &&
        !food.name.toLowerCase().includes('azúcar') &&
        !food.name.toLowerCase().includes('legumbre') &&
        !food.name.toLowerCase().includes('lácteo')
      );
    case 'mediterranean':
      return foods.filter(food =>
        food.name.toLowerCase().includes('aceite de oliva') ||
        food.name.toLowerCase().includes('pescado') ||
        food.name.toLowerCase().includes('frutos secos') ||
        food.name.toLowerCase().includes('legumbres') ||
        food.name.toLowerCase().includes('verdura') ||
        food.name.toLowerCase().includes('fruta') ||
        food.name.toLowerCase().includes('cereal integral')
      );
    case 'low_carb':
      return foods.filter(food =>
        (food.carbs / food.calories) < 0.2
      );
    case 'high_protein':
      return foods.filter(food =>
        (food.protein / food.calories) > 0.25
      );
    default:
      return foods;
  }
};

// Función para generar nombres de comidas según el tipo y preferencias
const generateMealName = (mealType: MealType, dietType: DietType): string => {
  const mealNames = {
    desayuno: {
      standard: ['Desayuno nutritivo', 'Desayuno energético', 'Desayuno completo'],
      vegetarian: ['Desayuno vegetariano', 'Desayuno veggie energético'],
      vegan: ['Desayuno vegano', 'Desayuno plant-based'],
      keto: ['Desayuno keto', 'Desayuno bajo en carbos'],
      paleo: ['Desayuno paleo', 'Desayuno ancestral'],
      mediterranean: ['Desayuno mediterráneo', 'Desayuno estilo mediterráneo'],
      low_carb: ['Desayuno bajo en carbohidratos', 'Desayuno low-carb'],
      high_protein: ['Desayuno alto en proteínas', 'Desayuno proteico'],
      custom: ['Desayuno personalizado', 'Desayuno a tu medida']
    },
    almuerzo: {
      standard: ['Almuerzo balanceado', 'Almuerzo completo', 'Almuerzo nutritivo'],
      vegetarian: ['Almuerzo vegetariano', 'Almuerzo veggie balanceado'],
      vegan: ['Almuerzo vegano', 'Almuerzo plant-based'],
      keto: ['Almuerzo keto', 'Almuerzo bajo en carbos'],
      paleo: ['Almuerzo paleo', 'Almuerzo ancestral'],
      mediterranean: ['Almuerzo mediterráneo', 'Almuerzo estilo mediterráneo'],
      low_carb: ['Almuerzo bajo en carbohidratos', 'Almuerzo low-carb'],
      high_protein: ['Almuerzo alto en proteínas', 'Almuerzo proteico'],
      custom: ['Almuerzo personalizado', 'Almuerzo a tu medida']
    },
    cena: {
      standard: ['Cena balanceada', 'Cena ligera', 'Cena nutritiva'],
      vegetarian: ['Cena vegetariana', 'Cena veggie ligera'],
      vegan: ['Cena vegana', 'Cena plant-based'],
      keto: ['Cena keto', 'Cena baja en carbos'],
      paleo: ['Cena paleo', 'Cena ancestral'],
      mediterranean: ['Cena mediterránea', 'Cena estilo mediterráneo'],
      low_carb: ['Cena baja en carbohidratos', 'Cena low-carb'],
      high_protein: ['Cena alta en proteínas', 'Cena proteica'],
      custom: ['Cena personalizada', 'Cena a tu medida']
    },
    snack: {
      standard: ['Snack saludable', 'Merienda nutritiva', 'Tentempié equilibrado'],
      vegetarian: ['Snack vegetariano', 'Merienda veggie'],
      vegan: ['Snack vegano', 'Merienda plant-based'],
      keto: ['Snack keto', 'Merienda baja en carbos'],
      paleo: ['Snack paleo', 'Merienda ancestral'],
      mediterranean: ['Snack mediterráneo', 'Merienda estilo mediterráneo'],
      low_carb: ['Snack bajo en carbohidratos', 'Merienda low-carb'],
      high_protein: ['Snack alto en proteínas', 'Merienda proteica'],
      custom: ['Snack personalizado', 'Merienda a tu medida']
    }
  };

  // Obtener los nombres disponibles para el tipo de comida y dieta
  const availableNames = mealNames[mealType][dietType as keyof typeof mealNames[typeof mealType]] || mealNames[mealType].standard;

  // Seleccionar un nombre aleatorio
  return availableNames[Math.floor(Math.random() * availableNames.length)];
};

// Función para seleccionar alimentos para el desayuno
const selectBreakfastFoods = (
  carbFoods: any[],
  proteinFoods: any[],
  fatFoods: any[],
  balancedFoods: any[],
  target: { calories: number, protein: number, carbs: number, fat: number },
  preferences: DietPreference
): any[] => {
  // Algoritmo de selección para desayuno
  // Para el desayuno, priorizamos carbohidratos y proteínas moderadas
  const selectedFoods: any[] = [];

  // Seleccionar un alimento principal rico en carbohidratos (30-40% de calorías objetivo)
  if (carbFoods.length > 0) {
    const mainCarbFood = selectFoodWithinCalorieRange(carbFoods, target.calories * 0.3, target.calories * 0.4);
    if (mainCarbFood) selectedFoods.push(mainCarbFood);
  }

  // Seleccionar una fuente de proteína (20-30% de calorías objetivo)
  if (proteinFoods.length > 0) {
    const proteinFood = selectFoodWithinCalorieRange(proteinFoods, target.calories * 0.2, target.calories * 0.3);
    if (proteinFood) selectedFoods.push(proteinFood);
  }

  // Seleccionar una fuente de grasa saludable (15-25% de calorías objetivo)
  if (fatFoods.length > 0) {
    const fatFood = selectFoodWithinCalorieRange(fatFoods, target.calories * 0.15, target.calories * 0.25);
    if (fatFood) selectedFoods.push(fatFood);
  }

  // Añadir alimentos preferidos si están disponibles
  addPreferredFoods(selectedFoods, [...carbFoods, ...proteinFoods, ...fatFoods, ...balancedFoods], preferences.preferredFoods, target);

  // Si no hemos alcanzado el objetivo calórico, añadir más alimentos
  fillNutritionalGaps(selectedFoods, [...carbFoods, ...proteinFoods, ...fatFoods, ...balancedFoods], target);

  return selectedFoods;
};

// Función para seleccionar alimentos para el almuerzo
const selectLunchFoods = (
  carbFoods: any[],
  proteinFoods: any[],
  fatFoods: any[],
  balancedFoods: any[],
  target: { calories: number, protein: number, carbs: number, fat: number },
  preferences: DietPreference
): any[] => {
  // Algoritmo de selección para almuerzo
  // Para el almuerzo, equilibramos proteínas, carbohidratos y grasas
  const selectedFoods: any[] = [];

  // Seleccionar una proteína principal (30-40% de calorías objetivo)
  if (proteinFoods.length > 0) {
    const mainProteinFood = selectFoodWithinCalorieRange(proteinFoods, target.calories * 0.3, target.calories * 0.4);
    if (mainProteinFood) selectedFoods.push(mainProteinFood);
  }

  // Seleccionar carbohidratos (25-35% de calorías objetivo)
  if (carbFoods.length > 0) {
    const carbFood = selectFoodWithinCalorieRange(carbFoods, target.calories * 0.25, target.calories * 0.35);
    if (carbFood) selectedFoods.push(carbFood);
  }

  // Seleccionar vegetales o ensalada (10-15% de calorías objetivo)
  const vegetables = [...carbFoods, ...balancedFoods].filter(food =>
    food.name.toLowerCase().includes('ensalada') ||
    food.name.toLowerCase().includes('verdura') ||
    food.name.toLowerCase().includes('vegetal') ||
    food.name.toLowerCase().includes('brócoli') ||
    food.name.toLowerCase().includes('espinaca') ||
    food.name.toLowerCase().includes('zanahoria')
  );

  if (vegetables.length > 0) {
    const vegFood = selectFoodWithinCalorieRange(vegetables, target.calories * 0.1, target.calories * 0.15);
    if (vegFood) selectedFoods.push(vegFood);
  }

  // Añadir alimentos preferidos si están disponibles
  addPreferredFoods(selectedFoods, [...carbFoods, ...proteinFoods, ...fatFoods, ...balancedFoods], preferences.preferredFoods, target);

  // Si no hemos alcanzado el objetivo calórico, añadir más alimentos
  fillNutritionalGaps(selectedFoods, [...carbFoods, ...proteinFoods, ...fatFoods, ...balancedFoods], target);

  return selectedFoods;
};

// Función para seleccionar alimentos para la cena
const selectDinnerFoods = (
  carbFoods: any[],
  proteinFoods: any[],
  fatFoods: any[],
  balancedFoods: any[],
  target: { calories: number, protein: number, carbs: number, fat: number },
  preferences: DietPreference
): any[] => {
  // Algoritmo de selección para cena
  // Para la cena, priorizamos proteínas y grasas, menos carbohidratos
  const selectedFoods: any[] = [];

  // Seleccionar una proteína principal (35-45% de calorías objetivo)
  if (proteinFoods.length > 0) {
    const mainProteinFood = selectFoodWithinCalorieRange(proteinFoods, target.calories * 0.35, target.calories * 0.45);
    if (mainProteinFood) selectedFoods.push(mainProteinFood);
  }

  // Seleccionar vegetales o ensalada (20-30% de calorías objetivo)
  const vegetables = [...carbFoods, ...balancedFoods].filter(food =>
    food.name.toLowerCase().includes('ensalada') ||
    food.name.toLowerCase().includes('verdura') ||
    food.name.toLowerCase().includes('vegetal') ||
    food.name.toLowerCase().includes('brócoli') ||
    food.name.toLowerCase().includes('espinaca') ||
    food.name.toLowerCase().includes('zanahoria')
  );

  if (vegetables.length > 0) {
    const vegFood = selectFoodWithinCalorieRange(vegetables, target.calories * 0.2, target.calories * 0.3);
    if (vegFood) selectedFoods.push(vegFood);
  }

  // Seleccionar carbohidratos ligeros (15-25% de calorías objetivo)
  if (carbFoods.length > 0) {
    // Filtrar para carbohidratos más ligeros
    const lightCarbs = carbFoods.filter(food =>
      !food.name.toLowerCase().includes('pasta') &&
      !food.name.toLowerCase().includes('arroz') &&
      !food.name.toLowerCase().includes('patata')
    );

    const carbsToUse = lightCarbs.length > 0 ? lightCarbs : carbFoods;
    const carbFood = selectFoodWithinCalorieRange(carbsToUse, target.calories * 0.15, target.calories * 0.25);
    if (carbFood) selectedFoods.push(carbFood);
  }

  // Añadir alimentos preferidos si están disponibles
  addPreferredFoods(selectedFoods, [...carbFoods, ...proteinFoods, ...fatFoods, ...balancedFoods], preferences.preferredFoods, target);

  // Si no hemos alcanzado el objetivo calórico, añadir más alimentos
  fillNutritionalGaps(selectedFoods, [...carbFoods, ...proteinFoods, ...fatFoods, ...balancedFoods], target);

  return selectedFoods;
};

// Función para seleccionar alimentos para snacks
const selectSnackFoods = (
  carbFoods: any[],
  proteinFoods: any[],
  fatFoods: any[],
  balancedFoods: any[],
  target: { calories: number, protein: number, carbs: number, fat: number },
  preferences: DietPreference
): any[] => {
  // Algoritmo de selección para snacks
  // Para snacks, priorizamos alimentos pequeños y nutritivos
  const selectedFoods: any[] = [];

  // Seleccionar un snack proteico (40-50% de calorías objetivo)
  if (proteinFoods.length > 0) {
    const proteinSnack = selectFoodWithinCalorieRange(proteinFoods, target.calories * 0.4, target.calories * 0.5);
    if (proteinSnack) selectedFoods.push(proteinSnack);
  }

  // Seleccionar un snack de carbohidratos o fruta (30-40% de calorías objetivo)
  const fruitFoods = [...carbFoods, ...balancedFoods].filter(food =>
    food.name.toLowerCase().includes('fruta') ||
    food.name.toLowerCase().includes('manzana') ||
    food.name.toLowerCase().includes('plátano') ||
    food.name.toLowerCase().includes('naranja') ||
    food.name.toLowerCase().includes('pera')
  );

  if (fruitFoods.length > 0) {
    const fruitSnack = selectFoodWithinCalorieRange(fruitFoods, target.calories * 0.3, target.calories * 0.4);
    if (fruitSnack) selectedFoods.push(fruitSnack);
  } else if (carbFoods.length > 0) {
    const carbSnack = selectFoodWithinCalorieRange(carbFoods, target.calories * 0.3, target.calories * 0.4);
    if (carbSnack) selectedFoods.push(carbSnack);
  }

  // Añadir alimentos preferidos si están disponibles
  addPreferredFoods(selectedFoods, [...carbFoods, ...proteinFoods, ...fatFoods, ...balancedFoods], preferences.preferredFoods, target);

  // Si no hemos alcanzado el objetivo calórico, añadir más alimentos
  fillNutritionalGaps(selectedFoods, [...carbFoods, ...proteinFoods, ...fatFoods, ...balancedFoods], target);

  return selectedFoods;
};

// Función para seleccionar un alimento dentro de un rango de calorías
const selectFoodWithinCalorieRange = (foods: any[], minCalories: number, maxCalories: number): any | null => {
  const suitableFoods = foods.filter(food =>
    food.calories >= minCalories * 0.7 && food.calories <= maxCalories * 1.3
  );

  if (suitableFoods.length === 0) {
    // Si no hay alimentos en el rango exacto, intentar con un rango más amplio
    const expandedFoods = foods.filter(food =>
      food.calories >= minCalories * 0.5 && food.calories <= maxCalories * 1.5
    );

    if (expandedFoods.length === 0) {
      // Si aún no hay alimentos, tomar cualquiera y ajustar la porción
      if (foods.length > 0) {
        const randomFood = foods[Math.floor(Math.random() * foods.length)];
        // Ajustar la porción para que se acerque al rango de calorías
        const targetCalories = (minCalories + maxCalories) / 2;
        const ratio = targetCalories / randomFood.calories;

        return {
          ...randomFood,
          serving_size: Math.round((randomFood.serving_size * ratio) * 10) / 10,
          calories: Math.round(randomFood.calories * ratio),
          protein: Math.round((randomFood.protein * ratio) * 10) / 10,
          carbs: Math.round((randomFood.carbs * ratio) * 10) / 10,
          fat: Math.round((randomFood.fat * ratio) * 10) / 10
        };
      }
      return null;
    }

    return expandedFoods[Math.floor(Math.random() * expandedFoods.length)];
  }

  return suitableFoods[Math.floor(Math.random() * suitableFoods.length)];
};

// Función para añadir alimentos preferidos del usuario
const addPreferredFoods = (selectedFoods: any[], availableFoods: any[], preferredFoods: string[], target: { calories: number, protein: number, carbs: number, fat: number }): void => {
  if (preferredFoods.length === 0 || selectedFoods.length >= 4) return;

  // Calcular calorías actuales
  const currentCalories = selectedFoods.reduce((sum, food) => sum + food.calories, 0);
  const remainingCalories = target.calories - currentCalories;

  if (remainingCalories <= 0) return;

  // Buscar alimentos preferidos
  for (const preferred of preferredFoods) {
    if (selectedFoods.length >= 4) break;

    const matchingFoods = availableFoods.filter(food =>
      food.name.toLowerCase().includes(preferred.toLowerCase()) &&
      !selectedFoods.some(selected => selected.name === food.name)
    );

    if (matchingFoods.length > 0) {
      const preferredFood = selectFoodWithinCalorieRange(matchingFoods, remainingCalories * 0.2, remainingCalories * 0.4);
      if (preferredFood) {
        selectedFoods.push(preferredFood);
        break;
      }
    }
  }
};

// Función para completar los objetivos nutricionales
const fillNutritionalGaps = (selectedFoods: any[], availableFoods: any[], target: { calories: number, protein: number, carbs: number, fat: number }): void => {
  // Calcular nutrientes actuales
  const currentCalories = selectedFoods.reduce((sum, food) => sum + food.calories, 0);
  const currentProtein = selectedFoods.reduce((sum, food) => sum + food.protein, 0);
  const currentCarbs = selectedFoods.reduce((sum, food) => sum + food.carbs, 0);
  const currentFat = selectedFoods.reduce((sum, food) => sum + food.fat, 0);

  // Calcular déficits
  const calorieDeficit = target.calories - currentCalories;
  const proteinDeficit = target.protein - currentProtein;
  const carbsDeficit = target.carbs - currentCarbs;
  const fatDeficit = target.fat - currentFat;

  // Si ya estamos cerca del objetivo o tenemos demasiados alimentos, salir
  if (calorieDeficit < 50 || selectedFoods.length >= 5) return;

  // Determinar qué nutriente tiene mayor déficit proporcional
  const deficits = [
    { nutrient: 'protein', value: proteinDeficit / target.protein },
    { nutrient: 'carbs', value: carbsDeficit / target.carbs },
    { nutrient: 'fat', value: fatDeficit / target.fat }
  ].sort((a, b) => b.value - a.value);

  // Seleccionar alimentos para cubrir el déficit principal
  const primaryDeficit = deficits[0].nutrient;

  let foodsToConsider: any[] = [];

  switch (primaryDeficit) {
    case 'protein':
      foodsToConsider = availableFoods.filter(food =>
        (food.protein / food.calories) > 0.15 &&
        !selectedFoods.some(selected => selected.name === food.name)
      );
      break;
    case 'carbs':
      foodsToConsider = availableFoods.filter(food =>
        (food.carbs / food.calories) > 0.15 &&
        !selectedFoods.some(selected => selected.name === food.name)
      );
      break;
    case 'fat':
      foodsToConsider = availableFoods.filter(food =>
        (food.fat * 9 / food.calories) > 0.25 &&
        !selectedFoods.some(selected => selected.name === food.name)
      );
      break;
  }

  if (foodsToConsider.length > 0) {
    const additionalFood = selectFoodWithinCalorieRange(foodsToConsider, calorieDeficit * 0.5, calorieDeficit * 0.8);
    if (additionalFood) {
      selectedFoods.push(additionalFood);
    }
  }
};

// Función para generar una comida de respaldo cuando no hay suficientes datos
const generateFallbackMeal = (
  dietDayId: string,
  mealType: MealType,
  target: { calories: number, protein: number, carbs: number, fat: number },
  preferences: DietPreference
): Promise<PersonalizedDietMeal> => {
  try {
    // Usar datos de respaldo según el tipo de comida
    const foods = fallbackFoods[mealType];

    // Seleccionar alimentos aleatorios
    const selectedFoods: any[] = [];
    const shuffledFoods = [...foods].sort(() => 0.5 - Math.random());

    // Determinar cuántos alimentos incluir
    const foodCount = mealType === 'snack' ? 2 : 3;

    // Añadir alimentos hasta alcanzar el objetivo o el número máximo
    let currentCalories = 0;
    for (const food of shuffledFoods) {
      if (selectedFoods.length >= foodCount || currentCalories >= target.calories * 0.9) break;

      // Ajustar la porción para acercarse al objetivo
      const remainingCalories = target.calories - currentCalories;
      const portionRatio = Math.min(1, remainingCalories / (food.calories * 2));

      const adjustedFood = {
        ...food,
        serving_size: Math.round((food.serving_size * portionRatio) * 10) / 10,
        calories: Math.round(food.calories * portionRatio),
        protein: Math.round((food.protein * portionRatio) * 10) / 10,
        carbs: Math.round((food.carbs * portionRatio) * 10) / 10,
        fat: Math.round((food.fat * portionRatio) * 10) / 10
      };

      selectedFoods.push(adjustedFood);
      currentCalories += adjustedFood.calories;
    }

    // Generar nombre de comida
    const mealName = generateMealName(mealType, preferences.dietType);

    // Calcular totales
    const totalCalories = selectedFoods.reduce((sum, food) => sum + food.calories, 0);
    const totalProtein = selectedFoods.reduce((sum, food) => sum + food.protein, 0);
    const totalCarbs = selectedFoods.reduce((sum, food) => sum + food.carbs, 0);
    const totalFat = selectedFoods.reduce((sum, food) => sum + food.fat, 0);

    // Crear la comida en la base de datos
    return createMealInDatabase(dietDayId, mealType, mealName, selectedFoods, totalCalories, totalProtein, totalCarbs, totalFat, preferences);
  } catch (error) {
    console.error('Error al generar comida de respaldo:', error);
    throw error;
  }
};

// Función para crear una comida en la base de datos
const createMealInDatabase = async (
  dietDayId: string,
  mealType: MealType,
  mealName: string,
  foods: any[],
  totalCalories: number,
  totalProtein: number,
  totalCarbs: number,
  totalFat: number,
  preferences: DietPreference
): Promise<PersonalizedDietMeal> => {
  try {
    // Crear la comida en la base de datos
    const mealData = {
      diet_day_id: dietDayId,
      meal_type: mealType,
      name: mealName,
      total_calories: totalCalories,
      total_protein: totalProtein,
      total_carbs: totalCarbs,
      total_fat: totalFat,
      notes: `Comida generada automáticamente para una dieta ${preferences.dietType}`
    };

    const { data: mealRecord, error: mealError } = await supabase
      .from('personalized_diet_meals')
      .insert([mealData])
      .select()
      .single();

    if (mealError) {
      throw mealError;
    }

    // Guardar los alimentos de la comida
    for (const food of foods) {
      await supabase
        .from('personalized_diet_foods')
        .insert([{
          meal_id: mealRecord.id,
          food_id: food.id || null,
          name: food.name,
          serving_size: food.serving_size,
          serving_unit: food.serving_unit,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat
        }]);
    }

    // Crear objeto de comida para devolver
    const personalizedMeal: PersonalizedDietMeal = {
      id: mealRecord.id,
      dietDayId: mealRecord.diet_day_id,
      mealType: mealRecord.meal_type,
      name: mealRecord.name,
      foods: foods.map(food => ({
        foodId: food.id,
        name: food.name,
        servingSize: food.serving_size,
        servingUnit: food.serving_unit,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat
      })),
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      notes: mealRecord.notes
    };

    return personalizedMeal;
  } catch (error) {
    console.error('Error al crear comida en la base de datos:', error);
    throw error;
  }
};

// Tipos para el servicio de IA de dietas
export type DietType = 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean' | 'low_carb' | 'high_protein' | 'custom';

export type DietPreference = {
  userId: string;
  dietType: DietType;
  allergies: string[];
  intolerances: string[];
  excludedFoods: string[];
  preferredFoods: string[];
  mealsPerDay: number;
  calorieTarget?: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
};

export type PersonalizedDiet = {
  id: string;
  userId: string;
  name: string;
  description: string;
  dietType: DietType;
  startDate: string;
  endDate: string;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  mealsPerDay: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PersonalizedDietDay = {
  id: string;
  dietId: string;
  dayNumber: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: PersonalizedDietMeal[];
};

export type PersonalizedDietMeal = {
  id: string;
  dietDayId: string;
  mealType: MealType;
  name: string;
  foods: {
    foodId?: string;
    name: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    recipeId?: string;
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
};

type QueryResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

// Función para obtener las preferencias dietéticas del usuario
export const getDietPreferences = async (userId: string): Promise<QueryResponse<DietPreference>> => {
  try {
    // Valores por defecto en caso de error
    let defaultDietType = 'standard';
    let defaultMealsPerDay = 3;

    // Obtener perfil nutricional
    const { data: profile, error: profileError } = await supabase
      .from('nutrition_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Si no existe el perfil nutricional, intentar crearlo
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Perfil nutricional no encontrado, usando valores por defecto');

      // Intentar obtener datos básicos del usuario
      const { data: userData } = await supabase
        .from('profiles')
        .select('gender, height, weight')
        .eq('user_id', userId)
        .single();

      // Si tenemos datos del usuario, crear un perfil nutricional básico
      if (userData) {
        try {
          const defaultProfile = {
            user_id: userId,
            height: userData.height || 170,
            current_weight: userData.weight || 70,
            target_weight: userData.weight || 70,
            activity_level: 'moderate',
            diet_type: 'standard',
            meals_per_day: 3,
            goal: 'maintenance',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          await supabase
            .from('nutrition_profiles')
            .insert([defaultProfile]);

          console.log('Perfil nutricional creado con valores por defecto');
        } catch (insertError) {
          console.error('Error al crear perfil nutricional:', insertError);
        }
      }
    } else if (profile) {
      defaultDietType = profile.diet_type || 'standard';
      defaultMealsPerDay = profile.meals_per_day || 3;
    }

    // Obtener preferencias alimentarias
    const { data: preferences, error: preferencesError } = await supabase
      .from('food_preferences')
      .select('*')
      .eq('user_id', userId);

    // Si hay un error con la tabla de preferencias, usar valores por defecto
    if (preferencesError && preferencesError.code !== 'PGRST116') {
      console.error('Error al obtener preferencias alimentarias:', preferencesError);
    }

    // Obtener objetivos nutricionales
    const { data: goals, error: goalsError } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    // Si hay un error con la tabla de objetivos, usar valores por defecto
    if (goalsError && goalsError.code !== 'PGRST116') {
      console.error('Error al obtener objetivos nutricionales:', goalsError);
    }

    // Procesar preferencias
    const allergies: string[] = [];
    const intolerances: string[] = [];
    const excludedFoods: string[] = [];
    const preferredFoods: string[] = [];

    if (preferences && preferences.length > 0) {
      preferences.forEach(pref => {
        if (pref.preference === 'allergic') {
          allergies.push(pref.food_category);
          if (pref.specific_foods) {
            allergies.push(...pref.specific_foods);
          }
        } else if (pref.preference === 'intolerant') {
          intolerances.push(pref.food_category);
          if (pref.specific_foods) {
            intolerances.push(...pref.specific_foods);
          }
        } else if (pref.preference === 'dislike') {
          excludedFoods.push(pref.food_category);
          if (pref.specific_foods) {
            excludedFoods.push(...pref.specific_foods);
          }
        } else if (pref.preference === 'like') {
          preferredFoods.push(pref.food_category);
          if (pref.specific_foods) {
            preferredFoods.push(...pref.specific_foods);
          }
        }
      });
    }

    // Crear objeto de preferencias dietéticas con valores por defecto si es necesario
    const dietPreferences: DietPreference = {
      userId,
      dietType: defaultDietType,
      allergies,
      intolerances,
      excludedFoods,
      preferredFoods,
      mealsPerDay: defaultMealsPerDay,
      calorieTarget: goals?.calories || 2000, // Valor por defecto
      proteinTarget: goals?.protein || 120,   // Valor por defecto
      carbsTarget: goals?.carbs || 200,       // Valor por defecto
      fatTarget: goals?.fat || 65             // Valor por defecto
    };

    return { data: dietPreferences, error: null };
  } catch (error) {
    console.error('Error al obtener preferencias dietéticas:', error);

    // Crear preferencias por defecto en caso de error
    const defaultPreferences: DietPreference = {
      userId,
      dietType: 'standard',
      allergies: [],
      intolerances: [],
      excludedFoods: [],
      preferredFoods: [],
      mealsPerDay: 3,
      calorieTarget: 2000,
      proteinTarget: 120,
      carbsTarget: 200,
      fatTarget: 65
    };

    // Devolver preferencias por defecto en lugar de error
    return { data: defaultPreferences, error: null };
  }
};

// Función para generar una dieta personalizada
export const generatePersonalizedDiet = async (
  userId: string,
  options?: {
    durationDays?: number;
    name?: string;
    description?: string;
    dietType?: DietType;
  }
): Promise<QueryResponse<PersonalizedDiet>> => {
  try {
    // Obtener preferencias dietéticas - ahora siempre devuelve datos, incluso con valores por defecto
    const { data: preferences } = await getDietPreferences(userId);

    if (!preferences) {
      throw new Error('No se pudieron obtener las preferencias dietéticas');
    }

    // Valores por defecto para el perfil nutricional
    let profileData = {
      current_weight: 70,
      height: 170,
      activity_level: 'moderate',
      goal: 'maintenance'
    };

    // Intentar obtener perfil nutricional para cálculos
    const { data: profile, error: profileError } = await supabase
      .from('nutrition_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Si existe el perfil, usar esos datos
    if (!profileError && profile) {
      profileData = {
        current_weight: profile.current_weight,
        height: profile.height,
        activity_level: profile.activity_level,
        goal: profile.goal
      };
    } else {
      console.log('Usando perfil nutricional por defecto');
    }

    // Intentar obtener la edad del usuario
    let age = 30; // Edad predeterminada

    try {
      const { data: userData } = await supabase
        .from('profiles')
        .select('birth_date')
        .eq('user_id', userId)
        .single();

      // Calcular edad si está disponible
      if (userData?.birth_date) {
        age = Math.floor((new Date().getTime() - new Date(userData.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      }
    } catch (ageError) {
      console.log('No se pudo obtener la edad del usuario, usando valor por defecto:', ageError);
    }

    // Calcular objetivos nutricionales si no están definidos
    const bmr = calculateBMR(profileData.current_weight, profileData.height, age, 'male'); // Asumimos género por defecto
    const tdee = calculateTDEE(bmr, profileData.activity_level);
    const macros = calculateMacros(tdee, profileData.goal, profileData.current_weight);

    // Usar objetivos calculados o los proporcionados por el usuario
    const calorieTarget = preferences.calorieTarget || macros.calories;
    const proteinTarget = preferences.proteinTarget || macros.protein;
    const carbsTarget = preferences.carbsTarget || macros.carbs;
    const fatTarget = preferences.fatTarget || macros.fat;

    // Crear la dieta personalizada en la base de datos
    const now = new Date().toISOString();
    const startDate = now.split('T')[0];
    const endDate = new Date(new Date().setDate(new Date().getDate() + (options?.durationDays || 7))).toISOString().split('T')[0];

    const dietData = {
      user_id: userId,
      name: options?.name || `Plan de ${options?.durationDays || 7} días - ${new Date().toLocaleDateString()}`,
      description: options?.description || `Dieta personalizada generada automáticamente basada en tus preferencias y objetivos.`,
      diet_type: options?.dietType || preferences.dietType,
      start_date: startDate,
      end_date: endDate,
      calorie_target: calorieTarget,
      protein_target: proteinTarget,
      carbs_target: carbsTarget,
      fat_target: fatTarget,
      meals_per_day: preferences.mealsPerDay,
      is_active: true,
      created_at: now,
      updated_at: now
    };

    // Intentar insertar en la base de datos
    try {
      const { data, error } = await supabase
        .from('personalized_diets')
        .insert([dietData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Transformar a formato de la aplicación
      const personalizedDiet: PersonalizedDiet = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description,
        dietType: data.diet_type,
        startDate: data.start_date,
        endDate: data.end_date,
        calorieTarget: data.calorie_target,
        proteinTarget: data.protein_target,
        carbsTarget: data.carbs_target,
        fatTarget: data.fat_target,
        mealsPerDay: data.meals_per_day,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      // Intentar generar los días de la dieta
      try {
        await generateDietDays(personalizedDiet, options?.durationDays || 7, preferences);
      } catch (daysError) {
        console.error('Error al generar días de la dieta, pero la dieta base se creó correctamente:', daysError);
      }

      return { data: personalizedDiet, error: null };
    } catch (insertError) {
      console.error('Error al insertar dieta en la base de datos:', insertError);

      // Crear una dieta en memoria como fallback
      const fallbackDiet: PersonalizedDiet = {
        id: `temp-${Date.now()}`,
        userId: userId,
        name: options?.name || `Plan de ${options?.durationDays || 7} días - ${new Date().toLocaleDateString()}`,
        description: options?.description || `Dieta personalizada generada automáticamente basada en tus preferencias y objetivos.`,
        dietType: options?.dietType || preferences.dietType,
        startDate: startDate,
        endDate: endDate,
        calorieTarget: calorieTarget,
        proteinTarget: proteinTarget,
        carbsTarget: carbsTarget,
        fatTarget: fatTarget,
        mealsPerDay: preferences.mealsPerDay,
        isActive: true,
        createdAt: now,
        updatedAt: now
      };

      return { data: fallbackDiet, error: null };
    }
  } catch (error) {
    console.error('Error al generar dieta personalizada:', error);

    // Crear una dieta por defecto como último recurso
    const defaultDiet: PersonalizedDiet = {
      id: `default-${Date.now()}`,
      userId: userId,
      name: options?.name || `Plan de dieta estándar`,
      description: options?.description || `Dieta estándar de mantenimiento.`,
      dietType: options?.dietType || 'standard',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setDate(new Date().getDate() + (options?.durationDays || 7))).toISOString().split('T')[0],
      calorieTarget: 2000,
      proteinTarget: 120,
      carbsTarget: 200,
      fatTarget: 65,
      mealsPerDay: 3,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return { data: defaultDiet, error: null };
  }
};

// Función para generar los días de la dieta
const generateDietDays = async (
  diet: PersonalizedDiet,
  durationDays: number,
  preferences: DietPreference
): Promise<void> => {
  try {
    // Aquí implementaríamos la lógica de IA para generar los días de la dieta
    // Por ahora, generaremos datos de ejemplo

    for (let day = 1; day <= durationDays; day++) {
      // Crear el día en la base de datos
      const dayData = {
        diet_id: diet.id,
        day_number: day,
        total_calories: 0, // Se actualizará después
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0
      };

      const { data: dayRecord, error: dayError } = await supabase
        .from('personalized_diet_days')
        .insert([dayData])
        .select()
        .single();

      if (dayError) {
        throw dayError;
      }

      // Generar comidas para el día
      const meals = await generateMealsForDay(dayRecord.id, diet, preferences);

      // Actualizar totales del día
      const totals = meals.reduce((acc, meal) => {
        acc.calories += meal.totalCalories;
        acc.protein += meal.totalProtein;
        acc.carbs += meal.totalCarbs;
        acc.fat += meal.totalFat;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

      await supabase
        .from('personalized_diet_days')
        .update({
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbs: totals.carbs,
          total_fat: totals.fat
        })
        .eq('id', dayRecord.id);
    }
  } catch (error) {
    console.error('Error al generar días de la dieta:', error);
    throw error;
  }
};

// Función para generar comidas para un día
const generateMealsForDay = async (
  dietDayId: string,
  diet: PersonalizedDiet,
  preferences: DietPreference
): Promise<PersonalizedDietMeal[]> => {
  try {
    const meals: PersonalizedDietMeal[] = [];

    // Determinar qué comidas incluir basado en mealsPerDay
    const mealTypes: MealType[] = [];
    if (preferences.mealsPerDay >= 3) {
      mealTypes.push('desayuno', 'almuerzo', 'cena');
    } else if (preferences.mealsPerDay === 2) {
      mealTypes.push('desayuno', 'cena');
    } else {
      mealTypes.push('almuerzo');
    }

    // Añadir snacks si corresponde
    if (preferences.mealsPerDay === 4) {
      mealTypes.push('snack');
    } else if (preferences.mealsPerDay === 5) {
      // Añadir dos snacks (mañana y tarde)
      mealTypes.push('snack', 'snack');
    }

    // Distribuir calorías y macros entre las comidas
    const mealDistribution = distributeMacros(diet, mealTypes.length);

    // Generar cada comida
    for (let i = 0; i < mealTypes.length; i++) {
      const mealType = mealTypes[i];
      const mealTarget = mealDistribution[i];

      // Aquí implementaríamos la lógica de IA para seleccionar alimentos
      // Por ahora, generaremos datos de ejemplo
      const meal = await generateMeal(dietDayId, mealType, mealTarget, preferences);
      meals.push(meal);
    }

    return meals;
  } catch (error) {
    console.error('Error al generar comidas para el día:', error);
    throw error;
  }
};

// Función para distribuir macros entre las comidas del día
const distributeMacros = (
  diet: PersonalizedDiet,
  numberOfMeals: number
): Array<{ calories: number, protein: number, carbs: number, fat: number }> => {
  // Distribución de calorías por comida (porcentajes)
  const mealPercentages = [
    [1], // 1 comida: 100%
    [0.4, 0.6], // 2 comidas: 40%, 60%
    [0.25, 0.45, 0.3], // 3 comidas: 25%, 45%, 30%
    [0.25, 0.35, 0.25, 0.15], // 4 comidas: 25%, 35%, 25%, 15%
    [0.2, 0.1, 0.35, 0.1, 0.25] // 5 comidas: 20%, 10%, 35%, 10%, 25%
  ];

  const distribution = mealPercentages[numberOfMeals - 1] || Array(numberOfMeals).fill(1 / numberOfMeals);

  return distribution.map(percentage => ({
    calories: Math.round(diet.calorieTarget * percentage),
    protein: Math.round(diet.proteinTarget * percentage),
    carbs: Math.round(diet.carbsTarget * percentage),
    fat: Math.round(diet.fatTarget * percentage)
  }));
};

// Función para generar una comida utilizando algoritmos de IA
const generateMeal = async (
  dietDayId: string,
  mealType: MealType,
  target: { calories: number, protein: number, carbs: number, fat: number },
  preferences: DietPreference
): Promise<PersonalizedDietMeal> => {
  try {
    // Implementación de algoritmo de selección de alimentos basado en preferencias y objetivos nutricionales

    let mealName = '';
    let foods: any[] = [];

    // Obtener alimentos de la base de datos según las preferencias
    const { data: foodData, error: foodError } = await supabase
      .from('food_database')
      .select('*')
      .limit(100);

    if (foodError) {
      console.error('Error al obtener alimentos de la base de datos:', foodError);
      // Si hay un error, usar datos de respaldo
      return generateFallbackMeal(dietDayId, mealType, target, preferences);
    }

    // Filtrar alimentos según las preferencias dietéticas
    let availableFoods = foodData || [];

    // Filtrar alimentos según el tipo de dieta
    if (preferences.dietType !== 'standard') {
      availableFoods = filterFoodsByDietType(availableFoods, preferences.dietType);
    }

    // Excluir alimentos que el usuario no quiere
    availableFoods = availableFoods.filter(food =>
      !preferences.allergies.some(allergy =>
        food.name.toLowerCase().includes(allergy.toLowerCase()) ||
        (food.category && food.category.toLowerCase().includes(allergy.toLowerCase()))
      ) &&
      !preferences.intolerances.some(intolerance =>
        food.name.toLowerCase().includes(intolerance.toLowerCase()) ||
        (food.category && food.category.toLowerCase().includes(intolerance.toLowerCase()))
      ) &&
      !preferences.excludedFoods.some(excluded =>
        food.name.toLowerCase().includes(excluded.toLowerCase()) ||
        (food.category && food.category.toLowerCase().includes(excluded.toLowerCase()))
      )
    );

    // Si no hay suficientes alimentos disponibles, usar datos de respaldo
    if (availableFoods.length < 5) {
      console.warn('No hay suficientes alimentos disponibles según las preferencias, usando datos de respaldo');
      return generateFallbackMeal(dietDayId, mealType, target, preferences);
    }

    // Categorizar alimentos por tipo
    const proteinFoods = availableFoods.filter(food => (food.protein / food.calories) > 0.15);
    const carbFoods = availableFoods.filter(food => (food.carbs / food.calories) > 0.15);
    const fatFoods = availableFoods.filter(food => (food.fat * 9 / food.calories) > 0.25);
    const balancedFoods = availableFoods.filter(food =>
      (food.protein / food.calories) > 0.1 &&
      (food.carbs / food.calories) > 0.1 &&
      (food.fat * 9 / food.calories) > 0.1
    );

    // Generar nombre de comida según el tipo y preferencias
    mealName = generateMealName(mealType, preferences.dietType);

    // Seleccionar alimentos según el tipo de comida y objetivos nutricionales
    switch (mealType) {
      case 'desayuno':
        foods = selectBreakfastFoods(carbFoods, proteinFoods, fatFoods, balancedFoods, target, preferences);
        break;
      case 'almuerzo':
        foods = selectLunchFoods(carbFoods, proteinFoods, fatFoods, balancedFoods, target, preferences);
        break;
      case 'cena':
        foods = selectDinnerFoods(carbFoods, proteinFoods, fatFoods, balancedFoods, target, preferences);
        break;
      case 'snack':
        foods = selectSnackFoods(carbFoods, proteinFoods, fatFoods, balancedFoods, target, preferences);
        break;
    }

    // Calcular totales
    const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
    const totalProtein = foods.reduce((sum, food) => sum + food.protein, 0);
    const totalCarbs = foods.reduce((sum, food) => sum + food.carbs, 0);
    const totalFat = foods.reduce((sum, food) => sum + food.fat, 0);

    // Crear la comida en la base de datos
    return createMealInDatabase(dietDayId, mealType, mealName, foods, totalCalories, totalProtein, totalCarbs, totalFat, preferences);
  } catch (error) {
    console.error('Error al generar comida:', error);
    throw error;
  }
};

// Función para obtener una dieta personalizada
export const getPersonalizedDiet = async (dietId: string): Promise<QueryResponse<PersonalizedDiet>> => {
  try {
    const { data, error } = await supabase
      .from('personalized_diets')
      .select('*')
      .eq('id', dietId)
      .single();

    if (error) {
      throw error;
    }

    const personalizedDiet: PersonalizedDiet = {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      dietType: data.diet_type,
      startDate: data.start_date,
      endDate: data.end_date,
      calorieTarget: data.calorie_target,
      proteinTarget: data.protein_target,
      carbsTarget: data.carbs_target,
      fatTarget: data.fat_target,
      mealsPerDay: data.meals_per_day,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return { data: personalizedDiet, error: null };
  } catch (error) {
    console.error('Error al obtener dieta personalizada:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

// Función para obtener las dietas personalizadas de un usuario
export const getUserPersonalizedDiets = async (userId: string): Promise<QueryResponse<PersonalizedDiet[]>> => {
  try {
    const { data, error } = await supabase
      .from('personalized_diets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const personalizedDiets: PersonalizedDiet[] = data.map(diet => ({
      id: diet.id,
      userId: diet.user_id,
      name: diet.name,
      description: diet.description,
      dietType: diet.diet_type,
      startDate: diet.start_date,
      endDate: diet.end_date,
      calorieTarget: diet.calorie_target,
      proteinTarget: diet.protein_target,
      carbsTarget: diet.carbs_target,
      fatTarget: diet.fat_target,
      mealsPerDay: diet.meals_per_day,
      isActive: diet.is_active,
      createdAt: diet.created_at,
      updatedAt: diet.updated_at
    }));

    return { data: personalizedDiets, error: null };
  } catch (error) {
    console.error('Error al obtener dietas personalizadas del usuario:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

// Función para obtener los días de una dieta personalizada
export const getDietDays = async (dietId: string): Promise<QueryResponse<PersonalizedDietDay[]>> => {
  try {
    const { data, error } = await supabase
      .from('personalized_diet_days')
      .select('*')
      .eq('diet_id', dietId)
      .order('day_number', { ascending: true });

    if (error) {
      throw error;
    }

    const dietDays: PersonalizedDietDay[] = [];

    for (const day of data) {
      // Obtener las comidas para este día
      const { data: mealsData, error: mealsError } = await supabase
        .from('personalized_diet_meals')
        .select('*')
        .eq('diet_day_id', day.id);

      if (mealsError) {
        throw mealsError;
      }

      const meals: PersonalizedDietMeal[] = [];

      for (const meal of mealsData) {
        // Obtener los alimentos para esta comida
        const { data: foodsData, error: foodsError } = await supabase
          .from('personalized_diet_foods')
          .select('*')
          .eq('meal_id', meal.id);

        if (foodsError) {
          throw foodsError;
        }

        meals.push({
          id: meal.id,
          dietDayId: meal.diet_day_id,
          mealType: meal.meal_type,
          name: meal.name,
          foods: foodsData.map(food => ({
            foodId: food.food_id,
            name: food.name,
            servingSize: food.serving_size,
            servingUnit: food.serving_unit,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            recipeId: food.recipe_id
          })),
          totalCalories: meal.total_calories,
          totalProtein: meal.total_protein,
          totalCarbs: meal.total_carbs,
          totalFat: meal.total_fat,
          notes: meal.notes
        });
      }

      dietDays.push({
        id: day.id,
        dietId: day.diet_id,
        dayNumber: day.day_number,
        totalCalories: day.total_calories,
        totalProtein: day.total_protein,
        totalCarbs: day.total_carbs,
        totalFat: day.total_fat,
        meals
      });
    }

    return { data: dietDays, error: null };
  } catch (error) {
    console.error('Error al obtener días de la dieta:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};
