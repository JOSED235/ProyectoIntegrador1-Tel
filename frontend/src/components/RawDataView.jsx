import { useState } from 'react';
import { getSensorData } from '../services/api';

const RawDataView = () => {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    const result = await getSensorData();
    setData(result);
  };

  return (
    <div className="p-4 bg-gray-900 text-green-400 font-mono rounded-lg shadow-inner">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Respuesta del Servidor (JSON)</h2>
        <button 
          onClick={fetchData}
          className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-500"
        >
          Refrescar HTTP
        </button>
      </div>
      <pre className="overflow-auto max-h-96 text-sm">
        {data ? JSON.stringify(data, null, 2) : "// No hay datos cargados. Haz clic en Refrescar."}
      </pre>
    </div>
  );
};

export default RawDataView;