from sqlalchemy import Column, String, Text, ForeignKey, Boolean, Integer
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class AwesomeList(BaseModel):
    __tablename__ = "awesome_lists"

    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    repo_url = Column(String, nullable=False)
    owner = Column(String, nullable=False)
    repo = Column(String, nullable=False)

    # Relationships
    categories = relationship("Category", back_populates="awesome_list", cascade="all, delete-orphan")


class Category(BaseModel):
    __tablename__ = "categories"

    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    parent_id = Column(String, ForeignKey("categories.id"), nullable=True)
    list_id = Column(String, ForeignKey("awesome_lists.id"), nullable=False)
    order = Column(Integer, nullable=False, default=0)

    # Relationships
    awesome_list = relationship("AwesomeList", back_populates="categories")
    items = relationship("Item", back_populates="category", cascade="all, delete-orphan")
    subcategories = relationship(
        "Category",
        backref="parent",
        remote_side="Category.id",
        cascade="all, delete-orphan",
        single_parent=True
    )


class Item(BaseModel):
    __tablename__ = "items"

    name = Column(String, nullable=False, index=True)
    url = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    list_id = Column(String, ForeignKey("awesome_lists.id"), nullable=False)
    order = Column(Integer, nullable=False, default=0)

    # Relationships
    category = relationship("Category", back_populates="items")
    awesome_list = relationship("AwesomeList")
