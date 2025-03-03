#!/bin/bash
# Script to run tests locally (not in Docker)

set -e  # Exit on any error

# Change to the project backend directory
cd "$(dirname "$0")/.."

echo "Installing test dependencies..."
pip install pytest requests

echo "Running batch URL characterization tests..."
API_TEST_URL=http://localhost:8000/api/v1 pytest -xvs tests/test_batch_url_characterization.py

echo "Running URL rate limiting tests..."
API_TEST_URL=http://localhost:8000/api/v1 pytest -xvs tests/test_url_rate_limiting.py

echo "Tests completed!"
