import {
  NutritionEntry,
  FoodItem,
  NutritionRecommendation,
  NutritionGoal,
  MealPlan,
  WeightLog,
  NutritionProfile
} from './types/nutrition';
import { supabase } from './supabase-client';
import { calculateBMR, calculateTDEE } from './nutrition-profile-service';
import { DietPreference, PersonalizedDiet } from './diet-ai-service';

// Interfaz para los patrones de consumo del usuario
interface ConsumptionPattern {
  userId: string;
  preferredFoods: string[];
  avoidedFoods: string[];
  mealFrequency: {
    desayuno: number;
    almuerzo: number;
    cena: number;
    snack: number;
  };
  macroDistribution: {
    protein: number; // porcentaje
    carbs: number;   // porcentaje
    fat: number;     // porcentaje
  };
  calorieAverage: number;
  consistency: number; // 0-100
  timePatterns: {
    morningEater: number; // 0-100, preferencia por comer en la mañana
    eveningEater: number; // 0-100, preferencia por comer en la noche
    regularMealTimes: boolean; // si el usuario come a horas regulares
    peakEatingHours: number[]; // horas del día con mayor consumo
  };
  nutritionalPreferences: {
    sweetPreference: number; // 0-100, preferencia por alimentos dulces
    savoryPreference: number; // 0-100, preferencia por alimentos salados
    fattyFoodFrequency: number; // 0-100, frecuencia de consumo de alimentos grasos
    processedFoodFrequency: number; // 0-100, frecuencia de alimentos procesados
  };
  seasonality: {
    season: 'spring' | 'summer' | 'fall' | 'winter';
    seasonalFoods: string[];
  };
  healthMetrics: {
    weightTrend: 'gaining' | 'losing' | 'maintaining';
    weightChangeRate: number; // kg por semana
    energyLevels: number; // 0-100, reportado por el usuario
    digestiveIssues: string[]; // problemas digestivos reportados
  };
}

// Interfaz para el modelo de usuario
interface UserModel {
  userId: string;
  consumptionPattern: ConsumptionPattern;
  activityData: {
    averageDailySteps: number;
    workoutFrequency: number; // veces por semana
    workoutIntensity: number; // 0-100
    activeMinutesPerDay: number;
    restingHeartRate?: number;
    vo2Max?: number;
  };
  sleepData: {
    averageSleepHours: number;
    sleepQuality: number; // 0-100
    sleepSchedule: {
      bedTime: string; // HH:MM
      wakeTime: string; // HH:MM
    };
  };
  personalFactors: {
    age: number;
    gender: 'male' | 'female' | 'other';
    height: number; // cm
    weight: number; // kg
    goalWeight: number; // kg
    medicalConditions: string[];
    dietaryRestrictions: string[];
  };
  adherenceScore: number; // 0-100, qué tan bien sigue el usuario las recomendaciones
  responseToRecommendations: {
    implementationRate: number; // 0-100, porcentaje de recomendaciones implementadas
    successRate: number; // 0-100, porcentaje de recomendaciones que tuvieron éxito
    preferredRecommendationType: 'specific' | 'general' | 'strict' | 'flexible';
  };
}

// Interfaz para el resultado del análisis de ML
interface MLAnalysisResult {
  userId: string;
  timestamp: string;
  dietRecommendations: {
    optimalCalories: number;
    optimalMacros: {
      protein: number; // g
      carbs: number; // g
      fat: number; // g
    };
    mealTimingRecommendations: {
      optimalMealTimes: string[]; // HH:MM
      mealSizeDistribution: number[]; // porcentaje de calorías por comida
      mealCount: number;
    };
    foodRecommendations: {
      recommendedFoods: string[];
      foodsToLimit: string[];
      foodsToAvoid: string[];
    };
  };
  activityRecommendations: {
    optimalWorkoutTimes: string[]; // HH:MM
    recommendedActivityTypes: string[];
    calorieAdjustmentForActivity: number; // calorías adicionales por actividad
  };
  predictionMetrics: {
    weightTrendPrediction: number[]; // kg predichos para las próximas semanas
    energyLevelPrediction: number; // 0-100
    adherenceProbability: number; // 0-100, probabilidad de que el usuario siga el plan
    successProbability: number; // 0-100, probabilidad de éxito del plan
  };
  confidenceScore: number; // 0-100, confianza del modelo en sus predicciones
}

