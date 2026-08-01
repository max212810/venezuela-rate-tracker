import requests
import urllib3
from bs4 import BeautifulSoup

# Deshabilitar advertencias de SSL para el servidor del BCV
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def obtener_tasas_reales():
    bcv_usd = None
    bcv_eur = None
    paralelo_usd = None

    # 1. Scraping directo de la web oficial del Banco Central de Venezuela (BCV)
    try:
        url_bcv = "https://www.bcv.org.ve/"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        res = requests.get(url_bcv, headers=headers, verify=False, timeout=6)
        
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # Obtener DÓLAR oficial del BCV
            dolar_div = soup.find('div', id='dolar')
            if dolar_div and dolar_div.find('strong'):
                bcv_usd = float(dolar_div.find('strong').text.strip().replace(',', '.'))
            
            # Obtener EURO oficial real del BCV (<div id="euro">)
            euro_div = soup.find('div', id='euro')
            if euro_div and euro_div.find('strong'):
                bcv_eur = float(euro_div.find('strong').text.strip().replace(',', '.'))
                
    except Exception as e:
        print(f"[Scraper] Error en scraping directo al BCV: {e}")

    # 2. Consultar API de respaldo (DolarApi) para Euro real y Dólar Paralelo
    try:
        # Obtener Dólar Paralelo
        res_d = requests.get("https://ve.dolarapi.com/v1/dolares", timeout=5)
        if res_d.status_code == 200:
            data_d = res_d.json()
            for item in data_d:
                if item.get('fuente') == 'oficial' and not bcv_usd:
                    bcv_usd = item.get('promedio')
                elif item.get('fuente') == 'paralelo':
                    paralelo_usd = item.get('promedio')

        # Obtener Euro Oficial Real de la API si el BCV no respondió
        if not bcv_eur:
            res_e = requests.get("https://ve.dolarapi.com/v1/euros", timeout=5)
            if res_e.status_code == 200:
                data_e = res_e.json()
                for item in data_e:
                    if item.get('fuente') == 'oficial':
                        bcv_eur = item.get('promedio')
    except Exception as e:
        print(f"[Scraper] Error consultando DolarApi: {e}")

    # Asignar valores finales con redondeo a 2 decimales
    val_usd = round(bcv_usd, 2) if bcv_usd else 36.50
    val_eur = round(bcv_eur, 2) if bcv_eur else 39.80
    val_paralelo = round(paralelo_usd, 2) if paralelo_usd else 40.50

    return {
        "bcv": val_usd,
        "euro": val_eur,
        "paralelo": val_paralelo
    }