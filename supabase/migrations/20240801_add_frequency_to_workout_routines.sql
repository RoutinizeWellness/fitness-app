-- Añadir columna frequency a la tabla workout_routines si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'workout_routines'
        AND column_name = 'frequency'
    ) THEN
        ALTER TABLE workout_routines ADD COLUMN frequency TEXT;
    END IF;
END
$$;

-- Actualizar registros existentes con un valor predeterminado
UPDATE workout_routines
SET frequency = '3-4 días por semana'
WHERE frequency IS NULL;

-- Añadir otras columnas que podrían faltar según los errores reportados
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'workout_routines'
        AND column_name = 'goal'
    ) THEN
        ALTER TABLE workout_routines ADD COLUMN goal TEXT DEFAULT 'general_fitness';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'workout_routines'
        AND column_name = 'days'
    ) THEN
        ALTER TABLE workout_routines ADD COLUMN days JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'workout_routines'
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE workout_routines ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'workout_routines'
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE workout_routines ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END
$$;
