import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';
import { QueryResponse } from './supabase-queries';
import { getMoods } from './supabase-queries';
import { getWearableData } from './body-measurements';
import { getWorkoutRoutines, WorkoutRoutine } from './workout-routines';
import { Plan } from './supabase';
import { getPlans, updatePlan, addPlan } from './supabase-queries';

// Tipos para recomendaciones adaptativas
export type AdaptiveRecommendation = {
  type: 'workout' | 'recovery' | 'nutrition' | 'sleep' | 'mindfulness';
  title: string;
  description: string;
  intensity?: 'low' | 'moderate' | 'high';
  duration?: number;
  reason: string;
  routine_id?: string;
};

// Función para analizar el estado de ánimo y sueño recientes
export const analyzeWellbeingData = async (
  userId: string
): Promise<QueryResponse<{
  sleepQuality: 'poor' | 'fair' | 'good';
  moodLevel: 'low' | 'moderate' | 'high';
  stressLevel: 'low' | 'moderate' | 'high';
  overallWellbeing: 'poor' | 'fair' | 'good';
  recommendations: string[];
}>> => {
  try {
    // Obtener datos de estado de ánimo de los últimos 7 días
    const { data: moods, error: moodError } = await getMoods(userId, {
      limit: 7,
      orderBy: { column: 'date', ascending: false }
    });

    if (moodError) {
      return { data: null, error: moodError };
    }

    // Obtener datos de wearables de los últimos 7 días
    const { data: wearableData, error: wearableError } = await getWearableData(userId, {
      limit: 7
    });

    if (wearableError && !moods) {
      return { data: null, error: wearableError };
    }

    // Calcular promedios
    let avgMoodLevel = 0;
    let avgStressLevel = 0;
    let avgSleepHours = 0;
    let moodCount = 0;

    if (moods && moods.length > 0) {
      const moodSum = moods.reduce((sum, mood) => sum + mood.mood_level, 0);
      const stressSum = moods.reduce((sum, mood) => sum + mood.stress_level, 0);
      const sleepSum = moods.reduce((sum, mood) => sum + mood.sleep_hours, 0);
      
      avgMoodLevel = moodSum / moods.length;
      avgStressLevel = stressSum / moods.length;
      avgSleepHours = sleepSum / moods.length;
      moodCount = moods.length;
    }

    // Analizar datos de sueño de wearables si están disponibles
    let wearableSleepScore = 0;
    let wearableSleepCount = 0;

    if (wearableData && wearableData.length > 0) {
      wearableData.forEach(data => {
        if (data.sleep && data.sleep.score) {
          wearableSleepScore += data.sleep.score;
          wearableSleepCount++;
        }
      });
    }

    // Determinar calidad del sueño
    let sleepQuality: 'poor' | 'fair' | 'good' = 'fair';
    if (moodCount > 0) {
      if (avgSleepHours < 6) {
        sleepQuality = 'poor';
      } else if (avgSleepHours >= 7) {
        sleepQuality = 'good';
      }
    }

    // Ajustar con datos de wearables si están disponibles
    if (wearableSleepCount > 0) {
      const avgSleepScore = wearableSleepScore / wearableSleepCount;
      if (avgSleepScore < 60) {
        sleepQuality = 'poor';
      } else if (avgSleepScore >= 80) {
        sleepQuality = 'good';
      } else {
        sleepQuality = 'fair';
      }
    }

    // Determinar nivel de ánimo
    let moodLevel: 'low' | 'moderate' | 'high' = 'moderate';
    if (moodCount > 0) {
      if (avgMoodLevel < 2.5) {
        moodLevel = 'low';
      } else if (avgMoodLevel >= 3.5) {
        moodLevel = 'high';
      }
    }

    // Determinar nivel de estrés
    let stressLevel: 'low' | 'moderate' | 'high' = 'moderate';
    if (moodCount > 0) {
      if (avgStressLevel < 2.5) {
        stressLevel = 'low';
      } else if (avgStressLevel >= 3.5) {
        stressLevel = 'high';
      }
    }

    // Determinar bienestar general
    let overallWellbeing: 'poor' | 'fair' | 'good' = 'fair';
    
    // Puntuación simple: 0-2 = poor, 3-4 = fair, 5-6 = good
    let wellbeingScore = 0;
    
    if (sleepQuality === 'good') wellbeingScore += 2;
    else if (sleepQuality === 'fair') wellbeingScore += 1;
    
    if (moodLevel === 'high') wellbeingScore += 2;
    else if (moodLevel === 'moderate') wellbeingScore += 1;
    
    if (stressLevel === 'low') wellbeingScore += 2;
    else if (stressLevel === 'moderate') wellbeingScore += 1;
    
    if (wellbeingScore <= 2) overallWellbeing = 'poor';
    else if (wellbeingScore >= 5) overallWellbeing = 'good';
    
    // Generar recomendaciones
    const recommendations: string[] = [];
    
    if (sleepQuality === 'poor') {
      recommendations.push('Prioriza mejorar tu sueño. Intenta acostarte más temprano y mantén una rutina constante.');
    }
    
    if (moodLevel === 'low') {
      recommendations.push('Considera actividades que mejoren tu estado de ánimo, como ejercicio ligero o pasar tiempo al aire libre.');
    }
    
    if (stressLevel === 'high') {
      recommendations.push('Tu nivel de estrés es elevado. Incorpora técnicas de relajación como meditación o respiración profunda.');
    }
    
    if (overallWellbeing === 'poor') {
      recommendations.push('Tu bienestar general indica que necesitas descanso. Considera reducir la intensidad de tus entrenamientos temporalmente.');
    } else if (overallWellbeing === 'good') {
      recommendations.push('Tu bienestar general es bueno. Es un buen momento para desafiarte con entrenamientos más intensos.');
    }

    return {
      data: {
        sleepQuality,
        moodLevel,
        stressLevel,
        overallWellbeing,
        recommendations
      },
      error: null
    };
  } catch (e) {
    console.error(`Error en analyzeWellbeingData para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en analyzeWellbeingData')
    };
  }
};

// Función para generar recomendaciones adaptativas basadas en datos de bienestar
export const generateAdaptiveRecommendations = async (
  userId: string
): Promise<QueryResponse<AdaptiveRecommendation[]>> => {
  try {
    // Analizar datos de bienestar
    const { data: wellbeingData, error: wellbeingError } = await analyzeWellbeingData(userId);

    if (wellbeingError) {
      return { data: null, error: wellbeingError };
    }

    if (!wellbeingData) {
      return { 
        data: null, 
        error: new Error('No se pudieron analizar los datos de bienestar') 
      };
    }

    // Obtener rutinas de entrenamiento disponibles
    const { data: routines, error: routinesError } = await getWorkoutRoutines(userId, {
      includeTemplates: true
    });

    if (routinesError) {
      console.error('Error al obtener rutinas:', routinesError);
    }

    const recommendations: AdaptiveRecommendation[] = [];

    // Recomendar basado en bienestar general
    if (wellbeingData.overallWellbeing === 'poor') {
      // Recomendar recuperación
      recommendations.push({
        type: 'recovery',
        title: 'Día de recuperación activa',
        description: 'Tu cuerpo necesita recuperarse. Realiza actividades ligeras como caminar o estiramientos suaves.',
        intensity: 'low',
        duration: 30,
        reason: 'Tus niveles de bienestar indican que necesitas descanso.'
      });
      
      // Recomendar mindfulness
      recommendations.push({
        type: 'mindfulness',
        title: 'Sesión de meditación',
        description: 'Dedica 10-15 minutos a una sesión de meditación guiada para reducir el estrés.',
        duration: 15,
        reason: 'La meditación puede ayudar a mejorar tu estado de ánimo y reducir el estrés.'
      });
      
      // Recomendar mejora del sueño
      recommendations.push({
        type: 'sleep',
        title: 'Optimiza tu sueño',
        description: 'Intenta acostarte 30 minutos antes y evita pantallas antes de dormir.',
        reason: 'Mejorar tu sueño es clave para tu recuperación y rendimiento.'
      });
    } else if (wellbeingData.overallWellbeing === 'fair') {
      // Recomendar entrenamiento moderado
      let moderateRoutine: WorkoutRoutine | undefined;
      
      if (routines) {
        // Buscar una rutina de intensidad moderada
        moderateRoutine = routines.find(r => r.level === 'intermediate');
      }
      
      recommendations.push({
        type: 'workout',
        title: 'Entrenamiento de intensidad moderada',
        description: moderateRoutine 
          ? `Rutina recomendada: ${moderateRoutine.name}` 
          : 'Realiza un entrenamiento de intensidad moderada, alternando ejercicios de fuerza y cardio.',
        intensity: 'moderate',
        duration: 45,
        reason: 'Tu nivel de bienestar permite un entrenamiento moderado.',
        routine_id: moderateRoutine?.id
      });
      
      // Si el nivel de estrés es alto, recomendar mindfulness
      if (wellbeingData.stressLevel === 'high') {
        recommendations.push({
          type: 'mindfulness',
          title: 'Técnicas de respiración',
          description: 'Dedica 5-10 minutos a ejercicios de respiración profunda.',
          duration: 10,
          reason: 'Ayudará a reducir tu nivel de estrés.'
        });
      }
    } else {
      // Bienestar bueno - recomendar entrenamiento intenso
      let intenseRoutine: WorkoutRoutine | undefined;
      
      if (routines) {
        // Buscar una rutina de alta intensidad
        intenseRoutine = routines.find(r => r.level === 'advanced');
      }
      
      recommendations.push({
        type: 'workout',
        title: 'Entrenamiento de alta intensidad',
        description: intenseRoutine 
          ? `Rutina recomendada: ${intenseRoutine.name}` 
          : 'Es un buen momento para un entrenamiento desafiante. Considera HIIT o entrenamiento de fuerza con peso elevado.',
        intensity: 'high',
        duration: 60,
        reason: 'Tu excelente nivel de bienestar te permite aprovechar un entrenamiento intenso.',
        routine_id: intenseRoutine?.id
      });
      
      // Recomendar nutrición para apoyar el entrenamiento intenso
      recommendations.push({
        type: 'nutrition',
        title: 'Nutrición para rendimiento',
        description: 'Asegúrate de consumir suficientes proteínas y carbohidratos para apoyar tu entrenamiento intenso.',
        reason: 'Una nutrición adecuada maximizará los beneficios de tu entrenamiento.'
      });
    }

    // Añadir recomendaciones específicas basadas en sueño
    if (wellbeingData.sleepQuality === 'poor') {
      recommendations.push({
        type: 'sleep',
        title: 'Prioriza tu descanso',
        description: 'Establece una rutina de sueño consistente y crea un ambiente propicio para dormir.',
        reason: 'Tu calidad de sueño ha sido baja recientemente.'
      });
    }

    return { data: recommendations, error: null };
  } catch (e) {
    console.error(`Error en generateAdaptiveRecommendations para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en generateAdaptiveRecommendations')
    };
  }
};

