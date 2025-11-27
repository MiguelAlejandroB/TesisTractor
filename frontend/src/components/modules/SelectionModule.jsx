import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Space,
  Divider,
  InputNumber,
  Row,
  Col,
  Drawer,
  Collapse,
  Checkbox,
} from 'antd';
import { SearchOutlined, ClearOutlined, FunnelPlotOutlined } from '@ant-design/icons';
import { fetchTractors } from '/src/services/api.js';
import TractorTable from '../common/TractorTable';

const { Option } = Select;
const { Panel } = Collapse;

// --- Constantes de Conversión ---
const HP_TO_KW = 0.7457;
const CC_TO_L = 0.001;
const LBS_FT_TO_NM = 1.35582;
const GPM_TO_LPM = 3.78541;
const PSI_TO_BAR = 0.0689476;
const LBS_TO_KG = 0.453592;
const FEET_TO_M = 0.3048;
const GALLON_US_TO_L = 3.78541;

/**
 * Componente "hijo" que contiene el formulario de filtros avanzados 100% completo.
 */
const AdvancedFilters = ({
  // Props de estado de unidades
  powerUnit, dispUnit, torqueUnit, volumeUnit, flowUnit, pressureUnit, liftUnit, weightUnit, lengthUnit,
  // Props de 'setters' de unidades
  onPowerUnitChange, onDispUnitChange, onTorqueUnitChange, onVolumeUnitChange, onFlowUnitChange, onPressureUnitChange, onLiftUnitChange, onWeightUnitChange, onLengthUnitChange
}) => (
  <Collapse accordion>
    <Panel header="Motor" key="1">
      <Row gutter={16}>
        {/* --- Potencia Bruta --- (CORREGIDO) */}
        <Col span={24}>
          <Form.Item label={`Potencia Bruta (${powerUnit})`}>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="power_gross_min" noStyle><InputNumber min={0} placeholder="Mínimo" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="power_gross_max" noStyle><InputNumber min={0} placeholder="Máximo" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            {/* Reusa el selector de potencia principal */}
            <Select value={powerUnit} onChange={onPowerUnitChange} style={{ width: '100%', marginTop: 8 }}>
              <Option value="kW">Kilovatios (kW)</Option><Option value="HP">Caballos de Fuerza (HP)</Option>
            </Select>
          </Form.Item>
        </Col>
        {/* --- Desplazamiento --- */}
        <Col span={24}>
          <Form.Item label={`Desplazamiento (${dispUnit})`}>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="disp_min" noStyle><InputNumber min={0} placeholder="Mínimo" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="disp_max" noStyle><InputNumber min={0} placeholder="Máximo" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Select value={dispUnit} onChange={onDispUnitChange} style={{ width: '100%', marginTop: 8 }}>
              <Option value="L">Litros (L)</Option><Option value="CC">cc</Option>
            </Select>
          </Form.Item>
        </Col>
        {/* --- Torque --- */}
        <Col span={24}>
          <Form.Item label={`Torque (${torqueUnit})`}>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="torque_min" noStyle><InputNumber min={0} placeholder="Mínimo" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="torque_max" noStyle><InputNumber min={0} placeholder="Máximo" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Select value={torqueUnit} onChange={onTorqueUnitChange} style={{ width: '100%', marginTop: 8 }}>
              <Option value="Nm">Nm</Option><Option value="lb-ft">lb-ft</Option>
            </Select>
          </Form.Item>
        </Col>
        {/* --- Capacidad de Aceite (NUEVO) --- */}
        <Col span={24}>
          <Form.Item label={`Capacidad Aceite (${volumeUnit})`}>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="oil_cap_min" noStyle><InputNumber min={0} placeholder="Mínimo" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="oil_cap_max" noStyle><InputNumber min={0} placeholder="Máximo" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Select value={volumeUnit} onChange={onVolumeUnitChange} style={{ width: '100%', marginTop: 8 }}>
              <Option value="L">Litros (L)</Option><Option value="gal">Galones (gal)</Option>
            </Select>
          </Form.Item>
        </Col>
        {/* --- Filtros Numéricos Simples (NUEVOS) --- */}
        <Col span={12}><Form.Item name="cylinders_min" label="Cilindros (Min)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="cylinders_max" label="Cilindros (Max)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="comp_min" label="Ratio Comp. (Min)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="comp_max" label="Ratio Comp. (Max)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="rated_rpm_min" label="RPM Nominal (Min)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="rated_rpm_max" label="RPM Nominal (Max)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="torque_rpm_min" label="RPM Torque (Min)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="torque_rpm_max" label="RPM Torque (Max)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
      </Row>
    </Panel>
    
    {/* --- Panel de Transmisión (NUEVO) --- */}
    <Panel header="Transmisión" key="2">
      <Row gutter={16}>
        <Col span={12}><Form.Item name="gears_fwd_min" label="Cambios Adelante (Min)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="gears_fwd_max" label="Cambios Adelante (Max)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="gears_rev_min" label="Cambios Atrás (Min)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="gears_rev_max" label="Cambios Atrás (Max)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
      </Row>
    </Panel>

    <Panel header="Hidráulica y Enganche" key="3">
      <Row gutter={16}>
        {/* --- Flujo de Bomba --- */}
        <Col span={24}>
          <Form.Item label={`Flujo Bomba (${flowUnit})`}>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="pump_flow_min" noStyle><InputNumber min={0} placeholder="Mínimo" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="pump_flow_max" noStyle><InputNumber min={0} placeholder="Máximo" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Select value={flowUnit} onChange={onFlowUnitChange} style={{ width: '100%', marginTop: 8 }}>
              <Option value="LPM">LPM</Option><Option value="GPM">GPM</Option>
            </Select>
          </Form.Item>
        </Col>
        {/* --- Flujo SCV (NUEVO) --- */}
        <Col span={24}>
          <Form.Item label={`Flujo Válvula (${flowUnit})`}>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="scv_flow_min" noStyle><InputNumber min={0} placeholder="Mínimo" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="scv_flow_max" noStyle><InputNumber min={0} placeholder="Máximo" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Select value={flowUnit} onChange={onFlowUnitChange} style={{ width: '100%', marginTop: 8 }}>
              <Option value="LPM">LPM</Option><Option value="GPM">GPM</Option>
            </Select>
          </Form.Item>
        </Col>
        {/* --- Presión --- */}
        <Col span={24}>
          <Form.Item label={`Presión (${pressureUnit})`}>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="pressure_min" noStyle><InputNumber min={0} placeholder="Mínimo" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="pressure_max" noStyle><InputNumber min={0} placeholder="Máximo" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Select value={pressureUnit} onChange={onPressureUnitChange} style={{ width: '100%', marginTop: 8 }}>
              <Option value="bar">bar</Option><Option value="PSI">PSI</Option>
            </Select>
          </Form.Item>
        </Col>
        {/* --- Capacidad Levante --- */}
        <Col span={24}>
          <Form.Item label={`Levante Trasero (${liftUnit})`}>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="lift_cap_min" noStyle><InputNumber min={0} placeholder="Mínimo" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="lift_cap_max" noStyle><InputNumber min={0} placeholder="Máximo" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Select value={liftUnit} onChange={onLiftUnitChange} style={{ width: '100%', marginTop: 8 }}>
              <Option value="kg">kg</Option><Option value="lbs">lbs</Option>
            </Select>
          </Form.Item>
        </Col>
        {/* --- Capacidad Hidráulica (NUEVO) --- */}
        <Col span={24}>
          <Form.Item label={`Capacidad Sist. Hidr. (${volumeUnit})`}>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="capacity_min" noStyle><InputNumber min={0} placeholder="Mínimo" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="capacity_max" noStyle><InputNumber min={0} placeholder="Máximo" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Select value={volumeUnit} onChange={onVolumeUnitChange} style={{ width: '100%', marginTop: 8 }}>
              <Option value="L">Litros (L)</Option><Option value="gal">Galones (gal)</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={24}><Form.Item name="rear_type" label="Tipo Enganche Trasero"><Input placeholder="Ej: Categoría II" /></Form.Item></Col>
        <Col span={12}><Form.Item name="rear_valves_min" label="Válvulas Tras. (Min)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="rear_valves_max" label="Válvulas Tras. (Max)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="front_valves_min" label="Válvulas Front. (Min)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="front_valves_max" label="Válvulas Front. (Max)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
      </Row>
    </Panel>

    {/* --- Panel PTO (NUEVO) --- */}
    <Panel header="Toma de Fuerza (PTO)" key="4">
      <Row gutter={16}>
        <Col span={12}><Form.Item name="pto_rpm_min" label="RPM Motor en PTO (Min)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="pto_rpm_max" label="RPM Motor en PTO (Max)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
      </Row>
    </Panel>

    <Panel header="Dimensiones y Peso" key="5">
       <Row gutter={16}>
        {/* --- Peso Envío --- */}
        <Col span={24}>
          <Form.Item label={`Peso Envío (${weightUnit})`}>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="weight_ship_min" noStyle><InputNumber min={0} placeholder="Mínimo" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="weight_ship_max" noStyle><InputNumber min={0} placeholder="Máximo" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Select value={weightUnit} onChange={onWeightUnitChange} style={{ width: '100%', marginTop: 8 }}>
              <Option value="kg">kg</Option><Option value="lbs">lbs</Option>
            </Select>
          </Form.Item>
        </Col>
        {/* --- Peso Lastrado (NUEVO) --- */}
        <Col span={24}>
          <Form.Item label={`Peso Lastrado (${weightUnit})`}>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="weight_ballast_min" noStyle><InputNumber min={0} placeholder="Mínimo" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="weight_ballast_max" noStyle><InputNumber min={0} placeholder="Máximo" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Select value={weightUnit} onChange={onWeightUnitChange} style={{ width: '100%', marginTop: 8 }}>
              <Option value="kg">kg</Option><Option value="lbs">lbs</Option>
            </Select>
          </Form.Item>
        </Col>
        {/* --- Distancia entre Ejes --- */}
        <Col span={24}>
          <Form.Item label={`Entre Ejes (${lengthUnit})`}>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="wheelbase_min" noStyle><InputNumber min={0} placeholder="Mínimo" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="wheelbase_max" noStyle><InputNumber min={0} placeholder="Máximo" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Select value={lengthUnit} onChange={onLengthUnitChange} style={{ width: '100%', marginTop: 8 }}>
              <Option value="m">Metros (m)</Option><Option value="ft">Pies (ft)</Option>
            </Select>
          </Form.Item>
        </Col>
        {/* --- Altura (NUEVO) --- */}
        <Col span={24}>
          <Form.Item label={`Altura (${lengthUnit})`}>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="height_min" noStyle><InputNumber min={0} placeholder="Mínimo" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="height_max" noStyle><InputNumber min={0} placeholder="Máximo" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Select value={lengthUnit} onChange={onLengthUnitChange} style={{ width: '100%', marginTop: 8 }}>
              <Option value="m">Metros (m)</Option><Option value="ft">Pies (ft)</Option>
            </Select>
          </Form.Item>
        </Col>
        {/* --- Ancho (NUEVO) --- */}
        <Col span={24}>
          <Form.Item label={`Ancho (${lengthUnit})`}>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="width_min" noStyle><InputNumber min={0} placeholder="Mínimo" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="width_max" noStyle><InputNumber min={0} placeholder="Máximo" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Select value={lengthUnit} onChange={onLengthUnitChange} style={{ width: '100%', marginTop: 8 }}>
              <Option value="m">Metros (m)</Option><Option value="ft">Pies (ft)</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Panel>
    
    {/* --- Panel Eléctrico (NUEVO) --- */}
    <Panel header="Sistema Eléctrico" key="6">
      <Row gutter={16}>
        <Col span={12}><Form.Item name="batt_volts_min_v" label="Voltaje Bat. (Min V)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="batt_volts_max_v" label="Voltaje Bat. (Max V)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="batt_ah_min" label="Batería (Min AH)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="batt_ah_max" label="Batería (Max AH)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
      </Row>
    </Panel>

    {/* --- Panel Combustible (NUEVO) --- */}
    <Panel header="Combustible" key="7">
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item label={`Capacidad Combust. (${volumeUnit})`}>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="fuel_cap_min" noStyle><InputNumber min={0} placeholder="Mínimo" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="fuel_cap_max" noStyle><InputNumber min={0} placeholder="Máximo" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Select value={volumeUnit} onChange={onVolumeUnitChange} style={{ width: '100%', marginTop: 8 }}>
              <Option value="L">Litros (L)</Option><Option value="gal">Galones (gal)</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Panel>
    
    <Panel header="Características (Booleanos)" key="8">
      <Space direction="vertical">
        <Form.Item name="enganche_delantero" valuePropName="checked"><Checkbox>Incluir solo con Enganche Delantero</Checkbox></Form.Item>
        <Form.Item name="differential_lock" valuePropName="checked"><Checkbox>Incluir solo con Bloqueo de Diferencial</Checkbox></Form.Item>
        <Form.Item name="has_precision_agriculture" valuePropName="checked"><Checkbox>Incluir solo con Agricultura de Precisión</Checkbox></Form.Item>
      </Space>
    </Panel>
  </Collapse>
);


