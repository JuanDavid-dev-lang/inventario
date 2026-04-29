/**
 * End-to-End Tests for Complete Application
 * Uses Cypress
 */

// ============================================================================
// AUTH E2E TESTS
// ============================================================================

describe('Authentication Flow', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('Should render login page', () => {
    cy.contains('Login').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });

  it('Should login with valid credentials', () => {
    cy.get('input[type="email"]').type('admin@test.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button:contains("Login")').click();
    
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('Should show error with invalid credentials', () => {
    cy.get('input[type="email"]').type('wrong@test.com');
    cy.get('input[type="password"]').type('wrongpass');
    cy.get('button:contains("Login")').click();
    
    cy.contains('Invalid credentials').should('be.visible');
  });

  it('Should logout successfully', () => {
    // Login first
    cy.login('admin@test.com', 'password123');
    
    // Click logout
    cy.contains('Logout').click();
    
    // Should be redirected to login
    cy.url().should('include', '/login');
    cy.contains('Login').should('be.visible');
  });
});

// ============================================================================
// DASHBOARD E2E TESTS
// ============================================================================

describe('Dashboard', () => {
  
  beforeEach(() => {
    cy.login('admin@test.com', 'password123');
    cy.visit('http://localhost:5173/dashboard');
  });

  it('Should load dashboard page', () => {
    cy.contains('Dashboard').should('be.visible');
  });

  it('Should display KPI cards', () => {
    cy.get('[data-testid="kpi-card"]').should('have.length', 4);
  });

  it('Should display KPI values', () => {
    cy.contains('735').should('be.visible'); // Total productos
    cy.contains('12').should('be.visible');  // Alertas
  });

  it('Should filter by period', () => {
    cy.get('select').select('7d'); // Last 7 days
    cy.get('[data-testid="kpi-card"]').first().should('be.visible');
  });

  it('Should display chart', () => {
    cy.get('canvas').should('be.visible');
  });
});

// ============================================================================
// PRODUCTOS E2E TESTS
// ============================================================================

describe('Productos Management', () => {
  
  beforeEach(() => {
    cy.login('admin@test.com', 'password123');
    cy.visit('http://localhost:5173/productos');
  });

  it('Should display productos list', () => {
    cy.contains('Productos').should('be.visible');
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('Should search productos', () => {
    cy.get('input[placeholder="Search"]').type('Producto 1');
    cy.get('table tbody tr').should('contain', 'Producto 1');
  });

  it('Should create new producto', () => {
    cy.get('button:contains("Nuevo Producto")').click();
    
    cy.get('input[placeholder="Nombre"]').type('Test Product');
    cy.get('input[placeholder="Precio"]').type('99.99');
    cy.get('input[placeholder="Stock"]').type('50');
    
    cy.get('button:contains("Guardar")').click();
    cy.contains('Producto creado').should('be.visible');
  });

  it('Should edit producto', () => {
    cy.get('table tbody tr').first().contains('Editar').click();
    
    cy.get('input[placeholder="Nombre"]').clear().type('Updated Name');
    cy.get('button:contains("Guardar")').click();
    
    cy.contains('Producto actualizado').should('be.visible');
  });

  it('Should delete producto', () => {
    cy.get('table tbody tr').first().contains('Eliminar').click();
    cy.get('button:contains("Confirmar")').click();
    
    cy.contains('Producto eliminado').should('be.visible');
  });

  it('Should highlight low stock products', () => {
    cy.get('[data-testid="low-stock"]').should('have.class', 'highlight');
  });
});

// ============================================================================
// MOVIMIENTOS E2E TESTS
// ============================================================================

describe('Movimientos', () => {
  
  beforeEach(() => {
    cy.login('admin@test.com', 'password123');
    cy.visit('http://localhost:5173/movimientos');
  });

  it('Should display movimientos form', () => {
    cy.contains('Nuevo Movimiento').should('be.visible');
  });

  it('Should register entrada movement', () => {
    cy.get('select[name="producto"]').select('1');
    cy.get('input[name="cantidad"]').type('10');
    cy.get('input[name="motivo"]').type('Compra');
    cy.get('select[name="tipo"]').select('entrada');
    
    cy.get('button:contains("Registrar")').click();
    cy.contains('Movimiento registrado').should('be.visible');
  });

  it('Should display movimientos history', () => {
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('Should validate quantity input', () => {
    cy.get('input[name="cantidad"]').type('abc');
    cy.get('button:contains("Registrar")').should('be.disabled');
  });
});

// ============================================================================
// REPORTES E2E TESTS
// ============================================================================

describe('Reportes', () => {
  
  beforeEach(() => {
    cy.login('admin@test.com', 'password123');
    cy.visit('http://localhost:5173/reportes');
  });

  it('Should display reportes page', () => {
    cy.contains('Reportes').should('be.visible');
  });

  it('Should generate report', () => {
    cy.get('select').select('24h');
    cy.get('button:contains("Generar")').click();
    
    cy.contains('Reporte generado').should('be.visible');
  });

  it('Should export report to Excel', () => {
    cy.get('button:contains("Exportar")').click();
    cy.readFile('cypress/downloads/reporte.xlsx').should('exist');
  });

  it('Should display top products', () => {
    cy.get('[data-testid="top-products"]').should('be.visible');
    cy.get('[data-testid="top-products"] li').should('have.length.greaterThan', 0);
  });
});

// ============================================================================
// PREDICCION E2E TESTS
// ============================================================================

describe('Prediccion IA', () => {
  
  beforeEach(() => {
    cy.login('admin@test.com', 'password123');
    cy.visit('http://localhost:5173/prediccion');
  });

  it('Should display prediction form', () => {
    cy.contains('Predicción de Demanda').should('be.visible');
  });

  it('Should predict demand', () => {
    cy.get('select[name="producto"]').select('1');
    cy.get('button:contains("Predecir")').click();
    
    cy.contains('Predicción calculada').should('be.visible');
    cy.get('[data-testid="prediction-result"]').should('be.visible');
  });

  it('Should display prediction details', () => {
    cy.get('select[name="producto"]').select('1');
    cy.get('button:contains("Predecir")').click();
    
    cy.get('[data-testid="demand-trend"]').should('be.visible');
    cy.get('[data-testid="confidence"]').should('be.visible');
    cy.get('[data-testid="risk-level"]').should('be.visible');
  });
});

// ============================================================================
// USUARIOS E2E TESTS
// ============================================================================

describe('Usuarios Management', () => {
  
  beforeEach(() => {
    cy.login('admin@test.com', 'password123');
    cy.visit('http://localhost:5173/usuarios');
  });

  it('Should display usuarios list (admin only)', () => {
    cy.contains('Usuarios').should('be.visible');
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('Should create new usuario', () => {
    cy.get('button:contains("Nuevo Usuario")').click();
    
    cy.get('input[placeholder="Email"]').type('newuser@test.com');
    cy.get('input[placeholder="Password"]').type('secure123');
    cy.get('select[name="role"]').select('empleado');
    
    cy.get('button:contains("Guardar")').click();
    cy.contains('Usuario creado').should('be.visible');
  });

  it('Should edit usuario', () => {
    cy.get('table tbody tr').first().contains('Editar').click();
    
    cy.get('select[name="role"]').select('admin');
    cy.get('button:contains("Guardar")').click();
    
    cy.contains('Usuario actualizado').should('be.visible');
  });

  it('Should delete usuario', () => {
    cy.get('table tbody tr').last().contains('Eliminar').click();
    cy.get('button:contains("Confirmar")').click();
    
    cy.contains('Usuario eliminado').should('be.visible');
  });

  it('Should prevent non-admin access', () => {
    cy.logout();
    cy.login('user@test.com', 'password123');
    cy.visit('http://localhost:5173/usuarios', { failOnStatusCode: false });
    
    cy.contains('Acceso denegado').should('be.visible');
  });
});

// ============================================================================
// FULL USER JOURNEY E2E TESTS
// ============================================================================

describe('Complete User Journey', () => {
  
  it('Should complete inventory workflow', () => {
    // 1. Login
    cy.visit('http://localhost:5173');
    cy.login('admin@test.com', 'password123');
    cy.url().should('include', '/dashboard');
    
    // 2. View dashboard
    cy.contains('Dashboard').should('be.visible');
    
    // 3. Register movement
    cy.visit('http://localhost:5173/movimientos');
    cy.get('select[name="producto"]').select('1');
    cy.get('input[name="cantidad"]').type('10');
    cy.get('button:contains("Registrar")').click();
    cy.contains('Movimiento registrado').should('be.visible');
    
    // 4. Get prediction
    cy.visit('http://localhost:5173/prediccion');
    cy.get('select[name="producto"]').select('1');
    cy.get('button:contains("Predecir")').click();
    cy.get('[data-testid="prediction-result"]').should('be.visible');
    
    // 5. View reports
    cy.visit('http://localhost:5173/reportes');
    cy.get('button:contains("Generar")').click();
    cy.contains('Reporte generado').should('be.visible');
    
    // 6. Logout
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
  });
});

// ============================================================================
// CUSTOM COMMANDS
// ============================================================================

Cypress.Commands.add('login', (email, password) => {
  cy.visit('http://localhost:5173');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button:contains("Login")').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('logout', () => {
  cy.contains('Logout').click();
});
