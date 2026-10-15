# 🚀 Quick Start Guide - Workplace Safety Sentinel

Get the application running in under 5 minutes!

## Prerequisites Check

```powershell
# Check Python version (need 3.9+)
python --version

# Check Node.js version (need 18+)
node --version

# Check npm
npm --version
```

If any are missing, install them first:
- **Python**: https://www.python.org/downloads/
- **Node.js**: https://nodejs.org/

---

## Step 1: Setup Backend (2 minutes)

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies (this may take a minute)
pip install -r requirements.txt
```

---

## Step 2: Setup Frontend (2 minutes)

Open a **new PowerShell terminal** and run:

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

---

## Step 3: Start the Application (1 minute)

### Terminal 1 - Backend:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python run.py
```

Wait for:
```
✅ Backend Ready!
🌐 API Server: http://0.0.0.0:8000
```

### Terminal 2 - Frontend:
```powershell
cd frontend
npm run dev
```

Wait for:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## Step 4: Access the Application

1. Open your browser to: **http://localhost:5173**
2. You'll see the Workplace Safety Sentinel dashboard
3. Login with demo credentials:
   - **Username:** `admin`
   - **Password:** `admin123`

---

## 🎯 Quick Demo Tour

### 1. Dashboard (Default Page)
- See real-time safety metrics
- View incident trends and charts
- Check recent incidents

### 2. Incidents (Left Sidebar)
- Browse all demo incidents (marked with [DEMO])
- Filter by severity and status
- See incident details

### 3. Live Monitoring
- View available cameras
- See connection status
- (Placeholder for actual video feed - requires vision service)

### 4. Hazard Reports
- Click "Report Hazard" to submit a new report
- Fill out the mobile-friendly form
- See all hazard reports

### 5. Corrective Actions
- View all corrective actions
- See overdue actions highlighted in red
- Track completion status

### 6. Analytics
- View comprehensive charts
- See performance metrics
- Analyze trends over time

### 7. Emergency Response Center
- Monitor critical incidents
- View emergency procedures
- Access emergency contacts

---

## 🔍 Verify Everything Works

✅ **Backend API:** http://localhost:8000/docs
- Should show interactive API documentation

✅ **Backend Health:** http://localhost:8000/api/health
- Should return `{"status":"healthy"}`

✅ **Frontend:** http://localhost:5173
- Should show the dashboard with charts and data

✅ **Demo Data:**
- 5 zones configured
- 4 cameras added
- 5 demo incidents
- 3 hazard reports
- 4 corrective actions
- 4 demo users

---

## 🛑 Stop the Application

Press `Ctrl+C` in both terminal windows.

---

## 🐛 Common Issues

### "pip is not recognized"
```powershell
python -m pip install -r requirements.txt
```

### "npm is not recognized"
Install Node.js from https://nodejs.org/

### Port 8000 already in use
```powershell
# Find and kill the process
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

### Port 5173 already in use
Vite will automatically use the next available port (5174, 5175, etc.)

### Backend won't start
```powershell
# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### No data showing
```powershell
# Delete the database and restart
Remove-Item workplace_safety.db
python run.py
```

---

## 📚 Next Steps

1. **Explore the API:** http://localhost:8000/docs
2. **Read the README:** See README.md for full documentation
3. **Integrate Vision AI:** Configure CraftifAI PipeGen for real detection
4. **Customize Settings:** Edit `.env` file for configuration
5. **Deploy to Azure:** Follow production deployment guide in README

---

## 📞 Need Help?

- Check README.md for detailed documentation
- Review API docs at /docs
- Check troubleshooting section in README

---

**Enjoy building safer workplaces! 🏭 🛡️**
