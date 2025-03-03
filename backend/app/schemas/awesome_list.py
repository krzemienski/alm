from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, HttpUrl


class AwesomeListBase(BaseModel):
    title: str
    description: Optional[str] = None
    repository_url: HttpUrl


class AwesomeListCreate(AwesomeListBase):
    pass


class AwesomeListUpdate(AwesomeListBase):
    title: Optional[str] = None
    repository_url: Optional[HttpUrl] = None


class AwesomeListInDBBase(AwesomeListBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class AwesomeList(AwesomeListInDBBase):
    pass


class AwesomeListImport(BaseModel):
    repository_url: HttpUrl


class AwesomeListExport(BaseModel):
    id: int
