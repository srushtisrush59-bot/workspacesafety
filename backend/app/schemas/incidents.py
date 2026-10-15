"""Incident-related schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..database.models import IncidentType, IncidentSeverity, IncidentStatus


class IncidentBase(BaseModel):
    """Base incident schema."""
    incident_type: IncidentType
    severity: IncidentSeverity
    title: Optional[str] = None
    description: Optional[str] = None
    camera_id: Optional[int] = None
    zone_id: Optional[int] = None


class IncidentCreate(IncidentBase):
    """Schema for creating an incident."""
    detection_confidence: Optional[float] = None
    detection_metadata: Optional[Dict[str, Any]] = None
    evidence_path: Optional[str] = None
    risk_score: Optional[float] = 0.0
    risk_factors: Optional[List[str]] = None


class IncidentUpdate(BaseModel):
    """Schema for updating an incident."""
    status: Optional[IncidentStatus] = None
    assigned_to_id: Optional[int] = None
    resolution_notes: Optional[str] = None


class IncidentAcknowledge(BaseModel):
    """Schema for acknowledging an incident."""
    notes: Optional[str] = None


class IncidentAssign(BaseModel):
    """Schema for assigning an incident."""
    assigned_to_id: int
    notes: Optional[str] = None


class IncidentResolve(BaseModel):
    """Schema for resolving an incident."""
    resolution_notes: str


class IncidentResponse(IncidentBase):
    """Schema for incident response."""
    id: int
    status: IncidentStatus
    assigned_to_id: Optional[int] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    detection_confidence: Optional[float] = None
    risk_score: float
    risk_factors: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime
    
    # Related entity names
    camera_name: Optional[str] = None
    zone_name: Optional[str] = None
    assigned_to_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class IncidentListResponse(BaseModel):
    """Schema for incident list response."""
    incidents: List[IncidentResponse]
    total: int
    skip: int
    limit: int


class IncidentStatsResponse(BaseModel):
    """Schema for incident statistics."""
    total_incidents: int
    open_incidents: int
    critical_incidents: int
    high_severity_incidents: int
    medium_severity_incidents: int
    low_severity_incidents: int
    resolved_incidents: int
    average_resolution_time_hours: Optional[float] = None
    incidents_by_type: Dict[str, int]
    incidents_by_zone: Dict[str, int]
