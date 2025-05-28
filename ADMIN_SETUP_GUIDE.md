# 🚀 Guía de Configuración de Administrador - Routinize

Esta guía te llevará paso a paso para configurar el usuario administrador y ejecutar todas las migraciones necesarias en Supabase.

## 📋 Prerrequisitos

- Acceso al dashboard de Supabase
- Proyecto de Supabase configurado
- Permisos de administrador en el proyecto

## 🔧 Paso 1: Ejecutar Migraciones de Base de Datos

### 1.1 Acceder al Editor SQL de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Crea una nueva consulta

### 1.2 Ejecutar Migraciones en Orden

Ejecuta los siguientes archivos SQL **en este orden exacto**:

```sql
-- 1. Primero, ejecutar las políticas RLS para admin
-- Copiar y pegar el contenido de: supabase/migrations/20240101000006_admin_rls_policies.sql
```

```sql
-- 2. Luego, crear las tablas de administración
-- Copiar y pegar el contenido de: supabase/migrations/20240101000007_admin_tables.sql
```

```sql
-- 3. Configurar funciones de usuario admin
-- Copiar y pegar el contenido de: supabase/migrations/20240101000008_create_admin_user.sql
```

```sql
-- 4. Finalmente, ejecutar la configuración completa
-- Copiar y pegar el contenido de: supabase/migrations/20240101000009_complete_setup.sql
```

### 1.3 Verificar Migraciones

Después de ejecutar cada migración, verifica que no haya errores:

```sql
-- Verificar estado del sistema
SELECT * FROM system_health_check();
```

## 👤 Paso 2: Crear Usuario Administrador

### 2.1 Crear Usuario en Supabase Auth

1. En el dashboard de Supabase, ve a **Authentication** > **Users**
2. Haz clic en **"Add user"** o **"Invite user"**
3. Completa los datos:
   - **Email**: `admin@routinize.com`
   - **Password**: Crear una contraseña segura
   - **Auto Confirm User**: ✅ Activar
   - **Email Confirm**: ✅ Activar

### 2.2 Configurar Perfil del Admin

Una vez creado el usuario, ejecuta en el SQL Editor:

```sql
-- Configurar el usuario admin con todos los perfiles
SELECT setup_admin_user();
```

### 2.3 Verificar Configuración del Admin

```sql
-- Verificar que el admin está configurado correctamente
SELECT * FROM check_admin_status();
```

Deberías ver algo como:
```
user_id: [UUID del admin]
email: admin@routinize.com
full_name: Administrador del Sistema
has_profile: true
has_adaptive_profile: true
has_admin_settings: true
```

## 🔍 Paso 3: Verificación Completa del Sistema

### 3.1 Ejecutar Reporte de Estado

```sql
-- Generar reporte completo del sistema
SELECT generate_setup_report();
```

### 3.2 Verificar Componentes Individuales

```sql
-- Verificar salud del sistema
SELECT * FROM system_health_check();

-- Verificar configuraciones
SELECT key, value, description FROM system_config ORDER BY category, key;

-- Verificar plantillas de comunicación
SELECT name, type, category FROM communication_templates;

-- Verificar métricas del sistema (solo admin)
SELECT get_system_metrics();
```

## 🧪 Paso 4: Pruebas del Sistema

### 4.1 Probar Acceso Admin

1. Inicia sesión en la aplicación con `admin@routinize.com`
2. Verifica que puedes acceder al dashboard de administración
3. Comprueba que puedes ver la lista de usuarios

### 4.2 Ejecutar Pruebas Automatizadas

En la aplicación, navega al componente de pruebas y ejecuta:
- Pruebas del sistema adaptativo
- Pruebas de funciones administrativas
- Validación de permisos

## 🚨 Solución de Problemas

### Error: "Usuario admin no encontrado"

**Solución**: El usuario debe crearse manualmente en Supabase Auth primero.

```sql
-- Verificar si el usuario existe
SELECT id, email, created_at FROM auth.users WHERE email = 'admin@routinize.com';
```

### Error: "Access denied. Admin privileges required"

**Solución**: Verificar que las políticas RLS están configuradas correctamente.

```sql
-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE policyname LIKE '%admin%';
```

### Error: "Tabla no existe"

**Solución**: Ejecutar las migraciones básicas del sistema primero.

```sql
-- Verificar tablas existentes
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Resetear Configuración de Admin

Si necesitas empezar de nuevo:

```sql
-- CUIDADO: Esto eliminará toda la configuración del admin
SELECT reset_admin_configuration();

-- Luego volver a configurar
SELECT setup_admin_user();
```

## ✅ Lista de Verificación Final

- [ ] Migraciones SQL ejecutadas sin errores
- [ ] Usuario `admin@routinize.com` creado en Supabase Auth
- [ ] Función `setup_admin_user()` ejecutada exitosamente
- [ ] `check_admin_status()` muestra todos los campos como `true`
- [ ] `system_health_check()` muestra todos los componentes como `OK`
- [ ] Acceso al dashboard de admin funciona
- [ ] Pruebas del sistema adaptativo pasan

## 📞 Soporte

Si encuentras problemas durante la configuración:

1. Verifica que todas las migraciones se ejecutaron en orden
2. Revisa los logs de error en Supabase
3. Ejecuta `SELECT generate_setup_report();` para diagnóstico
4. Verifica que el usuario admin tiene los permisos correctos

## 🔐 Seguridad

**Importante**: 
- Cambia la contraseña del admin después de la configuración inicial
- Considera habilitar 2FA para el usuario admin
- Revisa regularmente los logs de actividad administrativa
- Mantén las credenciales de admin seguras

---

## 📝 Comandos de Referencia Rápida

```sql
-- Verificar estado completo
SELECT generate_setup_report();

-- Verificar admin
SELECT * FROM check_admin_status();

-- Verificar salud del sistema
SELECT * FROM system_health_check();

-- Obtener métricas (solo admin)
SELECT get_system_metrics();

-- Ver actividad reciente (solo admin)
SELECT * FROM get_recent_activity(10);

-- Crear snapshot de métricas
SELECT create_daily_metrics_snapshot();
```

¡La configuración está completa! El sistema Routinize está listo para usar con todas las funcionalidades administrativas y adaptativas habilitadas.
