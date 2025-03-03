# Awesome List Manager (alm)

A web application for generating, managing, and maintaining "awesome lists" — curated repositories hosted on GitHub that follow a strict Markdown README specification.

## Features

- Import existing awesome lists via GitHub URL
- Edit and manage list content through an intuitive admin panel
- Export updated, linted, and valid README files back to GitHub
- Validate links and list format
- Auto-fetch metadata from URLs and suggest appropriate categories
- Batch process multiple URLs at once for efficient list building
- Fully containerized for easy deployment

## Architecture

- **Backend**: Python with FastAPI
- **Frontend**: Next.js with Material UI components
- **Database**: SQLite (for development) / PostgreSQL (for production)
- **Containerization**: Docker and Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git
- GitHub Access Token (for GitHub integration)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/alm.git
   cd alm
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   GITHUB_ACCESS_TOKEN=your_github_token
   ```

3. Start the application using Docker Compose:
   ```
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development

### Backend

The backend is built with FastAPI and provides REST API endpoints for managing awesome lists.

```
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

The frontend is built with Next.js and Material UI.

```
cd frontend
npm install
npm run dev
```

## Testing

The project includes functional tests for critical features. To run the tests:

### Docker Environment Tests

```bash
# Run all tests in the Docker environment
cd backend/tests
./run_docker_tests.sh
```

### Local Environment Tests

```bash
# Run all tests locally
cd backend/tests
./run_local_tests.sh
```

For more details on testing, see the [tests README](backend/tests/README.md).

## Project Structure

```
alm/
├── backend/
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Core configurations
│   │   ├── db/               # Database models and setup
│   │   ├── models/           # SQLAlchemy models
│   │   ├── utils/            # Utility functions and helpers
│   │   └── services/         # Business logic services
│   ├── alembic/              # Database migrations
│   ├── tests/                # Functional and integration tests
│   ├── Dockerfile            # Backend container setup
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js application
│   │   ├── components/       # React components
│   │   ├── services/         # API service layer
│   │   └── types/            # TypeScript type definitions
│   ├── Dockerfile            # Frontend container setup
│   └── package.json          # JavaScript dependencies
└── docker-compose.yml        # Multi-container setup
```

## Key Features Documentation

### URL Metadata & Category Suggestions

The application can automatically fetch metadata from URLs (title, description, keywords) and suggest appropriate categories based on content analysis. This streamlines the process of adding new links to your awesome list.

#### Frontend Integration

- **Auto-fill Form Fields**: When entering a URL in the project form, metadata is automatically fetched
- **Refresh Button**: Manually trigger metadata fetching if needed
- **Category Suggestions**: Automatically suggests a category with confidence indicator
- **Batch Processing**: Process multiple URLs at once via the Batch URL Processor

#### Batch URL Processor

The Batch URL Processor allows you to:
1. Enter multiple URLs (one per line)
2. Process them all at once
3. Review fetched metadata and suggested categories
4. Make any necessary adjustments
5. Add selected URLs to your awesome list

Access this feature via the "Batch Add URLs" button on any awesome list detail page.

## API Reference

### Metadata API Endpoints

#### Fetch Site Metadata

```
GET /api/v1/metadata/site/
```

Fetches metadata from a URL including title, description, and keywords.

**Parameters:**
- `url`: The URL to fetch metadata from (required)

**Swagger Example:**
```yaml
paths:
  /api/v1/metadata/site/:
    get:
      summary: Fetch metadata from a website URL
      description: Extracts title, description, and keywords from a URL
      parameters:
        - name: url
          in: query
          required: true
          schema:
            type: string
            format: uri
          description: URL to fetch metadata from
      responses:
        200:
          description: Successfully fetched metadata
          content:
            application/json:
              schema:
                type: object
                properties:
                  title:
                    type: string
                    example: "Awesome Python"
                  description:
                    type: string
                    example: "A curated list of awesome Python frameworks, libraries, software and resources"
                  keywords:
                    type: array
                    items:
                      type: string
                    example: ["python", "awesome-list", "programming", "resources"]
        422:
          description: Failed to fetch metadata
