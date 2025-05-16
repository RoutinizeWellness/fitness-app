import { supabase } from './supabase-client';
import { v4 as uuidv4 } from 'uuid';

// Tipos para el análisis de bienestar
export interface WellnessAnalysis {
  userId: string;
  date: string;
  stressLevel: number; // 0-100
  moodScore: number; // 0-100
  sleepQuality: number; // 0-100
  mindfulnessMinutes: number;
  breathingExercises: number;
  overallWellnessScore: number; // 0-100
  recommendations: string[];
  insights: string[];
}

// Tipos para las recomendaciones de bienestar
export interface WellnessRecommendation {
  id: string;
  userId: string;
  type: 'mindfulness' | 'breathing' | 'sleep' | 'stress' | 'mood';
  title: string;
  description: string;
  duration: number; // minutos
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  tags: string[];
  createdAt: string;
}

// Clase para el servicio de IA de bienestar
export class WellnessAIService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Analizar datos de bienestar
  async analyzeWellnessData(): Promise<WellnessAnalysis | null> {
    try {
      // Obtener datos de los últimos 14 días
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);
      
      // Obtener datos de estrés y estado de ánimo
      const { data: moodData, error: moodError } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', this.userId)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: false });
      
      if (moodError) {
        console.error('Error al obtener datos de estado de ánimo:', moodError);
        return null;
      }
      
      // Obtener datos de sueño
      const { data: sleepData, error: sleepError } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', this.userId)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: false });
      
      if (sleepError) {
        console.error('Error al obtener datos de sueño:', sleepError);
      }
      
      // Obtener datos de mindfulness
      const { data: mindfulnessData, error: mindfulnessError } = await supabase
        .from('mindfulness_logs')
        .select('*')
        .eq('user_id', this.userId)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());
      
      if (mindfulnessError) {
        console.error('Error al obtener datos de mindfulness:', mindfulnessError);
      }
      
      // Obtener datos de ejercicios de respiración
      const { data: breathingData, error: breathingError } = await supabase
        .from('breathing_sessions')
        .select('*')
        .eq('user_id', this.userId)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());
      
      if (breathingError) {
        console.error('Error al obtener datos de respiración:', breathingError);
      }
      
      // Si no hay datos suficientes, devolver null
      if (!moodData || moodData.length === 0) {
        return null;
      }
      
      // Calcular métricas
      const stressLevels = moodData.map(m => m.stress_level || 50);
      const moodScores = moodData.map(m => m.mood_level * 20 || 50); // Convertir escala 1-5 a 0-100
      const avgStressLevel = this.average(stressLevels);
      const avgMoodScore = this.average(moodScores);
      
      // Calcular calidad de sueño
      let avgSleepQuality = 50; // Valor por defecto
      if (sleepData && sleepData.length > 0) {
        const sleepQualities = sleepData.map(s => s.quality || 50);
        avgSleepQuality = this.average(sleepQualities);
      }
      
      // Calcular minutos de mindfulness
      let totalMindfulnessMinutes = 0;
      if (mindfulnessData && mindfulnessData.length > 0) {
        totalMindfulnessMinutes = mindfulnessData.reduce((sum, m) => sum + (m.duration || 0), 0);
      }
      
      // Calcular ejercicios de respiración
      let totalBreathingExercises = 0;
      if (breathingData && breathingData.length > 0) {
        totalBreathingExercises = breathingData.length;
      }
      
      // Calcular puntuación general de bienestar
      const overallWellnessScore = this.calculateOverallWellnessScore(
        avgStressLevel,
        avgMoodScore,
        avgSleepQuality,
        totalMindfulnessMinutes,
        totalBreathingExercises
      );
      
      // Generar recomendaciones e insights
      const { recommendations, insights } = this.generateRecommendationsAndInsights(
        avgStressLevel,
        avgMoodScore,
        avgSleepQuality,
        totalMindfulnessMinutes,
        totalBreathingExercises,
        moodData,
        sleepData,
        mindfulnessData,
        breathingData
      );
      
      // Crear análisis de bienestar
      const wellnessAnalysis: WellnessAnalysis = {
        userId: this.userId,
        date: new Date().toISOString(),
        stressLevel: avgStressLevel,
        moodScore: avgMoodScore,
        sleepQuality: avgSleepQuality,
        mindfulnessMinutes: totalMindfulnessMinutes,
        breathingExercises: totalBreathingExercises,
        overallWellnessScore,
        recommendations,
        insights
      };
      
      // Guardar análisis en la base de datos
      await this.saveWellnessAnalysis(wellnessAnalysis);
      
      return wellnessAnalysis;
    } catch (error) {
      console.error('Error al analizar datos de bienestar:', error);
      return null;
    }
  }

  // Generar recomendaciones personalizadas de bienestar
  async generateWellnessRecommendations(): Promise<WellnessRecommendation[]> {
    try {
      // Obtener análisis de bienestar más reciente
      const wellnessAnalysis = await this.analyzeWellnessData();
      
      if (!wellnessAnalysis) {
        return this.getDefaultRecommendations();
      }
      
      const recommendations: WellnessRecommendation[] = [];
      
      // Recomendación basada en nivel de estrés
      if (wellnessAnalysis.stressLevel > 70) {
        recommendations.push({
          id: uuidv4(),
          userId: this.userId,
          type: 'breathing',
          title: 'Respiración 4-7-8 para reducir el estrés',
          description: 'Esta técnica de respiración ayuda a activar el sistema nervioso parasimpático, reduciendo la respuesta de estrés y promoviendo la calma.',
          duration: 10,
          difficulty: 'beginner',
          benefits: ['Reducción del estrés', 'Mejor control de la ansiedad', 'Ayuda a conciliar el sueño'],
          tags: ['estrés', 'ansiedad', 'respiración', 'relajación'],
          createdAt: new Date().toISOString()
        });
      }
      
      // Recomendación basada en estado de ánimo
      if (wellnessAnalysis.moodScore < 50) {
        recommendations.push({
          id: uuidv4(),
          userId: this.userId,
          type: 'mindfulness',
          title: 'Meditación de gratitud',
          description: 'Esta práctica de mindfulness te ayuda a enfocarte en aspectos positivos de tu vida, lo que puede mejorar tu estado de ánimo y perspectiva general.',
          duration: 15,
          difficulty: 'beginner',
          benefits: ['Mejora del estado de ánimo', 'Reducción de pensamientos negativos', 'Mayor apreciación'],
          tags: ['mindfulness', 'gratitud', 'estado de ánimo', 'bienestar'],
          createdAt: new Date().toISOString()
        });
      }
      
      // Recomendación basada en calidad de sueño
      if (wellnessAnalysis.sleepQuality < 60) {
        recommendations.push({
          id: uuidv4(),
          userId: this.userId,
          type: 'sleep',
          title: 'Rutina de relajación pre-sueño',
          description: 'Establece una rutina de 20 minutos antes de dormir que incluya desconexión digital, estiramientos suaves y respiración profunda para mejorar la calidad del sueño.',
          duration: 20,
          difficulty: 'beginner',
          benefits: ['Mejor calidad de sueño', 'Menor tiempo para conciliar el sueño', 'Descanso más reparador'],
          tags: ['sueño', 'relajación', 'rutina nocturna', 'descanso'],
          createdAt: new Date().toISOString()
        });
      }
      
      // Recomendación para usuarios con poca práctica de mindfulness
      if (wellnessAnalysis.mindfulnessMinutes < 30) {
        recommendations.push({
          id: uuidv4(),
          userId: this.userId,
          type: 'mindfulness',
          title: 'Mindfulness para principiantes',
          description: 'Comienza con sesiones cortas de 5 minutos de atención plena, enfocándote en tu respiración y sensaciones corporales.',
          duration: 5,
          difficulty: 'beginner',
          benefits: ['Reducción del estrés', 'Mayor concentración', 'Mejor autoconciencia'],
          tags: ['mindfulness', 'principiantes', 'atención plena', 'meditación'],
          createdAt: new Date().toISOString()
        });
      }
      
      // Recomendación para usuarios con pocos ejercicios de respiración
      if (wellnessAnalysis.breathingExercises < 3) {
        recommendations.push({
          id: uuidv4(),
          userId: this.userId,
          type: 'breathing',
          title: 'Respiración cuadrada para el equilibrio',
          description: 'Esta técnica simple pero efectiva ayuda a equilibrar el sistema nervioso y puede practicarse en cualquier momento del día.',
          duration: 5,
          difficulty: 'beginner',
          benefits: ['Equilibrio del sistema nervioso', 'Mejor concentración', 'Reducción de la ansiedad'],
          tags: ['respiración', 'equilibrio', 'concentración', 'ansiedad'],
          createdAt: new Date().toISOString()
        });
      }
      
      // Si no hay recomendaciones específicas, añadir una general
      if (recommendations.length === 0) {
        recommendations.push({
          id: uuidv4(),
          userId: this.userId,
          type: 'mindfulness',
          title: 'Práctica de atención plena diaria',
          description: 'Incorpora 10 minutos de mindfulness a tu rutina diaria para mantener y mejorar tu bienestar general.',
          duration: 10,
          difficulty: 'intermediate',
          benefits: ['Mantenimiento del bienestar', 'Mejor gestión del estrés', 'Mayor claridad mental'],
          tags: ['mindfulness', 'bienestar', 'rutina diaria', 'equilibrio'],
          createdAt: new Date().toISOString()
        });
      }
      
      // Guardar recomendaciones en la base de datos
      await this.saveWellnessRecommendations(recommendations);
      
      return recommendations;
    } catch (error) {
      console.error('Error al generar recomendaciones de bienestar:', error);
      return this.getDefaultRecommendations();
    }
  }

  // Métodos privados auxiliares
  private calculateOverallWellnessScore(
    stressLevel: number,
    moodScore: number,
    sleepQuality: number,
    mindfulnessMinutes: number,
    breathingExercises: number
  ): number {
    // Invertir el nivel de estrés (menos estrés = mejor puntuación)
    const stressScore = 100 - stressLevel;
    
    // Calcular puntuación de mindfulness (máximo 100 puntos por 60+ minutos)
    const mindfulnessScore = Math.min(mindfulnessMinutes / 0.6, 100);
    
    // Calcular puntuación de ejercicios de respiración (máximo 100 puntos por 5+ ejercicios)
    const breathingScore = Math.min(breathingExercises * 20, 100);
    
    // Calcular puntuación general ponderada
    const weightedScore = (
      stressScore * 0.25 +
      moodScore * 0.25 +
      sleepQuality * 0.25 +
      mindfulnessScore * 0.15 +
      breathingScore * 0.1
    );
    
    return Math.round(weightedScore);
  }

  private generateRecommendationsAndInsights(
    avgStressLevel: number,
    avgMoodScore: number,
    avgSleepQuality: number,
    totalMindfulnessMinutes: number,
    totalBreathingExercises: number,
    moodData: any[],
    sleepData: any[] | null,
    mindfulnessData: any[] | null,
    breathingData: any[] | null
  ): { recommendations: string[], insights: string[] } {
    const recommendations: string[] = [];
    const insights: string[] = [];
    
    // Insights basados en nivel de estrés
    if (avgStressLevel > 70) {
      insights.push(`Tu nivel de estrés promedio (${avgStressLevel.toFixed(0)}/100) es elevado. Esto puede afectar tu bienestar general y salud a largo plazo.`);
      recommendations.push('Incorpora técnicas de manejo del estrés como respiración profunda, meditación o yoga en tu rutina diaria.');
    } else if (avgStressLevel < 30) {
      insights.push(`Tu nivel de estrés promedio (${avgStressLevel.toFixed(0)}/100) es bajo, lo que es positivo para tu bienestar general.`);
    }
    
    // Insights basados en estado de ánimo
    if (avgMoodScore < 50) {
      insights.push(`Tu estado de ánimo promedio (${avgMoodScore.toFixed(0)}/100) está por debajo del rango óptimo.`);
      recommendations.push('Considera actividades que te brinden alegría y satisfacción. La actividad física regular también puede mejorar el estado de ánimo.');
    } else if (avgMoodScore > 70) {
      insights.push(`Tu estado de ánimo promedio (${avgMoodScore.toFixed(0)}/100) es positivo, lo que contribuye a tu bienestar general.`);
    }
    
    // Insights basados en calidad de sueño
    if (avgSleepQuality < 60) {
      insights.push(`Tu calidad de sueño promedio (${avgSleepQuality.toFixed(0)}/100) está por debajo del rango óptimo.`);
      recommendations.push('Establece una rutina de sueño consistente y crea un ambiente propicio para el descanso. Evita la cafeína y las pantallas antes de dormir.');
    } else if (avgSleepQuality > 80) {
      insights.push(`Tu calidad de sueño promedio (${avgSleepQuality.toFixed(0)}/100) es excelente, lo que favorece tu recuperación física y mental.`);
    }
    
    // Insights basados en práctica de mindfulness
    if (totalMindfulnessMinutes < 30) {
      insights.push(`Has dedicado ${totalMindfulnessMinutes} minutos a prácticas de mindfulness en las últimas dos semanas, lo que es relativamente poco.`);
      recommendations.push('Intenta incorporar sesiones cortas de mindfulness (5-10 minutos) en tu rutina diaria para experimentar sus beneficios.');
    } else if (totalMindfulnessMinutes > 120) {
      insights.push(`Has dedicado ${totalMindfulnessMinutes} minutos a prácticas de mindfulness en las últimas dos semanas, lo que muestra un compromiso consistente.`);
    }
    
    // Insights basados en ejercicios de respiración
    if (totalBreathingExercises < 3) {
      insights.push(`Has realizado ${totalBreathingExercises} ejercicios de respiración en las últimas dos semanas.`);
      recommendations.push('Los ejercicios de respiración son herramientas rápidas y efectivas para manejar el estrés. Intenta incorporarlos en momentos de tensión.');
    } else if (totalBreathingExercises > 7) {
      insights.push(`Has realizado ${totalBreathingExercises} ejercicios de respiración en las últimas dos semanas, lo que demuestra un buen hábito.`);
    }
    
    // Si no hay suficientes recomendaciones, añadir una general
    if (recommendations.length === 0) {
      recommendations.push('Continúa con tus prácticas actuales de bienestar y considera explorar nuevas técnicas para mantener la variedad y el interés.');
    }
    
    return { recommendations, insights };
  }

  private async saveWellnessAnalysis(analysis: WellnessAnalysis): Promise<void> {
    try {
      const { error } = await supabase
        .from('wellness_analysis')
        .insert([{
          user_id: analysis.userId,
          date: analysis.date,
          stress_level: analysis.stressLevel,
          mood_score: analysis.moodScore,
          sleep_quality: analysis.sleepQuality,
          mindfulness_minutes: analysis.mindfulnessMinutes,
          breathing_exercises: analysis.breathingExercises,
          overall_wellness_score: analysis.overallWellnessScore,
          recommendations: analysis.recommendations,
          insights: analysis.insights,
          created_at: new Date().toISOString()
        }]);
      
      if (error) {
        console.error('Error al guardar análisis de bienestar:', error);
      }
    } catch (error) {
      console.error('Error al guardar análisis de bienestar:', error);
    }
  }

  private async saveWellnessRecommendations(recommendations: WellnessRecommendation[]): Promise<void> {
    try {
      for (const rec of recommendations) {
        const { error } = await supabase
          .from('wellness_recommendations')
          .insert([{
            id: rec.id,
            user_id: rec.userId,
            type: rec.type,
            title: rec.title,
            description: rec.description,
            duration: rec.duration,
            difficulty: rec.difficulty,
            benefits: rec.benefits,
            tags: rec.tags,
            created_at: rec.createdAt,
            is_completed: false
          }]);
        
        if (error) {
          console.error('Error al guardar recomendación de bienestar:', error);
        }
      }
    } catch (error) {
      console.error('Error al guardar recomendaciones de bienestar:', error);
    }
  }

  private getDefaultRecommendations(): WellnessRecommendation[] {
    return [
      {
        id: uuidv4(),
        userId: this.userId,
        type: 'mindfulness',
        title: 'Meditación de atención plena básica',
        description: 'Comienza con una práctica simple de mindfulness enfocándote en tu respiración durante 5-10 minutos.',
        duration: 10,
        difficulty: 'beginner',
        benefits: ['Reducción del estrés', 'Mayor concentración', 'Mejor autoconciencia'],
        tags: ['mindfulness', 'principiantes', 'meditación', 'atención plena'],
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        userId: this.userId,
        type: 'breathing',
        title: 'Respiración diafragmática para la relajación',
        description: 'Aprende esta técnica fundamental de respiración que activa el sistema nervioso parasimpático y promueve la relajación.',
        duration: 5,
        difficulty: 'beginner',
        benefits: ['Reducción del estrés', 'Mejor oxigenación', 'Activación del sistema nervioso parasimpático'],
        tags: ['respiración', 'relajación', 'estrés', 'principiantes'],
        createdAt: new Date().toISOString()
      }
    ];
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
}
