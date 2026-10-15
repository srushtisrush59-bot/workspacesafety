"""Dashboard API endpoints."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import Optional
from ..database.base import get_db
from ..database.models import (
    Camera, Incident, IncidentStatus, IncidentSeverity,
    HazardReport, CorrectiveAction, ActionStatus, Zone, VisionEvent
)

router = APIRouter()


@router.get("/summary")
async def get_dashboard_summary(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get dashboard summary statistics."""
    
    # Parse dates
    if start_date:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    else:
        start = datetime.utcnow() - timedelta(days=30)
    
    if end_date:
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    else:
        end = datetime.utcnow()
    
    # Camera statistics
    total_cameras = db.query(Camera).filter(Camera.is_enabled == True).count()
    connected_cameras = db.query(Camera).filter(
        and_(Camera.is_enabled == True, Camera.is_connected == True)
    ).count()
    
    # Incident statistics
    incident_filter = and_(
        Incident.created_at >= start,
        Incident.created_at <= end
    )
    
    total_incidents = db.query(Incident).filter(incident_filter).count()
    open_incidents = db.query(Incident).filter(
        and_(incident_filter, Incident.status.in_([
            IncidentStatus.NEW, IncidentStatus.ACKNOWLEDGED,
            IncidentStatus.ASSIGNED, IncidentStatus.INVESTIGATING
        ]))
    ).count()
    
    critical_incidents = db.query(Incident).filter(
        and_(incident_filter, Incident.severity == IncidentSeverity.CRITICAL)
    ).count()
    
    # Restricted zone violations
    zone_violations = db.query(Incident).filter(
        and_(incident_filter, Incident.incident_type == "restricted_zone_violation")
    ).count()
    
    # PPE violations
    ppe_violations = db.query(Incident).filter(
        and_(incident_filter, Incident.incident_type == "ppe_violation")
    ).count()
    
    # Hazard reports
    open_hazards = db.query(HazardReport).filter(
        and_(
            HazardReport.created_at >= start,
            HazardReport.created_at <= end,
            HazardReport.status == "open"
        )
    ).count()
    
    # Corrective actions
    overdue_actions = db.query(CorrectiveAction).filter(
        and_(
            CorrectiveAction.status.in_([ActionStatus.OPEN, ActionStatus.IN_PROGRESS]),
            CorrectiveAction.due_date < datetime.utcnow()
        )
    ).count()
    
    # People detected (from vision events if available)
    people_detected = db.query(VisionEvent).filter(
        and_(
            VisionEvent.created_at >= start,
            VisionEvent.created_at <= end,
            VisionEvent.event_type == "person_detected"
        )
    ).count()
    
    # Calculate compliance rate
    total_checks = total_incidents if total_incidents > 0 else 1
    compliance_rate = ((total_checks - critical_incidents) / total_checks) * 100
    
    return {
        "cameras": {
            "total": total_cameras,
            "connected": connected_cameras,
            "disconnected": total_cameras - connected_cameras
        },
        "incidents": {
            "total": total_incidents,
            "open": open_incidents,
            "critical": critical_incidents,
            "resolved": total_incidents - open_incidents
        },
        "violations": {
            "restricted_zone": zone_violations,
            "ppe": ppe_violations
        },
        "hazards": {
            "open": open_hazards
        },
        "actions": {
            "overdue": overdue_actions
        },
        "detection": {
            "people_detected": people_detected
        },
        "compliance": {
            "rate": round(compliance_rate, 2),
            "status": "good" if compliance_rate >= 90 else "needs_attention" if compliance_rate >= 75 else "critical"
        },
        "date_range": {
            "start": start.isoformat(),
            "end": end.isoformat()
        }
    }


@router.get("/trends")
async def get_dashboard_trends(
    days: int = Query(7, ge=1, le=90),
    db: Session = Depends(get_db)
):
    """Get incident trends over time."""
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get incidents grouped by day
    incidents_by_day = db.query(
        func.date(Incident.created_at).label('date'),
        func.count(Incident.id).label('count')
    ).filter(
        Incident.created_at >= start_date
    ).group_by(
        func.date(Incident.created_at)
    ).all()
    
    # Get incidents by severity
    incidents_by_severity = db.query(
        Incident.severity,
        func.count(Incident.id).label('count')
    ).filter(
        Incident.created_at >= start_date
    ).group_by(
        Incident.severity
    ).all()
    
    # Get incidents by type
    incidents_by_type = db.query(
        Incident.incident_type,
        func.count(Incident.id).label('count')
    ).filter(
        Incident.created_at >= start_date
    ).group_by(
        Incident.incident_type
    ).all()
    
    # Get incidents by zone
    incidents_by_zone = db.query(
        Zone.name,
        func.count(Incident.id).label('count')
    ).join(
        Incident, Incident.zone_id == Zone.id
    ).filter(
        Incident.created_at >= start_date
    ).group_by(
        Zone.name
    ).all()
    
    return {
        "time_series": [
            {"date": str(row.date), "count": row.count}
            for row in incidents_by_day
        ],
        "by_severity": {
            str(row.severity.value): row.count
            for row in incidents_by_severity
        },
        "by_type": {
            str(row.incident_type.value): row.count
            for row in incidents_by_type
        },
        "by_zone": [
            {"zone": row.name, "count": row.count}
            for row in incidents_by_zone
        ]
    }


@router.get("/recent-incidents")
async def get_recent_incidents(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get recent incidents for dashboard."""
    
    incidents = db.query(Incident).order_by(
        Incident.created_at.desc()
    ).limit(limit).all()
    
    result = []
    for incident in incidents:
        camera_name = incident.camera.name if incident.camera else None
        zone_name = incident.zone.name if incident.zone else None
        
        result.append({
            "id": incident.id,
            "type": incident.incident_type.value,
            "severity": incident.severity.value,
            "status": incident.status.value,
            "title": incident.title,
            "camera_name": camera_name,
            "zone_name": zone_name,
            "created_at": incident.created_at.isoformat()
        })
    
    return {"incidents": result}
