from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl


# Base schemas
class ItemBase(BaseModel):
    name: str
    url: str
    description: Optional[str] = None
    order: Optional[int] = 0


class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    order: Optional[int] = 0


class AwesomeListBase(BaseModel):
    title: str
    description: Optional[str] = None
    repo_url: str


# Create schemas
class ItemCreate(ItemBase):
    category_id: str
    list_id: str


class CategoryCreate(CategoryBase):
    list_id: str
    parent_id: Optional[str] = None


class AwesomeListCreate(BaseModel):
    repo_url: str


# Import schema
class ImportRequest(BaseModel):
    repoUrl: str

    class Config:
        populate_by_name = True
        alias_generator = lambda field_name: field_name  # Keep the field names as is


class ImportResponse(BaseModel):
    listId: str = Field(alias="list_id")
    title: str
    itemCount: int = Field(alias="item_count")
    categoryCount: int = Field(alias="category_count")

    class Config:
        populate_by_name = True


# Update schemas
class ItemUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[str] = None
    order: Optional[int] = None


class AwesomeListUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


# Read schemas
class Item(ItemBase):
    id: str
    category_id: str
    list_id: str

    class Config:
        from_attributes = True


class SubCategory(CategoryBase):
    id: str
    items: List[Item] = []

    class Config:
        from_attributes = True


class Category(CategoryBase):
    id: str
    parent_id: Optional[str] = None
    list_id: str
    items: List[Item] = []
    subcategories: List[SubCategory] = []

    class Config:
        from_attributes = True


class AwesomeList(AwesomeListBase):
    id: str
    owner: str
    repo: str
    categories: List[Category] = []

    class Config:
        from_attributes = True
