@echo off
echo =========================================
echo Starting DemandSense Development Servers
echo =========================================

echo.
echo Starting FastAPI Backend...
start "DemandSense Backend" cmd /k "cd backend && echo Starting Backend... && uvicorn main:app --reload --host 0.0.0.0"

echo.
echo Starting Vite Frontend...
start "DemandSense Frontend" cmd /k "cd frontend && echo Starting Frontend... && npm run dev -- --host 0.0.0.0"

echo.
echo Both servers are starting in new command windows.
echo - Backend will run on http://0.0.0.0:8000
echo - Frontend will run on http://0.0.0.0:5173
echo.
echo You can close this window now.
pause
