# Supabase Edge Functions

Este directorio contiene las Edge Functions utilizadas en la aplicación de fitness.

## Funciones disponibles

### 1. generate-workout-plan

Genera un plan de entrenamiento personalizado basado en el perfil del usuario.

**Parámetros:**
- `userId`: ID del usuario
- `profile`: Perfil de entrenamiento del usuario

**Respuesta:**
- `plan`: Plan de entrenamiento generado

### 2. analyze-workout-video

Analiza un video de entrenamiento para proporcionar feedback sobre la postura y técnica.

**Parámetros:**
- `userId`: ID del usuario
- `videoUrl`: URL del video a analizar
- `exercise` (opcional): Tipo de ejercicio que se está realizando

**Respuesta:**
- `posture`: Evaluación general de la postura ('excellent', 'good', 'needs_improvement', 'poor')
- `issues`: Lista de problemas detectados
- `recommendations`: Lista de recomendaciones para mejorar
- `score`: Puntuación numérica (0-100)

### 3. generate-training-recommendations

Genera recomendaciones de entrenamiento basadas en datos de fatiga y progreso.

**Parámetros:**
- `userId`: ID del usuario

**Respuesta:**
- `adjustments`: Lista de ajustes recomendados para el entrenamiento
- `suggestions`: Lista de sugerencias generales

## Despliegue

Para desplegar estas funciones, utiliza el CLI de Supabase:

```bash
# Instalar CLI de Supabase
npm install -g supabase

# Iniciar sesión
supabase login

# Desplegar una función
supabase functions deploy generate-workout-plan --project-ref soviwrzrgskhvgcmujfj

# Desplegar todas las funciones
supabase functions deploy --project-ref soviwrzrgskhvgcmujfj
```

## Desarrollo local

Para probar las funciones localmente:

```bash
# Iniciar el servidor de desarrollo
supabase start

# Ejecutar una función específica
supabase functions serve generate-workout-plan --env-file ./supabase/.env.local

# Probar con curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-workout-plan' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  --header 'Content-Type: application/json' \
  --data '{"userId":"123", "profile":{"experienceLevel":"intermediate"}}'
```

## Estructura de tablas requeridas

Las funciones requieren las siguientes tablas en la base de datos:

- `workout_routines`: Almacena los planes de entrenamiento
- `user_fatigue`: Almacena datos de fatiga del usuario
- `workout_sessions`: Almacena las sesiones de entrenamiento
- `posture_analysis`: Almacena los resultados del análisis de postura
- `training_recommendations`: Almacena las recomendaciones generadas

## Notas

- Las funciones incluyen manejo de CORS para permitir solicitudes desde cualquier origen
- Se proporciona un mecanismo de respaldo para cuando las funciones fallan
- Los datos de ejemplo se utilizan cuando no hay datos reales disponibles
