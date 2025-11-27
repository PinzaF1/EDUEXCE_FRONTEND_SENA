# 🚀 Guía Completa de Deploy - EDUEXCE Frontend
## S3 + CloudFront (AWS Free Tier - 100% GRATIS)

---

## 📋 **Pre-requisitos**

### 1. AWS CLI Instalado
```powershell
# Verificar instalación
aws --version

# Si no está instalado, descargar de:
# https://aws.amazon.com/cli/
```

### 2. Configurar Credenciales AWS
```powershell
aws configure
# AWS Access Key ID: [tu-access-key]
# AWS Secret Access Key: [tu-secret-key]
# Default region: us-east-1
# Default output format: json
```

### 3. Verificar Node.js y npm
```powershell
node --version  # v18+
npm --version   # v9+
```

---

## 🏗️ **PASO 1: Crear Bucket S3**

### 1.1. Crear bucket
```powershell
aws s3 mb s3://eduexce-frontend-prod --region us-east-1
```

### 1.2. Configurar para hosting estático
```powershell
# Habilitar hosting web
aws s3 website s3://eduexce-frontend-prod --index-document index.html --error-document index.html
```

### 1.3. Configurar política de bucket
Crear archivo `bucket-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::eduexce-frontend-prod/*"
    }
  ]
}
```

Aplicar política:
```powershell
aws s3api put-bucket-policy --bucket eduexce-frontend-prod --policy file://bucket-policy.json
```

---

## ☁️ **PASO 2: Crear CloudFront Distribution**

### 2.1. Crear archivo de configuración CloudFront
Crear `cloudfront-config.json`:
```json
{
  "CallerReference": "eduexce-frontend-2025",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-eduexce-frontend-prod",
        "DomainName": "eduexce-frontend-prod.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultRootObject": "index.html",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-eduexce-frontend-prod",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "Compress": true,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      },
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Comment": "EDUEXCE Frontend - Free Tier",
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
```

### 2.2. Crear distribución (desde AWS Console - más fácil)
1. Ve a **CloudFront Console**: https://console.aws.amazon.com/cloudfront/
2. Click **Create Distribution**
3. Configuración:
   - **Origin Domain**: `eduexce-frontend-prod.s3.amazonaws.com`
   - **Viewer Protocol Policy**: Redirect HTTP to HTTPS
   - **Compress Objects**: Yes
   - **Price Class**: Use North America and Europe (más barato)
   - **Default Root Object**: `index.html`
4. Click **Create Distribution**
5. **Anota el Distribution ID** (ej: `E1ABCDEF123456`)

### 2.3. Configurar Error Pages (CRÍTICO para SPA)
1. Ve a tu distribución → **Error Pages**
2. Click **Create Custom Error Response**

**Error 403:**
- HTTP Error Code: `403`
- Customize Error Response: `Yes`
- Response Page Path: `/index.html`
- HTTP Response Code: `200`
- Error Caching Minimum TTL: `300`

**Error 404:**
- HTTP Error Code: `404`
- Customize Error Response: `Yes`
- Response Page Path: `/index.html`
- HTTP Response Code: `200`
- Error Caching Minimum TTL: `300`

---

## 🔨 **PASO 3: Build y Deploy**

### 3.1. Verificar variables de entorno
```powershell
# Verificar .env.production existe
Get-Content .env.production

# Debe mostrar:
# VITE_API_URL=http://52.20.236.109:3333
# VITE_ENV=production
```

### 3.2. Generar build de producción
```powershell
# Build optimizado
npm run build:prod

# Analizar tamaño del bundle (opcional)
npm run build:analyze
```

### 3.3. Verificar tamaño del build
```powershell
# Ver tamaño de la carpeta dist
(Get-ChildItem -Path dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
# Debe ser < 2 MB
```

### 3.4. Deploy a S3
```powershell
# Subir archivos (excepto index.html)
npm run deploy:s3

# Subir index.html con no-cache
npm run deploy:index
```

### 3.5. Actualizar Distribution ID en package.json
Editar `package.json` y reemplazar `DISTRIBUTION_ID` con tu ID real:
```json
"deploy:invalidate": "aws cloudfront create-invalidation --distribution-id E1ABCDEF123456 --paths \"/*\""
```

### 3.6. Invalidar caché de CloudFront
```powershell
npm run deploy:invalidate
```

---

## ✅ **PASO 4: Verificación**

### 4.1. Obtener URL de CloudFront
```powershell
aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='EDUEXCE Frontend - Free Tier'].DomainName" --output text
```

Resultado: `d1234abcd5678.cloudfront.net`

