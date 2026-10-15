"""Corrective action API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from ..database.base import get_db
from ..database.models import CorrectiveAction, ActionStatus, Incident, HazardReport, User
from ..schemas.actions import (
    CorrectiveActionCreate, CorrectiveActionUpdate,
    CorrectiveActionResponse, CorrectiveActionListResponse
)
from ..schemas.common import MessageResponse

router = APIRouter()


def _enrich_action_response(action: CorrectiveAction) -> dict:
    """Enrich corrective action with related data."""
    is_overdue = False
    if action.due_date and action.status in [ActionStatus.OPEN, ActionStatus.IN_PROGRESS]:
        is_overdue = action.due_date < datetime.utcnow()
    
    return {
        **{c.name: getattr(action, c.name) for c in action.__table__.columns},
        "assigned_to_name": action.assigned_to_user.full_name if action.assigned_to_user else None,
        "is_overdue": is_overdue,
    }


@router.get("", response_model=CorrectiveActionListResponse)
async def list_corrective_actions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    assigned_to_id: Optional[int] = None,
    incident_id: Optional[int] = None,
    hazard_report_id: Optional[int] = None,
    show_overdue_only: bool = False,
    db: Session = Depends(get_db)
):
    """List corrective actions with filtering."""
    
    query = db.query(CorrectiveAction)
    
    if status:
        try:
            status_enum = ActionStatus(status)
            query = query.filter(CorrectiveAction.status == status_enum)
        except ValueError:
            pass
    
    if assigned_to_id:
        query = query.filter(CorrectiveAction.assigned_to_id == assigned_to_id)
    
    if incident_id:
        query = query.filter(CorrectiveAction.incident_id == incident_id)
    
    if hazard_report_id:
        query = query.filter(CorrectiveAction.hazard_report_id == hazard_report_id)
    
    if show_overdue_only:
        query = query.filter(
            CorrectiveAction.status.in_([ActionStatus.OPEN, ActionStatus.IN_PROGRESS]),
            CorrectiveAction.due_date < datetime.utcnow()
        )
    
    total = query.count()
    actions = query.order_by(CorrectiveAction.created_at.desc()).offset(skip).limit(limit).all()
    
    # Count overdue actions
    overdue_count = db.query(CorrectiveAction).filter(
        CorrectiveAction.status.in_([ActionStatus.OPEN, ActionStatus.IN_PROGRESS]),
        CorrectiveAction.due_date < datetime.utcnow()
    ).count()
    
    enriched_actions = [_enrich_action_response(a) for a in actions]
    
    return {
        "actions": enriched_actions,
        "total": total,
        "overdue_count": overdue_count
    }


@router.get("/{action_id}", response_model=CorrectiveActionResponse)
async def get_corrective_action(
    action_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific corrective action by ID."""
    
    action = db.query(CorrectiveAction).filter(CorrectiveAction.id == action_id).first()
    
    if not action:
        raise HTTPException(status_code=404, detail="Corrective action not found")
    
    return _enrich_action_response(action)


@router.post("", response_model=CorrectiveActionResponse, status_code=201)
async def create_corrective_action(
    action_data: CorrectiveActionCreate,
    db: Session = Depends(get_db)
):
    """Create a new corrective action."""
    
    # Validate related entities
    if action_data.incident_id:
        incident = db.query(Incident).filter(Incident.id == action_data.incident_id).first()
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
    
    if action_data.hazard_report_id:
        hazard = db.query(HazardReport).filter(HazardReport.id == action_data.hazard_report_id).first()
        if not hazard:
            raise HTTPException(status_code=404, detail="Hazard report not found")
    
    if action_data.assigned_to_id:
        user = db.query(User).filter(User.id == action_data.assigned_to_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
    
    action = CorrectiveAction(
        incident_id=action_data.incident_id,
        hazard_report_id=action_data.hazard_report_id,
        title=action_data.title,
        description=action_data.description,
        priority=action_data.priority,
        assigned_to_id=action_data.assigned_to_id,
        due_date=action_data.due_date,
        status=ActionStatus.OPEN
    )
    
    db.add(action)
    db.commit()
    db.refresh(action)
    
    return _enrich_action_response(action)


@router.patch("/{action_id}", response_model=CorrectiveActionResponse)
async def update_corrective_action(
    action_id: int,
    action_data: CorrectiveActionUpdate,
    db: Session = Depends(get_db)
):
    """Update a corrective action."""
    
    action = db.query(CorrectiveAction).filter(CorrectiveAction.id == action_id).first()
    
    if not action:
        raise HTTPException(status_code=404, detail="Corrective action not found")
    
    # Update fields
    if action_data.status is not None:
        action.status = action_data.status
        if action_data.status == ActionStatus.COMPLETED and not action.completed_at:
            action.completed_at = datetime.utcnow()
        elif action_data.status == ActionStatus.VERIFIED and not action.verified_at:
            action.verified_at = datetime.utcnow()
    
    if action_data.assigned_to_id is not None:
        user = db.query(User).filter(User.id == action_data.assigned_to_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        action.assigned_to_id = action_data.assigned_to_id
    
    if action_data.due_date is not None:
        action.due_date = action_data.due_date
    
    if action_data.completion_notes is not None:
        action.completion_notes = action_data.completion_notes
    
    action.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(action)
    
    return _enrich_action_response(action)


@router.delete("/{action_id}", response_model=MessageResponse)
async def delete_corrective_action(
    action_id: int,
    db: Session = Depends(get_db)
):
    """Delete a corrective action."""
    
    action = db.query(CorrectiveAction).filter(CorrectiveAction.id == action_id).first()
    
    if not action:
        raise HTTPException(status_code=404, detail="Corrective action not found")
    
    db.delete(action)
    db.commit()
    
    return {"message": f"Corrective action {action_id} deleted successfully", "success": True}
