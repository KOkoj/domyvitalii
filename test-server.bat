@echo off
echo ========================================
echo  Testing Website Server Setup
echo ========================================
echo.

echo Checking what's available on your system:
echo.

echo [1] Checking for Node.js and npm...
where node >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Node.js found
    node --version
) else (
    echo ❌ Node.js NOT found
)

where npm >nul 2>&1
if %errorlevel%==0 (
    echo ✅ npm found
    npm --version
) else (
    echo ❌ npm NOT found
)

echo.
echo [2] Checking for HTTP servers...
where http-server >nul 2>&1
if %errorlevel%==0 (
    echo ✅ http-server found
) else (
    echo ❌ http-server NOT found
)

where live-server >nul 2>&1
if %errorlevel%==0 (
    echo ✅ live-server found
) else (
    echo ❌ live-server NOT found
)

echo.
echo [3] Checking for Python...
where python >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Python found
    python --version
) else (
    echo ❌ Python NOT found
)

where python3 >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Python3 found
    python3 --version
) else (
    echo ❌ Python3 NOT found
)

echo.
echo [4] Checking node_modules folder...
if exist node_modules (
    echo ✅ node_modules folder exists
) else (
    echo ❌ node_modules folder NOT found
)

echo.
echo [5] Let's try starting a simple Python server manually...
echo Starting Python HTTP server on port 3000...
echo Press Ctrl+C to stop the server when you're done testing
echo.

where python >nul 2>&1
if %errorlevel%==0 (
    echo Starting: python -m http.server 3000
    python -m http.server 3000
) else (
    where python3 >nul 2>&1
    if %errorlevel%==0 (
        echo Starting: python3 -m http.server 3000
        python3 -m http.server 3000
    ) else (
        echo ❌ No Python found - cannot start test server
        echo.
        echo SOLUTION: Install Node.js from https://nodejs.org/
        echo Then run this test again
    )
)

echo.
echo ========================================
echo Press any key to close...
pause >nul 