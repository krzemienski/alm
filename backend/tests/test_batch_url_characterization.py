"""
Functional test for the batch URL characterization endpoint.

This test script verifies that the batch URL characterization endpoint:
1. Can process multiple URLs concurrently
2. Returns proper metadata and category suggestions for each URL
3. Handles errors gracefully for invalid or unreachable URLs
4. Respects any defined rate limits or timeouts

Run this test using pytest:
    pytest -xvs tests/test_batch_url_characterization.py
"""

import os
import time
import unittest
import requests
import concurrent.futures
from typing import List, Dict, Any

# Configuration - modify these variables as needed
API_URL = os.environ.get("API_TEST_URL", "http://localhost:8000/api/v1")
TEST_LIST_ID = 1  # Replace with a valid awesome list ID in your test environment

# Test data - URLs to process
VALID_URLS = [
    "https://github.com/sindresorhus/awesome",
    "https://github.com/vinta/awesome-python",
    "https://github.com/avelino/awesome-go",
    "https://github.com/microsoft/vscode",
    "https://github.com/facebook/react",
]

INVALID_URLS = [
    "https://nonexistent-domain-12345.com",
    "invalid-url",
    "ftp://example.com",
]

# Maximum batch size to test
MAX_BATCH_SIZE = 20


class TestBatchUrlCharacterization(unittest.TestCase):
    """Test the batch URL characterization endpoint."""

    def setUp(self):
        """Set up test environment."""
        # Check if the API is available
        try:
            response = requests.get(f"{API_URL}/health")
            response.raise_for_status()
        except Exception as e:
            self.fail(f"API is not available at {API_URL}: {str(e)}")

    def test_batch_url_characterization_basic(self):
        """Test basic functionality of the batch URL characterization endpoint."""
        # Send a small batch of valid URLs
        response = requests.post(
            f"{API_URL}/metadata/batch-characterize",
            json={"list_id": TEST_LIST_ID, "urls": VALID_URLS[:3]},
        )
        
        self.assertEqual(response.status_code, 200, f"API returned {response.status_code}")
        
        data = response.json()
        self.assertEqual(len(data), 3, "Expected 3 results")
        
        # Verify each result has the expected structure
        for result in data:
            self.assertIn("url", result)
            self.assertIn("title", result)
            self.assertIn("description", result)
            # Category ID might be None if no match found, but the field should exist
            self.assertIn("category_id", result)
            
            # Verify URL is one of the ones we sent
            self.assertIn(result["url"], VALID_URLS[:3])
            
            # Verify there's no error
            self.assertNotIn("error", result)

    def test_batch_url_characterization_with_errors(self):
        """Test batch processing with a mix of valid and invalid URLs."""
        # Mix valid and invalid URLs
        mixed_urls = VALID_URLS[:2] + INVALID_URLS[:2]
        
        response = requests.post(
            f"{API_URL}/metadata/batch-characterize",
            json={"list_id": TEST_LIST_ID, "urls": mixed_urls},
        )
        
        self.assertEqual(response.status_code, 200, f"API returned {response.status_code}")
        
        data = response.json()
        self.assertEqual(len(data), 4, "Expected 4 results")
        
        # Count valid and error results
        error_count = sum(1 for result in data if "error" in result and result["error"])
        valid_count = sum(1 for result in data if not ("error" in result and result["error"]))
        
        self.assertEqual(valid_count, 2, "Expected 2 valid results")
        self.assertEqual(error_count, 2, "Expected 2 error results")

    def test_batch_size_limits(self):
        """Test that the API can handle batches up to the maximum allowed size."""
        # Create a large batch of URLs by repeating the valid ones
        large_batch = []
        while len(large_batch) < MAX_BATCH_SIZE:
            large_batch.extend(VALID_URLS)
        large_batch = large_batch[:MAX_BATCH_SIZE]
        
        response = requests.post(
            f"{API_URL}/metadata/batch-characterize",
            json={"list_id": TEST_LIST_ID, "urls": large_batch},
        )
        
        # The test passes if the request completes without a timeout or 500 error
        self.assertIn(
            response.status_code, 
            [200, 422, 400], 
            f"API returned unexpected status {response.status_code}"
        )
        
        if response.status_code == 200:
            data = response.json()
            self.assertEqual(len(data), MAX_BATCH_SIZE, f"Expected {MAX_BATCH_SIZE} results")
        elif response.status_code in [422, 400]:
            # If there's a limit on batch size, this might return a validation error
            print(f"API rejected batch size of {MAX_BATCH_SIZE}: {response.json()}")
            # This is also acceptable, as long as the API doesn't crash

    def test_concurrent_requests(self):
        """Test that the API can handle multiple concurrent batch requests."""
        num_concurrent_requests = 5
        
        def make_request(batch_index):
            # Each request gets its own subset of URLs
            urls = VALID_URLS[batch_index:batch_index+3]
            if not urls:
                urls = VALID_URLS[:3]  # Fallback if we run out of URLs
                
            response = requests.post(
                f"{API_URL}/metadata/batch-characterize",
                json={"list_id": TEST_LIST_ID, "urls": urls},
            )
            return response.status_code, response.json() if response.status_code == 200 else None
        
        # Make concurrent requests
        results = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_concurrent_requests) as executor:
            futures = [executor.submit(make_request, i) for i in range(num_concurrent_requests)]
            for future in concurrent.futures.as_completed(futures):
                results.append(future.result())
        
        # Verify all requests succeeded
        for status_code, data in results:
            self.assertEqual(status_code, 200, f"API returned {status_code}")
            if data:
                self.assertTrue(len(data) > 0, "Expected at least one result")

    def test_rate_limiting(self):
        """Test that the API implements proper rate limiting by making rapid requests."""
        # Make 10 rapid requests to see if any get rate limited
        responses = []
        for _ in range(10):
            response = requests.post(
                f"{API_URL}/metadata/batch-characterize",
                json={"list_id": TEST_LIST_ID, "urls": VALID_URLS[:1]},
            )
            responses.append((response.status_code, response.text))
            time.sleep(0.1)  # Small delay between requests
        
        # Count how many requests were rate limited (if any)
        rate_limited = sum(1 for code, _ in responses if code == 429)
        
        print(f"Made 10 rapid requests: {rate_limited} were rate limited")
        
        # We can't assert specific behavior here since rate limiting might or might not be enabled
        # This test is primarily informational


if __name__ == "__main__":
    unittest.main()