// Función avanzada para analizar patrones de consumo basados en el historial
export const analyzeConsumptionPatterns = async (
  userId: string,
  nutritionEntries: NutritionEntry[]
): Promise<ConsumptionPattern> => {
  // Inicializar el patrón con valores predeterminados
  const pattern: ConsumptionPattern = {
    userId,
    preferredFoods: [],
    avoidedFoods: [],
    mealFrequency: {
      desayuno: 0,
      almuerzo: 0,
      cena: 0,
      snack: 0
    },
    macroDistribution: {
      protein: 0,
      carbs: 0,
      fat: 0
    },
    calorieAverage: 0,
    consistency: 0,
    timePatterns: {
      morningEater: 0,
      eveningEater: 0,
      regularMealTimes: false,
      peakEatingHours: []
    },
    nutritionalPreferences: {
      sweetPreference: 0,
      savoryPreference: 0,
      fattyFoodFrequency: 0,
      processedFoodFrequency: 0
    },
    seasonality: {
      season: getCurrentSeason(),
      seasonalFoods: []
    },
    healthMetrics: {
      weightTrend: 'maintaining',
      weightChangeRate: 0,
      energyLevels: 50,
      digestiveIssues: []
    }
  };

  if (!nutritionEntries || nutritionEntries.length === 0) {
    return pattern;
  }

  // Agrupar entradas por fecha
  const entriesByDate: { [date: string]: NutritionEntry[] } = {};
  nutritionEntries.forEach(entry => {
    if (!entriesByDate[entry.date]) {
      entriesByDate[entry.date] = [];
    }
    entriesByDate[entry.date].push(entry);
  });

  // Calcular frecuencia de comidas
  const totalDays = Object.keys(entriesByDate).length;
  const mealTypes = ['desayuno', 'almuerzo', 'cena', 'snack'];

  mealTypes.forEach(mealType => {
    let daysWithMealType = 0;
    Object.values(entriesByDate).forEach(dayEntries => {
      if (dayEntries.some(entry => entry.meal_type === mealType)) {
        daysWithMealType++;
      }
    });
    pattern.mealFrequency[mealType as keyof typeof pattern.mealFrequency] =
      totalDays > 0 ? (daysWithMealType / totalDays) * 100 : 0;
  });

  // Calcular distribución de macronutrientes
  let totalCalories = 0;
  let totalProteinCalories = 0;
  let totalCarbsCalories = 0;
  let totalFatCalories = 0;

  nutritionEntries.forEach(entry => {
    const entryCalories = entry.calories || 0;
    totalCalories += entryCalories;
    totalProteinCalories += (entry.protein || 0) * 4; // 4 calorías por gramo de proteína
    totalCarbsCalories += (entry.carbs || 0) * 4;     // 4 calorías por gramo de carbohidratos
    totalFatCalories += (entry.fat || 0) * 9;         // 9 calorías por gramo de grasa
  });

  if (totalCalories > 0) {
    pattern.macroDistribution.protein = (totalProteinCalories / totalCalories) * 100;
    pattern.macroDistribution.carbs = (totalCarbsCalories / totalCalories) * 100;
    pattern.macroDistribution.fat = (totalFatCalories / totalCalories) * 100;
  }

  // Calcular promedio de calorías diarias
  const totalCaloriesByDay: { [date: string]: number } = {};
  Object.entries(entriesByDate).forEach(([date, entries]) => {
    totalCaloriesByDay[date] = entries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
  });

  const dailyCalories = Object.values(totalCaloriesByDay);
  pattern.calorieAverage = dailyCalories.length > 0
    ? dailyCalories.reduce((sum, cal) => sum + cal, 0) / dailyCalories.length
    : 0;

  // Identificar alimentos preferidos (los más frecuentes)
  const foodFrequency: { [foodName: string]: number } = {};
  nutritionEntries.forEach(entry => {
    if (!foodFrequency[entry.food_name]) {
      foodFrequency[entry.food_name] = 0;
    }
    foodFrequency[entry.food_name]++;
  });

  // Ordenar alimentos por frecuencia y obtener los 10 más comunes
  pattern.preferredFoods = Object.entries(foodFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([foodName]) => foodName);

  // Calcular consistencia (regularidad en el registro)
  const dates = Object.keys(entriesByDate).map(date => new Date(date));
  dates.sort((a, b) => a.getTime() - b.getTime());

  if (dates.length > 1) {
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    const daySpan = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    pattern.consistency = (dates.length / daySpan) * 100;
  }

  // Analizar patrones de tiempo de comidas
  await analyzeTimePatterns(nutritionEntries, pattern);

  // Analizar preferencias nutricionales
  analyzeNutritionalPreferences(nutritionEntries, pattern);

  // Analizar tendencias de peso
  await analyzeWeightTrends(userId, pattern);

  // Analizar alimentos de temporada
  analyzeSeasonalFoods(pattern);

  return pattern;
};

