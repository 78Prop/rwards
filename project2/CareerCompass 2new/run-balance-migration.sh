#!/bin/bash

# Load environment variables
source .env

# Check if environment variables are set
if [ -z "$OLD_DATABASE_URL" ]; then
  echo "ERROR: OLD_DATABASE_URL not set"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL not set"
  exit 1
fi

if [ -z "$MINING_POOL_WALLET" ]; then
  echo "ERROR: MINING_POOL_WALLET not set"
  exit 1
fi

# Run balance migration
echo "Starting balance migration..."
tsx migrations/migrate-balances.ts

# Check exit status
if [ $? -eq 0 ]; then
  echo "Balance migration completed successfully!"
else
  echo "ERROR: Balance migration failed"
  exit 1
fi
