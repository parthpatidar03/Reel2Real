@echo off
echo ========================================
echo Reel-to-Real: Clean Installation Script
echo ========================================
echo.

echo [1/4] Cleaning backend...
cd backend
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo Backend cleaned.
echo.

echo [2/4] Cleaning worker...
cd ..\worker
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo Worker cleaned.
echo.

echo [3/4] Cleaning frontend...
cd ..\frontend
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo Frontend cleaned.
echo.

echo [4/4] Installing all dependencies...
echo This may take 3-5 minutes...
echo.

echo Installing backend dependencies...
cd ..\backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
echo Backend installed successfully!
echo.

echo Installing worker dependencies...
cd ..\worker
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Worker installation failed!
    pause
    exit /b 1
)
echo Worker installed successfully!
echo.

echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
echo Frontend installed successfully!
echo.

echo ========================================
echo Installation Complete! ✓
echo ========================================
echo.
echo Next steps:
echo 1. Start MongoDB: mongod
echo 2. Start Redis: redis-server
echo 3. Run: npm run dev (in backend, worker, and frontend folders)
echo.
echo See docs/QUICK_START.md for detailed instructions.
echo.
pause
