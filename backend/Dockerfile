# 1. Usar una imagen base oficial de Python
FROM python:3.11-slim

# 2. Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Instalaciones del sistema (si son necesarias)
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# 4. Optimización: Copiar e instalar las dependencias primero
COPY requirements.txt .

# 🚨 FIX: Desinstalar cualquier versión 'dspy' conflictiva
RUN pip uninstall -y dspy || true

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Verificación (Opcional pero recomendado)
RUN pip show dspy-ai

# 5. Copiar todo el código del proyecto al contenedor
# (Copia todo lo que esté en 'backend/' al '/app' del contenedor)
COPY . .

# 6. Exponer el puerto que usará la API
EXPOSE 8000

# 7. El comando para iniciar la API
# ¡Corregido! Apunta a app/main.py -> variable app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
