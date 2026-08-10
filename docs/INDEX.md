# 📑 ÍNDICE COMPLETO DEL PROYECTO

## 🎯 INICIO RÁPIDO

**Para empezar inmediatamente, lee en este orden:**

1. 📄 [QUICK_START.md](QUICK_START.md) ← **EMPIEZA AQUÍ** (5 min read)
2. 📄 [SETUP.md](SETUP.md) ← Instrucciones detalladas (15 min read)
3. 🚀 Ejecuta `start-windows.bat` o `./start-linux.sh`

---

## 📂 ESTRUCTURA DE CARPETAS

```
inventario/
│
├── 📄 DOCUMENTACIÓN (START HERE!)
│   ├── QUICK_START.md          ← Guía rápida en 5 min
│   ├── SETUP.md                ← Setup completo con troubleshooting
│   ├── README.md               ← Overview del proyecto
│   ├── COMPLETION_REPORT.md    ← Qué se completó
│   ├── PROJECT_SUMMARY.md      ← Resumen estadísticas
│   └── INDEX.md                ← Este archivo
│
├── 🔧 CONFIGURACIÓN
│   ├── .env.example            ← Variables de entorno (copiar a .env.local)
│   ├── start-windows.bat       ← Script para Windows
│   ├── start-linux.sh          ← Script para Linux/Mac
│   └── run_training.py         ← Entrenador de ML
│
├── 🎨 FRONTEND (Vite + React)
│   └── frontend/
│       ├── package.json        ← Dependencias Node.js
│       ├── vite.config.js      ← Configuración Vite
│       ├── index.html          ← HTML principal
│       └── src/
│           ├── main.jsx                       ← Entry point
│           ├── App.jsx                        ← Router setup
│           │
│           ├── styles/
│           │   └── global.css                 ← 300+ líneas CSS
│           │
│           ├── services/
│           │   └── api.js                     ← Axios client + endpoints
│           │
│           ├── context/
│           │   └── AuthContext.jsx            ← Auth state management
│           │
│           ├── components/
│           │   └── Layout.jsx                 ← Main sidebar + navbar
│           │
│           └── pages/ (7 páginas)
│               ├── Login.jsx                  ← Autenticación
│               ├── Dashboard.jsx              ← KPIs + charts
│               ├── Productos.jsx              ← CRUD de productos
│               ├── Movimientos.jsx            ← Movement tracking
│               ├── Reportes.jsx               ← Analytics
│               ├── Prediccion.jsx             ← AI predictions
│               └── Usuarios.jsx               ← User management
│
├── 🐍 PYTHON ML MODULE
│   └── pyml/
│       ├── requirements.txt                   ← Dependencias Python
│       ├── __init__.py                        ← Package init
│       ├── predictor.py                       ← Demand prediction engine
│       ├── trainer.py                         ← Model training script
│       └── models/ (se genera al ejecutar)
│           ├── demand_model.pkl               ← Modelo entrenado
│           ├── scaler.pkl                     ← Feature scaler
│           └── metadata.json                  ← Metadata del modelo
│
└── 📦 BACKEND (PHP existente, no modificado)
    └── backend/
        ├── app/
        │   ├── controllers/                   ← API endpoints
        │   ├── models/                        ← Database models
        │   └── views/                         ← (no usado con React)
        └── config/                            ← Configuration files
```

---

## 📄 ARCHIVOS PRINCIPALES EXPLICADOS

### Documentación

| Archivo | Propósito | Lectura |
|---------|-----------|---------|
| **QUICK_START.md** | Guía rápida de 4 pasos | 5 min |
| **SETUP.md** | Instalación detallada + troubleshooting | 15 min |
| **README.md** | Descripción general del proyecto | 10 min |
| **COMPLETION_REPORT.md** | Qué se completó y estado final | 10 min |
| **PROJECT_SUMMARY.md** | Estadísticas y decisiones arquitectónicas | 10 min |
| **INDEX.md** | Este archivo (navegación) | 5 min |

### Frontend - Configuración

