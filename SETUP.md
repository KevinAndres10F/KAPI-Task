# Guía de Configuración - KAPI Task Board

## 📋 Tabla de Contenidos

1. [Instalación Local](#instalación-local)
2. [Variables de Entorno](#variables-de-entorno)
3. [Configuración de Supabase](#configuración-de-supabase)
4. [Desarrollo](#desarrollo)
5. [Construcción y Deploy](#construcción-y-deploy)
6. [Solución de Problemas](#solución-de-problemas)

## Instalación Local

### Requisitos Previos
- Node.js 16+ ([Descargar](https://nodejs.org/))
- npm o yarn
- Git

### Pasos

1. **Clonar o abrir el repositorio**
   ```bash
   cd KAPI-Task
   ```

2. **Instalar dependencias** (ya incluidas en el proyecto)
   ```bash
   npm install
   ```

3. **Verificar la instalación**
   ```bash
   npm run dev
   ```

## Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Obtener las Credenciales de Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Crea un nuevo proyecto
4. En "Settings" → "API", copia:
   - **Project URL**: para `VITE_SUPABASE_URL`
   - **anon (public) key**: para `VITE_SUPABASE_ANON_KEY`

## Configuración de Supabase

### 1. Crear la Tabla de Tareas

En Supabase SQL Editor, ejecuta:

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_order ON tasks("order");
```

### 2. Habilitar RLS (Row Level Security) - Opcional

Para desarrollo sin autenticación:

```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON tasks
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON tasks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON tasks
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON tasks
    FOR DELETE USING (true);
```

### 3. Verificar la Conexión

Una vez configurada, abre la app en `http://localhost:5173` y verifica que puedas:
- Ver las tareas (si existen en la BD)
- Crear una nueva tarea
- Mover tareas entre columnas

## Desarrollo

### Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Estructura de Archivos

```
src/
├── components/
│   ├── Board.tsx       # Tablero principal con drag & drop
│   ├── Column.tsx      # Columna de tareas
│   ├── TaskCard.tsx    # Tarjeta individual de tarea
│   └── TaskModal.tsx   # Modal para crear/editar tareas
├── lib/
│   └── supabaseClient.js # Cliente y APIs de Supabase
├── types/
│   └── index.ts        # Tipos TypeScript
├── App.tsx             # Componente raíz
├── App.css             # Estilos de la aplicación
├── index.css           # Estilos globales + Tailwind
└── main.tsx            # Punto de entrada
```

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run preview` | Previsualiza el build |
| `npm run lint` | Ejecuta ESLint |

## Construcción y Deploy

### Construir Localmente

```bash
npm run build
```

Esto genera la carpeta `dist/` lista para deploy.

### Desplegar en Netlify

#### Opción 1: Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Conectarte a Netlify
netlify login

# Desplegar
netlify deploy --prod
```

#### Opción 2: Git + Netlify UI (Recomendado)

1. Sube el código a GitHub
2. En netlify.com, conecta tu repositorio
3. Netlify detectará automáticamente el `netlify.toml`
4. Configura variables de entorno en:
   **Site Settings** → **Build & Deploy** → **Environment**

#### Opción 3: Arrastra y Suelta

```bash
npm run build
```

Luego arrastra la carpeta `dist/` a [netlify.com/drop](https://netlify.com/drop)

### Variables de Entorno en Netlify

1. Ve a **Site Settings** → **Build & Deploy** → **Environment**
2. Agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Solución de Problemas

### "Cannot find module @hello-pangea/dnd"

```bash
npm install @hello-pangea/dnd
```

### Tailwind no aplica estilos

1. Reinicia el servidor: `npm run dev`
2. Limpia caché: `npm run build` → elimina `dist/`
3. Verifica `index.css` tenga `@import "tailwindcss"`

### Supabase no responde

1. Verifica `.env.local` tiene las credenciales correctas
2. Abre la consola del navegador (F12) y busca errores
3. Comprueba que la tabla existe en Supabase
4. Verifica las políticas RLS (policies)

### Error de compilación TypeScript

```bash
# Limpia y reconstruye
rm -rf node_modules
npm install
npm run build
```

### Puerto 5173 ya está en uso

```bash
# Usa otro puerto
npm run dev -- --port 3000
```

## 🎨 Personalización

### Cambiar Colores

Edita `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    }
  }
}
```

### Cambiar Fuente

En `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Your+Font');

html {
  font-family: 'Your Font', sans-serif;
}
```

## 📚 Recursos Útiles

- [Documentación de React](https://react.dev)
- [Documentación de Vite](https://vitejs.dev)
- [Documentación de Tailwind CSS](https://tailwindcss.com)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de @hello-pangea/dnd](https://github.com/hello-pangea/dnd)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs en la consola del navegador (F12)
2. Consulta la terminal donde corre `npm run dev`
3. Abre un issue en GitHub
4. Contacta al equipo de soporte
