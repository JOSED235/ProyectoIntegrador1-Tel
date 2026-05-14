"""
seed.py — Datos de prueba para el sistema de captura de temblor
Ejecutar desde la carpeta backend/:
    python seed.py

Requiere que la DB ya esté corriendo (docker compose up db)
"""

import os
import math
import random
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/iotdb")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Importamos los modelos ya definidos en el proyecto
from models import Base, CaptureSession, SensorSample

# DATOS DE PRUEBA

SESIONES = [
    {
        "id": "ses_1000001",
        "device_id": "esp32-devkit",
        "sample_rate_hz": 100,
        "duracion_s": 3,        # 3 segundos → 300 muestras
        "descripcion": "Prueba en reposo — sin temblor notable"
    },
    {
        "id": "ses_1000002",
        "device_id": "esp32-devkit",
        "sample_rate_hz": 100,
        "duracion_s": 3,
        "descripcion": "Prueba con temblor simulado moderado"
    },
    {
        "id": "ses_1000003",
        "device_id": "esp32-devkit",
        "sample_rate_hz": 100,
        "duracion_s": 3,
        "descripcion": "Prueba con temblor simulado alto"
    },
]


def generar_muestras(session_id: str, duracion_s: int, sample_rate_hz: int, perfil: str):
    """
    Genera muestras sintéticas realistas para cada perfil de prueba.

    Perfiles:
      - reposo:   aceleración estable ~1g en Z, giroscopio ~ 0, presión media
      - moderado: oscilación leve a ~5Hz (temblor esencial leve)
      - alto:     oscilación fuerte a ~8Hz (temblor más pronunciado)
    """

    muestras = []
    total = duracion_s * sample_rate_hz
    periodo_us = 1_000_000 // sample_rate_hz

    # Parámetros por perfil
    perfiles = {
        "reposo": {
            "amp_mpu_g": 0.02,   # amplitud acelerómetro MPU (g)
            "amp_mpu_dps": 1.0,  # amplitud giroscopio (dps)
            "amp_lsm_g": 0.02,
            "freq_hz": 2.0,
            "pressure_base": 0.45,
            "pressure_noise": 0.03,
        },
        "moderado": {
            "amp_mpu_g": 0.15,
            "amp_mpu_dps": 8.0,
            "amp_lsm_g": 0.12,
            "freq_hz": 5.0,
            "pressure_base": 0.60,
            "pressure_noise": 0.08,
        },
        "alto": {
            "amp_mpu_g": 0.40,
            "amp_mpu_dps": 22.0,
            "amp_lsm_g": 0.35,
            "freq_hz": 8.0,
            "pressure_base": 0.75,
            "pressure_noise": 0.15,
        },
    }

    p = perfiles[perfil]
    freq = p["freq_hz"]

    for i in range(total):
        ts_us = i * periodo_us
        t = ts_us / 1_000_000.0  # tiempo en segundos

        # Señal base senoidal + ruido gaussiano pequeño
        seno = math.sin(2 * math.pi * freq * t)
        coseno = math.cos(2 * math.pi * freq * t)
        ruido = lambda escala: random.gauss(0, escala)

        muestra = SensorSample(
            session_id=session_id,
            seq=i + 1,
            ts_us=ts_us,

            # MPU6050 acelerómetro — eje Z con gravedad ~1g, X e Y con temblor
            mpu_ax=p["amp_mpu_g"] * seno   + ruido(0.005),
            mpu_ay=p["amp_mpu_g"] * coseno + ruido(0.005),
            mpu_az=1.0 + ruido(0.01),       # gravedad en Z siempre ~1g

            # MPU6050 giroscopio
            mpu_gx=p["amp_mpu_dps"] * seno   + ruido(0.1),
            mpu_gy=p["amp_mpu_dps"] * coseno + ruido(0.1),
            mpu_gz=ruido(0.5),

            # LSM303DLHC acelerómetro — similar al MPU con ligera diferencia
            lsm_ax=p["amp_lsm_g"] * seno   + ruido(0.005),
            lsm_ay=p["amp_lsm_g"] * coseno + ruido(0.005),
            lsm_az=1.0 + ruido(0.01),

            # LSM303DLHC magnetómetro — campo magnético local + variación leve
            lsm_mx=23.5 + ruido(0.5),
            lsm_my=-5.2 + ruido(0.5),
            lsm_mz=40.1 + ruido(0.5),

            # FSR402 presión — aumenta levemente con el temblor
            pressure=max(0.0, min(1.0,
                p["pressure_base"] + p["amp_mpu_g"] * abs(seno) + ruido(p["pressure_noise"])
            )),
        )

        muestras.append(muestra)

    return muestras


def run():
    print("Conectando a la base de datos...")
    db = SessionLocal()

    try:
        # Crear tablas si no existen
        Base.metadata.create_all(bind=engine)
        print("Tablas verificadas.")

        perfiles = ["reposo", "moderado", "alto"]

        for idx, sesion_data in enumerate(SESIONES):
            session_id = sesion_data["id"]
            perfil = perfiles[idx]

            # Verificar si ya existe para no duplicar
            existe = db.query(CaptureSession).filter(
                CaptureSession.id == session_id
            ).first()

            if existe:
                print(f"  [SKIP] Sesión {session_id} ya existe.")
                continue

            print(f"\n  Insertando sesión: {session_id} ({sesion_data['descripcion']})")

            # Crear sesión
            sesion = CaptureSession(
                id=session_id,
                device_id=sesion_data["device_id"],
                sample_rate_hz=sesion_data["sample_rate_hz"],
            )
            db.add(sesion)
            db.commit()

            # Generar y guardar muestras
            muestras = generar_muestras(
                session_id=session_id,
                duracion_s=sesion_data["duracion_s"],
                sample_rate_hz=sesion_data["sample_rate_hz"],
                perfil=perfil,
            )

            db.bulk_save_objects(muestras)
            db.commit()

            print(f"  {len(muestras)} muestras insertadas para {session_id}")

        print("\nSeed completado.")
        print("Sesiones disponibles:")
        for s in db.query(CaptureSession).all():
            count = db.query(SensorSample).filter(SensorSample.session_id == s.id).count()
            print(f"  - {s.id} | device: {s.device_id} | {s.sample_rate_hz}Hz | {count} muestras")

    except Exception as e:
        print(f"\nError durante el seed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()