<?php
// public/index.php - Front Controller (MVC Entry Point)

// CORS Headers - MUST be first
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight request
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
$request_uri = $_SERVER['REQUEST_URI'];

// Parse path, removing query string and handling both /path and ?/path formats
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/index.php', '', $path);
$path = rtrim($path, '/') ?: '/';

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
    echo json_encode(['error' => 'Not Found', 'path' => $path]);
    exit;
}