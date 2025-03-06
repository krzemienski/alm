# Awesome List Manager CRUD Functional Tests

This directory contains functional tests for the Awesome List Manager application, specifically focusing on CRUD (Create, Read, Update, Delete) operations.

## Test Overview

The tests perform the following operations:

1. **Import the List**:
   - Import the list from [https://github.com/krzemienski/awesome-video](https://github.com/krzemienski/awesome-video)

2. **Perform CRUD Operations**:
   - **Create**: Add new assets (categories and projects) to the database
   - **Read**: Retrieve and verify the list of assets
   - **Update**: Modify existing assets and check that updates are reflected correctly
   - **Delete**: Remove assets and ensure they are properly deleted

3. **Additional Link Addition & Verification**:
   - Add the new link: [https://docs.aws.amazon.com](https://docs.aws.amazon.com)
   - Verify that its categorization and any AI-related functionality (e.g., auto-tagging or classification) work correctly

4. **Export and Markdown Verification**:
   - Export the list after all CRUD operations
   - Confirm that the exported list is correctly formatted according to the markdown specifications

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

To run the tests in a Docker environment:

```bash
./run_docker_crud_tests.sh
```

This script will:
1. Start the Docker containers
2. Wait for the services to be ready
3. Run the CRUD functional tests
4. Shut down the Docker containers when done

### Manually

If you prefer to run the tests manually:

1. Start the Docker containers:
   ```bash
   docker-compose up -d
   ```

2. Wait for the services to be ready (check the health endpoint):
   ```bash
   curl http://localhost:8000/api/v1/health
   ```

3. Run the tests:
   ```bash
   python3 alm_crud_test.py
   ```

4. Shut down the Docker containers:
   ```bash
   docker-compose down
   ```

## Test Script Details

The main test script (`alm_crud_test.py`) performs the following operations:

1. Import the awesome-video repository
2. Get the awesome list details
3. Get categories
4. Create a new category for AWS Documentation
5. Update the category
6. Create a subcategory for AWS Video Services
7. Get metadata for the AWS docs URL
8. Get category suggestion for the AWS docs URL
9. Create a project for the AWS docs URL
10. Create another project for AWS Elemental MediaConvert
11. Update a project
12. Test batch URL characterization with multiple AWS service URLs
13. Create projects from batch results
14. Delete one project
15. Export the awesome list
16. Verify the markdown format
17. Clean up by deleting all created projects and categories

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

5. If tests fail, check the error messages for details on what went wrong
