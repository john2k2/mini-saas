#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config();

console.log('🔧 Pre-build: Verificando configuración de Prisma...');

// Verificar que existe el esquema de Prisma
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.error('❌ Error: No se encontró prisma/schema.prisma');
  process.exit(1);
}

// Verificar variables de entorno
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL no está configurada');
  process.exit(1);
}

try {
  // Generar cliente Prisma
  console.log('🔨 Generando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Verificar que el cliente se generó correctamente
  const clientPath = path.join(process.cwd(), 'app', 'generated', 'prisma');
  if (!fs.existsSync(clientPath)) {
    console.error('❌ Error: Cliente Prisma no se generó correctamente');
    process.exit(1);
  }
  
  console.log('✅ Pre-build completado exitosamente');
  
} catch (error) {
  console.error('❌ Error en pre-build:', error.message);
  process.exit(1);
}
