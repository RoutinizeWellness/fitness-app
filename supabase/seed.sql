-- Datos de prueba para Routinize Wellness

-- Insertar usuarios de prueba (esto se haría a través de la API de autenticación de Supabase)
-- Pero aquí definimos los IDs que usaremos para los datos de prueba

-- Usuarios de prueba:
-- 1. Admin: admin@routinize.com (ID: '11111111-1111-1111-1111-111111111111')
-- 2. Usuario regular: usuario1@routinize.com (ID: '22222222-2222-2222-2222-222222222222')
-- 3. Usuario regular: usuario2@routinize.com (ID: '33333333-3333-3333-3333-333333333333')
-- 4. Usuario regular: usuario3@routinize.com (ID: '44444444-4444-4444-4444-444444444444')
-- 5. Usuario regular: usuario4@routinize.com (ID: '55555555-5555-5555-5555-555555555555')

-- Insertar perfiles
INSERT INTO profiles (id, user_id, full_name, avatar_url, weight, height, goal, level, is_admin)
VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Administrador', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 75, 180, 'maintain', 'advanced', TRUE),
  ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'María García', 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria', 65, 165, 'lose_weight', 'intermediate', FALSE),
  ('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Carlos Rodríguez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos', 80, 178, 'build_muscle', 'advanced', FALSE),
  ('a4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Laura Martínez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=laura', 58, 160, 'improve_fitness', 'beginner', FALSE),
  ('a5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Javier López', 'https://api.dicebear.com/7.x/avataaars/svg?seed=javier', 85, 182, 'build_muscle', 'intermediate', FALSE);

-- Insertar entrenamientos
INSERT INTO workouts (user_id, date, type, name, sets, reps, weight, duration, notes)
VALUES
  -- María García
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE, 'Fuerza', 'Entrenamiento de piernas', '4', '12', '40', NULL, 'Buena sesión, aumenté el peso en sentadillas'),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - 2, 'Cardio', 'Carrera', NULL, NULL, NULL, '30 minutos', 'Ritmo moderado, 5km'),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - 4, 'Fuerza', 'Pecho y tríceps', '3', '10', '15', NULL, 'Press de banca y fondos'),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - 7, 'Flexibilidad', 'Yoga', NULL, NULL, NULL, '45 minutos', 'Clase de yoga flow'),
  
  -- Carlos Rodríguez
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE, 'Fuerza', 'Espalda y bíceps', '5', '8', '70', NULL, 'Dominadas y curl de bíceps'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE - 1, 'Fuerza', 'Piernas', '4', '10', '100', NULL, 'Sentadillas y peso muerto'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE - 3, 'Cardio', 'HIIT', NULL, NULL, NULL, '20 minutos', 'Intervalos de alta intensidad'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE - 5, 'Fuerza', 'Hombros', '4', '12', '20', NULL, 'Press militar y elevaciones laterales'),
  
  -- Laura Martínez
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE - 1, 'Cardio', 'Bicicleta', NULL, NULL, NULL, '45 minutos', 'Ruta por el parque'),
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE - 3, 'Fuerza', 'Cuerpo completo', '3', '15', '10', NULL, 'Circuito de fuerza'),
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE - 6, 'Mindfulness', 'Meditación', NULL, NULL, NULL, '15 minutos', 'Meditación guiada'),
  
  -- Javier López
  ('55555555-5555-5555-5555-555555555555', CURRENT_DATE, 'Fuerza', 'Pecho', '5', '5', '90', NULL, 'Press de banca pesado'),
  ('55555555-5555-5555-5555-555555555555', CURRENT_DATE - 2, 'Fuerza', 'Espalda', '5', '5', '100', NULL, 'Peso muerto y remo'),
  ('55555555-5555-5555-5555-555555555555', CURRENT_DATE - 4, 'Cardio', 'Sprints', NULL, NULL, NULL, '15 minutos', 'Intervalos de sprint');

