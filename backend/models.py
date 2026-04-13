from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class CaptureSession(Base):
    __tablename__ = "capture_sessions"

    id = Column(String, primary_key=True, index=True)
    device_id = Column(String, nullable=False)

    samples = relationship("SensorSample", back_populates="session", cascade="all, delete-orphan")


class SensorSample(Base):
    __tablename__ = "sensor_samples"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String, ForeignKey("capture_sessions.id"), nullable=False)

    seq = Column(Integer, nullable=False)
    ts_ms = Column(Integer, nullable=False)

    ax = Column(Float, nullable=False)
    ay = Column(Float, nullable=False)
    az = Column(Float, nullable=False)

    gx = Column(Float, nullable=False)
    gy = Column(Float, nullable=False)
    gz = Column(Float, nullable=False)

    pressure = Column(Float, nullable=False)

    session = relationship("CaptureSession", back_populates="samples")