import uuid
import time
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.base import get_db
from app.schemas.awesome_list import (
    AwesomeList, AwesomeListCreate, AwesomeListUpdate, ImportRequest, ImportResponse
)
from app.core.awesome_parser import import_awesome_list
from app.core.awesome_export import export_awesome_list, get_awesome_list_with_data
from app.core.event_logger import emit_event

router = APIRouter()


@router.post("/import", response_model=ImportResponse)
async def import_list(
    import_req: ImportRequest,
    db: AsyncSession = Depends(get_db),
):
    """Import an awesome list from GitHub repo URL"""
    request_id = str(uuid.uuid4())

    try:
        import_result = await import_awesome_list(
            repo_url=import_req.repoUrl,
            request_id=request_id,
            db=db
        )

        return {
            "listId": import_result["list_id"],
            "title": import_result["title"],
            "itemCount": import_result["item_count"],
            "categoryCount": import_result["category_count"]
        }
    except Exception as e:
        await emit_event(
            "import:error",
            status="error",
            detail={"error": str(e)},
            request_id=request_id
        )
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/lists/{list_id}", response_model=AwesomeList)
async def get_list(
    list_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get an awesome list by ID"""
    awesome_list = await get_awesome_list_with_data(list_id, db)

    if not awesome_list:
        raise HTTPException(status_code=404, detail="Awesome list not found")

    return awesome_list


@router.get("/export/{list_id}")
async def export_list(
    list_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Export an awesome list to markdown"""
    request_id = str(uuid.uuid4())

    try:
        markdown = await export_awesome_list(list_id, request_id, db)
        return markdown
    except Exception as e:
        await emit_event(
            "export:error",
            status="error",
            detail={"error": str(e)},
            request_id=request_id
        )
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/validate/{list_id}")
async def validate_list(
    list_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Re-validate an awesome list"""
    # This would re-run the validation tools on the list
    # Implementation would be similar to import but without persisting
    # For now, we'll just return a mock response
    return {"status": "valid", "message": "List validation is not yet implemented"}
