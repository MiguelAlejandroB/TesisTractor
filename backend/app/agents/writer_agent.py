from fpdf import FPDF
import tempfile
import os
from app.database.models import Tractor # Importa el modelo de la DB

class PDF(FPDF):
    """
    Clase FPDF personalizada para añadir un cabecero y pie de página.
    """
    def header(self):
        self.set_font('Helvetica', 'B', 12)
        self.cell(0, 10, 'Informe Técnico de Tractor', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Página {self.page_no()}', 0, 0, 'C')

class WriterAgent:
    """
    Agente encargado de tomar un objeto 'Tractor' de SQLAlchemy
    y generar un reporte en PDF.
    """

    def __init__(self):
        # Define los campos para cada sección del PDF
        self.sections = {
            "Motor": [
                "marca_motor", "numero_de_cilindros", "displacement", 
                "compression_ratio", "emission_control", "oil_capacity", 
                "starter_volts", "max_power_gross", "rated_rpm", "torque", 
                "torque_rpm", "rated_power_net"
            ],
            "Transmisión": [
                "clutch", "gears", "cambios_adelante", "cambios_atras"
            ],
            "Sistema Hidráulico": [
                "pump_flow", "pressure", "enganche_delantero", "rear_scv_flow", 
                "rear_valves", "front_valves", "capacity"
            ],
            "Toma de Fuerza (TDF)": [
                "front_pto_type", "engine_rpm_at_pto", "detalles_velocidades_pto"
            ],
            "Dimensiones y Peso": [
                "length", "width", "height", "height_rops", "wheelbase", 
                "ground_clearance", "shipping_weight", "ballasted_weight", 
                "max_weight", "axle_clearance_front", "axle_clearance_rear", 
                "rear_tread", "front_tread", "tire_front", "tire_rear", 
                "peso_delantero", "peso_trasero"
            ],
            "Ejes y Tracción": [
                "differential_lock", "drive_type", "final_drives"
            ],
            "Sistema Eléctrico": [
                "battery_volts", "battery_group", "battery_AH"
            ],
            "Enganche y Barra de Tiro": [
                "rear_type", "rear_lift_capacity"
            ],
            "Combustible y Fluidos": [
                "fuel_tank_capacity"
            ],
            "Mecatrónica": [
                "has_precision_agriculture"
            ]
        }
        print("Agente Escritor (PDF) inicializado.")

    def _write_section(self, pdf: PDF, title: str, tractor_data: Tractor, fields: list):
        """
        Método helper para escribir una sección en el PDF.
        """
        pdf.set_font('Helvetica', 'B', 14)
        pdf.cell(0, 10, title, 0, 1, 'L')
        
        for field in fields:
            value = getattr(tractor_data, field, None)
            
            # Solo escribe si el valor existe en la DB
            if value is not None:
                # Formatea el nombre del campo (ej: 'rated_power_net' -> 'Rated Power Net')
                label = field.replace("_", " ").capitalize()
                
                pdf.set_font('Helvetica', 'B', 10)
                # Ancho fijo para la etiqueta
                pdf.cell(60, 8, f"  {label}:", 0, 0, 'L') 
                
                pdf.set_font('Helvetica', '', 10)
                # 'multi_cell' para que el texto largo se ajuste
                pdf.multi_cell(w=0, h=8, text=str(value), border=0, align='L', ln=1)
        
        pdf.ln(5) # Espacio después de la sección

    def run(self, tractor_data: Tractor) -> str:
        """
        Genera el PDF y devuelve la ruta al archivo temporal.
        
        Args:
            tractor_data: El objeto 'Tractor' de la base de datos.
            
        Returns:
            str: La ruta al archivo PDF temporal generado.
        """
        print(f"WriterAgent: Iniciando generación de PDF para {tractor_data.model}...")
        
        pdf = PDF(orientation='P', unit='mm', format='A4')
        pdf.add_page()
        
        # --- Título Principal ---
        pdf.set_font('Helvetica', 'B', 18)
        pdf.cell(0, 10, f"{tractor_data.company or ''} {tractor_data.model}", 0, 1, 'C')
        pdf.ln(10)

        # --- Escribir todas las secciones ---
        for title, fields in self.sections.items():
            self._write_section(pdf, title, tractor_data, fields)
        
        # --- Guardar en un archivo temporal ---
        # Creamos un archivo temporal de forma segura
        # 'delete=False' es importante para que FileResponse pueda leerlo
        # 'suffix' asegura que el archivo termine en .pdf
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                pdf_path = tmp_file.name
                pdf.output(pdf_path)
            
            print(f"WriterAgent: PDF generado exitosamente en {pdf_path}")
            return pdf_path
            
        except Exception as e:
            print(f"❌ WriterAgent Error: No se pudo crear el archivo PDF: {e}")
            return None