-- Insertar estados de ánimo
INSERT INTO moods (user_id, date, mood_level, stress_level, sleep_hours, notes)
VALUES
  -- María García
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE, 4, 2, 7.5, 'Me siento bien hoy, descansada'),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - 1, 3, 3, 6.5, 'Día normal, un poco de estrés en el trabajo'),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - 2, 5, 1, 8, 'Excelente día, muy productivo'),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - 3, 4, 2, 7, 'Buen día en general'),
  
  -- Carlos Rodríguez
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE, 5, 1, 8, 'Gran día, entrenamiento intenso'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE - 1, 4, 2, 7.5, 'Buen descanso, listo para entrenar'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE - 2, 3, 4, 6, 'Algo estresado por el trabajo'),
  
  -- Laura Martínez
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE, 3, 3, 7, 'Día normal'),
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE - 1, 2, 4, 6, 'Cansada, no dormí bien'),
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE - 2, 4, 2, 8, 'Descansada y motivada'),
  
  -- Javier López
  ('55555555-5555-5555-5555-555555555555', CURRENT_DATE, 4, 2, 7, 'Buen día de entrenamiento'),
  ('55555555-5555-5555-5555-555555555555', CURRENT_DATE - 1, 3, 3, 6.5, 'Algo cansado');

-- Insertar planes semanales
INSERT INTO plans (user_id, day, activities)
VALUES
  -- María García
  ('22222222-2222-2222-2222-222222222222', 'lunes', '[{"tipo": "fuerza", "descripcion": "Entrenamiento de piernas", "icono": "dumbbell"}, {"tipo": "mindfulness", "descripcion": "Meditación - 10 minutos", "icono": "brain"}]'),
  ('22222222-2222-2222-2222-222222222222', 'martes', '[{"tipo": "cardio", "descripcion": "Carrera - 30 minutos", "icono": "flame"}]'),
  ('22222222-2222-2222-2222-222222222222', 'miercoles', '[{"tipo": "descanso", "descripcion": "Descanso activo", "icono": "heart"}]'),
  ('22222222-2222-2222-2222-222222222222', 'jueves', '[{"tipo": "fuerza", "descripcion": "Pecho y tríceps", "icono": "dumbbell"}]'),
  ('22222222-2222-2222-2222-222222222222', 'viernes', '[{"tipo": "cardio", "descripcion": "HIIT - 20 minutos", "icono": "flame"}]'),
  ('22222222-2222-2222-2222-222222222222', 'sabado', '[{"tipo": "flexibilidad", "descripcion": "Yoga - 45 minutos", "icono": "yoga"}]'),
  ('22222222-2222-2222-2222-222222222222', 'domingo', '[{"tipo": "descanso", "descripcion": "Descanso completo", "icono": "heart"}]'),
  
  -- Carlos Rodríguez
  ('33333333-3333-3333-3333-333333333333', 'lunes', '[{"tipo": "fuerza", "descripcion": "Pecho", "icono": "dumbbell"}]'),
  ('33333333-3333-3333-3333-333333333333', 'martes', '[{"tipo": "fuerza", "descripcion": "Espalda", "icono": "dumbbell"}]'),
  ('33333333-3333-3333-3333-333333333333', 'miercoles', '[{"tipo": "fuerza", "descripcion": "Piernas", "icono": "dumbbell"}]'),
  ('33333333-3333-3333-3333-333333333333', 'jueves', '[{"tipo": "fuerza", "descripcion": "Hombros", "icono": "dumbbell"}]'),
  ('33333333-3333-3333-3333-333333333333', 'viernes', '[{"tipo": "fuerza", "descripcion": "Brazos", "icono": "dumbbell"}]'),
  ('33333333-3333-3333-3333-333333333333', 'sabado', '[{"tipo": "cardio", "descripcion": "HIIT - 20 minutos", "icono": "flame"}]'),
  ('33333333-3333-3333-3333-333333333333', 'domingo', '[{"tipo": "descanso", "descripcion": "Descanso completo", "icono": "heart"}]');

