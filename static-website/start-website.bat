@echo off
echo ========================================
echo  Starting Domy v Italii Website
echo ========================================
echo.

echo [1/4] Installing dependencies if needed...
if not exist node_modules (
    echo Installing npm dependencies...
    call npm install
)

echo [2/4] Starting development server...

REM Try npm dev script first (uses live-server)
where npm >nul 2>&1
if %errorlevel%==0 (
    echo Using npm dev script with live-server...
    start "Website Server" cmd /k "npm run dev"
    goto :server_started
)

REM Try to use http-server if available
where http-server >nul 2>&1
if %errorlevel%==0 (
    echo Using http-server...
    start "Website Server" cmd /k "http-server -p 3000 -o"
    goto :server_started
)

REM Try to use live-server if available
where live-server >nul 2>&1
if %errorlevel%==0 (
    echo Using live-server...
    start "Website Server" cmd /k "live-server --port=3000"
    goto :server_started
)

REM Fallback to Python HTTP server
where python >nul 2>&1
if %errorlevel%==0 (
    echo Using Python HTTP server...
    start "Website Server" cmd /k "python -m http.server 3000"
    goto :server_started
)

REM Try Python3 if python command not found
where python3 >nul 2>&1
if %errorlevel%==0 (
    echo Using Python3 HTTP server...
    start "Website Server" cmd /k "python3 -m http.server 3000"
    goto :server_started
)

echo Error: No suitable HTTP server found!
echo Please install Node.js and npm, then run this script again.
echo Alternatively, install one of the following:
echo - Python: https://www.python.org/downloads/
pause
exit /b 1

:server_started
echo [3/4] Waiting for server to start...
timeout /t 3 >nul
echo [4/4] Opening website in browser...
start http://localhost:3000

echo.
echo ========================================
echo  Website is now running!
echo ========================================
echo.
echo Website URL:      http://localhost:3000
echo.
echo The website will automatically reload when you make changes
echo (if using live-server or similar tool with hot reload)
echo.
echo To stop the server, close the "Website Server" window
echo or press Ctrl+C in the server terminal
echo.
echo Press any key to close this window...
pause >nul 