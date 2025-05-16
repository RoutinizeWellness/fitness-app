import { supabase } from './supabase-client';
import { QueryResponse } from './supabase-types';

// Tipos para análisis avanzados
export interface AnalyticsInsight {
  id: string;
  user_id: string;
  type: 'performance' | 'nutrition' | 'recovery' | 'progress' | 'recommendation';
  category: string;
  title: string;
  description: string;
  data: any;
  confidence: number; // 0-1
  created_at: string;
  expires_at?: string;
  is_read: boolean;
  is_dismissed: boolean;
  actions?: {
    type: string;
    label: string;
    url?: string;
    data?: any;
  }[];
}

export interface AnalyticsReport {
  id: string;
  user_id: string;
  type: string;
  title: string;
  summary: string;
  data: any;
  created_at: string;
  period_start: string;
  period_end: string;
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change?: number;
  change_period?: string;
  trend?: 'up' | 'down' | 'stable';
  goal?: number;
  category: string;
}

// Obtener insights para un usuario
export async function getUserInsights(
  userId: string,
  options?: {
    type?: string;
    limit?: number;
    includeRead?: boolean;
    includeDismissed?: boolean;
  }
): Promise<QueryResponse<AnalyticsInsight[]>> {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'analytics_insights')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla analytics_insights no existe. Creando datos simulados...');
      
      // Crear datos simulados para desarrollo
      const mockInsights: AnalyticsInsight[] = [
        {
          id: '1',
          user_id: userId,
          type: 'performance',
          category: 'strength',
          title: 'Mejora en fuerza de piernas',
          description: 'Has aumentado tu fuerza en sentadillas un 15% en las últimas 4 semanas. Sigue así para alcanzar tu objetivo.',
          data: {
            exercise: 'Sentadilla',
            previous: 80,
            current: 92,
            improvement: 15,
            period: '4 semanas'
          },
          confidence: 0.92,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          is_read: false,
          is_dismissed: false,
          actions: [
            {
              type: 'view',
              label: 'Ver progreso',
              url: '/progress/strength'
            },
            {
              type: 'workout',
              label: 'Entrenar piernas',
              data: {
                workout_id: 'leg-day-advanced'
              }
            }
          ]
        },
        {
          id: '2',
          user_id: userId,
          type: 'nutrition',
          category: 'protein',
          title: 'Déficit de proteínas',
          description: 'Tu consumo de proteínas está por debajo de tu objetivo. Considera aumentar tu ingesta para optimizar la recuperación muscular.',
          data: {
            current_avg: 85,
            target: 120,
            deficit: 35,
            period: '7 días'
          },
          confidence: 0.88,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          is_read: true,
          is_dismissed: false,
          actions: [
            {
              type: 'view',
              label: 'Ver nutrición',
              url: '/nutrition'
            },
            {
              type: 'recommendation',
              label: 'Recetas ricas en proteínas',
              url: '/nutrition/recipes/high-protein'
            }
          ]
        },
        {
          id: '3',
          user_id: userId,
          type: 'recovery',
          category: 'sleep',
          title: 'Calidad de sueño reducida',
          description: 'Tu calidad de sueño ha disminuido en la última semana. Esto podría afectar tu recuperación y rendimiento.',
          data: {
            avg_sleep_hours: 6.2,
            optimal_range: '7-9',
            deep_sleep_percentage: 15,
            optimal_deep_sleep: '20-25%',
            period: '7 días'
          },
          confidence: 0.85,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          is_read: false,
          is_dismissed: false,
          actions: [
            {
              type: 'view',
              label: 'Ver datos de sueño',
              url: '/recovery/sleep'
            },
            {
              type: 'recommendation',
              label: 'Consejos para mejorar el sueño',
              url: '/recovery/sleep/tips'
            }
          ]
        },
        {
          id: '4',
          user_id: userId,
          type: 'progress',
          category: 'body_composition',
          title: 'Reducción de grasa corporal',
          description: 'Has reducido tu porcentaje de grasa corporal en un 2.5% en los últimos 2 meses. Estás en buen camino para alcanzar tu objetivo.',
          data: {
            previous: 22.5,
            current: 20,
            change: -2.5,
            period: '2 meses',
            target: 18
          },
          confidence: 0.9,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          is_read: false,
          is_dismissed: false,
          actions: [
            {
              type: 'view',
              label: 'Ver composición corporal',
              url: '/progress/body'
            }
          ]
        },
        {
          id: '5',
          user_id: userId,
          type: 'recommendation',
          category: 'training',
          title: 'Recomendación de entrenamiento',
          description: 'Basado en tu progreso reciente, te recomendamos aumentar la intensidad de tus entrenamientos de pecho para superar tu meseta actual.',
          data: {
            current_plateau: {
              exercise: 'Press de banca',
              weight: 85,
              reps: 8,
              weeks_at_plateau: 3
            },
            recommendation: {
              intensity_increase: '10-15%',
              volume_adjustment: 'Reducir repeticiones a 5-6',
              frequency: '2 veces por semana'
            }
          },
          confidence: 0.82,
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          is_read: true,
          is_dismissed: false,
          actions: [
            {
              type: 'workout',
              label: 'Ver rutina recomendada',
              data: {
                workout_id: 'chest-plateau-breaker'
              }
            }
          ]
        }
      ];
      
      // Filtrar según las opciones
      let filteredInsights = [...mockInsights];
      
      if (options?.type) {
        filteredInsights = filteredInsights.filter(insight => insight.type === options.type);
      }
      
      if (options?.includeRead === false) {
        filteredInsights = filteredInsights.filter(insight => !insight.is_read);
      }
      
      if (options?.includeDismissed === false) {
        filteredInsights = filteredInsights.filter(insight => !insight.is_dismissed);
      }
      
      // Limitar resultados
      if (options?.limit) {
        filteredInsights = filteredInsights.slice(0, options.limit);
      }
      
      return { data: filteredInsights, error: null };
    }

    // Si la tabla existe, obtener los insights reales
    let query = supabase
      .from('analytics_insights')
      .select('*')
      .eq('user_id', userId);
    
    // Aplicar filtros según las opciones
    if (options?.type) {
      query = query.eq('type', options.type);
    }
    
    if (options?.includeRead === false) {
      query = query.eq('is_read', false);
    }
    
    if (options?.includeDismissed === false) {
      query = query.eq('is_dismissed', false);
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    query = query.order('created_at', { ascending: false });
    
    // Limitar resultados
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener insights:', error);
    return { data: null, error };
  }
}

