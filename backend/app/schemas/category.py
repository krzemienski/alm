from typing import Optional, List

from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str
    parent_category_id: Optional[int] = None
    order: Optional[int] = 0


class CategoryCreate(CategoryBase):
    list_id: int


class CategoryUpdate(CategoryBase):
    name: Optional[str] = None
    list_id: Optional[int] = None


class CategoryInDBBase(CategoryBase):
    id: int
    list_id: int

    class Config:
        orm_mode = True


class Category(CategoryInDBBase):
    pass


class CategoryWithSubcategories(Category):
    subcategories: List["CategoryWithSubcategories"] = []


# This is needed to resolve the forward reference in CategoryWithSubcategories
CategoryWithSubcategories.update_forward_refs()
