import sqlite3

def check_token_pool_db(db_path):
    print(f"\nChecking {db_path} for TERA TOKEN balances...")
    
    try:
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        
        # First check schema
        c.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = c.fetchall()
        print(f"Tables found: {[t[0] for t in tables]}")
        
        # Look for balances in miner_balances
        if 'miner_balances' in [t[0] for t in tables]:
            print("\nChecking miner_balances table...")
            
            try:
                c.execute("""
                    SELECT rigId, confirmedBalance, pendingBalance 
                    FROM miner_balances 
                    WHERE CAST(confirmedBalance AS FLOAT) > 0 
                    OR CAST(pendingBalance AS FLOAT) > 0
                """)
                balances = c.fetchall()
                if balances:
                    total_confirmed = sum(float(b[1] or 0) for b in balances)
                    total_pending = sum(float(b[2] or 0) for b in balances)
                    print(f"\nFound {len(balances)} miners with non-zero balances")
                    print(f"Total confirmed across all pools: {total_confirmed} BTC")
                    print(f"Total pending across all pools: {total_pending} BTC")
                    print(f"Total balance: {total_confirmed + total_pending} BTC")
                    
                    for b in balances:
                        print(f"Miner {b[0]}: Confirmed={float(b[1] or 0)} BTC, Pending={float(b[2] or 0)} BTC")
            except Exception as e:
                print(f"Error checking balances: {str(e)}")
        
        # Check mining_rewards if it exists
        if 'mining_rewards' in [t[0] for t in tables]:
            print("\nChecking mining_rewards table...")
            try:
                c.execute("""
                    SELECT minerId, SUM(CAST(amount AS FLOAT)) as total
                    FROM mining_rewards 
                    WHERE status = 'confirmed'
                    GROUP BY minerId
                    HAVING total > 0
                """)
                rewards = c.fetchall()
                if rewards:
                    total_rewards = sum(float(r[1] or 0) for r in rewards)
                    print(f"\nFound {len(rewards)} miners with rewards")
                    print(f"Total rewards: {total_rewards} BTC")
                    
                    for r in rewards:
                        print(f"Miner {r[0]}: Total rewards = {float(r[1])} BTC")
            except Exception as e:
                print(f"Error checking rewards: {str(e)}")
        
        conn.close()
    except Exception as e:
        print(f"Error reading DB: {str(e)}")

# Check all DBs
dbs = [
    r"c:\Users\admin\Desktop\project2\CareerCompass 2new\kloudbugs_mining_real.db",
    r"c:\Users\admin\Desktop\project2\CareerCompass 2new\mining_accounts.db"
]

for db in dbs:
    check_token_pool_db(db)
