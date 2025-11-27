import React, { useState } from 'react';
import { Layout, Typography, ConfigProvider, theme, Menu, Badge, Modal } from 'antd';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useComparison } from './context/ComparisonContext';

// 1. Importaciones de Servicios
import { extractVariable, searchGoogle, sendChatMessage } from './services/api'; 

// 2. Importaciones de Componentes
import SelectionModule from './components/modules/SelectionModule';
import CalculationModule from './components/modules/CalculationModule';
import ComparisonModule from './components/modules/ComparisonModule'; 
import ChatInterface from './components/ChatInterface'; 

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

// --- 1. LISTA DE VARIABLES A MINAR ---
const VARIABLES_TO_MINE = [
  "rated_power_net", "max_power_gross", "displacement", "torque", 
  "numero_de_cilindros", "rated_rpm", "pump_flow", "rear_lift_capacity", 
  "shipping_weight", "fuel_tank_capacity", "wheelbase", "height_rops",
  "drive_type", "transmission_type"
];

// --- 2. LISTA MAESTRA DE TRACTORES (Extraída de tu Imagen) ---
// Si dejas la 'url' vacía (""), el sistema la buscará automáticamente en Google.
const KNOWN_TRACTOR_LIST = [
  { company: "John Deere", model: "9570RT", url: "https://www.tractordata.com/farm-tractors/007/8/9/7890-john-deere-9570rt.html" },
  { company: "John Deere", model: "9570R", url: "https://www.tractordata.com/farm-tractors/007/8/8/7886-john-deere-9570r.html" },
  { company: "John Deere", model: "9520RT", url: "https://www.tractordata.com/farm-tractors/007/8/8/7889-john-deere-9520rt.html" },
  { company: "John Deere", model: "9520R", url: "" },
  { company: "John Deere", model: "9470RT", url: "" },
  { company: "John Deere", model: "9470R", url: "" },
  { company: "John Deere", model: "9420R", url: "" },
  { company: "John Deere", model: "9370RT", url: "" },
  { company: "John Deere", model: "8370RT", url: "" },
  { company: "John Deere", model: "8370R", url: "" },
  { company: "John Deere", model: "8345RT", url: "" },
  { company: "John Deere", model: "8345R", url: "" },
  { company: "John Deere", model: "8335R", url: "" },
  { company: "John Deere", model: "8320R", url: "" },
  { company: "John Deere", model: "8295R", url: "" },
  { company: "John Deere", model: "8270R", url: "" },
  { company: "John Deere", model: "7230R", url: "" },
  { company: "John Deere", model: "7210R", url: "" },
  { company: "John Deere", model: "6140M", url: "" },
  { company: "John Deere", model: "6125E", url: "" },
  { company: "John Deere", model: "6110E", url: "" },
  { company: "John Deere", model: "6130E", url: "" },
  { company: "John Deere", model: "6115E", url: "" },
  { company: "John Deere", model: "6100E", url: "" },
  { company: "John Deere", model: "5090EH", url: "" },
  { company: "John Deere", model: "8245R", url: "" },
  { company: "John Deere", model: "6403", url: "" },
  { company: "John Deere", model: "5075E PowrReverse", url: "" },
  { company: "John Deere", model: "5090E", url: "" },
  { company: "John Deere", model: "5055E PowrReverse", url: "" },
  { company: "John Deere", model: "6125M", url: "" },
  { company: "John Deere", model: "6603", url: "" },
  { company: "John Deere", model: "6210J", url: "" },
  { company: "John Deere", model: "6170J", url: "" },
  { company: "John Deere", model: "6155J", url: "" },
  { company: "John Deere", model: "6105J", url: "" },
  { company: "John Deere", model: "6115J", url: "" },
  { company: "John Deere", model: "6190J", url: "" },
  { company: "John Deere", model: "6150J", url: "" },
  { company: "John Deere", model: "6140J", url: "" },
  { company: "John Deere", model: "6135J", url: "" },
];

