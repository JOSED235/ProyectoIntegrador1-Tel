import { Send, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import client from './services/mqttService';

function App() {
  const [status, setStatus] = useState('Desconectado');
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    // Definimos los listeners una sola vez
    const onConnect = () => {
      console.log('Conectado con éxito');
      setStatus('Conectado');
      client.subscribe('icesi/proyecto/test');
    };

    const onError = (err) => {
      console.error('Error de conexión:', err);
      setStatus('Error');
    };

    const onMessage = (topic, message) => {
      setLastMessage(message.toString());
    };

    client.on('connect', onConnect);
    client.on('error', onError);
    client.on('message', onMessage);

    // Si ya está conectado (por el Singleton), actualizamos el estado
    if (client.connected) setStatus('Conectado');

    // Limpieza: quitamos los listeners pero NO cerramos la conexión del cliente
    // para evitar el error de "client disconnecting" en el doble renderizado
    return () => {
      client.off('connect', onConnect);
      client.off('error', onError);
      client.off('message', onMessage);
    };
  }, []);

  const enviarPrueba = () => {
    if (client.connected) {
      const payload = { 
        msg: "Prueba desde Icesi", 
        timestamp: new Date().toLocaleTimeString() 
      };
      client.publish('icesi/proyecto/test', JSON.stringify(payload));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">
      <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          {status === 'Conectado' ? <Wifi className="text-green-400" /> : <WifiOff className="text-red-400" />}
          Status: {status}
        </h1>

        <button 
          onClick={enviarPrueba}
          disabled={status !== 'Conectado'}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Send size={18} /> Publicar en MQTT
        </button>

        <div className="mt-6">
          <p className="text-xs text-slate-400 mb-2 uppercase">Monitor de mensajes:</p>
          <pre className="bg-black/50 p-4 rounded-lg text-sm text-blue-300 min-h-[100px]">
            {lastMessage || "// Esperando datos del tópico..."}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;