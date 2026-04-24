from sqlalchemy.orm import Session
from models import CaptureSession, SensorSample


def save_capture(db: Session, data):
    session = db.query(CaptureSession).filter(
        CaptureSession.id == data.session_id
    ).first()

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

    for s in data.samples:
        sample = SensorSample(
            session_id=data.session_id,
            seq=s.seq,
            ts_us=s.ts_us,

            # MPU
            mpu_ax=s.mpu_ax,
            mpu_ay=s.mpu_ay,
            mpu_az=s.mpu_az,
            mpu_gx=s.mpu_gx,
            mpu_gy=s.mpu_gy,
            mpu_gz=s.mpu_gz,

            # LSM
            lsm_ax=s.lsm_ax,
            lsm_ay=s.lsm_ay,
            lsm_az=s.lsm_az,
            lsm_mx=s.lsm_mx,
            lsm_my=s.lsm_my,
            lsm_mz=s.lsm_mz,

            pressure=s.pressure
        )
        db_samples.append(sample)

    db.bulk_save_objects(db_samples)
    db.commit()

    return len(db_samples)