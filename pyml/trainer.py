"""
Model Training Script
Trains ML models on historical inventory data
Run this periodically to update predictions
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import requests

class ModelTrainer:
    def __init__(self, api_base_url="http://localhost/api"):
        self.api_base_url = api_base_url
        self.model_dir = os.path.join(os.path.dirname(__file__), 'models')
        os.makedirs(self.model_dir, exist_ok=True)
        self.scaler = StandardScaler()
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
    
    def fetch_data_from_api(self):
        """Fetch historical data from PHP API"""
        try:
            # Get all movements
            response = requests.get(f"{self.api_base_url}/movimientos")
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None
    
    def prepare_training_data(self, movements_data):
        """
        Prepare training data from raw movements
        
        Features: stock_before, cantidad, stock_after, price, cost, day_of_week, is_weekend
        Target: next_day_quantity
        """
        if not movements_data:
            return None, None
        
        df = pd.DataFrame(movements_data)
        
        # Convert dates
        if 'fecha' in df.columns:
            df['fecha'] = pd.to_datetime(df['fecha'])
            df['day_of_week'] = df['fecha'].dt.dayofweek
            df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        else:
            df['day_of_week'] = 0
            df['is_weekend'] = 0
        
        # Get features (all columns except target)
        feature_columns = ['stock_before', 'cantidad', 'stock_after', 'day_of_week', 'is_weekend']
        available_features = [col for col in feature_columns if col in df.columns]
        
        if len(available_features) < 2:
            print("Not enough features in data")
            return None, None
        
        X = df[available_features].fillna(0).astype(float)
        
        # Target: next quantity (shift previous rows)
        y = df['cantidad'].shift(-1).fillna(df['cantidad'].mean()).astype(float)
        
        return X, y
    
    def train_model(self, X, y):
        """Train the Random Forest model"""
        try:
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate
            y_pred = self.model.predict(X_test_scaled)
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            print(f"Model trained successfully!")
            print(f"MSE: {mse:.4f}")
            print(f"R² Score: {r2:.4f}")
            
            return True
        
        except Exception as e:
            print(f"Error training model: {e}")
            return False
    
    def save_model(self):
        """Save trained model to disk"""
        try:
            model_path = os.path.join(self.model_dir, 'demand_model.pkl')
            scaler_path = os.path.join(self.model_dir, 'scaler.pkl')
            
            joblib.dump(self.model, model_path)
            joblib.dump(self.scaler, scaler_path)
            
            # Save metadata
            metadata = {
                "trained_at": datetime.now().isoformat(),
                "model_type": "RandomForestRegressor",
                "n_estimators": 100,
                "features": ["stock_before", "cantidad", "stock_after", "day_of_week", "is_weekend"]
            }
            
            with open(os.path.join(self.model_dir, 'metadata.json'), 'w') as f:
                json.dump(metadata, f, indent=2)
            
            print(f"Model saved to {self.model_dir}")
            return True
        
        except Exception as e:
            print(f"Error saving model: {e}")
            return False
    
    def train_from_synthetic_data(self):
        """
        Train using synthetic data (for demo purposes)
        This generates realistic training data based on typical inventory patterns
        """
        print("Generating synthetic training data...")
        
        # Create synthetic data: 365 days of inventory movements
        n_samples = 365
        data = {
            'stock_before': np.random.randint(50, 500, n_samples),
            'cantidad': np.random.randint(1, 50, n_samples),
            'stock_after': np.random.randint(50, 500, n_samples),
            'day_of_week': np.random.randint(0, 7, n_samples),
            'is_weekend': np.random.randint(0, 2, n_samples)
        }
        
        X = pd.DataFrame(data)
        # Target: next day's quantity (with some correlation to current)
        y = (X['cantidad'] * 0.7 + np.random.normal(10, 5, n_samples)).clip(1, 100)
        
        # Scale
        X_scaled = self.scaler.fit_transform(X)
        
        # Train
        self.model.fit(X_scaled, y)
        
        # Evaluate on same data
        y_pred = self.model.predict(X_scaled)
        mse = mean_squared_error(y, y_pred)
        r2 = r2_score(y, y_pred)
        
        print(f"Synthetic model trained!")
        print(f"MSE: {mse:.4f}")
        print(f"R² Score: {r2:.4f}")
        
        return True


def main():
    """Main training function"""
    print("=" * 50)
    print("INVENTORY ML MODEL TRAINER")
    print("=" * 50)
    
    trainer = ModelTrainer()
    
    # Option 1: Train from real API data
    print("\nFetching data from API...")
    movements = trainer.fetch_data_from_api()
    
    if movements:
        print(f"Got {len(movements)} movements")
        X, y = trainer.prepare_training_data(movements)
        if X is not None and len(X) > 10:
            print("Training model with real data...")
            trainer.train_model(X, y)
            trainer.save_model()
            print("✅ Model training complete!")
    else:
        # Option 2: Train from synthetic data (for demo)
        print("\nUsing synthetic data for training...")
        trainer.train_from_synthetic_data()
        trainer.save_model()
        print("✅ Model training complete (synthetic data)!")


if __name__ == "__main__":
    main()
