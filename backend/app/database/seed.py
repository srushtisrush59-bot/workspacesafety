"""Seed database with sample data for development and demonstration."""
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from .models import (
    User, UserRole, Camera, Zone, ZoneType, Incident, IncidentType,
    IncidentSeverity, IncidentStatus, HazardReport, CorrectiveAction,
    ActionStatus, Notification, NotificationStatus
)


def seed_users(db: Session):
    """Create sample users."""
    users = [
        User(
            username="admin",
            email="admin@safetyhq.com",
            hashed_password="admin123",  # In development only - use proper hashing in production
            full_name="System Administrator",
            role=UserRole.ADMIN,
            is_active=True
        ),
        User(
            username="sarah.chen",
            email="sarah.chen@safetyhq.com",
            hashed_password="safety123",
            full_name="Sarah Chen",
            role=UserRole.SAFETY_OFFICER,
            is_active=True
        ),
        User(
            username="mike.torres",
            email="mike.torres@safetyhq.com",
            hashed_password="maint123",
            full_name="Mike Torres",
            role=UserRole.MAINTENANCE_STAFF,
            is_active=True
        ),
        User(
            username="viewer",
            email="viewer@safetyhq.com",
            hashed_password="view123",
            full_name="Guest Viewer",
            role=UserRole.VIEWER,
            is_active=True
        ),
    ]
    
    db.add_all(users)
    db.commit()
    print(f"✓ Created {len(users)} users")
    return users


def seed_zones(db: Session):
    """Create sample factory zones."""
    zones = [
        Zone(
            name="Assembly Line A",
            zone_type=ZoneType.MACHINE_HAZARD,
            description="High-speed assembly line with robotic arms",
            polygon_coordinates=[
                {"x": 50, "y": 100}, {"x": 250, "y": 100},
                {"x": 250, "y": 300}, {"x": 50, "y": 300}
            ],
            risk_level="high",
            require_helmet=True,
            require_vest=True,
            restricted_access=True
        ),
        Zone(
            name="Warehouse Section B",
            zone_type=ZoneType.GENERAL,
            description="General storage area",
            polygon_coordinates=[
                {"x": 300, "y": 100}, {"x": 500, "y": 100},
                {"x": 500, "y": 300}, {"x": 300, "y": 300}
            ],
            risk_level="low",
            require_helmet=False,
            require_vest=True,
            restricted_access=False
        ),
        Zone(
            name="Loading Dock 1",
            zone_type=ZoneType.LOADING_DOCK,
            description="Active loading dock with forklift traffic",
            polygon_coordinates=[
                {"x": 550, "y": 100}, {"x": 750, "y": 100},
                {"x": 750, "y": 300}, {"x": 550, "y": 300}
            ],
            risk_level="medium",
            require_helmet=True,
            require_vest=True,
            restricted_access=False
        ),
        Zone(
            name="Chemical Storage",
            zone_type=ZoneType.CHEMICAL_STORAGE,
            description="Restricted chemical storage area",
            polygon_coordinates=[
                {"x": 50, "y": 350}, {"x": 200, "y": 350},
                {"x": 200, "y": 500}, {"x": 50, "y": 500}
            ],
            risk_level="critical",
            require_helmet=True,
            require_vest=True,
            restricted_access=True
        ),
        Zone(
            name="Pedestrian Corridor",
            zone_type=ZoneType.PEDESTRIAN,
            description="Main pedestrian walkway",
            polygon_coordinates=[
                {"x": 250, "y": 350}, {"x": 400, "y": 350},
                {"x": 400, "y": 450}, {"x": 250, "y": 450}
            ],
            risk_level="low",
            require_helmet=False,
            require_vest=False,
            restricted_access=False
        ),
    ]
    
    db.add_all(zones)
    db.commit()
    print(f"✓ Created {len(zones)} zones")
    return zones


