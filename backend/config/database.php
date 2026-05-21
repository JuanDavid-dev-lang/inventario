<?php
/**
 * Database Configuration
 * Conecta a Google Cloud SQL o base de datos local usando PDO
 */

$db_host = getenv('DB_HOST') ?: '127.0.0.1';
$db_port = getenv('DB_PORT') ?: '3306';
$db_user = getenv('DB_USER') ?: 'JuanDavid';
$db_password = getenv('DB_PASSWORD') ?: 'Jotaro,07,2006';
$db_name = getenv('DB_NAME') ?: 'inventario_db';
$instance_connection_name = getenv('INSTANCE_CONNECTION_NAME') ?: 'noble-return-447622-s1:southamerica-east1:inventario-db';

// Si el host o el socket está en Cloud Run, configurar el socket de Cloud SQL
$db_socket = null;
if (!empty($instance_connection_name) && file_exists('/cloudsql/' . $instance_connection_name)) {
    $socket_dir = getenv('DB_SOCKET_DIR') ?: '/cloudsql';
    $db_socket = $socket_dir . '/' . $instance_connection_name;
}

// Crear conexión usando PDO
try {
    if ($db_socket) {
        $dsn = sprintf(
            'mysql:dbname=%s;unix_socket=%s',
            $db_name,
            $db_socket
        );
    } else {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s',
            $db_host,
            $db_port,
            $db_name
        );
    }
    
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
    'host' => $db_host,
    'database' => $db_name,
    'user' => $db_user,
    'password' => $db_password,
    'port' => $db_port,
    'pdo' => $pdo
];
?>
