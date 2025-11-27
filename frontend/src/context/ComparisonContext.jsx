import React, { createContext, useContext, useState } from 'react';
import { message } from 'antd'; // Para mostrar notificaciones

// 1. Crear el Context
const ComparisonContext = createContext();

// 2. Crear el "Proveedor" (Provider)
// Este componente envuelve tu aplicación y le da acceso al "carrito"
export const ComparisonProvider = ({ children }) => {
  const [comparisonList, setComparisonList] = useState([]); // El "carrito"

  // Función para AÑADIR un tractor al carrito
  const addTractorToCompare = (tractor) => {
    // Evita duplicados
    if (comparisonList.find(t => t.id === tractor.id)) {
      message.warning(`'${tractor.model}' ya está en la lista de comparación.`);
      return;
    }
    // Límite de 4 tractores para que las gráficas no se saturen
    if (comparisonList.length >= 4) {
      message.error('Puedes comparar un máximo de 4 tractores a la vez.');
      return;
    }
    
    setComparisonList(prevList => [...prevList, tractor]);
    message.success(`'${tractor.model}' añadido a la comparación.`);
  };

  // Función para QUITAR un tractor
  const removeTractorFromCompare = (tractorId) => {
    setComparisonList(prevList => prevList.filter(t => t.id !== tractorId));
    message.info('Tractor eliminado de la comparación.');
  };

  // El "valor" que todos los hijos podrán ver
  const value = {
    comparisonList,
    addTractorToCompare,
    removeTractorFromCompare,
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};

// 3. Crear el "Hook"
// Así es como los componentes (ej. la tabla) acceden al carrito
export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison debe ser usado dentro de un ComparisonProvider');
  }
  return context;
};