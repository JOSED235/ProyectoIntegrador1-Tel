from fastapi import FastAPI, HTTPException
from typing import List

from database import engine, SessionLocal, Base
import models
import schemas
from crud import save_capture, get_capture_data

app = FastAPI()

# Crea las tablas en la base de datos si no existen
models.Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Servidor corriendo"}


# Endpoint para recibir datos del ESP32 (HTTP POST)
@app.post("/captura")
def recibir_datos(data: schemas.Capture):
    # Log de depuración para ver qué llega del hardware
    print(f"Recibiendo lote de: {data.device_id} - Sesión: {data.session_id}")

    db = SessionLocal()
    try:
        total = save_capture(db, data)
        return {
            "status": "ok",
            "samples_received": total
        }
    except Exception as e:
        print(f"Error al guardar datos: {e}")
        raise HTTPException(status_code=500, detail="Error interno al procesar captura")
    finally:
        db.close()


# Endpoint para que el Frontend consulte todas las sesiones registradas
@app.get("/sesiones")
def listar_sesiones():
    db = SessionLocal()
    try:
        sesiones = db.query(models.CaptureSession).all()
        return sesiones
    finally:
        db.close()


# Endpoint para que el Frontend obtenga los datos crudos (JSON) de una sesión
@app.get("/captura/{session_id}")
def obtener_datos_crudos(session_id: str):
    db = SessionLocal()
    try:
        muestras = get_capture_data(db, session_id)
        
        if not muestras:
            raise HTTPException(status_code=404, detail="No se encontraron datos para esta sesión")
        
        # Retorna el JSON crudo tal como lo solicitaste
        return {
            "session_id": session_id,
            "count": len(muestras),
            "samples": muestras
        }
    finally:
        db.close()