function App() {
  const location = useLocation();
  const { comparisonList } = useComparison();

  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isCalculationOpen, setIsCalculationOpen] = useState(false);

  // --- LÓGICA DEL ORQUESTADOR ---
  const handleOrchestratorMessage = async (message, logCallback) => {
      const cmd = message.trim();
      const lowerCmd = cmd.toLowerCase();

      // --- Comandos UI ---
      if (lowerCmd.startsWith('/buscar')) { setIsSelectionOpen(true); return "✅ Abriendo Catálogo..."; }
      if (lowerCmd.startsWith('/comparar')) { 
          if (comparisonList.length < 2) return "⚠️ Selecciona 2 tractores primero.";
          setIsComparisonOpen(true); return "✅ Abriendo Comparación..."; 
      }
      if (lowerCmd.startsWith('/calcular')) { setIsCalculationOpen(true); return "✅ Abriendo Cálculo..."; }

      // --- 🏭 COMANDO MASIVO: /investigar todos ---
      if (lowerCmd === '/investigar todos' || lowerCmd === '/automatizar todos') {
          logCallback(`🏭 **Iniciando Modo Fábrica**`);
          logCallback(`📋 Se procesarán ${KNOWN_TRACTOR_LIST.length} tractores de la lista.`);
          
          let totalSuccess = 0;

          for (const tractor of KNOWN_TRACTOR_LIST) {
              logCallback(`🚜 **Procesando: ${tractor.company} ${tractor.model}**...`);
              
              let targetUrl = tractor.url;

              // LÓGICA MEJORADA: Si no hay URL, ¡búscala!
              if (!targetUrl) {
                  logCallback(`   🔍 URL no definida. Buscando en Google...`);
                  const masterQuery = `${tractor.company} ${tractor.model} technical specs tractordata`;
                  const foundUrl = await searchGoogle(masterQuery);
                  
                  if (foundUrl) {
                      targetUrl = foundUrl;
                      logCallback(`   🎯 Encontrada: ${targetUrl}`);
                  } else {
                      logCallback(`   ⚠️ No se encontró URL. Saltando tractor.`);
                      continue;
                  }
                  // Pausa de seguridad tras búsqueda
                  await new Promise(r => setTimeout(r, 2000));
              } else {
                  logCallback(`   🔗 Usando URL predefinida.`);
              }
              
              // Bucle interno de variables
              for (const variable of VARIABLES_TO_MINE) {
                  try {
                      await new Promise(r => setTimeout(r, 1000)); 
                      
                      const result = await extractVariable({
                          tractor_model: `${tractor.company} ${tractor.model}`, 
                          company: tractor.company,
                          variable_name: variable,
                          source_url: targetUrl 
                      });

                      if (result.status === 'success' && result.value && result.value !== 'N/A') {
                          logCallback(`   ✅ ${variable}: ${result.value}`);
                          totalSuccess++;
                      }
                  } catch (e) {
                      console.error(e);
                  }
              }
              logCallback(`   🏁 ${tractor.model} finalizado.`);
              logCallback(`-----------------------------------`);
          }
          return `🏆 **Proceso Masivo Completado**\nDatos extraídos: ${totalSuccess}.\nRevisa el Catálogo (/buscar).`;
      }

      // --- COMANDO INDIVIDUAL: /investigar [Marca] [Modelo] ---
      if (lowerCmd.startsWith('/investigar') || lowerCmd.startsWith('/automatizar')) {
          const parts = cmd.split(' ');
          if (parts.length < 3) return "⚠️ Uso: /investigar [Marca] [Modelo]";
          
          const company = parts[1];
          const model = parts.slice(2).join(' '); 
          
          logCallback(`🚀 **Iniciando Investigación** para: ${company} ${model}`);
          
          logCallback(`🔍 Buscando ficha técnica...`);
          const masterQuery = `${company} ${model} technical specs tractordata`;
          const masterUrl = await searchGoogle(masterQuery);

          if (!masterUrl) return "❌ No se encontró una ficha técnica fiable.";

          logCallback(`🎯 Fuente: ${masterUrl}`);

          let successCount = 0;
          for (const variable of VARIABLES_TO_MINE) {
              try {
                  await new Promise(r => setTimeout(r, 2000)); 
                  const result = await extractVariable({
                      tractor_model: `${company} ${model}`, 
                      company: company,
                      variable_name: variable,
                      source_url: masterUrl
                  });

                  if (result.status === 'success' && result.value && result.value !== 'N/A') {
                      logCallback(`✅ **${variable}**: ${result.value}`);
                      successCount++;
                  }
              } catch (error) {
                  logCallback(`❌ Error en ${variable}: ${error.message}`);
              }
          }
          return `🏁 Finalizado. Datos: ${successCount}/${VARIABLES_TO_MINE.length}.`;
      }

      // --- CHAT CONVERSACIONAL ---
      if (!cmd.startsWith('/')) {
          try {
              const response = await sendChatMessage(message);
              return response;
          } catch (error) {
              return "❌ Error al conectar con la IA.";
          }
      }

      return "🤖 Comando no reconocido.";
  };

  const menuItems = [
    { key: '/chat', label: <Link to="/chat">🤖 Chat Orquestador</Link> },
    { key: '/', label: <Link to="/">Catálogo</Link> },
    { key: '/compare', label: (<Link to="/compare"><Badge count={comparisonList.length} size="small" offset={[10, 0]}>Comparación</Badge></Link>) },
    { key: '/calculate', label: <Link to="/calculate">Cálculo</Link> },
  ];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#00b96b', borderRadius: 6 }, algorithm: theme.darkAlgorithm }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={3} style={{ color: 'white', margin: 0, marginRight: '50px' }}>🚜 Tesis Platform</Title>
          <Menu theme="dark" mode="horizontal" selectedKeys={[location.pathname]} items={menuItems} style={{ flex: 1, minWidth: 0 }} />
        </Header>
        <Content style={{ padding: '0 24px', height: 'calc(100vh - 134px)' }}>
          <Routes>
            <Route path="/" element={<SelectionModule />} />
            <Route path="/compare" element={<ComparisonModule />} />
            <Route path="/calculate" element={<CalculationModule />} />
            <Route path="/chat" element={<ChatInterface onSendMessage={handleOrchestratorMessage} />} />
          </Routes>
        </Content>
        <Modal title="📊 Catálogo" open={isSelectionOpen} onCancel={() => setIsSelectionOpen(false)} width={1200} footer={null} style={{ top: 20 }} destroyOnClose><SelectionModule /></Modal>
        <Modal title="📈 Comparación" open={isComparisonOpen} onCancel={() => setIsComparisonOpen(false)} width={1000} footer={null} style={{ top: 20 }} destroyOnClose><ComparisonModule /></Modal>
        <Modal title="🧮 Calculadora" open={isCalculationOpen} onCancel={() => setIsCalculationOpen(false)} width={1000} footer={null} style={{ top: 20 }} destroyOnClose><CalculationModule /></Modal>
        <Footer style={{ textAlign: 'center', padding: '12px 50px' }}>Proyecto de Tesis ©2025</Footer>
      </Layout>
    </ConfigProvider>
  );
}

export default App;