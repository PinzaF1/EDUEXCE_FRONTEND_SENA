# 🧪 Guía: Configuración del Backend de Testing

## ⚠️ PROBLEMA CRÍTICO RESUELTO

**Antes:** Las pruebas de Cypress estaban usando la base de datos de **producción** (`https://zavira-v8.onrender.com`), lo que significaba que cada test modificaba datos reales.

**Ahora:** Las pruebas están configuradas para usar un **backend de testing separado** con su propia base de datos aislada.

---

## 📋 Requisitos

Para que las pruebas funcionen correctamente, necesitas:

1. **Un backend de testing separado** (clon del backend de producción)
2. **Una base de datos de pruebas** (separada de producción)
3. **Datos seed** para pruebas consistentes

---

## 🚀 Opciones de Configuración

### **Opción 1: Backend Local (Recomendado para desarrollo)**

#### Paso 1: Clonar el repositorio del backend
```bash
git clone <URL_DEL_BACKEND_REPO>
cd backend
```

#### Paso 2: Configurar variables de entorno
Crear un archivo `.env.testing` en el backend con:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/zavira_testing
PORT=3000
JWT_SECRET=<mismo_secret_de_produccion>
NODE_ENV=testing
```

#### Paso 3: Crear base de datos de testing
```bash
# PostgreSQL
createdb zavira_testing

# O con psql
psql -U postgres
CREATE DATABASE zavira_testing;
```

#### Paso 4: Ejecutar migraciones y seeds
```bash
npm install
npm run migrate
npm run seed:testing  # Crear datos de prueba
```

#### Paso 5: Iniciar el backend de testing
```bash
npm run dev  # Debe correr en http://localhost:3000
```

#### Paso 6: Actualizar frontend
En `ZAVIRA_SENA_FRONTEND/.env.testing`:
```env
VITE_API_URL=http://localhost:3000
```

---

### **Opción 2: Backend en Render (Producción de testing)**

#### Paso 1: Crear nueva instancia en Render
1. Ve a [render.com](https://render.com)
2. Crear nuevo **Web Service**
3. Conectar el mismo repositorio del backend
4. Nombrar: `zavira-backend-testing`

#### Paso 2: Crear base de datos separada
1. En Render, crear nueva **PostgreSQL Database**
2. Nombrar: `zavira-db-testing`
3. Copiar la `DATABASE_URL`

#### Paso 3: Configurar variables de entorno
En la instancia de testing de Render:
```env
DATABASE_URL=<url_de_la_bd_de_testing>
PORT=3000
JWT_SECRET=<mismo_secret_de_produccion>
NODE_ENV=testing
```

#### Paso 4: Desplegar y seed
```bash
# Esperar a que se despliegue
# Luego ejecutar seed desde terminal o script
```

#### Paso 5: Actualizar frontend
En `ZAVIRA_SENA_FRONTEND/.env.testing`:
```env
VITE_API_URL=https://zavira-backend-testing.onrender.com
```

---

### **Opción 3: Usar ngrok (desarrollo local con exposición)**

Si ya tienes el backend corriendo localmente con ngrok:

#### En `.env.testing`:
```env
VITE_API_URL=https://gillian-semiluminous-blubberingly.ngrok-free.dev
```

**⚠️ ADVERTENCIA:** Asegúrate de que este backend use una base de datos de testing, NO producción.

---

## 🗄️ Estructura de Datos Seed Requeridos

Tu backend de testing debe tener estos datos iniciales:

### Usuarios de prueba
```sql
INSERT INTO admins (correo, password, nombre) VALUES
('test@example.com', '<hash_de_test123456>', 'Usuario Test'),
('admin@test.com', '<hash_de_admin123>', 'Admin Test');
```

### Estudiantes de prueba
```sql
INSERT INTO estudiantes (nombre, documento, estado) VALUES
('Estudiante Prueba 1', '1234567890', 'activo'),
('Estudiante Prueba 2', '0987654321', 'activo');
```

---

## ✅ Verificación

### 1. Verificar que el backend de testing está corriendo
```bash
# Probar endpoint de salud
curl http://localhost:3000/health
# O
curl https://zavira-backend-testing.onrender.com/health
```

### 2. Verificar login de prueba
```bash
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"test@example.com","password":"test123456"}'
```

### 3. Ejecutar pruebas
```bash
# En ZAVIRA_SENA_FRONTEND
npm run test:smoke
```

Si ves errores de conexión, verifica:
- ✅ Backend de testing está corriendo
- ✅ `.env.testing` tiene la URL correcta
- ✅ Base de datos de testing existe y tiene datos seed

---

## 🔒 Seguridad

### Separación de ambientes
```
┌─────────────────────────────────────────────────┐
│              PRODUCCIÓN                         │
│  Backend: zavira-v8.onrender.com                │
│  DB: zavira-production                          │
│  Datos: REALES, NO TOCAR                        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              TESTING                             │
│  Backend: localhost:3000 o zavira-testing       │
│  DB: zavira_testing                             │
│  Datos: FAKE, se puede destruir/recrear         │
└─────────────────────────────────────────────────┘
```

### Reglas
- ✅ **NUNCA** ejecutar tests contra producción
- ✅ Los datos de testing pueden ser destruidos
- ✅ Mantener credenciales de testing separadas
- ✅ Documentar usuarios/datos de testing

---

## 🛠️ Comandos Útiles

### Ejecutar pruebas con backend de testing
```bash
npm run test           # Todas las pruebas
npm run test:open      # Abrir Cypress UI
npm run test:smoke     # Solo smoke tests
npm run test:auth      # Solo autenticación
npm run test:students  # Solo CRUD estudiantes
```

### Resetear base de datos de testing
```bash
# En el backend
npm run db:reset:testing
npm run seed:testing
```

---

## 📝 Próximos Pasos

1. ✅ Configurar el backend de testing (elegir opción 1, 2 o 3)
2. ✅ Crear base de datos separada
3. ✅ Ejecutar seeds con datos de prueba
4. ✅ Actualizar `.env.testing` con la URL correcta
5. ✅ Ejecutar `npm run test:smoke` para verificar
6. ✅ Documentar credenciales de testing en el equipo

---

## ❓ FAQ

### ¿Por qué necesito un backend separado?
Para evitar modificar/eliminar datos reales de producción durante las pruebas.

### ¿Puedo usar la misma base de datos con diferentes tablas?
**NO RECOMENDADO.** Es mejor tener bases de datos completamente separadas.

### ¿Qué pasa si ejecuto tests sin configurar esto?
Los tests fallarán o (peor) modificarán datos de producción.

### ¿Cómo actualizo la URL del backend de testing?
Edita `ZAVIRA_SENA_FRONTEND/.env.testing` y cambia `VITE_API_URL`.

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que el backend de testing esté corriendo
2. Revisa los logs del backend
3. Confirma que `.env.testing` existe y tiene la URL correcta
4. Ejecuta `npm run test:smoke` para diagnóstico rápido
