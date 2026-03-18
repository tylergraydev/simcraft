FROM python:3.11-slim

WORKDIR /app

# Install build dependencies for simc
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libcurl4-openssl-dev \
    git \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# Build SimulationCraft from source
RUN git clone --depth 1 https://github.com/simulationcraft/simc.git /tmp/simc \
    && cd /tmp/simc/engine \
    && make -j$(nproc) OPENSSL=0 \
    && cp simc /usr/local/bin/simc \
    && rm -rf /tmp/simc

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
