"""
Main script to run Spark Mining operations
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from .spark_trainer import SparkModelTrainer
from .spark_analyzer import SparkDataAnalyzer
from .spark_config import SparkSessionManager

def main():
    """Run Spark mining operations"""
    
    spark_manager = SparkSessionManager()
    
    try:
        print("\n" + "="*60)
        print("🔥 APACHE SPARK DATA MINING ENGINE")
        print("="*60 + "\n")
        
        # Option 1: Train model
        print("1. Training distributed model...")
        trainer = SparkModelTrainer()
        trainer.run_training()
        
        # Option 2: Analyze data
        print("\n2. Generating analytics insights...")
        analyzer = SparkDataAnalyzer()
        analyzer.generate_insights_report()
        
        print("\n✅ All Spark mining operations completed!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    finally:
        # Stop Spark session
        spark_manager.stop()

if __name__ == "__main__":
    main()
