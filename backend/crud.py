from sqlalchemy.orm import Session
from models import CaptureSession, SensorSample


def save_capture(db: Session, data):
    session = db.query(CaptureSession).filter(CaptureSession.id == data.session_id).first()

    if not session:
        session = CaptureSession(
            id=data.session_id,
            device_id=data.device_id
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    db_samples = []
    for s in data.samples:
        sample = SensorSample(
            session_id=data.session_id,
            seq=s.seq,
            ts_ms=s.ts_ms,
            ax=s.ax,
            ay=s.ay,
            az=s.az,
            gx=s.gx,
            gy=s.gy,
            gz=s.gz,
            pressure=s.pressure
        )
        db_samples.append(sample)

    db.add_all(db_samples)
    db.commit()

    return len(db_samples)