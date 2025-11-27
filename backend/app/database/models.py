from sqlalchemy import Column, Integer, String, Boolean, Float, Index
from app.database.connection import Base

class Tractor(Base):
    """
    Modelo SQLAlchemy para la tabla única de tractores.
    Contiene columnas de texto (String) para mostrar los valores extraídos
    y columnas numéricas (Float/Integer) para filtrado de rangos.
    """
    __tablename__ = "tractors"

    id = Column(Integer, primary_key=True, index=True)
    
    # --- Identificación Principal ---
    model = Column(String, unique=True, index=True, nullable=False)
    company = Column(String, index=True)

    # --- Engine ---
    marca_motor = Column(String)
    numero_de_cilindros = Column(String)
    numero_de_cilindros_num = Column(Integer, index=True, nullable=True) # FILTRO
    
    displacement = Column(String)
    displacement_l = Column(Float, index=True, nullable=True) # FILTRO (Litros)
    
    compression_ratio = Column(String)
    compression_ratio_num = Column(Float, index=True, nullable=True) # FILTRO
    
    emission_control = Column(String)
    
    oil_capacity = Column(String)
    oil_capacity_l = Column(Float, index=True, nullable=True) # FILTRO (Litros)
    
    starter_volts = Column(String)
    starter_volts_v = Column(Float, index=True, nullable=True) # FILTRO (Voltios)
    
    max_power_gross = Column(String)
    max_power_gross_kw = Column(Float, index=True, nullable=True) # FILTRO (kW)
    
    rated_rpm = Column(String)
    rated_rpm_num = Column(Integer, index=True, nullable=True) # FILTRO (RPM)
    
    torque = Column(String)
    torque_nm = Column(Float, index=True, nullable=True) # FILTRO (Nm)
    
    torque_rpm = Column(String)
    torque_rpm_num = Column(Integer, index=True, nullable=True) # FILTRO (RPM)
    
    rated_power_net = Column(String)
    rated_power_net_kw = Column(Float, index=True, nullable=True) # FILTRO (kW)

    # --- Transmission ---
    clutch = Column(String)
    gears = Column(String)
    cambios_adelante = Column(Integer, index=True) 
    cambios_atras = Column(Integer, index=True) 

    # --- Hydraulics ---
    pump_flow = Column(String)
    pump_flow_lpm = Column(Float, index=True, nullable=True) # FILTRO (LPM)
    
    pressure = Column(String)
    pressure_bar = Column(Float, index=True, nullable=True) # FILTRO (bar)
    
    enganche_delantero = Column(Boolean) 
    
    rear_scv_flow = Column(String)
    rear_scv_flow_lpm = Column(Float, index=True, nullable=True) # FILTRO (LPM)
    
    rear_valves = Column(Integer, index=True) 
    front_valves = Column(Integer, index=True) 
    
    capacity = Column(String)
    capacity_l = Column(Float, index=True, nullable=True) # FILTRO (Litros)

    # --- PTO ---
    front_pto_type = Column(String)
    engine_rpm_at_pto = Column(String)
    engine_rpm_at_pto_num = Column(Integer, index=True, nullable=True) # FILTRO (RPM)
    detalles_velocidades_pto = Column(String)

    # --- DimensionsWeight ---
    length = Column(String)
    length_m = Column(Float, index=True, nullable=True) # FILTRO (Metros)
    
    width = Column(String)
    width_m = Column(Float, index=True, nullable=True) # FILTRO (Metros)
    
    height = Column(String)
    height_m = Column(Float, index=True, nullable=True) # FILTRO (Metros)
    
    height_rops = Column(String)
    height_rops_m = Column(Float, index=True, nullable=True) # FILTRO (Metros)
    
    wheelbase = Column(String)
    wheelbase_m = Column(Float, index=True, nullable=True) # FILTRO (Metros)
    
    ground_clearance = Column(String)
    ground_clearance_m = Column(Float, index=True, nullable=True) # FILTRO (Metros)
    
    shipping_weight = Column(String)
    shipping_weight_kg = Column(Float, index=True, nullable=True) # FILTRO (kg)
    
    ballasted_weight = Column(String)
    ballasted_weight_kg = Column(Float, index=True, nullable=True) # FILTRO (kg)
    
    max_weight = Column(String)
    max_weight_kg = Column(Float, index=True, nullable=True) # FILTRO (kg)
    
    axle_clearance_front = Column(String)
    axle_clearance_front_m = Column(Float, index=True, nullable=True) 
    
    axle_clearance_rear = Column(String)
    axle_clearance_rear_m = Column(Float, index=True, nullable=True) 
    
    rear_tread = Column(String)
    front_tread = Column(String)
    tire_front = Column(String)
    tire_rear = Column(String)
    
    peso_delantero = Column(String)
    peso_delantero_kg = Column(Float, index=True, nullable=True) 
    
    peso_trasero = Column(String)
    peso_trasero_kg = Column(Float, index=True, nullable=True) 

    # --- AxlesDrive ---
    differential_lock = Column(Boolean) 
    drive_type = Column(String, index=True) 
    final_drives = Column(String)

    # --- ElectricalSystem ---
    battery_volts = Column(String)
    battery_volts_v = Column(Float, index=True, nullable=True) 
    
    battery_group = Column(String)
    
    battery_AH = Column(String)
    battery_AH_num = Column(Float, index=True, nullable=True) 

    # --- HitchDrawbar ---
    rear_type = Column(String, index=True) 
    
    rear_lift_capacity = Column(String)
    rear_lift_capacity_kg = Column(Float, index=True, nullable=True) # FILTRO (kg)

    # --- FuelFluids ---
    fuel_tank_capacity = Column(String)
    fuel_tank_capacity_l = Column(Float, index=True, nullable=True) # FILTRO (Litros)

    # --- Mecatronica ---
    has_precision_agriculture = Column(Boolean)