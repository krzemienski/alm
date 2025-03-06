from fastapi import APIRouter, HTTPException, status, Query, Body, Depends
from pydantic import HttpUrl, BaseModel
from typing import Dict, Any, Optional, List
import asyncio
import httpx
from sqlalchemy.orm import Session

from app.utils.site_metadata import fetch_site_metadata, suggest_category
from app.db.session import get_db
from app.services.ai_categorization_service import AICategorization

router = APIRouter()


@router.get("/site/")
async def get_site_metadata(
    url: HttpUrl = Query(..., description="URL to fetch metadata from"),
) -> Dict[str, Any]:
    """
    Fetch metadata from a website including title, description, and keywords.
    This endpoint can be used when adding new links to prefill form fields.
    """
    try:
        metadata = await fetch_site_metadata(str(url))
        if metadata.get("error"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to fetch metadata: {metadata['error']}"
            )
        return metadata
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch metadata: {str(e)}"
        )


@router.get("/category-suggestion/")
async def suggest_category_for_url(
    list_id: int,
    url: HttpUrl = Query(..., description="URL to analyze for category suggestion"),
    description: Optional[str] = None,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Suggests a category for a URL based on its content and optional description.
    Returns the category ID and a confidence score.
    """
    try:
        # First fetch site metadata if description is not provided
        if not description:
            metadata = await fetch_site_metadata(str(url))
            description = metadata.get("description")

        # Suggest a category
        category_id, confidence = suggest_category(
            db=db,
            list_id=list_id,
            url=str(url),
            description=description
        )

        return {
            "category_id": category_id,
            "confidence": confidence,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to suggest category: {str(e)}"
        )


class BatchUrlRequest(BaseModel):
    list_id: int
    urls: List[str]


class UrlAnalysisResult(BaseModel):
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    confidence: Optional[float] = None
    error: Optional[str] = None


@router.post("/batch-characterize/", response_model=List[UrlAnalysisResult])
async def batch_characterize_urls(
    request: BatchUrlRequest = Body(...),
    db: Session = Depends(get_db),
) -> List[UrlAnalysisResult]:
    """
    Process multiple URLs simultaneously, fetching metadata and suggesting categories.
    This endpoint is useful for batch characterization of multiple links at once.
    """
    results = []

    # Use an async function
    async def process_url(url: str) -> UrlAnalysisResult:
        try:
            # Validate URL format
            try:
                # Basic URL validation
                if not url.startswith(('http://', 'https://')):
                    return UrlAnalysisResult(
                        url=url,
                        error="Invalid URL format. URL must start with http:// or https://"
                    )

                # Fetch metadata
                metadata = await fetch_site_metadata(url)

                if metadata.get("error"):
                    return UrlAnalysisResult(
                        url=url,
                        error=f"Failed to fetch metadata: {metadata['error']}"
                    )

                # Get category suggestion
                category_id, confidence = suggest_category(
                    db=db,
                    list_id=request.list_id,
                    url=url,
                    description=metadata.get("description")
                )

                return UrlAnalysisResult(
                    url=url,
                    title=metadata.get("title"),
                    description=metadata.get("description"),
                    category_id=category_id,
                    confidence=confidence
                )

            except Exception as e:
                return UrlAnalysisResult(
                    url=url,
                    error=f"Failed to process URL: {str(e)}"
                )
        except Exception as e:
            return UrlAnalysisResult(
                url=url,
                error=f"Unexpected error: {str(e)}"
            )

    # Process URLs in batches (but not all at once to avoid overwhelming the system)
    batch_size = 5  # Process 5 URLs at a time
    for i in range(0, len(request.urls), batch_size):
        batch = request.urls[i:i+batch_size]
        # Process URLs concurrently
        batch_results = await asyncio.gather(*[process_url(url) for url in batch])
        results.extend(batch_results)

    return results


class AIBatchUrlRequest(BaseModel):
    """Request for batch AI categorization of URLs."""
    urls: List[str]
    use_ollama: bool = False

class SingleUrlAIRequest(BaseModel):
    """Request for AI categorization of a single URL."""
    url: str
    use_ollama: bool = False

@router.post("/ai-categorize", response_model=Dict[str, Any])
async def ai_categorize_url(
    list_id: int,
    request: SingleUrlAIRequest = Body(...),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    AI-powered categorization for a single URL.
    Uses either OpenAI or Ollama to suggest categories and generate a summary.

    Args:
        list_id: ID of the awesome list
        request: Request with URL and AI backend preference

    Returns:
        Dictionary with metadata, suggested category, and summary
    """
    try:
        categorization_service = AICategorization(db)
        result = await categorization_service.process_url(
            request.url,
            list_id,
            request.use_ollama
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing URL: {str(e)}")

@router.post("/ai-batch-categorize", response_model=List[Dict[str, Any]])
async def ai_batch_categorize_urls(
    list_id: int,
    request: AIBatchUrlRequest = Body(...),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    AI-powered batch categorization for multiple URLs.
    Uses either OpenAI or Ollama to suggest categories and generate summaries.

    Args:
        list_id: ID of the awesome list
        request: Request with URLs and AI backend preference

    Returns:
        List of dictionaries with metadata, suggested categories, and summaries
    """
    try:
        categorization_service = AICategorization(db)
        results = await categorization_service.process_batch_urls(
            request.urls,
            list_id,
            request.use_ollama
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing batch URLs: {str(e)}")
