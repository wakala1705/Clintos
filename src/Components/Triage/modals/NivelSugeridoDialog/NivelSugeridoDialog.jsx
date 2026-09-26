'use client';

import { useEffect, useRef } from 'react';
import { LuTriangleAlert } from 'react-icons/lu';
import './NivelSugeridoDialog.css';
import Button from '@/Components/Button/Button';

// Aviso "Nivel sugerido" que se abre encima de ValoracionTriageModal al
// marcar un criterio de atención inmediata. Diálogo de confirmación centrado
// sin fila de header — fuera de ModalHeader por diseño (ver AGENTS.md
// "Modales", mismo tipo que .nc-discard-modal de NuevaCitaFlow).
// `role="alertdialog"`: interrumpe el flujo y pide una decisión. El foco
// arranca en "Finalizar clasificación"; Escape equivale a "Volver" (lo
// escucha este diálogo, no el modal de abajo — ver ValoracionTriageModal).
export default function NivelSugeridoDialog({ nivelLabel, onFinalizar, onVolver }) {
  const finalizarRef = useRef(null);

  // Foco inicial solo al montar (separado del listener, que se re-suscribe
  // si cambia onVolver).
  useEffect(() => {
    finalizarRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onVolver();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onVolver]);

  return (
    <div className="tg-ns-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onVolver(); }}>
      <div
        className="tg-ns-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="tg-ns-title"
        aria-describedby="tg-ns-nivel"
      >
        <span className="tg-ns-icon" aria-hidden="true">
          <LuTriangleAlert className="icon" />
        </span>
        <p id="tg-ns-title" className="tg-ns-title">Nivel sugerido:</p>
        <p id="tg-ns-nivel" className="tg-ns-nivel">{nivelLabel}</p>

        <div className="tg-ns-actions">
          <Button ref={finalizarRef} variant="primary" className="tg-ns-btn" onClick={onFinalizar}>
            Finalizar clasificación
          </Button>
          <Button variant="secondary" className="tg-ns-btn" onClick={onVolver}>Volver</Button>
        </div>
      </div>
    </div>
  );
}
