@echo off
REM Google Cloud Deployment Script para Windows
REM Despliega Backend y Frontend a Cloud Run

setlocal enabledelayedexpansion

REM Configuración
set PROJECT_ID=noble-return-447622-s1
set REGION=southamerica-east1
set BACKEND_SERVICE=inventario-api
set FRONTEND_SERVICE=inventario-frontend

echo.
echo =====================================
echo Iniciando deployment a Google Cloud
echo =====================================
echo.

REM 1. Verificar gcloud
where gcloud >nul 2>nul
if errorlevel 1 (
    echo ❌ gcloud no está instalado. Descargalo desde: https://cloud.google.com/sdk/docs/install
    exit /b 1
)

REM 2. Configurar proyecto
echo [1/5] Configurando proyecto...
call gcloud config set project %PROJECT_ID%

REM 3. Habilitar APIs
echo [2/5] Habilitando APIs necesarias...
call gcloud services enable run.googleapis.com
call gcloud services enable artifactregistry.googleapis.com
call gcloud services enable cloudbuild.googleapis.com
call gcloud services enable containerregistry.googleapis.com

REM 4. Build y Deploy Backend
echo [3/5] Compilando y desplegando Backend...
call gcloud builds submit ^
  --region=%REGION% ^
  --config=cloudbuild-backend.yaml ^
  --substitutions="_REGION=%REGION%"

if errorlevel 1 (
    echo ❌ Error en Backend deployment
    exit /b 1
)

REM 5. Build y Deploy Frontend
echo [4/5] Compilando y desplegando Frontend...
call gcloud builds submit ^
  --region=%REGION% ^
  --config=cloudbuild-frontend.yaml ^
  --substitutions="_REGION=%REGION%"

if errorlevel 1 (
    echo ❌ Error en Frontend deployment
    exit /b 1
)

REM 6. Mostrar URLs
echo.
echo =====================================
echo ✅ Deployment completado!
echo =====================================
echo.
echo 🔗 URLs de tu aplicación:
echo   Backend:  https://%BACKEND_SERVICE%-%REGION%.a.run.app
echo   Frontend: https://%FRONTEND_SERVICE%-%REGION%.a.run.app
echo.
echo 📋 Para ver logs:
echo   Backend:  gcloud run logs read %BACKEND_SERVICE% --region=%REGION%
echo   Frontend: gcloud run logs read %FRONTEND_SERVICE% --region=%REGION%
echo.
pause
