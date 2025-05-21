from typing import List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.models.base import get_db
from app.models.awesome_list import Category
from app.schemas.awesome_list import CategoryCreate, CategoryUpdate

router = APIRouter()


@router.get("/{category_id}")
async def get_category(
    category_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a category by ID"""
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalars().first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Create a clean dict response
    return {
        "id": category.id,
        "name": category.name,
        "description": category.description,
        "list_id": category.list_id,
        "parent_id": category.parent_id,
        "order": category.order,
        "items": [],
        "subcategories": []
    }


@router.post("/")
async def create_category(
    category: CategoryCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new category"""
    db_category = Category(
        name=category.name,
        description=category.description,
        list_id=category.list_id,
        parent_id=category.parent_id,
        order=category.order
    )

    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)

    # Create a clean dict response
    return {
        "id": db_category.id,
        "name": db_category.name,
        "description": db_category.description,
        "list_id": db_category.list_id,
        "parent_id": db_category.parent_id,
        "order": db_category.order,
        "items": [],
        "subcategories": []
    }


@router.put("/{category_id}")
async def update_category(
    category_id: str,
    category: CategoryUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a category"""
    result = await db.execute(select(Category).where(Category.id == category_id))
    db_category = result.scalars().first()

    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Update fields
    if category.name is not None:
        db_category.name = category.name
    if category.description is not None:
        db_category.description = category.description
    if category.parent_id is not None:
        db_category.parent_id = category.parent_id
    if category.order is not None:
        db_category.order = category.order

    await db.commit()
    await db.refresh(db_category)

    # Create a clean dict response
    return {
        "id": db_category.id,
        "name": db_category.name,
        "description": db_category.description,
        "list_id": db_category.list_id,
        "parent_id": db_category.parent_id,
        "order": db_category.order,
        "items": [],
        "subcategories": []
    }


@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a category"""
    result = await db.execute(select(Category).where(Category.id == category_id))
    db_category = result.scalars().first()

    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    await db.execute(delete(Category).where(Category.id == category_id))
    await db.commit()

    return {"ok": True}
