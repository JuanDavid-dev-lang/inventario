<?php
define('ROOT', dirname(__DIR__));

require_once ROOT . '/vendor/autoload.php';

use Firebase\JWT\JWT;

$defaultAllowedOrigins = [
    'https://inventario-frontend-208277945925.southamerica-east1.run.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
];

function configured_origins(array $defaults): array
{
    $configured = getenv('CORS_ALLOWED_ORIGINS') ?: getenv('FRONTEND_URL') ?: '';
    $origins = array_filter(array_map('trim', explode(',', $configured)));

    return array_values(array_unique(array_merge($defaults, $origins)));
}

function apply_cors_headers(array $allowedOrigins): bool
{
    $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $hasOrigin = $requestOrigin !== '';
    $originAllowed = !$hasOrigin
        || in_array('*', $allowedOrigins, true)
        || in_array($requestOrigin, $allowedOrigins, true)
        || (bool) preg_match('#^https://inventario-frontend-[a-z0-9-]+\.southamerica-east1\.run\.app$#i', $requestOrigin);

    foreach ([
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
        'Access-Control-Max-Age',
    ] as $header) {
        header_remove($header);
    }

    if (!$hasOrigin) {
        header('Access-Control-Allow-Origin: *', true);
    } elseif ($originAllowed) {
        header('Access-Control-Allow-Origin: ' . $requestOrigin, true);
    }

    header('Vary: Origin', true);
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS', true);
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin', true);
    header('Access-Control-Max-Age: 86400', true);

    return $originAllowed;
}

$corsAllowed = apply_cors_headers(configured_origins($defaultAllowedOrigins));
header('Content-Type: application/json; charset=utf-8', true);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (!$corsAllowed) {
        http_response_code(403);
        exit;
    }

    http_response_code(204);
    exit;
}

function respond($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $_POST;
}

function path(): string
{
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
    $path = '/' . trim($path, '/');
    if ($path === '/') {
        return '/';
    }
    return preg_replace('#^/api(?=/|$)#', '', $path) ?: '/';
}

function columns(PDO $pdo, string $table): array
{
    static $cache = [];
    if (!isset($cache[$table])) {
        $stmt = $pdo->query("SHOW COLUMNS FROM `$table`");
        $cache[$table] = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'Field');
    }
    return $cache[$table];
}

function has_column(PDO $pdo, string $table, string $column): bool
{
    return in_array($column, columns($pdo, $table), true);
}

function first_column(PDO $pdo, string $table, array $candidates, string $fallback): string
{
    foreach ($candidates as $candidate) {
        if (has_column($pdo, $table, $candidate)) {
            return $candidate;
        }
    }
    return $fallback;
}

function product_select(PDO $pdo): string
{
    $cols = columns($pdo, 'productos');
    $has = fn(string $column): bool => in_array($column, $cols, true);

    $codigo = $has('codigo') ? 'codigo' : "CONCAT('PROD-', id)";
    $precioCompra = $has('precio_compra') ? 'precio_compra' : ($has('precio') ? 'precio' : '0');
    $precioVenta = $has('precio_venta') ? 'precio_venta' : ($has('precio') ? 'precio' : '0');
    $stockActual = $has('stock_actual') ? 'stock_actual' : ($has('cantidad') ? 'cantidad' : '0');
    $stockMinimo = $has('stock_minimo') ? 'stock_minimo' : '10';
    $created = $has('creado_en') ? 'creado_en' : ($has('created_at') ? 'created_at' : ($has('fecha_creacion') ? 'fecha_creacion' : 'NOW()'));
    $descripcion = $has('descripcion') ? 'descripcion' : "''";
    $categoria = $has('categoria') ? 'categoria' : "''";

    return "id, $codigo AS codigo, nombre, $descripcion AS descripcion, $precioCompra AS precio_compra, " .
        "$precioVenta AS precio_venta, $stockActual AS stock_actual, $stockMinimo AS stock_minimo, " .
        "$categoria AS categoria, $created AS creado_en";
}

