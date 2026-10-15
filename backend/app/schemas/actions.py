"""Corrective action schemas."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..database.models import ActionStatus


class CorrectiveActionBase(BaseModel):
    """Base corrective action schema."""
    title: str
    description: str
    priority: str = "medium"


class CorrectiveActionCreate(CorrectiveActionBase):
    """Schema for creating a corrective action."""
    incident_id: Optional[int] = None
    hazard_report_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    due_date: Optional[datetime] = None


class CorrectiveActionUpdate(BaseModel):
    """Schema for updating a corrective action."""
    status: Optional[ActionStatus] = None
    assigned_to_id: Optional[int] = None
    due_date: Optional[datetime] = None
    completion_notes: Optional[str] = None


class CorrectiveActionResponse(CorrectiveActionBase):
    """Schema for corrective action response."""
    id: int
    incident_id: Optional[int] = None
    hazard_report_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    assigned_to_name: Optional[str] = None
    due_date: Optional[datetime] = None
    status: ActionStatus
    completed_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    completion_notes: Optional[str] = None
    evidence_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    # Computed fields
    is_overdue: Optional[bool] = False
    
    class Config:
        from_attributes = True


class CorrectiveActionListResponse(BaseModel):
    """Schema for corrective action list response."""
    actions: List[CorrectiveActionResponse]
    total: int
    overdue_count: int
