from typing import Dict, Optional, Any
from pydantic import BaseModel
from datetime import datetime


class Event(BaseModel):
    timestamp: datetime
    request_id: str
    step: str
    status: str
    detail: Dict[str, Any] = {}
    elapsed_ms: Optional[int] = None
