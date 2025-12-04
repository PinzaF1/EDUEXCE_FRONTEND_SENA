# ISSUE: Códigos de verificación no llegan por correo (Recuperación de contraseña)

Resumen
- Fecha: 2025-12-01
- Repositorio frontend: `ZAVIRA_SENA_FRONTEND` (branch: `test-backend-url`)
- Problema: Los usuarios solicitan el código de verificación para recuperación de contraseña pero **no reciben el correo**. El frontend confirma que la petición al endpoint de solicitud se completa (o devuelve una respuesta) pero no hay entrega de email.

Contexto técnico (frontend)
- Endpoints usados por la UI de recuperación:
  - `POST /auth/recovery/admin/solicitar` -> enviar código al correo
  - `POST /auth/recovery/admin/verificar` -> verificar código (payload `{ correo, codigo }`)
  - `POST /auth/recovery/admin/restablecer-codigo` -> restablecer con código (payload `{ correo, codigo, nueva_password }`)
  - Además hay un flujo con token: `POST /auth/recovery/admin/restablecer` (payload `{ token, nueva }`) y `GET`/`pages` que muestran token en querystring.
- Cambios frontend: se añadieron `console.debug` en `src/components/auth/PasswordRequest.tsx` para capturar la respuesta del backend de estos endpoints:
  - `[PasswordRequest] solicitarCodigo response:`
  - `[PasswordRequest] verificarCodigo response:`
  - `[PasswordRequest] restablecerPassword response:`

Qué se ha verificado desde frontend
- Se probó manualmente con PowerShell `Invoke-RestMethod` hacia `http://localhost:5174/api/auth/recovery/admin/solicitar` (ajustar host/puerto si procede).
- Resultado observado por el usuario: la UI no recibe el correo en la bandeja de entrada (ni spam). No se confirmaron errores visibles en la respuesta del endpoint desde frontend (pero por favor ver logs abajo para la respuesta exacta si la tienen).

Pasos para reproducir (desde local frontend)
1. En el frontend, abrir `Recuperar Contraseña` y solicitar el código para `correo = admin@institucion.edu.co`.
2. Observar en DevTools la consola los `console.debug` añadidos.
3. Alternativa CLI (PowerShell):

```powershell
$body = @{ correo = 'usuario@institucion.edu.co' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:5174/api/auth/recovery/admin/solicitar' -Body $body -ContentType 'application/json'
```

Comandos de verificación adicionales (verificar, restablecer):
```powershell
$body = @{ correo = 'usuario@institucion.edu.co'; codigo = '123456' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:5174/api/auth/recovery/admin/verificar' -Body $body -ContentType 'application/json'

$body = @{ correo = 'usuario@institucion.edu.co'; codigo = '123456'; nueva_password = 'NuevaClave123' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:5174/api/auth/recovery/admin/restablecer-codigo' -Body $body -ContentType 'application/json'
```

Información útil para backend (por favor adjuntar si la tienen)
- Respuesta JSON completa de la petición `POST /auth/recovery/admin/solicitar` (stdout de `Invoke-RestMethod` o `console.debug` del navegador).
- Logs del servidor (timestamp) en el momento de la solicitud: incluir cualquier excepción, intento de envío SMTP, o colas de trabajos.
- Si usan sistema de colas (worker), logs del worker/queue para el job de envío de email.
- Tabla o registro donde se guarda el código de recuperación (si existe).

Checklist de investigación sugerida (backend)
- [ ] Confirmar que el endpoint `POST /auth/recovery/admin/solicitar` genera y persiste el código de recuperación correctamente en la BD (si corresponde).
  - SQL sugerido (ajustar nombres de tabla/columnas):
    - SELECT * FROM recuperacion_password WHERE correo = 'usuario@institucion.edu.co' ORDER BY creado_at DESC LIMIT 5;
    - SELECT COUNT(*) FROM seguimiento WHERE id_institucion = <id> AND fecha BETWEEN '2025-07-01' AND '2025-12-01'; (contexto de rendimiento, si hace falta)
- [ ] Revisar el proceso de envío de correo:
  - ¿Se realiza el envío sincrónico en la misma request o mediante job/queue? Si es job, ¿el job fue encolado y ejecutado correctamente?
  - Logs SMTP: errores de autenticación, rechazo del relay, tiempo de espera, problemas TLS.
  - Plantilla de email: verificar que la plantilla no arroja errores al renderizar (lo que podría abortar el envío).
