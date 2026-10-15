"""Zone management API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database.base import get_db
from ..database.models import Zone, Incident, HazardReport
from ..schemas.zones import ZoneCreate, ZoneUpdate, ZoneResponse, ZoneListResponse
from ..schemas.common import MessageResponse

router = APIRouter()


def _enrich_zone_response(zone: Zone, db: Session) -> dict:
    """Enrich zone with statistics."""
    # Count incidents in this zone
    incident_count = db.query(Incident).filter(Incident.zone_id == zone.id).count()
    
    # Count open hazards in this zone
    open_hazard_count = db.query(HazardReport).filter(
        HazardReport.zone_id == zone.id,
        HazardReport.status == "open"
    ).count()
    
    return {
        **{c.name: getattr(zone, c.name) for c in zone.__table__.columns},
        "incident_count": incident_count,
        "open_hazard_count": open_hazard_count,
    }


@router.get("", response_model=ZoneListResponse)
async def list_zones(db: Session = Depends(get_db)):
    """List all zones."""
    
    zones = db.query(Zone).all()
    enriched_zones = [_enrich_zone_response(zone, db) for zone in zones]
    
    return {
        "zones": enriched_zones,
        "total": len(zones)
    }


@router.get("/{zone_id}", response_model=ZoneResponse)
async def get_zone(
    zone_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific zone by ID."""
    
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    return _enrich_zone_response(zone, db)


@router.post("", response_model=ZoneResponse, status_code=201)
async def create_zone(
    zone_data: ZoneCreate,
    db: Session = Depends(get_db)
):
    """Create a new zone."""
    
    zone = Zone(
        name=zone_data.name,
        zone_type=zone_data.zone_type,
        description=zone_data.description,
        polygon_coordinates=zone_data.polygon_coordinates,
        floor_plan_id=zone_data.floor_plan_id,
        risk_level=zone_data.risk_level,
        require_helmet=zone_data.require_helmet,
        require_vest=zone_data.require_vest,
        restricted_access=zone_data.restricted_access
    )
    
    db.add(zone)
    db.commit()
    db.refresh(zone)
    
    return _enrich_zone_response(zone, db)


@router.patch("/{zone_id}", response_model=ZoneResponse)
async def update_zone(
    zone_id: int,
    zone_data: ZoneUpdate,
    db: Session = Depends(get_db)
):
    """Update a zone."""
    
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    # Update fields
    update_data = zone_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(zone, field, value)
    
    db.commit()
    db.refresh(zone)
    
    return _enrich_zone_response(zone, db)


@router.delete("/{zone_id}", response_model=MessageResponse)
async def delete_zone(
    zone_id: int,
    db: Session = Depends(get_db)
):
    """Delete a zone."""
    
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    # Check if zone has associated cameras or incidents
    incident_count = db.query(Incident).filter(Incident.zone_id == zone_id).count()
    if incident_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete zone with {incident_count} associated incidents"
        )
    
    db.delete(zone)
    db.commit()
    
    return {"message": f"Zone {zone_id} deleted successfully", "success": True}
