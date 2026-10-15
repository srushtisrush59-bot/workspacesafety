# Workplace Safety Sentinel

**AI-Powered Industrial Safety Monitoring and Risk Prevention Platform**

A comprehensive full-stack web application for monitoring workplace safety in factories, warehouses, and industrial environments. Built for the Microsoft Hackathon with CraftifAI PipeGen integration support.

---

## 🎯 Features

### Core Functionality
- **Real-Time Dashboard** - Live safety metrics, incident trends, and compliance monitoring
- **Incident Management** - Track, acknowledge, assign, and resolve safety incidents
- **Live Camera Monitoring** - Multi-camera surveillance with AI detection visualization
- **Hazard Reporting** - Mobile-friendly worker hazard submission system
- **Corrective Action Tracking** - Manage and monitor corrective actions with due dates
- **Factory Zone Mapping** - Interactive floor plan with zone-based safety rules
- **Risk Intelligence** - AI-powered risk assessment and zone analysis
- **Emergency Response Center** - Critical incident monitoring with emergency procedures
- **Analytics & Reporting** - Comprehensive safety performance analytics
- **Notification System** - In-app and external notification support

### Technical Capabilities
- **Professional UI/UX** - Modern dark theme designed for industrial control rooms
- **REST API** - Comprehensive FastAPI backend with full CRUD operations
- **Database** - SQLite for development, PostgreSQL-ready for production
- **Real-Time Updates** - Dashboard and monitoring with automatic refresh
- **Role-Based Access** - Admin, Safety Officer, Maintenance Staff, and Viewer roles
- **Vision AI Integration** - Modular architecture for CraftifAI PipeGen and DeepStream

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Recharts for data visualization
- Axios for API communication
- React Router for navigation
- Lucide React for icons

**Backend:**
- Python 3.9+
- FastAPI for REST API
- SQLAlchemy for database ORM
- Pydantic for validation
- Uvicorn as ASGI server

**Database:**
- SQLite (development)
- PostgreSQL-compatible (production)

**AI Vision (Optional Integration):**
- CraftifAI PipeGen
- NVIDIA DeepStream
- TensorRT for inference
- MQTT for event publishing

---

## 📦 Installation

### Prerequisites

- **Python 3.9 or higher**
- **Node.js 18 or higher**
- **npm or yarn**
- **Git**

### 1. Clone the Repository

```powershell
git clone <repository-url>
cd "microsoft hack"
```

### 2. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt

# Create .env file from example
Copy-Item ..\.env.example .env

# (Optional) Edit .env file with your configuration
notepad .env
```

### 3. Frontend Setup

```powershell
# Navigate to frontend directory (from project root)
cd frontend

# Install Node dependencies
npm install

# (Optional) Create environment file
# Create a .env file if you need to customize the API URL
# echo "VITE_API_URL=http://localhost:8000" > .env
```

---

## 🚀 Running the Application

### Start the Backend

```powershell
# From the backend directory with venv activated
cd backend
.\venv\Scripts\Activate.ps1
python run.py
```

The backend will:
1. Initialize the SQLite database
2. Create all tables
3. Seed demo data (users, zones, cameras, incidents)
4. Start the FastAPI server on `http://localhost:8000`

**API Documentation:** `http://localhost:8000/docs`

### Start the Frontend

```powershell
# In a new terminal, from the frontend directory
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Access the Application

1. Open your browser to `http://localhost:5173`
2. The application will automatically connect to the backend API
3. Browse the dashboard and features

---

## 👥 Demo Credentials

The seeded database includes the following demo users:

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| Admin | `admin` | `admin123` | Full system access |
| Safety Officer | `sarah.chen` | `safety123` | Incident management |
| Maintenance Staff | `mike.torres` | `maint123` | Action completion |
| Viewer | `viewer` | `view123` | Read-only access |

**Note:** All demo incidents are clearly labeled with `[DEMO]` prefix.

---

## 📊 Application Pages

