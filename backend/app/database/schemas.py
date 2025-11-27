from pydantic import BaseModel
from typing import Optional

# --- Esquemas para Extracción ---

class ExtractionRequest(BaseModel):
    """
    Lo que la API /extract espera recibir en el body.
    """
    tractor_model: str
    company: Optional[str] = None
    variable_name: str
    source_url: str

class ExtractionResponse(BaseModel):
    """
    Lo que la API /extract devuelve.
    """
    status: str
    variable_name: str
    value: Optional[str]


# --- Esquema de Tractor Completo ---

class TractorPublic(BaseModel):
    """
    El schema Pydantic completo que se enviará al frontend (React).
    Refleja TODAS las columnas del modelo SQLAlchemy 'Tractor'.
    """
    id: int
    model: str
    company: Optional[str] = None
    
    # --- Engine ---
    marca_motor: Optional[str] = None
    numero_de_cilindros: Optional[str] = None
    numero_de_cilindros_num: Optional[int] = None
    displacement: Optional[str] = None
    displacement_l: Optional[float] = None
    compression_ratio: Optional[str] = None
    compression_ratio_num: Optional[float] = None
    emission_control: Optional[str] = None
    oil_capacity: Optional[str] = None
    oil_capacity_l: Optional[float] = None
    starter_volts: Optional[str] = None
    starter_volts_v: Optional[float] = None
    max_power_gross: Optional[str] = None
    max_power_gross_kw: Optional[float] = None
    rated_rpm: Optional[str] = None
    rated_rpm_num: Optional[int] = None
    torque: Optional[str] = None
    torque_nm: Optional[float] = None
    torque_rpm: Optional[str] = None
    torque_rpm_num: Optional[int] = None
    rated_power_net: Optional[str] = None
    rated_power_net_kw: Optional[float] = None

    # --- Transmission ---
    clutch: Optional[str] = None
    gears: Optional[str] = None
    cambios_adelante: Optional[int] = None
    cambios_atras: Optional[int] = None

    # --- Hydraulics ---
    pump_flow: Optional[str] = None
    pump_flow_lpm: Optional[float] = None
    pressure: Optional[str] = None
    pressure_bar: Optional[float] = None
    enganche_delantero: Optional[bool] = None
    rear_scv_flow: Optional[str] = None
    rear_scv_flow_lpm: Optional[float] = None
    rear_valves: Optional[int] = None
    front_valves: Optional[int] = None
    capacity: Optional[str] = None
    capacity_l: Optional[float] = None

    # --- PTO ---
    front_pto_type: Optional[str] = None
    engine_rpm_at_pto: Optional[str] = None
    engine_rpm_at_pto_num: Optional[int] = None
    detalles_velocidades_pto: Optional[str] = None

    # --- DimensionsWeight ---
    length: Optional[str] = None
    length_m: Optional[float] = None
    width: Optional[str] = None
    width_m: Optional[float] = None
    height: Optional[str] = None
    height_m: Optional[float] = None
    height_rops: Optional[str] = None
    height_rops_m: Optional[float] = None
    wheelbase: Optional[str] = None
    wheelbase_m: Optional[float] = None
    ground_clearance: Optional[str] = None
    ground_clearance_m: Optional[float] = None
    shipping_weight: Optional[str] = None
    shipping_weight_kg: Optional[float] = None
    ballasted_weight: Optional[str] = None
    ballasted_weight_kg: Optional[float] = None
    max_weight: Optional[str] = None
    max_weight_kg: Optional[float] = None
    axle_clearance_front: Optional[str] = None
    axle_clearance_front_m: Optional[float] = None
    axle_clearance_rear: Optional[str] = None
    axle_clearance_rear_m: Optional[float] = None
    rear_tread: Optional[str] = None
    front_tread: Optional[str] = None
    tire_front: Optional[str] = None
    tire_rear: Optional[str] = None
    peso_delantero: Optional[str] = None
    peso_delantero_kg: Optional[float] = None
    peso_trasero: Optional[str] = None
    peso_trasero_kg: Optional[float] = None

    # --- AxlesDrive ---
    differential_lock: Optional[bool] = None
    drive_type: Optional[str] = None
    final_drives: Optional[str] = None

    # --- ElectricalSystem ---
    battery_volts: Optional[str] = None
    battery_volts_v: Optional[float] = None
    battery_group: Optional[str] = None
    battery_AH: Optional[str] = None
    battery_AH_num: Optional[float] = None

    # --- HitchDrawbar ---
    rear_type: Optional[str] = None
    rear_lift_capacity: Optional[str] = None
    rear_lift_capacity_kg: Optional[float] = None

    # --- FuelFluids ---
    fuel_tank_capacity: Optional[str] = None
    fuel_tank_capacity_l: Optional[float] = None

    # --- Mecatronica ---
    has_precision_agriculture: Optional[bool] = None

    class Config:
        # Esto le permite a Pydantic leer los datos
        # directamente desde el objeto SQLAlchemy (TractorDB).
        from_attributes = True

    # ... (al final de tu archivo, después de TractorPublic) ...

# --- Esquemas para Cálculo (Tarea 11) ---

class CalculationRequest(BaseModel):
    """
    Lo que la API /calculate espera recibir.
    Usamos el ID del tractor para buscar sus datos en la BD.
    """
    tractor_id: int
    rpm_trabajo: Optional[int] = 1800
    ancho_implemento_m: Optional[float] = 3.0
    velocidad_kph: Optional[float] = 7.5

class CalculationResponse(BaseModel):
    """
    Lo que la API /calculate devuelve.
    """
    consumo_estimado_l_h: float
    capacidad_trabajo_ha_h: float
    tractor_model: str # Para confirmar el modelo usado
    tractor_power_kw: float # Para confirmar la potencia usada