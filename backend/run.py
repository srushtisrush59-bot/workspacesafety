"""Run the FastAPI application with database initialization and seeding."""
import uvicorn
import sys
from app.config import settings
from app.database.base import init_db, SessionLocal
from app.database.seed import seed_database


def initialize_and_seed():
    """Initialize database and seed with demo data."""
    print("\n" + "="*60)
    print("WORKPLACE SAFETY SENTINEL - Backend Initialization")
    print("="*60)
    
    # Initialize database tables
    print("\n📦 Initializing database...")
    init_db()
    print("✅ Database tables created")
    
    # Seed database
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        print(f"⚠️  Seeding error (may already be seeded): {e}")
    finally:
        db.close()
    
    print("\n" + "="*60)
    print("✅ Backend Ready!")
    print("="*60)
    print(f"\n🌐 API Server: http://{settings.api_host}:{settings.api_port}")
    print(f"📚 API Docs: http://{settings.api_host}:{settings.api_port}/docs")
    print(f"📊 Environment: {settings.environment}")
    print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    # Initialize and seed on startup
    initialize_and_seed()
    
    # Run the server
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload
    )
