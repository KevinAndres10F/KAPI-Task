# 🗄️ Configuración de Base de Datos Supabase

Esta guía te ayudará a configurar la base de datos en Supabase para que las tareas se guarden en la nube y sean accesibles desde cualquier dispositivo.

## 📋 Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. **Crea una cuenta** o inicia sesión
3. Click en **"New Project"**
4. Rellena los datos:
   - **Name**: KAPI-Task-Board (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (guárdala)
   - **Region**: Selecciona la más cercana a ti
   - **Pricing Plan**: Selecciona **Free** (suficiente para este proyecto)
5. Click en **"Create new project"**
6. Espera 2-3 minutos mientras se crea el proyecto

## 🔑 Paso 2: Obtener las Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** → **API** en el menú lateral
2. Busca y copia estos valores:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: Una clave larga que empieza con `eyJ...`

## 🛠️ Paso 3: Crear la Tabla en Supabase

### Opción A: Usar el Editor SQL (Recomendado)

1. En tu proyecto de Supabase, ve a **SQL Editor** en el menú lateral
2. Click en **"New query"**
3. Copia y pega el contenido completo del archivo `supabase-setup.sql`
4. Click en **"Run"** (o presiona Ctrl/Cmd + Enter)
5. ¡Listo! La tabla `tasks` se ha creado con todas las políticas de seguridad

### Opción B: Usar la Interfaz Visual

1. Ve a **Database** → **Tables** en el menú lateral
2. Click en **"Create a new table"**
3. Nombre: `tasks`
4. Agrega estas columnas:

| Nombre | Tipo | Configuración |
|--------|------|---------------|
| id | uuid | Primary Key, Default: gen_random_uuid() |
| user_id | uuid | Foreign Key → auth.users.id |
| title | text | Not Null |
| description | text | Nullable |
| status | text | Not Null |
| priority | text | Not Null |
| order | int4 | Default: 0 |
| assignee | text | Nullable |
| due_date | date | Nullable |
| subtasks | jsonb | Default: '[]' |
| created_at | timestamptz | Default: now() |
| updated_at | timestamptz | Default: now() |

5. Luego ve a **Authentication** → **Policies** y crea las políticas RLS manualmente

## 🔐 Paso 4: Configurar Variables de Entorno

### En tu Proyecto Local:

1. Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

2. Abre `.env` y reemplaza con tus credenciales:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Guarda el archivo

### En Netlify (para producción):

1. Ve a tu sitio en [Netlify](https://app.netlify.com)
2. Ve a **Site settings** → **Build & deploy** → **Environment**
3. Click en **"Add variable"** y agrega:
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: Tu URL de Supabase
4. Click en **"Add variable"** nuevamente:
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Tu clave anon
5. Click en **"Save"**
6. Ve a **Deploys** y click en **"Trigger deploy"** → **"Clear cache and deploy site"**

## ✅ Paso 5: Probar la Conexión

1. Reinicia el servidor de desarrollo:

```bash
npm run dev
```

2. Abre la aplicación en tu navegador
3. **Crea una cuenta** o inicia sesión
4. **Crea una tarea** de prueba
5. Cierra sesión y vuelve a iniciar → La tarea debería seguir ahí
6. Abre la app desde otro navegador o dispositivo → Las tareas deberían aparecer

## 🔍 Verificar que Todo Funciona

### En Supabase:

1. Ve a **Table Editor** → **tasks**
2. Deberías ver las tareas que creaste
3. Ve a **Authentication** → **Users**
4. Deberías ver los usuarios registrados

### En la Aplicación:

- ✅ Las tareas se guardan al crearlas
- ✅ Las tareas persisten al recargar la página
- ✅ Las tareas se actualizan en tiempo real
- ✅ Cada usuario solo ve sus propias tareas
- ✅ Las tareas tienen fecha límite guardada

## 🐛 Solución de Problemas

### No se guardan las tareas

1. Verifica que las variables de entorno estén correctas
2. Abre la consola del navegador (F12) y busca errores
3. Verifica que el usuario esté autenticado (debe aparecer el email en la esquina superior)

### Error de RLS (Row Level Security)

Asegúrate de haber ejecutado **todas** las políticas RLS del archivo `supabase-setup.sql`

### No puedo registrarme

1. Ve a **Authentication** → **Providers** en Supabase
2. Verifica que **Email** esté habilitado
3. Configura las URLs de redirección si es necesario

## 📊 Estructura de la Base de Datos

```
┌─────────────────────────────────────┐
│            tasks                    │
├─────────────────────────────────────┤
│ id (UUID, PK)                       │
│ user_id (UUID, FK → auth.users)     │
│ title (TEXT)                        │
│ description (TEXT)                  │
│ status (TEXT)                       │
│ priority (TEXT)                     │
│ order (INTEGER)                     │
│ assignee (TEXT)                     │
│ due_date (DATE)                     │
│ subtasks (JSONB)                    │
│ created_at (TIMESTAMPTZ)            │
│ updated_at (TIMESTAMPTZ)            │
└─────────────────────────────────────┘
```

## 🔒 Seguridad

La base de datos está configurada con **Row Level Security (RLS)**, lo que significa:

- ✅ Cada usuario solo puede ver sus propias tareas
- ✅ Un usuario no puede modificar tareas de otros usuarios
- ✅ Los datos están protegidos a nivel de base de datos
- ✅ Las políticas se aplican automáticamente en todas las consultas

## 🚀 Próximos Pasos

Una vez configurado:

1. **Deploy en Netlify**: Sigue las instrucciones en `GITHUB_NETLIFY.md`
2. **Comparte la URL**: Tu aplicación estará disponible online
3. **Invita usuarios**: Otros pueden registrarse y usar su propia cuenta
4. **Monitorea el uso**: Revisa el dashboard de Supabase para ver estadísticas

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Políticas RLS](https://supabase.com/docs/guides/auth/row-level-security#policies)

## 💡 Consejos

- **No compartas tu `SUPABASE_ANON_KEY`** en repositorios públicos
- Usa el archivo `.env` solo para desarrollo local
- En producción, usa las variables de entorno de Netlify
- El plan gratuito de Supabase incluye:
  - 500 MB de almacenamiento
  - 2 GB de transferencia de datos
  - 50,000 usuarios activos mensuales
  - ¡Más que suficiente para empezar!

---

¿Necesitas ayuda? Revisa la sección de solución de problemas o consulta la documentación de Supabase.
