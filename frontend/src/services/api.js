import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Tu URL de FastAPI
});

export const getSensorData = async () => {
  const response = await api.get('/datos-sensores');
  return response.data;
};