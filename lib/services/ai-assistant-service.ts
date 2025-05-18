/**
 * Servicio para la integración con OpenAI para el asistente de IA
 * 
 * Este servicio maneja la comunicación con la API de OpenAI para proporcionar
 * respuestas inteligentes y personalizadas al usuario.
 */

import { supabase } from '@/lib/supabase-client-enhanced';
import { v4 as uuidv4 } from 'uuid';

// Tipos para la integración con el asistente de IA
export interface AssistantMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AssistantResponse {
  message: string;
  suggestions?: string[];
  actions?: AssistantAction[];
  metadata?: Record<string, any>;
}

export interface AssistantAction {
  type: 'link' | 'function' | 'module';
  label: string;
  value: string;
  metadata?: Record<string, any>;
}

export interface AssistantContext {
  userId?: string;
  userName?: string;
  userGoals?: string[];
  currentModule?: string;
  trainingLevel?: string;
  dietPreferences?: string[];
  recentWorkouts?: any[];
  recentMeals?: any[];
  progressData?: any;
  sleepData?: any;
  wellnessData?: any;
}

export interface ConversationHistory {
  messages: AssistantMessage[];
  context: AssistantContext;
}

/**
 * Clase para manejar la integración con OpenAI para el asistente
 */
export class AIAssistantService {
  private apiUrl: string;
  private context: AssistantContext;
  private conversationHistory: AssistantMessage[];
  private maxHistoryLength: number;

  constructor(apiUrl: string = '/api/assistant', initialContext: AssistantContext = {}, maxHistoryLength: number = 10) {
    this.apiUrl = apiUrl;
    this.context = initialContext;
    this.conversationHistory = [];
    this.maxHistoryLength = maxHistoryLength;
  }

  /**
   * Actualiza el contexto del usuario para personalizar las respuestas
   */
  public updateContext(newContext: Partial<AssistantContext>): void {
    this.context = { ...this.context, ...newContext };
  }

  /**
   * Obtiene el contexto actual
   */
  public getContext(): AssistantContext {
    return { ...this.context };
  }

  /**
   * Obtiene el historial de conversación
   */
  public getConversationHistory(): AssistantMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Establece el historial de conversación
   */
  public setConversationHistory(history: AssistantMessage[]): void {
    this.conversationHistory = [...history];
  }

  /**
   * Limpia el historial de conversación
   */
  public clearConversationHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Añade un mensaje al historial de conversación
   */
  private addMessageToHistory(message: AssistantMessage): void {
    this.conversationHistory.push(message);
    
    // Mantener el historial dentro del límite establecido
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(
        this.conversationHistory.length - this.maxHistoryLength
      );
    }
  }

  /**
   * Guarda el historial de conversación en Supabase
   */
  public async saveConversationHistory(userId: string): Promise<void> {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('conversation_history')
        .upsert({
          user_id: userId,
          messages: this.conversationHistory,
          context: this.context,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error al guardar el historial de conversación:', error);
      }
    } catch (error) {
      console.error('Error al guardar el historial de conversación:', error);
    }
  }

  /**
   * Carga el historial de conversación desde Supabase
   */
  public async loadConversationHistory(userId: string): Promise<boolean> {
    if (!userId) return false;
    
    try {
      const { data, error } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // No data found
          console.error('Error al cargar el historial de conversación:', error);
        }
        return false;
      }
      
      if (data) {
        this.conversationHistory = data.messages || [];
        this.context = { ...this.context, ...data.context };
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error al cargar el historial de conversación:', error);
      return false;
    }
  }

  /**
   * Envía un mensaje al asistente de IA y obtiene una respuesta
   */
  public async sendMessage(message: string): Promise<AssistantResponse> {
    try {
      // Crear mensaje del usuario
      const userMessage: AssistantMessage = {
        id: uuidv4(),
        content: message,
        role: 'user',
        timestamp: new Date()
      };
      
      // Añadir mensaje del usuario al historial
      this.addMessageToHistory(userMessage);
      
      // Preparar la solicitud a la API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: this.context,
          history: this.conversationHistory
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Crear mensaje del asistente
      const assistantMessage: AssistantMessage = {
        id: uuidv4(),
        content: data.response.message,
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          suggestions: data.response.suggestions,
          actions: data.response.actions
        }
      };
      
      // Añadir mensaje del asistente al historial
      this.addMessageToHistory(assistantMessage);
      
      // Guardar el historial si hay un usuario
      if (this.context.userId) {
        this.saveConversationHistory(this.context.userId);
      }
      
      return data.response;
    } catch (error) {
      console.error('Error al comunicarse con el asistente de IA:', error);
      
      // Respuesta de error
      const errorResponse: AssistantResponse = {
        message: 'Lo siento, estoy teniendo problemas para procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.'
      };
      
      // Crear mensaje de error
      const errorMessage: AssistantMessage = {
        id: uuidv4(),
        content: errorResponse.message,
        role: 'assistant',
        timestamp: new Date()
      };
      
      // Añadir mensaje de error al historial
      this.addMessageToHistory(errorMessage);
      
      return errorResponse;
    }
  }

  /**
   * Obtiene datos del usuario desde Supabase para enriquecer el contexto
   */
  public async enrichContextWithUserData(userId: string): Promise<void> {
    if (!userId) return;
    
    try {
      // Obtener perfil del usuario
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileError) {
        console.error('Error al obtener el perfil del usuario:', profileError);
        return;
      }
      
      if (userProfile) {
        this.updateContext({
          userName: userProfile.full_name,
          trainingLevel: userProfile.training_level,
          dietPreferences: userProfile.diet_preferences,
          userGoals: userProfile.goals
        });
      }
      
      // Obtener entrenamientos recientes
      const { data: recentWorkouts, error: workoutsError } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(5);
      
      if (!workoutsError && recentWorkouts) {
        this.updateContext({
          recentWorkouts
        });
      }
      
      // Obtener comidas recientes
      const { data: recentMeals, error: mealsError } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(5);
      
      if (!mealsError && recentMeals) {
        this.updateContext({
          recentMeals
        });
      }
      
      // Obtener datos de progreso
      const { data: progressData, error: progressError } = await supabase
        .from('progress_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single();
      
      if (!progressError && progressData) {
        this.updateContext({
          progressData
        });
      }
      
      // Obtener datos de sueño
      const { data: sleepData, error: sleepError } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(5);
      
      if (!sleepError && sleepData) {
        this.updateContext({
          sleepData
        });
      }
      
      // Obtener datos de bienestar
      const { data: wellnessData, error: wellnessError } = await supabase
        .from('wellness_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(5);
      
      if (!wellnessError && wellnessData) {
        this.updateContext({
          wellnessData
        });
      }
    } catch (error) {
      console.error('Error al enriquecer el contexto con datos del usuario:', error);
    }
  }
}

// Instancia por defecto para uso en la aplicación
export const aiAssistantService = new AIAssistantService();
