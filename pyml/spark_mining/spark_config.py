"""
Apache Spark Configuration Manager
Manages Spark session creation and configuration
"""

from pyspark.sql import SparkSession
from pyspark.conf import SparkConf
import os

class SparkSessionManager:
    """Manages Spark session lifecycle"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SparkSessionManager, cls).__new__(cls)
            cls._instance._initialize_spark()
        return cls._instance
    
    def _initialize_spark(self):
        """Initialize and configure Spark session"""
        try:
            # Spark configuration
            conf = SparkConf()
            conf.setAppName("InventarioMining")
            conf.set("spark.driver.memory", "2g")
            conf.set("spark.executor.memory", "2g")
            conf.set("spark.executor.cores", "4")
            conf.set("spark.sql.shuffle.partitions", "100")
            conf.set("spark.default.parallelism", "8")
            
            # Create Spark session
            self.spark = SparkSession \
                .builder \
                .config(conf=conf) \
                .getOrCreate()
            
            # Set log level
            self.spark.sparkContext.setLogLevel("WARN")
            
            print("✅ Spark session initialized successfully")
            
        except Exception as e:
            print(f"❌ Error initializing Spark: {e}")
            self.spark = None
    
    def get_spark(self):
        """Get Spark session"""
        return self.spark
    
    def stop(self):
        """Stop Spark session"""
        if self.spark:
            self.spark.stop()
            print("✅ Spark session stopped")
