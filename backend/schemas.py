from pydantic import BaseModel
from typing import List, Optional


# ─── Sensor / Captura ────────────────────────────────────────────────────────

class Sample(BaseModel):
    seq: int
    ts_us: int
    mpu_ax: float
    mpu_ay: float
    mpu_az: float
    mpu_gx: float
    mpu_gy: float
    mpu_gz: float
    lsm_ax: float
    lsm_ay: float
    lsm_az: float
    lsm_mx: float
    lsm_my: float
    lsm_mz: float
    pressure: float


class Capture(BaseModel):
    session_id: str
    device_id: str
    patient_id: Optional[str] = None
    patient_name: str = "Anónimo"
    sample_rate_hz: int
    samples: List[Sample]


# ─── Pacientes ────────────────────────────────────────────────────────────────

class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    notes: Optional[str] = None


class PatientCreate(PatientBase):
    id: str  # número de cédula del paciente


class Patient(PatientBase):
    id: str

    class Config:
        from_attributes = True


# ─── Autenticación ────────────────────────────────────────────────────────────

class CheckCedulaRequest(BaseModel):
    cedula: str


class CheckCedulaResponse(BaseModel):
    cedula: str
    name: str
    role: str
    is_registered: bool


class CompleteRegistrationRequest(BaseModel):
    cedula: str
    email: str
    password: str


class LoginRequest(BaseModel):
    identifier: str   # correo o número de cédula
    password: str


class TokenResponse(BaseModel):
    access_token: str
    cedula: str
    name: str
    role: str


# ─── Usuarios / Doctores ──────────────────────────────────────────────────────

class DoctorCreate(BaseModel):
    cedula: str
    name: str


class UserResponse(BaseModel):
    cedula: str
    name: str
    role: str
    email: Optional[str] = None
    is_registered: bool

    class Config:
        from_attributes = True
