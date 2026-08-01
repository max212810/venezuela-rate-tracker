import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [tasas, setTasas] = useState({ bcv: 0, euro: 0, paralelo: 0, ultima_actualizacion: '' });
  const [loading, setLoading] = useState(true);
  
  const [monto, setMonto] = useState(10);
  const [tipoTasa, setTipoTasa] = useState('bcv');
  const [direccion, setDireccion] = useState('usd_to_ves');
  const [resultado, setResultado] = useState(0);

  const fetchTasas = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/tasas');
      if (res.ok) {
        const data = await res.json();
        setTasas(data);
      }
    } catch (err) {
      console.error("No se pudo conectar con la API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasas();
  }, []);

  useEffect(() => {
    const tasaSeleccionada = tasas[tipoTasa] || tasas.bcv || 1;
    if (direccion === 'usd_to_ves') {
      setResultado((monto * tasaSeleccionada).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } else {
      setResultado((monto / tasaSeleccionada).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }
  }, [monto, tipoTasa, direccion, tasas]);

  return (
    <div className="app-viewport">
      <header className="header">
        <div className="header-tag">
          <span className="status-indicator"></span>
          {loading ? "Actualizando..." : `Actualizado: ${tasas.ultima_actualizacion || "Hoy"}`}
        </div>
        <h1 className="header-title">Tasas de Cambio en Venezuela</h1>
        <p className="header-sub">Cotizaciones oficiales del BCV y promedio comercial con calculadora instantánea.</p>
      </header>

      <main>
        {/* TARJETAS DE TASAS */}
        <div className="rates-section">
          <div className="rate-card">
            <div className="rate-header">
              <span className="rate-title">Dólar BCV</span>
              <span className="rate-badge">Oficial</span>
            </div>
            <div className="rate-amount">{loading ? "..." : `${tasas.bcv} Bs.`}</div>
            <div className="rate-footer">Banco Central de Venezuela</div>
          </div>

          <div className="rate-card">
            <div className="rate-header">
              <span className="rate-title">Euro BCV</span>
              <span className="rate-badge">Oficial</span>
            </div>
            <div className="rate-amount">{loading ? "..." : `${tasas.euro} Bs.`}</div>
            <div className="rate-footer">Estimación Banco Central</div>
          </div>

          <div className="rate-card">
            <div className="rate-header">
              <span className="rate-title">Dólar Promedio</span>
              <span className="rate-badge">Comercial</span>
            </div>
            <div className="rate-amount">{loading ? "..." : `${tasas.paralelo} Bs.`}</div>
            <div className="rate-footer">Mercado Paralelo</div>
          </div>
        </div>

        {/* CALCULADORA */}
        <div className="calc-card">
          <h2 className="calc-header">Calculadora de Conversión</h2>

          <div className="form-grid">
            <div className="field-group">
              <label className="field-label">Monto</label>
              <input 
                type="number" 
                value={monto} 
                onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
                className="field-input"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Tasa de referencia</label>
              <select 
                value={tipoTasa} 
                onChange={(e) => setTipoTasa(e.target.value)}
                className="field-input"
              >
                <option value="bcv">BCV Oficial ({tasas.bcv} Bs.)</option>
                <option value="euro">Euro Oficial ({tasas.euro} Bs.)</option>
                <option value="paralelo">Paralelo ({tasas.paralelo} Bs.)</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Conversión</label>
              <select 
                value={direccion} 
                onChange={(e) => setDireccion(e.target.value)}
                className="field-input"
              >
                <option value="usd_to_ves">USD / EUR ➔ Bolívares (Bs.)</option>
                <option value="ves_to_usd">Bolívares (Bs.) ➔ USD / EUR</option>
              </select>
            </div>
          </div>

          <div className="result-display">
            <span className="result-label">Monto calculado</span>
            <span className="result-value">
              {resultado} {direccion === 'usd_to_ves' ? 'Bs.' : '$ / €'}
            </span>
          </div>

          <button className="action-btn" onClick={fetchTasas}>
            Actualizar valores
          </button>
        </div>
      </main>

      <footer className="footer">
        Diseño y desarrollo por Marxel Rodríguez
      </footer>
    </div>
  );
}