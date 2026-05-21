<?php
/**
 * Database Configuration
 * Conecta a Google Cloud SQL
 */

// Variables de entorno o valores por defecto
$db_host = getenv('DB_HOST') ?: '35.198.18.171';
$db_user = getenv('DB_USER') ?: 'JuanDavid';
$db_password = getenv('DB_PASSWORD') ?: 'Jotaro,07,2006';
$db_name = getenv('DB_NAME') ?: 'inventario';
$db_port = getenv('DB_PORT') ?: 3306;

// Crear conexión
$conn = new mysqli($db_host, $db_user, $db_password, $db_name, $db_port);

// Verificar conexión
if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode([
        'error' => 'Connection failed',
        'message' => $conn->connect_error
    ]));
}

// Set charset
$conn->set_charset("utf8mb4");

// Retornar conexión
?>
