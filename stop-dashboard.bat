@echo off
echo ========================================
echo  Stopping Domy v Italii Admin Dashboard
echo ========================================
echo.

echo Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Dashboard servers stopped!
echo.
echo Press any key to close this window...
pause >nul 