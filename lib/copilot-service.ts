/**
 * Servicio para integrar con Microsoft Copilot Studio
 * 
 * Este servicio maneja la comunicación con Microsoft Copilot Studio
 * para proporcionar asistencia conversacional en la aplicación.
 */

// Tipos para la integración con Microsoft Copilot Studio
export interface CopilotMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface CopilotResponse {
  message: string;
  suggestions?: string[];
  actions?: CopilotAction[];
}

export interface CopilotAction {
  type: 'link' | 'function';
  label: string;
  value: string;
}

export interface CopilotContext {
  userId?: string;
  userName?: string;
  userGoals?: string[];
  currentModule?: string;
  trainingLevel?: string;
  dietPreferences?: string[];
}

/**
 * Clase para manejar la integración con Microsoft Copilot Studio
 */
export class CopilotService {
  private apiUrl: string;
  private apiKey: string;
  private context: CopilotContext;

  constructor(apiUrl: string, apiKey: string, initialContext: CopilotContext = {}) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.context = initialContext;
  }

  /**
   * Actualiza el contexto del usuario para personalizar las respuestas
   */
  public updateContext(newContext: Partial<CopilotContext>): void {
    this.context = { ...this.context, ...newContext };
  }

  /**
   * Envía un mensaje al bot de Microsoft Copilot Studio y obtiene una respuesta
   */
  public async sendMessage(message: string): Promise<CopilotResponse> {
    try {
      // En un entorno real, aquí se realizaría la llamada a la API de Microsoft Copilot Studio
      // Por ahora, simulamos la respuesta para desarrollo
      
      // Simulación de latencia de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return this.getMockResponse(message);
    } catch (error) {
      console.error('Error al comunicarse con Microsoft Copilot Studio:', error);
      return {
        message: 'Lo siento, estoy teniendo problemas para procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.'
      };
    }
  }

  /**
   * Función temporal para simular respuestas del bot durante el desarrollo
   * En producción, esto sería reemplazado por llamadas reales a la API
   */
  private getMockResponse(message: string): CopilotResponse {
    const lowerMessage = message.toLowerCase();
    
    // Respuestas basadas en el módulo de entrenamiento
    if (lowerMessage.includes('entrena') || lowerMessage.includes('ejercicio') || lowerMessage.includes('rutina')) {
      return {
        message: 'Puedo ayudarte con tu entrenamiento. ¿Qué te gustaría hacer?',
        suggestions: ['Ver mis rutinas', 'Crear nueva rutina', 'Registrar entrenamiento'],
        actions: [
          { type: 'link', label: 'Ir a Entrenamiento', value: '/training' },
          { type: 'function', label: 'Crear rutina', value: 'createWorkout' }
        ]
      };
    }
    
    // Respuestas basadas en el módulo de nutrición
    if (lowerMessage.includes('nutri') || lowerMessage.includes('comida') || lowerMessage.includes('dieta') || lowerMessage.includes('aliment')) {
      return {
        message: 'La nutrición es clave para alcanzar tus objetivos. ¿En qué puedo ayudarte?',
        suggestions: ['Ver mi plan alimenticio', 'Registrar comida', 'Calcular calorías'],
        actions: [
          { type: 'link', label: 'Ir a Nutrición', value: '/nutrition' },
          { type: 'function', label: 'Registrar comida', value: 'logMeal' }
        ]
      };
    }
    
    // Respuestas basadas en el módulo de sueño
    if (lowerMessage.includes('sueño') || lowerMessage.includes('dormir') || lowerMessage.includes('descanso')) {
      return {
        message: 'El sueño es fundamental para tu recuperación y rendimiento. ¿Qué necesitas?',
        suggestions: ['Ver estadísticas de sueño', 'Consejos para dormir mejor'],
        actions: [
          { type: 'link', label: 'Ir a Sueño', value: '/sleep' }
        ]
      };
    }
    
    // Respuestas basadas en el módulo de bienestar
    if (lowerMessage.includes('bienestar') || lowerMessage.includes('estres') || lowerMessage.includes('meditación') || lowerMessage.includes('meditar')) {
      return {
        message: 'El bienestar mental es tan importante como el físico. ¿Cómo puedo ayudarte?',
        suggestions: ['Ejercicios de respiración', 'Meditación guiada', 'Técnicas anti-estrés'],
        actions: [
          { type: 'link', label: 'Ir a Bienestar', value: '/wellness' }
        ]
      };
    }
    
    // Respuestas para saludos
    if (lowerMessage.includes('hola') || lowerMessage.includes('saludos') || lowerMessage.includes('buenos días') || lowerMessage.includes('buenas tardes')) {
      return {
        message: `¡Hola${this.context.userName ? ' ' + this.context.userName : ''}! Soy tu asistente de fitness. ¿En qué puedo ayudarte hoy?`,
        suggestions: ['Entrenamientos', 'Nutrición', 'Sueño', 'Bienestar']
      };
    }
    
    // Respuesta por defecto
    return {
      message: 'Estoy aquí para ayudarte con tu bienestar. Puedo asistirte con entrenamientos, nutrición, sueño y hábitos saludables. ¿Podrías darme más detalles sobre lo que necesitas?',
      suggestions: ['Entrenamientos', 'Nutrición', 'Sueño', 'Bienestar', 'Mis objetivos']
    };
  }
}

// Instancia por defecto para uso en la aplicación
export const copilotService = new CopilotService(
  process.env.NEXT_PUBLIC_COPILOT_API_URL || 'https://api.example.com/copilot',
  process.env.NEXT_PUBLIC_COPILOT_API_KEY || 'default-key'
);
