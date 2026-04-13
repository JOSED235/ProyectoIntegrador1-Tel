from pydantic import BaseModel
from typing import List


class Sample(BaseModel):
    seq: int
    ts_ms: int
    ax: float
    ay: float
    az: float
    gx: float
    gy: float
    gz: float
    pressure: float


class Capture(BaseModel):
    session_id: str
    device_id: str
    samples: List[Sample]