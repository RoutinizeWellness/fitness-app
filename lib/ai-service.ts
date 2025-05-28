import { supabase } from './supabase-unified';
import { v4 as uuidv4 } from 'uuid';
import {
  AIRecommendation,
  AIWorkoutPlan,
  AIProgressAnalysis,
  AIQuery,
  AIResponse
} from './ai-types';
import { getExercises, getWorkouts, getWorkoutStats } from './supabase-queries';
import { supabaseAuth } from './auth/supabase-auth';
import { getUserPatterns } from './learning-algorithm';

import {
  analyzeWorkoutPatterns,
  generateSmartRecommendations,
  getSmartRecommendations
} from './learning-algorithm';

// Función para generar recomendaciones personalizadas basadas en datos del usuario
export async function generatePersonalizedRecommendations(userId: string): Promise<AIRecommendation[]> {
  try {
    // Primero, intentar obtener recomendaciones del algoritmo de aprendizaje
    const { data: smartRecommendations, error: smartError } = await getSmartRecommendations(userId, {
      activeOnly: true,
      limit: 5
    });

    // Si hay recomendaciones inteligentes, convertirlas al formato AIRecommendation
    if (!smartError && smartRecommendations && smartRecommendations.length > 0) {
      console.log(`Usando ${smartRecommendations.length} recomendaciones inteligentes basadas en patrones de usuario`);

      // Convertir las recomendaciones inteligentes al formato AIRecommendation
      const aiRecommendations: AIRecommendation[] = smartRecommendations.map(rec => {
        // Mapear el tipo de recomendación
        const recommendationType: 'workout' | 'nutrition' | 'recovery' | 'mindfulness' =
          rec.recommendation_type === 'workout' ? 'workout' :
          rec.recommendation_type === 'habit' && rec.recommendation_data.action === 'optimize_recovery' ? 'recovery' :
          rec.recommendation_type === 'habit' && rec.recommendation_data.action === 'nutrition' ? 'nutrition' :
          'mindfulness';

        // Extraer ejercicios recomendados si existen
        const exercises = rec.recommendation_data.exercises ||
                         (rec.recommendation_data.workout_type ? [] : undefined);

        return {
          id: rec.id,
          type: recommendationType,
          title: rec.title,
          description: rec.description,
          confidence: rec.confidence,
          reason: rec.reasoning,
          exercises,
          tags: [rec.recommendation_type, 'smart', 'personalized'],
          created_at: rec.created_at
        };
      });

      // Si hay suficientes recomendaciones inteligentes, devolverlas
      if (aiRecommendations.length >= 2) {
        return aiRecommendations;
      }

      // Si no hay suficientes, combinar con recomendaciones generadas tradicionalmente
      console.log('No hay suficientes recomendaciones inteligentes, combinando con recomendaciones tradicionales');
    } else {
      // Si no hay recomendaciones inteligentes, intentar analizar patrones y generar nuevas
      console.log('No se encontraron recomendaciones inteligentes, analizando patrones...');

      // Analizar patrones de usuario
      const { error: analysisError } = await analyzeWorkoutPatterns(userId);

      if (!analysisError) {
        // Generar recomendaciones basadas en los patrones analizados
        const { data: newRecommendations, error: genError } = await generateSmartRecommendations(userId);

        if (!genError && newRecommendations && newRecommendations.length > 0) {
          console.log(`Se generaron ${newRecommendations.length} nuevas recomendaciones inteligentes`);

          // Convertir las nuevas recomendaciones al formato AIRecommendation
          const aiRecommendations: AIRecommendation[] = newRecommendations.map(rec => {
            // Mapear el tipo de recomendación
            const recommendationType: 'workout' | 'nutrition' | 'recovery' | 'mindfulness' =
              rec.recommendation_type === 'workout' ? 'workout' :
              rec.recommendation_type === 'habit' && rec.recommendation_data.action === 'optimize_recovery' ? 'recovery' :
              rec.recommendation_type === 'habit' && rec.recommendation_data.action === 'nutrition' ? 'nutrition' :
              'mindfulness';

            // Extraer ejercicios recomendados si existen
            const exercises = rec.recommendation_data.exercises ||
                             (rec.recommendation_data.workout_type ? [] : undefined);

            return {
              id: rec.id,
              type: recommendationType,
              title: rec.title,
              description: rec.description,
              confidence: rec.confidence,
              reason: rec.reasoning,
              exercises,
              tags: [rec.recommendation_type, 'smart', 'personalized'],
              created_at: rec.created_at
            };
          });

          // Si hay suficientes recomendaciones inteligentes, devolverlas
          if (aiRecommendations.length >= 2) {
            return aiRecommendations;
          }
        }
      }
    }

    // Si llegamos aquí, no hay suficientes recomendaciones inteligentes
    // Usar el método tradicional como respaldo

    // Obtener datos de entrenamientos recientes
    const { data: workouts } = await getWorkouts(userId, {
      limit: 10,
      orderBy: { column: 'date', ascending: false }
    });

    // Obtener estadísticas de entrenamiento
    const { data: stats } = await getWorkoutStats(userId, {
      period: 'month'
    });

    // Obtener ejercicios para recomendaciones
    const { data: exercises } = await getExercises({
      limit: 50
    });

    // Simular análisis de IA
    const needsRecovery = Math.random() > 0.7;
    const focusAreas = ['core', 'upper_body', 'lower_body', 'cardio'];
    const randomFocusArea = focusAreas[Math.floor(Math.random() * focusAreas.length)];

    const recommendations: AIRecommendation[] = [];

    // Recomendación de recuperación si es necesario
    if (needsRecovery) {
      recommendations.push({
        id: uuidv4(),
        type: 'recovery',
        title: 'Día de recuperación activa',
        description: 'Basado en tus últimos entrenamientos, tu cuerpo necesita recuperarse. Realiza actividades ligeras como caminar o estiramientos suaves.',
        confidence: 85,
        reason: 'Has tenido varios entrenamientos intensos en los últimos días sin descanso adecuado.',
        tags: ['recovery', 'active_rest', 'wellness'],
        created_at: new Date().toISOString()
      });
    } else {
      // Recomendación de entrenamiento
      const recommendedExercises = exercises
        ?.filter(ex => ex.muscle_group.toLowerCase().includes(randomFocusArea) ||
                      (ex.secondary_muscle_groups && ex.secondary_muscle_groups.some(m => m.toLowerCase().includes(randomFocusArea))))
        .slice(0, 4)
        .map(ex => ex.id) || [];

      recommendations.push({
        id: uuidv4(),
        type: 'workout',
        title: `Entrenamiento de ${randomFocusArea.replace('_', ' ')}`,
        description: `Basado en tu historial de entrenamientos, te recomendamos enfocarte en ${randomFocusArea.replace('_', ' ')} para equilibrar tu desarrollo muscular.`,
        confidence: 78,
        reason: 'Análisis de tus patrones de entrenamiento muestra que esta área ha recibido menos atención.',
        exercises: recommendedExercises,
        tags: [randomFocusArea, 'balanced_training', 'personalized'],
        created_at: new Date().toISOString()
      });
    }

    // Recomendación de nutrición
    recommendations.push({
      id: uuidv4(),
      type: 'nutrition',
      title: 'Optimiza tu ingesta de proteínas',
      description: 'Para maximizar la recuperación muscular, asegúrate de consumir suficiente proteína después de tus entrenamientos.',
      confidence: 72,
      reason: 'La recuperación óptima requiere nutrientes adecuados, especialmente después de entrenamientos intensos.',
      tags: ['nutrition', 'protein', 'recovery'],
      created_at: new Date().toISOString()
    });

    return recommendations;
  } catch (error) {
    console.error('Error al generar recomendaciones:', error);
    throw error;
  }
}