// Función para obtener la estación actual
const getCurrentSeason = (): 'spring' | 'summer' | 'fall' | 'winter' => {
  const now = new Date();
  const month = now.getMonth();

  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

// Función para analizar patrones de tiempo de comidas
const analyzeTimePatterns = async (
  nutritionEntries: NutritionEntry[],
  pattern: ConsumptionPattern
): Promise<void> => {
  // Extraer horas de las comidas (asumiendo que tenemos timestamp en las entradas)
  const mealHours: number[] = [];
  const morningMeals = [];
  const eveningMeals = [];
  const mealTimesByDay: { [date: string]: number[] } = {};

  for (const entry of nutritionEntries) {
    try {
      // Obtener la hora de la entrada
      const { data, error } = await supabase
        .from('nutrition_entries')
        .select('created_at')
        .eq('id', entry.id)
        .single();

      if (error || !data) continue;

      const createdAt = new Date(data.created_at);
      const hour = createdAt.getHours();

      mealHours.push(hour);

      // Agrupar por mañana/tarde
      if (hour >= 5 && hour < 12) {
        morningMeals.push(entry);
      } else if (hour >= 18 && hour < 24) {
        eveningMeals.push(entry);
      }

      // Agrupar por día para analizar regularidad
      const dateStr = createdAt.toISOString().split('T')[0];
      if (!mealTimesByDay[dateStr]) {
        mealTimesByDay[dateStr] = [];
      }
      mealTimesByDay[dateStr].push(hour);
    } catch (error) {
      console.error('Error al analizar patrones de tiempo:', error);
    }
  }

  // Calcular preferencia por mañana/tarde
  const totalMeals = nutritionEntries.length;
  pattern.timePatterns.morningEater = totalMeals > 0 ? (morningMeals.length / totalMeals) * 100 : 0;
  pattern.timePatterns.eveningEater = totalMeals > 0 ? (eveningMeals.length / totalMeals) * 100 : 0;

  // Determinar horas pico de comidas
  const hourFrequency: { [hour: number]: number } = {};
  mealHours.forEach(hour => {
    if (!hourFrequency[hour]) hourFrequency[hour] = 0;
    hourFrequency[hour]++;
  });

  pattern.timePatterns.peakEatingHours = Object.entries(hourFrequency)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 3)
    .map(([hour]) => Number(hour));

  // Analizar regularidad de horarios
  let regularityScore = 0;
  const days = Object.keys(mealTimesByDay);

  if (days.length >= 3) {
    // Calcular la desviación estándar de los horarios de comida
    const allDeviations: number[] = [];

    for (let i = 0; i < days.length - 1; i++) {
      const day1 = mealTimesByDay[days[i]].sort();
      const day2 = mealTimesByDay[days[i + 1]].sort();

      // Comparar solo si ambos días tienen el mismo número de comidas
      if (day1.length === day2.length && day1.length > 0) {
        for (let j = 0; j < day1.length; j++) {
          const deviation = Math.abs(day1[j] - day2[j]);
          allDeviations.push(deviation);
        }
      }
    }

    if (allDeviations.length > 0) {
      const avgDeviation = allDeviations.reduce((sum, dev) => sum + dev, 0) / allDeviations.length;
      // Si la desviación promedio es menor a 1 hora, consideramos que hay regularidad
      pattern.timePatterns.regularMealTimes = avgDeviation < 1;
    }
  }
};

