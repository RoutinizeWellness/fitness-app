/**
 * AI Core Service for Dynamic Hyperpersonalization
 *
 * This service integrates all AI functionality in the app, providing a unified
 * interface for personalized recommendations, adaptive learning, and predictive analytics.
 */

import { supabase } from './supabase-unified';
import { v4 as uuidv4 } from 'uuid';
import {
  getUserPatterns,
  analyzeWorkoutPatterns,
  generateSmartRecommendations
} from './learning-algorithm';
import {
  getWearableData,
  isReadyToTrain
} from './wearable-integration';
import {
  calculateIdealWeight,
  analyzeMuscleGroupFatigue,
  getUserFatigue
} from './adaptive-learning-service';

// Types for the AI Core Service
export interface AIPersonalizationProfile {
  userId: string;
  learningRate: number; // How quickly the system adapts to user feedback (0-1)
  adaptationLevel: number; // How much personalization to apply (0-1)
  preferredModalities: string[]; // Which types of recommendations the user prefers
  interactionHistory: {
    recommendationsViewed: number;
    recommendationsAccepted: number;
    feedbackProvided: number;
    lastInteraction: string; // ISO date
  };
  dataQuality: {
    wearableDataAvailability: number; // 0-1
    nutritionDataAvailability: number; // 0-1
    workoutDataAvailability: number; // 0-1
    sleepDataAvailability: number; // 0-1
    mentalWellnessDataAvailability: number; // 0-1
  };
  lastUpdated: string; // ISO date
}

export interface AIRecommendationContext {
  userId: string;
  timestamp: string;
  currentFatigue: number;
  readyToTrain: boolean;
  recentWorkouts: boolean;
  recentSleep: any;
  recentNutrition: any;
  recentStress: number;
  userGoals: string[];
  userPreferences: any;
  wearableData: any;
}

export interface AIHyperpersonalizationOptions {
  includeWearableData?: boolean;
  includeSleepData?: boolean;
  includeNutritionData?: boolean;
  includeMentalWellnessData?: boolean;
  adaptationSpeed?: 'slow' | 'medium' | 'fast';
  personalizationLevel?: 'low' | 'medium' | 'high';
  feedbackSensitivity?: number; // 0-1
}

/**
 * Main AI Core Service class that handles all AI functionality
 */
export class AICoreService {
  private userId: string;
  private personalizationProfile: AIPersonalizationProfile | null = null;
  private options: AIHyperpersonalizationOptions;

  constructor(userId: string, options: AIHyperpersonalizationOptions = {}) {
    this.userId = userId;
    this.options = {
      includeWearableData: true,
      includeSleepData: true,
      includeNutritionData: true,
      includeMentalWellnessData: true,
      adaptationSpeed: 'medium',
      personalizationLevel: 'medium',
      feedbackSensitivity: 0.5,
      ...options
    };
  }

  /**
   * Initialize the AI Core Service by loading the user's personalization profile
   */
  public async initialize(): Promise<boolean> {
    try {
      console.log('Inicializando AI Core Service para el usuario:', this.userId);

      // Intentar cargar el perfil de personalización del usuario
      try {
        const { data, error } = await supabase
          .from('ai_personalization_profiles')
          .select('*')
          .eq('user_id', this.userId)
          .single();

        if (error) {
          // Manejar error de tabla no encontrada
          if (error.code === '42P01') { // 42P01 es "undefined_table"
            console.log('Tabla de perfiles de personalización no encontrada, creando un nuevo perfil');
            await this.createPersonalizationProfile();
            return true;
          } else if (error.code === 'PGRST116') { // PGRST116 es "no rows returned"
            console.log('No se encontró perfil para el usuario, creando uno nuevo');
            await this.createPersonalizationProfile();
            return true;
          } else {
            console.error('Error al cargar perfil de personalización:', error);
            // Crear un perfil en memoria para no bloquear la funcionalidad
            this.createInMemoryProfile();
            return true;
          }
        }

        if (data) {
          console.log('Perfil de personalización cargado exitosamente:', data);

          // Transformar datos al formato esperado
          this.personalizationProfile = {
            userId: data.user_id,
            learningRate: data.learning_rate,
            adaptationLevel: data.adaptation_level,
            preferredModalities: data.preferred_modalities,
            interactionHistory: data.interaction_history,
            dataQuality: data.data_quality,
            lastUpdated: data.last_updated
          };
        } else {
          // Crear un nuevo perfil si no existe
          console.log('No se encontraron datos del perfil, creando uno nuevo');
          await this.createPersonalizationProfile();
        }
      } catch (loadError) {
        console.error('Error al cargar el perfil de personalización:', loadError);
        // Crear un perfil en memoria para no bloquear la funcionalidad
        this.createInMemoryProfile();
      }

      return true;
    } catch (error) {
      console.error('Error al inicializar AI Core Service:', error);
      // Crear un perfil en memoria para no bloquear la funcionalidad
      this.createInMemoryProfile();
      return true; // Devolver true para no bloquear la funcionalidad
    }
  }

