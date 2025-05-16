# Módulos de Bienestar y Productividad

Este documento describe las nuevas funcionalidades implementadas en los módulos de Bienestar y Productividad de la aplicación.

## Características implementadas

### Módulo de Productividad

1. **Hábitos personalizados**:
   - Creación y seguimiento de hábitos diarios
   - Plantillas predefinidas para horarios laborales españoles (9:00-14:00 y 16:00-19:00)
   - Seguimiento de rachas y estadísticas
   - Recordatorios configurables

2. **Integración con calendarios** (pendiente):
   - Integración con Google Calendar/Outlook para detectar pausas
   - Ajuste automático de recomendaciones basado en tu agenda

### Módulo de Bienestar

1. **Optimización del sueño**:
   - "Siesta científica": Temporizador de 20-30 minutos con relajación guiada
   - Seguimiento de la calidad del sueño y energía
   - Recomendaciones personalizadas basadas en tus datos

2. **Gestión del estrés laboral**:
   - Ejercicios de mindfulness con instrucciones paso a paso
   - Diferentes categorías: respiración, meditación, visualización, body scan
   - Seguimiento de niveles de estrés antes y después de cada sesión

3. **Programas corporativos**:
   - Retos grupales con recompensas
   - Estadísticas anónimas para empresas
   - Protección de privacidad con reportes anónimos

4. **Adaptación cultural**:
   - Plantillas adaptadas a horarios españoles
   - Soporte para siesta y horarios tardíos

## Configuración inicial

### 1. Crear las tablas en Supabase

Para crear las tablas necesarias en Supabase, ejecuta la migración:

```bash
npx supabase migration up
```

### 2. Inicializar datos de ejemplo

Para cargar datos de ejemplo en las nuevas tablas, ejecuta:

```bash
npm run init-data
```

Este comando cargará:
- Plantillas de horarios españoles
- Hábitos de ejemplo
- Ejercicios de mindfulness
- Programas de bienestar corporativo
- Retos corporativos
- Estadísticas anónimas de ejemplo

## Uso de las nuevas funcionalidades

### Hábitos personalizados

1. Accede a la pestaña "Productividad" en la navegación principal
2. Selecciona la pestaña "Hábitos"
3. Puedes crear un nuevo hábito manualmente o usar una plantilla predefinida
4. Para usar una plantilla española, haz clic en "Plantillas"
5. Selecciona la plantilla deseada (estándar, con siesta, o jornada intensiva)
6. Marca los hábitos como completados para mantener tu racha

### Siesta científica

1. Accede a la pestaña "Bienestar" en la navegación principal
2. Selecciona la pestaña "Siesta"
3. Configura la duración deseada (recomendado: 20-25 minutos)
4. Inicia el temporizador y sigue las instrucciones
5. Al finalizar, registra tu nivel de energía antes y después
6. Consulta tus estadísticas para ver recomendaciones personalizadas

### Ejercicios de mindfulness

1. Accede a la pestaña "Bienestar" en la navegación principal
2. Selecciona la pestaña "Mindfulness"
3. Explora los diferentes ejercicios disponibles por categoría
4. Selecciona un ejercicio y registra tu nivel de estrés inicial
5. Sigue las instrucciones paso a paso
6. Al finalizar, registra tu nivel de estrés final
7. Consulta tus estadísticas para ver qué ejercicios son más efectivos para ti

### Programas de bienestar corporativo

1. Accede a la pestaña "Bienestar" en la navegación principal
2. Selecciona la pestaña "Empresa"
3. Explora los programas y retos disponibles
4. Únete a los retos que te interesen
5. Actualiza tu progreso regularmente
6. Consulta las estadísticas anónimas de tu empresa

## Personalización

### Adaptación de horarios

Las plantillas de horarios españoles incluyen:
- Horario estándar (9:00-14:00 y 16:00-19:00)
- Horario con siesta (9:00-14:00 y 16:30-19:30, con pausa para siesta)
- Jornada intensiva (8:00-15:00)

Puedes personalizar estos horarios editando los hábitos creados.

### Ejercicios de mindfulness

Los ejercicios de mindfulness están categorizados en:
- Respiración: técnicas de respiración para reducir estrés
- Meditación: prácticas de atención plena
- Visualización: técnicas de visualización guiada
- Body scan: relajación progresiva del cuerpo

## Próximas mejoras

- Integración con Google Calendar/Outlook
- Más plantillas de horarios adaptadas a diferentes sectores
- Ejercicios de mindfulness adicionales
- Mejoras en las recomendaciones personalizadas
- Integración con wearables para seguimiento del sueño

## Notas técnicas

- Los datos se almacenan en Supabase
- Las estadísticas corporativas son completamente anónimas
- Los temporizadores utilizan notificaciones del navegador (requiere permisos)
- Las recomendaciones se basan en tus datos históricos
