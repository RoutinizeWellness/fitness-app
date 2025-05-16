-- Crear tabla de objetivos (goals)
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('weight', 'strength', 'cardio', 'nutrition', 'habit', 'custom')),
    target_value NUMERIC NOT NULL,
    current_value NUMERIC NOT NULL DEFAULT 0,
    deadline DATE,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas por usuario
CREATE INDEX IF NOT EXISTS goals_user_id_idx ON public.goals(user_id);

-- Crear índice para búsquedas por categoría
CREATE INDEX IF NOT EXISTS goals_category_idx ON public.goals(category);

-- Crear índice para búsquedas por estado de completado
CREATE INDEX IF NOT EXISTS goals_completed_idx ON public.goals(completed);

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

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el timestamp de updated_at
CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos objetivos de ejemplo (opcional)
-- INSERT INTO public.goals (user_id, title, description, category, target_value, current_value, completed)
-- VALUES 
--   ('REEMPLAZAR_CON_ID_USUARIO', 'Perder 5kg', 'Reducir peso corporal de forma saludable', 'weight', 70, 75, false),
--   ('REEMPLAZAR_CON_ID_USUARIO', 'Correr 10km', 'Preparación para carrera', 'cardio', 10, 5, false),
--   ('REEMPLAZAR_CON_ID_USUARIO', 'Hacer 20 entrenamientos', 'Mantener consistencia', 'habit', 20, 8, false);
