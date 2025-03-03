from typing import List, Optional, Any
from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_categories(
    db: Session, 
    list_id: Optional[int] = None, 
    parent_id: Optional[int] = None, 
    skip: int = 0, 
    limit: int = 100
) -> List[Category]:
    """
    Retrieve categories with optional filtering by list_id and parent_id.
    """
    query = db.query(Category)
    
    if list_id is not None:
        query = query.filter(Category.list_id == list_id)
    
    if parent_id is not None:
        query = query.filter(Category.parent_category_id == parent_id)
    else:
        # If parent_id is not specified, get top-level categories
        query = query.filter(Category.parent_category_id.is_(None))
    
    return query.offset(skip).limit(limit).all()


def get_category(db: Session, category_id: int) -> Optional[Category]:
    """
    Get a specific category by ID.
    """
    return db.query(Category).filter(Category.id == category_id).first()


def create_category(db: Session, category_in: CategoryCreate) -> Category:
    """
    Create a new category.
    """
    db_category = Category(
        list_id=category_in.list_id,
        name=category_in.name,
        parent_category_id=category_in.parent_category_id,
        order=category_in.order,
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def create_category_from_import(
    db: Session, list_id: int, name: str, parent_id: Optional[int]
) -> Category:
    """
    Create a new category during import process.
    """
    db_category = Category(
        list_id=list_id,
        name=name,
        parent_category_id=parent_id,
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(
    db: Session, category: Category, category_in: CategoryUpdate
) -> Category:
    """
    Update a category.
    """
    update_data = category_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: int) -> None:
    """
    Delete a category.
    """
    db_category = db.query(Category).filter(Category.id == category_id).first()
    db.delete(db_category)
    db.commit()


def get_categories_with_subcategories(db: Session, list_id: int) -> List[dict]:
    """
    Get categories as a hierarchical tree structure.
    """
    # Get all top-level categories for the specified list
    top_categories = get_categories(db=db, list_id=list_id, parent_id=None)
    
    result = []
    for category in top_categories:
        # Convert SQLAlchemy model to dictionary
        category_dict = {
            "id": category.id,
            "list_id": category.list_id,
            "name": category.name,
            "parent_category_id": category.parent_category_id,
            "order": category.order,
            "subcategories": []
        }
        
        # Get subcategories
        subcategories = get_categories(db=db, list_id=list_id, parent_id=category.id)
        for subcategory in subcategories:
            subcategory_dict = {
                "id": subcategory.id,
                "list_id": subcategory.list_id,
                "name": subcategory.name,
                "parent_category_id": subcategory.parent_category_id,
                "order": subcategory.order,
                "subcategories": []
            }
            category_dict["subcategories"].append(subcategory_dict)
        
        result.append(category_dict)
    
    return result
