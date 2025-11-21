# 🚀 AWS S3 + CloudFront - Configuración para SPA

## Problema
Las Single Page Applications (SPA) como React manejan el routing en el cliente. Cuando un usuario accede directamente a `/dashboard/estudiantes` o refresca la página, S3 devuelve un error 404 porque ese archivo no existe físicamente.

## Solución para CloudFront

### 1. Configuración de Error Pages en CloudFront

En la consola de CloudFront → Distribution → Error Pages:

**Error 403 (Forbidden):**
- HTTP Error Code: `403`
- Response Page Path: `/index.html`
- HTTP Response Code: `200`
- TTL: `300` segundos

**Error 404 (Not Found):**
- HTTP Error Code: `404`
- Response Page Path: `/index.html`
- HTTP Response Code: `200`
- TTL: `300` segundos

Esto redirige todos los errores 403/404 a `index.html`, permitiendo que React Router maneje la ruta.

### 2. Validación

Después del deploy, prueba estas URLs directamente:
```
https://[tu-cloudfront-id].cloudfront.net/
https://[tu-cloudfront-id].cloudfront.net/dashboard
https://[tu-cloudfront-id].cloudfront.net/dashboard/estudiantes
https://[tu-cloudfront-id].cloudfront.net/login
```

Todas deben cargar correctamente sin error 404.

### 3. Alternativa: Usar Lambda@Edge (Avanzado)

Si necesitas más control, puedes usar Lambda@Edge para modificar las respuestas, pero **esto NO es gratis** después del Free Tier.

## Notas
- El archivo `_redirects` en `/public` es para servicios como Netlify/Vercel
- CloudFront NO usa archivos `_redirects`, requiere configuración en la consola
- La configuración de Error Pages es **permanente** y gratuita
