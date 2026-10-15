"""Zone-related schemas."""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..database.models import ZoneType


class ZoneBase(BaseModel):
    """Base zone schema."""
    name: str
    zone_type: ZoneType
    description: Optional[str] = None
    risk_level: str = "low"
    require_helmet: bool = False
    require_vest: bool = False
    restricted_access: bool = False


class ZoneCreate(ZoneBase):
    """Schema for creating a zone."""
    polygon_coordinates: Optional[List[Dict[str, float]]] = None
    floor_plan_id: Optional[int] = None


class ZoneUpdate(BaseModel):
    """Schema for updating a zone."""
    name: Optional[str] = None
    zone_type: Optional[ZoneType] = None
    description: Optional[str] = None
    polygon_coordinates: Optional[List[Dict[str, float]]] = None
    risk_level: Optional[str] = None
    require_helmet: Optional[bool] = None
    require_vest: Optional[bool] = None
    restricted_access: Optional[bool] = None


class ZoneResponse(ZoneBase):
    """Schema for zone response."""
    id: int
    polygon_coordinates: Optional[List[Dict[str, float]]] = None
    floor_plan_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    # Statistics
    incident_count: Optional[int] = 0
    open_hazard_count: Optional[int] = 0
    
    class Config:
        from_attributes = True


class ZoneListResponse(BaseModel):
    """Schema for zone list response."""
    zones: List[ZoneResponse]
    total: int
