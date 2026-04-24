"""
Machine Learning Predictor for Demand Forecasting
This module loads trained models and makes predictions for product demand
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import joblib

class DemandPredictor:
    def __init__(self):
        self.model_dir = os.path.dirname(__file__)
        self.scaler = None
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load pre-trained model from disk"""
        try:
            model_path = os.path.join(self.model_dir, 'models', 'demand_model.pkl')
            scaler_path = os.path.join(self.model_dir, 'models', 'scaler.pkl')
            
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
    
    def prepare_features(self, product_data, historical_data):
        """Prepare features for prediction"""
        features = {}
        
        # Current product metrics
        features['current_stock'] = product_data.get('stock', 0)
        features['price'] = product_data.get('precio_venta', 0)
        features['cost'] = product_data.get('precio_compra', 0)
        
        # Historical metrics (last 7 days)
        if historical_data:
            df = pd.DataFrame(historical_data)
            features['avg_daily_sales'] = df['cantidad'].mean() if len(df) > 0 else 0
            features['std_daily_sales'] = df['cantidad'].std() if len(df) > 1 else 0
            features['max_daily_sales'] = df['cantidad'].max() if len(df) > 0 else 0
            features['trend'] = (df['cantidad'].iloc[-1] - df['cantidad'].iloc[0]) / max(df['cantidad'].iloc[0], 1) if len(df) > 1 else 0
        else:
            features['avg_daily_sales'] = 0
            features['std_daily_sales'] = 0
            features['max_daily_sales'] = 0
            features['trend'] = 0
        
        return features
    
    def predict_demand(self, product_data, historical_data=None):
        """
        Predict demand for a product
        
        Args:
            product_data: Dict with {id, nombre, stock, precio_venta, precio_compra}
            historical_data: List of historical movements
        
        Returns:
            Dict with prediction results
        """
        try:
            features = self.prepare_features(product_data, historical_data)
            feature_values = np.array([
                features['current_stock'],
                features['price'],
                features['cost'],
                features['avg_daily_sales'],
                features['std_daily_sales'],
                features['max_daily_sales'],
                features['trend']
            ]).reshape(1, -1)
            
            # Make prediction
            if self.model:
                predicted_demand = self.model.predict(feature_values)[0]
            else:
                # Fallback to simple heuristic
                predicted_demand = features['avg_daily_sales'] * 7 * 1.2
            
            # Calculate confidence
            confidence = 0.85 if self.model else 0.50
            
            # Determine trend
            if features['trend'] > 0.1:
                trend = "📈 ASCENDENTE"
            elif features['trend'] > -0.1:
                trend = "→ ESTABLE"
            else:
                trend = "📉 DESCENDENTE"
            
            # Determine risk level
            if features['current_stock'] < predicted_demand * 3:
                risk_level = "CRÍTICO"
                recommendation = int(predicted_demand * 7)
            elif features['current_stock'] < predicted_demand * 5:
                risk_level = "ALTO"
                recommendation = int(predicted_demand * 5)
            else:
                risk_level = "NORMAL"
                recommendation = int(predicted_demand * 3)
            
            # Generate analysis
            analysis = f"Demanda predicha: {predicted_demand:.0f} unidades/día. "
            analysis += f"Stock actual: {features['current_stock']}. "
            
            if features['current_stock'] < predicted_demand * 3:
                analysis += f"⚠️ ALERTA: Stock insuficiente para {predicted_demand * 3 / max(features['current_stock'], 1):.1f} días de demanda."
            
            return {
                "producto_id": product_data.get('id'),
                "producto_nombre": product_data.get('nombre'),
                "prediccion_demanda": float(predicted_demand),
                "recomendacion_compra": recommendation,
                "tendencia": trend,
                "nivel_riesgo": risk_level,
                "confianza": float(confidence),
                "analisis": analysis,
                "observaciones": f"Stock actual: {features['current_stock']} unidades. Venta promedio: {features['avg_daily_sales']:.1f} unidades/día.",
                "timestamp": datetime.now().isoformat(),
                "modelo_ia": "Random Forest Predictor (v1.0)"
            }
        
        except Exception as e:
            print(f"Error in prediction: {e}")
            # Return safe default
            return {
                "producto_id": product_data.get('id'),
                "producto_nombre": product_data.get('nombre'),
                "prediccion_demanda": 0,
                "recomendacion_compra": 0,
                "tendencia": "→ DATOS INSUFICIENTES",
                "nivel_riesgo": "DESCONOCIDO",
                "confianza": 0.0,
                "analisis": "No hay datos suficientes para hacer predicción",
                "observaciones": str(e),
                "timestamp": datetime.now().isoformat(),
                "modelo_ia": "Modo seguro (sin modelo)"
            }


# Singleton instance
predictor = DemandPredictor()


def predict(product_data, historical_data=None):
    """
    Main prediction function
    
    Usage:
        result = predict(
            product_data={'id': 1, 'nombre': 'Widget', 'stock': 100, ...},
            historical_data=[...]
        )
    """
    return predictor.predict_demand(product_data, historical_data)
