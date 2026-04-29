"""
Apache Spark Model Trainer
Distributed training for demand prediction models
"""

import os
import requests
import pandas as pd
from datetime import datetime, timedelta
from pyspark.sql import functions as F
from pyspark.ml import Pipeline
from pyspark.ml.feature import VectorAssembler, StandardScaler
from pyspark.ml.regression import RandomForestRegressor
from pyspark.ml.evaluation import RegressionEvaluator
import joblib

from .spark_config import SparkSessionManager

class SparkModelTrainer:
    """Trains ML models using Apache Spark distributed computing"""
    
    def __init__(self, api_base_url="http://localhost/api"):
        self.api_base_url = api_base_url
        self.spark_manager = SparkSessionManager()
        self.spark = self.spark_manager.get_spark()
        
        self.model_dir = os.path.join(
            os.path.dirname(__file__), 
            '..', 
            'models'
        )
        os.makedirs(self.model_dir, exist_ok=True)
        
        self.model = None
        self.pipeline = None
    
    def fetch_data_from_api(self):
        """Fetch historical movements from API"""
        try:
            print("📥 Fetching data from API...")
            
            response = requests.get(
                f"{self.api_base_url}/movimientos",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Fetched {len(data)} movement records")
                return data
            else:
                print(f"❌ API error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error fetching data: {e}")
            return None
    
    def prepare_spark_dataframe(self, movements_data):
        """Convert raw data to Spark DataFrame with engineered features"""
        try:
            if not movements_data:
                print("❌ No data available")
                return None
            
            print("🔧 Preparing Spark DataFrame...")
            
            # Create pandas DataFrame first
            pdf = pd.DataFrame(movements_data)
            
            # Data preprocessing
            pdf['fecha'] = pd.to_datetime(pdf['fecha'])
            pdf['stock_antes'] = pd.to_numeric(pdf['stock_antes'], errors='coerce')
            pdf['cantidad'] = pd.to_numeric(pdf['cantidad'], errors='coerce')
            pdf['stock_despues'] = pd.to_numeric(pdf['stock_despues'], errors='coerce')
            pdf['precio_unitario'] = pd.to_numeric(pdf['precio_unitario'], errors='coerce')
            
            # Feature engineering
            pdf['day_of_week'] = pdf['fecha'].dt.dayofweek
            pdf['day_of_month'] = pdf['fecha'].dt.day
            pdf['month'] = pdf['fecha'].dt.month
            pdf['quarter'] = pdf['fecha'].dt.quarter
            pdf['is_weekend'] = (pdf['day_of_week'] >= 5).astype(int)
            
            # Convert to Spark DataFrame
            sdf = self.spark.createDataFrame(pdf)
            
            # Calculate aggregations by product
            sdf = sdf.groupBy('producto_id').agg(
                F.avg('cantidad').alias('avg_daily_sales'),
                F.stddev('cantidad').alias('std_daily_sales'),
                F.max('cantidad').alias('max_daily_sales'),
                F.min('cantidad').alias('min_daily_sales'),
                F.sum('cantidad').alias('total_sales'),
                F.avg('stock_antes').alias('avg_stock'),
                F.avg('precio_unitario').alias('avg_price'),
                F.count('*').alias('transaction_count')
            ).fillna(0)
            
            print(f"✅ Prepared {sdf.count()} product aggregations")
            return sdf
            
        except Exception as e:
            print(f"❌ Error preparing data: {e}")
            return None
    
    def build_and_train_model(self, training_data):
        """Build and train distributed model with Spark ML"""
        try:
            if training_data is None:
                print("❌ No training data")
                return False
            
            print("🎯 Building ML Pipeline...")
            
            # Feature columns
            feature_cols = [
                'avg_daily_sales', 'std_daily_sales', 'max_daily_sales',
                'min_daily_sales', 'total_sales', 'avg_stock', 'avg_price'
            ]
            
            # Stage 1: Vector assembler
            assembler = VectorAssembler(
                inputCols=feature_cols,
                outputCol="features"
            )
            
            # Stage 2: Scaler
            scaler = StandardScaler(
                inputCol="features",
                outputCol="scaled_features",
                withMean=True,
                withStd=True
            )
            
            # Stage 3: Random Forest Regressor (distributed)
            rf = RandomForestRegressor(
                featuresCol="scaled_features",
                labelCol="total_sales",
                numTrees=50,
                maxDepth=10,
                seed=42
            )
            
            # Build pipeline
            self.pipeline = Pipeline(stages=[assembler, scaler, rf])
            
            print("📚 Training model with Spark MLlib...")
            
            # Train model (distributed across cluster)
            self.model = self.pipeline.fit(training_data)
            
            # Evaluate
            predictions = self.model.transform(training_data)
            
            evaluator = RegressionEvaluator(
                labelCol="total_sales",
                predictionCol="prediction",
                metricName="rmse"
            )
            
            rmse = evaluator.evaluate(predictions)
            r2_evaluator = RegressionEvaluator(
                labelCol="total_sales",
                predictionCol="prediction",
                metricName="r2"
            )
            r2 = r2_evaluator.evaluate(predictions)
            
            print(f"✅ Model trained successfully")
            print(f"   RMSE: {rmse:.4f}")
            print(f"   R²: {r2:.4f}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error training model: {e}")
            return False
    
    def save_model(self):
        """Save trained model to disk"""
        try:
            if self.model is None:
                print("❌ No model to save")
                return False
            
            model_path = os.path.join(self.model_dir, 'spark_model')
            
            print(f"💾 Saving model to {model_path}...")
            
            self.model.write().overwrite().save(model_path)
            
            print("✅ Model saved successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error saving model: {e}")
            return False
    
    def run_training(self):
        """Execute complete training pipeline"""
        print("\n" + "="*60)
        print("🚀 SPARK DISTRIBUTED TRAINING PIPELINE")
        print("="*60 + "\n")
        
        try:
            # Step 1: Fetch data
            movements_data = self.fetch_data_from_api()
            if not movements_data:
                return False
            
            # Step 2: Prepare data
            training_data = self.prepare_spark_dataframe(movements_data)
            if training_data is None:
                return False
            
            # Step 3: Train model
            if not self.build_and_train_model(training_data):
                return False
            
            # Step 4: Save model
            if not self.save_model():
                return False
            
            print("\n" + "="*60)
            print("✅ TRAINING COMPLETED SUCCESSFULLY")
            print("="*60 + "\n")
            
            return True
            
        except Exception as e:
            print(f"\n❌ Training pipeline error: {e}\n")
            return False
