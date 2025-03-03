# Awesome List Manager (alm)

A web application for generating, managing, and maintaining "awesome lists" — curated repositories hosted on GitHub that follow a strict Markdown README specification.

## Features

- Import existing awesome lists via GitHub URL
- Edit and manage list content through an intuitive admin panel
- Export updated, linted, and valid README files back to GitHub
- Validate links and list format
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

## Project Structure

```
alm/
├── backend/
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Core configurations
│   │   ├── db/               # Database models and setup
│   │   ├── models/           # SQLAlchemy models
│   │   └── services/         # Business logic services
│   ├── alembic/              # Database migrations
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

## License

This project is licensed under the MIT License - see the LICENSE file for details.
