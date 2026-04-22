from pydantic import BaseModel
from typing import List


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
    sample_rate_hz: int
    samples: List[Sample]