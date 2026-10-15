"""SQLAlchemy database models."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .base import Base


class UserRole(str, enum.Enum):
    """User role enumeration."""
    ADMIN = "admin"
    SAFETY_OFFICER = "safety_officer"
    MAINTENANCE_STAFF = "maintenance_staff"
    VIEWER = "viewer"


class IncidentStatus(str, enum.Enum):
    """Incident status enumeration."""
    NEW = "new"
    ACKNOWLEDGED = "acknowledged"
    ASSIGNED = "assigned"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    CLOSED = "closed"


class IncidentSeverity(str, enum.Enum):
    """Incident severity enumeration."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class IncidentType(str, enum.Enum):
    """Incident type enumeration."""
    RESTRICTED_ZONE_VIOLATION = "restricted_zone_violation"
    PPE_VIOLATION = "ppe_violation"
    UNSAFE_BEHAVIOR = "unsafe_behavior"
    EQUIPMENT_HAZARD = "equipment_hazard"
    ENVIRONMENTAL_HAZARD = "environmental_hazard"
    NEAR_MISS = "near_miss"
    OTHER = "other"


class ZoneType(str, enum.Enum):
    """Zone type enumeration."""
    RESTRICTED = "restricted"
    MACHINE_HAZARD = "machine_hazard"
    PEDESTRIAN = "pedestrian"
    GENERAL = "general"
    LOADING_DOCK = "loading_dock"
    CHEMICAL_STORAGE = "chemical_storage"


class ActionStatus(str, enum.Enum):
    """Corrective action status enumeration."""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    VERIFIED = "verified"


class NotificationStatus(str, enum.Enum):
    """Notification delivery status."""
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    ACKNOWLEDGED = "acknowledged"


