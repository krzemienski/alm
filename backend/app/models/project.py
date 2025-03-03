from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Project(Base):
    id = Column(Integer, primary_key=True, index=True)
    list_id = Column(Integer, ForeignKey("awesomelist.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("category.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    project_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    awesome_list = relationship("AwesomeList")
    category = relationship("Category", back_populates="projects")
