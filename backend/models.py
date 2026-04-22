from sqlalchemy import Column, String, Integer, Float, ForeignKey, BigInteger
from sqlalchemy.orm import relationship

from database import Base


class CaptureSession(Base):
    __tablename__ = "capture_sessions"

    id            = Column(String,  primary_key=True, index=True)
    device_id     = Column(String,  nullable=False)
    sample_rate_hz = Column(Integer, nullable=False, default=100)

    samples = relationship(
        "SensorSample",
        back_populates="session",
        cascade="all, delete-orphan"
    )


class SensorSample(Base):
    __tablename__ = "sensor_samples"

    id         = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String,  ForeignKey("capture_sessions.id"), nullable=False, index=True)

    seq   = Column(Integer,    nullable=False)
    ts_us = Column(BigInteger, nullable=False)  # Microsegundos — BigInteger evita overflow

    # MPU6050: acelerómetro (g)
    mpu_ax = Column(Float, nullable=False)
    mpu_ay = Column(Float, nullable=False)
    mpu_az = Column(Float, nullable=False)

    # MPU6050: giroscopio (dps)
    mpu_gx = Column(Float, nullable=False)
    mpu_gy = Column(Float, nullable=False)
    mpu_gz = Column(Float, nullable=False)

    # LSM303DLHC: acelerómetro (g)
    lsm_ax = Column(Float, nullable=False)
    lsm_ay = Column(Float, nullable=False)
    lsm_az = Column(Float, nullable=False)

    # LSM303DLHC: magnetómetro (µT) 
    lsm_mx = Column(Float, nullable=False)
    lsm_my = Column(Float, nullable=False)
    lsm_mz = Column(Float, nullable=False)

    # FSR402: presión normalizada (0.0–1.0) 
    pressure = Column(Float, nullable=False)

    session = relationship("CaptureSession", back_populates="samples")