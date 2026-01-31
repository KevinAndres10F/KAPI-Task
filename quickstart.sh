#!/bin/bash
# Quick Start Script para KAPI Task Board

echo "🚀 Iniciando KAPI Task Board..."
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"
echo "✅ npm detectado: $(npm --version)"
echo ""

# Instalar dependencias
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo "✅ Dependencias instaladas"
else
    echo "✅ Dependencias ya instaladas"
fi
echo ""

# Crear .env.local si no existe
if [ ! -f ".env.local" ]; then
    echo "📝 Creando archivo .env.local..."
    cp .env.example .env.local
    echo "⚠️  Recuerda completar las variables de Supabase en .env.local"
else
    echo "✅ Archivo .env.local ya existe"
fi
echo ""

echo "🎯 Opciones disponibles:"
echo "  npm run dev       - Iniciar servidor de desarrollo"
echo "  npm run build     - Compilar para producción"
echo "  npm run preview   - Ver preview del build"
echo ""

read -p "¿Deseas iniciar el servidor de desarrollo? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    npm run dev
else
    echo "Puedes iniciar el servidor ejecutando: npm run dev"
fi
