import sqlite3
import os

def check_db(db_path):
    if not os.path.exists(db_path) or os.path.getsize(db_path) == 0:
        print(f"\nSkipping empty/missing DB: {db_path}")
        return
        
    try:
        print(f"\nChecking DB: {db_path}")
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        
        # First get schema
        c.execute("SELECT sql FROM sqlite_master WHERE type='table'")
        tables = c.fetchall()
        print("\nTables found:", [row[0] for row in tables])
        
        # Try different queries based on schema
        try:
            c.execute("""
                SELECT rig_id, SUM(rewards) as total_rewards, 
                       SUM(accepted_shares) as acc, 
                       SUM(rejected_shares) as rej
                FROM miner_shares 
                WHERE pool_id LIKE '%token%'
                GROUP BY rig_id
            """)
            results = c.fetchall()
            if results:
                print("\nTERA TOKEN miners found:")
                for row in results:
                    print(f"Miner: {row[0]}, Rewards: {row[1]} BTC, Shares: {row[2]} accepted, {row[3]} rejected")
        except:
            print("Could not query miner_shares")
                
        # Check balances tables with different schemas
        for balance_table in ['miner_balances', 'mining_balances', 'balances']:
            try:
                c.execute(f"SELECT * FROM {balance_table} LIMIT 1")
                print(f"\nBalances found in table: {balance_table}")
                
                # Try different balance column names
                for balance_cols in [
                    ['confirmed_balance', 'pending_balance'],
                    ['balance', 'pending'],
                    ['confirmed', 'pending']
                ]:
                    try:
                        query = f"""
                            SELECT SUM(CAST(COALESCE({balance_cols[0]}, '0') AS FLOAT)) as confirmed,
                                   SUM(CAST(COALESCE({balance_cols[1]}, '0') AS FLOAT)) as pending
                            FROM {balance_table}
                        """
                        c.execute(query)
                        balances = c.fetchone()
                        if balances[0] or balances[1]:
                            print(f"Total confirmed balance: {balances[0]} BTC")
                            print(f"Total pending balance: {balances[1]} BTC")
                            break
                    except:
                        continue
            except:
                continue
            
        conn.close()
    except Exception as e:
        print(f"Error reading DB: {str(e)}")

# Check all possible locations
dbs_to_check = [
    r"c:\Users\admin\Desktop\project2\CareerCompass 2new\miners.db",
    r"c:\Users\admin\Desktop\project2\CareerCompass 2new\kloudbugs_mining_real.db",
    r"c:\Users\admin\Desktop\project2\CareerCompass 2new\mining_accounts.db",
    r"c:\Users\admin\Desktop\originalCareerCompass 2\miners.db",
    r"c:\Users\admin\Desktop\originalCareerCompass 2\sqlite",
    r"c:\Users\admin\Desktop\originalCareerCompass 2\sqlite3",
    r"c:\Users\admin\Desktop\project\CareerCompass 2new\miners.db",
    r"f:\New folder\CareerCompass 2\miners.db"
]

for db in dbs_to_check:
    check_db(db)
