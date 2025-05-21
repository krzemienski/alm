import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql+asyncpg://alm:alm@db:5432/alm"
    )

    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Awesome List Manager"

    class Config:
        env_file = ".env"


settings = Settings()