| Archivo | Líneas | Propósito |
|---------|--------|-----------|
| `frontend/package.json` | 30 | Dependencies (React, Vite, Axios, etc) |
| `frontend/vite.config.js` | 20 | Vite bundler + proxy config |
| `frontend/index.html` | 15 | HTML entry point |

### Frontend - Código

| Archivo | Líneas | Propósito |
|---------|--------|-----------|
| `src/main.jsx` | 10 | React bootstrap |
| `src/App.jsx` | 50 | React Router configuration |
| `src/styles/global.css` | 300+ | Global styling + variables |
| `src/services/api.js` | 150+ | Axios client + all endpoints |
| `src/context/AuthContext.jsx` | 80+ | Auth state management |
| `src/components/Layout.jsx` | 120+ | Main layout component |

### Frontend - Pages (7 páginas)

| Página | Líneas | Funcionalidades |
|--------|--------|-----------------|
| **Login.jsx** | 100 | JWT auth, form validation, error handling |
| **Dashboard.jsx** | 200 | KPIs, charts, alerts, period filter |
| **Productos.jsx** | 180 | CRUD, search, import/export |
| **Movimientos.jsx** | 150 | Register movements, history table |
| **Reportes.jsx** | 80 | Analytics, top products, export |
| **Prediccion.jsx** | 120 | AI predictions, risk assessment |
| **Usuarios.jsx** | 140 | User CRUD, role assignment |

### Python ML

| Archivo | Líneas | Propósito |
|---------|--------|-----------|
| `pyml/requirements.txt` | 6 | Python dependencies list |
| `pyml/__init__.py` | 10 | Package initialization |
| `pyml/predictor.py` | 200 | ML prediction engine |
| `pyml/trainer.py` | 250 | Model training script |
| `run_training.py` | 15 | CLI entry point |

### Configuración & Scripts

| Archivo | Tipo | Propósito |
|---------|------|-----------|
| `.env.example` | Config | Environment variables template |
| `start-windows.bat` | Script | Windows launcher |
| `start-linux.sh` | Script | Linux/macOS launcher |

---

## 🚀 WORKFLOW TÍPICO

### Primera vez
```bash
# 1. Leer documentación
cat QUICK_START.md

# 2. Preparar BD
# → Abrir XAMPP → Importar inventario_db.sql

# 3. Instalar frontend
cd frontend && npm install

# 4. Entrenar modelo ML
python run_training.py

# 5. Iniciar servicios
# Terminal 1: cd frontend && npm run dev
# Terminal 2: cd backend && php -S localhost:8000 -t public/

# 6. Abrir browser
# http://localhost:5173
```

### Desarrollo diario
```bash
# Terminal 1 - Frontend
npm run dev  # Vite watches + HMR

# Terminal 2 - Backend (si necesitas cambios PHP)
php -S localhost:8000 -t public/

# Todo cambia instantáneamente
```

### Producción
```bash
# Build optimizado
npm run build

# Deploy dist/ a tu servidor
# API_URL apunta a tu dominio en producción
```

---

## 🎯 CÓMO ENCONTRAR COSAS

### "¿Dónde está...?"

**Login functionality?**
- Pages: `frontend/src/pages/Login.jsx`
- Auth logic: `frontend/src/context/AuthContext.jsx`
- Docs: SETUP.md (sección Authentication)

**API client?**
- File: `frontend/src/services/api.js`
- Endpoints: All listed there (auth, productos, movimientos, etc)

**Styling?**
- Global: `frontend/src/styles/global.css`
- Component styles: Inside each component (inline CSS)
- Variables: Top of global.css

**Dashboard?**
- File: `frontend/src/pages/Dashboard.jsx`
- Features: KPIs, charts, period filter
- Charts library: Chart.js (see imports)

**ML predictions?**
- Frontend: `frontend/src/pages/Prediccion.jsx`
- Python: `pyml/predictor.py`
- Training: `pyml/trainer.py`
- Entry point: `run_training.py`

**User management?**
- Page: `frontend/src/pages/Usuarios.jsx`
- Admin only: Check Layout.jsx (menu item)

