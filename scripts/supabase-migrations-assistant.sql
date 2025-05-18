-- Migración para añadir la tabla de historial de conversación para el asistente de IA

-- Tabla para almacenar el historial de conversación
CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para el historial de conversación
CREATE POLICY "Los usuarios pueden ver su propio historial de conversación"
  ON conversation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar su propio historial de conversación"
  ON conversation_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar su propio historial de conversación"
  ON conversation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar su propio historial de conversación"
  ON conversation_history FOR DELETE
  USING (auth.uid() = user_id);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_conversation_history_updated_at
BEFORE UPDATE ON conversation_history
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id
  ON conversation_history(user_id);
