import React, { useMemo, useState } from 'react';
import { Table, Tag, Button, Tooltip, Popover, Checkbox, Row, Col, message } from 'antd';
import { 
  PlusSquareOutlined, 
  DownloadOutlined, 
  SettingOutlined, 
  LoadingOutlined 
} from '@ant-design/icons';
// Importamos el hook del contexto
import { useComparison } from '/src/context/ComparisonContext.jsx';
// Importamos el servicio de PDF
import { generatePdf } from '/src/services/api.js';

/**
 * Definición de TODAS las columnas posibles de datos.
 * Aquí puedes añadir las 50 variables si quieres.
 */
const AVAILABLE_COLUMNS = [
  { title: 'Compañía', dataIndex: 'company', key: 'company', width: 120, fixed: false },
  { title: 'Modelo', dataIndex: 'model', key: 'model', width: 120, fixed: false },
  { title: 'Potencia (kW)', dataIndex: 'rated_power_net_kw', key: 'rated_power_net_kw', width: 130, render: (v) => v ? `${v.toFixed(1)} kW` : '-' },
  { title: 'Potencia (HP)', dataIndex: 'rated_power_net', key: 'rated_power_net', width: 130, render: (v) => v ? <Tag color="blue">{v}</Tag> : '-' },
  { title: 'Tracción', dataIndex: 'drive_type', key: 'drive_type', width: 110, render: (v) => v ? <Tag color="green">{v}</Tag> : '-' },
  { title: 'Cilindros', dataIndex: 'numero_de_cilindros', key: 'numero_de_cilindros', width: 100 },
  { title: 'Desplazamiento', dataIndex: 'displacement', key: 'displacement', width: 130 },
  { title: 'Torque', dataIndex: 'torque', key: 'torque', width: 120 },
  { title: 'RPM Nominal', dataIndex: 'rated_rpm', key: 'rated_rpm', width: 120 },
  { title: 'Peso Envío', dataIndex: 'shipping_weight', key: 'shipping_weight', width: 120 },
  { title: 'Levante Trasero', dataIndex: 'rear_lift_capacity', key: 'rear_lift_capacity', width: 140 },
  { title: 'Flujo Bomba', dataIndex: 'pump_flow', key: 'pump_flow', width: 120 },
  { title: 'Combustible', dataIndex: 'fuel_tank_capacity', key: 'fuel_tank_capacity', width: 130 },
  // ... ¡Puedes agregar más aquí! ...
];

// Columnas que se muestran por defecto al cargar la página
const DEFAULT_VISIBLE_COLUMNS = ['company', 'model', 'rated_power_net_kw', 'rated_power_net', 'drive_type'];

/**
 * Componente de Tabla con Selector de Columnas y Descarga de PDF.
 */
const TractorTable = ({ loading, data }) => {
  const { addTractorToCompare, comparisonList } = useComparison();
  
  // Estado para controlar qué columnas se muestran
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);
  
  // Estado para controlar qué fila está descargando el PDF (para mostrar spinner)
  const [downloadingId, setDownloadingId] = useState(null);

  // --- Manejador de Descarga de PDF ---
  const handleDownload = async (record) => {
    setDownloadingId(record.id);
    const hide = message.loading(`Generando reporte para ${record.model}...`, 0);
    
    try {
      const result = await generatePdf(record.model);
      if (result.success) {
        message.success(`¡Reporte descargado: ${result.fileName}!`);
      }
    } catch (error) {
      message.error("Error al descargar el PDF. Intenta de nuevo.");
    } finally {
      hide();
      setDownloadingId(null);
    }
  };

  // --- Contenido del Popover (Menú de Configuración) ---
  const columnSelector = (
    <div style={{ width: 300 }}>
      <p>Selecciona las columnas visibles:</p>
      <Checkbox.Group 
        value={visibleColumns} 
        onChange={setVisibleColumns}
        style={{ width: '100%' }}
      >
        <Row>
          {AVAILABLE_COLUMNS.map(col => (
            <Col span={12} key={col.key}>
              <Checkbox value={col.key} style={{ lineHeight: '32px' }}>
                {col.title}
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
    </div>
  );

  // --- Construcción Dinámica de Columnas ---
  const tableColumns = useMemo(() => {
    // 1. Columna "Comparar" (Fija a la izquierda)
    const compareCol = {
      title: 'Acción',
      key: 'compare',
      fixed: 'left',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const isSelected = comparisonList.some(t => t.id === record.id);
        return (
          <Tooltip title={isSelected ? "Ya seleccionado" : "Añadir a Comparación"}>
            <Button 
              type="primary" 
              icon={<PlusSquareOutlined />} 
              onClick={() => addTractorToCompare(record)}
              disabled={isSelected}
              ghost={isSelected}
              size="small"
            />
          </Tooltip>
        );
      },
    };

    // 2. Columna "PDF" (Fija a la derecha)
    const pdfCol = {
      title: 'PDF',
      key: 'pdf',
      fixed: 'right',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Descargar Ficha Técnica">
          <Button 
            icon={downloadingId === record.id ? <LoadingOutlined /> : <DownloadOutlined />} 
            onClick={() => handleDownload(record)}
            loading={downloadingId === record.id}
            size="small"
            type="default"
            shape="circle"
          />
        </Tooltip>
      ),
    };

    // 3. Filtrar las columnas de datos según la selección del usuario
    const selectedDataCols = AVAILABLE_COLUMNS.filter(col => visibleColumns.includes(col.key));

    return [compareCol, ...selectedDataCols, pdfCol];
  }, [visibleColumns, comparisonList, downloadingId]);

  return (
    <div style={{ width: '100%' }}>
      {/* Barra de herramientas superior */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Popover 
          content={columnSelector} 
          title="Configurar Tabla" 
          trigger="click" 
          placement="bottomRight"
        >
          <Button icon={<SettingOutlined />}>
            Columnas Visibles ({visibleColumns.length})
          </Button>
        </Popover>
      </div>

      <Table
        columns={tableColumns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        scroll={{ x: 'max-content' }} // Permite scroll horizontal si hay muchas columnas
        size="middle"
      />
    </div>
  );
};

export default TractorTable;