// Función para analizar preferencias nutricionales
const analyzeNutritionalPreferences = (
  nutritionEntries: NutritionEntry[],
  pattern: ConsumptionPattern
): void => {
  const sweetFoods = ['chocolate', 'dulce', 'postre', 'helado', 'pastel', 'galleta', 'azúcar', 'miel', 'mermelada'];
  const savoryFoods = ['sal', 'queso', 'pizza', 'hamburguesa', 'patatas', 'snack', 'salado'];
  const fattyFoods = ['frito', 'mantequilla', 'aceite', 'grasa', 'tocino', 'crema', 'mayonesa'];
  const processedFoods = ['procesado', 'embutido', 'conserva', 'precocinado', 'instantáneo', 'snack', 'comida rápida'];

  let sweetCount = 0;
  let savoryCount = 0;
  let fattyCount = 0;
  let processedCount = 0;

  nutritionEntries.forEach(entry => {
    const foodName = entry.food_name.toLowerCase();

    // Contar ocurrencias de cada tipo
    if (sweetFoods.some(term => foodName.includes(term))) sweetCount++;
    if (savoryFoods.some(term => foodName.includes(term))) savoryCount++;
    if (fattyFoods.some(term => foodName.includes(term))) fattyCount++;
    if (processedFoods.some(term => foodName.includes(term))) processedCount++;
  });

  const totalEntries = nutritionEntries.length;

  if (totalEntries > 0) {
    pattern.nutritionalPreferences.sweetPreference = (sweetCount / totalEntries) * 100;
    pattern.nutritionalPreferences.savoryPreference = (savoryCount / totalEntries) * 100;
    pattern.nutritionalPreferences.fattyFoodFrequency = (fattyCount / totalEntries) * 100;
    pattern.nutritionalPreferences.processedFoodFrequency = (processedCount / totalEntries) * 100;
  }
};

