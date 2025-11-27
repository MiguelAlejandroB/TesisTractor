from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.searcher import search_google_free

router = APIRouter()

class SearchRequest(BaseModel):
    query: str

class SearchResponse(BaseModel):
    url: str | None

@router.post("/search", response_model=SearchResponse)
async def search_url_route(request: SearchRequest):
    """
    Endpoint para buscar una URL relevante basada en una consulta.
    Usa un motor de búsqueda gratuito (DuckDuckGo).
    """
    url = search_google_free(request.query)
    
    if not url:
        # No lanzamos error 404 para no romper el flujo del chat,
        # simplemente devolvemos null.
        return {"url": None}
    
    return {"url": url}