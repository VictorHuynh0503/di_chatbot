@echo off
REM ========================================
REM DI Chatbot - Start Frontend & Backend
REM ========================================

echo.
echo [*] Starting DI Chatbot Application...
echo.

REM ========================================
REM Setup and run BACKEND
REM ========================================
echo [1/4] Setting up backend virtual environment...
cd backend

if not exist venv (
    echo [*] Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment. Make sure Python is installed.
        pause
        exit /b 1
    )
)

echo [2/4] Activating virtual environment and installing dependencies...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERROR] Failed to activate virtual environment.
    pause
    exit /b 1
)

pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install Python dependencies.
    pause
    exit /b 1
)

echo [*] Backend setup complete!
cd ..

REM ========================================
REM Setup and run FRONTEND
REM ========================================
echo [3/4] Setting up frontend dependencies...
cd frontend

if not exist node_modules (
    echo [*] Installing npm packages...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install npm dependencies.
        cd ..
        pause
        exit /b 1
    )
)

echo [*] Frontend setup complete!
cd ..

echo [4/4] Launching services...
echo.
echo [*] Backend will start in 2 seconds...
echo [*] Frontend will start in a separate window...
echo.
timeout /t 2 /nobreak

REM Start backend in new window
cd backend
call venv\Scripts\activate.bat
start "DI Chatbot Backend" cmd /k "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
cd ..

REM Start frontend in new window
cd frontend
start "DI Chatbot Frontend" cmd /k "npm run dev"
cd ..

echo.
echo [SUCCESS] Both services are starting!
echo.
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend will be available at: http://localhost:5173
echo.
echo Press any key to exit this window (services will continue running)...
pause
