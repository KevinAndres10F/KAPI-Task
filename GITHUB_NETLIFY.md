# 🚀 Cómo Publicar en GitHub y Netlify

## 📝 Paso 1: Crear Repositorio en GitHub

### Opción A: Línea de Comandos (Requiere GitHub CLI)

```bash
# Instalar GitHub CLI si no lo tienes
# https://cli.github.com/

# Crear repositorio
gh repo create KAPI-Task --public --source=. --remote=origin --push
```

### Opción B: Interfaz Web (Recomendado)

1. Ve a [github.com/new](https://github.com/new)
2. Rellena los campos:
   - **Repository name**: `KAPI-Task`
   - **Description**: Kanban Task Board - React + Vite + Tailwind CSS
   - **Public/Private**: Selecciona **Public**
3. **NO** marques "Initialize this repository with..."
4. Haz clic en **"Create repository"**

---

## 🔗 Paso 2: Conectar y Pushear a GitHub

Ejecuta estos comandos en tu terminal:

```bash
# Agregar el remoto de GitHub (reemplaza YOUR_USERNAME con tu usuario)
git remote add origin https://github.com/YOUR_USERNAME/KAPI-Task.git

# Cambiar rama a 'main' (si es necesario)
git branch -M main

# Pushear el código
git push -u origin main
```

### Verificar que todo está correcto:

```bash
git remote -v
# Deberías ver:
# origin  https://github.com/YOUR_USERNAME/KAPI-Task.git (fetch)
# origin  https://github.com/YOUR_USERNAME/KAPI-Task.git (push)
```

---

## 🌐 Paso 3: Publicar en Netlify

### Opción A: Desde GitHub (Recomendado)

1. Ve a [netlify.com](https://netlify.com)
2. **Crea cuenta** o inicia sesión
3. Haz clic en **"Add new site"** → **"Import an existing project"**
4. Selecciona **GitHub** como proveedor
5. Busca y selecciona tu repositorio **KAPI-Task**
6. Netlify detectará automáticamente:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
7. Haz clic en **"Deploy site"**
8. **Espera 2-5 minutos** mientras se compila

### Variables de Entorno (Opcional - Para Supabase)

Si planeas usar Supabase:

1. En tu sitio de Netlify, ve a **Site settings** → **Build & deploy** → **Environment**
2. Agrega las variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Haz un nuevo push a GitHub para que Netlify redeploy automáticamente

### Opción B: Netlify CLI (Manual)

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Conectarte con tu cuenta Netlify
netlify login

# Desplegar
netlify deploy --prod
```

---

## ✅ Listo!

Una vez desplegado, tu sitio estará disponible en:

```
https://nombre-aleatorio.netlify.app
```

O puedes configurar un **dominio personalizado** en Netlify.

---

## 📋 Verificar Despliegue

1. Ve a tu sitio en Netlify
2. Deberías ver:
   - ✅ Build exitoso
   - ✅ Deploy completado
   - ✅ URL en vivo

3. Abre la URL y verifica que:
   - ✅ La app carga correctamente
   - ✅ Puedes crear, editar y eliminar tareas
   - ✅ El drag & drop funciona
   - ✅ El modo oscuro funciona

---

## 🔄 Flujo de Desarrollo Futuro

Después de la configuración inicial, el flujo es simple:

```bash
# 1. Haz cambios en tu código
# 2. Commit y push a GitHub
git add .
git commit -m "Descripción del cambio"
git push

# 3. ¡Netlify redeploy automáticamente!
```

---

## 🐛 Si Algo Sale Mal

### El build falla en Netlify

**Solución:**
1. Verifica que `npm run build` funciona localmente
2. Comprueba que `netlify.toml` existe y es correcto
3. Verifica que no hay errores TypeScript
4. Revisa los logs en Netlify

### El sitio se carga pero no funciona

**Solución:**
1. Abre DevTools (F12)
2. Revisa la consola para errores
3. Verifica que Tailwind CSS está cargado
4. Si usas Supabase, verifica que las variables de entorno están configuradas

---

## 📚 Documentación Útil

- [GitHub Docs](https://docs.github.com)
- [Netlify Docs](https://docs.netlify.com)
- [Netlify GitHub Integration](https://docs.netlify.com/integrations/github/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)

---

## 🎉 ¡Listo!

Tu app estará en vivo en internet en menos de 5 minutos.

**Pasos resumen:**
1. Crea repo en GitHub
2. Push tu código
3. Conecta Netlify a GitHub
4. ¡Listo!
