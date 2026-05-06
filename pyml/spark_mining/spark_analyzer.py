"""
Apache Spark Data Analyzer
Advanced analytics and pattern mining with Spark
"""

import mysql.connector
import pandas as pd

from .spark_config import SparkSessionManager

class SparkDataAnalyzer:
    """Analyzes inventory data using Spark for scalable insights"""
    
    def __init__(self, db_host="localhost", db_user="root", db_password="root", db_name="inventario_db"):
        self.db_host = db_host
        self.db_user = db_user
        self.db_password = db_password
        self.db_name = db_name
        self.spark_manager = SparkSessionManager()
    
    def fetch_all_data(self):
        """Fetch movements and products data from MySQL"""
        try:
            print("📥 Fetching inventory data from MySQL...")
            
            connection = mysql.connector.connect(
                host=self.db_host,
                user=self.db_user,
                password=self.db_password,
                database=self.db_name
            )
            
            cursor = connection.cursor(dictionary=True)
            
            # Fetch movements
            cursor.execute("SELECT * FROM movimientos;")
            movements = cursor.fetchall()
            
            # Fetch products
            cursor.execute("SELECT * FROM productos;")
            products = cursor.fetchall()
            
            if movements and products:
                print(f"✅ Fetched {len(movements)} movements, {len(products)} products from MySQL")
                cursor.close()
                connection.close()
                return movements, products
            else:
                print(f"⚠ Fetched {len(movements) if movements else 0} movements, {len(products) if products else 0} products")
                cursor.close()
                connection.close()
                return movements, products
            
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
            
            # Create DataFrame
            pdf = pd.DataFrame(movements)
            pdf['fecha'] = pd.to_datetime(pdf['fecha'])
            
            # Analysis 1: Top selling products
            print("🏆 Top 10 Best Selling Products:")
            top_products = pdf.groupby('producto_id').agg({
                'cantidad': ['sum', 'count', 'mean']
            }).reset_index()
            top_products.columns = ['producto_id', 'total_quantity', 'transaction_count', 'avg_quantity']
            top_products = top_products.nlargest(10, 'total_quantity')
            
            for idx, row in top_products.iterrows():
                print(f"   {int(row['producto_id'])}: {int(row['total_quantity'])} units "
                      f"({int(row['transaction_count'])} transactions)")
            
            # Analysis 2: Product velocity
            print("\n🚀 Product Velocity (Fast Moving vs Slow):")
            velocity = pdf.groupby('producto_id').agg({
                'id': 'count',
                'cantidad': 'sum'
            }).reset_index()
            velocity.columns = ['producto_id', 'movements', 'total_quantity']
            
            fast_moving = (velocity['movements'] > 10).sum()
            slow_moving = (velocity['movements'] <= 5).sum()
            
            print(f"   Fast Moving Products (>10 movements): {fast_moving}")
            print(f"   Slow Moving Products (≤5 movements): {slow_moving}")
            
            # Analysis 3: Stock health
            print("\n💊 Stock Health Analysis:")
            stock_health = pdf.groupby('producto_id').agg({
                'stock_despues': ['mean', 'min', 'max']
            }).reset_index()
            stock_health.columns = ['producto_id', 'avg_stock', 'min_stock', 'max_stock']
            
            low_stock = (stock_health['avg_stock'] < 10).sum()
            critical_stock = (stock_health['min_stock'] == 0).sum()
            
            print(f"   Products with Low Stock (<10): {low_stock}")
            print(f"   Products with Critical Stock (0): {critical_stock}")
            
            return {
                'top_products': top_products,
                'velocity': velocity,
                'stock_health': stock_health
            }
            
        except Exception as e:
            print(f"❌ Error analyzing data: {e}")
            import traceback
            traceback.print_exc()
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
            
            # Calculate statistics by product
            anomalies = []
            
            for producto_id in pdf['producto_id'].unique():
                product_data = pdf[pdf['producto_id'] == producto_id]
                
                avg_qty = product_data['cantidad'].mean()
                stddev_qty = product_data['cantidad'].std()
                
                if pd.isna(stddev_qty) or stddev_qty == 0:
                    stddev_qty = 1
                
                # Find anomalies (>2 standard deviations)
                anomaly_mask = (
                    (product_data['cantidad'] > avg_qty + 2 * stddev_qty) |
                    (product_data['cantidad'] < avg_qty - 2 * stddev_qty)
                )
                
                anomaly_rows = product_data[anomaly_mask].copy()
                anomaly_rows['avg_qty'] = avg_qty
                anomaly_rows['stddev_qty'] = stddev_qty
                anomalies.append(anomaly_rows)
            
            if anomalies:
                anomaly_df = pd.concat(anomalies, ignore_index=True)
                print(f"🔍 Found {len(anomaly_df)} anomalous transactions:")
                print(anomaly_df[['producto_id', 'cantidad', 'fecha', 'tipo']].head(10).to_string())
            else:
                print("✅ No anomalies detected")
            
            return anomalies
            
        except Exception as e:
            print(f"❌ Error detecting anomalies: {e}")
            import traceback
            traceback.print_exc()
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
            
            # Report metrics
            total_products = len(products)
            total_movements = len(pdf)
            total_quantity_moved = pdf['cantidad'].sum()
            
            print(f"📦 Total Products: {total_products}")
            print(f"📝 Total Movements: {total_movements}")
            print(f"📊 Total Quantity Moved: {int(total_quantity_moved)}")
            
            # Performance insights
            self.analyze_sales_patterns()
            self.detect_anomalies()
            
            print("\n" + "="*60)
            print("✅ REPORT GENERATION COMPLETED")
            print("="*60 + "\n")
            
            return True
            
        except Exception as e:
            print(f"❌ Error generating report: {e}")
            import traceback
            traceback.print_exc()
            return False
