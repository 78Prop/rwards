import sqlite3

def check_all_tera_miners(db_path):
    print(f"\nChecking {db_path} for all TERA miners and rewards...")
    
    try:
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        
        # Look for special hidden miner records
        print("\nChecking for hidden TERA miners...")
        queries = [
            "SELECT * FROM miners WHERE name LIKE '%TERA%' OR id LIKE '%tera%'",
            "SELECT * FROM mining_rigs WHERE name LIKE '%TERA%' OR id LIKE '%tera%'",
            "SELECT * FROM miner_shares WHERE rig_id LIKE '%tera%'",
            "SELECT * FROM miner_balances WHERE rigId LIKE '%tera%'"
        ]
        
        for query in queries:
            try:
                c.execute(query)
                results = c.fetchall()
                if results:
                    print(f"\nFound {len(results)} matches with query: {query}")
                    for row in results:
                        print(f"Row data: {row}")
            except:
                continue
                
        # Check for any large reward values
        print("\nChecking for large rewards...")
        queries = [
            "SELECT rig_id, rewards FROM miner_shares WHERE rewards > 1000",
            "SELECT rigId, confirmedBalance FROM miner_balances WHERE CAST(confirmedBalance AS FLOAT) > 1000"
        ]
        
        for query in queries:
            try:
                c.execute(query)
                results = c.fetchall()
                if results:
                    print(f"\nFound large rewards: {query}")
                    for row in results:
                        print(f"Miner: {row[0]}, Amount: {row[1]} BTC")
            except:
                continue
        
        conn.close()
    except Exception as e:
        print(f"Error reading DB: {str(e)}")

# Check all possible DBs
dbs = [
    r"c:\Users\admin\Desktop\project2\CareerCompass 2new\miners.db",
    r"c:\Users\admin\Desktop\project2\CareerCompass 2new\kloudbugs_mining_real.db",
    r"c:\Users\admin\Desktop\project2\CareerCompass 2new\mining_accounts.db",
    r"c:\Users\admin\Desktop\originalCareerCompass 2\miners.db"
]

for db in dbs:
    check_all_tera_miners(db)
