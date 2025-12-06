# Stage 1: Build Frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
# Set API URL to relative path since we'll serve from same origin
ENV VITE_API_URL=/api
RUN npm run build

# Stage 2: Build Backend & Serve
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy frontend build to static folder
COPY --from=frontend-build /app/frontend/dist /app/static

# Create a directory for ChromaDB
RUN mkdir -p /app/chroma_db && chmod 777 /app/chroma_db

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
