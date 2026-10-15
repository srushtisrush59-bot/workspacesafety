"""Analytics API endpoints."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import Optional
from ..database.base import get_db
from ..database.models import (
    Incident, IncidentStatus, IncidentSeverity, IncidentType,
    Zone, Camera, CorrectiveAction, ActionStatus, HazardReport
)

router = APIRouter()


@router.get("/summary")
async def get_analytics_summary(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    zone_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics summary."""
    
    # Parse dates
    if start_date:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    else:
        start = datetime.utcnow() - timedelta(days=30)
    
    if end_date:
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    else:
        end = datetime.utcnow()
    
    # Base filter
    incident_filter = and_(
        Incident.created_at >= start,
        Incident.created_at <= end
    )
    
    if zone_id:
        incident_filter = and_(incident_filter, Incident.zone_id == zone_id)
    
    # Total incidents
    total_incidents = db.query(Incident).filter(incident_filter).count()
    
    # Incidents by severity
    critical = db.query(Incident).filter(
        and_(incident_filter, Incident.severity == IncidentSeverity.CRITICAL)
    ).count()
    
    high = db.query(Incident).filter(
        and_(incident_filter, Incident.severity == IncidentSeverity.HIGH)
    ).count()
    
    medium = db.query(Incident).filter(
        and_(incident_filter, Incident.severity == IncidentSeverity.MEDIUM)
    ).count()
    
    low = db.query(Incident).filter(
        and_(incident_filter, Incident.severity == IncidentSeverity.LOW)
    ).count()
    
    # Incidents by status
    incidents_by_status = db.query(
        Incident.status,
        func.count(Incident.id).label('count')
    ).filter(incident_filter).group_by(Incident.status).all()
    
    # Incidents by type
    incidents_by_type = db.query(
        Incident.incident_type,
        func.count(Incident.id).label('count')
    ).filter(incident_filter).group_by(Incident.incident_type).all()
    
    # Incidents by zone
    incidents_by_zone = db.query(
        Zone.name,
        func.count(Incident.id).label('count')
    ).join(Incident, Incident.zone_id == Zone.id).filter(
        incident_filter
    ).group_by(Zone.name).all()
    
    # Average resolution time (only for resolved incidents)
    resolved_incidents = db.query(Incident).filter(
        and_(
            incident_filter,
            Incident.status == IncidentStatus.RESOLVED,
            Incident.resolved_at.isnot(None)
        )
    ).all()
    
    avg_resolution_hours = None
    if resolved_incidents:
        total_hours = sum([
            (inc.resolved_at - inc.created_at).total_seconds() / 3600
            for inc in resolved_incidents
        ])
        avg_resolution_hours = round(total_hours / len(resolved_incidents), 2)
    
    # Average acknowledgment time
    acknowledged_incidents = db.query(Incident).filter(
        and_(
            incident_filter,
            Incident.acknowledged_at.isnot(None)
        )
    ).all()
    
    avg_acknowledgment_minutes = None
    if acknowledged_incidents:
        total_minutes = sum([
            (inc.acknowledged_at - inc.created_at).total_seconds() / 60
            for inc in acknowledged_incidents
        ])
        avg_acknowledgment_minutes = round(total_minutes / len(acknowledged_incidents), 2)
    
    # Corrective action completion rate
    actions_in_period = db.query(CorrectiveAction).filter(
        and_(
            CorrectiveAction.created_at >= start,
            CorrectiveAction.created_at <= end
        )
    ).all()
    
    completed_actions = len([a for a in actions_in_period if a.status in [ActionStatus.COMPLETED, ActionStatus.VERIFIED]])
    total_actions = len(actions_in_period)
    completion_rate = (completed_actions / total_actions * 100) if total_actions > 0 else 0
    
    return {
        "date_range": {
            "start": start.isoformat(),
            "end": end.isoformat()
        },
        "incidents": {
            "total": total_incidents,
            "by_severity": {
                "critical": critical,
                "high": high,
                "medium": medium,
                "low": low
            },
            "by_status": {
                str(row.status.value): row.count
                for row in incidents_by_status
            },
            "by_type": {
                str(row.incident_type.value): row.count
                for row in incidents_by_type
            },
            "by_zone": [
                {"zone": row.name, "count": row.count}
                for row in incidents_by_zone
            ]
        },
        "performance": {
            "avg_resolution_hours": avg_resolution_hours,
            "avg_acknowledgment_minutes": avg_acknowledgment_minutes,
            "action_completion_rate": round(completion_rate, 2)
        }
    }


@router.get("/trends")
async def get_trends(
    days: int = Query(30, ge=1, le=365),
    metric: str = Query("incidents", regex="^(incidents|severity|type)$"),
    db: Session = Depends(get_db)
):
    """Get trend data over time."""
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    if metric == "incidents":
        # Daily incident counts
        data = db.query(
            func.date(Incident.created_at).label('date'),
            func.count(Incident.id).label('count')
        ).filter(
            Incident.created_at >= start_date
        ).group_by(
            func.date(Incident.created_at)
        ).all()
        
        return {
            "metric": "incidents",
            "data": [
                {"date": str(row.date), "value": row.count}
                for row in data
            ]
        }
    
    elif metric == "severity":
        # Incidents by severity over time
        data = db.query(
            func.date(Incident.created_at).label('date'),
            Incident.severity,
            func.count(Incident.id).label('count')
        ).filter(
            Incident.created_at >= start_date
        ).group_by(
            func.date(Incident.created_at),
            Incident.severity
        ).all()
        
        return {
            "metric": "severity",
            "data": [
                {
                    "date": str(row.date),
                    "severity": str(row.severity.value),
                    "count": row.count
                }
                for row in data
            ]
        }
    
    return {"metric": metric, "data": []}


@router.get("/zone-risk")
async def get_zone_risk_analysis(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Analyze risk by zone."""
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    zones = db.query(Zone).all()
    
    risk_analysis = []
    
    for zone in zones:
        # Count incidents
        incident_count = db.query(Incident).filter(
            and_(
                Incident.zone_id == zone.id,
                Incident.created_at >= start_date
            )
        ).count()
        
        # Count critical incidents
        critical_count = db.query(Incident).filter(
            and_(
                Incident.zone_id == zone.id,
                Incident.created_at >= start_date,
                Incident.severity == IncidentSeverity.CRITICAL
            )
        ).count()
        
        # Count open hazards
        open_hazards = db.query(HazardReport).filter(
            and_(
                HazardReport.zone_id == zone.id,
                HazardReport.status == "open"
            )
        ).count()
        
        # Calculate risk score
        risk_score = (critical_count * 3) + (incident_count * 0.5) + (open_hazards * 1.5)
        
        risk_analysis.append({
            "zone_id": zone.id,
            "zone_name": zone.name,
            "zone_type": zone.zone_type.value,
            "incident_count": incident_count,
            "critical_count": critical_count,
            "open_hazards": open_hazards,
            "risk_score": round(risk_score, 2),
            "risk_level": zone.risk_level
        })
    
    # Sort by risk score descending
    risk_analysis.sort(key=lambda x: x['risk_score'], reverse=True)
    
    return {
        "zones": risk_analysis,
        "period_days": days
    }
