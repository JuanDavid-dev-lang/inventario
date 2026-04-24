# Backend PHP API

## 📌 Estructura

Este directorio contiene la API REST del sistema de inventario.

**La carpeta está configurada para funcionar con el backend original** ubicado en el directorio padre:
```
../../../
├── app/           (controllers, models)
├── config/        (database, jwt)
├── public/        (index.php - entry point original)
└── vendor/        (composer dependencies)
```

### Cómo funciona

- `public/index.php` → Router que redirige al backend original
- El backend original maneja todas las rutas API
- Todos los controladores, modelos y configuración están en el nivel superior

## 🚀 Iniciar el Backend

### Opción 1: Desde esta carpeta
```bash
cd backend
php -S localhost:8000 -t public/
```

### Opción 2: Desde el proyecto original
```bash
cd ..  # (up 2 levels to inventario/)
php -S localhost:8000 -t public/
```

## 📍 URLs Disponibles

Cuando el backend está running en `http://localhost:8000`:

| Endpoint | Método | Descripción |
|----------|--------|------------|
| `/api/auth/login` | POST | Autenticación |
| `/api/productos` | GET | Lista productos |
| `/api/movimientos` | GET | Lista movimientos |
| `/api/reportes` | GET | Datos reports |
| `/api/prediccion` | GET | Predicciones IA |
| `/api/usuarios` | GET | Lista usuarios |

## ⚙️ Configuración

El backend usa archivos de configuración del directorio superior:
- `config/database.php` - Conexión MySQL
- `config/jwt.php` - JWT tokens
- `config/gemini.php` - API Gemini

## 🔗 Integración con Frontend

El frontend (en `../frontend/`) está configurado con:
```javascript
// vite.config.js
proxy: {
  '/api': 'http://localhost:8000/api'
}
```

Esto significa:
- Frontend requests a `http://localhost:5173/api/*`
- Vite proxy redirecciona a `http://localhost:8000/api/*`
- Backend responde

## 📦 Dependencias

Todas las dependencias PHP están en `../vendor/` (via Composer).

Para instalar nuevas dependencias:
```bash
cd ..  # Up to parent
composer install
```

## 🐛 Troubleshooting

**"Cannot GET /api/..."**
- Asegúrate que PHP está corriendo en puerto 8000
- Verifica que backend/public/index.php existe
- Check: `http://localhost:8000/api/auth/login`

**404 en las rutas**
- El router del backend mapea las rutas
- Verifica que todos los archivos del backend original existen

**Connection to database fails**
- Check `config/database.php` in parent directory
- Verifica que MySQL está corriendo (XAMPP)
- Update .env con credenciales correctas

## 📚 Docs

Ver documentación principal:
- `SETUP.md` - Setup completo
- `API.md` - Documentación de endpoints
- `README.md` - Overview

---

**Backend Status**: ✅ Ready
**API Server**: `http://localhost:8000`
