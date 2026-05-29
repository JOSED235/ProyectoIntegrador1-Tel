from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import mqtt_subscriber
from database import engine, SessionLocal, Base
import models
import schemas
import crud
from typing import List

app = FastAPI()

# Crea las tablas en la base de datos si no existen
models.Base.metadata.create_all(bind=engine)

# CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Servidor corriendo"}


# PACIENTES
@app.get("/patients", response_model=List[schemas.Patient])
def read_patients():
    db = SessionLocal()
    try:
        return crud.get_patients(db)
    finally:
        db.close()

@app.post("/patients", response_model=schemas.Patient)
def create_patient(patient: schemas.PatientCreate):
    db = SessionLocal()
    try:
        db_patient = crud.get_patient(db, patient_id=patient.id)
        if db_patient:
            raise HTTPException(status_code=400, detail="ID ya registrado")
        return crud.create_patient(db=db, patient=patient)
    finally:
        db.close()

@app.get("/patients/{patient_id}")
def read_patient(patient_id: str):
    db = SessionLocal()
    try:
        patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        
        # Devolver paciente con sus sesiones
        return {
            "id": patient.id,
            "name": patient.name,
            "age": patient.age,
            "gender": patient.gender,
            "notes": patient.notes,
            "sessions": patient.sessions
        }
    finally:
        db.close()

# CAPTURAS
@app.post("/captura")
def recibir_datos(data: schemas.Capture):
    print(f"Recibiendo lote de: {data.device_id} - Sesión: {data.session_id}")
    db = SessionLocal()
    try:
        total = crud.save_capture(db, data)
        return {"status": "ok", "samples_received": total}
    except Exception as e:
        print(f"Error al guardar datos: {e}")
        raise HTTPException(status_code=500, detail="Error interno al procesar captura")
    finally:
        db.close()

@app.get("/sesiones")
def listar_sesiones():
    db = SessionLocal()
    try:
        sesiones = db.query(models.CaptureSession).all()
        return sesiones
    finally:
        db.close()

@app.get("/captura/{session_id}")
def obtener_datos_crudos(session_id: str):
    db = SessionLocal()
    try:
        muestras = crud.get_capture_data(db, session_id)
        if not muestras:
            raise HTTPException(status_code=404, detail="No se encontraron datos")
        return {"session_id": session_id, "count": len(muestras), "samples": muestras}
    finally:
        db.close()
