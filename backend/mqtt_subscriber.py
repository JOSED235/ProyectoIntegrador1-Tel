import json
import paho.mqtt.client as mqtt

from database import SessionLocal
from models import SensorSample, CaptureSession

BROKER = "mosquitto"
PORT = 1883
TOPIC = "sensor/data"


def on_connect(client, userdata, flags, rc):
    print("[MQTT] Conectado")
    client.subscribe(TOPIC)


def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())

        print("[MQTT] Mensaje recibido")

        db = SessionLocal()

        session_id = payload["session_id"]

        # Verificar sesión
        sesion = db.query(CaptureSession).filter(
            CaptureSession.id == session_id
        ).first()

        if not sesion:
            sesion = CaptureSession(
                id=session_id,
                device_id=payload.get("device_id", "esp32"),
                sample_rate_hz=payload.get("sample_rate_hz", 100)
            )

            db.add(sesion)
            db.commit()

        # Guardar muestras
        for s in payload["samples"]:

            sample = SensorSample(
                session_id=session_id,

                seq=s["seq"],
                ts_us=s["ts_us"],

                mpu_ax=s["mpu_ax"],
                mpu_ay=s["mpu_ay"],
                mpu_az=s["mpu_az"],

                mpu_gx=s["mpu_gx"],
                mpu_gy=s["mpu_gy"],
                mpu_gz=s["mpu_gz"],

                lsm_ax=s["lsm_ax"],
                lsm_ay=s["lsm_ay"],
                lsm_az=s["lsm_az"],

                lsm_mx=s["lsm_mx"],
                lsm_my=s["lsm_my"],
                lsm_mz=s["lsm_mz"],

                pressure=s["pressure"]
            )

            db.add(sample)

        db.commit()

        print(f"[MQTT] {len(payload['samples'])} muestras guardadas")

    except Exception as e:
        print("[MQTT] Error:", e)


client = mqtt.Client()

client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, PORT, 60)

client.loop_start()