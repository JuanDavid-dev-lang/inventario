# 🏪 InventarioPro v2.0 - React + Vite + Python

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

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend Api
```
Usar PHP existente como API REST
http://localhost/inventario/api.php
```

### 3. IA Python
```bash
cd pyml
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate en Windows
pip install -r requirements.txt
python trainer.py
```

### 4. Base de datos
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
- ✅ Predicción IA (Gemini + Python)
- ✅ Autenticación JWT
- ✅ Gestión de usuarios
