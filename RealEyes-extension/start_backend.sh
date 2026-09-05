#!/bin/bash
echo "========================================"
echo " DeepGuard - Starting AI Backend on macOS"
echo "========================================"
echo

# Get the script's directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo
fi

# Activate venv
source venv/bin/activate

# Check if packages installed
python3 -c "import fastapi" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing Python dependencies for the first time, may take a few minutes..."
    echo
    pip install --upgrade pip setuptools
    pip install -r requirements.txt
    echo
    echo "Installing PyTorch optimized for macOS..."
    pip install torch torchvision torchaudio
    echo
fi

echo "Checking GPU availability..."
python3 -c "import torch; print('MPS GPU Available (Apple Silicon):', torch.backends.mps.is_available()); print('CUDA GPU Available:', torch.cuda.is_available())"
echo

echo "Starting FastAPI server at http://localhost:8000"
echo "Swagger UI at http://localhost:8000/docs"
echo
echo "NOTE: First run will download AI models (~1GB). Please wait..."
echo

python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
