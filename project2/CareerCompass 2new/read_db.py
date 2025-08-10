import sqlite3

conn = sqlite3.connect('miners.db')
c = conn.cursor()

# Get total rewards
c.execute("SELECT SUM(rewards) as total FROM miner_shares")
total = c.fetchone()[0]
print(f"Total rewards: {total} BTC")

# Get pool-wise distribution
c.execute("""
    SELECT pool_id, SUM(rewards) as pool_total 
    FROM miner_shares 
    GROUP BY pool_id
""")
print("\nPool distribution:")
for row in c.fetchall():
    print(f"{row[0]}: {row[1]} BTC")

conn.close()
