# Implementación con la API de Supabase

Este documento explica cómo se ha implementado la funcionalidad utilizando la API de Supabase directamente, en lugar de utilizar Edge Functions.

## Tablas en Supabase

Se han creado las siguientes tablas en Supabase:

1. **workout_routines**: Almacena los planes de entrenamiento
   - `id`: UUID (clave primaria)
   - `user_id`: UUID (referencia a auth.users)
   - `name`: TEXT
   - `description`: TEXT
   - `level`: TEXT
   - `goal`: TEXT
   - `duration`: INTEGER
   - `days_per_week`: INTEGER
   - `is_active`: BOOLEAN
   - `days`: JSONB
   - `created_at`: TIMESTAMP WITH TIME ZONE
   - `is_template`: BOOLEAN

2. **workout_sessions**: Almacena las sesiones de entrenamiento
   - `id`: UUID (clave primaria)
   - `user_id`: UUID (referencia a auth.users)
   - `workout_day_id`: TEXT
   - `workout_day_name`: TEXT
   - `date`: TIMESTAMP WITH TIME ZONE
   - `duration`: INTEGER
   - `exercises`: JSONB
   - `notes`: TEXT
   - `fatigue`: INTEGER
   - `mood`: TEXT
   - `created_at`: TIMESTAMP WITH TIME ZONE

3. **posture_analysis**: Almacena los resultados del análisis de postura
   - `id`: UUID (clave primaria)
   - `user_id`: UUID (referencia a auth.users)
   - `video_url`: TEXT
   - `exercise`: TEXT
   - `posture`: TEXT
   - `issues`: JSONB
   - `recommendations`: JSONB
   - `score`: INTEGER
   - `timestamp`: TIMESTAMP WITH TIME ZONE

4. **training_recommendations**: Almacena las recomendaciones de entrenamiento
   - `id`: UUID (clave primaria)
   - `user_id`: UUID (referencia a auth.users)
   - `adjustments`: JSONB
   - `suggestions`: JSONB
   - `created_at`: TIMESTAMP WITH TIME ZONE

## Servicios implementados

Se han implementado los siguientes servicios para interactuar con la API de Supabase:

### 1. Generación de planes de entrenamiento

El servicio `generateWorkoutPlanWithEdgeFunction` en `lib/edge-functions-service.ts` utiliza la función local `generateWorkoutPlan` para generar un plan de entrenamiento personalizado y lo guarda en la tabla `workout_routines` de Supabase.

```typescript
export async function generateWorkoutPlanWithEdgeFunction(userId: string, profile: TrainingProfile) {
  try {
    // Generar el plan utilizando la función local
    const plan = await generateWorkoutPlan(userId, profile)
    
    if (!plan) {
      throw new Error('No se pudo generar el plan de entrenamiento')
    }
    
    return { data: { plan } }
  } catch (error) {
    console.error('Error al generar plan de entrenamiento:', error)
    return { error }
  }
}
```

### 2. Análisis de videos de entrenamiento

El servicio `analyzeWorkoutVideo` en `lib/edge-functions-service.ts` simula el análisis de un video de entrenamiento y guarda los resultados en la tabla `posture_analysis` de Supabase.

```typescript
export async function analyzeWorkoutVideo(userId: string, videoUrl: string, exercise?: string) {
  try {
    // Simulación de análisis de postura
    const analysisData = {
      posture: Math.random() > 0.7 ? 'excellent' : Math.random() > 0.4 ? 'good' : 'needs_improvement',
      issues: [
        'Ligera curvatura en la espalda baja',
        'Rodillas ligeramente hacia adentro'
      ],
      recommendations: [
        'Mantén la espalda recta durante todo el movimiento',
        'Alinea las rodillas con los pies'
      ],
      score: Math.floor(Math.random() * 30) + 70
    }
    
    // Guardar el análisis en Supabase
    const { error } = await supabase
      .from('posture_analysis')
      .insert([{
        user_id: userId,
        video_url: videoUrl,
        exercise: exercise || 'unknown',
        posture: analysisData.posture,
        issues: analysisData.issues,
        recommendations: analysisData.recommendations,
        score: analysisData.score
      }])
    
    return { data: analysisData }
  } catch (error) {
    console.error('Error al analizar video de entrenamiento:', error)
    return { error }
  }
}
```

