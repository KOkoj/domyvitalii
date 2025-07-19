@echo off
echo ========================================
echo  Stopping Domy v Italii Website
echo ========================================
echo.

echo [1/2] Stopping HTTP server processes...

REM Kill Python HTTP servers
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Website Server*" >nul 2>&1
taskkill /F /IM python3.exe /FI "WINDOWTITLE eq Website Server*" >nul 2>&1

REM Kill Node.js servers (http-server, live-server)
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq node.exe" /FI "WINDOWTITLE eq Website Server*" /FO CSV ^| findstr /V "INFO:"') do (
    if not "%%i"=="" taskkill /F /PID %%i >nul 2>&1
)

echo [2/2] Closing any remaining server windows...
taskkill /F /FI "WINDOWTITLE eq Website Server*" >nul 2>&1

echo.
echo ========================================
echo  Website server stopped!
echo ========================================
echo.
echo All website development server processes have been terminated.
echo.
echo Press any key to close this window...
pause >nul 