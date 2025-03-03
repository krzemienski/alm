from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Category(Base):
    id = Column(Integer, primary_key=True, index=True)
    list_id = Column(Integer, ForeignKey("awesomelist.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    parent_category_id = Column(Integer, ForeignKey("category.id", ondelete="CASCADE"), nullable=True)
    order = Column(Integer, default=0)
    
    # Relationships
    awesome_list = relationship("AwesomeList", back_populates="categories")
    parent_category = relationship("Category", backref="subcategories", remote_side=[id])
    projects = relationship("Project", back_populates="category", cascade="all, delete-orphan")