### 3. Generación de recomendaciones de entrenamiento

El servicio `generateTrainingRecommendations` en `lib/edge-functions-service.ts` genera recomendaciones de entrenamiento basadas en datos de fatiga y progreso, y las guarda en la tabla `training_recommendations` de Supabase.

```typescript
export async function generateTrainingRecommendations(userId: string) {
  try {
    // Obtener datos de fatiga del usuario
    const { data: fatigueData, error: fatigueError } = await supabase
      .from('user_fatigue')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    // Obtener sesiones de entrenamiento recientes
    const { data: sessionData, error: sessionError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10)
    
    // Generar recomendaciones basadas en los datos
    const recommendations = {
      adjustments: [
        // ... ajustes recomendados
      ],
      suggestions: [
        // ... sugerencias
      ]
    }
    
    // Guardar las recomendaciones en Supabase
    const { error: saveError } = await supabase
      .from('training_recommendations')
      .insert([{
        user_id: userId,
        adjustments: recommendations.adjustments,
        suggestions: recommendations.suggestions
      }])
    
    return { data: recommendations }
  } catch (error) {
    console.error('Error al generar recomendaciones de entrenamiento:', error)
    return { error }
  }
}
```

### 4. Seguimiento de sesiones de entrenamiento

El servicio `saveWorkoutSession` en `lib/workout-tracking-service.ts` guarda una sesión de entrenamiento en la tabla `workout_sessions` de Supabase.

```typescript
export const saveWorkoutSession = async (session: WorkoutSession): Promise<WorkoutSession | null> => {
  try {
    // Preparar datos para Supabase
    const sessionData = {
      id: session.id || crypto.randomUUID(),
      user_id: session.userId,
      workout_day_id: session.workoutDayId,
      workout_day_name: session.workoutDayName || 'Entrenamiento',
      date: session.date,
      duration: session.duration || 0,
      exercises: session.exercises,
      notes: session.notes || '',
      fatigue: session.fatigue || 0,
      mood: session.mood || 'neutral'
    }

    // Guardar en Supabase
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert([sessionData])
      .select()

    // ... manejo de errores y respuesta
  } catch (error) {
    console.error('Error al guardar sesión de entrenamiento:', error)
    return null
  }
}
```

## Componentes actualizados

Se han actualizado los siguientes componentes para utilizar los servicios implementados:

1. **WorkoutCalendar**: Muestra el plan de entrenamiento en formato de calendario.
2. **WorkoutExecution**: Permite ejecutar una rutina de entrenamiento.
3. **PerformanceTracking**: Muestra gráficos de progreso.
4. **PostureAnalysis**: Permite analizar la postura durante los ejercicios.

## Ventajas de esta implementación

1. **Simplicidad**: No es necesario desplegar Edge Functions, lo que simplifica el proceso de desarrollo y despliegue.
2. **Rendimiento**: Las operaciones se realizan directamente en la base de datos, lo que puede mejorar el rendimiento.
3. **Costos**: Se reducen los costos asociados a la ejecución de Edge Functions.
4. **Mantenimiento**: Es más fácil mantener y depurar el código, ya que todo está en el mismo lugar.

## Limitaciones

1. **Procesamiento intensivo**: Para tareas que requieren un procesamiento intensivo, como el análisis de videos, sería mejor utilizar Edge Functions o un servicio externo.
2. **Seguridad**: Es importante implementar políticas de seguridad de fila (RLS) en Supabase para proteger los datos.
3. **Escalabilidad**: Para aplicaciones con muchos usuarios, puede ser necesario optimizar las consultas a la base de datos.

## Próximos pasos

1. **Implementar políticas de seguridad de fila (RLS)** en Supabase para proteger los datos.
2. **Optimizar las consultas** a la base de datos para mejorar el rendimiento.
3. **Implementar un servicio real de análisis de videos** utilizando un servicio externo o Edge Functions.
4. **Mejorar la generación de recomendaciones** utilizando algoritmos más avanzados.
5. **Implementar pruebas automatizadas** para asegurar la calidad del código.
