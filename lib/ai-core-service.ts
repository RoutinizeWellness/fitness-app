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
    // Implementation will be added in the next section
    return [];
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
