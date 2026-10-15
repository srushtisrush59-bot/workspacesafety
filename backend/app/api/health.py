"""Health check endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database.base import get_db
from ..config import settings
from datetime import datetime

router = APIRouter()


@router.get("/api/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint."""
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.app_version,
        "environment": settings.environment,
        "components": {
            "database": db_status,
            "vision_service": "enabled" if settings.vision_service_enabled else "disabled",
            "notifications": "enabled" if settings.notifications_enabled else "disabled"
        }
    }
