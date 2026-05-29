import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8001',
});

// PACIENTES
export const getPatients = async () => {
  const response = await api.get('/patients');
  return response.data;
};

export const getPatient = async (id) => {
  const response = await api.get(`/patients/${id}`);
  return response.data;
};

export const createPatient = async (patient) => {
  const response = await api.post('/patients', patient);
  return response.data;
};

// SESIONES
export const getSesiones = async () => {
  const response = await api.get('/sesiones');
  return response.data;
};

export const getCaptura = async (sessionId) => {
  const response = await api.get(`/captura/${sessionId}`);
  return response.data;
};
