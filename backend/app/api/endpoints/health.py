from fastapi import APIRouter

router = APIRouter()

@router.get("/health", status_code=200)
def health_check():
    """Health check endpoint for monitoring and Docker healthcheck."""
    return {"status": "ok"}
