import axios from 'axios';

// El backend corre en el puerto 8001 
const api = axios.create({
  baseURL: 'http://localhost:8001',
});

// GET /sesiones — lista todas las sesiones registradas
export const getSesiones = async () => {
  const response = await api.get('/sesiones');
  return response.data;
};

// GET /captura/{session_id} — datos crudos JSON de una sesión específica
export const getCaptura = async (sessionId) => {
  const response = await api.get(`/captura/${sessionId}`);
  return response.data;
};