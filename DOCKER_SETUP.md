# 🐳 DOCKER_SETUP.md - InventarioPro

## 🚀 ¿Qué incluye este Docker?

- **Frontend**: React + Vite (Nginx)
- **Backend**: PHP 8 + Apache
- **Python ML**: PySpark + ML
- **MySQL**: Base de datos
- **phpMyAdmin**: Administra la BD

---

## 📦 Estructura de carpetas Docker

```
docker/
  Dockerfile.frontend   # Frontend build
  Dockerfile.backend    # Backend build
  Dockerfile.python     # Python ML build
  nginx.conf            # Nginx config para React
  apache.conf           # Apache config para PHP
.dockerignore           # Ignora archivos innecesarios
```

---

## ⚡ ¿Cómo usarlo?

### 1. Instala Docker Desktop (ya lo tienes)

### 2. Clona el repositorio
```bash
git clone https://github.com/JuanDavid-dev-lang/inventario.git
cd inventario
```

### 3. (Opcional) Copia tu base de datos
Coloca tu archivo `inventario_db.sql` en la raíz del proyecto.

### 4. Construye y levanta todo
```bash
docker-compose up --build
```

### 5. Accede a los servicios
- **Frontend**: http://localhost/
- **Backend API**: http://localhost:8000/api
- **phpMyAdmin**: http://localhost:8081 (user: inventario, pass: password123)
- **Spark UI**: http://localhost:4040 (cuando corras ML)

---

## 🛠️ Comandos útiles

- **Ver logs de un servicio**:
  ```bash
  docker-compose logs backend
  docker-compose logs frontend
  docker-compose logs python-ml
  ```
- **Reconstruir solo un servicio**:
  ```bash
  docker-compose build frontend
  docker-compose up frontend
  ```
- **Parar todo**:
  ```bash
  docker-compose down
  ```
- **Ver contenedores activos**:
  ```bash
  docker ps
  ```

---

## 🐍 Ejecutar ML en Docker

1. Entra al contenedor ML:
   ```bash
   docker exec -it inventario-ml bash
   ```
2. Ejecuta el pipeline:
   ```bash
   python spark_mining/run_spark_mining.py
   ```

---

## 📝 Notas importantes

- **Variables de entorno**: Puedes editar usuarios/contraseñas en `docker-compose.yml`.
- **Persistencia**: Los datos de MySQL se guardan en un volumen Docker (`mysql_data`).
- **Hot reload**: El frontend y backend usan volúmenes para desarrollo en vivo.
- **Producción**: Puedes adaptar los Dockerfile para optimizar imágenes y seguridad.

---

## 🧹 Limpiar todo
```bash
docker-compose down -v --remove-orphans
```

---

## 🐳 Troubleshooting
- Si un servicio no levanta, revisa logs con `docker-compose logs <servicio>`
- Si cambias dependencias, usa `docker-compose build <servicio>`
- Si MySQL no inicia, borra el volumen con `docker volume rm inventario_mysql_data`

---

## 📚 Referencias
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [PySpark Docker](https://hub.docker.com/r/apache/spark/)

---

¡Listo! Ahora tu proyecto corre en cualquier máquina con Docker. 🚀
