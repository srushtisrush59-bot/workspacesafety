"""Notification API endpoints."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database.base import get_db
from ..database.models import Notification, NotificationStatus

router = APIRouter()


@router.get("")
async def list_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user_id: Optional[int] = None,
    status: Optional[str] = None,
    notification_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List notifications with filtering."""
    
    query = db.query(Notification)
    
    if user_id:
        query = query.filter(Notification.user_id == user_id)
    
    if status:
        try:
            status_enum = NotificationStatus(status)
            query = query.filter(Notification.status == status_enum)
        except ValueError:
            pass
    
    if notification_type:
        query = query.filter(Notification.notification_type == notification_type)
    
    total = query.count()
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "notifications": [
            {
                "id": n.id,
                "notification_type": n.notification_type,
                "incident_id": n.incident_id,
                "user_id": n.user_id,
                "title": n.title,
                "message": n.message,
                "channel": n.channel,
                "status": n.status.value,
                "sent_at": n.sent_at.isoformat() if n.sent_at else None,
                "acknowledged_at": n.acknowledged_at.isoformat() if n.acknowledged_at else None,
                "created_at": n.created_at.isoformat()
            }
            for n in notifications
        ],
        "total": total,
        "unread_count": query.filter(
            Notification.status.in_([NotificationStatus.PENDING, NotificationStatus.SENT])
        ).count()
    }


@router.get("/{notification_id}")
async def get_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific notification."""
    
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not notification:
        return {"error": "Notification not found"}, 404
    
    return {
        "id": notification.id,
        "notification_type": notification.notification_type,
        "incident_id": notification.incident_id,
        "user_id": notification.user_id,
        "title": notification.title,
        "message": notification.message,
        "channel": notification.channel,
        "recipient": notification.recipient,
        "status": notification.status.value,
        "sent_at": notification.sent_at.isoformat() if notification.sent_at else None,
        "acknowledged_at": notification.acknowledged_at.isoformat() if notification.acknowledged_at else None,
        "error_message": notification.error_message,
        "created_at": notification.created_at.isoformat()
    }
