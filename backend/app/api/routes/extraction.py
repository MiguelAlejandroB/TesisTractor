from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import inspect # Usaremos esto para una verificación de seguridad

# Importaciones de la base de datos
from app.database.connection import get_db
from app.database.models import Tractor # El modelo SQLAlchemy
from app.database.schemas import ExtractionRequest, ExtractionResponse # Los modelos Pydantic

# Importaciones de los servicios y agentes
from app.services.scraper import scrape_url
from app.agents.analyst_agent import AnalystAgent
from app.services.converter import get_canonical_values

# --- Inicialización ---
router = APIRouter()

# Creamos una única instancia del agente para reutilizar (carga el modelo de IA una sola vez)
try:
    analyst = AnalystAgent()
    print("Agente Analista cargado en la ruta de extracción.")
except Exception as e:
    print(f"ERROR CRÍTICO: No se pudo cargar el AnalystAgent: {e}")
    analyst = None

# --- Endpoint de Extracción ---

@router.post(
    "/extract", 
    response_model=ExtractionResponse,
    summary="Extrae una variable, la convierte y la guarda en la BD"
)
async def extract_and_store_variable(
    request: ExtractionRequest,
    db: Session = Depends(get_db)
):
    """
    Este endpoint orquesta el proceso completo:
    1. Scrapea la URL proporcionada.
    2. Usa el Agente Analista (DSPy/Groq) para extraer 1 variable (ej: "108.6 hp").
    3. Usa el Convertidor para obtener el valor numérico (ej: 81.0).
    4. Busca el tractor en la BD (o lo crea si no existe).
    5. Actualiza AMBAS columnas (la de String y la numérica) en la BD.
    """
    if not analyst:
        raise HTTPException(status_code=500, detail="El Agente Analista no está inicializado.")

    # 1. Llamar a scrape_url (de services.scraper)
    print(f"Iniciando scrapeo de: {request.source_url}")
    contexto = await scrape_url(request.source_url)
    if not contexto:
        raise HTTPException(status_code=404, detail="No se pudo scrapear el contenido de la URL.")

    # 2. Llamar al AnalystAgent.run()
    print(f"Llamando al Agente Analista para la variable: {request.variable_name}")
    valor_extraido_str = analyst.run(contexto, request.variable_name) # ej: "108.6 hp"

    if valor_extraido_str == "N/A":
        print("El agente no encontró la variable.")
        return ExtractionResponse(
            status="not_found",
            variable_name=request.variable_name,
            value=None
        )

    try:
        # 3. Buscar (query) en Tractor por tractor_model
        tractor = db.query(Tractor).filter(Tractor.model == request.tractor_model).first()

        # 4. Si no existe, crear un Tractor(model=..., company=...)
        if not tractor:
            print(f"Creando nueva entrada en la BD para el tractor: {request.tractor_model}")
            tractor = Tractor(
                model=request.tractor_model,
                company=request.company 
            )
            db.add(tractor)
            db.flush() # Importante para que 'tractor' tenga un ID antes del commit

        # 5. Guardar el valor String Original
        
        # Verificación de seguridad: ¿existe esta columna en el modelo Tractor?
        if not hasattr(Tractor, request.variable_name):
            print(f"Error: La variable '{request.variable_name}' no existe en el modelo 'Tractor'.")
            raise HTTPException(status_code=400, detail=f"Variable '{request.variable_name}' no válida.")
        
        print(f"Actualizando DB (String): {request.tractor_model} -> {request.variable_name} = '{valor_extraido_str}'")
        setattr(tractor, request.variable_name, valor_extraido_str)

        # 6. ¡NUEVA LÓGICA! Convertir y guardar el valor numérico
        col_name_num, num_value = get_canonical_values(request.variable_name, valor_extraido_str)
        
        if col_name_num and num_value is not None:
            # Segunda verificación de seguridad: ¿existe la columna numérica?
            if hasattr(Tractor, col_name_num):
                print(f"Actualizando DB (Numérico): {request.tractor_model} -> {col_name_num} = {num_value}")
                setattr(tractor, col_name_num, num_value)
            else:
                # Esto es un log para nosotros, por si olvidamos añadir una col_num en models.py
                print(f"ADVERTENCIA: El convertidor devolvió la columna '{col_name_num}' pero esta no existe en 'models.py'.")

        # 7. Hacer db.commit()
        db.commit()
        db.refresh(tractor) # Refresca el objeto con los datos de la BD

        # 8. Devolver el valor extraído
        return ExtractionResponse(
            status="success",
            variable_name=request.variable_name,
            value=valor_extraido_str
        )

    except Exception as e:
        db.rollback() # Revertir cambios si algo falla
        print(f"❌ Error al interactuar con la base de datos: {e}")
        raise HTTPException(status_code=500, detail=f"Error de base de datos: {e}")