# Browser-Based CRUD Functional Tests

This document describes how to run the browser-based CRUD functional tests for the Awesome List Manager application.

## Overview

These tests validate both the frontend and backend functionality by performing CRUD operations through the browser interface. The tests:

1. **Import the List**:
   - Import the list from [https://github.com/krzemienski/awesome-video](https://github.com/krzemienski/awesome-video)

2. **Perform CRUD Operations via the Browser**:
   - **Create**: Add new categories and projects through the browser UI
   - **Read**: Retrieve and verify the list of categories and projects via the frontend
   - **Update**: Modify existing categories and projects using the browser interface
   - **Delete**: Remove projects via the browser

3. **Additional Link Addition & Verification**:
   - Add the new link: [https://docs.aws.amazon.com](https://docs.aws.amazon.com)
   - Verify that it's properly categorized and displayed

4. **Export and Markdown Verification**:
   - Export the list after all CRUD operations
   - Confirm that the exported list is correctly formatted according to markdown specifications

## Prerequisites

Before running the tests, you need to set up the following:

1. Docker and Docker Compose installed on your system
2. GitHub Access Token (for GitHub integration)
3. OpenAI API Key (for AI categorization)

## Setting Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```
GITHUB_ACCESS_TOKEN=your_github_access_token_here
OPENAI_API_KEY=your_openai_api_key_here
```

Replace the placeholder values with your actual tokens and keys.

## Running the Tests

### Using Docker

To run the browser-based tests in a Docker environment:

```bash
./run_docker_browser_tests.sh
```

This script will:
1. Start the Docker containers
2. Wait for the services to be ready
3. Run the browser-based CRUD functional tests using Playwright
4. Generate a test report
5. Shut down the Docker containers when done

### Manually

If you prefer to run the tests manually:

1. Start the Docker containers:
   ```bash
   docker-compose up -d
   ```

2. Wait for the services to be ready:
   ```bash
   curl http://localhost:8000/api/v1/health
   curl http://localhost:3001
   ```

3. Run the browser tests:
   ```bash
   cd frontend
   npx playwright test tests/browser_crud_test.js
   ```

4. Generate a test report:
   ```bash
   npx playwright show-report
   ```

5. Shut down the Docker containers:
   ```bash
   cd ..
   docker-compose down
   ```

## Test Script Details

The main test script (`browser_crud_test.js`) performs the following operations:

1. Import the awesome-video repository
2. View categories and projects (READ)
3. Create a new category for AWS Documentation (CREATE)
4. Add a new project to the AWS Documentation category (CREATE)
5. Edit the AWS Documentation category (UPDATE)
6. Edit the AWS Documentation project (UPDATE)
7. Create and then delete a temporary project (DELETE)
8. Export the awesome list and verify markdown format

## Troubleshooting

If you encounter any issues:

1. Check that the Docker containers are running:
   ```bash
   docker-compose ps
   ```

2. Check the logs for any errors:
   ```bash
   docker-compose logs
   ```

3. Ensure your environment variables are set correctly in the `.env` file

4. Verify that the API is accessible:
   ```bash
   curl http://localhost:8000/api/v1/health
   ```

5. Verify that the frontend is accessible:
   ```bash
   curl http://localhost:3001
   ```

6. If tests fail, check the Playwright report for details:
   ```bash
   cd frontend
   npx playwright show-report
   ```

7. Check the screenshots in the `frontend/test-results` directory for visual debugging
