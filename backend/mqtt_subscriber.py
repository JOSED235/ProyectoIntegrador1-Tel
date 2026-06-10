import json
import os
import paho.mqtt.client as mqtt

from database import SessionLocal
from models import SensorSample, CaptureSession, Patient

BROKER = os.getenv("MQTT_BROKER", "broker.emqx.io")
PORT   = int(os.getenv("MQTT_PORT", "1883"))
TOPIC  = os.getenv("MQTT_TOPIC", "icesi/jose/esp32/data")


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
            patient_id = payload.get("patient_id")
            patient_name = payload.get("patient_name", "Anónimo")

            # El firmware reenvía el texto recibido como "paciente" (la cédula que
            # el frontend envía al iniciar la captura), así que lo resolvemos aquí
            # contra la tabla de pacientes registrados para asociar la sesión.
            if not patient_id:
                paciente = db.query(Patient).filter(Patient.id == patient_name).first()
                if paciente:
                    patient_id = paciente.id
                    patient_name = paciente.name

            sesion = CaptureSession(
                id=session_id,
                device_id=payload.get("device_id", "esp32"),
                patient_id=patient_id,
                patient_name=patient_name,
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

client.connect_async(BROKER, PORT, 60)

client.loop_start()