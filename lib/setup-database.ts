import { supabase } from './supabase';

// Función para crear la tabla goals si no existe
export const setupGoalsTable = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    // Verificar si la tabla goals ya existe
    const { error: checkError } = await supabase
      .from('goals')
      .select('id')
      .limit(1);

    // Si no hay error, la tabla ya existe
    if (!checkError) {
      console.log('La tabla goals ya existe');
      return { success: true };
    }

    // No podemos crear tablas desde el cliente de Supabase
    // Informar al usuario que debe crear la tabla manualmente
    console.warn('La tabla goals no existe. Debes crearla manualmente en Supabase.');

    // Mostrar instrucciones en la consola
    console.info(`
      Para crear la tabla goals, ejecuta el siguiente SQL en la consola de Supabase:

      CREATE TABLE IF NOT EXISTS public.goals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        target_value NUMERIC NOT NULL,
        current_value NUMERIC NOT NULL DEFAULT 0,
        deadline DATE,
        completed BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS goals_user_id_idx ON public.goals(user_id);

      -- Establecer políticas RLS (Row Level Security)
      ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

      -- Política para permitir a los usuarios ver solo sus propios objetivos
      CREATE POLICY "Users can view their own goals"
      ON public.goals FOR SELECT
      USING (auth.uid() = user_id);

      -- Política para permitir a los usuarios insertar sus propios objetivos
      CREATE POLICY "Users can insert their own goals"
      ON public.goals FOR INSERT
      WITH CHECK (auth.uid() = user_id);

      -- Política para permitir a los usuarios actualizar sus propios objetivos
      CREATE POLICY "Users can update their own goals"
      ON public.goals FOR UPDATE
      USING (auth.uid() = user_id);

      -- Política para permitir a los usuarios eliminar sus propios objetivos
      CREATE POLICY "Users can delete their own goals"
      ON public.goals FOR DELETE
      USING (auth.uid() = user_id);
    `);

    // Devolver error indicando que la tabla no existe
    return {
      success: false,
      error: new Error('La tabla goals no existe. Debes crearla manualmente en Supabase.')
    };
  } catch (error) {
    console.error('Error al verificar la tabla goals:', error);
    return { success: false, error };
  }
};

// Función para inicializar todas las tablas necesarias
export const setupDatabase = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    // Configurar tabla goals
    const { success: goalsSuccess, error: goalsError } = await setupGoalsTable();

    if (!goalsSuccess) {
      console.error('Error al configurar la tabla goals:', goalsError);
      return { success: false, error: goalsError };
    }

    // Aquí puedes añadir más configuraciones de tablas si es necesario

    return { success: true };
  } catch (error) {
    console.error('Error al configurar la base de datos:', error);
    return { success: false, error };
  }
};
