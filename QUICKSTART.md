## 🚀 INICIO RÁPIDO - KAPI TASK BOARD

### Opción A: Desarrollo Local (Recomendado)

```bash
# 1. Iniciar servidor de desarrollo
npm run dev

# 2. Abre http://localhost:5173 en tu navegador
# 3. ¡Ya puedes usar la app!
```

### Opción B: Probar Datos Reales con Supabase

```bash
# 1. Ve a https://supabase.com y crea un proyecto
# 2. Copia estas credenciales a un archivo .env.local:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 3. En Supabase SQL Editor, copia y ejecuta esto:
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  assignee TEXT,
  due_date DATE,
  subtasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

# 4. Inicia el servidor
npm run dev
```

### Opción C: Desplegar a Netlify

```bash
# 1. Compila el proyecto
npm run build

# 2. Instala Netlify CLI (si no lo tienes)
npm install -g netlify-cli

# 3. Conecta y deploya
netlify login
netlify deploy --prod

# O simplemente arrastra dist/ a netlify.com/drop
```

---

### 📱 Cómo Usar la App

| Acción | Cómo Hacerlo |
|--------|------------|
| **Crear Tarea** | Haz clic en "+" en cualquier columna |
| **Editar Tarea** | Haz clic en ✏️ en la tarjeta |
| **Eliminar Tarea** | Haz clic en 🗑️ en la tarjeta |
| **Mover Tarea** | Arrastra la tarjeta a otra columna |
| **Cambiar Tema** | Haz clic en 🌙 o ☀️ arriba a la derecha |

---

### 🛠️ Comandos Útiles

```bash
npm run dev       # Desarrollo local
npm run build     # Compilar para producción  
npm run preview   # Ver el build compilado
npm run lint      # Verificar código
```

---

### 📂 Archivos Importantes

- `src/App.tsx` - Componente principal (edita aquí para cambiar nombre/colores)
- `src/index.css` - Estilos globales
- `tailwind.config.js` - Configuración de estilos
- `netlify.toml` - Configuración de deploy
- `.env.example` - Template de variables de entorno

---

### 🐛 Errores Comunes

**Error: "Port 5173 already in use"**
```bash
npm run dev -- --port 3000
```

**Error: "Tailwind styles not working"**
```bash
# Reinicia el servidor
npm run dev
```

**Error: "Build fails"**
```bash
rm -rf node_modules
npm install
npm run build
```

---

### 💡 Personalización Rápida

**Cambiar nombre de la app:**
Edita `src/App.tsx` línea donde dice "KAPI Task Board"

**Cambiar color principal:**
Edita `tailwind.config.js` y agrega tus colores

**Agregar nuevas tareas de prueba:**
Edita el array `mockTasks` en `src/App.tsx`

---

### 📚 Documentación Completa

- **README.md** - Descripción general del proyecto
- **SETUP.md** - Guía detallada de configuración
- **CHECKLIST.md** - Lista completa de features
- **RESUMEN.md** - Resumen técnico completo

---

### ✨ Características Incluidas

✅ Drag & Drop
✅ Modo Oscuro  
✅ Crear/Editar/Eliminar Tareas
✅ TypeScript
✅ Tailwind CSS
✅ Supabase Ready
✅ Netlify Ready
✅ Responsive Design

---

### 🎯 Próximo Paso

```bash
npm run dev
```

¡Y disfruta tu nueva app Kanban! 🎉
