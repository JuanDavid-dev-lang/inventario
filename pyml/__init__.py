"""
Python ML Module for Inventory Prediction
Provides demand forecasting and stock level recommendations
"""

from .predictor import predict, DemandPredictor
from .trainer import ModelTrainer

__version__ = "1.0.0"
__author__ = "Inventory System"

__all__ = ['predict', 'DemandPredictor', 'ModelTrainer']
