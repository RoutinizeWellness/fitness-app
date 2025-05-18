-- Función para crear la tabla wellness_scores si no existe
CREATE OR REPLACE FUNCTION create_wellness_scores_if_not_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar si la tabla ya existe
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'wellness_scores'
  ) THEN
    -- Crear la tabla wellness_scores
    CREATE TABLE public.wellness_scores (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id),
      date DATE,
      mood INT,
      sleep_hours FLOAT,
      stress_level INT,
      hrv INT,
      recovery_score INT,
      recommendations TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Crear índices para mejorar el rendimiento
    CREATE INDEX wellness_scores_user_id_idx ON public.wellness_scores(user_id);
    CREATE INDEX wellness_scores_date_idx ON public.wellness_scores(date);
    
    -- Configurar políticas RLS (Row Level Security)
    ALTER TABLE public.wellness_scores ENABLE ROW LEVEL SECURITY;
    
    -- Política para permitir a los usuarios ver solo sus propios registros
    CREATE POLICY wellness_scores_select_policy ON public.wellness_scores
      FOR SELECT USING (auth.uid() = user_id);
    
    -- Política para permitir a los usuarios insertar solo sus propios registros
    CREATE POLICY wellness_scores_insert_policy ON public.wellness_scores
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Política para permitir a los usuarios actualizar solo sus propios registros
    CREATE POLICY wellness_scores_update_policy ON public.wellness_scores
      FOR UPDATE USING (auth.uid() = user_id);
    
    -- Política para permitir a los usuarios eliminar solo sus propios registros
    CREATE POLICY wellness_scores_delete_policy ON public.wellness_scores
      FOR DELETE USING (auth.uid() = user_id);
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- Función para crear la tabla emotional_journal si no existe
CREATE OR REPLACE FUNCTION create_emotional_journal_if_not_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar si la tabla ya existe
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'emotional_journal'
  ) THEN
    -- Crear la tabla emotional_journal
    CREATE TABLE public.emotional_journal (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id),
      date DATE,
      title TEXT,
      content TEXT,
      emotion TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Crear índices para mejorar el rendimiento
    CREATE INDEX emotional_journal_user_id_idx ON public.emotional_journal(user_id);
    CREATE INDEX emotional_journal_date_idx ON public.emotional_journal(date);
    
    -- Configurar políticas RLS (Row Level Security)
    ALTER TABLE public.emotional_journal ENABLE ROW LEVEL SECURITY;
    
    -- Política para permitir a los usuarios ver solo sus propios registros
    CREATE POLICY emotional_journal_select_policy ON public.emotional_journal
      FOR SELECT USING (auth.uid() = user_id);
    
    -- Política para permitir a los usuarios insertar solo sus propios registros
    CREATE POLICY emotional_journal_insert_policy ON public.emotional_journal
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Política para permitir a los usuarios actualizar solo sus propios registros
    CREATE POLICY emotional_journal_update_policy ON public.emotional_journal
      FOR UPDATE USING (auth.uid() = user_id);
    
    -- Política para permitir a los usuarios eliminar solo sus propios registros
    CREATE POLICY emotional_journal_delete_policy ON public.emotional_journal
      FOR DELETE USING (auth.uid() = user_id);
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- Función para crear la tabla recovery_sessions si no existe
CREATE OR REPLACE FUNCTION create_recovery_sessions_if_not_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar si la tabla ya existe
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'recovery_sessions'
  ) THEN
    -- Crear la tabla recovery_sessions
    CREATE TABLE public.recovery_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id),
      session_id TEXT,
      type TEXT,
      duration INT,
      completed BOOLEAN,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Crear índices para mejorar el rendimiento
    CREATE INDEX recovery_sessions_user_id_idx ON public.recovery_sessions(user_id);
    CREATE INDEX recovery_sessions_created_at_idx ON public.recovery_sessions(created_at);
    
    -- Configurar políticas RLS (Row Level Security)
    ALTER TABLE public.recovery_sessions ENABLE ROW LEVEL SECURITY;
    
    -- Política para permitir a los usuarios ver solo sus propios registros
    CREATE POLICY recovery_sessions_select_policy ON public.recovery_sessions
      FOR SELECT USING (auth.uid() = user_id);
    
    -- Política para permitir a los usuarios insertar solo sus propios registros
    CREATE POLICY recovery_sessions_insert_policy ON public.recovery_sessions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Política para permitir a los usuarios actualizar solo sus propios registros
    CREATE POLICY recovery_sessions_update_policy ON public.recovery_sessions
      FOR UPDATE USING (auth.uid() = user_id);
    
    -- Política para permitir a los usuarios eliminar solo sus propios registros
    CREATE POLICY recovery_sessions_delete_policy ON public.recovery_sessions
      FOR DELETE USING (auth.uid() = user_id);
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;