### 4.2. Probar URLs
```
https://d1234abcd5678.cloudfront.net/
https://d1234abcd5678.cloudfront.net/login
https://d1234abcd5678.cloudfront.net/dashboard
https://d1234abcd5678.cloudfront.net/dashboard/estudiantes
```

Todas deben cargar correctamente sin 404.

### 4.3. Probar conexión con backend
1. Abre DevTools → Network
2. Navega a `/login`
3. Intenta hacer login
4. Verifica que las peticiones van a `http://52.20.236.109:3333`

---

## 🔄 **Deploys Futuros (Actualizaciones)**

### Deploy completo (un solo comando)
```powershell
npm run deploy:full
```

Este comando hace:
1. ✅ Build de producción
2. ✅ Sube archivos a S3
3. ✅ Sube index.html con no-cache
4. ✅ Invalida caché de CloudFront

---

## 💰 **Monitoreo de Costos (GRATIS)**

### Verificar uso del Free Tier
```powershell
# S3 usage
aws cloudwatch get-metric-statistics --namespace AWS/S3 --metric-name BucketSizeBytes --dimensions Name=BucketName,Value=eduexce-frontend-prod Name=StorageType,Value=StandardStorage --start-time 2025-01-01T00:00:00Z --end-time 2025-12-31T23:59:59Z --period 86400 --statistics Average

# CloudFront requests
aws cloudwatch get-metric-statistics --namespace AWS/CloudFront --metric-name Requests --start-time 2025-11-01T00:00:00Z --end-time 2025-11-20T23:59:59Z --period 86400 --statistics Sum
```

### Configurar Alerta de Facturación
1. Ve a **AWS Billing Console**: https://console.aws.amazon.com/billing/
2. **Billing Preferences** → Enable **Receive Billing Alerts**
3. Ve a **CloudWatch** → **Alarms** → **Create Alarm**
4. Configura alerta si el gasto > $0.80

---

## 📊 **Límites del Free Tier (12 meses)**

| Servicio | Límite Mensual | Uso Estimado | Estado |
|----------|----------------|--------------|--------|
| S3 Storage | 5 GB | 50-100 MB | ✅ 2% |
| S3 GET Requests | 20,000 | ~10,000 | ✅ 50% |
| S3 PUT Requests | 2,000 | ~50 | ✅ 2.5% |
| CloudFront Transfer | 50 GB | 5-10 GB | ✅ 20% |
| CloudFront Requests | 2,000,000 | ~50,000 | ✅ 2.5% |

**Riesgo de exceder:** < 1% con 100-500 usuarios

---

## 🐛 **Troubleshooting**

### Error: "AccessDenied" al subir a S3
```powershell
# Verificar credenciales
aws sts get-caller-identity

# Verificar permisos del bucket
aws s3api get-bucket-policy --bucket eduexce-frontend-prod
```

### Error 404 en rutas del SPA
- Verifica que configuraste **Custom Error Responses** en CloudFront
- Espera 10-15 minutos para que los cambios se propaguen

### CloudFront sirve versión antigua
```powershell
# Invalida toda la caché
aws cloudfront create-invalidation --distribution-id E1ABCDEF123456 --paths "/*"
```

### Build demasiado grande (>2MB)
```powershell
# Analizar bundle
npm run build:analyze

# Ver qué librerías ocupan más espacio
# Considera remover librerías no usadas
```

---

## 🔐 **Seguridad**

### CORS ya configurado en backend
✅ El backend acepta peticiones desde CloudFront
✅ Frontend usa HTTPS (CloudFront)
✅ Backend usa HTTP (EC2) - Cambiar a HTTPS en producción

### Recomendación: Agregar HTTPS al backend
```bash
# En tu servidor EC2, instalar Let's Encrypt
sudo apt install certbot
sudo certbot --nginx -d tudominio.com
```

Luego actualiza `.env.production`:
```env
VITE_API_URL=https://tudominio.com:3333
```

---

## 🎯 **Scripts Disponibles**

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor desarrollo local |
| `npm run build` | Build estándar |
| `npm run build:prod` | Build optimizado para producción |
| `npm run build:analyze` | Build + análisis de bundle |
| `npm run deploy:s3` | Subir assets a S3 |
| `npm run deploy:index` | Subir index.html con no-cache |
| `npm run deploy:invalidate` | Invalidar caché CloudFront |
| `npm run deploy:full` | Deploy completo (build + S3 + invalidate) |

---

## 📞 **Contacto y Soporte**

- **Documentación AWS S3**: https://docs.aws.amazon.com/s3/
- **Documentación CloudFront**: https://docs.aws.amazon.com/cloudfront/
- **Free Tier AWS**: https://aws.amazon.com/free/

---

**¡Tu frontend está listo para desplegarse con $0 de costo! 🎉**