def seed_cameras(db: Session, zones):
    """Create sample cameras."""
    cameras = [
        Camera(
            name="Camera 01 - Assembly Line",
            location="Assembly Line A - North",
            source_type="rtsp",
            source_config={"url": "rtsp://example.com/stream1"},
            zone_id=zones[0].id,
            is_enabled=True,
            is_connected=True,
            last_connected_at=datetime.utcnow()
        ),
        Camera(
            name="Camera 02 - Warehouse",
            location="Warehouse Section B - East",
            source_type="rtsp",
            source_config={"url": "rtsp://example.com/stream2"},
            zone_id=zones[1].id,
            is_enabled=True,
            is_connected=True,
            last_connected_at=datetime.utcnow() - timedelta(minutes=5)
        ),
        Camera(
            name="Camera 03 - Loading Dock",
            location="Loading Dock 1 - Overhead",
            source_type="rtsp",
            source_config={"url": "rtsp://example.com/stream3"},
            zone_id=zones[2].id,
            is_enabled=True,
            is_connected=False,
            last_connected_at=datetime.utcnow() - timedelta(hours=2)
        ),
        Camera(
            name="Camera 04 - Chemical Storage",
            location="Chemical Storage - Entry",
            source_type="rtsp",
            source_config={"url": "rtsp://example.com/stream4"},
            zone_id=zones[3].id,
            is_enabled=True,
            is_connected=True,
            last_connected_at=datetime.utcnow() - timedelta(minutes=1)
        ),
    ]
    
    db.add_all(cameras)
    db.commit()
    print(f"✓ Created {len(cameras)} cameras")
    return cameras


def seed_incidents(db: Session, cameras, zones, users):
    """Create sample incidents (clearly labeled as demo data)."""
    now = datetime.utcnow()
    
    incidents = [
        Incident(
            incident_type=IncidentType.RESTRICTED_ZONE_VIOLATION,
            severity=IncidentSeverity.CRITICAL,
            status=IncidentStatus.NEW,
            title="[DEMO] Unauthorized entry into restricted assembly area",
            description="Person detected entering Assembly Line A restricted zone without authorization. Demo incident for testing.",
            camera_id=cameras[0].id,
            zone_id=zones[0].id,
            detection_confidence=0.94,
            detection_metadata={"person_id": "track_001", "bbox": [120, 150, 180, 280]},
            risk_score=8.5,
            risk_factors=["restricted_zone", "high_machinery_risk"],
            created_at=now - timedelta(minutes=15)
        ),
        Incident(
            incident_type=IncidentType.PPE_VIOLATION,
            severity=IncidentSeverity.HIGH,
            status=IncidentStatus.ACKNOWLEDGED,
            title="[DEMO] Missing safety helmet in loading dock area",
            description="Worker detected without required safety helmet in Loading Dock 1. Demo incident for testing.",
            camera_id=cameras[2].id,
            zone_id=zones[2].id,
            detection_confidence=0.87,
            detection_metadata={"person_id": "track_042", "missing_ppe": ["helmet"]},
            assigned_to_id=users[1].id,
            acknowledged_at=now - timedelta(minutes=45),
            risk_score=6.2,
            created_at=now - timedelta(hours=1)
        ),
        Incident(
            incident_type=IncidentType.NEAR_MISS,
            severity=IncidentSeverity.MEDIUM,
            status=IncidentStatus.RESOLVED,
            title="[DEMO] Near miss - pedestrian in forklift zone",
            description="Pedestrian walking near active forklift operation in warehouse. Demo incident for testing.",
            camera_id=cameras[1].id,
            zone_id=zones[1].id,
            detection_confidence=0.91,
            assigned_to_id=users[1].id,
            acknowledged_at=now - timedelta(hours=3),
            resolved_at=now - timedelta(hours=2),
            resolution_notes="Spoke with warehouse supervisor. Additional signage installed.",
            risk_score=5.0,
            created_at=now - timedelta(hours=4)
        ),
        Incident(
            incident_type=IncidentType.EQUIPMENT_HAZARD,
            severity=IncidentSeverity.LOW,
            status=IncidentStatus.INVESTIGATING,
            title="[DEMO] Loose cable near pedestrian path",
            description="Potential tripping hazard identified in pedestrian corridor. Demo incident for testing.",
            zone_id=zones[4].id,
            assigned_to_id=users[2].id,
            acknowledged_at=now - timedelta(hours=5),
            risk_score=2.5,
            created_at=now - timedelta(hours=6)
        ),
        Incident(
            incident_type=IncidentType.RESTRICTED_ZONE_VIOLATION,
            severity=IncidentSeverity.CRITICAL,
            status=IncidentStatus.ASSIGNED,
            title="[DEMO] Chemical storage unauthorized access attempt",
            description="Motion detected in restricted chemical storage area during off-hours. Demo incident for testing.",
            camera_id=cameras[3].id,
            zone_id=zones[3].id,
            detection_confidence=0.96,
            assigned_to_id=users[1].id,
            acknowledged_at=now - timedelta(hours=10),
            risk_score=9.2,
            risk_factors=["restricted_zone", "chemical_hazard", "after_hours"],
            created_at=now - timedelta(hours=12)
        ),
    ]
    
    db.add_all(incidents)
    db.commit()
    print(f"✓ Created {len(incidents)} demo incidents")
    return incidents


