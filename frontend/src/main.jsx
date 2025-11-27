import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import 'antd/dist/reset.css';

// 👇 1. Importa el nuevo Proveedor
import { ComparisonProvider } from './context/ComparisonContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 👇 2. Envuelve tu App con el Proveedor */}
      <ComparisonProvider>
        <App />
      </ComparisonProvider>
    </BrowserRouter>
  </React.StrictMode>
);