function read_products(PDO $pdo, ?int $id = null, ?string $search = null): array
{
    $select = product_select($pdo);
    $where = [];
    $params = [];

    if (has_column($pdo, 'productos', 'activo')) {
        $where[] = 'activo = TRUE';
    }
    if ($id !== null) {
        $where[] = 'id = ?';
        $params[] = $id;
    }
    if ($search) {
        $where[] = '(nombre LIKE ? OR CAST(id AS CHAR) LIKE ?)';
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    $sql = "SELECT $select FROM productos";
    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY id DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function insert_for_existing_columns(PDO $pdo, string $table, array $values): int
{
    $filtered = array_filter(
        $values,
        fn($value, $column): bool => $value !== null && has_column($pdo, $table, $column),
        ARRAY_FILTER_USE_BOTH
    );

    if (!$filtered) {
        throw new RuntimeException("No hay columnas validas para insertar en $table");
    }

    $columns = array_keys($filtered);
    $placeholders = implode(', ', array_fill(0, count($columns), '?'));
    $columnList = '`' . implode('`, `', $columns) . '`';
    $stmt = $pdo->prepare("INSERT INTO `$table` ($columnList) VALUES ($placeholders)");
    $stmt->execute(array_values($filtered));
    return (int) $pdo->lastInsertId();
}

function update_for_existing_columns(PDO $pdo, string $table, int $id, array $values): void
{
    $filtered = array_filter(
        $values,
        fn($value, $column): bool => $value !== null && has_column($pdo, $table, $column),
        ARRAY_FILTER_USE_BOTH
    );

    if (!$filtered) {
        return;
    }

    $sets = array_map(fn($column): string => "`$column` = ?", array_keys($filtered));
    $stmt = $pdo->prepare("UPDATE `$table` SET " . implode(', ', $sets) . ' WHERE id = ?');
    $stmt->execute([...array_values($filtered), $id]);
}

function stock_column(PDO $pdo): string
{
    return first_column($pdo, 'productos', ['stock_actual', 'cantidad'], 'cantidad');
}

function date_column(PDO $pdo, string $table): string
{
    return first_column($pdo, $table, ['fecha', 'created_at', 'fecha_creacion', 'creado_en'], 'created_at');
}

function movement_reason_column(PDO $pdo): ?string
{
    foreach (['motivo', 'razon', 'referencia', 'notas'] as $column) {
        if (has_column($pdo, 'movimientos', $column)) {
            return $column;
        }
    }
    return null;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $route = path();

    if ($route === '/' || $route === '/health') {
        respond(['status' => 'ok', 'service' => 'inventario-api']);
    }

    $db = require ROOT . '/config/database.php';
    $pdo = $db['pdo'];

    if ($route === '/auth/login' && $method === 'POST') {
        $input = body();
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';

        if ($email === '' || $password === '') {
            respond(['error' => 'email and password required'], 400);
        }

        $stmt = $pdo->prepare('SELECT * FROM usuarios WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        $valid = $user && (
            password_verify($password, $user['password']) ||
            hash_equals((string) $user['password'], $password)
        );

        if (!$valid) {
            respond(['error' => 'Invalid credentials'], 401);
        }

        $payload = [
            'iat' => time(),
            'exp' => time() + 3600,
            'user_id' => (int) $user['id'],
            'email' => $user['email'],
            'nombre' => $user['nombre'],
            'rol' => $user['rol'],
        ];
        $secret = getenv('JWT_SECRET') ?: 'tu_secret_key_super_seguro_para_jwt_produccion';
        $token = JWT::encode($payload, $secret, 'HS256');

        respond([
            'token' => $token,
            'user' => [
                'id' => (int) $user['id'],
                'nombre' => $user['nombre'],
                'email' => $user['email'],
                'rol' => $user['rol'],
            ],
        ]);
    }

    if ($route === '/auth/logout' && $method === 'POST') {
        respond(['status' => 'ok']);
    }

    if ($route === '/auth/perfil' && $method === 'GET') {
        respond(['user' => ['nombre' => 'Administrador', 'rol' => 'admin']]);
    }

    if ($route === '/productos' && $method === 'GET') {
        $productos = read_products($pdo, null, $_GET['buscar'] ?? null);
        respond(['productos' => $productos, 'data' => $productos]);
    }

    if (preg_match('#^/productos/(\d+)$#', $route, $matches) && $method === 'GET') {
        $productos = read_products($pdo, (int) $matches[1]);
        if (!$productos) {
            respond(['error' => 'Producto no encontrado'], 404);
        }
        respond($productos[0]);
    }

    if ($route === '/productos' && $method === 'POST') {
        $input = body();
        $id = insert_for_existing_columns($pdo, 'productos', [
            'codigo' => $input['codigo'] ?? null,
            'nombre' => $input['nombre'] ?? null,
            'descripcion' => $input['descripcion'] ?? '',
            'precio' => $input['precio_venta'] ?? $input['precio_compra'] ?? $input['precio'] ?? 0,
            'precio_compra' => $input['precio_compra'] ?? $input['precio'] ?? 0,
            'precio_venta' => $input['precio_venta'] ?? $input['precio'] ?? 0,
            'cantidad' => $input['stock_actual'] ?? $input['cantidad'] ?? 0,
            'stock_actual' => $input['stock_actual'] ?? $input['cantidad'] ?? 0,
            'stock_minimo' => $input['stock_minimo'] ?? 10,
            'categoria' => $input['categoria'] ?? '',
            'activo' => true,
        ]);
        respond(['status' => 'created', 'id' => $id], 201);
    }

    if (preg_match('#^/productos/(\d+)$#', $route, $matches) && $method === 'PUT') {
        $input = body();
        update_for_existing_columns($pdo, 'productos', (int) $matches[1], [
            'codigo' => $input['codigo'] ?? null,
            'nombre' => $input['nombre'] ?? null,
            'descripcion' => $input['descripcion'] ?? null,
            'precio' => $input['precio_venta'] ?? $input['precio_compra'] ?? $input['precio'] ?? null,
            'precio_compra' => $input['precio_compra'] ?? null,
            'precio_venta' => $input['precio_venta'] ?? null,
            'cantidad' => $input['stock_actual'] ?? $input['cantidad'] ?? null,
            'stock_actual' => $input['stock_actual'] ?? $input['cantidad'] ?? null,
            'stock_minimo' => $input['stock_minimo'] ?? null,
            'categoria' => $input['categoria'] ?? null,
        ]);
        respond(['status' => 'updated']);
    }

    if (preg_match('#^/productos/(\d+)$#', $route, $matches) && $method === 'DELETE') {
        if (has_column($pdo, 'productos', 'activo')) {
            $stmt = $pdo->prepare('UPDATE productos SET activo = FALSE WHERE id = ?');
        } else {
            $stmt = $pdo->prepare('DELETE FROM productos WHERE id = ?');
        }
        $stmt->execute([(int) $matches[1]]);
        respond(['status' => 'deleted']);
    }

    if ($route === '/movimientos' && $method === 'GET') {
        $date = date_column($pdo, 'movimientos');
        $reason = movement_reason_column($pdo) ?: "''";
        $sql = "SELECT m.id, m.producto_id, p.nombre AS producto, m.tipo, m.cantidad, $reason AS motivo, " .
            "u.nombre AS usuario, $date AS fecha, NULL AS stock_antes, NULL AS stock_despues " .
            "FROM movimientos m LEFT JOIN productos p ON p.id = m.producto_id " .
            "LEFT JOIN usuarios u ON u.id = m.usuario_id ORDER BY m.id DESC LIMIT 100";
        $rows = $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        respond(['movimientos' => $rows, 'data' => $rows]);
    }

    if ($route === '/movimientos/registrar' && $method === 'POST') {
        $input = body();
        $productoId = (int) ($input['producto_id'] ?? 0);
        $cantidad = max(0, (int) ($input['cantidad'] ?? 0));
        $tipo = $input['tipo'] ?? 'entrada';
        $motivo = $input['motivo'] ?? $input['razon'] ?? $input['referencia'] ?? '';

        if ($productoId <= 0 || $cantidad <= 0) {
            respond(['error' => 'producto_id and cantidad are required'], 400);
        }

        $pdo->beginTransaction();
        $stock = stock_column($pdo);
        $delta = $tipo === 'salida' ? -$cantidad : $cantidad;
        if ($tipo === 'ajuste') {
            $delta = 0;
        }

        $values = [
            'producto_id' => $productoId,
            'usuario_id' => 1,
            'tipo' => $tipo,
            'cantidad' => $cantidad,
        ];
        $reasonColumn = movement_reason_column($pdo);
        if ($reasonColumn) {
            $values[$reasonColumn] = $motivo;
        }
        insert_for_existing_columns($pdo, 'movimientos', $values);

        if ($tipo === 'ajuste') {
            $stmt = $pdo->prepare("UPDATE productos SET `$stock` = ? WHERE id = ?");
            $stmt->execute([$cantidad, $productoId]);
        } else {
            $stmt = $pdo->prepare("UPDATE productos SET `$stock` = GREATEST(0, `$stock` + ?) WHERE id = ?");
            $stmt->execute([$delta, $productoId]);
        }
        $pdo->commit();
        respond(['status' => 'created'], 201);
    }

    if ($route === '/usuarios' && $method === 'GET') {
        $created = date_column($pdo, 'usuarios');
        $activo = has_column($pdo, 'usuarios', 'activo') ? 'activo' : 'TRUE';
        $users = $pdo->query("SELECT id, nombre, email, rol, $activo AS activo, $created AS creado_en FROM usuarios ORDER BY id DESC")
            ->fetchAll(PDO::FETCH_ASSOC);
        respond(['usuarios' => $users, 'data' => $users]);
    }

    if ($route === '/usuarios' && $method === 'POST') {
        $input = body();
        $rol = ($input['rol'] ?? 'usuario') === 'admin' ? 'admin' : 'usuario';
        $id = insert_for_existing_columns($pdo, 'usuarios', [
            'nombre' => $input['nombre'] ?? null,
            'email' => $input['email'] ?? null,
            'password' => password_hash($input['password'] ?? '123456', PASSWORD_BCRYPT),
            'rol' => $rol,
            'activo' => true,
        ]);
        respond(['status' => 'created', 'id' => $id], 201);
    }

    if (preg_match('#^/usuarios/(\d+)$#', $route, $matches) && $method === 'PUT') {
        $input = body();
        $values = [
            'nombre' => $input['nombre'] ?? null,
            'email' => $input['email'] ?? null,
            'rol' => isset($input['rol']) ? ($input['rol'] === 'admin' ? 'admin' : 'usuario') : null,
            'activo' => $input['activo'] ?? null,
        ];
        if (!empty($input['password'])) {
            $values['password'] = password_hash($input['password'], PASSWORD_BCRYPT);
        }
        update_for_existing_columns($pdo, 'usuarios', (int) $matches[1], $values);
        respond(['status' => 'updated']);
    }

    if (preg_match('#^/usuarios/(\d+)$#', $route, $matches) && $method === 'DELETE') {
        if (has_column($pdo, 'usuarios', 'activo')) {
            $stmt = $pdo->prepare('UPDATE usuarios SET activo = FALSE WHERE id = ?');
        } else {
            $stmt = $pdo->prepare('DELETE FROM usuarios WHERE id = ?');
        }
        $stmt->execute([(int) $matches[1]]);
        respond(['status' => 'deleted']);
    }

    if ($route === '/reportes/datos' && $method === 'GET') {
        $stock = stock_column($pdo);
        $price = first_column($pdo, 'productos', ['precio_venta', 'precio'], 'precio');
        $minStock = has_column($pdo, 'productos', 'stock_minimo') ? 'stock_minimo' : '10';
        $activeWhere = has_column($pdo, 'productos', 'activo') ? 'WHERE activo = TRUE' : '';

        $kpis = $pdo->query("SELECT COUNT(*) AS total_productos, COALESCE(SUM($stock * $price), 0) AS valor_inventario FROM productos $activeWhere")
            ->fetch(PDO::FETCH_ASSOC);
        $todayColumn = date_column($pdo, 'movimientos');
        $movimientosHoy = $pdo->query("SELECT COUNT(*) FROM movimientos WHERE DATE($todayColumn) = CURDATE()")->fetchColumn();
        $movimientos = $pdo->query("SELECT DATE($todayColumn) AS dia, tipo, SUM(cantidad) AS total FROM movimientos GROUP BY DATE($todayColumn), tipo ORDER BY dia ASC")
            ->fetchAll(PDO::FETCH_ASSOC);
        $stockCritico = $pdo->query("SELECT nombre, $stock AS stock_actual FROM productos WHERE $stock <= $minStock ORDER BY $stock ASC LIMIT 10")
            ->fetchAll(PDO::FETCH_ASSOC);
        $topProductos = $pdo->query("SELECT nombre, $stock AS stock_actual, ($stock * $price) AS valor FROM productos ORDER BY valor DESC LIMIT 10")
            ->fetchAll(PDO::FETCH_ASSOC);

        $alertas = array_map(fn($p): array => [
            'producto' => $p['nombre'],
            'tipo' => ((int) $p['stock_actual']) <= 0 ? 'sin_stock' : 'stock_bajo',
            'mensaje' => $p['nombre'] . ' tiene stock critico: ' . $p['stock_actual'] . ' unidades',
            'creado_en' => date('c'),
        ], $stockCritico);

        respond([
            'kpis' => [
                'total_productos' => (int) ($kpis['total_productos'] ?? 0),
                'valor_inventario' => (float) ($kpis['valor_inventario'] ?? 0),
                'alertas_sin_leer' => count($alertas),
                'movimientos_hoy' => (int) $movimientosHoy,
            ],
            'movimientos' => $movimientos,
            'stock_critico' => $stockCritico,
            'alertas' => $alertas,
            'topProductos' => $topProductos,
            'sinStock' => count(array_filter($stockCritico, fn($p): bool => (int) $p['stock_actual'] <= 0)),
        ]);
    }

    if ($route === '/reportes/exportar-excel' && $method === 'GET') {
        respond(['status' => 'ok', 'message' => 'Export endpoint disponible']);
    }

    if (preg_match('#^/prediccion/calcular$#', $route) && $method === 'GET') {
        $productoId = (int) ($_GET['producto_id'] ?? 0);
        $producto = $productoId > 0 ? (read_products($pdo, $productoId)[0] ?? null) : null;
        if (!$producto) {
            respond(['error' => 'Producto no encontrado'], 404);
        }

        $stockActual = (int) $producto['stock_actual'];
        $stockMinimo = (int) $producto['stock_minimo'];
        $riesgo = $stockActual <= 0 ? 'CRÍTICO' : ($stockActual <= $stockMinimo ? 'ALTO' : 'NORMAL');
        $recomendacion = max(0, ($stockMinimo * 2) - $stockActual);

        respond([
            'modelo_ia' => 'heuristico-cloud-run',
            'timestamp' => date('c'),
            'producto' => $producto,
            'prediccion_ia' => [
                'tendencia' => $riesgo === 'NORMAL' ? 'ESTABLE' : 'AUMENTANDO',
                'nivel_riesgo' => $riesgo,
                'recomendacion_compra' => $recomendacion,
                'confianza' => 0.78,
                'prediccion_demanda' => max(1, round($stockMinimo / 7, 1)),
                'analisis' => 'Prediccion basada en stock actual y stock minimo disponible.',
                'observaciones' => 'Conecta el modelo de IA cuando el servicio base este estable.',
            ],
        ]);
    }

    if ($route === '/prediccion/analisis' && $method === 'GET') {
        respond(['status' => 'ok', 'message' => 'Analisis general disponible']);
    }

    respond(['error' => 'Not Found', 'path' => $route], 404);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    respond(['error' => 'Internal Server Error', 'message' => $e->getMessage()], 500);
}
