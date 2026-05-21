<?php
// public/index.php - Front Controller
define('ROOT', dirname(dirname(__FILE__)));
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');
if (['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
try {
    $db_config = require_once ROOT . '/config/database.php';
    $pdo = $db_config['pdo'];
    require_once ROOT . '/vendor/autoload.php';
    use Firebase\JWT\JWT;
    $request_path = ['REQUEST_URI'];
    if (strpos($request_path, '?') !== false) { $request_path = parse_url($request_path, PHP_URL_QUERY); }
    $request_path = '/' . trim($request_path, '/');
    $method = ['REQUEST_METHOD'];
    if ($request_path === '/auth/login' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!isset($input['email']) || !isset($input['password'])) { http_response_code(400); echo json_encode(['error' => 'email and password required']); exit(); }
        if ($input['email'] === 'admin@inventario.com' && $input['password'] === 'admin123') {
            $user = ['id' => 1, 'nombre' => 'Administrador', 'rol' => 'admin'];
            $secret = 'tu_secret_key_super_seguro_para_jwt_produccion';
            $payload = ['iat' => time(), 'exp' => time() + 3600, 'user_id' => $user['id'], 'email' => $input['email'], 'nombre' => $user['nombre'], 'rol' => $user['rol']];
            $jwt = JWT::encode($payload, $secret, 'HS256');
            echo json_encode(['token' => $jwt, 'user' => $user]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
        }
        exit();
    }
    if ($request_path === '/api/productos' && $method === 'GET') {
        $stmt = $pdo->query('SELECT * FROM productos WHERE activo = TRUE');
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['data' => $productos]);
        exit();
    }
    http_response_code(404);
    echo json_encode(['error' => 'Not Found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