// Función para guardar un plan de entrenamiento generado por IA
export async function saveAIWorkoutPlan(userId: string, plan: AIWorkoutPlan): Promise<{ success: boolean; error?: any }> {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'ai_workout_plans')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla ai_workout_plans no existe. Creándola...');

      // Crear la tabla si no existe
      const { error: createTableError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS ai_workout_plans (
            id UUID PRIMARY KEY,
            user_id UUID REFERENCES auth.users NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            difficulty TEXT,
            duration_weeks INTEGER,
            sessions_per_week INTEGER,
            focus_areas JSONB,
            workouts JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS idx_ai_workout_plans_user_id ON ai_workout_plans(user_id);
        `
      });

      if (createTableError) {
        console.error('Error al crear la tabla ai_workout_plans:', createTableError);
        return { success: false, error: createTableError };
      }
    }

    // Guardar el plan en la base de datos
    const { error } = await supabase
      .from('ai_workout_plans')
      .insert([{
        id: plan.id,
        user_id: userId,
        title: plan.title,
        description: plan.description,
        difficulty: plan.difficulty,
        duration_weeks: plan.duration_weeks,
        sessions_per_week: plan.sessions_per_week,
        focus_areas: plan.focus_areas,
        workouts: plan.workouts,
        created_at: plan.created_at,
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error al guardar plan de entrenamiento:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error al guardar plan de entrenamiento:', error);
    return { success: false, error };
  }
}

// Función para generar un plan de entrenamiento personalizado
export async function generateWorkoutPlan(userId: string, preferences: {
  goal: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  focusAreas: string[];
  duration: number;
  limitations?: string[];
}): Promise<AIWorkoutPlan> {
  try {
    // Obtener patrones de usuario para personalizar el plan
    const { data: userPatterns } = await getUserPatterns(userId);

    // Obtener patrones de tiempo de entrenamiento si existen
    const timingPattern = userPatterns?.find(p => p.pattern_type === 'timing');

    // Ajustar preferencias basadas en patrones aprendidos
    if (timingPattern) {
      console.log('Usando patrones de tiempo de entrenamiento para personalizar el plan');

      // Ajustar días por semana basado en la frecuencia detectada
      const weeklyFrequency = parseFloat(timingPattern.pattern_data.weekly_frequency);
      if (weeklyFrequency > 0 && Math.abs(weeklyFrequency - preferences.daysPerWeek) > 1) {
        // Si la diferencia es significativa, sugerir un valor intermedio
        const suggestedFrequency = Math.round((weeklyFrequency + preferences.daysPerWeek) / 2);
        console.log(`Ajustando días por semana de ${preferences.daysPerWeek} a ${suggestedFrequency} basado en patrones de usuario`);
        preferences.daysPerWeek = suggestedFrequency;
      }
    }

    // Obtener ejercicios para el plan
    const { data: allExercises } = await getExercises({
      limit: 200
    });

    if (!allExercises) {
      throw new Error('No se pudieron obtener ejercicios');
    }

    // Filtrar ejercicios por nivel de dificultad
    const difficultyMap = {
      'beginner': 'Principiante',
      'intermediate': 'Intermedio',
      'advanced': 'Avanzado'
    };

    // Asegurarse de que todos los ejercicios tengan los campos necesarios
    const validExercises = allExercises.filter(ex =>
      ex && ex.id && ex.name && ex.muscle_group
    );

    console.log(`Total de ejercicios válidos: ${validExercises.length}`);

    // Normalizar la dificultad para la comparación
    const normalizedDifficultyMap = {
      'beginner': ['principiante', 'Principiante', 'PRINCIPIANTE'],
      'intermediate': ['intermedio', 'Intermedio', 'INTERMEDIO'],
      'advanced': ['avanzado', 'Avanzado', 'AVANZADO', 'experto', 'Experto', 'EXPERTO']
    };

    // Filtrar ejercicios por nivel de dificultad
    let suitableExercises = validExercises.filter(ex => {
      if (!ex.difficulty) return true; // Incluir ejercicios sin dificultad especificada

      const normalizedDifficulty = ex.difficulty.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      if (preferences.level === 'beginner') {
        return normalizedDifficultyMap.beginner.some(d =>
          d.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalizedDifficulty
        );
      } else if (preferences.level === 'intermediate') {
        return normalizedDifficultyMap.beginner.some(d =>
          d.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalizedDifficulty
        ) || normalizedDifficultyMap.intermediate.some(d =>
          d.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalizedDifficulty
        );
      } else { // advanced
        return true; // Para nivel avanzado, incluir todos los ejercicios
      }
    });

    console.log(`Ejercicios adecuados para nivel ${preferences.level}: ${suitableExercises.length}`);

    // Si no hay suficientes ejercicios adecuados, usar todos los ejercicios válidos
    if (suitableExercises.length < 20) {
      console.log(`No hay suficientes ejercicios para el nivel ${preferences.level}. Usando todos los ejercicios válidos.`);
      suitableExercises = validExercises;
    }

    // Crear workouts para cada día
    const workouts = [];
    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    for (let day = 1; day <= preferences.daysPerWeek; day++) {
      // Determinar el enfoque del día
      let focusArea = preferences.focusAreas[day % preferences.focusAreas.length];

      // Mapeo de áreas de enfoque a grupos musculares en la base de datos
      const muscleGroupMap = {
        // Áreas principales
        'pecho': ['Pecho'],
        'espalda': ['Espalda', 'Trapecio', 'Lumbares'],
        'hombros': ['Hombros'],
        'piernas': ['Cuádriceps', 'Isquiotibiales', 'Pantorrillas', 'Abductores', 'Aductores', 'Piernas'],
        'core': ['Core', 'Abdominales', 'Oblicuos'],
        'gluteos': ['Glúteos'],
        'cardio': ['Cardio'],

        // Áreas específicas
        'biceps': ['Bíceps'],
        'triceps': ['Tríceps'],
        'antebrazos': ['Antebrazos'],
        'cuadriceps': ['Cuádriceps'],
        'isquiotibiales': ['Isquiotibiales'],
        'pantorrillas': ['Pantorrillas'],
        'abdominales': ['Abdominales'],
        'lumbares': ['Lumbares'],
        'trapecio': ['Trapecio'],
        'oblicuos': ['Oblicuos'],
        'abductores': ['Abductores'],
        'aductores': ['Aductores']
      };

      // Normalizar el área de enfoque (minúsculas, sin acentos)
      const normalizedFocusArea = focusArea.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // Obtener los grupos musculares correspondientes al área de enfoque
      const targetMuscleGroups = muscleGroupMap[normalizedFocusArea] ||
        Object.values(muscleGroupMap).flat().filter(group =>
          group.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .includes(normalizedFocusArea)
        );

      console.log(`Buscando ejercicios para: ${focusArea} (Grupos musculares: ${targetMuscleGroups.join(', ')})`);

      // Estrategia 1: Búsqueda exacta por grupo muscular
      let dayExercises = suitableExercises
        .filter(ex =>
          targetMuscleGroups.some(group =>
            ex.muscle_group === group ||
            (ex.secondary_muscle_groups && ex.secondary_muscle_groups.some(m => m === group))
          )
        );

      console.log(`Estrategia 1 (coincidencia exacta): ${dayExercises.length} ejercicios encontrados`);

      // Estrategia 2: Búsqueda por coincidencia parcial en el nombre del grupo muscular
      if (dayExercises.length < 3) {
        const flexibleMatches = suitableExercises
          .filter(ex =>
            !dayExercises.includes(ex) && // Evitar duplicados
            targetMuscleGroups.some(group => {
              const normalizedGroup = group.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              const normalizedMuscleGroup = ex.muscle_group.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

              return normalizedMuscleGroup.includes(normalizedGroup) ||
                     normalizedGroup.includes(normalizedMuscleGroup) ||
                     (ex.secondary_muscle_groups && ex.secondary_muscle_groups.some(m =>
                       m.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedGroup) ||
                       normalizedGroup.includes(m.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
                     ));
            })
          );

        console.log(`Estrategia 2 (coincidencia parcial): ${flexibleMatches.length} ejercicios adicionales encontrados`);
        dayExercises = [...dayExercises, ...flexibleMatches];
      }

      // Estrategia 3: Búsqueda por categoría o etiquetas
      if (dayExercises.length < 3) {
        const categoryMatches = suitableExercises
          .filter(ex =>
            !dayExercises.includes(ex) && // Evitar duplicados
            ((ex.category && normalizedFocusArea.includes(ex.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) ||
             (ex.tags && ex.tags.some(tag =>
               tag.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedFocusArea) ||
               normalizedFocusArea.includes(tag.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
             )))
          );

        console.log(`Estrategia 3 (categoría/etiquetas): ${categoryMatches.length} ejercicios adicionales encontrados`);
        dayExercises = [...dayExercises, ...categoryMatches];
      }

      // Estrategia 4: Si aún no hay suficientes ejercicios, tomar algunos aleatorios
      if (dayExercises.length < 3) {
        // Primero intentar con ejercicios que no se hayan usado en otros días
        const usedExerciseIds = workouts
          .flatMap(w => w.exercises ? w.exercises.map(e => e.exercise_id) : []);

        const unusedExercises = suitableExercises
          .filter(ex =>
            !dayExercises.includes(ex) &&
            !usedExerciseIds.includes(ex.id)
          );

        // Si hay suficientes ejercicios no usados, tomar de ahí
        if (unusedExercises.length >= 3) {
          const randomUnusedExercises = unusedExercises
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

          console.log(`Estrategia 4a (aleatorios no usados): ${randomUnusedExercises.length} ejercicios adicionales encontrados`);
          dayExercises = [...dayExercises, ...randomUnusedExercises];
        }
        // Si no hay suficientes no usados, tomar cualquiera
        else {
          const randomExercises = suitableExercises
            .filter(ex => !dayExercises.includes(ex))
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

          console.log(`Estrategia 4b (aleatorios): ${randomExercises.length} ejercicios adicionales encontrados`);
          dayExercises = [...dayExercises, ...randomExercises];
        }
      }

      // Estrategia 5: Si después de todo no hay ejercicios, usar ejercicios de cualquier grupo muscular
      if (dayExercises.length === 0) {
        console.log(`No se encontraron ejercicios para ${focusArea}. Usando ejercicios aleatorios.`);

        // Tomar ejercicios aleatorios de cualquier grupo muscular
        const randomExercises = validExercises
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);

        console.log(`Estrategia 5 (cualquier grupo muscular): ${randomExercises.length} ejercicios aleatorios seleccionados`);
        dayExercises = randomExercises;
      }

      // Limitar a 5-7 ejercicios por día
      dayExercises = dayExercises.slice(0, 5 + Math.floor(Math.random() * 3));

      console.log(`Día ${day} (${focusArea}): ${dayExercises.length} ejercicios encontrados`);

      // Verificar que haya ejercicios para este día
      if (dayExercises.length === 0) {
        console.error(`ERROR: No se encontraron ejercicios para el día ${day} (${focusArea})`);

        // Usar ejercicios aleatorios como último recurso
        dayExercises = validExercises
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);
      }

      // Formatear el nombre del área de enfoque
      const formattedFocusArea = focusArea.charAt(0).toUpperCase() + focusArea.slice(1)
        .replace(/biceps/i, 'Bíceps')
        .replace(/triceps/i, 'Tríceps')
        .replace(/gluteos/i, 'Glúteos')
        .replace(/cuadriceps/i, 'Cuádriceps');

      // Asegurarse de que cada ejercicio tenga todos los campos necesarios
      const cleanExercises = dayExercises.map(ex => {
        // Asegurarse de que el nombre del ejercicio sea legible
        const cleanName = ex.name
          ? ex.name.charAt(0).toUpperCase() + ex.name.slice(1)
          : `Ejercicio para ${formattedFocusArea}`;

        return {
          exercise_id: ex.id,
          name: cleanName,
          muscle_group: ex.muscle_group || formattedFocusArea,
          sets: preferences.level === 'beginner' ? 3 :
                preferences.level === 'intermediate' ? 4 : 5,
          reps: preferences.goal.toLowerCase().includes('fuerza') ? 6 :
                preferences.goal.toLowerCase().includes('resistencia') ? 15 : 10,
          rest_seconds: preferences.goal.toLowerCase().includes('fuerza') ? 90 :
                        preferences.goal.toLowerCase().includes('resistencia') ? 30 : 60,
          notes: ex.tips || undefined,
          // Añadir campos adicionales para mejorar la visualización
          difficulty: ex.difficulty || difficultyMap[preferences.level],
          equipment: ex.equipment || 'Varios',
          image_url: ex.image_url || undefined
        };
      });

      // Crear el workout
      workouts.push({
        id: uuidv4(),
        day,
        title: `${daysOfWeek[day-1]}: ${formattedFocusArea}`,
        description: `Entrenamiento enfocado en ${formattedFocusArea} para ${preferences.goal.toLowerCase()}.`,
        duration_minutes: 45 + Math.floor(Math.random() * 30), // 45-75 minutos
        intensity: preferences.level === 'beginner' ? 'low' :
                  preferences.level === 'intermediate' ? 'moderate' : 'high',
        exercises: cleanExercises,
        focus_area: formattedFocusArea
      });
    }

    // Crear el plan completo
    return {
      id: uuidv4(),
      title: `Plan de ${preferences.goal} - ${preferences.level}`,
      description: `Plan personalizado de ${preferences.daysPerWeek} días a la semana enfocado en ${preferences.focusAreas.join(', ')} para ${preferences.goal.toLowerCase()}.`,
      difficulty: preferences.level,
      duration_weeks: preferences.duration,
      sessions_per_week: preferences.daysPerWeek,
      focus_areas: preferences.focusAreas,
      workouts,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error al generar plan de entrenamiento:', error);
    throw error;
  }
}

// Función para analizar el progreso del usuario
export async function analyzeUserProgress(userId: string, period: 'week' | 'month' | '3months' = 'month'): Promise<AIProgressAnalysis> {
  try {
    // Obtener patrones de usuario para mejorar el análisis
    const { data: userPatterns } = await getUserPatterns(userId);

    // Obtener estadísticas de entrenamiento
    const { data: stats } = await getWorkoutStats(userId, {
      period
    });

    // Analizar patrones si no existen
    if (!userPatterns || userPatterns.length === 0) {
      await analyzeWorkoutPatterns(userId);
    }

    // Obtener patrones de tiempo y frecuencia
    const timingPattern = userPatterns?.find(p => p.pattern_type === 'timing');

    // Calcular consistencia basada en patrones reales si están disponibles
    let consistency = 50 + Math.floor(Math.random() * 50); // Valor por defecto: 50-100
    let recoveryQuality = 60 + Math.floor(Math.random() * 40); // Valor por defecto: 60-100

    if (timingPattern) {
      // Calcular consistencia basada en la frecuencia real
      const weeklyFrequency = parseFloat(timingPattern.pattern_data.weekly_frequency);
      const preferredDays = timingPattern.pattern_data.preferred_days;

      // Ajustar consistencia basada en la frecuencia y regularidad
      if (weeklyFrequency >= 3) {
        // Buena frecuencia
        consistency = 70 + Math.floor(Math.random() * 30); // 70-100
      } else if (weeklyFrequency >= 1) {
        // Frecuencia moderada
        consistency = 50 + Math.floor(Math.random() * 30); // 50-80
      } else {
        // Baja frecuencia
        consistency = 30 + Math.floor(Math.random() * 30); // 30-60
      }

      // Ajustar calidad de recuperación basada en patrones
      const averageGapDays = parseFloat(timingPattern.pattern_data.average_gap_days);
      if (averageGapDays >= 2) {
        // Buen descanso entre entrenamientos
        recoveryQuality = 70 + Math.floor(Math.random() * 30); // 70-100
      } else {
        // Posible falta de recuperación
        recoveryQuality = 50 + Math.floor(Math.random() * 30); // 50-80
      }
    }

    // Generar cambios en volumen y fuerza basados en datos reales o simulados
    const volumeChange = Math.floor(Math.random() * 30) - 10; // -10% a +20%
    const strengthChange = Math.floor(Math.random() * 25) - 5; // -5% a +20%

    // Generar insights basados en los datos
    const insights = [];
    if (volumeChange > 10) {
      insights.push('Has aumentado significativamente tu volumen de entrenamiento, lo que indica una buena progresión.');
    } else if (volumeChange < 0) {
      insights.push('Tu volumen de entrenamiento ha disminuido. Considera si esto es parte de una fase de descarga planificada o si necesitas ajustar tu rutina.');
    }

    if (strengthChange > 10) {
      insights.push('Estás experimentando ganancias de fuerza notables, lo que indica que tu programa está funcionando bien.');
    }

    if (consistency < 70) {
      insights.push('Tu consistencia podría mejorar. Intenta establecer un horario regular de entrenamiento.');
    } else {
      insights.push('Tu consistencia es excelente, lo que es clave para el progreso a largo plazo.');
    }

    // Generar recomendaciones
    const recommendations = [];
    if (volumeChange > 15) {
      recommendations.push('Considera una semana de descarga para prevenir el sobreentrenamiento.');
    }

    if (strengthChange < 5) {
      recommendations.push('Para mejorar tus ganancias de fuerza, considera aumentar la intensidad (peso) y reducir las repeticiones.');
    }

    if (recoveryQuality < 70) {
      recommendations.push('Tu recuperación podría mejorar. Asegúrate de dormir lo suficiente y considera técnicas de recuperación activa.');
    }

    // Crear el análisis completo
    const now = new Date();
    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setMonth(now.getMonth() - 3);
    }

    return {
      id: uuidv4(),
      period,
      start_date: startDate.toISOString(),
      end_date: now.toISOString(),
      summary: `En este ${period === 'week' ? 'semana' : period === 'month' ? 'mes' : 'trimestre'}, has ${volumeChange > 0 ? 'aumentado' : 'disminuido'} tu volumen de entrenamiento en un ${Math.abs(volumeChange)}% y tu fuerza en un ${Math.abs(strengthChange)}%. Tu consistencia es ${consistency}% y la calidad de recuperación es ${recoveryQuality}%.`,
      metrics: {
        volume_change: volumeChange,
        strength_change: strengthChange,
        consistency,
        recovery_quality: recoveryQuality
      },
      insights,
      recommendations,
      created_at: now.toISOString()
    };
  } catch (error) {
    console.error('Error al analizar progreso:', error);
    throw error;
  }
}

// Función para responder preguntas sobre fitness
export async function askAIAssistant(query: AIQuery): Promise<AIResponse> {
  try {
    // En una implementación real, aquí se llamaría a un servicio de IA como OpenAI
    // Por ahora, simulamos respuestas para preguntas comunes

    const lowerQuery = query.query.toLowerCase();
    let answer = '';
    let sources = [];
    let relatedExercises = [];

    // Simular respuestas para preguntas comunes
    if (lowerQuery.includes('mejor ejercicio para') || lowerQuery.includes('ejercicios para')) {
      // Identificar el grupo muscular o área mencionada
      const muscleGroups = [
        'pecho', 'espalda', 'hombros', 'brazos', 'piernas', 'abdominales',
        'glúteos', 'core', 'cardio', 'resistencia'
      ];

      const mentionedMuscle = muscleGroups.find(muscle => lowerQuery.includes(muscle));

      if (mentionedMuscle) {
        // Obtener ejercicios relacionados
        const { data: exercises } = await getExercises({
          filters: {
            muscle_group: mentionedMuscle === 'brazos' ? 'biceps' :
                          mentionedMuscle === 'glúteos' ? 'gluteos' : mentionedMuscle
          },
          limit: 5
        });

        if (exercises && exercises.length > 0) {
          answer = `Para ${mentionedMuscle}, algunos de los mejores ejercicios son: ${exercises.map(e => e.name).join(', ')}. Estos ejercicios son efectivos porque trabajan el músculo desde diferentes ángulos y con diferentes patrones de movimiento.`;
          relatedExercises = exercises.map(e => e.id);
          sources = [
            { title: 'Biblioteca de Ejercicios', url: '/ejercicios' },
            { title: 'Guía de Entrenamiento para ' + mentionedMuscle.charAt(0).toUpperCase() + mentionedMuscle.slice(1) }
          ];
        }
      }
    } else if (lowerQuery.includes('cuántas repeticiones') || lowerQuery.includes('cuantas repeticiones')) {
      if (lowerQuery.includes('fuerza')) {
        answer = 'Para desarrollar fuerza máxima, lo ideal es trabajar con 1-6 repeticiones por serie con pesos pesados (80-95% de tu 1RM) y descansos de 2-5 minutos entre series. Este rango de repeticiones estimula principalmente adaptaciones neurales y menos hipertrofia.';
      } else if (lowerQuery.includes('hipertrofia') || lowerQuery.includes('músculo') || lowerQuery.includes('musculo')) {
        answer = 'Para hipertrofia (crecimiento muscular), el rango óptimo es de 8-12 repeticiones por serie con pesos moderados (70-80% de tu 1RM) y descansos de 1-2 minutos. Este rango maximiza el estrés metabólico y el daño muscular, factores clave para la hipertrofia.';
      } else if (lowerQuery.includes('resistencia')) {
        answer = 'Para resistencia muscular, trabaja con 15-20+ repeticiones por serie con pesos más ligeros (50-70% de tu 1RM) y descansos cortos de 30-60 segundos. Este rango mejora la capacidad del músculo para resistir la fatiga durante períodos prolongados.';
      } else {
        answer = 'El número óptimo de repeticiones depende de tu objetivo: 1-6 para fuerza máxima, 8-12 para hipertrofia (crecimiento muscular), y 15-20+ para resistencia muscular. También es beneficioso variar estos rangos periódicamente para evitar estancamientos.';
      }

      sources = [
        { title: 'Principios de Entrenamiento de Fuerza' },
        { title: 'Guía de Periodización del Entrenamiento' }
      ];
    } else if (lowerQuery.includes('descanso') || lowerQuery.includes('recuperación') || lowerQuery.includes('recuperacion')) {
      answer = 'El descanso adecuado es crucial para el progreso. Los músculos grandes (piernas, espalda, pecho) generalmente necesitan 48-72 horas para recuperarse completamente, mientras que los músculos pequeños (brazos, hombros) pueden recuperarse en 24-48 horas. Factores como la intensidad del entrenamiento, tu nivel de condición física, nutrición, calidad del sueño y edad también influyen en el tiempo de recuperación. Señales de recuperación insuficiente incluyen fatiga persistente, disminución del rendimiento, dolor muscular prolongado y alteraciones del sueño.';

      sources = [
        { title: 'Ciencia de la Recuperación Muscular' },
        { title: 'Estrategias de Recuperación para Atletas' }
      ];
    } else if (lowerQuery.includes('principiante') || lowerQuery.includes('empezar') || lowerQuery.includes('comenzar')) {
      answer = 'Para principiantes, recomiendo empezar con un programa de entrenamiento de cuerpo completo 3 veces por semana (por ejemplo, lunes, miércoles y viernes) con al menos un día de descanso entre sesiones. Enfócate en ejercicios compuestos como sentadillas, peso muerto, press de banca, remo, press de hombros y dominadas/jalones. Comienza con 2-3 series de 10-15 repeticiones por ejercicio, usando pesos con los que puedas mantener una técnica adecuada. Prioriza aprender la técnica correcta antes de aumentar el peso. A medida que progreses, puedes aumentar gradualmente el peso y reducir las repeticiones.';

      sources = [
        { title: 'Guía para Principiantes en el Entrenamiento de Fuerza' },
        { title: 'Programas de Entrenamiento para Principiantes' }
      ];
    } else {
      answer = 'Lo siento, no tengo información específica sobre esa pregunta. Te recomiendo consultar nuestra biblioteca de ejercicios o hablar con un entrenador personal para obtener orientación más específica.';
    }

    return {
      answer,
      sources,
      related_exercises: relatedExercises.length > 0 ? relatedExercises : undefined
    };
  } catch (error) {
    console.error('Error al procesar consulta:', error);
    throw error;
  }
}

// Esta función se ha movido arriba en el archivo

// Función para obtener planes guardados
export async function getSavedWorkoutPlans(userId: string) {
  try {
    const { data, error } = await supabase
      .from('ai_workout_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data as AIWorkoutPlan[] };
  } catch (error) {
    console.error('Error al obtener planes guardados:', error);
    throw error;
  }
}
