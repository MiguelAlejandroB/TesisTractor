import dspy
# NO MÁS IMPORTACIONES RARAS DE TYPEDPREDICTOR
from app.config import GROQ_API_KEY
import os

# --- 1. Configuración Global de DSPy para usar Groq ---
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY no encontrada. Asegúrate de que esté en backend/.env")

groq_lm = dspy.LM(
    'groq/llama-3.1-8b-instant',
    api_key=GROQ_API_KEY,
    max_tokens=200
)
dspy.settings.configure(lm=groq_lm)

print("🤖 Agente Analista configurado con Groq (llama-3.1-8b-instant)")


# --- 2. Definición de la Firma (Signature) ---

class ExtractSingleVariable(dspy.Signature):
    """
    Extrae un valor técnico específico de un contexto de texto.
    El valor debe ser exacto al que aparece en el texto.
    Si el valor no se encuentra de forma explícita, debe devolver 'N/A'.
    """
    
    context = dspy.InputField(
        desc="El texto completo extraído de una página web sobre un tractor."
    )
    variable_name = dspy.InputField(
        desc="El nombre técnico exacto de la variable que se debe extraer (ej: 'rated_power_net', 'displacement', 'transmission_type')."
    )
    
    # DSPy v3 ve este 'str' y sabe que debe forzar una salida de string.
    value: str = dspy.OutputField(
        desc="El valor extraído (ej: '370 HP', '9.0L', 'PowerShift'). Si no se encuentra, responde exactamente 'N/A'."
    )


# --- 3. Clase del Agente Especialista ---

class AnalystAgent:
    """
    Un agente especialista que utiliza DSPy y un LLM (Groq) para extraer
    un único dato (valor) de un contexto de texto, dado un nombre de variable.
    """
    
    def __init__(self):
        """
        Inicializa el 'Predictor' que forzará la salida del LLM
        al formato de la firma 'ExtractSingleVariable'.
        """
        try:
            # 👇 ¡ESTE ES EL CAMBIO CLAVE! 👇
            # Ya no usamos TypedPredictor, solo el 'Predict' estándar.
            self.extractor = dspy.Predict(ExtractSingleVariable)
            print("AnalystAgent inicializado con dspy.Predict.")
        except Exception as e:
            print(f"❌ Error al inicializar dspy.Predict en AnalystAgent: {e}")
            self.extractor = None

    def run(self, contexto: str, nombre_variable: str) -> str:
        """
        Ejecuta la extracción de la variable.
        """
        if not self.extractor:
            print("❌ AnalystAgent no inicializado. Extracción fallida.")
            return "N/A"
            
        print(f"AnalystAgent [Groq]: Iniciando extracción para: '{nombre_variable}'")
        
        try:
            # Llama al LLM (Groq) a través de DSPy
            resultado = self.extractor(
                context=contexto, 
                variable_name=nombre_variable
            )
            
            valor_extraido = resultado.value
            
            if not valor_extraido or valor_extraido.strip() == "":
                print(f"AnalystAgent [Groq]: Extracción resultó en N/A (vacío) para: '{nombre_variable}'")
                return "N/A"

            print(f"AnalystAgent [Groq]: Extracción exitosa para: '{nombre_variable}' = '{valor_extraido}'")
            return valor_extraido.strip()

        except Exception as e:
            print(f"❌ Error durante la extracción de DSPy para '{nombre_variable}': {e}")
            return "N/A"