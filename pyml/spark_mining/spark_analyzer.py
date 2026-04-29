"""
Apache Spark Data Analyzer
Advanced analytics and pattern mining with Spark
"""

import requests
import pandas as pd
from pyspark.sql import functions as F
from pyspark.sql.window import Window

from .spark_config import SparkSessionManager

class SparkDataAnalyzer:
    """Analyzes inventory data using Spark for scalable insights"""
    
    def __init__(self, api_base_url="http://localhost/api"):
        self.api_base_url = api_base_url
        self.spark_manager = SparkSessionManager()
        self.spark = self.spark_manager.get_spark()
    
    def fetch_all_data(self):
        """Fetch movements and products data"""
        try:
            print("📥 Fetching inventory data...")
            
            movements_response = requests.get(
                f"{self.api_base_url}/movimientos"
            )
            products_response = requests.get(
                f"{self.api_base_url}/productos"
            )
            
            if movements_response.status_code == 200 and products_response.status_code == 200:
                movements = movements_response.json()
                products = products_response.json()
                print(f"✅ Fetched {len(movements)} movements, {len(products)} products")
                return movements, products
            
            return None, None
            
        except Exception as e:
            print(f"❌ Error fetching data: {e}")
            return None, None
    
    def analyze_sales_patterns(self):
        """Analyze sales patterns and trends"""
        print("\n📊 ANALYZING SALES PATTERNS...\n")
        
        try:
            movements, products = self.fetch_all_data()
            if not movements:
                return None
            
            # Create Spark DataFrame
            pdf = pd.DataFrame(movements)
            pdf['fecha'] = pd.to_datetime(pdf['fecha'])
            sdf = self.spark.createDataFrame(pdf)
            
            # Analysis 1: Top selling products
            print("🏆 Top 10 Best Selling Products:")
            top_products = sdf.groupBy('producto_id').agg(
                F.sum('cantidad').alias('total_quantity'),
                F.count('*').alias('transaction_count'),
                F.avg('cantidad').alias('avg_quantity')
            ).orderBy(F.desc('total_quantity')).limit(10)
            
            top_products.show()
            
            # Analysis 2: Sales trend by day
            print("\n📈 Sales Trend (Last 7 Days):")
            sdf_recent = sdf.filter(
                F.col('fecha') >= F.date_sub(F.current_date(), 7)
            )
            
            daily_trend = sdf_recent.groupBy(
                F.to_date('fecha').alias('date')
            ).agg(
                F.sum('cantidad').alias('total_sales'),
                F.count('*').alias('transaction_count')
            ).orderBy('date')
            
            daily_trend.show()
            
            # Analysis 3: Product velocity
            print("\n🚀 Product Velocity (Fast Moving vs Slow):")
            velocity = sdf.groupBy('producto_id').agg(
                F.count('*').alias('movements'),
                F.sum('cantidad').alias('total_quantity')
            )
            
            velocity_fast = velocity.filter(F.col('movements') > 10)
            velocity_slow = velocity.filter(F.col('movements') <= 5)
            
            print(f"Fast Moving Products (>10 movements): {velocity_fast.count()}")
            print(f"Slow Moving Products (≤5 movements): {velocity_slow.count()}")
            
            # Analysis 4: Stock health
            print("\n💊 Stock Health Analysis:")
            stock_health = sdf.groupBy('producto_id').agg(
                F.avg('stock_despues').alias('avg_stock'),
                F.min('stock_despues').alias('min_stock'),
                F.max('stock_despues').alias('max_stock')
            )
            
            low_stock = stock_health.filter(F.col('avg_stock') < 10)
            critical_stock = stock_health.filter(F.col('min_stock') == 0)
            
            print(f"Products with Low Stock (<10): {low_stock.count()}")
            print(f"Products with Critical Stock (0): {critical_stock.count()}")
            
            return {
                'top_products': top_products.collect(),
                'daily_trend': daily_trend.collect(),
                'stock_health': stock_health.collect()
            }
            
        except Exception as e:
            print(f"❌ Error analyzing data: {e}")
            return None
    
    def detect_anomalies(self):
        """Detect anomalies in sales data using statistical methods"""
        print("\n🚨 DETECTING ANOMALIES...\n")
        
        try:
            movements, _ = self.fetch_all_data()
            if not movements:
                return None
            
            pdf = pd.DataFrame(movements)
            pdf['fecha'] = pd.to_datetime(pdf['fecha'])
            sdf = self.spark.createDataFrame(pdf)
            
            # Calculate statistics by product
            window_spec = Window.partitionBy('producto_id')
            
            stats = sdf.withColumn(
                'avg_qty', F.avg('cantidad').over(window_spec)
            ).withColumn(
                'stddev_qty', F.stddev('cantidad').over(window_spec)
            )
            
            # Identify anomalies (>2 standard deviations)
            anomalies = stats.filter(
                (F.col('cantidad') > F.col('avg_qty') + 2 * F.col('stddev_qty')) |
                (F.col('cantidad') < F.col('avg_qty') - 2 * F.col('stddev_qty'))
            )
            
            print(f"🔍 Found {anomalies.count()} anomalous transactions:")
            anomalies.select('producto_id', 'cantidad', 'avg_qty', 'fecha').show(10)
            
            return anomalies.collect()
            
        except Exception as e:
            print(f"❌ Error detecting anomalies: {e}")
            return None
    
    def generate_insights_report(self):
        """Generate comprehensive insights report"""
        print("\n" + "="*60)
        print("📋 COMPREHENSIVE INVENTORY INSIGHTS REPORT")
        print("="*60 + "\n")
        
        try:
            movements, products = self.fetch_all_data()
            if not movements or not products:
                return False
            
            pdf = pd.DataFrame(movements)
            pdf['fecha'] = pd.to_datetime(pdf['fecha'])
            sdf = self.spark.createDataFrame(pdf)
            
            # Report metrics
            total_products = len(products)
            total_movements = sdf.count()
            total_quantity_moved = sdf.agg(F.sum('cantidad')).collect()[0][0]
            
            print(f"📦 Total Products: {total_products}")
            print(f"📝 Total Movements: {total_movements}")
            print(f"📊 Total Quantity Moved: {total_quantity_moved}")
            
            # Performance insights
            self.analyze_sales_patterns()
            self.detect_anomalies()
            
            print("\n" + "="*60)
            print("✅ REPORT GENERATION COMPLETED")
            print("="*60 + "\n")
            
            return True
            
        except Exception as e:
            print(f"❌ Error generating report: {e}")
            return False
