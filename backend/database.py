import os
import time
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print("DATABASE_URL:", DATABASE_URL)

if not DATABASE_URL:
    raise ValueError("No se encontró DATABASE_URL en el archivo .env")

for i in range(10):
    try:
        engine = create_engine(DATABASE_URL)
        engine.connect()
        print("Conectado a la base de datos")
        break
    except Exception as e:
        print(f"Intento {i+1} fallido, reintentando...")
        time.sleep(2)
else:
    raise Exception("No se pudo conectar a la base de datos")

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


def run_migrations():
    """
    Base.metadata.create_all() solo crea tablas que no existen: si una tabla ya
    existía de una versión anterior del modelo, las columnas nuevas nunca se
    agregan y quedan errores "UndefinedColumn" en producción. Esta función
    repara ese desfase agregando las columnas que falten.
    """
    inspector = inspect(engine)
    if "capture_sessions" in inspector.get_table_names():
        existing = {col["name"] for col in inspector.get_columns("capture_sessions")}
        with engine.begin() as conn:
            if "patient_id" not in existing:
                conn.execute(text(
                    "ALTER TABLE capture_sessions ADD COLUMN patient_id VARCHAR REFERENCES patients(id)"
                ))
                print("Migración: agregada columna capture_sessions.patient_id")
            if "patient_name" not in existing:
                conn.execute(text("ALTER TABLE capture_sessions ADD COLUMN patient_name VARCHAR"))
                print("Migración: agregada columna capture_sessions.patient_name")
            if "created_at" not in existing:
                conn.execute(text(
                    "ALTER TABLE capture_sessions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW()"
                ))
                print("Migración: agregada columna capture_sessions.created_at")