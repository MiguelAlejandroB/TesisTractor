from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from app.config import DATABASE_URL

# Crea el "motor" que hablará con la base de datos Postgres
# 'pool_pre_ping=True' ayuda a manejar conexiones inactivas
engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=True
)

# Crea una fábrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para todos nuestros modelos (tablas)
Base = declarative_base()

def get_db():
    """
    Función de dependencia de FastAPI para inyectar la sesión 
    de la base de datos en las rutas de la API.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()