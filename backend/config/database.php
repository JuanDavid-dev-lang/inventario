<?php
/**
 * Database Configuration
 * Conecta a Google Cloud SQL
 */

// Configuración para Cloud Run usando Cloud SQL Connector (Unix Socket)
// Formato del socket: /cloudsql/PROJECT_ID:REGION:INSTANCE_ID
$socket_dir = getenv('DB_SOCKET_DIR') ?: '/cloudsql';
$instance_connection_name = getenv('INSTANCE_CONNECTION_NAME') ?: 'noble-return-447622-s1:southamerica-east1:inventario-db';

$db_socket = $socket_dir . '/' . $instance_connection_name;
$db_user = getenv('DB_USER') ?: 'JuanDavid';
$db_password = getenv('DB_PASSWORD') ?: 'Jotaro,07,2006';
$db_name = getenv('DB_NAME') ?: 'inventario';

// Crear conexión usando PDO (es más robusto para sockets)
try {
    $dsn = sprintf(
        'mysql:dbname=%s;unix_socket=%s',
        $db_name,
        $db_socket
    );
    $conn_pdo = new PDO($dsn, $db_user, $db_password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);
    
    // Como tu aplicación original usa mysqli, vamos a crear una conexión mysqli compatible 
    // pero configurada para usar el socket
    $conn = new mysqli(null, $db_user, $db_password, $db_name, null, $db_socket);

    if ($conn->connect_error) {
        throw new Exception("Conexión mysqli fallida: " . $conn->connect_error);
    }
    
    $conn->set_charset("utf8mb4");

} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode([
        'error' => 'Connection failed PDO',
        'message' => $e->getMessage()
    ]));
} catch (Exception $e) {
    http_response_code(500);
    die(json_encode([
        'error' => 'Connection failed Mysqli',
        'message' => $e->getMessage()
    ]));
}

// Retornar conexión
?>
