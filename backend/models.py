from sqlalchemy import Column, String, Integer, Float, ForeignKey, BigInteger, Boolean, DateTime, func
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    cedula       = Column(String, primary_key=True, index=True)
    name         = Column(String, nullable=False)
    email        = Column(String, unique=True, nullable=True, index=True)
    password_hash = Column(String, nullable=True)
    role         = Column(String, nullable=False)  # 'admin', 'doctor', 'patient'
    is_registered = Column(Boolean, default=False, nullable=False)
    created_by   = Column(String, ForeignKey("users.cedula"), nullable=True)


class Patient(Base):
    __tablename__ = "patients"

    id     = Column(String, primary_key=True, index=True)
    name   = Column(String, nullable=False)
    age    = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    notes  = Column(String, nullable=True)

    sessions = relationship("CaptureSession", back_populates="patient", cascade="all, delete-orphan")


class CaptureSession(Base):
    __tablename__ = "capture_sessions"

    id             = Column(String, primary_key=True, index=True)
    device_id      = Column(String, nullable=False)
    patient_id     = Column(String, ForeignKey("patients.id"), nullable=True)
    patient_name   = Column(String, nullable=True)
    sample_rate_hz = Column(Integer, nullable=False, default=100)
    created_at     = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)

    patient = relationship("Patient", back_populates="sessions")
    samples = relationship(
        "SensorSample",
        back_populates="session",
        cascade="all, delete-orphan",
    )


class SensorSample(Base):
    __tablename__ = "sensor_samples"

    id         = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String, ForeignKey("capture_sessions.id"), nullable=False, index=True)

    seq   = Column(Integer, nullable=False)
    ts_us = Column(BigInteger, nullable=False)

    mpu_ax = Column(Float, nullable=False)
    mpu_ay = Column(Float, nullable=False)
    mpu_az = Column(Float, nullable=False)

    mpu_gx = Column(Float, nullable=False)
    mpu_gy = Column(Float, nullable=False)
    mpu_gz = Column(Float, nullable=False)

    lsm_ax = Column(Float, nullable=False)
    lsm_ay = Column(Float, nullable=False)
    lsm_az = Column(Float, nullable=False)

    lsm_mx = Column(Float, nullable=False)
    lsm_my = Column(Float, nullable=False)
    lsm_mz = Column(Float, nullable=False)

    pressure = Column(Float, nullable=False)

    session = relationship("CaptureSession", back_populates="samples")
