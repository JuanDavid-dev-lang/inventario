# Estado del proyecto tras la recuperación

Documento de traspaso. Qué se arregló, qué falta y qué **no** se debe hacer todavía.

Fecha de la intervención: 2026-08-09. Último commit propio del proyecto: 2026-06-10.

---

## Cambio de rumbo: instalación local, no nube

El proyecto nació apuntando a Cloud Run y Cloud SQL. **Ese despliegue ya no
existe**: ambos servicios responden 500. La dirección ahora es una instalación
local por empresa, con `docker compose`, que para una pyme significa sin
mensualidad y con los datos dentro del negocio.

Lo que cambió por eso:

- `docker/nginx.conf` proxyaba a una URL de Cloud Run muerta; ahora apunta al contenedor `backend`
- `frontend/src/services/api.js` apuntaba a esa misma API; ahora usa `/api` del mismo origen, así que una instalación local no necesita configuración
- La lista blanca de CORS nombraba el host de Cloud Run; ahora se define por variable de entorno
- `docker-compose.yml` ahora exige `JWT_SECRET` y parametriza `DB_PASSWORD`
- Eliminados `cloudbuild*.yaml`, `deploy.sh`, `deploy.bat`, `.gcloudignore`, `Procfile` y los Dockerfile de Cloud Run

## ⛔ Bloqueante antes de publicar o desplegar

**Rotar dos credenciales.** Estuvieron escritas en el repositorio (`notification-service/.env`, ahora purgado del historial):

1. **Contraseña de aplicación de Gmail** → revocar en https://myaccount.google.com/apppasswords
2. **Instancia de Cloud SQL** → borrarla desde la consola de GCP. Como el proyecto pasa a ser local, esa base ya no se usa; borrarla detiene el cobro mensual y hace desaparecer la contraseña filtrada junto con ella.

El repositorio siempre fue privado, así que nunca estuvieron expuestas públicamente. Pero mientras sigan siendo válidas, cualquier copia vieja del repositorio las contiene. Rotarlas convierte lo que quedó escrito en texto sin valor.

Los tokens JWT emitidos antes de este arreglo se firmaron con un secreto que estaba escrito en el código. Cada instalación local debe generar el suyo (`openssl rand -hex 32`) en su propio `.env`.

---

## Lo que se corrigió

### Seguridad

| Problema | Estado |
|---|---|
| **La API no verificaba ningún token.** Las 21 rutas después de `/auth/login` respondían sin autenticación: `GET /usuarios` devolvía la tabla de usuarios y `DELETE /usuarios/{id}` funcionaba para cualquiera que alcanzara el host | Corregido: una guarda `require_auth()` sobre toda la tabla de rutas |
| **Credenciales de demostración escritas en el código** (`admin123` / `password123`) que otorgaban rol admin, y creaban la cuenta si no existía | Eliminadas |
| **Comparación de contraseña en texto plano** como alternativa a bcrypt, lo que anulaba el hasheo para cualquier fila guardada sin hashear | Eliminada |
| **Secreto JWT por defecto** escrito en el código; quien leyera el archivo podía falsificar tokens de administrador | Eliminado: sin `JWT_SECRET` la API responde 500 |
| **Gestión de usuarios sin control de rol** | Las 4 rutas de `/usuarios` exigen rol admin |
| **`/auth/perfil` devolvía "Administrador"** a cualquier usuario autenticado | Devuelve la identidad real del token |
| Algoritmo del token no fijado | Fijado a HS256, para cerrar la falsificación por `alg: none` |

### Historial

- `notification-service/.env` con credenciales reales — **purgado de los 55 commits**
- `backups/backup_inventario_20260506_092147.sql` con 2 cuentas reales (hashes bcrypt y correos) — **purgado**
- `node_modules/` (23.572 archivos), `__pycache__/`, `*.pyc` — **purgados**
- Correo personal en archivos y en un mensaje de commit — **reemplazado por marcador**

De **23.690 archivos y 37 MB** a **100 archivos y 694 KB**, conservando los 55 commits.

### Estructura

- Eliminados `docker/backend/` y `docker/docker/`: copias muertas que nadie referenciaba, y la primera todavía contenía el código vulnerable
- Eliminados `init-cloudsql.sql` y `cloud_sql_init.sql`: sin referencias
- Los 10 documentos sueltos de la raíz movidos a `docs/`

### Pruebas

**Frontend: antes corrían cero.** Jest solo encontraba un archivo duplicado en `frontend/`; la suite real en `tests/unit/frontend/` le era invisible. Al apuntarlo ahí aparecieron cuatro fallas encadenadas: JSX sin compilar fuera de `frontend/`, `node_modules` inalcanzable desde la ruta del test, axios distribuido como ESM, y un import relativo mal escrito. **Ahora: 16 pasan, 3 omitidos con el motivo y el arreglo escritos al lado de cada uno.**

**Python: 5 pasan, 5 omitidos.** Las suites de Spark fallaban porque `pyml.spark_mining` nunca se importaba y `pyspark` no está instalado. Ahora se omiten solas cuando falta Spark, en lugar de romper la corrida entera.

### Integración continua

`.github/workflows/ci.yml` verifica sintaxis de PHP en toda la API, valida el manifiesto de Composer, corre las pruebas de frontend y su build, corre las de Python, y **falla si alguien reintroduce las fallas de autenticación eliminadas**.

---

## Lo que falta

- [ ] **Rotar las credenciales.** Bloqueante, arriba.
- [ ] **Un solo esquema de base de datos.** Quedan dos que difieren: `init.sql` (lo usa `docker-compose`) y `backend/migrations/001_init_schema.sql`. Consolidarlos requiere levantar la base y comparar, que no se hizo.
- [ ] **Los 3 tests de frontend omitidos.** El de `api.js` necesita que la URL base salga de `import.meta.env` a un módulo que Jest pueda leer. El de login se arregla subiendo a Jest 30. El de reportes está escrito contra una interfaz que ya no existe y hay que reescribirlo.
- [ ] **Sin pruebas del backend PHP.** Existe `tests/unit/backend/test_api.php` pero no hay PHPUnit configurado corriendo. Es el hueco más grande: la capa que se acaba de arreglar es la única sin pruebas que lo verifiquen.
- [ ] **El seed crea el admin con `admin123`.** Debería leer la contraseña de una variable de entorno y negarse a usar un valor por defecto.
- [ ] **CORS acepta cualquier origen cuando no hay cabecera `Origin`.** Revisar si eso es intencional.
- [ ] **Documentación desactualizada.** Los 10 archivos movidos a `docs/` describen el proyecto antes de estos cambios.

---

## Verificar antes de confiar

```bash
# El backdoor no volvió
grep -rn "is_demo_admin_login\|tu_secret_key" backend/    # sin resultados

# La guarda existe
grep -n "require_auth()" backend/public/index.php

# Nada sensible quedó en el historial
git log --all --format='%H' -- notification-service/.env  # sin resultados
```
