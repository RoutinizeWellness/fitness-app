# Biblioteca de Ejercicios - Guía de Configuración

Esta guía explica cómo configurar la biblioteca de ejercicios en la aplicación Routinize, que incluye 1000 ejercicios detallados con información completa.

## Requisitos previos

- Node.js 16 o superior
- Supabase CLI instalado
- Acceso a tu proyecto de Supabase

## Pasos para la configuración

### 1. Aplicar la migración de la base de datos

La migración crea o actualiza la tabla de ejercicios con todos los campos necesarios y configura las políticas de seguridad de Row Level Security (RLS).

```bash
# Usando Supabase CLI
npx supabase db push --db-url postgresql://postgres:postgres@localhost:54322/postgres

# O alternativamente, ejecuta el script de configuración
node scripts/setup-exercise-library.js
```

### 2. Poblar la base de datos con ejercicios

El script generará 1000 ejercicios detallados y los insertará en la base de datos.

```bash
# Ejecutar el script de generación e inserción
npx tsx scripts/populate-exercises-db.ts

# O alternativamente, ejecuta el script de configuración completo
node scripts/setup-exercise-library.js
```

### 3. Verificar la instalación

Una vez completados los pasos anteriores, deberías poder ver los ejercicios en la aplicación:

1. Navega a la pestaña "Ejercicios" en la aplicación
2. Utiliza los filtros para buscar ejercicios por grupo muscular, dificultad, etc.
3. Marca algunos ejercicios como favoritos para probar la funcionalidad

## Estructura de datos

Cada ejercicio contiene la siguiente información:

- **Información básica**: nombre, descripción, grupo muscular, dificultad
- **Detalles técnicos**: tipo de ejercicio, mecánica, patrón de movimiento
- **Instrucciones**: pasos detallados para realizar el ejercicio correctamente
- **Multimedia**: imágenes y enlaces a videos demostrativos
- **Metadatos**: calorías quemadas, popularidad, valoración

## Funcionalidades implementadas

- **Biblioteca completa**: 1000 ejercicios detallados
- **Búsqueda avanzada**: filtrar por múltiples criterios
- **Favoritos**: marcar ejercicios como favoritos para acceso rápido
- **Visualizaciones**: imágenes y videos para cada ejercicio
- **Integración con entrenamientos**: añadir ejercicios a tus rutinas

## Solución de problemas

Si encuentras algún problema durante la configuración:

1. **Error en la migración**: Verifica que tienes los permisos necesarios en Supabase
2. **Error al insertar ejercicios**: Comprueba la conexión a Supabase y los límites de la API
3. **No se muestran los ejercicios**: Verifica las políticas RLS y que estás autenticado correctamente

## Próximos pasos

- Implementar valoraciones de usuarios para los ejercicios
- Añadir la posibilidad de que los usuarios creen sus propios ejercicios personalizados
- Mejorar las recomendaciones basadas en el historial de entrenamiento
