import asyncio
import uuid
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
import json

import structlog
from fastapi import FastAPI
from sse_starlette.sse import EventSourceResponse

from app.schemas.event import Event

logger = structlog.get_logger()

# In-memory event queue
event_queue: asyncio.Queue = asyncio.Queue()
event_history: List[Event] = []
MAX_HISTORY = 100


async def emit_event(
    step: str,
    status: str = "ok",
    detail: Dict[str, Any] = None,
    request_id: Optional[str] = None,
    start_time: Optional[float] = None,
):
    """Emit an event to the event queue"""
    if detail is None:
        detail = {}

    event = Event(
        timestamp=datetime.utcnow(),
        request_id=request_id or str(uuid.uuid4()),
        step=step,
        status=status,
        detail=detail,
        elapsed_ms=int((time.time() - start_time) * 1000) if start_time else None,
    )

    # Log the event
    logger.info(
        step,
        request_id=event.request_id,
        status=status,
        **detail
    )

    # Add to history and queue
    event_dict = event.model_dump()
    event_dict["timestamp"] = event_dict["timestamp"].isoformat() + "Z"

    # Add to history (capped collection)
    event_history.append(event)
    if len(event_history) > MAX_HISTORY:
        event_history.pop(0)

    # Add to queue for SSE
    await event_queue.put(json.dumps(event_dict))

    return event


async def event_generator():
    """Generate SSE events from the queue"""
    while True:
        event_json = await event_queue.get()
        yield {"data": event_json}


def init_event_routes(app: FastAPI):
    """Initialize event routes"""

    @app.get("/events")
    async def events():
        """SSE endpoint for event streaming"""
        return EventSourceResponse(event_generator())

    @app.get("/events/history")
    async def get_event_history():
        """Get event history"""
        return event_history
