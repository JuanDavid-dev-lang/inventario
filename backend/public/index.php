<?php
// public/index.php - Front Controller (MVC Entry Point)

// CORS Headers - MUST be first (before any output)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

define('ROOT', dirname(dirname(__FILE__)));

require ROOT . '/vendor/autoload.php';

// Database connection
$config = require ROOT . '/config/database.php';
$pdo = $config['pdo'];

// Route handling
$request_method = $_SERVER['REQUEST_METHOD'];

// Get the path from REQUEST_URI
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove leading /index.php if present
$path = str_replace('/index.php', '', $path);

// Normalize the path
$path = '/' . ltrim($path, '/');
$path = rtrim($path, '/');
if (empty($path)) {
    $path = '/';
}

// Simple routing
if (preg_match('#^/auth/login$#', $path) && $request_method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $email = $input['email'] ?? null;
    $password = $input['password'] ?? null;
    
    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password required']);
        exit;
    }
    
    // Mock login for now (in production, query the database)
    if ($email === 'admin@inventario.com' && $password === 'admin123') {
        $secret = 'tu_clave_secreta_jwt_aqui';
        $payload = [
            'iss' => 'inventario-api',
            'aud' => 'inventario-frontend',
            'iat' => time(),
            'exp' => time() + 86400,
            'email' => $email,
            'role' => 'admin'
        ];
        
        $token = \Firebase\JWT\JWT::encode($payload, $secret, 'HS256');
        
        http_response_code(200);
        echo json_encode([
            'token' => $token,
            'user' => [
                'email' => $email,
                'role' => 'admin'
            ]
        ]);
        exit;
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit;
    }
} elseif (preg_match('#^/api/productos$#', $path) && $request_method === 'GET') {
    // Get all products
    try {
        $stmt = $pdo->query('SELECT * FROM productos');
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode($productos);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not Found']);
    exit;
}