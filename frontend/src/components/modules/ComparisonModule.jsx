import React, { useState, useMemo, useRef } from 'react';
import { Card, Row, Col, Typography, Empty, Button, Select, Tag, Divider, Space, Tooltip, FloatButton } from 'antd';
import { CloseOutlined, DownloadOutlined, PlusOutlined, DeleteOutlined, BarChartOutlined, LineChartOutlined, RadarChartOutlined, AreaChartOutlined } from '@ant-design/icons';
import Plot from 'react-plotly.js';
import html2pdf from 'html2pdf.js';

import { useComparison } from '/src/context/ComparisonContext.jsx';

const { Title, Text } = Typography;

// --- CONFIGURACIÓN DE MÉTRICAS ---
const METRICS_CONFIG = {
  rated_power_net_kw: { label: 'Potencia Neta (kW)', color: '#1890ff' },
  max_power_gross_kw: { label: 'Potencia Máx (kW)', color: '#2f54eb' },
  torque_nm: { label: 'Torque (Nm)', color: '#52c41a' },
  displacement_l: { label: 'Desplazamiento (L)', color: '#722ed1' },
  shipping_weight_kg: { label: 'Peso Envío (kg)', color: '#fa8c16' },
  lift_cap_kg: { label: 'Levante Trasero (kg)', color: '#eb2f96' },
  pump_flow_lpm: { label: 'Flujo Bomba (LPM)', color: '#13c2c2' },
  fuel_tank_capacity_l: { label: 'Tanque Combustible (L)', color: '#faad14' },
  wheelbase_m: { label: 'Distancia Ejes (m)', color: '#096dd9' },
  height_rops_m: { label: 'Altura (m)', color: '#d3adf7' },
};

const METRICS_OPTIONS = Object.keys(METRICS_CONFIG).map(key => ({ label: METRICS_CONFIG[key].label, value: key }));

/**
 * Componente Individual de Gráfica (Tarjeta)
 */