/**
 * El módulo de selección principal (Padre).
 * Ahora maneja TODOS los estados de unidades.
 */
const SelectionModule = () => {
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [drawerVisible, setDrawerVisible] = useState(false); 

  // --- ESTADOS DE UNIDADES ---
  const [powerUnit, setPowerUnit] = useState('kW');
  const [dispUnit, setDispUnit] = useState('L');
  const [torqueUnit, setTorqueUnit] = useState('Nm');
  const [flowUnit, setFlowUnit] = useState('LPM');
  const [pressureUnit, setPressureUnit] = useState('bar');
  const [liftUnit, setLiftUnit] = useState('kg');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [lengthUnit, setLengthUnit] = useState('m');
  const [volumeUnit, setVolumeUnit] = useState('L'); // Para aceite, combustible, etc.

  const [form] = Form.useForm();

  // --- Efecto de Carga de Datos ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const cleanFilters = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            cleanFilters[key] = value;
          }
        });
        
        console.log('Llamando a la API con filtros CANÓNICOS:', cleanFilters);
        const data = await fetchTractors(cleanFilters);
        setTractors(data);
      } catch (error) {
        console.error('Error en SelectionModule:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [filters]); 

  // --- Función de Conversión Genérica ---
  const convertValue = (value, unitType, toUnit, rate) => {
    if (!value) return null;
    return unitType === toUnit ? value : value * rate;
  };

  /**
   * Función de 'onFinish' 100% completa.
   * Convierte TODAS las unidades antes de llamar a la API.
   */
  const onFinish = (values) => {
    const newFilters = { ...values }; // Copia valores (incluye strings y bools)
    
    // --- LÓGICA DE CONVERSIÓN ---
    newFilters.power_net_min_kw = convertValue(values.power_net_min, powerUnit, 'HP', HP_TO_KW);
    newFilters.power_net_max_kw = convertValue(values.power_net_max, powerUnit, 'HP', HP_TO_KW);
    newFilters.power_gross_min_kw = convertValue(values.power_gross_min, powerUnit, 'HP', HP_TO_KW);
    newFilters.power_gross_max_kw = convertValue(values.power_gross_max, powerUnit, 'HP', HP_TO_KW);

    newFilters.disp_min_l = convertValue(values.disp_min, dispUnit, 'CC', CC_TO_L);
    newFilters.disp_max_l = convertValue(values.disp_max, dispUnit, 'CC', CC_TO_L);

    newFilters.torque_min_nm = convertValue(values.torque_min, torqueUnit, 'lb-ft', LBS_FT_TO_NM);
    newFilters.torque_max_nm = convertValue(values.torque_max, torqueUnit, 'lb-ft', LBS_FT_TO_NM);

    newFilters.oil_cap_min_l = convertValue(values.oil_cap_min, volumeUnit, 'gal', GALLON_US_TO_L);
    newFilters.oil_cap_max_l = convertValue(values.oil_cap_max, volumeUnit, 'gal', GALLON_US_TO_L);
    newFilters.capacity_min_l = convertValue(values.capacity_min, volumeUnit, 'gal', GALLON_US_TO_L);
    newFilters.capacity_max_l = convertValue(values.capacity_max, volumeUnit, 'gal', GALLON_US_TO_L);
    newFilters.fuel_cap_min_l = convertValue(values.fuel_cap_min, volumeUnit, 'gal', GALLON_US_TO_L);
    newFilters.fuel_cap_max_l = convertValue(values.fuel_cap_max, volumeUnit, 'gal', GALLON_US_TO_L);
    
    newFilters.pump_flow_min_lpm = convertValue(values.pump_flow_min, flowUnit, 'GPM', GPM_TO_LPM);
    newFilters.pump_flow_max_lpm = convertValue(values.pump_flow_max, flowUnit, 'GPM', GPM_TO_LPM);
    newFilters.scv_flow_min_lpm = convertValue(values.scv_flow_min, flowUnit, 'GPM', GPM_TO_LPM);
    newFilters.scv_flow_max_lpm = convertValue(values.scv_flow_max, flowUnit, 'GPM', GPM_TO_LPM);

    newFilters.pressure_min_bar = convertValue(values.pressure_min, pressureUnit, 'PSI', PSI_TO_BAR);
    newFilters.pressure_max_bar = convertValue(values.pressure_max, pressureUnit, 'PSI', PSI_TO_BAR);

    newFilters.lift_cap_min_kg = convertValue(values.lift_cap_min, liftUnit, 'lbs', LBS_TO_KG);
    newFilters.lift_cap_max_kg = convertValue(values.lift_cap_max, liftUnit, 'lbs', LBS_TO_KG);
    newFilters.weight_ship_min_kg = convertValue(values.weight_ship_min, weightUnit, 'lbs', LBS_TO_KG);
    newFilters.weight_ship_max_kg = convertValue(values.weight_ship_max, weightUnit, 'lbs', LBS_TO_KG);
    newFilters.weight_ballast_min_kg = convertValue(values.weight_ballast_min, weightUnit, 'lbs', LBS_TO_KG);
    newFilters.weight_ballast_max_kg = convertValue(values.weight_ballast_max, weightUnit, 'lbs', LBS_TO_KG);

    newFilters.wheelbase_min_m = convertValue(values.wheelbase_min, lengthUnit, 'ft', FEET_TO_M);
    newFilters.wheelbase_max_m = convertValue(values.wheelbase_max, lengthUnit, 'ft', FEET_TO_M);
    newFilters.height_min_m = convertValue(values.height_min, lengthUnit, 'ft', FEET_TO_M);
    newFilters.height_max_m = convertValue(values.height_max, lengthUnit, 'ft', FEET_TO_M);
    newFilters.width_min_m = convertValue(values.width_min, lengthUnit, 'ft', FEET_TO_M);
    newFilters.width_max_m = convertValue(values.width_max, lengthUnit, 'ft', FEET_TO_M);

    // --- Limpiar Nombres 'Sucios' y Booleanos ---
    const booleanKeys = ['enganche_delantero', 'differential_lock', 'has_precision_agriculture'];
    const dirtyKeys = [
      'power_net_min', 'power_net_max', 'power_gross_min', 'power_gross_max',
      'disp_min', 'disp_max', 'torque_min', 'torque_max', 'oil_cap_min', 'oil_cap_max',
      'pump_flow_min', 'pump_flow_max', 'scv_flow_min', 'scv_flow_max',
      'pressure_min', 'pressure_max', 'lift_cap_min', 'lift_cap_max',
      'weight_ship_min', 'weight_ship_max', 'weight_ballast_min', 'weight_ballast_max',
      'wheelbase_min', 'wheelbase_max', 'height_min', 'height_max', 'width_min', 'width_max',
      'capacity_min', 'capacity_max', 'fuel_cap_min', 'fuel_cap_max'
    ];
    
    booleanKeys.forEach(key => {
      newFilters[key] = values[key] ? true : (values[key] === false ? false : null);
    });
    
    dirtyKeys.forEach(key => delete newFilters[key]);

    setFilters(newFilters); 
    setDrawerVisible(false); 
  };

  const onReset = () => {
    form.resetFields();
    setFilters({}); 
    // Resetea todas las unidades
    setPowerUnit('kW'); setDispUnit('L'); setTorqueUnit('Nm');
    setFlowUnit('LPM'); setPressureUnit('bar'); setLiftUnit('kg');
    setWeightUnit('kg'); setLengthUnit('m'); setVolumeUnit('L');
  };

  return (
    <>
      <Card
        title="Catálogo y Filtro de Tractores"
        style={{ margin: '24px', borderRadius: '8px' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginBottom: '20px' }}
        >
          {/* --- FILTROS RÁPIDOS (Siempre visibles) --- */}
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="company" label="Compañía"><Input placeholder="Ej: John Deere" /></Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="model" label="Modelo"><Input placeholder="Ej: 6R 110" /></Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="drive_type" label="Tipo de Tracción">
                <Select placeholder="Cualquiera" allowClear>
                  <Option value="4WD">4WD</Option><Option value="2WD">2WD</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="Unidad de Potencia">
                <Select value={powerUnit} onChange={setPowerUnit}>
                  <Option value="kW">Kilovatios (kW)</Option><Option value="HP">Caballos de Fuerza (HP)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="power_net_min" label={`Potencia Neta Mín. (${powerUnit})`}>
                <InputNumber min={0} placeholder="Ej: 70" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="power_net_max" label={`Potencia Neta Máx. (${powerUnit})`}>
                <InputNumber min={0} placeholder="Ej: 150" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {/* --- BOTONES DE ACCIÓN --- */}
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button icon={<ClearOutlined />} onClick={onReset}>Limpiar</Button>
                <Button icon={<FunnelPlotOutlined />} onClick={() => setDrawerVisible(true)}>
                  Filtros Avanzados
                </Button>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                  Buscar
                </Button>
              </Space>
            </Col>
          </Row>

          {/* --- FILTROS AVANZADOS (Ocultos en el Drawer) --- */}
          <Drawer
            title="Filtros Avanzados"
            placement="right"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={450}
            footer={
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => setDrawerVisible(false)}>Cancelar</Button>
                <Button onClick={() => form.submit()} type="primary">Aplicar y Buscar</Button>
              </Space>
            }
          >
            {/* Pasamos todos los estados de unidades al componente del Drawer */}
            <AdvancedFilters 
              powerUnit={powerUnit} onPowerUnitChange={setPowerUnit}
              dispUnit={dispUnit} onDispUnitChange={setDispUnit}
              torqueUnit={torqueUnit} onTorqueUnitChange={setTorqueUnit}
              volumeUnit={volumeUnit} onVolumeUnitChange={setVolumeUnit}
              flowUnit={flowUnit} onFlowUnitChange={setFlowUnit}
              pressureUnit={pressureUnit} onPressureUnitChange={setPressureUnit}
              liftUnit={liftUnit} onLiftUnitChange={setLiftUnit}
              weightUnit={weightUnit} onWeightUnitChange={setWeightUnit}
              lengthUnit={lengthUnit} onLengthUnitChange={setLengthUnit}
            />
          </Drawer>
        </Form>
        
        <Divider />

        <TractorTable loading={loading} data={tractors} />
      </Card>
    </>
  );
};

export default SelectionModule;