**Database?**
- Schema: `inventario_db.sql` (in root)
- Models: `backend/app/models/`
- Connection: `backend/config/database.php`

**Troubleshooting?**
- First: SETUP.md (Troubleshooting section)
- Second: See logs in browser console (F12)
- Third: Check PHP error logs

---

## 📊 FEATURES MATRIX

| Feature | Page | Component | API | Python | Status |
|---------|------|-----------|-----|--------|--------|
| Login | Login.jsx | - | ✅ | - | ✅ |
| Dashboard | Dashboard.jsx | - | ✅ | - | ✅ |
| Products CRUD | Productos.jsx | - | ✅ | - | ✅ |
| Movements | Movimientos.jsx | - | ✅ | - | ✅ |
| Reports | Reportes.jsx | - | ✅ | - | ✅ |
| AI Predictions | Prediccion.jsx | - | ✅ | ✅ | ✅ |
| Users | Usuarios.jsx | - | ✅ | - | ✅ |
| Charts | Dashboard.jsx | - | - | - | ✅ |
| Export Excel | All | - | ✅ | - | ✅ |
| Responsive | All | Layout.jsx | - | - | ✅ |

---

## 🔗 LINKS & REFERENCIAS

### Tech Documentation
- React: https://react.dev
- Vite: https://vitejs.dev
- React Router: https://reactrouter.com
- Axios: https://axios-http.com
- Chart.js: https://www.chartjs.org
- scikit-learn: https://scikit-learn.org

### Local URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- phpMyAdmin: http://localhost/phpmyadmin

### File Extensions
- React: `.jsx` (components)
- Styles: `.css` (global.css in src/styles/)
- Python: `.py` (in pyml/)
- Config: `.json`, `.js`

---

## ✅ CHECKLIST - ANTES DE EMPEZAR

- [ ] Node.js 16+ instalado (node -v)
- [ ] Python 3.8+ instalado (python --version)
- [ ] XAMPP instalado o MySQL disponible
- [ ] Este directorio extraído/clonado
- [ ] Leído QUICK_START.md
- [ ] Listos para iniciar servicios

---

## 🆘 GETTING HELP

### Por tipo de problema

**Frontend issue?**
- Check: `SETUP.md` → Troubleshooting
- Look at: Browser console (F12)
- Check file: `frontend/src/` relevant page

**Backend issue?**
- Check: PHP error logs
- Look at: Network tab (F12)
- Check file: `backend/` controllers

**Database issue?**
- Check: XAMPP MySQL status
- Look at: phpMyAdmin
- Check file: `backend/config/database.php`

**ML issue?**
- Check: Run `python run_training.py`
- Look at: pyml/models directory (should exist)
- Check file: `pyml/predictor.py`

---

## 📈 WHAT'S NEXT?

### Immediate (Today)
1. Read QUICK_START.md
2. Setup DB
3. Start services
4. Test login

### Short term (This week)
1. Explore all pages
2. Add sample data
3. Test predictions
4. Customize colors

### Medium term (This month)
1. Deploy to server
2. Use with real data
3. Train ML with real movements
4. Setup backups

### Long term (Future)
1. Mobile app (React Native)
2. More ML models
3. Advanced analytics
4. Integration with other systems

---

## 🎓 LEARNING POINTS

If you're new to these technologies, study in this order:

1. **HTML/CSS/JS** ← Foundation
2. **React Basics** → components, props, hooks
3. **React Router** → navigation
4. **Axios** → API calls
5. **Vite** → build system
6. **Python basics** → for ML understanding
7. **scikit-learn** → ML algorithms

All code in this project demonstrates these concepts!

---

## 🎉 SUMMARY

**All files are ready. No installation needed. Just:**

1. Import DB
2. Run npm install
3. Start services
4. Open browser

**Everything else is documented and ready to go!**

Happy coding! 🚀

---

**Last updated**: Today
**Status**: ✅ Complete
**Ready for**: Immediate use or deployment

For any questions, refer to the specific documentation file listed above.
