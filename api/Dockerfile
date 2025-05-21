FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    npm \
    ruby \
    ruby-dev \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g awesome-lint \
    && gem install awesome_bot

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make scripts executable
RUN chmod +x run_migrations.sh

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Run migrations and start the app
CMD ./run_migrations.sh && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
