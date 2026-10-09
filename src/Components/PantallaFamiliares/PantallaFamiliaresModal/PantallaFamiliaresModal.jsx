'use client';

import { useEffect, useRef } from 'react';
import './PantallaFamiliaresModal.css';
import PantallaFamiliares from '../PantallaFamiliares';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';

// "Pantalla de familiares" dentro de un modal de 95% x 95% del viewport, en su
// versión clara: es la forma de mostrarla en la demo desde el Panel general
// (en el televisor real se abre la ruta /pantalla-familiares, a pantalla
// completa). Mantiene la clave de acceso. Escape o la X cierran el modal.
// .modal-overlay/.modal-card vienen de la feature que lo monta
// (ProgramacionSalaCirugias/shared/shared.css).
export default function PantallaFamiliaresModal({ onClose }) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay open" role="presentation" onClick={onClose}>
      <div
        ref={cardRef}
        className="modal-card pfm-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Pantalla de familiares"
        onClick={(e) => e.stopPropagation()}
      >
        <PantallaFamiliares tema="claro" incrustada onCerrar={onClose} />
      </div>
    </div>
  );
}
