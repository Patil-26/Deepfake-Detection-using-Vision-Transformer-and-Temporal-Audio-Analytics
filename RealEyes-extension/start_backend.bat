@echo off
echo ========================================
echo  DeepGuard - Starting AI Backend
echo ========================================
echo.

cd /d "%~dp0backend"

:: Check if virtual environment exists
if not exist "venv" (
    echo Creating Python virtual environment...
    py -3.11 -m venv venv
    echo.
)

:: Activate venv
call venv\Scripts\activate.bat

:: Check if packages installed
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo Installing Python dependencies first time, may take a few minutes...
    echo.
    pip install -r requirements.txt
    echo.
    echo.
    echo Installing PyTorch with CUDA support for your NVIDIA GPU...
    pip install --default-timeout=1000 torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
    echo.
)

echo Checking GPU availability...
python -c "import torch; print('GPU Available:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU only')"
echo.

echo Starting FastAPI server at http://localhost:8000
echo Swagger UI at http://localhost:8000/docs
echo.
echo NOTE: First run will download AI models (~1GB). Please wait...
echo.

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
