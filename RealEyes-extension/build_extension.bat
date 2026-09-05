@echo off
echo ========================================
echo  DeepGuard - Building Chrome Extension
echo ========================================
echo.

cd /d "%~dp0extension"

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    npm install
    echo.
)

echo Building extension...
npm run build

if errorlevel 0 (
    echo.
    echo ========================================
    echo  Build successful!
    echo ========================================
    echo.
    echo To load in Chrome:
    echo  1. Open chrome://extensions/
    echo  2. Enable "Developer mode" (top right)
    echo  3. Click "Load unpacked"
    echo  4. Select: %~dp0extension\dist
    echo.
) else (
    echo Build failed. Check errors above.
)

pause
