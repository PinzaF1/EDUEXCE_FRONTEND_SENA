#!/usr/bin/env node

/**
 * Script de validación de variables de entorno
 * Se ejecuta automáticamente antes de iniciar el servidor
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateEnvFile(filePath, expectedValue) {
  try {
    const content = readFileSync(join(rootDir, filePath), 'utf-8');
    const apiUrlMatch = content.match(/VITE_API_URL=(.+)/);
    
    if (!apiUrlMatch) {
      log('red', `❌ ERROR: No se encontró VITE_API_URL en ${filePath}`);
      return false;
    }
    
    const value = apiUrlMatch[1].trim();
    
    if (value !== expectedValue) {
      log('red', `❌ ERROR: ${filePath} tiene valor incorrecto`);
      log('yellow', `   Esperado: ${expectedValue}`);
      log('yellow', `   Actual: ${value}`);
      log('cyan', `   Para desarrollo local, SIEMPRE debe ser: /api`);
      return false;
    }
    
    log('green', `✅ ${filePath}: Correcto (${value})`);
    return true;
  } catch (err) {
    log('red', `❌ ERROR: No se pudo leer ${filePath}`);
    console.error(err.message);
    return false;
  }
}

function validateViteConfig() {
  try {
    const content = readFileSync(join(rootDir, 'vite.config.ts'), 'utf-8');
    
    // Verificar que existe la configuración del proxy
    if (!content.includes("proxy:")) {
      log('red', '❌ ERROR: No se encontró configuración de proxy en vite.config.ts');
      return false;
    }
    
    if (!content.includes("'/api':")) {
      log('red', '❌ ERROR: No se encontró configuración de /api en el proxy');
      return false;
    }
    
    // Extraer la URL target
    const targetMatch = content.match(/target:\s*['"](.+?)['"]/);
    if (targetMatch) {
      log('green', `✅ vite.config.ts: Proxy configurado`);
      log('cyan', `   Target: ${targetMatch[1]}`);
    }
    
    return true;
  } catch (err) {
    log('red', '❌ ERROR: No se pudo leer vite.config.ts');
    console.error(err.message);
    return false;
  }
}

console.log('\n' + '='.repeat(60));
log('cyan', '🔍 VALIDANDO CONFIGURACIÓN DE ENTORNO');
console.log('='.repeat(60) + '\n');

let allValid = true;

// Validar archivos .env
allValid = validateEnvFile('.env', '/api') && allValid;
allValid = validateEnvFile('.env.development', '/api') && allValid;

console.log('');

// Validar vite.config.ts
allValid = validateViteConfig() && allValid;

console.log('\n' + '='.repeat(60));

if (allValid) {
  log('green', '✅ TODAS LAS VALIDACIONES PASARON CORRECTAMENTE');
  log('cyan', '\n💡 Configuración estable:');
  log('cyan', '   • Variables de entorno: /api');
  log('cyan', '   • Proxy de Vite: Configurado');
  log('cyan', '   • Sin problemas de CORS esperados');
  console.log('='.repeat(60) + '\n');
  process.exit(0);
} else {
  log('red', '❌ ERRORES EN LA CONFIGURACIÓN');
  log('yellow', '\n⚠️  Solución:');
  log('yellow', '   1. Ejecuta: npm run fix:env');
  log('yellow', '   2. O revisa manualmente los archivos señalados');
  console.log('='.repeat(60) + '\n');
  process.exit(1);
}