-- Insertar entradas de nutrición
INSERT INTO nutrition (user_id, date, meal_type, food_name, calories, protein, carbs, fat, notes)
VALUES
  -- María García
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE, 'desayuno', 'Avena con plátano y miel', 350, 10, 65, 5, 'Desayuno energético'),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE, 'almuerzo', 'Ensalada de pollo', 450, 35, 20, 25, 'Con aguacate y aderezo ligero'),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE, 'cena', 'Salmón con verduras', 380, 30, 15, 20, 'Al horno con brócoli y zanahoria'),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - 1, 'desayuno', 'Tostadas con aguacate', 300, 8, 30, 18, 'Con huevo revuelto'),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - 1, 'almuerzo', 'Bowl de quinoa', 420, 15, 60, 12, 'Con verduras y tofu'),
  
  -- Carlos Rodríguez
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE, 'desayuno', 'Batido de proteínas', 400, 40, 30, 10, 'Con plátano y mantequilla de maní'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE, 'almuerzo', 'Pollo a la parrilla con arroz', 650, 50, 70, 15, 'Con brócoli'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE, 'cena', 'Tortilla de claras', 300, 35, 5, 15, 'Con espinacas y queso bajo en grasa'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE, 'snack', 'Yogur griego con nueces', 250, 20, 10, 15, 'Con miel'),
  
  -- Laura Martínez
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE, 'desayuno', 'Smoothie verde', 200, 5, 30, 5, 'Con espinacas, manzana y jengibre'),
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE, 'almuerzo', 'Ensalada mediterránea', 350, 12, 40, 15, 'Con garbanzos y aceite de oliva');

