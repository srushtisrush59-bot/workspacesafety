"""Hazard report API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from ..database.base import get_db
from ..database.models import HazardReport, Zone, User
from ..schemas.hazards import (
    HazardReportCreate, HazardReportUpdate,
    HazardReportResponse, HazardReportListResponse
)
from ..schemas.common import MessageResponse

router = APIRouter()


def _enrich_hazard_response(hazard: HazardReport) -> dict:
    """Enrich hazard report with related entity names."""
    return {
        **{c.name: getattr(hazard, c.name) for c in hazard.__table__.columns},
        "zone_name": hazard.zone.name if hazard.zone else None,
        "assigned_to_name": hazard.assigned_to_user.full_name if hazard.assigned_to_id and hasattr(hazard, 'assigned_to_user') else None,
    }


@router.get("", response_model=HazardReportListResponse)
async def list_hazard_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    zone_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """List hazard reports with filtering."""
    
    query = db.query(HazardReport)
    
    if status:
        query = query.filter(HazardReport.status == status)
    
    if priority:
        query = query.filter(HazardReport.priority == priority)
    
    if zone_id:
        query = query.filter(HazardReport.zone_id == zone_id)
    
    total = query.count()
    hazards = query.order_by(HazardReport.created_at.desc()).offset(skip).limit(limit).all()
    
    enriched_hazards = [_enrich_hazard_response(h) for h in hazards]
    
    return {
        "hazards": enriched_hazards,
        "total": total
    }


@router.get("/{hazard_id}", response_model=HazardReportResponse)
async def get_hazard_report(
    hazard_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific hazard report by ID."""
    
    hazard = db.query(HazardReport).filter(HazardReport.id == hazard_id).first()
    
    if not hazard:
        raise HTTPException(status_code=404, detail="Hazard report not found")
    
    return _enrich_hazard_response(hazard)


@router.post("", response_model=HazardReportResponse, status_code=201)
async def create_hazard_report(
    hazard_data: HazardReportCreate,
    db: Session = Depends(get_db)
):
    """Create a new hazard report."""
    
    # Validate zone if provided
    if hazard_data.zone_id:
        zone = db.query(Zone).filter(Zone.id == hazard_data.zone_id).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Zone not found")
    
    hazard = HazardReport(
        hazard_type=hazard_data.hazard_type,
        description=hazard_data.description,
        location=hazard_data.location,
        zone_id=hazard_data.zone_id,
        priority=hazard_data.priority,
        reporter_contact=hazard_data.reporter_contact,
        status="open"
    )
    
    db.add(hazard)
    db.commit()
    db.refresh(hazard)
    
    return _enrich_hazard_response(hazard)


@router.patch("/{hazard_id}", response_model=HazardReportResponse)
async def update_hazard_report(
    hazard_id: int,
    hazard_data: HazardReportUpdate,
    db: Session = Depends(get_db)
):
    """Update a hazard report."""
    
    hazard = db.query(HazardReport).filter(HazardReport.id == hazard_id).first()
    
    if not hazard:
        raise HTTPException(status_code=404, detail="Hazard report not found")
    
    # Update fields
    if hazard_data.status is not None:
        hazard.status = hazard_data.status
        if hazard_data.status == "resolved" and not hazard.resolved_at:
            hazard.resolved_at = datetime.utcnow()
    
    if hazard_data.assigned_to_id is not None:
        # Verify user exists
        user = db.query(User).filter(User.id == hazard_data.assigned_to_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        hazard.assigned_to_id = hazard_data.assigned_to_id
        hazard.status = "assigned"
    
    if hazard_data.resolution_notes is not None:
        hazard.resolution_notes = hazard_data.resolution_notes
    
    hazard.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(hazard)
    
    return _enrich_hazard_response(hazard)


@router.delete("/{hazard_id}", response_model=MessageResponse)
async def delete_hazard_report(
    hazard_id: int,
    db: Session = Depends(get_db)
):
    """Delete a hazard report."""
    
    hazard = db.query(HazardReport).filter(HazardReport.id == hazard_id).first()
    
    if not hazard:
        raise HTTPException(status_code=404, detail="Hazard report not found")
    
    db.delete(hazard)
    db.commit()
    
    return {"message": f"Hazard report {hazard_id} deleted successfully", "success": True}
