#!/bin/sh

# Wait for database to be ready
echo "Waiting for database..."
python -c '
import time
import sys
import asyncpg

timeout = 30
start_time = time.time()

while True:
    try:
        conn = asyncpg.connect("postgresql://alm:alm@db:5432/alm")
        conn.close()
        sys.exit(0)
    except Exception as e:
        if time.time() - start_time > timeout:
            print(f"Timeout waiting for database: {e}")
            sys.exit(1)
        time.sleep(1)
'

# Run migrations
echo "Running database migrations..."
alembic upgrade head

echo "Migrations complete!"
