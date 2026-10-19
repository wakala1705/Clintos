'use client';

import { useEffect, useRef, useState } from 'react';
import { LuCircleAlert, LuInfo } from 'react-icons/lu';
import './MensajeInfo.css';

// Ícono que muestra un mensaje en una card flotante al pulsarlo (mismo patrón que el
// aviso de PanelConfiguracion en Agenda de cirujanos). `tone` colorea el ícono y la card
// (pendiente | bloqueada | info). Cierra con click afuera o Escape; el Escape se captura
// para no cerrar también el modal que lo contiene.
export default function MensajeInfo({
  tone = 'info', label, id, children,
}) {
  const [abierto, setAbierto] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    function alPulsar(e) {
      if (!rootRef.current?.contains(e.target)) setAbierto(false);
    }
    function alTeclear(e) {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setAbierto(false);
      rootRef.current?.querySelector('button')?.focus();
    }
    document.addEventListener('mousedown', alPulsar);
    document.addEventListener('keydown', alTeclear, true);
    return () => {
      document.removeEventListener('mousedown', alPulsar);
      document.removeEventListener('keydown', alTeclear, true);
    };
  }, [abierto]);

  const Icono = tone === 'info' ? LuInfo : LuCircleAlert;

  return (
    <div className="sp-info" ref={rootRef}>
      <button
        type="button"
        className={`sp-info-btn sp-info-${tone}`}
        aria-label={label}
        title={label}
        aria-expanded={abierto}
        aria-controls={id}
        onClick={() => setAbierto((v) => !v)}
      >
        <LuInfo className="icon" aria-hidden="true" />
      </button>
      {abierto && (
        <p className={`sp-info-card sp-info-card-${tone}`} id={id} role="status">
          <Icono className="icon" aria-hidden="true" />
          <span>{children}</span>
        </p>
      )}
    </div>
  );
}
