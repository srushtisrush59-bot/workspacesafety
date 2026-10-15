"""Camera management API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database.base import get_db
from ..database.models import Camera, Zone
from ..schemas.cameras import CameraCreate, CameraUpdate, CameraResponse, CameraListResponse
from ..schemas.common import MessageResponse

router = APIRouter()


def _enrich_camera_response(camera: Camera) -> dict:
    """Enrich camera with related entity names."""
    return {
        **{c.name: getattr(camera, c.name) for c in camera.__table__.columns},
        "zone_name": camera.zone.name if camera.zone else None,
    }


@router.get("", response_model=CameraListResponse)
async def list_cameras(db: Session = Depends(get_db)):
    """List all cameras."""
    
    cameras = db.query(Camera).all()
    enriched_cameras = [_enrich_camera_response(cam) for cam in cameras]
    
    return {
        "cameras": enriched_cameras,
        "total": len(cameras)
    }


@router.get("/{camera_id}", response_model=CameraResponse)
async def get_camera(
    camera_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific camera by ID."""
    
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    return _enrich_camera_response(camera)


@router.post("", response_model=CameraResponse, status_code=201)
async def create_camera(
    camera_data: CameraCreate,
    db: Session = Depends(get_db)
):
    """Create a new camera."""
    
    # Validate zone if provided
    if camera_data.zone_id:
        zone = db.query(Zone).filter(Zone.id == camera_data.zone_id).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Zone not found")
    
    camera = Camera(
        name=camera_data.name,
        location=camera_data.location,
        source_type=camera_data.source_type,
        source_config=camera_data.source_config,
        zone_id=camera_data.zone_id,
        is_enabled=camera_data.is_enabled
    )
    
    db.add(camera)
    db.commit()
    db.refresh(camera)
    
    return _enrich_camera_response(camera)


@router.patch("/{camera_id}", response_model=CameraResponse)
async def update_camera(
    camera_id: int,
    camera_data: CameraUpdate,
    db: Session = Depends(get_db)
):
    """Update a camera."""
    
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    # Update fields
    if camera_data.name is not None:
        camera.name = camera_data.name
    
    if camera_data.location is not None:
        camera.location = camera_data.location
    
    if camera_data.source_type is not None:
        camera.source_type = camera_data.source_type
    
    if camera_data.source_config is not None:
        camera.source_config = camera_data.source_config
    
    if camera_data.zone_id is not None:
        zone = db.query(Zone).filter(Zone.id == camera_data.zone_id).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Zone not found")
        camera.zone_id = camera_data.zone_id
    
    if camera_data.is_enabled is not None:
        camera.is_enabled = camera_data.is_enabled
    
    if camera_data.is_connected is not None:
        camera.is_connected = camera_data.is_connected
    
    db.commit()
    db.refresh(camera)
    
    return _enrich_camera_response(camera)


@router.delete("/{camera_id}", response_model=MessageResponse)
async def delete_camera(
    camera_id: int,
    db: Session = Depends(get_db)
):
    """Delete a camera."""
    
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    db.delete(camera)
    db.commit()
    
    return {"message": f"Camera {camera_id} deleted successfully", "success": True}
