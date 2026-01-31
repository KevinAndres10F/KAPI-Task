# 🚀 Inicio Rápido - KAPI Task Board con Supabase

## ⚡ Configuración en 5 Minutos

### 1️⃣ Crear Proyecto en Supabase
- Ve a [supabase.com](https://supabase.com) → Crea cuenta → **New Project**
- Guarda la contraseña de la base de datos

### 2️⃣ Obtener Credenciales
- Ve a **Settings** → **API**
- Copia:
  - `Project URL`
  - `anon public key`

### 3️⃣ Configurar Base de Datos
- Ve a **SQL Editor** → **New query**
- Copia y pega todo el contenido de `supabase-setup.sql`
- Click en **Run** ▶️

### 4️⃣ Configurar Variables Locales
```bash
cp .env.example .env
# Edita .env con tus credenciales de Supabase
```

### 5️⃣ Iniciar Aplicación
```bash
npm install
npm run dev
```

## ✅ ¡Listo!
- Abre http://localhost:5173
- Crea una cuenta
- Empieza a crear tareas

---

Para más detalles, consulta: **SUPABASE_SETUP.md**