### 1. Dashboard
- **Real-time safety metrics** (cameras, incidents, people detected)
- **Incident trend charts** (7-day timeline)
- **Severity and type breakdowns** (pie and bar charts)
- **Recent incidents list** with quick access
- **Critical alerts** for immediate attention

### 2. Incidents
- **Comprehensive incident list** with filtering
- **Search by title, description, or zone**
- **Filter by severity, status, and type**
- **Incident details** with timeline and assignments
- **Acknowledge, assign, and resolve** workflows

### 3. Live Monitoring
- **Camera selection** and status display
- **Live video feed** (requires vision service integration)
- **Detection overlay** for person tracking and violations
- **Real-time detection counts** (people, zone violations, PPE)

### 4. Hazard Reports
- **Worker hazard submission form** (mobile-friendly)
- **Hazard type selection** (slippery floor, exposed wiring, etc.)
- **Priority assignment** (low, medium, high, critical)
- **Optional anonymous reporting**
- **Assignment and resolution tracking**

### 5. Corrective Actions
- **Action tracking by status** (open, in progress, completed)
- **Overdue action alerts** with visual indicators
- **Assignment to maintenance staff**
- **Linked to incidents and hazards**
- **Due date management**

### 6. Zone Map
- **Factory floor plan visualization** (placeholder for image upload)
- **Interactive zone selection**
- **Zone safety rules** (helmet, vest, restricted access)
- **Incident and hazard counts per zone**
- **Risk level indicators**

### 7. Risk Intelligence
- **Zone-based risk scoring** (configurable algorithm)
- **Top risk zones** with detailed metrics
- **Incident and hazard aggregation**
- **Risk trend analysis**
- **Recommended preventive actions**

### 8. Analytics
- **Comprehensive performance metrics**
- **Average resolution and acknowledgment times**
- **Action completion rates**
- **Incident distribution charts** (severity, type, zone)
- **Export capabilities** (CSV, PDF ready)

### 9. Emergency Response Center
- **Active critical incidents** with auto-refresh
- **Emergency procedures** by incident type
- **Emergency contact directory**
- **Quick response actions**
- **Real-time alert notifications**

### 10. Cameras
- **Camera inventory** with connection status
- **Camera configuration** (RTSP, USB, upload)
- **Zone assignment**
- **Connection health monitoring**

---

## 🔌 AI Vision Integration

### CraftifAI PipeGen Integration

The application supports integration with CraftifAI PipeGen for real AI vision processing:

#### Required Components:
1. **PipeGen IR** - Define vision pipeline requirements
2. **Model Selection** - Person detection (+ optional PPE detection)
3. **TensorRT Compilation** - Optimize model for NVIDIA GPU
4. **DeepStream Pipeline** - Process video streams
5. **Event Publishing** - Send detection events to the backend via JSON or MQTT

#### Integration Steps:

**1. Configure Environment Variables**
```env
VISION_SERVICE_ENABLED=true
VISION_SERVICE_URL=http://localhost:8001
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_TOPIC_DETECTIONS=safety/detections
```

**2. Implement Vision Adapter**
Create a vision service that:
- Connects to RTSP camera streams
- Runs DeepStream pipeline with TensorRT engine
- Detects persons and tracks them
- Evaluates configured zone boundaries
- Publishes detection events to the backend
- Includes metadata: camera_id, zone_id, detection_boxes, confidence, timestamp

**3. Backend Event Handling**
The backend includes a `/api/vision/events` endpoint ready to receive:
```json
{
  "camera_id": 1,
  "event_type": "zone_violation",
  "detection_data": {
    "person_id": "track_001",
    "bbox": [120, 150, 180, 280],
    "confidence": 0.94,
    "zone_id": 3
  },
  "frame_timestamp": "2024-01-15T10:30:00Z"
}
```

**4. Incident Creation**
Events automatically create incidents based on:
- Restricted zone violations
- PPE compliance (if model supports it)
- Configurable risk rules

---

## 🔧 Configuration

### Backend Configuration (.env)

