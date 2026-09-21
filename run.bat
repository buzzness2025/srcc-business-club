@echo off
echo ===================================================
echo   Starting SRCC Business Club Web Application
echo ===================================================

start "SRCC Backend Server (Port 5000)" cmd /k "cd server && npm start"
start "SRCC Frontend Client (Port 5173)" cmd /k "cd client && npm run dev"

echo.
echo Both Server and Client are starting!
echo Frontend will be available at: http://localhost:5173
echo Backend API will be available at: http://localhost:5000/api/members
echo ===================================================