class User(Base):
    """User model."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(Enum(UserRole), default=UserRole.VIEWER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    assigned_incidents = relationship("Incident", back_populates="assigned_to_user", foreign_keys="Incident.assigned_to_id")
    assigned_actions = relationship("CorrectiveAction", back_populates="assigned_to_user")
    created_hazards = relationship(
        "HazardReport",
        back_populates="reporter",
        foreign_keys="HazardReport.reporter_id",
    )


class Camera(Base):
    """Camera model."""
    __tablename__ = "cameras"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255))
    source_type = Column(String(50), nullable=False)  # usb, rtsp, upload
    source_config = Column(JSON)  # Store connection details (without passwords in plain text)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    is_enabled = Column(Boolean, default=True)
    is_connected = Column(Boolean, default=False)
    last_connected_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    zone = relationship("Zone", back_populates="cameras")
    incidents = relationship("Incident", back_populates="camera")


class Zone(Base):
    """Factory zone model."""
    __tablename__ = "zones"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    zone_type = Column(Enum(ZoneType), nullable=False)
    description = Column(Text)
    polygon_coordinates = Column(JSON)  # Store polygon points as JSON array
    floor_plan_id = Column(Integer, nullable=True)  # Reference to floor plan if applicable
    risk_level = Column(String(50), default="low")
    
    # Safety rules configuration
    require_helmet = Column(Boolean, default=False)
    require_vest = Column(Boolean, default=False)
    restricted_access = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cameras = relationship("Camera", back_populates="zone")
    incidents = relationship("Incident", back_populates="zone")
    hazard_reports = relationship("HazardReport", back_populates="zone")


class Incident(Base):
    """Incident model."""
    __tablename__ = "incidents"
    
    id = Column(Integer, primary_key=True, index=True)
    incident_type = Column(Enum(IncidentType), nullable=False)
    severity = Column(Enum(IncidentSeverity), nullable=False)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.NEW, nullable=False)
    
    title = Column(String(500))
    description = Column(Text)
    
    # Location information
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    
    # Detection metadata
    detection_confidence = Column(Float, nullable=True)  # AI confidence score
    detection_metadata = Column(JSON, nullable=True)  # Additional detection data
    evidence_path = Column(String(500), nullable=True)  # Path to evidence image/video
    
    # Assignment and resolution
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text)
    
    # Risk evaluation
    risk_score = Column(Float, default=0.0)
    risk_factors = Column(JSON, nullable=True)  # Store factors that contributed to risk score
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    camera = relationship("Camera", back_populates="incidents")
    zone = relationship("Zone", back_populates="incidents")
    assigned_to_user = relationship("User", back_populates="assigned_incidents", foreign_keys=[assigned_to_id])
    status_history = relationship("IncidentStatusHistory", back_populates="incident", cascade="all, delete-orphan")
    corrective_actions = relationship("CorrectiveAction", back_populates="incident")
    notifications = relationship("Notification", back_populates="incident")


class IncidentStatusHistory(Base):
    """Incident status change history."""
    __tablename__ = "incident_status_history"
    
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    previous_status = Column(Enum(IncidentStatus), nullable=True)
    new_status = Column(Enum(IncidentStatus), nullable=False)
    changed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    incident = relationship("Incident", back_populates="status_history")


class HazardReport(Base):
    """Worker-submitted hazard report."""
    __tablename__ = "hazard_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    hazard_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(255))
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    priority = Column(String(50), default="medium")
    
    # Reporter information (optional for anonymous reports)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reporter_contact = Column(String(255))
    
    # Status and resolution
    status = Column(String(50), default="open")
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text)
    
    # Evidence
    photo_path = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    zone = relationship("Zone", back_populates="hazard_reports")
    reporter = relationship("User", back_populates="created_hazards", foreign_keys=[reporter_id])
    corrective_actions = relationship("CorrectiveAction", back_populates="hazard_report")


class CorrectiveAction(Base):
    """Corrective action model."""
    __tablename__ = "corrective_actions"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Related incident or hazard
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    hazard_report_id = Column(Integer, ForeignKey("hazard_reports.id"), nullable=True)
    
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(50), default="medium")
    
    # Assignment
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    due_date = Column(DateTime, nullable=True)
    
    # Status and completion
    status = Column(Enum(ActionStatus), default=ActionStatus.OPEN, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    completion_notes = Column(Text)
    evidence_path = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    incident = relationship("Incident", back_populates="corrective_actions")
    hazard_report = relationship("HazardReport", back_populates="corrective_actions")
    assigned_to_user = relationship("User", back_populates="assigned_actions")


class Notification(Base):
    """Notification model."""
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    
    notification_type = Column(String(100), nullable=False)  # incident, hazard, action_due, etc.
    
    # Related entities
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    title = Column(String(500), nullable=False)
    message = Column(Text, nullable=False)
    
    # Delivery
    channel = Column(String(50), nullable=False)  # in_app, email, teams, mqtt
    recipient = Column(String(255))  # Email, Teams webhook, etc.
    status = Column(Enum(NotificationStatus), default=NotificationStatus.PENDING)
    
    sent_at = Column(DateTime, nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    incident = relationship("Incident", back_populates="notifications")


class VisionEvent(Base):
    """Vision detection event from AI service."""
    __tablename__ = "vision_events"
    
    id = Column(Integer, primary_key=True, index=True)
    
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False)
    event_type = Column(String(100), nullable=False)  # person_detected, zone_violation, ppe_missing
    
    detection_data = Column(JSON, nullable=False)  # Bounding boxes, classes, confidence scores
    frame_timestamp = Column(DateTime, nullable=False)
    
    # Incident creation
    incident_created = Column(Boolean, default=False)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class Report(Base):
    """Generated safety report."""
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    
    report_type = Column(String(100), nullable=False)  # daily, weekly, monthly, custom
    title = Column(String(500), nullable=False)
    
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    summary = Column(JSON)  # Store report metrics and summary data
    generated_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    file_path = Column(String(500), nullable=True)  # Path to PDF/CSV export
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class AuditLog(Base):
    """Audit log for sensitive operations."""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(255), nullable=False)
    entity_type = Column(String(100))  # incident, camera, zone, etc.
    entity_id = Column(Integer, nullable=True)
    
    details = Column(JSON)
    ip_address = Column(String(50))
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
