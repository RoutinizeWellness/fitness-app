-- Migration to add courses and lessons tables

-- Tabla para cursos
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration TEXT, -- Formato: "2h 41m"
  lessons_count INTEGER DEFAULT 0,
  difficulty TEXT, -- 'beginner', 'intermediate', 'advanced'
  category TEXT, -- 'habit', 'fitness', 'nutrition', etc.
  author_id UUID REFERENCES auth.users,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para lecciones
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  duration TEXT, -- Formato: "2:16" (minutos:segundos)
  order_number INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para progreso de usuarios en cursos
CREATE TABLE IF NOT EXISTS user_course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses ON DELETE CASCADE NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  last_accessed_lesson_id UUID REFERENCES lessons,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- Tabla para progreso de usuarios en lecciones
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons ON DELETE CASCADE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  progress_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, lesson_id)
);

-- Tabla para comentarios en cursos
CREATE TABLE IF NOT EXISTS course_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER, -- 1-5
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_comments_course_id ON course_comments(course_id);

-- Función para actualizar el contador de lecciones en cursos
CREATE OR REPLACE FUNCTION update_course_lessons_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE courses SET lessons_count = lessons_count + 1 WHERE id = NEW.course_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE courses SET lessons_count = lessons_count - 1 WHERE id = OLD.course_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el contador de lecciones
CREATE TRIGGER update_course_lessons_count_trigger
AFTER INSERT OR DELETE ON lessons
FOR EACH ROW
EXECUTE FUNCTION update_course_lessons_count();

-- Función para actualizar el progreso del curso cuando se completa una lección
CREATE OR REPLACE FUNCTION update_course_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  progress INTEGER;
BEGIN
  -- Obtener el total de lecciones del curso
  SELECT COUNT(*) INTO total_lessons FROM lessons WHERE course_id = (SELECT course_id FROM lessons WHERE id = NEW.lesson_id);
  
  -- Obtener el número de lecciones completadas por el usuario
  SELECT COUNT(*) INTO completed_lessons FROM user_lesson_progress 
  WHERE user_id = NEW.user_id 
  AND is_completed = TRUE
  AND lesson_id IN (SELECT id FROM lessons WHERE course_id = (SELECT course_id FROM lessons WHERE id = NEW.lesson_id));
  
  -- Calcular el porcentaje de progreso
  IF total_lessons > 0 THEN
    progress := (completed_lessons * 100) / total_lessons;
  ELSE
    progress := 0;
  END IF;
  
  -- Actualizar el progreso del curso
  UPDATE user_course_progress 
  SET progress_percentage = progress,
      is_completed = (progress = 100),
      completed_at = CASE WHEN progress = 100 THEN NOW() ELSE completed_at END
  WHERE user_id = NEW.user_id 
  AND course_id = (SELECT course_id FROM lessons WHERE id = NEW.lesson_id);
  
  -- Si no existe un registro de progreso para este curso, crearlo
  IF NOT FOUND THEN
    INSERT INTO user_course_progress (user_id, course_id, progress_percentage, is_completed)
    VALUES (NEW.user_id, (SELECT course_id FROM lessons WHERE id = NEW.lesson_id), progress, (progress = 100));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el progreso del curso
CREATE TRIGGER update_course_progress_trigger
AFTER UPDATE OF is_completed ON user_lesson_progress
FOR EACH ROW
WHEN (NEW.is_completed = TRUE)
EXECUTE FUNCTION update_course_progress();
