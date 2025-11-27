from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Tractor
from app.agents.writer_agent import WriterAgent
import os

router = APIRouter()

# Instanciamos el agente
writer_agent = WriterAgent()

@router.get("/generate-pdf/{model_name}")
async def generate_pdf_route(
    model_name: str, 
    db: Session = Depends(get_db)
):
    """
    Genera y devuelve un reporte en PDF para un modelo de tractor específico.
    """
    
    # 1. Consultar la TractorDB en Postgres
    print(f"Ruta PDF: Buscando tractor '{model_name}' en la BD...")
    tractor = db.query(Tractor).filter(Tractor.model == model_name).first()
    
    # 2. Si no lo encuentra, devolver un 404
    if not tractor:
        print(f"Ruta PDF: Tractor '{model_name}' no encontrado.")
        raise HTTPException(status_code=404, detail="Tractor no encontrado en la base de datos")
        
    # 3. Llamar al WriterAgent.run()
    pdf_path = writer_agent.run(tractor)
    
    if not pdf_path:
        raise HTTPException(status_code=500, detail="Error al generar el archivo PDF en el servidor")

    # 4. Devolver el PDF generado usando FileResponse
    
    # Creamos un nombre de archivo legible para la descarga
    filename = f"{tractor.company or 'Reporte'}_{tractor.model}.pdf".replace(" ", "_")
    
    print(f"Ruta PDF: Enviando archivo {pdf_path} como {filename}")
    
    return FileResponse(
        path=pdf_path,
        media_type='application/pdf',
        filename=filename,
        # Importante: Usamos una lambda en 'background' para eliminar 
        # el archivo temporal DESPUÉS de que se haya enviado al usuario.
        background=lambda: os.remove(pdf_path)
    )