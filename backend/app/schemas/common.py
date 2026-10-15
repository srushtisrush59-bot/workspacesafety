"""Common schema definitions."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MessageResponse(BaseModel):
    """Standard message response."""
    message: str
    success: bool = True


class PaginationParams(BaseModel):
    """Pagination parameters."""
    skip: int = 0
    limit: int = 100


class DateRangeParams(BaseModel):
    """Date range filter parameters."""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
