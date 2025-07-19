# 🚀 Quick Start Guide - Domy v Italii Dashboard

## Starting the Dashboard (After PC Restart)

**Easy Method:**
1. Double-click `start-dashboard.bat` in the main project folder
2. Wait for both servers to start (about 10-15 seconds)
3. Open your browser and go to: http://localhost:5173

**Manual Method:**
1. Open 2 separate Command Prompt/PowerShell windows
2. In the first window:
   ```
   cd "C:\Users\matbo\Desktop\domy v italii 2\backend"
   node test-server.js
   ```
3. In the second window:
   ```
   cd "C:\Users\matbo\Desktop\domy v italii 2\admin-dashboard"
   npm run dev
   ```

## Stopping the Dashboard

**Easy Method:**
- Double-click `stop-dashboard.bat` in the main project folder

**Manual Method:**
- Press `Ctrl+C` in both command prompt windows

## Login Information

- **URL:** http://localhost:5173
- **Email:** admin@example.com
- **Password:** password

## Server Ports

- **Frontend (Dashboard):** http://localhost:5173
- **Backend (API):** http://localhost:3001

## Troubleshooting

### "Port already in use" error:
1. Run `stop-dashboard.bat` first
2. Wait 5 seconds
3. Run `start-dashboard.bat` again

### Dashboard pages not loading:
- Make sure both servers are running (you should see 2 command prompt windows)
- Check that backend API is responding: http://localhost:3001/health

### Translation Language:
- The dashboard is now fully translated to Czech for your team! 🇨🇿

---
Created: $(Get-Date -Format "dd.MM.yyyy HH:mm")
Version: 1.0 