def seed_hazard_reports(db: Session, zones, users):
    """Create sample hazard reports."""
    now = datetime.utcnow()
    
    hazards = [
        HazardReport(
            hazard_type="Slippery Floor",
            description="Oil spill near assembly line workstation. Immediate cleanup required.",
            location="Assembly Line A - Station 3",
            zone_id=zones[0].id,
            priority="high",
            reporter_id=users[2].id,
            reporter_contact="mike.torres@safetyhq.com",
            status="open",
            created_at=now - timedelta(hours=2)
        ),
        HazardReport(
            hazard_type="Damaged Equipment",
            description="Forklift backup alarm not functioning properly.",
            location="Warehouse Section B",
            zone_id=zones[1].id,
            priority="high",
            reporter_id=users[2].id,
            reporter_contact="mike.torres@safetyhq.com",
            status="assigned",
            assigned_to_id=users[2].id,
            created_at=now - timedelta(days=1)
        ),
        HazardReport(
            hazard_type="Blocked Exit",
            description="Emergency exit partially blocked by pallets.",
            location="Loading Dock 1",
            zone_id=zones[2].id,
            priority="critical",
            reporter_contact="anonymous",
            status="resolved",
            resolved_at=now - timedelta(hours=8),
            resolution_notes="Pallets relocated. Exit cleared and verified.",
            created_at=now - timedelta(days=2)
        ),
    ]
    
    db.add_all(hazards)
    db.commit()
    print(f"✓ Created {len(hazards)} hazard reports")
    return hazards


