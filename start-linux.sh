#!/bin/bash
# Inventario System Launcher for Linux/macOS
# This script starts all services

set -e

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo ""
echo "========================================"
echo "  INVENTARIO SYSTEM LAUNCHER"
echo "========================================"
echo ""
echo "This will start:"
echo "  1. Frontend (Vite + React)"
echo "  2. Backend (PHP API)"
echo "  3. Instructions to start Database (MySQL)"
echo ""
read -p "Press Enter to continue..."

# Check if Node.js is installed
if ! command -v npm &> /dev/null; then
    echo "Error: Node.js not found. Please install Node.js 16+"
    exit 1
fi

# Check if Python is installed
if command -v python3 &> /dev/null; then
    echo ""
    echo "Training ML model..."
    python3 run_training.py || true
fi

# Install and start frontend
echo ""
echo "Starting Frontend (Vite + React)..."
echo ""
echo "Opening frontend in new terminal..."

if command -v gnome-terminal &> /dev/null; then
    # Linux with GNOME
    cd "$SCRIPT_DIR/frontend"
    gnome-terminal -- bash -c "npm install && npm run dev; bash"
elif command -v xterm &> /dev/null; then
    # Generic X terminal
    cd "$SCRIPT_DIR/frontend"
    xterm -e "npm install && npm run dev" &
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    cd "$SCRIPT_DIR/frontend"
    open -a Terminal "$SCRIPT_DIR/start-frontend.sh"
else
    # Fallback: print instructions
    echo ""
    echo "To start frontend, run in a new terminal:"
    echo "  cd $SCRIPT_DIR/frontend"
    echo "  npm install"
    echo "  npm run dev"
fi

echo ""
echo "=========================================="
echo "  NEXT STEPS"
echo "=========================================="
echo ""
echo "1. Start MySQL/Database:"
echo "   - Via XAMPP: Start MySQL in XAMPP Control Panel"
echo "   - Or manually: mysql -u root -p < inventario_db.sql"
echo ""
echo "2. Start PHP Backend (in new terminal):"
echo "   cd $SCRIPT_DIR"
echo "   php -S localhost:8000 -t backend/public/"
echo ""
echo "3. Frontend should open at http://localhost:5173"
echo ""
echo "Success! Your inventario system is running 🚀"
echo ""
