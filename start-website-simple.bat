@echo off
echo Starting simple website server...
echo.
echo Opening http://localhost:3000 in 3 seconds...
echo Press Ctrl+C to stop the server
echo.

timeout /t 3 >nul
start http://localhost:3000

REM Try Python first
python -m http.server 3000 2>nul || python3 -m http.server 3000 