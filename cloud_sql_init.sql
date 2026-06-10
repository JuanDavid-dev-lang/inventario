-- Crear base de datos
CREATE DATABASE IF NOT EXISTS inventario;
USE inventario;

-- Crear tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'user',
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear tabla productos
CREATE TABLE IF NOT EXISTS productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  cantidad INT DEFAULT 0,
  stock_minimo INT DEFAULT 10,
  categoria VARCHAR(100),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear tabla movimientos
CREATE TABLE IF NOT EXISTS movimientos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  producto_id INT NOT NULL,
  usuario_id INT NOT NULL,
  tipo VARCHAR(50),
  cantidad INT NOT NULL,
  razon VARCHAR(255),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar usuario admin
INSERT IGNORE INTO usuarios (nombre, email, password, rol) 
VALUES ('Admin', 'admin@inventario.com', 'admin123', 'admin');

-- Insertar productos de prueba
INSERT IGNORE INTO productos (nombre, descripcion, precio, cantidad, stock_minimo, categoria)
VALUES 
  ('Laptop', 'Dell Inspiron 15', 899.99, 10, 5, 'Electrónica'),
  ('Mouse', 'Logitech M705', 29.99, 50, 20, 'Accesorios'),
  ('Teclado', 'Mechanical RGB', 129.99, 15, 8, 'Accesorios');
