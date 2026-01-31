# ✅ Checklist - Configuración de Supabase

Sigue estos pasos en orden para configurar la persistencia de datos con Supabase.

## 📋 Preparación

- [ ] Tener una cuenta de correo electrónico
- [ ] Tener acceso a un navegador web
- [ ] Tener el proyecto KAPI-Task clonado localmente

---

## 🗄️ Parte 1: Configurar Supabase (15 minutos)

### Crear Proyecto
- [ ] 1. Ir a [supabase.com](https://supabase.com)
- [ ] 2. Crear cuenta o iniciar sesión
- [ ] 3. Click en **"New Project"**
- [ ] 4. Completar formulario:
  - [ ] Name: `KAPI-Task-Board`
  - [ ] Database Password: _(guarda esta contraseña)_
  - [ ] Region: _(selecciona la más cercana)_
  - [ ] Plan: **Free**
- [ ] 5. Click en **"Create new project"**
- [ ] 6. Esperar 2-3 minutos

### Obtener Credenciales
- [ ] 7. Ir a **Settings** → **API**
- [ ] 8. Copiar **Project URL**: `https://xxxxx.supabase.co`
- [ ] 9. Copiar **anon public key**: `eyJ...`
- [ ] 10. Guardar estas credenciales en un lugar seguro

### Crear Base de Datos
- [ ] 11. Ir a **SQL Editor** en el menú lateral
- [ ] 12. Click en **"New query"**
- [ ] 13. Abrir el archivo `supabase-setup.sql`
- [ ] 14. Copiar TODO el contenido del archivo
- [ ] 15. Pegar en el SQL Editor de Supabase
- [ ] 16. Click en **"Run"** (o presionar Ctrl/Cmd + Enter)
- [ ] 17. Verificar que aparezca "Success. No rows returned"

### Verificar Tabla Creada
- [ ] 18. Ir a **Table Editor** → **tasks**
- [ ] 19. Verificar que la tabla existe y tiene las columnas correctas
- [ ] 20. Ir a **Authentication** → **Policies**
- [ ] 21. Verificar que existen 4 políticas para la tabla `tasks`

---

## 🔧 Parte 2: Configurar Proyecto Local (5 minutos)

### Variables de Entorno
- [ ] 22. Abrir terminal en la carpeta del proyecto
- [ ] 23. Ejecutar: `cp .env.example .env`
- [ ] 24. Abrir el archivo `.env`
- [ ] 25. Reemplazar `https://your-project.supabase.co` con tu **Project URL**
- [ ] 26. Reemplazar `your-anon-key-here` con tu **anon public key**
- [ ] 27. Guardar el archivo `.env`

### Instalar Dependencias
- [ ] 28. Ejecutar: `npm install`
- [ ] 29. Esperar a que termine la instalación

---

## 🧪 Parte 3: Probar Localmente (10 minutos)

### Iniciar Aplicación
- [ ] 30. Ejecutar: `npm run dev`
- [ ] 31. Abrir navegador en `http://localhost:5173`
- [ ] 32. Verificar que la app carga correctamente

### Crear Usuario
- [ ] 33. Click en **"Sign Up"** en la aplicación
- [ ] 34. Ingresar email y contraseña
- [ ] 35. Click en **"Sign Up"**
- [ ] 36. Verificar que aparece el email en la esquina superior derecha

### Probar Funcionalidades
- [ ] 37. Crear una tarea de prueba
- [ ] 38. Editar la tarea
- [ ] 39. Agregar una fecha límite
- [ ] 40. Cambiar la prioridad
- [ ] 41. Mover la tarea a otra columna (drag & drop)
- [ ] 42. Ver el calendario y verificar que aparece la tarea

### Verificar Persistencia
- [ ] 43. Cerrar sesión
- [ ] 44. Iniciar sesión de nuevo
- [ ] 45. Verificar que la tarea sigue ahí
- [ ] 46. Recargar la página (F5)
- [ ] 47. Verificar que la tarea sigue ahí

### Verificar en Supabase
- [ ] 48. Ir a Supabase → **Table Editor** → **tasks**
- [ ] 49. Verificar que aparece la tarea creada
- [ ] 50. Ir a **Authentication** → **Users**
- [ ] 51. Verificar que aparece el usuario registrado

---

## 🚀 Parte 4: Deploy a Producción (15 minutos)

### Configurar Netlify
- [ ] 52. Ir a [netlify.com](https://netlify.com)
- [ ] 53. Iniciar sesión o crear cuenta
- [ ] 54. Click en **"Add new site"** → **"Import an existing project"**
- [ ] 55. Seleccionar **GitHub**
- [ ] 56. Buscar y seleccionar **KAPI-Task**
- [ ] 57. Verificar configuración automática:
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `dist`
- [ ] 58. Click en **"Deploy site"**
- [ ] 59. Esperar 2-5 minutos

### Agregar Variables de Entorno en Netlify
- [ ] 60. En Netlify, ir a **Site settings** → **Build & deploy** → **Environment**
- [ ] 61. Click en **"Add variable"**
- [ ] 62. Agregar:
  - Key: `VITE_SUPABASE_URL`
  - Value: _(tu Project URL)_
- [ ] 63. Click en **"Add variable"** de nuevo
- [ ] 64. Agregar:
  - Key: `VITE_SUPABASE_ANON_KEY`
  - Value: _(tu anon key)_
- [ ] 65. Click en **"Save"**
- [ ] 66. Ir a **Deploys**
- [ ] 67. Click en **"Trigger deploy"** → **"Clear cache and deploy site"**
- [ ] 68. Esperar 2-5 minutos

### Probar en Producción
- [ ] 69. Abrir la URL de Netlify (ej: `https://xxxxx.netlify.app`)
- [ ] 70. Crear una cuenta nueva
- [ ] 71. Crear una tarea de prueba
- [ ] 72. Verificar que funciona todo correctamente
- [ ] 73. Cerrar sesión y volver a entrar
- [ ] 74. Verificar que la tarea persiste

---

## 🎉 ¡Completado!

Si marcaste todos los checkboxes, ¡felicidades! Tu aplicación está funcionando con Supabase.

### Lo que has logrado:
✅ Base de datos en la nube configurada
✅ Sistema de autenticación funcional
✅ Datos persistentes y seguros
✅ Aplicación desplegada en producción
✅ Cada usuario tiene sus propias tareas
✅ Funciona desde cualquier dispositivo

---

## 📚 Recursos

- **Documentación detallada**: Ver `SUPABASE_SETUP.md`
- **Arquitectura del sistema**: Ver `ARCHITECTURE.md`
- **Inicio rápido**: Ver `QUICKSTART_SUPABASE.md`
- **Deploy**: Ver `GITHUB_NETLIFY.md`

---

## 🆘 ¿Problemas?

Si algo no funciona:
1. Revisa la consola del navegador (F12) para ver errores
2. Verifica que las variables de entorno estén correctas
3. Asegúrate de que el usuario esté autenticado
4. Consulta la sección de "Solución de Problemas" en `SUPABASE_SETUP.md`

---

## 🔄 Mantenimiento

De ahora en adelante:
- Para agregar cambios: `git push origin main`
- Netlify hará deploy automático
- Las tareas se guardan automáticamente en Supabase
- Los usuarios pueden registrarse libremente
