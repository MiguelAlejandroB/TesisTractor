from duckduckgo_search import DDGS
import time
import random
import logging

# Configuración de logging para ver qué pasa en la terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SearchService")

# --- 🧠 BASE DE CONOCIMIENTO (Tus URLs Maestras) ---
# Aquí defines los tractores que YA conoces para evitar buscar en Google.
# ¡Esto es lo que hace que el sistema sea ultra-rápido y fiable!
KNOWN_TRACTOR_URLS = {
    # Formato: "modelo en minúsculas": "url exacta"
    "john deere 6r 110": "https://www.tractordata.com/farm-tractors/011/2/3/11237-john-deere-6r-110.html",
    "john deere 8r 370": "https://www.tractordata.com/farm-tractors/010/1/1-john-deere-8r-370.html",
    "fendt 1050 vario": "https://www.tractordata.com/farm-tractors/009/4/9/9499-fendt-1050-vario.html",
    "new holland t7.190": "https://www.tractordata.com/farm-tractors/009/3/0/9305-new-holland-t7-190.html",
    # ... ¡Añade aquí todos los tractores de tu lista de tesis! ...
}

def search_google_free(query: str, max_retries=3) -> str | None:
    """
    Busca en DuckDuckGo y devuelve la primera URL válida.
    PRIORIDAD 1: Revisa la lista KNOWN_TRACTOR_URLS.
    PRIORIDAD 2: Busca en internet filtrando basura (China, Redes Sociales, etc).
    """
    
    # 1. Limpieza de la query
    clean_query = query.replace("specs tractordata", "").replace("site:tractordata.com", "").strip()
    query_lower = clean_query.lower()
    
    logger.info(f"Buscando recurso para: '{clean_query}'")
    
    # 2. ⚡ ESTRATEGIA "MEMORIA FOTOGRÁFICA" (Bypass)
    # Si el modelo está en nuestra lista, devolvemos la URL guardada inmediatamente.
    for model_key, known_url in KNOWN_TRACTOR_URLS.items():
        # Verificamos si 'john deere 6r 110' está dentro de la búsqueda del usuario
        if model_key in query_lower:
            logger.info(f"🚀 [Memoria] URL conocida encontrada para '{model_key}': {known_url}")
            return known_url

    # --- Si llegamos aquí, es un tractor nuevo. Iniciamos búsqueda web ---

    # 3. Estrategias de búsqueda Web
    search_strategies = [
        f"site:tractordata.com {clean_query}",
        f"site:deere.com OR site:cnhindustrial.com OR site:fendt.com OR site:specs-auto.com {clean_query} specs",
        f"{clean_query} tractor technical specifications"
    ]

    # 4. Filtros de Seguridad (Blacklist)
    BLACKLIST = [
        "zhihu", "facebook", "pinterest", "instagram", "youtube", 
        "tiktok", "twitter", "x.com", "reddit", "quora", "linkedin", 
        "baidu", "zhidao", "amazon", "ebay", "alibaba", "temu", 
        "bilibili", "johnlennon", "spotify", "apple"
    ]
    
    BAD_EXTENSIONS = (".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".png", ".zip")

    with DDGS() as ddgs:
        for strategy in search_strategies:
            logger.info(f"🔎 Probando estrategia web: '{strategy}'")
            
            for attempt in range(2):
                try:
                    # region='wt-wt' (Global)
                    results = list(ddgs.text(strategy, region='wt-wt', max_results=8))
                    
                    if not results:
                        logger.warning(f"   Intento {attempt+1}: Sin resultados.")
                        time.sleep(random.uniform(1, 2))
                        continue

                    for res in results:
                        url = res['href']
                        title = res['title']
                        url_lower = url.lower()
                        title_lower = title.lower()
                        
                        # A. Filtro de Dominio
                        if any(blocked in url_lower for blocked in BLACKLIST):
                            logger.info(f"   Saltando bloqueado: {url}")
                            continue

                        # B. Filtro de Idioma (.cn, .ru)
                        if ".cn" in url_lower or "/cn/" in url_lower or ".ru" in url_lower:
                             logger.info(f"   Saltando región: {url}")
                             continue

                        # C. Filtro de Archivos
                        if url_lower.endswith(BAD_EXTENSIONS):
                            logger.info(f"   Saltando archivo: {url}")
                            continue

                        # D. Validación de Relevancia
                        # ¿El resultado menciona al menos parte de lo que buscamos?
                        keywords = clean_query.lower().split()
                        significant_keywords = [k for k in keywords if len(k) > 2] # Ignora palabras cortas
                        
                        if significant_keywords and not any(k in title_lower or k in url_lower for k in significant_keywords):
                             logger.info(f"   Saltando irrelevante: {title}")
                             continue

                        # ¡URL Válida!
                        logger.info(f"✅ URL WEB ACEPTADA: {url}")
                        return url
                    
                except Exception as e:
                    logger.error(f"   Error en búsqueda web (intento {attempt+1}): {e}")
                    time.sleep(2)
            
            logger.info("   Estrategia fallida, pasando a la siguiente...")

    logger.error("❌ Fallaron todas las estrategias. No se encontró una URL válida.")
    return None