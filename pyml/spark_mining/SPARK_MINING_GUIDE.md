# 🔥 Apache Spark Mining - Guía Paso a Paso

## 📊 ¿QUÉ ES ESTO?

Has agregado **Apache Spark** para minería de datos distribuida y análisis avanzados en tu sistema de inventario.

**Beneficios:**
- ✅ Procesamiento paralelo de millones de registros
- ✅ Entrenamiento de modelos ML más rápido
- ✅ Análisis complejos escalables
- ✅ Detección de anomalías automática
- ✅ Reportes de insights en tiempo real

---

## 🗂️ ESTRUCTURA DE ARCHIVOS

```
pyml/
├── spark_mining/                    ← NUEVA CARPETA
│   ├── __init__.py                  # Inicialización del módulo
│   ├── spark_config.py              # Configuración de Spark
│   ├── spark_trainer.py             # Entrenamiento distribuido
│   ├── spark_analyzer.py            # Análisis de datos
│   └── run_spark_mining.py          # Script principal
├── requirements.txt                 # ⚠️ ACTUALIZADO (agregó pyspark)
├── predictor.py                     # Ya existente
└── trainer.py                       # Ya existente
```

---

## 🚀 PASO 1: PREPARAR EL ENTORNO

### 1.1 Abrir PowerShell en la carpeta del proyecto

```powershell
cd "c:\Users\juan david\Pictures\inventario\inventario"
```

### 1.2 Crear ambiente virtual (si no existe)

```powershell
python -m venv venv
```

### 1.3 Activar el ambiente

**En Windows:**
```powershell
venv\Scripts\Activate.ps1
```

**En Linux/Mac:**
```bash
source venv/bin/activate
```

---

## 📦 PASO 2: INSTALAR DEPENDENCIAS

```powershell
cd pyml
pip install -r requirements.txt
```

⏰ **Nota:** PySpark (~200 MB) se descargará. Puede tomar 3-5 minutos.

**Output esperado:**
```
Successfully installed pyspark-3.5.0 numpy-1.24.3 pandas-2.0.3 ...
```

---

## ✋ PASO 3: REQUISITOS PREVIOS

Antes de ejecutar Spark, asegúrate que:

### 3.1 Java instalado
```powershell
java -version
```
**Esperado:** Versión 8 o superior

