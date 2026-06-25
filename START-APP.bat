@echo off
title Like Your Food - App Launcher
color 0A
echo ====================================================
echo   LIKE YOUR FOOD - Starting Both Servers
echo ====================================================
echo.
echo [1/2] Starting Backend Server on PORT 5000...
start "BACKEND - Node Server (PORT 5000)" cmd /k "cd /d "%~dp0" && node server.js"
echo.
echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak >nul
echo.
echo [2/2] Starting Frontend Dev Server on PORT 5173...
start "FRONTEND - Vite Dev Server (PORT 5173)" cmd /k "cd /d "%~dp0" && npm run dev"
echo.
echo ====================================================
echo   Both servers started!
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo ====================================================
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:5173
echo Done! You can close this window.
pause
