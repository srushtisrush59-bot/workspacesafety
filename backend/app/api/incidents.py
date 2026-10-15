"""Incident management API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional, List
from datetime import datetime
from ..database.base import get_db
from ..database.models import Incident, IncidentStatus, IncidentSeverity, IncidentType, User, Camera, Zone
from ..schemas.incidents import (
    IncidentCreate, IncidentUpdate, IncidentResponse,
    IncidentListResponse, IncidentAcknowledge, IncidentAssign, IncidentResolve
)
from ..schemas.common import MessageResponse

router = APIRouter()


def _enrich_incident_response(incident: Incident) -> dict:
    """Enrich incident with related entity names."""
    return {
        **{c.name: getattr(incident, c.name) for c in incident.__table__.columns},
        "camera_name": incident.camera.name if incident.camera else None,
        "zone_name": incident.zone.name if incident.zone else None,
        "assigned_to_name": incident.assigned_to_user.full_name if incident.assigned_to_user else None,
    }


@router.get("", response_model=IncidentListResponse)
async def list_incidents(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    incident_type: Optional[str] = None,
    zone_id: Optional[int] = None,
    camera_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List incidents with filtering and pagination."""
    
    query = db.query(Incident)
    
    # Apply filters
    filters = []
    
    if status:
        try:
            status_enum = IncidentStatus(status)
            filters.append(Incident.status == status_enum)
        except ValueError:
            pass
    
    if severity:
        try:
            severity_enum = IncidentSeverity(severity)
            filters.append(Incident.severity == severity_enum)
        except ValueError:
            pass
    
    if incident_type:
        try:
            type_enum = IncidentType(incident_type)
            filters.append(Incident.incident_type == type_enum)
        except ValueError:
            pass
    
    if zone_id:
        filters.append(Incident.zone_id == zone_id)
    
    if camera_id:
        filters.append(Incident.camera_id == camera_id)
    
    if start_date:
        try:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            filters.append(Incident.created_at >= start)
        except ValueError:
            pass
    
    if end_date:
        try:
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            filters.append(Incident.created_at <= end)
        except ValueError:
            pass
    
    if filters:
        query = query.filter(and_(*filters))
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    incidents = query.order_by(Incident.created_at.desc()).offset(skip).limit(limit).all()
    
    # Enrich responses
    enriched_incidents = [_enrich_incident_response(inc) for inc in incidents]
    
    return {
        "incidents": enriched_incidents,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific incident by ID."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    return _enrich_incident_response(incident)


@router.post("", response_model=IncidentResponse, status_code=201)
async def create_incident(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db)
):
    """Create a new incident."""
    
    incident = Incident(
        incident_type=incident_data.incident_type,
        severity=incident_data.severity,
        title=incident_data.title,
        description=incident_data.description,
        camera_id=incident_data.camera_id,
        zone_id=incident_data.zone_id,
        detection_confidence=incident_data.detection_confidence,
        detection_metadata=incident_data.detection_metadata,
        evidence_path=incident_data.evidence_path,
        risk_score=incident_data.risk_score or 0.0,
        risk_factors=incident_data.risk_factors,
        status=IncidentStatus.NEW
    )
    
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    return _enrich_incident_response(incident)


@router.patch("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: int,
    incident_data: IncidentUpdate,
    db: Session = Depends(get_db)
):
    """Update an incident."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Update fields
    if incident_data.status is not None:
        incident.status = incident_data.status
    
    if incident_data.assigned_to_id is not None:
        incident.assigned_to_id = incident_data.assigned_to_id
    
    if incident_data.resolution_notes is not None:
        incident.resolution_notes = incident_data.resolution_notes
        if incident.status == IncidentStatus.RESOLVED and not incident.resolved_at:
            incident.resolved_at = datetime.utcnow()
    
    incident.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(incident)
    
    return _enrich_incident_response(incident)


@router.post("/{incident_id}/acknowledge", response_model=IncidentResponse)
async def acknowledge_incident(
    incident_id: int,
    data: IncidentAcknowledge,
    db: Session = Depends(get_db)
):
    """Acknowledge an incident."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    if incident.status == IncidentStatus.NEW:
        incident.status = IncidentStatus.ACKNOWLEDGED
    
    incident.acknowledged_at = datetime.utcnow()
    incident.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(incident)
    
    return _enrich_incident_response(incident)


@router.post("/{incident_id}/assign", response_model=IncidentResponse)
async def assign_incident(
    incident_id: int,
    data: IncidentAssign,
    db: Session = Depends(get_db)
):
    """Assign an incident to a user."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Verify user exists
    user = db.query(User).filter(User.id == data.assigned_to_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    incident.assigned_to_id = data.assigned_to_id
    incident.status = IncidentStatus.ASSIGNED
    incident.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(incident)
    
    return _enrich_incident_response(incident)


@router.post("/{incident_id}/resolve", response_model=IncidentResponse)
async def resolve_incident(
    incident_id: int,
    data: IncidentResolve,
    db: Session = Depends(get_db)
):
    """Resolve an incident."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident.status = IncidentStatus.RESOLVED
    incident.resolved_at = datetime.utcnow()
    incident.resolution_notes = data.resolution_notes
    incident.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(incident)
    
    return _enrich_incident_response(incident)


@router.delete("/{incident_id}", response_model=MessageResponse)
async def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db)
):
    """Delete an incident (admin only in production)."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    db.delete(incident)
    db.commit()
    
    return {"message": f"Incident {incident_id} deleted successfully", "success": True}