def seed_corrective_actions(db: Session, incidents, hazards, users):
    """Create sample corrective actions."""
    now = datetime.utcnow()
    
    actions = [
        CorrectiveAction(
            incident_id=incidents[1].id,
            title="Conduct PPE compliance training",
            description="Schedule mandatory PPE training session for loading dock personnel.",
            priority="high",
            assigned_to_id=users[1].id,
            due_date=now + timedelta(days=3),
            status=ActionStatus.IN_PROGRESS,
            created_at=now - timedelta(hours=1)
        ),
        CorrectiveAction(
            incident_id=incidents[2].id,
            title="Install additional warning signage",
            description="Place forklift traffic warning signs in pedestrian areas.",
            priority="medium",
            assigned_to_id=users[2].id,
            due_date=now + timedelta(days=5),
            status=ActionStatus.COMPLETED,
            completed_at=now - timedelta(hours=2),
            completion_notes="Installed 3 warning signs in warehouse section.",
            created_at=now - timedelta(hours=3)
        ),
        CorrectiveAction(
            hazard_report_id=hazards[0].id,
            title="Clean oil spill and inspect machinery",
            description="Immediate cleanup of oil spill and inspection of assembly line for leaks.",
            priority="critical",
            assigned_to_id=users[2].id,
            due_date=now + timedelta(hours=4),
            status=ActionStatus.OPEN,
            created_at=now - timedelta(hours=2)
        ),
        CorrectiveAction(
            hazard_report_id=hazards[1].id,
            title="Repair forklift backup alarm",
            description="Replace malfunctioning backup alarm on forklift unit FL-203.",
            priority="high",
            assigned_to_id=users[2].id,
            due_date=now + timedelta(days=1),
            status=ActionStatus.IN_PROGRESS,
            created_at=now - timedelta(days=1)
        ),
    ]
    
    db.add_all(actions)
    db.commit()
    print(f"✓ Created {len(actions)} corrective actions")
    return actions


def seed_notifications(db: Session, incidents, users):
    """Create sample notifications."""
    now = datetime.utcnow()
    
    notifications = [
        Notification(
            notification_type="incident_critical",
            incident_id=incidents[0].id,
            user_id=users[1].id,
            title="Critical Incident Alert",
            message="Unauthorized entry detected in restricted assembly area",
            channel="in_app",
            recipient=users[1].email,
            status=NotificationStatus.SENT,
            sent_at=now - timedelta(minutes=15),
            created_at=now - timedelta(minutes=15)
        ),
        Notification(
            notification_type="incident_high",
            incident_id=incidents[1].id,
            user_id=users[1].id,
            title="PPE Violation Detected",
            message="Missing safety helmet in loading dock area",
            channel="in_app",
            recipient=users[1].email,
            status=NotificationStatus.ACKNOWLEDGED,
            sent_at=now - timedelta(hours=1),
            acknowledged_at=now - timedelta(minutes=45),
            created_at=now - timedelta(hours=1)
        ),
        Notification(
            notification_type="action_due",
            user_id=users[2].id,
            title="Corrective Action Due Soon",
            message="Action 'Clean oil spill and inspect machinery' due in 4 hours",
            channel="in_app",
            recipient=users[2].email,
            status=NotificationStatus.SENT,
            sent_at=now - timedelta(minutes=30),
            created_at=now - timedelta(minutes=30)
        ),
    ]
    
    db.add_all(notifications)
    db.commit()
    print(f"✓ Created {len(notifications)} notifications")
    return notifications


def seed_database(db: Session):
    """Seed database with all sample data."""
    print("\n🌱 Seeding database with demo data...")
    print("=" * 50)
    
    # Never mix demo records into a database that already has application data.
    existing_data = any(
        db.query(model).first() is not None
        for model in (
            User,
            Zone,
            Camera,
            Incident,
            HazardReport,
            CorrectiveAction,
            Notification,
        )
    )
    if existing_data:
        print("⚠️  Database already contains data. Skipping seed.")
        return
    
    # Seed in order (respecting foreign key dependencies)
    users = seed_users(db)
    zones = seed_zones(db)
    cameras = seed_cameras(db, zones)
    incidents = seed_incidents(db, cameras, zones, users)
    hazards = seed_hazard_reports(db, zones, users)
    actions = seed_corrective_actions(db, incidents, hazards, users)
    notifications = seed_notifications(db, incidents, users)
    
    print("=" * 50)
    print("✅ Database seeded successfully!")
    print("\n📋 Demo Credentials:")
    print("   Admin:      admin / admin123")
    print("   Safety:     sarah.chen / safety123")
    print("   Maintenance: mike.torres / maint123")
    print("   Viewer:     viewer / view123")
    print("\n⚠️  All incidents are clearly marked as [DEMO] data\n")
