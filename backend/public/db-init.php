<?php
/**
 * Inicialización de la base de datos - ejecutar una vez al desplegar
 * Crea las tablas necesarias si no existen
 */

try {
    // Cargar configuración de base de datos
    $db_config = require_once dirname(__DIR__) . '/config/database.php';
    $pdo = $db_config['pdo'];
    
    // SQL para crear tablas
    $sql = <<<SQL
    -- Crear tabla de usuarios
    CREATE TABLE IF NOT EXISTS usuarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol ENUM('admin', 'usuario') DEFAULT 'usuario',
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- Crear tabla de productos
    CREATE TABLE IF NOT EXISTS productos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10, 2) NOT NULL,
        cantidad INT DEFAULT 0,
        categoria VARCHAR(100),
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- Crear tabla de movimientos
    CREATE TABLE IF NOT EXISTS movimientos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        producto_id INT NOT NULL,
        tipo ENUM('entrada', 'salida', 'ajuste') NOT NULL,
        cantidad INT NOT NULL,
        referencia VARCHAR(255),
        notas TEXT,
        usuario_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    SQL;

    // Ejecutar cada CREATE TABLE statement por separado
    $statements = array_filter(array_map('trim', explode(';', $sql)), function($stmt) {
        return !empty($stmt) && strpos($stmt, '--') === false && strpos($stmt, '/*') === false;
    });

    foreach ($statements as $statement) {
        if (!empty(trim($statement))) {
            $pdo->exec($statement);
        }
    }

    // Usuario administrador inicial.
    //
    // La contrasena sale del entorno. Sembrar un literal significa que todas
    // las instalaciones del sistema comparten la misma clave de admin, y basta
    // con que una se publique para que el resto quede abierto.
    $admin_email = getenv('ADMIN_EMAIL') ?: 'admin@inventario.com';
    $admin_plain = getenv('ADMIN_PASSWORD') ?: '';

    if (strlen($admin_plain) < 8) {
        throw new RuntimeException(
            'Definir ADMIN_PASSWORD (minimo 8 caracteres) antes de inicializar la base de datos.'
        );
    }

    $admin_password = password_hash($admin_plain, PASSWORD_BCRYPT);

    $check_admin = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $check_admin->execute([$admin_email]);
    
    if ($check_admin->rowCount() === 0) {
        $insert_admin = $pdo->prepare("
            INSERT INTO usuarios (nombre, email, password, rol, activo)
            VALUES (?, ?, ?, ?, ?)
        ");
        $insert_admin->execute([
            'Administrador',
            $admin_email,
            $admin_password,
            'admin',
            true
        ]);
    }

    // Insertar productos de prueba
    $check_products = $pdo->prepare("SELECT COUNT(*) as count FROM productos");
    $check_products->execute();
    $result = $check_products->fetch(PDO::FETCH_ASSOC);
    
    if ($result['count'] === 0) {
        $insert_products = $pdo->prepare("
            INSERT INTO productos (nombre, descripcion, precio, cantidad, categoria, activo)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $products = [
            ['Laptop Dell XPS', 'Laptop de alta performance', 1200.00, 5, 'Computadoras', true],
            ['Mouse Logitech', 'Mouse inalámbrico', 25.00, 50, 'Accesorios', true],
            ['Teclado Mecánico', 'Teclado RGB', 100.00, 15, 'Accesorios', true],
        ];
        
        foreach ($products as $product) {
            $insert_products->execute($product);
        }
    }
    
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'message' => 'Base de datos inicializada correctamente'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
