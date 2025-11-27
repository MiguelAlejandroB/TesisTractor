import React, { useState, useEffect } from 'react';
import {
  Card,
  Select,
  Slider,
  InputNumber,
  Typography,
  Statistic,
  Row,
  Col,
  Spin,
  Empty,
  Divider,
} from 'antd';
// Importamos la función de la Tarea 8 para llamar a la API
import { fetchTractors } from '/src/services/api.js'; 

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Módulo para calcular y simular métricas de un tractor específico.
 */
const CalculationModule = () => {
  // --- Estados del Componente ---
  const [tractorsList, setTractorsList] = useState([]); // Lista para el dropdown
  const [selectedTractorId, setSelectedTractorId] = useState(null);
  const [tractorData, setTractorData] = useState(null); // El JSON completo del tractor
  const [loadingList, setLoadingList] = useState(true);
  
  // Estado para los parámetros de simulación
  const [rpmTrabajo, setRpmTrabajo] = useState(1800);
  const [anchoImplemento, setAnchoImplemento] = useState(3.0);
  const [velocidad, setVelocidad] = useState(7.5); // km/h

  // --- Carga de Datos ---
  // 1. Carga la lista de tractores (solo una vez)
  useEffect(() => {
    const loadTractorList = async () => {
      setLoadingList(true);
      try {
        // Llama a la Tarea 7 (API de Filtro) sin filtros para traer todo
        const data = await fetchTractors({}); 
        setTractorsList(data);
      } catch (error) {
        console.error("Error cargando lista de tractores:", error);
      } finally {
        setLoadingList(false);
      }
    };
    loadTractorList();
  }, []); // El array vacío [] significa que solo se ejecuta al montar

  // 2. Reacciona cuando el usuario selecciona un tractor
  const handleTractorChange = (value) => {
    setSelectedTractorId(value);
    // Busca el tractor completo en la lista que ya cargamos
    const fullData = tractorsList.find(t => t.id === value);
    setTractorData(fullData || null);
    
    // (Opcional) Resetea los sliders a los valores por defecto
    setRpmTrabajo(1800);
    setAnchoImplemento(3.0);
  };

  // --- Lógica de Cálculo (Simulación) ---
  const calcularMetricas = () => {
    if (!tractorData || !tractorData.engine) {
      return { consumo: 0, capacidad: 0 };
    }

    // Intenta obtener la potencia del tractor, si no, usa 100 como default
    const potenciaKw = tractorData.rated_power_net_kw || 100;
    
    // Fórmula de simulación (muy simplificada, puedes mejorarla)
    // Consumo (L/h) ~ 0.22 litros por kW-hora a 80% de carga
    const consumo = (potenciaKw * 0.8) * 0.22; 
    
    // Capacidad de trabajo (ha/h) = (Ancho (m) * Velocidad (km/h) * Eficiencia (0.8)) / 10
    const capacidad = (anchoImplemento * velocidad * 0.8) / 10;

    return {
      consumo: consumo.toFixed(2),
      capacidad: capacidad.toFixed(2),
    };
  };

  const metricas = calcularMetricas();

  // --- Renderizado ---
  return (
    <Card
      title="🧮 Módulo de Simulación y Cálculo"
      style={{ margin: '24px', borderRadius: '8px' }}
    >
      <Title level={5}>1. Seleccione un Tractor</Title>
      <Select
        showSearch
        placeholder="Seleccione un tractor de la base de datos..."
        loading={loadingList}
        style={{ width: '100%' }}
        onChange={handleTractorChange}
        // Permite buscar por nombre en el dropdown
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
      >
        {tractorsList.map(tractor => (
          <Option 
            key={tractor.id} 
            value={tractor.id}
            label={`${tractor.company} ${tractor.model}`} // Usado para la búsqueda
          >
            {tractor.company} {tractor.model}
          </Option>
        ))}
      </Select>

      <Divider />

      {!tractorData && !loadingList && (
        <Empty description="Por favor, seleccione un tractor para iniciar los cálculos." />
      )}

      {tractorData && (
        <Row gutter={[24, 24]}>
          {/* Columna Izquierda: Parámetros de Simulación */}
          <Col xs={24} md={12}>
            <Title level={5}>2. Parámetros de Simulación</Title>
            <Form layout="vertical">
              <Form.Item label={`RPM de Trabajo (Motor a ${tractorData.engine?.rated_rpm || 'N/A'})`}>
                <Slider 
                  min={1000} 
                  max={3000} 
                  value={rpmTrabajo} 
                  onChange={setRpmTrabajo}
                />
              </Form.Item>
              <Form.Item label="Ancho del Implemento (metros)">
                <InputNumber 
                  min={1} 
                  max={20} 
                  value={anchoImplemento} 
                  onChange={setAnchoImplemento}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item label="Velocidad de Trabajo (km/h)">
                <InputNumber 
                  min={1} 
                  max={20} 
                  value={velocidad} 
                  onChange={setVelocidad}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Form>
            
            <Title level={5}>3. Resultados (Simulados)</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="Consumo Estimado" value={`${metricas.consumo} L/h`} />
              </Col>
              <Col span={12}>
                <Statistic title="Capacidad de Trabajo" value={`${metricas.capacidad} ha/h`} />
              </Col>
            </Row>
          </Col>
          
          {/* Columna Derecha: Datos de Entrada (JSON) */}
          <Col xs={24} md={12}>
            <Title level={5}>Datos de Entrada (Extraídos de la BD)</Title>
            <Text type="secondary">JSON completo del tractor seleccionado:</Text>
            <pre style={{
              background: '#222',
              padding: '10px',
              borderRadius: '6px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {JSON.stringify(tractorData, null, 2)}
            </pre>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default CalculationModule;