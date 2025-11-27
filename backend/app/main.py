from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine, Base
from contextlib import asynccontextmanager
from sqlalchemy.exc import OperationalError
import time

# Importamos los modelos para asegurar que SQLAlchemy los "vea" antes de crear tablas
from app.database import models 

# Importa tus rutas
from app.api.routes import extraction, pdf, tractors, search, chat

def create_tables():
    """
    Intenta crear las tablas, reintentando si la DB no está lista.
    """
    max_retries = 10
    retries = 0
    while retries < max_retries:
        try:
            print(f"Intentando crear tablas en la base de datos (intento {retries + 1}/{max_retries})...")
            Base.metadata.create_all(bind=engine)
            print("✅ Tablas de la base de datos creadas (si no existían).")
            return
        except OperationalError as e:
            print(f"La base de datos no está lista (Error: {e}). Reintentando en 3 segundos...")
            time.sleep(3)
            retries += 1
        except Exception as e:
            print(f"❌ Error inesperado al crear tablas: {e}")
            time.sleep(3)
            retries += 1
    
    print(f"❌ No se pudieron crear las tablas después de {max_retries} intentos.")
    raise Exception("No se pudo conectar a la base de datos.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando aplicación...")
    create_tables()
    yield
    print("Apagando aplicación...")

# --- Inicialización de la App ---
app = FastAPI(
    title="Tractor Platform API",
    description="API para la extracción de datos de tractores y generación de reportes.",
    version="1.0.0",
    lifespan=lifespan
)

# --- CONFIGURACIÓN DE CORS ---
# Permite que el frontend (http://localhost:5173) se comunique con este backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# --- Rutas de la API ---
print("Incluyendo routers...")
app.include_router(extraction.router, prefix="/api/v1", tags=["Extracción"])
app.include_router(pdf.router, prefix="/api/v1", tags=["PDF"])
app.include_router(tractors.router, prefix="/api/v1", tags=["Tractores"])
app.include_router(search.router, prefix="/api/v1", tags=["Search"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat Conversacional"])
print("✅ Todos los routers incluidos.")

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Bienvenido a la API de Tractor Platform"}