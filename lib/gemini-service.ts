"use client";

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Types for the Gemini service
export interface GeminiMessage {
  role: "user" | "model";
  parts: string;
}

export interface GeminiChatHistory {
  messages: GeminiMessage[];
}

export interface GeminiResponse {
  text: string;
  suggestions?: string[];
}

export interface GeminiError {
  message: string;
  code?: string;
  details?: any;
}

export interface FitnessContext {
  userId?: string;
  userName?: string;
  userGoals?: string[];
  currentModule?: string;
  trainingLevel?: string;
  dietPreferences?: string[];
  recentWorkouts?: any[];
  healthMetrics?: any;
}

// Safety settings for the Gemini API
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Gemini Service for AI-powered chat and recommendations
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private apiKey: string;
  private context: FitnessContext;
  private chatHistory: GeminiMessage[] = [];
  private isInitialized: boolean = false;
  private modelName: string = "gemini-1.5-pro";

  constructor(apiKey?: string, context: FitnessContext = {}) {
    // Use provided API key or environment variable
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    this.context = context;
    
    // Initialize if API key is available
    if (this.apiKey) {
      this.initialize();
    }
  }

  /**
   * Initialize the Gemini API client
   */
  private initialize(): void {
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: this.modelName,
        safetySettings,
      });
      this.isInitialized = true;
      console.log("Gemini API initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Gemini API:", error);
      this.isInitialized = false;
    }
  }

  /**
   * Set the context for personalized responses
   */
  public setContext(context: FitnessContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Send a message to the Gemini API and get a response
   */
  public async sendMessage(message: string): Promise<GeminiResponse> {
    if (!this.isInitialized) {
      if (this.apiKey) {
        this.initialize();
      } else {
        return this.getFallbackResponse("No se pudo inicializar el servicio de IA. Por favor, verifica la configuración.");
      }
    }

    try {
      // Add user message to history
      this.chatHistory.push({
        role: "user",
        parts: message,
      });

      // Create chat session with context
      const chat = this.model.startChat({
        history: this.formatChatHistory(),
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      // Get response from Gemini
      const result = await chat.sendMessage(this.addContextToPrompt(message));
      const responseText = result.response.text();

      // Add model response to history
      this.chatHistory.push({
        role: "model",
        parts: responseText,
      });

      // Limit history to last 10 messages to prevent token limits
      if (this.chatHistory.length > 10) {
        this.chatHistory = this.chatHistory.slice(-10);
      }

      // Extract suggestions if any
      const suggestions = this.extractSuggestions(responseText);

      return {
        text: responseText,
        suggestions,
      };
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      return this.getFallbackResponse("Lo siento, estoy teniendo problemas para procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.");
    }
  }

  /**
   * Generate personalized fitness recommendations
   */
  public async generateRecommendations(type: string): Promise<any[]> {
    if (!this.isInitialized) {
      if (this.apiKey) {
        this.initialize();
      } else {
        console.error("Gemini API not initialized");
        return [];
      }
    }

    try {
      const prompt = this.createRecommendationPrompt(type);
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Parse the response to extract recommendations
      return this.parseRecommendations(responseText, type);
    } catch (error) {
      console.error(`Error generating ${type} recommendations:`, error);
      return [];
    }
  }

  /**
   * Clear chat history
   */
  public clearHistory(): void {
    this.chatHistory = [];
  }

  /**
   * Format chat history for the Gemini API
   */
  private formatChatHistory(): { role: string, parts: string }[] {
    return this.chatHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.parts }],
    }));
  }

  /**
   * Add context to the user's prompt
   */
  private addContextToPrompt(message: string): string {
    // Create a context string based on available information
    let contextStr = "Contexto del usuario:\n";
    
    if (this.context.userName) {
      contextStr += `- Nombre: ${this.context.userName}\n`;
    }
    
    if (this.context.trainingLevel) {
      contextStr += `- Nivel de entrenamiento: ${this.context.trainingLevel}\n`;
    }
    
    if (this.context.userGoals && this.context.userGoals.length > 0) {
      contextStr += `- Objetivos: ${this.context.userGoals.join(", ")}\n`;
    }
    
    if (this.context.dietPreferences && this.context.dietPreferences.length > 0) {
      contextStr += `- Preferencias dietéticas: ${this.context.dietPreferences.join(", ")}\n`;
    }
    
    if (this.context.currentModule) {
      contextStr += `- Módulo actual: ${this.context.currentModule}\n`;
    }

    return `${contextStr}\n\nConsulta del usuario: ${message}`;
  }

  /**
   * Create a prompt for generating recommendations
   */
  private createRecommendationPrompt(type: string): string {
    let prompt = "";
    
    switch (type) {
      case "workout":
        prompt = `Genera 3 recomendaciones de entrenamiento personalizadas para un usuario con nivel ${this.context.trainingLevel || "intermedio"}. 
                 Cada recomendación debe incluir: título, descripción breve, y razón. 
                 Formatea la respuesta como una lista numerada.`;
        break;
      case "nutrition":
        prompt = `Genera 3 recomendaciones nutricionales personalizadas para un usuario con preferencias dietéticas: ${this.context.dietPreferences?.join(", ") || "equilibrada"}. 
                 Cada recomendación debe incluir: título, descripción breve, y beneficio principal. 
                 Formatea la respuesta como una lista numerada.`;
        break;
      case "wellness":
        prompt = `Genera 3 recomendaciones de bienestar general para mejorar la salud integral. 
                 Cada recomendación debe incluir: título, descripción breve, y beneficio para la salud. 
                 Formatea la respuesta como una lista numerada.`;
        break;
      default:
        prompt = `Genera 3 consejos generales de fitness para un usuario de nivel ${this.context.trainingLevel || "intermedio"}. 
                 Cada consejo debe incluir: título, descripción breve, y beneficio. 
                 Formatea la respuesta como una lista numerada.`;
    }
    
    return prompt;
  }

  /**
   * Parse recommendations from the Gemini response
   */
  private parseRecommendations(text: string, type: string): any[] {
    try {
      // Simple parsing of numbered list
      const recommendations = [];
      const lines = text.split("\n");
      
      let currentRec: any = null;
      
      for (const line of lines) {
        // Check for numbered item (1., 2., 3., etc.)
        if (/^\d+\./.test(line.trim())) {
          // If we have a previous recommendation, add it
          if (currentRec) {
            recommendations.push(currentRec);
          }
          
          // Start a new recommendation
          currentRec = {
            id: `${type}-${recommendations.length + 1}`,
            title: line.replace(/^\d+\.\s*/, "").trim(),
            description: "",
            type: type,
          };
        } else if (currentRec && line.trim()) {
          // Add non-empty lines to the description
          currentRec.description += line.trim() + " ";
        }
      }
      
      // Add the last recommendation
      if (currentRec) {
        recommendations.push(currentRec);
      }
      
      return recommendations;
    } catch (error) {
      console.error("Error parsing recommendations:", error);
      return [];
    }
  }

  /**
   * Extract suggested responses from the AI's reply
   */
  private extractSuggestions(text: string): string[] {
    // Look for suggestions in the format "Sugerencias:" or similar patterns
    const suggestionsMatch = text.match(/Sugerencias:?\s*([\s\S]*?)(?:\n\n|$)/i);
    
    if (suggestionsMatch && suggestionsMatch[1]) {
      // Extract bullet points or numbered items
      const suggestions = suggestionsMatch[1]
        .split(/\n/)
        .map(line => line.replace(/^[-*•]|\d+\.\s*/, "").trim())
        .filter(item => item.length > 0);
      
      return suggestions;
    }
    
    return [];
  }

  /**
   * Get a fallback response when the API is unavailable
   */
  private getFallbackResponse(errorMessage: string): GeminiResponse {
    return {
      text: errorMessage,
      suggestions: [
        "¿Qué ejercicios me recomiendas?",
        "Dame consejos de nutrición",
        "¿Cómo puedo mejorar mi descanso?",
      ],
    };
  }
}

// Create a singleton instance for use throughout the app
export const geminiService = new GeminiService();