- [ ] Revisar los encabezados/roles del remitente (From): algunos proveedores bloquean correos con From no validado.
- [ ] Revisar listas negras / filtros (proveedor de correo): ¿se está bloqueando por contenido o por IP?
- [ ] Verificar que el código enviado tiene expiración correcta y formato de 6 dígitos (según frontend espera).
- [ ] Revisar límites/rate-limiting: si se expendió límite de correos en entorno de prueba/sandbox.
- [ ] Revisar si el correo fue enviado a cola de correos (por ejemplo, Mailgun/Sendgrid logs) y su estado (delivered/bounced/rejected).

Datos que el frontend puede aportar rápidamente
- Hora exacta de la solicitud (timestamp local). Ejemplo: `2025-12-01T10:12:34.567-05:00`.
- Correo usado en la prueba: `usuario@institucion.edu.co`.
- Output de `Invoke-RestMethod` o contenido de la consola del navegador (`console.debug`) a pegar aquí.

Posibles causas y acciones rápidas
- Causa: endpoint devuelve `success: true` pero el envío falla en SMTP o en worker.
  - Acción: revisar logs de SMTP/provider, reintentar enviar manualmente con provider UI.
- Causa: endpoint no genera código ni guarda registro (frontend cree que lo hizo).
  - Acción: revisar código del endpoint y la transacción DB.
- Causa: proveedor de correo en modo sandbox (no envía a direcciones no verificadas).
  - Acción: comprobar configuración del entorno (sandbox vs producción).

Resultado esperado por la UI
- Al `POST /auth/recovery/admin/solicitar` la app debe devolver `{ success: true }` (o similar) y el correo debe entregarse con el código de 6 dígitos.
- Si el envío falla, el backend debería devolver un error explicativo y loguear la causa para diagnosticar (ej: "SMTP auth failed", "Mail queued but worker failed").

Prioridad
- Alta: bloquea la recuperación de cuentas por parte de administradores/usuarios.

Sugerencia de next-steps para backend
1. Ejecutar una solicitud `solicitar` desde local y buscar logs del servidor para ese timestamp.
2. Si usan proveedor (Mailgun/SES/Sendgrid), revisar la columna de eventos para el email destino.
3. Validar que la fila de recuperación (o tabla similar) contiene el código y la expiración.
4. Si el envío es mediante worker, verificar la cola y el estado del worker.
5. Responder en este issue con: logs del servidor + salida del proveedor de correo + confirmación de persistencia del código.

---

Adjunto: sugerencias de comandos (para backend)
- Buscar intentos en logs (Linux):
```bash
# ajustar ruta de logs
sudo grep "auth/recovery" /var/log/app/*.log | tail -n 200
# o, buscar por correo
sudo grep "usuario@institucion.edu.co" -R /var/log/app/ | tail -n 200
```
- Consultar la tabla de recuperación (ejemplo genérico):
```sql
SELECT id, correo, codigo, creado_at, expiracion, usado FROM recovery_codes WHERE correo = 'usuario@institucion.edu.co' ORDER BY creado_at DESC LIMIT 10;
```

Contacto
- Frontend: equipo del repositorio `ZAVIRA_SENA_FRONTEND` (branch `test-backend-url`).
- Notas: el frontend agregó `console.debug` para ayudar a replicar respuestas; pedir al usuario los `console.debug` outputs si los logs backend no muestran el problema.

Gracias — por favor respondan con los logs solicitados o indíquenme si quieren que genere directamente un issue en el tracker (necesito título y la plataforma: GitHub/GitLab/Jira) y lo subo con este contenido.


## EVIDENCIA (PEGAR AQUÍ la salida EXACTA de UNA prueba)

Por favor pegar SOLO UNA prueba completa siguiendo exactamente este formato (el backend necesita correlacionar por timestamp):

- Timestamp (ej.: 2025-12-02T09:30:12.123-05:00)
- Zona horaria (ej.: -05:00)
- Correo usado en la prueba (ej.: usuario@institucion.edu.co)

Salida completa (pegar JSON y status):

