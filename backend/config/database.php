<?php
/**
 * Database Configuration
 * Conecta a Google Cloud SQL con PDO
 */

// Configuración para Cloud Run usando Cloud SQL Connector (Unix Socket)
$socket_dir = getenv('DB_SOCKET_DIR') ?: '/cloudsql';
$instance_connection_name = getenv('INSTANCE_CONNECTION_NAME') ?: 'noble-return-447622-s1:southamerica-east1:inventario-db';

$db_socket = $socket_dir . '/' . $instance_connection_name;
$db_user = getenv('DB_USER') ?: 'JuanDavid';
$db_password = getenv('DB_PASSWORD') ?: 'Jotaro,07,2006';
$db_name = getenv('DB_NAME') ?: 'inventario_db';

// Crear conexión usando PDO
try {
    $dsn = sprintf(
        'mysql:dbname=%s;unix_socket=%s',
        $db_name,
        $db_socket
    );
    
    $pdo = new PDO($dsn, $db_user, $db_password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode([
        'error' => 'Database connection failed',
        'message' => $e->getMessage()
    ]));
}

return [
    'host' => 'localhost',
    'database' => $db_name,
    'user' => $db_user,
    'password' => $db_password,
    'port' => 3306,
    'pdo' => $pdo
];
?>
