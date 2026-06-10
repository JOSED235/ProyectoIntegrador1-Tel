from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import mqtt_subscriber
from database import engine, SessionLocal, Base, run_migrations
import models
import schemas
import crud
from auth import get_current_user, require_admin, require_doctor, verify_password, create_token, hash_password
from typing import List

app = FastAPI()

models.Base.metadata.create_all(bind=engine)
run_migrations()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        crud.seed_admin(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Servidor corriendo"}


# ─── Auth ─────────────────────────────────────────────────────────────────────

@app.post("/auth/check-cedula")
def check_cedula(data: schemas.CheckCedulaRequest):
    db = SessionLocal()
    try:
        user = crud.get_user_by_cedula(db, data.cedula)
        if not user:
            raise HTTPException(status_code=404, detail="Cédula no encontrada en el sistema")
        if user.is_registered:
            raise HTTPException(status_code=400, detail="Este usuario ya tiene cuenta activa. Inicia sesión.")
        return {
            "cedula": user.cedula,
            "name": user.name,
            "role": user.role,
            "is_registered": user.is_registered,
        }
    finally:
        db.close()


@app.post("/auth/complete-registration")
def complete_registration(data: schemas.CompleteRegistrationRequest):
    db = SessionLocal()
    try:
        user = crud.get_user_by_cedula(db, data.cedula)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        if user.is_registered:
            raise HTTPException(status_code=400, detail="Usuario ya está registrado")
        if crud.get_user_by_email(db, data.email):
            raise HTTPException(status_code=400, detail="El correo ya está en uso")
        updated = crud.complete_registration(db, data.cedula, data.email, hash_password(data.password))
        token = create_token(updated.cedula, updated.name, updated.role)
        return {"access_token": token, "cedula": updated.cedula, "name": updated.name, "role": updated.role}
    finally:
        db.close()


@app.post("/auth/login")
def login(data: schemas.LoginRequest):
    db = SessionLocal()
    try:
        user = (
            crud.get_user_by_email(db, data.identifier)
            if "@" in data.identifier
            else crud.get_user_by_cedula(db, data.identifier)
        )
        if not user or not user.is_registered or not user.password_hash:
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")
        if not verify_password(data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")
        token = create_token(user.cedula, user.name, user.role)
        return {"access_token": token, "cedula": user.cedula, "name": user.name, "role": user.role}
    finally:
        db.close()


@app.get("/auth/me")
def get_me(current_user=Depends(get_current_user)):
    return current_user


# ─── Doctores (solo admin) ────────────────────────────────────────────────────

@app.post("/users/doctors", response_model=schemas.UserResponse)
def create_doctor(data: schemas.DoctorCreate, current_user=Depends(require_admin)):
    db = SessionLocal()
    try:
        if crud.get_user_by_cedula(db, data.cedula):
            raise HTTPException(status_code=400, detail="Cédula ya registrada en el sistema")
        user = crud.create_user(db, data.cedula, data.name, "doctor", created_by=current_user["sub"])
        return user
    finally:
        db.close()


@app.get("/users/doctors", response_model=List[schemas.UserResponse])
def list_doctors(current_user=Depends(require_admin)):
    db = SessionLocal()
    try:
        return crud.get_doctors(db)
    finally:
        db.close()


# ─── Pacientes ────────────────────────────────────────────────────────────────

@app.get("/patients", response_model=List[schemas.Patient])
def read_patients(current_user=Depends(require_doctor)):
    db = SessionLocal()
    try:
        return crud.get_patients(db)
    finally:
        db.close()


@app.post("/patients", response_model=schemas.Patient)
def create_patient(patient: schemas.PatientCreate, current_user=Depends(require_doctor)):
    db = SessionLocal()
    try:
        if crud.get_patient(db, patient_id=patient.id):
            raise HTTPException(status_code=400, detail="Cédula ya registrada como paciente")
        if not crud.get_user_by_cedula(db, patient.id):
            crud.create_user(db, patient.id, patient.name, "patient", created_by=current_user["sub"])
        return crud.create_patient(db=db, patient=patient)
    finally:
        db.close()


@app.get("/patients/{patient_id}")
def read_patient(patient_id: str, current_user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        return {
            "id": patient.id,
            "name": patient.name,
            "age": patient.age,
            "gender": patient.gender,
            "notes": patient.notes,
            "sessions": [
                {
                    "id": s.id,
                    "device_id": s.device_id,
                    "sample_rate_hz": s.sample_rate_hz,
                    "created_at": s.created_at.isoformat() if s.created_at else None,
                }
                for s in patient.sessions
            ],
        }
    finally:
        db.close()


# ─── Capturas (ESP32 sin auth) ────────────────────────────────────────────────

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
def listar_sesiones(current_user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        return db.query(models.CaptureSession).all()
    finally:
        db.close()


@app.get("/captura/{session_id}")
def obtener_datos_crudos(session_id: str, current_user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        muestras = crud.get_capture_data(db, session_id)
        if not muestras:
            raise HTTPException(status_code=404, detail="No se encontraron datos")
        return {"session_id": session_id, "count": len(muestras), "samples": muestras}
    finally:
        db.close()
