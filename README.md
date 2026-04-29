
# 🏪 InventarioPro v2.0 - React + Vite + Python + Docker

**Reescritura completa del sistema de inventario con:**
- Frontend: Vite + React (mismo diseño)
- Backend: PHP API REST
- IA: Python (predicción de demanda)
- BD: MySQL/MariaDB

## 📊 Estructura

```
inventario/
├── frontend/              # Vite + React (Cliente)
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas principales
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   ├── context/       # Context API (Auth, etc)
│   │   ├── styles/        # Estilos
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/               # API PHP REST (Existente)
│   ├── app/
│   ├── config/
│   ├── api.php            # Entry point API
│   └── ...
│
├── pyml/                  # Python IA
│   ├── predictor.py       # Modelo de predicción
│   ├── trainer.py         # Entrenar IA
│   ├── requirements.txt
│   └── data/
│
└── docs/                  # Documentación
```


## 🚀 Setup Rápido

### Opción 1: Docker (Recomendado)

```bash
# 1. Clona el repo
git clone https://github.com/JuanDavid-dev-lang/inventario.git
cd inventario

# 2. (Opcional) Coloca inventario_db.sql en la raíz

# 3. Levanta todo
docker-compose up --build
```

**Servicios:**
- Frontend: http://localhost/
- Backend API: http://localhost:8000/api
- phpMyAdmin: http://localhost:8081
- Spark UI: http://localhost:4040

Guía completa: [DOCKER_SETUP.md](DOCKER_SETUP.md)

---

### Opción 2: Manual (desarrollo clásico)

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Backend**
```bash
cd backend
php -S localhost:8000 -t public/
```

**Python ML**
```bash
cd pyml
python -m venv venv
venv\Scripts\activate  # o source venv/bin/activate
pip install -r requirements.txt
python trainer.py
```

**Base de datos**
```
Iniciar XAMPP
Importar inventario_db.sql en phpMyAdmin
```

## 📝 API Endpoints

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/productos
POST   /api/productos
PUT    /api/productos/:id
GET    /api/reportes
POST   /api/prediccion/calcular
```

## 🤖 IA Python

El módulo Python entrena con datos históricos y predice:
- Tendencia de demanda
- Stock recomendado
- Nivel de riesgo
- Confianza de predicción

## ✅ Features

- ✅ Dashboard con KPIs
- ✅ Gestión de productos
- ✅ Importación de Excel
- ✅ Registro de movimientos
- ✅ Alertas automáticas
- ✅ Reportes
- ✅ Predicción IA (Gemini + Python + Spark)
- ✅ Autenticación JWT
- ✅ Gestión de usuarios
- ✅ **Docker Compose** (todo orquestado)
- ✅ **PySpark** para minería de datos
- ✅ **Test Suite** (unit + E2E)

---

## 📚 Documentación útil

- [DOCKER_SETUP.md](DOCKER_SETUP.md) → Guía Docker
- [APACHE_SPARK_EXPLICADO.md](APACHE_SPARK_EXPLICADO.md) → ¿Por qué Spark?
- [TESTING_GUIDE.md](TESTING_GUIDE.md) → Cómo testear todo

---

**¡Listo para producción y desarrollo moderno!**
