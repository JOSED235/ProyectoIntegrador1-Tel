import mqtt from "mqtt";

const clientId =
  "icesi_user_" + Math.random().toString(16).substring(2, 8);

const options = {
  clientId,

  keepalive: 60,

  clean: true,

  reconnectPeriod: 1000,

  connectTimeout: 30 * 1000,

};

const client = mqtt.connect(
  "ws://broker.emqx.io:8083/mqtt",
  options
);
client.on("connect", () => {

  console.log("[MQTT] Frontend conectado");
});

client.on("reconnect", () => {

  console.log("[MQTT] Reintentando conexión...");
});

client.on("offline", () => {

  console.log("[MQTT] Cliente offline");
});

client.on("error", (err) => {

  console.error("[MQTT] Error:", err.message);
});

export default client;