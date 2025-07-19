@echo off
echo ========================================
echo  Starting Domy v Italii Admin Dashboard
echo ========================================
echo.

echo [1/3] Killing any existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo [2/3] Starting Backend API Server...
start "Backend API" cmd /k "cd backend && node test-server.js"

echo [3/3] Starting Frontend Dashboard...
timeout /t 3 >nul
start "Frontend Dashboard" cmd /k "cd admin-dashboard && npm run dev"

echo.
echo ========================================
echo  Dashboard is starting up!
echo ========================================
echo.
echo Backend API:      http://localhost:3001
echo Frontend Dashboard: http://localhost:5173
echo.
echo Login credentials:
echo Email: admin@example.com
echo Password: password
echo.
echo Press any key to close this window...
pause >nul 