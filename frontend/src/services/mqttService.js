import mqtt from 'mqtt';

const clientId = 'icesi_user_' + Math.random().toString(16).substring(2, 8);

const options = {
  clientId,
  keepalive: 60,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
};

const client = mqtt.connect('ws://broker.emqx.io:8083/mqtt', options);

export default client;