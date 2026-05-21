<?php

// ---- STRICT CORS HANDLING ----
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");
header("Access-Control-Max-Age: 86400"); // Cache preflight requests por 24 horas

// Si es una petición OPTIONS (preflight de CORS), salir inmediatamente con éxito
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200); // o 204
    exit(0);
}

// public/index.php — Front Controller (MVC Entry Point)

define('ROOT', dirname(dirname(__FILE__)));
// Detectar BASE_URL basado en el entorno
if (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], 'localhost:8000') !== false) {
    // Entorno de desarrollo con Vite proxy
    define('BASE_URL', '');
} else {
    // Entorno de producción
    define('BASE_URL', '/inventario/public');
}

// Autoload Composer
require ROOT . '/vendor/autoload.php';

// Configuración
require ROOT . '/config/database.php';
require ROOT . '/config/jwt.php';

// Controladores
require ROOT . '/app/controllers/AuthController.php';
require ROOT . '/app/controllers/ProductoController.php';
require ROOT . '/app/controllers/MovimientoController.php';
require ROOT . '/app/controllers/ReporteController.php';
require ROOT . '/app/controllers/PrediccionController.php';
require ROOT . '/app/controllers/UsuariosController.php';

// Modelos
require ROOT . '/app/models/Usuario.php';
require ROOT . '/app/models/Producto.php';
require ROOT . '/app/models/Movimiento.php';
require ROOT . '/app/models/Venta.php';
require ROOT . '/app/models/Alerta.php';

// ---- Router ----
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = str_replace(BASE_URL, '', $uri);
$uri    = trim($uri, '/');
// Remove /api prefix if present (for frontend compatibility)
$uri    = preg_replace('|^api/|', '', $uri);
$method = $_SERVER['REQUEST_METHOD'];

// Debug: Log the URI being processed
// error_log("Processed URI: $uri from REQUEST_URI: {$_SERVER['REQUEST_URI']}, BASE_URL: " . BASE_URL);

// Rutas públicas (sin JWT)
$rutasPublicas = ['', 'login', 'auth/login'];

// Verificar autenticación para rutas protegidas
if (!in_array($uri, $rutasPublicas)) {
    $token = JWTHelper::obtenerTokenDeHeader();
    $user  = $token ? JWTHelper::validarToken($token) : null;
    if (!$user) {
        // Si es petición AJAX (desde JavaScript fetch) o navegador
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) || isset($_SERVER['HTTP_AUTHORIZATION'])) {
            // AJAX o con header Authorization
            http_response_code(401);
            echo json_encode(['error' => 'No autorizado']);
            exit;
        }
        // Petición desde navegador normal - redirigir al login
        header('Location: ' . BASE_URL . '/login');
        exit;
    }
}

