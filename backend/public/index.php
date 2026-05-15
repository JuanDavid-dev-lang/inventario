<?php
// public/index.php - Simple API Router
// Minimal implementation for Docker containerization
// For full functionality, replace with actual Laravel/framework code

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Parse the request URI
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = preg_replace('#^/+#', '', $uri);
$uri = preg_replace('#/+$#', '', $uri);
$uri = preg_replace('|^(inventario/)?public/|', '', $uri);
$uri = preg_replace('|^api/|', '', $uri);

$method = $_SERVER['REQUEST_METHOD'];

try {
    // Health check / status endpoint
    if (empty($uri) || $uri === 'status' || $uri === 'health') {
        respondJson(['status' => 'ok', 'service' => 'inventario-backend', 'timestamp' => date('Y-m-d H:i:s')]);
    }
    // Authentication endpoints
    elseif (strpos($uri, 'auth') === 0) {
        handleAuth($uri, $method);
    }
    // Products endpoints
    elseif (strpos($uri, 'productos') === 0) {
        handleProductos($uri, $method);
    }
    // Movements endpoints
    elseif (strpos($uri, 'movimientos') === 0) {
        handleMovimientos($uri, $method);
    }
    // Reports endpoints
    elseif (strpos($uri, 'reportes') === 0) {
        handleReportes($uri, $method);
    }
    // Prediction endpoints
    elseif (strpos($uri, 'prediccion') === 0) {
        handlePrediccion($uri, $method);
    }
    // Users endpoints
    elseif (strpos($uri, 'usuarios') === 0) {
        handleUsuarios($uri, $method);
    }
    else {
        http_response_code(404);
        respondJson(['error' => 'Endpoint not found', 'requested_path' => $uri]);
    }
} catch (Exception $e) {
    http_response_code(500);
    respondJson(['error' => 'Internal server error', 'message' => $e->getMessage()]);
}

// ========== RESPONSE HELPER ==========
function respondJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// ========== AUTHENTICATION HANDLERS ==========
function handleAuth($uri, $method) {
    if ($uri === 'auth/login' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        respondJson([
            'success' => true,
            'token' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' . base64_encode(time()),
            'user' => [
                'id' => 1,
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'role' => 'admin'
            ]
        ], 200);
    } else if ($uri === 'auth/logout' && $method === 'POST') {
        respondJson(['success' => true, 'message' => 'Logged out successfully'], 200);
    } else {
        http_response_code(405);
        respondJson(['error' => 'Method not allowed']);
    }
}

// ========== PRODUCTS HANDLERS ==========
function handleProductos($uri, $method) {
    if ($uri === 'productos' && $method === 'GET') {
        respondJson([
            'success' => true,
            'data' => [
                ['id' => 1, 'name' => 'Laptop', 'sku' => 'LP001', 'price' => 1200.00, 'stock' => 25, 'category' => 'Electronics'],
                ['id' => 2, 'name' => 'Mouse', 'sku' => 'MO001', 'price' => 25.00, 'stock' => 150, 'category' => 'Accessories'],
                ['id' => 3, 'name' => 'Keyboard', 'sku' => 'KB001', 'price' => 80.00, 'stock' => 45, 'category' => 'Accessories'],
            ]
        ], 200);
    } elseif ($uri === 'productos' && $method === 'POST') {
        respondJson(['success' => true, 'message' => 'Product created', 'id' => 4], 201);
    } else {
        http_response_code(405);
        respondJson(['error' => 'Method not allowed']);
    }
}

// ========== MOVEMENTS HANDLERS ==========
function handleMovimientos($uri, $method) {
    if ($uri === 'movimientos' && $method === 'GET') {
        respondJson([
            'success' => true,
            'data' => [
                ['id' => 1, 'producto_id' => 1, 'cantidad' => 10, 'tipo' => 'entrada', 'fecha' => date('Y-m-d')],
                ['id' => 2, 'producto_id' => 2, 'cantidad' => 50, 'tipo' => 'entrada', 'fecha' => date('Y-m-d')],
                ['id' => 3, 'producto_id' => 1, 'cantidad' => 5, 'tipo' => 'salida', 'fecha' => date('Y-m-d')],
            ]
        ], 200);
    } elseif ($uri === 'movimientos' && $method === 'POST') {
        respondJson(['success' => true, 'message' => 'Movement registered', 'id' => 4], 201);
    } else {
        http_response_code(405);
        respondJson(['error' => 'Method not allowed']);
    }
}

// ========== REPORTS HANDLERS ==========
function handleReportes($uri, $method) {
    if ($uri === 'reportes' && $method === 'GET') {
        respondJson([
            'success' => true,
            'data' => [
                'total_productos' => 3,
                'total_movimientos' => 150,
                'stock_bajo_count' => 1,
                'ingresos_mes' => 5400.00,
                'egresos_mes' => 450.00,
                'fecha_reporte' => date('Y-m-d')
            ]
        ], 200);
    } else {
        http_response_code(405);
        respondJson(['error' => 'Method not allowed']);
    }
}

// ========== PREDICTION HANDLERS ==========
function handlePrediccion($uri, $method) {
    if ($uri === 'prediccion' && $method === 'GET') {
        respondJson([
            'success' => true,
            'predicciones' => [
                ['producto_id' => 1, 'prediccion_demanda' => 45, 'confianza' => 0.87],
                ['producto_id' => 2, 'prediccion_demanda' => 120, 'confianza' => 0.92],
                ['producto_id' => 3, 'prediccion_demanda' => 65, 'confianza' => 0.81],
            ]
        ], 200);
    } else {
        http_response_code(405);
        respondJson(['error' => 'Method not allowed']);
    }
}

// ========== USERS HANDLERS ==========
function handleUsuarios($uri, $method) {
    if ($uri === 'usuarios' && $method === 'GET') {
        respondJson([
            'success' => true,
            'data' => [
                ['id' => 1, 'name' => 'Admin', 'email' => 'admin@example.com', 'role' => 'admin', 'status' => 'active'],
                ['id' => 2, 'name' => 'John Doe', 'email' => 'john@example.com', 'role' => 'user', 'status' => 'active'],
                ['id' => 3, 'name' => 'Jane Smith', 'email' => 'jane@example.com', 'role' => 'user', 'status' => 'active'],
            ]
        ], 200);
    } elseif ($uri === 'usuarios' && $method === 'POST') {
        respondJson(['success' => true, 'message' => 'User created', 'id' => 4], 201);
    } else {
        http_response_code(405);
        respondJson(['error' => 'Method not allowed']);
    }
}
?>
