import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Ejecuta migraciones de Supabase
 * @param migrationFiles Lista de archivos de migración a ejecutar
 * @returns Resultado de la operación
 */
export async function runMigrations(
  migrationFiles: string[]
): Promise<{ success: boolean; error: PostgrestError | Error | null }> {
  try {
    // Verificar si la función RPC existe
    const { error: rpcCheckError } = await supabase.rpc('check_rpc_exists', {
      function_name: 'run_migrations'
    });

    if (rpcCheckError) {
      console.error('La función RPC run_migrations no existe:', rpcCheckError);
      
      // Intentar crear las tablas directamente
      return await createTablesDirectly(migrationFiles);
    }

    // Ejecutar migraciones a través de RPC
    const { error } = await supabase.rpc('run_migrations', {
      migration_files: migrationFiles
    });

    if (error) {
      console.error('Error al ejecutar migraciones:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (e) {
    console.error('Error al ejecutar migraciones:', e);
    return { 
      success: false, 
      error: e instanceof PostgrestError ? e : new Error('Error desconocido al ejecutar migraciones') 
    };
  }
}

/**
 * Crea las tablas directamente si la función RPC no está disponible
 */
async function createTablesDirectly(
  migrationFiles: string[]
): Promise<{ success: boolean; error: PostgrestError | Error | null }> {
  try {
    // Crear tabla user_patterns
    const { error: patternsError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS user_patterns (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users NOT NULL,
          pattern_type TEXT NOT NULL,
          pattern_data JSONB NOT NULL,
          confidence NUMERIC NOT NULL DEFAULT 0,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_patterns_user_id ON user_patterns(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_patterns_type ON user_patterns(pattern_type);
      `
    });

    if (patternsError) {
      console.error('Error al crear tabla user_patterns:', patternsError);
      return { success: false, error: patternsError };
    }

    // Crear tabla user_preferences
    const { error: preferencesError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS user_preferences (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users NOT NULL,
          preference_type TEXT NOT NULL,
          preference_value TEXT NOT NULL,
          strength NUMERIC NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_preferences_type ON user_preferences(preference_type);
      `
    });

    if (preferencesError) {
      console.error('Error al crear tabla user_preferences:', preferencesError);
      return { success: false, error: preferencesError };
    }

    // Crear tabla recommendation_feedback
    const { error: feedbackError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS recommendation_feedback (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users NOT NULL,
          recommendation_id UUID NOT NULL,
          recommendation_type TEXT NOT NULL,
          rating INTEGER NOT NULL,
          feedback_text TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user_id ON recommendation_feedback(user_id);
        CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_recommendation_id ON recommendation_feedback(recommendation_id);
      `
    });

    if (feedbackError) {
      console.error('Error al crear tabla recommendation_feedback:', feedbackError);
      return { success: false, error: feedbackError };
    }

    // Crear tabla smart_recommendations
    const { error: recommendationsError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS smart_recommendations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          recommendation_type TEXT NOT NULL,
          recommendation_data JSONB NOT NULL,
          confidence NUMERIC NOT NULL DEFAULT 0,
          reasoning TEXT NOT NULL,
          patterns_used JSONB,
          is_active BOOLEAN DEFAULT TRUE,
          feedback_count INTEGER DEFAULT 0,
          positive_feedback_ratio NUMERIC DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_smart_recommendations_user_id ON smart_recommendations(user_id);
        CREATE INDEX IF NOT EXISTS idx_smart_recommendations_type ON smart_recommendations(recommendation_type);
      `
    });

    if (recommendationsError) {
      console.error('Error al crear tabla smart_recommendations:', recommendationsError);
      return { success: false, error: recommendationsError };
    }

    // Crear tablas adicionales si se solicitan
    if (migrationFiles.includes('20240702000000_advanced_learning_features.sql')) {
      // Crear tabla intensity_responses
      const { error: intensityError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS intensity_responses (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users NOT NULL,
            workout_id UUID,
            intensity_level TEXT NOT NULL,
            performance_score INTEGER NOT NULL,
            recovery_time INTEGER,
            mood_impact INTEGER,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_intensity_responses_user_id ON intensity_responses(user_id);
        `
      });

      if (intensityError) {
        console.error('Error al crear tabla intensity_responses:', intensityError);
        return { success: false, error: intensityError };
      }

      // Crear tabla progression_patterns
      const { error: progressionError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS progression_patterns (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users NOT NULL,
            exercise_id TEXT,
            exercise_name TEXT,
            muscle_group TEXT,
            progression_rate NUMERIC,
            weeks_of_data INTEGER NOT NULL,
            is_progressing BOOLEAN DEFAULT FALSE,
            is_stagnant BOOLEAN DEFAULT FALSE,
            is_regressing BOOLEAN DEFAULT FALSE,
            last_progression_date DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_progression_patterns_user_id ON progression_patterns(user_id);
        `
      });

      if (progressionError) {
        console.error('Error al crear tabla progression_patterns:', progressionError);
        return { success: false, error: progressionError };
      }

      // Crear tabla mood_correlations
      const { error: moodError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS mood_correlations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users NOT NULL,
            workout_type TEXT NOT NULL,
            mood_before NUMERIC,
            mood_after NUMERIC,
            mood_change NUMERIC,
            sample_size INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_mood_correlations_user_id ON mood_correlations(user_id);
        `
      });

      if (moodError) {
        console.error('Error al crear tabla mood_correlations:', moodError);
        return { success: false, error: moodError };
      }

      // Crear tabla user_clusters
      const { error: clustersError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS user_clusters (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            cluster_name TEXT NOT NULL,
            cluster_description TEXT,
            user_ids UUID[] NOT NULL,
            common_patterns JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      if (clustersError) {
        console.error('Error al crear tabla user_clusters:', clustersError);
        return { success: false, error: clustersError };
      }

      // Crear tabla wearable_data
      const { error: wearableError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS wearable_data (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users NOT NULL,
            date DATE NOT NULL,
            device_type TEXT NOT NULL,
            steps INTEGER,
            calories_burned INTEGER,
            active_minutes INTEGER,
            heart_rate JSONB,
            sleep JSONB,
            stress_level INTEGER,
            data_json JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_wearable_data_user_id ON wearable_data(user_id);
          CREATE INDEX IF NOT EXISTS idx_wearable_data_date ON wearable_data(date);
        `
      });

      if (wearableError) {
        console.error('Error al crear tabla wearable_data:', wearableError);
        return { success: false, error: wearableError };
      }
    }

    return { success: true, error: null };
  } catch (e) {
    console.error('Error al crear tablas directamente:', e);
    return { 
      success: false, 
      error: e instanceof PostgrestError ? e : new Error('Error desconocido al crear tablas') 
    };
  }
}
