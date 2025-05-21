from typing import List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.models.base import get_db
from app.models.awesome_list import Item
from app.schemas.awesome_list import ItemCreate, ItemUpdate

router = APIRouter()


@router.get("/{item_id}")
async def get_item(
    item_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get an item by ID"""
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalars().first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Return a dictionary instead of the model
    return {
        "id": item.id,
        "name": item.name,
        "url": item.url,
        "description": item.description,
        "category_id": item.category_id,
        "list_id": item.list_id,
        "order": item.order
    }


@router.post("/")
async def create_item(
    item: ItemCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new item"""
    db_item = Item(
        name=item.name,
        url=item.url,
        description=item.description,
        category_id=item.category_id,
        list_id=item.list_id,
        order=item.order
    )

    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)

    # Return a dictionary instead of the model
    return {
        "id": db_item.id,
        "name": db_item.name,
        "url": db_item.url,
        "description": db_item.description,
        "category_id": db_item.category_id,
        "list_id": db_item.list_id,
        "order": db_item.order
    }


@router.put("/{item_id}")
async def update_item(
    item_id: str,
    item: ItemUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an item"""
    result = await db.execute(select(Item).where(Item.id == item_id))
    db_item = result.scalars().first()

    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Update fields
    if item.name is not None:
        db_item.name = item.name
    if item.url is not None:
        db_item.url = item.url
    if item.description is not None:
        db_item.description = item.description
    if item.order is not None:
        db_item.order = item.order

    await db.commit()
    await db.refresh(db_item)

    # Return a dictionary instead of the model
    return {
        "id": db_item.id,
        "name": db_item.name,
        "url": db_item.url,
        "description": db_item.description,
        "category_id": db_item.category_id,
        "list_id": db_item.list_id,
        "order": db_item.order
    }


@router.delete("/{item_id}")
async def delete_item(
    item_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete an item"""
    result = await db.execute(select(Item).where(Item.id == item_id))
    db_item = result.scalars().first()

    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    await db.execute(delete(Item).where(Item.id == item_id))
    await db.commit()

    return {"ok": True}