```

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/metadata/site/?url=https://github.com/vinta/awesome-python"
```

**Example Response:**
```json
{
  "title": "GitHub - vinta/awesome-python: A curated list of awesome Python frameworks, libraries, software and resources",
  "description": "A curated list of awesome Python frameworks, libraries, software and resources - GitHub - vinta/awesome-python",
  "keywords": ["python", "awesome", "list", "resources", "framework", "library"]
}
```

#### Suggest Category for URL

```
GET /api/v1/metadata/category-suggestion/
```

Suggests an appropriate category for a URL based on its content.

**Parameters:**
- `list_id`: ID of the awesome list (required)
- `url`: The URL to analyze (required)
- `description`: Optional description to aid in categorization

**Swagger Example:**
```yaml
paths:
  /api/v1/metadata/category-suggestion/:
    get:
      summary: Suggest a category for a URL
      description: Analyzes URL content and suggests the most appropriate category
      parameters:
        - name: list_id
          in: query
          required: true
          schema:
            type: integer
          description: ID of the awesome list
        - name: url
          in: query
          required: true
          schema:
            type: string
            format: uri
          description: URL to analyze for category suggestion
        - name: description
          in: query
          required: false
          schema:
            type: string
          description: Optional description to aid in categorization
      responses:
        200:
          description: Successfully suggested category
          content:
            application/json:
              schema:
                type: object
                properties:
                  category_id:
                    type: integer
                    example: 42
                  confidence:
                    type: number
                    format: float
                    example: 0.85
```

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/metadata/category-suggestion/?list_id=1&url=https://github.com/vinta/awesome-python"
```

**Example Response:**
```json
{
  "category_id": 5,
  "confidence": 0.92
}
```

#### Batch Characterize URLs

```
POST /api/v1/metadata/batch-characterize/
```

Process multiple URLs simultaneously, fetching metadata and suggesting categories for each.

**Request Body:**
- `list_id`: ID of the awesome list (required)
- `urls`: Array of URLs to process (required)

**Swagger Example:**
```yaml
paths:
  /api/v1/metadata/batch-characterize/:
    post:
      summary: Process multiple URLs in batch
      description: Fetches metadata and suggests categories for multiple URLs at once
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                list_id:
                  type: integer
                  example: 1
                urls:
                  type: array
                  items:
                    type: string
                  example: ["https://github.com/vinta/awesome-python", "https://github.com/avelino/awesome-go"]
      responses:
        200:
          description: Successfully processed URLs
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    url:
                      type: string
                      example: "https://github.com/vinta/awesome-python"
                    title:
                      type: string
                      example: "Awesome Python"
                    description:
                      type: string
                      example: "A curated list of awesome Python frameworks, libraries, software and resources"
                    category_id:
                      type: integer
                      example: 5
                    confidence:
                      type: number
                      format: float
                      example: 0.92
                    error:
                      type: string
                      example: null
```

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/metadata/batch-characterize/" \
  -H "Content-Type: application/json" \
  -d '{
    "list_id": 1,
    "urls": [
      "https://github.com/vinta/awesome-python",
      "https://github.com/avelino/awesome-go"
    ]
  }'
```

**Example Response:**
```json
[
  {
    "url": "https://github.com/vinta/awesome-python",
    "title": "GitHub - vinta/awesome-python",
    "description": "A curated list of awesome Python frameworks, libraries, software and resources",
    "category_id": 5,
    "confidence": 0.92,
    "error": null
  },
  {
    "url": "https://github.com/avelino/awesome-go",
    "title": "GitHub - avelino/awesome-go",
    "description": "A curated list of awesome Go frameworks, libraries and software",
    "category_id": 8,
    "confidence": 0.87,
    "error": null
  }
]
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
