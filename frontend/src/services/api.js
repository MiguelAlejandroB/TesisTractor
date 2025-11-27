import axios from 'axios';

// 1. Configuración de la Instancia de Axios
const api = axios.create({
  baseURL: 'http://localhost:8000', // Asegúrate de que coincida con el puerto de tu backend
});

/**
 * Tarea 7: Llama al endpoint de filtrado para obtener la lista de tractores.
 * @param {object} filters - Objeto con los filtros
 * @returns {Promise<Array>} - Lista de tractores
 */
export const fetchTractors = async (filters = {}) => {
  try {
    const response = await api.get('/api/v1/tractors/filter', {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tractors:', error);
    return []; 
  }
};

/**
 * Tarea 5: Llama al endpoint de extracción para procesar una sola variable.
 * Actualizado para manejar errores suavemente en el bucle de minería.
 * @param {object} extractionData - { tractor_model, company, variable_name, source_url }
 * @returns {Promise<object>} - { status: 'success'|'error', value: ... }
 */
export const extractVariable = async (extractionData) => {
  try {
    const response = await api.post('/api/v1/extract', extractionData);
    return response.data;
  } catch (error) {
    console.error('Error extracting variable:', error.response?.data || error.message);
    // Retornamos un objeto de error en lugar de lanzar la excepción
    // para que el bucle en el Chat no se rompa si falla una variable.
    return { status: 'error', value: null, error: error.message };
  }
};

/**
 * Tarea 6: Llama al endpoint de generación de PDF y fuerza la descarga.
 * @param {string} modelName - Nombre del modelo
 * @returns {Promise<object>} - { success: true }
 */
export const generatePdf = async (modelName) => {
  try {
    const response = await api.get(`/api/v1/generate-pdf/${modelName}`, {
      responseType: 'blob',
    });

    const file = new Blob([response.data], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);
    
    const link = document.createElement('a');
    link.href = fileURL;
    const fileName = `informe_${modelName.replace(/ /g, '_')}.pdf`;
    link.setAttribute('download', fileName);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(fileURL);

    return { success: true, fileName: fileName };

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * 👇 NUEVA FUNCIÓN: BÚSQUEDA REAL (Conectada al Backend)
 * Llama a tu endpoint /api/v1/search que usa DuckDuckGo en el servidor.
 * @param {string} query - Lo que se va a buscar (ej: "John Deere 6R potencia")
 * @returns {Promise<string|null>} - La URL encontrada o null
 */
export const searchGoogle = async (query) => {
  console.log(`🌐 Frontend: Solicitando búsqueda al backend para: "${query}"`);
  try {
    // Llamamos al endpoint de búsqueda que creamos en el backend
    const response = await api.post('/api/v1/search', { query });
    
    if (response.data && response.data.url) {
        console.log(`✅ URL encontrada: ${response.data.url}`);
        return response.data.url;
    }
    console.warn("⚠️ El backend no encontró resultados para la búsqueda.");
    return null;
  } catch (error) {
    console.error("❌ Error conectando con el servicio de búsqueda:", error);
    return null;
  }
};
/**
 * Tarea 15: Chat Conversacional
 * Envía un mensaje a Groq (vía backend) para obtener una respuesta inteligente.
 */
export const sendChatMessage = async (message) => {
  try {
    // Nota: la ruta incluye /chat porque así lo definimos en el prefix de main.py
    const response = await api.post('/api/v1/chat/talk', { message });
    return response.data.response;
  } catch (error) {
    console.error("❌ Error en el chat conversacional:", error);
    return "Lo siento, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo.";
  }
};