```env
# Database
DATABASE_URL=sqlite:///./workplace_safety.db

# API
API_HOST=0.0.0.0
API_PORT=8000

# Security
SECRET_KEY=your-secret-key-change-in-production

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Vision Service
VISION_SERVICE_ENABLED=false
VISION_SERVICE_URL=http://localhost:8001

# Notifications
NOTIFICATIONS_ENABLED=true
TEAMS_WEBHOOK_ENABLED=false
SMTP_ENABLED=false

# Microsoft Entra ID (optional)
ENTRA_ID_ENABLED=false

# Azure Services (optional)
AZURE_STORAGE_ENABLED=false
AZURE_INSIGHTS_ENABLED=false
```

### Frontend Configuration

Create `frontend/.env` if needed:
```env
VITE_API_URL=http://localhost:8000
```

---

## 📡 API Endpoints

### Health & Dashboard
- `GET /api/health` - Health check
- `GET /api/dashboard/summary` - Dashboard metrics
- `GET /api/dashboard/trends` - Incident trends
- `GET /api/dashboard/recent-incidents` - Recent incidents

### Incidents
- `GET /api/incidents` - List incidents (with filters)
- `POST /api/incidents` - Create incident
- `GET /api/incidents/{id}` - Get incident details
- `PATCH /api/incidents/{id}` - Update incident
- `POST /api/incidents/{id}/acknowledge` - Acknowledge
- `POST /api/incidents/{id}/assign` - Assign to user
- `POST /api/incidents/{id}/resolve` - Resolve incident

### Cameras
- `GET /api/cameras` - List cameras
- `POST /api/cameras` - Create camera
- `PATCH /api/cameras/{id}` - Update camera

### Zones
- `GET /api/zones` - List zones
- `POST /api/zones` - Create zone
- `PATCH /api/zones/{id}` - Update zone

### Hazard Reports
- `GET /api/hazards` - List hazard reports
- `POST /api/hazards` - Submit hazard report
- `PATCH /api/hazards/{id}` - Update hazard

### Corrective Actions
- `GET /api/actions` - List corrective actions
- `POST /api/actions` - Create action
- `PATCH /api/actions/{id}` - Update action

### Analytics
- `GET /api/analytics/summary` - Analytics summary
- `GET /api/analytics/trends` - Trend analysis
- `GET /api/analytics/zone-risk` - Zone risk analysis

Full API documentation: `http://localhost:8000/docs`

---

## 🧪 Testing

### Backend Tests
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pytest
```

### Manual Testing Workflow

1. **View Dashboard** - Verify metrics load correctly
2. **Create Incident** - Use the "Report Incident" button
3. **Create Hazard** - Submit a hazard report as a worker
4. **Assign Action** - Create and assign a corrective action
5. **Monitor Live Feed** - Select a camera (shows placeholder without vision service)
6. **Check Analytics** - View charts and performance metrics
7. **View Risk Intelligence** - Check zone risk scores
8. **Emergency Response** - View critical incidents (if any exist)

---

## 🚀 Production Deployment

### Render - Backend API

Create a Render Blueprint from this repository using `render.yaml`. It provisions the FastAPI API and a PostgreSQL database. The free database is intended for demos and may have provider-specific limits; check Render's current plan details before relying on it for production data.

After Render deploys, copy the API service URL (for example, `https://workspacesafety-api.onrender.com`). In Vercel, open the frontend project's **Settings → Environment Variables**, add `VITE_API_URL` with that API URL for Production, then redeploy the frontend. The Render service's `CORS_ORIGINS` is set to the current Vercel deployment URL; update it if the frontend domain changes.

### Azure Deployment (Recommended)

#### Backend - Azure Container Apps or App Service
```powershell
# Build and push container
docker build -t workplace-safety-backend ./backend
docker tag workplace-safety-backend <your-registry>.azurecr.io/safety-backend
docker push <your-registry>.azurecr.io/safety-backend

# Deploy to Azure Container Apps
az containerapp create --name safety-backend \
  --resource-group <resource-group> \
  --image <your-registry>.azurecr.io/safety-backend \
  --environment <environment>
```

