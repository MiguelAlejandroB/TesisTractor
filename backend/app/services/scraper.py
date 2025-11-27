import httpx
from bs4 import BeautifulSoup
from app.config import BROWSER_HEADERS # Importamos los headers desde la config central

async def scrape_url(url: str) -> str | None:
    """
    Descarga el contenido de una URL y extrae todo el texto visible,
    eliminando etiquetas de navegación, scripts, y estilos.

    Args:
        url (str): La URL de la cual extraer el contenido.

    Returns:
        str | None: Un string con el texto limpio de la página, o None si falla.
    """
    print(f"Scraper Service: Iniciando scrapeo de {url[:70]}...")
    
    try:
        # Usamos un cliente asíncrono con timeout
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                url, 
                headers=BROWSER_HEADERS, 
                follow_redirects=True # Sigue redirecciones (ej. http a https)
            )
            
            # Lanza un error si la petición no fue exitosa (ej. 404, 500)
            response.raise_for_status()
        
        # 1. Parsear el HTML
        soup = BeautifulSoup(response.text, "html.parser")
        
        # 2. Eliminar etiquetas "ruidosas" (scripts, estilos, menús, etc.)
        tags_to_remove = ["script", "style", "nav", "footer", "header", "aside", "form"]
        for tag in soup.find_all(tags_to_remove):
            tag.decompose() # Elimina la etiqueta y su contenido
            
        # 3. Extraer el texto restante
        # Usamos 'separator=" "' para asegurar espacios entre párrafos
        # y 'strip=True' para limpiar espacios en blanco al inicio/final
        clean_text = soup.get_text(separator=" ", strip=True)
        
        if not clean_text:
            print(f"Scraper Service: La URL {url} no devolvió texto visible.")
            return None
            
        print(f"Scraper Service: Scrapeo exitoso. {len(clean_text)} caracteres extraídos.")
        return clean_text

    except httpx.HTTPStatusError as e:
        print(f"❌ Scraper Error (HTTP): No se pudo acceder a {url}. Status: {e.response.status_code}")
        return None
    except httpx.RequestError as e:
        print(f"❌ Scraper Error (Network): Problema de red al intentar acceder a {url}. Error: {e}")
        return None
    except Exception as e:
        print(f"❌ Scraper Error (Inesperado): Ocurrió un error al procesar {url}. Error: {e}")
        return None