// Función para adaptar el plan semanal basado en recomendaciones
export const adaptWeeklyPlan = async (
  userId: string,
  dayToAdapt?: string // Si no se proporciona, se adapta el día actual
): Promise<QueryResponse<Plan>> => {
  try {
    // Determinar el día a adaptar
    const today = new Date();
    const dayOfWeek = dayToAdapt || [
      'domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'
    ][today.getDay()];

    // Generar recomendaciones adaptativas
    const { data: recommendations, error: recError } = await generateAdaptiveRecommendations(userId);

    if (recError) {
      return { data: null, error: recError };
    }

    if (!recommendations || recommendations.length === 0) {
      return { 
        data: null, 
        error: new Error('No se pudieron generar recomendaciones') 
      };
    }

    // Obtener el plan actual para el día
    const { data: plans, error: planError } = await getPlans(userId, {
      filters: { day: dayOfWeek }
    });

    if (planError) {
      return { data: null, error: planError };
    }

    // Convertir recomendaciones a actividades del plan
    const adaptedActivities = recommendations.map(rec => {
      let tipo = 'fuerza';
      let icono = 'dumbbell';

      switch (rec.type) {
        case 'recovery':
          tipo = 'descanso';
          icono = 'heart';
          break;
        case 'mindfulness':
          tipo = 'mindfulness';
          icono = 'brain';
          break;
        case 'nutrition':
          tipo = 'nutricion';
          icono = 'utensils';
          break;
        case 'sleep':
          tipo = 'descanso';
          icono = 'moon';
          break;
        case 'workout':
          tipo = rec.intensity === 'high' ? 'fuerza' : (rec.intensity === 'low' ? 'flexibilidad' : 'cardio');
          icono = rec.intensity === 'high' ? 'dumbbell' : (rec.intensity === 'low' ? 'yoga' : 'flame');
          break;
      }

      return {
        tipo,
        descripcion: rec.title,
        icono,
        detalles: rec.description,
        razon: rec.reason,
        rutina_id: rec.routine_id
      };
    });

    let result: QueryResponse<Plan>;

    if (plans && plans.length > 0) {
      // Actualizar plan existente
      const { data, error } = await updatePlan(plans[0].id, {
        activities: adaptedActivities
      });

      result = { data, error };
    } else {
      // Crear nuevo plan
      const { data, error } = await addPlan({
        user_id: userId,
        day: dayOfWeek,
        activities: adaptedActivities
      });

      result = { data, error };
    }

    return result;
  } catch (e) {
    console.error(`Error en adaptWeeklyPlan para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en adaptWeeklyPlan')
    };
  }
};
