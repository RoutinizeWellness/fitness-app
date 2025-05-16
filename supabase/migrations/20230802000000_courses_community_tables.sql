-- Crear tablas para cursos
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration TEXT,
  author_id UUID REFERENCES auth.users(id),
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT false,
  enrollments_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  lessons_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  duration TEXT,
  order_number INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  is_completed BOOLEAN DEFAULT false,
  last_accessed_lesson_id UUID REFERENCES lessons(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  progress_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

-- Crear tablas para comunidad
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT one_target_only CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE (user_id, post_id) NULLS NOT DISTINCT,
  UNIQUE (user_id, comment_id) NULLS NOT DISTINCT
);

CREATE TABLE IF NOT EXISTS community_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES community_tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (post_id, tag_id)
);

-- Crear funciones para incrementar/decrementar contadores
CREATE OR REPLACE FUNCTION increment(row_count integer)
RETURNS integer AS $$
BEGIN
  RETURN row_count + 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement(row_count integer)
RETURNS integer AS $$
BEGIN
  RETURN GREATEST(0, row_count - 1);
END;
$$ LANGUAGE plpgsql;

-- Crear políticas RLS para cursos
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver cursos publicados"
  ON courses FOR SELECT
  USING (is_published = true);

CREATE POLICY "Autores pueden ver sus propios cursos"
  ON courses FOR SELECT
  USING (auth.uid() = author_id);

-- Crear políticas RLS para lecciones
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver lecciones publicadas"
  ON lessons FOR SELECT
  USING (is_published = true);

-- Crear políticas RLS para progreso de cursos
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver su propio progreso de cursos"
  ON user_course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear su propio progreso de cursos"
  ON user_course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar su propio progreso de cursos"
  ON user_course_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Crear políticas RLS para progreso de lecciones
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver su propio progreso de lecciones"
  ON user_lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear su propio progreso de lecciones"
  ON user_lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar su propio progreso de lecciones"
  ON user_lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Crear políticas RLS para reseñas de cursos
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver reseñas de cursos"
  ON course_reviews FOR SELECT
  USING (true);

CREATE POLICY "Usuarios pueden crear sus propias reseñas"
  ON course_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propias reseñas"
  ON course_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Crear políticas RLS para posts de comunidad
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver posts de comunidad"
  ON community_posts FOR SELECT
  USING (true);

CREATE POLICY "Usuarios pueden crear sus propios posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios posts"
  ON community_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propios posts"
  ON community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Crear políticas RLS para comentarios de comunidad
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver comentarios de comunidad"
  ON community_comments FOR SELECT
  USING (true);

CREATE POLICY "Usuarios pueden crear sus propios comentarios"
  ON community_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios comentarios"
  ON community_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propios comentarios"
  ON community_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Crear políticas RLS para likes de comunidad
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver likes de comunidad"
  ON community_likes FOR SELECT
  USING (true);

CREATE POLICY "Usuarios pueden crear sus propios likes"
  ON community_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propios likes"
  ON community_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_course_progress_updated_at
BEFORE UPDATE ON user_course_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_lesson_progress_updated_at
BEFORE UPDATE ON user_lesson_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_reviews_updated_at
BEFORE UPDATE ON course_reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON community_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at
BEFORE UPDATE ON community_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