// ---- Despacho de rutas ----
switch (true) {

    // Auth
    case ($uri === '' || $uri === 'login') && $method === 'GET':
        (new AuthController())->mostrarLogin();
        break;
    case $uri === 'auth/login' && $method === 'POST':
        (new AuthController())->login();
        break;
    case $uri === 'auth/logout' && $method === 'POST':
        (new AuthController())->logout();
        break;
    case $uri === 'auth/perfil' && $method === 'GET':
        (new AuthController())->obtenerPerfil();
        break;

    // Dashboard
    case $uri === 'dashboard':
        (new ReporteController())->dashboard();
        break;

    // Productos
    case $uri === 'productos' && $method === 'GET':
        (new ProductoController())->index();
        break;
    case $uri === 'productos/crear' && $method === 'GET':
        (new ProductoController())->mostrarCrear();
        break;
    case $uri === 'productos/crear' && $method === 'POST':
        (new ProductoController())->crear();
        break;
    case preg_match('/^productos\/(\d+)\/editar$/', $uri, $m) && $method === 'GET':
        (new ProductoController())->mostrarEditar((int)$m[1]);
        break;
    case preg_match('/^productos\/(\d+)\/editar$/', $uri, $m) && $method === 'POST':
        (new ProductoController())->editar((int)$m[1]);
        break;
    case preg_match('/^productos\/(\d+)\/eliminar$/', $uri, $m) && $method === 'POST':
        (new ProductoController())->eliminar((int)$m[1]);
        break;
    case $uri === 'productos/importar' && $method === 'POST':
        (new ProductoController())->importarExcel();
        break;

    // Movimientos
    case $uri === 'movimientos' && $method === 'GET':
        (new MovimientoController())->index();
        break;
    case $uri === 'movimientos/registrar' && $method === 'POST':
        (new MovimientoController())->registrar();
        break;

    // Reportes
    case $uri === 'reportes' && $method === 'GET':
        (new ReporteController())->index();
        break;
    case $uri === 'reportes/datos' && $method === 'GET':
        (new ReporteController())->datos();
        break;
    case $uri === 'reportes/alerta-leida' && $method === 'POST':
        (new ReporteController())->marcarAlertaLeida();
        break;
    case $uri === 'reportes/ignorar-alerta-critica' && $method === 'POST':
        (new ReporteController())->ignorarAlertaCritica();
        break;
    case $uri === 'reportes/exportar-excel' && $method === 'GET':
        (new ReporteController())->exportarExcel();
        break;

    // Predicción de demanda
    case $uri === 'prediccion' && $method === 'GET':
        (new PrediccionController())->index();
        break;
    case $uri === 'prediccion/calcular' && $method === 'GET':
        (new PrediccionController())->calcular();
        break;
    case $uri === 'prediccion/analisis' && $method === 'GET':
        (new PrediccionController())->analisisGeneral();
        break;
    case $uri === 'prediccion/analisis-original' && $method === 'GET':
        (new PrediccionController())->analisisOriginal();
        break;

    // Usuarios (solo admin)
    case $uri === 'usuarios' && $method === 'GET':
        (new UsuariosController())->index();
        break;
    case $uri === 'usuarios/crear' && $method === 'POST':
        (new UsuariosController())->crear();
        break;
    case preg_match('#^usuarios/([0-9]+)/editar$#', $uri, $m) && $method === 'POST':
        (new UsuariosController())->editar($m[1]);
        break;
    case preg_match('#^usuarios/([0-9]+)/eliminar$#', $uri, $m) && $method === 'POST':
        (new UsuariosController())->eliminar($m[1]);
        break;

    // 404
    default:
        http_response_code(404);
        echo "<h1>404 — Página no encontrada</h1>";
        break;
}

// Controladores
require ROOT . '/app/controllers/AuthController.php';
require ROOT . '/app/controllers/ProductoController.php';
require ROOT . '/app/controllers/MovimientoController.php';
require ROOT . '/app/controllers/ReporteController.php';
require ROOT . '/app/controllers/PrediccionController.php';
require ROOT . '/app/controllers/UsuariosController.php';

// Modelos
require ROOT . '/app/models/Usuario.php';
require ROOT . '/app/models/Producto.php';
require ROOT . '/app/models/Movimiento.php';
require ROOT . '/app/models/Venta.php';
require ROOT . '/app/models/Alerta.php';

// ---- Router ----
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = str_replace(BASE_URL, '', $uri);
$uri    = trim($uri, '/');
// Remove /api prefix if present (for frontend compatibility)
$uri    = preg_replace('|^api/|', '', $uri);
$method = $_SERVER['REQUEST_METHOD'];

// Debug: Log the URI being processed
// error_log("Processed URI: $uri from REQUEST_URI: {$_SERVER['REQUEST_URI']}, BASE_URL: " . BASE_URL);

// Rutas públicas (sin JWT)
$rutasPublicas = ['', 'login', 'auth/login'];

// Verificar autenticación para rutas protegidas
if (!in_array($uri, $rutasPublicas)) {
    $token = JWTHelper::obtenerTokenDeHeader();
    $user  = $token ? JWTHelper::validarToken($token) : null;
    if (!$user) {
        // Si es petición AJAX (desde JavaScript fetch) o navegador
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) || isset($_SERVER['HTTP_AUTHORIZATION'])) {
            // AJAX o con header Authorization
            http_response_code(401);
            echo json_encode(['error' => 'No autorizado']);
            exit;
        }
        // Petición desde navegador normal - redirigir al login
        header('Location: ' . BASE_URL . '/login');
        exit;
    }
}