// Marcar un insight como leído
export async function markInsightAsRead(
  userId: string,
  insightId: string
): Promise<QueryResponse<any>> {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'analytics_insights')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla analytics_insights no existe. Simulando actualización...');
      
      // Simular actualización exitosa
      return { data: { success: true }, error: null };
    }

    // Si la tabla existe, actualizar el insight
    const { data, error } = await supabase
      .from('analytics_insights')
      .update({ is_read: true })
      .eq('id', insightId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error al marcar insight como leído:', error);
    return { data: null, error };
  }
}

// Descartar un insight
export async function dismissInsight(
  userId: string,
  insightId: string
): Promise<QueryResponse<any>> {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'analytics_insights')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla analytics_insights no existe. Simulando actualización...');
      
      // Simular actualización exitosa
      return { data: { success: true }, error: null };
    }

    // Si la tabla existe, actualizar el insight
    const { data, error } = await supabase
      .from('analytics_insights')
      .update({ is_dismissed: true })
      .eq('id', insightId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error al descartar insight:', error);
    return { data: null, error };
  }
}

// Obtener métricas clave para un usuario
export async function getUserMetrics(
  userId: string,
  category?: string
): Promise<QueryResponse<AnalyticsMetric[]>> {
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'analytics_metrics')
      .single();

    if (tableCheckError || !tableExists) {
      console.log('La tabla analytics_metrics no existe. Creando datos simulados...');
      
      // Crear datos simulados para desarrollo
      const mockMetrics: AnalyticsMetric[] = [
        {
          id: '1',
          name: 'Volumen de entrenamiento',
          value: 12500,
          unit: 'kg',
          change: 8.5,
          change_period: 'semana',
          trend: 'up',
          goal: 15000,
          category: 'performance'
        },
        {
          id: '2',
          name: 'Frecuencia de entrenamiento',
          value: 4.2,
          unit: 'días/semana',
          change: 0.2,
          change_period: 'mes',
          trend: 'stable',
          goal: 5,
          category: 'consistency'
        },
        {
          id: '3',
          name: 'Calorías promedio',
          value: 2350,
          unit: 'kcal/día',
          change: -150,
          change_period: 'semana',
          trend: 'down',
          goal: 2200,
          category: 'nutrition'
        },
        {
          id: '4',
          name: 'Proteína promedio',
          value: 135,
          unit: 'g/día',
          change: 15,
          change_period: 'semana',
          trend: 'up',
          goal: 150,
          category: 'nutrition'
        },
        {
          id: '5',
          name: 'Peso corporal',
          value: 78.5,
          unit: 'kg',
          change: -1.2,
          change_period: 'mes',
          trend: 'down',
          goal: 75,
          category: 'body'
        },
        {
          id: '6',
          name: 'Porcentaje de grasa',
          value: 18.5,
          unit: '%',
          change: -0.8,
          change_period: 'mes',
          trend: 'down',
          goal: 15,
          category: 'body'
        },
        {
          id: '7',
          name: 'Calidad del sueño',
          value: 7.2,
          unit: 'horas',
          change: 0.5,
          change_period: 'semana',
          trend: 'up',
          goal: 8,
          category: 'recovery'
        },
        {
          id: '8',
          name: 'Nivel de estrés',
          value: 6.5,
          unit: '/10',
          change: -0.8,
          change_period: 'semana',
          trend: 'down',
          goal: 5,
          category: 'recovery'
        }
      ];
      
      // Filtrar por categoría si se especifica
      if (category) {
        const filteredMetrics = mockMetrics.filter(metric => metric.category === category);
        return { data: filteredMetrics, error: null };
      }
      
      return { data: mockMetrics, error: null };
    }

    // Si la tabla existe, obtener las métricas reales
    let query = supabase
      .from('analytics_metrics')
      .select('*')
      .eq('user_id', userId);
    
    // Filtrar por categoría si se especifica
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    return { data: null, error };
  }
}

