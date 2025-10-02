# Use a slim Python base image
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Install build dependencies for llama-cpp-python and OpenBLAS
RUN apt-get update && apt-get install -y --no-install-recommends     build-essential     libopenblas-dev     pkg-config     && rm -rf /var/lib/apt/lists/*

# Set environment variables for optimized compilation
# This is the critical step from the plan
ENV FORCE_CMAKE=1
ENV CMAKE_ARGS="-DGGML_BLAS=ON -DGGML_BLAS_VENDOR=OpenBLAS"

# Copy requirements and install Python packages
# This leverages Docker layer caching
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip &&     pip install --no-cache-dir -r requirements.txt

# Copy the application code into the container
COPY ./app /app/app

# Expose the port FastAPI will run on
EXPOSE 8000

# The command to run the API server will be in docker-compose.yml
