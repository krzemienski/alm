# Awesome List Manager (alm)

A web application for importing, editing, validating, and exporting GitHub awesome lists.

## Features

- **Import**: Fetch and parse awesome lists from GitHub repositories without requiring authentication
- **Edit**: View and edit categories, subcategories, and items in a sleek dark-themed UI
- **Validate**: Ensure compliance with awesome-lint and check links with awesome_bot
- **Export**: Generate and download spec-compliant README files that you can manually commit
- **Events**: Real-time event logging through Server-Sent Events (SSE)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui (dark theme)
- **Backend**: FastAPI, async SQLAlchemy, Pydantic
- **Database**: PostgreSQL 15
- **Events**: SSE streaming (no Redis/message broker needed)
- **Containers**: Docker and Docker Compose for development and deployment

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Installation and Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd alm
```

2. Start the application with Docker Compose:

```bash
docker-compose up -d --build
```

3. The application will be available at:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Development

### Running Tests

The project uses functional tests that exercise the entire Docker stack:

```bash
./scripts/functional-test.sh
```

### Architecture

```
Browser ──SSE /events──▶ FastAPI ──▶ Postgres
           ▲              ▲
           └───REST /api──┘
```

## License

MIT
