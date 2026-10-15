"""Hazard report schemas."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class HazardReportBase(BaseModel):
    """Base hazard report schema."""
    hazard_type: str
    description: str
    location: Optional[str] = None
    zone_id: Optional[int] = None
    priority: str = "medium"


class HazardReportCreate(HazardReportBase):
    """Schema for creating a hazard report."""
    reporter_contact: Optional[str] = None


class HazardReportUpdate(BaseModel):
    """Schema for updating a hazard report."""
    status: Optional[str] = None
    assigned_to_id: Optional[int] = None
    resolution_notes: Optional[str] = None


class HazardReportResponse(HazardReportBase):
    """Schema for hazard report response."""
    id: int
    reporter_id: Optional[int] = None
    reporter_contact: Optional[str] = None
    status: str
    assigned_to_id: Optional[int] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    photo_path: Optional[str] = None
    zone_name: Optional[str] = None
    assigned_to_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class HazardReportListResponse(BaseModel):
    """Schema for hazard report list response."""
    hazards: List[HazardReportResponse]
    total: int
