import sqlite3
import os

def inspect_db(db_path):
    print(f"\nInspecting database: {db_path}")
    
    if not os.path.exists(db_path):
        print(f"Error: Database file does not exist")
        return
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get list of tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("No tables found in database")
            return
            
        print("\nTables found:")
        print("-------------")
        for table in tables:
            table_name = table[0]
            print(f"\nTable: {table_name}")
            
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()
            print(f"Row count: {count[0]}")
            
            # Get table schema
            cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
            schema = cursor.fetchone()
            if schema:
                print(f"Schema:\n{schema[0]}")
                
            # Show sample data if available
            try:
                cursor.execute(f"SELECT * FROM {table_name} LIMIT 1")
                sample = cursor.fetchone()
                if sample:
                    cursor.execute(f"PRAGMA table_info({table_name})")
                    columns = [col[1] for col in cursor.fetchall()]
                    print("Sample row:")
                    for col, val in zip(columns, sample):
                        print(f"  {col}: {val}")
            except sqlite3.Error as e:
                print(f"Error getting sample data: {e}")
                
    except sqlite3.Error as e:
        print(f"Error inspecting database: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

# List of databases to inspect
dbs = [
    r"c:\Users\admin\Desktop\project2\CareerCompass 2new\mining_accounts.db",
    r"c:\Users\admin\Desktop\project2\CareerCompass 2new\miners.db",
    r"c:\Users\admin\Desktop\project2\CareerCompass 2new\kloudbugs_mining_real.db",
    r"c:\Users\admin\Desktop\originalCareerCompass 2\mining.db",
    r"c:\Users\admin\Desktop\originalCareerCompass 2\miners.db"
]

# Inspect each database
for db_path in dbs:
    inspect_db(db_path)
