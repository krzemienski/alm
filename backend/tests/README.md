# Awesome List Manager Tests

This directory contains functional tests for the Awesome List Manager application.

## Available Tests

1. **Batch URL Characterization Tests** (`test_batch_url_characterization.py`)
   - Tests the batch processing of multiple URLs
   - Verifies metadata extraction and category suggestion functionality
   - Tests error handling and response structure

2. **URL Rate Limiting Tests** (`test_url_rate_limiting.py`)
   - Tests rate limiting for external URL requests
   - Verifies performance with large batches of URLs
   - Tests concurrent processing of multiple batches

## Running the Tests

### In Docker Environment

To run the tests in the Docker environment (while the application is running in Docker):

```bash
./run_docker_tests.sh
```

This script will:
1. Install the necessary test dependencies in the Docker container
2. Run all the tests against the API running in the Docker container

### Locally

To run the tests locally (with the application running on localhost):

```bash
./run_local_tests.sh
```

This script will:
1. Install the necessary test dependencies locally
2. Run all the tests against the API running on localhost

## Modifying Tests

You can modify the test parameters in each test file:

- `API_URL`: The base URL of the API to test against
- `TEST_LIST_ID`: A valid awesome list ID in your test environment
- `VALID_URLS`: A list of valid URLs to test with
- `INVALID_URLS`: A list of invalid URLs to test error handling

## Adding New Tests

To add a new test:

1. Create a new Python file in the `tests` directory
2. Import the necessary modules (`unittest`, `requests`, etc.)
3. Create a test class that extends `unittest.TestCase`
4. Add test methods that use the `self.assert*` methods to verify functionality
5. Update the test run scripts to include your new test file
