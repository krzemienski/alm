from datetime import datetime
from typing import Optional, Dict, Any

from pydantic import BaseModel, HttpUrl, Field


class ProjectBase(BaseModel):
    title: str
    url: HttpUrl
    description: Optional[str] = None
    project_metadata: Optional[Dict[str, Any]] = Field(default=None)


class ProjectCreate(ProjectBase):
    list_id: int
    category_id: int


class ProjectUpdate(ProjectBase):
    title: Optional[str] = None
    url: Optional[HttpUrl] = None
    category_id: Optional[int] = None


class ProjectInDBBase(ProjectBase):
    id: int
    list_id: int
    category_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Project(ProjectInDBBase):
    pass
