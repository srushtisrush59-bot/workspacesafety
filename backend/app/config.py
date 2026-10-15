"""Application configuration."""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    app_name: str = "Workplace Safety Sentinel"
    app_version: str = "1.0.0"
    environment: str = "development"
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_reload: bool = True
    
    # Database
    database_url: str = "sqlite:///./workplace_safety.db"
    
    # Security
    secret_key: str = "dev-secret-key-change-in-production"
    access_token_expire_minutes: int = 1440
    algorithm: str = "HS256"
    
    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    
    # Vision Service
    vision_service_enabled: bool = False
    vision_service_url: str = "http://localhost:8001"
    mqtt_broker_url: str = ""
    mqtt_topic_detections: str = "safety/detections"
    
    # Camera Settings
    max_cameras: int = 10
    rtsp_timeout_seconds: int = 30
    
    # File Upload
    max_upload_size_mb: int = 100
    upload_dir: str = "./uploads"
    evidence_dir: str = "./evidence"
    allowed_video_formats: str = "mp4,avi,mov,mkv"
    
    # Notifications
    notifications_enabled: bool = True
    
    # Email (optional)
    smtp_enabled: bool = False
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    
    # Microsoft Teams (optional)
    teams_webhook_enabled: bool = False
    teams_webhook_url: str = ""
    
    # Microsoft Entra ID (optional)
    entra_id_enabled: bool = False
    entra_tenant_id: str = ""
    entra_client_id: str = ""
    entra_client_secret: str = ""
    
    # Azure Services (optional)
    azure_storage_enabled: bool = False
    azure_storage_connection_string: str = ""
    azure_storage_container: str = ""
    azure_insights_enabled: bool = False
    azure_insights_instrumentation_key: str = ""
    
    # Risk Intelligence
    risk_evaluation_enabled: bool = True
    critical_incident_threshold: int = 3
    high_risk_zone_threshold: int = 5
    
    # Incident Management
    auto_assign_incidents: bool = False
    incident_retention_days: int = 365
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def allowed_video_formats_list(self) -> List[str]:
        """Parse allowed video formats from comma-separated string."""
        return [fmt.strip() for fmt in self.allowed_video_formats.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