Si no está instalado, descárgalo de [java.com](https://www.java.com)

### 3.2 Backend PHP corriendo
```powershell
cd backend
php -S localhost:8000 -t public/
```

### 3.3 Base de datos MySQL/MariaDB corriendo
- Abre XAMPP
- Inicia MySQL
- Asegúrate que la BD `inventario_db` existe

---

## 🎯 PASO 4: EJECUTAR EL MINING CON SPARK

### 4.1 Script principal (Recomendado)

Desde la carpeta `pyml/`:

```powershell
python spark_mining/run_spark_mining.py
```

**Esto ejecutará:**
1. ✅ Inicializa sesión Spark
2. ✅ Descarga datos del API
3. ✅ Entrena modelo ML distribuido
4. ✅ Analiza patrones de ventas
5. ✅ Detecta anomalías
6. ✅ Genera reportes

### 4.2 Uso avanzado - Scripts individuales

**Solo entrenamiento:**
```python
from spark_mining import SparkModelTrainer

trainer = SparkModelTrainer()
trainer.run_training()
```

**Solo análisis:**
```python
from spark_mining import SparkDataAnalyzer

analyzer = SparkDataAnalyzer()
analyzer.generate_insights_report()
```

---

## 📈 PASO 5: ENTENDER LA SALIDA

Cuando ejecutes `run_spark_mining.py`, verás algo así:

```
============================================================
🔥 APACHE SPARK DATA MINING ENGINE
============================================================

1. Training distributed model...
==============================================================
🚀 SPARK DISTRIBUTED TRAINING PIPELINE
==============================================================

📥 Fetching data from API...
✅ Fetched 5000 movement records
🔧 Preparing Spark DataFrame...
✅ Prepared 234 product aggregations
🎯 Building ML Pipeline...
📚 Training model with Spark MLlib...
✅ Model trained successfully
   RMSE: 2.3456
   R²: 0.8234
💾 Saving model to pyml/models/spark_model...
✅ Model saved successfully

==============================================================
✅ TRAINING COMPLETED SUCCESSFULLY
==============================================================

2. Generating analytics insights...

============================================================
📋 COMPREHENSIVE INVENTORY INSIGHTS REPORT
============================================================

📥 Fetching inventory data...
✅ Fetched 5000 movements, 735 products
📦 Total Products: 735
📝 Total Movements: 5000
📊 Total Quantity Moved: 45678

📊 ANALYZING SALES PATTERNS...

🏆 Top 10 Best Selling Products:
+------------+---------------+------------------+-----------+
|producto_id |total_quantity |transaction_count |avg_quantity|
+------------+---------------+------------------+-----------+
|123         |450            |45                |10.0       |
|456         |380            |40                |9.5        |
...

✅ All Spark mining operations completed!
```

---

## 🔍 PASO 6: FUNCIONALIDADES PRINCIPALES

### 6.1 Entrenamiento Distribuido
```python
trainer = SparkModelTrainer()
trainer.run_training()
```
- Descarga movimientos del API
- Ingeniería de features (day_of_week, seasonality, etc)
- Entrena RandomForest distribuido
- Guarda modelo en `pyml/models/spark_model`
- Reporta RMSE y R²

### 6.2 Análisis de Patrones
```python
analyzer = SparkDataAnalyzer()
analyzer.analyze_sales_patterns()
```
- **Top 10 Productos:** Cuáles más venden
- **Tendencia Diaria:** Ventas últimos 7 días
- **Velocidad de Productos:** Fast-moving vs Slow-moving
- **Salud de Stock:** Productos con stock bajo/crítico

### 6.3 Detección de Anomalías
```python
analyzer.detect_anomalies()
```
- Identifica transacciones atípicas
- Usa desviación estándar para detectar outliers
- Útil para fraude o errores de datos

---

## 🔧 PASO 7: CONFIGURACIÓN (OPCIONAL)

En `spark_mining/spark_config.py` puedes ajustar:

```python
conf.set("spark.driver.memory", "2g")      # Memoria del driver
conf.set("spark.executor.memory", "2g")    # Memoria de ejecutores
conf.set("spark.executor.cores", "4")      # Núcleos por ejecutor
```

Úsalo si tienes:
- **Poco RAM:** Reduce a `1g`
- **Mucho RAM:** Aumenta a `4g` o `8g`
- **Muchos cores:** Aumenta a `8` o `16`

---

## 📊 PASO 8: CASOS DE USO

### Caso 1: Predicción de Demanda
```python
trainer = SparkModelTrainer()
trainer.run_training()
# Usa el modelo en predictor.py para forecasting
```

### Caso 2: Reportes Ejecutivos
```python
analyzer = SparkDataAnalyzer()
analyzer.generate_insights_report()
# Genera insights para tomar decisiones
```

### Caso 3: Monitoreo de Stock
```python
analyzer.analyze_sales_patterns()
# Identifica productos con bajo stock antes de que se agoten
```

### Caso 4: Auditoría de Datos
```python
analyzer.detect_anomalies()
# Encuentra transacciones sospechosas
```

---

## ⚠️ TROUBLESHOOTING

### Error: "Java not found"
```powershell
java -version
# Si no funciona, instala Java desde java.com
```

### Error: "spark.jar not found"
```powershell
pip install --upgrade pyspark
```

### Error: "API connection refused"
- Asegúrate que PHP está corriendo en `localhost:8000`
- Verifica que MySQL está activo

### Spark toma mucha RAM
Reduce en `spark_config.py`:
```python
conf.set("spark.driver.memory", "1g")
conf.set("spark.executor.memory", "1g")
```

---

## 📈 PASO 9: INTEGRACIÓN CON EL PROYECTO

Para usar Spark en tu aplicación:

### Frontend React (Predicción)
```javascript
// src/pages/Prediccion.jsx
const fetchPrediction = async () => {
  const response = await api.post('/prediccion/calcular', {
    producto_id: selectedProduct,
    // Backend llamará trainer.py o spark_trainer.py
  });
  setPrediction(response.data);
};
```

### Backend PHP
```php
// Puede llamar Python trainer
exec('python pyml/spark_mining/run_spark_mining.py');
```

---

## 🎓 PASO 10: PRÓXIMOS PASOS

✅ **Completado:** He creado toda la infraestructura Spark

**Próximas mejoras opcionales:**
- [ ] Integrar con Airflow para scheduling automático
- [ ] Guardar resultados en Base de datos
- [ ] Dashboard en tiempo real
- [ ] GPU acceleration (NVIDIA RAP)
- [ ] Streaming data con Kafka

---

## 🎯 RESUMEN EJECUTIVO

| Componente | Función | Ubicación |
|---|---|---|
| **spark_config.py** | Configura Spark | `pyml/spark_mining/` |
| **spark_trainer.py** | Entrena ML distribuido | `pyml/spark_mining/` |
| **spark_analyzer.py** | Analiza datos | `pyml/spark_mining/` |
| **run_spark_mining.py** | Script principal | `pyml/spark_mining/` |

---

## ✅ VERIFICACIÓN FINAL

Para asegurar que todo funciona:

```powershell
# 1. Verifica Java
java -version

# 2. Verifica PySpark instalado
python -c "import pyspark; print(pyspark.__version__)"

# 3. Inicia MySQL + PHP
# (en otra terminal)

# 4. Ejecuta mining
python pyml/spark_mining/run_spark_mining.py
```

Si ves outputs con ✅ = **¡Todo funciona!**

---

**¿Preguntas?** Revisa los logs o edita los `.py` para agregar debug.
