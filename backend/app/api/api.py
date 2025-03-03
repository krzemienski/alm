from fastapi import APIRouter

from app.api.endpoints import awesome_lists, categories, projects, health, github, metadata

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(awesome_lists.router, prefix="/awesome-lists", tags=["awesome-lists"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(github.router, prefix="/github", tags=["github"])
api_router.include_router(metadata.router, prefix="/metadata", tags=["metadata"])
