@echo off
REM Inventario System Launcher for Windows
REM This script starts all services (Frontend, Backend, Database)

setlocal enabledelayedexpansion

cd /D "%~dp0"

echo.
echo ========================================
echo   INVENTARIO SYSTEM LAUNCHER
echo ========================================
echo.
echo This will start:
echo   1. Frontend (Vite + React)
echo   2. Backend (PHP API)
echo   3. Instructions to start Database (XAMPP)
echo.
pause

REM Check if Node.js is installed
where npm >nul 2>nul
if errorlevel 1 (
    echo Error: Node.js not found. Please install Node.js 16+
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if errorlevel 1 (
    echo Warning: Python not found. ML features will not work.
) else (
    echo Python found. Running ML model training...
    python run_training.py
)

REM Start Frontend
echo.
echo Starting Frontend (Vite + React)...
echo Open new terminal for backend? (Y/n)
title Inventario - Frontend
cd frontend
npm install
npm run dev

pause
