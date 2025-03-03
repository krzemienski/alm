"""
Test for URL rate limiting in the site metadata fetching functionality.

This test script verifies that:
1. The application properly limits the rate of requests to external websites
2. The batch URL characterization endpoint can handle many URLs without overwhelming the system
3. The application gracefully handles timeouts and errors
"""

import os
import time
import unittest
import requests
import random
import string
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configuration
API_URL = os.environ.get("API_TEST_URL", "http://localhost:8000/api/v1")
TEST_LIST_ID = 1  # Replace with a valid awesome list ID

# Sample URLs - a mix of popular sites that should be stable
SAMPLE_URLS = [
    "https://github.com",
    "https://stackoverflow.com",
    "https://www.python.org",
    "https://developer.mozilla.org",
    "https://reactjs.org",
    "https://www.typescriptlang.org",
    "https://aws.amazon.com",
    "https://cloud.google.com",
    "https://www.microsoft.com",
    "https://www.apple.com",
]

# Generate a bunch of invalid URLs to test error handling
def generate_invalid_urls(count=10):
    invalid_urls = []
    for _ in range(count):
        # Generate a random domain name that's almost certainly invalid
        random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=20))
        invalid_urls.append(f"https://{random_str}.com")
    return invalid_urls

INVALID_URLS = generate_invalid_urls()


class TestUrlRateLimiting(unittest.TestCase):
    """Test URL rate limiting functionality."""

    def setUp(self):
        """Set up test environment."""
        try:
            response = requests.get(f"{API_URL}/health")
            response.raise_for_status()
        except Exception as e:
            self.fail(f"API is not available at {API_URL}: {str(e)}")

    def test_individual_url_metadata_rate_limiting(self):
        """Test rate limiting on individual URL metadata requests."""
        start_time = time.time()
        
        # Make a series of quick requests to the same URL
        results = []
        for _ in range(5):
            response = requests.get(
                f"{API_URL}/metadata/site",
                params={"url": "https://github.com"}
            )
            results.append({
                "status_code": response.status_code,
                "time": time.time() - start_time,
                "response": response.json() if response.status_code == 200 else response.text
            })
            time.sleep(0.2)  # Small delay between requests
        
        # Print the timing of responses to see if they're rate limited
        print("\nTiming of sequential requests to the same URL:")
        for i, result in enumerate(results):
            print(f"Request {i+1}: status={result['status_code']}, time={result['time']:.2f}s")
        
        # Check if the API enforces rate limiting through status codes or timing
        rate_limited = any(r["status_code"] == 429 for r in results)
        if rate_limited:
            print("Rate limiting detected through 429 status codes")
        else:
            # Check if later requests are significantly slower (possible internal rate limiting)
            first_request_time = results[0]["time"]
            later_request_times = [r["time"] for r in results[1:]]
            if any(t > first_request_time * 1.5 for t in later_request_times):
                print("Possible internal rate limiting detected (later requests slower)")
            else:
                print("No obvious rate limiting detected")

    def test_batch_with_mixed_urls(self):
        """Test batch processing with a mix of valid and invalid URLs."""
        # Create a mix of valid and invalid URLs
        mixed_urls = SAMPLE_URLS[:5] + INVALID_URLS[:5]
        random.shuffle(mixed_urls)  # Randomize order
        
        start_time = time.time()
        response = requests.post(
            f"{API_URL}/metadata/batch-characterize",
            json={"list_id": TEST_LIST_ID, "urls": mixed_urls},
        )
        
        self.assertEqual(response.status_code, 200, f"API returned {response.status_code}")
        
        data = response.json()
        self.assertEqual(len(data), 10, "Expected 10 results")
        
        # Analyze results
        successful = sum(1 for item in data if "error" not in item or not item["error"])
        errors = sum(1 for item in data if "error" in item and item["error"])
        
        print(f"\nBatch processing time: {time.time() - start_time:.2f}s")
        print(f"Successful: {successful}, Errors: {errors}")
        
        # We expect around 5 successes (valid URLs) and 5 errors (invalid URLs)
        # but there could be some variance due to network issues
        self.assertGreaterEqual(successful, 3, "Too few successful requests")
        self.assertGreaterEqual(errors, 3, "Too few error responses")

    def test_concurrent_batch_requests(self):
        """Test submitting multiple batch requests concurrently."""
        num_batches = 3
        urls_per_batch = 5
        
        # Create batches of URLs
        batches = []
        for i in range(num_batches):
            # Use a different subset of URLs for each batch
            batch = SAMPLE_URLS[i:i+urls_per_batch]
            if len(batch) < urls_per_batch:  # If we run out, wrap around
                batch.extend(SAMPLE_URLS[:urls_per_batch - len(batch)])
            batches.append(batch)
        
        # Function to process a batch
        def process_batch(batch_urls):
            start_time = time.time()
            response = requests.post(
                f"{API_URL}/metadata/batch-characterize",
                json={"list_id": TEST_LIST_ID, "urls": batch_urls},
            )
            return {
                "status_code": response.status_code,
                "time": time.time() - start_time,
                "results": response.json() if response.status_code == 200 else None
            }
        
        # Submit batches concurrently
        results = []
        with ThreadPoolExecutor(max_workers=num_batches) as executor:
            futures = [executor.submit(process_batch, batch) for batch in batches]
            for future in as_completed(futures):
                results.append(future.result())
        
        # Analyze results
        print(f"\nConcurrent batch processing results:")
        for i, result in enumerate(results):
            if result["results"]:
                successful = sum(1 for item in result["results"] if "error" not in item or not item["error"])
                errors = len(result["results"]) - successful
                print(f"Batch {i+1}: status={result['status_code']}, time={result['time']:.2f}s, "
                      f"successful={successful}, errors={errors}")
            else:
                print(f"Batch {i+1}: status={result['status_code']}, time={result['time']:.2f}s, FAILED")
        
        # Check that all batches completed
        self.assertTrue(all(r["status_code"] == 200 for r in results), 
                        "Not all batch requests completed successfully")

    def test_large_batch_performance(self):
        """Test performance with a larger batch of URLs."""
        # Create a larger batch with duplicate URLs to avoid hitting too many external sites
        large_batch = []
        for _ in range(3):  # Repeat the sample URLs 3 times
            large_batch.extend(SAMPLE_URLS)
        
        # Cap at 30 URLs total
        large_batch = large_batch[:30]
        
        start_time = time.time()
        response = requests.post(
            f"{API_URL}/metadata/batch-characterize",
            json={"list_id": TEST_LIST_ID, "urls": large_batch},
            timeout=60  # Longer timeout for larger batch
        )
        
        processing_time = time.time() - start_time
        
        print(f"\nLarge batch processing time for {len(large_batch)} URLs: {processing_time:.2f}s")
        print(f"Average time per URL: {processing_time / len(large_batch):.2f}s")
        
        # Check if response was successful
        if response.status_code == 200:
            data = response.json()
            successful = sum(1 for item in data if "error" not in item or not item["error"])
            errors = len(data) - successful
            print(f"Successful: {successful}, Errors: {errors}")
            
            # Verify we got back the expected number of results
            self.assertEqual(len(data), len(large_batch), 
                             f"Expected {len(large_batch)} results, got {len(data)}")
        else:
            print(f"Large batch request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            self.fail(f"Large batch request failed with status {response.status_code}")


if __name__ == "__main__":
    unittest.main()
