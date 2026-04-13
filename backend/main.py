from fastapi import FastAPI

from database import engine, SessionLocal, Base
import models
from crud import save_capture
from schemas import Capture

app = FastAPI()

Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "ok"}


@app.post("/captura")
def recibir_datos(data: Capture):
    print("Datos recibidos:")
    print(data)

    db = SessionLocal()

    try:
        total = save_capture(db, data)

        return {
            "status": "ok",
            "samples_received": total
        }
    finally:
        db.close()