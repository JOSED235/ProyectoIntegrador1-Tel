from sqlalchemy.orm import Session
from models import CaptureSession, SensorSample
import schemas

def save_capture(db: Session, data: schemas.Capture):
    # 1. Buscar si la sesión ya existe
    session = db.query(CaptureSession).filter(
        CaptureSession.id == data.session_id
    ).first()

    # 2. Si no existe la sesión (por ejemplo, si no corriste el seed), se crea automáticamente
    if not session:
        session = CaptureSession(
            id=data.session_id,
            device_id=data.device_id,
            sample_rate_hz=data.sample_rate_hz
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    db_samples = []

    # 3. Mapeo explícito de los datos de Pydantic al modelo de SQLAlchemy
    for s in data.samples:
        sample = SensorSample(
            session_id=data.session_id,
            seq=s.seq,
            ts_us=s.ts_us,

            # Datos del MPU6050
            mpu_ax=s.mpu_ax,
            mpu_ay=s.mpu_ay,
            mpu_az=s.mpu_az,
            mpu_gx=s.mpu_gx,
            mpu_gy=s.mpu_gy,
            mpu_gz=s.mpu_gz,

            # Datos del LSM303DLHC
            lsm_ax=s.lsm_ax,
            lsm_ay=s.lsm_ay,
            lsm_az=s.lsm_az,
            lsm_mx=s.lsm_mx,
            lsm_my=s.lsm_my,
            lsm_mz=s.lsm_mz,

            # Sensor de presión FSR402
            pressure=s.pressure
        )
        db_samples.append(sample)

    # 4. Guardado masivo para alto rendimiento
    db.bulk_save_objects(db_samples)
    db.commit()

    return len(db_samples)

def get_capture_data(db: Session, session_id: str):
    """
    Retorna todos los datos de una sesión específica ordenados por secuencia.
    Este será usado por el endpoint de consulta del Frontend.
    """
    return db.query(SensorSample).filter(
        SensorSample.session_id == session_id
    ).order_by(SensorSample.seq.asc()).all()