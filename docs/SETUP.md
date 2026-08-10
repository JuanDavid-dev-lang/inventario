# 🚀 Setup Guide - Inventario System Re-built

Complete setup instructions for the new React + Vite + Python ML stack.

## Prerequisites

- **Node.js**: 16+ (for Vite + React)
- **Python**: 3.8+ (for ML module)
- **XAMPP** or **MariaDB**: For MySQL database
- **PHP**: 8.0+ (backend API already exists)

---

## 1️⃣ Frontend Setup (Vite + React)

### Install dependencies
```bash
cd frontend
npm install
```

### Create environment file
```bash
cp ../.env.example .env.local
# Edit .env.local and set VITE_API_URL to your PHP backend
```

### Run development server
```bash
npm run dev
# Opens at http://localhost:5173
```

### Build for production
```bash
npm run build
# Creates optimized build in dist/
```

---

## 2️⃣ Backend Setup (PHP API)

The PHP backend is located in `backend/` folder and acts as the API server.

### Start PHP server (Windows PowerShell)
```powershell
cd backend
php -S localhost:8000 -t public/
```

You should see:
```
Development Server running at http://127.0.0.1:8000
```

### Configure CORS
The backend automatically includes CORS headers. But if you get CORS errors, add this to `backend/public/index.php`:

```php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
```

### Alternative: Use XAMPP
Instead of PHP CLI, you can use XAMPP's Apache:
1. Start Apache in XAMPP Control Panel
2. Access API at http://localhost/inventario/public/api

### Initialize Database
```bash
# Using XAMPP PhpMyAdmin or MySQL CLI
mysql -u root -p < inventario_db.sql
```

---

## 3️⃣ Python ML Setup

### Install Python dependencies
```bash
cd pyml
pip install -r requirements.txt
```

### Generate/Train ML Model
First time or after data updates:
```bash
python ../run_training.py
```

This will:
- Fetch historical data from the PHP API
- Train the Random Forest model
- Save model files to `pyml/models/`

### Use predictions in code
```python
from pyml.predictor import predict

result = predict(
    product_data={
        'id': 1,
        'nombre': 'Widget A',
        'stock': 100,
        'precio_venta': 25.00,
        'precio_compra': 10.00
    },
    historical_data=[...]  # Optional: historical movements
)

print(result['recomendacion_compra'])  # Get buying recommendation
```

---

## 4️⃣ Running Everything Together

### Option A: Separate Terminals (Development)

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
# Vite dev server on http://localhost:5173
```

**Terminal 2 - PHP Backend:**
```bash
cd backend
php -S localhost:8000 -t public/
# API on http://localhost:8000/api
```

**Terminal 3 - Database (XAMPP):**
- Start MySQL from XAMPP Control Panel
- Or: `mysql -u root -p`

### Option B: Docker (Coming Soon)
We can containerize this setup with Docker Compose for easier deployment.

---

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
# Uses React Testing Library
```

### Python ML Tests
```bash
cd pyml
python -m pytest tests/
```

### Backend API Tests
```bash
# From root directory
php vendor/bin/phpunit tests/
```

---

## 📊 Project Structure

```
inventario/
├── frontend/                 # Vite + React SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components (Dashboard, Productos, etc)
│   │   ├── services/         # API client with axios
│   │   ├── context/          # React Context (Auth)
│   │   ├── styles/           # Global CSS
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/                  # Existing PHP API (MVC)
│   ├── app/
│   │   ├── controllers/      # API endpoints
│   │   ├── models/           # Database models
│   │   └── views/            # (now unused - replaced by React)
│   ├── config/               # Configuration files
│   ├── public/               # Web root
│   └── vendor/               # PHP dependencies (Composer)
│
├── pyml/                     # Python ML Module
│   ├── predictor.py          # Demand prediction
│   ├── trainer.py            # Model training
│   ├── models/               # Saved ML models (generated)
│   ├── requirements.txt      # Python dependencies
│   └── __init__.py
│
├── README.md                 # Project overview
├── .env.example              # Environment variables template
├── run_training.py           # Training script entry point
└── inventario_db.sql         # Database schema (735 products)
```

---

## 🔐 Security Notes

### Before Production Deployment:

1. **Never commit `.env` files** - Use `.env.example` as template
2. **JWT_SECRET** - Change in PHP backend config
3. **Database password** - Set strong password in .env
4. **API Keys** - Store Gemini API key securely in .env
5. **CORS** - Restrict to specific domains (not `*`)

### Secrets Management:
- Frontend: `.env.local` (git ignored)
- Backend: `config/jwt.php` (git ignored)
- Python: `.env` file (git ignored)

---

## 📱 Features Overview

### ✅ Completed
- Authentication (JWT)
- Product Management (CRUD)
- Inventory Movements Tracking
- Dashboard with KPIs
- Reports & Analytics
- AI Predictions (Gemini integration)
- User Management (admin panel)
- Responsive Design

### 🚀 Ready to Deploy
1. Update domain/IP in `.env` files
2. Configure PHP backend CORS properly
3. Train ML model with production data: `python run_training.py`
4. Build frontend: `npm run build`
5. Deploy `frontend/dist/` to web server

---

## 🆘 Troubleshooting

### Frontend can't connect to API
- Check `VITE_API_URL` in `.env.local`
- Verify PHP backend is running on correct port
- Check CORS headers in PHP backend

### ML predictions not working
- Run `python run_training.py` to train model
- Check `pyml/models/` directory for saved model
- Verify API is returning movement data

### Database errors
- Ensure XAMPP MySQL is running
- Check credentials in `.env`
- Restore `inventario_db.sql` if corrupted

---

## 📚 Documentation

- **Frontend**: See `frontend/` for React component docs
- **Backend API**: See original PHP code in `backend/app/controllers/`
- **ML Module**: See docstrings in `pyml/predictor.py` and `pyml/trainer.py`

---

## 🎯 Next Steps

1. Copy this folder to your server/laptop
2. Follow setup steps above
3. Update `.env` with your configuration
4. Start all services
5. Open http://localhost:5173 in browser
6. Login with credentials from database

**¡Listo! Your inventario system is ready to go!** 🚀
