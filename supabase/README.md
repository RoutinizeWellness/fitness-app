# Supabase Database Management

Este directorio contiene los archivos necesarios para gestionar la base de datos de Supabase, incluyendo migraciones, scripts de importación de datos y herramientas para generar tipos TypeScript.

## Estructura de directorios

```
supabase/
├── migrations/        # Archivos SQL de migración
│   ├── 001_initial_schema.sql
│   └── 002_functions_and_triggers.sql
├── README.md          # Este archivo
```

## Configuración

Antes de ejecutar cualquier script, asegúrate de tener un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://soviwrzrgskhvgcmujfj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here
SUPABASE_PROJECT_ID=soviwrzrgskhvgcmujfj
```

Puedes copiar el archivo `.env.example` y rellenarlo con tus propias claves:

```bash
cp .env.example .env
```

## Scripts disponibles

Los siguientes scripts están disponibles para gestionar la base de datos:

### Configuración completa

```bash
npm run db:setup
```

Este script ejecuta todos los pasos necesarios para configurar la base de datos:
1. Aplica las migraciones
2. Importa los ejercicios
3. Importa la base de datos de alimentos
4. Genera los tipos TypeScript
5. Verifica el esquema de la base de datos

### Migraciones

```bash
npm run db:migrate
```

Este script aplica todas las migraciones en la carpeta `supabase/migrations` en orden alfabético.

### Importación de datos

```bash
npm run db:import-exercises
npm run db:import-food
```

Estos scripts importan datos de ejercicios y alimentos desde los archivos JSON en la carpeta `data/`.

### Generación de tipos

```bash
npm run db:generate-types
```

Este script genera tipos TypeScript basados en el esquema actual de la base de datos y los guarda en `lib/types/supabase-generated.ts`.

### Verificación del esquema

```bash
npm run db:check-schema
```

Este script verifica el esquema actual de la base de datos y muestra información sobre tablas, funciones, políticas y triggers.

## Creación de nuevas migraciones

Para crear una nueva migración:

1. Crea un nuevo archivo SQL en la carpeta `supabase/migrations` con un nombre que comience con un número secuencial (por ejemplo, `003_add_new_table.sql`).
2. Escribe las sentencias SQL necesarias para la migración.
3. Ejecuta `npm run db:migrate` para aplicar la migración.

## Notas importantes

- Las migraciones se aplican en orden alfabético, por lo que es importante nombrar los archivos con un prefijo numérico.
- Las migraciones son idempotentes, lo que significa que se pueden ejecutar varias veces sin causar problemas.
- Los scripts utilizan la API Management de Supabase para aplicar las migraciones, lo que requiere una clave de servicio con permisos de administrador.
- Asegúrate de tener instaladas todas las dependencias necesarias ejecutando `npm install` antes de ejecutar los scripts.

## Solución de problemas

Si encuentras problemas al ejecutar los scripts, verifica lo siguiente:

1. Asegúrate de que las variables de entorno estén correctamente configuradas en el archivo `.env`.
2. Verifica que tengas permisos de administrador en el proyecto de Supabase.
3. Comprueba que las dependencias estén instaladas ejecutando `npm install`.
4. Si recibes errores específicos de SQL, revisa la sintaxis de tus migraciones.

Para obtener más ayuda, consulta la [documentación de Supabase](https://supabase.com/docs) o abre un issue en el repositorio del proyecto.
