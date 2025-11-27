from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import func

# Importaciones de la base de datos
from app.database.connection import get_db
from app.database.models import Tractor
from app.database.schemas import TractorPublic

router = APIRouter()

@router.get(
    "/tractors/filter", 
    response_model=List[TractorPublic],
    summary="Obtiene una lista de tractores con filtros dinámicos (TODOS)"
)
async def filter_tractors(
    # --- Dependencias ---
    db: Session = Depends(get_db),
    
    # --- Filtros de Texto ---
    company: Optional[str] = Query(None, description="Filtra por nombre de compañía (búsqueda parcial)"),
    model: Optional[str] = Query(None, description="Filtra por nombre de modelo (búsqueda parcial)"),
    drive_type: Optional[str] = Query(None, description="Filtro exacto para tipo de tracción (ej: '4WD')"),
    rear_type: Optional[str] = Query(None, description="Filtro exacto para tipo de enganche (ej: 'Categoría II')"),

    # --- Filtros Booleanos ---
    enganche_delantero: Optional[bool] = Query(None),
    differential_lock: Optional[bool] = Query(None),
    has_precision_agriculture: Optional[bool] = Query(None),

    # --- Filtros de Rango (Motor) ---
    cylinders_min: Optional[int] = Query(None), cylinders_max: Optional[int] = Query(None),
    disp_min_l: Optional[float] = Query(None), disp_max_l: Optional[float] = Query(None),
    comp_min: Optional[float] = Query(None, description="Mínimo ratio de compresión"),
    comp_max: Optional[float] = Query(None, description="Máximo ratio de compresión"),
    oil_cap_min_l: Optional[float] = Query(None), oil_cap_max_l: Optional[float] = Query(None),
    starter_min_v: Optional[float] = Query(None), starter_max_v: Optional[float] = Query(None),
    power_net_min_kw: Optional[float] = Query(None), power_net_max_kw: Optional[float] = Query(None),
    power_gross_min_kw: Optional[float] = Query(None), power_gross_max_kw: Optional[float] = Query(None),
    rated_rpm_min: Optional[int] = Query(None), rated_rpm_max: Optional[int] = Query(None),
    torque_min_nm: Optional[float] = Query(None), torque_max_nm: Optional[float] = Query(None),
    torque_rpm_min: Optional[int] = Query(None), torque_rpm_max: Optional[int] = Query(None),
    
    # --- Filtros de Rango (Transmisión) ---
    gears_fwd_min: Optional[int] = Query(None), gears_fwd_max: Optional[int] = Query(None),
    gears_rev_min: Optional[int] = Query(None), gears_rev_max: Optional[int] = Query(None),

    # --- Filtros de Rango (Hidráulica) ---
    pump_flow_min_lpm: Optional[float] = Query(None), pump_flow_max_lpm: Optional[float] = Query(None),
    pressure_min_bar: Optional[float] = Query(None), pressure_max_bar: Optional[float] = Query(None),
    scv_flow_min_lpm: Optional[float] = Query(None), scv_flow_max_lpm: Optional[float] = Query(None),
    rear_valves_min: Optional[int] = Query(None), rear_valves_max: Optional[int] = Query(None),
    front_valves_min: Optional[int] = Query(None), front_valves_max: Optional[int] = Query(None),
    capacity_min_l: Optional[float] = Query(None), capacity_max_l: Optional[float] = Query(None),

    # --- Filtros de Rango (PTO) ---
    pto_rpm_min: Optional[int] = Query(None), pto_rpm_max: Optional[int] = Query(None),

    # --- Filtros de Rango (Dimensiones y Peso) ---
    length_min_m: Optional[float] = Query(None), length_max_m: Optional[float] = Query(None),
    width_min_m: Optional[float] = Query(None), width_max_m: Optional[float] = Query(None),
    height_min_m: Optional[float] = Query(None), height_max_m: Optional[float] = Query(None),
    wheelbase_min_m: Optional[float] = Query(None), wheelbase_max_m: Optional[float] = Query(None),
    clearance_min_m: Optional[float] = Query(None), clearance_max_m: Optional[float] = Query(None),
    weight_ship_min_kg: Optional[float] = Query(None), weight_ship_max_kg: Optional[float] = Query(None),
    weight_ballast_min_kg: Optional[float] = Query(None), weight_ballast_max_kg: Optional[float] = Query(None),

    # --- Filtros de Rango (Eléctrico) ---
    batt_volts_min_v: Optional[float] = Query(None), batt_volts_max_v: Optional[float] = Query(None),
    batt_ah_min: Optional[float] = Query(None), batt_ah_max: Optional[float] = Query(None),
    
    # --- Filtros de Rango (Enganche) ---
    lift_cap_min_kg: Optional[float] = Query(None), lift_cap_max_kg: Optional[float] = Query(None),
    
    # --- Filtros de Rango (Combustible) ---
    fuel_cap_min_l: Optional[float] = Query(None), fuel_cap_max_l: Optional[float] = Query(None)
):
    
    print("Iniciando consulta de filtro 100% completa...")
    query = db.query(Tractor)
    
    # --- Aplicar Filtros de Texto ---
    if company: query = query.filter(Tractor.company.ilike(f"%{company}%"))
    if model: query = query.filter(Tractor.model.ilike(f"%{model}%"))
    if drive_type: query = query.filter(Tractor.drive_type == drive_type)
    if rear_type: query = query.filter(Tractor.rear_type == rear_type)

    # --- Aplicar Filtros Booleanos ---
    if enganche_delantero is not None: query = query.filter(Tractor.enganche_delantero == enganche_delantero)
    if differential_lock is not None: query = query.filter(Tractor.differential_lock == differential_lock)
    if has_precision_agriculture is not None: query = query.filter(Tractor.has_precision_agriculture == has_precision_agriculture)

    # --- Aplicar Filtros de Rango Numérico (TODOS) ---
    if cylinders_min: query = query.filter(Tractor.numero_de_cilindros_num >= cylinders_min)
    if cylinders_max: query = query.filter(Tractor.numero_de_cilindros_num <= cylinders_max)
    if disp_min_l: query = query.filter(Tractor.displacement_l >= disp_min_l)
    # 👇 ¡CORREGIDO AQUÍ! (Era TTractor)
    if disp_max_l: query = query.filter(Tractor.displacement_l <= disp_max_l)
    if comp_min: query = query.filter(Tractor.compression_ratio_num >= comp_min)
    if comp_max: query = query.filter(Tractor.compression_ratio_num <= comp_max)
    if oil_cap_min_l: query = query.filter(Tractor.oil_capacity_l >= oil_cap_min_l)
    if oil_cap_max_l: query = query.filter(Tractor.oil_capacity_l <= oil_cap_max_l)
    if starter_min_v: query = query.filter(Tractor.starter_volts_v >= starter_min_v)
    if starter_max_v: query = query.filter(Tractor.starter_volts_v <= starter_max_v)
    if power_net_min_kw: query = query.filter(Tractor.rated_power_net_kw >= power_net_min_kw)
    if power_net_max_kw: query = query.filter(Tractor.rated_power_net_kw <= power_net_max_kw)
    if power_gross_min_kw: query = query.filter(Tractor.max_power_gross_kw >= power_gross_min_kw)
    if power_gross_max_kw: query = query.filter(Tractor.max_power_gross_kw <= power_gross_max_kw)
    if rated_rpm_min: query = query.filter(Tractor.rated_rpm_num >= rated_rpm_min)
    if rated_rpm_max: query = query.filter(Tractor.rated_rpm_num <= rated_rpm_max)
    if torque_min_nm: query = query.filter(Tractor.torque_nm >= torque_min_nm)
    if torque_max_nm: query = query.filter(Tractor.torque_nm <= torque_max_nm)
    if torque_rpm_min: query = query.filter(Tractor.torque_rpm_num >= torque_rpm_min)
    if torque_rpm_max: query = query.filter(Tractor.torque_rpm_num <= torque_rpm_max)
    
    if gears_fwd_min: query = query.filter(Tractor.cambios_adelante >= gears_fwd_min)
    if gears_fwd_max: query = query.filter(Tractor.cambios_adelante <= gears_fwd_max)
    if gears_rev_min: query = query.filter(Tractor.cambios_atras >= gears_rev_min)
    if gears_rev_max: query = query.filter(Tractor.cambios_atras <= gears_rev_max)

    if pump_flow_min_lpm: query = query.filter(Tractor.pump_flow_lpm >= pump_flow_min_lpm)
    if pump_flow_max_lpm: query = query.filter(Tractor.pump_flow_lpm <= pump_flow_max_lpm)
    if pressure_min_bar: query = query.filter(Tractor.pressure_bar >= pressure_min_bar)
    if pressure_max_bar: query = query.filter(Tractor.pressure_bar <= pressure_max_bar)
    if scv_flow_min_lpm: query = query.filter(Tractor.rear_scv_flow_lpm >= scv_flow_min_lpm)
    if scv_flow_max_lpm: query = query.filter(Tractor.rear_scv_flow_lpm <= scv_flow_max_lpm)
    if rear_valves_min: query = query.filter(Tractor.rear_valves >= rear_valves_min)
    if rear_valves_max: query = query.filter(Tractor.rear_valves <= rear_valves_max)
    if front_valves_min: query = query.filter(Tractor.front_valves >= front_valves_min)
    if front_valves_max: query = query.filter(Tractor.front_valves <= front_valves_max)
    if capacity_min_l: query = query.filter(Tractor.capacity_l >= capacity_min_l)
    if capacity_max_l: query = query.filter(Tractor.capacity_l <= capacity_max_l)

    if pto_rpm_min: query = query.filter(Tractor.engine_rpm_at_pto_num >= pto_rpm_min)
    if pto_rpm_max: query = query.filter(Tractor.engine_rpm_at_pto_num <= pto_rpm_max)

    if length_min_m: query = query.filter(Tractor.length_m >= length_min_m)
    if length_max_m: query = query.filter(Tractor.length_m <= length_max_m)
    if width_min_m: query = query.filter(Tractor.width_m >= width_min_m)
    if width_max_m: query = query.filter(Tractor.width_m <= width_max_m)
    
    # 👇 ¡AQUÍ ESTÁ LA MAGIA! Usamos func.coalesce
    ref_height = func.coalesce(Tractor.height_rops_m, Tractor.height_m)
    if height_min_m: query = query.filter(ref_height >= height_min_m)
    if height_max_m: query = query.filter(ref_height <= height_max_m)
    
    if wheelbase_min_m: query = query.filter(Tractor.wheelbase_m >= wheelbase_min_m)
    if wheelbase_max_m: query = query.filter(Tractor.wheelbase_m <= wheelbase_max_m)
    if clearance_min_m: query = query.filter(Tractor.ground_clearance_m >= clearance_min_m)
    if clearance_max_m: query = query.filter(Tractor.ground_clearance_m <= clearance_max_m)
    
    # 👇 Usamos func.coalesce para el peso también
    ref_weight = func.coalesce(Tractor.ballasted_weight_kg, Tractor.shipping_weight_kg)
    if weight_ship_min_kg: query = query.filter(Tractor.shipping_weight_kg >= weight_ship_min_kg)
    if weight_ship_max_kg: query = query.filter(Tractor.shipping_weight_kg <= weight_ship_max_kg)
    if weight_ballast_min_kg: query = query.filter(Tractor.ballasted_weight_kg >= weight_ballast_min_kg)
    if weight_ballast_max_kg: query = query.filter(Tractor.ballasted_weight_kg <= weight_ballast_max_kg)

    if batt_volts_min_v: query = query.filter(Tractor.battery_volts_v >= batt_volts_min_v)
    if batt_volts_max_v: query = query.filter(Tractor.battery_volts_v <= batt_volts_max_v)
    if batt_ah_min: query = query.filter(Tractor.battery_AH_num >= batt_ah_min)
    if batt_ah_max: query = query.filter(Tractor.battery_AH_num <= batt_ah_max)
    
    if lift_cap_min_kg: query = query.filter(Tractor.rear_lift_capacity_kg >= lift_cap_min_kg)
    if lift_cap_max_kg: query = query.filter(Tractor.rear_lift_capacity_kg <= lift_cap_max_kg)
    
    if fuel_cap_min_l: query = query.filter(Tractor.fuel_tank_capacity_l >= fuel_cap_min_l)
    if fuel_cap_max_l: query = query.filter(Tractor.fuel_tank_capacity_l <= fuel_cap_max_l)

    # Ejecutar la consulta
    print("Ejecutando consulta de filtro en la BD...")
    tractors = query.all()
    print(f"Consulta completada. Se encontraron {len(tractors)} tractores.")
    
    return tractors