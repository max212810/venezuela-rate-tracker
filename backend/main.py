from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scraper import obtener_tasas_reales
from datetime import datetime

app = FastAPI(title="Venezuela Rate Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/tasas")
def get_tasas():
    tasas = obtener_tasas_reales()
    return {
        "bcv": tasas["bcv"],
        "euro": tasas["euro"],
        "paralelo": tasas["paralelo"],
        "ultima_actualizacion": datetime.now().strftime("%I:%M %p")
    }

@app.get("/api/convertir")
def convertir(monto: float, tipo: str = "bcv", direccion: str = "usd_to_ves"):
    tasa_bcv = obtener_tasa_bcv()
    tasas = {
        "bcv": tasa_bcv,
        "euro": round(tasa_bcv * 1.08, 2),
        "paralelo": round(tasa_bcv * 1.12, 2)
    }
    
    tasa_seleccionada = tasas.get(tipo, tasa_bcv)
    
    if direccion == "usd_to_ves":
        resultado = monto * tasa_seleccionada
    else:
        resultado = monto / tasa_seleccionada if tasa_seleccionada > 0 else 0
        
    return {
        "monto_original": monto,
        "tasa_usada": tasa_seleccionada,
        "resultado": round(resultado, 2),
        "direccion": direccion
    }