const ChartCard = ({ id, config, data, onUpdate, onRemove }) => {
  
  // Prepara los datos para Plotly según la configuración de esta tarjeta
  const plotData = useMemo(() => {
    const tractorNames = data.map(t => `${t.company} ${t.model}`);
    
    if (config.type === 'Radar') {
       // Normalización simple para radar (0-100% relativo al máximo)
       return data.map(t => {
         const values = config.metrics.map(m => t[m] || 0);
         // (Nota: Para un radar real, idealmente normalizarías cada eje, 
         // pero aquí mostramos valores crudos para simplicidad)
         return {
           type: 'scatterpolar',
           r: values,
           theta: config.metrics.map(m => METRICS_CONFIG[m]?.label || m),
           fill: 'toself',
           name: `${t.company} ${t.model}`,
         };
       });
    }

    // Para Barras, Líneas y Áreas
    return config.metrics.map(metricKey => {
      const trace = {
        x: tractorNames,
        y: data.map(t => t[metricKey] || 0),
        name: METRICS_CONFIG[metricKey]?.label || metricKey,
        marker: { color: METRICS_CONFIG[metricKey]?.color },
      };

      if (config.type === 'Bar') {
        trace.type = 'bar';
        trace.textposition = 'auto';
      } else if (config.type === 'Line') {
        trace.type = 'scatter';
        trace.mode = 'lines+markers';
        trace.line = { width: 3 };
      } else if (config.type === 'Area') {
        trace.type = 'scatter';
        trace.mode = 'lines';
        trace.fill = 'tozeroy';
      }
      return trace;
    });

  }, [data, config]);

  return (
    <Card 
      title={
        <Space>
           <Select 
            value={config.type} 
            onChange={(val) => onUpdate(id, 'type', val)} 
            style={{ width: 120 }}
            options={[
              { value: 'Bar', label: <span><BarChartOutlined /> Barras</span> },
              { value: 'Line', label: <span><LineChartOutlined /> Líneas</span> },
              { value: 'Area', label: <span><AreaChartOutlined /> Áreas</span> },
              { value: 'Radar', label: <span><RadarChartOutlined /> Radar</span> },
            ]}
          />
          <Select
            mode="multiple"
            style={{ minWidth: 200, maxWidth: 400 }}
            placeholder="Selecciona métricas..."
            value={config.metrics}
            onChange={(val) => onUpdate(id, 'metrics', val)}
            options={METRICS_OPTIONS}
            maxTagCount="responsive"
          />
        </Space>
      }
      extra={
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onRemove(id)} />
      }
      style={{ height: '100%', minHeight: 450 }}
      bodyStyle={{ height: '400px', padding: 10 }}
    >
      <Plot
        data={plotData}
        layout={{
          autosize: true,
          margin: { t: 30, b: 40, l: 50, r: 20 },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#fff' }, // Ajustado para tema oscuro
          legend: { orientation: 'h', y: -0.1 },
          polar: config.type === 'Radar' ? { radialaxis: { visible: true, showticklabels: true } } : undefined,
          xaxis: { title: config.type !== 'Radar' ? 'Modelos' : undefined },
          barmode: 'group'
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        config={{ displayModeBar: false }}
      />
    </Card>
  );
};


/**
 * Módulo Principal de Comparación (Dashboard)
 */
const ComparisonModule = () => {
  const { comparisonList, removeTractorFromCompare } = useComparison();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const dashboardRef = useRef(null);

  // Estado de las Gráficas (Dashboard Config)
  // Iniciamos con 2 gráficas por defecto
  const [charts, setCharts] = useState([
    { id: 1, type: 'Bar', metrics: ['rated_power_net_kw', 'max_power_gross_kw'] },
    { id: 2, type: 'Radar', metrics: ['torque_nm', 'displacement_l', 'shipping_weight_kg', 'lift_cap_kg'] }
  ]);

  // --- GESTIÓN DE GRÁFICAS ---
  const addChart = () => {
    const newId = Math.max(...charts.map(c => c.id), 0) + 1;
    setCharts([...charts, { id: newId, type: 'Bar', metrics: ['rated_power_net_kw'] }]);
  };

  const removeChart = (id) => {
    setCharts(charts.filter(c => c.id !== id));
  };

  const updateChart = (id, field, value) => {
    setCharts(charts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // --- PDF ---
  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    const element = dashboardRef.current;
    const opt = {
      margin: 5,
      filename: 'dashboard_tractores.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, background: '#141414' }, // Fondo oscuro para coincidir con tema
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save().then(() => setIsGeneratingPdf(false));
  };

  // --- RENDER ---
  if (comparisonList.length === 0) {
    return (
      <div style={{ padding: '50px' }}>
        <Empty description={<Text>Selecciona tractores en el <b>Catálogo</b> para comparar.</Text>}>
          <Button type="primary" href="/">Ir al Catálogo</Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Encabezado de Control */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            📊 Dashboard Comparativo
            <Tag color="blue" style={{ marginLeft: 10, fontSize: 14 }}>{comparisonList.length} Tractores</Tag>
          </Title>
        </Col>
        <Col>
          <Space>
            <Button type="dashed" icon={<PlusOutlined />} onClick={addChart}>Añadir Gráfica</Button>
            <Button type="primary" icon={<DownloadOutlined />} loading={isGeneratingPdf} onClick={handleDownloadPDF}>
              Descargar PDF
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Área Imprimible */}
      <div ref={dashboardRef} id="dashboard-content" style={{ background: '#141414', padding: 10, minHeight: '80vh' }}>
        
        {/* 1. Resumen de Tractores (Tarjetas Superiores) */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {comparisonList.map(t => (
            <Col xs={24} sm={12} md={24 / Math.max(comparisonList.length, 1)} key={t.id}>
              <Card size="small" hoverable className="tractor-card">
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <Text type="secondary">{t.company}</Text>
                      <Title level={4} style={{ margin: '0 0 5px 0' }}>{t.model}</Title>
                      <Space>
                        <Tag>{t.rated_power_net_kw ? `${t.rated_power_net_kw} kW` : '-'}</Tag>
                        <Tag>{t.drive_type || '-'}</Tag>
                      </Space>
                    </div>
                    <Button type="text" danger icon={<CloseOutlined />} onClick={() => removeTractorFromCompare(t.id)} />
                 </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 2. Grillas de Gráficas Dinámicas */}
        <Row gutter={[16, 16]}>
          {charts.map((chart) => (
            <Col xs={24} lg={12} key={chart.id}>
              <ChartCard 
                id={chart.id}
                config={chart}
                data={comparisonList}
                onUpdate={updateChart}
                onRemove={removeChart}
              />
            </Col>
          ))}
        </Row>

      </div>

      {/* Botón Flotante para Añadir Rápido */}
      <FloatButton icon={<PlusOutlined />} type="primary" tooltip="Añadir Gráfica" onClick={addChart} />
    </div>
  );
};

export default ComparisonModule;