from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from groq import Groq

router = APIRouter()

# Inicializa el cliente de Groq
# Asegúrate de que GROQ_API_KEY esté en tu archivo .env
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

# --- EL PROMPT DEL EXPERTO ---
SYSTEM_PROMPT = """
Eres el Asistente Inteligente de 'Tractor Platform', una herramienta avanzada de tesis para el análisis y comparación de maquinaria agrícola.

Tus capacidades:
1. Eres un experto ingeniero agrónomo y mecánico.
2. Tu tono es profesional, técnico pero accesible.
3. Sabes que esta plataforma tiene herramientas para:
   - Buscar datos técnicos (/buscar).
   - Comparar gráficamente (/comparar).
   - Calcular rendimiento (/calcular).
   - Investigar automáticamente en internet (/investigar).

Instrucciones:
- Si el usuario pregunta sobre tractores en general, responde con tu conocimiento.
- Si el usuario pide datos específicos de un modelo, sugiérele usar el comando: /investigar [Marca] [Modelo].
- Si el usuario quiere ver tablas, dile que use: /buscar.
- Responde siempre en español y sé conciso.
"""

@router.post("/talk", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", # O "llama-3.1-8b-instant" si quieres más velocidad
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": request.message}
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        
        ai_reply = completion.choices[0].message.content
        return {"response": ai_reply}

    except Exception as e:
        print(f"❌ Error en Groq Chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))