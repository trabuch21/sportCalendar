# Configuración de Supabase

Esta guía te ayudará a configurar Supabase para tu aplicación.

## Paso 1: Crear cuenta en Supabase

1. Ve a https://supabase.com
2. Haz clic en "Start your project"
3. Crea una cuenta (puedes usar GitHub para facilitar el proceso)
4. Crea un nuevo proyecto

## Paso 2: Configurar la base de datos

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Abre el archivo `supabase-schema.sql` de este proyecto
3. Copia todo el contenido del archivo
4. Pégalo en el SQL Editor de Supabase
5. Haz clic en **Run** para ejecutar el script

Esto creará:
- La tabla `profiles` para los usuarios
- La tabla `races` para las carreras
- Las políticas de seguridad (RLS)
- Los triggers para crear perfiles automáticamente

## Paso 3: Obtener las credenciales

1. En el dashboard de Supabase, ve a **Settings** → **API** → **API Keys**

### Opción A: Usar las nuevas API Keys (Recomendado)

1. En la pestaña **"Publishable and secret API keys"**:
   - Copia el **Publishable key** (empieza con `sb_publishable_...`)
   - Este será tu `VITE_SUPABASE_ANON_KEY`
   
2. Para obtener el **Project URL**:
   - Ve a **Settings** → **API** → **Project URL**
   - O busca en la parte superior de la página de API Keys
   - Este será tu `VITE_SUPABASE_URL`

### Opción B: Usar las Legacy API Keys (Si prefieres)

1. Haz clic en la pestaña **"Legacy anon, service_role API keys"**
2. Copia los siguientes valores:
   - **Project URL** (será tu `VITE_SUPABASE_URL`)
   - **anon public** key (será tu `VITE_SUPABASE_ANON_KEY`)

**Nota:** Ambas opciones funcionan. Las nuevas keys son más seguras y están diseñadas para el futuro.

## Paso 4: Configurar variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto (junto a `package.json`)
2. Agrega las siguientes variables:

```env
VITE_SUPABASE_URL=tu_project_url_aqui
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

**Importante:** 
- Reemplaza `tu_project_url_aqui` y `tu_anon_key_aqui` con los valores reales de Supabase
- El archivo `.env` NO debe subirse a GitHub (ya está en `.gitignore`)

## Paso 5: Configurar autenticación (opcional)

Por defecto, Supabase requiere confirmación de email. Si quieres desactivarla para desarrollo:

1. Ve a **Authentication** → **Settings**
2. Desactiva **Enable email confirmations**

## Paso 6: Probar la aplicación

1. Ejecuta `npm run dev` para iniciar el servidor de desarrollo
2. Intenta registrarte con un nuevo usuario
3. Verifica que puedas crear y ver carreras

## Notas importantes

- Las políticas RLS (Row Level Security) están configuradas para que cada usuario solo pueda ver/editar sus propias carreras
- Los perfiles se crean automáticamente cuando un usuario se registra
- La autenticación está completamente manejada por Supabase

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo después de crear/modificar `.env`

### Error al crear usuario
- Verifica que el trigger `on_auth_user_created` se ejecutó correctamente
- Revisa la consola del navegador para más detalles

### No se ven las carreras
- Verifica que las políticas RLS están activas
- Asegúrate de estar autenticado correctamente