- [PasswordRequest] solicitarCodigo response:
  - HTTP status: <número>
  - Response body (JSON completo):
    <pegar aquí el JSON EXACTO>

- [PasswordRequest] verificarCodigo response:
  - HTTP status: <número>
  - Response body (JSON completo):
    <pegar aquí el JSON EXACTO>

- [PasswordRequest] restablecerPassword response:
  - HTTP status: <número>
  - Response body (JSON completo):
    <pegar aquí el JSON EXACTO>

Network (opcional pero muy útil):
- Request: POST /api/auth/recovery/admin/solicitar
  - Request headers: <pegar aquí todos los request headers>
  - Request payload (body): <pegar aquí el JSON enviado>
  - Response headers: <pegar aquí todos los response headers>
  - Response body (JSON): <pegar aquí el JSON EXACTO>

PowerShell (si se usó `Invoke-RestMethod`): pegar la salida textual completa que devolvió el comando.

Si hubo un error en consola (stack/trace), pegar el stack/trace exacto.

---

Una vez pegues la evidencia en este bloque, actualizaré el issue y lo prepararé para crear (o actualizar) el ticket en el tracker del backend.


### EVIDENCIA AÑADIDA (prueba ejecutada por frontend)

- Timestamp: 2025-12-02T08:42:36.0881736-05:00
- Zona horaria: -05:00
- Correo usado en la prueba: bryandreshurtado18@gmail.com

Salida completa (pegar JSON y status):

[PasswordRequest] solicitarCodigo response:

HTTP status: 200
Response body (JSON completo):
{"success":true,"message":"Código enviado por email"}

[PasswordRequest] verificarCodigo response:

HTTP status: N/A
Response body (JSON completo):
N/A (no ejecutado en esta prueba)

[PasswordRequest] restablecerPassword response:

HTTP status: N/A
Response body (JSON completo):
N/A (no ejecutado en esta prueba)

Network (opcional pero muy útil):

Request: POST /api/auth/recovery/admin/solicitar (ejecutado en `http://localhost:5174`)
Request headers: (no capturados desde PowerShell en esta ejecución)
Request payload (body): {"correo":"bryandreshurtado18@gmail.com"}
Response headers:
Key            Value
---            -----
Vary           Origin
connection     close
x-request-id   bdqyldpqta2yael30pvrixrb
Content-Length 54
Content-Type   application/json; charset=utf-8
Date           Tue, 02 Dec 2025 13:42:34 GMT
Server         nginx/1.24.0 (Ubuntu)
Response body (JSON): {"success":true,"message":"Código enviado por email"}

PowerShell (salida JSON completa compacta):
{"body":"{\"success\":true,\"message\":\"C\u00f3digo enviado por email\"}","timestamp":"2025-12-02T08:42:36.0881736-05:00","correo":"bryandreshurtado18@gmail.com","headers":"Key            Value                          \r\n---            -----                          \r\nVary           Origin                         \r\nconnection     close                 \r\n x-request-id   bdqyldpqta2yael30pvrixrb       \r\nContent-Length 54         \r\nContent-Type   application/json; charset=utf-8\r\nDate           Tue, 02 Dec 2025 13:42:34 GMT  \r\nServer         nginx/1.24.0 (Ubuntu)","timezone":"-05:00","status":200}

---

Nota: la prueba ejecutada solo llamó al endpoint de "solicitar"; si desean que capture también "verificar" y "restablecer-codigo" puedo ejecutar las tres llamadas consecutivas y agregar las respuestas en el mismo formato.


## ENTREGA CONFIRMADA POR FRONTEND

- Fecha: 2025-12-02T08:46:50.5376057-05:00
- Probador: Frontend (local)
- Correo probado: bryandreshurtado18@gmail.com
- Resultado: el endpoint `POST /auth/recovery/admin/solicitar` respondió 200 con `{"success":true,"message":"Código enviado por email"}` y el equipo frontend confirmó que el código **sí llegó** al buzón (o fue recuperado desde Redis para pruebas).

Acción recomendada: si la verificación completa del flujo (introducir código en UI → restablecer contraseña) funciona correctamente, marcar este issue como `resuelto` en el tracker. Si hubiese inconsistencias en verificación o restablecimiento, por favor pegar la salida completa de las llamadas `verificar` y `restablecer-codigo` para seguir investigando.