// Generar un informe de análisis para un usuario
export async function generateAnalyticsReport(
  userId: string,
  type: string,
  period: {
    start: string;
    end: string;
  }
): Promise<QueryResponse<AnalyticsReport>> {
  try {
    console.log(`Generando informe de tipo ${type} para el usuario ${userId}`);
    
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Crear informe simulado
    const mockReport: AnalyticsReport = {
      id: `report-${Date.now()}`,
      user_id: userId,
      type,
      title: `Informe de ${type} - ${new Date(period.start).toLocaleDateString()} a ${new Date(period.end).toLocaleDateString()}`,
      summary: 'Este informe muestra un análisis detallado de tu rendimiento y progreso durante el período seleccionado.',
      data: {
        metrics: {
          workouts_completed: 12,
          total_volume: 15200,
          avg_intensity: 7.8,
          max_weights: {
            squat: 120,
            bench_press: 90,
            deadlift: 150
          },
          nutrition: {
            avg_calories: 2280,
            avg_protein: 142,
            avg_carbs: 220,
            avg_fat: 75
          },
          body: {
            weight_change: -0.8,
            body_fat_change: -0.5,
            muscle_mass_change: 0.6
          },
          recovery: {
            avg_sleep: 7.4,
            avg_soreness: 5.2,
            avg_energy: 7.1
          }
        },
        insights: [
          {
            title: 'Progreso en fuerza',
            description: 'Has aumentado tu fuerza en los ejercicios principales un 5% en promedio.',
            recommendation: 'Considera aumentar la intensidad en tus próximos entrenamientos para seguir progresando.'
          },
          {
            title: 'Nutrición',
            description: 'Tu consumo de proteínas ha sido consistente, pero tu ingesta de carbohidratos ha fluctuado significativamente.',
            recommendation: 'Intenta mantener una ingesta más estable de carbohidratos para optimizar tu energía durante los entrenamientos.'
          },
          {
            title: 'Recuperación',
            description: 'Tu calidad de sueño ha mejorado, lo que ha contribuido a una mejor recuperación general.',
            recommendation: 'Mantén tus buenos hábitos de sueño para seguir mejorando tu recuperación.'
          }
        ],
        recommendations: [
          {
            category: 'training',
            title: 'Ajuste de volumen',
            description: 'Aumenta gradualmente el volumen de entrenamiento en un 10% durante las próximas 4 semanas.'
          },
          {
            category: 'nutrition',
            title: 'Distribución de macronutrientes',
            description: 'Ajusta tu distribución de macronutrientes a 30% proteínas, 45% carbohidratos y 25% grasas.'
          },
          {
            category: 'recovery',
            title: 'Estrategias de recuperación',
            description: 'Incorpora 10-15 minutos de estiramientos después de cada entrenamiento para mejorar la recuperación muscular.'
          }
        ]
      },
      created_at: new Date().toISOString(),
      period_start: period.start,
      period_end: period.end
    };
    
    return { data: mockReport, error: null };
  } catch (error) {
    console.error('Error al generar informe:', error);
    return { data: null, error };
  }
}

