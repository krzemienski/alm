from fastapi import APIRouter

from app.api.routes import awesome_list, categories, items

api_router = APIRouter()
api_router.include_router(awesome_list.router, tags=["awesome-lists"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
