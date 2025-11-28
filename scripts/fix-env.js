#!/usr/bin/env node

/**
 * Script para corregir automáticamente la configuración de entorno
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const envContent = `# 🛠️ DESARROLLO LOCAL - NO MODIFICAR
# Esta configuración usa el proxy de Vite (vite.config.ts)
# Las peticiones van a /api/* y Vite las redirige automáticamente

VITE_API_URL=/api
VITE_ENV=development

# ⚠️ IMPORTANTE: NUNCA cambies /api por una URL completa
# Para cambiar el backend de ngrok, edita vite.config.ts
`;

console.log('🔧 Corrigiendo archivos de entorno...\n');

try {
  writeFileSync(join(rootDir, '.env'), envContent);
  console.log('✅ .env corregido');
  
  writeFileSync(join(rootDir, '.env.development'), envContent);
  console.log('✅ .env.development corregido');
  
  console.log('\n✅ Configuración restablecida correctamente');
  console.log('💡 Ahora ejecuta: npm run dev\n');
} catch (err) {
  console.error('❌ Error al corregir archivos:', err.message);
  process.exit(1);
}
