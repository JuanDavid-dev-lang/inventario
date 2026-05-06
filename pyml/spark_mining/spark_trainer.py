"""
Apache Spark Model Trainer
Distributed training for demand prediction models
"""

import os
import mysql.connector
import pandas as pd
from datetime import datetime, timedelta
import joblib

from .spark_config import SparkSessionManager

class SparkModelTrainer:
    """Trains ML models using Apache Spark distributed computing"""
    
    def __init__(self, db_host="localhost", db_user="root", db_password="root", db_name="inventario_db"):
        self.db_host = db_host
        self.db_user = db_user
        self.db_password = db_password
        self.db_name = db_name
        self.spark_manager = SparkSessionManager()
        
        self.model_dir = os.path.join(
            os.path.dirname(__file__), 
            '..', 
            'models'
        )
        os.makedirs(self.model_dir, exist_ok=True)
        
        self.model = None
        self.scaler = None
        self.feature_cols = None
    
    def fetch_data_from_mysql(self):
        """Fetch historical movements from MySQL database"""
        try:
            print("📥 Fetching data from MySQL...")
            
            connection = mysql.connector.connect(
                host=self.db_host,
                user=self.db_user,
                password=self.db_password,
                database=self.db_name
            )
            
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM movimientos;")
            movements = cursor.fetchall()
            
            if movements:
                print(f"✅ Fetched {len(movements)} movement records from MySQL")
                cursor.close()
                connection.close()
                return movements
            else:
                print("❌ No data in database")
                cursor.close()
                connection.close()
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
            
            # Data preprocessing - only use available columns
            pdf['stock_antes'] = pd.to_numeric(pdf['stock_antes'], errors='coerce')
            pdf['cantidad'] = pd.to_numeric(pdf['cantidad'], errors='coerce')
            pdf['stock_despues'] = pd.to_numeric(pdf['stock_despues'], errors='coerce')
            
            # Remove rows with NaN values in critical columns
            pdf = pdf.dropna(subset=['producto_id', 'cantidad', 'stock_antes', 'stock_despues'])
            
            # Simple aggregations by product (without distributed Spark operations)
            product_stats = pdf.groupby('producto_id').agg({
                'cantidad': ['mean', 'std', 'max', 'min', 'sum'],
                'stock_antes': ['mean', 'min', 'max'],
                'stock_despues': ['mean'],
                'id': 'count'
            }).reset_index()
            
            # Flatten column names
            product_stats.columns = ['producto_id', 'avg_daily_sales', 'std_daily_sales', 
                                    'max_daily_sales', 'min_daily_sales', 'total_sales',
                                    'avg_stock', 'min_stock', 'max_stock', 'avg_stock_after',
                                    'transaction_count']
            
            # Fill NaN values
            product_stats = product_stats.fillna(0)
            
            print(f"✅ Prepared {len(product_stats)} product aggregations")
            return product_stats
            
        except Exception as e:
            print(f"❌ Error preparing data: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def build_and_train_model(self, training_data):
        """Build and train model with scikit-learn"""
        try:
            if training_data is None or training_data.empty:
                print("❌ No training data")
                return False
            
            print("🎯 Building ML Model...")
            
            from sklearn.ensemble import RandomForestRegressor
            from sklearn.preprocessing import StandardScaler
            from sklearn.model_selection import train_test_split
            from sklearn.metrics import mean_squared_error, r2_score
            
            # Feature columns
            feature_cols = [col for col in training_data.columns 
                           if col not in ['producto_id', 'total_sales']]
            
            X = training_data[feature_cols].values
            y = training_data['total_sales'].values
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Train Random Forest
            print("📚 Training Random Forest model...")
            self.model = RandomForestRegressor(
                n_estimators=50,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
            
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate
            y_pred = self.model.predict(X_test_scaled)
            rmse = (mean_squared_error(y_test, y_pred)) ** 0.5
            r2 = r2_score(y_test, y_pred)
            
            print(f"✅ Model trained successfully")
            print(f"   RMSE: {rmse:.4f}")
            print(f"   R²: {r2:.4f}")
            
            # Save scaler and feature columns for later use
            self.scaler = scaler
            self.feature_cols = feature_cols
            
            return True
            
        except Exception as e:
            print(f"❌ Error training model: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def save_model(self):
        """Save trained model to disk"""
        try:
            if self.model is None:
                print("❌ No model to save")
                return False
            
            model_path = os.path.join(self.model_dir, 'demand_model.pkl')
            
            print(f"💾 Saving model to {model_path}...")
            
            # Save model and scaler
            joblib.dump(self.model, model_path)
            joblib.dump(self.scaler, os.path.join(self.model_dir, 'scaler.pkl'))
            joblib.dump(self.feature_cols, os.path.join(self.model_dir, 'feature_cols.pkl'))
            
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
            # Step 1: Fetch data from MySQL
            movements_data = self.fetch_data_from_mysql()
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