-- Insertar ejercicios
INSERT INTO exercises (name, muscle_group, difficulty, equipment, description, instructions, image_url)
VALUES
  ('Press de Banca', 'Pecho', 'Intermedio', 'Barra y banco', 'Ejercicio compuesto para desarrollar el pecho, hombros y tríceps', '[
    "Acuéstate en un banco plano con los pies apoyados en el suelo",
    "Agarra la barra con las manos un poco más separadas que el ancho de los hombros",
    "Baja la barra hasta que toque ligeramente tu pecho",
    "Empuja la barra hacia arriba hasta extender completamente los brazos",
    "Repite el movimiento manteniendo el control en todo momento"
  ]', 'https://api.dicebear.com/7.x/shapes/svg?seed=press'),
  
  ('Sentadillas', 'Piernas', 'Intermedio', 'Barra o peso corporal', 'Ejercicio compuesto para desarrollar piernas y glúteos', '[
    "Coloca la barra sobre los trapecios (no sobre el cuello)",
    "Separa los pies al ancho de los hombros con las puntas ligeramente hacia afuera",
    "Baja flexionando las rodillas y las caderas, manteniendo la espalda recta",
    "Baja hasta que los muslos estén paralelos al suelo o más abajo si tu movilidad lo permite",
    "Sube empujando a través de los talones hasta la posición inicial"
  ]', 'https://api.dicebear.com/7.x/shapes/svg?seed=squat'),
  
  ('Dominadas', 'Espalda', 'Avanzado', 'Barra de dominadas', 'Ejercicio para desarrollar la espalda y los bíceps', '[
    "Agarra la barra con las palmas hacia adelante y las manos separadas al ancho de los hombros",
    "Cuelga completamente con los brazos extendidos",
    "Tira de tu cuerpo hacia arriba hasta que tu barbilla supere la barra",
    "Baja con control hasta la posición inicial",
    "Repite manteniendo la tensión en la espalda"
  ]', 'https://api.dicebear.com/7.x/shapes/svg?seed=pullup'),
  
  ('Plancha', 'Abdominales', 'Principiante', 'Ninguno', 'Ejercicio isométrico para fortalecer el core', '[
    "Apóyate sobre los antebrazos y las puntas de los pies",
    "Mantén el cuerpo en línea recta desde la cabeza hasta los talones",
    "Contrae el abdomen y los glúteos",
    "Mantén la posición durante el tiempo objetivo",
    "Respira normalmente durante el ejercicio"
  ]', 'https://api.dicebear.com/7.x/shapes/svg?seed=plank'),
  
  ('Peso Muerto', 'Espalda', 'Avanzado', 'Barra', 'Ejercicio compuesto para desarrollar espalda baja, glúteos y piernas', '[
    "Colócate de pie con los pies separados al ancho de las caderas",
    "Flexiona las caderas y las rodillas para agarrar la barra con las manos separadas al ancho de los hombros",
    "Mantén la espalda recta y el pecho hacia arriba",
    "Levanta la barra extendiendo las caderas y las rodillas",
    "Baja la barra con control manteniendo la espalda recta"
  ]', 'https://api.dicebear.com/7.x/shapes/svg?seed=deadlift'),
  
  ('Press Militar', 'Hombros', 'Intermedio', 'Barra o mancuernas', 'Ejercicio para desarrollar los hombros', '[
    "Siéntate o ponte de pie con la espalda recta",
    "Sostén la barra a la altura de los hombros con las manos separadas al ancho de los hombros",
    "Empuja la barra hacia arriba hasta extender completamente los brazos",
    "Baja la barra con control hasta la posición inicial",
    "Mantén el core contraído durante todo el movimiento"
  ]', 'https://api.dicebear.com/7.x/shapes/svg?seed=military'),
  
  ('Zancadas', 'Piernas', 'Intermedio', 'Peso corporal o mancuernas', 'Ejercicio para desarrollar piernas y glúteos con énfasis unilateral', '[
    "Ponte de pie con los pies juntos",
    "Da un paso hacia adelante con una pierna",
    "Baja el cuerpo hasta que ambas rodillas formen un ángulo de 90 grados",
    "Empuja con el talón delantero para volver a la posición inicial",
    "Alterna las piernas o completa todas las repeticiones con una pierna antes de cambiar"
  ]', 'https://api.dicebear.com/7.x/shapes/svg?seed=lunge'),
  
  ('Curl de Bíceps', 'Bíceps', 'Principiante', 'Mancuernas o barra', 'Ejercicio de aislamiento para desarrollar los bíceps', '[
    "Ponte de pie con los brazos extendidos y las mancuernas en las manos",
    "Mantén los codos cerca del cuerpo",
    "Flexiona los codos para levantar las mancuernas hacia los hombros",
    "Aprieta los bíceps en la parte superior del movimiento",
    "Baja las mancuernas con control hasta la posición inicial"
  ]', 'https://api.dicebear.com/7.x/shapes/svg?seed=curl'),
  
  ('Extensiones de Tríceps', 'Tríceps', 'Principiante', 'Mancuerna o polea', 'Ejercicio para desarrollar los tríceps', '[
    "Siéntate en un banco con una mancuerna sostenida con ambas manos",
    "Levanta la mancuerna sobre tu cabeza con los brazos extendidos",
    "Baja la mancuerna detrás de tu cabeza flexionando los codos",
    "Extiende los codos para levantar la mancuerna de nuevo",
    "Mantén los codos cerca de la cabeza durante todo el movimiento"
  ]', 'https://api.dicebear.com/7.x/shapes/svg?seed=triceps'),
  
  ('Remo con Barra', 'Espalda', 'Intermedio', 'Barra', 'Ejercicio para desarrollar la espalda media', '[
    "Inclínate hacia adelante con las rodillas ligeramente flexionadas",
    "Agarra la b  '[
    "Inclínate hacia adelante con las rodillas ligeramente flexionadas",
    "Agarra la barra con las manos separadas al ancho de los hombros",
    "Tira de la barra hacia tu abdomen inferior, manteniendo los codos cerca del cuerpo",
    "Aprieta los omóplatos juntos en la parte superior del movimiento",
    "Baja la barra con control hasta la posición inicial"
  ]', 'https://api.dicebear.com/7.x/shapes/svg?seed=row'),
  
  ('Elevaciones Laterales', 'Hombros', 'Principiante', 'Mancuernas', 'Ejercicio para desarrollar los deltoides laterales', '[
    "Ponte de pie con una mancuerna en cada mano a los lados del cuerpo",
    "Mantén una ligera flexión en los codos",
    "Levanta las mancuernas hacia los lados hasta que los brazos estén paralelos al suelo",
    "Mantén brevemente la posición en la parte superior",
    "Baja las mancuernas con control hasta la posición inicial"
  ]', 'https://api.dicebear.com/7.x/shapes/svg?seed=lateral');