// Obtener predicciones para un usuario
export async function getUserPredictions(
  userId: string,
  target: string,
  timeframe: string
): Promise<QueryResponse<any>> {
  try {
    console.log(`Generando predicciones de ${target} para ${timeframe} para el usuario ${userId}`);
    
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Crear predicciones simuladas según el objetivo y el plazo
    let predictionData;
    
    switch (target) {
      case 'strength':
        predictionData = {
          current: {
            squat: 100,
            bench_press: 80,
            deadlift: 130
          },
          predicted: {
            squat: timeframe === 'short' ? 110 : (timeframe === 'medium' ? 125 : 145),
            bench_press: timeframe === 'short' ? 85 : (timeframe === 'medium' ? 95 : 110),
            deadlift: timeframe === 'short' ? 140 : (timeframe === 'medium' ? 155 : 180)
          },
          timeframe: timeframe === 'short' ? '4 semanas' : (timeframe === 'medium' ? '3 meses' : '6 meses'),
          confidence: timeframe === 'short' ? 0.85 : (timeframe === 'medium' ? 0.75 : 0.65)
        };
        break;
      
      case 'weight':
        predictionData = {
          current: 78.5,
          goal: 75,
          predicted: timeframe === 'short' ? 77.8 : (timeframe === 'medium' ? 76.2 : 74.5),
          timeframe: timeframe === 'short' ? '4 semanas' : (timeframe === 'medium' ? '3 meses' : '6 meses'),
          confidence: timeframe === 'short' ? 0.9 : (timeframe === 'medium' ? 0.8 : 0.7),
          weekly_rate: timeframe === 'short' ? -0.4 : (timeframe === 'medium' ? -0.3 : -0.25)
        };
        break;
      
      case 'body_fat':
        predictionData = {
          current: 18.5,
          goal: 15,
          predicted: timeframe === 'short' ? 17.8 : (timeframe === 'medium' ? 16.5 : 14.8),
          timeframe: timeframe === 'short' ? '4 semanas' : (timeframe === 'medium' ? '3 meses' : '6 meses'),
          confidence: timeframe === 'short' ? 0.85 : (timeframe === 'medium' ? 0.75 : 0.65),
          weekly_rate: timeframe === 'short' ? -0.2 : (timeframe === 'medium' ? -0.15 : -0.12)
        };
        break;
      
      case 'performance':
        predictionData = {
          current: {
            endurance: 65,
            strength: 70,
            power: 68
          },
          predicted: {
            endurance: timeframe === 'short' ? 68 : (timeframe === 'medium' ? 75 : 82),
            strength: timeframe === 'short' ? 73 : (timeframe === 'medium' ? 78 : 85),
            power: timeframe === 'short' ? 70 : (timeframe === 'medium' ? 75 : 82)
          },
          timeframe: timeframe === 'short' ? '4 semanas' : (timeframe === 'medium' ? '3 meses' : '6 meses'),
          confidence: timeframe === 'short' ? 0.8 : (timeframe === 'medium' ? 0.7 : 0.6)
        };
        break;
      
      default:
        return {
          data: null,
          error: new Error(`Objetivo de predicción no soportado: ${target}`)
        };
    }
    
    return {
      data: {
        target,
        timeframe,
        predictions: predictionData,
        factors: [
          {
            name: 'Consistencia de entrenamiento',
            impact: 'alta',
            current_value: '85%',
            recommendation: 'Mantén una consistencia de al menos 80% para alcanzar tus objetivos'
          },
          {
            name: 'Nutrición',
            impact: 'media',
            current_value: 'Adecuada',
            recommendation: 'Asegúrate de mantener una ingesta adecuada de proteínas y calorías'
          },
          {
            name: 'Recuperación',
            impact: 'media',
            current_value: 'Buena',
            recommendation: 'Prioriza el sueño y la recuperación activa para optimizar resultados'
          }
        ],
        created_at: new Date().toISOString()
      },
      error: null
    };
  } catch (error) {
    console.error('Error al generar predicciones:', error);
    return { data: null, error };
  }
}

