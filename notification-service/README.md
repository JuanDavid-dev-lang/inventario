# 📧 Servicio de Notificaciones por Correo

Servicio dedicado para enviar notificaciones por correo de todas las transacciones de inventario.

## 🚀 Características

- ✅ Envía correos automáticamente cuando se registran transacciones
- ✅ Integración con Gmail (SMTP)
- ✅ Detalles completos de la transacción en el correo
- ✅ Endpoint de prueba para validar configuración
- ✅ Monitoreo de estado del servicio

## 📋 Requisitos Previos

### Para Gmail:
1. Habilita la verificación de dos factores en tu cuenta Gmail
2. Ve a [Google Account Security](https://myaccount.google.com/apppasswords)
3. Genera una **contraseña de aplicación**
4. Usa esa contraseña (no tu contraseña de Gmail)

## ⚙️ Configuración

### 1. Actualiza el archivo `.env`

```bash
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Contraseña de aplicación de Google
RECIPIENT_EMAIL=tu-correo@gmail.com
DB_HOST=mysql
DB_USER=inventario
DB_PASSWORD=password123
DB_NAME=inventario_db
PORT=3001
```

### 2. Instalar dependencias

```bash
cd notification-service
npm install
```

## 🏃 Ejecutar el Servicio

### Desarrollo local:
```bash
npm start
```

### Con Docker:
```bash
docker build -f docker/Dockerfile.notification -t inventario-notification .
docker run -p 3001:3001 --env-file notification-service/.env inventario-notification
```

## 📡 API Endpoints

### 1. Enviar Correo de Prueba
```bash
POST http://localhost:3001/notify/test

Respuesta:
{
  "success": true,
  "message": "Correo de prueba enviado a tu-correo@gmail.com"
}
```

### 2. Registrar Transacción
```bash
POST http://localhost:3001/notify/transaction

Body (JSON):
{
  "tipo": "Entrada",
  "producto": "Laptop Dell XPS 13",
  "cantidad": 5,
  "motivo": "Compra a proveedor",
  "stock_anterior": 10,
  "stock_actual": 15
}

Respuesta:
{
  "success": true,
  "message": "Correo enviado exitosamente",
  "transaction": {...}
}
```

### 3. Estado del Servicio
```bash
GET http://localhost:3001/health

Respuesta:
{
  "status": "OK",
  "service": "notification-service",
  "timestamp": "2026-06-10T..."
}
```

## 🔧 Integración con el Backend PHP

En tu backend PHP, después de registrar una transacción, llama al servicio:

```php
<?php
$transaction = [
  'tipo' => 'Entrada',
  'producto' => 'Laptop',
  'cantidad' => 5,
  'motivo' => 'Compra',
  'stock_anterior' => 10,
  'stock_actual' => 15
];

$ch = curl_init('http://notification-service:3001/notify/transaction');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($transaction));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
?>
```

## 📧 Formato del Correo Enviado

```
Asunto: 🔔 Transacción: Entrada - Laptop Dell XPS 13

Cuerpo:
📊 Nueva Transacción de Inventario
─────────────────────────────────
Tipo: Entrada
Producto: Laptop Dell XPS 13
Cantidad: 5
Motivo: Compra a proveedor
Fecha: 10/06/2026 14:30:45
Stock Anterior: 10
Stock Actual: 15
```

## 🛠️ Troubleshooting

### Error: "Invalid login: 535-5.7.8"
- Verifica que usaste una contraseña de aplicación (no tu contraseña de Gmail)
- Habilita 2FA en tu cuenta

### Error: "connect ECONNREFUSED"
- Verifica que MySQL esté ejecutándose
- Comprueba que DB_HOST sea correcto

### No llega el correo
- Revisa la carpeta de Spam
- Valida la configuración con `/notify/test`

## 📦 Docker Compose

Añade esto a tu `docker-compose.yml`:

```yaml
notification-service:
  build:
    context: .
    dockerfile: docker/Dockerfile.notification
  container_name: inventario-notification
  environment:
    EMAIL_USER: tu-correo@gmail.com
    EMAIL_PASSWORD: ${EMAIL_PASSWORD}
    RECIPIENT_EMAIL: tu-correo@gmail.com
    DB_HOST: mysql
    DB_USER: inventario
    DB_PASSWORD: password123
    DB_NAME: inventario_db
    PORT: 3001
  ports:
    - "3001:3001"
  depends_on:
    - mysql
  networks:
    - inventario-network
```

## 📝 Licencia

MIT