  /**
   * Create an in-memory profile when database operations fail
   */
  private createInMemoryProfile(): void {
    console.log('Creando perfil en memoria para el usuario:', this.userId);

    this.personalizationProfile = {
      userId: this.userId,
      learningRate: 0.5,
      adaptationLevel: 0.5,
      preferredModalities: ['workout', 'nutrition', 'sleep', 'wellness'],
      interactionHistory: {
        recommendationsViewed: 0,
        recommendationsAccepted: 0,
        feedbackProvided: 0,
        lastInteraction: new Date().toISOString()
      },
      dataQuality: {
        wearableDataAvailability: 0,
        nutritionDataAvailability: 0,
        workoutDataAvailability: 0,
        sleepDataAvailability: 0,
        mentalWellnessDataAvailability: 0
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Create a new personalization profile for the user
   */
  private async createPersonalizationProfile(): Promise<void> {
    try {
      console.log('Creando perfil de personalización para el usuario:', this.userId);

      // Verificar si la tabla existe
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('ai_personalization_profiles')
        .select('count(*)')
        .limit(1)
        .maybeSingle();

      if (tableCheckError && tableCheckError.code === '42P01') {
        console.log('La tabla ai_personalization_profiles no existe, creando tabla...');

        // Crear tabla si no existe (esto normalmente se haría con migraciones)
        try {
          await supabase.rpc('create_ai_profiles_table');
          console.log('Tabla creada exitosamente');
        } catch (createTableError) {
          console.error('Error al crear la tabla:', createTableError);
          // Continuar de todos modos, tal vez la tabla ya existe
        }
      }

      // Preparar datos para insertar
      const profileData = {
        user_id: this.userId,
        learning_rate: 0.5,
        adaptation_level: 0.5,
        preferred_modalities: ['workout', 'nutrition', 'sleep', 'wellness'],
        interaction_history: {
          recommendationsViewed: 0,
          recommendationsAccepted: 0,
          feedbackProvided: 0,
          lastInteraction: new Date().toISOString()
        },
        data_quality: {
          wearableDataAvailability: 0,
          nutritionDataAvailability: 0,
          workoutDataAvailability: 0,
          sleepDataAvailability: 0,
          mentalWellnessDataAvailability: 0
        },
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      console.log('Intentando insertar perfil con datos:', profileData);

      // Insertar perfil
      const { data, error } = await supabase
        .from('ai_personalization_profiles')
        .upsert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error al crear perfil de personalización:', error);

        // Crear un perfil simulado en memoria para no bloquear la funcionalidad
        this.personalizationProfile = {
          userId: this.userId,
          learningRate: 0.5,
          adaptationLevel: 0.5,
          preferredModalities: ['workout', 'nutrition', 'sleep', 'wellness'],
          interactionHistory: {
            recommendationsViewed: 0,
            recommendationsAccepted: 0,
            feedbackProvided: 0,
            lastInteraction: new Date().toISOString()
          },
          dataQuality: {
            wearableDataAvailability: 0,
            nutritionDataAvailability: 0,
            workoutDataAvailability: 0,
            sleepDataAvailability: 0,
            mentalWellnessDataAvailability: 0
          },
          lastUpdated: new Date().toISOString()
        };

        return;
      }

      console.log('Perfil creado exitosamente:', data);

      // Transformar datos al formato esperado
      this.personalizationProfile = {
        userId: data.user_id,
        learningRate: data.learning_rate,
        adaptationLevel: data.adaptation_level,
        preferredModalities: data.preferred_modalities,
        interactionHistory: data.interaction_history,
        dataQuality: data.data_quality,
        lastUpdated: data.last_updated
      };
    } catch (error) {
      console.error('Error al crear perfil de personalización:', error);

      // Crear un perfil simulado en memoria para no bloquear la funcionalidad
      this.personalizationProfile = {
        userId: this.userId,
        learningRate: 0.5,
        adaptationLevel: 0.5,
        preferredModalities: ['workout', 'nutrition', 'sleep', 'wellness'],
        interactionHistory: {
          recommendationsViewed: 0,
          recommendationsAccepted: 0,
          feedbackProvided: 0,
          lastInteraction: new Date().toISOString()
        },
        dataQuality: {
          wearableDataAvailability: 0,
          nutritionDataAvailability: 0,
          workoutDataAvailability: 0,
          sleepDataAvailability: 0,
          mentalWellnessDataAvailability: 0
        },
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Generate hyperpersonalized recommendations based on all available data
   */
  public async generateHyperpersonalizedRecommendations(
    domain: 'workout' | 'nutrition' | 'sleep' | 'wellness' | 'productivity' | 'all' = 'all',
    limit: number = 5
  ): Promise<any[]> {
    try {
      // Gather context for recommendations
      const context = await this.gatherRecommendationContext();

      // Generate domain-specific recommendations
      let recommendations: any[] = [];

      if (domain === 'all' || domain === 'workout') {
        const workoutRecs = await this.generateWorkoutRecommendations(context, Math.ceil(limit / 4));
        recommendations = [...recommendations, ...workoutRecs];
      }

      if (domain === 'all' || domain === 'nutrition') {
        const nutritionRecs = await this.generateNutritionRecommendations(context, Math.ceil(limit / 4));
        recommendations = [...recommendations, ...nutritionRecs];
      }

      if (domain === 'all' || domain === 'sleep') {
        const sleepRecs = await this.generateSleepRecommendations(context, Math.ceil(limit / 4));
        recommendations = [...recommendations, ...sleepRecs];
      }

      if (domain === 'all' || domain === 'wellness') {
        const wellnessRecs = await this.generateWellnessRecommendations(context, Math.ceil(limit / 4));
        recommendations = [...recommendations, ...wellnessRecs];
      }

      // Update interaction history
      if (this.personalizationProfile) {
        this.personalizationProfile.interactionHistory.recommendationsViewed += recommendations.length;
        this.personalizationProfile.interactionHistory.lastInteraction = new Date().toISOString();

        // Save the updated profile
        await this.savePersonalizationProfile();
      }

      return recommendations.slice(0, limit);
    } catch (error) {
      console.error('Error generating hyperpersonalized recommendations:', error);
      return [];
    }
  }

  /**
   * Gather context for generating recommendations
   */
  private async gatherRecommendationContext(): Promise<AIRecommendationContext> {
    // Get user fatigue
    const { data: fatigue } = await getUserFatigue(this.userId);

    // Check if user is ready to train
    const { data: readyToTrainData } = await isReadyToTrain(this.userId);

    // Get recent wearable data
    const today = new Date().toISOString().split('T')[0];
    const { data: wearableData } = await getWearableData(this.userId, {
      startDate: today,
      endDate: today
    });

    // TODO: Get recent sleep, nutrition, and stress data

    return {
      userId: this.userId,
      timestamp: new Date().toISOString(),
      currentFatigue: fatigue?.currentFatigue || 0,
      readyToTrain: readyToTrainData?.ready || true,
      recentWorkouts: true, // Placeholder
      recentSleep: null, // Placeholder
      recentNutrition: null, // Placeholder
      recentStress: 0, // Placeholder
      userGoals: [], // Placeholder
      userPreferences: {}, // Placeholder
      wearableData: wearableData || []
    };
  }

  // Domain-specific recommendation generators
  private async generateWorkoutRecommendations(context: AIRecommendationContext, limit: number): Promise<any[]> {
    try {
      console.log('🤖 AI Core: Generando recomendaciones de entrenamiento personalizadas');

      const recommendations: any[] = [];

      // Get user profile and training data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      const { data: trainingProfile } = await supabase
        .from('training_profiles')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      const { data: recentWorkouts } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', this.userId)
        .order('date', { ascending: false })
        .limit(10);

      // ✅ PERSONALIZATION: Generate recommendations based on user data
      const userLevel = profile?.experience_level || 'beginner';
      const primaryGoal = trainingProfile?.primary_goal || 'general_fitness';
      const fatigueLevel = context.currentFatigue || 0;
      const readyToTrain = context.readyToTrain;

      // Recommendation 1: Adaptive Intensity Based on Fatigue
      if (fatigueLevel > 7) {
        recommendations.push({
          id: `workout_rec_${Date.now()}_1`,
          type: 'workout_adjustment',
          title: 'Entrenamiento de Recuperación Activa',
          description: 'Tu nivel de fatiga está alto. Te recomendamos un entrenamiento de baja intensidad.',
          priority: 'high',
          confidence: 0.9,
          actions: [
            'Reduce la intensidad en un 30%',
            'Enfócate en movilidad y flexibilidad',
            'Considera un día de descanso activo'
          ],
          reasoning: `Fatiga detectada: ${fatigueLevel}/10. Priorizando recuperación.`,
          category: 'recovery'
        });
      } else if (readyToTrain && fatigueLevel < 4) {
        recommendations.push({
          id: `workout_rec_${Date.now()}_2`,
          type: 'workout_intensity',
          title: 'Oportunidad de Entrenamiento Intenso',
          description: 'Estás en condiciones óptimas para un entrenamiento desafiante.',
          priority: 'medium',
          confidence: 0.8,
          actions: [
            'Aumenta la intensidad en un 10-15%',
            'Prueba ejercicios más desafiantes',
            'Enfócate en tu objetivo principal'
          ],
          reasoning: `Baja fatiga (${fatigueLevel}/10) y buena preparación detectada.`,
          category: 'progression'
        });
      }

      // Recommendation 2: Goal-Specific Training Focus
      if (primaryGoal === 'muscle_gain') {
        recommendations.push({
          id: `workout_rec_${Date.now()}_3`,
          type: 'training_focus',
          title: 'Optimización para Ganancia Muscular',
          description: 'Ajustes específicos para maximizar la hipertrofia.',
          priority: 'medium',
          confidence: 0.85,
          actions: [
            'Mantén repeticiones en rango 8-12',
            'Aumenta el tiempo bajo tensión',
            'Prioriza ejercicios compuestos'
          ],
          reasoning: `Objetivo principal: ${primaryGoal}. Optimizando para hipertrofia.`,
          category: 'goal_optimization'
        });
      } else if (primaryGoal === 'strength') {
        recommendations.push({
          id: `workout_rec_${Date.now()}_4`,
          type: 'training_focus',
          title: 'Optimización para Fuerza',
          description: 'Ajustes específicos para maximizar las ganancias de fuerza.',
          priority: 'medium',
          confidence: 0.85,
          actions: [
            'Enfócate en repeticiones bajas (3-6)',
            'Aumenta los períodos de descanso',
            'Prioriza levantamientos básicos'
          ],
          reasoning: `Objetivo principal: ${primaryGoal}. Optimizando para fuerza máxima.`,
          category: 'goal_optimization'
        });
      }

      // Recommendation 3: Experience Level Adaptations
      if (userLevel === 'beginner') {
        recommendations.push({
          id: `workout_rec_${Date.now()}_5`,
          type: 'beginner_guidance',
          title: 'Progresión para Principiantes',
          description: 'Recomendaciones específicas para tu nivel de experiencia.',
          priority: 'high',
          confidence: 0.95,
          actions: [
            'Enfócate en la técnica correcta',
            'Aumenta el peso gradualmente (2.5-5kg)',
            'Mantén rutinas de cuerpo completo'
          ],
          reasoning: `Nivel de experiencia: ${userLevel}. Priorizando fundamentos.`,
          category: 'skill_development'
        });
      } else if (userLevel === 'advanced') {
        recommendations.push({
          id: `workout_rec_${Date.now()}_6`,
          type: 'advanced_techniques',
          title: 'Técnicas Avanzadas',
          description: 'Incorpora técnicas avanzadas para romper mesetas.',
          priority: 'medium',
          confidence: 0.8,
          actions: [
            'Prueba técnicas de intensidad (drop sets, supersets)',
            'Varía los rangos de repeticiones',
            'Considera periodización avanzada'
          ],
          reasoning: `Nivel avanzado detectado. Sugiriendo técnicas de intensificación.`,
          category: 'advanced_progression'
        });
      }

      // Recommendation 4: Workout Frequency Optimization
      const workoutFrequency = recentWorkouts?.length || 0;
      const targetFrequency = trainingProfile?.days_per_week || 3;

      if (workoutFrequency < targetFrequency * 0.7) {
        recommendations.push({
          id: `workout_rec_${Date.now()}_7`,
          type: 'frequency_adjustment',
          title: 'Aumentar Frecuencia de Entrenamiento',
          description: 'Has entrenado menos de lo planificado esta semana.',
          priority: 'medium',
          confidence: 0.8,
          actions: [
            'Programa entrenamientos más cortos',
            'Considera entrenamientos en casa',
            'Establece recordatorios diarios'
          ],
          reasoning: `Frecuencia actual: ${workoutFrequency}, objetivo: ${targetFrequency}`,
          category: 'consistency'
        });
      }

      console.log(`✅ AI Core: Generadas ${recommendations.length} recomendaciones de entrenamiento`);
      return recommendations.slice(0, limit);

    } catch (error) {
      console.error('❌ AI Core: Error generando recomendaciones de entrenamiento:', error);
      return [];
    }
  }

  private async generateNutritionRecommendations(context: AIRecommendationContext, limit: number): Promise<any[]> {
    // Implementation will be added in the next section
    return [];
  }

  private async generateSleepRecommendations(context: AIRecommendationContext, limit: number): Promise<any[]> {
    // Implementation will be added in the next section
    return [];
  }

  private async generateWellnessRecommendations(context: AIRecommendationContext, limit: number): Promise<any[]> {
    // Implementation will be added in the next section
    return [];
  }

  /**
   * Save the personalization profile to the database
   */
  private async savePersonalizationProfile(): Promise<void> {
    if (!this.personalizationProfile) {
      console.log('No hay perfil de personalización para guardar');
      return;
    }

    try {
      console.log('Guardando perfil de personalización para el usuario:', this.userId);

      // Transformar datos al formato esperado por Supabase
      const profileData = {
        user_id: this.personalizationProfile.userId,
        learning_rate: this.personalizationProfile.learningRate,
        adaptation_level: this.personalizationProfile.adaptationLevel,
        preferred_modalities: this.personalizationProfile.preferredModalities,
        interaction_history: this.personalizationProfile.interactionHistory,
        data_quality: this.personalizationProfile.dataQuality,
        last_updated: new Date().toISOString()
      };

      // Intentar guardar el perfil
      try {
        const { error } = await supabase
          .from('ai_personalization_profiles')
          .upsert([profileData])
          .eq('user_id', this.userId);

        if (error) {
          console.error('Error al guardar perfil de personalización:', error);
          // No hacemos nada más, el perfil sigue en memoria
        } else {
          console.log('Perfil guardado exitosamente');
        }
      } catch (supabaseError) {
        console.error('Error de Supabase al guardar perfil:', supabaseError);
        // No hacemos nada más, el perfil sigue en memoria
      }
    } catch (error) {
      console.error('Error inesperado al guardar perfil de personalización:', error);
      // No hacemos nada más, el perfil sigue en memoria
    }
  }
}
