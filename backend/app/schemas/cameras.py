"""Camera-related schemas."""
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


class CameraBase(BaseModel):
    """Base camera schema."""
    name: str
    location: Optional[str] = None
    source_type: str  # usb, rtsp, upload
    zone_id: Optional[int] = None


class CameraCreate(CameraBase):
    """Schema for creating a camera."""
    source_config: Optional[Dict[str, Any]] = None
    is_enabled: bool = True


class CameraUpdate(BaseModel):
    """Schema for updating a camera."""
    name: Optional[str] = None
    location: Optional[str] = None
    source_type: Optional[str] = None
    source_config: Optional[Dict[str, Any]] = None
    zone_id: Optional[int] = None
    is_enabled: Optional[bool] = None
    is_connected: Optional[bool] = None


class CameraResponse(CameraBase):
    """Schema for camera response."""
    id: int
    is_enabled: bool
    is_connected: bool
    last_connected_at: Optional[datetime] = None
    zone_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CameraListResponse(BaseModel):
    """Schema for camera list response."""
    cameras: List[CameraResponse]
    total: int
