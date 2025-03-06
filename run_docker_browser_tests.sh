#!/bin/bash
# Script to run browser-based CRUD functional tests in Docker environment

set -e  # Exit on any error

echo "=== Starting Docker containers ==="
docker-compose up -d

# Wait for services to be fully ready
echo "Waiting for services to be fully ready..."
sleep 15

# Check if backend is healthy
echo "Checking if backend is healthy..."
HEALTH_CHECK_URL="http://localhost:8000/api/v1/health"
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s -f $HEALTH_CHECK_URL > /dev/null; then
        echo "Backend is healthy!"
        break
    else
        echo "Backend not ready yet, retrying in 5 seconds..."
        sleep 5
        RETRY_COUNT=$((RETRY_COUNT + 1))
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Error: Backend failed to become healthy after $MAX_RETRIES retries."
    echo "Shutting down Docker containers..."
    docker-compose down
    exit 1
fi

# Check if frontend is healthy
echo "Checking if frontend is healthy..."
FRONTEND_URL="http://localhost:3001"
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s -f $FRONTEND_URL > /dev/null; then
        echo "Frontend is healthy!"
        break
    else
        echo "Frontend not ready yet, retrying in 5 seconds..."
        sleep 5
        RETRY_COUNT=$((RETRY_COUNT + 1))
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Error: Frontend failed to become healthy after $MAX_RETRIES retries."
    echo "Shutting down Docker containers..."
    docker-compose down
    exit 1
fi

echo "=== Running browser-based CRUD functional tests ==="
cd frontend
npx playwright test tests/browser_crud_test.js

# Check if tests were successful
TEST_EXIT_CODE=$?
if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo "Tests failed with exit code $TEST_EXIT_CODE"
    echo "Shutting down Docker containers..."
    cd ..
    docker-compose down
    exit $TEST_EXIT_CODE
fi

cd ..
echo "=== Tests completed successfully! ==="

echo "=== Generating test report ==="
cd frontend
npx playwright show-report
cd ..

echo "=== Shutting down Docker containers ==="
docker-compose down

echo "=== All done! ==="
