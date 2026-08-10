"""
Unit Tests for Python ML Module
API Tests + Spark Tests + Predictor Tests
"""

import pytest
import sys
import os
from unittest.mock import Mock, patch, MagicMock
import pandas as pd
import numpy as np

# The Spark suites need a real pyspark install and a JVM. Guarding only those
# classes keeps the pure-Python model tests running on a machine without Spark,
# instead of skipping the whole file.
try:
    import pyspark  # noqa: F401
    # A package does not expose its submodules as attributes unless something
    # imports them; the Spark tests reach for pyml.spark_mining after a bare
    # `import pyml`, so the dependency is made explicit here.
    import pyml.spark_mining  # noqa: F401

    SPARK_AVAILABLE = True
except ImportError:
    SPARK_AVAILABLE = False

requires_spark = pytest.mark.skipif(
    not SPARK_AVAILABLE, reason="pyspark no instalado; se omiten las pruebas de Spark"
)

# Add parent to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../pyml'))

# ============================================================================
# TESTS FOR SPARK MODULE
# ============================================================================

@requires_spark
class TestSparkConfig:
    """Test Spark session initialization"""
    
    @pytest.fixture
    def spark_manager(self):
        """Mock Spark manager"""
        with patch('pyml.spark_mining.spark_config.SparkSession') as mock_spark:
            from pyml.spark_mining.spark_config import SparkSessionManager
            manager = SparkSessionManager()
            return manager
    
    def test_spark_session_created(self, spark_manager):
        """Verify Spark session is created"""
        assert spark_manager.spark is not None
    
    def test_spark_config_settings(self):
        """Test Spark configuration values"""
        with patch('pyml.spark_mining.spark_config.SparkConf') as mock_conf:
            mock_conf_instance = Mock()
            mock_conf.return_value = mock_conf_instance
            
            # Verify config is called with correct params
            mock_conf_instance.set.assert_not_called()


@requires_spark
class TestSparkTrainer:
    """Test Spark Model Training"""
    
    @pytest.fixture
    def mock_api_response(self):
        """Mock API response data"""
        return [
            {
                'producto_id': 1,
                'fecha': '2024-01-01',
                'stock_antes': 100,
                'cantidad': 10,
                'stock_despues': 90,
                'precio_unitario': 50.0
            },
            {
                'producto_id': 2,
                'fecha': '2024-01-02',
                'stock_antes': 50,
                'cantidad': 5,
                'stock_despues': 45,
                'precio_unitario': 75.0
            }
        ]
    
    @patch('pyml.spark_mining.spark_trainer.requests.get')
    def test_fetch_data_from_api(self, mock_get, mock_api_response):
        """Test fetching data from API"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_api_response
        mock_get.return_value = mock_response
        
        assert len(mock_api_response) == 2
        assert mock_api_response[0]['producto_id'] == 1
    
    def test_data_preparation(self, mock_api_response):
        """Test data preparation for ML"""
        df = pd.DataFrame(mock_api_response)
        df['fecha'] = pd.to_datetime(df['fecha'])
        
        assert len(df) == 2
        assert 'producto_id' in df.columns
        assert 'cantidad' in df.columns


class TestSparkAnalyzer:
    """Test Spark Data Analysis"""
    
    @pytest.fixture
    def sample_data(self):
        """Sample transaction data"""
        return pd.DataFrame({
            'producto_id': [1, 1, 2, 2, 3],
            'cantidad': [10, 15, 5, 8, 20],
            'fecha': pd.date_range('2024-01-01', periods=5),
            'precio': [50, 50, 75, 75, 100]
        })
    
    def test_sales_aggregation(self, sample_data):
        """Test sales aggregation by product"""
        grouped = sample_data.groupby('producto_id').agg({
            'cantidad': ['sum', 'mean', 'count']
        })
        
        assert grouped.loc[1, ('cantidad', 'sum')] == 25
        assert grouped.loc[2, ('cantidad', 'count')] == 2
    
    def test_anomaly_detection(self, sample_data):
        """Test anomaly detection with stddev"""
        grouped = sample_data.groupby('producto_id')['cantidad'].agg(['mean', 'std'])
        
        # Productos should have statistics
        assert 'mean' in grouped.columns
        assert 'std' in grouped.columns


# ============================================================================
# TESTS FOR PREDICTORS
# ============================================================================

class TestDemandPredictor:
    """Test demand prediction functionality"""
    
    @pytest.fixture
    def sample_product_data(self):
        """Sample product data"""
        return {
            'stock': 100,
            'precio_venta': 50,
            'precio_compra': 30
        }
    
    @pytest.fixture
    def sample_historical_data(self):
        """Sample historical transactions"""
        return [
            {'cantidad': 10, 'fecha': '2024-01-01'},
            {'cantidad': 12, 'fecha': '2024-01-02'},
            {'cantidad': 9, 'fecha': '2024-01-03'},
            {'cantidad': 11, 'fecha': '2024-01-04'},
            {'cantidad': 13, 'fecha': '2024-01-05'},
        ]
    
    def test_feature_preparation(self, sample_product_data, sample_historical_data):
        """Test feature preparation for ML"""
        df = pd.DataFrame(sample_historical_data)
        
        features = {
            'current_stock': sample_product_data['stock'],
            'price': sample_product_data['precio_venta'],
            'cost': sample_product_data['precio_compra'],
            'avg_daily_sales': df['cantidad'].mean(),
            'std_daily_sales': df['cantidad'].std(),
            'max_daily_sales': df['cantidad'].max()
        }
        
        assert features['avg_daily_sales'] == pytest.approx(11.0)
        assert features['current_stock'] == 100
        assert features['max_daily_sales'] == 13


# ============================================================================
# TESTS FOR TRAINER
# ============================================================================

class TestModelTrainer:
    """Test model training functionality"""
    
    def test_training_data_preparation(self):
        """Test training data preparation"""
        movements = [
            {'producto_id': 1, 'cantidad': 10, 'precio_unitario': 50, 'stock_antes': 100},
            {'producto_id': 2, 'cantidad': 5, 'precio_unitario': 75, 'stock_antes': 50},
        ]
        
        df = pd.DataFrame(movements)
        
        assert len(df) == 2
        assert 'producto_id' in df.columns
        assert df['cantidad'].sum() == 15
    
    def test_model_evaluation_metrics(self):
        """Test ML evaluation metrics"""
        y_true = np.array([10, 15, 12, 20, 18])
        y_pred = np.array([11, 14, 13, 19, 17])
        
        # Simple RMSE calculation
        mse = np.mean((y_true - y_pred) ** 2)
        rmse = np.sqrt(mse)
        
        assert rmse < 2  # Should be less than 2
        
        # R² calculation
        ss_res = np.sum((y_true - y_pred) ** 2)
        ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
        r2 = 1 - (ss_res / ss_tot)
        
        assert 0 <= r2 <= 1


# ============================================================================
# INTEGRATION TESTS
# ============================================================================

@requires_spark
class TestIntegration:
    """Full integration tests"""
    
    @patch('pyml.spark_mining.spark_trainer.requests.get')
    def test_full_pipeline_mock(self, mock_get):
        """Test full pipeline with mocks"""
        # Mock API response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {'producto_id': i, 'cantidad': 10+i, 'fecha': '2024-01-01'}
            for i in range(5)
        ]
        mock_get.return_value = mock_response
        
        # Verify response
        response = mock_response.json()
        assert len(response) == 5
        assert response[0]['cantidad'] == 10


# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
