from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.models.base import get_db
from app.models.awesome_list import Item
from app.schemas.awesome_list import Item as ItemSchema
from app.schemas.awesome_list import ItemCreate, ItemUpdate

router = APIRouter()


@router.get("/{item_id}", response_model=ItemSchema)
async def get_item(
    item_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get an item by ID"""
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalars().first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    return item


@router.post("/", response_model=ItemSchema)
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

    return db_item


@router.put("/{item_id}", response_model=ItemSchema)
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

    return db_item


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
