'use client';

import { useEffect, useRef, useState } from 'react';
import { LuInfo } from 'react-icons/lu';
import './PanelConfiguracion.css';

const PESTANAS = [
  { id: 'horario', label: 'Horario semanal' },
  { id: 'excepciones', label: 'Excepciones' },
];

// Contenedor con las dos pestañas de la configuración (Horario semanal /
// Excepciones). Patrón de tabs de la feature: role="tablist" con flechas
// izquierda/derecha entre pestañas; el contenido activo llega como `children`.
// `aviso` (opcional): texto informativo que se ve al pulsar el ícono de info, al
// extremo derecho de las pestañas.
export default function PanelConfiguracion({
  pestana, onPestana, cantidadExcepciones, aviso = null, children,
}) {
  const [avisoAbierto, setAvisoAbierto] = useState(false);
  const avisoRef = useRef(null);

  // Cierra con click afuera o Escape (devuelve el foco al botón).
  useEffect(() => {
    if (!avisoAbierto) return undefined;
    function alPulsar(e) {
      if (!avisoRef.current?.contains(e.target)) setAvisoAbierto(false);
    }
    function alTeclear(e) {
      if (e.key !== 'Escape') return;
      setAvisoAbierto(false);
      avisoRef.current?.querySelector('button')?.focus();
    }
    document.addEventListener('mousedown', alPulsar);
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('mousedown', alPulsar);
      document.removeEventListener('keydown', alTeclear);
    };
  }, [avisoAbierto]);

  function handleKeyDown(e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const actual = PESTANAS.findIndex((p) => p.id === pestana);
    const paso = e.key === 'ArrowRight' ? 1 : -1;
    const siguiente = PESTANAS[(actual + paso + PESTANAS.length) % PESTANAS.length];
    onPestana(siguiente.id);
    document.getElementById(`ac-tab-${siguiente.id}`)?.focus();
  }

  return (
    <section className="ac-card ac-config" aria-label="Configuración de la agenda">
      <div className="ac-tabs" role="tablist" aria-label="Secciones de la agenda" onKeyDown={handleKeyDown}>
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`ac-tab-${p.id}`}
            className="ac-tab"
            aria-selected={pestana === p.id}
            aria-controls="ac-panel-config"
            tabIndex={pestana === p.id ? 0 : -1}
            onClick={() => onPestana(p.id)}
          >
            {p.label}
            {p.id === 'excepciones' && <span className="ac-tab-count">{cantidadExcepciones}</span>}
          </button>
        ))}
        {aviso && (
          <div className="ac-aviso" ref={avisoRef}>
            <button
              type="button"
              className="ncw-icon-btn ncw-icon-btn-primary"
              aria-label="Información sobre la agenda"
              title="Información"
              aria-expanded={avisoAbierto}
              aria-controls="ac-aviso-card"
              onClick={() => setAvisoAbierto((abierto) => !abierto)}
            >
              <LuInfo className="icon" aria-hidden="true" />
            </button>
            {avisoAbierto && (
              <div className="ac-callout ac-callout-info ac-aviso-card" id="ac-aviso-card" role="status">
                <LuInfo className="icon" aria-hidden="true" />
                <p>{aviso}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <div
        className="ac-config-cuerpo"
        role="tabpanel"
        id="ac-panel-config"
        aria-labelledby={`ac-tab-${pestana}`}
      >
        {children}
      </div>
    </section>
  );
}
