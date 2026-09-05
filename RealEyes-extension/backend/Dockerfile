# Use official slim Python base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Set working directory
WORKDIR /app

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies (CPU-only PyTorch to minimize image size and prevent memory OOM on build)
RUN pip install --no-cache-dir --upgrade pip setuptools \
    && pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY . .

# Expose port
EXPOSE 8000

# Start FastAPI server using uvicorn
CMD exec uvicorn main:app --host 0.0.0.0 --port $PORT
