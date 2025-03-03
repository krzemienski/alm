#!/bin/bash
# Script to run tests within the Docker environment

set -e  # Exit on any error

echo "Installing test dependencies in the backend container..."
docker-compose exec backend pip install pytest requests

echo "Running batch URL characterization tests..."
docker-compose exec -e API_TEST_URL=http://localhost:8000/api/v1 backend pytest -xvs /app/tests/test_batch_url_characterization.py

echo "Running URL rate limiting tests..."
docker-compose exec -e API_TEST_URL=http://localhost:8000/api/v1 backend pytest -xvs /app/tests/test_url_rate_limiting.py

echo "Tests completed!"
