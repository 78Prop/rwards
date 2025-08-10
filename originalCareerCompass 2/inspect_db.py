import sqlite3
import sys
import os

def inspect_db(db_path):
    print(f"Inspecting database: {db_path}")
    print(f"File exists: {os.path.exists(db_path)}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get list of tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("\nTables found:")
    print("-------------")
    for table in tables:
        table_name = table[0]
        print(f"\nTable: {table_name}")
        
        # Get table schema
        cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
        schema = cursor.fetchone()
        print("Schema:", schema[0] if schema else "Not found")
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()
        print(f"Row count: {count[0]}")
        
        # Show sample data
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 1")
        sample = cursor.fetchone()
        if sample:
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = [col[1] for col in cursor.fetchall()]
            print("Sample row:")
            for col, val in zip(columns, sample):
                print(f"  {col}: {val}")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    db_path = os.path.join(os.path.dirname(__file__), "..", "miners.db")
    inspect_db(db_path)
