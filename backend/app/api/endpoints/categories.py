from typing import List, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.category import Category
from app.schemas.category import (
    Category as CategorySchema,
    CategoryCreate,
    CategoryUpdate,
    CategoryWithSubcategories,
)
from app.services.category_service import (
    get_categories,
    get_category,
    create_category,
    update_category,
    delete_category,
    get_categories_with_subcategories,
)

router = APIRouter()


@router.get("/", response_model=List[CategorySchema])
def read_categories(
    list_id: int = None, 
    parent_id: int = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve categories with optional filtering by list_id and parent_id.
    """
    return get_categories(
        db=db, list_id=list_id, parent_id=parent_id, skip=skip, limit=limit
    )


@router.get("/tree", response_model=List[CategoryWithSubcategories])
def read_categories_tree(
    list_id: int, db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve categories as a hierarchical tree structure for a specific awesome list.
    """
    return get_categories_with_subcategories(db=db, list_id=list_id)


@router.post("/", response_model=CategorySchema, status_code=status.HTTP_201_CREATED)
def create_new_category(
    category_in: CategoryCreate, db: Session = Depends(get_db)
) -> Any:
    """
    Create a new category.
    """
    return create_category(db=db, category_in=category_in)


@router.get("/{category_id}", response_model=CategorySchema)
def read_category(category_id: int, db: Session = Depends(get_db)) -> Any:
    """
    Get a specific category by ID.
    """
    category = get_category(db=db, category_id=category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found",
        )
    return category


@router.put("/{category_id}", response_model=CategorySchema)
def update_existing_category(
    category_id: int, category_in: CategoryUpdate, db: Session = Depends(get_db)
) -> Any:
    """
    Update an existing category.
    """
    category = get_category(db=db, category_id=category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found",
        )
    return update_category(db=db, category=category, category_in=category_in)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_category(category_id: int, db: Session = Depends(get_db)) -> None:
    """
    Delete a category.
    """
    category = get_category(db=db, category_id=category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found",
        )
    delete_category(db=db, category_id=category_id)