// Analizar un entrenamiento específico
export async function analyzeWorkout(
  userId: string,
  workoutId: string
): Promise<QueryResponse<any>> {
  try {
    console.log(`Analizando entrenamiento ${workoutId} para el usuario ${userId}`);
    
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Crear análisis simulado
    const mockAnalysis = {
      workout_id: workoutId,
      user_id: userId,
      date: new Date().toISOString(),
      duration: 65, // minutos
      total_volume: 8500, // kg
      intensity: 7.8, // 1-10
      exercises: [
        {
          name: 'Sentadilla',
          sets: 4,
          total_reps: 32,
          max_weight: 100,
          volume: 2800,
          performance: 8.5,
          improvement: 5,
          notes: 'Buen rendimiento, técnica mejorada'
        },
        {
          name: 'Press de banca',
          sets: 4,
          total_reps: 28,
          max_weight: 80,
          volume: 2000,
          performance: 7.5,
          improvement: 2.5,
          notes: 'Rendimiento estable, considerar aumentar peso'
        },
        {
          name: 'Peso muerto',
          sets: 3,
          total_reps: 15,
          max_weight: 130,
          volume: 1800,
          performance: 8.0,
          improvement: 0,
          notes: 'Meseta en progresión, considerar variaciones'
        }
      ],
      muscle_groups: [
        { name: 'Piernas', activation: 85 },
        { name: 'Pecho', activation: 75 },
        { name: 'Espalda', activation: 80 },
        { name: 'Hombros', activation: 60 },
        { name: 'Brazos', activation: 50 },
        { name: 'Core', activation: 65 }
      ],
      energy_systems: [
        { name: 'Anaeróbico aláctico', activation: 70 },
        { name: 'Anaeróbico láctico', activation: 60 },
        { name: 'Aeróbico', activation: 30 }
      ],
      recovery_impact: 7.5, // 1-10
      estimated_recovery_time: 48, // horas
      insights: [
        {
          title: 'Volumen adecuado',
          description: 'El volumen total del entrenamiento está dentro del rango óptimo para tu nivel.'
        },
        {
          title: 'Distribución muscular',
          description: 'Buena activación de los principales grupos musculares, con énfasis en piernas y espalda.'
        },
        {
          title: 'Progresión',
          description: 'Progreso notable en sentadillas, pero meseta en peso muerto. Considera variaciones para superar la meseta.'
        }
      ],
      recommendations: [
        {
          title: 'Ajuste de intensidad',
          description: 'Aumenta la intensidad en press de banca en tu próximo entrenamiento.'
        },
        {
          title: 'Variación de ejercicios',
          description: 'Incorpora peso muerto rumano o sumo para superar la meseta en peso muerto.'
        },
        {
          title: 'Recuperación',
          description: 'Prioriza la recuperación de piernas y espalda en las próximas 48 horas.'
        }
      ]
    };
    
    return { data: mockAnalysis, error: null };
  } catch (error) {
    console.error('Error al analizar entrenamiento:', error);
    return { data: null, error };
  }
}
