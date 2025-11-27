import re
from typing import Tuple, Optional

# --- Constantes de Conversión (Imperial a Internacional) ---
HP_TO_KW = 0.7457
LBS_FT_TO_NM = 1.35582
CC_TO_L = 0.001
GPM_TO_LPM = 3.78541
PSI_TO_BAR = 0.0689476
LBS_TO_KG = 0.453592
FEET_TO_M = 0.3048
GALLON_US_TO_L = 3.78541
INCH_TO_M = 0.0254

def _extract_number(text: str) -> Optional[float]:
    """
    Extrae el primer número (int o float) de un string.
    Maneja formatos como "1,200.50" y "1.200,50" y "108.6".
    """
    if not text:
        return None
    
    # Intenta encontrar un número, limpiando comas de miles y manejando comas decimales
    # "1,200.50" (US) o "1.200,50" (EU) o "108.6"
    match = re.search(r'([\d.,]+)', text)
    if not match:
        return None
    
    number_str = match.group(1)
    
    try:
        # Estrategia de limpieza:
        # Si hay comas y puntos, asumimos que el punto es decimal y las comas son de miles.
        if ',' in number_str and '.' in number_str:
            number_str = number_str.replace(',', '')
        # Si solo hay comas, asumimos que es un decimal europeo.
        elif ',' in number_str:
            number_str = number_str.replace(',', '.')
        
        # Si hay múltiples puntos (ej. "1.200"), los eliminamos todos menos el último
        if number_str.count('.') > 1:
             parts = number_str.split('.')
             number_str = "".join(parts[:-1]) + "." + parts[-1]

        return float(number_str)
    
    except ValueError:
        print(f"Converter: No se pudo convertir '{match.group(1)}' a float.")
        return None


def get_canonical_values(variable_name: str, value_string: str) -> Tuple[Optional[str], Optional[float]]:
    """
    Toma un nombre de variable y un string extraído (ej: "108.6 hp")
    y devuelve la columna numérica y el valor canónico (ej: "rated_power_net_kw", 81.0).

    Returns:
        (str: nombre_columna_numerica, float: valor_canonico)
    """
    
    number = _extract_number(value_string)
    if number is None:
        return None, None # No se encontró ningún número en el string

    value_lower = value_string.lower()

    # --- Engine ---
    if variable_name == "numero_de_cilindros":
        return "numero_de_cilindros_num", int(number)
    if variable_name == "displacement":
        if "l" in value_lower and "cc" not in value_lower: return "displacement_l", number
        if "cc" in value_lower or "cm³" in value_lower: return "displacement_l", number * CC_TO_L
    if variable_name == "compression_ratio":
        return "compression_ratio_num", number # Asume que es X:1
    if variable_name == "oil_capacity":
        if "l" in value_lower: return "oil_capacity_l", number
        if "gal" in value_lower: return "oil_capacity_l", number * GALLON_US_TO_L
    if variable_name == "starter_volts":
        return "starter_volts_v", number
    if variable_name in ["max_power_gross", "rated_power_net"]:
        col_name = f"{variable_name}_kw"
        if "kw" in value_lower: return col_name, number
        if "hp" in value_lower: return col_name, number * HP_TO_KW
    if variable_name == "rated_rpm":
        return "rated_rpm_num", int(number)
    if variable_name == "torque":
        if "nm" in value_lower: return "torque_nm", number
        if "lbs-ft" in value_lower or "lb-ft" in value_lower: return "torque_nm", number * LBS_FT_TO_NM
    if variable_name == "torque_rpm":
        return "torque_rpm_num", int(number)

    # --- Hydraulics ---
    if variable_name in ["pump_flow", "rear_scv_flow"]:
        col_name = f"{variable_name}_lpm"
        if "lpm" in value_lower or "l/min" in value_lower: return col_name, number
        if "gpm" in value_lower: return col_name, number * GPM_TO_LPM
    if variable_name == "pressure":
        if "bar" in value_lower: return "pressure_bar", number
        if "psi" in value_lower: return "pressure_bar", number * PSI_TO_BAR
    if variable_name == "capacity":
        if "l" in value_lower: return "capacity_l", number
        if "gal" in value_lower: return "capacity_l", number * GALLON_US_TO_L

    # --- PTO ---
    if variable_name == "engine_rpm_at_pto":
        return "engine_rpm_at_pto_num", int(number)
        
    # --- DimensionsWeight ---
    if variable_name in ["length", "width", "height", "height_rops", "wheelbase", "ground_clearance", "axle_clearance_front", "axle_clearance_rear"]:
        col_name = f"{variable_name}_m"
        if "m" in value_lower or "metros" in value_lower: return col_name, number
        if "ft" in value_lower or "pies" in value_lower: return col_name, number * FEET_TO_M
        if "in" in value_lower or "pulgadas" in value_lower: return col_name, number * INCH_TO_M
    if variable_name in ["shipping_weight", "ballasted_weight", "max_weight", "peso_delantero", "peso_trasero"]:
        col_name = f"{variable_name}_kg"
        if "kg" in value_lower: return col_name, number
        if "lbs" in value_lower or "libras" in value_lower: return col_name, number * LBS_TO_KG
        
    # --- ElectricalSystem ---
    if variable_name == "battery_volts":
        return "battery_volts_v", number
    if variable_name == "battery_AH":
        return "battery_AH_num", number

    # --- HitchDrawbar ---
    if variable_name == "rear_lift_capacity":
        if "kg" in value_lower: return "rear_lift_capacity_kg", number
        if "lbs" in value_lower: return "rear_lift_capacity_kg", number * LBS_TO_KG
        
    # --- FuelFluids ---
    if variable_name == "fuel_tank_capacity":
        if "l" in value_lower: return "fuel_tank_capacity_l", number
        if "gal" in value_lower: return "fuel_tank_capacity_l", number * GALLON_US_TO_L

    # No se encontró una conversión para esta variable
    return None, None