#### Frontend - Azure Static Web Apps
```powershell
# Build frontend
cd frontend
npm run build

# Deploy to Azure Static Web Apps
# Use Azure Portal or GitHub Actions
```

#### Database - Azure Database for PostgreSQL
Update `.env`:
```env
DATABASE_URL=postgresql://user:password@server.postgres.database.azure.com:5432/workplace_safety
```

---

## 📖 Project Structure

```
workplace-safety-sentinel/
├── backend/
│   ├── app/
│   │   ├── api/           # API route handlers
│   │   ├── database/      # Models and database setup
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── config.py      # Configuration management
│   │   └── main.py        # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── run.py            # Application runner with DB init
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── layouts/      # Layout components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   ├── types/        # TypeScript type definitions
│   │   ├── utils/        # Utility functions
│   │   ├── App.tsx       # Main application component
│   │   └── main.tsx      # Application entry point
│   ├── package.json      # Node dependencies
│   └── vite.config.ts    # Vite configuration
├── .env.example          # Environment template
├── .gitignore
└── README.md
```

---

## 🔐 Security Notes

### Development vs. Production

**Development Mode:**
- Uses SQLite database
- Demo credentials enabled
- Simplified authentication
- CORS enabled for localhost

**Production Requirements:**
- Change `SECRET_KEY` in `.env`
- Use PostgreSQL database
- Implement Microsoft Entra ID authentication
- Configure proper CORS origins
- Enable HTTPS/TLS
- Use Azure Key Vault for secrets
- Implement rate limiting
- Enable audit logging

### Camera Security
- Never expose RTSP credentials in API responses
- Store camera passwords in Azure Key Vault
- Use environment variables for secrets
- Validate all camera configurations

### Data Privacy
- No facial recognition or biometric identification
- Worker hazard reports support anonymous submission
- Evidence retention policies configurable
- GDPR-compliant data handling

---

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Check database
# Delete workplace_safety.db and restart to recreate
```

### Frontend won't connect to backend
```powershell
# Verify backend is running
# Check http://localhost:8000/api/health

# Check CORS configuration in backend/.env
CORS_ORIGINS=http://localhost:5173

# Restart both frontend and backend
```

### No demo data appearing
```powershell
# Delete database and restart backend
Remove-Item backend\workplace_safety.db
cd backend
python run.py
```

### Port already in use
```powershell
# Backend (port 8000)
netstat -ano | findstr :8000
# Kill the process or change API_PORT in .env

# Frontend (port 5173)
# Vite will automatically use next available port
```

---

## 📝 License

This project was created for the Microsoft Hackathon.

---

## 🙏 Acknowledgments

- **Microsoft** - For hosting the hackathon
- **CraftifAI** - For PipeGen AI vision tooling
- **NVIDIA** - For DeepStream and TensorRT
- **FastAPI** - For the excellent Python web framework
- **React Team** - For the React library
- **Tailwind CSS** - For the utility-first CSS framework

---

## 📧 Support

For questions or issues:
1. Check the troubleshooting section above
2. Review the API documentation at `/docs`
3. Verify environment configuration in `.env`

---

## 🎉 Getting Started Checklist

- [ ] Install Python 3.9+ and Node.js 18+
- [ ] Clone the repository
- [ ] Set up Python virtual environment
- [ ] Install backend dependencies
- [ ] Install frontend dependencies
- [ ] Create and configure `.env` file
- [ ] Start the backend server
- [ ] Start the frontend development server
- [ ] Open browser to `http://localhost:5173`
- [ ] Log in with demo credentials (admin/admin123)
- [ ] Explore the dashboard and features
- [ ] Test incident creation and management
- [ ] Review the API documentation
- [ ] (Optional) Integrate with CraftifAI PipeGen

---

**Built with ❤️ for safer industrial workplaces**