-- Insertar rutinas de entrenamiento
INSERT INTO workout_routines (user_id, name, description, level, is_template, exercises)
VALUES
  (NULL, 'Rutina para Principiantes', 'Rutina de cuerpo completo ideal para principiantes', 'beginner', TRUE, '[
    {"exercise_id": "Sentadillas", "sets": 3, "reps": "12-15", "rest": 60},
    {"exercise_id": "Press de Banca", "sets": 3, "reps": "12-15", "rest": 60},
    {"exercise_id": "Remo con Barra", "sets": 3, "reps": "12-15", "rest": 60},
    {"exercise_id": "Elevaciones Laterales", "sets": 3, "reps": "12-15", "rest": 60},
    {"exercise_id": "Curl de Bíceps", "sets": 3, "reps": "12-15", "rest": 60},
    {"exercise_id": "Plancha", "sets": 3, "reps": "30s", "rest": 60}
  ]'),
  
  (NULL, 'Rutina de Fuerza', 'Rutina enfocada en ganar fuerza y masa muscular', 'intermediate', TRUE, '[
    {"exercise_id": "Sentadillas", "sets": 5, "reps": "5", "rest": 180},
    {"exercise_id": "Press de Banca", "sets": 5, "reps": "5", "rest": 180},
    {"exercise_id": "Peso Muerto", "sets": 5, "reps": "5", "rest": 180},
    {"exercise_id": "Press Militar", "sets": 5, "reps": "5", "rest": 180},
    {"exercise_id": "Dominadas", "sets": 5, "reps": "5", "rest": 180}
  ]'),
  
  (NULL, 'Rutina de Hipertrofia', 'Rutina diseñada para maximizar el crecimiento muscular', 'advanced', TRUE, '[
    {"exercise_id": "Sentadillas", "sets": 4, "reps": "8-12", "rest": 90},
    {"exercise_id": "Zancadas", "sets": 3, "reps": "10-12", "rest": 60},
    {"exercise_id": "Press de Banca", "sets": 4, "reps": "8-12", "rest": 90},
    {"exercise_id": "Remo con Barra", "sets": 4, "reps": "8-12", "rest": 90},
    {"exercise_id": "Press Militar", "sets": 3, "reps": "10-12", "rest": 60},
    {"exercise_id": "Elevaciones Laterales", "sets": 3, "reps": "12-15", "rest": 60},
    {"exercise_id": "Curl de Bíceps", "sets": 3, "reps": "10-12", "rest": 60},
    {"exercise_id": "Extensiones de Tríceps", "sets": 3, "reps": "10-12", "rest": 60}
  ]'),
  
  ('33333333-3333-3333-3333-333333333333', 'Mi Rutina de Pecho', 'Rutina personalizada para día de pecho', 'advanced', FALSE, '[
    {"exercise_id": "Press de Banca", "sets": 5, "reps": "5", "rest": 180},
    {"exercise_id": "Press de Banca Inclinado", "sets": 4, "reps": "8", "rest": 120},
    {"exercise_id": "Aperturas con Mancuernas", "sets": 3, "reps": "12", "rest": 90},
    {"exercise_id": "Fondos en Paralelas", "sets": 3, "reps": "10", "rest": 90},
    {"exercise_id": "Extensiones de Tríceps", "sets": 3, "reps": "12", "rest": 60}
  ]');

