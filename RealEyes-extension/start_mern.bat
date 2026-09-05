@echo off
echo ========================================
echo  DeepGuard - Starting MERN Website
echo ========================================
echo.

echo Starting Node.js Backend API (Port 5000)...
start cmd /k "cd api && npm install && npm run dev"

echo Starting React Frontend Website...
start cmd /k "cd web && npm install && npm run dev"

echo.
echo Both servers are starting up in separate windows!
echo Your React Website will be available at http://localhost:5173
echo.
pause
