'use client';

import { useState } from 'react';
import { LuLock } from 'react-icons/lu';
import './AccesoClave.css';
import { guardarAcceso, validarClave } from '@/hooks/PantallaFamiliares/acceso';

// Pantalla de clave previa a la "Pantalla de familiares" (DEMO, ver
// hooks/PantallaFamiliares/acceso.js): la clave solo evita que se abra por
// accidente en un televisor.
export default function AccesoClave({ tema = 'oscuro', incrustada = false, onCerrar = null }) {
  const [clave, setClave] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (validarClave(clave)) {
      guardarAcceso();
    } else {
      setError(true);
      setClave('');
    }
  }

  return (
    <main className={`pf-acceso pf-tema-${tema}${incrustada ? ' pf-incrustada' : ''}`}>
      <form className="pf-acceso-card" onSubmit={handleSubmit}>
        <span className="pf-acceso-icon" aria-hidden="true"><LuLock className="icon" /></span>
        <h1 className="pf-acceso-title">Pantalla de familiares</h1>
        <p className="pf-acceso-text">Ingresa la clave para proyectar el estado de las cirugías.</p>
        <label className="pf-acceso-label" htmlFor="pf-clave">Clave</label>
        <input
          id="pf-clave"
          type="password"
          className="pf-acceso-input"
          autoComplete="off"
          autoFocus
          value={clave}
          onChange={(e) => { setClave(e.target.value); setError(false); }}
          aria-invalid={error || undefined}
          aria-describedby={error ? 'pf-clave-error' : undefined}
        />
        {error && <span id="pf-clave-error" className="pf-acceso-error" role="alert">La clave no es correcta.</span>}
        <button type="submit" className="pf-acceso-btn" disabled={clave.trim() === ''}>Entrar</button>
        {onCerrar && <button type="button" className="pf-acceso-cancel" onClick={onCerrar}>Cancelar</button>}
      </form>
    </main>
  );
}
