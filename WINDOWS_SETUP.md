# ⚡ INSTRUCCIONES PARA WINDOWS (PowerShell)

## El Problema que Tuviste

En PowerShell, el comando `&&` no funciona. Debes usar `;` (punto y coma) o separar en dos líneas.

**❌ Esto NO funciona en PowerShell:**
```powershell
cd backend && php -S localhost:8000 -t public/
```

**✅ Esto SÍ funciona en PowerShell:**
```powershell
cd backend; php -S localhost:8000 -t public/
```

**✅ O mejor aún, separado:**
```powershell
cd backend
php -S localhost:8000 -t public/
```

---

## 🚀 INSTRUCCIONES CORRECTAS PARA WINDOWS

### 1. Terminal 1 - Frontend (Vite)
```powershell
cd frontend
npm run dev
```

Verás:
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

### 2. Terminal 2 - Backend PHP (Nueva terminal)
Abre PowerShell NUEVA y ejecuta:

```powershell
# Desde la carpeta inventario/
cd backend
php -S localhost:8000 -t public/
```

Verás:
```
Development Server running at http://127.0.0.1:8000
```

### 3. Terminal 3 - Database (XAMPP)
```
Abre XAMPP Control Panel
Click: "Start" al lado de MySQL
```

Verás en el log de XAMPP:
```
MySQL started [port 3306]
```

---

## 📋 CHECKLIST DE PUERTOS

Verifica que estos puertos están en uso:

```powershell
# Listar puertos en uso
netstat -ano | findstr LISTENING
```

Busca estas líneas:
- `127.0.0.1:3306` → MySQL (debe estar)
- `127.0.0.1:5173` → Frontend Vite (debe estar)
- `127.0.0.1:8000` → Backend PHP (debe estar)

---

## 🎯 ORDEN CORRECTO DE STARTUP

1. **Primero**: Abre XAMPP → Inicia MySQL
2. **Segundo**: Terminal 1 → `cd frontend` → `npm run dev`
3. **Tercero**: Terminal 2 → `cd backend` → `php -S localhost:8000 -t public/`
4. **Cuarto**: Abre browser → `http://localhost:5173`

---

## 🔄 FLUJO DE PETICIONES

Cuando accedes http://localhost:5173/productos el flujo es:

```
Browser (http://localhost:5173)
    ↓
React app (Vite)
    ↓
Axios hace request a http://localhost:5173/api/productos
    ↓
Vite proxy (vite.config.js) redirecciona a http://localhost:8000/api/productos
    ↓
Backend PHP (http://localhost:8000)
    ↓
MySQLBD (localhost:3306)
```

---

## 🐛 PROBLEMAS COMUNES EN WINDOWS

### Problema: Puerto ya en uso
```
Error: listen EADDRINUSE: address already in use :::8000
```

**Solución**: Cierra lo que esté usando el puerto:
```powershell
# Encontrar proceso en puerto 8000
netstat -ano | findstr :8000

# Matar proceso (reemplaza PID)
taskkill /PID 1234 /F
```

### Problema: php no se reconoce
```
php : El término 'php' no se reconoce
```

**Soluciones**:
1. Asegúrate que PHP está en PATH
2. O usa ruta completa: `C:\xampp\php\php.exe -S localhost:8000 -t public/`
3. O usa XAMPP Apache en lugar de PHP CLI

### Problema: MySQL no conecta
```
SQLSTATE[HY000]: General error: 2002 No such file or directory
```

**Solución**: Inicia MySQL en XAMPP Control Panel

### Problema: CORS error en browser
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solución**: Backend ya tiene CORS headers. Si persiste, agregar a `backend/public/index.php`:
```php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
```

---

## ✅ CHECKLIST FINAL

- [ ] XAMPP MySQL iniciado (verde en Control Panel)
- [ ] Terminal 1: `npm run dev` corriendo (no errores)
- [ ] Terminal 2: PHP server corriendo (Development Server running)
- [ ] Browser: http://localhost:5173 carga sin errores
- [ ] Puedes hacer login (si tienes usuario en BD)
- [ ] Dashboard carga (si login funciona)

---

## 💡 TIPS

**Guardar Comando Frecuente**:
En PowerShell, puedes crear un script `.ps1`:

Crear archivo `start-dev.ps1`:
```powershell
# start-dev.ps1
Write-Host "Starting Frontend..." -ForegroundColor Green
Start-Process PowerShell { cd frontend; npm run dev }

Write-Host "Starting Backend..." -ForegroundColor Green
Start-Process PowerShell { cd backend; php -S localhost:8000 -t public/ }

Write-Host "All services started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
```

Luego ejecutar:
```powershell
.\start-dev.ps1
```

---

**¡Listo! Tu sistema debe estar corriendo perfectamente en Windows ahora! 🎉**