-- Insertar actividades de la comunidad
INSERT INTO community_activities (user_id, type, content, likes, comments)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'post', '¡Acabo de completar mi primer mes de entrenamiento holístico! La combinación de ejercicio físico y prácticas de mindfulness ha mejorado mucho mi bienestar general.', 24, '[
    {"user_id": "33333333-3333-3333-3333-333333333333", "content": "¡Felicidades! Sigue así", "created_at": "2023-05-15T10:30:00Z"},
    {"user_id": "44444444-4444-4444-4444-444444444444", "content": "Inspirador, yo también estoy empezando", "created_at": "2023-05-15T11:45:00Z"}
  ]'),
  
  ('33333333-3333-3333-3333-333333333333', 'post', 'Hoy probé una nueva rutina de yoga que me ayudó mucho con el estrés. ¿Alguien más practica yoga como parte de su entrenamiento holístico?', 18, '[
    {"user_id": "44444444-4444-4444-4444-444444444444", "content": "¡Yo! Es excelente para la recuperación", "created_at": "2023-05-16T09:20:00Z"},
    {"user_id": "22222222-2222-2222-2222-222222222222", "content": "¿Qué rutina probaste? Me interesa", "created_at": "2023-05-16T10:15:00Z"},
    {"user_id": "33333333-3333-3333-3333-333333333333", "content": "Una rutina de yoga flow, te la puedo compartir", "created_at": "2023-05-16T11:30:00Z"}
  ]'),
  
  ('44444444-4444-4444-4444-444444444444', 'post', 'Compartiendo mi progreso: He reducido mi nivel de estrés de 4/5 a 2/5 en solo dos semanas combinando meditación diaria y entrenamiento de fuerza 3 veces por semana.', 32, '[
    {"user_id": "55555555-5555-5555-5555-555555555555", "content": "Impresionante progreso", "created_at": "2023-05-17T14:10:00Z"},
    {"user_id": "22222222-2222-2222-2222-222222222222", "content": "¿Qué tipo de meditación practicas?", "created_at": "2023-05-17T15:25:00Z"}
  ]'),
  
  ('55555555-5555-5555-5555-555555555555', 'post', 'Nuevo PR en peso muerto: 150kg x 5 reps. El trabajo duro da sus frutos.', 45, '[
    {"user_id": "33333333-3333-3333-3333-333333333333", "content": "¡Bestia! Felicidades", "created_at": "2023-05-18T08:45:00Z"},
    {"user_id": "44444444-4444-4444-4444-444444444444", "content": "Impresionante fuerza", "created_at": "2023-05-18T09:30:00Z"}
  ]');

-- Insertar medidas corporales
INSERT INTO body_measurements (user_id, date, weight, body_fat, chest, waist, hips, arms, thighs)
VALUES
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - 30, 67, 24, 90, 70, 95, 28, 55),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - 15, 66, 23.5, 90, 69, 94, 28.5, 55),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE, 65, 23, 89, 68, 93, 29, 54),
  
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE - 30, 78, 15, 105, 80, 95, 38, 60),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE - 15, 79, 14.5, 106, 79, 95, 38.5, 61),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE, 80, 14, 107, 78, 96, 39, 62),
  
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE - 30, 59, 26, 85, 68, 92, 26, 52),
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE - 15, 58.5, 25.5, 85, 67, 91, 26, 52),
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE, 58, 25, 85, 66, 90, 26.5, 51);

-- Insertar objetivos
INSERT INTO goals (user_id, title, description, category, target_value, current_value, deadline, completed)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Perder 5kg', 'Reducir mi peso corporal en 5kg', 'weight', 60, 65, CURRENT_DATE + 60, FALSE),
  ('22222222-2222-2222-2222-222222222222', 'Correr 5km', 'Completar una carrera de 5km', 'cardio', 5, 3, CURRENT_DATE + 30, FALSE),
  ('22222222-2222-2222-2222-222222222222', 'Meditar diariamente', 'Establecer un hábito de meditación diaria', 'mindfulness', 30, 10, CURRENT_DATE + 20, FALSE),
  
  ('33333333-3333-3333-3333-333333333333', 'Aumentar press de banca', 'Llegar a 100kg en press de banca', 'strength', 100, 90, CURRENT_DATE + 90, FALSE),
  ('33333333-3333-3333-3333-333333333333', 'Reducir grasa corporal', 'Bajar al 12% de grasa corporal', 'body_composition', 12, 14, CURRENT_DATE + 60, FALSE),
  
  ('44444444-4444-4444-4444-444444444444', 'Flexibilidad', 'Poder tocar los dedos de los pies sin doblar las rodillas', 'flexibility', 100, 80, CURRENT_DATE + 45, FALSE),
  ('44444444-4444-4444-4444-444444444444', 'Reducir estrés', 'Mantener nivel de estrés por debajo de 3/5', 'wellness', 3, 4, CURRENT_DATE + 30, FALSE);
