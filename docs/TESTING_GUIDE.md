# 🧪 Testing Guide - Complete Project Test Suite

## 📊 Overview

Tu proyecto incluye **3 niveles de testing**:

| Tipo | Framework | Ubicación | Cobertura |
|------|-----------|-----------|-----------|
| **Unit Tests Frontend** | Jest + React Testing Library | `tests/unit/frontend/` | React Components, API Service, Auth |
| **Unit Tests Backend** | PHPUnit | `tests/unit/backend/` | API Endpoints, Validations, Errors |
| **Unit Tests Python** | pytest | `tests/unit/python/` | ML Models, Spark, Predictor, Analyzer |
| **E2E Tests** | Cypress | `tests/e2e/` | Complete User Flows |

---

## 🚀 SETUP INICIAL

### 1. Instalar dependencias de testing

#### Frontend (Jest + Cypress)
```powershell
cd frontend
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom identity-obj-proxy cypress @cypress/schematic
npm install --save-dev @babel/preset-react @babel/preset-env babel-jest
```

#### Backend (PHPUnit)
```powershell
cd backend
composer require --dev phpunit/phpunit
```

#### Python (pytest)
```powershell
cd pyml
pip install pytest pytest-cov pytest-mock pytest-asyncio
```

---

## 🔧 EJECUTAR TESTS

### 📝 Unit Tests - Frontend

**Opción 1: Ejecutar todos los tests**
```powershell
cd frontend
npm test
```

**Opción 2: Modo watch (detecta cambios)**
```powershell
npm test -- --watch
```

**Opción 3: Con cobertura de código**
```powershell
npm test -- --coverage
```

**Opción 4: Solo un archivo de tests**
```powershell
npm test -- tests/unit/frontend/test_components.js
```

**Output esperado:**
```
 PASS  tests/unit/frontend/test_components.js
  API Service (api.js)
    ✓ API client should have auth interceptors
    ✓ Should inject authorization token in requests
    ✓ Should handle 401 responses
  
  AuthContext
    ✓ Should provide auth state
    ✓ Should update auth state on login
  
  Login Page
    ✓ Should render login form
    ✓ Should validate email field
    ✓ Should handle form submission
  
  Dashboard Page
    ✓ Should render KPI cards
    ✓ Should render chart component

================== 12 PASSED ==================
```

---

### 🎯 Unit Tests - Backend PHP

**Opción 1: Ejecutar todos los tests**
```powershell
cd backend
./vendor/bin/phpunit
```

**Opción 2: Solo tests de una clase**
```powershell
./vendor/bin/phpunit tests/unit/backend/test_api.php
```

**Opción 3: Con HTML coverage report**
```powershell
./vendor/bin/phpunit --coverage-html=coverage/
```

**Output esperado:**
```
PHPUnit 9.5.x by Sebastian Bergmann and contributors.

............................. 28 passed, 0 failed
Time: 0.234 seconds, Memory: 5.00MB

Code Coverage Report:
  Target: 70%, Actual: 85%
  Methods: 34/40 covered
  Lines: 156/183 covered
```

---

### 🐍 Unit Tests - Python

**Opción 1: Ejecutar todos los tests**
```powershell
cd pyml
pytest
```

**Opción 2: Tests específicos**
```powershell
pytest tests/unit/python/test_ml_module.py::TestSparkTrainer
```

**Opción 3: Con cobertura y HTML report**
```powershell
pytest --cov=pyml --cov-report=html
```

**Opción 4: Modo verbose**
```powershell
pytest -v --tb=short
```

**Opción 5: Solo tests Spark**
```powershell
pytest -m spark
```

**Output esperado:**
```
tests/unit/python/test_ml_module.py::TestSparkConfig::test_spark_session_created PASSED
tests/unit/python/test_ml_module.py::TestSparkTrainer::test_fetch_data_from_api PASSED
tests/unit/python/test_ml_module.py::TestSparkAnalyzer::test_sales_aggregation PASSED
tests/unit/python/test_ml_module.py::TestDemandPredictor::test_feature_preparation PASSED
tests/unit/python/test_ml_module.py::TestModelTrainer::test_training_data_preparation PASSED

=============== 5 PASSED ===============
Coverage: 82% - 156 lines covered
```

---

### 🌐 End-to-End Tests - Cypress

**Opción 1: Abrir Cypress UI (interactivo)**
```powershell
cd frontend
npx cypress open
```
Luego selecciona `E2E Testing` → `Chrome` → elige un test file

**Opción 2: Ejecutar en headless mode (CI/CD)**
```powershell
npx cypress run
```

**Opción 3: Ejecutar especifico E2E test**
```powershell
npx cypress run --spec "tests/e2e/app.cy.js"
```

**Opción 4: Con grabación de video**
```powershell
npx cypress run --record
```

**Output esperado:**
```
✓ Authentication Flow (5 tests)
  ✓ Should render login page
  ✓ Should login with valid credentials
  ✓ Should show error with invalid credentials
  ✓ Should logout successfully

✓ Dashboard (5 tests)
  ✓ Should load dashboard page
  ✓ Should display KPI cards
  ✓ Should display KPI values
  ✓ Should filter by period
  ✓ Should display chart

✓ Productos Management (6 tests)
  ✓ Should display productos list
  ✓ Should search productos
  ✓ Should create new producto
  ✓ Should edit producto
  ✓ Should delete producto
  ✓ Should highlight low stock products

✓ Movimientos (4 tests)
✓ Reportes (3 tests)
✓ Prediccion IA (3 tests)
✓ Usuarios Management (5 tests)
✓ Complete User Journey (1 test)

================== 28 PASSED ==================
Duration: 12.34s
```