// ---- Despacho de rutas ----
switch (true) {

    // Auth
    case ($uri === '' || $uri === 'login') && $method === 'GET':
        (new AuthController())->mostrarLogin();
        break;
    case $uri === 'auth/login' && $method === 'POST':
        (new AuthController())->login();
        break;
    case $uri === 'auth/logout' && $method === 'POST':
        (new AuthController())->logout();
        break;
    case $uri === 'auth/perfil' && $method === 'GET':
        (new AuthController())->obtenerPerfil();
        break;

    // Dashboard
    case $uri === 'dashboard':
        (new ReporteController())->dashboard();
        break;

    // Productos
    case $uri === 'productos' && $method === 'GET':
        (new ProductoController())->index();
        break;
    case $uri === 'productos/crear' && $method === 'GET':
        (new ProductoController())->mostrarCrear();
        break;
    case $uri === 'productos/crear' && $method === 'POST':
        (new ProductoController())->crear();
        break;
    case preg_match('/^productos\/(\d+)\/editar$/', $uri, $m) && $method === 'GET':
        (new ProductoController())->mostrarEditar((int)$m[1]);
        break;
    case preg_match('/^productos\/(\d+)\/editar$/', $uri, $m) && $method === 'POST':
        (new ProductoController())->editar((int)$m[1]);
        break;
    case preg_match('/^productos\/(\d+)\/eliminar$/', $uri, $m) && $method === 'POST':
        (new ProductoController())->eliminar((int)$m[1]);
        break;
    case $uri === 'productos/importar' && $method === 'POST':
        (new ProductoController())->importarExcel();
        break;

    // Movimientos
    case $uri === 'movimientos' && $method === 'GET':
        (new MovimientoController())->index();
        break;
    case $uri === 'movimientos/registrar' && $method === 'POST':
        (new MovimientoController())->registrar();
        break;

    // Reportes
    case $uri === 'reportes' && $method === 'GET':
        (new ReporteController())->index();
        break;
    case $uri === 'reportes/datos' && $method === 'GET':
        (new ReporteController())->datos();
        break;
    case $uri === 'reportes/alerta-leida' && $method === 'POST':
        (new ReporteController())->marcarAlertaLeida();
        break;
    case $uri === 'reportes/ignorar-alerta-critica' && $method === 'POST':
        (new ReporteController())->ignorarAlertaCritica();
        break;
    case $uri === 'reportes/exportar-excel' && $method === 'GET':
        (new ReporteController())->exportarExcel();
        break;

    // Predicción de demanda
    case $uri === 'prediccion' && $method === 'GET':
        (new PrediccionController())->index();
        break;
    case $uri === 'prediccion/calcular' && $method === 'GET':
        (new PrediccionController())->calcular();
        break;
    case $uri === 'prediccion/analisis' && $method === 'GET':
        (new PrediccionController())->analisisGeneral();
        break;
    case $uri === 'prediccion/analisis-original' && $method === 'GET':
        (new PrediccionController())->analisisOriginal();
        break;

    // Usuarios (solo admin)
    case $uri === 'usuarios' && $method === 'GET':
        (new UsuariosController())->index();
        break;
    case $uri === 'usuarios/crear' && $method === 'POST':
        (new UsuariosController())->crear();
        break;
    case preg_match('#^usuarios/([0-9]+)/editar$#', $uri, $m) && $method === 'POST':
        (new UsuariosController())->editar($m[1]);
        break;
    case preg_match('#^usuarios/([0-9]+)/eliminar$#', $uri, $m) && $method === 'POST':
        (new UsuariosController())->eliminar($m[1]);
        break;

    // 404
    default:
        http_response_code(404);
        echo "<h1>404 — Página no encontrada</h1>";
        break;
}