// Función para analizar tendencias de peso
const analyzeWeightTrends = async (
  userId: string,
  pattern: ConsumptionPattern
): Promise<void> => {
  try {
    // Obtener registros de peso
    const { data: weightLogs, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error || !weightLogs || weightLogs.length < 2) return;

    // Calcular tendencia de peso
    const firstWeight = weightLogs[0].weight;
    const lastWeight = weightLogs[weightLogs.length - 1].weight;
    const weightDiff = lastWeight - firstWeight;

    // Calcular días entre primera y última medición
    const firstDate = new Date(weightLogs[0].date);
    const lastDate = new Date(weightLogs[weightLogs.length - 1].date);
    const daysDiff = Math.max(1, Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Calcular tasa de cambio semanal
    pattern.healthMetrics.weightChangeRate = (weightDiff / daysDiff) * 7;

    // Determinar tendencia
    if (Math.abs(pattern.healthMetrics.weightChangeRate) < 0.1) {
      pattern.healthMetrics.weightTrend = 'maintaining';
    } else if (pattern.healthMetrics.weightChangeRate > 0) {
      pattern.healthMetrics.weightTrend = 'gaining';
    } else {
      pattern.healthMetrics.weightTrend = 'losing';
    }

    // Obtener problemas digestivos reportados (si existen)
    const { data: digestiveIssues } = await supabase
      .from('user_health_reports')
      .select('digestive_issues')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (digestiveIssues && digestiveIssues.length > 0 && digestiveIssues[0].digestive_issues) {
      pattern.healthMetrics.digestiveIssues = digestiveIssues[0].digestive_issues;
    }

  } catch (error) {
    console.error('Error al analizar tendencias de peso:', error);
  }
};

// Función para analizar alimentos de temporada
const analyzeSeasonalFoods = (pattern: ConsumptionPattern): void => {
  // Definir alimentos de temporada por estación
  const seasonalFoodMap = {
    spring: ['espárragos', 'fresas', 'guisantes', 'habas', 'alcachofas', 'cerezas'],
    summer: ['tomate', 'pimiento', 'berenjena', 'calabacín', 'melón', 'sandía', 'melocotón'],
    fall: ['calabaza', 'setas', 'uvas', 'manzanas', 'peras', 'granadas', 'castañas'],
    winter: ['naranja', 'mandarina', 'kiwi', 'col', 'brócoli', 'coliflor', 'puerro']
  };

  // Asignar alimentos de temporada según la estación actual
  pattern.seasonality.seasonalFoods = seasonalFoodMap[pattern.seasonality.season];
};

// Función para generar recomendaciones nutricionales basadas en patrones y objetivos
export const generateNutritionRecommendations = (
  userId: string,
  pattern: ConsumptionPattern,
  nutritionGoal: NutritionGoal | null,
  recentEntries: NutritionEntry[]
): NutritionRecommendation[] => {
  const recommendations: NutritionRecommendation[] = [];

  // Si no hay suficientes datos, devolver recomendaciones básicas
  if (!pattern || !recentEntries || recentEntries.length === 0) {
    return [
      {
        id: `rec-${Date.now()}-1`,
        user_id: userId,
        recommendation_type: 'goal',
        title: 'Establece tus objetivos nutricionales',
        description: 'Configura tus objetivos de calorías y macronutrientes para recibir recomendaciones personalizadas.',
        data: {},
        confidence: 90,
        is_applied: false,
        created_at: new Date().toISOString()
      },
      {
        id: `rec-${Date.now()}-2`,
        user_id: userId,
        recommendation_type: 'meal',
        title: 'Registra tus comidas regularmente',
        description: 'Para obtener recomendaciones más precisas, registra todas tus comidas durante al menos una semana.',
        data: {},
        confidence: 90,
        is_applied: false,
        created_at: new Date().toISOString()
      }
    ];
  }

  // Recomendación basada en distribución de macronutrientes
  if (nutritionGoal) {
    // Calcular la distribución ideal de macros basada en los objetivos
    const idealProteinPercentage = nutritionGoal.protein ? (nutritionGoal.protein * 4 / nutritionGoal.calories!) * 100 : 25;
    const idealCarbsPercentage = nutritionGoal.carbs ? (nutritionGoal.carbs * 4 / nutritionGoal.calories!) * 100 : 50;
    const idealFatPercentage = nutritionGoal.fat ? (nutritionGoal.fat * 9 / nutritionGoal.calories!) * 100 : 25;

    // Comparar con la distribución actual
    const proteinDiff = idealProteinPercentage - pattern.macroDistribution.protein;
    const carbsDiff = idealCarbsPercentage - pattern.macroDistribution.carbs;
    const fatDiff = idealFatPercentage - pattern.macroDistribution.fat;

    // Generar recomendaciones basadas en las diferencias
    if (Math.abs(proteinDiff) > 5) {
      recommendations.push({
        id: `rec-${Date.now()}-3`,
        user_id: userId,
        recommendation_type: 'food',
        title: proteinDiff > 0 ? 'Aumenta tu consumo de proteínas' : 'Reduce tu consumo de proteínas',
        description: proteinDiff > 0
          ? 'Tu consumo de proteínas está por debajo de tu objetivo. Considera incluir más alimentos ricos en proteínas como pollo, pescado, huevos o legumbres.'
          : 'Tu consumo de proteínas está por encima de tu objetivo. Considera reducir ligeramente las porciones de alimentos ricos en proteínas.',
        data: {
          currentPercentage: pattern.macroDistribution.protein.toFixed(1),
          targetPercentage: idealProteinPercentage.toFixed(1),
          difference: Math.abs(proteinDiff).toFixed(1)
        },
        confidence: 80,
        is_applied: false,
        created_at: new Date().toISOString()
      });
    }

    if (Math.abs(carbsDiff) > 5) {
      recommendations.push({
        id: `rec-${Date.now()}-4`,
        user_id: userId,
        recommendation_type: 'food',
        title: carbsDiff > 0 ? 'Aumenta tu consumo de carbohidratos' : 'Reduce tu consumo de carbohidratos',
        description: carbsDiff > 0
          ? 'Tu consumo de carbohidratos está por debajo de tu objetivo. Considera incluir más alimentos como arroz, pasta, patatas o frutas.'
          : 'Tu consumo de carbohidratos está por encima de tu objetivo. Considera reducir ligeramente las porciones de alimentos ricos en carbohidratos.',
        data: {
          currentPercentage: pattern.macroDistribution.carbs.toFixed(1),
          targetPercentage: idealCarbsPercentage.toFixed(1),
          difference: Math.abs(carbsDiff).toFixed(1)
        },
        confidence: 80,
        is_applied: false,
        created_at: new Date().toISOString()
      });
    }

    if (Math.abs(fatDiff) > 5) {
      recommendations.push({
        id: `rec-${Date.now()}-5`,
        user_id: userId,
        recommendation_type: 'food',
        title: fatDiff > 0 ? 'Aumenta tu consumo de grasas saludables' : 'Reduce tu consumo de grasas',
        description: fatDiff > 0
          ? 'Tu consumo de grasas está por debajo de tu objetivo. Considera incluir más alimentos con grasas saludables como aguacate, frutos secos o aceite de oliva.'
          : 'Tu consumo de grasas está por encima de tu objetivo. Considera reducir ligeramente las porciones de alimentos ricos en grasas.',
        data: {
          currentPercentage: pattern.macroDistribution.fat.toFixed(1),
          targetPercentage: idealFatPercentage.toFixed(1),
          difference: Math.abs(fatDiff).toFixed(1)
        },
        confidence: 80,
        is_applied: false,
        created_at: new Date().toISOString()
      });
    }

    // Recomendación basada en calorías
    if (nutritionGoal.calories) {
      const calorieDiff = nutritionGoal.calories - pattern.calorieAverage;
      if (Math.abs(calorieDiff) > 200) {
        recommendations.push({
          id: `rec-${Date.now()}-6`,
          user_id: userId,
          recommendation_type: 'meal',
          title: calorieDiff > 0 ? 'Aumenta tu ingesta calórica' : 'Reduce tu ingesta calórica',
          description: calorieDiff > 0
            ? `Estás consumiendo aproximadamente ${Math.abs(Math.round(calorieDiff))} calorías menos de tu objetivo diario. Considera aumentar ligeramente las porciones o añadir snacks saludables.`
            : `Estás consumiendo aproximadamente ${Math.abs(Math.round(calorieDiff))} calorías más de tu objetivo diario. Considera reducir ligeramente las porciones o elegir alternativas menos calóricas.`,
          data: {
            currentCalories: Math.round(pattern.calorieAverage),
            targetCalories: nutritionGoal.calories,
            difference: Math.abs(Math.round(calorieDiff))
          },
          confidence: 85,
          is_applied: false,
          created_at: new Date().toISOString()
        });
      }
    }
  }

  // Recomendación basada en la consistencia
  if (pattern.consistency < 70) {
    recommendations.push({
      id: `rec-${Date.now()}-7`,
      user_id: userId,
      recommendation_type: 'habit',
      title: 'Mejora tu consistencia en el registro',
      description: 'Registrar tus comidas regularmente te ayudará a mantener un mejor seguimiento de tu nutrición y recibir recomendaciones más precisas.',
      data: {
        currentConsistency: Math.round(pattern.consistency)
      },
      confidence: 90,
      is_applied: false,
      created_at: new Date().toISOString()
    });
  }

  // Recomendación basada en la frecuencia de comidas
  const lowFrequencyMeals = Object.entries(pattern.mealFrequency)
    .filter(([_, frequency]) => frequency < 50)
    .map(([mealType]) => mealType);

  if (lowFrequencyMeals.length > 0) {
    const mealTypeNames: { [key: string]: string } = {
      desayuno: 'desayuno',
      almuerzo: 'almuerzo',
      cena: 'cena',
      snack: 'merienda o snack'
    };

    const mealsList = lowFrequencyMeals
      .map(meal => mealTypeNames[meal])
      .join(', ');

    recommendations.push({
      id: `rec-${Date.now()}-8`,
      user_id: userId,
      recommendation_type: 'habit',
      title: 'Mantén una rutina regular de comidas',
      description: `Hemos notado que no registras regularmente tu ${mealsList}. Mantener una rutina regular de comidas puede ayudarte a alcanzar tus objetivos nutricionales.`,
      data: {
        lowFrequencyMeals
      },
      confidence: 75,
      is_applied: false,
      created_at: new Date().toISOString()
    });
  }

  return recommendations;
};

// Función para generar un plan de comidas personalizado
export const generateMealPlan = (
  userId: string,
  pattern: ConsumptionPattern,
  nutritionGoal: NutritionGoal | null,
  availableFoods: FoodItem[]
): MealPlan => {
  // Crear un plan de comidas básico
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + 6); // Plan para una semana

  const mealPlan: MealPlan = {
    id: `plan-${Date.now()}`,
    user_id: userId,
    name: 'Plan de comidas personalizado',
    description: 'Plan generado automáticamente basado en tus preferencias y objetivos',
    start_date: today.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    is_active: true,
    is_template: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return mealPlan;
};