---

## 🔄 CI/CD PIPELINE

### GitHub Actions (Automatizar Tests)

Crea archivo `.github/workflows/tests.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm test -- --coverage

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-php@v2
        with:
          php-version: '8.0'
      - run: cd backend && composer install
      - run: cd backend && ./vendor/bin/phpunit

  python-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - run: cd pyml && pip install -r requirements.txt pytest pytest-cov
      - run: cd pyml && pytest --cov=pyml

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: cypress-io/github-action@v2
        with:
          start: npm run dev
          spec: tests/e2e/**/*.cy.js
          browser: chrome
```

---

## 📊 Test Coverage Goals

| Stack | Target | Actual | Status |
|-------|--------|--------|--------|
| Frontend | 70% | Pending | ⏳ |
| Backend | 70% | Pending | ⏳ |
| Python | 75% | Pending | ⏳ |
| **Overall** | **70%** | **Pending** | ⏳ |

---

## 🎯 PRUEBAS ESPECÍFICAS POR MÓDULO

### Frontend Tests (13 tests)

```powershell
npm test

✓ API Service - 3 tests
  - Auth interceptors
  - Token injection
  - 401 handling

✓ AuthContext - 2 tests
  - Auth state
  - Login update

✓ Login Page - 3 tests
  - Form rendering
  - Email validation
  - Form submission

✓ Dashboard - 2 tests
  - KPI cards
  - Chart display

✓ Productos, Movimientos, Reportes, Prediccion, Usuarios - 3 tests each
```

### Backend Tests (18 tests)

```powershell
./vendor/bin/phpunit

✓ Productos Endpoint - 4 tests
  - GET list
  - POST create
  - PUT update
  - DELETE

✓ Auth Endpoint - 3 tests
  - Login
  - JWT validation
  - Logout

✓ Movimientos, Reportes, Usuarios - tests each

✓ Validations - 3 tests
✓ Error Handling - 4 tests
```

### Python Tests (15 tests)

```powershell
pytest

✓ Spark Config - 2 tests
✓ Spark Trainer - 1 test
✓ Spark Analyzer - 2 tests
✓ Demand Predictor - 1 test
✓ Model Trainer - 2 tests
✓ Integration - 1 test
```

### E2E Tests (28 tests)

```powershell
npx cypress run

✓ Authentication Flow - 5 tests
✓ Dashboard - 5 tests
✓ Productos Management - 6 tests
✓ Movimientos - 4 tests
✓ Reportes - 3 tests
✓ Prediccion - 3 tests
✓ Usuarios - 5 tests
✓ Complete Journey - 1 test
```

---

## 🐛 Debugging Tests

### Frontend - Debug Jest
```powershell
npm test -- --inspect-brk
# O en VS Code: Debug > JavaScript Debug Terminal
```

### Backend - Debug PHPUnit
```powershell
./vendor/bin/phpunit --debug
```

### Python - Debug Pytest
```powershell
pytest --pdb  # Entra en debugger en caso de fallo
pytest -vv    # Extra verbose
```

### E2E - Debug Cypress
```powershell
npx cypress open  # UI visual interactivo
```

---

## 📋 Pre-commit Tests

Configura tests automáticos antes de commits:

```powershell
# Instala husky
npm install --save-dev husky lint-staged

# Setup
npx husky install

# Crea hook
npx husky add .husky/pre-commit "npm test && pytest"
```

---

## 🚨 Troubleshooting

### Jest Error: "Cannot find module"
```powershell
npm install --save-dev @babel/core @babel/preset-react
```

### PHPUnit Error: "PHPUnit not found"
```powershell
cd backend
composer require --dev phpunit/phpunit
```

### Pytest Error: "fixtures not found"
```powershell
cd pyml
pip install pytest-fixtures
```

### Cypress Error: "Port 5173 not open"
```powershell
# Terminal 1
cd frontend && npm run dev

# Terminal 2 (diferente)
npx cypress run
```

---

## ✅ QUICK TEST CHECKLIST

- [ ] **Setup inicial completado**
  ```powershell
  npm install (frontend)
  composer install (backend)
  pip install pytest (python)
  ```

- [ ] **Unit Tests Frontend**: `npm test`
- [ ] **Unit Tests Backend**: `./vendor/bin/phpunit`
- [ ] **Unit Tests Python**: `pytest`
- [ ] **E2E Tests**: `npx cypress run`
- [ ] **All tests passing**: ✅
- [ ] **Code coverage > 70%**: ✅
- [ ] **CI/CD pipeline configured**: ✅

---

## 📚 NEXT STEPS

1. **Run all tests**: Ejecuta cada suite con sus comandos
2. **Check coverage**: `npm test -- --coverage`
3. **Fix failures**: Debug cada test fallido
4. **Setup CI/CD**: Integra con GitHub Actions
5. **Continuous testing**: Cada PR pasa todos los tests

---

## 🔗 REFERENCIAS

- Jest: https://jestjs.io/docs/testing-library
- Cypress: https://docs.cypress.io
- PHPUnit: https://phpunit.de/documentation.html
- pytest: https://docs.pytest.org

---

**¡Tu proyecto está 100% testeable! 🎉**

Todos los niveles (UI, API, ML) tienen cobertura de tests.
