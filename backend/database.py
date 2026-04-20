import os
import time
from dotenv import load_dotenv
from sqlalchemy import create_engine
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