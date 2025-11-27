import os
from dotenv import load_dotenv

# Carga las variables de entorno del archivo .env
# (que está en la carpeta 'backend/')
load_dotenv()

# Lee la URL de la base de datos pasada por docker-compose
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("No se encontró la variable de entorno DATABASE_URL")

# Lee tus claves de API
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Esto hace que nuestro scraper parezca un navegador real
BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
}