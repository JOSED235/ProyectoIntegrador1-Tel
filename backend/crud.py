from sqlalchemy.orm import Session
from models import CaptureSession, SensorSample, Patient, User
from auth import hash_password
import schemas


# ─── Pacientes ────────────────────────────────────────────────────────────────

def get_patients(db: Session):
    return db.query(Patient).all()


def get_patient(db: Session, patient_id: str):
    return db.query(Patient).filter(Patient.id == patient_id).first()


def create_patient(db: Session, patient: schemas.PatientCreate):
    db_patient = Patient(
        id=patient.id,
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        notes=patient.notes,
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


# ─── Capturas ─────────────────────────────────────────────────────────────────

def save_capture(db: Session, data: schemas.Capture):
    session = db.query(CaptureSession).filter(
        CaptureSession.id == data.session_id
    ).first()

    if not session:
        patient_id = data.patient_id
        patient_name = data.patient_name

        # El firmware solo reenvía el texto recibido como "paciente" (sin patient_id).
        # El frontend envía la cédula del paciente seleccionado en ese campo, así que
        # la resolvemos aquí contra la tabla de pacientes registrados.
        if not patient_id:
            patient = get_patient(db, patient_name)
            if patient:
                patient_id = patient.id
                patient_name = patient.name

        session = CaptureSession(
            id=data.session_id,
            device_id=data.device_id,
            patient_id=patient_id,
            patient_name=patient_name,
            sample_rate_hz=data.sample_rate_hz,
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    db_samples = []
    for s in data.samples:
        sample = SensorSample(
            session_id=data.session_id,
            seq=s.seq,
            ts_us=s.ts_us,
            mpu_ax=s.mpu_ax,
            mpu_ay=s.mpu_ay,
            mpu_az=s.mpu_az,
            mpu_gx=s.mpu_gx,
            mpu_gy=s.mpu_gy,
            mpu_gz=s.mpu_gz,
            lsm_ax=s.lsm_ax,
            lsm_ay=s.lsm_ay,
            lsm_az=s.lsm_az,
            lsm_mx=s.lsm_mx,
            lsm_my=s.lsm_my,
            lsm_mz=s.lsm_mz,
            pressure=s.pressure,
        )
        db_samples.append(sample)

    db.bulk_save_objects(db_samples)
    db.commit()
    return len(db_samples)


def get_capture_data(db: Session, session_id: str):
    return db.query(SensorSample).filter(
        SensorSample.session_id == session_id
    ).order_by(SensorSample.seq.asc()).all()


# ─── Usuarios ─────────────────────────────────────────────────────────────────

def get_user_by_cedula(db: Session, cedula: str):
    return db.query(User).filter(User.cedula == cedula).first()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, cedula: str, name: str, role: str, created_by: str = None):
    user = User(
        cedula=cedula,
        name=name,
        role=role,
        is_registered=False,
        created_by=created_by,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def complete_registration(db: Session, cedula: str, email: str, password_hash: str):
    user = get_user_by_cedula(db, cedula)
    if not user:
        return None
    user.email = email
    user.password_hash = password_hash
    user.is_registered = True
    db.commit()
    db.refresh(user)
    return user


def get_doctors(db: Session):
    return db.query(User).filter(User.role == "doctor").all()


def seed_admin(db: Session):
    admin = get_user_by_cedula(db, "0000000000")
    if not admin:
        admin = User(
            cedula="0000000000",
            name="Administrador",
            email="admin@sistema.com",
            password_hash=hash_password("admin123"),
            role="admin",
            is_registered=True,
        )
        db.add(admin)
        db.commit()
        print("Admin creado: cedula=0000000000 / email=admin@sistema.com / password=admin123")
    elif not admin.password_hash or not admin.password_hash.startswith(("$2a$", "$2b$", "$2y$")):
        # Repara hashes inválidos generados por una versión anterior con bug de passlib/bcrypt
        admin.password_hash = hash_password("admin123")
        admin.email = admin.email or "admin@sistema.com"
        admin.is_registered = True
        db.commit()
        print("Admin reparado: hash regenerado (cedula=0000000000 / email=admin@sistema.com / password=admin123)")
