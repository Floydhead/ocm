# backend/Dockerfile
# -------------------------------------------------------
# 1. Base image
FROM python:3.11-slim

# 2. Install uv
RUN pip install uv

# 3. Make /app the working directory inside the container
WORKDIR /app

# 4. Install the Python dependencies using uv
COPY requirements.txt .
RUN uv pip install --system --no-cache-dir -r requirements.txt

# 5. Copy the application code
COPY backend/app ./app

# 6. Default command – uvicorn will be overridden by compose
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]